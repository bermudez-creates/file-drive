import { MutationCtx, QueryCtx, mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getUser } from './users';
import { fileTypes } from './schema';

export const filesWithUrl = query({
  args: {},
  handler: async (ctx) => {
    const messages = await ctx.db.query('files_table').collect();
    return Promise.all(
      messages.map(async (message) => ({
        ...message,
        // If the message is an "image" its `body` is an `Id<"_storage">`
        ...(message.type === 'image'
          ? { url: await ctx.storage.getUrl(message.fileId) }
          : {}),
      }))
    );
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new ConvexError('You must be logged in');
  }

  return await ctx.storage.generateUploadUrl();
});

async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string,
  orgId: string
) {
  const user = await getUser(ctx, tokenIdentifier);

  const hasAccess =
    user.orgIds.includes(orgId) || user.tokenIdentifier.includes(orgId);

  return hasAccess;
}
// takes from the frontend and passes it to the backend
export const createFile = mutation({
  args: {
    name: v.string(),
    fileId: v.id('_storage'),
    orgId: v.string(),
    type: fileTypes,
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError('You must be logged in');
    }

    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );

    if (!hasAccess) {
      return new ConvexError(
        'User may be unauthorized to perform this function.'
      );
    }

    await ctx.db.insert('files_table', {
      name: args.name,
      orgId: args.orgId,
      fileId: args.fileId,
      type: args.type,
    });
  },
});

export const getFiles = query({
  args: {
    orgId: v.string(),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    // initial loadtime results in user being null
    const hasAccess = await hasAccessToOrg(
      ctx,
      identity.tokenIdentifier,
      args.orgId
    );

    if (!hasAccess) {
      return [];
    }
    // return entries stored in this table
    return ctx.db
      .query('files_table')
      .withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
      .collect();
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id('files_table') },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError('You must be logged in');
    }

    // file value is a promise, .then() returns values from database why file.orgId throws error
    const file = ctx.db.get(args.fileId).then((res) => console.log(res));

    if (!file) {
      throw new ConvexError('File may not exist');
    }

    // Prevents function on Convex from updating
    // const hasAccess = await hasAccessToOrg(
    //   ctx,
    //   identity.tokenIdentifier,

    // );
    // console.log(hasAccess);

    // if (!hasAccess) {
    //   return new ConvexError('User does not have access to delete this file.');
    // }

    await ctx.db.delete(args.fileId);
  },
});
