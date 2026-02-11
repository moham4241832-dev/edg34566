import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// إحصائيات عامة
export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("المستخدم غير موجود");
    }

    let customers;
    if (user.role === "admin") {
      customers = await ctx.db.query("customers").collect();
    } else {
      customers = await ctx.db
        .query("customers")
        .withIndex("by_salesperson", (q) => q.eq("salesPersonId", userId))
        .collect();
    }

    const totalCustomers = customers.length;
    const totalGoldDebt = customers.reduce((sum, c) => sum + c.goldDebt21, 0);
    const totalCashDebt = customers.reduce((sum, c) => sum + c.cashDebt, 0);

    // التحصيلات هذا الأسبوع
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    let weekCollections;
    if (user.role === "admin") {
      weekCollections = await ctx.db
        .query("collections")
        .filter((q) => q.gte(q.field("collectionDate"), weekStart.getTime()))
        .collect();
    } else {
      weekCollections = await ctx.db
        .query("collections")
        .withIndex("by_salesperson", (q) => q.eq("salesPersonId", userId))
        .filter((q) => q.gte(q.field("collectionDate"), weekStart.getTime()))
        .collect();
    }

    const weekGoldCollected = weekCollections.reduce(
      (sum, c) => sum + c.goldAmount,
      0
    );
    const weekCashCollected = weekCollections.reduce(
      (sum, c) => sum + c.cashAmount,
      0
    );

    return {
      totalCustomers,
      totalGoldDebt,
      totalCashDebt,
      weekGoldCollected,
      weekCashCollected,
    };
  },
});
