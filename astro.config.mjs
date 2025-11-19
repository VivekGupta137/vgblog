// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightSiteGraph from "starlight-site-graph";
import starlightLinksValidator from "starlight-links-validator";
import starlightThemeRapide from "starlight-theme-rapide";
import plantuml from "astro-plantuml";
import starlightImageZoom from "starlight-image-zoom";
import starlightPageActions from "starlight-page-actions";

import d2 from "astro-d2";
import { pluginLanguageBadge } from "expressive-code-language-badge";
import starlightGiscus from "starlight-giscus";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      components: {
        Pagination: './src/components/Pagination.astro',
      },
      plugins: [
        starlightSiteGraph(),
        starlightLinksValidator(),
        starlightThemeRapide(),
        starlightImageZoom(),
        // starlightPageActions(),
        starlightGiscus({
          repo: import.meta.env.PUBLIC_GISCUS_REPO,
          repoId: import.meta.env.PUBLIC_GISCUS_REPO_ID,
          category: import.meta.env.PUBLIC_GISCUS_CATEGORY,
          categoryId: import.meta.env.PUBLIC_GISCUS_CATEGORY_ID,
          mapping: "pathname",
          reactions: true,
          inputPosition: "top",
          lazy: false,
          theme: "preferred_color_scheme"
        }),
      ],
      expressiveCode: {
        plugins: [pluginLanguageBadge()],
      },
      title: "VG",
      favicon: "/favicon.ico",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/withastro/starlight",
        },
      ],
      sidebar: [
        {
          label: "Learnings",
          items: [
            {
              label: "Usage example",
              autogenerate: {
                directory: "guides",
              },
            },
            {
              label: "High Level Design",
              autogenerate: {
                directory: "high-level-design",
              },
            },
          ],
        },
        {
          label: "Connect",
          autogenerate: {
            directory: "connect",
          },
        },
        {
          label: "Resources",
          items: [
            // An external link to the NASA website opening in a new tab.
            {
              label: "NASA",
              link: "https://www.nasa.gov/",
              attrs: { target: "_blank", style: "font-style: italic" },
            },
          ],
        },
      ],
    }),
    plantuml({
      serverUrl: import.meta.env.PUBLIC_PLANTUML_SERVER_URL || "http://localhost:8080/png/",
      addWrapperClasses: true,
    }),
    d2(),
  ],
  experimental: {
    contentIntellisense: true,
  },
});
