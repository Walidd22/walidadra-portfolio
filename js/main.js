/* ========================================
   MAIN — Entry Point & Orchestration
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  const reducedMotion = prefersReducedMotion();

  // ---- THEME TOGGLE ----
  (function initTheme() {
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!toggle) return;

    // Check saved preference or system preference
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || (!saved && window.matchMedia('(prefers-color-scheme: light)').matches)) {
      document.documentElement.setAttribute('data-theme', 'light');
      if (icon) icon.textContent = '☀';
    }

    toggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (isLight) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'dark');
        if (icon) icon.textContent = '☽';
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        if (icon) icon.textContent = '☀';
      }
    });
  })();

  // ---- FLOATING ICONS ----
  (function initFloatingIcons() {
    const container = document.getElementById('floatingIcons');
    if (!container || reducedMotion) return;

    const icons = ['</>', '{ }', 'λ', '⚡', '◈', '▲', '$_', '~/','fn', '::',  '[ ]', '0x', '>>'];
    const count = 15;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'floating-icon';
      el.textContent = icons[i % icons.length];
      el.style.left = Math.random() * 90 + 5 + '%';
      el.style.top = Math.random() * 80 + 10 + '%';
      el.style.animationDelay = (Math.random() * 12) + 's';
      el.style.animationDuration = (10 + Math.random() * 8) + 's';
      container.appendChild(el);
    }
  })();

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

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: -60 });
          closeMobileMenu();
        }
      });
    });
  } else {
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

  function handleNavScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 80) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ---- MOBILE MENU ----
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');

  function closeMobileMenu() {
    if (!navToggle || !navMobile) return;
    navToggle.classList.remove('is-open');
    navMobile.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  if (navToggle) {
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
  }

  if (navMobile) {
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });
  }

  // ---- INIT ANIMATIONS ----
  if (!reducedMotion) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        hideLoader();
        setTimeout(() => {
          initAnimations();
        }, 100);
      }, 800);
    });
  } else {
    document.querySelectorAll('.gs-reveal').forEach(el => {
      el.style.visibility = 'visible';
    });
    hideLoader();

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
