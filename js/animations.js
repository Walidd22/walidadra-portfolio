/* ========================================
   ANIMATIONS — GSAP ScrollTrigger
   ======================================== */

function initAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  // ---- HERO ----
  function animateHero() {
    const tl = gsap.timeline({ delay: 0.2 });

    // Label
    const heroLabel = document.querySelector('.hero__label');
    if (heroLabel) {
      heroLabel.style.visibility = 'visible';
      tl.from(heroLabel, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    }

    // Name — character stagger
    const heroName = document.querySelector('.hero__name');
    if (heroName) {
      heroName.style.visibility = 'visible';
      const chars = splitText(heroName, 'chars');
      tl.from(chars, {
        y: '110%',
        rotateZ: 8,
        opacity: 0,
        duration: 1,
        ease: 'power4.out',
        stagger: 0.03
      }, '-=0.4');

      // Re-set data-text for glitch effect
      heroName.setAttribute('data-text', heroName.getAttribute('aria-label'));
    }

    // Divider
    const heroDivider = document.querySelector('.hero__divider');
    if (heroDivider) {
      heroDivider.style.visibility = 'visible';
      tl.from(heroDivider, {
        scaleX: 0,
        duration: 1,
        ease: 'power3.inOut'
      }, '-=0.6');
    }

    // Info
    const heroInfo = document.querySelector('.hero__info');
    if (heroInfo) {
      heroInfo.style.visibility = 'visible';
      tl.from(heroInfo.children, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15
      }, '-=0.5');
    }

    // Scroll indicator
    const heroScroll = document.querySelector('.hero__scroll');
    if (heroScroll) {
      heroScroll.style.visibility = 'visible';
      tl.from(heroScroll, {
        opacity: 0,
        y: -10,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.2');
    }
  }

  // ---- SECTION HEADERS ----
  function animateSectionHeaders() {
    document.querySelectorAll('.section__header.gs-reveal').forEach(header => {
      header.style.visibility = 'visible';

      const line = header.querySelector('.section__line');

      gsap.from(header.children, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });

      if (line) {
        gsap.from(line, {
          scaleX: 0,
          duration: 1.2,
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        });
      }
    });
  }

  // ---- ABOUT ----
  function animateAbout() {
    const photoWrap = document.querySelector('.about__photo-wrap.gs-reveal');
    if (photoWrap) {
      photoWrap.style.visibility = 'visible';

      // Parallax on photo
      gsap.to(photoWrap, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: photoWrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });

      // Entry animation
      gsap.from(photoWrap, {
        x: -60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: photoWrap,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }

    // Text paragraphs
    document.querySelectorAll('.about__text .gs-reveal').forEach(el => {
      el.style.visibility = 'visible';
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Stats counter
    const statsWrap = document.querySelector('.about__stats');
    if (statsWrap) {
      statsWrap.style.visibility = 'visible';

      const statItems = statsWrap.querySelectorAll('.stat');
      gsap.from(statItems, {
        y: 30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: statsWrap,
          start: 'top 90%',
          toggleActions: 'play none none none',
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
        y: 60, opacity: 0, duration: 1, ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none none' }
      });
    });
  }

  // ---- EXPERIENCE TIMELINE ----
  function animateExperience() {
    const items = document.querySelectorAll('.timeline__item.gs-reveal');

    items.forEach((item, index) => {
      item.style.visibility = 'visible';

      const isOdd = index % 2 === 0;
      const xStart = window.innerWidth >= 900 ? (isOdd ? -80 : 80) : -50;

      gsap.from(item, {
        x: xStart,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      });

      // Animate the dot
      const dot = item.querySelector('.timeline__dot');
      if (dot) {
        gsap.from(dot, {
          scale: 0,
          duration: 0.5,
          ease: 'back.out(2)',
          scrollTrigger: {
            trigger: item,
            start: 'top 82%',
            toggleActions: 'play none none none'
          }
        });
      }
    });
  }

  // ---- SKILLS MARQUEE ----
  function animateMarquee() {
    document.querySelectorAll('.marquee').forEach(marquee => {
      const track = marquee.querySelector('.marquee__track');
      const direction = marquee.getAttribute('data-direction');
      const items = track.querySelectorAll('.marquee__item, .marquee__separator');

      // Calculate total width of one set of items (half the track)
      const totalItems = items.length / 2;
      let oneSetWidth = 0;
      for (let i = 0; i < totalItems; i++) {
        oneSetWidth += items[i].offsetWidth + 40; // 40px = gap approximation
      }

      const startX = direction === 'right' ? -oneSetWidth : 0;
      const endX = direction === 'right' ? 0 : -oneSetWidth;

      gsap.set(track, { x: startX });

      gsap.to(track, {
        x: endX,
        duration: 30,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: gsap.utils.unitize(x => {
            return parseFloat(x) % oneSetWidth;
          })
        }
      });
    });
  }

  // ---- SKILLS GRID ----
  function animateSkillsGrid() {
    const grid = document.querySelector('.skills__grid.gs-reveal');
    if (grid) {
      grid.style.visibility = 'visible';
      const cells = grid.querySelectorAll('.skills__cell');

      gsap.from(cells, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: {
          amount: 0.8,
          grid: 'auto',
          from: 'start'
        },
        scrollTrigger: {
          trigger: grid,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }
  }

  // ---- CONTACT ----
  function animateContact() {
    // Heading word reveal
    const heading = document.querySelector('.contact__heading.gs-reveal');
    if (heading) {
      heading.style.visibility = 'visible';
      const words = splitText(heading, 'words');

      gsap.from(words, {
        y: '110%',
        rotateZ: 5,
        duration: 0.9,
        ease: 'power4.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: heading,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }

    // Info and socials fade up
    document.querySelectorAll('.contact__info.gs-reveal, .contact__socials.gs-reveal').forEach(el => {
      el.style.visibility = 'visible';
      gsap.from(el, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // ---- DIVIDERS ----
  function animateDividers() {
    document.querySelectorAll('.divider').forEach(div => {
      gsap.from(div, {
        scaleX: 0,
        duration: 1.2,
        ease: 'power3.inOut',
        scrollTrigger: {
          trigger: div,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      });
    });
  }

  // ---- INIT ALL ----
  animateHero();
  animateSectionHeaders();
  animateAbout();
  animateProjects();
  animateExperience();
  animateMarquee();
  animateSkillsGrid();
  animateContact();
  animateDividers();
}
