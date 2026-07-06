/**
 * Cinematic Love Website - Core JavaScript
 * Handles configuration, animations, 3D tilt, canvas particles, and audio.
 */

// ==========================================
// 1. CONFIGURATION (EDIT YOUR DETAILS HERE)
// ==========================================
const CONFIG = {
    // Background Music (Replace with path to your MP3 file, e.g., 'music.mp3')
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_9b6574a441.mp3?filename=romantic-piano-110034.mp3",
    
    // Target date for the countdown
    countdownDate: "February 14, 2025 00:00:00",
    
    // Hero Section
    hero: {
        title: "Manav & My Love",
        subtitle: "A story of two hearts becoming one."
    },
    
    // Our Journey Timeline
    timeline: [
        { date: "The First Day", title: "When we met", text: "The moment our eyes met, I knew there was something magical about you. It was the beginning of my favorite adventure." },
        { date: "Our First Date", title: "Sparks flying", text: "Hours felt like minutes. We talked, we laughed, and I realized I wanted to spend all my tomorrows with you." },
        { date: "Falling Deep", title: "\"I love you\"", text: "Those three little words that changed everything. My heart has belonged to you ever since that beautiful night." }
    ],
    
    // Photo Memory Gallery (Replace URLs with your image paths like 'images/photo1.jpg')
    gallery: [
        "https://images.unsplash.com/photo-1518199266791-5375a83164ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    
    // Animated Love Letter
    loveLetter: {
        greeting: "To My Forever,",
        // Each string in this array represents a paragraph
        paragraphs: [
            "You are the peace in my chaos and the light in my darkest days. Every morning I wake up grateful for your presence in my life. Your smile is my favorite sight, and your voice is my favorite sound.",
            "I promise to love you, cherish you, and hold your hand through all of life's seasons."
        ],
        signoff: "Forever yours,<br>Manav"
    },
    
    // Why I Love You Cards
    reasons: [
        { icon: "✨", title: "Your Smile", text: "It brightens up my entire world and makes all my worries fade away instantly." },
        { icon: "❤️", title: "Your Heart", text: "The kindness and endless compassion you show to everyone around you is truly inspiring." },
        { icon: "🌟", title: "Your Strength", text: "You face challenges with such grace, making me admire you more every single day." }
    ],
    
    // Final Surprise Section
    finalMessage: {
        title: "I Love You.",
        subtitle: "More than words can say.",
        buttonText: "Click for a Surprise"
    }
};
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    /* --- 0. Inject Configuration Data --- */
    function injectContent() {
        // Audio
        document.getElementById('bg-music').innerHTML = `<source src="${CONFIG.audioUrl}" type="audio/mpeg">`;

        // Hero
        document.getElementById('hero-title').innerText = CONFIG.hero.title;
        document.getElementById('hero-subtitle').innerText = CONFIG.hero.subtitle;

        // Timeline
        const timelineContainer = document.getElementById('timeline-injection-point');
        let timelineHTML = '';
        CONFIG.timeline.forEach((item, index) => {
            timelineHTML += `
            <div class="timeline-item fade-in-up delay-${(index % 3) + 1}">
                <div class="timeline-dot"></div>
                <div class="timeline-content glass-card tilt-card hover-target">
                    <span class="timeline-date">${item.date}</span>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                </div>
            </div>`;
        });
        timelineContainer.innerHTML = timelineHTML;

        // Gallery
        const galleryGrid = document.getElementById('gallery-grid');
        let galleryHTML = '';
        CONFIG.gallery.forEach((url, index) => {
            galleryHTML += `
            <div class="gallery-item fade-in-up delay-${(index % 4) + 1} hover-target">
                <img src="${url}" alt="Memory ${index + 1}" class="lightbox-trigger">
            </div>`;
        });
        galleryGrid.innerHTML = galleryHTML;

        // Love Letter
        document.getElementById('letter-greeting').innerText = CONFIG.loveLetter.greeting;
        // The data-text is formatted with pipes "|" to split into paragraphs during animation
        document.getElementById('typing-text-container').setAttribute('data-text', CONFIG.loveLetter.paragraphs.join('|'));
        document.getElementById('letter-signoff').innerHTML = CONFIG.loveLetter.signoff;

        // Reasons Cards
        const reasonsGrid = document.getElementById('reasons-grid');
        let reasonsHTML = '';
        CONFIG.reasons.forEach((reason, index) => {
            reasonsHTML += `
            <div class="reason-card glass-card tilt-card fade-in-up delay-${(index % 3) + 1} hover-target">
                <div class="card-icon">${reason.icon}</div>
                <h3>${reason.title}</h3>
                <p>${reason.text}</p>
            </div>`;
        });
        reasonsGrid.innerHTML = reasonsHTML;

        // Countdown Subtitle
        document.getElementById('countdown-subtitle').innerText = `Until our special day: ${CONFIG.countdownDate.split(' ')[0].replace(/,/g, ' ')}`;

        // Final Message
        document.getElementById('final-title').innerText = CONFIG.finalMessage.title;
        document.getElementById('final-subtitle').innerText = CONFIG.finalMessage.subtitle;
        document.getElementById('surprise-btn').innerText = CONFIG.finalMessage.buttonText;
    }

    injectContent();

    /* --- 1. Loader --- */
    window.onload = () => {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 1000);
            }, 500); // Minimum delay for aesthetics
        }
    };

    /* --- 2. Theme Manager --- */
    const themeToggle = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const moonIcon = themeToggle.querySelector('.moon');
    const sunIcon = themeToggle.querySelector('.sun');
    
    // Check local storage for theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    function setTheme(theme) {
        htmlEl.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
            moonIcon.style.display = 'inline-block';
            sunIcon.style.display = 'none';
        } else {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'inline-block';
        }
    }


    /* --- 3. Custom Cursor --- */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorRing = document.getElementById('cursor-ring');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isDesktop = window.innerWidth > 768;

    if (isDesktop && cursorDot && cursorRing) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Immediate update for dot
            cursorDot.style.left = mouseX + 'px';
            cursorDot.style.top = mouseY + 'px';
        });

        // Smooth Lerp for Ring
        const loopCursor = () => {
            // Lerp factor
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            
            cursorRing.style.left = ringX + 'px';
            cursorRing.style.top = ringY + 'px';
            
            requestAnimationFrame(loopCursor);
        };
        requestAnimationFrame(loopCursor);

        // Hover effect setup function
        function setupHoverTargets() {
            const hoverTargets = document.querySelectorAll('.hover-target, a, button, .lightbox-trigger');
            hoverTargets.forEach(target => {
                target.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                target.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
            });
        }
        // Call it after dynamic content injection
        setupHoverTargets();
    }


    /* --- 4. Audio Controller & Visualizer --- */
    const bgMusic = document.getElementById('bg-music');
    const musicToggle = document.getElementById('music-toggle');
    const playIcon = musicToggle.querySelector('.play');
    const pauseIcon = musicToggle.querySelector('.pause');
    const visCanvas = document.getElementById('audio-visualizer');
    let audioContext, analyser, source, dataArray, bufferLength, visCtx;
    let isPlaying = false;
    let audioInitialized = false;

    if (visCanvas) {
        visCtx = visCanvas.getContext('2d');
        visCanvas.width = 100;
        visCanvas.height = 40;
    }

    function initAudio() {
        if (audioInitialized) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaElementSource(bgMusic);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        analyser.fftSize = 64;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        audioInitialized = true;
        
        drawVisualizer();
    }

    function drawVisualizer() {
        if (!isPlaying) return;
        requestAnimationFrame(drawVisualizer);
        
        analyser.getByteFrequencyData(dataArray);
        
        visCtx.clearRect(0, 0, visCanvas.width, visCanvas.height);
        
        const barWidth = (visCanvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for(let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * visCanvas.height;
            const themeAccent = htmlEl.getAttribute('data-theme') === 'dark' ? '#d4af37' : '#b84462';
            visCtx.fillStyle = themeAccent;
            visCtx.fillRect(x, visCanvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    musicToggle.addEventListener('click', () => {
        initAudio();
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        if (bgMusic.paused) {
            bgMusic.play().then(() => {
                isPlaying = true;
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'inline-block';
                drawVisualizer();
            }).catch(e => console.error("Audio playback blocked", e));
        } else {
            bgMusic.pause();
            isPlaying = false;
            playIcon.style.display = 'inline-block';
            pauseIcon.style.display = 'none';
            visCtx.clearRect(0, 0, visCanvas.width, visCanvas.height);
        }
    });


    /* --- 5. Canvas Particle Engine (Hearts & Petals) --- */
    const pCanvas = document.getElementById('particle-canvas');
    const pCtx = pCanvas.getContext('2d');
    let particlesArray = [];
    let explosionParticles = [];

    function resizeCanvas() {
        pCanvas.width = window.innerWidth;
        pCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * pCanvas.width;
            this.y = pCanvas.height + Math.random() * 100;
            this.size = Math.random() * 15 + 5;
            this.speedY = Math.random() * 1 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.angle = Math.random() * 360;
            this.spin = (Math.random() - 0.5) * 2;
            this.type = Math.random() > 0.6 ? 'heart' : 'petal';
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        
        update() {
            this.y -= this.speedY;
            this.x += this.speedX + Math.sin(this.angle * Math.PI / 180) * 0.5;
            this.angle += this.spin;
            
            if (this.y + this.size < 0) {
                this.y = pCanvas.height + 50;
                this.x = Math.random() * pCanvas.width;
            }
        }
        
        draw() {
            pCtx.save();
            pCtx.translate(this.x, this.y);
            pCtx.rotate(this.angle * Math.PI / 180);
            pCtx.globalAlpha = this.opacity;
            
            if (this.type === 'heart') {
                pCtx.fillStyle = htmlEl.getAttribute('data-theme') === 'dark' ? '#b84462' : '#d65c7a';
                pCtx.font = `${this.size}px Arial`;
                pCtx.fillText('❤', 0, 0);
            } else {
                pCtx.fillStyle = htmlEl.getAttribute('data-theme') === 'dark' ? '#7e1e36' : '#9c2744';
                pCtx.beginPath();
                pCtx.ellipse(0, 0, this.size, this.size/2, 0, 0, Math.PI*2);
                pCtx.fill();
            }
            pCtx.restore();
        }
    }

    const particleCount = isDesktop ? 40 : 15;
    for (let i = 0; i < particleCount; i++) {
        particlesArray.push(new Particle());
    }

    class ExplosionParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 20 + 10;
            this.speedX = (Math.random() - 0.5) * 20;
            this.speedY = (Math.random() - 1) * 20;
            this.gravity = 0.5;
            this.angle = Math.random() * 360;
            this.spin = (Math.random() - 0.5) * 10;
            this.life = 100;
            this.type = Math.random() > 0.5 ? 'heart' : 'confetti';
            this.color = `hsl(${Math.random() * 60 + 330}, 80%, 60%)`;
        }
        
        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.angle += this.spin;
            this.life--;
        }
        
        draw() {
            if (this.life <= 0) return;
            pCtx.save();
            pCtx.translate(this.x, this.y);
            pCtx.rotate(this.angle * Math.PI / 180);
            pCtx.globalAlpha = this.life / 100;
            
            if (this.type === 'heart') {
                pCtx.fillStyle = this.color;
                pCtx.font = `${this.size}px Arial`;
                pCtx.fillText('❤', 0, 0);
            } else {
                pCtx.fillStyle = this.color;
                pCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size/2);
            }
            pCtx.restore();
        }
    }

    function animateParticles() {
        pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
        
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });

        for (let i = explosionParticles.length - 1; i >= 0; i--) {
            let ep = explosionParticles[i];
            ep.update();
            ep.draw();
            if (ep.life <= 0) {
                explosionParticles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();


    /* --- 6. 3D Tilt Effect --- */
    function initTiltCards() {
        const tiltCards = document.querySelectorAll('.tilt-card');
        if (isDesktop) {
            tiltCards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;  
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const rotateX = ((y - centerY) / centerY) * -15;
                    const rotateY = ((x - centerX) / centerX) * 15;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                    card.style.transition = 'transform 0.5s ease';
                });
                
                card.addEventListener('mouseenter', () => {
                    card.style.transition = 'none';
                });
            });
        }
    }
    initTiltCards();


    /* --- 7. Parallax Scrolling --- */
    const parallaxElements = document.querySelectorAll('.parallax-section [data-depth]');
    window.addEventListener('scroll', () => {
        if (!isDesktop) return; 
        const scrollY = window.scrollY;
        
        parallaxElements.forEach(el => {
            const depth = el.getAttribute('data-depth');
            const yPos = -(scrollY * depth);
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
        
        const timelineLine = document.querySelector('.timeline-line');
        const timelineProgress = document.querySelector('.timeline-progress');
        if (timelineLine && timelineProgress) {
            const rect = timelineLine.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top < windowHeight && rect.bottom > 0) {
                const scrolledAmount = windowHeight - rect.top;
                const percentage = Math.min(Math.max((scrolledAmount / (rect.height + windowHeight)) * 100, 0), 100);
                timelineProgress.style.height = `${percentage}%`;
            }
        }
    });


    /* --- 8. Typing Animation (IntersectionObserver) --- */
    const typeContainer = document.getElementById('typing-text-container');
    const signoff = document.querySelector('.letter-signoff');
    let hasTyped = false;

    if (typeContainer) {
        const textToType = typeContainer.getAttribute('data-text').split('|');
        typeContainer.innerHTML = ''; 
        
        const typeObserver = new IntersectionObserver((entries) => {
            if(entries[0].isIntersecting && !hasTyped) {
                hasTyped = true;
                typeContainer.classList.add('typing-cursor');
                
                let pIndex = 0;
                let charIndex = 0;
                let currentP = document.createElement('p');
                typeContainer.appendChild(currentP);

                function typeWriter() {
                    if (pIndex < textToType.length) {
                        if (charIndex < textToType[pIndex].length) {
                            currentP.innerHTML += textToType[pIndex].charAt(charIndex);
                            charIndex++;
                            setTimeout(typeWriter, 30);
                        } else {
                            pIndex++;
                            charIndex = 0;
                            if (pIndex < textToType.length) {
                                currentP = document.createElement('p');
                                typeContainer.appendChild(currentP);
                                setTimeout(typeWriter, 400); 
                            } else {
                                typeContainer.classList.remove('typing-cursor');
                                if (signoff) signoff.style.opacity = '1';
                            }
                        }
                    }
                }
                typeWriter();
            }
        }, { threshold: 0.5 });
        
        typeObserver.observe(document.getElementById('love-letter'));
    }


    /* --- 9. Standard Scroll Revealing --- */
    const animatedElements = document.querySelectorAll('.fade-in-up:not(#typing-text-container)');
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => scrollObserver.observe(el));


    /* --- 10. Countdown Logic --- */
    const targetDateStr = CONFIG.countdownDate;
    const targetTime = new Date(targetDateStr).getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetTime - now;

        if (distance < 0) {
            if(daysEl) daysEl.innerText = "00"; 
            if(hoursEl) hoursEl.innerText = "00"; 
            if(minutesEl) minutesEl.innerText = "00"; 
            if(secondsEl) secondsEl.innerText = "00";
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if(daysEl) daysEl.innerText = days < 10 ? '0' + days : days;
        if(hoursEl) hoursEl.innerText = hours < 10 ? '0' + hours : hours;
        if(minutesEl) minutesEl.innerText = minutes < 10 ? '0' + minutes : minutes;
        if(secondsEl) secondsEl.innerText = seconds < 10 ? '0' + seconds : seconds;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);


    /* --- 11. Lightbox Logic --- */
    function initLightbox() {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.getElementById('lightbox-close');
        const galleryTriggers = document.querySelectorAll('.lightbox-trigger');

        galleryTriggers.forEach(img => {
            img.addEventListener('click', (e) => {
                lightboxImg.src = e.target.src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { lightboxImg.src = ''; }, 400); 
        };

        if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target !== lightboxImg) closeLightbox();
            });
        }
        
        let touchStartY = 0;
        if (lightbox) {
            lightbox.addEventListener('touchstart', e => { touchStartY = e.changedTouches[0].screenY; }, {passive: true});
            lightbox.addEventListener('touchend', e => {
                const touchEndY = e.changedTouches[0].screenY;
                if (touchEndY - touchStartY > 50) { 
                    closeLightbox();
                }
            }, {passive: true});
        }
    }
    initLightbox();


    /* --- 12. Final Explosion Surprise --- */
    const surpriseBtn = document.getElementById('surprise-btn');
    if (surpriseBtn) {
        surpriseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const rect = surpriseBtn.getBoundingClientRect();
            const btnCenterX = rect.left + rect.width / 2;
            const btnCenterY = rect.top + rect.height / 2;

            for(let i=0; i<80; i++) {
                explosionParticles.push(new ExplosionParticle(btnCenterX, btnCenterY));
            }
            
            surpriseBtn.style.transform = 'scale(0.9)';
            setTimeout(() => { surpriseBtn.style.transform = 'scale(1)'; }, 150);
            
            if (!isPlaying) musicToggle.click();
            
            setTimeout(() => {
                alert("A tiny surprise: I will love you forever, My Love!");
            }, 500);
        });
    }

});
