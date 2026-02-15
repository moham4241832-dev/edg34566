import { internalMutation } from "./_generated/server";

// حذف جميع بيانات المبيعات القديمة
export const clearOldSalesData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const sales = await ctx.db.query("sales").collect();
    let deletedCount = 0;
    
    for (const sale of sales) {
      await ctx.db.delete(sale._id);
      deletedCount++;
    }
    
    return { success: true, deletedCount };
  },
});
