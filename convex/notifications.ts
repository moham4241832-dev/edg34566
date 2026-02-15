import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// الحصول على إشعارات المستخدم الحالي
export const getMyNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);

    // إضافة تفاصيل العميل إذا كان موجوداً
    const notificationsWithDetails = await Promise.all(
      notifications.map(async (notif) => {
        if (notif.customerId) {
          const customer = await ctx.db.get(notif.customerId);
          return {
            ...notif,
            customerName: customer?.name,
            customerPhone: customer?.phone,
          };
        }
        return notif;
      })
    );

    return notificationsWithDetails;
  },
});

// عدد الإشعارات غير المقروءة
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return 0;
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .collect();

    return unreadNotifications.length;
  },
});

// تحديد إشعار كمقروء
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new ConvexError("الإشعار غير موجود");
    }

    if (notification.userId !== userId) {
      throw new ConvexError("لا يمكنك تحديث إشعار لمستخدم آخر");
    }

    await ctx.db.patch(args.notificationId, { isRead: true });
    return { success: true };
  },
});

// تحديد جميع الإشعارات كمقروءة
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .collect();

    for (const notif of unreadNotifications) {
      await ctx.db.patch(notif._id, { isRead: true });
    }

    return { success: true, count: unreadNotifications.length };
  },
});

// حذف إشعار
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new ConvexError("الإشعار غير موجود");
    }

    if (notification.userId !== userId) {
      throw new ConvexError("لا يمكنك حذف إشعار لمستخدم آخر");
    }

    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

// إنشاء إشعار (داخلي - يستخدم من الـ backend فقط)
export const createNotification = internalMutation({
  args: {
    userId: v.id("users"),
    type: v.union(
      v.literal("high_debt"),
      v.literal("overdue_alert"),
      v.literal("collection_success"),
      v.literal("daily_summary")
    ),
    title: v.string(),
    message: v.string(),
    customerId: v.optional(v.id("customers")),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      customerId: args.customerId,
      isRead: false,
      priority: args.priority,
    });
  },
});

// إنشاء إشعارات للعملاء ذوي المديونية العالية
export const createHighDebtAlerts = internalMutation({
  args: {},
  handler: async (ctx) => {
    const customers = await ctx.db.query("customers").collect();
    let alertsCreated = 0;

    for (const customer of customers) {
      const totalDebt = customer.goldDebt21 + customer.cashDebt;
      
      // إذا كانت المديونية أكثر من 10000 جنيه أو 100 جرام ذهب
      if (totalDebt > 10000 || customer.goldDebt21 > 100) {
        await ctx.db.insert("notifications", {
          userId: customer.salesPersonId,
          type: "high_debt",
          title: "⚠️ مديونية عالية",
          message: `العميل ${customer.name} لديه مديونية عالية: ${customer.goldDebt21.toFixed(2)} جم ذهب و ${customer.cashDebt.toFixed(2)} جنيه`,
          customerId: customer._id,
          isRead: false,
          priority: "high",
        });
        alertsCreated++;
      }
    }

    return { alertsCreated };
  },
});
