import type { Code, Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { h } from "hastscript";
import { visit } from "unist-util-visit";

function tabLabel(code: Code, index: number): string {
  const meta = code.meta ?? "";
  const titleMatch = meta.match(/(?:^|\s)title=(?:"([^"]+)"|'([^']+)'|([^\s]+))/);
  if (titleMatch) {
    return titleMatch[1] || titleMatch[2] || titleMatch[3] || code.lang || `Tab ${index + 1}`;
  }
  const bracketMatch = meta.match(/\[([^\]]+)\]/);
  if (bracketMatch?.[1]) return bracketMatch[1].trim();
  if (code.lang) return code.lang;
  return `Tab ${index + 1}`;
}

/**
 * Turns :::group / :::code-group containers of code fences into a .code-group
 * wrapper. Tab UI is hydrated client-side from each block's title / language.
 *
 * `not-content` opts out of Starlight's adjacent-sibling content gap
 * (EC only puts that class on the inner figure, not the .expressive-code wrapper).
 */
export function remarkCodeGroup() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type !== "containerDirective") return;
      const directive = node as ContainerDirective;
      if (directive.name !== "group" && directive.name !== "code-group") return;

      const codes = directive.children.filter((child): child is Code => child.type === "code");
      if (codes.length === 0) return;

      const labels = codes.map((code, i) => tabLabel(code, i));

      codes.forEach((code, i) => {
        const label = labels[i]!;
        if (!code.meta?.includes("title=")) {
          const safe = label.replace(/"/g, '\\"');
          code.meta = [code.meta, `title="${safe}"`].filter(Boolean).join(" ").trim();
        }
      });

      // Keep only code children (drop blank lines between fences).
      directive.children = codes;

      const hast = h("div", {
        class: "code-group not-content",
        dataCodeGroup: true,
        dataLabels: JSON.stringify(labels),
      });

      const data = directive.data || (directive.data = {});
      data.hName = hast.tagName;
      data.hProperties = hast.properties;
    });
  };
}
