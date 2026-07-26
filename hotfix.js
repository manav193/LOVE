"use strict";

/**
 * Runtime regression hotfixes.
 * Keeps the existing design intact while restoring the chapter sidebar
 * and the 3D love-letter flow even if the main observers fail.
 */
(() => {
    const qs = (selector, root = document) => root.querySelector(selector);
    const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

    // 1. Immediately normalize duplicate unlock sequence IDs before DOMContentLoaded
    const luxurySequences = document.querySelectorAll('#luxury-unlock-sequence');
    if (luxurySequences.length > 1) {
        luxurySequences[0].id = 'vault-unlock-sequence';
        console.log('Normalized duplicate unlock sequence IDs: outer set to vault-unlock-sequence');
    }

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

    let writingTimers = [];
    let hasTyped = false;
    let triggerOpenViewportGlobal = null;

    function clearAllTimers() {
        writingTimers.forEach(t => clearTimeout(t));
        writingTimers = [];
    }

    function initLoveLetterRecovery() {
        const envelope = qs('#love-letter-envelope');
        if (!envelope) return;

        // Clone the envelope to isolate it from script.js listeners
        const newEnvelope = envelope.cloneNode(true);
        envelope.parentNode.replaceChild(newEnvelope, envelope);

        const sealEl = qs('#letter-seal', newEnvelope);
        const replayBtn = qs('#replay-letter-btn', newEnvelope);
        const typeContainer = qs('#typing-text-container', newEnvelope);
        const signoff = qs('#letter-signoff', newEnvelope);
        const letterDate = qs('#letter-date', newEnvelope);
        const sigPath = qs('.sig-path', newEnvelope);
        const sigHeart = qs('.sig-heart', newEnvelope);

        if (letterDate) {
            letterDate.innerText = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Inject polaroids dynamically
        const polaroidsContainer = qs('#letter-polaroids-container');
        if (polaroidsContainer && typeof CONFIG !== 'undefined' && CONFIG.loveLetter && CONFIG.loveLetter.letterPolaroids) {
            polaroidsContainer.innerHTML = '';
            CONFIG.loveLetter.letterPolaroids.forEach((item, idx) => {
                const rotation = (idx % 2 === 0 ? -12 : 12) + (idx * 2);
                const sideClass = idx % 2 === 0 ? 'pos-left' : 'pos-right';
                const polaroid = document.createElement('div');
                polaroid.className = `letter-decor-polaroid ${sideClass} reveal-up delay-${idx + 1} hover-target`;
                polaroid.style.transform = `rotate(${rotation}deg)`;
                polaroid.innerHTML = `
                    <div class="polaroid-inner">
                        <img src="${item.url}" alt="${item.caption}" loading="lazy">
                        <div class="polaroid-caption font-heading">${item.caption}</div>
                    </div>
                `;
                polaroidsContainer.appendChild(polaroid);
            });
        }

        const triggerSignature = () => {
            if (sigPath) sigPath.classList.add('draw');
            if (sigHeart) sigHeart.classList.add('draw');
            
            const tSig = setTimeout(() => {
                if (signoff) {
                    signoff.style.opacity = '1';
                    signoff.style.transition = 'opacity 1.5s ease';
                }
                if (replayBtn) {
                    replayBtn.style.opacity = '0.7';
                    replayBtn.style.pointerEvents = 'all';
                }
            }, 2500);
            writingTimers.push(tSig);
        };

        const triggerWriting = () => {
            if (hasTyped) return;
            hasTyped = true;

            typeContainer.innerHTML = '';
            
            const rawText = (typeof CONFIG !== 'undefined' && CONFIG.loveLetter && CONFIG.loveLetter.paragraphs) || typeContainer.getAttribute('data-text') || '';
            const paragraphs = rawText.split('|');

            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (prefersReduced) {
                typeContainer.innerHTML = paragraphs.map(p => `<p class="letter-p">${p}</p>`).join('');
                if (sigPath) sigPath.classList.add('draw');
                if (sigHeart) sigHeart.classList.add('draw');
                if (signoff) {
                    signoff.style.opacity = '1';
                    signoff.style.transition = 'opacity 1s ease';
                }
                if (replayBtn) {
                    replayBtn.style.opacity = '0.7';
                    replayBtn.style.pointerEvents = 'all';
                }
                return;
            }

            let allPhrases = [];
            paragraphs.forEach((pText) => {
                const p = document.createElement('p');
                p.className = 'letter-p';
                
                const phrases = pText.split(/(?<=[,;.!])\s+/);
                phrases.forEach((phraseText) => {
                    const span = document.createElement('span');
                    span.className = 'ink-phrase';
                    span.innerText = phraseText + ' ';
                    
                    const lowerText = phraseText.toLowerCase();
                    if (lowerText.includes('love') || lowerText.includes('promise') || lowerText.includes('cherish') || lowerText.includes('forever')) {
                        span.classList.add('emphasis');
                    }
                    p.appendChild(span);

                    const wordCount = phraseText.split(/\s+/).length;
                    let pause = wordCount * 180 + 300; 
                    if (/[.!?]/.test(phraseText)) {
                        pause += 500;
                    }
                    allPhrases.push({ el: span, delay: pause });
                });
                typeContainer.appendChild(p);
            });

            let currentDelay = 0;
            allPhrases.forEach((phrase, index) => {
                const t = setTimeout(() => {
                    phrase.el.classList.add('visible');
                    if (index === allPhrases.length - 1) {
                        const tSigTrigger = setTimeout(triggerSignature, phrase.delay);
                        writingTimers.push(tSigTrigger);
                    }
                }, currentDelay);
                writingTimers.push(t);
                currentDelay += phrase.delay;
            });
        };

        const openEnvelope = () => {
            newEnvelope.classList.add('unfolded', 'runtime-letter-open');
            const parentContainer = qs('#love-letter .letter-container');
            if (parentContainer) parentContainer.classList.add('visible');
            
            clearAllTimers();
            const tWrite = setTimeout(triggerWriting, 1200);
            writingTimers.push(tWrite);
        };

        const replayLetter = () => {
            clearAllTimers();
            newEnvelope.classList.remove('unfolded', 'runtime-letter-open');
            typeContainer.innerHTML = '';
            hasTyped = false;

            if (sigPath) sigPath.classList.remove('draw');
            if (sigHeart) sigHeart.classList.remove('draw');
            if (signoff) {
                signoff.style.opacity = '0';
                signoff.style.transition = 'none';
            }
            if (replayBtn) {
                replayBtn.style.opacity = '0';
                replayBtn.style.pointerEvents = 'none';
            }

            const tOpen = setTimeout(openEnvelope, 800);
            writingTimers.push(tOpen);
        };

        // Click / Keydown seal handlers
        if (sealEl) {
            const handleSealToggle = (e) => {
                e.stopPropagation();
                openEnvelope();
            };
            sealEl.addEventListener('click', handleSealToggle);
            sealEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSealToggle(e);
                }
            });
        }

        // Replay button handler
        if (replayBtn) {
            replayBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                replayLetter();
            });
        }

        // Scroll Intersection observer
        let hasTriggeredOpen = false;
        const triggerOpenViewport = () => {
            if (hasTriggeredOpen) return;
            hasTriggeredOpen = true;
            openEnvelope();
        };

        triggerOpenViewportGlobal = triggerOpenViewport;

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                const entry = entries[0];
                if (entry && entry.isIntersecting) {
                    triggerOpenViewport();
                    obs.disconnect();
                }
            }, {
                threshold: 0.01,
                rootMargin: '20% 0px 20% 0px'
            });
            observer.observe(newEnvelope);
        } else {
            triggerOpenViewport();
        }

        // Scroll listener fallback check
        const checkScrollPosition = () => {
            if (hasTriggeredOpen) return;
            const rect = newEnvelope.getBoundingClientRect();
            if (rect.top < window.innerHeight + 250 && rect.bottom > -250) {
                triggerOpenViewport();
                window.removeEventListener('scroll', checkScrollPosition);
            }
        };
        window.addEventListener('scroll', checkScrollPosition, { passive: true });
        checkScrollPosition();

        // Hash navigation
        window.addEventListener('hashchange', () => {
            if (window.location.hash === '#love-letter') {
                triggerOpenViewport();
            }
        });
        if (window.location.hash === '#love-letter') {
            triggerOpenViewport();
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
                    if (typeof triggerOpenViewportGlobal === 'function') {
                        triggerOpenViewportGlobal();
                    }
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

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init, { once: true });
    }
})();
