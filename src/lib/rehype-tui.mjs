import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename } from "node:path";
import { attributes, dimensions, figure, table, node, str, text } from "../figures/shared.mjs";

const FIGURES = new URL("../figures/", import.meta.url);
const TYPES = Object.fromEntries(
  await Promise.all(
    readdirSync(FIGURES, { recursive: true })
      .filter((f) => f.endsWith(".mjs") && f.includes("/"))
      .map(async (f) => [
        f.replace(/\.mjs$/, "").replace(/^common\//, ""),
        (await import(new URL(f, FIGURES))).default,
      ])
  )
);

const el = (tagName, className, value) =>
  node(tagName, { className: className.split(" "), ariaHidden: "true" }, [
    str(value),
  ]);

const pub = (src) => new URL("../../public" + src, import.meta.url);
const read = (src) => {
  if (!existsSync(pub(src))) throw new Error(`figure file not found: public${src}`);
  return readFileSync(pub(src), "utf8");
};

const size = (src) => {
  let b;
  try {
    b = readFileSync(pub(src));
  } catch {
    return null;
  }
  const head = b.toString("latin1", 0, 16);
  if (head.startsWith("\x89PNG"))
    return [b.readUInt32BE(16), b.readUInt32BE(20), [4, 6].includes(b[25]) || b.includes("tRNS")];
  if (head.startsWith("RIFF") && head.slice(8, 12) === "WEBP") {
    const kind = head.slice(12, 16);
    if (kind === "VP8X")
      return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3), (b[20] & 0x10) > 0];
    if (kind === "VP8L") {
      const v = b.readUInt32LE(21);
      return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff), ((v >> 28) & 1) > 0];
    }
    return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  if (b[0] === 0xff && b[1] === 0xd8)
    for (let i = 2; i + 9 < b.length; i += 2 + b.readUInt16BE(i + 2)) {
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m))
        return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    }
  const box = b
    .toString("utf8", 0, 4000)
    .match(/viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  return box ? [+box[1], +box[2]] : null;
};

const poster = (src) => {
  const p = src.replace(/\.mp4$/, "-poster.webp");
  return existsSync(pub(p))
    ? p
    : undefined;
};

const media = (img) => {
  const src = img.properties.src ?? "";
  const video = /\.mp4$/.test(src);
  const [, alt, hint] = String(img.properties.alt ?? "").match(/^(.*?)(?:\|(\d+)(?:x\d+)?)?$/);
  img.properties.alt = alt.trim();
  const known = !video && size(src);
  const [w, h] = known || [1920, 1080];
  const style = `--ar: ${h / w}; --w: ${video ? 4096 : w}px${hint ? `; --max: ${hint}px` : ""}`;
  return video
    ? node("video", {
        className: ["media"],
        src,
        controls: true,
        playsInline: true,
        preload: "metadata",
        poster: poster(src),
        ariaLabel: img.properties.alt,
        style,
      })
    : node("img", { ...img.properties, className: ["media"], style, loading: "lazy", decoding: "async", ...dimensions(known) });
};

const only = (n) =>
  n.children.filter((c) => !(c.type === "text" && !c.value.trim()));

const edge = (label) =>
  node("div", { className: ["box-edge"], ariaHidden: "true" }, [
    str(label ? "+--" : "+"),
    ...(label
      ? [node("span", { className: ["box-label"] }, [str(label)])]
      : []),
    node("span", { className: ["box-fill"] }),
    str("+"),
  ]);

const callout = (q) => {
  const kids = q.children.filter((c) => c.type === "element");
  const first = kids[0]?.children?.[0];
  const m = first?.type === "text" && first.value.match(/^\[!(\w+)\]\s*/);
  if (!m) return null;
  first.value = first.value.slice(m[0].length);
  if (!text(kids[0]).trim()) kids.shift();
  return node("div", { className: ["box"], role: "note", ariaLabel: m[1] }, [
    edge(m[1]),
    node("div", { className: ["box-body"] }, kids),
    edge(),
  ]);
};

