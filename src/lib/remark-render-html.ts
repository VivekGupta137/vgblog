import type { ElementContent, RootContent } from "hast";
import type { Code, Paragraph, Root } from "mdast";
import { fromHtml } from "hast-util-from-html";
import { visit } from "unist-util-visit";

const FENCE_LANG = "renderhtml";

function isElementContent(node: RootContent): node is ElementContent {
  return node.type !== "doctype";
}

/**
 * Turns ```renderhtml fences into real DOM (SVG/HTML diagrams).
 * Regular ```html fences are left as code for Expressive Code.
 */
export function remarkRenderHtml() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if (node.lang?.toLowerCase() !== FENCE_LANG) return;
      if (parent == null || typeof index !== "number") return;

      const fragment = fromHtml(node.value, { fragment: true });

      const replacement: Paragraph = {
        type: "paragraph",
        children: [],
        data: {
          hName: "div",
          hProperties: {
            className: ["render-html", "not-content"],
          },
          hChildren: fragment.children.filter(isElementContent),
        },
      };

      parent.children[index] = replacement;
    });
  };
}
