import { readFileSync } from "node:fs";
import { join } from "node:path";
import layoutJs from "../hero/layout.js?raw";

export const LAYOUT = new Function(
  `${layoutJs}\nreturn { TITLE, SUBTITLE, HIGHLIGHT, HIGHLIGHT_URL, SMALL_TEXT, TIME_W };`
)();

const esc = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

export function titleMetadata() {
  const { SUBTITLE: sub, HIGHLIGHT: hl, HIGHLIGHT_URL: url } = LAYOUT;
  const at = sub.indexOf(hl);
  const subHtml =
    at < 0
      ? esc(sub)
      : esc(sub.slice(0, at)) +
        `<a class="hl" href="${esc(url)}" target="_blank" rel="noopener">${esc(hl)}</a>` +
        esc(sub.slice(at + hl.length));
  return { subHtml, subText: sub };
}

export const titleArt = () => LAYOUT.TITLE.join("\n");

export const fontB64 = (name) =>
  readFileSync(join("public/fonts", name)).toString("base64");
