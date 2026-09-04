/* ============================================================
   scroll-decks.js — walidadra.dev
   GSAP 3.12.7 + ScrollTrigger (already loaded by both pages).

   Turns tall vertical card stacks into decks you move through
   sideways, so a section costs one screen instead of five.

     engineering.html  #systems       pinned + scrubbed on desktop,
                                      swipe deck on touch
     index.html        #projects      swipe deck on touch, grid on desktop
     index.html        #capabilities  swipe deck on touch, grid on desktop

   Plus: scroll progress, a section rail, header/​batch reveals and a
   nav that hides going down and returns coming up.

   Loads AFTER js/animations.js and releases any .gs-reveal the
   generic catch-all already claimed inside a deck, so nothing is
   animated twice.

   prefers-reduced-motion -> everything static and fully visible.
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
  const DECKS = [
    { sec: '#systems',      card: '.eng-sys',      desktop: 'grid' },
    { sec: '#projects',     card: '.project-card', desktop: 'grid' },
    { sec: '#capabilities', card: '.cap-card',     desktop: 'grid' }
  ];

  const pad = n => String(n).padStart(2, '0');

  /* ---------------------------------------------------------- */
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

  /* ---------- chrome: progress bar + section rail ---------- */
  function buildChrome() {
    const secs = [...document.querySelectorAll('section[id], .eng-sec[id], .eng-end[id]')]
      .filter(s => s.offsetHeight > 200);
    if (secs.length < 2) return;

    const bar = document.createElement('div');
    bar.className = 'sd-progress';
    bar.appendChild(document.createElement('i'));
    document.body.appendChild(bar);

    if (!reduced) {
      gsap.to(bar.firstElementChild, {
        scaleX: 1, ease: 'none', transformOrigin: 'left center',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.25 }
      });
    }

    const rail = document.createElement('nav');
    rail.className = 'sd-rail';
    rail.setAttribute('aria-label', 'Sections');
    const links = secs.map(s => {
      const h = s.querySelector('h2, .eng-sec__t, .section__title');
      const a = document.createElement('a');
      a.href = '#' + s.id;
      const dot = document.createElement('span'); dot.className = 'sd-rail__dot';
      const t = document.createElement('span'); t.className = 'sd-rail__t';
      t.textContent = (h ? h.textContent : s.id).trim().slice(0, 26);
      a.append(dot, t);
      rail.appendChild(a);
      return a;
    });
    document.body.appendChild(rail);

    secs.forEach((s, i) => ScrollTrigger.create({
      trigger: s, start: 'top 45%', end: 'bottom 45%',
      onToggle: self => links[i].classList.toggle('is-on', self.isActive)
    }));

    ScrollTrigger.create({
      trigger: document.body, start: 'top top-=280',
      onToggle: self => rail.classList.toggle('is-vis', self.isActive)
    });
  }

  /* ---------- reveals ---------- */
  function revealHeaders() {
    document.querySelectorAll('.eng-sec__head, .section__header').forEach(head => {
      const bits = head.querySelectorAll(
        '.eng-sec__t, .eng-sec__n, .eng-sec__sub, .section__title, .section__number, .section__line, h2');
      if (!bits.length) return;
      gsap.set(head, { visibility: 'visible' });
      gsap.from(bits, {
        yPercent: 35, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: head, start: 'top 86%', once: true }
      });
    });

    document.querySelectorAll('.eng-sec__intro, .story__lede').forEach(p => {
      gsap.set(p, { visibility: 'visible' });
      gsap.from(p, {
        y: 18, opacity: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 88%', once: true }
      });
    });
  }

  function revealBatches() {
    const batch = (sel, y) => {
      const els = [...document.querySelectorAll(sel)].filter(e => !e.closest('.sd-deck'));
      if (!els.length) return;
      gsap.set(els, { visibility: 'visible' });
      ScrollTrigger.batch(els, {
        start: 'top 90%',
        onEnter: b => gsap.from(b, {
          y, opacity: 0, duration: 0.6, ease: 'power2.out', stagger: 0.07, overwrite: true
        })
      });
    };
    batch('.eng-clause', 24);
    batch('.eng-layer', 16);
  }

  function revealEnd() {
    document.querySelectorAll('.eng-end, .connect').forEach(end => {
      const bits = end.querySelectorAll('h2, p, a.btn, .btn, .connect__email-cta');
      if (!bits.length) return;
      gsap.set(end, { visibility: 'visible' });
      gsap.from(bits, {
        y: 24, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: end, start: 'top 82%', once: true }
      });
    });
  }

  /* ---------- nav: hide going down, return coming up ---------- */
  function smartNav() {
    const nav = document.querySelector('.nav, header.nav, .site-nav');
    if (!nav) return;
    let last = 0;
    ScrollTrigger.create({
      start: 'top -160', end: 99999,
      onUpdate: self => {
        const y = self.scroll();
        if (Math.abs(y - last) < 10) return;
        gsap.to(nav, { yPercent: y > last ? -100 : 0, duration: 0.35, ease: 'power2.out', overwrite: true });
        last = y;
      },
      onLeaveBack: () => gsap.to(nav, { yPercent: 0, duration: 0.3, overwrite: true })
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
    const distance = () => Math.max(d.track.scrollWidth - d.deck.clientWidth, 1);

    gsap.to(d.track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: d.deck, pin: true, scrub: 0.6, anticipatePin: 1,
        start: 'top top', end: () => '+=' + distance(),
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

  function deckSwipe(d) {
    d.hint.textContent = 'swipe';
    d.deck.classList.add('is-swipe');
    d.cards[0].classList.add('is-current');
    let raf = 0;
    d.track.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const w = d.track.scrollWidth - d.track.clientWidth;
        const i = Math.round((w > 0 ? d.track.scrollLeft / w : 0) * (d.cards.length - 1));
        d.countEl.textContent = pad(i + 1);
        d.cards.forEach((c, n) => c.classList.toggle('is-current', n === i));
      });
    }, { passive: true });
  }

  /* ---------- go ---------- */
  function init() {
    buildChrome();

    if (reduced) {
      document.querySelectorAll('.gs-reveal, .eng-sec__head, .eng-sec__intro, .eng-end, .section__header')
        .forEach(el => { el.style.visibility = 'visible'; });
      return;
    }

    revealHeaders();
    revealBatches();
    revealEnd();
    smartNav();

    DECKS.forEach(cfg => {
      const d = buildDeck(cfg);
      if (!d) return;
      if (cfg.desktop === 'pin') {
        ScrollTrigger.matchMedia({ [DESKTOP]: () => deckPinned(d), [TOUCH]: () => deckSwipe(d) });
      } else {
        d.deck.classList.add('is-grid-desktop');
        ScrollTrigger.matchMedia({ [TOUCH]: () => deckSwipe(d) });
      }
    });

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    addEventListener('load', () => ScrollTrigger.refresh());
  }

  if (document.readyState === 'complete') requestAnimationFrame(init);
  else addEventListener('load', () => requestAnimationFrame(init));
})();
