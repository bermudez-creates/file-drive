import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const fileTypes = v.union(
  v.literal('image'),
  v.literal('csv'),
  v.literal('pdf')
);

export const roles = v.union(v.literal('admin'), v.literal('member'));

// how we expect/define our 'files_table'
export default defineSchema({
  files_table: defineTable({
    name: v.string(),
    orgId: v.string(),
    fileId: v.id('_storage'),
    type: fileTypes,
    shouldDelete: v.optional(v.boolean()),
  }).index('by_orgId', ['orgId']),
  favorites: defineTable({
    fileId: v.id('files_table'),
    orgId: v.string(),
    userId: v.id('users'),
  }).index('by_userId_org_Id_file_Id', ['userId', 'orgId', 'fileId']),
  users: defineTable({
    tokenIdentifier: v.string(),
    orgIds: v.array(
      v.object({
        orgId: v.string(),
        role: roles,
      })
    ),
  }).index('by_tokenIdentifier', ['tokenIdentifier']),
});
