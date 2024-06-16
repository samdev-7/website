import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import svelte from "@astrojs/svelte";
import inspectUrls from "@jsdevtools/rehype-url-inspector";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), svelte()],
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
