import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

// how we expect/define our 'files_table'
export default defineSchema({
  files_table: defineTable({
    name: v.string(),
    orgId: v.string(),
    fileId: v.id('_storage'),
  }).index('by_orgId', ['orgId']),

  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(v.string()),
  }).index('by_tokenIdentifier', ['tokenIdentifier']),
});
