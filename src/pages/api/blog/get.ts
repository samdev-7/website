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
        ok: false,
        message: "Invalid request",
      }),
      { status: 400 }
    );
  }

  const result: BlogPage | undefined = await findPost(slug);

  if (!result) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Post not found",
      }),
      { status: 404 }
    );
  }

  return new Response(JSON.stringify({ ok: true, page: result }));
};
