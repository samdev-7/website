// @ts-check
import { defineConfig } from "astro/config";
import rehypeTui from "./src/lib/rehype-tui.mjs";
import compress from "@playform/compress";

const DATA = {
  target: process.env.DATA_PROXY || "https://now.samliu.dev",
  changeOrigin: true,
};
const PROXY = { "/ascii": DATA, "/cam.json": DATA };

const NOTION = {
  name: "notion-dark",
  type: "dark",
  colors: { "editor.background": "#202020", "editor.foreground": "#f0efed" },
  tokenColors: [
    {
      scope: ["keyword", "storage", "storage.type", "storage.modifier"],
      settings: { foreground: "#66a2cc" },
    },
    {
      scope: [
        "entity.name.function",
        "support.function",
        "entity.name.type",
        "entity.name.class",
        "support.class",
        "storage.type.java",
      ],
      settings: { foreground: "#ecec93" },
    },
    { scope: ["keyword.operator"], settings: { foreground: "#f5b83d" } },
    { scope: ["constant.numeric"], settings: { foreground: "#d1949e" } },
    { scope: ["string"], settings: { foreground: "#bde052" } },
    { scope: ["comment"], settings: { foreground: "#998066" } },
  ],
};

export default defineConfig({
  compressHTML: false,
  build: { inlineStylesheets: "always" },
  vite: { server: { proxy: PROXY }, preview: { proxy: PROXY } },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  markdown: {
    rehypePlugins: [rehypeTui],
    smartypants: false,
    shikiConfig: {
      themes: { dark: NOTION },
      defaultColor: false,
    },
  },
  devToolbar: { enabled: false },
  integrations: [
    compress({
      HTML: {
        "html-minifier-terser": {
          collapseWhitespace: false,
          removeAttributeQuotes: false,
        },
      },
      CSS: false,
      Image: false,
      SVG: false,
      JSON: false,
    }),
  ],
});
