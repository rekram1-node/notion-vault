import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  // publicProcedure,
} from "~/server/api/trpc";

// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 3 requests per 1 minute
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(3, "1 m"),
//   analytics: true,
// });

export const protectedPagesRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    const documents = await ctx.prisma.encryptedDocument.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: [{ updatedAt: "desc" }],
    });
    return documents;
  }),
  get: privateProcedure
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
  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        encryptedContent: z.string(),
      })
    )
    .mutation(async({ctx, input}) => {
      const { userId } = ctx;
      const page = await ctx.prisma.encryptedDocument.update({
        data: {
          encryptedContent: input.encryptedContent,
        },
        where: {
          id: input.id,
          userId,
        }
      });
      if (!page) throw new TRPCError({ code: "NOT_FOUND" });
    }),
  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const page = await ctx.prisma.encryptedDocument.delete({
        where: {
          id: input.id,
          userId,
        }
      });

      if (!page) throw new TRPCError({ code: "NOT_FOUND" });
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
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const { success } = await ratelimit.limit(authorId);
      // if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      const { userId } = ctx;

      await ctx.prisma.encryptedDocument.create({
        data: {
          userId,
          name: input.name,
          encryptedContent: input.encryptedContent,
          passwordHash: input.passwordHash,
          passwordSalt: input.passwordSalt,
          iv: input.iv,
          documentSalt: input.documentSalt,
        },
      });
    }),
});
