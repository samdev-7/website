const DATA = window.DATA_URL,
  SITE_Q = `?o=${location.host}`;
async function fetchLatest(res, signal) {
  res = await (res || fetch(`${DATA}/ascii/latest.bin${SITE_Q}`, { signal }));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const b = new Uint8Array(await res.arrayBuffer()),
    v = new DataView(b.buffer);
  if (String.fromCharCode(...b.subarray(0, 4)) !== "ASL1")
    throw new Error("not an ASL1 frame");
  const n = b[14];
  return {
    cols: v.getUint16(4, true),
    rows: v.getUint16(6, true),
    at: v.getUint32(8, true),
    off: v.getInt16(12, true),
    stream: new TextDecoder().decode(b.subarray(15, 15 + n)),
    body: b.subarray(15 + n),
  };
}
async function* streamMessages(res, net) {
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
  Object.assign(net, {
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
  const raw = res.body.getReader(),
    head = await raw.read();
  net.gz = !head.done && head.value[0] === 0x1f && head.value[1] === 0x8b;
  if (!net.gz) net.size = 0;
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
  if (net.gz) body = body.pipeThrough(new DecompressionStream("gzip"));
  const reader = body.getReader(),
    out = [],
    parse = scrubParser((m) => out.push(m));
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    parse(value);
    while (out.length) yield out.shift();
  }
}
let STREAM = null;
let FIRST = null;
const FIRST_P = (async () => {
  if (window.scrubStream) {
    const stuck = setTimeout(
      () => window.scrubAbort.abort(new Error("no newest frame after 6 s")),
      6000
    );
    try {
      const net = {},
        it = streamMessages(await window.scrubStream, net);
      const head = (await it.next()).value?.head,
        rec = (await it.next()).value?.rec;
      if (head?.magic !== "SCR3" || rec?.kind !== 4)
        throw new Error("not an SCR3 stream");
      clearTimeout(stuck);
      STREAM = { it, head, net };
      return {
        cols: head.cols,
        rows: head.rows,
        at: rec.t,
        off: rec.off,
        body: rec.body,
      };
    } catch (e) {
      clearTimeout(stuck);
      console.warn(
        `scrub.bin: ${e.message}; showing the newest frame without the scrub`
      );
      window.scrubAbort?.abort();
    }
  }
  let res = window.latestFrame,
    limit = 6000;
  for (
    let wait = 1000;
    ;
    wait = Math.min(wait * 2, 15000), limit = Math.min(limit * 2, 30000)
  ) {
    try {
      return await fetchLatest(res, AbortSignal.timeout(limit));
    } catch (e) {
      console.warn(`latest.bin: ${e.message}; retrying in ${wait / 1000} s`);
      res = null;
      await new Promise((r) => setTimeout(r, wait));
    }
  }
})();
const FONT = new FontFace(
  "IBM Plex Mono",
  "url(data:font/woff2;base64,__FONT__)"
);
const FONT_BOLD = new FontFace(
  "IBM Plex Mono",
  "url(data:font/woff2;base64,__FONT_BOLD__)",
  { weight: "700" }
);
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

let BOX;
let BAR = new Uint8Array(0);
const NAV_RED = [0xff, 0x55, 0x55];
let SUB_LINES = [SUBTITLE];
let MAIL_WRAP = false;
const contactLines = () =>
  document.getElementById("title-contact").textContent.split("\n");
const contactW = () => Math.max(...contactLines().map((l) => l.length));

let DAY = "",
  LIVE = false;
const LIVE_TEXT = "live";
const dayText = () => (LIVE ? LIVE_TEXT : DAY);
const infoLines = () => {
  const lines = ["info-place", "info-time"].map(
    (id) => document.getElementById(id).textContent
  );
  const w = Math.max(
      TIME_W,
      ...lines.map((l) => l.length),
      "nov 30".length + 4
    ),
    mid = dayText(),
    l = (w - 1 - mid.length) >> 1;
  return [
    ...lines.map((l) => l.padStart(w)),
    "<" + " ".repeat(l) + mid + " ".repeat(w - 2 - l - mid.length) + ">",
  ];
};
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
let HINT_AT = null;
let HINT_GONE = false;
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
  if (REDUCED || !COLS || SMALL) return;
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
  ["title", "info", "nav", "hint"].forEach((id) =>
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
    el.removeAttribute("style");
    return;
  }
  const { dpr } = gridText(el, [INFO_AT[0], INFO_AT[1] + 1]);
  el.style.width = (infoLines()[0].length * cw) / dpr + "px";
  el.style.textAlign = "right";
}

