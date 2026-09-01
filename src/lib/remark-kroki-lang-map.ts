import type { Root } from "mdast";
import { visit } from "unist-util-visit";

/** Fence language → Kroki API type (remark-kroki posts `/{type}/svg`). */
const KROKI_LANG_MAP: Record<string, string> = {
  c4: "c4plantuml",
  "vega-lite": "vegalite",
  drawio: "diagramsnet",
  "diagrams.net": "diagramsnet",
};

export function remarkKrokiLangMap() {
  return (tree: Root) => {
    visit(tree, "code", (node) => {
      if (!node.lang) return;
      const mapped = KROKI_LANG_MAP[node.lang.toLowerCase()];
      if (mapped) node.lang = mapped;
    });
  };
}
