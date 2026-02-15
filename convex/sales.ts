import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// إضافة مبيعات من Excel
export const importSales = mutation({
  args: {
    salesData: v.array(
      v.object({
        branch: v.string(),
        salesperson: v.string(),
        gold18Star: v.number(),
        gold18Plain: v.number(),
        gold21Plain: v.number(),
        gold21Star: v.number(),
        totalSales: v.number(),
        saleDate: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("هذه الميزة متاحة للمدير فقط");
    }

    // إضافة جميع المبيعات
    for (const sale of args.salesData) {
      await ctx.db.insert("sales", {
        ...sale,
        importedBy: userId,
      });
    }

    return { success: true, count: args.salesData.length };
  },
});

// الحصول على جميع المبيعات
export const getAllSales = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db.query("sales").order("desc").collect();
  },
});

// إحصائيات المبيعات حسب الفرع
export const getSalesByBranch = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const sales = await ctx.db.query("sales").collect();

    // تجميع البيانات حسب الفرع
    const branchStats: Record<
      string,
      { gold18Star: number; gold18Plain: number; gold21Plain: number; gold21Star: number; totalSales: number }
    > = {};

    for (const sale of sales) {
      if (!branchStats[sale.branch]) {
        branchStats[sale.branch] = { gold18Star: 0, gold18Plain: 0, gold21Plain: 0, gold21Star: 0, totalSales: 0 };
      }
      branchStats[sale.branch].gold18Star += sale.gold18Star || 0;
      branchStats[sale.branch].gold18Plain += sale.gold18Plain || 0;
      branchStats[sale.branch].gold21Plain += sale.gold21Plain || 0;
      branchStats[sale.branch].gold21Star += sale.gold21Star || 0;
      branchStats[sale.branch].totalSales += sale.totalSales;
    }

    return Object.entries(branchStats).map(([branch, stats]) => ({
      branch,
      ...stats,
    }));
  },
});

// إحصائيات المبيعات حسب المندوب
export const getSalesBySalesperson = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const sales = await ctx.db.query("sales").collect();

    // تجميع البيانات حسب المندوب
    const salespersonStats: Record<
      string,
      { gold18Star: number; gold18Plain: number; gold21Plain: number; gold21Star: number; totalSales: number }
    > = {};

    for (const sale of sales) {
      if (!salespersonStats[sale.salesperson]) {
        salespersonStats[sale.salesperson] = {
          gold18Star: 0,
          gold18Plain: 0,
          gold21Plain: 0,
          gold21Star: 0,
          totalSales: 0,
        };
      }
      salespersonStats[sale.salesperson].gold18Star += sale.gold18Star || 0;
      salespersonStats[sale.salesperson].gold18Plain += sale.gold18Plain || 0;
      salespersonStats[sale.salesperson].gold21Plain += sale.gold21Plain || 0;
      salespersonStats[sale.salesperson].gold21Star += sale.gold21Star || 0;
      salespersonStats[sale.salesperson].totalSales += sale.totalSales;
    }

    return Object.entries(salespersonStats).map(([salesperson, stats]) => ({
      salesperson,
      ...stats,
    }));
  },
});

// حذف جميع المبيعات (للمدير فقط)
export const clearAllSales = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("هذه الميزة متاحة للمدير فقط");
    }

    const sales = await ctx.db.query("sales").collect();
    for (const sale of sales) {
      await ctx.db.delete(sale._id);
    }

    return { success: true, count: sales.length };
  },
});
