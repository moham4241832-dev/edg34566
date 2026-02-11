import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface AddCollectionModalProps {
  customerId: Id<"customers">;
  onClose: () => void;
}

export function AddCollectionModal({ customerId, onClose }: AddCollectionModalProps) {
  const customers = useQuery(api.customers.listMyCustomers);
  const addCollection = useMutation(api.collections.addCollection);

  const [goldAmount, setGoldAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customer = customers?.find((c) => c._id === customerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addCollection({
        customerId,
        goldAmount: parseFloat(goldAmount) || 0,
        cashAmount: parseFloat(cashAmount) || 0,
        notes: notes || undefined,
      });

      toast.success("تم إضافة التحصيل بنجاح");
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء إضافة التحصيل";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-l from-amber-500 to-yellow-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">إضافة تحصيل</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-amber-100 mt-2">{customer.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* المديونية الحالية */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">المديونية الحالية</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">ذهب عيار 21</p>
                <p className="text-lg font-bold text-amber-600">
                  {customer.goldDebt21.toFixed(2)} جم
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">نقدية</p>
                <p className="text-lg font-bold text-green-600">
                  {customer.cashDebt.toFixed(2)} جنيه
                </p>
              </div>
            </div>
          </div>

          {/* التحصيل */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              تحصيل ذهب عيار 21 (جرام)
            </label>
            <input
              type="number"
              step="0.01"
              value={goldAmount}
              onChange={(e) => setGoldAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              تحصيل نقدي (جنيه)
            </label>
            <input
              type="number"
              step="0.01"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ملاحظات (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف أي ملاحظات..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!goldAmount && !cashAmount)}
              className="flex-1 px-6 py-3 bg-gradient-to-l from-amber-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "جاري الحفظ..." : "حفظ التحصيل"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
