/* ==========================================================
   Aadarsh Kumar Jha — Portfolio  ·  interactions
   Vanilla JS, no dependencies.
   ========================================================== */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const EMAIL = 'jhaaadarsh6@gmail.com';
  const LINKS = {
    github: 'https://github.com/Aadarshjha-4',
    kaggle: 'https://www.kaggle.com/aadarsh04',
  };

  /* ---------------- theme ---------------- */
  let particleRGB = '122,168,255';
  const readParticleColor = () => {
    particleRGB = getComputedStyle(root).getPropertyValue('--particle').trim() || particleRGB;
  };
  const setTheme = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (_) { /* storage can be blocked */ }
    readParticleColor();
  };
  const toggleTheme = () => setTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
  readParticleColor();
  $('#themeBtn').addEventListener('click', toggleTheme);

  /* ---------------- toast ---------------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  };
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = EMAIL; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (__) { /* ignore */ }
      ta.remove();
    }
    toast('Email copied to clipboard ✓');
  };
  $$('[data-copy-email]').forEach((b) => b.addEventListener('click', copyEmail));

  /* ---------------- scroll progress ---------------- */
  const bar = $('#progress');
  let ticking = false;
  const updateProgress = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? Math.min(scrollY / h, 1) : 0})`;
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* ---------------- reveal on scroll ---------------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
      setTimeout(() => e.target.classList.add('settled'), 1300);
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    revealIO.observe(el);
  });

  /* ---------------- count-up ---------------- */
  const fmt = (n, d) => n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      const el = e.target;
      const to = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      const suf = el.dataset.suffix || '';
      if (reduce) { el.textContent = fmt(to, dec) + suf; return; }
      const dur = 1600, t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(to * eased, dec) + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------------- typewriter ---------------- */
  const typedEl = $('#typed');
  const roles = ['Data Analyst → Data Engineer', 'SQL & Python Pipeline Builder', 'ETL · EDA · BI Storyteller', 'Aspiring Data Engineer'];
  if (reduce) {
    typedEl.textContent = roles.join(' · ');
  } else {
    let r = 0, c = 0, del = false;
    const loop = () => {
      const word = roles[r];
      typedEl.textContent = word.slice(0, c);
      if (!del && c < word.length) { c++; setTimeout(loop, 70); }
      else if (!del) { del = true; setTimeout(loop, 1500); }
      else if (c > 0) { c--; setTimeout(loop, 35); }
      else { del = false; r = (r + 1) % roles.length; setTimeout(loop, 250); }
    };
    loop();
  }

  /* ---------------- marquee (clone for seamless loop) ---------------- */
  const track = $('.track');
  if (track) track.innerHTML += track.innerHTML;

  /* ---------------- tilt, spotlight, parallax ---------------- */
  $$('.glass').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
      if (el.classList.contains('tilt') && !reduce && fine) {
        const max = el.classList.contains('hero') || el.classList.contains('contact') ? 2.5 : 6;
        el.style.setProperty('--ry', `${((x / r.width - 0.5) * max * 2).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-(y / r.height - 0.5) * max * 2).toFixed(2)}deg`);
      }
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  });

  const depthEls = $$('[data-depth]');
  if (fine && !reduce && depthEls.length) {
    addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      depthEls.forEach((el) => {
        const d = parseFloat(el.dataset.depth);
        el.style.transform = `translate3d(${nx * d}px, ${ny * d}px, 0)`;
      });
    }, { passive: true });
  }

  /* ---------------- magnetic buttons ---------------- */
  if (fine && !reduce) {
    $$('.magnetic').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------------- custom cursor ---------------- */
  if (fine) {
    root.classList.add('has-cursor');
    const ring = $('.cursor-ring'), dot = $('.cursor-dot');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
    }, { passive: true });
    const follow = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(follow);
    };
    follow();
    document.addEventListener('pointerover', (e) => {
      ring.classList.toggle('hover', !!e.target.closest('a, button, .chip, .step, li[role="option"], input'));
    });
  }

  /* ---------------- active nav link ---------------- */
  const navLinks = $$('.dock a');
  const sections = navLinks.map((a) => $(a.getAttribute('href')));
  const navIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((a) => {
          const on = a.getAttribute('href') === `#${e.target.id}`;
          a.classList.toggle('active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => s && navIO.observe(s));

  /* ---------------- particle network (data-nodes) ---------------- */
  const cv = $('#bg');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, nodes = [];
  const mouse = { x: -9999, y: -9999 };
  const LINK = 130;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = `${W}px`; cv.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(110, Math.floor((W * H) / 15000));
    nodes = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.7,
    }));
  };

  const draw = (animate) => {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      if (animate) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        const dx = mouse.x - a.x, dy = mouse.y - a.y, d = Math.hypot(dx, dy);
        if (d < 170 && d > 0) { a.x += (dx / d) * 0.35; a.y += (dy / d) * 0.35; }
      }
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleRGB},.75)`;
      ctx.fill();
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${particleRGB},${(1 - d / LINK) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < 170) {
        ctx.strokeStyle = `rgba(${particleRGB},${(1 - md / 170) * 0.5})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
  };
  const animateBg = () => { draw(true); requestAnimationFrame(animateBg); };

  resize();
  addEventListener('resize', () => { resize(); if (reduce) draw(false); });
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  if (reduce) draw(false); else animateBg();

  /* ---------------- command palette (Ctrl/⌘ + K) ---------------- */
  const palette = $('#palette'), pInput = $('#pInput'), pList = $('#pList');
  const go = (hash) => { const t = $(hash); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
  const open = (url) => window.open(url, '_blank', 'noopener');
  const commands = [
    { t: 'Go to Home',           k: 'NAVIGATE', run: () => go('#home') },
    { t: 'Go to About',          k: 'NAVIGATE', run: () => go('#about') },
    { t: 'Go to Data Engineering', k: 'NAVIGATE', run: () => go('#learning') },
    { t: 'Go to Skills',         k: 'NAVIGATE', run: () => go('#skills') },
    { t: 'Go to Experience',     k: 'NAVIGATE', run: () => go('#experience') },
    { t: 'Go to Projects',       k: 'NAVIGATE', run: () => go('#projects') },
    { t: 'Go to Certifications', k: 'NAVIGATE', run: () => go('#certifications') },
    { t: 'Go to Contact',        k: 'NAVIGATE', run: () => go('#contact') },
    { t: 'Copy email address',   k: 'ACTION',   run: copyEmail },
    { t: 'Toggle dark / light theme', k: 'ACTION', run: toggleTheme },
    { t: 'Open GitHub',          k: 'LINK',     run: () => open(LINKS.github) },
    { t: 'Open Kaggle',          k: 'LINK',     run: () => open(LINKS.kaggle) },
  ];
  let shown = commands, sel = 0, lastFocus = null;

  const renderList = () => {
    pList.innerHTML = '';
    if (!shown.length) {
      const li = document.createElement('li');
      li.className = 'empty'; li.textContent = 'No matching commands';
      pList.appendChild(li); return;
    }
    shown.forEach((c, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      if (i === sel) li.className = 'sel';
      li.innerHTML = `<span></span><small>${c.k}</small>`;
      li.firstChild.textContent = c.t;
      li.addEventListener('pointermove', () => { if (sel !== i) { sel = i; renderList(); } });
      li.addEventListener('click', () => run(c));
      pList.appendChild(li);
    });
    const active = $('.sel', pList);
    if (active) active.scrollIntoView({ block: 'nearest' });
  };
  const openPalette = () => {
    lastFocus = document.activeElement;
    palette.hidden = false; pInput.value = ''; shown = commands; sel = 0;
    renderList(); pInput.focus();
  };
  const closePalette = () => {
    palette.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  const run = (c) => { closePalette(); setTimeout(c.run, 50); };

  pInput.addEventListener('input', () => {
    const q = pInput.value.trim().toLowerCase();
    shown = commands.filter((c) => c.t.toLowerCase().includes(q));
    sel = 0; renderList();
  });
  pInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (shown.length) { sel = (sel + 1) % shown.length; renderList(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) { sel = (sel - 1 + shown.length) % shown.length; renderList(); } }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown[sel]) run(shown[sel]); }
  });
  $$('[data-close]', palette).forEach((el) => el.addEventListener('click', closePalette));
  $('#paletteBtn').addEventListener('click', openPalette);
  addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); palette.hidden ? openPalette() : closePalette();
    } else if (e.key === 'Escape' && !palette.hidden) closePalette();
  });

  $('#yr').textContent = new Date().getFullYear();
})();