const MODULES = import.meta.glob("../writing/*.md", { eager: true });
const SOURCES = import.meta.glob("../writing/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

export const posts = () =>
  Object.entries(MODULES)
    .map(([file, mod]) => ({
      slug: file.match(/([^/]+)\.md$/)[1],
      ...mod.frontmatter,
      date: new Date(mod.frontmatter.date),
      tags: mod.frontmatter.tags ?? [],
      Content: mod.Content,
      source: SOURCES[file],
    }))
    .filter((p) => !p.draft)
    .sort((a, b) => b.date - a.date);

export const listTitle = (p) =>
  (p.tags.length ? `[${p.tags.join(", ")}] ` : "") + p.title;

export const formatDate = (d) =>
  d
    .toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ (\w+) /, " $1, ")
    .toLowerCase();

export const INTRO =
  "welcome to my unorganized collection of thoughts and stuff";
