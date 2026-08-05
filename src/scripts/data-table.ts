/**
 * Lightweight progressive enhancement for :::data-table.
 * Sorts / filters / paginates by moving real DOM rows so cell markup (links) is preserved.
 */

type RowRecord = {
  /** Canonical full row (never mutated) — deep-cloned for display */
  source: HTMLTableRowElement;
  /** Lowercased full row text for search */
  searchText: string;
  /** Per-column sort keys */
  keys: (string | number)[];
};

type TableState = {
  wrapper: HTMLElement;
  table: HTMLTableElement;
  tbody: HTMLTableSectionElement;
  headings: string[];
  rows: RowRecord[];
  searchable: boolean;
  sortable: boolean;
  paging: boolean;
  perPage: number;
  page: number;
  query: string;
  sortCol: number | null;
  sortDir: "asc" | "desc";
  ui: {
    top: HTMLElement;
    bottom: HTMLElement;
    search?: HTMLInputElement;
    perPageSelect?: HTMLSelectElement;
    info?: HTMLElement;
    pager?: HTMLElement;
  };
};

function compensationOrder(text: string): number {
  const match = text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]!) : Number.NEGATIVE_INFINITY;
}

function isCompHeader(header: string): boolean {
  return /comp|salary|ctc|lpa|package/.test(header.toLowerCase());
}

function headerLabels(table: HTMLTableElement): string[] {
  const headRow = table.tHead?.rows[0] ?? table.querySelector("tr");
  if (!headRow) return [];
  return Array.from(headRow.cells).map((cell) => (cell.textContent || "").trim());
}

function readOptions(wrapper: HTMLElement) {
  const searchable = wrapper.dataset.searchable !== "false";
  const sortable = wrapper.dataset.sortable !== "false";
  const paging = wrapper.dataset.paging !== "false";
  const perPage = Math.max(5, parseInt(wrapper.dataset.perPage || "25", 10) || 25);
  return { searchable, sortable, paging, perPage };
}

function cellSortKey(header: string, cell: HTMLTableCellElement): string | number {
  const text = (cell.textContent || "").trim();
  if (isCompHeader(header)) {
    const orderAttr = cell.dataset.order;
    if (orderAttr != null && orderAttr !== "" && !Number.isNaN(Number(orderAttr))) {
      return Number(orderAttr);
    }
    return compensationOrder(text);
  }
  return text.toLocaleLowerCase();
}

function collectRows(table: HTMLTableElement, headings: string[]): RowRecord[] {
  const section = table.tBodies[0];
  if (!section) return [];
  return Array.from(section.rows).map((tr) => {
    const clone = tr.cloneNode(true) as HTMLTableRowElement;
    const keys = Array.from(clone.cells).map((td, i) =>
      cellSortKey(headings[i] || "", td),
    );
    // annotate source for numeric orders
    headings.forEach((h, i) => {
      if (!isCompHeader(h)) return;
      const cell = clone.cells[i];
      if (!cell) return;
      const order = compensationOrder((cell.textContent || "").trim());
      if (Number.isFinite(order) && order !== Number.NEGATIVE_INFINITY) {
        cell.dataset.order = String(order);
      }
    });
    return {
      source: clone,
      searchText: (clone.textContent || "").toLocaleLowerCase(),
      keys,
    };
  });
}

function compareKeys(a: string | number, b: string | number, dir: "asc" | "desc"): number {
  let cmp = 0;
  if (typeof a === "number" && typeof b === "number") {
    cmp = a - b;
  } else {
    cmp = String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
  }
  if (cmp === 0) return 0;
  return dir === "asc" ? (cmp < 0 ? -1 : 1) : cmp < 0 ? 1 : -1;
}

function filteredRows(state: TableState): RowRecord[] {
  const q = state.query.trim().toLocaleLowerCase();
  if (!q) return state.rows.slice();
  return state.rows.filter((row) => row.searchText.includes(q));
}

