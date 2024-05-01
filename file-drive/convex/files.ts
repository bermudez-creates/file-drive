import { MutationCtx, QueryCtx, mutation, query } from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getUser } from './users';
import { fileTypes } from './schema';
import { Doc, Id } from './_generated/dataModel';

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

export async function hasAccessToOrg(
  ctx: QueryCtx | MutationCtx,

  orgId: string
) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_tokenIdentifier', (q) =>
      q.eq('tokenIdentifier', identity.tokenIdentifier)
    )
    .first();

  if (!user) {
    return null;
  }

  const hasAccess = user.tokenIdentifier.includes(orgId);

  if (!hasAccess) {
    return null;
  }

  return { user };
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
    query: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }

    // initial loadtime results in user being null
    const hasAccess = await hasAccessToOrg(
      ctx,

      args.orgId
    );

    if (!hasAccess) {
      return [];
    }
    // return entries stored in this table
    const files = await ctx.db
      .query('files_table')
      .withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
      .collect();

    const query = args.query;

    if (query) {
      return files.filter((file) =>
        file.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
    } else {
      return files;
    }
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
    const file = ctx.db.get(args.fileId);
    console.log(`File promise`, file);
    const res = file.then((x) => {});
    console.log(`Response`, res);

    console.log(args.fileId);
    if (!file) {
      throw new ConvexError('File may not exist');
    }

    // Prevents function on Convex from updating
    // const hasAccess = await hasAccessToOrg(
    //   ctx,
    //   ,

    // );
    // console.log(hasAccess);

    // if (!hasAccess) {
    //   return new ConvexError('User does not have access to delete this file.');
    // }

    await ctx.db.delete(args.fileId);
  },
});

export const toggleFavorite = mutation({
  args: { fileId: v.id('files_table') },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError('no access to file');
    }

    const favorite = await ctx.db
      .query('favorites')
      .withIndex('by_userId_org_Id_file_Id', (q) =>
        q
          .eq('userId', access.user._id)
          .eq('orgId', access.file.orgId)
          .eq('fileId', access.file._id)
      )
      .first();

    if (!favorite) {
      await ctx.db.insert('favorites', {
        fileId: access.file._id,
        userId: access.user._id,
        orgId: access.file.orgId,
      });
    } else {
      await ctx.db.delete(favorite._id);
    }
  },
});

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<'files_table'>
) {
  // file value is a promise, .then() returns values from database why file.orgId throws error
  const file = await ctx.db.get(fileId);

  if (!file) {
    return null;
  }

  const hasAccess = await hasAccessToOrg(ctx, file.orgId);

  if (!hasAccess) {
    return null;
  }

  return { user: hasAccess.user, file };
}
