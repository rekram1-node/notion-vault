import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSalt } from "~/encryption/encryption";
import { hashPassword } from "~/encryption/serverEncryption";
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

export const encryptedDocumentRouter = createTRPCRouter({
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

  getBase: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const document = await ctx.prisma.encryptedDocument.findUnique({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!document) throw new TRPCError({ code: "NOT_FOUND" });

      const { passwordSalt } = document;

      return {
        passwordSalt,
      };
    }),

  validatePassword: privateProcedure
    .input(z.object({ id: z.string(), hashedPassword: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const document = await ctx.prisma.encryptedDocument.findUnique({
        where: {
          id: input.id,
          userId,
        },
        select: {
          passwordHash: true,
          encryptedContent: true,
          iv: true,
          documentSalt: true,
          serverSidePasswordSalt: true,
        },
      });

      if (!document) throw new TRPCError({ code: "NOT_FOUND" });

      // execute addition hashing for comparison to DB
      const passwordHash = await hashPassword(
        input.hashedPassword,
        document.serverSidePasswordSalt,
      );

      if (passwordHash !== document.passwordHash)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const { encryptedContent, iv, documentSalt } = document;

      return {
        encryptedContent: encryptedContent.toString("base64"),
        iv,
        documentSalt,
      };
    }),

  get: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const document = await ctx.prisma.encryptedDocument.findUnique({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!document) throw new TRPCError({ code: "NOT_FOUND" });

      return document;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        encryptedContent: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const document = await ctx.prisma.encryptedDocument.update({
        data: {
          encryptedContent: Buffer.from(input.encryptedContent, "base64"),
        },
        where: {
          id: input.id,
          userId,
        },
      });
      if (!document) throw new TRPCError({ code: "NOT_FOUND" });
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const document = await ctx.prisma.encryptedDocument.delete({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!document) throw new TRPCError({ code: "NOT_FOUND" });
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
      const serverSidePasswordSalt = createSalt();
      const passwordHash = await hashPassword(
        input.passwordHash,
        serverSidePasswordSalt,
      );

      await ctx.prisma.encryptedDocument.create({
        data: {
          userId,
          name: input.name,
          encryptedContent: Buffer.from(input.encryptedContent, "base64"),
          passwordHash,
          passwordSalt: input.passwordSalt,
          serverSidePasswordSalt,
          iv: input.iv,
          documentSalt: input.documentSalt,
        },
      });
    }),
});
