import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";

export function FixOverdueButton() {
  const [isFixing, setIsFixing] = useState(false);
  const fixOverdueDataTypes = useMutation(api.fixOverdueTypes.fixOverdueDataTypes);

  const handleFix = async () => {
    if (!confirm("هل تريد تحويل البيانات القديمة؟ هذه العملية آمنة وستحول القيم من boolean إلى 0")) {
      return;
    }

    setIsFixing(true);
    try {
      const result = await fixOverdueDataTypes({});
      toast.success(`تم تحويل ${result.fixed} سجل من أصل ${result.total} بنجاح! ✅`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ أثناء التحويل";
      toast.error(message);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <button
      onClick={handleFix}
      disabled={isFixing}
      className="px-6 py-3 bg-gradient-to-l from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
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
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      {isFixing ? "جاري التحويل..." : "🔧 إصلاح بيانات Overdue"}
    </button>
  );
}
