import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function AdminCollectionStats() {
  const stats = useQuery(api.collections.getAllCollectionStats);

  if (!stats) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-amber-600 font-semibold">جاري التحميل...</div>
      </div>
    );
  }

  const totalGold = stats.reduce((sum, s) => sum + s.totalGold, 0);
  const totalCash = stats.reduce((sum, s) => sum + s.totalCash, 0);
  const todayGold = stats.reduce((sum, s) => sum + s.todayGold, 0);
  const todayCash = stats.reduce((sum, s) => sum + s.todayCash, 0);

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">📊 إحصائيات التحصيل - جميع الموظفين</h3>

      {/* الإحصائيات الإجمالية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            تحصيلات اليوم
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">ذهب:</span>
              <span className="text-3xl font-black">{todayGold.toFixed(2)} جم</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">نقدية:</span>
              <span className="text-3xl font-black">{todayCash.toFixed(2)} ج</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            الإجمالي الكلي
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">ذهب:</span>
              <span className="text-3xl font-black">{totalGold.toFixed(2)} جم</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">نقدية:</span>
              <span className="text-3xl font-black">{totalCash.toFixed(2)} ج</span>
            </div>
          </div>
        </div>
      </div>

      {/* جدول تفصيلي لكل موظف */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-l from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الموظف</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">البريد</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">ذهب اليوم</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">نقدية اليوم</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">إجمالي ذهب</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">إجمالي نقدية</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">عدد العمليات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    لا يوجد موظفين بعد
                  </td>
                </tr>
              ) : (
                stats.map((stat) => (
                  <tr key={stat.salesPersonId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {stat.salesPersonName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{stat.salesPersonEmail}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">
                        {stat.todayGold.toFixed(2)} جم
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">
                        {stat.todayCash.toFixed(2)} ج
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
                        {stat.totalGold.toFixed(2)} جم
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold">
                        {stat.totalCash.toFixed(2)} ج
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold">
                        {stat.totalCount}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