function placeHint() {
  const el = document.getElementById("hint");
  el.hidden = !HINT_AT;
  if (HINT_AT) gridText(el, HINT_AT);
}

function placeNav() {
  const el = document.getElementById("nav"),
    links = [...el.querySelectorAll("a")],
    seps = [...el.querySelectorAll(".sep")];
  const texts = [...el.querySelectorAll("a > span, .sep > span")];
  if (!NAV_AT) {
    for (const e of [el, ...links, ...seps, ...texts])
      e.removeAttribute("style");
    return;
  }
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
    for (const e of [el, name, name.parentNode, mail])
      e.removeAttribute("style");
    return;
  }
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
  cell: 1470 / 160,
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
  const MIN_COLS = minCols(navWidth());
  let small = false;
  if (cols < MIN_COLS && MIN_COLS <= FC) {
    if (W / MIN_COLS / dpr < MIN_TEXT_CELL) small = true;
    else {
      cols = MIN_COLS;
      cw = W / cols;
      rows = Math.min(FR, Math.max(1, Math.round(H / (cw / ASPECT))));
      ch = H / rows;
    }
  }
  OX = (FC - cols) >> 1;
  OY = (FR - rows) >> 1;
  COLS = cols;
  ROWS = rows;
  const n = cols * rows;
  const boxes = small
    ? null
    : heroBoxes(cols, rows, navWidth(), contactW(), infoLines());
  SMALL = !boxes;
  const title = boxes ? boxes.title : { cells: new Map() },
    { cells: boxCells, textX, textY } = title;
  if (boxes) {
    SUB_LINES = title.sub;
    MAIL_WRAP = title.wrapMail;
  }
  TITLE_AT = boxes && [textX, textY];
  INFO_AT = boxes && [boxes.info.textX, boxes.info.textY];
  if (INFO_AT) for (const [c, v] of boxes.info.cells) boxCells.set(c, v);
  const hint = boxes && !HINT_GONE && hintLayout(cols, title);
  HINT_AT = hint && [hint.textX, hint.textY];
  if (hint) for (const [c, v] of hint.cells) boxCells.set(c, v);
  document.body.classList.toggle("small", SMALL);
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
  if (HINT_AT)
    [...HINT_TEXT].forEach((c, k) =>
      TEXT.set(HINT_AT[1] * cols + HINT_AT[0] + k, [
        Math.max(0, CHARS.indexOf(c)),
        [220, 220, 220],
      ])
    );
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
  placeHint();
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
  if (REDUCED || (on && (!RUN_COUNT || scrub.playing))) return;
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

async function loadFirst() {
  FIRST = await FIRST_P;
  FC = FIRST.cols;
  FR = FIRST.rows;
  FIRST_STATE = [FIRST.body.slice(0, FC * FR), FIRST.body.slice(FC * FR)];
  FGL = FIRST_STATE[0].slice();
  FRGB = FIRST_STATE[1].slice();
  setTime(FIRST.at, FIRST.off, REDUCED);
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
  if (REDUCED || !STREAM) {
    scrub.ended = true;
    kick();
    return;
  }
  const { it, head, net } = STREAM;
  scrub.abort = window.scrubAbort;
  scrub.net = net;
  scrub.total = head.total;
  scrub.dur = head.dur;
  if (!net.gz) net.size = head.size;
  performance.mark("fetch");
  try {
    for (;;) {
      const { value, done } = await it.next();
      if (done || scrub.cut) break;
      if (!value.rec) continue;
      scrub.recs.push(value.rec);
      if (!st.firstRecord) st.firstRecord = performance.now();
    }
    st.streamDone = performance.now();
    const e = performance
      .getEntriesByType("resource")
      .find((e) => e.name.includes("/ascii/scrub.bin"));
    if (e) st.bytes = e.encodedBodySize || e.transferSize;
  } catch (e) {
    if (!scrub.cut) console.warn("scrub stream:", e);
  }
  scrub.ended = true;
  kick();
}

