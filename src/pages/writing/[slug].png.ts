import { posts } from "../../lib/writing.mjs";
import { card } from "../../lib/og-card.mjs";

export function getStaticPaths() {
  return posts().map((p) => ({ params: { slug: p.slug }, props: { post: p } }));
}

export async function GET({ props }) {
  return new Response(await card(props.post), {
    headers: { "Content-Type": "image/png" },
  });
}
