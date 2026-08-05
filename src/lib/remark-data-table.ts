import type { Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { h } from "hastscript";
import { visit } from "unist-util-visit";

function attrOn(attrs: Record<string, string | null | undefined>, key: string, defaultOn = true): boolean {
  if (!(key in attrs)) return defaultOn;
  const v = attrs[key];
  if (v === "false" || v === "0") return false;
  if (v === "true" || v === "1" || v === "" || v === null) return true;
  return defaultOn;
}

/**
 * :::data-table / ::::data-table
 * | Col | ... |
 * |-----|-----|
 * | ... | ... |
 * :::
 *
 * Marks a markdown table for client-side simple-datatables enhancement
 * (search, sort, pagination).
 *
 * Optional attributes:
 * - {searchable=false}
 * - {sortable=false}
 * - {paging=false}
 * - {perPage=50}
 */
export function remarkDataTable() {
  return (tree: Root) => {
    visit(tree, (node) => {
      if (node.type !== "containerDirective") return;
      const directive = node as ContainerDirective;
      if (directive.name !== "data-table") return;

      const attrs = directive.attributes ?? {};
      const perPageRaw = attrs.perPage ?? attrs["per-page"] ?? "25";
      const perPage = String(perPageRaw || "25");

      const hast = h("div", {
        // Keep Starlight table styles applying (avoid not-content).
        class: "sl-data-table",
        dataDataTable: true,
        dataSearchable: attrOn(attrs, "searchable") ? "true" : "false",
        dataSortable: attrOn(attrs, "sortable") ? "true" : "false",
        dataPaging: attrOn(attrs, "paging") ? "true" : "false",
        dataPerPage: perPage,
      });

      const data = directive.data || (directive.data = {});
      data.hName = hast.tagName;
      data.hProperties = hast.properties;
    });
  };
}
