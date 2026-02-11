import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// الحصول على معلومات المستخدم الحالي
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    return user;
  },
});

// تعيين أول مستخدم كمدير (يمكن لأي مستخدم بدون دور استخدامها)
export const makeFirstAdmin = mutation({
  args: {
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser) {
      throw new ConvexError("المستخدم غير موجود");
    }

    // إذا المستخدم عنده دور بالفعل، لا يمكنه استخدام هذه الوظيفة
    if (currentUser.role) {
      throw new ConvexError("لديك دور بالفعل: " + (currentUser.role === "admin" ? "مدير النظام" : "موظف مبيعات"));
    }

    // تعيين المستخدم كمدير
    await ctx.db.patch(userId, {
      role: "admin",
      fullName: args.fullName,
    });

    return { success: true };
  },
});

// عرض موظفي المبيعات فقط (للأدمن)
export const listSalespeople = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط الأدمن يمكنه عرض قائمة الموظفين");
    }

    const allUsers = await ctx.db.query("users").collect();
    
    return allUsers.filter((user) => user.role === "salesperson");
  },
});

// عرض كل الموظفين (للأدمن)
export const listSalesPersons = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط الأدمن يمكنه عرض قائمة الموظفين");
    }

    const allUsers = await ctx.db.query("users").collect();
    
    const salesPersons = allUsers
      .filter((user) => user.role === "salesperson")
      .map((user) => ({
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
      }));

    return salesPersons;
  },
});

// عرض جميع المستخدمين (للأدمن)
export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(userId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط الأدمن يمكنه عرض قائمة المستخدمين");
    }

    const allUsers = await ctx.db.query("users").order("desc").collect();
    
    return allUsers.map((user) => ({
      _id: user._id,
      fullName: user.fullName || "غير محدد",
      email: user.email || "غير محدد",
      role: user.role || "لم يتم التعيين",
      _creationTime: user._creationTime,
    }));
  },
});

// تعيين دور لمستخدم (للأدمن فقط)
export const assignRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("salesperson")),
    fullName: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط الأدمن يمكنه تعيين الأدوار");
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      fullName: args.fullName,
    });

    return { success: true };
  },
});

// حذف مستخدم (للأدمن فقط)
export const deleteUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new ConvexError("يجب تسجيل الدخول أولاً");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (!currentUser || currentUser.role !== "admin") {
      throw new ConvexError("فقط الأدمن يمكنه حذف المستخدمين");
    }

    if (args.userId === currentUserId) {
      throw new ConvexError("لا يمكنك حذف حسابك الخاص");
    }

    await ctx.db.delete(args.userId);

    return { success: true };
  },
});
