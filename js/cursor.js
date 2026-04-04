/* ========================================
   CURSOR — Custom Cursor Effect
   ======================================== */

(function () {
  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  let mouseX = -100;
  let mouseY = -100;
  let cursorX = -100;
  let cursorY = -100;
  let isVisible = false;

  // Track mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      cursor.classList.remove('is-hidden');
    }
  });

  // Hide when mouse leaves window
  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursor.classList.add('is-hidden');
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursor.classList.remove('is-hidden');
  });

  // Expand on interactive elements
  const interactiveSelectors = 'a, button, [data-cursor="expand"], input, textarea';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.add('is-active');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelectors)) {
      cursor.classList.remove('is-active');
    }
  });

  // Smooth follow with lerp
  function render() {
    cursorX = lerp(cursorX, mouseX, 0.15);
    cursorY = lerp(cursorY, mouseY, 0.15);
    cursor.style.transform = `translate(${cursorX - 8}px, ${cursorY - 8}px)`;
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
