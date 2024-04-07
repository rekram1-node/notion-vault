// import { type WebhookEvent } from "@clerk/nextjs/server";

// export async function POST(request: Request) {
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   const payload: WebhookEvent = await request.json();
//   console.log(payload);
// }

// export async function GET() {
//   return Response.json({ message: "Hello World!" });
// }

import { type WebhookEvent } from "@clerk/nextjs/server";
import type { NextApiRequest, NextApiResponse } from "next";

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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const payload: WebhookEvent = req.body;
  console.log(payload);
  return res.status(200).json({ message: "received" });
}
