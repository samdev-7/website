import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import inspectUrls from "@samdev-7/rehype-url-inspector";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    tailwind(),
    react({
      include: ["**/react/*"],
    }),
  ],
  markdown: {
    rehypePlugins: [
      [
        inspectUrls,
        {
          selectors: ["a[href]"],
          inspectEach(url) {
            if (
              url.node.properties.title &&
              url.node.properties.href == "tooltip"
            ) {
              url.node.tagName = "span";
              delete url.node.properties.href;
              url.node.properties.class = "tooltip";
              return;
            }
            if (url.node.properties.href.startsWith("/")) return;
            url.node.properties.target = "_blank";
          },
        },
      ],
    ],
  },
});
