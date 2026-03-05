import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { CreditLimitDisplay } from "./CreditLimitDisplay";
import { OverdueStatusModal } from "./OverdueStatusModal";

// أيقونة مخصصة للعملاء
const CustomerIcon = () => (
  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

export function CustomerManagement() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Id<"customers"> | null>(null);
  const [selectedOverdueCustomerId, setSelectedOverdueCustomerId] = useState<Id<"customers"> | null>(null);
  const [selectedOverdueCustomerName, setSelectedOverdueCustomerName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    region: "",
    goldDebt21: 0,
    cashDebt: 0,
    creditLimit: 0,
    salesPersonId: "" as Id<"users"> | "",
  });

  const customers = useQuery(api.customers.listAllCustomers);
  const salespeople = useQuery(api.users.listSalespeople);
  const overdueStatuses = useQuery(api.overdue.getAllOverdueStatuses);
  const addCustomer = useMutation(api.customers.addCustomer);
  const updateCustomer = useMutation(api.customers.updateCustomer);
  const deleteCustomer = useMutation(api.customers.deleteCustomer);
  const deleteAllCustomers = useMutation(api.customers.deleteAllCustomers);

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
          creditLimit: formData.creditLimit,
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
          creditLimit: formData.creditLimit,
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
        creditLimit: 0,
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
      creditLimit: customer.creditLimit || 0,
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
      creditLimit: 0,
      salesPersonId: "",
    });
  };

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ تحذير: هل أنت متأكد من حذف جميع العملاء?\n\nسيتم حذف:\n- جميع العملاء\n- جميع التحصيلات المرتبطة بهم\n\nهذا الإجراء لا يمكن التراجع عنه!")) {
      return;
    }

    try {
      const result = await deleteAllCustomers({});
      toast.success(`تم حذف ${result.deletedCustomers} عميل و ${result.deletedCollections} تحصيل بنجاح! 🗑️`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  // دالة مساعدة لتحويل القيمة إلى رقم
  const toNumber = (value: number | boolean | undefined): number => {
    if (typeof value === 'number') return value;
    return 0;
  };

  if (!customers || !salespeople) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-blue-600 font-semibold">جاري التحميل...</div>
      </div>
    );
  }

  // استخراج قائمة المناطق الفريدة
  const uniqueRegions = Array.from(new Set(customers.map(c => c.region))).sort();

  // تصفية العملاء حسب البحث والمنطقة
  const filteredCustomers = customers.filter(customer => {
    // فلتر البحث
    const matchesSearch = !searchQuery || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    // فلتر المنطقة
    const matchesRegion = selectedRegion === "all" || customer.region === selectedRegion;
    
    return matchesSearch && matchesRegion;
  });

  return (
    <>
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <CustomerIcon />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">إدارة العملاء</h3>
                <p className="text-blue-100 text-sm">إضافة وتعديل بيانات العملاء</p>
              </div>
            </div>

            {!isAdding && (
            <div className="flex gap-3">
              <button
                onClick={() => setIsAdding(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة عميل جديد
            </button>
              
              <button
                onClick={handleDeleteAll}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                مسح الكل
              </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {isAdding && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border-2 border-blue-200 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900">
                {editingCustomer ? "✏️ تعديل بيانات العميل" : "➕ إضافة عميل جديد"}
              </h4>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم العميل *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="01xxxxxxxxx"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المنطقة *
                  </label>
                  <input
                    type="text"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="مثال: القاهرة، الجيزة، الإسكندرية"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المندوب المسؤول *
                  </label>
                  <select
                    value={formData.salesPersonId}
                    onChange={(e) => setFormData({ ...formData, salesPersonId: e.target.value as Id<"users"> })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مديونية ذهب عيار 21 (جرام)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.goldDebt21}
                    onChange={(e) => setFormData({ ...formData, goldDebt21: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مديونية نقدية (جنيه)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cashDebt}
                    onChange={(e) => setFormData({ ...formData, cashDebt: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الائتماني (جرام) 💳
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">الحد الأقصى للمديونية الذهبية المسموح بها</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {editingCustomer ? "حفظ التعديلات" : "إضافة العميل"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
                >
                  إلغاء
                </button>
              </div>
              </form>
            </div>
          )}

        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">📋 قائمة العملاء</h4>
              <p className="text-sm text-gray-600">
                <span className="font-bold text-blue-600">{filteredCustomers.length}</span> من {customers.length} عميل
              </p>
            </div>
          </div>

          {/* شريط البحث والفلاتر */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 ابحث بالاسم أو الهاتف..."
              className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-500 text-start"
            />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-purple-200 focus:border-purple-500 text-start bg-white"
            >
              <option value="all">📍 جميع المناطق</option>
              {uniqueRegions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-semibold text-gray-900">لا يوجد عملاء بعد</p>
              <p className="text-sm text-gray-600 mt-1">ابدأ بإضافة أول عميل</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredCustomers.map((customer) => {
                const salesPerson = salespeople.find(sp => sp._id === customer.salesPersonId);
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

                // حساب إجمالي المتأخرات
                const totalGoldOverdue = overdueStatus ? 
                  toNumber(overdueStatus.goldOverdue25) + 
                  toNumber(overdueStatus.goldOverdue40) + 
                  toNumber(overdueStatus.goldOverdue60) + 
                  toNumber(overdueStatus.goldOverdue90) + 
                  toNumber(overdueStatus.goldOverdue90Plus) : 0;

                const totalCashOverdue = overdueStatus ? 
                  toNumber(overdueStatus.cashOverdue25) + 
                  toNumber(overdueStatus.cashOverdue40) + 
                  toNumber(overdueStatus.cashOverdue60) + 
                  toNumber(overdueStatus.cashOverdue90) + 
                  toNumber(overdueStatus.cashOverdue90Plus) : 0;

                return (
                  <div
                    key={customer._id}
                    className="bg-white rounded-2xl p-5 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="text-lg font-bold text-gray-900 mb-1">{customer.name}</h5>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {customer.phone}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {customer.region}
                        </p>
                        {salesPerson && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            💼 {salesPerson.fullName || salesPerson.name}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                          title="تعديل"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
                          className="p-2.5 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                          title="حذف"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* المديونيات */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">💰</span>
                          <p className="text-xs font-bold text-white">مديونية ذهب</p>
                        </div>
                        <p className="text-2xl font-black text-white mb-1">{customer.goldDebt21.toFixed(2)}</p>
                        <p className="text-xs text-amber-100 font-medium">جرام عيار 21</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">💵</span>
                          <p className="text-xs font-bold text-white">مديونية نقدية</p>
                        </div>
                        <p className="text-2xl font-black text-white mb-1">{customer.cashDebt.toFixed(2)}</p>
                        <p className="text-xs text-emerald-100 font-medium">جنيه مصري</p>
                      </div>
                    </div>

                    {/* الحد الائتماني */}
                    {creditLimit > 0 && (
                      <div className="mb-3">
                        <CreditLimitDisplay
                          creditLimit={creditLimit}
                          goldDebt={goldDebt}
                          isOverLimit={isOverLimit}
                          isNearLimit={isNearLimit}
                          creditUsagePercent={creditUsagePercent}
                        />
                      </div>
                    )}

                    {/* المتأخرات مع الأرقام وأيام التأخير */}
                    {hasOverdue && (
                      <button
                        onClick={() => {
                          setSelectedOverdueCustomerId(customer._id);
                          setSelectedOverdueCustomerName(customer.name);
                        }}
                        className="w-full bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-300 rounded-lg p-3 hover:shadow-lg transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-bold text-rose-900">⏰ المتأخرات</span>
                          </div>
                          <span className="text-xs bg-rose-200 text-rose-800 px-2 py-1 rounded-full font-bold">
                            اضغط للتفاصيل
                          </span>
                        </div>
                        
                        {/* إجمالي المتأخرات */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {totalGoldOverdue > 0 && (
                            <div className="bg-amber-100 rounded-lg p-2 border border-amber-300">
                              <p className="text-xs font-medium text-amber-700 mb-1">💰 ذهب</p>
                              <p className="text-xl font-bold text-amber-900">
                                {totalGoldOverdue.toFixed(2)}
                              </p>
                              <p className="text-xs text-amber-700">جرام</p>
                            </div>
                          )}
                          
                          {totalCashOverdue > 0 && (
                            <div className="bg-green-100 rounded-lg p-2 border border-green-300">
                              <p className="text-xs font-medium text-green-700 mb-1">💵 نقدي</p>
                              <p className="text-xl font-bold text-green-900">
                                {totalCashOverdue.toFixed(2)}
                              </p>
                              <p className="text-xs text-green-700">جنيه</p>
                            </div>
                          )}
                        </div>

                        {/* تفاصيل أيام التأخير */}
                        <div className="space-y-1 text-xs">
                          {overdueStatus && (
                            <>
                              {(toNumber(overdueStatus.goldOverdue25) > 0 || toNumber(overdueStatus.cashOverdue25) > 0) && (
                                <div className="flex items-center justify-between bg-yellow-50 px-2 py-1 rounded border border-yellow-200">
                                  <span className="font-medium text-yellow-800">📅 25-39 يوم</span>
                                  <div className="flex gap-2">
                                    {toNumber(overdueStatus.goldOverdue25) > 0 && (
                                      <span className="text-amber-700 font-bold">{toNumber(overdueStatus.goldOverdue25).toFixed(1)}ج</span>
                                    )}
                                    {toNumber(overdueStatus.cashOverdue25) > 0 && (
                                      <span className="text-green-700 font-bold">{toNumber(overdueStatus.cashOverdue25).toFixed(0)}£</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {(toNumber(overdueStatus.goldOverdue40) > 0 || toNumber(overdueStatus.cashOverdue40) > 0) && (
                                <div className="flex items-center justify-between bg-orange-50 px-2 py-1 rounded border border-orange-200">
                                  <span className="font-medium text-orange-800">📅 40-59 يوم</span>
                                  <div className="flex gap-2">
                                    {toNumber(overdueStatus.goldOverdue40) > 0 && (
                                      <span className="text-amber-700 font-bold">{toNumber(overdueStatus.goldOverdue40).toFixed(1)}ج</span>
                                    )}
                                    {toNumber(overdueStatus.cashOverdue40) > 0 && (
                                      <span className="text-green-700 font-bold">{toNumber(overdueStatus.cashOverdue40).toFixed(0)}£</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {(toNumber(overdueStatus.goldOverdue60) > 0 || toNumber(overdueStatus.cashOverdue60) > 0) && (
                                <div className="flex items-center justify-between bg-red-50 px-2 py-1 rounded border border-red-200">
                                  <span className="font-medium text-red-800">📅 60-89 يوم</span>
                                  <div className="flex gap-2">
                                    {toNumber(overdueStatus.goldOverdue60) > 0 && (
                                      <span className="text-amber-700 font-bold">{toNumber(overdueStatus.goldOverdue60).toFixed(1)}ج</span>
                                    )}
                                    {toNumber(overdueStatus.cashOverdue60) > 0 && (
                                      <span className="text-green-700 font-bold">{toNumber(overdueStatus.cashOverdue60).toFixed(0)}£</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {(toNumber(overdueStatus.goldOverdue90) > 0 || toNumber(overdueStatus.cashOverdue90) > 0) && (
                                <div className="flex items-center justify-between bg-rose-50 px-2 py-1 rounded border border-rose-200">
                                  <span className="font-medium text-rose-800">📅 90 يوم</span>
                                  <div className="flex gap-2">
                                    {toNumber(overdueStatus.goldOverdue90) > 0 && (
                                      <span className="text-amber-700 font-bold">{toNumber(overdueStatus.goldOverdue90).toFixed(1)}ج</span>
                                    )}
                                    {toNumber(overdueStatus.cashOverdue90) > 0 && (
                                      <span className="text-green-700 font-bold">{toNumber(overdueStatus.cashOverdue90).toFixed(0)}£</span>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {(toNumber(overdueStatus.goldOverdue90Plus) > 0 || toNumber(overdueStatus.cashOverdue90Plus) > 0) && (
                                <div className="flex items-center justify-between bg-rose-100 px-2 py-1 rounded border border-rose-300">
                                  <span className="font-medium text-rose-900">⚠️ +90 يوم</span>
                                  <div className="flex gap-2">
                                    {toNumber(overdueStatus.goldOverdue90Plus) > 0 && (
                                      <span className="text-amber-800 font-bold">{toNumber(overdueStatus.goldOverdue90Plus).toFixed(1)}ج</span>
                                    )}
                                    {toNumber(overdueStatus.cashOverdue90Plus) > 0 && (
                                      <span className="text-green-800 font-bold">{toNumber(overdueStatus.cashOverdue90Plus).toFixed(0)}£</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>
      </div>

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
