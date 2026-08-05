// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightSiteGraph from "starlight-site-graph";
import starlightLinksValidator from "starlight-links-validator";
import starlightThemeRapide from "starlight-theme-rapide";
import starlightImageZoom from "starlight-image-zoom";
import starlightPageActions from "starlight-page-actions";
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers'
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import starlightSidebarSwipe from 'starlight-sidebar-swipe'
import { remarkKroki } from "remark-kroki";

import { pluginLanguageBadge } from "expressive-code-language-badge";
import starlightGiscus from "starlight-giscus";

import starlightMarkdownBlocks, { Aside } from "starlight-markdown-blocks";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import rehypeGitHubBadgeLinks from "./src/lib/rehype-github-badge-links";
import { KROKI_DIAGRAM_ALIASES } from "./src/lib/kroki-aliases";
import { remarkCodeGroup } from "./src/lib/remark-code-group";
import { remarkContentGroup } from "./src/lib/remark-content-group";
import { remarkDataTable } from "./src/lib/remark-data-table";
import remarkDirective from "remark-directive";
import { loadEnv } from "vite";

import sitemap from "@astrojs/sitemap";

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");

const enableLinkValidation =
  env.VALIDATE_LINKS === "true" || process.env.VALIDATE_LINKS === "true";

// Prefer dedicated Kroki base URL; fall back to legacy PlantUML Kroki URL host.
const krokiServer =
  env.PUBLIC_KROKI_SERVER_URL || "https://kroki.io";

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_DOMAIN || "http://localhost:4321/",
  
  markdown: {
    remarkPlugins: [
      [
        remarkKroki,
        {
          server: krokiServer,
          alias: KROKI_DIAGRAM_ALIASES,
          
          target: "html",
        },
      ],
      remarkDirective,
      remarkCodeGroup,
      remarkContentGroup,
      remarkDataTable,
      remarkMath,
    ],
    rehypePlugins: [rehypeKatex, rehypeGitHubBadgeLinks],
  },
  output: "static",

  integrations: [starlight({
    customCss: [
      './src/global.css',
      './src/styles/custom.css',
    ],
    components: {
      Pagination: './src/components/Pagination.astro',
      Header: './src/components/Header.astro',
      Head: './src/components/Head.astro',
      ContentPanel: './src/components/ContentPanel.astro',
      LastUpdated: './src/components/LastUpdated.astro',
    },
    plugins: [
      starlightSiteGraph(),
      ...(enableLinkValidation ? [starlightLinksValidator()] : []),
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
    sidebar: [
      {
        label: "Learnings",
        items: [
          {
            label: "Guides",
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
  }), sitemap()],

  experimental: {
    contentIntellisense: true,
  },

});
