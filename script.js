/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO BI — María Jesús Quirós Castro
   Interacciones: reveal, count-up, parallax, progress, tabs
═══════════════════════════════════════════════════════════════ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── DOM references ────────────────────────────────────────────
const progressBar = document.getElementById('progressBar');
const navbar      = document.getElementById('navbar');
const heroCard    = document.getElementById('heroCard');
const scrollCue   = document.getElementById('scrollCue');
const glowA       = document.querySelector('.glow-a');
const glowB       = document.querySelector('.glow-b');
const ccModeLabel = document.getElementById('ccModeLabel');
const ccTabs      = document.querySelectorAll('.cc-tab');

// ── Scroll state ──────────────────────────────────────────────
let lastScrollY = 0;
let ticking = false;

function onFrame(scrollY) {
  const docH    = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docH > 0 ? Math.min(scrollY / docH, 1) : 0;

  // Progress bar
  progressBar.style.width = `${progress * 100}%`;

  // Navbar glass effect
  navbar.classList.toggle('scrolled', scrollY > 60);

  // Scroll cue fade
  if (scrollCue) {
    scrollCue.style.opacity = scrollY > 80 ? '0' : '1';
  }

  // Parallax — only while hero is in view, skip if reduced motion
  if (!prefersReducedMotion && scrollY < window.innerHeight * 1.2) {
    if (glowA) glowA.style.transform = `translate3d(0, ${scrollY * 0.18}px, 0)`;
    if (glowB) glowB.style.transform = `translate3d(0, ${scrollY * 0.12}px, 0)`;
    if (heroCard) heroCard.style.transform = `translate3d(0, ${scrollY * -0.07}px, 0)`;
  }
}

window.addEventListener('scroll', () => {
  lastScrollY = window.scrollY;
  if (!ticking) {
    requestAnimationFrame(() => {
      onFrame(lastScrollY);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// Run once on load
onFrame(window.scrollY);

// ── Reveal on scroll ──────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('is-visible'), delay);
    revealObserver.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach((el) => revealObserver.observe(el));

// ── Count-up animation ────────────────────────────────────────
const counters = document.querySelectorAll('[data-counter]');

function animateCounter(el) {
  const target   = parseInt(el.dataset.counter, 10);
  const duration = prefersReducedMotion ? 0 : 1400;
  const start    = performance.now();

  /* Store final value as aria-label so screen readers get it immediately */
  el.setAttribute('aria-label', String(target));

  if (duration === 0) { el.textContent = target; return; }

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });

counters.forEach((el) => counterObserver.observe(el));

// ── KPI progress bars ─────────────────────────────────────────
const fills = document.querySelectorAll('.kpi-fill');

const fillObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el  = entry.target;
    const val = parseFloat(el.dataset.fill) / 100;
    el.style.setProperty('--fill', val);
    /* rAF to allow transition to fire after initial render */
    requestAnimationFrame(() => el.classList.add('animated'));
    fillObserver.unobserve(el);
  });
}, { threshold: 0.5 });

fills.forEach((el) => fillObserver.observe(el));

// ── Maturity matrix cell reveal ───────────────────────────────
const matrixEl = document.querySelector('.maturity-matrix');
const matrixCells = document.querySelectorAll('.mc');

if (matrixEl) {
  const matrixObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    const delay = prefersReducedMotion ? 0 : 30;
    matrixCells.forEach((cell, i) => {
      setTimeout(() => cell.classList.add('revealed'), i * delay);
    });
    matrixObserver.disconnect();
  }, { threshold: 0.3 });
  matrixObserver.observe(matrixEl);
}

// ── Command Center card tabs ──────────────────────────────────
ccTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    ccTabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    if (ccModeLabel) ccModeLabel.textContent = tab.dataset.mode || '';
  });
});

// ── Hero bars animated entry ──────────────────────────────────
// The hero bars start at height 0 via CSS and animate to their --h value
// when the card enters the viewport (handled by the reveal observer above)
// No extra JS needed — CSS --h custom property handles it.

// ── Particle system ───────────────────────────────────────────
if (!prefersReducedMotion) {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas ? canvas.getContext('2d') : null;

  if (canvas && ctx) {
    const PARTICLE_COUNT = 130;
    const CONNECTION_DIST = 150;
    const MOUSE_REPEL_DIST = 180;
    const MOUSE_REPEL_FORCE = 0.07;
    const BASE_SPEED = 0.32;

    const mouse = { x: -9999, y: -9999 };

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    class Particle {
      constructor() { this.reset(true); }

      reset(init = false) {
        this.x  = Math.random() * canvas.width;
        this.y  = init ? Math.random() * canvas.height : (Math.random() < 0.5 ? -4 : canvas.height + 4);
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED * (0.6 + Math.random() * 0.8);
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.radius = 1.4 + Math.random() * 1.4;
        // teal / white / gold mix
        const palette = ['rgba(20,184,166,', 'rgba(240,238,232,', 'rgba(200,150,62,'];
        this.colorBase = palette[Math.floor(Math.random() * palette.length)];
        this.alpha = 0.25 + Math.random() * 0.45;
      }

      update() {
        // Mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL_DIST && dist > 0) {
          const force = (1 - dist / MOUSE_REPEL_DIST) * MOUSE_REPEL_FORCE;
          this.vx += (dx / dist) * force * 9;
          this.vy += (dy / dist) * force * 9;
        }

        // Damping — más lento para que el rebote se aprecie
        this.vx *= 0.97;
        this.vy *= 0.97;

        // Ensure minimum speed
        const spd = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (spd < BASE_SPEED * 0.4) {
          this.vx += (Math.random() - 0.5) * 0.04;
          this.vy += (Math.random() - 0.5) * 0.04;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Wrap edges
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        if (this.y < -10) this.y = canvas.height + 10;
        if (this.y > canvas.height + 10) this.y = -10;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colorBase + this.alpha + ')';
        ctx.fill();
      }
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(20,184,166,${alpha})`;
            ctx.lineWidth   = 0.7;
            ctx.stroke();
          }
        }
      }
    }

    function particleLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawConnections();
      particles.forEach((p) => { p.update(); p.draw(); });
      requestAnimationFrame(particleLoop);
    }

    particleLoop();
  }
}

// ── Smooth anchor navigation (offset for fixed navbar) ───────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const navbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h'), 10) || 68;
    const top = target.getBoundingClientRect().top + window.scrollY - navbarH - 16;
    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
});
