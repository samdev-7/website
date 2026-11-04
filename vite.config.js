import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/ascii": {
        target: process.env.DATA_PROXY || "https://now.samliu.dev",
        changeOrigin: true,
      },
    },
  },
  build: { target: "es2022" },
});
