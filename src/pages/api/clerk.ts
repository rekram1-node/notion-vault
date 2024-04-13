import { Webhook } from "svix";
import { type WebhookEvent } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { Notion } from "~/server/notionIntegration";
import { prisma } from "~/server/db";
import { buffer } from "micro";

// turn off default body parser so that webhook
// signing verification can be properly executed
export const config = {
  api: {
    bodyParser: false,
  },
};

type ResponseData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "POST") {
    return res.status(405);
  }
  await handleClerkWebhook(req, res);
}

async function handleClerkWebhook(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  try {
    if (!(await validSignature(req, res))) {
      return;
    }

    const bodyBuffer = await buffer(req);
    const bodyString = bodyBuffer.toString();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload: WebhookEvent = JSON.parse(bodyString);

    let userId = "";
    if (payload.type == "user.created") {
      userId = payload.data.id;
    }

    if (payload.type == "session.created") {
      userId = payload.data.user_id;
    }

    if (!userId) {
      return res.status(400).json({ message: "event is missing user id" });
    }

    const notion = await Notion.New(userId);
    if (!notion.isOk) {
      return res
        .status(400)
        .json({ message: `unexpected error: ${notion.error.message}` });
    }

    const pages = await notion.data.ReadPages();
    if (!pages.isOk) {
      return res.status(500).json({
        message: `failed to read pages for account ${userId}: ${pages.error.message}`,
      });
    }

    const documents = await prisma.encryptedDocument.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        notionPageId: true,
      },
    });

    for (const page of pages.data) {
      // check if a page has already been created
      if (documents.some((document) => document.notionPageId === page.id)) {
        continue;
      }

      const minimalDocument = await prisma.encryptedDocument.create({
        data: {
          userId,
          name: page.name,
          notionPageId: page.id,
          encryptedContent: Buffer.from("", "base64"),
          serverSidePasswordSalt: Buffer.from("", "base64"),
          passwordHash: "",
          documentSalt: "",
          iv: "",
          passwordSalt: "",
        },
      });

      const result = await notion.data.AppendEmbeddedBlock(
        page.id,
        minimalDocument.id,
      );
      if (!result.isOk) {
        return res.status(500).json({
          message: `failed to append embedded block to page ${result.error.message}`,
        });
      }
    }

    return res.status(200).json({ message: "received" });
  } catch (e) {
    return res.status(500).json({ message: `unexpected error: ${String(e)}` });
  }
}

async function validSignature(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  try {
    const CLERK_WEBHOOK_SIGNING_SECRET =
      process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!CLERK_WEBHOOK_SIGNING_SECRET) {
      console.error(
        "Please add CLERK_WEBHOOK_SIGNING_SECRET from Clerk Dashboard to .env",
      );
      res.status(500).json({
        message: "missing signing secret",
      });
      return false;
    }

    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      res.status(400).json({
        message: "missing headers",
      });
      return false;
    }

    const body = (await buffer(req)).toString();
    // Create a new Svix instance with your secret.
    const wh = new Webhook(CLERK_WEBHOOK_SIGNING_SECRET);

    wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });

    return true;
  } catch (e) {
    res.status(400).json({
      message: `failed to verify webhook event: ${String(e)}`,
    });
    return false;
  }
}
