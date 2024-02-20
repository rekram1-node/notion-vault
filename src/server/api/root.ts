import { createTRPCRouter } from "~/server/api/trpc";
import { encryptedDocumentRouter } from "../routers/encryptedDocuments"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    encryptedDocuments: encryptedDocumentRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;