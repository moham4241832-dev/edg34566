import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CustomerManagement } from "./CustomerManagement";
import { CustomerCard } from "./CustomerCard";
import { CollectionTracking } from "./CollectionTracking";
import { AdminPanel } from "./AdminPanel";
import { SignOutButton } from "../SignOutButton";
import { Logo3D } from "./Logo3D";

export function Dashboard() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const [activeTab, setActiveTab] = useState<"customers" | "collections" | "admin">("customers");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-red-950">
      {/* الهيدر - محسن للموبايل */}
      <header className="bg-gray-900/90 backdrop-blur-lg border-b-4 border-red-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* اللوجو والعنوان */}
            <div className="flex items-center gap-2 md:gap-4">
              <Logo3D size="small" />
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-l from-red-500 to-red-700 bg-clip-text text-transparent">
                  نظام إدارة التحصيلات
                </h1>
                <p className="text-xs md:text-sm text-gray-300">
                  مرحباً، {currentUser?.fullName || "المستخدم"} 👋
                </p>
              </div>
            </div>

            {/* معلومات المستخدم - مخفية على الموبايل */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-end">
                <p className="text-sm font-semibold text-white">
                  {currentUser?.role === "admin" ? "مدير النظام 👑" : "موظف مبيعات 💼"}
                </p>
                <p className="text-xs text-red-400">{currentUser?.email}</p>
              </div>
              <SignOutButton />
            </div>

            {/* زر القائمة للموبايل */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-red-900/50 text-red-400 hover:bg-red-900 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* قائمة الموبايل المنسدلة */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-red-900 pt-4 space-y-3">
              <div className="bg-gray-800 rounded-lg p-3 border border-red-900">
                <p className="text-sm font-semibold text-white mb-1">
                  {currentUser?.role === "admin" ? "مدير النظام 👑" : "موظف مبيعات 💼"}
                </p>
                <p className="text-xs text-gray-300">{currentUser?.fullName}</p>
                <p className="text-xs text-red-400">{currentUser?.email}</p>
              </div>
              <SignOutButton />
            </div>
          )}
        </div>
      </header>

      {/* التبويبات - محسنة للموبايل */}
      <div className="bg-gray-900/80 backdrop-blur-lg border-b-2 border-red-900 shadow-sm sticky top-[72px] md:top-[88px] z-40">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {currentUser?.role === "salesperson" && (
              <>
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`flex-1 min-w-[120px] px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === "customers"
                      ? "text-white border-b-4 border-red-600 bg-red-900/50"
                      : "text-gray-400 hover:text-white hover:bg-red-900/30"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    عملائي
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("collections")}
                  className={`flex-1 min-w-[120px] px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === "collections"
                      ? "text-white border-b-4 border-red-600 bg-red-900/50"
                      : "text-gray-400 hover:text-white hover:bg-red-900/30"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    التحصيلات
                  </span>
                </button>
              </>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`flex-1 min-w-[100px] px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === "customers"
                      ? "text-white border-b-4 border-red-600 bg-red-900/50"
                      : "text-gray-400 hover:text-white hover:bg-red-900/30"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    <span className="hidden sm:inline">العملاء</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("collections")}
                  className={`flex-1 min-w-[100px] px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === "collections"
                      ? "text-white border-b-4 border-red-600 bg-red-900/50"
                      : "text-gray-400 hover:text-white hover:bg-red-900/30"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">التحصيلات</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("admin")}
                  className={`flex-1 min-w-[100px] px-2 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    activeTab === "admin"
                      ? "text-white border-b-4 border-red-700 bg-red-900/70"
                      : "text-gray-400 hover:text-white hover:bg-red-900/30"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1 md:gap-2">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">الإدارة</span>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي - محسن للموبايل */}
      <main className="max-w-7xl mx-auto px-2 md:px-4 py-4 md:py-8">
        {activeTab === "customers" && (
          currentUser?.role === "salesperson" ? <CustomerCard /> : <CustomerManagement />
        )}
        {activeTab === "collections" && <CollectionTracking />}
        {activeTab === "admin" && isAdmin && <AdminPanel />}
      </main>
    </div>
  );
}
