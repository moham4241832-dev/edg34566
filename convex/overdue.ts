import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

export const getCustomerOverdueStatus = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const status = await ctx.db
      .query("overdueStatus")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .first();

    return status;
  },
});

export const getAllOverdueStatuses = query({
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

    const statuses = await ctx.db.query("overdueStatus").collect();
    
    const enrichedStatuses = await Promise.all(
      statuses.map(async (status) => {
        const customer = await ctx.db.get(status.customerId);
        return {
          ...status,
          customerName: customer?.name,
          customerPhone: customer?.phone,
          customerRegion: customer?.region,
        };
      })
    );

    if (user.role === "admin") {
      return enrichedStatuses;
    } else {
      const myCustomers = await ctx.db
        .query("customers")
        .withIndex("by_salesperson", (q) => q.eq("salesPersonId", userId))
        .collect();
      
      const myCustomerIds = new Set(myCustomers.map(c => c._id));
      return enrichedStatuses.filter(s => myCustomerIds.has(s.customerId));
    }
  },
});

export const updateOverdueStatus = mutation({
  args: {
    customerId: v.id("customers"),
    goldOverdue25: v.number(),
    cashOverdue25: v.number(),
    goldOverdue40: v.number(),
    cashOverdue40: v.number(),
    goldOverdue60: v.number(),
    cashOverdue60: v.number(),
    goldOverdue90: v.number(),
    cashOverdue90: v.number(),
    goldOverdue90Plus: v.number(),
    cashOverdue90Plus: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("هذه العملية متاحة للمدير فقط");
    }

    const existing = await ctx.db
      .query("overdueStatus")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .first();

    const data = {
      customerId: args.customerId,
      goldOverdue25: args.goldOverdue25,
      cashOverdue25: args.cashOverdue25,
      goldOverdue40: args.goldOverdue40,
      cashOverdue40: args.cashOverdue40,
      goldOverdue60: args.goldOverdue60,
      cashOverdue60: args.cashOverdue60,
      goldOverdue90: args.goldOverdue90,
      cashOverdue90: args.cashOverdue90,
      goldOverdue90Plus: args.goldOverdue90Plus,
      cashOverdue90Plus: args.cashOverdue90Plus,
      lastUpdated: Date.now(),
      importedBy: userId,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("overdueStatus", data);
    }
  },
});
