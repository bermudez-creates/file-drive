import { error } from 'console';
import { mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';

// takes from the frontend and passes it to the backend
export const createFile = mutation({
  args: {
    name: v.string(),
    age: v.number(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('You must be logged in');
    }
    console.log('Handler files insert');
    await ctx.db.insert('files_table', {
      names: args.name,
      age: args.age,
    });
  },
});

export const getFiles = query({
  args: {},
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    console.log('Handler getting files');
    // return entries stored in this table
    return ctx.db.query('files_table').collect();
  },
});