const ZONES = { "-300": "est", "-240": "edt" };
const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];
function setTime(t, off, live) {
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
  DAY = `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  LIVE = !!live;
  const line = infoLines()[2],
    at = line.indexOf(dayText());
  document.getElementById("info-live").hidden = !LIVE;
  document.getElementById("info-date").hidden = LIVE;
  document.getElementById("info-gap").textContent = line.slice(1, at);
  document.getElementById("info-gap2").textContent = line.slice(
    at + dayText().length,
    -1
  );
  document.getElementById("info-date").textContent = DAY;
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
  setTime(r.t, r.off, r.kind === 3);
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
  }
  return false;
}

const LOADING_AFTER = 1000;
const DOTS_MS = 350;
function loadingCells(now) {
  const cells = new Map();
  if (now < LOADING_AFTER || !COLS) return cells;
  const text =
      "loading" + ".".repeat(Math.floor((now - LOADING_AFTER) / DOTS_MS) % 4),
    y = ROWS >> 1,
    x0 = (COLS - "loading...".length) >> 1;
  [...text].forEach((c, k) => cells.set(y * COLS + x0 + k, CHARS.indexOf(c)));
  return cells;
}
let SMALL = false;
function smallCells() {
  const lines = [];
  for (const l of SMALL_TEXT) {
    let line = "";
    for (const w of l.split(" ")) {
      if (line && line.length + 1 + w.length > COLS) {
        lines.push(line);
        line = w;
      } else line = line ? line + " " + w : w;
    }
    lines.push(line);
  }
  const cells = new Map(),
    y0 = (ROWS - lines.length) >> 1;
  lines.forEach((l, r) =>
    [...l].forEach((c, k) =>
      cells.set(
        (y0 + r) * COLS + ((COLS - l.length) >> 1) + k,
        CHARS.indexOf(c)
      )
    )
  );
  return cells;
}
function drawSmall() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(220,220,220)";
  for (const [i, g] of smallCells()) {
    const x = i % COLS,
      y = (i - x) / COLS;
    ctx.fillText(CHARS[g], x * cw + cw / 2, y * ch + glyphBase(ch));
  }
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
(function holdHandover() {
  const H = window.HANDOVER;
  if (!H) return;
  H.hold();
  const { ctx: c, XE, YE, s } = H,
    g = s.g,
    y = s.rows >> 1,
    x0 = (s.cols - "loading...".length) >> 1;
  const left = XE[x0],
    top = YE[y],
    strip = c.getImageData(left, top, XE[x0 + 10] - left, YE[y + 1] - top);
  let drawn = "";
  requestAnimationFrame(function step(now) {
    if (!H.canvas.isConnected) return;
    const text =
      now < LOADING_AFTER
        ? ""
        : "loading" +
          ".".repeat(Math.floor((now - LOADING_AFTER) / DOTS_MS) % 4);
    if (text !== drawn) {
      drawn = text;
      c.putImageData(strip, left, top);
      c.fillStyle = "#000";
      c.fillRect(left, top, XE[x0 + text.length] - left, YE[y + 1] - top);
      c.fillStyle = "rgb(220,220,220)";
      c.font = `${g.fs}px ${FONT_STACK}`;
      [...text].forEach((ch, k) =>
        c.fillText(ch, (x0 + k) * g.cw + g.cw / 2, y * g.ch + g.base)
      );
    }
    requestAnimationFrame(step);
  });
})();

const INTRO_SPEED = 2;
const INTRO_DUR = 0.5;
let intro = null;

function startIntro(now) {
  ["title", "info", "nav", "hint"].forEach((id) =>
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
    dark = (scrubQueued && !REDUCED) || SMALL;
  const wait = SMALL
      ? smallCells()
      : dark
        ? loadingCells(performance.now())
        : null,
    pv = !SMALL && (dark || it) && prevScreen();
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
  if (waiting && ctx && !SMALL) drawLoading(now);
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
      if (SMALL && ctx) drawSmall();
      requestAnimationFrame(frame);
      return;
    }
  }
  if (waiting && ctx && !SMALL) drawLoading(now);
  const fading = COLS ? stepEmphasis(dt) : false;
  if (SMALL && ctx) drawSmall();
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

let scrubQueued = true;
const replay = () => {
  if (
    !scrub.stats.firstDisplay ||
    scrub.playing ||
    scrub.cut ||
    !scrub.recs.length
  )
    return;
  if (HIST.list) {
    HIST.at = HIST.want = HIST.list.length;
    HIST.acc = 0;
  }
  scrubQueued = true;
  pending = true;
  kick();
};

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
    !(e.target instanceof Element && e.target.closest("#title, #info, #nav"))
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
  if (e.key === "r") replay();
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

const POLL_MS = (+location.search.match(/[?&]poll=(\d+)/)?.[1] || 120) * 1000;
let NEXT = null;
async function poll() {
  if (document.hidden || !FIRST) return;
  try {
    const f = await fetchLatest(null, AbortSignal.timeout(20000));
    if (f.at > (NEXT || FIRST).at && f.cols === FC && f.rows === FR) NEXT = f;
  } catch (e) {
    console.warn(`latest.bin: ${e.message}`);
  }
  if (!NEXT || !scrub.stats.end || scrub.playing || intro) return;
  const live = !HIST.list || HIST.at === HIST.list.length;
  if (HIST.list)
    HIST.list.push({ t: FIRST.at, off: FIRST.off, body: FIRST.body });
  Object.assign(FIRST, NEXT);
  FIRST_STATE = [NEXT.body.slice(0, FC * FR), NEXT.body.slice(FC * FR)];
  NEXT = null;
  if (!live) return;
  if (HIST.list) HIST.at = HIST.want = HIST.list.length;
  showRecord({ kind: 3, t: FIRST.at, off: FIRST.off });
}
setInterval(poll, POLL_MS);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) poll();
});
const STEP_TOL = 16,
  STEP_SETTLE = 250;
let settle = null;
function showRecord(r, step) {
  clearTimeout(settle);
  if (step && ctx && !EMPH.t && r.kind === 1) {
    setTime(r.t, r.off, false);
    const N = FC * FR,
      b = r.body;
    CHANGED.length = 0;
    for (let j = 0; j < N; j++) {
      const g = b[j],
        R = b[N + j],
        G = b[2 * N + j],
        B = b[3 * N + j];
      if (
        g === FGL[j] &&
        Math.abs(R - FRGB[j]) <= STEP_TOL &&
        Math.abs(G - FRGB[N + j]) <= STEP_TOL &&
        Math.abs(B - FRGB[2 * N + j]) <= STEP_TOL
      )
        continue;
      FGL[j] = g;
      FRGB[j] = R;
      FRGB[N + j] = G;
      FRGB[2 * N + j] = B;
      const i = WMAP[j];
      if (i < 0) continue;
      GL[i] = g;
      FG[i * 3] = R;
      FG[i * 3 + 1] = G;
      FG[i * 3 + 2] = B;
      CHANGED.push(i);
    }
    refresh(CHANGED);
    findRuns();
    emphReady = false;
    kick();
    settle = setTimeout(() => {
      if (HIST.at === HIST.want) showRecord(r);
    }, STEP_SETTLE);
    return;
  }
  applyRecord(r);
  refresh(null);
  findRuns();
  emphReady = false;
  redrawAll();
  kick();
}

const HIST_STEP = 60;
const HIST_NEAR = 10,
  HIST_FAR = 20;
const HIST_BUFFER = 15;
const HIST_SLOW_MS = 50;
const HIST = { list: null, at: 0, want: 0, dir: -1, acc: 0, ready: false };
async function loadHistory(streamIn) {
  try {
    const res = await fetch(`${DATA}/ascii/frames.bin${SITE_Q}`, {
      priority: "low",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const b = new Uint8Array(await res.arrayBuffer()),
      v = new DataView(b.buffer);
    if (String.fromCharCode(...b.subarray(0, 4)) !== "AFL1")
      throw new Error("not an AFL1 list");
    if (v.getUint16(4, true) !== FC || v.getUint16(6, true) !== FR) return;
    const list = [];
    for (let k = 0, p = 10; k < v.getUint16(8, true); k++, p += 30) {
      const t = v.getUint32(p, true);
      if (t < FIRST.at)
        list.push({
          t,
          off: v.getInt16(p + 4, true),
          group: String.fromCharCode(...b.subarray(p + 6, p + 30)),
        });
    }
    HIST.list = list;
    HIST.at = HIST.want = list.length;
    await streamIn;
    HIST.ready = true;
    preload();
  } catch (e) {
    console.warn(`frames.bin: ${e.message}`);
  }
}
const frameUrl = (f) => `${DATA}/ascii/${f.group}.bin${SITE_Q}`;
function warm(f) {
  if (!f || f.body || f.loading || f.warm) return;
  f.warm = fetch(frameUrl(f), { priority: "low" })
    .then((r) => r.arrayBuffer())
    .catch(() => {
      f.warm = null;
    });
}
async function loadFrame(f, high) {
  const ac = (f.abort = new AbortController());
  try {
    if (f.warm) await f.warm;
    const url = frameUrl(f),
      t0 = performance.now();
    const res = await fetch(url, {
      priority: high ? "high" : "low",
      signal: ac.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const b = new Uint8Array(await res.arrayBuffer()),
      v = new DataView(b.buffer),
      N = FC * FR;
    if (
      String.fromCharCode(...b.subarray(0, 4)) !== "ASC1" ||
      v.getUint16(4, true) !== FC ||
      v.getUint16(6, true) !== FR ||
      b.length !== 8 + 4 * N
    )
      throw new Error("not a frame of this size");
    const body = new Uint8Array(4 * N);
    body.set(b.subarray(8, 8 + N));
    for (let j = 0, p = 8 + N; j < N; j++, p += 3) {
      body[N + j] = b[p];
      body[2 * N + j] = b[p + 1];
      body[3 * N + j] = b[p + 2];
    }
    const e = performance
      .getEntriesByName(new URL(url, location.href).href)
      .pop();
    f.got = {
      fetch: Math.round(performance.now() - t0),
      from: !e
        ? "?"
        : e.transferSize
          ? `network ${(e.encodedBodySize / 1024).toFixed(0)} KB`
          : "browser cache",
    };
    f.body = body;
    f.loading = null;
    f.abort = null;
    seek();
  } catch (e) {
    if (e.name !== "AbortError") console.warn(`${f.group}: ${e.message}`);
    f.loading = null;
    f.abort = null;
  }
}
function trim() {
  HIST.list.forEach((f, i) => {
    if (
      f.body &&
      f.group &&
      Math.abs(i - HIST.at) > HIST_BUFFER &&
      Math.abs(i - HIST.want) > HIST_BUFFER
    )
      f.body = null;
  });
}
function preload() {
  if (!HIST.ready) return;
  const keep = new Set();
  const load = (i, high) => {
    const f = HIST.list[i];
    if (!f) return;
    keep.add(i);
    if (!f.body && !f.loading) f.loading = loadFrame(f, high);
  };
  if (HIST.want === HIST.at) {
    for (let k = 1; k <= HIST_NEAR; k++) load(HIST.at + HIST.dir * k);
    for (let k = HIST_NEAR + 1; k <= HIST_NEAR + HIST_FAR; k++)
      warm(HIST.list[HIST.at + HIST.dir * k]);
  } else {
    load(HIST.want, true);
    for (const i of glidePath(HIST.at, HIST.want).slice(0, 16)) load(i);
    for (let k = 1; k <= 8; k++) load(HIST.want + HIST.dir * k);
    HIST.list.forEach((f, i) => {
      if (f.abort && !keep.has(i)) f.abort.abort();
    });
  }
  trim();
}
function glidePath(at, want) {
  const out = [];
  while (at !== want) {
    const left = want - at;
    at +=
      Math.sign(left) *
      Math.min(
        Math.abs(left),
        GLIDE_MAX,
        Math.max(1, Math.ceil(Math.abs(left) / GLIDE_EASE))
      );
    out.push(at);
  }
  return out;
}
const GLIDE_FPS = 30,
  GLIDE_EASE = 4,
  GLIDE_MAX = 12;
let gliding = false,
  lastDraw = 0,
  stallFrom = 0;
function seek() {
  if (gliding || !HIST.list || !scrub.stats.end || scrub.playing || intro)
    return;
  gliding = true;
  requestAnimationFrame(glide);
}
function glide(now) {
  if (HIST.at === HIST.want || !histReady()) {
    gliding = false;
    stallFrom = 0;
    return;
  }
  if (now - lastDraw < 1000 / GLIDE_FPS - 4)
    return requestAnimationFrame(glide);
  const left = HIST.want - HIST.at,
    d = Math.sign(left);
  const reach =
    HIST.at +
    d *
      Math.min(
        Math.abs(left),
        GLIDE_MAX,
        Math.max(1, Math.ceil(Math.abs(left) / GLIDE_EASE))
      );
  let to = -1;
  for (let i = reach; i !== HIST.at; i -= d)
    if (i === HIST.list.length || HIST.list[i].body) {
      to = i;
      break;
    }
  if (to < 0) {
    if (!stallFrom) stallFrom = now;
    preload();
    return requestAnimationFrame(glide);
  }
  const f = HIST.list[to],
    d0 = performance.now();
  HIST.at = to;
  lastDraw = now;
  showRecord(
    f
      ? { kind: 1, t: f.t, off: f.off, body: f.body }
      : { kind: 3, t: FIRST.at, off: FIRST.off },
    true
  );
  if (stallFrom && now - stallFrom > HIST_SLOW_MS)
    console.log(
      `history: waited ${Math.round(now - stallFrom)} ms for ${f ? f.group : "now"} (draw ${(performance.now() - d0).toFixed(1)} ms` +
        (f && f.got
          ? `, fetched in ${f.got.fetch} ms from ${f.got.from}`
          : "") +
        `, ${Math.abs(HIST.want - to)} still to go)`
    );
  stallFrom = 0;
  if (!f) poll();
  preload();
  requestAnimationFrame(glide);
}
const HINT_FADE = 0.5;
function dismissHint() {
  if (HINT_GONE) return;
  HINT_GONE = true;
  const at = HINT_AT;
  document.getElementById("hint").hidden = true;
  pending = true;
  kick();
  if (!at || REDUCED) return;
  const w = HINT_TEXT.length + 4,
    x0 = at[0] - 2,
    y0 = at[1] - 1,
    cols = w,
    rows = 3;
  const L = XE[x0],
    T = YE[y0],
    cv = document.createElement("canvas");
  cv.width = XE[x0 + w] - L;
  cv.height = YE[y0 + rows] - T;
  cv.style.cssText = `left: ${L / SCALE}px; top: ${T / SCALE}px; width: ${cv.width / SCALE}px; height: ${cv.height / SCALE}px; pointer-events: none; z-index: 1;`;
  canvas.after(cv);
  const c = cv.getContext("2d"),
    base0 = glyphBase(ch),
    G = new Uint8Array(cols * rows),
    S = new Float32Array(cols * rows);
  [...HINT_TEXT].forEach((t, k) => {
    G[cols + 2 + k] = Math.max(0, CHARS.indexOf(t));
  });
  const cx = cols / 2,
    cy = rows / 2,
    dmax = Math.hypot(cx * ASPECT, cy);
  for (let y = 0, i = 0; y < rows; y++)
    for (let x = 0; x < cols; x++, i++)
      S[i] =
        (Math.hypot((x + 0.5 - cx) * ASPECT, y + 0.5 - cy) / dmax) * 0.6 +
        Math.random() * 0.25;
  const cell = (i, g) => {
    const x = i % cols,
      y = (i - x) / cols,
      l = XE[x0 + x] - L,
      t = YE[y0 + y] - T;
    c.fillStyle = "#000";
    c.fillRect(l, t, XE[x0 + x + 1] - XE[x0 + x], YE[y0 + y + 1] - YE[y0 + y]);
    if (g) {
      c.fillStyle = "rgb(220,220,220)";
      c.fillText(CHARS[g], l + cw / 2, (y0 + y) * ch + base0 - T);
    }
  };
  c.font = glyphFont(ch);
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  for (let i = 0; i < G.length; i++) cell(i, G[i]);
  const t0 = performance.now(),
    last = new Int8Array(G.length).fill(8);
  requestAnimationFrame(function step(now) {
    const t = (now - t0) / 1000 / HINT_FADE;
    let left = 0;
    for (let i = 0; i < G.length; i++) {
      const lv = Math.max(
        0,
        Math.min(8, Math.round((1 - (t - S[i] * 0.85) / 0.15) * 8))
      );
      if (lv === last[i]) {
        left += lv > 0;
        continue;
      }
      last[i] = lv;
      const x = i % cols,
        y = (i - x) / cols;
      if (!lv) {
        c.clearRect(
          XE[x0 + x] - L,
          YE[y0 + y] - T,
          XE[x0 + x + 1] - XE[x0 + x],
          YE[y0 + y + 1] - YE[y0 + y]
        );
        continue;
      }
      left++;
      cell(i, G[i] ? RAMP_LUT[Math.round(((DENS[G[i]] * lv) / 8) * 255)] : 0);
    }
    if (left) requestAnimationFrame(step);
    else cv.remove();
  });
}
const histReady = () =>
  HIST.list && scrub.stats.end && !scrub.playing && !intro;
function stepBy(n) {
  if (!histReady()) return false;
  const want = Math.min(HIST.list.length, Math.max(0, HIST.want + n));
  if (want === HIST.want) return false;
  HIST.dir = Math.sign(want - HIST.want);
  HIST.want = want;
  dismissHint();
  preload();
  seek();
  return true;
}
const SCROLL_RATE = 30,
  SCROLL_BURST = 1;
let budget = SCROLL_BURST,
  budgetAt = 0;
function scrollBy(px) {
  if (!histReady()) return;
  const now = performance.now();
  budget = Math.min(
    SCROLL_BURST,
    budget + ((now - budgetAt) / 1000) * SCROLL_RATE
  );
  budgetAt = now;
  HIST.acc += px;
  let steps = Math.trunc(HIST.acc / HIST_STEP);
  if (!steps) return;
  HIST.acc -= steps * HIST_STEP;
  if (Math.abs(steps) > budget) {
    steps = Math.sign(steps) * Math.floor(budget);
    HIST.acc = 0;
  }
  if (!steps) return;
  budget -= Math.abs(steps);
  if (!stepBy(-steps)) HIST.acc = 0;
}
const SWEEP_WAIT = 300,
  SWEEP_MS = 50;
for (const [id, dir] of [
  ["info-back", -1],
  ["info-next", 1],
]) {
  const el = document.getElementById(id);
  let timer = null;
  const stop = () => {
    clearTimeout(timer);
    timer = null;
  };
  el.addEventListener("pointerdown", (e) => {
    if (e.button) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    stepBy(dir);
    const sweep = () => {
      timer = stepBy(dir) ? setTimeout(sweep, SWEEP_MS) : null;
    };
    timer = setTimeout(sweep, SWEEP_WAIT);
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
    el.addEventListener(type, stop);
  el.addEventListener("click", (e) => {
    if (!e.detail) stepBy(dir);
  });
}
addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) return;
    scrollBy(
      e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1)
    );
  },
  { passive: true }
);
let touchY = null;
addEventListener(
  "touchstart",
  (e) => {
    touchY = e.touches.length === 1 ? e.touches[0].clientY : null;
  },
  { passive: true }
);
addEventListener(
  "touchmove",
  (e) => {
    if (touchY === null || e.touches.length !== 1) return;
    const y = e.touches[0].clientY;
    scrollBy(touchY - y);
    touchY = y;
  },
  { passive: true }
);
addEventListener(
  "touchend",
  () => {
    touchY = null;
  },
  { passive: true }
);

GLR = /[?&]2d\b/.test(location.search) ? null : glInit();
if (!GLR) ctx = canvas.getContext("2d");
canvas.addEventListener("webglcontextlost", (e) => e.preventDefault());
canvas.addEventListener("webglcontextrestored", () => {
  GLR = glInit();
  pending = true;
  kick();
});
const first = loadFirst();
const streamIn = first.then(loadStream);
first.then(() => loadHistory(streamIn));
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
  document.getElementById("boot").remove();
  pending = true;
  kick();
});
