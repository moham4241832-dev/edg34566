import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";

export function SecurityPanel() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetReason, setResetReason] = useState("");

  const loginStats = useQuery(api.security.getLoginStats);
  const recentLogins = useQuery(api.security.getAllRecentLogins, { limit: 50 });
  const allUsers = useQuery(api.users.listAllUsers);
  const userLoginHistory = useQuery(
    api.security.getUserLoginHistory,
    selectedUserId ? { userId: selectedUserId as any, limit: 20 } : "skip"
  );
  const passwordHistory = useQuery(api.security.getPasswordChangeHistory, {});

  const resetPassword = useMutation(api.security.resetUserPassword);

  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword) {
      toast.error("يرجى اختيار مستخدم وإدخال كلمة مرور جديدة");
      return;
    }

    try {
      await resetPassword({
        userId: selectedUserId as any,
        newPassword,
        reason: resetReason || undefined,
      });
      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* إحصائيات الأمان */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 border-2 border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">إجمالي عمليات الدخول</p>
              <p className="text-3xl font-bold text-white mt-2">
                {loginStats?.totalLogins || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔐</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-xl p-6 border-2 border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium">دخول اليوم</p>
              <p className="text-3xl font-bold text-white mt-2">
                {loginStats?.loginsToday || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-xl p-6 border-2 border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">مستخدمين نشطين اليوم</p>
              <p className="text-3xl font-bold text-white mt-2">
                {loginStats?.activeUsersToday || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-900 to-orange-800 rounded-xl p-6 border-2 border-orange-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-200 text-sm font-medium">دخول هذا الأسبوع</p>
              <p className="text-3xl font-bold text-white mt-2">
                {loginStats?.loginsThisWeek || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* إدارة كلمات المرور */}
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl p-6 border-2 border-red-900">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔑</span>
          إدارة كلمات المرور
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اختر المستخدم
            </label>
            <select
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
            >
              <option value="">-- اختر مستخدم --</option>
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
              className="w-full px-6 py-3 bg-gradient-to-l from-red-600 to-red-800 text-white font-bold rounded-lg hover:from-red-700 hover:to-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إعادة تعيين كلمة المرور
            </button>
          </div>
        </div>
      </div>

      {/* آخر عمليات الدخول */}
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl p-6 border-2 border-red-900">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>📋</span>
          آخر عمليات الدخول
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 border-b-2 border-red-900">
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">المستخدم</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">الدور</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">التاريخ والوقت</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">الجهاز</th>
              </tr>
            </thead>
            <tbody>
              {recentLogins?.slice(0, 20).map((login) => (
                <tr key={login._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white font-medium">{login.userName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        login.userRole === "admin"
                          ? "bg-red-900 text-red-200"
                          : "bg-blue-900 text-blue-200"
                      }`}
                    >
                      {login.userRole === "admin" ? "👑 مدير" : "💼 موظف"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{formatDate(login.loginTime)}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {login.deviceInfo || "غير محدد"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* سجل تغييرات كلمات المرور */}
      <div className="bg-gray-900/90 backdrop-blur-lg rounded-2xl p-6 border-2 border-red-900">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span>🔐</span>
          سجل تغييرات كلمات المرور
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 border-b-2 border-red-900">
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">المستخدم</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">تم التغيير بواسطة</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">التاريخ</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">السبب</th>
              </tr>
            </thead>
            <tbody>
              {passwordHistory?.slice(0, 15).map((change) => (
                <tr key={change._id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-white font-medium">{change.userName}</td>
                  <td className="px-4 py-3 text-gray-300">{change.changedByName}</td>
                  <td className="px-4 py-3 text-gray-300">{formatDate(change.changedAt)}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{change.reason || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal لإعادة تعيين كلمة المرور */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border-2 border-red-900">
            <h3 className="text-2xl font-bold text-white mb-6">إعادة تعيين كلمة المرور</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
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
                  className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
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
