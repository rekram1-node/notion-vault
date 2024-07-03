import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  // eventually we will kill off the /editor route since it is for development purposes exclusively...
  publicRoutes: ["/editor", "/api/clerk", "/encrypted(.*)"],
});

export const config = {
  matcher: [
    // This regex matches paths that do not end in a file extension or _next
    // and do not contain 'clerk' in the path.
    "/((?!.+\\.[\\w]+$|_next|.*clerk.*).*)",
    // authenticate root
    "/",
    // authenticate all api/trpc routes besides /encrypted
    "/api/trpc((?!/encrypted).*)(.*)",
  ],
};

// http://localhost:3000/encrypted/cly4tdw2d0000mdger7hfe3tq
