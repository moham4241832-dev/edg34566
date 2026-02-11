import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserManagement } from "./UserManagement";
import { AdminCollectionStats } from "./AdminCollectionStats";
import { WeeklyReport } from "./WeeklyReport";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useState, useRef } from "react";

export function AdminPanel() {
  const allCollections = useQuery(api.collections.getAllCollections);
  const allCustomers = useQuery(api.customers.listAllCustomers);
  const importCustomers = useMutation(api.customers.importCustomers);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportToExcel = () => {
    if (!allCollections || !allCustomers) {
      toast.error("البيانات لم تحمل بعد");
      return;
    }

    try {
      const collectionsData = allCollections.map((c) => ({
        "التاريخ": new Date(c.collectionDate).toLocaleDateString("ar-EG"),
        "اسم العميل": c.customerName,
        "رقم الهاتف": c.customerPhone,
        "ذهب (جرام)": c.goldAmount.toFixed(2),
        "نقدية (جنيه)": c.cashAmount.toFixed(2),
        "موظف المبيعات": c.salesPersonName,
        "ملاحظات": c.notes || "-",
      }));

      const customersData = allCustomers.map((c) => ({
        "اسم العميل": c.name,
        "رقم الهاتف": c.phone,
        "مديونية ذهب (جرام)": c.goldDebt21.toFixed(2),
        "مديونية نقدية (جنيه)": c.cashDebt.toFixed(2),
        "موظف المبيعات": c.salesPersonName || "-",
      }));

      const wb = XLSX.utils.book_new();
      const wsCollections = XLSX.utils.json_to_sheet(collectionsData);
      XLSX.utils.book_append_sheet(wb, wsCollections, "التحصيلات");
      const wsCustomers = XLSX.utils.json_to_sheet(customersData);
      XLSX.utils.book_append_sheet(wb, wsCustomers, "العملاء");

      const fileName = `تقرير_التحصيلات_${new Date().toLocaleDateString("ar-EG")}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success("تم تصدير البيانات بنجاح! 📊");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("حدث خطأ أثناء التصدير");
    }
  };

  const handleImportFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const customers = jsonData.map((row: any) => ({
        name: row["اسم العميل"] || row["name"] || "",
        phone: String(row["رقم الهاتف"] || row["phone"] || ""),
        goldDebt21: parseFloat(row["مديونية ذهب (جرام)"] || row["goldDebt21"] || "0"),
        cashDebt: parseFloat(row["مديونية نقدية (جنيه)"] || row["cashDebt"] || "0"),
      }));

      await importCustomers({ customers });
      toast.success(`تم استيراد ${customers.length} عميل بنجاح! ✅`);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error importing from Excel:", error);
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء الاستيراد";
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold bg-gradient-to-l from-purple-600 to-pink-600 bg-clip-text text-transparent">
          👑 لوحة تحكم المدير
        </h2>
        <div className="flex gap-3">
          <label className="px-6 py-3 bg-gradient-to-l from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2 cursor-pointer">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {isImporting ? "جاري الاستيراد..." : "استيراد Excel"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportFromExcel}
              disabled={isImporting}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExportToExcel}
            className="px-6 py-3 bg-gradient-to-l from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            تصدير Excel
          </button>
        </div>
      </div>

      <AdminCollectionStats />
      <WeeklyReport />
      <UserManagement />
    </div>
  );
}
