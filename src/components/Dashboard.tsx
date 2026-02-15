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

  // إذا المستخدم مدير، نعرض له 3 تبويبات
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      {/* الهيدر */}
      <header className="bg-white border-b-2 border-amber-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* اللوجو والعنوان */}
            <div className="flex items-center gap-4">
              <Logo3D size="small" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-l from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  نظام إدارة التحصيلات
                </h1>
                <p className="text-sm text-gray-600">
                  مرحباً، {currentUser?.fullName || "المستخدم"} 👋
                </p>
              </div>
            </div>

            {/* معلومات المستخدم وزر الخروج */}
            <div className="flex items-center gap-4">
              <div className="text-end">
                <p className="text-sm font-semibold text-gray-700">
                  {currentUser?.role === "admin" ? "مدير النظام 👑" : "موظف مبيعات 💼"}
                </p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* التبويبات */}
          <div className="flex gap-3 bg-white rounded-xl p-2 shadow-lg border border-gray-200">
            <button
              onClick={() => setActiveTab("customers")}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === "customers"
                  ? "bg-gradient-to-l from-amber-500 to-yellow-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              👥 {isAdmin ? "إدارة العملاء" : "عملائي"}
            </button>
            <button
              onClick={() => setActiveTab("collections")}
              className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === "collections"
                  ? "bg-gradient-to-l from-amber-500 to-yellow-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              📊 تتبع التحصيل
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                  activeTab === "admin"
                    ? "bg-gradient-to-l from-purple-500 to-pink-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                👑 لوحة المدير
              </button>
            )}
          </div>

          {/* المحتوى */}
          {activeTab === "customers" && (
            isAdmin ? <CustomerManagement /> : <CustomerCard />
          )}
          {activeTab === "collections" && <CollectionTracking />}
          {activeTab === "admin" && isAdmin && <AdminPanel />}
        </div>
      </main>
    </div>
  );
}
