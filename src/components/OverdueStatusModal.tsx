import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface OverdueStatusModalProps {
  customerId: Id<"customers">;
  customerName: string;
  onClose: () => void;
  currentStatus?: any;
}

export function OverdueStatusModal({ customerId, customerName, onClose, currentStatus }: OverdueStatusModalProps) {
  const updateOverdueStatus = useMutation(api.overdue.updateOverdueStatus);

  const [status, setStatus] = useState({
    goldOverdue25: currentStatus?.goldOverdue25 || 0,
    cashOverdue25: currentStatus?.cashOverdue25 || 0,
    goldOverdue40: currentStatus?.goldOverdue40 || 0,
    cashOverdue40: currentStatus?.cashOverdue40 || 0,
    goldOverdue60: currentStatus?.goldOverdue60 || 0,
    cashOverdue60: currentStatus?.cashOverdue60 || 0,
    goldOverdue90: currentStatus?.goldOverdue90 || 0,
    cashOverdue90: currentStatus?.cashOverdue90 || 0,
    goldOverdue90Plus: currentStatus?.goldOverdue90Plus || 0,
    cashOverdue90Plus: currentStatus?.cashOverdue90Plus || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateOverdueStatus({
        customerId,
        ...status,
      });
      toast.success("تم تحديث حالة المتأخرات! ✅");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-l from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">تحديث حالة المتأخرات</h2>
              <p className="text-purple-100 mt-1">{customerName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* متأخرات الذهب */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200">
            <h3 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
              متأخرات الذهب (جرام)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🟢 0-25 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.goldOverdue25}
                  onChange={(e) => setStatus({ ...status, goldOverdue25: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🔵 0-40 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.goldOverdue40}
                  onChange={(e) => setStatus({ ...status, goldOverdue40: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🟡 0-60 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.goldOverdue60}
                  onChange={(e) => setStatus({ ...status, goldOverdue60: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🟠 0-90 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.goldOverdue90}
                  onChange={(e) => setStatus({ ...status, goldOverdue90: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">🔴 +90 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.goldOverdue90Plus}
                  onChange={(e) => setStatus({ ...status, goldOverdue90Plus: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* متأخرات نقدية */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
            <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              متأخرات نقدية (جنيه)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🟢 0-25 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.cashOverdue25}
                  onChange={(e) => setStatus({ ...status, cashOverdue25: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🔵 0-40 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.cashOverdue40}
                  onChange={(e) => setStatus({ ...status, cashOverdue40: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🟡 0-60 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.cashOverdue60}
                  onChange={(e) => setStatus({ ...status, cashOverdue60: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🟠 0-90 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.cashOverdue90}
                  onChange={(e) => setStatus({ ...status, cashOverdue90: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">🔴 +90 يوم</label>
                <input
                  type="number"
                  step="0.01"
                  value={status.cashOverdue90Plus}
                  onChange={(e) => setStatus({ ...status, cashOverdue90Plus: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* أزرار الحفظ */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-l from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
            >
              ✅ حفظ التحديثات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
