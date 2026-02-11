import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// إضافة عملية تحصيل جديدة
export const addCollection = mutation({
  args: {
    customerId: v.id("customers"),
    goldAmount: v.number(),
    cashAmount: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new ConvexError("المستخدم غير موجود");
    }

    const customer = await ctx.db.get(args.customerId);
    if (!customer) {
      throw new ConvexError("العميل غير موجود");
    }

    // التحقق من الصلاحيات
    if (user.role === "salesperson" && customer.salesPersonId !== userId) {
      throw new ConvexError("لا يمكنك تسجيل تحصيل لعميل غير تابع لك");
    }

    // التحقق من وجود مبلغ للتحصيل
    if (args.goldAmount === 0 && args.cashAmount === 0) {
      throw new ConvexError("يجب إدخال مبلغ للتحصيل");
    }

    // التحقق من عدم تجاوز المديونية
    if (args.goldAmount > 0 && args.goldAmount > customer.goldDebt21) {
      throw new ConvexError(`مبلغ الذهب المحصل (${args.goldAmount.toFixed(2)} جم) أكبر من المديونية (${customer.goldDebt21.toFixed(2)} جم)`);
    }

    if (args.cashAmount > 0 && args.cashAmount > customer.cashDebt) {
      throw new ConvexError(`المبلغ النقدي المحصل (${args.cashAmount.toFixed(2)} جنيه) أكبر من المديونية (${customer.cashDebt.toFixed(2)} جنيه)`);
    }

    // إضافة عملية التحصيل
    await ctx.db.insert("collections", {
      customerId: args.customerId,
      salesPersonId: customer.salesPersonId,
      goldAmount: args.goldAmount,
      cashAmount: args.cashAmount,
      notes: args.notes,
      collectionDate: Date.now(),
    });

    // تحديث مديونية العميل
    await ctx.db.patch(args.customerId, {
      goldDebt21: customer.goldDebt21 - args.goldAmount,
      cashDebt: customer.cashDebt - args.cashAmount,
    });

    return { success: true };
  },
});

// عرض تحصيلات عميل معين
export const getCustomerCollections = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();

    return collections;
  },
});

// عرض تحصيلات موظف معين
export const getMySalesCollections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_salesperson", (q) => q.eq("salesPersonId", userId))
      .order("desc")
      .collect();

    const collectionsWithDetails = await Promise.all(
      collections.map(async (collection) => {
        const customer = await ctx.db.get(collection.customerId);
        return {
          ...collection,
          customerName: customer?.name || "غير معروف",
          customerPhone: customer?.phone || "",
        };
      })
    );

    return collectionsWithDetails;
  },
});

// عرض جميع التحصيلات (للمدير فقط)
export const getAllCollections = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("هذه الصفحة للمديرين فقط");
    }

    const collections = await ctx.db
      .query("collections")
      .order("desc")
      .collect();

    const collectionsWithDetails = await Promise.all(
      collections.map(async (collection) => {
        const customer = await ctx.db.get(collection.customerId);
        const salesPerson = await ctx.db.get(collection.salesPersonId);
        return {
          ...collection,
          customerName: customer?.name || "غير معروف",
          customerPhone: customer?.phone || "",
          salesPersonName: salesPerson?.fullName || "غير معروف",
        };
      })
    );

    return collectionsWithDetails;
  },
});

// إحصائيات التحصيل لموظف معين
export const getMyCollectionStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const collections = await ctx.db
      .query("collections")
      .withIndex("by_salesperson", (q) => q.eq("salesPersonId", userId))
      .collect();

    const totalGold = collections.reduce((sum, c) => sum + c.goldAmount, 0);
    const totalCash = collections.reduce((sum, c) => sum + c.cashAmount, 0);

    // التحصيلات اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCollections = collections.filter(
      (c) => c.collectionDate >= today.getTime()
    );
    const todayGold = todayCollections.reduce((sum, c) => sum + c.goldAmount, 0);
    const todayCash = todayCollections.reduce((sum, c) => sum + c.cashAmount, 0);

    // التحصيلات هذا الأسبوع
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekCollections = collections.filter(
      (c) => c.collectionDate >= weekStart.getTime()
    );
    const weekGold = weekCollections.reduce((sum, c) => sum + c.goldAmount, 0);
    const weekCash = weekCollections.reduce((sum, c) => sum + c.cashAmount, 0);

    return {
      total: { gold: totalGold, cash: totalCash, count: collections.length },
      today: { gold: todayGold, cash: todayCash, count: todayCollections.length },
      week: { gold: weekGold, cash: weekCash, count: weekCollections.length },
    };
  },
});

// إحصائيات التحصيل لجميع الموظفين (للمدير)
export const getAllCollectionStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("هذه الصفحة للمديرين فقط");
    }

    const salesPersons = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "salesperson"))
      .collect();

    const stats = await Promise.all(
      salesPersons.map(async (sp) => {
        const collections = await ctx.db
          .query("collections")
          .withIndex("by_salesperson", (q) => q.eq("salesPersonId", sp._id))
          .collect();

        const totalGold = collections.reduce((sum, c) => sum + c.goldAmount, 0);
        const totalCash = collections.reduce((sum, c) => sum + c.cashAmount, 0);

        // التحصيلات اليوم
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCollections = collections.filter(
          (c) => c.collectionDate >= today.getTime()
        );
        const todayGold = todayCollections.reduce((sum, c) => sum + c.goldAmount, 0);
        const todayCash = todayCollections.reduce((sum, c) => sum + c.cashAmount, 0);

        return {
          salesPersonId: sp._id,
          salesPersonName: sp.fullName,
          salesPersonEmail: sp.email,
          totalGold,
          totalCash,
          totalCount: collections.length,
          todayGold,
          todayCash,
          todayCount: todayCollections.length,
        };
      })
    );

    return stats;
  },
});

// حذف عملية تحصيل (للمدير فقط)
export const deleteCollection = mutation({
  args: { collectionId: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const user = await ctx.db.get(userId);
    if (!user || user.role !== "admin") {
      throw new ConvexError("هذه العملية للمديرين فقط");
    }

    const collection = await ctx.db.get(args.collectionId);
    if (!collection) {
      throw new ConvexError("عملية التحصيل غير موجودة");
    }

    const customer = await ctx.db.get(collection.customerId);
    if (!customer) {
      throw new ConvexError("العميل غير موجود");
    }

    // إرجاع المديونية للعميل
    await ctx.db.patch(collection.customerId, {
      goldDebt21: customer.goldDebt21 + collection.goldAmount,
      cashDebt: customer.cashDebt + collection.cashAmount,
    });

    // حذف عملية التحصيل
    await ctx.db.delete(args.collectionId);

    return { success: true };
  },
});
