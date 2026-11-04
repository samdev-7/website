import { SITE } from "../lib/site.mjs";
import { contentPages } from "../lib/pages.mjs";

export function GET() {
  const urls = ["/", ...contentPages().map((p) => `/${p.slug}`)].map(
    (u) => `  <url><loc>${SITE}${u}</loc></url>`
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } }
  );
}
