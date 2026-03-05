import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AddCollectionModal } from "./AddCollectionModal";
import { Id } from "../../convex/_generated/dataModel";
import { OverdueStatusModal } from "./OverdueStatusModal";

export function CustomerCard() {
  const customers = useQuery(api.customers.listMyCustomers);
  const overdueStatuses = useQuery(api.overdue.getAllOverdueStatuses);
  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | null>(null);
  const [selectedOverdueCustomerId, setSelectedOverdueCustomerId] = useState<Id<"customers"> | null>(null);
  const [selectedOverdueCustomerName, setSelectedOverdueCustomerName] = useState<string>("");

  if (!customers) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-amber-600 font-semibold">جاري التحميل...</div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">لا يوجد عملاء بعد</h3>
        <p className="text-gray-600">سيتم عرض عملائك هنا بمجرد إضافتهم من قبل المدير</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => {
          const creditLimit = customer.creditLimit || 0;
          const goldDebt = customer.goldDebt21 || 0;
          const creditUsagePercent = creditLimit > 0 ? (goldDebt / creditLimit) * 100 : 0;
          const isOverLimit = goldDebt >= creditLimit && creditLimit > 0;
          const isNearLimit = creditUsagePercent >= 80 && creditUsagePercent < 100;
          
          // البحث عن حالة المتأخرات لهذا العميل
          const overdueStatus = overdueStatuses?.find(s => s.customerId === customer._id);
          const hasOverdue = overdueStatus && (
            (typeof overdueStatus.goldOverdue25 === 'number' && overdueStatus.goldOverdue25 > 0) ||
            (typeof overdueStatus.cashOverdue25 === 'number' && overdueStatus.cashOverdue25 > 0) ||
            (typeof overdueStatus.goldOverdue40 === 'number' && overdueStatus.goldOverdue40 > 0) ||
            (typeof overdueStatus.cashOverdue40 === 'number' && overdueStatus.cashOverdue40 > 0) ||
            (typeof overdueStatus.goldOverdue60 === 'number' && overdueStatus.goldOverdue60 > 0) ||
            (typeof overdueStatus.cashOverdue60 === 'number' && overdueStatus.cashOverdue60 > 0) ||
            (typeof overdueStatus.goldOverdue90 === 'number' && overdueStatus.goldOverdue90 > 0) ||
            (typeof overdueStatus.cashOverdue90 === 'number' && overdueStatus.cashOverdue90 > 0) ||
            (typeof overdueStatus.goldOverdue90Plus === 'number' && overdueStatus.goldOverdue90Plus > 0) ||
            (typeof overdueStatus.cashOverdue90Plus === 'number' && overdueStatus.cashOverdue90Plus > 0)
          );

          return (
            <div
              key={customer._id}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 ${
                isOverLimit 
                  ? 'border-red-300 bg-red-50/30' 
                  : isNearLimit 
                  ? 'border-orange-300 bg-orange-50/30'
                  : 'border-transparent hover:border-amber-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{customer.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {customer.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomerId(customer._id)}
                  className="px-4 py-2 bg-gradient-to-l from-amber-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  إضافة تحصيل
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                    </svg>
                    <span className="text-xs font-medium text-amber-800">مديونية ذهب</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">{customer.goldDebt21.toFixed(2)}</p>
                  <p className="text-xs text-amber-700 mt-1">جرام عيار 21</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium text-green-800">مديونية نقدية</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">{customer.cashDebt.toFixed(2)}</p>
                  <p className="text-xs text-green-700 mt-1">جنيه مصري</p>
                </div>
              </div>

              {/* الحد الائتماني */}
              {creditLimit > 0 && (
                <div className={`rounded-xl p-3 border mb-4 ${
                  isOverLimit 
                    ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
                    : isNearLimit
                    ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300'
                    : 'bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <svg className={`w-4 h-4 ${
                        isOverLimit ? 'text-red-600' : isNearLimit ? 'text-orange-600' : 'text-purple-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className={`text-xs font-medium ${
                        isOverLimit ? 'text-red-800' : isNearLimit ? 'text-orange-800' : 'text-purple-800'
                      }`}>الحد الائتماني</span>
                    </div>
                    <div className="text-end">
                      <p className={`text-sm font-bold ${
                        isOverLimit ? 'text-red-900' : isNearLimit ? 'text-orange-900' : 'text-purple-900'
                      }`}>{creditLimit.toFixed(2)} جرام</p>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isOverLimit 
                          ? 'bg-gradient-to-r from-red-500 to-rose-600' 
                          : isNearLimit
                          ? 'bg-gradient-to-r from-orange-500 to-amber-600'
                          : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                      }`}
                      style={{ width: `${Math.min(creditUsagePercent, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold ${
                      isOverLimit 
                        ? 'text-red-600' 
                        : isNearLimit
                        ? 'text-orange-600'
                        : 'text-green-600'
                    }`}>
                      {isOverLimit 
                        ? `⚠️ تجاوز بـ ${(goldDebt - creditLimit).toFixed(2)} جرام` 
                        : `متبقي ${(creditLimit - goldDebt).toFixed(2)} جرام`}
                    </p>
                    <p className={`text-xs font-medium ${
                      isOverLimit ? 'text-red-700' : isNearLimit ? 'text-orange-700' : 'text-purple-700'
                    }`}>
                      {creditUsagePercent.toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}

              {/* المتأخرات - عرض تفصيلي */}
              {hasOverdue && overdueStatus && (
                <div className="bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-300 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-bold text-rose-900">المتأخرات</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOverdueCustomerId(customer._id);
                        setSelectedOverdueCustomerName(customer.name);
                      }}
                      className="text-xs px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all font-semibold"
                    >
                      عرض الكل
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* متأخرات الذهب */}
                    {((typeof overdueStatus.goldOverdue25 === 'number' && overdueStatus.goldOverdue25 > 0) || 
                      (typeof overdueStatus.goldOverdue40 === 'number' && overdueStatus.goldOverdue40 > 0) || 
                      (typeof overdueStatus.goldOverdue60 === 'number' && overdueStatus.goldOverdue60 > 0) || 
                      (typeof overdueStatus.goldOverdue90 === 'number' && overdueStatus.goldOverdue90 > 0) || 
                      (typeof overdueStatus.goldOverdue90Plus === 'number' && overdueStatus.goldOverdue90Plus > 0)) && (
                      <div className="bg-white rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1.5">
                          <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                          </svg>
                          <span className="text-xs font-bold text-amber-900">ذهب (جرام)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {typeof overdueStatus.goldOverdue25 === 'number' && overdueStatus.goldOverdue25 > 0 && (
                            <div className="flex justify-between bg-green-50 rounded px-2 py-1">
                              <span className="text-gray-600">🟢 25 يوم</span>
                              <span className="font-bold text-green-700">{typeof overdueStatus.goldOverdue25 === 'number' ? overdueStatus.goldOverdue25.toFixed(1) : '0.0'}</span>
                            </div>
                          )}
                          {typeof overdueStatus.goldOverdue40 === 'number' && overdueStatus.goldOverdue40 > 0 && (
                            <div className="flex justify-between bg-blue-50 rounded px-2 py-1">
                              <span className="text-gray-600">🔵 40 يوم</span>
                              <span className="font-bold text-blue-700">{typeof overdueStatus.goldOverdue40 === 'number' ? overdueStatus.goldOverdue40.toFixed(1) : '0.0'}</span>
                            </div>
                          )}
                          {typeof overdueStatus.goldOverdue60 === 'number' && overdueStatus.goldOverdue60 > 0 && (
                            <div className="flex justify-between bg-yellow-50 rounded px-2 py-1">
                              <span className="text-gray-600">🟡 60 يوم</span>
                              <span className="font-bold text-yellow-700">{typeof overdueStatus.goldOverdue60 === 'number' ? overdueStatus.goldOverdue60.toFixed(1) : '0.0'}</span>
                            </div>
                          )}
                          {typeof overdueStatus.goldOverdue90 === 'number' && overdueStatus.goldOverdue90 > 0 && (
                            <div className="flex justify-between bg-orange-50 rounded px-2 py-1">
                              <span className="text-gray-600">🟠 90 يوم</span>
                              <span className="font-bold text-orange-700">{typeof overdueStatus.goldOverdue90 === 'number' ? overdueStatus.goldOverdue90.toFixed(1) : '0.0'}</span>
                            </div>
                          )}
                          {typeof overdueStatus.goldOverdue90Plus === 'number' && overdueStatus.goldOverdue90Plus > 0 && (
                            <div className="flex justify-between bg-red-50 rounded px-2 py-1 col-span-2">
                              <span className="text-gray-600">🔴 +90 يوم</span>
                              <span className="font-bold text-red-700">{typeof overdueStatus.goldOverdue90Plus === 'number' ? overdueStatus.goldOverdue90Plus.toFixed(1) : '0.0'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* متأخرات نقدية */}
                    {((typeof overdueStatus.cashOverdue25 === 'number' && overdueStatus.cashOverdue25 > 0) || 
                      (typeof overdueStatus.cashOverdue40 === 'number' && overdueStatus.cashOverdue40 > 0) || 
                      (typeof overdueStatus.cashOverdue60 === 'number' && overdueStatus.cashOverdue60 > 0) || 
                      (typeof overdueStatus.cashOverdue90 === 'number' && overdueStatus.cashOverdue90 > 0) || 
                      (typeof overdueStatus.cashOverdue90Plus === 'number' && overdueStatus.cashOverdue90Plus > 0)) && (
                      <div className="bg-white rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-1.5">
                          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-bold text-green-900">نقدي (ج.م)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-xs">
                          {typeof overdueStatus.cashOverdue25 === 'number' && overdueStatus.cashOverdue25 > 0 && (
                            <div className="flex justify-between bg-green-50 rounded px-2 py-1">
                              <span className="text-gray-600">🟢 25 يوم</span>
                              <span className="font-bold text-green-700">{typeof overdueStatus.cashOverdue25 === 'number' ? overdueStatus.cashOverdue25.toFixed(0) : '0'}</span>
                            </div>
                          )}
                          {typeof overdueStatus.cashOverdue40 === 'number' && overdueStatus.cashOverdue40 > 0 && (
                            <div className="flex justify-between bg-blue-50 rounded px-2 py-1">
                              <span className="text-gray-600">🔵 40 يوم</span>
                              <span className="font-bold text-blue-700">{typeof overdueStatus.cashOverdue40 === 'number' ? overdueStatus.cashOverdue40.toFixed(0) : '0'}</span>
                            </div>
                          )}
                          {typeof overdueStatus.cashOverdue60 === 'number' && overdueStatus.cashOverdue60 > 0 && (
                            <div className="flex justify-between bg-yellow-50 rounded px-2 py-1">
                              <span className="text-gray-600">🟡 60 يوم</span>
                              <span className="font-bold text-yellow-700">{typeof overdueStatus.cashOverdue60 === 'number' ? overdueStatus.cashOverdue60.toFixed(0) : '0'}</span>
                            </div>
                          )}
                          {typeof overdueStatus.cashOverdue90 === 'number' && overdueStatus.cashOverdue90 > 0 && (
                            <div className="flex justify-between bg-orange-50 rounded px-2 py-1">
                              <span className="text-gray-600">🟠 90 يوم</span>
                              <span className="font-bold text-orange-700">{typeof overdueStatus.cashOverdue90 === 'number' ? overdueStatus.cashOverdue90.toFixed(0) : '0'}</span>
                            </div>
                          )}
                          {typeof overdueStatus.cashOverdue90Plus === 'number' && overdueStatus.cashOverdue90Plus > 0 && (
                            <div className="flex justify-between bg-red-50 rounded px-2 py-1 col-span-2">
                              <span className="text-gray-600">🔴 +90 يوم</span>
                              <span className="font-bold text-red-700">{typeof overdueStatus.cashOverdue90Plus === 'number' ? overdueStatus.cashOverdue90Plus.toFixed(0) : '0'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedCustomerId && (
        <AddCollectionModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {selectedOverdueCustomerId && (
        <OverdueStatusModal
          customerId={selectedOverdueCustomerId}
          customerName={selectedOverdueCustomerName}
          onClose={() => setSelectedOverdueCustomerId(null)}
          currentStatus={overdueStatuses?.find(s => s.customerId === selectedOverdueCustomerId)}
        />
      )}
    </>
  );
}
