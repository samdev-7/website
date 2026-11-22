import { images, scroller } from "../shared.mjs";

export default (head, ctx) =>
  images(head, ctx.base).map(({ src }) => {
    const [w] = ctx.size(src) ?? [];
    const svg = ctx
      .read(src)
      .replace(/<!--[\s\S]*?-->|<metadata><\/metadata>/g, "")
      .replace(
        /<svg([^>]*?)\swidth="[^"]*"\sheight="[^"]*"/,
        `<svg$1 role="img" aria-label="${head.alt.replace(/"/g, "&quot;")}" style="max-width: ${w}px; min-width: ${Math.round(Math.min(w * 0.7, 560))}px"`
      );
    return scroller({ type: "raw", value: svg });
  });
