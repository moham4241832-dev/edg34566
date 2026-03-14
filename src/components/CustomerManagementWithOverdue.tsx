import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

// Helper function to safely convert overdue values to numbers
const toNumber = (val: number | boolean | undefined): number => {
  if (typeof val === 'number') return val;
  return 0;
};

export function CustomerManagementWithOverdue() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Id<"customers"> | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    region: "",
    goldDebt21: 0,
    cashDebt: 0,
    salesPersonId: "" as Id<"users"> | "",
  });

  const customers = useQuery(api.customers.listAllCustomers);
  const salespeople = useQuery(api.users.listSalespeople);
  const overdueStatuses = useQuery(api.overdue.getAllOverdueStatuses);
  const addCustomer = useMutation(api.customers.addCustomer);
  const updateCustomer = useMutation(api.customers.updateCustomer);
  const deleteCustomer = useMutation(api.customers.deleteCustomer);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.region || !formData.salesPersonId) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      if (editingCustomer) {
        await updateCustomer({
          customerId: editingCustomer,
          name: formData.name,
          phone: formData.phone,
          region: formData.region,
          goldDebt21: formData.goldDebt21,
          cashDebt: formData.cashDebt,
          salesPersonId: formData.salesPersonId as Id<"users">,
        });
        toast.success("تم تحديث العميل بنجاح! ✅");
        setEditingCustomer(null);
      } else {
        await addCustomer({
          name: formData.name,
          phone: formData.phone,
          region: formData.region,
          goldDebt21: formData.goldDebt21,
          cashDebt: formData.cashDebt,
          salesPersonId: formData.salesPersonId as Id<"users">,
        });
        toast.success("تم إضافة العميل بنجاح! 🎉");
      }

      setFormData({
        name: "",
        phone: "",
        region: "",
        goldDebt21: 0,
        cashDebt: 0,
        salesPersonId: "",
      });
      setIsAdding(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleEdit = (customer: any) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      region: customer.region,
      goldDebt21: customer.goldDebt21,
      cashDebt: customer.cashDebt,
      salesPersonId: customer.salesPersonId,
    });
    setEditingCustomer(customer._id);
    setIsAdding(true);
  };

  const handleDelete = async (customerId: Id<"customers">) => {
    if (!confirm("هل أنت متأكد من حذف هذا العميل؟")) return;

    try {
      await deleteCustomer({ customerId });
      toast.success("تم حذف العميل بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingCustomer(null);
    setFormData({
      name: "",
      phone: "",
      region: "",
      goldDebt21: 0,
      cashDebt: 0,
      salesPersonId: "",
    });
  };

  if (!customers || !salespeople) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-blue-600 font-semibold text-sm sm:text-base">جاري التحميل...</div>
      </div>
    );
  }

  // ربط المتأخرات بالعملاء
  const customersWithOverdue = customers.map(customer => {
    const overdue = overdueStatuses?.find(o => o.customerId === customer._id);
    return { ...customer, overdue };
  });

  return (
    <div className="bg-gradient-to-br from-gray-900 to-red-950 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-6 border-2 border-red-900">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-lg sm:rounded-xl flex items-center justify-center border-2 border-red-900">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-bold text-white">إدارة العملاء</h3>
            <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">إضافة وتعديل بيانات العملاء</p>
          </div>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-full hover:from-red-700 hover:to-red-900 transition-all shadow-lg hover:shadow-xl hover:scale-110 flex items-center justify-center border-2 border-red-900"
            title="إضافة عميل"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-red-900">
          <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
            {editingCustomer ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  اسم العميل *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="أدخل اسم العميل"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="01xxxxxxxxx"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  المنطقة *
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="مثال: القاهرة، الجيزة"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  المندوب المسؤول *
                </label>
                <select
                  value={formData.salesPersonId}
                  onChange={(e) => setFormData({ ...formData, salesPersonId: e.target.value as Id<"users"> })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  required
                >
                  <option value="">اختر المندوب</option>
                  {salespeople.map((sp) => (
                    <option key={sp._id} value={sp._id}>
                      {sp.fullName || sp.name || "مندوب"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  مديونية ذهب عيار 21 (جرام)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.goldDebt21}
                  onChange={(e) => setFormData({ ...formData, goldDebt21: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                  مديونية نقدية (جنيه)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.cashDebt}
                  onChange={(e) => setFormData({ ...formData, cashDebt: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border-2 border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <button
                type="submit"
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-lg sm:rounded-xl hover:from-red-700 hover:to-red-900 transition-all shadow-lg hover:shadow-xl border-2 border-red-900"
              >
                {editingCustomer ? "حفظ التعديلات" : "إضافة العميل"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-600 text-white font-bold rounded-lg sm:rounded-xl hover:bg-gray-700 transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border-2 border-red-900">
        <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">
          قائمة العملاء ({customers.length})
        </h4>

        {customers.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-base sm:text-lg font-semibold text-white">لا يوجد عملاء بعد</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">ابدأ بإضافة أول عميل</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
            {customersWithOverdue.map((customer) => {
              const salesPerson = salespeople.find(sp => sp._id === customer.salesPersonId);
              const overdue = customer.overdue;

              return (
                <div
                  key={customer._id}
                  className="backdrop-blur-lg bg-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-5 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white/15"
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg border-2 border-red-900">
                          {customer.name.charAt(0)}
                        </div>
                        <h5 className="text-base sm:text-xl font-bold text-white">{customer.name}</h5>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-1.5 sm:gap-2 mb-1">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {customer.phone}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-1.5 sm:gap-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {customer.region}
                      </p>
                      {salesPerson && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                          💼 {salesPerson.fullName || salesPerson.name}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-2 sm:p-2.5 bg-gradient-to-br from-amber-900 to-yellow-900 text-amber-400 rounded-lg sm:rounded-xl hover:from-amber-800 hover:to-yellow-800 transition-all shadow-sm hover:shadow-md border border-amber-700"
                        title="تعديل"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="p-2 sm:p-2.5 bg-gradient-to-br from-red-900 to-red-950 text-red-400 rounded-lg sm:rounded-xl hover:from-red-800 hover:to-red-900 transition-all shadow-sm hover:shadow-md border border-red-700"
                        title="حذف"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* المديونيات */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border-2 border-amber-200 shadow-sm">
                      <p className="text-xs font-medium text-amber-800 mb-0.5 sm:mb-1">مديونية ذهب</p>
                      <p className="text-base sm:text-xl font-bold text-amber-900">{customer.goldDebt21.toFixed(2)}</p>
                      <p className="text-xs text-amber-700">جرام عيار 21</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border-2 border-green-200 shadow-sm">
                      <p className="text-xs font-medium text-green-800 mb-0.5 sm:mb-1">مديونية نقدية</p>
                      <p className="text-base sm:text-xl font-bold text-green-900">{customer.cashDebt.toFixed(2)}</p>
                      <p className="text-xs text-green-700">جنيه مصري</p>
                    </div>
                  </div>

                  {/* المتأخرات */}
                  {overdue && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border-2 border-purple-200 shadow-sm">
                      <h6 className="text-xs sm:text-sm font-bold text-purple-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        المتأخرات
                      </h6>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {/* ذهب */}
                        <div className="space-y-0.5 sm:space-y-1">
                          <p className="font-semibold text-amber-800 text-xs sm:text-sm">ذهب:</p>
                          {toNumber(overdue.goldOverdue25) > 0 && (
                            <p className="text-green-700 text-xs">🟢 0-25: {toNumber(overdue.goldOverdue25).toFixed(2)} جم</p>
                          )}
                          {toNumber(overdue.goldOverdue40) > 0 && (
                            <p className="text-blue-700 text-xs">🔵 0-40: {toNumber(overdue.goldOverdue40).toFixed(2)} جم</p>
                          )}
                          {toNumber(overdue.goldOverdue60) > 0 && (
                            <p className="text-yellow-700 text-xs">🟡 0-60: {toNumber(overdue.goldOverdue60).toFixed(2)} جم</p>
                          )}
                          {toNumber(overdue.goldOverdue90) > 0 && (
                            <p className="text-orange-700 text-xs">🟠 0-90: {toNumber(overdue.goldOverdue90).toFixed(2)} جم</p>
                          )}
                          {toNumber(overdue.goldOverdue90Plus) > 0 && (
                            <p className="text-red-700 text-xs">🔴 +90: {toNumber(overdue.goldOverdue90Plus).toFixed(2)} جم</p>
                          )}
                        </div>
                        {/* نقدي */}
                        <div className="space-y-0.5 sm:space-y-1">
                          <p className="font-semibold text-green-800 text-xs sm:text-sm">نقدي:</p>
                          {typeof overdue.cashOverdue25 === 'number' && overdue.cashOverdue25 > 0 && (
                            <p className="text-green-700 text-xs">🟢 0-25: {overdue.cashOverdue25.toFixed(2)} ج</p>
                          )}
                          {typeof overdue.cashOverdue40 === 'number' && overdue.cashOverdue40 > 0 && (
                            <p className="text-blue-700 text-xs">🔵 0-40: {overdue.cashOverdue40.toFixed(2)} ج</p>
                          )}
                          {typeof overdue.cashOverdue60 === 'number' && overdue.cashOverdue60 > 0 && (
                            <p className="text-yellow-700 text-xs">🟡 0-60: {overdue.cashOverdue60.toFixed(2)} ج</p>
                          )}
                          {typeof overdue.cashOverdue90 === 'number' && overdue.cashOverdue90 > 0 && (
                            <p className="text-orange-700 text-xs">🟠 0-90: {overdue.cashOverdue90.toFixed(2)} ج</p>
                          )}
                          {overdue.cashOverdue90Plus && typeof overdue.cashOverdue90Plus === 'number' && overdue.cashOverdue90Plus > 0 && (
                            <p className="text-red-700 text-xs">🔴 +90: {overdue.cashOverdue90Plus.toFixed(2)} ج</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
