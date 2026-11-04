import { SITE, PAGES } from "../lib/site.mjs";
import { titleMetadata } from "../lib/hero-data.mjs";
import heroJs from "../hero/hero.js?raw";

export function GET() {
  const { subText } = titleMetadata(heroJs);
  const sub = subText.replace("hack club", "[hack club](https://hackclub.com)");
  const text = `# sam liu

source: ${SITE}/

${sub}

email: [sam@samliu.dev](mailto:sam@samliu.dev)

${PAGES.map((p) => `- [${p}](${SITE}/${p})`).join("\n")}

the page shows the view from sam's window in waterloo, ontario as colour ASCII art, scrubbing through the last 12 hours on load.
`;
  return new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
