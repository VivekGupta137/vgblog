/**
 * Interactive popovers for ```renderhtml diagrams.
 * Mark any element with data-pop-title + data-pop (body, `code` allowed).
 * data-pop-tour="0" keeps an item clickable but out of the Prev/Next tour.
 */
const SEL = '[data-pop]';
let pop: HTMLDivElement | null = null;
let ctx: { root: HTMLElement; tour: HTMLElement[]; active: HTMLElement | null } | null = null;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const fmt = (s: string) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');

function tourOf(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(SEL)].filter((e) => e.dataset.popTour !== '0');
}

function ensurePop() {
  if (pop) return pop;
  pop = document.createElement('div');
  pop.className = 'dp-pop';
  pop.setAttribute('role', 'dialog');
  pop.hidden = true;
  pop.innerHTML = `
    <div class="dp-head"><strong class="dp-title"></strong><button type="button" class="dp-close" aria-label="Close">×</button></div>
    <div class="dp-body"></div>
    <div class="dp-foot"><button type="button" data-dp="prev">‹ Prev</button><span class="dp-count"></span><button type="button" data-dp="next">Next ›</button></div>`;
  document.body.append(pop);
  pop.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest('button');
    if (!t) return;
    if (t.classList.contains('dp-close')) close();
    else if (t.dataset.dp === 'prev') step(-1);
    else if (t.dataset.dp === 'next') step(1);
  });
  return pop;
}

function place() {
  if (!pop || !ctx?.active || pop.hidden) return;
  const r = ctx.active.getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight, m = 8;
  let top = r.bottom + m;
  if (top + ph > innerHeight - m) top = Math.max(m, r.top - ph - m);
  if (top < m) top = m;
  let left = r.left + r.width / 2 - pw / 2;
  left = Math.min(Math.max(m, left), innerWidth - pw - m);
  pop.style.top = `${top}px`;
  pop.style.left = `${left}px`;
}

function show(el: HTMLElement, root: HTMLElement) {
  const p = ensurePop();
  ctx?.active?.classList.remove('dp-active');
  ctx = { root, tour: tourOf(root), active: el };
  el.classList.add('dp-active');
  (p.querySelector('.dp-title') as HTMLElement).textContent = el.dataset.popTitle || 'Details';
  (p.querySelector('.dp-body') as HTMLElement).innerHTML = fmt(el.dataset.pop || '');
  const i = ctx.tour.indexOf(el);
  (p.querySelector('.dp-count') as HTMLElement).textContent = i >= 0 ? `${i + 1} / ${ctx.tour.length}` : '';
  p.hidden = false;
  const r = el.getBoundingClientRect();
  if (r.top < 60 || r.bottom > innerHeight - 220) el.scrollIntoView({ block: 'center', behavior: 'auto' });
  place();
  syncBar(root);
}

function close() {
  if (pop) pop.hidden = true;
  ctx?.active?.classList.remove('dp-active');
  if (ctx) syncBar(ctx.root);
  ctx = null;
}

function step(dir: 1 | -1, rootArg?: HTMLElement) {
  const root = ctx?.root ?? rootArg;
  if (!root) return;
  const tour = tourOf(root);
  if (!tour.length) return;
  const cur = ctx?.active ?? null;
  let next: HTMLElement | undefined;
  const i = cur ? tour.indexOf(cur) : -1;
  if (i >= 0) next = tour[(i + dir + tour.length) % tour.length];
  else if (cur) {
    // clicked item outside the tour: go to nearest tour item after/before it in DOM order
    const after = tour.filter((t) => cur.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_FOLLOWING);
    const before = tour.filter((t) => cur.compareDocumentPosition(t) & Node.DOCUMENT_POSITION_PRECEDING);
    next = dir === 1 ? after[0] ?? tour[0] : before[before.length - 1] ?? tour[tour.length - 1];
  } else next = dir === 1 ? tour[0] : tour[tour.length - 1];
  if (next) show(next, root);
}

function syncBar(root: HTMLElement) {
  const c = root.querySelector<HTMLElement>('.dp-bar .dp-bar-count');
  if (!c) return;
  const tour = tourOf(root);
  const i = ctx && ctx.root === root && ctx.active ? tour.indexOf(ctx.active) : -1;
  c.textContent = i >= 0 ? `${i + 1} / ${tour.length}` : `${tour.length} items`;
}

function init() {
  document.querySelectorAll<HTMLElement>('.render-html').forEach((root) => {
    if (root.dataset.dpReady || !root.querySelector(SEL)) return;
    root.dataset.dpReady = '1';
    root.classList.add('has-pop');
    const bar = document.createElement('div');
    bar.className = 'dp-bar';
    bar.innerHTML = `<span class="dp-hint">💡 Click any item for an explanation, or step through:</span>
      <span class="dp-nav"><button type="button" data-dp="prev" aria-label="Previous item">‹ Prev</button><span class="dp-bar-count"></span><button type="button" data-dp="next" aria-label="Next item">Next ›</button></span>`;
    root.prepend(bar);
    syncBar(root);
    bar.addEventListener('click', (e) => {
      const b = (e.target as HTMLElement).closest('button');
      if (!b) return;
      e.stopPropagation(); // else the document-level outside-click handler closes the popover right after it opens
      step(b.dataset.dp === 'prev' ? -1 : 1, root);
    });
    root.querySelectorAll<HTMLElement>(SEL).forEach((el) => {
      el.tabIndex = 0;
      el.classList.add('dp-item');
    });
    root.addEventListener('click', (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(SEL);
      if (!el || !root.contains(el)) return;
      e.stopPropagation();
      ctx?.active === el && pop && !pop.hidden ? close() : show(el, root);
    });
    root.addEventListener('keydown', (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(SEL);
      if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(el, root); }
    });
    let hov: HTMLElement | null = null;
    root.addEventListener('mouseover', (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>(SEL);
      if (el === hov) return;
      hov?.classList.remove('dp-hover');
      hov = el && root.contains(el) ? el : null;
      hov?.classList.add('dp-hover');
    });
    root.addEventListener('mouseleave', () => { hov?.classList.remove('dp-hover'); hov = null; });
  });
}

document.addEventListener('click', (e) => {
  if (pop && !pop.hidden && !(e.target as HTMLElement).closest('.dp-pop')) close();
});
document.addEventListener('keydown', (e) => {
  if (!pop || pop.hidden) return;
  if (e.key === 'Escape') close();
  else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
});
addEventListener('resize', place);
addEventListener('scroll', place, { passive: true });

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
