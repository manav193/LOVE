"use strict";

/**
 * Minimal runtime recovery fallback layer.
 * Updates chapter sidebar node active/completed state based on viewport position.
 */
(() => {
    const qs = (selector, root = document) => root.querySelector(selector);
    const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

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
        const nodes = qsa('#chapter-progress .progress-node');

        if (!sidebar || !nodes.length) return;

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

    if (document.readyState === 'complete') {
        initSidebarRecovery();
    } else {
        window.addEventListener('load', initSidebarRecovery, { once: true });
    }
})();
