import { readFileSync } from "node:fs";
import { join } from "node:path";

const esc = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");

const jsString = (js, name) =>
  js.match(new RegExp(`const ${name} = '((?:[^'\\\\]|\\\\.)*)'`))[1];

export function titleMetadata(js) {
  const [sub, hl, url] = ["SUBTITLE", "HIGHLIGHT", "HIGHLIGHT_URL"].map((k) =>
    jsString(js, k)
  );
  const at = sub.indexOf(hl);
  const subHtml =
    at < 0
      ? esc(sub)
      : esc(sub.slice(0, at)) +
        `<a class="hl" href="${esc(url)}" target="_blank" rel="noopener">${esc(hl)}</a>` +
        esc(sub.slice(at + hl.length));
  return { subHtml, subText: sub };
}

const offsetOf = (iso) => {
  const m = iso.match(/([+-])(\d\d):(\d\d)$/);
  return m ? (m[1] === "-" ? -1 : 1) * (+m[2] * 60 + +m[3]) : 0;
};

export function frames() {
  const info = JSON.parse(readFileSync("data/scrub-first.json", "utf8"));
  const t0 = Date.parse(info.first),
    off0 = offsetOf(info.first),
    off1 = offsetOf(info.last);
  const first = {
    cols: info.cols,
    rows: info.rows,
    at: Math.round(t0 / 1000),
    off: off0,
    data: info.data,
  };
  const local = new Date(Date.parse(info.last) + off1 * 60000),
    h = local.getUTCHours();
  const zone = { "-300": "est", "-240": "edt" }[off1] ?? "";
  const time =
    `${h % 12 || 12}:${String(local.getUTCMinutes()).padStart(2, "0")} ${h < 12 ? "am" : "pm"} ${zone}`.trim();
  return { first: JSON.stringify(first), photoTime: time, photoIso: info.last };
}

export const fontB64 = (name) =>
  readFileSync(join("public/fonts", name)).toString("base64");
