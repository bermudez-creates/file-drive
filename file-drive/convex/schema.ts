import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// how we expect/define our 'files_table'
export default defineSchema({
  files_table: defineTable({
    names: v.string(),
    orgId: v.string(),
  }).index('by_orgId', ['orgId']),
  users: defineTable({
    tokenIdentifier: v.string(),
  }),
});
