/**
 * Collapse/expand content under headings (h1–h6) in .sl-markdown-content.
 * A heading's section = following siblings until the next heading of same or higher level.
 * Progressive enhancement: without JS everything stays expanded.
 */

const HIDDEN_CLASS = "is-section-collapsed";

function levelOf(el: Element): number {
  const m = /\blevel-h([1-6])\b/.exec(el.className);
  return m ? Number(m[1]) : 0;
}

function applyVisibility(container: HTMLElement) {
  let hideUntil: number | null = null; // level of the collapsed heading currently hiding content
  for (const child of Array.from(container.children)) {
    const level = child.classList.contains("sl-heading-wrapper") ? levelOf(child) : 0;
    if (level && hideUntil !== null && level <= hideUntil) hideUntil = null;
    child.classList.toggle(HIDDEN_CLASS, hideUntil !== null);
    if (level && hideUntil === null && child.getAttribute("data-collapsed") === "true") {
      hideUntil = level;
    }
  }
}

function setCollapsed(container: HTMLElement, wrapper: Element, collapsed: boolean) {
  wrapper.setAttribute("data-collapsed", String(collapsed));
  wrapper.querySelector(".heading-toggle")?.setAttribute("aria-expanded", String(!collapsed));
  applyVisibility(container);
}

/** Expand any collapsed section that hides the element (used for #hash navigation). */
function revealTarget(container: HTMLElement) {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (!target || !container.contains(target)) return;
  let node: Element | null = target;
  while (node && node.parentElement !== container) node = node.parentElement;
  if (!node || !node.classList.contains(HIDDEN_CLASS)) return;

  // Walk backwards, expanding each collapsed ancestor heading (lower level than what we've seen).
  let need = Infinity;
  for (let el = node as Element | null; el; el = el.previousElementSibling) {
    if (!el.classList.contains("sl-heading-wrapper")) continue;
    const level = levelOf(el);
    if (level < need) {
      need = level;
      if (el.getAttribute("data-collapsed") === "true") {
        el.setAttribute("data-collapsed", "false");
        el.querySelector(".heading-toggle")?.setAttribute("aria-expanded", "true");
      }
    }
  }
  applyVisibility(container);
  target.scrollIntoView();
}

function init() {
  const container = document.querySelector<HTMLElement>(".sl-markdown-content");
  if (!container || container.dataset.collapsibleReady) return;
  container.dataset.collapsibleReady = "true";

  const wrappers = container.querySelectorAll<HTMLElement>(":scope > .sl-heading-wrapper");
  if (!wrappers.length) return;

  wrappers.forEach((wrapper) => {
    const heading = wrapper.querySelector("h1, h2, h3, h4, h5, h6");
    if (!heading) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "heading-toggle";
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "Toggle section");
    if (heading.id) btn.setAttribute("aria-controls", heading.id);
    btn.innerHTML =
      '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
    btn.addEventListener("click", () =>
      setCollapsed(container, wrapper, wrapper.getAttribute("data-collapsed") !== "true"),
    );
    // Append: Starlight styles :first-child as the inline heading, so the toggle must not be first.
    wrapper.append(btn);
  });

  // Alt+click on a toggle collapses/expands all sections at that heading's level.
  container.addEventListener("click", (e) => {
    const btn = (e.target as Element).closest?.(".heading-toggle");
    if (!btn || !(e as MouseEvent).altKey) return;
    const wrapper = btn.closest(".sl-heading-wrapper")!;
    const level = levelOf(wrapper);
    const collapse = wrapper.getAttribute("data-collapsed") === "true"; // state after the first handler ran
    container.querySelectorAll(`:scope > .sl-heading-wrapper.level-h${level}`).forEach((w) => {
      w.setAttribute("data-collapsed", String(collapse));
      w.querySelector(".heading-toggle")?.setAttribute("aria-expanded", String(!collapse));
    });
    applyVisibility(container);
  });

  window.addEventListener("hashchange", () => revealTarget(container));
  revealTarget(container);
}

document.addEventListener("astro:page-load", init);
if (document.readyState !== "loading") init();
else document.addEventListener("DOMContentLoaded", init);
