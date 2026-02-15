import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function OverdueExcelUpdater() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const customers = useQuery(api.customers.listAllCustomers);
  const updateOverdue = useMutation(api.overdue.updateOverdueStatus);

  // تحميل نموذج Excel للمتأخرات
  const downloadExcelTemplate = () => {
    if (!customers || customers.length === 0) {
      toast.error("لا يوجد عملاء في النظام");
      return;
    }

    const templateData = customers.map(customer => ({
      "اسم العميل": customer.name,
      "رقم الهاتف": customer.phone,
      "المنطقة": customer.region || "",
      "ذهب 0-25 يوم": 0,
      "نقدي 0-25 يوم": 0,
      "ذهب 0-40 يوم": 0,
      "نقدي 0-40 يوم": 0,
      "ذهب 0-60 يوم": 0,
      "نقدي 0-60 يوم": 0,
      "ذهب 0-90 يوم": 0,
      "نقدي 0-90 يوم": 0,
      "ذهب +90 يوم": 0,
      "نقدي +90 يوم": 0
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 20 }, { wch: 15 }, { wch: 15 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
      { wch: 15 }, { wch: 15 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المتأخرات");

    const date = new Date().toLocaleDateString('ar-EG').replace(/\//g, '-');
    XLSX.writeFile(wb, `نموذج_المتأخرات_${date}.xlsx`);
    toast.success("تم تحميل نموذج Excel بنجاح! 📊");
  };

  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    const num = parseFloat(String(value).trim());
    return isNaN(num) ? 0 : num;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("يرجى اختيار ملف Excel (.xlsx أو .xls)");
      return;
    }

    if (!customers || customers.length === 0) {
      toast.error("لا يوجد عملاء في النظام");
      return;
    }

    setIsProcessing(true);
    setResults(null);

    try {
      toast.info("جاري قراءة ملف Excel...");
      
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      const processedResults = {
        total: customers.length,
        found: 0,
        notFound: 0,
        updated: [] as any[],
      };

      toast.info(`جاري معالجة ${data.length} سطر من Excel...`);

      for (const row of data as any[]) {
        const customerName = row["اسم العميل"]?.toString().trim();
        const customerPhone = row["رقم الهاتف"]?.toString().trim();
        
        if (!customerName && !customerPhone) continue;

        const customer = customers.find(c => 
          (customerName && c.name.includes(customerName)) ||
          (customerPhone && c.phone.includes(customerPhone))
        );

        if (!customer) {
          processedResults.notFound++;
          continue;
        }

        // قراءة المتأخرات حسب الفئات (أرقام)
        const goldOverdue25 = parseNumber(row["ذهب 0-25 يوم"]);
        const cashOverdue25 = parseNumber(row["نقدي 0-25 يوم"]);
        const goldOverdue40 = parseNumber(row["ذهب 0-40 يوم"]);
        const cashOverdue40 = parseNumber(row["نقدي 0-40 يوم"]);
        const goldOverdue60 = parseNumber(row["ذهب 0-60 يوم"]);
        const cashOverdue60 = parseNumber(row["نقدي 0-60 يوم"]);
        const goldOverdue90 = parseNumber(row["ذهب 0-90 يوم"]);
        const cashOverdue90 = parseNumber(row["نقدي 0-90 يوم"]);
        const goldOverdue90Plus = parseNumber(row["ذهب +90 يوم"]);
        const cashOverdue90Plus = parseNumber(row["نقدي +90 يوم"]);

        // حفظ كل الفئات
        const hasAnyOverdue = goldOverdue25 > 0 || cashOverdue25 > 0 || 
                              goldOverdue40 > 0 || cashOverdue40 > 0 ||
                              goldOverdue60 > 0 || cashOverdue60 > 0 ||
                              goldOverdue90 > 0 || cashOverdue90 > 0 ||
                              goldOverdue90Plus > 0 || cashOverdue90Plus > 0;

        if (hasAnyOverdue) {
          try {
            await updateOverdue({
              customerId: customer._id,
              goldOverdue25,
              cashOverdue25,
              goldOverdue40,
              cashOverdue40,
              goldOverdue60,
              cashOverdue60,
              goldOverdue90,
              cashOverdue90,
              goldOverdue90Plus,
              cashOverdue90Plus,
            });

            processedResults.found++;
            processedResults.updated.push({
              name: customer.name,
              goldOverdue25,
              cashOverdue25,
              goldOverdue40,
              cashOverdue40,
              goldOverdue60,
              cashOverdue60,
              goldOverdue90,
              cashOverdue90,
              goldOverdue90Plus,
              cashOverdue90Plus,
            });
          } catch (error) {
            console.error(`خطأ في تحديث ${customer.name}:`, error);
          }
        } else {
          processedResults.notFound++;
        }
      }

      setResults(processedResults);
      toast.success(`تم! تحديث ${processedResults.found} عميل`);
    } catch (error) {
      console.error("خطأ في معالجة Excel:", error);
      toast.error("حدث خطأ في معالجة الملف");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border-2 border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">تحديث المتأخرات من Excel</h3>
          <p className="text-sm text-gray-600">استيراد بيانات المتأخرات بشكل جماعي</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* شرح الفئات */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h4 className="text-sm font-bold text-blue-900 mb-2">📋 فئات المتأخرات:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
            <div>🟢 0-25 يوم</div>
            <div>🔵 0-40 يوم</div>
            <div>🟡 0-60 يوم</div>
            <div>🟠 0-90 يوم</div>
            <div>🔴 +90 يوم</div>
          </div>
          <p className="text-xs text-blue-700 mt-2">* اكتب الأرقام (جرام للذهب، جنيه للنقدي)</p>
        </div>

        <button
          onClick={downloadExcelTemplate}
          disabled={!customers || customers.length === 0}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>تحميل نموذج Excel</span>
        </button>

        <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
          <label className="block">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="hidden"
            />
            <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 text-center hover:border-purple-500 hover:bg-purple-50 transition-all">
                {isProcessing ? (
                  <div className="space-y-3">
                    <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-purple-600 font-semibold">جاري المعالجة...</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-12 h-12 text-purple-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-base font-bold text-gray-900 mb-1">اضغط لاختيار ملف Excel</p>
                    <p className="text-xs text-gray-600">أو اسحب الملف هنا</p>
                  </>
                )}
              </div>
            </div>
          </label>
        </div>

        {results && (
          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
            <h4 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              نتائج التحديث
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{results.total}</p>
                <p className="text-xs text-blue-800 mt-1">إجمالي</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                <p className="text-2xl font-bold text-green-600">{results.found}</p>
                <p className="text-xs text-green-800 mt-1">تم التحديث</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                <p className="text-2xl font-bold text-gray-600">{results.notFound}</p>
                <p className="text-xs text-gray-800 mt-1">غير موجود</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
