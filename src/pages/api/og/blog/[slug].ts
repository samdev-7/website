// https://og-playground.vercel.app/?share=jZNNb9swDIb_CqfTBkSzm2TAYGQ7DNiGAetlzTEX2WJsdZJoSPLsoOh_H5U0bdIv9GBZtB9SfEnqRjSkUVSiKOCStNka1FCryCt56FLqY1UUSRk7Gq8H87EhV_DTk0efYuFU-IvJ-LaI2CRDPhZNUvJobMLG52elzT9I45eN2FqcIC-yIQt1K8fOJIRObgdrYdy_NuJrdgJ45JZwSnI5HTFgRxdlw4lguPd54nVKgbPyYn7CMt0f2H3wBQffkk8swJmarGb0Sjn4bYZV0b_kNWcvN8kFw8XrGBPfLLWn0KrgdB-sO4c20HjQmzPKMq6HmMx2J9Fr2P91gaUcmDaonfxUlhx-Xs6X_F0uLh4OOT3ipU4cQk455PGkY8nq85KdacrdOCsYOJnTuKSA0FNMERTveGJ4RiAS-Xdn4p_W5ydlUtPoQUFQdW0SdGQRRpM6-PHrz9UaAtWUTBOhD8TaXQ7-JrmdXD4zXDyFAbWcl2UG9qVg6vkwzLYB0b-Z3qG1NL6K3-8POzET1O-vj6huxGh06kT1uSxnokPTdklUy2xorIdWVFtlI84EOro2612f7zL16LPJgXJvvrsatahSGPB2JpKqGVnf3Wh4j1OPwTjutbIfxO1_

import type { APIRoute } from "astro";
import { findPost } from "../../../../utils/server/notion";
import { NotionAPI } from "notion-client";
import { ImageResponse } from "@vercel/og";
import handler from "../../../../components/react/BlogOg";
import {
  getBackgroundColor,
  getForegroundColor,
} from "../../../../utils/notionColors";

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

  const colors = page.tag_colors.map((color) => getForegroundColor(color));

  return handler({ tag_colors: colors });
};
