/**
 * Hydrates :::group code fences into a tabbed UI after Expressive Code runs.
 */
function initCodeGroups(root) {
  root.querySelectorAll("[data-code-group]").forEach((group) => {
    if (group.dataset.hydrated === "1") return;
    group.dataset.hydrated = "1";

    const frames = Array.from(
      group.querySelectorAll(":scope > .expressive-code, :scope > figure, :scope > pre"),
    );
    if (frames.length < 2) return;

    let labels = [];
    try {
      labels = JSON.parse(group.dataset.labels || "[]");
    } catch {
      labels = [];
    }

    const tablist = document.createElement("div");
    tablist.className = "code-group__tabs";
    tablist.setAttribute("role", "tablist");

    frames.forEach((frame, index) => {
      const titleEl =
        frame.querySelector(".frame.has-title .title, figcaption, [data-title]") ||
        frame.querySelector(".title");
      const label =
        labels[index] ||
        titleEl?.textContent?.trim() ||
        frame.querySelector("code")?.className.replace(/language-/, "") ||
        `Tab ${index + 1}`;

      frame.classList.add("code-group__panel");
      frame.setAttribute("role", "tabpanel");
      if (index !== 0) frame.hidden = true;

      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "code-group__tab";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
      tab.textContent = label;
      tab.addEventListener("click", () => {
        frames.forEach((panel, i) => {
          panel.hidden = i !== index;
        });
        tablist.querySelectorAll(".code-group__tab").forEach((btn, i) => {
          btn.setAttribute("aria-selected", i === index ? "true" : "false");
        });
      });
      tablist.appendChild(tab);
    });

    group.insertBefore(tablist, group.firstChild);
  });
}

document.addEventListener("DOMContentLoaded", () => initCodeGroups(document));
document.addEventListener("astro:page-load", () => initCodeGroups(document));
