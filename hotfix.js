"use strict";

/**
 * Runtime stability layer.
 * Fixes duplicate unlock IDs before the main app initializes and owns a
 * deterministic love-letter controller so stale observers/timers cannot race.
 */
(() => {
    const qs = (selector, root = document) => root.querySelector(selector);
    const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

    // Must run synchronously: script.js registers its DOMContentLoaded callback
    // before this file, so the DOM must be normalized before that callback runs.
    function normalizeUnlockIds() {
        const duplicateUnlocks = qsa('#luxury-unlock-sequence');
        if (duplicateUnlocks.length > 1) {
            duplicateUnlocks[0].id = 'vault-unlock-sequence';
            duplicateUnlocks[duplicateUnlocks.length - 1].id = 'luxury-unlock-sequence';
        }
    }

    normalizeUnlockIds();

    function injectStyles() {
        if (qs('#runtime-hotfix-styles')) return;

        const style = document.createElement('style');
        style.id = 'runtime-hotfix-styles';
        style.textContent = `
            #love-letter,
            #love-letter .container,
            #love-letter .letter-container {
                overflow: visible !important;
            }

            #love-letter .letter-container {
                min-height: 620px;
                opacity: 1 !important;
            }

            #love-letter .letter-container.visible {
                opacity: 1 !important;
                transform: none !important;
            }

            #love-letter .envelope {
                isolation: isolate;
            }

            #love-letter .letter-paper {
                visibility: visible;
                will-change: transform, opacity;
            }

            #love-letter .envelope.unfolded .letter-paper,
            #love-letter .envelope.runtime-letter-open .letter-paper {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(-90px) scale(1.04) translateZ(10px) !important;
            }

            #love-letter .letter-signoff.runtime-visible {
                opacity: 1 !important;
            }

            #chapter-progress .progress-node {
                cursor: pointer;
            }

            @media (max-width: 768px) {
                #love-letter .letter-container {
                    min-height: 540px;
                }

                #love-letter .envelope.unfolded .letter-paper,
                #love-letter .envelope.runtime-letter-open .letter-paper {
                    transform: translateY(-42px) scale(1) translateZ(8px) !important;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #love-letter .letter-paper,
                #love-letter .ink-phrase,
                #love-letter .letter-signoff {
                    opacity: 1 !important;
                    visibility: visible !important;
                    filter: none !important;
                    transform: none !important;
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createStableLetterController() {
        const currentEnvelope = qs('#love-letter-envelope');
        if (!currentEnvelope || currentEnvelope.dataset.stableController === 'true') return;

        // Replace the node after the main app initializes. Any anonymous event
        // listeners, stale IntersectionObservers and timeout closures remain tied
        // to the detached old node and can no longer mutate the visible letter.
        const envelope = currentEnvelope.cloneNode(true);
        envelope.dataset.stableController = 'true';
        currentEnvelope.replaceWith(envelope);

        const typeContainer = qs('#typing-text-container', envelope);
        const signoff = qs('#letter-signoff', envelope);
        const replayBtn = qs('#replay-letter-btn', envelope);
        const seal = qs('#letter-seal', envelope);
        const sigPath = qs('.sig-path', envelope);
        const sigHeart = qs('.sig-heart', envelope);
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const configuredParagraphs = (typeContainer?.getAttribute('data-text') || '')
            .split('|')
            .map((text) => text.trim())
            .filter(Boolean);

        let activated = false;
        let opened = false;
        let generation = 0;
        let safetyTimer = null;
        const timers = new Set();

        const later = (callback, delay) => {
            const id = window.setTimeout(() => {
                timers.delete(id);
                callback();
            }, delay);
            timers.add(id);
            return id;
        };

        const clearTimers = () => {
            timers.forEach((id) => window.clearTimeout(id));
            timers.clear();
            if (safetyTimer !== null) {
                window.clearTimeout(safetyTimer);
                safetyTimer = null;
            }
        };

        const renderImmediate = () => {
            if (typeContainer) {
                typeContainer.innerHTML = configuredParagraphs
                    .map((paragraph) => `<p class="letter-p">${paragraph}</p>`)
                    .join('');
            }
            envelope.classList.add('unfolded', 'runtime-letter-open');
            sigPath?.classList.add('draw');
            sigHeart?.classList.add('draw');
            signoff?.classList.add('runtime-visible');
            if (signoff) signoff.style.opacity = '1';
            if (replayBtn) {
                replayBtn.style.opacity = '0.7';
                replayBtn.style.pointerEvents = 'all';
            }
            opened = true;
        };

        const reset = () => {
            generation += 1;
            clearTimers();
            opened = false;
            envelope.classList.remove('unfolded', 'runtime-letter-open');
            if (typeContainer) typeContainer.innerHTML = '';
            sigPath?.classList.remove('draw');
            sigHeart?.classList.remove('draw');
            signoff?.classList.remove('runtime-visible');
            if (signoff) {
                signoff.style.opacity = '0';
                signoff.style.transition = 'none';
            }
            if (replayBtn) {
                replayBtn.style.opacity = '0';
                replayBtn.style.pointerEvents = 'none';
            }
            if (seal) {
                seal.disabled = false;
                seal.setAttribute('aria-label', 'Open Love Letter');
            }
        };

        const writeLetter = (runGeneration) => {
            if (!typeContainer || runGeneration !== generation) return;
            typeContainer.innerHTML = '';

            const phrases = [];
            configuredParagraphs.forEach((paragraphText) => {
                const paragraph = document.createElement('p');
                paragraph.className = 'letter-p';

                paragraphText.split(/(?<=[,;.!?])\s+/).filter(Boolean).forEach((phraseText) => {
                    const phrase = document.createElement('span');
                    phrase.className = 'ink-phrase';
                    phrase.textContent = `${phraseText} `;
                    if (/\b(love|promise|cherish|forever)\b/i.test(phraseText)) {
                        phrase.classList.add('emphasis');
                    }
                    paragraph.appendChild(phrase);
                    phrases.push(phrase);
                });
                typeContainer.appendChild(paragraph);
            });

            let delay = 0;
            phrases.forEach((phrase, index) => {
                later(() => {
                    if (runGeneration !== generation) return;
                    phrase.classList.add('visible');

                    if (index === phrases.length - 1) {
                        later(() => {
                            if (runGeneration !== generation) return;
                            sigPath?.classList.add('draw');
                            sigHeart?.classList.add('draw');
                            later(() => {
                                if (runGeneration !== generation) return;
                                signoff?.classList.add('runtime-visible');
                                if (signoff) {
                                    signoff.style.opacity = '1';
                                    signoff.style.transition = 'opacity 1s ease';
                                }
                                if (replayBtn) {
                                    replayBtn.style.opacity = '0.7';
                                    replayBtn.style.pointerEvents = 'all';
                                }
                            }, 2200);
                        }, 350);
                    }
                }, delay);

                const words = phrase.textContent.trim().split(/\s+/).length;
                delay += Math.min(1300, 260 + words * 85 + (/[.!?]\s*$/.test(phrase.textContent) ? 300 : 0));
            });
        };

        const open = () => {
            if (!activated || opened) return;
            opened = true;
            clearTimers();
            envelope.classList.add('unfolded', 'runtime-letter-open');
            if (seal) seal.disabled = true;

            if (reducedMotion) {
                renderImmediate();
                return;
            }

            const runGeneration = generation;
            later(() => writeLetter(runGeneration), 1200);
        };

        const replay = () => {
            activated = true;
            reset();
            later(open, 650);
        };

        seal?.addEventListener('click', (event) => {
            event.preventDefault();
            activated = true;
            open();
        });

        seal?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                activated = true;
                open();
            }
        });

        replayBtn?.addEventListener('click', replay);

        reset();

        if (reducedMotion) {
            activated = true;
            renderImmediate();
            return;
        }

        const activateNearViewport = () => {
            if (activated) return;
            activated = true;
            safetyTimer = window.setTimeout(() => {
                safetyTimer = null;
                open();
            }, 1200);
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                if (!entries.some((entry) => entry.isIntersecting)) return;
                activateNearViewport();
                open();
                obs.disconnect();
            }, {
                threshold: 0.08,
                rootMargin: '15% 0px 15% 0px'
            });
            observer.observe(envelope);
        } else {
            activateNearViewport();
            open();
        }

        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#love-letter') {
                activated = true;
                later(open, 150);
            }
        });
    }

    function updateProgress(chapterNumber) {
        const nodes = qsa('#chapter-progress .progress-node');
        const fill = qs('#chapter-progress-line');
        const chapter = Math.max(1, Math.min(7, Number(chapterNumber) || 1));

        nodes.forEach((node) => {
            const nodeChapter = Number(node.dataset.ch);
            node.classList.toggle('active', nodeChapter === chapter);
            node.classList.toggle('completed', nodeChapter < chapter);
        });

        if (fill) fill.style.height = `${((chapter - 1) / 6) * 100}%`;
    }

    function getChapterAtViewportCenter() {
        const chapters = qsa('main .chapter');
        const viewportPoint = window.innerHeight * 0.48;
        let bestChapter = 1;
        let bestDistance = Number.POSITIVE_INFINITY;

        chapters.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top + rect.height / 2 - viewportPoint);
            const chapter = Number(section.dataset.chapter);
            if (chapter && distance < bestDistance) {
                bestDistance = distance;
                bestChapter = chapter;
            }
        });
        return bestChapter;
    }

    function initSidebarRecovery() {
        const sidebar = qs('#chapter-progress');
        const toggle = qs('#progress-menu-toggle');
        const nodes = qsa('#chapter-progress .progress-node');
        if (!sidebar || !nodes.length) return;

        nodes.forEach((node) => {
            if (node.dataset.runtimeBound === 'true') return;
            node.dataset.runtimeBound = 'true';

            const navigate = () => {
                const targetId = node.dataset.target || '';
                const target = targetId ? qs(`#${CSS.escape(targetId)}`) : null;
                if (!target) return;
                updateProgress(Number(node.dataset.ch) || 1);
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('expanded');
                    toggle?.setAttribute('aria-expanded', 'false');
                }
            };

            node.addEventListener('click', navigate);
            node.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate();
                }
            });
        });

        let ticking = false;
        const refresh = () => {
            ticking = false;
            updateProgress(getChapterAtViewportCenter());
        };
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(refresh);
        }, { passive: true });
        window.addEventListener('resize', refresh, { passive: true });
        refresh();
    }

    function init() {
        injectStyles();
        createStableLetterController();
        initSidebarRecovery();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
