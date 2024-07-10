import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createSalt } from "~/encryption/encryption";
import { hashPassword } from "~/encryption/serverEncryption";
import { env } from "~/env";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const encryptedDocumentRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    return await ctx.queries.readAllEncryptedDocuments(userId);
  }),

  getBase: publicProcedure
    .input(z.object({ id: z.string().length(25) }))
    .query(async ({ ctx, input }) => {
      const passwordSalt = await ctx.queries.readPasswordSalt(input.id);

      if (!passwordSalt)
        throw new TRPCError({
          code: "NOT_FOUND", // error code is used by frontend
          message: "document does not exist",
        });

      return passwordSalt;
    }),

  validatePassword: publicProcedure
    .input(
      z.object({
        id: z.string().length(25),
        hashedPassword: z.string().length(98),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const document = await ctx.queries.readEncryptedDocument(input.id);

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

  update: publicProcedure
    .input(
      z.object({
        id: z.string().length(25),
        encryptedContent: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.queries.updateEncryptedDocument(
        input.id,
        Buffer.from(input.encryptedContent, "base64"),
      );

      if (result.rowsAffected === 0)
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

      const document = await ctx.queries.activateEncryptedDocument(input.id, {
        encryptedContent: input.encryptedContent,
        passwordHash,
        passwordSalt: input.passwordSalt,
        serverSidePasswordSalt,
        iv: input.iv,
        documentSalt: input.documentSalt,
      });

      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "document does not exist",
        });
      }

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
      const result = await ctx.queries.deleteEncryptedDocument(
        userId,
        input.id,
      );

      if (result.rowsAffected === 0)
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
      const { userId, queries } = ctx;

      const numberOfDocuments =
        await queries.readNumberOfEncryptedDocuments(userId);

      if (numberOfDocuments === env.MAX_PAGES) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "you have reached the max number of protected pages",
        });
      }

      const serverSidePasswordSalt = createSalt();
      const passwordHash = await hashPassword(
        input.passwordHash,
        serverSidePasswordSalt,
      );

      await queries.createEncryptedDocument({
        userId,
        name: input.name,
        encryptedContent: Buffer.from(input.encryptedContent, "base64"),
        passwordHash,
        passwordSalt: input.passwordSalt,
        serverSidePasswordSalt,
        iv: input.iv,
        documentSalt: input.documentSalt,
        notionPageId: "",
      });
    }),
});
