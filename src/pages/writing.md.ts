import { SITE } from "../lib/site.mjs";
import { posts, dateline, INTRO, listTitle } from "../lib/writing.mjs";

export function GET() {
  const list = posts().map(
    (p) =>
      `- ${dateline(p)}: [${listTitle(p)}](${SITE}/writing/${p.slug})${p.description ? ` (${p.description})` : ""}`
  );
  return new Response(
    `# writing\n\nsource: ${SITE}/writing\nfeed: ${SITE}/writing/rss.xml\n\n${INTRO}\n\n${list.join("\n") || "nothing here yet"}\n`,
    { headers: { "Content-Type": "text/markdown; charset=utf-8" } }
  );
}
