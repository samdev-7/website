import { Client } from "@notionhq/client";
import type { APIRoute } from "astro";
import type { BlogDbPage, BlogPage } from "../../../utils/notionTypes";
import { listPost } from "../../../utils/server/notion";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const MAX_LIMIT = 100;
  let limit =
    new Number(new URL(request.url).searchParams.get("limit")).valueOf() ??
    MAX_LIMIT;
  if (isNaN(limit) || limit > MAX_LIMIT || limit < 1) {
    limit = MAX_LIMIT;
  }

  const results = await listPost(limit);

  return new Response(
    JSON.stringify({
      success: true,
      pages: results,
    })
  );
};
