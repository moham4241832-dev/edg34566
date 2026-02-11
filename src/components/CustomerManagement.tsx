import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AddCollectionModal } from "./AddCollectionModal";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function CustomerManagement() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const customers = useQuery(
    currentUser?.role === "admin"
      ? api.customers.listAllCustomers
      : api.customers.listMyCustomers
  );
  const addCustomer = useMutation(api.customers.addCustomer);
  const deleteCustomer = useMutation(api.customers.deleteCustomer);

  const [selectedCustomerId, setSelectedCustomerId] = useState<Id<"customers"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    goldDebt21: "",
    cashDebt: "",
    salesPersonId: "",
  });

  const isAdmin = currentUser?.role === "admin";
  const salespeople = useQuery(
    isAdmin ? api.users.listSalespeople : ("skip" as any)
  );

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCustomer({
        name: newCustomer.name,
        phone: newCustomer.phone,
        goldDebt21: parseFloat(newCustomer.goldDebt21) || 0,
        cashDebt: parseFloat(newCustomer.cashDebt) || 0,
        salesPersonId: isAdmin
          ? (newCustomer.salesPersonId as Id<"users">)
          : undefined,
      });
      toast.success("تم إضافة العميل بنجاح! ✅");
      setShowAddForm(false);
      setNewCustomer({
        name: "",
        phone: "",
        goldDebt21: "",
        cashDebt: "",
        salesPersonId: "",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleDeleteCustomer = async (customerId: Id<"customers">) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return;
    try {
      await deleteCustomer({ customerId });
      toast.success("تم حذف العميل بنجاح! ✅");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  if (!customers) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-amber-600 font-semibold">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* زر إضافة عميل جديد */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdmin ? "📋 جميع العملاء" : "👥 عملائي"}
          </h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-gradient-to-l from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all"
          >
            {showAddForm ? "إلغاء" : "+ إضافة عميل جديد"}
          </button>
        </div>

        {/* نموذج إضافة عميل */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">إضافة عميل جديد</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم العميل
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="أحمد محمد"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="01234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    مديونية ذهب (جرام عيار 21)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCustomer.goldDebt21}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, goldDebt21: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    مديونية نقدية (جنيه)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newCustomer.cashDebt}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, cashDebt: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
                {isAdmin && salespeople && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      موظف المبيعات المسؤول
                    </label>
                    <select
                      required
                      value={newCustomer.salesPersonId}
                      onChange={(e) =>
                        setNewCustomer({ ...newCustomer, salesPersonId: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    >
                      <option value="">اختر موظف المبيعات</option>
                      {salespeople?.map((sp: any) => (
                        <option key={sp._id} value={sp._id}>
                          {sp.fullName} ({sp.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-l from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                ✅ إضافة العميل
              </button>
            </form>
          </div>
        )}

        {/* قائمة العملاء */}
        {customers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا يوجد عملاء بعد</h3>
            <p className="text-gray-600">ابدأ بإضافة أول عميل لك!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div
                key={customer._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-amber-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {customer.name}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {customer.phone}
                    </p>
                    {isAdmin && customer.salesPersonName && (
                      <p className="text-xs text-blue-600 mt-1">
                        💼 {customer.salesPersonName}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCustomerId(customer._id)}
                      className="px-4 py-2 bg-gradient-to-l from-amber-500 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-sm"
                    >
                      إضافة تحصيل
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteCustomer(customer._id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all text-sm"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-amber-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                      </svg>
                      <span className="text-xs font-medium text-amber-800">مديونية ذهب</span>
                    </div>
                    <p className="text-2xl font-bold text-amber-900">
                      {customer.goldDebt21.toFixed(2)}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">جرام عيار 21</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs font-medium text-green-800">مديونية نقدية</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {customer.cashDebt.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-700 mt-1">جنيه مصري</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCustomerId && (
        <AddCollectionModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}
    </>
  );
}
