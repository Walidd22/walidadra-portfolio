/* ========================================
   CURSOR — Custom Cursor Effect

   One state machine, driven by what is actually under the pointer.

   The old version derived its state from mouseover/mouseout alone. Those do
   not fire when the page scrolls beneath a stationary pointer, so scrolling
   off a link left the cursor stuck in its expanded state until you happened
   to move the mouse. Re-testing the point on scroll is what fixes that, so
   every state below is resolved from a single hit test.
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
  let isDown = false;
  let needsSync = false;

  const INTERACTIVE = 'a, button, summary, label, [role="button"], [data-cursor="expand"], input, textarea, select';
  const TEXT_FIELD = 'input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]), textarea';
  const GRABBABLE = '.hero__graph';

  // Resolve every state from the element under the pointer. Cheap enough at one
  // hit test per frame, and it cannot go stale the way an event pair can.
  function syncState() {
    if (!isVisible) return;
    const el = document.elementFromPoint(mouseX, mouseY);
    const grabbable = !!(el && el.closest(GRABBABLE));
    const text = !!(el && el.closest(TEXT_FIELD));

    cursor.classList.toggle('is-text', text);
    cursor.classList.toggle('is-grab', grabbable && !isDown);
    cursor.classList.toggle('is-grabbing', grabbable && isDown);
    // the expand state is for interactive chrome, not for the graph or a field
    cursor.classList.toggle('is-active', !!(el && el.closest(INTERACTIVE)) && !grabbable && !text);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      cursor.classList.remove('is-hidden');
    }
    needsSync = true;
  });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursor.classList.add('is-hidden');
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursor.classList.remove('is-hidden');
  });

  document.addEventListener('mousedown', () => { isDown = true; needsSync = true; });
  document.addEventListener('mouseup', () => { isDown = false; needsSync = true; });

  // The reason this exists: content moving under a still pointer.
  window.addEventListener('scroll', () => { needsSync = true; }, { passive: true });

  // Smooth follow with lerp
  function render() {
    if (needsSync) {
      needsSync = false;
      syncState();
    }
    cursorX = lerp(cursorX, mouseX, 0.15);
    cursorY = lerp(cursorY, mouseY, 0.15);
    cursor.style.transform = `translate(${cursorX - 8}px, ${cursorY - 8}px)`;
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
})();
