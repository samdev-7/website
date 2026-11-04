const FIRST = __FIRST__;
const FONT = new FontFace(
  "IBM Plex Mono",
  "url(data:font/woff2;base64,__FONT__)"
);
const FONT_BOLD = new FontFace(
  "IBM Plex Mono",
  "url(data:font/woff2;base64,__FONT_BOLD__)",
  { weight: "700" }
);
const ASPECT = 0.6;
const CHARS = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(32 + i)
).join("");
const NC = CHARS.length;
const LOWER = [...CHARS].map((c) =>
  /[A-Za-z]/.test(c) ? c.toLowerCase() : ""
);
const NONLETTER = [...Array(NC).keys()].filter((i) => !LOWER[i]);
const WORD = [..."SAMLIU"].map((c) => CHARS.indexOf(c));
const BAD = [
  "ass",
  "fuck",
  "shit",
  "cunt",
  "dick",
  "cock",
  "piss",
  "bitch",
  "slut",
  "whore",
  "fag",
  "nigger",
  "nigga",
  "twat",
  "tits",
  "porn",
  "rape",
  "cum",
  "jizz",
  "dildo",
  "penis",
  "anal",
  "anus",
  "wank",
  "sex",
  "bastard",
  "damn",
  "crap",
];
const MAXW = Math.max(...BAD.map((w) => w.length));

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
const MIN_TEXT_CELL = 6;
let BOX;
let BAR = new Uint8Array(0);
const NAV_RED = [0xff, 0x55, 0x55];
const HIGHLIGHT = "hack club";
const TITLE_W = Math.max(...TITLE.map((l) => l.length));
const minCols = () => Math.max(TITLE_W, navWidth()) + 6 + 2 * MIN_SIDE;
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
let SUB_LINES = [SUBTITLE];
let MAIL_WRAP = false;
const contactLines = () =>
  document.getElementById("title-contact").textContent.split("\n");
const contactW = () => Math.max(...contactLines().map((l) => l.length));

function boxLayout(cols, rows) {
  const [M, MB] = BOX_MARGIN;
  for (const wrap of [0, 2, 3]) {
    const sub = subtitleLines(
      wrap,
      Math.max(TITLE_W, navWidth(), cols - 2 * MIN_SIDE - 6)
    );
    const textW = Math.max(TITLE_W, navWidth(), ...sub.map((l) => l.length));
    const wrapMail = textW - contactW() - (navWidth() - 2) < 3;
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
      bottom = Math.round((x0 * MB) / M);
    }
    const y0 = rows - bottom - lines.length;
    if (x0 >= MIN_SIDE && y0 >= 0) {
      SUB_LINES = sub;
      MAIL_WRAP = wrapMail;
      return { ...frameBox(cols, lines, x0, y0), side: x0, bottom, textW };
    }
  }
  return { cells: new Map(), side: M, bottom: MB };
}
const infoLines = () => {
  const lines = ["info-place", "info-time"].map(
    (id) => document.getElementById(id).textContent
  );
  const w = Math.max(TIME_W, ...lines.map((l) => l.length));
  return lines.map((l) => l.padStart(w));
};
const TIME_W = "12:00 pm est".length;
function infoLayout(cols, rows, side, top, limit = rows) {
  const text = infoLines(),
    w = Math.max(...text.map((l) => l.length)) + 4;
  const lines = ["", ...text, ""].map((l) => " ".repeat(w)),
    x0 = cols - side - w,
    y0 = top;
  if (x0 < 0 || y0 + lines.length >= limit) return { cells: new Map() };
  const box = frameBox(cols, lines, x0, y0, false);
  return { ...box, textX: x0 + 2, textY: y0 };
}
const navItems = () =>
  [...document.querySelectorAll("#nav a")].map((a, k, all) => {
    const on = a.hasAttribute("aria-current");
    return {
      a,
      l: a.textContent,
      on,
      gl: on && k > 0 ? 1 : 0,
      gr: on && k < all.length - 1 ? 1 : 0,
    };
  });
const navWidth = () =>
  navItems().reduce(
    (s, it, k) => s + (k ? 1 : 0) + it.gl + it.l.length + 2 + it.gr,
    0
  );
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

const HIGHLIGHT_URL = "https://hackclub.com";
function setSubtitle(lines) {
  const sub = document.getElementById("title-sub"),
    text = lines.join("\n"),
    at = text.indexOf(HIGHLIGHT);
  if (sub.textContent === text) return;
  sub.textContent = at < 0 ? text : text.slice(0, at);
  if (at < 0) return;
  const hl = document.createElement("a");
  hl.className = "hl";
  hl.textContent = HIGHLIGHT;
  hl.href = HIGHLIGHT_URL;
  hl.target = "_blank";
  hl.rel = "noopener";
  sub.append(hl, text.slice(at + HIGHLIGHT.length));
}
if (!document.getElementById("title-sub").textContent) setSubtitle([SUBTITLE]);
let TITLE_AT = null;
let INFO_AT = null;
let NAV_AT = null;
let MAIL_AT = null;
let NAME = new Map();
let TEXT = new Map();
let TEXTG = new Int16Array(0),
  TEXTC = new Uint8Array(0);
function textArrays() {
  const n = COLS * ROWS;
  if (TEXTG.length !== n) {
    TEXTG = new Int16Array(n);
    TEXTC = new Uint8Array(n * 3);
  }
  TEXTG.fill(-1);
  for (const [i, [g, rgb]] of TEXT) {
    TEXTG[i] = g;
    TEXTC.set(rgb, i * 3);
  }
}
function infoText() {
  if (!INFO_AT) return [];
  const [ix, iy] = INFO_AT,
    g = (c) => Math.max(0, CHARS.indexOf(c)),
    cells = [];
  infoLines().forEach((line, r) =>
    [...line].forEach((c, k) => {
      const i = (iy + 1 + r) * COLS + ix + k;
      TEXT.set(i, [g(c), [220, 220, 220]]);
      cells.push(i);
      if (TEXTG.length === COLS * ROWS) {
        TEXTG[i] = g(c);
        TEXTC.set([220, 220, 220], i * 3);
      }
    })
  );
  return cells;
}
{
  const md = document.querySelector('meta[name="description"]');
  if (!md.content) md.content = SUBTITLE;
}
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

const SCREEN_KEY = "ascii-screen",
  SCREEN_TTL = 5000;
const b64 = (a) => {
  let s = "";
  for (let k = 0; k < a.length; k += 0x8000)
    s += String.fromCharCode(...a.subarray(k, k + 0x8000));
  return btoa(s);
};
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
let PREV = null;
try {
  const s = JSON.parse(sessionStorage.getItem(SCREEN_KEY) || "null");
  sessionStorage.removeItem(SCREEN_KEY);
  if (s && s.from !== "hero" && Date.now() - s.t < SCREEN_TTL && !REDUCED) {
    const d = unb64(s.d),
      n = s.cols * s.rows;
    PREV = {
      cols: s.cols,
      rows: s.rows,
      g: d.subarray(0, n),
      c: d.subarray(n, 4 * n),
      b: d.subarray(4 * n, 5 * n),
      red: d.subarray(5 * n, 6 * n),
    };
  }
} catch (e) {}
const prevScreen = () =>
  PREV && (PREV.cols !== COLS || PREV.rows !== ROWS) ? (PREV = null) : PREV;
const handoverDone = () => window.HANDOVER && window.HANDOVER.done();
function saveScreen() {
  if (REDUCED || !COLS) return;
  const n = COLS * ROWS,
    d = new Uint8Array(6 * n),
    bg = Math.round(P.bg * 255);
  for (let i = 0; i < n; i++) {
    const t = TEXTG[i] >= 0;
    d[i] = t ? TEXTG[i] : GL[i];
    d.set(
      t ? TEXTC.subarray(i * 3, i * 3 + 3) : FG.subarray(i * 3, i * 3 + 3),
      n + i * 3
    );
    d[4 * n + i] = BAR[i] ? 255 : BOX[i] ? 0 : bg;
    d[5 * n + i] = BAR[i];
  }
  const g = {
    cw,
    ch,
    fs: glyphSize(ch),
    base: glyphBase(ch),
    W: canvas.width,
    H: canvas.height,
    dpr: SCALE,
    iw: innerWidth,
    ih: innerHeight,
    r: devicePixelRatio || 1,
  };
  try {
    sessionStorage.setItem(
      SCREEN_KEY,
      JSON.stringify({
        from: "hero",
        t: Date.now(),
        cols: COLS,
        rows: ROWS,
        g,
        d: b64(d),
      })
    );
  } catch (e) {}
}
function drawPrev() {
  const pv = prevScreen(),
    base0 = glyphBase(ch);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  handoverDone();
  if (!pv) return;
  for (let y = 0, i = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++, i++) {
      const k = pv.b[i] / 255,
        c = pv.red[i] ? NAV_RED : pv.c.subarray(i * 3, i * 3 + 3);
      if (k) {
        ctx.fillStyle = `rgb(${c[0] * k},${c[1] * k},${c[2] * k})`;
        ctx.fillRect(XE[x], YE[y], XE[x + 1] - XE[x], YE[y + 1] - YE[y]);
      }
      if (!pv.g[i]) continue;
      ctx.fillStyle = `rgb(${pv.c[i * 3]},${pv.c[i * 3 + 1]},${pv.c[i * 3 + 2]})`;
      ctx.fillText(CHARS[pv.g[i]], x * cw + cw / 2, y * ch + base0);
    }
}
const revealTitle = () =>
  ["title", "info", "nav"].forEach((id) =>
    document.getElementById(id).classList.remove("fading")
  );

