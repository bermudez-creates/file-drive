import {
  MutationCtx,
  QueryCtx,
  internalMutation,
  mutation,
  query,
} from './_generated/server';
import { ConvexError, v } from 'convex/values';
import { getUser } from './users';
import { fileTypes } from './schema';
import { Doc, Id } from './_generated/dataModel';

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

  const hasAccess =
    user.orgIds.some((item) => item.orgId === orgId) ||
    user.tokenIdentifier.includes(orgId);

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
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

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
    favorites: v.optional(v.boolean()),
    deletedOnly: v.optional(v.boolean()),
  },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      return [];
    }
    // return entries stored in this table
    let files = await ctx.db
      .query('files_table')
      .withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
      .collect();

    const query = args.query;

    if (query) {
      files = files.filter((file) =>
        file.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
      );
    }

    if (args.favorites) {
      const favorites = await ctx.db
        .query('favorites')
        .withIndex('by_userId_org_Id_file_Id', (q) =>
          q.eq('userId', hasAccess.user._id).eq('orgId', args.orgId)
        )
        .collect();

      files = files.filter((file) =>
        favorites.some((favorite) => favorite.fileId === file._id)
      );
    }

    if (args.deletedOnly) {
      files = files.filter((file) => file.shouldDelete);
    } else {
      files = files.filter((file) => !file.shouldDelete);
    }

    return files;

    // const filesWithUrl = await Promise.all(
    //   files.map(async (file) => ({
    //     ...file,
    //     url: await ctx.storage.getUrl(file.fileId),
    //   }))
    // );

    // return filesWithUrl;
  },
});

export const removeFiles = internalMutation({
  args: {},
  async handler(ctx) {
    const files = await ctx.db
      .query('files_table')
      .withIndex('by_shouldDelete', (q) => q.eq('shouldDelete', true))
      .collect();

    await Promise.all(
      files.map(async (file) => {
        await ctx.storage.delete(file.fileId);
        return await ctx.db.delete(file._id);
      })
    );
  },
});

export const deleteFile = mutation({
  args: { fileId: v.id('files_table') },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError('no access to file');
    }
    console.log('Deleting');

    const isAdmin =
      access.user.orgIds.find((org) => org.orgId === access.file.orgId)
        ?.role === 'admin';

    if (!isAdmin) {
      throw new ConvexError('Permission denied');
    }
    await ctx.db.patch(args.fileId, {
      shouldDelete: true,
    });
  },
});

export const restoreFile = mutation({
  args: { fileId: v.id('files_table') },
  async handler(ctx, args) {
    const access = await hasAccessToFile(ctx, args.fileId);

    if (!access) {
      throw new ConvexError('no access to file');
    }
    console.log('Deleting');

    const isAdmin =
      access.user.orgIds.find((org) => org.orgId === access.file.orgId)
        ?.role === 'admin';

    if (!isAdmin) {
      throw new ConvexError('Permission denied');
    }
    await ctx.db.patch(args.fileId, {
      shouldDelete: false,
    });
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
    console.log('Favoriting');
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

export const getAllFavorites = query({
  args: { orgId: v.string() },
  async handler(ctx, args) {
    const hasAccess = await hasAccessToOrg(ctx, args.orgId);

    if (!hasAccess) {
      return [];
    }

    const favorites = await ctx.db
      .query('favorites')
      .withIndex('by_userId_org_Id_file_Id', (q) =>
        q.eq('userId', hasAccess.user._id).eq('orgId', args.orgId)
      )
      .collect();

    return favorites;
  },
});

async function hasAccessToFile(
  ctx: QueryCtx | MutationCtx,
  fileId: Id<'files_table'>
) {
  const file = await ctx.db.get(fileId);
  console.log(`Getting file:`, file);
  if (!file) {
    return null;
  }

  const hasAccess = await hasAccessToOrg(ctx, file.orgId);
  console.log(`Has access:`, hasAccess);

  if (!hasAccess) {
    return null;
  }

  return { user: hasAccess.user, file };
}
