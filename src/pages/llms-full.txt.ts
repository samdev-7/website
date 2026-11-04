import { SITE } from "../lib/site.mjs";
import { contentPages, body } from "../lib/pages.mjs";
import { GET as home } from "./index.md.ts";

export async function GET() {
  const parts = [
    await (await home()).text(),
    ...contentPages().map(
      (p) => `# ${p.title}\n\nsource: ${SITE}/${p.slug}\n\n${body(p)}\n`
    ),
  ];
  return new Response(parts.join("\n---\n\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
