import type { APIRoute } from "astro";
import { findPost } from "../../../../utils/server/notion";
import handler from "../../../../components/react/BlogOg";

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug;

  if (!slug) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Invalid request",
      }),
      { status: 400 }
    );
  }

  if (!slug.match(/^[a-z0-9-]+$/)) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Post not found",
      }),
      { status: 404 }
    );
  }

  const page = await findPost(slug);

  if (!page) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Post not found",
      }),
      { status: 404 }
    );
  }

  return handler({ page });
};