function gridText(el, at) {
  const dpr = SCALE,
    fs = glyphSize(ch);
  const m = document.createElement("canvas").getContext("2d");
  m.font = glyphFont(ch);
  const adv = m.measureText("M").width,
    mt = m.measureText("Mg");
  const fa = mt.fontBoundingBoxAscent,
    fd = mt.fontBoundingBoxDescent;
  const cssBase = (ch - (fa + fd)) / 2 + fa;
  el.style.fontSize = fs / dpr + "px";
  el.style.lineHeight = ch / dpr + "px";
  el.style.letterSpacing = (cw - adv) / dpr + "px";
  el.style.left = (XE[at[0]] + (cw - adv) / 2) / dpr + "px";
  el.style.top = (YE[at[1]] + glyphBase(ch) - cssBase) / dpr + "px";
  return { dpr, fs, adv, fa, fd };
}

function placeInfo() {
  const el = document.getElementById("info");
  if (!INFO_AT) {
    el.classList.add("loose");
    el.removeAttribute("style");
    return;
  }
  el.classList.remove("loose");
  const { dpr } = gridText(el, [INFO_AT[0], INFO_AT[1] + 1]);
  el.style.width = (infoLines()[0].length * cw) / dpr + "px";
  el.style.textAlign = "right";
}

function placeNav() {
  const el = document.getElementById("nav"),
    links = [...el.querySelectorAll("a")],
    seps = [...el.querySelectorAll(".sep")];
  const texts = [...el.querySelectorAll("a > span, .sep > span")];
  if (!NAV_AT) {
    el.classList.add("loose");
    el.removeAttribute("style");
    for (const e of [...links, ...seps, ...texts]) e.removeAttribute("style");
    return;
  }
  el.classList.remove("loose");
  const [x, y] = NAV_AT,
    { dpr, adv, fa, fd } = gridText(el, NAV_AT),
    w = navWidth();
  const h = YE[y + 1] - YE[y],
    half = (cw - adv) / 2;
  el.style.left = XE[x] / dpr + "px";
  el.style.top = YE[y] / dpr + "px";
  el.style.width = (XE[x + w] - XE[x]) / dpr + "px";
  el.style.height = el.style.lineHeight = h / dpr + "px";
  const shift = glyphBase(ch) - ((h - (fa + fd)) / 2 + fa);
  for (const { a, gl, gr } of navItems()) {
    a.style.padding = `0 ${(cw - half) / dpr}px 0 ${(cw + half) / dpr}px`;
    a.style.margin = `0 ${(gr * cw) / dpr}px 0 ${(gl * cw) / dpr}px`;
  }
  for (const k of seps) k.style.padding = `0 ${half / dpr}px`;
  for (const t of texts) t.style.top = shift / dpr + "px";
}

function placeTitle() {
  const el = document.getElementById("title"),
    name = document.getElementById("title-name"),
    mail = document.getElementById("title-contact");
  if (!TITLE_AT) {
    el.classList.add("loose");
    el.removeAttribute("style");
    name.removeAttribute("style");
    name.parentNode.removeAttribute("style");
    mail.removeAttribute("style");
    return;
  }
  el.classList.remove("loose");
  const { dpr, fs, adv, fa, fd } = gridText(el, TITLE_AT);
  mail.style.left = (XE[MAIL_AT[0]] - XE[TITLE_AT[0]]) / dpr + "px";
  mail.style.top = (YE[MAIL_AT[1]] - YE[TITLE_AT[1]]) / dpr + "px";
  document.getElementById("title-sub").style.marginTop = ch / dpr + "px";
  const artW = Math.max(...TITLE.map((l) => l.length)),
    len = name.textContent.length;
  const H = (TITLE.length * ch) / dpr,
    nfs = H / ((fa + fd) / fs),
    nAdv = (adv / fs) * nfs;
  name.style.fontSize = nfs + "px";
  name.style.lineHeight = H + "px";
  name.style.letterSpacing = ((artW * cw) / dpr - len * nAdv) / len + "px";
  name.style.left = XE[TITLE_AT[0]] / dpr - parseFloat(el.style.left) + "px";
  const y0 = YE[TITLE_AT[1]],
    y1 = YE[TITLE_AT[1] + TITLE.length],
    m = document.createElement("canvas").getContext("2d");
  m.font = glyphFont(ch);
  let top = Infinity,
    bottom = -Infinity;
  TITLE.forEach((line, r) => {
    const base = YE[TITLE_AT[1] + r] + glyphBase(ch);
    for (const c of line)
      if (c !== " ") {
        const t = m.measureText(c);
        top = Math.min(top, base - t.actualBoundingBoxAscent);
        bottom = Math.max(bottom, base + t.actualBoundingBoxDescent);
      }
  });
  const mid = top < bottom ? (top + bottom) / 2 : (y0 + y1) / 2;
  name.style.top = mid / dpr - H / 2 - parseFloat(el.style.top) + "px";
  name.parentNode.style.height = H + "px";
}
const P = {
  cell: 1470 / FIRST.cols,
  bg: 0.2,
};

const FONT_STACK = `'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace`;
let ASC = 0.8,
  DESC = 0.2;
function measureFont() {
  const c = document.createElement("canvas").getContext("2d");
  c.font = `100px ${FONT_STACK}`;
  ASC = 0;
  DESC = 0;
  for (const ch of CHARS) {
    const m = c.measureText(ch);
    ASC = Math.max(ASC, m.actualBoundingBoxAscent / 100);
    DESC = Math.max(DESC, m.actualBoundingBoxDescent / 100);
  }
}
const glyphSize = (h) => Math.min(h, h / (ASC + DESC));
const glyphBase = (h) =>
  (h - glyphSize(h) * (ASC + DESC)) / 2 + glyphSize(h) * ASC;
