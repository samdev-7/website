import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as fontkit from "fontkit";
import sharp from "sharp";
import { SITE, CARD } from "./site.mjs";
import layout from "../hero/layout.js?raw";

const PUBLIC = join(process.cwd(), "public");
const ASPECT = Number(layout.match(/ASPECT = ([\d.]+)/)[1]);
const ROWS = 14,
  BAR_ROWS = 2,
  PAD = 1;
const TITLE = { max: 144, line: 96, min: 40, lead: 1.2 };
const COLOUR = { text: "#dcdcdc", title: "#ffffff", red: "#ff5555" };

const font = fontkit.create(
  readFileSync(join(PUBLIC, "fonts/IBMPlexMono-Regular-latin.woff2"))
);
const em = (v, size) => (v * size) / font.unitsPerEm;
const glyph = (c) => font.glyphsForString(c)[0];
const ADVANCE = glyph("m").advanceWidth;
const { ASC, DESC } = Array.from({ length: 95 }, (_, k) =>
  glyph(String.fromCharCode(32 + k)).bbox
).reduce(
  (m, b) => ({ ASC: Math.max(m.ASC, b.maxY), DESC: Math.max(m.DESC, -b.minY) }),
  { ASC: 0, DESC: 0 }
);

const ch = CARD.height / ROWS,
  COLS = Math.round(CARD.width / (ch * ASPECT)),
  cw = CARD.width / COLS,
  TOP = (ROWS - BAR_ROWS) * ch,
  THUMB = { height: Math.round(TOP) },
  CELL_FS = Math.min(ch, (ch * font.unitsPerEm) / (ASC + DESC)),
  CELL_BASE = (ch - em(ASC + DESC, CELL_FS)) / 2 + em(ASC, CELL_FS);

const path = (c, x, y, size, fill) =>
  c === " "
    ? ""
    : `<path fill="${fill}" transform="translate(${x} ${y}) scale(${em(1, size)} ${-em(1, size)})" d="${glyph(c).path.toSVG()}"/>`;

const cells = (text, col, y, fill) =>
  [...text]
    .map((c, k) =>
      path(c, (col + k) * cw + (cw - em(ADVANCE, CELL_FS)) / 2, y + CELL_BASE, CELL_FS, fill)
    )
    .join("");

const bar = (minutes) => {
  const host = new URL(SITE).host,
    read = `${minutes} min read`,
    y = TOP + ((BAR_ROWS - 1) * ch) / 2;
  return (
    cells(host, PAD, y, COLOUR.text) +
    cells("/writing", PAD + host.length, y, COLOUR.red) +
    cells(read, COLS - PAD - read.length, y, COLOUR.text)
  );
};

const wrap = (text, cols) =>
  text.split(" ").reduce(
    (lines, word) => {
      const last = lines.at(-1);
      if (!last) lines[lines.length - 1] = word;
      else if (last.length + 1 + word.length <= cols) lines[lines.length - 1] += ` ${word}`;
      else lines.push(word);
      return lines;
    },
    [""]
  );

const fit = (title) => {
  const width = CARD.width - 2 * PAD * cw,
    height = TOP - 2 * ch;
  for (let size = TITLE.max; size > TITLE.min; size -= 2) {
    const cols = Math.floor(width / em(ADVANCE, size)),
      lines = wrap(title, cols);
    if (
      (size >= TITLE.line ? lines.length === 1 : true) &&
      lines.every((l) => l.length <= cols) &&
      lines.length * size * TITLE.lead <= height
    )
      return { size, lines };
  }
  const size = TITLE.min;
  return { size, lines: wrap(title, Math.floor(width / em(ADVANCE, size))) };
};

const titleBlock = (title) => {
  const { size, lines } = fit(title),
    lead = size * TITLE.lead,
    top = (TOP - lead * lines.length) / 2,
    base = (lead - em(ASC + DESC, size)) / 2 + em(ASC, size),
    adv = em(ADVANCE, size);
  return lines
    .map((l, k) =>
      [...l].map((c, i) => path(c, PAD * cw + i * adv, top + k * lead + base, size, COLOUR.title)).join("")
    )
    .join("");
};

export async function card({ title, thumbnail, minutes }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD.width}" height="${CARD.height}">${thumbnail ? "" : titleBlock(title)}${bar(minutes)}</svg>`;
  const layers = [{ input: Buffer.from(svg), top: 0, left: 0 }];
  if (thumbnail) {
    const image = sharp(join(PUBLIC, thumbnail)),
      { width, height } = await image.metadata();
    if (width * THUMB.height !== height * CARD.width)
      console.warn(
        `og: ${thumbnail} is ${width}x${height}; pre-crop it to ${CARD.width}x${THUMB.height} or it will be centre-cropped`
      );
    layers.unshift({
      input: await image.resize(CARD.width, THUMB.height, { fit: "cover" }).toBuffer(),
      top: 0,
      left: 0,
    });
  }
  return sharp({ create: { ...CARD, channels: 3, background: "#000" } })
    .composite(layers)
    .png()
    .toBuffer();
}
