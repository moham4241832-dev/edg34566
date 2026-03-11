import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { SignInForm } from "./SignInForm";
import { api } from "../convex/_generated/api";
import { Dashboard } from "./components/Dashboard";
import { CustomerManagement } from "./components/CustomerManagement";
import { CollectionTracking } from "./components/CollectionTracking";
import { WeeklyReport } from "./components/WeeklyReport";
import { AdminPanel } from "./components/AdminPanel";
import { ExcelImport } from "./components/ExcelImport";
import { SignOutButton } from "./SignOutButton";
import { NotificationBell } from "./components/NotificationBell";
import { useState } from "react";
import { Toaster } from "sonner";
import { Logo3D } from "./components/Logo3D";
import { SalesManagement } from "./components/SalesManagement";

type Tab = "dashboard" | "customers" | "collections" | "reports" | "admin" | "import" | "sales";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const currentUser = useQuery(api.users.getCurrentUser);

  const isAdmin = currentUser?.role === "admin";

  return (
    <>
      <Toaster position="top-center" richColors />
      <Authenticated>
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
        </div>
      </Authenticated>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </>
  );
}

export default App;
