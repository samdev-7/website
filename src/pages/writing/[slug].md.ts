import { SITE } from "../../lib/site.mjs";
import { posts, dateline } from "../../lib/writing.mjs";
import { body } from "../../lib/pages.mjs";
import { markdown } from "../../figures/shared.mjs";

export function getStaticPaths() {
  return posts().map((p) => ({ params: { slug: p.slug }, props: { post: p } }));
}

export function GET({ props }) {
  const p = props.post;
  return new Response(
    `# ${p.title}\n\nsource: ${SITE}/writing/${p.slug}\nposted: ${dateline(p)}\n\n${markdown(body(p), `${SITE}/writing/${p.slug}/`)}\n`,
    { headers: { "Content-Type": "text/markdown; charset=utf-8" } }
  );
}
