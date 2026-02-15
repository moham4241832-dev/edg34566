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
    creditLimit: v.optional(v.number()),
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
      creditLimit: args.creditLimit,
      salesPersonId,
    });
  },
});

// تحديث بيانات عميل
export const updateCustomer = mutation({
  args: {
    customerId: v.id("customers"),
    name: v.string(),
    phone: v.string(),
    region: v.string(),
    goldDebt21: v.number(),
    cashDebt: v.number(),
    creditLimit: v.optional(v.number()),
    salesPersonId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    
    if (currentUser.role !== "admin") {
      throw new ConvexError("هذه العملية متاحة للمدير فقط");
    }

    await ctx.db.patch(args.customerId, {
      name: args.name,
      phone: args.phone,
      region: args.region,
      goldDebt21: args.goldDebt21,
      cashDebt: args.cashDebt,
      creditLimit: args.creditLimit,
      salesPersonId: args.salesPersonId,
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
        creditLimit: v.optional(v.number()),
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
          creditLimit: customer.creditLimit,
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

// تحديث العملاء من Excel (يحدث البيانات الموجودة)
export const updateCustomersFromExcel = mutation({
  args: {
    customers: v.array(
      v.object({
        name: v.string(),
        phone: v.string(),
        region: v.string(),
        goldDebt21: v.number(),
        cashDebt: v.number(),
        creditLimit: v.optional(v.number()),
        salesPersonId: v.optional(v.id("users")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    
    const results = {
      updated: 0,
      created: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const customerData of args.customers) {
      try {
        // البحث عن العميل برقم الهاتف (أسرع وأدق من الاسم)
        const existingCustomer = await ctx.db
          .query("customers")
          .withIndex("by_phone", (q) => q.eq("phone", customerData.phone))
          .first();

        if (existingCustomer) {
          // تحديث بيانات العميل الموجود
          await ctx.db.patch(existingCustomer._id, {
            name: customerData.name,
            region: customerData.region,
            goldDebt21: customerData.goldDebt21,
            cashDebt: customerData.cashDebt,
            creditLimit: customerData.creditLimit,
          });
          results.updated++;
        } else {
          // إضافة عميل جديد
          let salesPersonId;
          
          if (currentUser.role === "salesperson") {
            salesPersonId = currentUser._id;
          } else if (currentUser.role === "admin") {
            if (!customerData.salesPersonId) {
              results.failed++;
              results.errors.push(`${customerData.name} - عميل جديد يحتاج موظف مبيعات`);
              continue;
            }
            salesPersonId = customerData.salesPersonId;
          } else {
            results.failed++;
            results.errors.push(`${customerData.name} - خطأ في تحديد موظف المبيعات`);
            continue;
          }

          await ctx.db.insert("customers", {
            name: customerData.name,
            phone: customerData.phone,
            region: customerData.region,
            goldDebt21: customerData.goldDebt21,
            cashDebt: customerData.cashDebt,
            creditLimit: customerData.creditLimit,
            salesPersonId,
          });
          results.created++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${customerData.name} - ${error instanceof Error ? error.message : "خطأ"}`);
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
    
    // جلب جميع عملاء الموظف أولاً
    customers = await ctx.db
      .query("customers")
      .withIndex("by_salesperson", (q) => q.eq("salesPersonId", currentUser._id))
      .collect();
    
    // فلتر بالمنطقة إذا كان محدد
    if (args.region && args.region !== "all") {
      customers = customers.filter(c => c.region === args.region);
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

    // جلب العملاء حسب الفلاتر
    if (args.salesPersonId) {
      const salesPersonId = args.salesPersonId;
      customers = await ctx.db
        .query("customers")
        .withIndex("by_salesperson", (q) => q.eq("salesPersonId", salesPersonId))
        .collect();
    } else {
      customers = await ctx.db.query("customers").collect();
    }
    
    // فلتر بالمنطقة إذا كان محدد
    if (args.region && args.region !== "all") {
      customers = customers.filter(c => c.region === args.region);
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

// مسح جميع العملاء (للأدمن فقط)
export const deleteAllCustomers = mutation({
  args: {},
  handler: async (ctx) => {
    const currentUser = await getCurrentUser(ctx);
    if (currentUser.role !== "admin") {
      throw new ConvexError("غير مصرح لك بمسح جميع العملاء");
    }

    const allCollections = await ctx.db.query("collections").collect();
    for (const collection of allCollections) {
      await ctx.db.delete(collection._id);
    }

    const allCustomers = await ctx.db.query("customers").collect();
    for (const customer of allCustomers) {
      await ctx.db.delete(customer._id);
    }

    return {
      deletedCustomers: allCustomers.length,
      deletedCollections: allCollections.length,
    };
  },
});
