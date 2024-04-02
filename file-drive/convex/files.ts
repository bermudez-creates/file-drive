import { mutation } from './_generated/server';
import { v } from 'convex/values';

// takes from the frontend and passes it to the backend
export const createFile = mutation({
  args: {
    name: v.string(),
    age: v.number(),
  },
  async handler(ctx, args) {
    console.log('Handler files insert');
    await ctx.db.insert('files_table', {
      names: args.name,
      age: args.age,
    });
  },
});
