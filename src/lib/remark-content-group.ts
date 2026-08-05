import type { Root } from "mdast";
import type { ContainerDirective } from "mdast-util-directive";
import { toString } from "mdast-util-to-string";
import { h } from "hastscript";
import { visit } from "unist-util-visit";

function extractLabel(directive: ContainerDirective): string {
  const first = directive.children[0];
  if (
    first?.type === "paragraph" &&
    first.data &&
    "directiveLabel" in first.data &&
    first.data.directiveLabel
  ) {
    const label = toString(first).trim();
    directive.children.shift();
    return label || "Tab";
  }
  const attrs = directive.attributes ?? {};
  if (attrs.title) return attrs.title;
  if (attrs.label) return attrs.label;
  return "Tab";
}

function isActive(directive: ContainerDirective): boolean {
  const attrs = directive.attributes ?? {};
  if ("active" in attrs) {
    const v = attrs.active;
    if (v === "false" || v === "0") return false;
    return true;
  }
  const cls = attrs.class ?? attrs.className ?? "";
  return typeof cls === "string" && cls.split(/\s+/).includes("active");
}

/**
 * :::group-container
 *   :::group-item[Title]{active}
 *   ...arbitrary markdown...
 *   :::
 * :::
 *
 * Renders a tabbed content panel (tables, prose, etc.).
 */
export function remarkContentGroup() {
  return (tree: Root) => {
    // Items first so containers see transformed children.
    visit(tree, (node) => {
      if (node.type !== "containerDirective") return;
      const directive = node as ContainerDirective;
      if (directive.name !== "group-item") return;

      const label = extractLabel(directive);
      const active = isActive(directive);

      const hast = h("div", {
        class: "content-group__panel",
        role: "tabpanel",
        dataLabel: label,
        ...(active ? { dataActive: "" } : {}),
      });

      const data = directive.data || (directive.data = {});
      data.hName = hast.tagName;
      data.hProperties = hast.properties;
    });

    visit(tree, (node) => {
      if (node.type !== "containerDirective") return;
      const directive = node as ContainerDirective;
      if (directive.name !== "group-container") return;

      const items = directive.children.filter(
        (child): child is ContainerDirective =>
          child.type === "containerDirective" && child.name === "group-item",
      );
      if (items.length === 0) return;

      directive.children = items;

      let activeIndex = items.findIndex((item) => {
        const props = item.data?.hProperties as Record<string, unknown> | undefined;
        return props && ("dataActive" in props || props.dataActive === "");
      });
      if (activeIndex < 0) activeIndex = 0;

      const labels = items.map((item, i) => {
        const props = item.data?.hProperties as Record<string, unknown> | undefined;
        const label = props?.dataLabel;
        return typeof label === "string" && label ? label : `Tab ${i + 1}`;
      });

      const hast = h("div", {
        class: "content-group",
        dataContentGroup: true,
        dataLabels: JSON.stringify(labels),
        dataActive: String(activeIndex),
      });

      const data = directive.data || (directive.data = {});
      data.hName = hast.tagName;
      data.hProperties = hast.properties;
    });
  };
}
