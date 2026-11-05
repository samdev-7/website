// @ts-check
import { defineConfig } from "astro/config";
import rehypeTui from "./src/lib/rehype-tui.mjs";
import compress from "@playform/compress";

const PROXY = {
  "/ascii": {
    target: process.env.DATA_PROXY || "https://now.samliu.dev",
    changeOrigin: true,
  },
};

export default defineConfig({
  compressHTML: false,
  build: { inlineStylesheets: "always" },
  vite: { server: { proxy: PROXY }, preview: { proxy: PROXY } },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  markdown: { rehypePlugins: [rehypeTui], smartypants: false },
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