const glyphFont = (h) => `${glyphSize(h)}px ${FONT_STACK}`;
function drawGlyph(c, ch, x, cw, h) {
  c.fillText(ch, x + cw / 2, glyphBase(h));
}
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
let RAMP_LUT;
function calibrate() {
  RAMP_LUT = new Uint8Array(256).map((_, l) => {
    let best = 0,
      bd = 9;
    for (const i of NONLETTER) {
      const d = Math.abs(DENS[i] - l / 255);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  });
}

function badWords(glyphAt, len) {
  let s = "";
  for (let k = 0; k < len; k++) s += LOWER[glyphAt(k)] || ".";
  const hits = [];
  for (const w of BAD)
    for (let p = s.indexOf(w); p >= 0; p = s.indexOf(w, p + 1))
      hits.push([p, w.length]);
  return hits;
}

function badThrough(D, i, g) {
  if (!LOWER[g]) return false;
  const x = i % COLS,
    y = (i - x) / COLS,
    at = (j) => (j === i ? g : D[j]);
  const x0 = Math.max(0, x - MAXW + 1),
    x1 = Math.min(COLS - 1, x + MAXW - 1);
  for (const [p, l] of badWords((k) => at(y * COLS + x0 + k), x1 - x0 + 1))
    if (p <= x - x0 && x - x0 < p + l) return true;
  const y0 = Math.max(0, y - MAXW + 1),
    y1 = Math.min(ROWS - 1, y + MAXW - 1);
  for (const [p, l] of badWords((k) => at((y0 + k) * COLS + x), y1 - y0 + 1))
    if (p <= y - y0 && y - y0 < p + l) return true;
  return false;
}

let FC = 0,
  FR = 0,
  FGL,
  FRGB;
let OX = 0,
  OY = 0;
let COLS = 0,
  ROWS = 0,
  GL,
  FG;

function process() {
  const t0 = performance.now();
  window.PT = window.PT || [];
  const full = Math.min(
    devicePixelRatio || 1,
    Math.sqrt(MAX_CANVAS_PX / (innerWidth * innerHeight))
  );
  const anim = !REDUCED && !!(scrubQueued || scrub.playing || intro);
  SCALE =
    anim && !GLR
      ? Math.min(full, 1, Math.sqrt(ANIM_MAX_PX / (innerWidth * innerHeight)))
      : full;
  LOWRES = SCALE < full;
  const dpr = SCALE,
    W = Math.round(innerWidth * dpr),
    H = Math.round(innerHeight * dpr);
  if (!W || !H) {
    pending = true;
    kick();
    return;
  }
  const c0 = Math.max(H / FR, W / (FC * ASPECT), (P.cell * dpr) / ASPECT);
  let rows = Math.min(FR, Math.max(1, Math.round(H / c0)));
  ch = H / rows;
  let cols = Math.min(FC, Math.max(1, Math.round(W / (ch * ASPECT))));
  cw = W / cols;
  const MIN_COLS = minCols();
  if (cols < MIN_COLS && MIN_COLS <= FC) {
    cols = MIN_COLS;
    cw = W / cols;
    rows = Math.min(FR, Math.max(1, Math.round(H / (cw / ASPECT))));
    ch = H / rows;
  }
  OX = (FC - cols) >> 1;
  OY = (FR - rows) >> 1;
  COLS = cols;
  ROWS = rows;
  const n = cols * rows;
  const readable = cw / dpr >= MIN_TEXT_CELL;
  const title = readable
    ? boxLayout(cols, rows)
    : { cells: new Map(), side: BOX_MARGIN[0], bottom: BOX_MARGIN[1] };
  const { cells: boxCells, textX, textY } = title;
  TITLE_AT = boxCells.size ? [textX, textY] : null;
  const info = readable
    ? infoLayout(
        cols,
        rows,
        title.side,
        title.bottom,
        TITLE_AT ? title.y0 : rows
      )
    : { cells: new Map() };
  INFO_AT = info.cells.size ? [info.textX, info.textY] : null;
  if (INFO_AT) for (const [c, v] of info.cells) boxCells.set(c, v);
  const navRow = textY + TITLE.length + 1 + SUB_LINES.length + 1;
  MAIL_AT = !TITLE_AT
    ? null
    : MAIL_WRAP
      ? [textX, navRow + 2]
      : [textX + title.textW - contactW(), navRow];
  NAV_AT = TITLE_AT ? [textX - 1, navRow] : null;
  setSubtitle(TITLE_AT ? SUB_LINES : [SUBTITLE]);
  BOX = new Uint8Array(n);
  BOX_CELLS = boxCells;
  for (const c of boxCells.keys()) BOX[c] = 1;
  NAME = new Map();
  if (TITLE_AT) {
    const [tx, ty] = TITLE_AT;
    TITLE.forEach((line, r) =>
      [...line].forEach((c, k) =>
        NAME.set((ty + r) * cols + tx + k, [
          Math.max(0, CHARS.indexOf(c)),
          [255, 255, 255],
        ])
      )
    );
  }
  TEXT = new Map(NAME);
  if (TITLE_AT) {
    const [tx, ty] = TITLE_AT,
      hl = SUBTITLE.indexOf(HIGHLIGHT),
      g = (c) => Math.max(0, CHARS.indexOf(c));
    let off = 0;
    SUB_LINES.forEach((line, r) => {
      [...line].forEach((c, k) =>
        TEXT.set((ty + TITLE.length + 1 + r) * cols + tx + k, [
          g(c),
          hl >= 0 && off + k >= hl && off + k < hl + HIGHLIGHT.length
            ? [0xff, 0x55, 0x55]
            : [220, 220, 220],
        ])
      );
      off += line.length + 1;
    });
    if (MAIL_AT)
      contactLines().forEach((line, r) =>
        [...line].forEach((c, k) =>
          TEXT.set((MAIL_AT[1] + r) * cols + MAIL_AT[0] + k, [
            g(c),
            [220, 220, 220],
          ])
        )
      );
  }
  infoText();
  BAR = new Uint8Array(n);
  if (NAV_AT) {
    const row = NAV_AT[1] * cols;
    let x = NAV_AT[0];
    navItems().forEach(({ l, on, gl, gr }, k) => {
      if (k) TEXT.set(row + x++, [CHARS.indexOf("|"), [0x78, 0x78, 0x78]]);
      x += gl;
      if (on) BAR.fill(1, row + x, row + x + l.length + 2);
      const ink = on ? [0, 0, 0] : [220, 220, 220];
      [...l].forEach((c, k) =>
        TEXT.set(row + x + 1 + k, [Math.max(0, CHARS.indexOf(c)), ink])
      );
      x += l.length + 2 + gr;
    });
  }
  textArrays();
  if (intro) {
    intro = null;
    revealTitle();
  }
  const tc = performance.now();
  compose();
  const tl = performance.now();
  layout();
  window.PT.push({
    pre: Math.round(tc - t0),
    compose: Math.round(tl - tc),
    layout: Math.round(performance.now() - tl),
  });
  if (!performance.getEntriesByName("layout").length)
    performance.mark("layout");
  document.getElementById("busy").textContent =
    `${cols}x${rows} of ${FC}x${FR} cells, ${RUN_COUNT} SAMLIU, ${Math.round(performance.now() - t0)} ms`;
}

let BOX_CELLS = new Map(),
  WMAP = null;
function compose() {
  const n = COLS * ROWS,
    N = FC * FR;
  GL = new Uint8Array(n);
  FG = new Uint8Array(n * 3);
  for (let y = 0, i = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++, i++) {
      const j = (y + OY) * FC + x + OX;
      GL[i] = FGL[j];
      FG[i * 3] = FRGB[j];
      FG[i * 3 + 1] = FRGB[N + j];
      FG[i * 3 + 2] = FRGB[2 * N + j];
    }
  if (!WMAP || WMAP.length !== N) WMAP = new Int32Array(N);
  WMAP.fill(-1);
  for (let y = 0, i = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++, i++) WMAP[(y + OY) * FC + x + OX] = i;
  for (const [c, [g, rgb]] of BOX_CELLS) {
    GL[c] = g;
    FG.set(rgb, c * 3);
    WMAP[(Math.floor(c / COLS) + OY) * FC + (c % COLS) + OX] = -1;
  }
  for (const [c, [g, rgb]] of NAME) {
    GL[c] = g;
    FG.set(rgb, c * 3);
  }
  findRuns();
}

function findRuns() {
  RUNS = new Uint8Array(COLS * ROWS);
  RUN_COUNT = 0;
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x + 6 <= COLS; x++) {
      const c = y * COLS + x;
      if (WORD.every((g, k) => GL[c + k] === g && !BOX[c + k])) {
        RUNS.fill(1, c, c + 6);
        RUN_COUNT++;
        x += 5;
      }
    }
}

const MAX_CANVAS_PX = 64e6;
const ANIM_MAX_PX = 4.2e6;
let LOWRES = false;
let SCALE = 1;
const canvas = document.getElementById("art");
let ctx = null;
let cw, ch;

let LT0 = 0;
function layout() {
  if (!COLS) return;
  LT0 = performance.now();
  canvas.width = Math.round(COLS * cw);
  canvas.height = Math.round(ROWS * ch);
  canvas.style.width = canvas.width / SCALE + "px";
  canvas.style.height = canvas.height / SCALE + "px";
  XE = Int32Array.from({ length: COLS + 1 }, (_, x) => Math.round(x * cw));
  YE = Int32Array.from({ length: ROWS + 1 }, (_, y) => Math.round(y * ch));
  const q0 = performance.now();
  if (GLR && !glLayout())
    console.warn("WebGL: this screen is bigger than the GPU allows");
  const q1 = performance.now();
  renderBase();
  const q2 = performance.now();
  placeTitle();
  const q3 = performance.now();
  placeInfo();
  placeNav();
  (window.LT = window.LT || []).push({
    resize: Math.round(q0 - LT0),
    gl: Math.round(q1 - q0),
    base: Math.round(q2 - q1),
    title: Math.round(q3 - q2),
    info: Math.round(performance.now() - q3),
  });
}

const base = document.createElement("canvas");
const bctx = base.getContext("2d");
let XE,
  YE,
  shown,
  DG,
  box = null;
const fixed = new Set();

function tile(c, i, src, b) {
  const x = i % COLS,
    y = (i - x) / COLS;
  if (BAR[src]) {
    b = Math.min(1, b / P.bg);
    c.fillStyle = `rgb(${NAV_RED[0] * b},${NAV_RED[1] * b},${NAV_RED[2] * b})`;
  } else {
    if (BOX[src]) b = 0;
    c.fillStyle = `rgb(${FG[src * 3] * b},${FG[src * 3 + 1] * b},${FG[src * 3 + 2] * b})`;
  }
  c.fillRect(XE[x], YE[y], XE[x + 1] - XE[x], YE[y + 1] - YE[y]);
}

function renderBase() {
  emphReady = false;
  EMPH.t = 0;
  EMPH.target = 0;
  EMPH.from = null;
  if (ctx) {
    base.width = canvas.width;
    base.height = canvas.height;
    bctx.font = glyphFont(ch);
    bctx.textAlign = "center";
    bctx.textBaseline = "alphabetic";
    paintBase();
    ctx.imageSmoothingEnabled = false;
    ctx.font = glyphFont(ch);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
  }
  showBase();
}

let BASE_DIRTY = new Uint8Array(0);
const DIRTY = [];
function syncBase() {
  for (const i of DIRTY) {
    paintCell(bctx, i);
    BASE_DIRTY[i] = 0;
  }
  DIRTY.length = 0;
}
function paintBase() {
  const n = COLS * ROWS;
  if (BASE_DIRTY.length !== n) BASE_DIRTY = new Uint8Array(n);
  else BASE_DIRTY.fill(0);
  DIRTY.length = 0;
  bctx.fillStyle = "#000";
  bctx.fillRect(0, 0, base.width, base.height);
  if (P.bg > 0) for (let i = 0; i < n; i++) tile(bctx, i, i, P.bg);
  const base0 = glyphBase(ch);
  for (let y = 0, i = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++, i++) {
      if (!GL[i]) continue;
      bctx.fillStyle = `rgb(${FG[i * 3]},${FG[i * 3 + 1]},${FG[i * 3 + 2]})`;
      bctx.fillText(CHARS[GL[i]], x * cw + cw / 2, y * ch + base0);
    }
}

function paintCell(c, i) {
  const x = i % COLS,
    y = (i - x) / COLS;
  c.fillStyle = "#000";
  c.fillRect(XE[x], YE[y], XE[x + 1] - XE[x], YE[y + 1] - YE[y]);
  if (P.bg > 0) tile(c, i, i, P.bg);
  if (!GL[i]) return;
  c.fillStyle = `rgb(${FG[i * 3]},${FG[i * 3 + 1]},${FG[i * 3 + 2]})`;
  c.fillText(CHARS[GL[i]], x * cw + cw / 2, y * ch + glyphBase(ch));
}

const EMPH_DIM = 0.875;
const EMPH_LIFT = 0.075;
const EMPH_FADE = 0.15;
let RUNS = new Uint8Array(0),
  RUN_COUNT = 0;
const emph = document.createElement("canvas"),
  ectx = emph.getContext("2d");
let emphReady = false;
const EMPH = { t: 0, target: 0, from: null };

