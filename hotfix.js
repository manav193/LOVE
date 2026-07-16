"use strict";

/**
 * Runtime regression hotfixes.
 * Keeps the existing design intact while restoring the chapter sidebar
 * and the 3D love-letter flow even if the main observers fail.
 */
(() => {
    const qs = (selector, root = document) => root.querySelector(selector);
    const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

    function injectHotfixStyles() {
        if (qs('#runtime-hotfix-styles')) return;

        const style = document.createElement('style');
        style.id = 'runtime-hotfix-styles';
        style.textContent = `
            #love-letter,
            #love-letter .container,
            #love-letter .letter-container,
            #love-letter .envelope {
                overflow: visible !important;
            }

            #love-letter .letter-container {
                min-height: 620px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 1;
            }

            #love-letter .letter-container.visible {
                opacity: 1 !important;
                transform: none !important;
            }

            #love-letter .envelope {
                width: min(800px, 100%);
                min-height: 430px;
                isolation: isolate;
            }

            #love-letter .envelope::before {
                transform-origin: top center !important;
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
            }

            #love-letter .envelope.unfolded::before {
                transform: rotateX(180deg) !important;
                z-index: 0 !important;
            }

            #love-letter .letter-paper {
                position: relative;
                z-index: 3;
                display: block !important;
                visibility: visible !important;
                will-change: transform, opacity;
            }

            #love-letter .envelope.unfolded .letter-paper,
            #love-letter .envelope.runtime-letter-open .letter-paper {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(-54px) scale(1) translateZ(24px) !important;
            }

            #love-letter .letter-signoff.runtime-visible {
                opacity: 1 !important;
                transform: none !important;
            }

            #chapter-progress .progress-node {
                cursor: pointer;
            }

            #chapter-progress .progress-node.active {
                pointer-events: auto;
            }

            @media (max-width: 768px) {
                #love-letter .letter-container {
                    min-height: 520px;
                }

                #love-letter .envelope {
                    min-height: 380px;
                    padding: 1rem;
                }

                #love-letter .letter-paper {
                    padding: 2rem 1.4rem !important;
                }

                #love-letter .envelope.unfolded .letter-paper,
                #love-letter .envelope.runtime-letter-open .letter-paper {
                    transform: translateY(-34px) scale(1) translateZ(12px) !important;
                }
            }

            @media (prefers-reduced-motion: reduce) {
                #love-letter .envelope::before {
                    transform: rotateX(180deg) !important;
                }

                #love-letter .letter-paper {
                    opacity: 1 !important;
                    visibility: visible !important;
                    transform: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function renderLetterFallback() {
        const typeContainer = qs('#typing-text-container');
        const signoff = qs('#letter-signoff');

        if (!typeContainer) return;

        const configuredText = typeContainer.getAttribute('data-text') || '';
        const hasReadableContent = typeContainer.textContent.trim().length > 0;

        if (!hasReadableContent && configuredText) {
            typeContainer.innerHTML = configuredText
                .split('|')
                .filter(Boolean)
                .map((paragraph) => `<p>${paragraph}</p>`)
                .join('');
            typeContainer.classList.remove('typing-cursor');
        }

        if (signoff) signoff.classList.add('runtime-visible');
    }

    function openLoveLetter() {
        const letterSection = qs('#love-letter');
        const container = qs('#love-letter .letter-container');
        const envelope = qs('#love-letter .envelope');

        if (!letterSection || !container || !envelope) return;

        container.classList.add('visible');
        envelope.classList.add('unfolded', 'runtime-letter-open');

        // The main typewriter remains preferred. This fallback only prevents
        // a permanently blank card if its observer or timer fails.
        window.setTimeout(renderLetterFallback, 2600);
    }

    function initLoveLetterRecovery() {
        const envelope = qs('#love-letter .envelope');
        if (!envelope) return;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                const entry = entries[0];
                if (!entry || !entry.isIntersecting) return;
                openLoveLetter();
                obs.disconnect();
            }, {
                threshold: 0.01,
                rootMargin: '20% 0px 20% 0px'
            });
            observer.observe(envelope);
        } else {
            openLoveLetter();
        }

        // Hash navigation and direct sidebar navigation must also open it.
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#love-letter') {
                window.setTimeout(openLoveLetter, 200);
            }
        });

        if (window.location.hash === '#love-letter') {
            window.setTimeout(openLoveLetter, 200);
        }
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
        if (!chapters.length) return 1;

        const viewportPoint = window.innerHeight * 0.48;
        let bestChapter = 1;
        let bestDistance = Number.POSITIVE_INFINITY;

        chapters.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const center = rect.top + rect.height / 2;
            const distance = Math.abs(center - viewportPoint);
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
                const target = qs(`#${CSS.escape(node.dataset.target || '')}`);
                if (!target) return;

                const targetChapter = Number(node.dataset.ch) || 1;
                updateProgress(targetChapter);
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                if (node.dataset.target === 'love-letter') {
                    window.setTimeout(openLoveLetter, 500);
                }

                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('expanded');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
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
        injectHotfixStyles();
        initSidebarRecovery();
        initLoveLetterRecovery();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
