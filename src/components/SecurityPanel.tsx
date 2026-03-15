import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function SecurityPanel() {
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetReason, setResetReason] = useState("");

  const loginStats = useQuery(api.security.getLoginStats);
  const recentLogins = useQuery(api.security.getAllRecentLogins, { limit: 50 });
  const allUsers = useQuery(api.users.listAllUsers);
  const passwordHistory = useQuery(api.security.getPasswordChangeHistory);

  const resetPassword = useMutation(api.security.resetUserPassword);

  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword) {
      toast.error("يرجى اختيار مستخدم وإدخال كلمة مرور جديدة");
      return;
    }

    try {
      await resetPassword({
        userId: selectedUserId,
        newPassword,
        reason: resetReason || undefined,
      });
      toast.success("تم إعادة تعيين كلمة المرور بنجاح ✅");
      setShowPasswordModal(false);
      setNewPassword("");
      setResetReason("");
      setSelectedUserId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* عنوان القسم */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
          <span className="text-xl">🛡️</span>
        </div>
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-white">لوحة الأمان</h2>
          <p className="text-xs sm:text-sm text-gray-400">مراقبة الدخول وإدارة كلمات المرور</p>
        </div>
      </div>

      {/* إحصائيات الأمان */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-4 sm:p-6 border-2 border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs sm:text-sm font-medium">إجمالي الدخول</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">
                {loginStats?.totalLogins ?? 0}
              </p>
            </div>
            <span className="text-2xl sm:text-3xl">🔐</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-4 sm:p-6 border-2 border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-xs sm:text-sm font-medium">دخول اليوم</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">
                {loginStats?.loginsToday ?? 0}
              </p>
            </div>
            <span className="text-2xl sm:text-3xl">📅</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-4 sm:p-6 border-2 border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-xs sm:text-sm font-medium">نشطين اليوم</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">
                {loginStats?.activeUsersToday ?? 0}
              </p>
            </div>
            <span className="text-2xl sm:text-3xl">👥</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-xl p-4 sm:p-6 border-2 border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-xs sm:text-sm font-medium">دخول الأسبوع</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1 sm:mt-2">
                {loginStats?.loginsThisWeek ?? 0}
              </p>
            </div>
            <span className="text-2xl sm:text-3xl">📊</span>
          </div>
        </div>
      </div>

      {/* إدارة كلمات المرور */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-red-900">
        <h3 className="text-base sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔑</span>
          إعادة تعيين كلمة مرور موظف
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              اختر الموظف
            </label>
            <select
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(e.target.value as Id<"users"> || null)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm bg-gray-700 border-2 border-gray-600 rounded-lg text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">-- اختر موظف --</option>
              {allUsers?.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullName} ({user.role === "admin" ? "مدير" : "موظف"})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowPasswordModal(true)}
              disabled={!selectedUserId}
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-l from-red-600 to-red-800 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-900"
            >
              🔑 إعادة تعيين كلمة المرور
            </button>
          </div>
        </div>
      </div>

      {/* آخر عمليات الدخول */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-red-900">
        <h3 className="text-base sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📋</span>
          آخر عمليات الدخول
        </h3>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {recentLogins?.slice(0, 20).map((login) => (
            <div
              key={login._id}
              className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 border border-gray-600"
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-red-900 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {login.userName?.charAt(0) || "?"}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{login.userName}</p>
                  <p className="text-gray-400 text-xs">{formatDate(login.loginTime)}</p>
                </div>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-bold flex-shrink-0 ml-2 ${
                  login.userRole === "admin"
                    ? "bg-red-900 text-red-200"
                    : "bg-blue-900 text-blue-200"
                }`}
              >
                {login.userRole === "admin" ? "👑 مدير" : "💼 موظف"}
              </span>
            </div>
          ))}

          {(!recentLogins || recentLogins.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📭</p>
              <p className="text-sm">لا يوجد سجل دخول بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* سجل تغييرات كلمات المرور */}
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-red-900">
        <h3 className="text-base sm:text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔐</span>
          سجل تغييرات كلمات المرور
        </h3>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {passwordHistory?.slice(0, 15).map((change) => (
            <div
              key={change._id}
              className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 border border-gray-600"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{change.userName}</p>
                <p className="text-gray-400 text-xs">
                  بواسطة: {change.changedByName} • {formatDate(change.changedAt)}
                </p>
                {change.reason && (
                  <p className="text-gray-500 text-xs mt-0.5">{change.reason}</p>
                )}
              </div>
            </div>
          ))}

          {(!passwordHistory || passwordHistory.length === 0) && (
            <div className="text-center py-6 text-gray-400">
              <p className="text-3xl mb-2">🔒</p>
              <p className="text-sm">لا يوجد سجل تغييرات بعد</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal إعادة تعيين كلمة المرور */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 max-w-md w-full border-2 border-red-900">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🔑</span>
              إعادة تعيين كلمة المرور
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none text-base"
                  placeholder="6 أحرف على الأقل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  السبب (اختياري)
                </label>
                <input
                  type="text"
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none text-base"
                  placeholder="مثال: نسيان كلمة المرور"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleResetPassword}
                  className="flex-1 px-6 py-3 bg-gradient-to-l from-red-600 to-red-800 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-900 transition-all"
                >
                  تأكيد
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword("");
                    setResetReason("");
                  }}
                  className="flex-1 px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
