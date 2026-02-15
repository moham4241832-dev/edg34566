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
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 25%, #FCD34D 50%, #FBBF24 75%, #F59E0B 100%)' }}>
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b-4 border-amber-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Logo3D size="small" />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-l from-amber-600 to-yellow-700 bg-clip-text text-transparent">
                      New Egypt Gold
                    </h1>
                    <p className="text-sm text-gray-600">نظام إدارة التحصيلات</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <NotificationBell />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentUser?.fullName || currentUser?.email}
                    </p>
                    <p className="text-xs text-amber-600 font-medium">
                      {isAdmin ? "👑 مدير النظام" : "💼 موظف مبيعات"}
                    </p>
                  </div>
                  <SignOutButton />
                </div>
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className="bg-white/80 backdrop-blur-lg shadow-md border-b-2 border-amber-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex gap-2 overflow-x-auto py-3">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-l from-amber-500 to-yellow-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  🏠 الرئيسية
                </button>
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === "customers"
                      ? "bg-gradient-to-l from-amber-500 to-yellow-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  👥 العملاء
                </button>
                <button
                  onClick={() => setActiveTab("import")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === "import"
                      ? "bg-gradient-to-l from-amber-500 to-yellow-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  📊 استيراد Excel
                </button>
                <button
                  onClick={() => setActiveTab("collections")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === "collections"
                      ? "bg-gradient-to-l from-amber-500 to-yellow-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  💰 التحصيلات
                </button>
                <button
                  onClick={() => setActiveTab("reports")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === "reports"
                      ? "bg-gradient-to-l from-amber-500 to-yellow-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  📈 التقارير
                </button>
                <button
                  onClick={() => setActiveTab("sales")}
                  className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === "sales"
                      ? "bg-gradient-to-l from-amber-500 to-yellow-600 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  📊 المبيعات
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                      activeTab === "admin"
                        ? "bg-gradient-to-l from-purple-500 to-indigo-600 text-white shadow-lg transform scale-105"
                        : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    }`}
                  >
                    👑 لوحة الإدارة
                  </button>
                )}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "customers" && <CustomerManagement />}
            {activeTab === "import" && <ExcelImport />}
            {activeTab === "collections" && <CollectionTracking />}
            {activeTab === "reports" && <WeeklyReport />}
            {activeTab === "sales" && <SalesManagement />}
            {activeTab === "admin" && isAdmin && <AdminPanel />}
          </main>

          {/* Footer */}
          <footer className="bg-white/80 backdrop-blur-lg border-t-2 border-amber-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <p className="text-center text-gray-600 text-sm">
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
