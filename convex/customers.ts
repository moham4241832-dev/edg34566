import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError } from "convex/values";

// الحصول على المستخدم الحالي
async function getCurrentUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError("يجب تسجيل الدخول أولاً");
  }
  const user = await ctx.db.get(userId);
  if (!user) {
    throw new ConvexError("المستخدم غير موجود");
  }
  return user;
}

// إضافة عميل جديد
export const addCustomer = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    region: v.string(),
    goldDebt21: v.number(),
    cashDebt: v.number(),
    salesPersonId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    // التحقق من عدم تكرار رقم الهاتف
    const existingCustomer = await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (existingCustomer) {
      throw new ConvexError("رقم الهاتف مسجل مسبقاً لعميل آخر");
    }

    // تحديد موظف المبيعات
    let salesPersonId = args.salesPersonId;
    if (currentUser.role === "admin" && !salesPersonId) {
      throw new ConvexError("يجب اختيار موظف المبيعات");
    } else if (currentUser.role === "salesperson") {
      salesPersonId = currentUser._id;
    }

    if (!salesPersonId) {
      throw new ConvexError("خطأ في تحديد موظف المبيعات");
    }

    return await ctx.db.insert("customers", {
      name: args.name,
      phone: args.phone,
      region: args.region,
      goldDebt21: args.goldDebt21,
      cashDebt: args.cashDebt,
      salesPersonId,
    });
  },
});

// استيراد عملاء متعددين من Excel
export const importCustomers = mutation({
  args: {
    customers: v.array(
      v.object({
        name: v.string(),
        phone: v.string(),
        region: v.string(),
        goldDebt21: v.number(),
        cashDebt: v.number(),
        salesPersonId: v.optional(v.id("users")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const customer of args.customers) {
      try {
        // التحقق من عدم تكرار رقم الهاتف
        const existingCustomer = await ctx.db
          .query("customers")
          .withIndex("by_phone", (q) => q.eq("phone", customer.phone))
          .first();

        if (existingCustomer) {
          results.failed++;
          results.errors.push(`${customer.name} - رقم الهاتف ${customer.phone} مسجل مسبقاً`);
          continue;
        }

        // تحديد موظف المبيعات
        let salesPersonId;
        
        if (currentUser.role === "salesperson") {
          // الموظف العادي: استخدم ID الموظف الحالي
          salesPersonId = currentUser._id;
        } else if (currentUser.role === "admin") {
          // الأدمن: يجب أن يكون اختار موظف مبيعات
          if (!customer.salesPersonId) {
            results.failed++;
            results.errors.push(`${customer.name} - يجب تحديد موظف المبيعات`);
            continue;
          }
          salesPersonId = customer.salesPersonId;
        } else {
          results.failed++;
          results.errors.push(`${customer.name} - خطأ في تحديد موظف المبيعات`);
          continue;
        }

        await ctx.db.insert("customers", {
          name: customer.name,
          phone: customer.phone,
          region: customer.region,
          goldDebt21: customer.goldDebt21,
          cashDebt: customer.cashDebt,
          salesPersonId,
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`${customer.name} - ${error instanceof Error ? error.message : "خطأ غير معروف"}`);
      }
    }

    return results;
  },
});

// البحث عن العملاء (للموظف)
export const searchMyCustomers = query({
  args: {
    searchTerm: v.optional(v.string()),
    region: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    
    let customers;
    
    // إذا كان هناك فلتر بالمنطقة
    if (args.region && args.region !== "all") {
      customers = await ctx.db
        .query("customers")
        .withIndex("by_salesperson_and_region", (q) => 
          q.eq("salesPersonId", currentUser._id).eq("region", args.region)
        )
        .collect();
    } else {
      customers = await ctx.db
        .query("customers")
        .withIndex("by_salesperson", (q) => q.eq("salesPersonId", currentUser._id))
        .collect();
    }

    // البحث بالاسم إذا كان هناك نص بحث
    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase().trim();
      customers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchLower)
      );
    }

    return customers.map((customer) => ({
      ...customer,
      salesPersonName: currentUser.fullName || currentUser.email || "أنت",
    }));
  },
});

// البحث عن جميع العملاء (للأدمن)
export const searchAllCustomers = query({
  args: {
    searchTerm: v.optional(v.string()),
    region: v.optional(v.string()),
    salesPersonId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (currentUser.role !== "admin") {
      throw new ConvexError("غير مصرح لك بعرض جميع العملاء");
    }

    let customers;

    // فلتر بموظف المبيعات والمنطقة
    if (args.salesPersonId && args.region && args.region !== "all") {
      customers = await ctx.db
        .query("customers")
        .withIndex("by_salesperson_and_region", (q) => 
          q.eq("salesPersonId", args.salesPersonId).eq("region", args.region)
        )
        .collect();
    } else if (args.salesPersonId) {
      customers = await ctx.db
        .query("customers")
        .withIndex("by_salesperson", (q) => q.eq("salesPersonId", args.salesPersonId))
        .collect();
    } else if (args.region && args.region !== "all") {
      customers = await ctx.db
        .query("customers")
        .withIndex("by_region", (q) => q.eq("region", args.region))
        .collect();
    } else {
      customers = await ctx.db.query("customers").collect();
    }

    // البحث بالاسم
    if (args.searchTerm && args.searchTerm.trim() !== "") {
      const searchLower = args.searchTerm.toLowerCase().trim();
      customers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchLower)
      );
    }

    return Promise.all(
      customers.map(async (customer) => {
        const salesPerson = await ctx.db.get(customer.salesPersonId);
        return {
          ...customer,
          salesPersonName: salesPerson?.fullName || salesPerson?.email || "غير محدد",
        };
      })
    );
  },
});

