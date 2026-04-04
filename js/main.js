/* ========================================
   MAIN — Entry Point & Orchestration
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = prefersReducedMotion();

  // ---- PAGE LOADER ----
  const loader = document.getElementById('pageLoader');

  function hideLoader() {
    if (loader) {
      loader.style.transition = 'opacity 0.6s ease, visibility 0.6s ease';
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
      setTimeout(() => loader.remove(), 600);
    }
  }

  // ---- LENIS SMOOTH SCROLL ----
  let lenis = null;

  if (!reducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5
    });

    // Connect Lenis to GSAP
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Handle anchor links with Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: -60 });
          // Close mobile menu if open
          closeMobileMenu();
        }
      });
    });
  } else {
    // Fallback: basic smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          closeMobileMenu();
        }
      });
    });
  }

  // ---- NAV SCROLL EFFECT ----
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function handleNavScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 80) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ---- MOBILE MENU ----
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');

  function closeMobileMenu() {
    navToggle.classList.remove('is-open');
    navMobile.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('is-open');
    navMobile.classList.toggle('is-open');

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = '';
      if (lenis) lenis.start();
    }
  });

  // Close on mobile link click
  navMobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // ---- INIT ANIMATIONS ----
  if (!reducedMotion) {
    // Wait a moment then start everything
    window.addEventListener('load', () => {
      setTimeout(() => {
        hideLoader();
        setTimeout(() => {
          initAnimations();
        }, 100);
      }, 800);
    });
  } else {
    // No animations — just show content immediately
    document.querySelectorAll('.gs-reveal').forEach(el => {
      el.style.visibility = 'visible';
    });
    hideLoader();

    // Still set counter values
    document.querySelectorAll('.stat__number[data-count]').forEach(stat => {
      stat.textContent = stat.getAttribute('data-count') + '+';
    });
  }

  // ---- ACTIVE NAV LINK HIGHLIGHT ----
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  function highlightNav() {
    const scrollY = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + id) {
            link.style.color = 'var(--white)';
          }
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
});
