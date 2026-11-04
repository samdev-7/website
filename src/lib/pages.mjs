import { PAGES } from "./site.mjs";

const MODULES = import.meta.glob("../pages/*.md", { eager: true });
const SOURCES = import.meta.glob("../pages/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

export const contentPages = () =>
  Object.entries(MODULES)
    .map(([file, mod]) => ({
      slug: file.match(/([^/]+)\.md$/)[1],
      ...mod.frontmatter,
      source: SOURCES[file],
    }))
    .filter((p) => p.slug !== "404")
    .sort((a, b) => PAGES.indexOf(a.slug) - PAGES.indexOf(b.slug));

export const body = (p) => p.source.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
