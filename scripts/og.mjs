import { readFileSync, writeFileSync } from "node:fs";
import { chrome, sleep } from "./cdp.mjs";

const root = new URL("..", import.meta.url);
const read = (p) => readFileSync(new URL(p, root));
const { TITLE, ASPECT } = new Function(
  read("src/hero/layout.js").toString() + "; return { TITLE, ASPECT };"
)();
const DESCRIPTION = read("src/lib/site.mjs")
  .toString()
  .match(/DESCRIPTION = ["']([^"']+)["']/)[1];

const W = 1200,
  MARGIN = 90;
const lines = [...TITLE, "", DESCRIPTION];
const cols = Math.max(...lines.map((l) => l.length)),
  rows = lines.length;
const cw = (W - 2 * MARGIN) / cols,
  ch = cw / ASPECT;
const H = Math.ceil(rows * ch + 2 * MARGIN),
  x0 = MARGIN,
  y0 = MARGIN;

const cells = [],
  word = DESCRIPTION.match(/(\w+)\W*$/),
  red0 = word.index,
  red1 = red0 + word[1].length;
lines.forEach((line, r) =>
  [...line].forEach((c, k) => {
    if (c !== " ")
      cells.push([
        k,
        r,
        c,
        r < TITLE.length
          ? "#ffffff"
          : k >= red0 && k < red1
            ? "#ff5555"
            : "#dcdcdc",
      ]);
  })
);

const font = (b64) =>
  `url(data:font/woff2;base64,${read("public/fonts/" + b64).toString("base64")})`;
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face { font-family: 'Plex'; src: ${font("IBMPlexMono-Regular-latin.woff2")}; }
html, body { margin: 0; background: #000; } canvas { display: block; width: ${W}px; height: ${H}px; }
</style><canvas width="${2 * W}" height="${2 * H}"></canvas><script>
document.fonts.load('10px Plex').then(() => {
  const c = document.querySelector('canvas').getContext('2d');
  c.scale(2, 2);
  c.fillStyle = '#000'; c.fillRect(0, 0, ${W}, ${H});
  // The hero's glyph size and baseline (hero.js measureFont, glyphSize, glyphBase):
  // the inkiest extents over every glyph fill the cell's height.
  c.font = '100px Plex';
  let ASC = 0, DESC = 0;
  for (let k = 32; k < 127; k++) {
    const m = c.measureText(String.fromCharCode(k));
    ASC = Math.max(ASC, m.actualBoundingBoxAscent / 100); DESC = Math.max(DESC, m.actualBoundingBoxDescent / 100);
  }
  const h = ${ch};
  const size = Math.min(h, h / (ASC + DESC)), base = (h - size * (ASC + DESC)) / 2 + size * ASC;
  c.font = size + 'px Plex'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  for (const [k, r, g, colour] of ${JSON.stringify(cells)}) {
    c.fillStyle = colour;
    c.fillText(g, ${x0} + (k + 0.5) * ${cw}, ${y0} + r * h + base);
  }
  // Crop to the ink, MARGIN (at 2x) all round, less at the top: the name's
  // first row is only the i's dot, so the name looks centred with its top higher.
  const cv = c.canvas, d = c.getImageData(0, 0, cv.width, cv.height).data, M = 2 * ${MARGIN}, T = Math.round(0.8 * M);
  let x1 = cv.width, y1 = cv.height, x2 = 0, y2 = 0;
  for (let y = 0; y < cv.height; y++) for (let x = 0; x < cv.width; x++) {
    const i = 4 * (y * cv.width + x);
    if (d[i] + d[i + 1] + d[i + 2] > 24) { x1 = Math.min(x1, x); x2 = Math.max(x2, x); y1 = Math.min(y1, y); y2 = Math.max(y2, y); }
  }
  const out = document.createElement('canvas');
  out.width = x2 - x1 + 1 + 2 * M; out.height = y2 - y1 + 1 + T + M;
  const o = out.getContext('2d');
  o.fillStyle = '#000'; o.fillRect(0, 0, out.width, out.height);
  o.drawImage(cv, x1, y1, x2 - x1 + 1, y2 - y1 + 1, M, T, x2 - x1 + 1, y2 - y1 + 1);
  window.PNG = out.toDataURL('image/png');
  document.title = 'done';
});
</script>`;

const c = await chrome();
await c.send("Emulation.setDeviceMetricsOverride", {
  width: W,
  height: H,
  deviceScaleFactor: 2,
  mobile: false,
});
await c.send("Page.navigate", {
  url: "data:text/html;base64," + Buffer.from(html).toString("base64"),
});
for (let k = 0; k < 50 && (await c.ev("document.title")) !== "done"; k++)
  await sleep(100);
const png = Buffer.from((await c.ev("PNG")).split(",")[1], "base64");
writeFileSync(new URL("public/og.png", root), png);
c.close();
console.log(`public/og.png: ${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`);
process.exit(0);
