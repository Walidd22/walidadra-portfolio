/* ========================================
   MAIN — Entry Point & Orchestration
   ======================================== */

// Read UTM parameters from the URL so email capture can attribute later campaigns.
function readUtmParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    for (const key of ['source', 'medium', 'campaign']) {
      const v = params.get('utm_' + key);
      if (v) utm[key] = v;
    }
    return Object.keys(utm).length ? utm : undefined;
  } catch {
    return undefined;
  }
}

// Shared POST helper — every subscribe form on any page in this site uses it.
const SUBSCRIBE_ENDPOINT = 'https://api.walidadra.dev/api/subscribe';
async function postSubscribe(payload) {
  const res = await fetch(SUBSCRIBE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, utm: readUtmParams() }),
  });
  const data = await res.json().catch(() => ({ ok: false }));
  if (!res.ok || !data.ok) {
    const err = new Error(data.reason || 'Request failed');
    err.reason = data.reason;
    throw err;
  }
  return data;
}

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

    document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href=""])').forEach(anchor => {
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
    document.querySelectorAll('a[href^="#"]:not([href="#"]):not([href=""])').forEach(anchor => {
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

  // ---- HERO GLITCH ON SCROLL/TOUCH ----
  const heroName = document.querySelector('.hero__name');
  if (heroName) {
    let glitchTimeout = null;
    function triggerGlitch() {
      if (window.scrollY > window.innerHeight) return;
      if (glitchTimeout) return;
      heroName.classList.add('is-glitching');
      glitchTimeout = setTimeout(() => {
        heroName.classList.remove('is-glitching');
        glitchTimeout = null;
      }, 600);
    }
    window.addEventListener('scroll', triggerGlitch, { passive: true });
    window.addEventListener('touchmove', triggerGlitch, { passive: true });
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

  // ---- SUBSCRIPTION HANDLER ----
  const subscribeForm = document.getElementById('subscribeForm');
  const subscribeSuccess = document.getElementById('subscribeSuccess');
  const subscribeError = document.getElementById('subscribeError');
  const courseInterest = document.getElementById('courseInterest');

  function showToast(message, type) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast--' + (type || 'info');
    toast.textContent = message;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Check if already subscribed
  if (localStorage.getItem('wa_subscribed') === 'true' && subscribeForm && subscribeSuccess) {
    subscribeForm.style.display = 'none';
    subscribeSuccess.style.display = 'flex';
  }

  if (subscribeForm) {
    subscribeForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = subscribeForm.querySelector('input[name="email"]');
      const email = emailInput.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
      }

      const submitBtn = subscribeForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        const interest = courseInterest ? courseInterest.value.trim() : '';
        await postSubscribe({
          email,
          source: interest ? 'portfolio-course-interest' : 'portfolio',
          interest: interest || undefined,
        });

        localStorage.setItem('wa_subscribed', 'true');
        subscribeForm.style.display = 'none';
        subscribeSuccess.style.display = 'flex';
        if (subscribeError) subscribeError.style.display = 'none';
        showToast('Subscribed! Welcome aboard.', 'success');
      } catch (err) {
        if (subscribeError) subscribeError.style.display = 'flex';
        showToast('Failed to subscribe. Please try again.', 'error');
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Generic handler — any <form data-subscribe-source="..."> with an email input.
  // Used by the case-study page CTA and any future lightweight signup forms.
  document.querySelectorAll('form[data-subscribe-source]').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const source = form.getAttribute('data-subscribe-source') || 'portfolio';
      const emailInput = form.querySelector('input[type="email"], input[name="email"]');
      if (!emailInput) return;
      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('Please enter a valid email address.', 'error');
        emailInput.focus();
        return;
      }
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
      }
      try {
        await postSubscribe({ email, source });
        form.reset();
        showToast('Subscribed! Check your inbox.', 'success');
      } catch (err) {
        showToast('Failed to subscribe. Please try again.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  });

  // "Notify Me" button clicks on course cards
  document.querySelectorAll('.course-card__cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const card = btn.closest('.course-card');
      const courseName = card ? card.querySelector('.course-card__title').textContent : '';

      if (courseInterest) courseInterest.value = courseName;

      if (localStorage.getItem('wa_subscribed') === 'true') {
        showToast('You\'re already subscribed! We\'ll notify you about "' + courseName + '".', 'success');
        return;
      }

      showToast('Interested in "' + courseName + '"? Subscribe below!', 'info');

      const connectSection = document.querySelector('#connect');
      if (connectSection) {
        if (lenis) {
          lenis.scrollTo(connectSection, { offset: -60 });
        } else {
          connectSection.scrollIntoView({ behavior: 'smooth' });
        }
      }

      setTimeout(() => {
        const emailInput = subscribeForm ? subscribeForm.querySelector('input[name="email"]') : null;
        if (emailInput) emailInput.focus();
      }, 800);
    });
  });
});
