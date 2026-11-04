import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
  process.env.VITE_DATA_URL ??=
    command === "serve" ? "" : "https://now.samliu.dev";
  return {
    server: {
      proxy: {
        "/ascii": {
          target: process.env.DATA_PROXY || "https://now.samliu.dev",
          changeOrigin: true,
        },
      },
    },
    build: { target: "es2022" },
  };
});
