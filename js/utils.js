/* ========================================
   UTILS — Helper Functions
   ======================================== */

/**
 * Split text into individually wrapped characters or words
 * Preserves accessibility via aria-label on parent
 */
function splitText(element, type = 'chars') {
  const text = element.textContent.trim();
  element.setAttribute('aria-label', text);
  element.innerHTML = '';

  if (type === 'chars') {
    [...text].forEach(char => {
      const span = document.createElement('span');
      span.className = 'char';
      span.setAttribute('aria-hidden', 'true');
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
        span.style.width = '0.3em';
      } else {
        span.textContent = char;
      }
      span.style.display = 'inline-block';
      element.appendChild(span);
    });
    return element.querySelectorAll('.char');
  }

  if (type === 'words') {
    const words = text.split(/\s+/);
    words.forEach((word, i) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'word';
      wrapper.style.display = 'inline-block';
      wrapper.style.overflow = 'hidden';
      wrapper.style.verticalAlign = 'top';

      const inner = document.createElement('span');
      inner.className = 'word-inner';
      inner.style.display = 'inline-block';
      inner.textContent = word;
      inner.setAttribute('aria-hidden', 'true');

      wrapper.appendChild(inner);
      element.appendChild(wrapper);

      if (i < words.length - 1) {
        element.appendChild(document.createTextNode(' '));
      }
    });
    return element.querySelectorAll('.word-inner');
  }

  if (type === 'lines') {
    element.textContent = text;
    return [element];
  }
}

/**
 * Linear interpolation
 */
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Debounce function
 */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Check for reduced motion preference
 */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Animate counter from 0 to target
 */
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const current = Math.round(start + (target - start) * eased);
    element.textContent = current + '+';

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}
