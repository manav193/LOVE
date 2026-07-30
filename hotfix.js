"use strict";

(() => {
  if (window.__LOVE_RUNTIME_LOADER__) return;
  window.__LOVE_RUNTIME_LOADER__ = true;

  const LEGACY_HOTFIX = 'https://cdn.jsdelivr.net/gh/manav193/LOVE@2aa458b4c2bf0f71fce9badfa3c76df5a4fbab90/hotfix.js';

  function loadScript(src, marker) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-love-runtime="${marker}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.dataset.loveRuntime = marker;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadStylesheet(href, marker) {
    if (document.querySelector(`link[data-love-runtime="${marker}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.loveRuntime = marker;
    document.head.appendChild(link);
  }

  function installIntroGuard() {
    if (document.getElementById('love-runtime-intro-guard')) return;
    const style = document.createElement('style');
    style.id = 'love-runtime-intro-guard';
    style.textContent = `
      #vault-intro[aria-hidden="false"] ~ .love-toolbar,
      #vault-intro[aria-hidden="false"] ~ .love-resume {
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  installIntroGuard();
  loadStylesheet('./love-experience.css', 'experience-css');

  loadScript(LEGACY_HOTFIX, 'legacy-hotfix')
    .catch(error => console.warn('Pinned legacy hotfix unavailable; continuing with current experience layer.', error))
    .finally(() => Promise.all([
      loadScript('./love-countdown-fix.js', 'countdown-fix'),
      loadScript('./love-experience.js', 'experience-js')
    ]))
    .catch(error => console.error('Love runtime enhancement failed to load.', error));
})();