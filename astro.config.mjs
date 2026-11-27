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
import { remarkKrokiLangMap } from "./src/lib/remark-kroki-lang-map";
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
        remarkKrokiLangMap,
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
      Sidebar: './src/components/Sidebar.astro',
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
        label: "Guides",
        collapsed: false,
        items: [
        { slug: "guides/example", label: "Example Guide" },
        { slug: "guides/ai-skills", label: "AI Skills for Docs" },
        { slug: "guides/company-apply", label: "Company Apply" }
        ],
      },
      {
        label: "Coding",
        collapsed: false,
        items: [
        {
          label: "Competitive Coding",
          collapsed: true,
          items: [
          { slug: "coding/competitive/reference", label: "Reference" },
          { slug: "coding/competitive/dp", label: "Dynamic Programming" },
          { slug: "coding/competitive/graphs", label: "Graphs" },
          { slug: "coding/competitive/segment-tree", label: "Segment Tree" },
          { slug: "coding/competitive/square-root-decomposition", label: "Sqrt Decomposition / Mo's" },
          { slug: "coding/competitive/tree-map", label: "Tree Map" }
          ],
        },
        {
          label: "Java",
          collapsed: true,
          items: [
          { slug: "coding/java/revisit", label: "Concepts" }
          ],
        },
        {
          label: "React & JavaScript",
          collapsed: true,
          items: [
          { slug: "coding/react/concepts", label: "React Concepts" },
          { slug: "coding/react/rendering", label: "Rendering" },
          { slug: "coding/react/js-engine", label: "JavaScript Engine" },
          { slug: "coding/react/security", label: "Frontend Security" }
          ],
        },
        {
          label: "Chrome DevTools",
          collapsed: true,
          items: [
          { slug: "coding/web-devtools", label: "Overview" },
          { slug: "coding/web-devtools/00-getting-started", label: "Getting Started" },
          { slug: "coding/web-devtools/01-elements-panel", label: "Elements" },
          { slug: "coding/web-devtools/02-console-panel", label: "Console" },
          { slug: "coding/web-devtools/03-sources-panel", label: "Sources" },
          { slug: "coding/web-devtools/04-network-panel", label: "Network" },
          { slug: "coding/web-devtools/05-performance-panel", label: "Performance" },
          { slug: "coding/web-devtools/06-memory-panel", label: "Memory" },
          { slug: "coding/web-devtools/07-application-panel", label: "Application" },
          { slug: "coding/web-devtools/08-security-panel", label: "Security" },
          { slug: "coding/web-devtools/09-lighthouse-panel", label: "Lighthouse" },
          { slug: "coding/web-devtools/10-recorder-panel", label: "Recorder" },
          { slug: "coding/web-devtools/11-coverage-tool", label: "Coverage" },
          { slug: "coding/web-devtools/12-rendering-panel", label: "Rendering" },
          { slug: "coding/web-devtools/13-animations-panel", label: "Animations" },
          { slug: "coding/web-devtools/14-css-overview", label: "CSS Overview" },
          { slug: "coding/web-devtools/15-sensors-panel", label: "Sensors" },
          { slug: "coding/web-devtools/16-changes-panel", label: "Changes" },
          { slug: "coding/web-devtools/17-performance-insights", label: "Performance Insights" },
          { slug: "coding/web-devtools/18-advanced-tips-and-tricks", label: "Advanced Tips" }
          ],
        },
        {
          label: "Linux",
          collapsed: true,
          items: [
          { slug: "coding/linux/shell-productivity", label: "Shell Productivity" },
          { slug: "coding/linux/text-editors", label: "Text Editors" },
          { slug: "coding/linux/searching-navigation", label: "Searching & Navigation" },
          { slug: "coding/linux/grep-find", label: "Grep & Find" },
          { slug: "coding/linux/file-text-manipulation", label: "File Text Manipulation" },
          { slug: "coding/linux/archives-compression", label: "Archives & Compression" },
          { slug: "coding/linux/user-permissions", label: "User Permissions" },
          { slug: "coding/linux/filesystem-permissions-boot", label: "Filesystem, Permissions, Boot" },
          { slug: "coding/linux/disk-system", label: "Disk System" },
          { slug: "coding/linux/process-management", label: "Process Management" },
          { slug: "coding/linux/networking", label: "Networking" }
          ],
        }
        ],
      },
      {
        label: "High Level Design",
        collapsed: false,
        items: [
        {
          label: "Start Here",
          collapsed: false,
          items: [
          { slug: "high-level-design/system-design", label: "System Design" },
          { slug: "high-level-design/fundamentals", label: "HLD Fundamentals" },
          { slug: "high-level-design/botec", label: "Back-of-Envelope Estimation" },
          { slug: "high-level-design/architecture-styles", label: "Architecture Styles" }
          ],
        },
        {
          label: "Data",
          collapsed: true,
          items: [
          { slug: "high-level-design/databases", label: "Databases" },
          { slug: "high-level-design/additional-concepts/sql-databases", label: "SQL Databases" },
          { slug: "high-level-design/additional-concepts/nosql-databases", label: "NoSQL Databases" },
          { slug: "high-level-design/additional-concepts/redis", label: "Redis" },
          { slug: "high-level-design/data-partition", label: "Data Partitioning" }
          ],
        },
        {
          label: "APIs & Caching",
          collapsed: true,
          items: [
          { slug: "high-level-design/api-design/api-design-concepts", label: "API Design Concepts" },
          { slug: "high-level-design/api-design/http-codes", label: "HTTP Status Codes & Methods" },
          { slug: "high-level-design/api-design/cache", label: "Caching" },
          { slug: "high-level-design/api-design/api-case-studies", label: "API Case Studies" }
          ],
        },
        {
          label: "Networking & Security",
          collapsed: true,
          items: [
          { slug: "high-level-design/protocols/http", label: "HTTP & HTTPS" },
          { slug: "high-level-design/protocols/tcp-udp", label: "TCP & UDP" },
          { slug: "high-level-design/additional-concepts/proxy", label: "Proxies" },
          { slug: "high-level-design/additional-concepts/certificates-tls-mtls", label: "Certificates, TLS, mTLS" },
          { slug: "high-level-design/additional-concepts/web-browser", label: "Web Browsers" }
          ],
        },
        {
          label: "Operations",
          collapsed: true,
          items: [
          { slug: "high-level-design/additional-concepts/monitoring", label: "Monitoring" }
          ],
        },
        {
          label: "Book Notes (DDIA)",
          collapsed: true,
          items: [
          { slug: "high-level-design/chapters/reliable-scalable-and-maintainable-applications", label: "1. Reliable, Scalable, Maintainable" },
          { slug: "high-level-design/chapters/data-models-and-query-languages", label: "2. Data Models & Query Languages" },
          { slug: "high-level-design/chapters/storage-and-retrieval", label: "3. Storage & Retrieval" }
          ],
        },
        {
          label: "Case Study: Payment Gateway",
          collapsed: true,
          items: [
          { slug: "high-level-design/payment-gateway/payment-gateway", label: "Summary" },
          { slug: "high-level-design/payment-gateway/00-overview", label: "Overview" },
          { slug: "high-level-design/payment-gateway/01-payment-ecosystem", label: "Payment Ecosystem" },
          { slug: "high-level-design/payment-gateway/02-api-layer", label: "API Layer" },
          { slug: "high-level-design/payment-gateway/03-transaction-processing", label: "Transaction Processing" },
          { slug: "high-level-design/payment-gateway/04-security-pci-3ds", label: "Security, PCI, 3DS" },
          { slug: "high-level-design/payment-gateway/05-fraud-detection", label: "Fraud Detection" },
          { slug: "high-level-design/payment-gateway/06-stored-credentials-tokenization", label: "Stored Credentials & Tokenization" },
          { slug: "high-level-design/payment-gateway/07-recurring-billing", label: "Recurring Billing" },
          { slug: "high-level-design/payment-gateway/08-ach-echeck", label: "ACH / eCheck" },
          { slug: "high-level-design/payment-gateway/09-settlement-funding", label: "Settlement & Funding" },
          { slug: "high-level-design/payment-gateway/10-scalability-reliability", label: "Scalability & Reliability" },
          { slug: "high-level-design/payment-gateway/11-observability", label: "Observability" }
          ],
        },
        {
          label: "Real-World Architectures",
          collapsed: true,
          items: [
          { slug: "high-level-design/enterprise-design-blogs", label: "Engineering Blogs & Patterns" }
          ],
        }
        ],
      },
      {
        label: "Low Level Design",
        collapsed: false,
        items: [
        { slug: "low-level-design/quick-revision", label: "⚡ Quick Revision" },
        {
          label: "Foundations",
          collapsed: false,
          items: [
          { slug: "low-level-design/object-oriented-analysis-design", label: "OO Analysis & Design (UML)" },
          { slug: "low-level-design/solid-principles", label: "SOLID Principles" }
          ],
        },
        {
          label: "Design Patterns",
          collapsed: false,
          items: [
          { slug: "low-level-design/patterns/creational-patterns", label: "Creational" },
          { slug: "low-level-design/patterns/singleton", label: "Singleton" },
          { slug: "low-level-design/patterns/structural-patterns", label: "Structural" },
          { slug: "low-level-design/patterns/behavioural-patterns", label: "Behavioural" }
          ],
        },
        {
          label: "Worked Examples",
          collapsed: false,
          items: [
          { slug: "low-level-design/examples/parking-lot-system", label: "Parking Lot" },
          { slug: "low-level-design/examples/elevator-system", label: "Elevator" },
          { slug: "low-level-design/examples/atm-system", label: "ATM" },
          { slug: "low-level-design/examples/lru-cache", label: "LRU Cache" },
          { slug: "low-level-design/examples/logging-system", label: "Logging System" },
          { slug: "low-level-design/examples/movie-ticket-booking-system", label: "Movie Ticket Booking" },
          { slug: "low-level-design/examples/hotel-booking-system", label: "Hotel Booking" },
          { slug: "low-level-design/examples/car-rental-system", label: "Car Rental" },
          { slug: "low-level-design/examples/library-management-system", label: "Library Management" },
          { slug: "low-level-design/examples/online-shopping-system", label: "Online Shopping" },
          { slug: "low-level-design/examples/snake-and-ladder-game", label: "Snake & Ladder" }
          ],
        },
        {
          label: "Case Study: Payment Gateway",
          collapsed: true,
          items: [
          { slug: "low-level-design/payment-gateway/lld-payment-gateway", label: "Overview" },
          { slug: "low-level-design/payment-gateway/01-transaction-engine-lld", label: "Transaction Engine" },
          { slug: "low-level-design/payment-gateway/02-fraud-engine-lld", label: "Fraud Engine" },
          { slug: "low-level-design/payment-gateway/03-processor-integration-lld", label: "Processor Integration" },
          { slug: "low-level-design/payment-gateway/04-settlement-pipeline-lld", label: "Settlement Pipeline" },
          { slug: "low-level-design/payment-gateway/05-stored-credentials-lld", label: "Stored Credentials" }
          ],
        }
        ],
      },
      {
        label: "Reference",
        collapsed: true,
        items: [
        { slug: "reference/example", label: "Example Reference" }
        ],
      },
      {
        label: "Connect",
        collapsed: false,
        items: [
        { slug: "connect/about", label: "About Me" }
        ],
      },
    ],
  }), sitemap()],

});
