import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function chrome() {
  const port = 9600 + Math.floor(Math.random() * 300);
  const proc = spawn(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    [
      "--headless=new",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${mkdtempSync(join(tmpdir(), "site-check-"))}`,
      "--no-first-run",
      "about:blank",
    ],
    { stdio: "ignore" }
  );
  let targets;
  for (let k = 0; k < 50 && !targets; k++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    } catch {
      await sleep(200);
    }
  }
  const ws = new WebSocket(
    targets.find((t) => t.type === "page").webSocketDebuggerUrl
  );
  await new Promise((r) => (ws.onopen = r));
  let id = 0;
  const waits = new Map(),
    listeners = new Set(),
    errors = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.method === "Runtime.exceptionThrown")
      errors.push(
        m.params.exceptionDetails.exception?.description ??
          m.params.exceptionDetails.text
      );
    for (const f of listeners) f(m);
    if (m.id && waits.has(m.id)) {
      waits.get(m.id)(m);
      waits.delete(m.id);
    }
  };
  const send = (method, params = {}) =>
    new Promise((r) => {
      const i = ++id;
      waits.set(i, r);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const ev = async (expression, awaitPromise = false) => {
    const r = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise,
    });
    if (r.result?.exceptionDetails)
      throw new Error(
        r.result.exceptionDetails.exception?.description ?? "evaluate failed"
      );
    return r.result?.result?.value;
  };
  await send("Runtime.enable");
  await send("Page.enable");
  return {
    send,
    ev,
    errors,
    on: (f) => listeners.add(f),
    off: (f) => listeners.delete(f),
    close() {
      proc.kill();
      ws.close();
    },
  };
}
