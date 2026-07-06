/**
 * Awwwards-Quality Cinematic Love Website - Masterpiece Edition
 * Features: PWA, Easter Eggs, Advanced Audio Engine, Advanced Canvas Engine, Modular Architecture.
 */
"use strict";

// ==========================================
// 1. CONFIGURATION (EDIT YOUR DETAILS HERE)
// ==========================================
const CONFIG = {
    // Music (MP3 file URL)
    audioUrl: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_9b6574a441.mp3?filename=romantic-piano-110034.mp3",
    
    // Dates for Special Modes (Format: MM-DD)
    anniversaryDate: "02-14", // Triggers Anniversary Mode
    birthdayDate: "08-25",    // Triggers Birthday Mode
    
    // Countdown Target Date
    countdownDate: "February 14, 2025 00:00:00",
    
    // Hero Section
    hero: {
        title: "Manav & My Love",
        subtitle: "A story of two hearts becoming one."
    },
    
    // Interactive Journey Timeline (Supports image or video)
    timeline: [
        { 
            date: "The First Day", 
            title: "When we met", 
            text: "The moment our eyes met, I knew there was something magical about you. It was the beginning of my favorite adventure.",
            image: "https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=600&q=80"
        },
        { 
            date: "Our First Date", 
            title: "Sparks flying", 
            text: "Hours felt like minutes. We talked, we laughed, and I realized I wanted to spend all my tomorrows with you."
        },
        { 
            date: "Falling Deep", 
            title: "\"I love you\"", 
            text: "Those three little words that changed everything. My heart has belonged to you ever since that beautiful night."
        }
    ],
    
    // Photo Memory Gallery
    gallery: [
        { url: "https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=800&q=80", caption: "Our first trip together." },
        { url: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=800&q=80", caption: "Sunsets and smiles." },
        { url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80", caption: "Endless laughter." },
        { url: "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?auto=format&fit=crop&w=800&q=80", caption: "Forever yours." },
        { url: "https://images.unsplash.com/photo-1511289081-d06dda19034d?auto=format&fit=crop&w=800&q=80", caption: "Holding hands." }
    ],
    
    // Love Letter
    loveLetter: {
        greeting: "To My Forever,",
        paragraphs: "You are the peace in my chaos and the light in my darkest days. Every morning I wake up grateful for your presence in my life. Your smile is my favorite sight, and your voice is my favorite sound.|I promise to love you, cherish you, and hold your hand through all of life's seasons.",
        signoff: "Forever yours,<br>Manav"
    },
    
    // Reasons Cards
    reasons: [
        { icon: "✨", title: "Your Smile", text: "It brightens up my entire world and makes all my worries fade away instantly." },
        { icon: "❤️", title: "Your Heart", text: "The kindness and endless compassion you show to everyone around you is truly inspiring." },
        { icon: "🌟", title: "Your Strength", text: "You face challenges with such grace, making me admire you more every single day." }
    ],
    
    // Final Surprise
    finalMessage: {
        title: "I Love You.",
        subtitle: "More than words can say.",
        buttonText: "Click for a Surprise"
    }
};
// ==========================================


/**
 * AudioController
 * Handles background music visualization and SFX micro-interactions.
 */
class AudioController {
    constructor() {
        this.bgMusic = document.getElementById('bg-music');
        this.sfxHover = document.getElementById('sfx-hover');
        this.sfxClick = document.getElementById('sfx-click');
        this.sfxSuccess = document.getElementById('sfx-success');
        
        this.musicToggle = document.getElementById('music-toggle');
        this.sfxToggle = document.getElementById('sfx-toggle');
        this.volSlider = document.getElementById('volume-slider');
        this.visCanvas = document.getElementById('audio-visualizer');
        
        this.isSfxMuted = true; // SFX muted by default
        this.isPlaying = false;
        this.audioInit = false;
        
        if (this.visCanvas) {
            this.visCtx = this.visCanvas.getContext('2d');
            this.visCanvas.width = 120;
            this.visCanvas.height = 35;
        }

        this.initEvents();
    }

    initEvents() {
        if(this.bgMusic) this.bgMusic.volume = this.volSlider.value;
        
        // SFX Toggle
        this.sfxToggle.addEventListener('click', () => {
            this.isSfxMuted = !this.isSfxMuted;
            this.sfxToggle.querySelector('.sfx-on').style.display = this.isSfxMuted ? 'none' : 'inline-block';
            this.sfxToggle.querySelector('.sfx-off').style.display = this.isSfxMuted ? 'inline-block' : 'none';
            if(!this.isSfxMuted) this.playSfx(this.sfxClick);
        });

        // Music Toggle
        this.musicToggle.addEventListener('click', () => {
            this.setupWebAudio();
            if(this.audioCtx.state === 'suspended') this.audioCtx.resume();

            if (this.bgMusic.paused) {
                this.bgMusic.play().then(() => {
                    this.isPlaying = true;
                    this.musicToggle.querySelector('.play').style.display = 'none';
                    this.musicToggle.querySelector('.pause').style.display = 'inline-block';
                    this.drawWaveform();
                }).catch(e => console.warn("Audio block:", e));
            } else {
                this.bgMusic.pause();
                this.isPlaying = false;
                this.musicToggle.querySelector('.play').style.display = 'inline-block';
                this.musicToggle.querySelector('.pause').style.display = 'none';
                if(this.visCtx) this.visCtx.clearRect(0,0,this.visCanvas.width,this.visCanvas.height);
            }
        });
        
        this.volSlider.addEventListener('input', (e) => {
            if(this.bgMusic) this.bgMusic.volume = e.target.value;
        });

        // Bind SFX to interactions
        document.querySelectorAll('.hover-target').forEach(el => {
            el.addEventListener('mouseenter', () => this.playSfx(this.sfxHover));
        });
        document.querySelectorAll('.click-target, button, .lightbox-trigger, .timeline-content').forEach(el => {
            el.addEventListener('click', () => this.playSfx(this.sfxClick));
        });
    }

    playSfx(audioElement) {
        if(this.isSfxMuted || !audioElement) return;
        audioElement.currentTime = 0;
        audioElement.volume = 0.4;
        audioElement.play().catch(e => {}); // Ignore play blocks
    }
    
    playSuccess() { this.playSfx(this.sfxSuccess); }

    setupWebAudio() {
        if(this.audioInit) return;
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 128;
        this.analyser.smoothingTimeConstant = 0.8;
        
        this.source = this.audioCtx.createMediaElementSource(this.bgMusic);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.audioInit = true;
    }

    drawWaveform() {
        if (!this.isPlaying) return;
        requestAnimationFrame(() => this.drawWaveform());
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        this.visCtx.clearRect(0, 0, this.visCanvas.width, this.visCanvas.height);
        this.visCtx.lineWidth = 2;
        this.visCtx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? '#d4af37' : '#b84462';
        this.visCtx.beginPath();
        
        const sliceWidth = this.visCanvas.width * 1.0 / this.bufferLength;
        let x = 0;
        for(let i = 0; i < this.bufferLength; i++) {
            const v = this.dataArray[i] / 128.0;
            const y = v * this.visCanvas.height/2;
            if(i === 0) this.visCtx.moveTo(x, y);
            else this.visCtx.lineTo(x, y);
            x += sliceWidth;
        }
        this.visCtx.lineTo(this.visCanvas.width, this.visCanvas.height/2);
        this.visCtx.stroke();
    }
}


/**
 * ParticleEngine
 * Handles high-performance canvas rendering for weather, magic, butterflies, and physics confetti.
 */
class ParticleEngine {
    constructor(isMobile, isLowEnd, prefersReducedMotion) {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas || prefersReducedMotion) {
            if(this.canvas) this.canvas.style.display = 'none';
            return;
        }
        this.ctx = this.canvas.getContext('2d', { alpha: true });
        this.particles = [];
        this.explosions = [];
        this.butterflies = [];
        
        this.isMobile = isMobile;
        this.isLowEnd = isLowEnd;
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.initParticles();
        this.render();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        const maxParticles = this.isLowEnd ? 15 : (this.isMobile ? 25 : 45);
        for(let i=0; i<maxParticles; i++) {
            this.particles.push(this.createAmbientParticle(true));
        }
        // Add a few butterflies
        if(!this.isLowEnd && !this.isMobile) {
            for(let i=0; i<3; i++) this.butterflies.push(this.createButterfly());
        }
    }

    createAmbientParticle(randomY = false) {
        let p = {
            x: Math.random() * this.canvas.width,
            y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 50,
            size: Math.random() * (this.isMobile ? 10 : 15) + 3,
            speedY: Math.random() * 0.8 + 0.2,
            speedX: (Math.random() - 0.5) * 0.5,
            angle: Math.random() * 360,
            spin: (Math.random() - 0.5) * 2,
            opacity: Math.random() * 0.4 + 0.1,
            life: 100
        };
        
        const rand = Math.random();
        if(rand > 0.95) p.type = 'shooting-star';
        else if(rand > 0.7) p.type = 'firefly';
        else if(rand > 0.4) p.type = 'heart';
        else p.type = 'petal';
        
        if (p.type === 'shooting-star') {
            p.speedY = -(Math.random() * 10 + 10);
            p.speedX = (Math.random() - 0.5) * 15;
            p.size = Math.random() * 2 + 1;
            p.opacity = 0;
            p.x = Math.random() * this.canvas.width;
            p.y = Math.random() * (this.canvas.height / 2);
        }
        return p;
    }
    
    createButterfly() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 10 + 10,
            angle: 0,
            flap: 0,
            speed: Math.random() * 1 + 0.5,
            targetX: Math.random() * this.canvas.width,
            targetY: Math.random() * this.canvas.height
        };
    }
    
    createConfetti(x, y) {
        return {
            x: x, y: y,
            size: Math.random() * 15 + 5,
            speedX: (Math.random() - 0.5) * 25,
            speedY: (Math.random() - 1) * 25,
            gravity: 0.6,
            drag: 0.95,
            angle: Math.random() * 360,
            spin: (Math.random() - 0.5) * 20,
            life: 150,
            type: Math.random() > 0.4 ? 'heart' : 'shape',
            color: `hsl(${Math.random() * 60 + 330}, 90%, 65%)`
        };
    }

    triggerExplosion(x, y) {
        for(let i=0; i<80; i++) this.explosions.push(this.createConfetti(x, y));
    }
    
    // Called when user clicks heart
    triggerMiniBurst(x, y) {
        for(let i=0; i<10; i++) {
            let p = this.createConfetti(x, y);
            p.speedX *= 0.5; p.speedY *= 0.5;
            this.explosions.push(p);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Ambient Particles
        for(let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            
            if (p.type === 'shooting-star') {
                p.x += p.speedX; p.y += p.speedY; p.life--;
                if(p.life > 70) p.opacity += 0.05; else p.opacity -= 0.02;
                if(p.life <= 0 || p.opacity <= 0) this.particles[i] = this.createAmbientParticle();
            } else {
                p.y -= p.speedY; p.x += p.speedX + Math.sin(p.angle * Math.PI / 180) * 0.5; p.angle += p.spin;
                if (p.type === 'firefly') p.opacity = Math.max(0.1, Math.min(p.opacity + Math.sin(Date.now() / 300 + p.x) * 0.01, 0.8));
                if (p.y + p.size < -50) this.particles[i] = this.createAmbientParticle();
            }
            
            if(p.opacity <= 0) continue;
            
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle * Math.PI / 180);
            this.ctx.globalAlpha = p.opacity;
            
            if (p.type === 'heart') {
                this.ctx.fillStyle = isDark ? '#b84462' : '#d65c7a';
                this.ctx.font = `${p.size}px Arial`; this.ctx.fillText('❤', 0, 0);
            } else if (p.type === 'petal') {
                this.ctx.fillStyle = isDark ? '#7e1e36' : '#9c2744';
                this.ctx.beginPath(); this.ctx.ellipse(0, 0, p.size, p.size/2, 0, 0, Math.PI*2); this.ctx.fill();
            } else if (p.type === 'firefly') {
                this.ctx.fillStyle = isDark ? '#d4af37' : '#b38b1f';
                this.ctx.shadowBlur = 10; this.ctx.shadowColor = this.ctx.fillStyle;
                this.ctx.beginPath(); this.ctx.arc(0, 0, 2, 0, Math.PI*2); this.ctx.fill();
            } else if (p.type === 'shooting-star' && isDark) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath(); this.ctx.arc(0, 0, p.size, 0, Math.PI*2); this.ctx.fill();
                this.ctx.beginPath(); this.ctx.moveTo(0, 0); this.ctx.lineTo(-p.speedX * 3, -p.speedY * 3);
                this.ctx.strokeStyle = 'rgba(255,255,255,0.2)'; this.ctx.lineWidth = p.size; this.ctx.stroke();
            }
            this.ctx.restore();
        }
        
        // Butterflies
        for(let i = 0; i < this.butterflies.length; i++) {
            let b = this.butterflies[i];
            const dx = b.targetX - b.x;
            const dy = b.targetY - b.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if(dist < 50) {
                b.targetX = Math.random() * this.canvas.width;
                b.targetY = Math.random() * this.canvas.height;
            }
            
            b.x += (dx/dist) * b.speed;
            b.y += (dy/dist) * b.speed;
            b.angle = Math.atan2(dy, dx);
            b.flap += 0.2;
            
            this.ctx.save();
            this.ctx.translate(b.x, b.y);
            this.ctx.rotate(b.angle + Math.PI/2);
            this.ctx.globalAlpha = 0.6;
            this.ctx.fillStyle = isDark ? '#d4af37' : '#b84462';
            
            const wingWidth = Math.abs(Math.sin(b.flap)) * b.size;
            // Left Wing
            this.ctx.beginPath(); this.ctx.ellipse(-wingWidth/2, 0, wingWidth/2, b.size, 0, 0, Math.PI*2); this.ctx.fill();
            // Right Wing
            this.ctx.beginPath(); this.ctx.ellipse(wingWidth/2, 0, wingWidth/2, b.size, 0, 0, Math.PI*2); this.ctx.fill();
            
            this.ctx.restore();
        }

        // Explosions
        for(let i=this.explosions.length-1; i>=0; i--) {
            let ep = this.explosions[i];
            ep.speedX *= ep.drag; ep.speedY += ep.gravity;
            ep.x += ep.speedX; ep.y += ep.speedY; ep.angle += ep.spin; ep.life--;
            
            if(ep.life <= 0) {
                this.explosions.splice(i, 1);
                continue;
            }
            
            this.ctx.save();
            this.ctx.translate(ep.x, ep.y);
            this.ctx.rotate(ep.angle * Math.PI / 180);
            this.ctx.globalAlpha = Math.min(1, ep.life / 50);
            this.ctx.fillStyle = ep.color;
            
            if (ep.type === 'heart') {
                this.ctx.font = `${ep.size}px Arial`; this.ctx.fillText('❤', 0, 0);
            } else {
                this.ctx.fillRect(-ep.size/2, -ep.size/2, ep.size, ep.size/2);
            }
            this.ctx.restore();
        }
        
        requestAnimationFrame(() => this.render());
    }
}


