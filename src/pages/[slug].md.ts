import { SITE } from "../lib/site.mjs";
import { contentPages, body } from "../lib/pages.mjs";

export function getStaticPaths() {
  return contentPages().map((p) => ({
    params: { slug: p.slug },
    props: { page: p },
  }));
}

export function GET({ props }) {
  const p = props.page;
  return new Response(
    `# ${p.title}\n\nsource: ${SITE}/${p.slug}\n\n${body(p)}\n`,
    { headers: { "Content-Type": "text/markdown; charset=utf-8" } }
  );
}
