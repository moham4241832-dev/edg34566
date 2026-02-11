import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

export function AdminSetupHelper() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const makeAdmin = useMutation(api.users.makeFirstAdmin);
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleMakeAdmin = async () => {
    if (!fullName.trim()) {
      toast.error("من فضلك اكتب اسمك الكامل");
      return;
    }

    setIsLoading(true);
    try {
      await makeAdmin({ fullName: fullName.trim() });
      toast.success("🎉 تم! أنت الآن مدير النظام");
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            يجب تسجيل الدخول أولاً
          </h2>
          <p className="text-gray-600">
            سجل دخول أولاً، ثم ارجع لهذه الصفحة لتصبح مدير النظام
          </p>
        </div>
      </div>
    );
  }

  // إذا المستخدم عنده دور بالفعل
  if (currentUser.role) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            أنت مسجل بالفعل!
          </h2>
          <div className="bg-gradient-to-l from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">الاسم:</p>
            <p className="text-lg font-bold text-gray-900 mb-4">
              {currentUser.fullName || "غير محدد"}
            </p>
            <p className="text-sm text-gray-600 mb-2">الدور:</p>
            <p className="text-lg font-bold text-blue-600">
              {currentUser.role === "admin" ? "مدير النظام 👑" : "موظف مبيعات 💼"}
            </p>
          </div>
          <a
            href="/"
            className="block w-full px-6 py-3 bg-gradient-to-l from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all text-center"
          >
            الذهاب للوحة التحكم
          </a>
        </div>
      </div>
    );
  }

  // صفحة تعيين المدير
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">👑</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً بك في نظام إدارة التحصيلات!
          </h1>
          <p className="text-gray-600">
            أنت أول مستخدم - يمكنك أن تصبح مدير النظام الآن
          </p>
        </div>

        {/* معلومات المستخدم الحالي */}
        <div className="bg-gradient-to-l from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">معلوماتك الحالية:</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">البريد الإلكتروني:</span>
              <span className="font-semibold text-gray-900">{currentUser.email || "غير محدد"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">معرف المستخدم:</span>
              <code className="text-xs bg-white px-3 py-1 rounded border border-gray-200 font-mono">
                {currentUser._id}
              </code>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">الحالة:</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                لم يتم تعيين دور بعد
              </span>
            </div>
          </div>
        </div>

        {/* نموذج تعيين المدير */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            اصبح مدير النظام الآن! 🚀
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اكتب اسمك الكامل:
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: أحمد محمد علي"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleMakeAdmin}
              disabled={isLoading || !fullName.trim()}
              className="w-full px-6 py-4 bg-gradient-to-l from-purple-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? "جاري التعيين..." : "✨ اصبح مدير النظام الآن"}
            </button>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span>ℹ️</span>
            <span>ماذا يمكنك فعله كمدير؟</span>
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>إضافة وإدارة جميع العملاء في النظام</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>إضافة موظفين جدد وتعيين أدوارهم</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>عرض تقارير شاملة لكل التحصيلات</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>متابعة أداء موظفي المبيعات</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">✓</span>
              <span>الوصول الكامل لكل مميزات النظام</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
