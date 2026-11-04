const SCREEN_KEY = "ascii-screen";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const RED = [0xff, 0x55, 0x55];
const INTRO_SPEED = 2,
  INTRO_DUR = 0.5;
const NONLETTER = [...CHARS]
  .map((c, i) => i)
  .filter((i) => !/[A-Za-z]/.test(CHARS[i]));
const RAMP = new Uint8Array(256).map((_, l) => {
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
const b64 = (a) => {
  let s = "";
  for (let k = 0; k < a.length; k += 0x8000)
    s += String.fromCharCode(...a.subarray(k, k + 0x8000));
  return btoa(s);
};

function captureScreen() {
  const { cols, rows, cw, ch } = GRID,
    n = cols * rows,
    d = new Uint8Array(6 * n);
  const cell = (r) => [
    Math.floor((r.left + r.right) / 2 / cw),
    Math.floor((r.top + r.bottom) / 2 / ch),
  ];
  const fill = (r, red) => {
    for (
      let y = Math.max(0, Math.round(r.top / ch));
      y < Math.min(rows, Math.round(r.bottom / ch));
      y++
    )
      for (
        let x = Math.max(0, Math.round(r.left / cw));
        x < Math.min(cols, Math.round(r.right / cw));
        x++
      ) {
        d[4 * n + y * cols + x] = red ? 255 : 0;
        d[5 * n + y * cols + x] = red;
      }
  };
  const nav = document.querySelector("nav");
  fill(nav.getBoundingClientRect(), 1);
  for (const a of nav.querySelectorAll("[aria-current]"))
    fill(a.getBoundingClientRect(), 0);
  const colours = new Map(),
    range = document.createRange();
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (t) =>
      t.parentElement.closest("script, style")
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  for (let t; (t = walk.nextNode());) {
    const el = t.parentElement;
    if (!colours.has(el))
      colours.set(
        el,
        getComputedStyle(el).color.match(/\d+/g).slice(0, 3).map(Number)
      );
    const rgb = colours.get(el),
      text = t.data;
    for (let k = 0; k < text.length; k++) {
      const g = CHARS.indexOf(text[k]);
      if (g <= 0) continue;
      range.setStart(t, k);
      range.setEnd(t, k + 1);
      const r = range.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || !r.width) continue;
      const [x, y] = cell(r);
      if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
      const i = y * cols + x;
      d[i] = g;
      d.set(rgb, n + i * 3);
    }
  }
  return d;
}

document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href="/"]');
  if (!a || REDUCED || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
  scrollTo({
    top: Math.round(scrollY / GRID.ch) * GRID.ch,
    behavior: "instant",
  });
  const g = {
    cw: GRID.dcw,
    ch: GRID.dch,
    fs: GRID.fs,
    base: GRID.base,
    W: GRID.W,
    H: GRID.H,
    dpr: GRID.dpr,
    iw: innerWidth,
    ih: innerHeight,
    r: devicePixelRatio || 1,
  };
  try {
    sessionStorage.setItem(
      SCREEN_KEY,
      JSON.stringify({
        from: "page",
        t: Date.now(),
        cols: GRID.cols,
        rows: GRID.rows,
        g,
        d: b64(captureScreen()),
      })
    );
  } catch (e) {}
});

let streamFetched = false;
const fetchStream = (e) => {
  if (streamFetched || !e.target.closest?.('a[href="/"]')) return;
  streamFetched = true;
  const l = document.createElement("link");
  l.rel = "prefetch";
  l.href = "/scrub.bin";
  l.as = "fetch";
  l.crossOrigin = "anonymous";
  document.head.append(l);
};
for (const type of ["pointerover", "touchstart", "focusin"])
  document.addEventListener(type, fetchStream, { passive: true });

(() => {
  try {
    sessionStorage.removeItem(SCREEN_KEY);
  } catch (e) {}
  const H0 = window.HANDOVER;
  if (!H0) return;
  if (REDUCED || H0.s.cols !== GRID.cols || H0.s.rows !== GRID.rows) {
    H0.done();
    return;
  }
  const { cols, rows, dcw: cw, dch: ch } = GRID,
    n = cols * rows,
    mine = captureScreen(),
    { ctx: c, XE, YE } = H0;
  const draw = (x, y, g, rgb, k, tile) => {
    const dx = XE[x],
      dy = YE[y],
      dw = XE[x + 1] - dx,
      dh = YE[y + 1] - dy;
    c.fillStyle = k
      ? `rgb(${tile[0] * k},${tile[1] * k},${tile[2] * k})`
      : "#000";
    c.fillRect(dx, dy, dw, dh);
    if (g) {
      c.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      c.fillText(CHARS[g], x * cw + cw / 2, y * ch + GRID.base);
    }
  };
  const font = () => {
    c.font = `${GRID.fs}px ${STACK}`;
  };
  const S = new Float32Array(n),
    state = new Int8Array(n).fill(-1),
    cx = cols / 2,
    cy = rows / 2,
    dmax = Math.hypot(cx * ASPECT, cy);
  for (let y = 0, i = 0; y < rows; y++)
    for (let x = 0; x < cols; x++, i++)
      S[i] =
        Math.hypot((x - cx) * ASPECT, y - cy) / dmax + Math.random() * 0.08;
  READY.then(() => {
    const t0 = performance.now();
    requestAnimationFrame(function step(now) {
      const t = ((now - t0) / 1000) * INTRO_SPEED;
      let left = 0;
      font();
      for (let y = 0, i = 0; y < rows; y++)
        for (let x = 0; x < cols; x++, i++) {
          if (state[i] === 9) continue;
          left++;
          const p = (t - S[i]) / INTRO_DUR;
          if (p < 0) continue;
          if (p >= 1) {
            c.clearRect(XE[x], YE[y], XE[x + 1] - XE[x], YE[y + 1] - YE[y]);
            state[i] = 9;
            continue;
          }
          const lv = Math.round(p * 8);
          if (state[i] === lv) continue;
          state[i] = lv;
          const g = mine[i]
              ? RAMP[Math.round(((DENS[mine[i]] * lv) / 8) * 255)]
              : 0,
            rgb = mine.subarray(n + i * 3, n + i * 3 + 3);
          draw(x, y, g, rgb, mine[5 * n + i] ? lv / 8 : 0, RED);
        }
      if (left) requestAnimationFrame(step);
      else H0.done();
    });
  });
})();
