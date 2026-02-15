import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Id } from "../../convex/_generated/dataModel";

export function ExcelImport() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const importCustomers = useMutation(api.customers.importCustomers);
  const updateCustomers = useMutation(api.customers.updateCustomersFromExcel);
  const salespeople = useQuery(
    currentUser?.role === "admin" ? api.users.listSalespeople : ("skip" as any)
  );

  const [importing, setImporting] = useState(false);
  const [updating, setUpdating] = useState(false);
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
        
        const workbook = XLSX.read(data, { 
          type: "array",
          cellDates: true,
          cellNF: false,
          cellText: false
        });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
          blankrows: false,
          raw: false
        });

        const filteredData = jsonData.filter((row: any) => {
          const hasData = Object.values(row).some(val => 
            val !== null && val !== undefined && String(val).trim() !== ""
          );
          return hasData;
        });

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

  // تحديث البيانات من Excel
  const handleUpdate = async () => {
    if (previewData.length === 0) {
      toast.error("لا توجد بيانات للتحديث!");
      return;
    }

    if (isAdmin && !selectedSalesPerson) {
      toast.error("يجب اختيار موظف المبيعات للعملاء الجدد!");
      return;
    }

    setUpdating(true);

    try {
      const customers = previewData.map((row: any) => {
        const name = String(row["اسم العميل"] || row["name"] || "").trim();
        const phone = String(row["رقم الهاتف"] || row["phone"] || "").trim();
        const region = String(row["المنطقة"] || row["region"] || "").trim();
        const goldDebt21 = parseFloat(row["مديونية ذهب"] || row["goldDebt21"] || "0");
        const cashDebt = parseFloat(row["مديونية نقدية"] || row["cashDebt"] || "0");
        
        const customer: any = {
          name,
          phone,
          region,
          goldDebt21: isNaN(goldDebt21) ? 0 : goldDebt21,
          cashDebt: isNaN(cashDebt) ? 0 : cashDebt,
        };
        
        if (isAdmin && selectedSalesPerson) {
          customer.salesPersonId = selectedSalesPerson as Id<"users">;
        }
        
        return customer;
      });

      const result = await updateCustomers({ customers });

      if (result.updated > 0) {
        toast.success(`تم تحديث ${result.updated} عميل بنجاح! 🔄`);
      }

      if (result.created > 0) {
        toast.success(`تم إضافة ${result.created} عميل جديد! ✅`);
      }

      if (result.failed > 0) {
        toast.error(`فشل ${result.failed} عميل`);
        result.errors.slice(0, 3).forEach(err => {
          toast.error(err, { duration: 5000 });
        });
      }

      setPreviewData([]);
      setSelectedSalesPerson("");
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  // استيراد البيانات (عملاء جدد فقط)
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
      const customers = previewData.map((row: any) => {
        const name = String(row["اسم العميل"] || row["name"] || "").trim();
        const phone = String(row["رقم الهاتف"] || row["phone"] || "").trim();
        const region = String(row["المنطقة"] || row["region"] || "").trim();
        const goldDebt21 = parseFloat(row["مديونية ذهب"] || row["goldDebt21"] || "0");
        const cashDebt = parseFloat(row["مديونية نقدية"] || row["cashDebt"] || "0");
        
        const customer: any = {
          name,
          phone,
          region,
          goldDebt21: isNaN(goldDebt21) ? 0 : goldDebt21,
          cashDebt: isNaN(cashDebt) ? 0 : cashDebt,
        };
        
        if (isAdmin && selectedSalesPerson) {
          customer.salesPersonId = selectedSalesPerson as Id<"users">;
        }
        
        return customer;
      });

      const result = await importCustomers({ customers });

      if (result.success > 0) {
        toast.success(`تم استيراد ${result.success} عميل بنجاح! ✅`);
      }

      if (result.failed > 0) {
        toast.error(`فشل استيراد ${result.failed} عميل`);
        result.errors.slice(0, 3).forEach(err => {
          toast.error(err, { duration: 5000 });
        });
      }

      setPreviewData([]);
      setSelectedSalesPerson("");
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
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
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");

    ws["!cols"] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.writeFile(wb, "نموذج_استيراد_العملاء.xlsx");
    toast.success("تم تحميل النموذج! 📥");
  };

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div className="bg-gradient-to-l from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">📊 استيراد وتحديث العملاء من Excel</h2>
        <p className="text-blue-100">
          قم بتحميل ملف Excel لاستيراد عملاء جدد أو تحديث بيانات العملاء الموجودين
        </p>
      </div>

      {/* شرح الفرق بين الاستيراد والتحديث */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-2xl shadow-lg p-6 border-2 border-green-200">
          <h3 className="text-xl font-bold text-green-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">✅</span>
            استيراد عملاء جدد
          </h3>
          <p className="text-gray-700 mb-3">
            يضيف عملاء جدد فقط. إذا كان رقم الهاتف موجود، سيتم رفض العميل.
          </p>
          <div className="bg-white rounded-xl p-3 text-sm text-gray-600">
            <strong>متى تستخدمه:</strong> عند إضافة عملاء جدد لأول مرة
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span className="text-2xl">🔄</span>
            تحديث البيانات
          </h3>
          <p className="text-gray-700 mb-3">
            يحدّث بيانات العملاء الموجودين (بناءً على الاسم) ويضيف الجدد.
          </p>
          <div className="bg-white rounded-xl p-3 text-sm text-gray-600">
            <strong>متى تستخدمه:</strong> للتحديث اليومي من نفس ملف Excel
          </div>
        </div>
      </div>

      {/* أزرار التحميل والرفع */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={downloadTemplate}
          className="bg-gradient-to-l from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transform hover:scale-105 transition-all"
        >
          <div className="text-6xl mb-4">📥</div>
          <h3 className="text-2xl font-bold mb-2">تحميل نموذج Excel</h3>
          <p className="text-green-100">احصل على ملف جاهز مع أمثلة</p>
        </button>

        <label className="bg-gradient-to-l from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transform hover:scale-105 transition-all cursor-pointer">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="text-6xl mb-4">📤</div>
          <h3 className="text-2xl font-bold mb-2">اختر ملف Excel</h3>
          <p className="text-blue-100">ارفع ملف العملاء</p>
        </label>
      </div>

      {/* اختيار موظف المبيعات */}
      {isAdmin && salespeople && previewData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            👤 اختر موظف المبيعات (للعملاء الجدد فقط)
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              👀 معاينة البيانات ({previewData.length} عميل)
            </h3>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleUpdate}
                disabled={updating || (isAdmin && !selectedSalesPerson)}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-l from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? "جاري التحديث..." : "🔄 تحديث البيانات"}
              </button>
              <button
                onClick={handleImport}
                disabled={importing || (isAdmin && !selectedSalesPerson)}
                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-l from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? "جاري الاستيراد..." : "✅ استيراد جدد"}
              </button>
            </div>
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
