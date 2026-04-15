/* ========================================
   ANIMATIONS — GSAP ScrollTrigger
   ======================================== */

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // ---- HERO ----
  function animateHero() {
    const tl = gsap.timeline({ delay: 0.2 });

    const heroLabel = document.querySelector('.hero__label');
    if (heroLabel) {
      heroLabel.style.visibility = 'visible';
      tl.from(heroLabel, { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' });
    }

    const heroName = document.querySelector('.hero__name');
    if (heroName) {
      heroName.style.visibility = 'visible';
      const chars = splitText(heroName, 'chars');
      tl.from(chars, {
        y: '110%', rotateZ: 8, opacity: 0, duration: 1,
        ease: 'power4.out', stagger: 0.03
      }, '-=0.4');
      heroName.setAttribute('data-text', heroName.getAttribute('aria-label'));
    }

    const heroDivider = document.querySelector('.hero__divider');
    if (heroDivider) {
      heroDivider.style.visibility = 'visible';
      tl.from(heroDivider, { scaleX: 0, duration: 1, ease: 'power3.inOut' }, '-=0.6');
    }

    const heroInfo = document.querySelector('.hero__info');
    if (heroInfo) {
      heroInfo.style.visibility = 'visible';
      tl.from(heroInfo.children, {
        y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15
      }, '-=0.5');
    }

    const heroScroll = document.querySelector('.hero__scroll');
    if (heroScroll) {
      heroScroll.style.visibility = 'visible';
      tl.from(heroScroll, { opacity: 0, y: -10, duration: 0.6, ease: 'power2.out' }, '-=0.2');
    }
  }

  // Mobile-only: scroll through the hero morphs the tech-stack graph into a W,
  // then fades it out. Desktop keeps the DNA helix untouched.
  function animateHeroGraphMorph() {
    if (!window.matchMedia('(max-width: 899px)').matches) return;
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;
    ScrollTrigger.create({
      trigger: heroEl,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.3,
      onUpdate: (self) => {
        const g = window.__heroGraph;
        if (g && g.setMorphProgress) g.setMorphProgress(self.progress);
      },
    });
  }

  // ---- SECTION HEADERS ----
  function animateSectionHeaders() {
    document.querySelectorAll('.section__header.gs-reveal').forEach(header => {
      header.style.visibility = 'visible';
      const line = header.querySelector('.section__line');
      gsap.from(header.children, {
        y: 20, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' }
      });
      if (line) {
        gsap.from(line, {
          scaleX: 0, duration: 1.2, ease: 'power3.inOut',
          scrollTrigger: { trigger: header, start: 'top 85%', toggleActions: 'play none none none' }
        });
      }
    });
  }

  // ---- ABOUT ----
  function animateAbout() {
    const photoWrap = document.querySelector('.about__photo-wrap.gs-reveal');
    if (photoWrap) {
      photoWrap.style.visibility = 'visible';
      gsap.to(photoWrap, {
        y: -40, ease: 'none',
        scrollTrigger: { trigger: photoWrap, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
      gsap.from(photoWrap, {
        x: -60, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: photoWrap, start: 'top 80%', toggleActions: 'play none none none' }
      });
    }
    document.querySelectorAll('.about__text .gs-reveal').forEach(el => {
      el.style.visibility = 'visible';
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });
    const statsWrap = document.querySelector('.about__stats');
    if (statsWrap) {
      statsWrap.style.visibility = 'visible';
      const statItems = statsWrap.querySelectorAll('.stat');
      gsap.from(statItems, {
        y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15,
        scrollTrigger: {
          trigger: statsWrap, start: 'top 90%', toggleActions: 'play none none none',
          onEnter: () => {
            document.querySelectorAll('.stat__number[data-count]').forEach(stat => {
              const target = parseInt(stat.getAttribute('data-count'));
              animateCounter(stat, target, 1800);
            });
          }
        }
      });
    }
  }

  // ---- PROJECTS ----
  function animateProjects() {
    document.querySelectorAll('.project-card.gs-reveal').forEach((card, i) => {
      card.style.visibility = 'visible';
      gsap.from(card, {
        y: 60, opacity: 0, duration: 1, ease: 'power3.out', delay: i * 0.12,
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });

    // Mobile: scroll-triggered hover
    if (window.matchMedia('(hover: none)').matches) {
      document.querySelectorAll('.project-card').forEach(card => {
        ScrollTrigger.create({
          trigger: card, start: 'top 70%', end: 'bottom 30%',
          onEnter: () => card.classList.add('is-active'),
          onLeave: () => card.classList.remove('is-active'),
          onEnterBack: () => card.classList.add('is-active'),
          onLeaveBack: () => card.classList.remove('is-active'),
        });
      });
    }
  }

  // ---- COURSES ----
  function animateCourses() {
    document.querySelectorAll('.course-card.gs-reveal').forEach((card, i) => {
      card.style.visibility = 'visible';
      gsap.from(card, {
        y: 50, opacity: 0, duration: 0.8, ease: 'power3.out',
        delay: i * 0.1,
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });
  }

  // ---- TUTORIALS ----
  function animateTutorials() {
    const list = document.querySelector('.tutorials__list.gs-reveal');
    if (list) {
      list.style.visibility = 'visible';
      const cards = list.querySelectorAll('.tutorial-card');
      gsap.from(cards, {
        y: 25, opacity: 0, duration: 0.6, ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: list, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }
  }

  // ---- YOUTUBE ----
  function animateYoutube() {
    const grid = document.querySelector('.youtube__grid.gs-reveal');
    if (grid) {
      grid.style.visibility = 'visible';
      const cards = grid.querySelectorAll('.video-card');
      gsap.from(cards, {
        y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: grid, start: 'top 85%', toggleActions: 'play none none none' }
      });
    }
    const cta = document.querySelector('.youtube__cta.gs-reveal');
    if (cta) {
      cta.style.visibility = 'visible';
      gsap.from(cta, {
        y: 20, opacity: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: cta, start: 'top 90%', toggleActions: 'play none none none' }
      });
    }
  }

  // ---- CONNECT ----
  function animateConnect() {
    const heading = document.querySelector('.connect__heading.gs-reveal');
    if (heading) {
      heading.style.visibility = 'visible';
      const words = splitText(heading, 'words');
      gsap.from(words, {
        y: '110%', rotateZ: 5, duration: 0.9, ease: 'power4.out', stagger: 0.08,
        scrollTrigger: { trigger: heading, start: 'top 80%', toggleActions: 'play none none none' }
      });
    }
    document.querySelectorAll('.connect__email-cta.gs-reveal, .connect__socials.gs-reveal').forEach(el => {
      el.style.visibility = 'visible';
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
      });
    });
  }

  // ---- DIVIDERS ----
  function animateDividers() {
    document.querySelectorAll('.divider').forEach(div => {
      gsap.from(div, {
        scaleX: 0, duration: 1.2, ease: 'power3.inOut',
        scrollTrigger: { trigger: div, start: 'top 90%', toggleActions: 'play none none none' }
      });
    });
  }

  // ---- INIT ALL ----
  animateHero();
  animateHeroGraphMorph();
  animateSectionHeaders();
  animateAbout();
  animateProjects();
  animateCourses();
  animateTutorials();
  animateYoutube();
  animateConnect();
  animateDividers();

  // Generic catch-all for any gs-reveal not handled above (e.g. case study pages)
  document.querySelectorAll('.gs-reveal').forEach(el => {
    if (el.style.visibility === 'visible') return;
    el.style.visibility = 'visible';
    gsap.from(el, {
      y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
    });
  });
}