function buildEmphasis() {
  emphReady = true;
  if (!ctx) {
    if (GLR) glBold();
    return;
  }
  syncBase();
  emph.width = base.width;
  emph.height = base.height;
  ectx.fillStyle = "#000";
  ectx.fillRect(0, 0, emph.width, emph.height);
  ectx.drawImage(base, 0, 0);
  const size = glyphSize(ch),
    y0 = glyphBase(ch),
    rgb = (i, k) =>
      `rgb(${FG[i * 3] * k},${FG[i * 3 + 1] * k},${FG[i * 3 + 2] * k})`;
  ectx.textAlign = "center";
  ectx.textBaseline = "alphabetic";
  for (let y = 0, i = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++, i++) {
      if (BOX[i]) continue;
      const dx = XE[x],
        dy = YE[y],
        dw = XE[x + 1] - dx,
        dh = YE[y + 1] - dy;
      ectx.fillStyle = rgb(i, RUNS[i] ? P.bg : P.bg * EMPH_DIM);
      ectx.fillRect(dx, dy, dw, dh);
      if (!GL[i]) continue;
      if (RUNS[i]) {
        const c = (k) =>
          Math.round(FG[i * 3 + k] + (255 - FG[i * 3 + k]) * EMPH_LIFT);
        ectx.font = `700 ${size}px ${FONT_STACK}`;
        ectx.fillStyle = `rgb(${c(0)},${c(1)},${c(2)})`;
      } else {
        ectx.font = glyphFont(ch);
        ectx.fillStyle = rgb(i, EMPH_DIM);
      }
      ectx.fillText(CHARS[GL[i]], x * cw + cw / 2, y * ch + y0);
    }
  emphReady = true;
}

function setEmphasis(on, from) {
  if (on && (!RUN_COUNT || scrub.playing)) return;
  if (on) {
    if (EMPH.target) {
      EMPH.from = EMPH.from || from;
      return;
    }
    if (!emphReady) buildEmphasis();
    EMPH.from = from;
  } else if (EMPH.from !== from) return;
  EMPH.target = on ? 1 : 0;
  if (!on) EMPH.from = null;
  if (REDUCED) {
    EMPH.t = EMPH.target;
    redrawAll();
    return;
  }
  kick();
}

function stepEmphasis(dt) {
  if (EMPH.t === EMPH.target) return false;
  EMPH.t = EMPH.target
    ? Math.min(1, EMPH.t + dt / EMPH_FADE)
    : Math.max(0, EMPH.t - dt / EMPH_FADE);
  redrawAll();
  return EMPH.t !== EMPH.target;
}

function redrawAll() {
  if (!ctx) {
    kick();
    return;
  }
  syncBase();
  ctx.drawImage(base, 0, 0);
  if (EMPH.t > 0) {
    ctx.globalAlpha = EMPH.t;
    ctx.drawImage(emph, 0, 0);
    ctx.globalAlpha = 1;
  }
  if (box)
    for (let y = box[1]; y <= box[3]; y++)
      for (let x = box[0]; x <= box[2]; x++) {
        const i = y * COLS + x;
        if (shown[i] !== i * LEVELS || DG[i] !== GL[i]) drawCell(i, DG[i]);
      }
}

function showBase() {
  shown = Int32Array.from({ length: COLS * ROWS }, (_, i) => i * LEVELS);
  DG = GL.slice();
  fixed.clear();
  box = null;
  if (!ctx) return;
  syncBase();
  if (scrubQueued && !REDUCED) drawPrev();
  else ctx.drawImage(base, 0, 0);
}

const SCRUB_URL = "/scrub.bin";
const SCRUB_LEAD = 1.25;
const SLOW_LINK = 2e6 / 8 / 1000;
const SLOW_LEAD = 1.2;
const SCRUB_FINISH = 300;
const SCRUB_STALL = 300;
const scrub = {
  recs: [],
  total: 0,
  at: 0,
  t0: 0,
  playing: false,
  ended: false,
  stats: {},
};
let FIRST_STATE = null;

async function gunzip(bytes) {
  return new Uint8Array(
    await new Response(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))
    ).arrayBuffer()
  );
}
async function loadFirst() {
  const body = await gunzip(
    Uint8Array.from(atob(FIRST.data), (c) => c.charCodeAt(0))
  );
  FC = FIRST.cols;
  FR = FIRST.rows;
  FIRST_STATE = [body.slice(0, FC * FR), body.slice(FC * FR)];
  FGL = FIRST_STATE[0].slice();
  FRGB = FIRST_STATE[1].slice();
  setTime(FIRST.at, FIRST.off);
  performance.mark("first");
}

function scrubParser(emit) {
  let buf = new Uint8Array(1 << 18),
    len = 0,
    head = false;
  const u32 = (p) =>
    (buf[p] | (buf[p + 1] << 8) | (buf[p + 2] << 16) | (buf[p + 3] << 24)) >>>
    0;
  return (value) => {
    if (len + value.length > buf.length) {
      const b = new Uint8Array(Math.max(buf.length * 2, len + value.length));
      b.set(buf.subarray(0, len));
      buf = b;
    }
    buf.set(value, len);
    len += value.length;
    let p = 0;
    if (!head && len >= 20) {
      head = true;
      emit({
        head: {
          magic: String.fromCharCode(...buf.subarray(0, 4)),
          cols: buf[4] | (buf[5] << 8),
          rows: buf[6] | (buf[7] << 8),
          total: buf[8] | (buf[9] << 8),
          dur: buf[10] | (buf[11] << 8),
          at: u32(12),
          size: u32(16),
        },
      });
      p = 20;
    }
    while (head && len - p >= 4 && len - p - 4 >= u32(p)) {
      const L = u32(p);
      emit({
        rec: {
          kind: buf[p + 4],
          t: u32(p + 5),
          off: ((buf[p + 9] | (buf[p + 10] << 8)) << 16) >> 16,
          ms: buf[p + 11] | (buf[p + 12] << 8),
          body: buf.slice(p + 13, p + 4 + L),
        },
      });
      p += 4 + L;
    }
    buf.copyWithin(0, p, len);
    len -= p;
  };
}
async function loadStream() {
  const st = scrub.stats;
  if (REDUCED) {
    scrub.ended = true;
    kick();
    return;
  }
  let gz = true;
  const take = (m) => {
    if (scrub.cut) return;
    if (m.head) {
      if (
        m.head.magic !== "SCR2" ||
        m.head.cols !== FC ||
        m.head.rows !== FR ||
        m.head.at !== FIRST.at
      )
        throw new Error("not a scrub for this frame");
      scrub.total = m.head.total;
      scrub.dur = m.head.dur;
      if (!gz) scrub.net.size = m.head.size;
    } else if (m.rec) {
      scrub.recs.push(m.rec);
      if (!st.firstRecord) st.firstRecord = performance.now();
    }
  };
  try {
    performance.mark("fetch");
    scrub.abort = new AbortController();
    const res = await fetch(SCRUB_URL, { signal: scrub.abort.signal });
    if (!res.ok || !res.body) throw new Error(res.status);
    const net = (scrub.net = {
      size: +res.headers.get("content-length") || 0,
      got: 0,
      t0: 0,
      mark: null,
    });
    const count = (c) => {
      const now = performance.now();
      if (!net.t0) net.t0 = now;
      else if (!net.mark && now - net.t0 >= 100) net.mark = [now, net.got];
      net.got += c.length;
    };
    const parse = scrubParser(take);
    const raw = res.body.getReader(),
      head = await raw.read();
    gz = net.gz =
      !head.done && head.value[0] === 0x1f && head.value[1] === 0x8b;
    if (!gz) net.size = 0;
    let body = new ReadableStream({
      start(c) {
        if (!head.done) {
          count(head.value);
          c.enqueue(head.value);
        }
      },
      async pull(c) {
        const { value, done } = await raw.read();
        if (done) c.close();
        else {
          count(value);
          c.enqueue(value);
        }
      },
    });
    if (gz) body = body.pipeThrough(new DecompressionStream("gzip"));
    const reader = body.getReader();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      parse(value);
    }
    st.streamDone = performance.now();
    const e = performance.getEntriesByName(
      new URL(SCRUB_URL, location.href).href
    )[0];
    if (e) st.bytes = e.encodedBodySize || e.transferSize;
  } catch (e) {
    if (!scrub.cut) console.warn("scrub stream:", e);
  }
  scrub.ended = true;
  kick();
}

const ZONES = { "-300": "est", "-240": "edt" };
function setTime(t, off) {
  const d = new Date((t + off * 60) * 1000),
    h = d.getUTCHours(),
    m = String(d.getUTCMinutes()).padStart(2, "0");
  const el = document.getElementById("info-time"),
    z = Math.abs(off);
  const zone =
    ZONES[off] ||
    "utc" +
      (off < 0 ? "-" : "+") +
      ((z / 60) | 0) +
      (z % 60 ? ":" + String(z % 60).padStart(2, "0") : "");
  el.textContent = `${h % 12 || 12}:${m} ${h < 12 ? "am" : "pm"} ${zone}`;
  el.dateTime =
    d.toISOString().slice(0, 19) +
    (off < 0 ? "-" : "+") +
    String((z / 60) | 0).padStart(2, "0") +
    ":" +
    String(z % 60).padStart(2, "0");
  const cells = infoText();
  if (intro && ctx)
    for (const i of cells) {
      if (intro.done[i]) paint(i, TEXT.get(i)[0], 0);
      else intro.last[i] = -1;
    }
}

