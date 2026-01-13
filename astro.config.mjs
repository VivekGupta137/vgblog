// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightSiteGraph from "starlight-site-graph";
import starlightLinksValidator from "starlight-links-validator";
import starlightThemeRapide from "starlight-theme-rapide";
import plantuml from "astro-plantuml";
import starlightImageZoom from "starlight-image-zoom";
import starlightPageActions from "starlight-page-actions";
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import starlightSidebarSwipe from 'starlight-sidebar-swipe'


import d2 from "astro-d2";
import { pluginLanguageBadge } from "expressive-code-language-badge";
import starlightGiscus from "starlight-giscus";

import node from "@astrojs/node";
import starlightMarkdownBlocks, { Aside } from "starlight-markdown-blocks";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import starlightFullViewMode from "starlight-fullview-mode";
import rehypeGitHubBadgeLinks from "./src/lib/rehype-github-badge-links";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_DOMAIN || "http://localhost:4321/",
  
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeGitHubBadgeLinks],
  },
  output: "static",

  integrations: [
    starlight({
      customCss: [
        './src/global.css',
        './src/styles/custom.css',
      ],
      components: {
        Pagination: './src/components/Pagination.astro',
        Header: './src/components/Header.astro',
        ContentPanel: './src/components/ContentPanel.astro',
        LastUpdated: './src/components/LastUpdated.astro',
      },
      plugins: [
        starlightSiteGraph(),
        starlightLinksValidator(),
        starlightThemeRapide(),
        starlightImageZoom(),
        starlightGiscus({
          repo: env.PUBLIC_GISCUS_REPO || "",
          repoId: env.PUBLIC_GISCUS_REPO_ID || "",
          category: env.PUBLIC_GISCUS_CATEGORY || "",
          categoryId: env.PUBLIC_GISCUS_CATEGORY_ID || "",
          mapping: "pathname",
          reactions: true,
          inputPosition: "top",
          lazy: false,
          theme: "preferred_color_scheme"
        }),
        starlightPageActions({
          baseUrl: env.PUBLIC_DOMAIN || "",
          prompt: "Read {url} and explain its main points briefly."
        }),
        starlightMarkdownBlocks({
          blocks: {
            success: Aside({ label: 'Advantages', color: 'green',  }),
            warn: Aside({ label: 'Disadvantages', color: 'orange', }),
            info: Aside({ label: 'Info', color: 'blue',  }),
          },
        }),
        
        starlightSidebarSwipe()
      ],
      expressiveCode: {
        plugins: [pluginLanguageBadge(), pluginLineNumbers(), pluginCollapsibleSections()],
        defaultProps: {
          showLineNumbers: false,
          overridesByLang: {
            'js,ts,html,java,python': {
              showLineNumbers: true,
            },
          },
        }
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
              label: "Coding",
              autogenerate: {
                directory: "coding",
              },
            },
            {
              label: "High Level Design",
              autogenerate: {
                directory: "high-level-design",
              },
            },
            {
              label: "Low Level Design",
              autogenerate: {
                directory: "low-level-design",
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
        
      ],
    }),
    plantuml({
      serverUrl: env.PUBLIC_PLANTUML_SERVER_URL || "https://www.plantuml.com/plantuml/png/",
      addWrapperClasses: true,
    }),
    d2({
      skipGeneration: env.NODE_ENV === "production" || env.D2_SKIP_GENERATION === "true",
    }),
  ],

  experimental: {
    contentIntellisense: true,
  },

});