// عرض جميع العملاء (للأدمن)
export const listAllCustomers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (currentUser.role !== "admin") {
      throw new ConvexError("غير مصرح لك بعرض جميع العملاء");
    }

    const customers = await ctx.db.query("customers").collect();
    return Promise.all(
      customers.map(async (customer) => {
        const salesPerson = await ctx.db.get(customer.salesPersonId);
        return {
          ...customer,
          salesPersonName: salesPerson?.fullName || salesPerson?.email || "غير محدد",
        };
      })
    );
  },
});

// عرض عملاء موظف المبيعات
export const listMyCustomers = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    const customers = await ctx.db
      .query("customers")
      .withIndex("by_salesperson", (q) => q.eq("salesPersonId", currentUser._id))
      .collect();

    return customers.map((customer) => ({
      ...customer,
      salesPersonName: currentUser.fullName || currentUser.email || "أنت",
    }));
  },
});

// الحصول على قائمة المناطق الفريدة
export const getRegions = query({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    
    let customers;
    if (currentUser.role === "admin") {
      customers = await ctx.db.query("customers").collect();
    } else {
      customers = await ctx.db
        .query("customers")
        .withIndex("by_salesperson", (q) => q.eq("salesPersonId", currentUser._id))
        .collect();
    }

    // استخراج المناطق الفريدة
    const regions = [...new Set(customers.map(c => c.region))];
    return regions.sort();
  },
});

// حذف عميل
export const deleteCustomer = mutation({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (currentUser.role !== "admin") {
      throw new ConvexError("غير مصرح لك بحذف العملاء");
    }

    // حذف جميع التحصيلات المرتبطة بالعميل
    const collections = await ctx.db
      .query("collections")
      .withIndex("by_customer", (q) => q.eq("customerId", args.customerId))
      .collect();

    for (const collection of collections) {
      await ctx.db.delete(collection._id);
    }

    await ctx.db.delete(args.customerId);
  },
});

// الحصول على عميل واحد
export const getCustomer = query({
  args: { customerId: v.id("customers") },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    const customer = await ctx.db.get(args.customerId);

    if (!customer) {
      throw new ConvexError("العميل غير موجود");
    }

    // التحقق من الصلاحيات
    if (
      currentUser.role !== "admin" &&
      customer.salesPersonId !== currentUser._id
    ) {
      throw new ConvexError("غير مصرح لك بعرض هذا العميل");
    }

    const salesPerson = await ctx.db.get(customer.salesPersonId);
    return {
      ...customer,
      salesPersonName: salesPerson?.fullName || salesPerson?.email || "غير محدد",
    };
  },
});