const CHANGED = [];
let IDX = null;
function applyRecord(r) {
  const N = FC * FR,
    b = r.body;
  setTime(r.t, r.off);
  if (r.kind === 1) {
    FGL.set(b.subarray(0, N));
    FRGB.set(b.subarray(N, 4 * N));
    return null;
  }
  if (r.kind === 3) {
    FGL.set(FIRST_STATE[0]);
    FRGB.set(FIRST_STATE[1]);
    return null;
  }
  if (!IDX || IDX.length < N) IDX = new Uint32Array(N);
  const nb = Math.ceil(N / 8);
  let k = 0;
  for (let q = 0; q < nb; q++) {
    const v = b[q];
    if (v)
      for (let bit = 0; bit < 8; bit++)
        if (v & (128 >> bit)) IDX[k++] = q * 8 + bit;
  }
  const g0 = nb,
    r0 = nb + k,
    gg0 = r0 + k,
    b0 = gg0 + k;
  CHANGED.length = 0;
  if (GLR) {
    for (let q = 0; q < k; q++) {
      const j = IDX[q];
      FGL[j] = b[g0 + q];
      FRGB[j] += b[r0 + q];
      FRGB[N + j] += b[gg0 + q];
      FRGB[2 * N + j] += b[b0 + q];
      const i = WMAP[j];
      if (i < 0) continue;
      DG[i] = GL[i] = FGL[j];
      FG[i * 3] = FRGB[j];
      FG[i * 3 + 1] = FRGB[N + j];
      FG[i * 3 + 2] = FRGB[2 * N + j];
    }
    PERF.cells += k;
    return CHANGED;
  }
  for (let q = 0; q < k; q++) {
    const j = IDX[q];
    FGL[j] = b[g0 + q];
    FRGB[j] += b[r0 + q];
    FRGB[N + j] += b[gg0 + q];
    FRGB[2 * N + j] += b[b0 + q];
    const x = (j % FC) - OX,
      y = (j - (j % FC)) / FC - OY;
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) continue;
    const i = y * COLS + x;
    if (BOX[i]) continue;
    GL[i] = FGL[j];
    FG[i * 3] = FRGB[j];
    FG[i * 3 + 1] = FRGB[N + j];
    FG[i * 3 + 2] = FRGB[2 * N + j];
    CHANGED.push(i);
  }
  return CHANGED;
}

function refresh(cells) {
  if (!ctx) {
    if (!cells) {
      compose();
      DG = GL.slice();
    } else for (const i of cells) DG[i] = GL[i];
    if (box)
      for (let y = box[1]; y <= box[3]; y++)
        for (let x = box[0]; x <= box[2]; x++) shown[y * COLS + x] = -1;
    return;
  }
  if (cells && !box && !EMPH.t) {
    for (const i of cells) {
      if (!BASE_DIRTY[i]) {
        BASE_DIRTY[i] = 1;
        DIRTY.push(i);
      }
      if (intro) {
        if (!intro.done[i]) {
          intro.last[i] = -1;
          continue;
        }
        if (BOX[i]) continue;
      } else DG[i] = GL[i];
      paintCell(ctx, i);
    }
    return;
  }
  if (!cells && LOWRES && scrub.ended && scrub.at >= scrub.recs.length) {
    compose();
    BASE_DIRTY.fill(0);
    DIRTY.length = 0;
    return;
  }
  syncBase();
  if (!cells) {
    compose();
    paintBase();
  } else for (const i of cells) paintCell(bctx, i);
  if (intro) {
    const n = COLS * ROWS;
    for (let k = 0, m = cells ? cells.length : n; k < m; k++) {
      const i = cells ? cells[k] : k;
      if (!intro.done[i]) {
        intro.last[i] = -1;
        continue;
      }
      if (BOX[i]) continue;
      const x = i % COLS,
        y = (i - x) / COLS,
        dx = XE[x],
        dy = YE[y],
        dw = XE[x + 1] - dx,
        dh = YE[y + 1] - dy;
      ctx.drawImage(base, dx, dy, dw, dh, dx, dy, dw, dh);
    }
    return;
  }
  if (!cells || cells.length > (COLS * ROWS) / 4) {
    ctx.drawImage(base, 0, 0);
    DG = GL.slice();
  } else
    for (const i of cells) {
      const x = i % COLS,
        y = (i - x) / COLS;
      DG[i] = GL[i];
      if (box && x >= box[0] && x <= box[2] && y >= box[1] && y <= box[3])
        continue;
      const dx = XE[x],
        dy = YE[y],
        dw = XE[x + 1] - dx,
        dh = YE[y + 1] - dy;
      ctx.drawImage(base, dx, dy, dw, dh, dx, dy, dw, dh);
    }
  if (box)
    for (let y = box[1]; y <= box[3]; y++)
      for (let x = box[0]; x <= box[2]; x++) shown[y * COLS + x] = -1;
}

const HOLD = /[?&]loading\b/.test(location.search);
function scrubReady(now) {
  const s = scrub,
    n = s.net;
  if (HOLD) return false;
  if (s.ended || s.at) return true;
  if (!s.waitFrom) s.waitFrom = now;
  if (!n || !n.size || !s.dur || !s.recs.length) return false;
  const t = performance.now();
  const timed = n.mark && t - n.mark[0] >= 200;
  let rate = timed ? (n.got - n.mark[1]) / (t - n.mark[0]) : 0;
  if (!rate) {
    const nav = performance.getEntriesByType("navigation")[0];
    const ms = nav && nav.responseEnd - nav.responseStart;
    if (nav && nav.encodedBodySize > 32e3 && ms > 20)
      rate = n.gz ? nav.encodedBodySize / ms : 0;
    else if (nav && nav.encodedBodySize > 32e3) return true;
  }
  if (!rate) return false;
  const left =
    ((n.size - n.got) / rate) *
    SCRUB_LEAD *
    (rate < SLOW_LINK * (n.gz ? 1 : 3.5) ? SLOW_LEAD : 1);
  s.stats.ready = {
    got: n.got,
    size: n.size,
    rate: Math.round(rate * 8) / 1e3 + " Mbit/s",
    left: Math.round(left),
  };
  return left <= s.dur && left > SCRUB_FINISH;
}

function cutScrub(why) {
  const s = scrub;
  if (s.cut) return;
  s.cut = why;
  if (s.abort) s.abort.abort();
  s.recs.splice(s.at);
  s.recs.push({ kind: 3, t: FIRST.at, off: FIRST.off, ms: 0 });
  s.total = s.recs.length;
  s.ended = true;
  console.log(`scrub: ${why}, straight to now (${s.at} records played)`);
}

function startScrub() {
  scrub.at = 0;
  scrub.t0 = 0;
  scrub.playing = true;
  EMPH.t = 0;
  EMPH.target = 0;
  EMPH.from = null;
  Object.assign(scrub.stats, { steps: [], cost: [], end: 0, skipped: 0 });
}

const FRAME_MS = [];
const frameMs = () =>
  FRAME_MS.length < 3
    ? 1000 / 60
    : FRAME_MS.slice().sort((a, b) => a - b)[FRAME_MS.length >> 1];

const SCRATCH = { seen: new Uint8Array(0), cells: [] };

function stepScrub(now) {
  const s = scrub,
    st = s.stats;
  if (!s.t0) s.t0 = now;
  let due = REDUCED ? (s.ended ? s.recs.length : 0) : s.at;
  if (!REDUCED)
    while (due < s.recs.length && s.recs[due].ms <= now - s.t0 + frameMs() / 2)
      due++;
  if (!REDUCED && due === s.recs.length && s.recs.length < s.total) {
    s.starved = true;
    if (!s.stallFrom) s.stallFrom = now;
    else if (now - s.stallFrom > SCRUB_STALL) {
      cutScrub("stalled mid-scrub");
      due = s.recs.length;
    }
  }
  if (s.at < due) {
    if (due - s.at > 1 && !REDUCED) {
      const late = Math.round(now - s.t0 - s.recs[s.at].ms);
      st.skipped = (st.skipped || 0) + due - s.at - 1;
      const l = PERF.last,
        f = (x) => x.toFixed(1);
      console.log(
        `scrub: skipped ${due - s.at - 1} frame(s), records ${s.at}-${due - 2}, ${late} ms late (${s.starved ? "waiting for bytes" : "slow frame"})` +
          (l
            ? `; previous frame ${f(PERF.gap)} ms apart, its JS ${f(l.js)} ms (scrub ${f(l.scrub)} ms for ${l.cells} cells, fade ${f(l.fade)} ms)`
            : "")
      );
    }
    s.starved = false;
    s.stallFrom = 0;
    const t0 = performance.now(),
      n = COLS * ROWS,
      cells = SCRATCH.cells;
    if (SCRATCH.seen.length !== n) SCRATCH.seen = new Uint8Array(n);
    const seen = SCRATCH.seen.fill(0);
    cells.length = 0;
    let whole = false;
    while (s.at < due) {
      const c = applyRecord(s.recs[s.at++]);
      if (!c) whole = true;
      else if (!whole)
        for (const i of c)
          if (!seen[i]) {
            seen[i] = 1;
            cells.push(i);
          }
    }
    refresh(whole ? null : cells);
    PERF.cells = whole ? COLS * ROWS : GLR ? PERF.cells : cells.length;
    st.steps.push(now);
    st.cost.push(performance.now() - t0);
  }
  if (s.at < s.recs.length || !s.ended) return true;
  s.playing = false;
  if (ctx && LOWRES) {
    BASE_DIRTY.fill(0);
    DIRTY.length = 0;
  } else if (ctx && !box && !EMPH.t && !intro) {
    bctx.drawImage(canvas, 0, 0);
    BASE_DIRTY.fill(0);
    DIRTY.length = 0;
  } else if (ctx) syncBase();
  findRuns();
  emphReady = false;
  if (!st.end) {
    st.end = performance.now();
    const cost = st.cost.length ? st.cost : [0];
    const avg = (a) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
    Object.assign(st, {
      records: s.at,
      draws: st.steps.length,
      scrubMs: Math.round(st.end - (st.steps[0] || st.end)),
      costMs: [avg(cost).toFixed(1), Math.max(...cost).toFixed(1)],
    });
    console.log(
      `scrub: ${st.records} records, ${st.draws} drawn, ${st.skipped || 0} skipped, ${st.scrubMs} ms, ${canvas.width}x${canvas.height} px canvas` +
        ` (${innerWidth}x${innerHeight} at ${devicePixelRatio}x, scale ${SCALE}${LOWRES ? ", capped until the end" : ""}), ${GLR ? "WebGL" : "2D"}, draw ${st.costMs.join("/")} ms avg/max` +
        ` (waited ${st.waited} ms for bytes${st.ready ? ", estimated " + st.ready.rate : ""}; stream in by ${Math.round(st.streamDone)} ms)`
    );
    document.getElementById("busy").textContent +=
      `\nfirst frame ${Math.round(st.firstDisplay)} ms (waited ${st.waited} ms for bytes), stream ${st.bytes ? (st.bytes / 1e6).toFixed(2) + " MB, " : ""}in by ${Math.round(st.streamDone)} ms` +
      `\nscrub ${st.records} records in ${st.draws} draws over ${st.scrubMs} ms, draw ${st.costMs.join("/")} ms (avg/max)`;
  }
  return false;
}

