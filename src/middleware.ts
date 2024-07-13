import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { Notion } from "./server/notionIntegration";
import { Queries } from "./server/db/queries";
import { db } from "./server/db/db";
import { env } from "./env";
import { encryptedDocumentsTable } from "./server/db/schema";

const isProtectedRoute = createRouteMatcher(["/"]);
const queries = new Queries(db);

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/clerk-middleware for more information about configuring your Middleware
export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) {
    return;
  }

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
  let count = 0;
  const creations = [];

  for (const page of pages.data) {
    count += 1;
    if (count > env.MAX_PAGES) return;

    if (documents.some((document) => document.notionPageId === page.id)) {
      continue;
    }

    creations.push(
      db
        .insert(encryptedDocumentsTable)
        .values({
          userId: userId,
          name: page.name,
          notionPageId: page.id,
          encryptedContent: Buffer.from("", "base64"),
          serverSidePasswordSalt: Buffer.from("", "base64"),
          passwordHash: "",
          documentSalt: "",
          iv: "",
          passwordSalt: "",
        })
        .returning({
          id: encryptedDocumentsTable.id,
          notionPageId: encryptedDocumentsTable.notionPageId,
        }),
    );
  }

  if (!isTuple(creations)) return;
  const createdDocuments = await db.batch(creations);

  for (const createdDoc of createdDocuments) {
    if (!createdDoc?.[0]) {
      console.error(`failed to create minimal document for ${userId}`);
      return;
    }

    const doc = createdDoc[0];
    const result = await notion.data.AppendEmbeddedBlock(
      doc.notionPageId,
      doc.id,
    );
    if (!result.isOk) {
      console.error(
        `failed to append embedded block to page ${result.error.message}`,
      );
    }
  }
});

function isTuple<T>(array: T[]): array is [T, ...T[]] {
  return array.length > 0;
}

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
