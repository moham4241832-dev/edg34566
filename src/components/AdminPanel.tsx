import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { UserManagement } from "./UserManagement";
import { AdminCollectionStats } from "./AdminCollectionStats";
import { WeeklyReport } from "./WeeklyReport";
import { CustomerManagementWithOverdue } from "./CustomerManagementWithOverdue";
import { OverdueExcelUpdater } from "./OverdueExcelUpdater";
import { FixOverdueButton } from "./FixOverdueButton";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useState, useRef } from "react";

export function AdminPanel() {
  const allCollections = useQuery(api.collections.getAllCollections);
  const allCustomers = useQuery(api.customers.listAllCustomers);
  const importCustomers = useMutation(api.customers.importCustomers);
  const updateCustomersFromExcel = useMutation(api.customers.updateCustomersFromExcel);
  const [isImporting, setIsImporting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

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
        "المنطقة": c.customerRegion || "-",
        "ذهب (جرام)": c.goldAmount.toFixed(2),
        "نقدية (جنيه)": c.cashAmount.toFixed(2),
        "موظف المبيعات": c.salesPersonName,
        "ملاحظات": c.notes || "-",
      }));

      const customersData = allCustomers.map((c) => ({
        "اسم العميل": c.name,
        "رقم الهاتف": c.phone,
        "المنطقة": c.region,
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
        region: row["المنطقة"] || row["region"] || "غير محدد",
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

  const handleUpdateFromExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUpdating(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const customers = jsonData.map((row: any) => ({
        name: row["اسم العميل"] || row["name"] || "",
        phone: String(row["رقم الهاتف"] || row["phone"] || ""),
        region: row["المنطقة"] || row["region"] || "غير محدد",
        goldDebt21: parseFloat(row["مديونية ذهب (جرام)"] || row["goldDebt21"] || "0"),
        cashDebt: parseFloat(row["مديونية نقدية (جنيه)"] || row["cashDebt"] || "0"),
      }));

      const result = await updateCustomersFromExcel({ customers });
      
      let message = "";
      if (result.updated > 0) message += `تم تحديث ${result.updated} عميل. `;
      if (result.created > 0) message += `تم إضافة ${result.created} عميل جديد. `;
      if (result.failed > 0) message += `فشل ${result.failed} عميل.`;
      
      toast.success(message || "تم التحديث بنجاح! ✅");
      
      if (result.errors.length > 0) {
        console.log("Errors:", result.errors);
      }
      
      if (updateFileInputRef.current) {
        updateFileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error updating from Excel:", error);
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء التحديث";
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-3xl font-bold bg-gradient-to-l from-red-500 to-amber-600 bg-clip-text text-transparent">
          👑 لوحة تحكم المدير
        </h2>
        <div className="flex gap-3 flex-wrap">
          <label className="px-6 py-3 bg-gradient-to-l from-red-600 to-red-800 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border-2 border-red-900">
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
            {isImporting ? "جاري الاستيراد..." : "استيراد جديد"}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportFromExcel}
              disabled={isImporting}
              className="hidden"
            />
          </label>
          
          <label className="px-6 py-3 bg-gradient-to-l from-amber-600 to-yellow-700 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border-2 border-amber-900">
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isUpdating ? "جاري التحديث..." : "تحديث Excel"}
            <input
              ref={updateFileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpdateFromExcel}
              disabled={isUpdating}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleExportToExcel}
            className="px-6 py-3 bg-gradient-to-l from-green-600 to-emerald-700 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2 border-2 border-green-900"
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
          
          <FixOverdueButton />
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-950 to-amber-950 border-2 border-red-800 rounded-xl p-4">
        <h3 className="font-bold text-amber-400 mb-2">💡 كيفية استخدام التحديث من Excel:</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• <strong className="text-amber-400">استيراد جديد:</strong> يضيف عملاء جدد فقط (يتجاهل الأرقام المكررة)</li>
          <li>• <strong className="text-amber-400">تحديث Excel:</strong> يحدث بيانات العملاء الموجودين ويضيف الجدد</li>
          <li>• يجب أن يحتوي الملف على: اسم العميل، رقم الهاتف، المنطقة، مديونية ذهب، مديونية نقدية</li>
        </ul>
      </div>

      <AdminCollectionStats />
      <WeeklyReport />
      <CustomerManagementWithOverdue />
      <OverdueExcelUpdater />
      <UserManagement />
    </div>
  );
}
