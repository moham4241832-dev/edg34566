import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function WeeklyReport() {
  const stats = useQuery(api.reports.dashboardStats);

  if (!stats) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900">📊 إحصائيات عامة</h3>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <h4 className="text-sm font-medium opacity-90 mb-2">عدد العملاء</h4>
          <p className="text-4xl font-bold">{stats.totalCustomers}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
          <h4 className="text-sm font-medium opacity-90 mb-2">إجمالي مديونية الذهب</h4>
          <p className="text-4xl font-bold">{stats.totalGoldDebt.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-1">جرام عيار 21</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <h4 className="text-sm font-medium opacity-90 mb-2">إجمالي المديونية النقدية</h4>
          <p className="text-4xl font-bold">{stats.totalCashDebt.toFixed(2)}</p>
          <p className="text-sm opacity-90 mt-1">جنيه مصري</p>
        </div>
      </div>

      {/* تحصيلات الأسبوع */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4">تحصيلات هذا الأسبوع</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
            <p className="text-sm text-amber-800 mb-1">ذهب محصل</p>
            <p className="text-3xl font-bold text-amber-900">{stats.weekGoldCollected.toFixed(2)}</p>
            <p className="text-xs text-amber-700 mt-1">جرام</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-green-800 mb-1">نقدية محصلة</p>
            <p className="text-3xl font-bold text-green-900">{stats.weekCashCollected.toFixed(2)}</p>
            <p className="text-xs text-green-700 mt-1">جنيه</p>
          </div>
        </div>
      </div>
    </div>
  );
}
