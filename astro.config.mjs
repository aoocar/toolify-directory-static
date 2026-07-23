import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.limingdao.com",
  output: "static",
  trailingSlash: "never",
  integrations: [
    sitemap({
      // draft accounts are already filtered out of the build, so they never
      // appear as routes and are excluded from the sitemap automatically.
      changefreq: "weekly",
      priority: 0.7,
      // keep the external-link interstitial (/exit) out of the sitemap
      filter: (page) => !page.includes("/exit")
    })
  ]
});
