/**
 * Hydrates tabbed groups after the page renders:
 * - [data-code-group]  — :::group / :::code-group (code fences)
 * - [data-content-group] — :::group-container / :::group-item (any markdown)
 */
function parseLabels(el) {
  try {
    return JSON.parse(el.dataset.labels || "[]");
  } catch {
    return [];
  }
}

function activate(frames, tablist, index) {
  frames.forEach((panel, i) => {
    panel.hidden = i !== index;
  });
  tablist.querySelectorAll('[role="tab"]').forEach((btn, i) => {
    btn.setAttribute("aria-selected", i === index ? "true" : "false");
  });
}

function buildTablist(frames, labels, activeIndex, tabClass) {
  const tablist = document.createElement("div");
  // not-content: skip Starlight .sl-markdown-content *+* margin on tab buttons
  tablist.className = `${tabClass} not-content`;
  tablist.setAttribute("role", "tablist");

  frames.forEach((frame, index) => {
    const label =
      labels[index] ||
      frame.dataset.label ||
      frame.querySelector(".frame.has-title .title, figcaption, .title")?.textContent?.trim() ||
      frame.querySelector("code")?.className.replace(/language-/, "") ||
      `Tab ${index + 1}`;

    frame.setAttribute("role", "tabpanel");
    frame.hidden = index !== activeIndex;

    const tab = document.createElement("button");
    tab.type = "button";
    tab.className = tabClass.replace(/__tabs$/, "__tab");
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
    tab.textContent = label;
    tab.addEventListener("click", () => activate(frames, tablist, index));
    tablist.appendChild(tab);
  });

  return tablist;
}

function initCodeGroups(root) {
  root.querySelectorAll("[data-code-group]").forEach((group) => {
    if (group.dataset.hydrated === "1") return;
    group.dataset.hydrated = "1";

    const frames = Array.from(
      group.querySelectorAll(":scope > .expressive-code, :scope > figure, :scope > pre"),
    );
    if (frames.length < 2) return;

    frames.forEach((frame) => frame.classList.add("code-group__panel"));
    const tablist = buildTablist(frames, parseLabels(group), 0, "code-group__tabs");
    group.insertBefore(tablist, group.firstChild);
  });
}

function initContentGroups(root) {
  root.querySelectorAll("[data-content-group]").forEach((group) => {
    if (group.dataset.hydrated === "1") return;
    group.dataset.hydrated = "1";

    const frames = Array.from(group.querySelectorAll(":scope > .content-group__panel"));
    if (frames.length < 1) return;

    let activeIndex = parseInt(group.dataset.active || "0", 10);
    if (Number.isNaN(activeIndex) || activeIndex < 0 || activeIndex >= frames.length) {
      activeIndex = frames.findIndex((f) => f.hasAttribute("data-active"));
      if (activeIndex < 0) activeIndex = 0;
    }

    const tablist = buildTablist(
      frames,
      parseLabels(group),
      activeIndex,
      "content-group__tabs",
    );
    group.insertBefore(tablist, group.firstChild);
  });
}

function initAll(root = document) {
  initCodeGroups(root);
  initContentGroups(root);
}

document.addEventListener("DOMContentLoaded", () => initAll());
document.addEventListener("astro:page-load", () => initAll());
