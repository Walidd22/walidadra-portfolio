/* ============================================================
   scroll-decks.js — walidadra.dev
   GSAP 3.12.7 + ScrollTrigger (already loaded by both pages).

   Turns tall vertical card stacks into decks you move through
   sideways, so a section costs one screen instead of five.

     engineering.html  #systems       pinned + scrubbed on touch, grid on desktop
     index.html        #capabilities  pinned + scrubbed on touch, grid on desktop

   index.html #projects is NOT here: Selected Work uses the sticky
   accumulating stack (css/sections.css) at every viewport.

   SCOPE — this file builds decks and nothing else.

   An earlier version also drew a progress bar and a section rail, and
   re-animated the section headers, the intros, the clause/layer lists
   and the closing block. Two of those were never asked for, and the
   last one shipped a bug: js/animations.js already animates
   .connect__email-cta, so both files ran a gsap.from() against it while
   release() only de-conflicted elements INSIDE a deck. The element was
   left at opacity 0 on a live page.

   The rule that replaces it: this file only touches nodes it has moved
   into a deck, and it calls release() on them first so animations.js is
   not fighting it. Everything outside a deck is left exactly as
   animations.js already had it.

   prefers-reduced-motion -> nothing animates, everything visible.
   No GSAP -> the pages are exactly what they are today.
   ============================================================ */
(() => {
  'use strict';
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DESKTOP = '(min-width: 901px)';
  const TOUCH   = '(max-width: 900px)';

  /* Which stacks become decks, and how they behave on desktop.
     `pin` = pinned + scrubbed. `grid` = leave the desktop layout alone.

     A pinned horizontal deck needs cards that FIT THE VIEWPORT HEIGHT —
     anything taller has its bottom stranded, because the page is pinned
     and there is no vertical scroll left to reach it. The system cards
     carry six long bullets each, so they don't qualify. Desktop keeps its
     vertical layout; the deck is a touch-only pattern here. deckPinned()
     is kept for stacks that do fit. */
  /* #projects is deliberately absent: Selected Work uses the sticky
     accumulating stack at every viewport instead, so a deck would be a
     second, conflicting treatment of the same cards. */
  const DECKS = [
    { sec: '#systems',      card: '.eng-sys',      desktop: 'grid' },
    { sec: '#capabilities', card: '.cap-card',     desktop: 'grid' }
  ];

  const pad = n => String(n).padStart(2, '0');

  /* Hand a subtree back from animations.js before this file moves it.
     Only ever called on a deck's own section. */
  function release(root) {
    if (!root) return;
    ScrollTrigger.getAll().forEach(st => {
      if (st.trigger && root.contains(st.trigger)) st.kill(true);
    });
    root.querySelectorAll('.gs-reveal').forEach(el => {
      el.style.visibility = 'visible';
      gsap.set(el, { clearProps: 'transform,opacity' });
    });
  }

  /* ---------- the deck ---------- */
  function buildDeck(cfg) {
    const sec = document.querySelector(cfg.sec);
    if (!sec) return null;
    const cards = [...sec.querySelectorAll(cfg.card)];
    if (cards.length < 2) return null;

    release(sec);

    const parent = cards[0].parentNode;
    const deck = document.createElement('div');
    deck.className = 'sd-deck';
    const track = document.createElement('div');
    track.className = 'sd-deck__track';
    parent.insertBefore(deck, cards[0]);
    cards.forEach(c => { c.classList.add('sd-card'); track.appendChild(c); });
    deck.appendChild(track);

    const meta = document.createElement('div');
    meta.className = 'sd-deck__meta';
    const count = document.createElement('span');
    count.className = 'sd-deck__count';
    count.innerHTML = '<b>01</b>';
    count.append(' / ' + pad(cards.length));
    const hint = document.createElement('span');
    hint.className = 'sd-deck__hint';
    meta.append(count, hint);
    deck.appendChild(meta);

    return { sec, deck, track, cards, countEl: count.querySelector('b'), hint, cfg };
  }

  function deckPinned(d) {
    d.hint.textContent = 'scroll';
    d.deck.classList.add('is-pinned');
    d.cards[0].classList.add('is-current');
    // travel is exactly the overflow: what the track is, minus what shows.
    const distance = () => Math.max(d.track.scrollWidth - d.deck.clientWidth, 1);
    // pin BELOW the fixed nav, or the top of every card sits behind it
    const navGap = () => {
      const nav = document.querySelector('.nav');
      return nav ? Math.round(nav.getBoundingClientRect().height) + 12 : 80;
    };

    gsap.to(d.track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: d.deck, pin: true, scrub: 0.6, anticipatePin: 1,
        start: () => 'top ' + navGap(), end: () => '+=' + distance(),
        invalidateOnRefresh: true,
        snap: { snapTo: 1 / (d.cards.length - 1), duration: { min: 0.15, max: 0.35 }, ease: 'power1.inOut' },
        onUpdate: self => {
          const i = Math.round(self.progress * (d.cards.length - 1));
          d.countEl.textContent = pad(i + 1);
          d.cards.forEach((c, n) => c.classList.toggle('is-current', n === i));
        }
      }
    });
  }

  /* ---------- go ---------- */
  function init() {
    if (reduced) {
      // decks still form so the layout is the same; nothing animates.
      DECKS.forEach(cfg => {
        const d = buildDeck(cfg);
        if (d) d.cards.forEach(c => { c.style.visibility = 'visible'; c.style.opacity = '1'; });
      });
      return;
    }

    DECKS.forEach(cfg => {
      const d = buildDeck(cfg);
      if (!d) return;
      if (cfg.desktop === 'pin') {
        ScrollTrigger.matchMedia({ [DESKTOP]: () => deckPinned(d), [TOUCH]: () => deckPinned(d) });
      } else {
        d.deck.classList.add('is-grid-desktop');
        ScrollTrigger.matchMedia({ [TOUCH]: () => deckPinned(d) });
      }
    });

    // Moving cards into a track changes every offset below them, so every
    // other trigger on the page has to be remeasured or it fires at the
    // wrong scroll position — which is how a reveal goes missing.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    addEventListener('load', () => ScrollTrigger.refresh());
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  if (document.readyState === 'complete') requestAnimationFrame(init);
  else addEventListener('load', () => requestAnimationFrame(init));
})();
