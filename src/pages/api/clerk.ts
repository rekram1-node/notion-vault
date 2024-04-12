import { Webhook } from "svix";
import { type WebhookEvent } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { Notion } from "~/server/notionIntegration";
import { prisma } from "~/server/db";
import { buffer } from "micro";

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
    if (!(await validSignature(req))) {
      return res.status(400).json({
        message: "only valid signed events from clerk will be accepted",
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload: WebhookEvent = req.body;

    if (payload.type == "user.created" || payload.type == "session.created") {
      const userId = payload.data.id;
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
            encryptedContent: Buffer.from(""),
            serverSidePasswordSalt: Buffer.from(""),
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
    }

    return res.status(200).json({ message: "received" });
  } catch (e) {
    return res.status(500).json({ message: `unexpected error: ${String(e)}` });
  }
}

async function validSignature(req: NextApiRequest) {
  try {
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error(
        "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
      );
    }

    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return false;
    }

    const body = (await buffer(req)).toString();

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    const evt: WebhookEvent = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    const { id } = evt.data;
    const eventType = evt.type;

    console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
    console.log("Webhook body:", body);

    return true;
  } catch (_e) {
    return false;
  }
}
