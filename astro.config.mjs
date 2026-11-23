import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://azzhomelab.tech",
  trailingSlash: "ignore",
  build: { format: "directory" },
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: false,
    },
  },
});
