import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

export function UserManagement() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const allUsers = useQuery(api.users.listAllUsers);
  const assignRole = useMutation(api.users.assignRole);
  const deleteUser = useMutation(api.users.deleteUser);

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"admin" | "salesperson">("salesperson");
  const [fullName, setFullName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await assignRole({
        userId: userId as any,
        role,
        fullName,
      });
      toast.success("تم تعيين الدور بنجاح");
      setUserId("");
      setFullName("");
      setRole("salesperson");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const handleDelete = async (userId: Id<"users">) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    try {
      await deleteUser({ userId });
      toast.success("تم حذف المستخدم بنجاح");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    }
  };

  const getRoleBadge = (role?: string) => {
    if (role === "admin") {
      return (
        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
          مدير النظام
        </span>
      );
    } else if (role === "salesperson") {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
          موظف مبيعات
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
          لم يتم التعيين
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">إدارة المستخدمين</h3>
        <p className="text-gray-600 mb-6">
          لتعيين دور لمستخدم جديد، يجب أن يقوم المستخدم بتسجيل الدخول أولاً، ثم يمكنك الحصول على معرف المستخدم (User ID) من القائمة أدناه.
        </p>
      </div>

      {/* قائمة المستخدمين */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-l from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-bold text-gray-900">قائمة المستخدمين</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">الاسم</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">الدور</th>
                <th className="px-6 py-3 text-start text-xs font-semibold text-gray-700 uppercase">معرف المستخدم</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {!allUsers ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    جاري التحميل...
                  </td>
                </tr>
              ) : allUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    لا يوجد مستخدمين بعد
                  </td>
                </tr>
              ) : (
                allUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {user.fullName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {user._id}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {currentUser?._id !== user._id && (
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                        >
                          🗑️ حذف
                        </button>
                      )}
                      {currentUser?._id === user._id && (
                        <span className="text-xs text-gray-400">(أنت)</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <h4 className="text-lg font-bold text-gray-900 mb-4">تعيين دور لمستخدم</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              معرف المستخدم (User ID)
            </label>
            <input
              type="text"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="انسخ المعرف من الجدول أعلاه"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              انسخ معرف المستخدم من الجدول أعلاه
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الاسم الكامل</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="أحمد محمد"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الدور</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "salesperson")}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
            >
              <option value="salesperson">موظف مبيعات</option>
              <option value="admin">مدير النظام</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-l from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
          >
            تعيين الدور
          </button>
        </form>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200">
        <h4 className="text-lg font-bold text-gray-900 mb-3">معلومات مهمة</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>يجب على المستخدم تسجيل الدخول مرة واحدة على الأقل قبل تعيين دور له</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>موظف المبيعات يمكنه رؤية عملائه فقط وإضافة تحصيلات لهم</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span>المدير يمكنه رؤية كل العملاء وإدارة المستخدمين والتقارير</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-red-700 font-semibold">حذف المستخدم نهائي ولا يمكن التراجع عنه</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
