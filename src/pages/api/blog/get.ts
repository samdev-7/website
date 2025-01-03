import { APIResponseError, Client } from "@notionhq/client";
import type { APIRoute } from "astro";
import type { BlogDbPage, BlogPage } from "../../../utils/notionTypes";
import { findPost } from "../../../utils/server/notion";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) {
    return new Response(
      JSON.stringify({
        status: 400,
        body: "Invalid request",
      })
    );
  }

  const result: BlogPage | undefined = await findPost(slug);

  if (!result) {
    return new Response(
      JSON.stringify({
        status: 404,
        body: "Post not found",
      })
    );
  }

  return new Response(JSON.stringify({ ok: true, page: result }));
};
