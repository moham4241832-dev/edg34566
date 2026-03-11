import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function WeeklyReport() {
  const stats = useQuery(api.reports.dashboardStats);
  const salespeople = useQuery(api.users.listSalespeople);
  const customers = useQuery(api.customers.listAllCustomers);

  if (!stats || !salespeople || !customers) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-red-900 rounded-full mx-auto mb-4"></div>
          <p className="text-red-500 font-semibold">جاري تحميل التقارير...</p>
        </div>
      </div>
    );
  }

  // حساب إحصائيات المندوبين
  const salesStats = salespeople.map(sp => {
    const spCustomers = customers.filter(c => c.salesPersonId === sp._id);
    const totalGold = spCustomers.reduce((sum, c) => sum + (c.goldDebt21 || 0), 0);
    const totalCash = spCustomers.reduce((sum, c) => sum + (c.cashDebt || 0), 0);
    
    return {
      name: sp.fullName || sp.name || "مندوب",
      customers: spCustomers.length,
      gold: parseFloat(totalGold.toFixed(2)),
      cash: parseFloat(totalCash.toFixed(2))
    };
  });

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center border-2 border-red-900">
          <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white">📊 التقارير والإحصائيات</h3>
      </div>

      {/* الإحصائيات الرئيسية - محسنة للموبايل */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white transform hover:scale-105 transition-all border-2 border-red-900">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <h4 className="text-xs md:text-sm font-medium opacity-90">عدد العملاء</h4>
          </div>
          <p className="text-3xl md:text-4xl font-bold">{stats.totalCustomers}</p>
          <p className="text-xs opacity-75 mt-1">عميل نشط</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-yellow-700 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white transform hover:scale-105 transition-all border-2 border-amber-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl md:text-2xl">💰</span>
            <h4 className="text-xs md:text-sm font-medium opacity-90">مديونية الذهب</h4>
          </div>
          <p className="text-3xl md:text-4xl font-bold">{stats.totalGoldDebt.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">جرام عيار 21</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white transform hover:scale-105 transition-all sm:col-span-2 lg:col-span-1 border-2 border-green-900">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl md:text-2xl">💵</span>
            <h4 className="text-xs md:text-sm font-medium opacity-90">المديونية النقدية</h4>
          </div>
          <p className="text-3xl md:text-4xl font-bold">{stats.totalCashDebt.toFixed(2)}</p>
          <p className="text-xs opacity-75 mt-1">جنيه مصري</p>
        </div>
      </div>

      {/* بطاقات التحصيلات الأسبوعية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-amber-600 to-yellow-700 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white border-2 border-amber-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💰</span>
            <h4 className="text-base md:text-lg font-bold">ذهب محصل هذا الأسبوع</h4>
          </div>
          <p className="text-4xl md:text-5xl font-bold mb-2">{stats.weekGoldCollected.toFixed(2)}</p>
          <p className="text-sm opacity-90">جرام عيار 21</p>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white border-2 border-green-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💵</span>
            <h4 className="text-base md:text-lg font-bold">نقدية محصلة هذا الأسبوع</h4>
          </div>
          <p className="text-4xl md:text-5xl font-bold mb-2">{stats.weekCashCollected.toFixed(2)}</p>
          <p className="text-sm opacity-90">جنيه مصري</p>
        </div>
      </div>

      {/* جدول تفصيلي للمندوبين - محسن للموبايل */}
      <div className="bg-gray-900 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-red-900">
        <h4 className="text-base md:text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-xl md:text-2xl">📋</span>
          تفاصيل المندوبين
        </h4>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full min-w-[600px] md:min-w-0">
            <thead className="bg-gradient-to-r from-red-900 to-red-950">
              <tr>
                <th className="px-3 md:px-6 py-3 text-start text-xs font-bold text-gray-200 uppercase">المندوب</th>
                <th className="px-3 md:px-6 py-3 text-start text-xs font-bold text-gray-200 uppercase">العملاء</th>
                <th className="px-3 md:px-6 py-3 text-start text-xs font-bold text-gray-200 uppercase">ذهب (ج)</th>
                <th className="px-3 md:px-6 py-3 text-start text-xs font-bold text-gray-200 uppercase">نقدي (£)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900">
              {salesStats.map((stat, index) => (
                <tr key={index} className="hover:bg-red-950/30 transition-colors">
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm font-medium text-white">{stat.name}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm text-gray-300">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-900/50 text-red-400 border border-red-700">
                      {stat.customers}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm font-bold text-amber-400">{stat.gold.toFixed(2)}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-sm font-bold text-green-400">{stat.cash.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
