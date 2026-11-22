const MODULES = import.meta.glob("../writing/*.md", { eager: true });
const SOURCES = import.meta.glob("../writing/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const WPM = 238;
const MEDIA = /!\[|<Figure\b/g;
const MARKUP = /<[^>]*>|!\[[^\]]*\]\([^)]*\)|\]\([^)]*\)|\{\{[^}]*\}\}/g;

const body = (source) => source.replace(/^---\n[\s\S]*?\n---\n/, "");

const mediaSeconds = (n) =>
  Array.from({ length: n }, (_, k) => Math.max(12 - k, 3)).reduce(
    (a, b) => a + b,
    0
  );

const minutes = (source) => {
  const text = body(source);
  const words = text
    .replace(MARKUP, " ")
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  const media = text.match(MEDIA)?.length ?? 0;
  return Math.max(1, Math.ceil(words / WPM + mediaSeconds(media) / 60));
};

export const posts = () =>
  Object.entries(MODULES)
    .map(([file, mod]) => ({
      slug: file.match(/([^/]+)\.md$/)[1],
      ...mod.frontmatter,
      date: new Date(mod.frontmatter.date),
      tags: mod.frontmatter.tags ?? [],
      Content: mod.Content,
      source: SOURCES[file],
      minutes: minutes(SOURCES[file]),
    }))
    .filter((p) => import.meta.env.DEV || !p.draft)
    .sort((a, b) => b.date - a.date);

const tagged = (p, text) =>
  (p.tags.length ? `[${p.tags.join(", ")}] ` : "") + text;

export const listTitle = (p) => tagged(p, p.title);

export const ogDescription = (p) => tagged(p, p.description ?? p.title);

export const readTime = (p) => `${p.minutes} min read`;

export const dateline = (p) => `${formatDate(p.date)} · ${readTime(p)}`;

export const formatDate = (d) =>
  d
    .toLocaleDateString("en-GB", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ (\w{3})\w* /, " $1, ")
    .toLowerCase();

export const INTRO =
  "welcome to my unorganized collection of thoughts and stuff";
