import { ConvexError, v } from 'convex/values';

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

// export const addOrgIdToUser = internalMutation({
//   args: { tokenIdentifier: v.string(), orgId: v.string() },
//   async handler(ctx, args) {
//     const user = await ctx.db
//       .query('users')
//       .withIndex('by_tokenIdentifier', (q) =>
//         q.eq('tokenIdentifier', args.tokenIdentifier)
//       )
//       .first();

//     if (!user) {
//       throw new ConvexError('User is not defined');
//     }

//     console.log(`Adding organization to user`);
//     // How databased are updated in convex => Pass unique identifier (_id)
//     await ctx.db.patch(user._id, {
//       orgIds: [...user.orgIds, args.orgId],
//     });
//   },
// });

export const orgIdToUser = internalMutation({
  args: { tokenIdentifier: v.string(), orgId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query('users')
      .withIndex('by_tokenIdentifier', (q) =>
        q.eq('tokenIdentifier', args.tokenIdentifier)
      )
      .first();

    if (!user) {
      throw new ConvexError('Undefined');
    }
    console.log(user._id, user.tokenIdentifier, user.orgIds);
    await ctx.db.patch(user._id, {
      orgIds: [...user.orgIds, args.orgId],
    });
  },
});
