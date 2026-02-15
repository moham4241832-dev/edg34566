import { internalMutation } from "./_generated/server";

export const clearOldOverdueData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // حذف كل البيانات القديمة من جدول overdueStatus
    const allStatuses = await ctx.db.query("overdueStatus").collect();
    
    for (const status of allStatuses) {
      await ctx.db.delete(status._id);
    }
    
    return { deleted: allStatuses.length };
  },
});
