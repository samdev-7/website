// @ts-check
import { defineConfig } from "astro/config";
import rehypeTui from "./src/lib/rehype-tui.mjs";

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
});
