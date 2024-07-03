import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSalt } from "~/encryption/encryption";
import { hashPassword } from "~/encryption/serverEncryption";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
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

  getBase: publicProcedure
    .input(z.object({ id: z.string().length(25) }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.prisma.encryptedDocument.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!document)
        throw new TRPCError({
          code: "NOT_FOUND", // error code is used by frontend
          message: "document does not exist",
        });

      const { passwordSalt } = document;

      return {
        passwordSalt,
      };
    }),

  validatePassword: publicProcedure
    .input(
      z.object({
        id: z.string().length(25),
        hashedPassword: z.string().length(98),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.prisma.encryptedDocument.findUnique({
        where: {
          id: input.id,
        },
        select: {
          name: true,
          passwordHash: true,
          encryptedContent: true,
          iv: true,
          documentSalt: true,
          serverSidePasswordSalt: true,
        },
      });

      if (!document)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "document does not exist",
        });

      if (
        !document.documentSalt ||
        !document.encryptedContent ||
        !document.iv ||
        !document.serverSidePasswordSalt
      ) {
        throw new TRPCError({
          message: "document has not been initialized",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      // execute addition hashing for comparison to DB
      const passwordHash = await hashPassword(
        input.hashedPassword,
        document.serverSidePasswordSalt,
      );

      if (passwordHash !== document.passwordHash)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "invalid password",
        });

      const { encryptedContent, iv, documentSalt } = document;

      return {
        name: document.name,
        encryptedContent: encryptedContent.toString("base64"),
        iv,
        documentSalt,
      };
    }),

  get: publicProcedure
    .input(z.object({ id: z.string().length(25) }))
    .query(async ({ ctx, input }) => {
      const document = await ctx.prisma.encryptedDocument.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!document)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "document does not exist",
        });

      return document;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().length(25),
        encryptedContent: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.prisma.encryptedDocument.update({
        data: {
          encryptedContent: Buffer.from(input.encryptedContent, "base64"),
        },
        where: {
          id: input.id,
        },
      });
      if (!document)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "document does not exist",
        });
    }),

  initialize: publicProcedure
    .input(
      z.object({
        id: z.string().length(25),
        encryptedContent: z.string(),
        passwordHash: z.string().length(98),
        passwordSalt: z.string().length(24),
        iv: z.string().length(24),
        documentSalt: z.string().length(24),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const serverSidePasswordSalt = createSalt();
      const passwordHash = await hashPassword(
        input.passwordHash,
        serverSidePasswordSalt,
      );

      const document = await ctx.prisma.encryptedDocument.update({
        where: {
          id: input.id,
        },
        data: {
          encryptedContent: Buffer.from(input.encryptedContent, "base64"),
          passwordHash,
          passwordSalt: input.passwordSalt,
          serverSidePasswordSalt,
          iv: input.iv,
          documentSalt: input.documentSalt,
        },
      });

      return {
        name: document.name,
        decryptedContent: "",
        iv: input.iv,
        documentSalt: input.documentSalt,
      };
    }),

  delete: privateProcedure
    .input(z.object({ id: z.string().length(25) }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const document = await ctx.prisma.encryptedDocument.delete({
        where: {
          id: input.id,
          userId,
        },
      });

      if (!document)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "document does not exist",
        });
    }),

  // We could make this more strict
  create: privateProcedure
    .input(
      z.object({
        name: z.string().min(1).max(280),
        encryptedContent: z.string(),
        passwordHash: z.string().length(98),
        passwordSalt: z.string().length(24),
        iv: z.string().length(24),
        documentSalt: z.string().length(24),
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
          notionPageId: "",
        },
      });
    }),
});
