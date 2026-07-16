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
    
    // Total Days Together Anniversary Start Date
    startDate: "October 24, 2021",
    
    // Vault Intro Configuration
    intro: {
        pin: "0000",
        rememberUnlock: false, // If true, uses localStorage. If false, uses sessionStorage.
        introMode: true, // Enable or disable the cinematic intro
        introPhotos: [
            "https://images.unsplash.com/photo-1518199266791-5375a83164ba?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=600&q=80"
        ],
        skipIntroEnabled: true
    },
    
    // Reflection Page (Chapter 3 pauses)
    reflectionPage: {
        paragraph: "We write our names in the quiet places of the world. In the soft light of sunset, in the pages of books we share, and in the unspoken space between hello and forever. This is where we belong.",
        photo: "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?auto=format&fit=crop&w=600&q=80"
    },
    
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
        if(this.bgMusic) {
            this.bgMusic.src = CONFIG.audioUrl;
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
        this.bindDynamicSfx(document);
    }

    bindDynamicSfx(container = document) {
        container.querySelectorAll('.hover-target:not([data-sfx-hover-bound])').forEach(el => {
            el.setAttribute('data-sfx-hover-bound', 'true');
            el.addEventListener('mouseenter', () => this.playSfx(this.sfxHover));
        });
        container.querySelectorAll('.click-target:not([data-sfx-click-bound]), button:not([data-sfx-click-bound]), .lightbox-trigger:not([data-sfx-click-bound]), .timeline-content:not([data-sfx-click-bound])').forEach(el => {
            el.setAttribute('data-sfx-click-bound', 'true');
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
 * VaultIntro
 * Handles the premium PIN unlock and 3D scroll-driven intro sequence.
 */
class VaultIntro {
    constructor(onComplete) {
        this.onComplete = onComplete;
        this.pinScreen = document.getElementById('pin-screen');
        this.introScrollSpace = document.getElementById('intro-scroll-space');
        this.vaultIntro = document.getElementById('vault-intro');
        this.pinKeypad = document.getElementById('pin-keypad');
        this.pinDots = document.querySelectorAll('.pin-dots .dot');
        this.pinMessage = document.getElementById('pin-message');
        this.skipBtn = document.getElementById('skip-intro-btn');
        this.unlockSeq = document.getElementById('luxury-unlock-sequence');
        this.pinContainer = document.querySelector('.pin-container');
        
        this.currentPin = "";
        this.targetPin = CONFIG.intro.pin || "0000";
        this.isUnlocked = false;
        this.introFinished = false;
        
        // 3D Elements
        this.envelope = document.getElementById('intro-envelope');
        this.seal = document.getElementById('intro-seal');
        this.flap = document.querySelector('.env-flap');
        this.letter = document.getElementById('intro-letter');
        this.photosContainer = document.getElementById('intro-photos-container');
        this.phoneMockup = document.getElementById('intro-phone');
        this.phoneContent = document.getElementById('intro-phone-content');
        this.scrollPrompt = document.getElementById('intro-scroll-prompt');
        
        this.ticking = false;
        
        if (!CONFIG.intro.introMode || this.checkUnlockedState()) {
            this.finishIntro(true);
            return;
        }

        this.init();
    }

    checkUnlockedState() {
        if (CONFIG.intro.rememberUnlock && localStorage.getItem('vault_unlocked')) return true;
        if (sessionStorage.getItem('vault_unlocked')) return true;
        return false;
    }

    setUnlockedState() {
        sessionStorage.setItem('vault_unlocked', 'true');
        if (CONFIG.intro.rememberUnlock) {
            localStorage.setItem('vault_unlocked', 'true');
        }
    }

    init() {
        document.body.style.overflow = 'hidden'; // Lock page scroll
        window.scrollTo(0, 0);
        
        this.injectIntroContent();
        
        if (!CONFIG.intro.skipIntroEnabled) {
            this.skipBtn.style.display = 'none';
        } else {
            this.skipBtn.addEventListener('click', () => this.finishIntro(true));
        }

        // Keypad Clicks
        this.pinKeypad.addEventListener('click', (e) => {
            if (e.target.classList.contains('keypad-btn') && !e.target.classList.contains('empty')) {
                if (e.target.classList.contains('backspace')) {
                    this.handlePinInput('backspace');
                } else {
                    this.handlePinInput(e.target.innerText);
                }
            }
        });

        // Keyboard support
        this.keydownHandler = (e) => {
            if (e.key >= '0' && e.key <= '9') this.handlePinInput(e.key);
            else if (e.key === 'Backspace') this.handlePinInput('backspace');
        };
        document.addEventListener('keydown', this.keydownHandler);
    }

    injectIntroContent() {
        let photosHTML = '';
        CONFIG.intro.introPhotos.forEach((src, index) => {
            photosHTML += `<div class="intro-photo" id="intro-photo-${index}"><img src="${src}" alt="Intro Memory"></div>`;
        });
        this.photosContainer.innerHTML = photosHTML;
        this.phoneContent.innerHTML = `<img src="${CONFIG.intro.introPhotos[0]}" alt="Phone Memory">`;
    }

    handlePinInput(val) {
        if (this.isUnlocked) return;
        
        this.pinMessage.classList.remove('error');
        this.pinMessage.innerText = "Enter PIN to unlock";

        if (val === 'backspace') {
            this.currentPin = this.currentPin.slice(0, -1);
        } else if (this.currentPin.length < 4) {
            this.currentPin += val;
        }

        this.updateDots();

        if (this.currentPin.length === 4) {
            setTimeout(() => this.validatePin(), 200);
        }
    }

    updateDots() {
        this.pinDots.forEach((dot, index) => {
            if (index < this.currentPin.length) dot.classList.add('filled');
            else dot.classList.remove('filled');
        });
    }

    validatePin() {
        if (this.currentPin === this.targetPin) {
            this.triggerUnlockSequence();
        } else {
            this.pinContainer.classList.add('shake');
            this.pinMessage.classList.add('error');
            this.pinMessage.innerText = "Incorrect PIN. Try again.";
            
            // Allow vibration api if supported
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            setTimeout(() => {
                this.pinContainer.classList.remove('shake');
                this.currentPin = "";
                this.updateDots();
            }, 400);
        }
    }

    triggerUnlockSequence() {
        this.isUnlocked = true;
        this.setUnlockedState();
        document.removeEventListener('keydown', this.keydownHandler);
        
        // Luxury Unlock Animation
        this.pinKeypad.style.transition = 'opacity 0.5s';
        this.pinKeypad.style.opacity = '0';
        this.pinDots.forEach(d => d.style.opacity = '0');
        this.skipBtn.style.opacity = '0';
        
        this.unlockSeq.style.opacity = '1';
        const txt = this.unlockSeq.querySelector('.unlocking-text');
        const line = this.unlockSeq.querySelector('.golden-line');
        
        setTimeout(() => { txt.style.opacity = '1'; txt.style.transform = 'translateY(0)'; }, 500);
        setTimeout(() => { line.style.width = '200px'; }, 1000);
        
        // After sequence, fade pin screen and unlock scrolling for the intro space
        setTimeout(() => {
            this.pinScreen.style.opacity = '0';
            this.pinScreen.style.visibility = 'hidden';
            
            // Allow scrolling the page (which will scroll the 200vh intro space)
            document.body.style.overflow = '';
            
            this.bindScrollAnimation();
        }, 3000);
    }

    bindScrollAnimation() {
        this.scrollHandler = () => {
            if (!this.ticking) {
                window.requestAnimationFrame(() => {
                    this.updateScrollAnimation();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        };
        window.addEventListener('scroll', this.scrollHandler);
        this.updateScrollAnimation(); // initial
    }

    updateScrollAnimation() {
        const scrollY = window.scrollY;
        // The scroll space is 200vh. The animation happens over the first 100vh.
        const maxScroll = window.innerHeight * 1; 
        
        let progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
        
        if (progress > 0 && this.scrollPrompt) {
            this.scrollPrompt.style.opacity = '0';
        }

        // Phase 1 (0-20%): Rotate Envelope
        let envRotate = -30 + (progress * 5 * 30); // Goes to 0
        if (envRotate > 0) envRotate = 0;
        let envZ = -200 + (progress * 5 * 200);
        if (envZ > 0) envZ = 0;
        
        this.envelope.style.transform = `rotateY(${envRotate}deg) rotateX(10deg) translateZ(${envZ}px)`;

        // Phase 2 (20-40%): Seal breaks, flap opens
        let sealProgress = Math.max((progress - 0.2) * 5, 0);
        if (sealProgress > 0) this.seal.classList.add('broken');
        else this.seal.classList.remove('broken');
        
        let flapRotate = Math.min(sealProgress * 180, 180);
        this.flap.style.transform = `rotateX(${flapRotate}deg)`;

        // Phase 3 (40-70%): Letter & Photos slide up
        let extractProgress = Math.max((progress - 0.4) * 3.33, 0);
        let slideY = -(extractProgress * 150);
        this.letter.style.transform = `translateY(${slideY}px) translateZ(10px)`;
        
        const photos = this.photosContainer.querySelectorAll('.intro-photo');
        photos.forEach((photo, idx) => {
            let delay = idx * 0.1;
            let pProg = Math.max((extractProgress - delay) * 1.5, 0);
            pProg = Math.min(pProg, 1);
            
            let pY = -50 - (pProg * 120);
            let pRotZ = (idx % 2 === 0 ? -1 : 1) * pProg * 15;
            
            photo.style.opacity = pProg;
            photo.style.transform = `translate(-50%, ${pY}%) rotateZ(${pRotZ}deg) translateZ(${20 + (idx * 5)}px)`;
        });

        // Phase 4 (70-100%): Phone Mockup Rotates in
        let phoneProgress = Math.max((progress - 0.7) * 3.33, 0);
        let phoneScale = 0.5 + (phoneProgress * 0.5);
        let phoneRot = 90 - (phoneProgress * 90);
        let phoneZ = -500 + (phoneProgress * 500);
        
        this.phoneMockup.style.opacity = phoneProgress;
        this.phoneMockup.style.transform = `translate(-50%, -50%) rotateY(${phoneRot}deg) translateZ(${phoneZ}px) scale(${phoneScale})`;

        // End of intro fade out
        if (progress >= 1) {
            // Fade out the intro layer naturally as we scroll past 100vh
            let fadeProgress = Math.min(Math.max((scrollY - maxScroll) / (window.innerHeight * 0.5), 0), 1);
            this.vaultIntro.style.opacity = 1 - fadeProgress;
            
            if (fadeProgress >= 1 && !this.introFinished) {
                this.introFinished = true;
                this.finishIntro(false);
            }
        } else {
            this.vaultIntro.style.opacity = 1;
            this.introFinished = false;
        }
    }

    finishIntro(immediate) {
        if (this.scrollHandler) window.removeEventListener('scroll', this.scrollHandler);
        if (this.keydownHandler) document.removeEventListener('keydown', this.keydownHandler);
        
        document.body.style.overflow = '';
        
        if (immediate) {
            this.vaultIntro.style.display = 'none';
            window.scrollTo(0, 0);
        } else {
            // Do not display: none if scrolled naturally, to avoid removing 200vh and causing a scroll jump.
            // Just disable pointer events so it doesn't interfere.
            this.vaultIntro.style.pointerEvents = 'none';
        }
        
        if (this.onComplete) this.onComplete();
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
        this.injectData();
        this.initPWA();
        this.initTheme();
        this.initCursorAndMagnetic();
        this.initInteractiveComponents();
        
        // Defer heavy particle rendering and scroll observers until Intro finishes
        this.vaultIntro = new VaultIntro(() => {
            this.particles = new ParticleEngine(this.isMobile, this.isLowEnd, this.prefersReducedMotion);
            if (this.initEasterEggs) this.initEasterEggs();
            this.initScrollObservers();
        });
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

        // Compute Live Metadata Stats
        const start = new Date(CONFIG.startDate);
        const today = new Date();
        const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
        const daysEl = document.getElementById('days-together-val');
        if (daysEl) daysEl.innerText = diff;

        // Current Time of Day Mood
        const hour = today.getHours();
        let mood = '☀️ Afternoon';
        if (hour >= 5 && hour < 12) mood = '🌅 Morning';
        else if (hour >= 12 && hour < 17) mood = '☀️ Afternoon';
        else if (hour >= 17 && hour < 20) mood = '🌇 Sunset';
        else mood = '🌙 Night';
        const moodEl = document.getElementById('mood-val');
        if (moodEl) moodEl.innerText = mood;

        // Timeline
        const timelineEl = document.getElementById('timeline-injection-point');
        let timelineHTML = '';
        CONFIG.timeline.forEach((item, index) => {
            let mediaHTML = '';
            if (item.image) mediaHTML = `<img src="${item.image}" alt="Timeline Memory" loading="lazy">`;
            else if (item.video) mediaHTML = `<video src="${item.video}" autoplay loop muted playsinline></video>`;
            
            // Age older memories chronologically
            const agedClass = index < (CONFIG.timeline.length / 2) ? ' aged-memory' : '';
            
            timelineHTML += `
            <div class="timeline-item reveal-up delay-${(index % 3) + 1}">
                <div class="timeline-dot"></div>
                <div class="timeline-content liquid-glass tilt-element hover-target${agedClass}" role="button" aria-expanded="false" tabindex="0">
                    <span class="timeline-date">${item.date}</span>
                    <h3>${item.title}</h3>
                    <p>${item.text}</p>
                    ${mediaHTML ? `<div class="timeline-media">${mediaHTML}</div>` : ''}
                </div>
            </div>`;
        });
        timelineEl.innerHTML = timelineHTML;

        // Reflection Page
        const reflectTextEl = document.getElementById('reflection-text-val');
        const reflectPhotoEl = document.getElementById('reflection-photo-val');
        if (reflectTextEl) reflectTextEl.innerText = CONFIG.reflectionPage.paragraph;
        if (reflectPhotoEl) reflectPhotoEl.src = CONFIG.reflectionPage.photo;

        // Gallery Masonry
        const galleryEl = document.getElementById('gallery-masonry');
        let galleryHTML = '';
        CONFIG.gallery.forEach((item, index) => {
            const rotationDeg = (Math.random() * 10 - 5).toFixed(1);
            // Age older memories chronologically
            const agedClass = index < (CONFIG.gallery.length / 2) ? ' aged-memory' : '';
            
            galleryHTML += `
            <div class="gallery-item reveal-up delay-${(index % 3) + 1} hover-target${agedClass}" style="transform: rotate(${rotationDeg}deg);">
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

        // Bind SFX to dynamically injected elements
        if (this.audio) {
            this.audio.bindDynamicSfx(document);
        }
    }

    /* --- Cursor & Magnetic UI --- */
    initCursorAndMagnetic() {
        const cursorDot = document.getElementById('cursor-dot');
        const cursorRing = document.getElementById('cursor-ring');
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
        let ringX = mouseX, ringY = mouseY;
        let lastMouseX = mouseX, lastMouseY = mouseY;

        if (!this.isMobile && !this.prefersReducedMotion) {
            document.body.classList.add('custom-cursor-active');
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

        // Chapter Observers (Editorial Story)
        this.currentChapter = 1;
        const chapters = document.querySelectorAll('.chapter');
        
        const chapterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const chNum = parseInt(entry.target.getAttribute('data-chapter'));
                    const bgMood = entry.target.getAttribute('data-bg');
                    
                    if (chNum && chNum !== this.currentChapter) {
                        this.triggerPageFlip(bgMood, chNum);
                    }
                }
            });
        }, { threshold: 0.25, rootMargin: '-10% 0px -40% 0px' });
        
        chapters.forEach(ch => chapterObserver.observe(ch));

        // Interactive progress timeline clicks (with keyboard accessibility)
        const progressNodes = document.querySelectorAll('.progress-node');
        progressNodes.forEach(node => {
            node.setAttribute('role', 'button');
            node.setAttribute('tabindex', '0');
            const chName = node.querySelector('.node-label') ? node.querySelector('.node-label').innerText : '';
            node.setAttribute('aria-label', `Navigate to ${chName}`);

            const navigate = () => {
                const targetId = node.getAttribute('data-target');
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            };
            node.addEventListener('click', navigate);
            node.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate();
                }
            });
        });

        // Collapsible Sidebar Progress Menu Logic
        const toggleBtn = document.getElementById('progress-menu-toggle');
        const progressEl = document.getElementById('chapter-progress');
        if (toggleBtn && progressEl) {
            const toggleSidebar = (e) => {
                e.stopPropagation();
                const isExpanded = progressEl.classList.contains('expanded');
                if (isExpanded) {
                    progressEl.classList.remove('expanded');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                } else {
                    progressEl.classList.add('expanded');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                }
            };
            toggleBtn.addEventListener('click', toggleSidebar);
            
            // Support touch swipe gestures on the sidebar
            let startX = 0;
            progressEl.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, { passive: true });
            
            progressEl.addEventListener('touchmove', (e) => {
                const moveX = e.touches[0].clientX;
                const diffX = moveX - startX;
                // Swipe right to close on mobile
                if (diffX > 40 && progressEl.classList.contains('expanded')) {
                    progressEl.classList.remove('expanded');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            }, { passive: true });

            // Keyboard Escape key to close
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && progressEl.classList.contains('expanded')) {
                    progressEl.classList.remove('expanded');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.focus();
                }
            });

            // Close when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 768 && progressEl.classList.contains('expanded') && !progressEl.contains(e.target)) {
                    progressEl.classList.remove('expanded');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

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

    triggerPageFlip(bgMood, chNum) {
        const overlay = document.getElementById('page-flip-overlay');
        const overlayActive = overlay && overlay.classList.contains('flip-active');
        
        if (overlayActive) return;

        this.currentChapter = chNum;
        this.updateProgressIndicator(chNum);

        // Apply cinematic focus blur to viewport wrapper during active transition
        const wrapper = document.getElementById('smooth-scroll-wrapper');
        if (wrapper) wrapper.classList.add('focus-blurred');
        setTimeout(() => {
            if (wrapper) wrapper.classList.remove('focus-blurred');
        }, 300); // 300ms focus blur duration

        if (overlay) {
            overlay.classList.add('flip-active');
            
            if (this.audio) this.audio.playClick();

            setTimeout(() => {
                document.body.className = document.body.className.replace(/\bmood-\S+/g, '');
                document.body.classList.add(`mood-${bgMood}`);
                
                if (this.particles) {
                    if (chNum === 1 || chNum === 5) {
                        this.particles.butterflyRate = 0.005;
                    } else if (chNum === 4) {
                        this.particles.butterflyRate = 0.02;
                    } else {
                        this.particles.butterflyRate = 0.01;
                    }
                }
            }, 300);

            setTimeout(() => {
                overlay.classList.remove('flip-active');
            }, 600);
        } else {
            document.body.className = document.body.className.replace(/\bmood-\S+/g, '');
            document.body.classList.add(`mood-${bgMood}`);
        }
    }

    updateProgressIndicator(chNum) {
        const line = document.getElementById('chapter-progress-line');
        if (line) {
            line.style.height = `${((chNum - 1) / 6) * 100}%`;
        }
        const nodes = document.querySelectorAll('.progress-node');
        nodes.forEach(node => {
            const nodeCh = parseInt(node.getAttribute('data-ch'));
            if (nodeCh < chNum) {
                node.classList.add('completed');
                node.classList.remove('active');
            } else if (nodeCh === chNum) {
                node.classList.add('active');
                node.classList.remove('completed');
            } else {
                node.classList.remove('active', 'completed');
            }
        });
    }

    /* --- Components (Timeline, Lightbox, Letter, Countdown) --- */
    initInteractiveComponents() {
        // Timeline Expand (with keyboard accessibility)
        document.querySelectorAll('.timeline-content').forEach(item => {
            const toggleExpand = () => {
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
            };
            item.addEventListener('click', toggleExpand);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleExpand();
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
            
            const typeObserver = new IntersectionObserver((entries, obs) => {
                if(entries[0].isIntersecting && !hasTyped) {
                    hasTyped = true;
                    obs.unobserve(entries[0].target);
                    typeContainer.classList.add('typing-cursor');
                    
                    // Unfold the envelope paper container once when first viewed
                    const envelopeEl = document.querySelector('#love-letter .envelope');
                    if (envelopeEl) envelopeEl.classList.add('unfolded');

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
                    setTimeout(typeWriter, 1700); 
                    
                    // Fade in the signoff with the same timing
                    if (signoff) {
                        signoff.style.transition = 'opacity 1.5s ease 1.7s';
                    }
                }
            }, { threshold: 0.6 });
            typeObserver.observe(document.getElementById('love-letter'));
        }

        // SVG Countdown Rings (optimized second-based throttling)
        const targetTime = new Date(CONFIG.countdownDate).getTime();
        let lastSecond = -1;
        const updateCountdown = () => {
            const now = Date.now();
            const dist = targetTime - now;

            if (dist < 0) return; 
            
            const currentSecond = Math.floor(dist / 1000) % 60;
            if (currentSecond !== lastSecond) {
                lastSecond = currentSecond;
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
            }
            requestAnimationFrame(updateCountdown);
        };
        requestAnimationFrame(updateCountdown);

        const surpriseBtn = document.getElementById('surprise-btn');
        const outroOverlay = document.getElementById('book-closing-outro');
        if (surpriseBtn && outroOverlay) {
            surpriseBtn.addEventListener('click', () => {
                const rect = surpriseBtn.getBoundingClientRect();
                this.particles.triggerExplosion(rect.left + rect.width/2, rect.top + rect.height/2);
                this.audio.playSuccess();
                if(!this.audio.isPlaying) {
                    const musicToggle = document.getElementById('music-toggle');
                    if (musicToggle) musicToggle.click();
                }
                
                // Transition to book outro sequence
                setTimeout(() => {
                    outroOverlay.classList.add('active');
                }, 1000);
                
                // Fade elements out to total black screen after sequence concludes
                setTimeout(() => {
                    outroOverlay.classList.add('outro-fade-black');
                }, 13000);
            });

            // Bind click-to-replay reset logic on the golden heart of the closed book
            const goldHeart = outroOverlay.querySelector('.cover-gold-heart');
            if (goldHeart) {
                goldHeart.style.cursor = 'pointer';
                goldHeart.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent duplicate trigger on overlay click
                    outroOverlay.classList.remove('active', 'outro-fade-black');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }

            // Click anywhere on the black outro screen after fade to black to reset/replay
            outroOverlay.addEventListener('click', () => {
                if (outroOverlay.classList.contains('outro-fade-black')) {
                    outroOverlay.classList.remove('active', 'outro-fade-black');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
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
