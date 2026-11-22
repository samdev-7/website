import { SITE } from "../lib/site.mjs";

export function GET() {
  return new Response(
    `# 404: not found\n\nthere is no page at this address. it may have moved, or the link may be wrong.\n\n- [home](${SITE}/index.md)\n- [writing](${SITE}/writing.md)\n- [sitemap](${SITE}/sitemap.xml)\n`,
    { headers: { "Content-Type": "text/markdown; charset=utf-8" } }
  );
}