function sortedRows(state: TableState, rows: RowRecord[]): RowRecord[] {
  if (state.sortCol == null || !state.sortable) return rows;
  const col = state.sortCol;
  const dir = state.sortDir;
  return rows.slice().sort((ra, rb) => compareKeys(ra.keys[col] ?? "", rb.keys[col] ?? "", dir));
}

function pageSlice(state: TableState, rows: RowRecord[]): RowRecord[] {
  if (!state.paging) return rows;
  const start = (state.page - 1) * state.perPage;
  return rows.slice(start, start + state.perPage);
}

function totalPages(state: TableState, count: number): number {
  if (!state.paging || state.perPage <= 0) return 1;
  return Math.max(1, Math.ceil(count / state.perPage));
}

function renderBody(state: TableState) {
  const filtered = filteredRows(state);
  const sorted = sortedRows(state, filtered);
  const pages = totalPages(state, sorted.length);
  if (state.page > pages) state.page = pages;
  const visible = pageSlice(state, sorted);

  const frag = document.createDocumentFragment();
  for (const row of visible) {
    frag.appendChild(row.source.cloneNode(true));
  }
  state.tbody.replaceChildren(frag);
  updateChrome(state, sorted.length);
  updateHeaderIndicators(state);
}

function updateHeaderIndicators(state: TableState) {
  if (!state.sortable) return;
  const headRow = state.table.tHead?.rows[0];
  if (!headRow) return;
  Array.from(headRow.cells).forEach((th, i) => {
    th.classList.remove("datatable-ascending", "datatable-descending");
    if (state.sortCol === i) {
      th.classList.add(state.sortDir === "asc" ? "datatable-ascending" : "datatable-descending");
    }
  });
}

function updateChrome(state: TableState, filteredCount: number) {
  const { ui, paging, page, perPage } = state;
  if (ui.info) {
    if (filteredCount === 0) {
      ui.info.textContent = "No matching rows";
    } else if (!paging) {
      ui.info.textContent = `Showing ${filteredCount} rows`;
    } else {
      const start = (page - 1) * perPage + 1;
      const end = Math.min(page * perPage, filteredCount);
      ui.info.textContent = `Showing ${start}–${end} of ${filteredCount}`;
    }
  }

  if (ui.pager && paging) {
    const pages = totalPages(state, filteredCount);
    ui.pager.replaceChildren();
    const makeBtn = (label: string, target: number, disabled: boolean, active = false) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = label;
      btn.disabled = disabled;
      if (active) btn.setAttribute("aria-current", "page");
      btn.addEventListener("click", () => {
        state.page = target;
        renderBody(state);
      });
      const li = document.createElement("li");
      if (active) li.classList.add("datatable-active");
      if (disabled) li.classList.add("datatable-disabled");
      li.appendChild(btn);
      ui.pager!.appendChild(li);
    };
    makeBtn("‹", Math.max(1, page - 1), page <= 1);
    // window of page numbers
    const windowSize = 5;
    let from = Math.max(1, page - Math.floor(windowSize / 2));
    let to = Math.min(pages, from + windowSize - 1);
    from = Math.max(1, to - windowSize + 1);
    for (let p = from; p <= to; p++) {
      makeBtn(String(p), p, false, p === page);
    }
    makeBtn("›", Math.min(pages, page + 1), page >= pages);
  }
}

