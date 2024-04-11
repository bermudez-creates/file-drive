import { ConvexError, v } from 'convex/values';

import { MutationCtx, QueryCtx, internalMutation } from './_generated/server';

export async function getUser(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string
) {
  console.log(`TOKEN in users.ts`, tokenIdentifier);
  const user = await ctx.db
    .query('users')
    .withIndex('by_tokenIdentifier', (q) =>
      q.eq('tokenIdentifier', tokenIdentifier)
    )
    .first();
  console.log(`USER in users.ts:`, user);
  if (!user) {
    throw new ConvexError('Undefined user');
  }

  return user;
}

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

export const orgIdToUser = internalMutation({
  args: { tokenIdentifier: v.string(), orgId: v.string() },
  async handler(ctx, args) {
    console.log(args.tokenIdentifier);
    const user = await getUser(ctx, args.tokenIdentifier);
    console.log(`User in Org users.ts`, user);
    await ctx.db.patch(user._id, {
      orgIds: [...user.orgIds, args.orgId],
    });
  },
});
