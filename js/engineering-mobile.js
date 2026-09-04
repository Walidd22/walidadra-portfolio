/* ============================================================
   engineering.html — mobile density
   Progressive enhancement, mobile only.

   IMPORTANT: this never moves, wraps or removes an existing node.
   It only (a) adds a class to elements it collapses and (b) inserts
   one <button> as a sibling. So the desktop DOM and every existing
   CSS selector keep working exactly as they do now — the injected
   buttons are display:none above the breakpoint.

   No JS -> the page renders exactly as it does today.
   ============================================================ */
(() => {
  'use strict';

  // 900px, matching css/engineering-mobile.css and the deck's touch range.
  // At 760 the bullets stayed expanded between 761 and 900, where the deck
  // pins — and a card too tall to fit the viewport has its bottom stranded.
  const MQ = window.matchMedia('(max-width: 900px)');
  const CHIP_CAP = 8;
  const groups = [];

  let seq = 0;

  /**
   * Make `target` collapsible behind a button placed before it.
   * @param {Element} target   element to hide when collapsed
   * @param {string}  label    button text
   * @param {string}  hint     small trailing count
   * @param {Element} [labelEl] existing label to reuse as the trigger
   */
  function collapsible(target, label, hint, labelEl) {
    if (!target) return;
    const id = 'engf' + (++seq);
    target.id = target.id || id + '-body';
    target.classList.add('eng-collapse');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'eng-toggle';
    btn.setAttribute('aria-controls', target.id);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="eng-toggle__label"></span>' +
                    '<span class="eng-toggle__hint"></span>' +
                    '<span class="eng-toggle__chev" aria-hidden="true"></span>';
    btn.querySelector('.eng-toggle__label').textContent = label;
    btn.querySelector('.eng-toggle__hint').textContent = hint || '';

    target.parentNode.insertBefore(btn, target);
    if (labelEl) labelEl.classList.add('eng-label-dupe');

    const set = open => {
      target.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    };
    btn.addEventListener('click', () => set(!target.classList.contains('is-open')));

    groups.push({ target, btn, set });
  }

  /* ---- 1. Systems: the "hard parts" bullets ---- */
  document.querySelectorAll('.eng-sys').forEach(sys => {
    const hard = sys.querySelector('.eng-sys__hard');
    const list = sys.querySelector('.eng-sys__list');
    if (!list) return;
    const label = (hard && hard.textContent.trim()) || 'The hard parts';
    collapsible(list, label, list.children.length + ' notes', hard);
  });

  /* ---- 2. Systems: cap the stack chips ---- */
  document.querySelectorAll('.eng-sys__stack').forEach(ul => {
    const items = [...ul.children];
    if (items.length <= CHIP_CAP + 2) return;
    const hidden = items.slice(CHIP_CAP);
    hidden.forEach(li => li.classList.add('is-extra'));

    const li = document.createElement('li');
    li.className = 'eng-chip-more';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.textContent = '+' + hidden.length;
    btn.addEventListener('click', () => {
      const open = ul.classList.toggle('is-open');
      btn.textContent = open ? 'less' : '+' + hidden.length;
      btn.setAttribute('aria-expanded', String(open));
    });
    li.appendChild(btn);
    ul.appendChild(li);
  });

  /* ---- 3. Constraints: the "how" behind each rule ---- */
  document.querySelectorAll('.eng-clause').forEach(cl => {
    collapsible(cl.querySelector('.eng-clause__how'), 'How it holds', '');
  });

  /* ---- 4. Stack: one collapse per layer ---- */
  document.querySelectorAll('.eng-layer').forEach(layer => {
    const name = layer.querySelector('.eng-layer__name');
    const items = layer.querySelector('.eng-layer__items');
    if (!items) return;
    collapsible(items, (name && name.textContent.trim()) || 'Layer',
                String(items.children.length), name);
  });

  /* ---- desktop: everything open, controls hidden by CSS ---- */
  function sync(e) {
    const mobile = e.matches;
    document.documentElement.classList.toggle('eng-mobile', mobile);
    groups.forEach(g => g.set(!mobile));
  }
  sync(MQ);
  MQ.addEventListener ? MQ.addEventListener('change', sync) : MQ.addListener(sync);

  /* ---- a deep link must land on open content ---- */
  function openTo(hash) {
    if (!hash) return;
    const el = document.querySelector(hash);
    if (!el) return;
    groups.forEach(g => { if (el.contains(g.target)) g.set(true); });
  }
  openTo(location.hash);
  addEventListener('hashchange', () => openTo(location.hash));
})();
