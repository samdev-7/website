import { SITE } from "../../lib/site.mjs";
import { posts, INTRO } from "../../lib/writing.mjs";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = posts().map(
    (p) =>
      `<item><title>${esc(p.title)}</title><link>${SITE}/writing/${p.slug}</link><guid isPermaLink="true">${SITE}/writing/${p.slug}</guid>${p.description ? `<description>${esc(p.description)}</description>` : ""}<pubDate>${p.date.toUTCString()}</pubDate></item>`
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>sam liu's writing</title><description>${INTRO}</description><link>${SITE}/writing</link><language>en-ca</language>\n${items.join("\n")}\n</channel></rss>\n`,
    { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } }
  );
}
