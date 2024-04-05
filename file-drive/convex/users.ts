import { v } from 'convex/values';

import { internalMutation } from './_generated/server';

export const createUser = internalMutation({
  args: { tokenIdentifier: v.string() },
  async handler(ctx, args) {
    console.log(`Token inserting user`);
    await ctx.db.insert('users', {
      tokenIdentifier: args.tokenIdentifier,
      orgIds: [],
    });
  },
});
