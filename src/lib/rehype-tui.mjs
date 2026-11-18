import { existsSync, readFileSync } from "node:fs";

const text = (n) =>
  n.type === "text" ? n.value : (n.children ?? []).map(text).join("");
const node = (tagName, properties, children = []) => ({
  type: "element",
  tagName,
  properties,
  children,
});
const str = (value) => ({ type: "text", value });
const el = (tagName, className, value) =>
  node(tagName, { className: className.split(" "), ariaHidden: "true" }, [
    str(value),
  ]);

const size = (src) => {
  let b;
  try {
    b = readFileSync(new URL("../../public" + src, import.meta.url));
  } catch {
    return null;
  }
  const head = b.toString("latin1", 0, 16);
  if (head.startsWith("\x89PNG"))
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (head.startsWith("RIFF") && head.slice(8, 12) === "WEBP") {
    const kind = head.slice(12, 16);
    if (kind === "VP8X")
      return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === "VP8L") {
      const v = b.readUInt32LE(21);
      return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)];
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
  return existsSync(new URL("../../public" + p, import.meta.url))
    ? p
    : undefined;
};

const media = (img) => {
  const src = img.properties.src ?? "";
  const video = /\.mp4$/.test(src);
  const [w, h] = (!video && size(src)) || [1920, 1080];
  const style = `--ar: ${h / w}; --w: ${video ? 4096 : w}px`;
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
    : node("img", { ...img.properties, className: ["media"], style });
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

const lone = (n, tag) => {
  const kids = only(n);
  return kids.length === 1 && kids[0].tagName === tag ? kids[0] : null;
};

const mediaAlt = (n) => {
  const m = n?.tagName === "a" ? n.children[0] : n;
  if (!m?.properties?.className?.includes("media")) return null;
  return String(m.properties.alt ?? m.properties.ariaLabel ?? "").toLowerCase();
};

export default function rehypeTui() {
  const walk = (parent) => {
    if (!parent.children) return;
    for (let k = 0; k < parent.children.length; k++) {
      let c = parent.children[k];
      if (c.type !== "element") continue;
      if (c.tagName === "blockquote") c = parent.children[k] = callout(c) ?? c;
      if (c.tagName === "p") {
        const img = lone(c, "img"),
          a = lone(c, "a"),
          inner = a && lone(a, "img");
        const alt = mediaAlt(
          parent.children.slice(0, k).findLast((n) => n.type === "element")
        );
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
      if (c.tagName === "hr")
        parent.children[k] = node("div", { className: ["rule", "dashes", "break"], ariaHidden: "true" });
      if (c.tagName === "a" && !/^[/#]/.test(c.properties.href ?? "/"))
        Object.assign(c.properties, { target: "_blank", rel: "noopener" });
      walk(c);
    }
  };
  return (tree) => walk(tree);
}
