// sl: Copyright 1993,1998,2014 Toyoda Masashi (mtoyoda@acm.org)
// Everyone is permitted to do anything on this program including copying,
// modifying, and improving, unless you try to pretend that you wrote it.
const SL = (() => {
  const body = [
    "      ====        ________                ___________ ",
    "  _D _|  |_______/        \\__I_I_____===__|_________| ",
    "   |(_)---  |   H\\________/ |   |        =|___ ___|   ",
    "   /     |  |   H  |  |     |   |         ||_| |_||   ",
    "  |      |  |   H  |__--------------------| [___] |   ",
    "  | ________|___H__/__|_____/[][]~\\_______|       |   ",
    "  |/ |   |-----------I_____I [][] []  D   |=======|__ ",
  ];
  const wheels = [
    [
      "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
      " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
      "  \\_/      \\O=====O=====O=====O_/      \\_/            ",
    ],
    [
      "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
      " |/-=|___|=O=====O=====O=====O   |_____/~\\___/        ",
      "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            ",
    ],
    [
      "__/ =| o |=-O=====O=====O=====O \\ ____Y___________|__ ",
      " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
      "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            ",
    ],
    [
      "__/ =| o |=-~O=====O=====O=====O\\ ____Y___________|__ ",
      " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
      "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            ",
    ],
    [
      "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
      " |/-=|___|=   O=====O=====O=====O|_____/~\\___/        ",
      "  \\_/      \\__/  \\__/  \\__/  \\__/      \\_/            ",
    ],
    [
      "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
      " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
      "  \\_/      \\_O=====O=====O=====O/      \\_/            ",
    ],
  ];
  const coal = [
    "                              ",
    "                              ",
    "    _________________         ",
    "   _|                \\_____A  ",
    " =|                        |  ",
    " -|                        |  ",
    "__|________________________|_ ",
    "|__________________________|_ ",
    "   |_D__D__D_|  |_D__D__D_|   ",
    "    \\_/   \\_/    \\_/   \\_/    ",
    "                              ",
  ];
  const smoke = [
    [
      "(   )",
      "(    )",
      "(    )",
      "(   )",
      "(  )",
      "(  )",
      "( )",
      "( )",
      "()",
      "()",
      "O",
      "O",
      "O",
      "O",
      "O",
    ],
    [
      "(@@@)",
      "(@@@@)",
      "(@@@@)",
      "(@@@)",
      "(@@)",
      "(@@)",
      "(@)",
      "(@)",
      "@@",
      "@@",
      "@",
      "@",
      "@",
      "@",
      "@",
    ],
  ];
  const dy = [2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const dx = [-2, -1, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3];
  return {
    body,
    wheels,
    coal,
    smoke,
    dy,
    dx,
    length: 83,
    funnel: 7,
    coalAt: 53,
    blank: " ".repeat(54),
    speed: 25,
  };
})();

let TRAIN = null,
  TRAIN_RUNS = 0;

const TRAIN_MIN_COLS = 120,
  SWEEP_TIME = 1.4,
  SWEEP_EASE = 2.2,
  SWEEP_MESS = 14,
  SWEEP_ROW = 6,
  SWEEP_V = 0.35,
  TRAIN_PAD = 6;

function train() {
  if (TRAIN || REDUCED || intro || !scrub.stats.end || !XE) return;
  if (COLS < TRAIN_MIN_COLS) return;
  const cars = ++TRAIN_RUNS < 3 ? TRAIN_RUNS : Infinity,
    length = SL.coalAt + (SL.coal[0].length - 1) * cars + 1,
    cols = COLS,
    rows = ROWS,
    top = Math.floor(rows / 2) - 5,
    mid = rows / 2,
    reach = cols + SWEEP_V * mid + SWEEP_ROW + SWEEP_MESS,
    swept = (t) =>
      reach * Math.min(1, Math.max(0, t / SWEEP_TIME)) ** SWEEP_EASE,
    ragged = Array.from({ length: rows }, () => Math.random() * SWEEP_ROW),
    lead = Float32Array.from(
      { length: cols * rows },
      (_, i) =>
        SWEEP_V * Math.abs(Math.floor(i / cols) + 0.5 - mid) +
        ragged[Math.floor(i / cols)] +
        Math.random() * SWEEP_MESS
    ),
    used = lead.slice(
      Math.max(0, top - 6) * cols,
      Math.min(rows, top + 11) * cols
    ),
    room = 1 + TRAIN_PAD + Math.max(...used),
    start = SWEEP_TIME * (room / reach) ** (1 / SWEEP_EASE),
    gone = start + (cols + length) / SL.speed,
    tail = (t) => cols - 1 - (t - start) * SL.speed + length,
    clear = (b) => {
      for (let t = b; t < gone; t += 1 / 240)
        if (cols - swept(t - b) <= tail(t) + TRAIN_PAD) return false;
      return true;
    };
  let lo = start,
    hi = gone;
  while (hi < Infinity && hi - lo > 0.005) {
    const m = (lo + hi) / 2;
    if (clear(m)) hi = m;
    else lo = m;
  }
  const back = hi,
    end = back + SWEEP_TIME,
    cv = document.createElement("canvas");
  cv.width = canvas.width;
  cv.height = canvas.height;
  cv.style.cssText = `left: 0; top: 0; width: ${canvas.width / SCALE}px; height: ${canvas.height / SCALE}px; pointer-events: none; z-index: 5;`;
  canvas.after(cv);
  const c = cv.getContext("2d"),
    base = glyphBase(ch),
    t0 = performance.now(),
    puffs = [],
    level = new Uint8Array(cols * rows);
  c.font = glyphFont(ch);
  c.textAlign = "center";
  c.textBaseline = "alphabetic";
  let shown = new Map(),
    x = cols - 1,
    sum = 0,
    running = false;
  const put = (cells, gx, gy, s) => {
    if (gy < 0 || gy >= rows) return;
    for (let k = 0; k < s.length; k++) {
      const cx = gx + k,
        i = gy * cols + cx;
      if (cx >= 0 && cx < cols) cells.set(i, s[k]);
    }
  };
  const rect = (i) => {
    const cx = i % cols,
      cy = (i - cx) / cols;
    return [XE[cx], YE[cy], XE[cx + 1] - XE[cx], YE[cy + 1] - YE[cy]];
  };
  const dark = (cx, front, i) => cx > front + lead[i];
  let next = new Map(),
    drawnAt = null;
  const paint = (i, on, g) => {
    const [l, tp, w, h] = rect(i);
    c.clearRect(l, tp, w, h);
    if (on) c.fillRect(l, tp, w, h);
    if (g && g !== " ") {
      c.fillStyle = "rgb(220,220,220)";
      c.fillText(g, l + cw / 2, ((i - (i % cols)) / cols) * ch + base);
      c.fillStyle = "#000";
    }
  };
  const draw = (t) => {
    const sweeping = t < SWEEP_TIME + 0.1 || t >= back;
    if (!sweeping && drawnAt === x) return;
    drawnAt = x;
    next.clear();
    if (running) {
      [
        ...SL.body,
        ...SL.wheels[(((SL.length + x) % 6) + 6) % 6],
        SL.blank,
      ].forEach((s, r) => put(next, x, top + r, s));
      const w = SL.coal[0].length - 1,
        first = Math.max(0, Math.floor((-x - SL.coalAt) / w)),
        last = Math.min(cars, Math.ceil((cols - x - SL.coalAt) / w));
      for (let k = first; k < last; k++)
        SL.coal.forEach((s, r) => put(next, x + SL.coalAt + k * w, top + r, s));
      for (const p of puffs) put(next, p.x, p.y, SL.smoke[p.kind][p.stage]);
    }
    c.fillStyle = "#000";
    if (sweeping) {
      const fin = cols - swept(t),
        fout = cols - swept(t - back);
      for (let i = 0; i < cols * rows; i++) {
        const on = +(
            dark(i % cols, fin, i) && !(t >= back && dark(i % cols, fout, i))
          ),
          g = next.get(i);
        if (on === level[i] && g === shown.get(i)) continue;
        level[i] = on;
        paint(i, on, g);
      }
    } else {
      for (const i of shown.keys())
        if (!next.has(i)) paint(i, level[i], undefined);
      for (const [i, g] of next) if (g !== shown.get(i)) paint(i, level[i], g);
    }
    [shown, next] = [next, shown];
  };
  const smoke = () => {
    if (x % 4) return;
    for (const p of puffs) {
      p.y -= SL.dy[p.stage];
      p.x += SL.dx[p.stage];
      p.stage++;
    }
    while (puffs.length && puffs[0].stage >= SL.dy.length) puffs.shift();
    puffs.push({ x: x + SL.funnel, y: top - 1, stage: 0, kind: sum++ % 2 });
  };
  const stop = () => {
    cancelAnimationFrame(TRAIN.raf);
    removeEventListener("resize", stop);
    cv.remove();
    TRAIN = null;
  };
  TRAIN = { raf: 0, stop };
  addEventListener("resize", stop);
  const tick = (now) => {
    const t = (now - t0) / 1000;
    if (t >= end) return stop();
    if (t >= start && t < gone) {
      const to = cols - 1 - Math.floor((t - start) * SL.speed);
      if (!running) {
        running = true;
        smoke();
      }
      if (x - to > cols) {
        x = to;
        puffs.length = 0;
      }
      while (x > to) {
        x--;
        smoke();
      }
    } else if (t >= gone) running = false;
    draw(t);
    TRAIN.raf = requestAnimationFrame(tick);
  };
  TRAIN.raf = requestAnimationFrame(tick);
}

const trainAt = (e) => {
  const [cx, cy] = toCell(e);
  return (
    !REDUCED &&
    COLS >= TRAIN_MIN_COLS &&
    RUNS[Math.floor(cy) * COLS + Math.floor(cx)]
  );
};
canvas.addEventListener("pointermove", (e) => {
  canvas.style.cursor = trainAt(e) ? "pointer" : "";
});
canvas.addEventListener("click", (e) => {
  if (trainAt(e)) train();
});
bigName.addEventListener("pointerenter", () => {
  bigName.style.cursor = !REDUCED && COLS >= TRAIN_MIN_COLS ? "pointer" : "";
});
bigName.addEventListener("click", train);