const LOADING_AFTER = 1000;
const DOTS_MS = 350;
function loadingCells(now) {
  const cells = new Map();
  if (now < LOADING_AFTER || !COLS) return cells;
  const text = "loading" + ".".repeat(Math.floor(now / DOTS_MS) % 4),
    y = ROWS >> 1,
    x0 = (COLS - "loading...".length) >> 1;
  [...text].forEach((c, k) => cells.set(y * COLS + x0 + k, CHARS.indexOf(c)));
  return cells;
}
function drawLoading(now) {
  const cells = loadingCells(now),
    y = ROWS >> 1;
  if (!cells.size) return;
  ctx.fillStyle = "#000";
  ctx.fillRect(
    0,
    YE[Math.max(0, y - 1)],
    canvas.width,
    YE[Math.min(ROWS, y + 2)] - YE[Math.max(0, y - 1)]
  );
  ctx.fillStyle = "rgb(220,220,220)";
  for (const [i, g] of cells) {
    const x = i % COLS;
    ctx.fillText(CHARS[g], x * cw + cw / 2, y * ch + glyphBase(ch));
  }
}

const INTRO_SPEED = 2;
const INTRO_DUR = 0.5;
let intro = null;

function startIntro(now) {
  ["title", "info", "nav"].forEach((id) =>
    document.getElementById(id).classList.add("fading")
  );
  const n = COLS * ROWS,
    S = new Float32Array(n);
  const cx = COLS / 2,
    cy = ROWS / 2,
    dmax = Math.hypot(cx * ASPECT, cy);
  for (let y = 0, i = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++, i++)
      S[i] =
        Math.hypot((x - cx) * ASPECT, y - cy) / dmax + Math.random() * 0.08;
  const K = 4096,
    smax = 1.08,
    key = new Uint16Array(n),
    at = new Uint32Array(K + 1),
    order = new Uint32Array(n);
  for (let i = 0; i < n; i++)
    at[(key[i] = Math.min(K - 1, ((S[i] / smax) * K) | 0)) + 1]++;
  for (let k = 0; k < K; k++) at[k + 1] += at[k];
  for (let i = 0; i < n; i++) order[at[key[i]]++] = i;
  intro = {
    t0: now,
    S,
    order,
    next: 0,
    active: [],
    last: new Int8Array(n).fill(-1),
    done: new Uint8Array(n),
  };
  if (ctx) drawPrev();
}

function paint(i, g, b) {
  if (!ctx) return;
  const x = i % COLS,
    y = (i - x) / COLS;
  ctx.fillStyle = "#000";
  ctx.fillRect(XE[x], YE[y], XE[x + 1] - XE[x], YE[y + 1] - YE[y]);
  if (b > 0) tile(ctx, i, i, b);
  if (!g) return;
  const text = TEXT.get(i),
    c = text ? text[1] : [FG[i * 3], FG[i * 3 + 1], FG[i * 3 + 2]];
  ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
  ctx.fillText(CHARS[g], x * cw + cw / 2, y * ch + glyphBase(ch));
}

function stepIntro(now) {
  const it = intro,
    t = ((now - it.t0) / 1000) * INTRO_SPEED,
    n = COLS * ROWS;
  while (it.next < n && it.S[it.order[it.next]] <= t)
    it.active.push(it.order[it.next++]);
  const still = [];
  for (const i of it.active) {
    const p = (t - it.S[i]) / INTRO_DUR,
      text = TEXT.get(i);
    if (p >= 1) {
      it.done[i] = 1;
      if (!ctx) continue;
      const x = i % COLS,
        y = (i - x) / COLS;
      if (text) paint(i, text[0], P.bg);
      else if (BASE_DIRTY[i]) paintCell(ctx, i);
      else
        ctx.drawImage(
          base,
          XE[x],
          YE[y],
          XE[x + 1] - XE[x],
          YE[y + 1] - YE[y],
          XE[x],
          YE[y],
          XE[x + 1] - XE[x],
          YE[y + 1] - YE[y]
        );
      continue;
    }
    still.push(i);
    const lv = Math.round(p * 8);
    if (it.last[i] !== lv) {
      it.last[i] = lv;
      paint(
        i,
        RAMP_LUT[Math.round(((DENS[text ? text[0] : GL[i]] * lv) / 8) * 255)],
        (P.bg * lv) / 8
      );
    }
  }
  it.active = still;
  return it.next >= n && !still.length;
}

let GLR = null;

const GL_VS = `#version 300 es
  void main() { gl_Position = vec4(gl_VertexID == 1 ? 3.0 : -1.0, gl_VertexID == 2 ? 3.0 : -1.0, 0.0, 1.0); }`;
const GL_FS = `#version 300 es
  precision highp float; precision highp int; precision highp usampler2D;
  uniform usampler2D cells, attrs, colmap, rowmap;
  uniform sampler2D atlas;
  uniform ivec2 slot;
  uniform int width, height, nx, ny;
  uniform float emph, dim, lift;
  out vec4 o;
  vec3 shade(ivec2 p) {
    p = clamp(p, ivec2(0), ivec2(width - 1, height - 1));
    uvec4 cx = texelFetch(colmap, ivec2(p.x, 0), 0), cy = texelFetch(rowmap, ivec2(p.y, 0), 0);
    ivec2 cell = ivec2(cx.r, cy.r);
    uvec4 c = texelFetch(cells, cell, 0);
    uvec2 m = texelFetch(attrs, cell, 0).rg;
    vec3 ink = vec3(c.rgb);
    ivec2 at = ivec2(int(c.a) * slot.x + int(cx.g), (int(cy.b) * nx + int(cx.b)) * slot.y + int(cy.g));
    float a = c.a == 0u ? 0.0 : texelFetch(atlas, at, 0).a;
    vec3 tile = floor(((m.g & 4u) != 0u ? vec3(255.0, 85.0, 85.0) : ink) * (float(m.r) / 255.0) + 0.5);
    vec3 col = mix(tile, ink, a);
    if (emph > 0.0 && (m.g & 2u) == 0u) {
      vec3 e;
      if ((m.g & 1u) != 0u) {
        float ab = c.a == 0u ? 0.0 : texelFetch(atlas, at + ivec2(0, nx * ny * slot.y), 0).a;
        e = mix(tile, floor(ink + (255.0 - ink) * lift + 0.5), ab);
      } else e = floor(col * dim + 0.5);
      col = mix(col, e, emph);
    }
    return col;
  }
  void main() {
    ivec2 p = ivec2(gl_FragCoord.xy);
    p.y = height - 1 - p.y;
    o = vec4(shade(p) / 255.0, 1.0);
  }`;

function glInit() {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, GL_VS));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, GL_FS));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn("WebGL renderer off:", gl.getProgramInfoLog(prog));
    return null;
  }
  gl.useProgram(prog);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  const tex = {},
    U = (n) => gl.getUniformLocation(prog, n);
  ["cells", "attrs", "colmap", "rowmap", "atlas"].forEach((name, unit) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(U(name), unit);
    tex[name] = unit;
  });
  const put = (name, ifmt, w, h, fmt, type, data) => {
    gl.activeTexture(gl.TEXTURE0 + tex[name]);
    gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, data);
  };
  gl.uniform1f(U("dim"), EMPH_DIM);
  gl.uniform1f(U("lift"), EMPH_LIFT);
  return {
    gl,
    U,
    tex,
    put,
    max: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    a: null,
    b: null,
    groups: null,
  };
}

