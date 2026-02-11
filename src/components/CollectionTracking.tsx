import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function CollectionTracking() {
  const stats = useQuery(api.collections.getMyCollectionStats);
  const collections = useQuery(api.collections.getMySalesCollections);
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");

  if (!stats || !collections) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-amber-600 font-semibold">جاري التحميل...</div>
      </div>
    );
  }

  const filteredCollections = collections.filter((c) => {
    if (filter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return c.collectionDate >= today.getTime();
    }
    if (filter === "week") {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return c.collectionDate >= weekStart.getTime();
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-900">📊 تتبع التحصيلات</h3>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* إحصائيات اليوم */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">اليوم</h4>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">ذهب:</span>
              <span className="text-2xl font-black">{stats.today.gold.toFixed(2)} جم</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">نقدية:</span>
              <span className="text-2xl font-black">{stats.today.cash.toFixed(2)} ج</span>
            </div>
            <div className="text-sm opacity-75 text-center mt-2">
              {stats.today.count} عملية تحصيل
            </div>
          </div>
        </div>

        {/* إحصائيات الأسبوع */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">هذا الأسبوع</h4>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">ذهب:</span>
              <span className="text-2xl font-black">{stats.week.gold.toFixed(2)} جم</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">نقدية:</span>
              <span className="text-2xl font-black">{stats.week.cash.toFixed(2)} ج</span>
            </div>
            <div className="text-sm opacity-75 text-center mt-2">
              {stats.week.count} عملية تحصيل
            </div>
          </div>
        </div>

        {/* الإجمالي الكلي */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold">الإجمالي الكلي</h4>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">ذهب:</span>
              <span className="text-2xl font-black">{stats.total.gold.toFixed(2)} جم</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-90">نقدية:</span>
              <span className="text-2xl font-black">{stats.total.cash.toFixed(2)} ج</span>
            </div>
            <div className="text-sm opacity-75 text-center mt-2">
              {stats.total.count} عملية تحصيل
            </div>
          </div>
        </div>
      </div>

      {/* فلتر التحصيلات */}
      <div className="flex gap-3 bg-white rounded-xl p-2 shadow-md border border-gray-200">
        <button
          onClick={() => setFilter("all")}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === "all"
              ? "bg-gradient-to-l from-amber-500 to-yellow-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          الكل
        </button>
        <button
          onClick={() => setFilter("today")}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === "today"
              ? "bg-gradient-to-l from-blue-500 to-blue-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          اليوم
        </button>
        <button
          onClick={() => setFilter("week")}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === "week"
              ? "bg-gradient-to-l from-purple-500 to-purple-600 text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          هذا الأسبوع
        </button>
      </div>

      {/* جدول التحصيلات */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-l from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">التاريخ</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">العميل</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">الهاتف</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">ذهب (جم)</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">نقدية (ج)</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-semibold">لا توجد تحصيلات</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCollections.map((collection) => (
                  <tr key={collection._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(collection.collectionDate).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {collection.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{collection.customerPhone}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold">
                        {collection.goldAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold">
                        {collection.cashAmount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {collection.notes || "-"}
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
