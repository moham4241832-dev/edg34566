import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface AddCollectionModalProps {
  onClose: () => void;
}

export function AddCollectionModal({ onClose }: AddCollectionModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | "">("");
  const [goldAmount, setGoldAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [notes, setNotes] = useState("");

  // استخدام الـ query الجديد الذي يحدد العملاء حسب الصلاحيات
  const customers = useQuery(api.collections.getCustomersForCollection);
  const addCollection = useMutation(api.collections.addCollection);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomerId) {
      toast.error("يرجى اختيار عميل");
      return;
    }

    const gold = parseFloat(goldAmount) || 0;
    const cash = parseFloat(cashAmount) || 0;

    if (gold === 0 && cash === 0) {
      toast.error("يجب إدخال مبلغ للتحصيل");
      return;
    }

    try {
      await addCollection({
        customerId: selectedCustomerId as Id<"customers">,
        goldAmount: gold,
        cashAmount: cash,
        notes: notes || undefined,
      });
      toast.success("تم تسجيل التحصيل بنجاح! ✅");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء التحصيل";
      toast.error(message);
    }
  };

  if (!customers) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
          <div className="text-center py-8">
            <div className="animate-pulse text-amber-600 font-semibold">جاري التحميل...</div>
          </div>
        </div>
      </div>
    );
  }

  const selectedCustomer = customers.find((c) => c._id === selectedCustomerId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">💰</span>
            تسجيل تحصيل جديد
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار العميل */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              اختر العميل <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value as Id<"customers"> | "")}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all text-start"
              required
            >
              <option value="">-- اختر عميل --</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} - {customer.phone} ({customer.salesPersonName})
                </option>
              ))}
            </select>
          </div>

          {/* عرض مديونية العميل المختار */}
          {selectedCustomer && (
            <div className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span className="text-xl">📊</span>
                مديونية العميل الحالية
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">ذهب عيار 21</p>
                  <p className="text-2xl font-black text-amber-700">
                    {selectedCustomer.goldDebt21.toFixed(2)} جم
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  <p className="text-xs text-gray-600 mb-1">نقدية</p>
                  <p className="text-2xl font-black text-green-700">
                    {selectedCustomer.cashDebt.toFixed(2)} ج
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* مبلغ الذهب */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              مبلغ الذهب المحصل (جرام عيار 21)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={goldAmount}
              onChange={(e) => setGoldAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
            />
          </div>

          {/* المبلغ النقدي */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              المبلغ النقدي المحصل (جنيه مصري)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
            />
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات إضافية..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
            />
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-l from-amber-500 to-yellow-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              ✅ تسجيل التحصيل
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300 transition-all"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
