/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/"]);

// // This example protects all routes including api/trpc routes
// // Please edit this to allow other routes to be public as needed.
// // See https://clerk.com/docs/references/nextjs/clerk-middleware for more information about configuring your Middleware
export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect();
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
    // "/api/trpc((?!/protected).*)(.*)",
    "/api/trpc(.*)",
  ],
};
