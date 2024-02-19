import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";
import type { EncryptedDocument  } from "@prisma/client";

// Create a new ratelimiter, that allows 3 requests per 1 minute
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(3, "1 m"),
//   analytics: true,
// });

export const protectedPagesRouter = createTRPCRouter({


//   getAll: publicProcedure.query(async ({ ctx }) => {
//     const posts = await ctx.prisma.post.findMany({
//       take: 100,
//       orderBy: [{ createdAt: "desc" }],
//     });

//     return addUserDataToPosts(posts);
//   }),

//   getPostsByUserId: publicProcedure
//     .input(
//       z.object({
//         userId: z.string(),
//       })
//     )
//     .query(({ ctx, input }) =>
//       ctx.prisma.post
//         .findMany({
//           where: {
//             authorId: input.userId,
//           },
//           take: 100,
//           orderBy: [{ createdAt: "desc" }],
//         })
//         .then(addUserDataToPosts)
//     ),
  getAll: privateProcedure.query(async ({ctx}) => {
    const { userId } = ctx;
    const documents = await ctx.prisma.encryptedDocument.findMany({
      where: {
        userId,
      },
      orderBy: [{updatedAt: "desc"}]
    });
    return documents;
  }),
  getById: privateProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const page = await ctx.prisma.encryptedDocument.findUnique({
      where: { 
        id: input.id,
        userId,
      },
    });

    if (!page) throw new TRPCError({ code: "NOT_FOUND" });

    return page;
  }),
  // We could make this more strict
  create: privateProcedure
    .input(
      z.object({
        name: z.string().min(1).max(280),
        encryptedContent: z.string(),
        passwordHash: z.string().min(8),
        passwordSalt: z.string().min(1),
        iv: z.string().min(1),
        documentSalt: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      await ctx.prisma.encryptedDocument.create({
        data: {
          userId,
          name: input.name,
          encryptedContent: input.encryptedContent,
          passwordHash: input.passwordHash,
          passwordSalt: Buffer.from(input.passwordSalt, 'base64'),
          iv: Buffer.from(input.iv, 'base64'),
          documentSalt: Buffer.from(input.documentSalt, 'base64'),
        }
      });
      // const { success } = await ratelimit.limit(authorId);
      // if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });

      // const post = await ctx.prisma.post.create({
      //   data: {
      //     authorId,
      //     content: input.content,
      //   },
      // });

      // return post;
    }),
});