import { type WebhookEvent } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";
import { Notion } from "~/server/notionIntegration";
import { prisma } from "~/server/db";
import crypto from "crypto";

type ResponseData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  switch (req.method) {
    case "GET":
      res.status(200).json({ message: "Hello from Next.js!" });
      break;
    case "POST":
      await handleClerkWebhook(req, res);
      break;
    default:
      res.status(400).json({ message: `Unsupported Method: ${req.method}` });
  }
}

async function handleClerkWebhook(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  try {
    if (!validSignature(req)) {
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

function validSignature(req: NextApiRequest) {
  try {
    const svixSignature = req.headers["svix-signature"];
    if (!svixSignature) {
      return false;
    }
    if (typeof svixSignature !== "string") {
      return false;
    }
    const svixId = req.headers["svix-id"];
    if (typeof svixId !== "string") {
      return false;
    }
    const svixTimestamp = req.headers["svix-timestamp"];
    if (typeof svixTimestamp !== "string") {
      return false;
    }

    const signedContent = `${svixId}.${svixTimestamp}.${req.body}`;
    const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? "";
    const secretBytes = new Buffer(secret.split("_")[1] ?? "", "base64");
    const signature = crypto
      .createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    if (signature !== svixSignature) {
      return false;
    }

    return true;
  } catch (_e) {
    return false;
  }
}
