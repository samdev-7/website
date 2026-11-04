(() => {
  const from = document.currentScript.dataset.from;
  let s = null;
  try {
    s = JSON.parse(sessionStorage.getItem("ascii-screen") || "null");
  } catch (e) {
    return;
  }
  if (
    !s ||
    !s.g ||
    (from === "hero") !== (s.from === "hero") ||
    Date.now() - s.t > 5000
  )
    return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const g = s.g;
  if (
    g.iw !== innerWidth ||
    g.ih !== innerHeight ||
    g.r !== (devicePixelRatio || 1)
  )
    return;
  const CHARS = Array.from({ length: 95 }, (_, i) =>
    String.fromCharCode(32 + i)
  ).join("");
  const d = Uint8Array.from(atob(s.d), (c) => c.charCodeAt(0)),
    n = s.cols * s.rows;
  const XE = Int32Array.from({ length: s.cols + 1 }, (_, x) =>
      Math.round(x * g.cw)
    ),
    YE = Int32Array.from({ length: s.rows + 1 }, (_, y) =>
      Math.round(y * g.ch)
    );
  const cv = document.createElement("canvas");
  cv.className = "handover";
  cv.width = g.W;
  cv.height = g.H;
  cv.style.cssText = `position: fixed; left: 0; top: 0; width: ${g.W / g.dpr}px; height: ${g.H / g.dpr}px; pointer-events: none; z-index: 10;`;
  const c = cv.getContext("2d");
  c.fillStyle = "#000";
  c.fillRect(0, 0, g.W, g.H);
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  c.font = `${g.fs}px 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace`;
  for (let y = 0, i = 0; y < s.rows; y++)
    for (let x = 0; x < s.cols; x++, i++) {
      const k = d[4 * n + i] / 255,
        tile = d[5 * n + i]
          ? [0xff, 0x55, 0x55]
          : d.subarray(n + i * 3, n + i * 3 + 3);
      if (k) {
        c.fillStyle = `rgb(${tile[0] * k},${tile[1] * k},${tile[2] * k})`;
        c.fillRect(XE[x], YE[y], XE[x + 1] - XE[x], YE[y + 1] - YE[y]);
      }
      if (!d[i]) continue;
      c.fillStyle = `rgb(${d[n + i * 3]},${d[n + i * 3 + 1]},${d[n + i * 3 + 2]})`;
      c.fillText(CHARS[d[i]], x * g.cw + g.cw / 2, y * g.ch + g.base);
    }
  document.body.append(cv);
  const timer = setTimeout(() => cv.remove(), 3000);
  window.HANDOVER = {
    s,
    canvas: cv,
    ctx: c,
    XE,
    YE,
    hold() {
      clearTimeout(timer);
    },
    done() {
      clearTimeout(timer);
      cv.remove();
    },
  };
})();
