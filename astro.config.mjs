// @ts-check
import { defineConfig } from "astro/config";
import rehypeTui from "./src/lib/rehype-tui.mjs";

export default defineConfig({
  compressHTML: false,
  build: { inlineStylesheets: "always" },
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  markdown: { rehypePlugins: [rehypeTui], smartypants: false },
  devToolbar: { enabled: false },
});
