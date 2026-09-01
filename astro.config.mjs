// @ts-check
import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
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
import { remarkRenderHtml } from "./src/lib/remark-render-html";
import remarkDirective from "remark-directive";
import { loadEnv } from "vite";

import sitemap from "@astrojs/sitemap";

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");

const enableLinkValidation =
  env.VALIDATE_LINKS === "true" || process.env.VALIDATE_LINKS === "true";

/**
 * Resolve Kroki base URL for remark-kroki (build-time HTTP).
 * loadEnv only reads .env files — also check process.env (CF/CI vars).
 * Fall back to PUBLIC_PLANTUML_SERVER_URL origin so local .env keeps working.
 * Never leave this unset: remark-kroki defaults to http://localhost:8000.
 */
function resolveKrokiServer() {
  const dedicated = (
    env.PUBLIC_KROKI_SERVER_URL ||
    process.env.PUBLIC_KROKI_SERVER_URL ||
    ""
  ).trim();
  if (dedicated) return dedicated.replace(/\/$/, "");

  const plantuml = (
    env.PUBLIC_PLANTUML_SERVER_URL ||
    process.env.PUBLIC_PLANTUML_SERVER_URL ||
    ""
  ).trim();
  if (plantuml) {
    try {
      return new URL(plantuml).origin;
    } catch {
      return plantuml.replace(/\/plantuml\/.*$/i, "").replace(/\/$/, "");
    }
  }

  return "https://kroki.io";
}

const krokiServer = resolveKrokiServer();
console.log(`[kroki] diagram server: ${krokiServer}`);

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_DOMAIN || "http://localhost:4321/",
  
  markdown: {
    // Astro 7 defaults to Sätteri; keep remark/rehype plugins on the unified pipeline.
    processor: unified({
      remarkPlugins: [
        [
          remarkKroki,
          {
            server: krokiServer,
            alias: KROKI_DIAGRAM_ALIASES,
            output: "img-html-base64",
            target: "html",
          },
        ],
        remarkDirective,
        remarkRenderHtml,
        remarkCodeGroup,
        remarkContentGroup,
        remarkDataTable,
        remarkMath,
      ],
      rehypePlugins: [rehypeKatex, rehypeGitHubBadgeLinks],
    }),
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
        theme: "preferred_color_scheme",
        // Rapide replaces <starlight-theme-select>; missing node crashed Vite in Astro 7.
        element: "starlight-rapide-theme-select",
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
            items: [{ autogenerate: { directory: "guides" } }],
          },
          {
            label: "Coding",
            items: [{ autogenerate: { directory: "coding" } }],
          },
          {
            label: "High Level Design",
            items: [{ autogenerate: { directory: "high-level-design" } }],
          },
          {
            label: "Low Level Design",
            items: [{ autogenerate: { directory: "low-level-design" } }],
          },
        ],
      },
      {
        label: "Connect",
        items: [{ autogenerate: { directory: "connect" } }],
      },
      
    ],
  }), sitemap()],

});
