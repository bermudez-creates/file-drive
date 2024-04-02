import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// how we expect/define our 'files_table'
export default defineSchema({
  files_table: defineTable({
    age: v.float64(),
    names: v.string(),
  }),
});
