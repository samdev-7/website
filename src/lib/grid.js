const HERO = __HERO__;
const FC = 160,
  FR = 72,
  CELL = 1470 / FC,
  MIN_COLS = minCols(HERO.navW);
const TEXT_W = 72;
const PAGES = __PAGES__;
const navWidth = (pad) => PAGES.reduce((w, p) => w + p.length + 2 * pad, 3);
const STACK = `'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace`;
let ASC = 0.8,
  DESC = 0.2;
function measureFont() {
  const c = document.createElement("canvas").getContext("2d");
  c.font = `100px ${STACK}`;
  ASC = DESC = 0;
  for (const ch of CHARS) {
    const m = c.measureText(ch);
    ASC = Math.max(ASC, m.actualBoundingBoxAscent / 100);
    DESC = Math.max(DESC, m.actualBoundingBoxDescent / 100);
  }
}
function grid() {
  const dpr = devicePixelRatio || 1,
    W = Math.round(innerWidth * dpr),
    H = Math.round(innerHeight * dpr);
  const c0 = Math.max(H / FR, W / (FC * ASPECT), (CELL * dpr) / ASPECT);
  let rows = Math.min(FR, Math.max(1, Math.round(H / c0))),
    ch = H / rows;
  let cols = Math.min(FC, Math.max(1, Math.round(W / (ch * ASPECT)))),
    cw = W / cols;
  let small = cols < MIN_COLS && W / MIN_COLS / dpr < MIN_TEXT_CELL;
  if (cols < MIN_COLS && !small) {
    cols = MIN_COLS;
    cw = W / cols;
    rows = Math.min(FR, Math.max(1, Math.round(H / (cw / ASPECT))));
    ch = H / rows;
  }
  small ||= !heroBoxes(cols, rows, HERO.navW, HERO.contactW, HERO.info);
  document.documentElement.classList.toggle("too-small", small);
  const fs = Math.min(ch, ch / (ASC + DESC)),
    base = (ch - fs * (ASC + DESC)) / 2 + fs * ASC;
  const m = document.createElement("canvas").getContext("2d");
  m.font = `${fs}px ${STACK}`;
  const adv = m.measureText("M").width,
    mt = m.measureText("Mg");
  const cssBase =
    (ch - (mt.fontBoundingBoxAscent + mt.fontBoundingBoxDescent)) / 2 +
    mt.fontBoundingBoxAscent;
  const set = (k, v) =>
    document.documentElement.style.setProperty(k, v / dpr + "px");
  set("--cell", cw);
  set("--row", ch);
  set("--font", fs);
  set("--spacing", cw - adv);
  set("--dx", (cw - adv) / 2);
  set("--dy", base - cssBase);
  let side =
    cols >= 60
      ? 6
      : Math.max(
          EDGE_SIDE,
          Math.min(4, Math.floor((cols - (MIN_COLS - 2 * EDGE_SIDE)) / 2))
        );
  const w = Math.min(TEXT_W, cols - 2 * side);
  if (cols - side - w < 2 * side) side = Math.floor((cols - w) / 2);
  document.documentElement.style.setProperty(
    "--side",
    `calc(${side} * var(--cell))`
  );
  const snug =
    navWidth(2) +
      (document.documentElement.classList.contains("nav-end") ? 1 : 0) >
    cols - 2 * side;
  document.documentElement.style.setProperty("--pad", snug ? 1 : 2);
  document.documentElement.style.setProperty(
    "--top",
    `calc(${snug ? 2 : 3} * var(--row))`
  );
  document.documentElement.classList.toggle("snug", snug);
  window.GRID = {
    side,
    cols,
    rows,
    cw: cw / dpr,
    ch: ch / dpr,
    dpr,
    dcw: cw,
    dch: ch,
    W,
    H,
    fs,
    base,
  };
}
grid();
const WAIT_MS = 1500;
const READY = Promise.race([
  document.fonts.load(`16px ${STACK}`),
  new Promise((r) => setTimeout(r, WAIT_MS)),
]).then(() => {
  if (document.fonts.check(`16px ${STACK}`)) measureFont();
  grid();
  document.documentElement.classList.remove("wait");
});
document.fonts.ready.then(() => {
  measureFont();
  grid();
});
addEventListener("resize", grid);
