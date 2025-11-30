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

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_DOMAIN || "http://localhost:4321/",
  
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex, rehypeGitHubBadgeLinks],
  },

  integrations: [
    starlight({
      customCss: [
        './src/global.css',
        './src/styles/custom.css',
      ],
      components: {
        Pagination: './src/components/Pagination.astro',
        Header: './src/components/Header.astro',
      },
      plugins: [
        starlightSiteGraph(),
        starlightLinksValidator(),
        starlightThemeRapide(),
        starlightImageZoom(),
        starlightGiscus({
          repo: process.env.PUBLIC_GISCUS_REPO || "",
          repoId: process.env.PUBLIC_GISCUS_REPO_ID || "",
          category: process.env.PUBLIC_GISCUS_CATEGORY || "",
          categoryId: process.env.PUBLIC_GISCUS_CATEGORY_ID || "",
          mapping: "pathname",
          reactions: true,
          inputPosition: "top",
          lazy: false,
          theme: "preferred_color_scheme"
        }),
        starlightPageActions({
          baseUrl: process.env.PUBLIC_DOMAIN || "",
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
      serverUrl: process.env.PUBLIC_PLANTUML_SERVER_URL || "http://localhost:8080/png/",
      addWrapperClasses: true,
    }),
    d2(),
  ],

  experimental: {
    contentIntellisense: true,
  },

});