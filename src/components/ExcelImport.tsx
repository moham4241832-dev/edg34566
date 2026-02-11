import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Id } from "../../convex/_generated/dataModel";

export function ExcelImport() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const importCustomers = useMutation(api.customers.importCustomers);
  const salespeople = useQuery(
    currentUser?.role === "admin" ? api.users.listSalespeople : ("skip" as any)
  );

  const [importing, setImporting] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState<string>("");

  const isAdmin = currentUser?.role === "admin";

  // تحميل ملف Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        
        // قراءة الملف مع خيارات محسّنة
        const workbook = XLSX.read(data, { 
          type: "array",
          cellDates: true,
          cellNF: false,
          cellText: false
        });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // قراءة البيانات مع تجاهل الصفوف الفارغة
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          blankrows: false,
          raw: false
        });

        // تصفية الصفوف الفارغة تماماً
        const filteredData = jsonData.filter((row: any) => {
          const hasData = Object.values(row).some(val => 
            val !== null && val !== undefined && String(val).trim() !== ""
          );
          return hasData;
        });

        console.log("📊 عدد الصفوف المقروءة:", filteredData.length);
        console.log("📋 أول 3 صفوف:", filteredData.slice(0, 3));

        if (filteredData.length === 0) {
          toast.error("الملف فارغ أو لا يحتوي على بيانات صحيحة!");
          return;
        }

        setPreviewData(filteredData);
        toast.success(`تم تحميل ${filteredData.length} عميل من الملف! 📊`);
      } catch (error) {
        console.error("❌ خطأ في قراءة الملف:", error);
        toast.error("خطأ في قراءة الملف. تأكد من صيغة الملف!");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // استيراد البيانات
  const handleImport = async () => {
    if (previewData.length === 0) {
      toast.error("لا توجد بيانات للاستيراد!");
      return;
    }

    if (isAdmin && !selectedSalesPerson) {
      toast.error("يجب اختيار موظف المبيعات!");
      return;
    }

    setImporting(true);

    try {
      const customers = previewData.map((row: any, index: number) => {
        const name = String(row["اسم العميل"] || row["name"] || "").trim();
        const phone = String(row["رقم الهاتف"] || row["phone"] || "").trim();
        const region = String(row["المنطقة"] || row["region"] || "").trim();
        const goldDebt21 = parseFloat(row["مديونية ذهب"] || row["goldDebt21"] || "0");
        const cashDebt = parseFloat(row["مديونية نقدية"] || row["cashDebt"] || "0");
        
        console.log(`📝 صف ${index + 1}:`, { name, phone, region, goldDebt21, cashDebt });
        
        const customer: any = {
          name,
          phone,
          region,
          goldDebt21: isNaN(goldDebt21) ? 0 : goldDebt21,
          cashDebt: isNaN(cashDebt) ? 0 : cashDebt,
        };
        
        // فقط الأدمن يحدد موظف المبيعات
        if (isAdmin && selectedSalesPerson) {
          customer.salesPersonId = selectedSalesPerson as Id<"users">;
        }
        
        return customer;
      });

      console.log("📤 جاري استيراد", customers.length, "عميل...");

      const result = await importCustomers({ customers });

      if (result.success > 0) {
        toast.success(`تم استيراد ${result.success} عميل بنجاح! ✅`);
      }

      if (result.failed > 0) {
        toast.error(`فشل استيراد ${result.failed} عميل - شوف التفاصيل في Console`);
        console.log("❌ الأخطاء:", result.errors);
        
        // عرض أول 5 أخطاء للمستخدم
        const firstErrors = result.errors.slice(0, 5);
        firstErrors.forEach(err => {
          toast.error(err, { duration: 5000 });
        });
      }

      setPreviewData([]);
      setSelectedSalesPerson("");
      
      // إعادة تعيين input الملف
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
      console.error("❌ خطأ في الاستيراد:", error);
    } finally {
      setImporting(false);
    }
  };

  // تحميل نموذج Excel
  const downloadTemplate = () => {
    const template = [
      {
        "اسم العميل": "أحمد محمد",
        "رقم الهاتف": "01234567890",
        "المنطقة": "المعادي",
        "مديونية ذهب": 50.5,
        "مديونية نقدية": 10000,
      },
      {
        "اسم العميل": "محمد علي",
        "رقم الهاتف": "01098765432",
        "المنطقة": "مدينة نصر",
        "مديونية ذهب": 30.25,
        "مديونية نقدية": 5000,
      },
      {
        "اسم العميل": "فاطمة حسن",
        "رقم الهاتف": "01155443322",
        "المنطقة": "الزمالك",
        "مديونية ذهب": 0,
        "مديونية نقدية": 15000,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");

    // تعيين عرض الأعمدة
    ws["!cols"] = [
      { wch: 20 }, // اسم العميل
      { wch: 15 }, // رقم الهاتف
      { wch: 15 }, // المنطقة
      { wch: 15 }, // مديونية ذهب
      { wch: 15 }, // مديونية نقدية
    ];

    XLSX.writeFile(wb, "نموذج_استيراد_العملاء.xlsx");
    toast.success("تم تحميل النموذج! 📥");
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="bg-gradient-to-l from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">📊 استيراد العملاء من Excel</h2>
        <p className="text-blue-100">
          قم بتحميل ملف Excel يحتوي على بيانات العملاء لاستيرادهم دفعة واحدة
        </p>
      </div>

      {/* تعليمات الاستخدام */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          تعليمات الاستخدام
        </h3>
        <ol className="space-y-3 text-gray-700">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              1
            </span>
            <div>
              <strong>حمّل النموذج:</strong> اضغط على زر "تحميل نموذج Excel" للحصول
              على ملف جاهز
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              2
            </span>
            <div>
              <strong>املأ البيانات:</strong> افتح الملف وأدخل بيانات عملائك في
              الأعمدة المحددة
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              3
            </span>
            <div>
              <strong>احفظ الملف:</strong> احفظ الملف بصيغة Excel (.xlsx)
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              4
            </span>
            <div>
              <strong>ارفع الملف:</strong> اضغط على "اختر ملف Excel" وحدد الملف
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              5
            </span>
            <div>
              <strong>استورد:</strong> راجع البيانات واضغط "استيراد العملاء"
            </div>
          </li>
        </ol>
      </div>

      {/* تنسيق الأعمدة المطلوبة */}
      <div className="bg-amber-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200">
        <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          تنسيق الأعمدة المطلوبة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2">اسم العميل</h4>
            <p className="text-sm text-gray-600">
              نص - مثال: "أحمد محمد"
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2">رقم الهاتف</h4>
            <p className="text-sm text-gray-600">
              نص - مثال: "01234567890"
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2">المنطقة</h4>
            <p className="text-sm text-gray-600">
              نص - مثال: "المعادي"
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2">مديونية ذهب</h4>
            <p className="text-sm text-gray-600">
              رقم - مثال: 50.5 (جرام)
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2">مديونية نقدية</h4>
            <p className="text-sm text-gray-600">رقم - مثال: 10000 (جنيه)</p>
          </div>
        </div>
      </div>

      {/* أزرار التحميل والرفع */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* تحميل النموذج */}
        <button
          onClick={downloadTemplate}
          className="bg-gradient-to-l from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transform hover:scale-105 transition-all"
        >
          <div className="text-6xl mb-4">📥</div>
          <h3 className="text-2xl font-bold mb-2">تحميل نموذج Excel</h3>
          <p className="text-green-100">احصل على ملف جاهز مع أمثلة</p>
        </button>

        {/* رفع الملف */}
        <label className="bg-gradient-to-l from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="text-6xl mb-4">📤</div>
          <h3 className="text-2xl font-bold mb-2">اختر ملف Excel</h3>
          <p className="text-blue-100">ارفع ملف العملاء للاستيراد</p>
        </label>
      </div>

      {/* اختيار موظف المبيعات (للأدمن فقط) */}
      {isAdmin && salespeople && previewData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            👤 اختر موظف المبيعات المسؤول
          </h3>
          <select
            value={selectedSalesPerson}
            onChange={(e) => setSelectedSalesPerson(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          >
            <option value="">اختر موظف المبيعات</option>
            {salespeople?.map((sp: any) => (
              <option key={sp._id} value={sp._id}>
                {sp.fullName} ({sp.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* معاينة البيانات */}
      {previewData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-green-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              👀 معاينة البيانات ({previewData.length} عميل)
            </h3>
            <button
              onClick={handleImport}
              disabled={importing || (isAdmin && !selectedSalesPerson)}
              className="px-6 py-3 bg-gradient-to-l from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? "جاري الاستيراد..." : "✅ استيراد العملاء"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-l from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    اسم العميل
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    رقم الهاتف
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    المنطقة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    مديونية ذهب
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-700">
                    مديونية نقدية
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {previewData.slice(0, 10).map((row: any, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row["اسم العميل"] || row["name"] || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {row["رقم الهاتف"] || row["phone"] || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-blue-600 font-semibold">
                      {row["المنطقة"] || row["region"] || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-amber-600 font-semibold">
                      {row["مديونية ذهب"] || row["goldDebt21"] || 0} جرام
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                      {row["مديونية نقدية"] || row["cashDebt"] || 0} جنيه
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <p className="text-center text-gray-500 mt-4 text-sm">
                ... و {previewData.length - 10} عميل آخر
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