function buildChrome(state: TableState) {
  const top = document.createElement("div");
  top.className = "datatable-top";
  const bottom = document.createElement("div");
  bottom.className = "datatable-bottom";

  if (state.paging) {
    const dropdown = document.createElement("div");
    dropdown.className = "datatable-dropdown";
    const label = document.createElement("label");
    const select = document.createElement("select");
    select.className = "datatable-selector";
    for (const n of [10, 25, 50, 100]) {
      const opt = document.createElement("option");
      opt.value = String(n);
      opt.textContent = String(n);
      if (n === state.perPage) opt.selected = true;
      select.appendChild(opt);
    }
    select.addEventListener("change", () => {
      state.perPage = parseInt(select.value, 10) || 25;
      state.page = 1;
      renderBody(state);
    });
    label.appendChild(select);
    label.appendChild(document.createTextNode(" rows"));
    dropdown.appendChild(label);
    top.appendChild(dropdown);
    state.ui.perPageSelect = select;
  }

  if (state.searchable) {
    const searchWrap = document.createElement("div");
    searchWrap.className = "datatable-search";
    const input = document.createElement("input");
    input.type = "search";
    input.className = "datatable-input";
    input.placeholder = "Search…";
    input.setAttribute("aria-label", "Search table");
    input.addEventListener("input", () => {
      state.query = input.value;
      state.page = 1;
      renderBody(state);
    });
    searchWrap.appendChild(input);
    top.appendChild(searchWrap);
    state.ui.search = input;
  }

  const info = document.createElement("div");
  info.className = "datatable-info";
  bottom.appendChild(info);
  state.ui.info = info;

  if (state.paging) {
    const nav = document.createElement("nav");
    nav.className = "datatable-pagination";
    const list = document.createElement("ul");
    list.className = "datatable-pagination-list";
    nav.appendChild(list);
    bottom.appendChild(nav);
    state.ui.pager = list;
  }

  state.ui.top = top;
  state.ui.bottom = bottom;

  // wrapper structure matching prior chrome classes
  const shell = document.createElement("div");
  shell.className = "datatable-wrapper";
  const container = document.createElement("div");
  container.className = "datatable-container";

  const parent = state.table.parentElement!;
  parent.insertBefore(shell, state.table);
  shell.appendChild(top);
  shell.appendChild(container);
  container.appendChild(state.table);
  shell.appendChild(bottom);
  state.table.classList.add("datatable-table");
}

function wireSorting(state: TableState) {
  if (!state.sortable) return;
  const headRow = state.table.tHead?.rows[0];
  if (!headRow) return;

  Array.from(headRow.cells).forEach((th, index) => {
    th.classList.add("datatable-sorter-cell");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "datatable-sorter";
    // Move existing header content into the button
    while (th.firstChild) button.appendChild(th.firstChild);
    th.appendChild(button);

    button.addEventListener("click", () => {
      if (state.sortCol === index) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortCol = index;
        state.sortDir = "asc";
      }
      state.page = 1;
      renderBody(state);
    });
  });
}

function initOne(wrapper: HTMLElement) {
  if (wrapper.dataset.hydrated === "1") return;
  const table = wrapper.querySelector<HTMLTableElement>("table");
  if (!table?.tBodies[0]) return;

  const headings = headerLabels(table);
  if (headings.length === 0) return;

  const opts = readOptions(wrapper);
  const rows = collectRows(table, headings);
  if (rows.length === 0) return;

  wrapper.dataset.hydrated = "1";

  // Clear existing body — will re-render from clones (with links)
  const tbody = table.tBodies[0];
  tbody.replaceChildren();

  const state: TableState = {
    wrapper,
    table,
    tbody,
    headings,
    rows,
    searchable: opts.searchable,
    sortable: opts.sortable,
    paging: opts.paging,
    perPage: opts.perPage,
    page: 1,
    query: "",
    sortCol: null,
    sortDir: "asc",
    ui: {
      top: document.createElement("div"),
      bottom: document.createElement("div"),
    },
  };

  buildChrome(state);
  wireSorting(state);
  renderBody(state);
}

function initDataTables(root: ParentNode = document) {
  root.querySelectorAll<HTMLElement>("[data-data-table]").forEach(initOne);
}

document.addEventListener("DOMContentLoaded", () => initDataTables());
document.addEventListener("astro:page-load", () => initDataTables());

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (!target.closest(".content-group__tab")) return;
  requestAnimationFrame(() => initDataTables());
});
