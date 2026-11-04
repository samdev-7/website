import { SITE } from "../../lib/site.mjs";
import { posts, formatDate } from "../../lib/writing.mjs";
import { body } from "../../lib/pages.mjs";

export function getStaticPaths() {
  return posts().map((p) => ({ params: { slug: p.slug }, props: { post: p } }));
}

export function GET({ props }) {
  const p = props.post;
  return new Response(
    `# ${p.title}\n\nsource: ${SITE}/writing/${p.slug}\nposted: ${formatDate(p.date)}\n\n${body(p)}\n`,
    { headers: { "Content-Type": "text/markdown; charset=utf-8" } }
  );
}
