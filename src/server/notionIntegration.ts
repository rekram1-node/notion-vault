import { type SearchPagesResponse } from "~/server/types/notion";
import { clerkClient } from "@clerk/nextjs/server";
import { type Result, ok, error } from "~/server/types/result";
import { api } from "~/server/utils";

export class Notion {
  embeddedBaseUrl: string;
  headers: HeadersInit;
  baseUrl = "https://api.notion.com/v1";
  searchUrl = this.baseUrl + "/search";
  appendToPageUrl = (pageId: string) =>
    this.baseUrl + `/blocks/${pageId}/children`;

  constructor(token: string) {
    this.headers = {
      Authorization: `Bearer ${token}`,
      "Notion-Version": process.env.NOTION_API_VERSION ?? "2022-06-28",
      "Content-Type": "application/json",
    };
    this.embeddedBaseUrl =
      process.env.NOTION_VAULT_URL ?? "https://cipher-scribe-sp2b.vercel.app";
  }

  static async New(clerkUserId: string) {
    const token = await readNotionToken(clerkUserId);
    if (!token.isOk) {
      return token;
    }

    return ok(new Notion(token.data));
  }

  async ReadPages() {
    try {
      const url = this.baseUrl + "/search";
      const response = await api<SearchPagesResponse>(url, {
        method: "POST",
        body: `{"filter":{"value":"page","property":"object"},"sort":{"direction":"ascending","timestamp":"last_edited_time"}}`,
        headers: this.headers,
      });
      if (!response.isOk) {
        return response;
      }

      const pages: Page[] = [];
      for (const document of response.data.results) {
        if (document.object !== "page") {
          continue;
        }

        const title =
          document.properties.title?.title[0]?.text.content ??
          document.properties.title?.title[0]?.plain_text ??
          `Page - ${document.id}`;

        pages.push({
          id: document.id,
          url: document.url,
          name: title,
        });
      }

      return ok(pages);
    } catch (e) {
      return error(new Error(`failed to read pages: ${String(e)}`));
    }
  }

  async AppendEmbeddedBlock(notionPageId: string, encryptedDocumentId: string) {
    const embeddedUrl =
      this.embeddedBaseUrl + `/protected/${encryptedDocumentId}`;
    const body = `{"children":[{"object":"block","type":"embed","embed":{"url":"${embeddedUrl}"}}]}`;
    const url = this.appendToPageUrl(notionPageId);
    const response = await api<never>(url, {
      method: "PATCH",
      body,
      headers: this.headers,
    });
    if (!response.isOk) {
      return response;
    }
    return ok();
  }
}

export interface Page {
  id: string;
  url: string;
  name: string;
}

const provider = "oauth_notion";

const readNotionToken = async (userId: string): Promise<Result<string>> => {
  try {
    const { data, totalCount } =
      await clerkClient().users.getUserOauthAccessToken(userId, provider);

    if (totalCount === 0 || data.length === 0) {
      return error(new Error("failed to read token, empty response"));
    }

    const oauth = data[0];
    if (!oauth?.token) {
      return error(
        new Error(`response doesn't contain token: ${JSON.stringify(oauth)}`),
      );
    }
    return ok(oauth.token);
  } catch (e) {
    return error(new Error(String(e)));
  }
};