function glLayout() {
  const R = GLR,
    gl = R.gl,
    W = canvas.width,
    H = canvas.height;
  const sw = Math.ceil(cw) + 1,
    sh = Math.ceil(ch) + 1;
  const OXS = Array.from({ length: COLS }, (_, x) => x * cw + cw / 2 - XE[x]);
  const OYS = Array.from(
    { length: ROWS },
    (_, y) => y * ch + glyphBase(ch) - YE[y]
  );
  const probe = document
    .createElement("canvas")
    .getContext("2d", { willReadFrequently: true });
  probe.canvas.width = sw * 2;
  probe.canvas.height = sh;
  probe.font = glyphFont(ch);
  probe.textAlign = "center";
  probe.textBaseline = "alphabetic";
  probe.fillStyle = "#fff";
  const look = (ox, oy) => {
    probe.clearRect(0, 0, sw * 2, sh);
    probe.fillText("Q", ox, oy);
    probe.fillText("|", sw + ox, oy);
    const d = probe.getImageData(0, 0, sw * 2, sh).data;
    let h = 0;
    for (let i = 3; i < d.length; i += 4) h = (h * 31 + d[i]) | 0;
    return h;
  };
  const group = (offs, at) => {
    const keys = [],
      reps = [],
      of = new Uint8Array(offs.length);
    offs.forEach((o, i) => {
      const h = at(o);
      let k = keys.indexOf(h);
      if (k < 0) {
        k = keys.length;
        keys.push(h);
        reps.push(o);
      }
      of[i] = k;
    });
    if (keys.length <= 8) return { of, reps };
    const lo = Math.min(...offs),
      hi = Math.max(...offs),
      step = (hi - lo) / 8 || 1;
    offs.forEach((o, i) => {
      of[i] = Math.min(7, Math.floor((o - lo) / step));
    });
    return {
      of,
      reps: Array.from({ length: 8 }, (_, k) => lo + (k + 0.5) * step),
    };
  };
  const tp0 = performance.now();
  const gx = group(OXS, (o) => look(o, OYS[0])),
    gy = group(OYS, (o) => look(OXS[0], o));
  const tp1 = performance.now();
  const nx = gx.reps.length,
    ny = gy.reps.length;
  if (W > R.max || H > R.max || NC * sw > R.max || 2 * nx * ny * sh > R.max)
    return false;
  gl.viewport(0, 0, W, H);
  const map = (n, E, of) => {
    const m = new Uint16Array(n * 4);
    for (let c = 0; c + 1 < E.length; c++)
      for (let p = E[c]; p < E[c + 1]; p++) {
        m[p * 4] = c;
        m[p * 4 + 1] = p - E[c];
        m[p * 4 + 2] = of[c];
      }
    return m;
  };
  R.put(
    "colmap",
    gl.RGBA16UI,
    W,
    1,
    gl.RGBA_INTEGER,
    gl.UNSIGNED_SHORT,
    map(W, XE, gx.of)
  );
  R.put(
    "rowmap",
    gl.RGBA16UI,
    H,
    1,
    gl.RGBA_INTEGER,
    gl.UNSIGNED_SHORT,
    map(H, YE, gy.of)
  );
  const a = document.createElement("canvas"),
    c = a.getContext("2d");
  a.width = NC * sw;
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  c.fillStyle = "#fff";
  a.height = nx * ny * sh;
  atlasRows(c, 0, gx.reps, gy.reps, sw, sh);
  R.boldArgs = [gx.reps, gy.reps, sw, sh];
  R.bold = false;
  const tp2 = performance.now();
  R.put(
    "atlas",
    gl.RGBA8,
    a.width,
    2 * nx * ny * sh,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null
  );
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, a);
  const tp3 = performance.now();
  (window.GLT = window.GLT || []).push({
    probe: Math.round(tp1 - tp0),
    atlas: Math.round(tp2 - tp1),
    upload: Math.round(tp3 - tp2),
    groups: [nx, ny],
  });
  gl.uniform2i(R.U("slot"), sw, sh);
  gl.uniform1i(R.U("height"), H);
  gl.uniform1i(R.U("width"), W);
  gl.uniform1i(R.U("nx"), nx);
  gl.uniform1i(R.U("ny"), ny);
  R.groups = [nx, ny];
  R.a = new Uint8Array(COLS * ROWS * 4);
  R.b = new Uint8Array(COLS * ROWS * 2);
  R.put(
    "cells",
    gl.RGBA8UI,
    COLS,
    ROWS,
    gl.RGBA_INTEGER,
    gl.UNSIGNED_BYTE,
    R.a
  );
  R.put("attrs", gl.RG8UI, COLS, ROWS, gl.RG_INTEGER, gl.UNSIGNED_BYTE, R.b);
  gl.uniform1f(R.U("emph"), 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  return true;
}

function atlasRows(c, bold, rx, ry, sw, sh) {
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  c.fillStyle = "#fff";
  c.font = bold ? `700 ${glyphSize(ch)}px ${FONT_STACK}` : glyphFont(ch);
  for (let ky = 0; ky < ry.length; ky++)
    for (let kx = 0; kx < rx.length; kx++)
      for (let g = 1; g < NC; g++) {
        const x0 = g * sw,
          y0 = (ky * rx.length + kx) * sh;
        c.save();
        c.beginPath();
        c.rect(x0, y0, sw, sh);
        c.clip();
        c.fillText(CHARS[g], x0 + rx[kx], y0 + ry[ky]);
        c.restore();
      }
}
function glBold() {
  const R = GLR,
    gl = R.gl;
  if (R.bold) return;
  const [rx, ry, sw, sh] = R.boldArgs,
    a = document.createElement("canvas");
  a.width = NC * sw;
  a.height = rx.length * ry.length * sh;
  atlasRows(a.getContext("2d"), 1, rx, ry, sw, sh);
  gl.activeTexture(gl.TEXTURE0 + R.tex.atlas);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, a.height, gl.RGBA, gl.UNSIGNED_BYTE, a);
  R.bold = true;
}

function glDraw() {
  const R = GLR,
    gl = R.gl,
    n = COLS * ROWS,
    A = R.a,
    B = R.b,
    it = intro,
    dark = scrubQueued && !REDUCED;
  const wait = dark ? loadingCells(performance.now()) : null,
    pv = (dark || it) && prevScreen();
  for (let i = 0; i < n; i++) {
    let g = 0,
      src = i,
      b = 0,
      f = 0,
      rgb = null;
    if (dark || (it && !it.done[i] && it.last[i] < 0)) {
      if (pv && !(wait && wait.has(i))) {
        A[i * 4] = pv.c[i * 3];
        A[i * 4 + 1] = pv.c[i * 3 + 1];
        A[i * 4 + 2] = pv.c[i * 3 + 2];
        A[i * 4 + 3] = pv.g[i];
        B[i * 2] = pv.b[i];
        B[i * 2 + 1] = pv.red[i] ? 6 : 2;
        continue;
      }
      A[i * 4] = A[i * 4 + 1] = A[i * 4 + 2] = wait && wait.has(i) ? 220 : 0;
      A[i * 4 + 3] = wait && wait.has(i) ? wait.get(i) : 0;
      B[i * 2] = 0;
      B[i * 2 + 1] = 2;
      continue;
    }
    const tg = it ? TEXTG[i] : -1;
    if (tg >= 0) {
      g = tg;
      rgb = i * 3;
      f = BAR[i] ? 6 : 2;
      b = BAR[i];
    } else {
      const key = shown[i] < 0 ? i * LEVELS : shown[i];
      src = Math.floor(key / LEVELS);
      g = DG[i];
      if (BAR[src]) {
        b = 1;
        f = 6;
      } else if (g === GL[src]) {
        b = BOX[src] ? 0 : P.bg;
        f = (RUNS[src] ? 1 : 0) | (BOX[src] ? 2 : 0);
      } else
        b = BOX[src] ? 0 : P.bg * (1 - (key - src * LEVELS) / (LEVELS - 1));
    }
    if (it && !it.done[i]) {
      const lv = it.last[i];
      g = RAMP_LUT[Math.round(((DENS[g] * lv) / 8) * 255)];
      b *= lv / 8;
    }
    if (rgb !== null) {
      A[i * 4] = TEXTC[rgb];
      A[i * 4 + 1] = TEXTC[rgb + 1];
      A[i * 4 + 2] = TEXTC[rgb + 2];
    } else {
      A[i * 4] = FG[src * 3];
      A[i * 4 + 1] = FG[src * 3 + 1];
      A[i * 4 + 2] = FG[src * 3 + 2];
    }
    A[i * 4 + 3] = g;
    B[i * 2] = Math.round(b * 255);
    B[i * 2 + 1] = f;
  }
  gl.activeTexture(gl.TEXTURE0 + R.tex.cells);
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,
    0,
    0,
    COLS,
    ROWS,
    gl.RGBA_INTEGER,
    gl.UNSIGNED_BYTE,
    A
  );
  gl.activeTexture(gl.TEXTURE0 + R.tex.attrs);
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,
    0,
    0,
    COLS,
    ROWS,
    gl.RG_INTEGER,
    gl.UNSIGNED_BYTE,
    B
  );
  gl.uniform1f(R.U("emph"), EMPH.t);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  handoverDone();
}

const KEEP_R = 0.12;
const PUSH = 0.03;
const FADE = 0.95;
const LEVELS = 16;
const ptr = { x: -1e4, y: -1e4, in: false, a: 0, av: 0 };
let pending = false,
  running = false;

function sourceOf(x, y, R) {
  const i = y * COLS + x;
  if (ptr.a < 0.002 || BOX[i] || RUNS[i]) return i * LEVELS;
  const dx = (x + 0.5) * cw - ptr.x * cw,
    dy = (y + 0.5) * ch - ptr.y * ch;
  const d = Math.hypot(dx, dy),
    f = d / R;
  if (f >= 1) return i * LEVELS;
  const w = (1 - f * f) ** 2 * Math.min(1, ptr.a);
  const q = Math.min(LEVELS - 1, Math.round(FADE * w * ptr.a * (LEVELS - 1)));
  if (d < 1e-3) return i * LEVELS + q;
  const s = Math.max(0, d - PUSH * canvas.height * w * ptr.a) / d;
  const sx = Math.floor(ptr.x + (x + 0.5 - ptr.x) * s),
    sy = Math.floor(ptr.y + (y + 0.5 - ptr.y) * s);
  const src =
    Math.min(ROWS - 1, Math.max(0, sy)) * COLS +
    Math.min(COLS - 1, Math.max(0, sx));
  return (BOX[src] || RUNS[src] ? i : src) * LEVELS + q;
}

