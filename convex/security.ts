import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// تسجيل دخول المستخدم
export const recordLogin = mutation({
  args: {
    deviceInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { success: false };

    await ctx.db.insert("loginHistory", {
      userId,
      loginTime: Date.now(),
      deviceInfo: args.deviceInfo,
    });

    return { success: true };
  },
});

// عرض سجل دخول مستخدم معين (للأدمن)
export const getUserLoginHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط المدير يمكنه عرض سجل الدخول");
    }

    const limit = args.limit || 50;
    const loginHistory = await ctx.db
      .query("loginHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    const user = await ctx.db.get(args.userId);

    return loginHistory.map((login) => ({
      ...login,
      userName: user?.fullName || user?.email || "غير معروف",
    }));
  },
});

// عرض آخر عمليات الدخول لجميع المستخدمين (للأدمن)
export const getAllRecentLogins = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط المدير يمكنه عرض سجل الدخول");
    }

    const limit = args.limit || 100;
    const loginHistory = await ctx.db
      .query("loginHistory")
      .withIndex("by_time")
      .order("desc")
      .take(limit);

    const loginsWithUserInfo = await Promise.all(
      loginHistory.map(async (login) => {
        const user = await ctx.db.get(login.userId);
        return {
          ...login,
          userName: user?.fullName || user?.email || "غير معروف",
          userRole: user?.role || "غير محدد",
        };
      })
    );

    return loginsWithUserInfo;
  },
});

// إحصائيات الدخول (للأدمن)
export const getLoginStats = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط المدير يمكنه عرض الإحصائيات");
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const allLogins = await ctx.db.query("loginHistory").collect();
    const todayLogins = allLogins.filter((login) => login.loginTime >= oneDayAgo);
    const weekLogins = allLogins.filter((login) => login.loginTime >= oneWeekAgo);

    // حساب المستخدمين النشطين
    const activeUsersToday = new Set(todayLogins.map((l) => l.userId)).size;
    const activeUsersWeek = new Set(weekLogins.map((l) => l.userId)).size;

    return {
      totalLogins: allLogins.length,
      loginsToday: todayLogins.length,
      loginsThisWeek: weekLogins.length,
      activeUsersToday,
      activeUsersWeek,
    };
  },
});

// تغيير كلمة المرور (للمستخدم نفسه)
export const changePassword = mutation({
  args: {
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    if (args.newPassword.length < 6) {
      throw new ConvexError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    // تسجيل تغيير كلمة المرور
    await ctx.db.insert("passwordChanges", {
      userId,
      changedAt: Date.now(),
      changedBy: userId,
      reason: "تغيير من المستخدم",
    });

    return { success: true, message: "تم تغيير كلمة المرور بنجاح" };
  },
});

// إعادة تعيين كلمة مرور مستخدم (للأدمن فقط)
export const resetUserPassword = mutation({
  args: {
    userId: v.id("users"),
    newPassword: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط المدير يمكنه إعادة تعيين كلمات المرور");
    }

    if (args.newPassword.length < 6) {
      throw new ConvexError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    }

    // تسجيل تغيير كلمة المرور
    await ctx.db.insert("passwordChanges", {
      userId: args.userId,
      changedAt: Date.now(),
      changedBy: currentUserId,
      reason: args.reason || "إعادة تعيين من المدير",
    });

    return { success: true, message: "تم إعادة تعيين كلمة المرور بنجاح" };
  },
});

// عرض سجل تغييرات كلمات المرور (للأدمن)
export const getPasswordChangeHistory = query({
  args: {},
  handler: async (ctx) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط المدير يمكنه عرض سجل تغييرات كلمات المرور");
    }

    const changes = await ctx.db
      .query("passwordChanges")
      .withIndex("by_time")
      .order("desc")
      .take(100);

    const changesWithUserInfo = await Promise.all(
      changes.map(async (change) => {
        const user = await ctx.db.get(change.userId);
        const changedBy = await ctx.db.get(change.changedBy);
        return {
          ...change,
          userName: user?.fullName || user?.email || "غير معروف",
          changedByName: changedBy?.fullName || changedBy?.email || "غير معروف",
        };
      })
    );

    return changesWithUserInfo;
  },
});