/**
 * AppController
 * Orchestrates injection, UI interactions, scroll logic, and Easter Eggs.
 */
class AppController {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.isLowEnd = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.audio = new AudioController();
        this.particles = new ParticleEngine(this.isMobile, this.isLowEnd, this.prefersReducedMotion);
        
        this.injectData();
        this.initPWA();
        this.initTheme();
        this.initEasterEggs();
        this.initCursorAndMagnetic();
        this.initScrollObservers();
        this.initInteractiveComponents();
    }
    
    /* --- PWA Registration --- */
    initPWA() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                .catch(err => console.warn('PWA SW Registration failed:', err));
            });
        }
    }

    /* --- Theme & Time of Day Logic --- */
    initTheme() {
        const themeBtn = document.getElementById('theme-toggle');
        const moonIcon = themeBtn.querySelector('.moon');
        const sunIcon = themeBtn.querySelector('.sun');
        let currentTheme = localStorage.getItem('theme') || 'dark';
        
        const applyTheme = (theme) => {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            moonIcon.style.display = theme === 'dark' ? 'inline-block' : 'none';
            sunIcon.style.display = theme === 'dark' ? 'none' : 'inline-block';
        };
        applyTheme(currentTheme);

        themeBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(currentTheme);
        });

        // Dynamic Time/Date logic
        const now = new Date();
        const hour = now.getHours();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${month}-${day}`;

        // Anniversary / Birthday Modes
        if (dateStr === CONFIG.anniversaryDate) document.body.classList.add('mode-anniversary');
        else if (dateStr === CONFIG.birthdayDate) document.body.classList.add('mode-anniversary');
        
        // Time of Day Aurora overrides
        if (hour >= 5 && hour < 8) document.body.classList.add('theme-sunrise');
        else if (hour >= 17 && hour < 20) document.body.classList.add('theme-sunset');
    }

    /* --- Core Data Injection --- */
    injectData() {
        document.getElementById('hero-title').innerText = CONFIG.hero.title;
        document.getElementById('hero-subtitle').innerText = CONFIG.hero.subtitle;

        // Timeline
        const timelineEl = document.getElementById('timeline-injection-point');
        let timelineHTML = '';
        CONFIG.timeline.forEach((item, index) => {
            let mediaHTML = '';
            if (item.image) mediaHTML = `<img src="${item.image}" alt="Timeline Memory" loading="lazy">`;
            else if (item.video) mediaHTML = `<video src="${item.video}" autoplay loop muted playsinline></video>`;
            
            timelineHTML += `
            <div class="timeline-item reveal-up delay-${(index % 3) + 1}">
                <div class="timeline-dot"></div>
                <div class="timeline-content liquid-glass tilt-element hover-target" role="button" aria-expanded="false" tabindex="0">
                    <span class="timeline-date">${item.date}</span>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${mediaHTML ? `<div class="timeline-media">${mediaHTML}</div>` : ''}
                </div>
            </div>`;
        });
        timelineEl.innerHTML = timelineHTML;

        // Gallery Masonry
        const galleryEl = document.getElementById('gallery-masonry');
        let galleryHTML = '';
        CONFIG.gallery.forEach((item, index) => {
            galleryHTML += `
            <div class="gallery-item reveal-up delay-${(index % 3) + 1} hover-target">
                <img src="${item.url}" alt="${item.caption}" class="lightbox-trigger" data-caption="${item.caption}" loading="lazy">
                <div class="gallery-caption">${item.caption}</div>
            </div>`;
        });
        galleryEl.innerHTML = galleryHTML;

        // Love Letter
        document.getElementById('letter-greeting').innerText = CONFIG.loveLetter.greeting;
        document.getElementById('typing-text-container').setAttribute('data-text', CONFIG.loveLetter.paragraphs);
        document.getElementById('letter-signoff').innerHTML = CONFIG.loveLetter.signoff;

        // Reasons
        const reasonsEl = document.getElementById('reasons-grid');
        let reasonsHTML = '';
        CONFIG.reasons.forEach((reason, index) => {
            reasonsHTML += `
            <div class="reason-card liquid-glass tilt-element reveal-up delay-${(index % 3) + 1} hover-target">
                <div class="card-icon">${reason.icon}</div>
                <h3>${reason.title}</h3>
                <p>${reason.text}</p>
            </div>`;
        });
        reasonsEl.innerHTML = reasonsHTML;

        // Countdown Subtitle & Rings
        document.getElementById('countdown-subtitle').innerText = `Until our special day: ${CONFIG.countdownDate.split(' ')[0].replace(/,/g, ' ')}`;
        
        const countdownEl = document.getElementById('countdown');
        const timeUnits = ['days', 'hours', 'minutes', 'seconds'];
        let countdownHTML = '';
        timeUnits.forEach((unit) => {
            countdownHTML += `
            <div class="time-box hover-target">
                <svg class="time-svg" viewBox="0 0 100 100">
                    <circle class="time-ring-bg" cx="50" cy="50" r="45"></circle>
                    <circle class="time-ring-fill" id="ring-${unit}" cx="50" cy="50" r="45" stroke-dasharray="283" stroke-dashoffset="0"></circle>
                </svg>
                <span class="time-val" id="${unit}">00</span>
                <span class="time-label">${unit}</span>
            </div>`;
        });
        countdownEl.innerHTML = countdownHTML;

        document.getElementById('final-title').innerText = CONFIG.finalMessage.title;
        document.getElementById('final-subtitle').innerText = CONFIG.finalMessage.subtitle;
        document.getElementById('surprise-btn').innerText = CONFIG.finalMessage.buttonText;
    }

    /* --- Cursor & Magnetic UI --- */
    initCursorAndMagnetic() {
        const cursorDot = document.getElementById('cursor-dot');
        const cursorRing = document.getElementById('cursor-ring');
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let ringX = mouseX, ringY = mouseY;
        let lastMouseX = mouseX, lastMouseY = mouseY;

        if (!this.isMobile && !this.prefersReducedMotion) {
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                if(cursorDot) {
                    cursorDot.style.left = mouseX + 'px';
                    cursorDot.style.top = mouseY + 'px';
                }
                
                // Cursor Reactive Lighting (Liquid Glass)
                document.documentElement.style.setProperty('--mouse-x', `${(mouseX / window.innerWidth) * 100}%`);
                document.documentElement.style.setProperty('--mouse-y', `${(mouseY / window.innerHeight) * 100}%`);
            });

            const loopCursor = () => {
                ringX += (mouseX - ringX) * 0.15;
                ringY += (mouseY - ringY) * 0.15;
                if(cursorRing) {
                    cursorRing.style.left = ringX + 'px';
                    cursorRing.style.top = ringY + 'px';
                }
                requestAnimationFrame(loopCursor);
            };
            requestAnimationFrame(loopCursor);

            // Hover States
            document.querySelectorAll('.hover-target, a, button, .lightbox-trigger').forEach(el => {
                el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
                el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
            });
            
            // Magnetic Physics
            document.querySelectorAll('.magnetic-btn').forEach(btn => {
                btn.addEventListener('mousemove', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width/2;
                    const y = e.clientY - rect.top - rect.height/2;
                    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
                });
                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = `translate(0px, 0px)`;
                });
            });

            // 3D Tilt
            document.querySelectorAll('.tilt-element').forEach(el => {
                el.addEventListener('mousemove', (e) => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width/2;
                    const y = e.clientY - rect.top - rect.height/2;
                    el.style.transform = `perspective(1000px) rotateX(${-y/15}deg) rotateY(${x/15}deg) scale3d(1.02,1.02,1.02)`;
                });
                el.addEventListener('mouseleave', () => {
                    el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
                    el.style.transition = 'transform 0.6s var(--ease-spring)';
                });
                el.addEventListener('mouseenter', () => el.style.transition = 'none');
            });
        }
    }

    /* --- Scroll & Observers --- */
    initScrollObservers() {
        const parallaxLayers = document.querySelectorAll('.parallax-layer');
        const timelineProgress = document.querySelector('.timeline-progress');
        const timelineLine = document.querySelector('.timeline-line');
        let scrollTicking = false;
        
        window.addEventListener('scroll', () => {
            if(!scrollTicking) {
                window.requestAnimationFrame(() => {
                    const scrollY = window.scrollY;
                    
                    if(!this.isMobile && !this.prefersReducedMotion) {
                        parallaxLayers.forEach(layer => {
                            const speed = layer.getAttribute('data-speed');
                            const yPos = -(scrollY * speed);
                            layer.style.transform = `translate3d(0, ${yPos}px, 0)`;
                        });
                    }
                    
                    if(timelineLine && timelineProgress) {
                        const rect = timelineLine.getBoundingClientRect();
                        const winH = window.innerHeight;
                        if(rect.top < winH/2 && rect.bottom > 0) {
                            const amount = (winH/2) - rect.top;
                            const pct = Math.min(Math.max((amount / rect.height)*100, 0), 100);
                            timelineProgress.style.height = `${pct}%`;
                        }
                    }
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        });

        // Intersection Observer (Reveal Up)
        const revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.reveal-up:not(#typing-text-container)').forEach(el => revealObserver.observe(el));
    }

    /* --- Components (Timeline, Lightbox, Letter, Countdown) --- */
    initInteractiveComponents() {
        // Timeline Expand
        document.querySelectorAll('.timeline-content').forEach(item => {
            item.addEventListener('click', () => {
                const parent = item.parentElement;
                const isExpanded = parent.classList.contains('active');
                
                document.querySelectorAll('.timeline-item').forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.timeline-content').setAttribute('aria-expanded', 'false');
                });
                
                if(!isExpanded) {
                    parent.classList.add('active');
                    item.setAttribute('aria-expanded', 'true');
                }
            });
        });

        // Lightbox
        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightbox-img');
        const lbCap = document.getElementById('lightbox-caption');
        
        document.querySelectorAll('.lightbox-trigger').forEach(img => {
            img.addEventListener('click', (e) => {
                lbImg.src = e.target.src;
                lbCap.innerText = e.target.getAttribute('data-caption') || '';
                lightbox.classList.add('active');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLb = () => {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            setTimeout(() => lbImg.src = '', 500);
        };

        document.getElementById('lightbox-close').addEventListener('click', closeLb);
        lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLb(); });
        let touchSY = 0;
        lightbox.addEventListener('touchstart', e => touchSY = e.changedTouches[0].screenY, {passive: true});
        lightbox.addEventListener('touchend', e => { if (e.changedTouches[0].screenY - touchSY > 60) closeLb(); }, {passive: true});

        // Typing Letter
        const typeContainer = document.getElementById('typing-text-container');
        const signoff = document.getElementById('letter-signoff');
        let hasTyped = false;

        if (typeContainer) {
            const textToType = typeContainer.getAttribute('data-text').split('|');
            typeContainer.innerHTML = ''; 
            
            const typeObserver = new IntersectionObserver((entries) => {
                if(entries[0].isIntersecting && !hasTyped) {
                    hasTyped = true;
                    typeContainer.classList.add('typing-cursor');
                    let pIndex = 0, charIndex = 0;
                    let currentP = document.createElement('p');
                    typeContainer.appendChild(currentP);

                    const typeWriter = () => {
                        if (pIndex < textToType.length) {
                            if (charIndex < textToType[pIndex].length) {
                                currentP.innerHTML += textToType[pIndex].charAt(charIndex);
                                charIndex++;
                                setTimeout(typeWriter, 25);
                            } else {
                                pIndex++; charIndex = 0;
                                if (pIndex < textToType.length) {
                                    currentP = document.createElement('p');
                                    typeContainer.appendChild(currentP);
                                    setTimeout(typeWriter, 500); 
                                } else {
                                    typeContainer.classList.remove('typing-cursor');
                                    if (signoff) signoff.style.opacity = '1';
                                }
                            }
                        }
                    };
                    setTimeout(typeWriter, 500); 
                }
            }, { threshold: 0.6 });
            typeObserver.observe(document.getElementById('love-letter'));
        }

        // SVG Countdown Rings
        const targetTime = new Date(CONFIG.countdownDate).getTime();
        const updateCountdown = () => {
            const now = new Date().getTime();
            const dist = targetTime - now;

            if (dist < 0) return; 
            
            const uMap = {
                'days': { val: Math.floor(dist / (1000 * 60 * 60 * 24)), max: 365 },
                'hours': { val: Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), max: 24 },
                'minutes': { val: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)), max: 60 },
                'seconds': { val: Math.floor((dist % (1000 * 60)) / 1000), max: 60 }
            };

            for(let key in uMap) {
                const el = document.getElementById(key);
                const ring = document.getElementById(`ring-${key}`);
                if(el) el.innerText = uMap[key].val < 10 ? '0' + uMap[key].val : uMap[key].val;
                if(ring) {
                    const pct = uMap[key].val / uMap[key].max;
                    ring.style.strokeDashoffset = 283 - (283 * pct);
                }
            }
            requestAnimationFrame(updateCountdown);
        };
        requestAnimationFrame(updateCountdown);

        // Final Button
        const surpriseBtn = document.getElementById('surprise-btn');
        if (surpriseBtn) {
            surpriseBtn.addEventListener('click', () => {
                const rect = surpriseBtn.getBoundingClientRect();
                this.particles.triggerExplosion(rect.left + rect.width/2, rect.top + rect.height/2);
                this.audio.playSuccess();
                if(!this.audio.isPlaying) document.getElementById('music-toggle').click();
                
                setTimeout(() => alert("I will love you endlessly!"), 600);
            });
        }
    }

    /* --- Easter Eggs --- */
    initEasterEggs() {
        // Heart Click Surprises globally
        const heartContainer = document.getElementById('heart-click-container');
        document.body.addEventListener('click', (e) => {
            // Don't trigger on interactive elements to avoid overlap
            if(e.target.tagName === 'BUTTON' || e.target.closest('.timeline-item') || e.target.closest('.lightbox-trigger')) return;
            
            // Trigger mini burst on canvas
            this.particles.triggerMiniBurst(e.clientX, e.clientY);
            
            // HTML DOM float heart
            const heart = document.createElement('div');
            heart.innerText = '❤';
            heart.className = 'click-heart';
            heart.style.left = `${e.clientX - 10}px`;
            heart.style.top = `${e.clientY - 10}px`;
            heartContainer.appendChild(heart);
            setTimeout(() => heart.remove(), 1000);
        });

        // Konami Code for Fireworks
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiIndex = 0;
        document.addEventListener('keydown', (e) => {
            if (e.key === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    this.triggerKonamiFireworks();
                    konamiIndex = 0;
                }
            } else {
                konamiIndex = 0;
            }
        });
    }
    
    triggerKonamiFireworks() {
        this.audio.playSuccess();
        document.getElementById('hero-title').innerText = "You found the secret!";
        // Rapid multiple explosions
        let count = 0;
        const interval = setInterval(() => {
            this.particles.triggerExplosion(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
            count++;
            if(count > 10) clearInterval(interval);
        }, 300);
    }
}


/* --- Boot sequence --- */
window.addEventListener('load', () => {
    // Remove splash screen loader
    const loader = document.getElementById('loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.setAttribute('aria-hidden', 'true');
            setTimeout(() => loader.style.display = 'none', 1000);
        }, 1500); // 1.5s splash
    }
    
    // Init Application
    const app = new AppController();
});
