import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// تحويل البيانات القديمة من boolean إلى number
export const fixOverdueDataTypes = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("هذه العملية للمديرين فقط");
    }

    const allStatuses = await ctx.db.query("overdueStatus").collect();
    let fixed = 0;

    for (const status of allStatuses) {
      const updates: any = {};
      
      // تحويل كل boolean إلى 0
      if (typeof status.goldOverdue25 === "boolean") updates.goldOverdue25 = 0;
      if (typeof status.cashOverdue25 === "boolean") updates.cashOverdue25 = 0;
      if (typeof status.goldOverdue40 === "boolean") updates.goldOverdue40 = 0;
      if (typeof status.cashOverdue40 === "boolean") updates.cashOverdue40 = 0;
      if (typeof status.goldOverdue60 === "boolean") updates.goldOverdue60 = 0;
      if (typeof status.cashOverdue60 === "boolean") updates.cashOverdue60 = 0;
      if (typeof status.goldOverdue90 === "boolean") updates.goldOverdue90 = 0;
      if (typeof status.cashOverdue90 === "boolean") updates.cashOverdue90 = 0;
      if (status.goldOverdue90Plus && typeof status.goldOverdue90Plus === "boolean") {
        updates.goldOverdue90Plus = 0;
      }
      if (status.cashOverdue90Plus && typeof status.cashOverdue90Plus === "boolean") {
        updates.cashOverdue90Plus = 0;
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(status._id, updates);
        fixed++;
      }
    }

    return { total: allStatuses.length, fixed };
  },
});
