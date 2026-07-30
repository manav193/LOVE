(() => {
  'use strict';

  if (window.LoveExperience) return;

  const STORAGE = {
    chapter: 'love:lastChapter',
    motion: 'love:reducedMotion',
    toolbar: 'love:toolbarCollapsed'
  };

  const state = {
    chapters: [],
    activeIndex: 0,
    deferredInstallPrompt: null,
    observer: null
  };

  const api = {
    goToChapter,
    nextChapter: () => goToChapter(Math.min(state.chapters.length - 1, state.activeIndex + 1)),
    previousChapter: () => goToChapter(Math.max(0, state.activeIndex - 1)),
    toggleReducedMotion,
    share: shareExperience,
    get activeChapter() { return state.chapters[state.activeIndex]?.id || null; }
  };

  document.addEventListener('DOMContentLoaded', init, { once: true });
  window.LoveExperience = api;

  function init() {
    state.chapters = [...document.querySelectorAll('main .chapter[id]')];
    if (!state.chapters.length) return;

    installSkipLink();
    installToolbar();
    installChapterLabels();
    installObserver();
    installKeyboardNavigation();
    installNetworkStatus();
    installImageFallbacks();
    restorePreferences();
    offerResume();
    registerServiceWorker();
    bindInstallPrompt();

    document.body.classList.add('love-experience-ready');
  }

  function installSkipLink() {
    if (document.querySelector('.love-skip-link')) return;
    const link = document.createElement('a');
    link.className = 'love-skip-link';
    link.href = `#${state.chapters[0].id}`;
    link.textContent = 'Skip to our story';
    document.body.prepend(link);
  }

  function installToolbar() {
    if (document.querySelector('[data-love-toolbar]')) return;

    const toolbar = document.createElement('aside');
    toolbar.className = 'love-toolbar';
    toolbar.dataset.loveToolbar = '';
    toolbar.setAttribute('aria-label', 'Story controls');
    toolbar.innerHTML = `
      <button class="love-toolbar__collapse" data-love-collapse aria-label="Collapse story controls" aria-expanded="true">⌄</button>
      <div class="love-toolbar__status">
        <span data-love-network>ONLINE</span>
        <strong data-love-chapter>CHAPTER 1</strong>
        <small data-love-progress>0%</small>
      </div>
      <div class="love-toolbar__actions">
        <button data-love-prev aria-label="Previous chapter">←</button>
        <select data-love-select aria-label="Jump to chapter"></select>
        <button data-love-next aria-label="Next chapter">→</button>
        <button data-love-motion aria-pressed="false" title="Reduce motion">MOTION</button>
        <button data-love-fullscreen title="Toggle fullscreen">FULL</button>
        <button data-love-share title="Share this experience">SHARE</button>
        <button data-love-install hidden title="Install this experience">INSTALL</button>
      </div>`;

    document.body.appendChild(toolbar);

    const select = toolbar.querySelector('[data-love-select]');
    state.chapters.forEach((chapter, index) => {
      const label = chapter.dataset.chapter || chapter.querySelector('h1,h2')?.textContent?.trim() || `Chapter ${index + 1}`;
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = `${String(index + 1).padStart(2, '0')} · ${label}`;
      select.appendChild(option);
    });

    toolbar.addEventListener('click', event => {
      if (event.target.closest('[data-love-prev]')) api.previousChapter();
      if (event.target.closest('[data-love-next]')) api.nextChapter();
      if (event.target.closest('[data-love-motion]')) toggleReducedMotion();
      if (event.target.closest('[data-love-fullscreen]')) toggleFullscreen();
      if (event.target.closest('[data-love-share]')) shareExperience();
      if (event.target.closest('[data-love-install]')) installExperience();
      if (event.target.closest('[data-love-collapse]')) toggleToolbar();
    });

    select.addEventListener('change', event => goToChapter(Number(event.target.value)));
  }

  function installChapterLabels() {
    state.chapters.forEach((chapter, index) => {
      chapter.dataset.loveChapterIndex = String(index);
      if (!chapter.hasAttribute('tabindex')) chapter.tabIndex = -1;
      if (!chapter.getAttribute('aria-label')) {
        const heading = chapter.querySelector('h1,h2')?.textContent?.trim();
        chapter.setAttribute('aria-label', heading || `Chapter ${index + 1}`);
      }
    });
  }

  function installObserver() {
    state.observer?.disconnect();
    state.observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = Number(visible.target.dataset.loveChapterIndex || 0);
      setActiveChapter(index);
    }, { threshold: [0.35, 0.55, 0.75] });

    state.chapters.forEach(chapter => state.observer.observe(chapter));
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    updateReadingProgress();
  }

  function installKeyboardNavigation() {
    document.addEventListener('keydown', event => {
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'j' || event.key === 'J' || event.key === 'PageDown') {
        event.preventDefault();
        api.nextChapter();
      }
      if (event.key === 'k' || event.key === 'K' || event.key === 'PageUp') {
        event.preventDefault();
        api.previousChapter();
      }
      if (event.key === 'Home') {
        event.preventDefault();
        goToChapter(0);
      }
      if (event.key === 'End') {
        event.preventDefault();
        goToChapter(state.chapters.length - 1);
      }
      if (event.key === 'Escape' && document.fullscreenElement) document.exitFullscreen?.();
    });
  }

  function installNetworkStatus() {
    const update = () => {
      const online = navigator.onLine;
      document.body.classList.toggle('love-offline', !online);
      const node = document.querySelector('[data-love-network]');
      if (node) node.textContent = online ? 'ONLINE' : 'OFFLINE';
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }

  function installImageFallbacks() {
    document.addEventListener('error', event => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || image.dataset.loveFallbackApplied) return;
      image.dataset.loveFallbackApplied = 'true';
      image.alt = image.alt || 'Memory image unavailable';
      image.classList.add('love-image-fallback');
      image.removeAttribute('srcset');
      image.src = createFallbackDataUri(image.alt);
    }, true);
  }

  function restorePreferences() {
    const reduced = localStorage.getItem(STORAGE.motion) === 'true';
    document.documentElement.classList.toggle('love-reduce-motion', reduced);
    const motionButton = document.querySelector('[data-love-motion]');
    motionButton?.setAttribute('aria-pressed', String(reduced));
    if (motionButton) motionButton.textContent = reduced ? 'MOTION OFF' : 'MOTION';

    const collapsed = localStorage.getItem(STORAGE.toolbar) === 'true';
    document.querySelector('[data-love-toolbar]')?.classList.toggle('is-collapsed', collapsed);
    syncCollapseButton(collapsed);
  }

  function offerResume() {
    const savedId = sessionStorage.getItem(STORAGE.chapter) || localStorage.getItem(STORAGE.chapter);
    const index = state.chapters.findIndex(chapter => chapter.id === savedId);
    if (index <= 0) return;

    const prompt = document.createElement('div');
    prompt.className = 'love-resume';
    prompt.setAttribute('role', 'status');
    prompt.innerHTML = `<span>Continue from chapter ${index + 1}?</span><div><button data-love-resume>RESUME</button><button data-love-resume-dismiss>START OVER</button></div>`;
    document.body.appendChild(prompt);

    prompt.addEventListener('click', event => {
      if (event.target.closest('[data-love-resume]')) goToChapter(index, true);
      if (event.target.closest('[data-love-resume-dismiss]')) goToChapter(0, true);
      prompt.remove();
    });

    setTimeout(() => prompt.classList.add('is-visible'), 80);
    setTimeout(() => prompt.remove(), 12000);
  }

  function setActiveChapter(index) {
    if (!Number.isFinite(index) || !state.chapters[index]) return;
    state.activeIndex = index;
    const chapter = state.chapters[index];
    sessionStorage.setItem(STORAGE.chapter, chapter.id);
    localStorage.setItem(STORAGE.chapter, chapter.id);

    const title = document.querySelector('[data-love-chapter]');
    const select = document.querySelector('[data-love-select]');
    const prev = document.querySelector('[data-love-prev]');
    const next = document.querySelector('[data-love-next]');
    if (title) title.textContent = `CHAPTER ${index + 1} / ${state.chapters.length}`;
    if (select) select.value = String(index);
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === state.chapters.length - 1;

    state.chapters.forEach((item, itemIndex) => item.classList.toggle('love-chapter-active', itemIndex === index));
  }

  function updateReadingProgress() {
    const root = document.documentElement;
    const total = Math.max(1, root.scrollHeight - window.innerHeight);
    const value = Math.max(0, Math.min(100, Math.round((window.scrollY / total) * 100)));
    root.style.setProperty('--love-reading-progress', `${value}%`);
    const label = document.querySelector('[data-love-progress]');
    if (label) label.textContent = `${value}%`;
  }

  function goToChapter(index, focus = false) {
    const chapter = state.chapters[index];
    if (!chapter) return false;
    chapter.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    if (focus) setTimeout(() => chapter.focus({ preventScroll: true }), prefersReducedMotion() ? 0 : 500);
    setActiveChapter(index);
    return true;
  }

  function toggleReducedMotion() {
    const next = !document.documentElement.classList.contains('love-reduce-motion');
    document.documentElement.classList.toggle('love-reduce-motion', next);
    localStorage.setItem(STORAGE.motion, String(next));
    const button = document.querySelector('[data-love-motion]');
    button?.setAttribute('aria-pressed', String(next));
    if (button) button.textContent = next ? 'MOTION OFF' : 'MOTION';
  }

  function toggleToolbar() {
    const toolbar = document.querySelector('[data-love-toolbar]');
    if (!toolbar) return;
    const collapsed = toolbar.classList.toggle('is-collapsed');
    localStorage.setItem(STORAGE.toolbar, String(collapsed));
    syncCollapseButton(collapsed);
  }

  function syncCollapseButton(collapsed) {
    const button = document.querySelector('[data-love-collapse]');
    if (!button) return;
    button.setAttribute('aria-expanded', String(!collapsed));
    button.setAttribute('aria-label', collapsed ? 'Expand story controls' : 'Collapse story controls');
    button.textContent = collapsed ? '⌃' : '⌄';
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen?.();
      else await document.documentElement.requestFullscreen?.();
    } catch (error) {
      console.warn('Fullscreen unavailable', error);
    }
  }

  async function shareExperience() {
    const data = {
      title: document.title,
      text: 'A private cinematic memory journey.',
      url: location.href.split('#')[0]
    };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(data.url);
        showToast('LINK COPIED');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') showToast('SHARE UNAVAILABLE');
    }
  }

  function bindInstallPrompt() {
    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      state.deferredInstallPrompt = event;
      const button = document.querySelector('[data-love-install]');
      if (button) button.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      state.deferredInstallPrompt = null;
      const button = document.querySelector('[data-love-install]');
      if (button) button.hidden = true;
      showToast('EXPERIENCE INSTALLED');
    });
  }

  async function installExperience() {
    if (!state.deferredInstallPrompt) return;
    state.deferredInstallPrompt.prompt();
    await state.deferredInstallPrompt.userChoice;
    state.deferredInstallPrompt = null;
    const button = document.querySelector('[data-love-install]');
    if (button) button.hidden = true;
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(error => console.warn('Service worker registration failed', error)), { once: true });
  }

  function showToast(message) {
    let toast = document.querySelector('[data-love-toast]');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'love-toast';
      toast.dataset.loveToast = '';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
  }

  function prefersReducedMotion() {
    return document.documentElement.classList.contains('love-reduce-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function createFallbackDataUri(label) {
    const safe = String(label || 'Memory').replace(/[<>&"']/g, '').slice(0, 32);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#12090b"/><stop offset="1" stop-color="#4b1725"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><path d="M400 430C230 330 220 190 315 165c45-12 76 12 85 44 9-32 40-56 85-44 95 25 85 165-85 265Z" fill="none" stroke="#d4af37" stroke-width="8" opacity=".8"/><text x="400" y="510" fill="#f7e8d9" text-anchor="middle" font-family="serif" font-size="28">${safe}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }
})();