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
    region: v.string(), // المنطقة
    goldDebt21: v.number(),
    cashDebt: v.number(),
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
};

export default defineSchema({
  ...customAuthTables,
  ...applicationTables,
});
