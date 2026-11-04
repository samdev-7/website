import { SITE } from "../lib/site.mjs";
import { contentPages } from "../lib/pages.mjs";
import { titleMetadata } from "../lib/hero-data.mjs";

export function GET() {
  const { subText } = titleMetadata();
  const pages = contentPages().map(
    (p) => `- [${p.title}](${SITE}/${p.slug}.md): ${p.description}`
  );
  const text = `# sam liu

> ${subText}. the home page (${SITE}) shows the live view from sam's window in waterloo, ontario as colour ASCII art.

## pages

- [home](${SITE}/index.md): name, one-line description, email and links to the pages below
${pages.join("\n")}

## optional

- [everything in one file](${SITE}/llms-full.txt)
`;
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