function update() {
  const R = KEEP_R * canvas.height * Math.max(1, ptr.a);
  let cur = null;
  if (ptr.a >= 0.002)
    cur = [
      Math.max(0, Math.floor(ptr.x - R / cw) - 1),
      Math.max(0, Math.floor(ptr.y - R / ch) - 1),
      Math.min(COLS - 1, Math.ceil(ptr.x + R / cw) + 1),
      Math.min(ROWS - 1, Math.ceil(ptr.y + R / ch) + 1),
    ];
  const u =
    box && cur
      ? [
          Math.min(box[0], cur[0]),
          Math.min(box[1], cur[1]),
          Math.max(box[2], cur[2]),
          Math.max(box[3], cur[3]),
        ]
      : box || cur;
  box = cur;
  if (!u) return;
  if (ctx) syncBase();
  const changed = [];
  for (let y = u[1]; y <= u[3]; y++)
    for (let x = u[0]; x <= u[2]; x++) {
      const i = y * COLS + x,
        key = sourceOf(x, y, R);
      if (key === shown[i]) continue;
      shown[i] = key;
      fixed.delete(i);
      drawCell(i, glyphOf(key));
      changed.push(i);
    }
  if (!changed.length) return;
  for (const i of fixed) {
    const g = glyphOf(shown[i]);
    if (!badThrough(DG, i, g)) {
      fixed.delete(i);
      drawCell(i, g);
    }
  }
  for (const i of changed) {
    if (badThrough(DG, i, DG[i])) {
      fixed.add(i);
      drawCell(i, RAMP_LUT[Math.round(DENS[DG[i]] * 255)]);
    }
  }
}

function glyphOf(key) {
  const src = Math.floor(key / LEVELS),
    q = key - src * LEVELS;
  return q
    ? RAMP_LUT[Math.round(DENS[GL[src]] * (1 - q / (LEVELS - 1)) * 255)]
    : GL[src];
}

function drawCell(i, g) {
  DG[i] = g;
  if (!ctx) return;
  const x = i % COLS,
    y = (i - x) / COLS,
    src = Math.floor(shown[i] / LEVELS);
  const dx = XE[x],
    dy = YE[y],
    dw = XE[x + 1] - dx,
    dh = YE[y + 1] - dy;
  if (g === GL[src]) {
    const sx = src % COLS,
      sy = (src - sx) / COLS;
    ctx.drawImage(base, XE[sx], YE[sy], dw, dh, dx, dy, dw, dh);
    if (EMPH.t > 0) {
      ctx.globalAlpha = EMPH.t;
      ctx.drawImage(emph, XE[sx], YE[sy], dw, dh, dx, dy, dw, dh);
      ctx.globalAlpha = 1;
    }
    return;
  }
  const k = 1 - (1 - EMPH_DIM) * EMPH.t;
  const q = shown[i] - src * LEVELS,
    b = P.bg * (1 - q / (LEVELS - 1)) * k;
  ctx.fillStyle = "#000";
  ctx.fillRect(dx, dy, dw, dh);
  if (b > 0) tile(ctx, i, src, b);
  if (!g) return;
  ctx.fillStyle = `rgb(${FG[src * 3] * k},${FG[src * 3 + 1] * k},${FG[src * 3 + 2] * k})`;
  ctx.fillText(CHARS[g], x * cw + cw / 2, y * ch + glyphBase(ch));
}

let last = 0,
  rafPrev = 0;
const PERF = { gap: 0, last: null, cells: 0 };
function kick() {
  if (running) return;
  running = true;
  last = performance.now();
  rafPrev = 0;
  requestAnimationFrame(frame);
}
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (rafPrev && now - rafPrev < 100) {
    FRAME_MS.push(now - rafPrev);
    if (FRAME_MS.length > 9) FRAME_MS.shift();
  }
  PERF.gap = rafPrev ? now - rafPrev : 0;
  rafPrev = now;
  const w0 = performance.now();
  PERF.cells = 0;
  const setup = pending;
  if (pending) {
    pending = false;
    process();
  }
  const waiting = scrubQueued && COLS && !scrubReady(now);
  if (waiting && ctx) drawLoading(now);
  if (scrubQueued && COLS && !waiting && !setup) {
    scrubQueued = false;
    if (!scrub.stats.firstDisplay) {
      scrub.stats.firstDisplay = performance.now();
      scrub.stats.waited = scrub.waitFrom
        ? Math.round(now - scrub.waitFrom)
        : 0;
    }
    startScrub();
    if (REDUCED) revealTitle();
    else startIntro(now);
  }
  const playing = scrub.playing && COLS ? stepScrub(now) : false;
  const w1 = performance.now();
  const t = ptr.in ? 1 : 0;
  ptr.av += (90 * (t - ptr.a) - 13 * ptr.av) * dt;
  ptr.a = Math.max(0, ptr.a + ptr.av * dt);
  const settled = Math.abs(t - ptr.a) < 0.002 && Math.abs(ptr.av) < 0.01;
  if (settled) {
    ptr.a = t;
    ptr.av = 0;
  }
  if (COLS && (GLR || !intro)) update();
  if (intro) {
    const done = stepIntro(now);
    PERF.last = {
      js: performance.now() - w0,
      scrub: w1 - w0,
      fade: performance.now() - w1,
      cells: PERF.cells,
    };
    if (done) {
      intro = null;
      PREV = null;
      showBase();
      revealTitle();
    } else {
      const g0 = performance.now();
      if (GLR) glDraw();
      if (GLR)
        (scrub.stats.gl = scrub.stats.gl || []).push(performance.now() - g0);
      (scrub.stats.js = scrub.stats.js || []).push(performance.now() - w0);
      requestAnimationFrame(frame);
      return;
    }
  }
  if (waiting && ctx) drawLoading(now);
  const fading = COLS ? stepEmphasis(dt) : false;
  const g0 = performance.now();
  if (GLR && COLS) glDraw();
  if (scrub.playing && GLR)
    (scrub.stats.gl = scrub.stats.gl || []).push(performance.now() - g0);
  if (scrub.playing)
    (scrub.stats.js = scrub.stats.js || []).push(performance.now() - w0);
  PERF.last = {
    js: performance.now() - w0,
    scrub: w1 - w0,
    fade: 0,
    cells: PERF.cells,
  };
  if (LOWRES && !scrubQueued && !scrub.playing) {
    LOWRES = false;
    pending = true;
  }
  if (!settled || pending || fading || playing || waiting || scrubQueued)
    requestAnimationFrame(frame);
  else running = false;
}

try {
  new PerformanceObserver((list) => {
    if (!scrubQueued && !scrub.playing) return;
    for (const e of list.getEntries())
      console.log(
        `scrub: long task ${Math.round(e.duration)} ms at ${Math.round(e.startTime)} ms (scrub at record ${scrub.at}, ${scrub.recs.length} of ${scrub.total || "?"} in)`
      );
  }).observe({ type: "longtask" });
} catch (e) {}

const panel = document.getElementById("panel");
let scrubQueued = true;
const replay = () => {
  if (
    scrub.stats.firstDisplay &&
    !scrub.playing &&
    !scrub.cut &&
    scrub.recs.length
  ) {
    scrubQueued = true;
    pending = true;
    kick();
  }
};
panel.addEventListener("pointermove", (e) => e.stopPropagation());

function toCell(e) {
  const b = canvas.getBoundingClientRect();
  return [
    ((e.clientX - b.left) / b.width) * COLS,
    ((e.clientY - b.top) / b.height) * ROWS,
  ];
}
addEventListener("pointermove", (e) => {
  const [x, y] = toCell(e),
    i = Math.floor(y) * COLS + Math.floor(x);
  const overRun =
    e.target === canvas && x >= 0 && y >= 0 && x < COLS && y < ROWS && RUNS[i];
  setEmphasis(!!overRun, "art");
  if (REDUCED) return;
  [ptr.x, ptr.y] = [x, y];
  ptr.in = true;
  kick();
});
addEventListener("pointerdown", (e) => {
  if (
    e.button === 0 &&
    !(
      e.target instanceof Element &&
      e.target.closest("#title, #info, #nav, #panel")
    )
  )
    getSelection().removeAllRanges();
  if (REDUCED) return;
  [ptr.x, ptr.y] = toCell(e);
  ptr.in = true;
  ptr.av += 9;
  kick();
});
const bigName = document.getElementById("title-name");
bigName.addEventListener("pointerenter", () => setEmphasis(true, "name"));
bigName.addEventListener("pointerleave", () => setEmphasis(false, "name"));
document.documentElement.addEventListener("pointerleave", () => {
  ptr.in = false;
  kick();
});
document.getElementById("nav").addEventListener("click", (e) => {
  if (e.target.closest("a")) saveScreen();
});
addEventListener("keydown", (e) => {
  if (e.key === "h") panel.classList.toggle("hidden");
  else if (e.key === "r") replay();
  else if (/^[1-9]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey)
    document.querySelectorAll("#nav a")[e.key - 1]?.click();
});
addEventListener("resize", () => {
  pending = true;
  kick();
});
(function watchRatio() {
  matchMedia(`(resolution: ${devicePixelRatio}dppx)`).addEventListener(
    "change",
    () => {
      pending = true;
      kick();
      watchRatio();
    },
    { once: true }
  );
})();

GLR = /[?&]2d\b/.test(location.search) ? null : glInit();
if (!GLR) ctx = canvas.getContext("2d");
canvas.addEventListener("webglcontextlost", (e) => e.preventDefault());
canvas.addEventListener("webglcontextrestored", () => {
  GLR = glInit();
  pending = true;
  kick();
});
const first = loadFirst();
first.then(loadStream);
Promise.all([
  first,
  ...[FONT, FONT_BOLD].map((f) =>
    f.load().then(
      (f) => document.fonts.add(f),
      () => {}
    )
  ),
]).then(() => {
  performance.mark("fonts");
  measureFont();
  performance.mark("measured");
  calibrate();
  performance.mark("calib");
  pending = true;
  kick();
});
