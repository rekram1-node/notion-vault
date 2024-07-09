import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { Notion } from "./server/notionIntegration";
import { Queries } from "./server/db/queries";
import { db } from "./server/db/db";

const isProtectedRoute = createRouteMatcher(["/"]);

const queries = new Queries(db);

// // This example protects all routes including api/trpc routes
// // Please edit this to allow other routes to be public as needed.
// // See https://clerk.com/docs/references/nextjs/clerk-middleware for more information about configuring your Middleware
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
    const userId = auth().userId;
    const token = await auth().getToken();
    if (!userId || !token) return;

    const notion = await Notion.New(userId);
    if (!notion.isOk) {
      console.error(`unexpected error: ${notion.error.message}`);
      return;
    }

    const pages = await notion.data.ReadPages();
    if (!pages.isOk) {
      console.error(
        `failed to read pages for account ${userId}: ${pages.error.message}`,
      );
      return;
    }

    const documents = await queries.readAllEncryptedDocuments(userId);

    for (const page of pages.data) {
      // check if a page has already been created
      if (documents.some((document) => document.notionPageId === page.id)) {
        continue;
      }

      const minimalDocument = await queries.createEncryptedDocument({
        userId: userId,
        name: page.name,
        notionPageId: page.id,
        encryptedContent: Buffer.from("", "base64"),
        serverSidePasswordSalt: Buffer.from("", "base64"),
        passwordHash: "",
        documentSalt: "",
        iv: "",
        passwordSalt: "",
      });

      if (!minimalDocument) {
        console.error(`failed to create minimal document for ${userId}`);
        return;
      }

      const result = await notion.data.AppendEmbeddedBlock(
        page.id,
        minimalDocument.id,
      );
      if (!result.isOk) {
        console.log(
          `failed to append embedded block to page ${result.error.message}`,
        );
        return;
      }
    }
  }
});

export const config = {
  matcher: [
    // This regex matches paths that do not end in a file extension or _next
    // and do not contain 'clerk' in the path.
    "/((?!.+\\.[\\w]+$|_next|.*clerk.*).*)",
    // authenticate root
    "/",
    // authenticate all api/trpc routes besides /protected
    "/api/trpc((?!/protected).*)(.*)",
  ],
};