const icon = (d) =>
  node(
    "svg",
    {
      viewBox: "0 0 16 16",
      width: 16,
      height: 16,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      ariaHidden: "true",
    },
    [node("path", { d })]
  );
const copyButton = () =>
  node("button", { className: ["copy"], type: "button", ariaLabel: "copy code" }, [
    icon("M5.5 5.5h8v8h-8z M10.5 5.5v-3h-8v8h3"),
    icon("M3 8.5l3.5 3.5 6.5-7"),
  ]);

const lone = (n, tag) => {
  const kids = only(n);
  return kids.length === 1 && kids[0].tagName === tag ? kids[0] : null;
};

const mediaAlt = (n) => {
  const m = n?.tagName === "a" ? n.children[0] : n;
  if (!m?.properties?.className?.includes("media")) return null;
  return String(m.properties.alt ?? m.properties.ariaLabel ?? "").toLowerCase();
};

const safe = (value, base) => {
  try {
    return tag(value, base);
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    return node("p", { className: ["figure-error"], role: "alert" }, [str(error.message)]);
  }
};

const tag = (value, base) => {
  const head = attributes(value);
  if (!TYPES[head.type]) throw new Error(`unknown figure type "${head.type}": ${value.split("\n")[0]}`);
  if (!head.alt) throw new Error(`figure "${head.type}" needs alt: ${value.split("\n")[0]}`);
  return figure(head, TYPES[head.type], { size, poster, read, base });
};

const LIVE = /\{\{live:([\w-]+)\}\}/;
const live = (n) => {
  if (!n.children?.some((c) => c.type === "text" && LIVE.test(c.value))) return;
  n.children = n.children.flatMap((c) =>
    c.type === "text"
      ? c.value.split(LIVE).map((part, i) =>
          i % 2 ? node("time", { dataLive: part }, [str("loading...")]) : str(part)
        )
      : [c]
  );
};

const each = (n, f) => {
  f(n);
  n.children?.forEach((c) => each(c, f));
};

export default function rehypeTui() {
  let base;
  const walk = (parent) => {
    if (!parent.children) return;
    for (let k = 0; k < parent.children.length; k++) {
      let c = parent.children[k];
      if (c.type === "raw" && c.value.startsWith("<Figure"))
        c = parent.children[k] = safe(c.value, base);
      if (c.type !== "element") continue;
      if (c.tagName === "blockquote") c = parent.children[k] = callout(c) ?? c;
      const prev = parent.children.slice(0, k).findLast((n) => n.type === "element");
      if (c.tagName === "table" && !c.properties.className)
        c = parent.children[k] = table(c);
      if (c.tagName === "p") {
        const img = lone(c, "img"),
          a = lone(c, "a"),
          inner = a && lone(a, "img");
        const alt = mediaAlt(prev);
        if (alt && !img && !inner && text(c).trim().toLowerCase() === alt)
          c.properties.className = ["caption"];
        if (img) c = parent.children[k] = media(img);
        else if (inner) {
          a.children = [media(inner)];
          a.properties.className = ["media-link"];
          c = parent.children[k] = a;
        }
      }
      if (c.tagName === "h2")
        (parent.children.splice(
          ++k,
          0,
          str("\n"),
          el("div", "rule", "-".repeat(text(c).trim().length))
        ),
          k++);
      if (c.tagName === "li") c.children.unshift(el("span", "dash", "- "));
      if (c.tagName === "pre" && !parent.properties?.className?.includes("code"))
        c = parent.children[k] = node("div", { className: ["code"] }, [c, copyButton()]);
      if (c.tagName === "hr")
        parent.children[k] = node("div", { className: ["rule", "dashes", "break"], ariaHidden: "true" });
      if (c.tagName === "a" && !/^[/#]/.test(c.properties.href ?? "/"))
        Object.assign(c.properties, { target: "_blank", rel: "noopener" });
      walk(c);
    }
  };
  return (tree, file) => {
    base = `/writing/${basename(file.path ?? "", ".md")}/`;
    walk(tree);
    each(tree, live);
  };
}
