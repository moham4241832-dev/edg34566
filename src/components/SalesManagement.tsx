import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export function SalesManagement() {
  const [isImporting, setIsImporting] = useState(false);

  const salesByBranch = useQuery(api.sales.getSalesByBranch);
  const salesBySalesperson = useQuery(api.sales.getSalesBySalesperson);
  const currentUser = useQuery(api.users.getCurrentUser);
  const importSales = useMutation(api.sales.importSales);
  const clearAllSales = useMutation(api.sales.clearAllSales);
  
  const isAdmin = currentUser?.role === "admin";

  // تحميل ملف Excel نموذجي
  const downloadTemplate = () => {
    const template = [
      {
        الفرع: "اسكندرية",
        المندوب: "أحمد محمد",
        "ستار عيار 18": 150.5,
        "ساده عيار 18": 100.25,
        "ساده عيار 21": 200.75,
        "ستار عيار 21": 180.5,
        "إجمالي المبيعات": 631.5,
        التاريخ: "2024-01-15",
      },
      {
        الفرع: "المنصورة",
        المندوب: "محمد علي",
        "ستار عيار 18": 120.0,
        "ساده عيار 18": 80.0,
        "ساده عيار 21": 180.5,
        "ستار عيار 21": 150.0,
        "إجمالي المبيعات": 530.5,
        التاريخ: "2024-01-15",
      },
      {
        الفرع: "طنطا",
        المندوب: "علي حسن",
        "ستار عيار 18": 90.25,
        "ساده عيار 18": 60.0,
        "ساده عيار 21": 150.0,
        "ستار عيار 21": 120.0,
        "إجمالي المبيعات": 420.25,
        التاريخ: "2024-01-15",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المبيعات");
    XLSX.writeFile(wb, "نموذج_المبيعات.xlsx");
    toast.success("تم تحميل الملف النموذجي! 📥");
  };

  // استيراد من Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const salesData = jsonData.map((row: any) => ({
        branch: row["الفرع"] || row["branch"] || "",
        salesperson: row["المندوب"] || row["salesperson"] || "",
        gold18Star: parseFloat(row["ستار عيار 18"] || row["gold18Star"] || 0),
        gold18Plain: parseFloat(row["ساده عيار 18"] || row["gold18Plain"] || 0),
        gold21Plain: parseFloat(row["ساده عيار 21"] || row["gold21Plain"] || 0),
        gold21Star: parseFloat(row["ستار عيار 21"] || row["gold21Star"] || 0),
        totalSales: parseFloat(
          row["إجمالي المبيعات"] || row["totalSales"] || 0
        ),
        saleDate: row["التاريخ"]
          ? new Date(row["التاريخ"]).getTime()
          : Date.now(),
      }));

      await importSales({ salesData });
      toast.success(`تم استيراد ${salesData.length} سجل مبيعات بنجاح! 🎉`);
      e.target.value = "";
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearSales = async () => {
    if (!confirm("هل أنت متأكد من حذف جميع المبيعات؟")) return;

    try {
      const result = await clearAllSales({});
      toast.success(`تم حذف ${result.count} سجل مبيعات`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  if (!salesByBranch || !salesBySalesperson) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-red-600 font-semibold">
          جاري التحميل...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* أزرار التحكم */}
      <div className="bg-gradient-to-br from-gray-900 to-red-950 rounded-2xl shadow-xl p-6 border-2 border-red-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center border-2 border-red-900">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">إدارة المبيعات</h3>
              <p className="text-sm text-gray-300">
                استيراد وتحليل بيانات المبيعات
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <button
            onClick={downloadTemplate}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-lg sm:rounded-xl hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border-2 border-green-900"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            تحميل ملف نموذجي
          </button>

          <label className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-amber-600 to-yellow-700 text-white font-bold rounded-lg sm:rounded-xl hover:from-amber-700 hover:to-yellow-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 cursor-pointer border-2 border-amber-900">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {isImporting ? "جاري الاستيراد..." : "استيراد من Excel"}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isImporting}
            />
          </label>

          <button
            onClick={handleClearSales}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-lg sm:rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            حذف جميع المبيعات
          </button>
        </div>
        )}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* مبيعات عيار 21 حسب الفرع */}
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-xl p-6 border-2 border-amber-300">
          <h4 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            مبيعات عيار 21 حسب الفرع
          </h4>
          <div className="space-y-3">
            {salesByBranch.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                لا توجد بيانات بعد
              </p>
            ) : (
              salesByBranch.map((branch) => {
                const gold21Total = branch.gold21Plain + branch.gold21Star;
                const maxGold21 = Math.max(
                  ...salesByBranch.map((b) => b.gold21Plain + b.gold21Star)
                );
                const percentage = maxGold21 > 0 ? (gold21Total / maxGold21) * 100 : 0;

                return (
                  <div key={branch.branch} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-amber-900">
                        {branch.branch}
                      </span>
                      <span className="text-lg font-bold text-amber-800">
                        {gold21Total.toFixed(2)} جم
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-yellow-600 h-5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* مبيعات عيار 18 حسب الفرع */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            مبيعات عيار 18 حسب الفرع
          </h4>
          <div className="space-y-3">
            {salesByBranch.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                لا توجد بيانات بعد
              </p>
            ) : (
              salesByBranch.map((branch) => {
                const gold18Total = branch.gold18Plain + branch.gold18Star;
                const maxGold18 = Math.max(
                  ...salesByBranch.map((b) => b.gold18Plain + b.gold18Star)
                );
                const percentage = maxGold18 > 0 ? (gold18Total / maxGold18) * 100 : 0;

                return (
                  <div key={branch.branch} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {branch.branch}
                      </span>
                      <span className="text-lg font-bold text-blue-700">
                        {gold18Total.toFixed(2)} جم
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-indigo-500 h-5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* مبيعات ستار عيار 18 حسب الفرع */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-200">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            مبيعات ستار عيار 18 حسب الفرع
          </h4>
          <div className="space-y-3">
            {salesByBranch.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                لا توجد بيانات بعد
              </p>
            ) : (
              salesByBranch.map((branch) => {
                const maxGold18Star = Math.max(
                  ...salesByBranch.map((b) => b.gold18Star)
                );
                const percentage = maxGold18Star > 0 ? (branch.gold18Star / maxGold18Star) * 100 : 0;

                return (
                  <div key={branch.branch} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {branch.branch}
                      </span>
                      <span className="text-lg font-bold text-purple-700">
                        {branch.gold18Star.toFixed(2)} جم
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-400 to-pink-500 h-5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* مبيعات ساده عيار 21 حسب الفرع */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200">
          <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💎</span>
            مبيعات ساده عيار 21 حسب الفرع
          </h4>
          <div className="space-y-3">
            {salesByBranch.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                لا توجد بيانات بعد
              </p>
            ) : (
              salesByBranch.map((branch) => {
                const maxGold21Plain = Math.max(
                  ...salesByBranch.map((b) => b.gold21Plain)
                );
                const percentage = maxGold21Plain > 0 ? (branch.gold21Plain / maxGold21Plain) * 100 : 0;

                return (
                  <div key={branch.branch} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        {branch.branch}
                      </span>
                      <span className="text-lg font-bold text-green-700">
                        {branch.gold21Plain.toFixed(2)} جم
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* جدول الإجماليات */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-200">
        <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          إجماليات المبيعات
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border-2 border-amber-200">
            <p className="text-lg font-bold text-amber-900 mb-1">
              إجمالي عيار 21
            </p>
            <p className="text-4xl font-bold text-amber-900">
              {salesByBranch
                .reduce((sum, b) => sum + b.gold21Plain + b.gold21Star, 0)
                .toFixed(2)}{" "}
              جم
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
            <p className="text-lg font-bold text-blue-900 mb-1">
              إجمالي عيار 18
            </p>
            <p className="text-4xl font-bold text-blue-900">
              {salesByBranch
                .reduce((sum, b) => sum + b.gold18Plain + b.gold18Star, 0)
                .toFixed(2)}{" "}
              جم
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
            <p className="text-lg font-bold text-green-900 mb-1">
              إجمالي المبيعات
            </p>
            <p className="text-4xl font-bold text-green-900">
              {salesByBranch
                .reduce((sum, b) => sum + b.totalSales, 0)
                .toFixed(2)}{" "}
              جم
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
