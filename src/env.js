import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NOTION_API_VERSION: z.string().default("2022-06-28"),
    NOTION_VAULT_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("<notion vault url here>"),
        "You forgot to set the notion vault URL",
      ),
    TURSO_DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes("<your url>"),
        "You forgot to change the default URL",
      ),
    TURSO_AUTH_TOKEN: z
      .string()
      .refine(
        (str) => !str.includes("<your auth token here>"),
        "You forgot to change the default auth token",
      ),
    // @ts-ignore
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_PUBLISHABLE_KEY_HERE"),
        "You forgot to change the default clerk publishable key",
      ),
    CLERK_SECRET_KEY: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_SECRET_KEY_HERE"),
        "You forgot to change the default clerk secret key",
      ),
    CLERK_WEBHOOK_SIGNING_SECRET: z
      .string()
      .refine(
        (str) => !str.includes("YOUR_WEBHOOK_SECRET_HERE"),
        "You forgot to change the default webhook secret",
      ),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    // @ts-ignore
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
    NOTION_VAULT_URL: process.env.NOTION_VAULT_URL,
    NOTION_API_VERSION: process.env.NOTION_API_VERSION,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
