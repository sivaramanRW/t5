import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  news_table: defineTable({
    author: v.any(),
    category: v.any(),
    country: v.any(),
    description: v.any(),
    language: v.any(),
    publishedAt: v.any(),
    source: v.any(),
    title: v.any(),
    url: v.any(),
    urlToImage: v.any()
  }),
});