import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

export function PendingUsersPanel() {
  const pendingUsers = useQuery(api.users.listPendingUsers);
  const assignRole = useMutation(api.users.assignRole);
  const rejectUser = useMutation(api.users.rejectUser);
  const [selectedUser, setSelectedUser] = useState<Id<"users"> | null>(null);
  const [selectedRole, setSelectedRole] = useState<"admin" | "salesperson">("salesperson");
  const [viewAllCustomers, setViewAllCustomers] = useState(false);

  const handleApprove = async (userId: Id<"users">, fullName: string) => {
    try {
      await assignRole({ 
        userId, 
        role: selectedRole,
        fullName,
        viewAllCustomers: selectedRole === "salesperson" ? viewAllCustomers : undefined
      });
      toast.success(`تمت الموافقة وتعيين ${selectedRole === "admin" ? "مدير" : "موظف مبيعات"} بنجاح! ✅`);
      setSelectedUser(null);
      setSelectedRole("salesperson");
      setViewAllCustomers(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleReject = async (userId: Id<"users">) => {
    if (!confirm("هل أنت متأكد من رفض هذا المستخدم؟ سيتم حذف حسابه نهائياً.")) {
      return;
    }

    try {
      await rejectUser({ userId });
      toast.success("تم رفض المستخدم وحذف حسابه");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  if (!pendingUsers) {
    return (
      <div className="text-center py-8">
        <div className="animate-pulse text-red-600 font-semibold">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-700 to-amber-800 p-6 sm:p-8 border-b-2 border-amber-900">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
              ⏳ المستخدمون المعلقون
            </h3>
            <p className="text-amber-100 text-sm">
              في انتظار الموافقة ({pendingUsers.length})
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8">
        {pendingUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-white">لا يوجد مستخدمون معلقون</p>
            <p className="text-sm text-gray-400 mt-2">جميع المستخدمين تمت الموافقة عليهم</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 border-2 border-amber-900 hover:border-amber-700 transition-all shadow-lg"
              >
                <div className="flex flex-col gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">
                      {user.fullName}
                    </h4>
                    <p className="text-sm text-gray-300 mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                      {user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      تاريخ التسجيل: {new Date(user._creationTime).toLocaleDateString("ar-EG")}
                    </p>
                  </div>

                  {/* Role Selection */}
                  {selectedUser === user._id ? (
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-amber-700">
                      <h5 className="text-white font-bold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        اختر الدور للمستخدم
                      </h5>
                      
                      {/* Role Options */}
                      <div className="space-y-3 mb-4">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="role"
                            value="salesperson"
                            checked={selectedRole === "salesperson"}
                            onChange={(e) => setSelectedRole(e.target.value as "salesperson")}
                            className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1">
                            <span className="text-white font-semibold group-hover:text-amber-400 transition-colors">
                              👤 موظف مبيعات
                            </span>
                            <p className="text-xs text-gray-400">يمكنه إدارة العملاء والمبيعات</p>
                          </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="role"
                            value="admin"
                            checked={selectedRole === "admin"}
                            onChange={(e) => setSelectedRole(e.target.value as "admin")}
                            className="w-5 h-5 text-amber-600 focus:ring-amber-500"
                          />
                          <div className="flex-1">
                            <span className="text-white font-semibold group-hover:text-amber-400 transition-colors">
                              👑 مدير النظام
                            </span>
                            <p className="text-xs text-gray-400">صلاحيات كاملة على النظام</p>
                          </div>
                        </label>
                      </div>

                      {/* View All Customers Option (for salesperson only) */}
                      {selectedRole === "salesperson" && (
                        <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={viewAllCustomers}
                              onChange={(e) => setViewAllCustomers(e.target.checked)}
                              className="w-5 h-5 mt-0.5 text-blue-600 focus:ring-blue-500 rounded"
                            />
                            <div>
                              <span className="text-white font-semibold block">
                                👁️ رؤية جميع العملاء
                              </span>
                              <p className="text-xs text-gray-400 mt-1">
                                السماح بعرض عملاء جميع الموظفين (وليس فقط عملائه)
                              </p>
                            </div>
                          </label>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(user._id, user.fullName)}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          تأكيد الموافقة
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(null);
                            setSelectedRole("salesperson");
                            setViewAllCustomers(false);
                          }}
                          className="px-4 py-2.5 bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-600 transition-all"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedUser(user._id)}
                        className="flex-1 px-4 py-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        موافقة
                      </button>
                      <button
                        onClick={() => handleReject(user._id)}
                        className="px-4 py-2 bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold rounded-xl hover:from-red-600 hover:to-rose-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="hidden sm:inline">رفض</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
