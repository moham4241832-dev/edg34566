import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// تخصيص جدول المستخدمين بإضافة حقول إضافية
const customAuthTables = {
  ...authTables,
  users: defineTable({
    ...authTables.users.validator.fields,
    fullName: v.optional(v.string()),
    role: v.optional(v.union(v.literal("admin"), v.literal("salesperson"))),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
};

const applicationTables = {
  customers: defineTable({
    name: v.string(),
    phone: v.string(),
    region: v.string(),
    goldDebt21: v.number(),
    cashDebt: v.number(),
    creditLimit: v.optional(v.number()),
    salesPersonId: v.id("users"),
  })
    .index("by_salesperson", ["salesPersonId"])
    .index("by_phone", ["phone"])
    .index("by_region", ["region"])
    .index("by_salesperson_and_region", ["salesPersonId", "region"]),

  collections: defineTable({
    customerId: v.id("customers"),
    salesPersonId: v.id("users"),
    goldAmount: v.number(),
    cashAmount: v.number(),
    notes: v.optional(v.string()),
    collectionDate: v.number(),
  })
    .index("by_customer", ["customerId"])
    .index("by_salesperson", ["salesPersonId"])
    .index("by_date", ["collectionDate"])
    .index("by_salesperson_and_date", ["salesPersonId", "collectionDate"]),

  overdueStatus: defineTable({
    customerId: v.id("customers"),
    goldOverdue25: v.union(v.number(), v.boolean()),
    cashOverdue25: v.union(v.number(), v.boolean()),
    goldOverdue40: v.union(v.number(), v.boolean()),
    cashOverdue40: v.union(v.number(), v.boolean()),
    goldOverdue60: v.union(v.number(), v.boolean()),
    cashOverdue60: v.union(v.number(), v.boolean()),
    goldOverdue90: v.union(v.number(), v.boolean()),
    cashOverdue90: v.union(v.number(), v.boolean()),
    goldOverdue90Plus: v.optional(v.union(v.number(), v.boolean())),
    cashOverdue90Plus: v.optional(v.union(v.number(), v.boolean())),
    lastUpdated: v.number(),
    importedBy: v.id("users"),
  })
    .index("by_customer", ["customerId"])
    .index("by_last_updated", ["lastUpdated"]),

  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(v.literal("high_debt"), v.literal("overdue_alert"), v.literal("collection_success"), v.literal("daily_summary")),
    title: v.string(),
    message: v.string(),
    customerId: v.optional(v.id("customers")),
    isRead: v.boolean(),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "isRead"]),

  sales: defineTable({
    branch: v.string(),
    salesperson: v.string(),
    // جعل الحقول اختيارية مؤقتاً للسماح بالبيانات القديمة
    gold18Star: v.optional(v.number()), // ستار عيار 18
    gold18Plain: v.optional(v.number()), // ساده عيار 18
    gold21Plain: v.optional(v.number()), // ساده عيار 21
    gold21Star: v.optional(v.number()), // ستار عيار 21
    // الحقول القديمة (للتوافق مع البيانات الموجودة)
    gold18: v.optional(v.number()),
    gold21: v.optional(v.number()),
    totalSales: v.number(),
    saleDate: v.number(),
    importedBy: v.id("users"),
  })
    .index("by_branch", ["branch"])
    .index("by_salesperson", ["salesperson"])
    .index("by_date", ["saleDate"])
    .index("by_branch_and_date", ["branch", "saleDate"]),
};

export default defineSchema({
  ...customAuthTables,
  ...applicationTables,
});
