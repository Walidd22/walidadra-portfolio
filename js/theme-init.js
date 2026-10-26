/* Runs in <head>, before the first paint. Dark is the default for every
   visitor; only someone who picked light with the toggle gets light, and
   applying it here (rather than in main.js at the end of the page) means
   they never see a flash of dark first. A file, not an inline script, so
   it passes a script-src 'self' content security policy. */
try {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
} catch (e) { /* storage blocked: stay dark */ }
