import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("news_table").collect();
  },
});

export const saveNews = mutation({
  args: {
    author: v.any(),
    category: v.any(),
    country: v.any(),
    description: v.any(),
    urlToImage: v.any(),
    language: v.any(),
    publishedAt: v.any(),
    source: v.any(),
    title: v.any(),
    url: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("news_table", {
      ...args,
    });
  },
});
