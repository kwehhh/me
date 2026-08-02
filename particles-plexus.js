/*
 * Interactive Particle Plexus — adapted from CodePen by xObsidian_Guyx618
 * (codepen.io/Arti-Gagarin/pen/RNojrjK). Self-contained: creates its own
 * fixed, transparent, click-through canvas behind the page so the navy
 * background shows through. Honors prefers-reduced-motion (static frame).
 *
 * Neon hues (cyan / purple / magenta / pink) suit the Tokyo Night palette.
 */
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'plexus';
  Object.assign(canvas.style, {
    position: 'fixed', top: '0', left: '0',
    width: '100vw', height: '100vh',
    zIndex: '0', pointerEvents: 'none',
  });
  document.body.insertBefore(canvas, document.body.firstChild);
  const ctx = canvas.getContext('2d');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let particles = [];
  const connectionDistance = 130;
  const mouse = { x: null, y: null, radius: 180 };

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.6; // half speed
      this.vy = (Math.random() - 0.5) * 0.6;
      this.radius = Math.random() * 2.5 + 1;

      const hues = [190, 270, 310, 340]; // cyan, purple, magenta, pink
      const randomHue = hues[Math.floor(Math.random() * hues.length)];
      this.color = `hsl(${randomHue}, 100%, 65%)`;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance < mouse.radius && distance > 0) {
          const force = (mouse.radius - distance) / mouse.radius;
          this.x += (dx / distance) * force * 2.5;
          this.y += (dy / distance) * force * 2.5;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 7500);
    for (let i = 0; i < numberOfParticles; i++) particles.push(new Particle());
  }

  let lastW = window.innerWidth;

  function sizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function resizeCanvas() {
    sizeCanvas();
    initParticles();
  }

  // Mobile browsers show/hide the URL bar as you scroll, which changes the
  // viewport HEIGHT and fires 'resize'. Rebuilding the particle field on every
  // such event made the plexus visibly reset/jump while scrolling on phones
  // (desktop never sees it — its height doesn't change on scroll). Fix: only
  // regenerate on an actual WIDTH change (orientation / real resize); for a
  // height-only change just keep the backing store matched so nothing stretches.
  function handleResize() {
    const w = window.innerWidth;
    const widthChanged = w !== lastW;
    lastW = w;
    sizeCanvas();
    if (widthChanged) initParticles();
    if (reduceMotion) { particles.forEach((p) => p.draw()); drawLines(); }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.hypot(dx, dy);
        if (distance < connectionDistance) {
          const opacity = 1 - distance / connectionDistance;
          const gradient = ctx.createLinearGradient(
            particles[i].x, particles[i].y, particles[j].x, particles[j].y
          );
          gradient.addColorStop(0, particles[i].color.replace('65%)', `65%, ${opacity * 0.4})`).replace('hsl', 'hsla'));
          gradient.addColorStop(1, particles[j].color.replace('65%)', `65%, ${opacity * 0.4})`).replace('hsl', 'hsla'));
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => { p.update(); p.draw(); });
    drawLines();
  }

  function animate() {
    renderFrame();
    requestAnimationFrame(animate);
  }

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
  window.addEventListener('resize', handleResize);

  resizeCanvas();
  if (reduceMotion) {
    // one static frame, no animation
    particles.forEach((p) => p.draw());
    drawLines();
  } else {
    animate();
  }
})();
