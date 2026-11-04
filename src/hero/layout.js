const ASPECT = 0.6;
const CHARS = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(32 + i)
).join("");

const TITLE = [
  "                       _ _",
  " ___  __ _ _ __ ____  | (_)_   _",
  "/ __|/ _` | '_ ` _ \\  | | | | | |",
  "\\__ \\|(_| | | | | | | | | | |_| |",
  "|___/\\__,_|_| |_| |_| |_|_|\\__,_|",
];
const SUBTITLE = "getting teens shipping technical projects @ hack club";
const BOX_MARGIN = [6, 3];
const MIN_SIDE = 4;
const EDGE_SIDE = 2;
const MIN_TEXT_CELL = 6;
const HIGHLIGHT = "hack club";
const HIGHLIGHT_URL = "https://hackclub.com";
const TITLE_W = Math.max(...TITLE.map((l) => l.length));
const minCols = (navW) => Math.max(TITLE_W, navW) + 6 + 2 * EDGE_SIDE;
function subtitleLines(wrap, width) {
  if (!wrap) return [SUBTITLE];
  const hl = SUBTITLE.indexOf(HIGHLIGHT),
    inside = (k) => hl >= 0 && k > hl && k < hl + HIGHLIGHT.length;
  if (wrap === 2) {
    let best = -1;
    for (
      let k = SUBTITLE.indexOf(" ");
      k >= 0;
      k = SUBTITLE.indexOf(" ", k + 1)
    ) {
      if (inside(k)) continue;
      if (
        best < 0 ||
        Math.abs(k - SUBTITLE.length / 2) < Math.abs(best - SUBTITLE.length / 2)
      )
        best = k;
    }
    return best < 0
      ? [SUBTITLE]
      : [SUBTITLE.slice(0, best), SUBTITLE.slice(best + 1)];
  }
  const lines = [];
  let start = 0;
  while (SUBTITLE.length - start > width) {
    let k = SUBTITLE.lastIndexOf(" ", start + width);
    while (k > start && inside(k)) k = SUBTITLE.lastIndexOf(" ", k - 1);
    if (k <= start) k = SUBTITLE.indexOf(" ", start + width);
    if (k < 0) break;
    lines.push(SUBTITLE.slice(start, k));
    start = k + 1;
  }
  lines.push(SUBTITLE.slice(start));
  return lines;
}

function boxLayout(cols, rows, navW, contactW) {
  const [M, MB] = BOX_MARGIN;
  for (const wrap of [0, 2, 3]) {
    const side = wrap === 3 ? EDGE_SIDE : MIN_SIDE;
    const sub = subtitleLines(
      wrap,
      Math.max(TITLE_W, navW, cols - 2 * side - 6)
    );
    const textW = Math.max(TITLE_W, navW, ...sub.map((l) => l.length));
    const wrapMail = textW - contactW - (navW - 2) < 3;
    const lines = boxLines([
        ...TITLE,
        "",
        ...sub,
        "",
        " ".repeat(textW),
        ...(wrapMail ? ["", ""] : []),
        "",
      ]),
      w = lines[0].length;
    let x0 = M,
      bottom = MB;
    if (cols - M - w < 2 * M) {
      x0 = Math.floor((cols - w) / 2);
      bottom = Math.min(MB, Math.round((x0 * MB) / M));
    }
    const y0 = rows - bottom - lines.length;
    if (x0 >= side && y0 >= 0)
      return {
        ...frameBox(cols, lines, x0, y0),
        side: x0,
        bottom,
        textW,
        sub,
        wrapMail,
      };
  }
  return { cells: new Map(), side: M, bottom: MB };
}
const TIME_W = "12:00 pm est".length;
function infoLayout(cols, text, side, top, limit) {
  const w = Math.max(...text.map((l) => l.length)) + 4;
  const lines = ["", ...text, ""].map((l) => " ".repeat(w)),
    x0 = cols - side - w,
    y0 = top;
  if (x0 < 0 || y0 + lines.length >= limit) return { cells: new Map() };
  const box = frameBox(cols, lines, x0, y0, false);
  return { ...box, textX: x0 + 2, textY: y0 };
}
function boxLines(body) {
  const inner = Math.max(...body.map((l) => l.length)) + 4;
  return [
    "+" + "-".repeat(inner) + "+",
    ...body.map((l) => "|  " + l.padEnd(inner - 2) + "|"),
    "+" + "-".repeat(inner) + "+",
  ];
}
function frameBox(cols, lines, x0, y0, bordered = true) {
  const cells = new Map(),
    w = lines[0].length;
  lines.forEach((line, r) =>
    [...line].forEach((c, k) => {
      const border =
        bordered &&
        (r === 0 || r === lines.length - 1 || k === 0 || k === line.length - 1);
      cells.set((y0 + r) * cols + x0 + k, [
        border ? CHARS.indexOf(c) : 0,
        [160, 160, 160],
      ]);
    })
  );
  return {
    cells,
    textX: x0 + 3,
    textY: y0 + 1,
    x0,
    x1: x0 + w,
    y0,
    y1: y0 + lines.length,
  };
}
function heroBoxes(cols, rows, navW, contactW, info) {
  const title = boxLayout(cols, rows, navW, contactW);
  const box =
    title.cells.size &&
    infoLayout(cols, info, title.side, title.bottom, title.y0);
  return box && box.cells.size ? { title, info: box } : null;
}

const SMALL_TEXT = [
  "oops",
  "your screen is too small!",
  "",
  "try zooming out in settings",
];

const DENS = Float32Array.of(
  0,
  0.3003739,
  0.2525448,
  0.8166015,
  0.9970179,
  0.9007468,
  0.8453963,
  0.1281243,
  0.4059337,
  0.4042689,
  0.5049645,
  0.378348,
  0.1612467,
  0.143601,
  0.1015472,
  0.3950664,
  0.8713611,
  0.6077371,
  0.6894964,
  0.6971103,
  0.7255253,
  0.734072,
  0.7249943,
  0.5723969,
  0.9062241,
  0.724018,
  0.2028069,
  0.2625064,
  0.4082059,
  0.3873932,
  0.4090843,
  0.5208426,
  1,
  0.7532251,
  0.92766,
  0.6281868,
  0.8238894,
  0.7651175,
  0.6242121,
  0.7976759,
  0.779309,
  0.6028348,
  0.5750651,
  0.7916564,
  0.4714194,
  0.9160552,
  0.9095531,
  0.80709,
  0.7081454,
  0.9225847,
  0.8620551,
  0.7609038,
  0.5362054,
  0.7374232,
  0.6675941,
  0.9741932,
  0.7228741,
  0.5665781,
  0.7111335,
  0.5125026,
  0.3954136,
  0.5133429,
  0.3781745,
  0.2023189,
  0.08626574,
  0.6572962,
  0.7575419,
  0.4858602,
  0.7640166,
  0.6573184,
  0.7067139,
  0.9561027,
  0.6535379,
  0.5318349,
  0.5900646,
  0.6862645,
  0.5538353,
  0.7615334,
  0.554892,
  0.6068318,
  0.7488059,
  0.7547868,
  0.5492474,
  0.5903084,
  0.5616871,
  0.553721,
  0.4617017,
  0.7549877,
  0.5342802,
  0.5914741,
  0.5480488,
  0.580412,
  0.3736736,
  0.5818655,
  0.2805426
);
