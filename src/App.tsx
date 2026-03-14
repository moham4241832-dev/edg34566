import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { SignInForm } from "./SignInForm";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { CustomerManagement } from "./components/CustomerManagement";
import { CollectionTracking } from "./components/CollectionTracking";
import { WeeklyReport } from "./components/WeeklyReport";
import { AdminPanel } from "./components/AdminPanel";
import { ExcelImport } from "./components/ExcelImport";
import { SignOutButton } from "./SignOutButton";
import { NotificationBell } from "./components/NotificationBell";
import { Toaster } from "sonner";
import { Logo3D } from "./components/Logo3D";
import { SalesManagement } from "./components/SalesManagement";
import { ChangePasswordModal } from "./components/ChangePasswordModal";

type Tab = "dashboard" | "customers" | "collections" | "reports" | "admin" | "import" | "sales";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const currentUser = useQuery(api.users.getCurrentUser);
  const recordLogin = useMutation(api.security.recordLogin);

  const isAdmin = currentUser?.role === "admin";
  const needsApproval = currentUser && !currentUser.isApproved && currentUser.role !== "admin";

  // تسجيل الدخول عند تحميل التطبيق
  useEffect(() => {
    if (currentUser && currentUser.isApproved) {
      const deviceInfo = `${navigator.userAgent.substring(0, 100)}`;
      recordLogin({ deviceInfo }).catch(() => {
        // تجاهل الأخطاء في تسجيل الدخول
      });
    }
  }, [currentUser?.isApproved]);

  return (
    <>
      <Toaster position="top-center" richColors />
      <Authenticated>
        {needsApproval ? (
          // شاشة انتظار الموافقة
          <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-gray-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-red-900 p-8 sm:p-12">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  ⏳ في انتظار الموافقة
                </h1>
                
                <p className="text-lg text-gray-300 mb-6">
                  تم إنشاء حسابك بنجاح! 🎉
                </p>
                
                <div className="bg-gradient-to-br from-red-950 to-black rounded-2xl p-6 border-2 border-red-900 mb-6">
                  <p className="text-gray-200 text-base leading-relaxed">
                    حسابك الآن في انتظار موافقة المدير للسماح لك بالدخول إلى النظام.
                    <br />
                    سيتم إشعارك فور الموافقة على حسابك.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 text-amber-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">يرجى الانتظار...</span>
                  </div>
                  
                  <SignOutButton />
                </div>
                
                <p className="text-xs text-gray-500 mt-8">
                  إذا كنت بحاجة إلى مساعدة، يرجى التواصل مع المدير
                </p>
              </div>
            </div>
          </div>
        ) : (
          // التطبيق الكامل للمستخدمين الموافق عليهم
          <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-red-950">
            {/* Header */}
            <header className="bg-gray-900/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b-4 border-red-900">
              <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Logo3D size="small" />
                    <div>
                      <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-l from-red-500 to-red-700 bg-clip-text text-transparent">
                        New Egypt Gold
                      </h1>
                      <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">نظام إدارة التحصيلات</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <NotificationBell />
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-3 py-2 bg-gray-800 hover:bg-red-900 text-white rounded-lg transition-all border border-red-900"
                      title="تغيير كلمة المرور"
                    >
                      🔑
                    </button>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-semibold text-white">
                        {currentUser?.fullName || currentUser?.email}
                      </p>
                      <p className="text-xs text-red-400 font-medium">
                        {isAdmin ? "👑 مدير النظام" : "💼 موظف مبيعات"}
                      </p>
                    </div>
                    <SignOutButton />
                  </div>
                </div>
              </div>
            </header>

            {/* Navigation Tabs */}
            <nav className="bg-gray-900/80 backdrop-blur-lg shadow-md border-b-2 border-red-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex gap-1 sm:gap-2 overflow-x-auto py-2 sm:py-3 scrollbar-hide">
                  <button
                    onClick={() => setActiveTab("dashboard")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all whitespace-nowrap ${
                      activeTab === "dashboard"
                        ? "bg-gradient-to-l from-red-600 to-red-800 text-white shadow-lg transform scale-105"
                        : "bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-white border border-red-900"
                    }`}
                  >
                    🏠 الرئيسية
                  </button>
                  <button
                    onClick={() => setActiveTab("customers")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all whitespace-nowrap ${
                      activeTab === "customers"
                        ? "bg-gradient-to-l from-red-600 to-red-800 text-white shadow-lg transform scale-105"
                        : "bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-white border border-red-900"
                    }`}
                  >
                    👥 العملاء
                  </button>
                  <button
                    onClick={() => setActiveTab("import")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all whitespace-nowrap ${
                      activeTab === "import"
                        ? "bg-gradient-to-l from-red-600 to-red-800 text-white shadow-lg transform scale-105"
                        : "bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-white border border-red-900"
                    }`}
                  >
                    📊 استيراد Excel
                  </button>
                  <button
                    onClick={() => setActiveTab("collections")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all whitespace-nowrap ${
                      activeTab === "collections"
                        ? "bg-gradient-to-l from-red-600 to-red-800 text-white shadow-lg transform scale-105"
                        : "bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-white border border-red-900"
                    }`}
                  >
                    💰 التحصيلات
                  </button>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all whitespace-nowrap ${
                      activeTab === "reports"
                        ? "bg-gradient-to-l from-red-600 to-red-800 text-white shadow-lg transform scale-105"
                        : "bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-white border border-red-900"
                    }`}
                  >
                    📈 التقارير
                  </button>
                  <button
                    onClick={() => setActiveTab("sales")}
                    className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all whitespace-nowrap ${
                      activeTab === "sales"
                        ? "bg-gradient-to-l from-red-600 to-red-800 text-white shadow-lg transform scale-105"
                        : "bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-white border border-red-900"
                    }`}
                  >
                    📊 المبيعات
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab("admin")}
                      className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-base font-bold transition-all whitespace-nowrap ${
                        activeTab === "admin"
                          ? "bg-gradient-to-l from-red-700 to-red-900 text-white shadow-lg transform scale-105"
                          : "bg-gray-800 text-gray-300 hover:bg-red-900/50 hover:text-white border border-red-900"
                      }`}
                    >
                      👑 لوحة الإدارة
                    </button>
                  )}
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "customers" && <CustomerManagement />}
              {activeTab === "import" && <ExcelImport />}
              {activeTab === "collections" && <CollectionTracking />}
              {activeTab === "reports" && <WeeklyReport />}
              {activeTab === "sales" && <SalesManagement />}
              {activeTab === "admin" && isAdmin && <AdminPanel />}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900/80 backdrop-blur-lg border-t-2 border-red-900 mt-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <p className="text-center text-gray-400 text-sm">
                  © 2024 New Egypt Gold - جميع الحقوق محفوظة
                </p>
              </div>
            </footer>

            {/* Modal تغيير كلمة المرور */}
            {showPasswordModal && (
              <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
            )}
          </div>
        )}
      </Authenticated>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}

export default App;
