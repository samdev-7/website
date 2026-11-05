const text = (n) =>
  n.type === "text" ? n.value : (n.children ?? []).map(text).join("");
const el = (tagName, className, value) => ({
  type: "element",
  tagName,
  properties: { className: className.split(" "), ariaHidden: "true" },
  children: [{ type: "text", value }],
});

export default function rehypeTui() {
  const walk = (node) => {
    if (!node.children) return;
    for (let k = 0; k < node.children.length; k++) {
      const c = node.children[k];
      if (c.type !== "element") continue;
      if (c.tagName === "h2")
        (node.children.splice(
          ++k,
          0,
          { type: "text", value: "\n" },
          el("div", "rule", "-".repeat(text(c).trim().length))
        ),
          k++);
      if (c.tagName === "li") c.children.unshift(el("span", "dash", "- "));
      if (c.tagName === "hr")
        node.children[k] = el("div", "rule break", "-".repeat(72));
      if (c.tagName === "a" && !/^[/#]/.test(c.properties.href ?? "/"))
        Object.assign(c.properties, { target: "_blank", rel: "noopener" });
      walk(c);
    }
  };
  return (tree) => walk(tree);
}
