/* =========================================================
   LEONARDO MÁRQUEZ — PORTAFOLIO
   Vanilla JavaScript (sin dependencias)
   ========================================================= */

(() => {
  'use strict';

  /* --------------------------------------------------------
     0. LIMPIEZA AUTOMÁTICA DIARIA
        Borra cualquier dato local (historial de chat, etc.)
        cada 24 horas para que nada se acumule.
  --------------------------------------------------------- */
  const STORE_PREFIX = 'lm_';
  const CLEAN_KEY    = 'lm_last_cleanup';
  const ONE_DAY_MS   = 24 * 60 * 60 * 1000;

  function dailyCleanup() {
    try {
      const last = parseInt(localStorage.getItem(CLEAN_KEY) || '0', 10);
      const now  = Date.now();
      if (!last || now - last > ONE_DAY_MS) {
        Object.keys(localStorage)
          .filter(k => k.startsWith(STORE_PREFIX) && k !== CLEAN_KEY)
          .forEach(k => localStorage.removeItem(k));
        localStorage.setItem(CLEAN_KEY, String(now));
      }
    } catch (e) { /* localStorage no disponible: seguimos en memoria */ }
  }
  dailyCleanup();
  // Re-chequea cada hora por si el visitante deja la pestaña abierta
  setInterval(dailyCleanup, 60 * 60 * 1000);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch      = window.matchMedia('(hover: none)').matches || ('ontouchstart' in window);

  /* --------------------------------------------------------
     0b. CORRECCIONES DE ANIMACIONES PARA MÓVIL
         Reduce/detiene animaciones costosas en pantallas táctiles
         para evitar jitter, vibración y alto consumo de batería.
  --------------------------------------------------------- */
  if (isTouch || window.innerWidth < 900) {
    const mobileStyle = document.createElement('style');
    mobileStyle.id = 'lm-mobile-perf';
    mobileStyle.textContent = `
      /* --- Desactivar partículas de fondo (10 elementos animados) --- */
      .site-bg-particles { display: none !important; }

      /* --- Detener la línea de escaneo (scan) --- */
      .site-bg-scan { display: none !important; }

      /* --- Orbs: sin blur ni movimiento (muy costoso en GPU móvil) --- */
      .site-bg-orb {
        filter: none !important;
        animation: none !important;
        opacity: 0.08 !important;
        transform: none !important;
      }

      /* --- Grid de fondo: sin movimiento continuo --- */
      .site-bg-grid { animation: none !important; }

      /* --- Íconos flotantes del hero: mucho más suaves --- */
      .float-icon {
        animation-duration: 8s !important;
        animation-timing-function: ease-in-out !important;
      }
      @keyframes floatIcon {
        0%,100% { transform: translateY(0px); }
        50%      { transform: translateY(-6px); }
      }

      /* --- Marquee: velocidad normal (no acelerar) --- */
      .marquee-track { animation-duration: 55s !important; }

      /* --- FAB personaje: flotado suave y lento --- */
      @keyframes fabFloat {
        0%,100% { transform: translateY(0px); }
        50%      { transform: translateY(-5px); }
      }
      .chat-fab:not(.hidden) {
        animation: fabFloat 4.5s ease-in-out infinite !important;
      }

      /* --- Puntos de typing del chat: menos vibrantes --- */
      @keyframes typing {
        0%,60%,100% { opacity: .3; transform: translateY(0); }
        30%         { opacity: 1;  transform: translateY(-3px); }
      }
      .typing span { animation-duration: 1.6s !important; }

      /* --- Pulsación del estado (dot verde) --- */
      @keyframes pulse {
        0%,100% { opacity: 1; }
        50%     { opacity: .35; }
      }
      .status-dot, .chat-status .dot {
        animation-duration: 2.5s !important;
      }

      /* --- Reveal: sin translate para evitar repaint costoso --- */
      @media (max-width: 900px) {
        .reveal { transform: none !important; opacity: 0; }
        .reveal.in-view { opacity: 1; transition: opacity 0.7s ease !important; }
      }

      /* --- Scroll progress bar: sin transición rápida --- */
      .scroll-progress { transition: none !important; }
    `;
    document.head.appendChild(mobileStyle);
  }

  /* --------------------------------------------------------
     1. Custom Cursor (solo escritorio con mouse)
  --------------------------------------------------------- */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot && ring && !isTouch && window.matchMedia('(min-width: 901px)').matches) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('a, button, .project-card, .filter, .tools span').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('active'));
      el.addEventListener('mouseleave', () => ring.classList.remove('active'));
    });
  } else if (dot && ring) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
  }

  /* --------------------------------------------------------
     2. Scroll progress + nav scrolled state + active link
  --------------------------------------------------------- */
  const progress = document.getElementById('scroll-progress');
  const nav      = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = ['inicio','about','services','portfolio','contact']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  function onScroll() {
    const top = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = ((top / Math.max(max,1)) * 100) + '%';
    if (nav)      nav.classList.toggle('scrolled', top > 40);

    const y = top + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach(s => { if (s.offsetTop <= y) current = s; });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + (current ? current.id : ''));
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------
     3. Mobile nav toggle
  --------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navList   = document.getElementById('nav-links');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => navList.classList.toggle('open'));
    navList.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navList.classList.remove('open')));
  }

  /* --------------------------------------------------------
     4. Reveal on scroll
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => io.observe(el));

  /* --------------------------------------------------------
     5. Counters (stats)
  --------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-counter]');
  const ioCounter = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.counter;
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      ioCounter.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => ioCounter.observe(c));

  /* --------------------------------------------------------
     6. Skill bars
  --------------------------------------------------------- */
  const skills = document.querySelectorAll('.skill');
  const ioSkill = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const skill = e.target;
      const level = +skill.dataset.level;
      const fill  = skill.querySelector('.skill-fill');
      const pct   = skill.querySelector('.skill-pct');
      if (fill) fill.style.width = level + '%';
      const duration = 1500;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        if (pct) pct.textContent = Math.floor(level * eased) + '%';
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      ioSkill.unobserve(skill);
    });
  }, { threshold: 0.4 });
  skills.forEach(s => ioSkill.observe(s));

  /* --------------------------------------------------------
     7. Rotating word in hero title
  --------------------------------------------------------- */
  const rotEl = document.getElementById('rotating-word');
  if (rotEl && !reduceMotion) {
    const words = ['Análisis', 'Diseño', 'Sistemas', 'Código', 'Soluciones'];
    let i = 0;
    setInterval(() => {
      i = (i + 1) % words.length;
      rotEl.style.opacity = '0';
      rotEl.style.transform = 'translateY(-12px)';
      setTimeout(() => {
        rotEl.textContent = words[i];
        rotEl.style.transition = 'opacity .4s ease, transform .4s ease';
        rotEl.style.opacity = '1';
        rotEl.style.transform = 'translateY(0)';
      }, 250);
    }, 2400);
    rotEl.style.transition = 'opacity .3s ease, transform .3s ease';
  }

  /* --------------------------------------------------------
     8. Mouse parallax (solo escritorio)
  --------------------------------------------------------- */
  const hero = document.getElementById('inicio');
  const parallaxEls = hero ? hero.querySelectorAll('[data-parallax]') : [];
  if (hero && parallaxEls.length && !reduceMotion && !isTouch) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const cx = (e.clientX - rect.left - rect.width / 2)  / rect.width;
      const cy = (e.clientY - rect.top  - rect.height / 2) / rect.height;
      parallaxEls.forEach(el => {
        const f = parseFloat(el.dataset.parallax || '0.4');
        el.style.transform = `translate(${cx * 30 * f}px, ${cy * 30 * f}px)`;
      });
    });
  }

  /* --------------------------------------------------------
     9. Blob morph animation (SVG path)
  --------------------------------------------------------- */
  const blob = document.getElementById('blob-path');
  // Blob morph desactivado en móvil (evita repaint/reflow en SVG)
  if (blob && !reduceMotion && !isTouch && window.innerWidth >= 900) {
    const paths = [
      'M380.5,322.5Q334,395,248.5,396Q163,397,117.5,323.5Q72,250,111,171Q150,92,239.5,88Q329,84,378,167Q427,250,380.5,322.5Z',
      'M409.5,316.5Q366,383,277,411.5Q188,440,119,345Q50,250,116,151Q182,52,279.5,69.5Q377,87,415,168.5Q453,250,409.5,316.5Z',
      'M378.5,340Q357,430,266.5,417.5Q176,405,124.5,327.5Q73,250,126,174Q179,98,266,104.5Q353,111,376.5,180.5Q400,250,378.5,340Z'
    ];
    blob.style.transition = 'd 4s ease-in-out';
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % paths.length;
      blob.setAttribute('d', paths[idx]);
    }, 4000);
  }

  /* --------------------------------------------------------
     10. Tilt cards (services) — desactivado en táctil
  --------------------------------------------------------- */
  if (!reduceMotion && !isTouch) {
    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top)  / r.height;
        const rx = (y - 0.5) * -8;
        const ry = (x - 0.5) *  8;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* --------------------------------------------------------
     11. Portfolio (filter + grid + modal)
  --------------------------------------------------------- */
  const PROJECTS = [
    { id:1, title:'Iconografía & Branding', cat:'Diseño',     image:'images/cover-symbols.jpg',   color:'cyan',
      desc:'Colección de íconos vectoriales y símbolos de marca con estilo minimalista. Trabajo de ilustración digital y diseño de identidad visual.',
      tags:['Illustrator','Photoshop','Brand Guidelines'] },
    { id:2, title:'Dashboard Analytics',    cat:'Desarrollo', image:'images/cover-code.jpg',      color:'magenta',
      desc:'Panel de control con gráficos interactivos, dark mode y componentes reutilizables. Stack moderno con TypeScript y React.',
      tags:['TypeScript','React','GraphQL'] },
    { id:3, title:'Infraestructura Cloud',  cat:'Sistemas',   image:'images/cover-network.jpg',   color:'cyan',
      desc:'Migración de servidor local a cloud, integración de servicios web y APIs distribuidas con configuración de seguridad y monitoreo.',
      tags:['Linux','Docker','Nginx'] },
    { id:4, title:'Landing Resident Evil',  cat:'Diseño',     image:'images/cover-village.jpg',   color:'magenta',
      desc:'Diseño de landing page cinematográfica para producto de entretenimiento. Slider de personajes, ediciones y locaciones interactivas.',
      tags:['Figma','Photoshop','After Effects'] },
    { id:5, title:'Plataforma con IA',      cat:'Desarrollo', image:'images/cover-ai.jpg',        color:'cyan',
      desc:'Aplicación web que integra modelos de IA para análisis de datos. Interfaz limpia, animaciones fluidas y formularios inteligentes.',
      tags:['React','Tailwind','OpenAI API'] },
    { id:6, title:'Soporte & Reparación',   cat:'Sistemas',   image:'images/cover-repair.jpg',    color:'magenta',
      desc:'Servicio de mantenimiento, diagnóstico y reparación de hardware. Atención presencial y soporte remoto para empresas y usuarios finales.',
      tags:['Hardware','Diagnóstico','Mantenimiento'] },
    { id:7, title:'Auditoría de Seguridad', cat:'Sistemas',   image:'images/cover-security.jpg',  color:'cyan',
      desc:'Revisión de vulnerabilidades, fortalecimiento de contraseñas y configuración de políticas de acceso para entornos corporativos.',
      tags:['Pentesting','OWASP','Hardening'] },
    { id:8, title:'Portafolio Web Personal',cat:'Diseño',     image:'images/cover-portfolio.jpg', color:'magenta',
      desc:'Diseño y maquetación de portafolio profesional con secciones About, Resume y Portfolio. Layout limpio, oscuro y responsivo.',
      tags:['UI Design','Figma','HTML/CSS'] }
  ];

  const grid    = document.getElementById('projects-grid');
  const filters = document.querySelectorAll('#filters .filter');
  const modal   = document.getElementById('project-modal');

  function renderProjects(filter) {
    if (!grid) return;
    const list = filter === 'Todos' ? PROJECTS : PROJECTS.filter(p => p.cat === filter);
    grid.innerHTML = list.map(p => `
      <article class="project-card ${p.color}-glow" data-id="${p.id}">
        <div class="project-image">
          <span class="project-cat ${p.color}-cat">${p.cat}</span>
          <img src="${p.image}" alt="${p.title}" loading="lazy" />
        </div>
        <div class="project-body">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="project-tags">${p.tags.map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
        </div>
      </article>
    `).join('');
    grid.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = +card.dataset.id;
        const p = PROJECTS.find(x => x.id === id);
        if (p) openModal(p);
      });
    });
  }
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.dataset.filter);
    });
  });
  renderProjects('Todos');

  function openModal(p) {
    if (!modal) return;
    document.getElementById('modal-img').src = p.image;
    document.getElementById('modal-img').alt = p.title;
    document.getElementById('modal-title').textContent = p.title;
    document.getElementById('modal-desc').textContent  = p.desc;
    const badge = document.getElementById('modal-badge');
    badge.textContent = p.cat;
    badge.className = 'badge ' + p.color;
    document.getElementById('modal-tags').innerHTML =
      p.tags.map(t => `<span class="modal-tag ${p.color}">${t}</span>`).join('');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (modal) {
    modal.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* --------------------------------------------------------
     12. Contact form: WhatsApp + Email al cliente
  --------------------------------------------------------- */
  const WHATSAPP_NUMBER = '573132049102';
  const form  = document.getElementById('contact-form');
  const toast = document.getElementById('toast');

  function showError(field, msg) {
    const err = document.getElementById('err-' + field);
    if (err) err.textContent = msg || '';
  }
  function clearErrors() {
    ['name','email','service','message'].forEach(f => showError(f, ''));
  }
  function showToast(title, desc) {
    if (!toast) return;
    if (title) toast.querySelector('.toast-title').textContent = title;
    if (desc)  toast.querySelector('.toast-desc').textContent  = desc;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const name    = form.name.value.trim();
      const email   = form.email.value.trim();
      const service = form.service.value;
      const message = form.message.value.trim();
      let ok = true;

      if (name.length < 2)               { showError('name',    'El nombre es muy corto'); ok = false; }
      if (!/^\S+@\S+\.\S+$/.test(email)) { showError('email',   'Correo electrónico inválido'); ok = false; }
      if (!service)                      { showError('service', 'Selecciona un servicio'); ok = false; }
      if (message.length < 10)           { showError('message', 'El mensaje debe tener al menos 10 caracteres'); ok = false; }
      if (!ok) return;

      // 1) Mensaje preformateado para WhatsApp de Leonardo
      const waText =
        `Hola Leonardo, soy *${name}*.\n` +
        `Me interesa el servicio: *${service}*.\n\n` +
        `${message}\n\n` +
        `Mi correo: ${email}`;
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

      // 2) Notificación al cliente: autoresponse + CC + replyto
      const autoresponse =
        `Hola ${name},\n\n` +
        `Hemos recibido tu solicitud en el portafolio de Leonardo Márquez.\n\n` +
        `------------------------------------------\n` +
        `RESUMEN DE TU SOLICITUD\n` +
        `------------------------------------------\n` +
        `Servicio: ${service}\n` +
        `Mensaje:  ${message}\n` +
        `------------------------------------------\n\n` +
        `Leonardo se pondrá en contacto contigo lo antes posible.\n\n` +
        `Si necesitas atención inmediata:\n` +
        `   WhatsApp: +57 313 204 9102\n` +
        `   Email:    lumar.321456@gmail.com\n\n` +
        `Gracias por confiar en nosotros.\n— Leonardo Márquez`;

      const autoField    = document.getElementById('autoresponse-field');
      const replytoField = document.getElementById('replyto-field');
      const ccField      = document.getElementById('cc-field');
      if (autoField)    autoField.value    = autoresponse;
      if (replytoField) replytoField.value = email;
      if (ccField)      ccField.value      = email; // copia al cliente

      const btn = document.getElementById('submit-btn');
      const txt = btn.querySelector('.btn-text');
      const orig = txt.textContent;
      txt.textContent = 'ABRIENDO WHATSAPP...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      // 3) Abre WhatsApp en pestaña nueva
      window.open(waUrl, '_blank');

      // 4) Envío por correo en segundo plano
      const data = new FormData(form);
      fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .catch(() => { /* silencioso: WhatsApp ya se abrió */ })
        .finally(() => {
          txt.textContent = orig;
          btn.disabled = false;
          btn.style.opacity = '';
          form.reset();
          showToast('¡Mensaje enviado con éxito!', 'WhatsApp abierto y se envió un correo de confirmación.');
        });
    });
  }

  /* --------------------------------------------------------
     13. ASISTENTE IA — Versión MEJORADA
        - Base de conocimiento ampliada
        - Tolerancia a errores ortográficos (Levenshtein)
        - Memoria de contexto (recuerda el último tema)
        - Respuestas variadas para sonar más natural
        - Persistencia diaria del historial (auto-borrado)
        - Detecta intención de contacto y deriva a WhatsApp
  --------------------------------------------------------- */

  // ---- Utilidades de texto ----
  const STOPWORDS = new Set([
    'el','la','los','las','un','una','de','del','y','o','u','en','a','al','con',
    'por','para','que','qué','si','no','me','te','se','le','les','lo','tu','su',
    'mi','es','son','es','este','esta','eso','esa','muy','mas','más','aqui','aquí',
    'alli','allí','asi','así','soy','estoy','tengo','quiero','necesito','puedo',
    'podrias','podrías','sobre','tambien','también','pero','o','sea','hay'
  ]);

  function normalize(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;:()"'`´]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function tokenize(s) {
    return normalize(s).split(' ').filter(w => w && !STOPWORDS.has(w));
  }

  // Levenshtein (distancia de edición) para palabras cortas → tolera errores
  function lev(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 2) return 99;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i-1] === b[j-1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + cost);
      }
    }
    return dp[m][n];
  }

  // ¿Las palabras coinciden con tolerancia a typos?
  function fuzzyMatch(token, target) {
    if (token === target) return 1;
    if (token.length >= 4 && target.includes(token)) return 0.85;
    if (target.length >= 4 && token.includes(target)) return 0.85;
    const dist = lev(token, target);
    if (token.length <= 4 && dist === 0) return 1;
    if (token.length <= 5 && dist === 1) return 0.7;
    if (token.length >= 6 && dist <= 2)  return 0.6;
    return 0;
  }

  // ---- Variantes aleatorias ----
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ---- Base de conocimiento COMPLETA (todas las páginas) ----
  const KB = [
    { id:'saludo',
      keys:['hola','buenas','holi','holaa','saludos','hey','que tal','qué tal','buen dia','buen día','buenas tardes','buenas noches','buenos dias','buenos días','hi','hello','bienvenido'],
      replies: [
        '¡Hola, bienvenido! Soy el asistente de Leonardo Márquez. Estoy aquí para orientarte sobre sus <strong>servicios</strong>, <strong>precios</strong>, <strong>proyectos</strong> y más. ¿Con qué te puedo ayudar hoy?',
        '¡Hey! Qué bueno que estés por aquí. Soy el asistente de Leonardo, cuéntame qué necesitas y te ayudo con lo que sea del portafolio.',
        '¡Hola! Bienvenido al portafolio de Leonardo Márquez. Puedo contarte sobre sus servicios de diseño, soporte técnico o desarrollo web. ¿Por dónde arrancamos?'
      ]},

    { id:'servicios',
      keys:['servicio','servicios','que haces','qué haces','que ofreces','qué ofreces','que vendes','qué vendes','catalogo','catálogo','en que ayudas','en qué ayudas','lo que haces','areas','áreas','especialidad'],
      replies: [
        'Leonardo trabaja en <strong>tres áreas</strong> que se complementan muy bien:<br><br>• <strong>Diseño Gráfico & Multimedia</strong> — logos, branding, videos, redes sociales, presentaciones.<br>• <strong>Desarrollo Web</strong> — landing pages, e-commerce y apps modernas con React y JavaScript.<br>• <strong>Soporte y Sistemas</strong> — mantenimiento de PCs, redes, virus, hosting y seguridad.<br><br>¿Sobre cuál quieres saber más detalle?',
        'En el portafolio ofrece diseño gráfico (logos, flyers, videos, gestión de redes), desarrollo web (páginas responsivas, apps con IA) y soporte técnico (mantenimiento, reparaciones, redes, virus). Todo en un solo lugar. ¿Qué necesitas tú?',
        '¡Buena pregunta! Básicamente Leonardo es un perfil híbrido: diseña identidades visuales, construye páginas web modernas y también arregla y mantiene computadores y redes. ¿En cuál área te puedo orientar?'
      ]},

    { id:'diseno', topic:'diseno',
      keys:['diseno','diseño','disenio','logo','logos','logotipo','branding','marca','identidad visual','imagen corporativa','flyer','afiche','poster','banner','redes sociales','social media','illustrator','photoshop','figma','after effects','grafico','gráfico','arte','editorial','print','tarjeta','portada','video','reel','presentacion','presentación','canva','ppt','fotografia','fotografía','retoque','gestion redes','gestión redes','community manager'],
      replies: [
        'En <strong>diseño</strong> Leonardo cubre desde un logo básico hasta identidades visuales completas. Los servicios más pedidos son: logo ($60.000), banner para redes ($35.000), flyer ($35.000), tarjeta de presentación ($30.000) y gestión de redes sociales ($180.000/mes). Trabaja con Illustrator, Photoshop, Figma y After Effects. ¿Qué necesitas exactamente?',
        'Para diseño gráfico hay bastante variedad: logos, banners, flyers, videos (reels y YouTube), presentaciones en PPT/Canva, retoque de fotos y hasta manejo completo de redes sociales como community manager. ¿Cuál te interesa?',
        'Leonardo lleva desde 2021 haciendo diseño freelance — logos corporativos, identidades de marca, contenido para Instagram, Facebook y TikTok, y material impreso. ¿Qué tienes en mente para tu marca o negocio?'
      ]},

    { id:'logo', topic:'diseno',
      keys:['logo basico','logo básico','logotipo','hacer logo','diseñar logo','disenar logo','logo empresa','logo negocio','logo emprendimiento','manual de identidad','manual de marca','branding completo'],
      replies: [
        'Para logos Leonardo tiene dos opciones: el <strong>logo básico en vectores con 2 revisiones por $60.000 COP</strong> (ideal para emprendimientos) o el <strong>logo + manual de identidad básico por $100.000 COP</strong> que incluye tipografía, colores y usos correctos. ¿Cuál se ajusta mejor a lo que buscas?',
        'Un logo básico (vectores, 2 revisiones) sale en <strong>$60.000 COP (≈ USD $15)</strong>. Si además quieres el manual de marca con tipografía y paleta de colores, el paquete completo es <strong>$100.000 COP (≈ USD $27)</strong>. Entrega en 3 a 7 días. ¿Te interesa?'
      ]},

    { id:'video', topic:'diseno',
      keys:['video','videos','edicion video','edición video','reel','reels','youtube','tiktok','editar video','video corto','video largo','montaje'],
      replies: [
        'Para videos Leonardo ofrece <strong>edición de reel/video corto (hasta 1 min) por $180.000 COP</strong> — incluye cortes, música y textos, perfecto para Instagram o TikTok. Para videos de <strong>YouTube o proyectos más largos son $253.000 COP por pieza</strong>. ¿De qué tipo sería tu video?',
        'La edición de video es uno de los servicios creativos: reel de hasta 1 minuto ($180.000) o video para YouTube ($253.000 por pieza). Si tienes el material grabado, él se encarga del montaje, música y efectos. ¿Qué necesitas?'
      ]},

    { id:'gestion_redes', topic:'diseno',
      keys:['gestion redes','gestión redes','community manager','administrar redes','manejar redes','publicaciones instagram','publicaciones facebook','redes mes','manejo redes','content manager'],
      replies: [
        'La <strong>gestión de redes sociales</strong> cuesta <strong>$180.000 COP al mes</strong> (≈ USD $50) e incluye 3 publicaciones por semana como community manager. Ideal si no tienes tiempo de manejar tu Instagram o Facebook. ¿Cuántas redes manejarías?'
      ]},

    { id:'web', topic:'web',
      keys:['web','página','pagina','sitio','site','website','landing','tienda','ecommerce','e-commerce','online','plataforma','frontend','desarrollo web','programacion','programación','programar','react','html','css','javascript','app','aplicacion','aplicación','wordpress','responsive','responsiva','pagina web','hacer pagina'],
      replies: [
        'Para <strong>desarrollo web</strong> Leonardo construye desde landing pages sencillas hasta aplicaciones completas con React, Tailwind CSS y JavaScript. Todo responsivo, animado y optimizado. Las landing pages arrancan en $400.000 COP y sitios más completos desde $800.000 COP. ¿Tienes una idea en mente?',
        'En web trabaja con tecnologías modernas: React, Tailwind, integraciones con APIs e incluso IA. Ha hecho landing pages, e-commerce y plataformas interactivas. ¿Qué tipo de página necesitas y para qué es?',
        'Desde 2023 Leonardo lleva proyectos web: páginas de alta conversión, tiendas online y apps con componentes modernos. El diseño siempre queda perfecto en celular y escritorio. Cuéntame tu idea y te digo si puede ayudarte.'
      ]},

    { id:'soporte', topic:'soporte',
      keys:['soporte','soporte tecnico','soporte técnico','sistema','sistemas','reparar','reparacion','reparación','mantenimiento','computador','computadora','laptop','portatil','portátil','pc','tecnico','técnico','arreglar','formatear','formateo','virus','antivirus','malware','wifi','router','red','redes','impresora','lento','lentitud','windows','linux','disco duro','ram','pantalla','teclado','pasta termica','pasta térmica','limpieza pc','limpieza computador'],
      replies: [
        'Para <strong>soporte técnico</strong> Leonardo ofrece diagnóstico, formateo, mantenimiento preventivo, limpieza física, eliminación de virus, instalación de WiFi, reparación de hardware y más. Atiende presencialmente en Sibaté y de manera remota a nivel nacional. ¿Qué problema tienes con tu equipo?',
        'Si tu computador está lento, con virus, necesita limpieza, formateo o algún repuesto, Leonardo lo puede revisar. El servicio más completo es el <strong>mantenimiento integral ($120.000–$140.000 COP)</strong> que incluye limpieza física + formateo. ¿Qué le pasa al equipo?',
        'En soporte técnico maneja todo: mantenimiento preventivo, limpieza interna con cambio de pasta térmica, eliminación de virus, configuración de WiFi, instalación de repuestos (RAM, SSD, pantalla) y mucho más. ¿Cuál es el problema?'
      ]},

    { id:'formateo', topic:'soporte',
      keys:['formateo','formatear','reinstalar windows','windows','instalar windows','drivers','sistema lento','computador lento','laptop lenta','resetear pc','factory reset'],
      replies: [
        'El <strong>formateo e instalación de Windows</strong> cuesta entre <strong>$80.000 y $100.000 COP (≈ USD $21–$26)</strong> e incluye drivers, programas básicos y respaldo de datos. Si además quieres limpieza física, el paquete completo (mantenimiento integral) sale entre $120.000 y $140.000. ¿Solo formateo o también limpieza?'
      ]},

    { id:'mantenimiento', topic:'soporte',
      keys:['mantenimiento','mantenimiento preventivo','mantenimiento integral','limpieza fisica','limpieza física','limpieza interna','pasta termica','pasta térmica','limpiar computador','limpiar laptop','optimizar','optimización'],
      replies: [
        'Hay dos opciones de mantenimiento: el <strong>preventivo por $60.000–$75.000 COP</strong> (limpieza de software y optimización) y la <strong>limpieza física interna por $70.000–$85.000 COP</strong> (desarme, sopleteado y cambio de pasta térmica). Si quieres los dos juntos, el <strong>mantenimiento integral sale $120.000–$140.000 COP</strong> — ese es el más solicitado. ¿Cuál necesitas?',
        'El mantenimiento integral ($120.000–$140.000 COP) es el paquete más completo: incluye limpieza física del hardware más optimización del sistema operativo. Para un equipo muy lento o caliente, esa es la mejor opción. ¿Te interesa?'
      ]},

    { id:'virus_wifi', topic:'soporte',
      keys:['virus','malware','ransomware','spyware','eliminar virus','quitar virus','computador infectado','wifi','red wifi','router','configurar wifi','internet lento','no hay internet','repetidor','extensor'],
      replies: [
        'Para <strong>virus y malware</strong>, el servicio cuesta entre <strong>$55.000 y $70.000 COP</strong> e incluye análisis completo, limpieza y recomendaciones de seguridad. Para <strong>WiFi y redes</strong>, la configuración de router o repetidor también cuesta entre $55.000 y $70.000 COP. ¿Cuál es tu caso?'
      ]},

    { id:'precio', topic:'precio',
      keys:['precio','precios','costo','costos','cuesta','cuestan','cobra','cobras','cuanto','cuánto','vale','valor','tarifa','tarifas','presupuesto','cotizar','cotizacion','cotización','cuanto sale','cuánto sale','plata','dinero','pesos','barato','caro','económico','economico','mas barato','más barato','dolar','dolares','dólar','dólares','usd','en dolares','en dólares','precio dolar','precio dolares','cuanto en dolares','cuánto en dólares','cuanto es en dolares','precio usd','en usd','valor en dolares','en divisas'],
      replies: [
        'Acá te doy todos los precios en <strong>COP y USD</strong>:<br><br><strong>Soporte Técnico:</strong><br>• Diagnóstico: $35.000–$45.000 COP (≈ USD $9–$12)<br>• Formateo + Windows: $80.000–$100.000 COP (≈ USD $21–$26)<br>• Mantenimiento preventivo: $60.000–$75.000 COP (≈ USD $15–$19)<br>• Limpieza física interna: $70.000–$85.000 COP (≈ USD $18–$22)<br>• Mantenimiento integral ⭐: $120.000–$140.000 COP (≈ USD $31–$36)<br>• Instalación repuestos: $45.000–$60.000 COP (≈ USD $12–$15)<br>• Virus/malware: $55.000–$70.000 COP (≈ USD $14–$18)<br>• WiFi/red: $55.000–$70.000 COP (≈ USD $14–$18)<br>• Software especializado: $45.000–$60.000 COP (≈ USD $12–$15)<br>• Domicilio (recargo): $25.000–$35.000 COP (≈ USD $6–$9)<br><br><strong>Diseño & Multimedia:</strong><br>• Logo básico: $60.000 COP (≈ USD $15)<br>• Logo + identidad: $100.000 COP (≈ USD $27)<br>• Banner redes: $35.000 COP (≈ USD $9)<br>• Banner impresión: $60.000 COP (≈ USD $15)<br>• Flyer/volante: $35.000 COP (≈ USD $9)<br>• Tarjeta presentación: $30.000 COP (≈ USD $8)<br>• Retoque foto: $25.000 COP/foto (≈ USD $6)<br>• Portada FB/YT/Twitter: $45.000 COP (≈ USD $12)<br>• Presentación PPT (10 diapos): $80.000 COP (≈ USD $21)<br>• Video reel (1 min): $180.000 COP (≈ USD $50)<br>• Video YouTube: $253.000 COP/pieza (≈ USD $70)<br>• Gestión redes sociales: $180.000 COP/mes (≈ USD $50)<br><br>¿Quieres cotizar algo en específico? <a href="https://wa.me/573132049102" target="_blank">WhatsApp →</a>',
        'Los precios van desde USD $6 (retoque de foto) hasta USD $70 (video YouTube). En pesos colombianos (COP), el más solicitado en soporte es el mantenimiento integral ($120.000–$140.000 COP / USD $31–$36) y en diseño el logo básico ($60.000 COP / USD $15). ¿Cuál te interesa?'
      ]},

    { id:'precio_usd', topic:'precio',
      keys:['dolar','dolares','dólar','dólares','usd','en dolares','en dólares','precio dolar','precio dolares','cuanto en dolares','cuánto en dólares','precio usd','en usd','valor en dolares','cuanto usd','cuánto usd','divisa','divisas','moneda extranjera','precio internacional','extranjero'],
      replies: [
        'Claro, acá los precios en <strong>dólares (USD)</strong>:<br><br><strong>Soporte Técnico:</strong><br>• Diagnóstico: USD $9–$12<br>• Formateo + Windows: USD $21–$26<br>• Mantenimiento preventivo: USD $15–$19<br>• Limpieza física interna: USD $18–$22<br>• Mantenimiento integral ⭐: USD $31–$36<br>• Virus/malware: USD $14–$18<br>• WiFi/red: USD $14–$18<br><br><strong>Diseño & Multimedia:</strong><br>• Logo básico: USD $15<br>• Logo + identidad de marca: USD $27<br>• Banner redes sociales: USD $9<br>• Flyer/volante: USD $9<br>• Tarjeta de presentación: USD $8<br>• Retoque foto: USD $6/foto<br>• Presentación PPT: USD $21<br>• Video reel (1 min): USD $50<br>• Video YouTube: USD $70/pieza<br>• Gestión de redes: USD $50/mes<br><br><em>(Conversión aproximada. Pago en COP por Nequi, Daviplata o transferencia.)</em> <a href="https://wa.me/573132049102" target="_blank">Cotizar →</a>',
        'En dólares los precios son muy accesibles: el logo básico sale en USD $15, un banner en USD $9, un video reel en USD $50 y el mantenimiento integral de computador en USD $31–$36. El pago final se hace en pesos colombianos (COP). ¿Cuál servicio te interesa?'
      ]},

    { id:'tiempo', topic:'tiempo',
      keys:['tiempo','tiempos','demora','demoras','tarda','tarde','dias','días','semanas','meses','plazo','plazos','entrega','rapido','rápido','urgente','cuando','cuándo','listo','disponible','disponibilidad','cuanto tiempo','cuánto tiempo'],
      replies: [
        'Los tiempos de entrega dependen del trabajo:<br><br>• <strong>Logo básico:</strong> 3 a 7 días<br>• <strong>Identidad de marca completa:</strong> 1 a 2 semanas<br>• <strong>Landing page:</strong> 1 a 3 semanas<br>• <strong>Sitio web completo:</strong> 3 a 6 semanas<br>• <strong>Soporte técnico:</strong> mismo día o al siguiente<br>• <strong>Videos y flyers:</strong> 2 a 5 días<br><br>¿Tienes alguna fecha límite? Si es urgente avísale por WhatsApp.',
        'Para soporte técnico normalmente atiende el mismo día o al día siguiente. Para diseño, piezas sencillas como logos o banners tardan entre 3 y 7 días. Un sitio web completo puede tomar entre 3 y 6 semanas. ¿Tienes prisa con algo?'
      ]},

    { id:'experiencia',
      keys:['experiencia','años','trayectoria','curriculum','cv','sena','adso','estudios','estudia','formacion','formación','quien es','quién es','sobre el','sobre él','sobre leonardo','acerca de','perfil','habilidades','habilidad','skills','tecnologias','tecnologías','herramientas'],
      replies: [
        'Leonardo es un perfil híbrido que combina diseño y tecnología. Actualmente estudia <strong>Análisis y Desarrollo de Software en el SENA</strong>. Lleva desde <strong>2021 haciendo diseño gráfico freelance</strong>, desde <strong>2022 en soporte técnico remoto</strong> y desde <strong>2023 en desarrollo web</strong>. Maneja Adobe Creative Suite, Figma, React, Tailwind, Linux, Docker y más.',
        'Su formación incluye SENA (ADSO), cursos de diseño gráfico con Adobe y Figma, y certificaciones en administración Linux y redes. Con más de 5 proyectos entregados y disponibilidad 24/7, es técnico y creativo al mismo tiempo. ¿Necesitas algo específico?',
        'Básicamente Leonardo es diseñador gráfico, desarrollador web y técnico en sistemas todo en uno. Estudia en el SENA, trabaja freelance desde 2021 y atiende tanto presencialmente en Sibaté como de forma remota. Sus herramientas principales son Illustrator, Photoshop, Figma, React, JavaScript, Linux y Docker.'
      ]},

    { id:'proyectos',
      keys:['portafolio','portfolio','proyecto','proyectos','trabajo','trabajos','ejemplo','ejemplos','muestra','muestras','demos','ver trabajo','referencias','ha hecho','que ha hecho','iconografia','iconografía','branding','dashboard','analytics','infraestructura','cloud','landing','resident evil','plataforma ia','plataforma con ia','auditoria','auditoría','seguridad','ecommerce'],
      replies: [
        'En el portafolio hay 8 proyectos reales:<br><br>• <strong>Iconografía & Branding</strong> — íconos vectoriales y diseño de identidad (Illustrator, Photoshop).<br>• <strong>Dashboard Analytics</strong> — panel de control con React, TypeScript y GraphQL.<br>• <strong>Infraestructura Cloud</strong> — migración a nube con Linux, Docker y Nginx.<br>• <strong>Landing Resident Evil</strong> — landing cinematográfica con Figma y After Effects.<br>• <strong>Plataforma con IA</strong> — app web con OpenAI API, React y Tailwind.<br>• <strong>Soporte & Reparación</strong> — hardware y mantenimiento.<br>• <strong>Auditoría de Seguridad</strong> — pentesting y OWASP.<br>• <strong>Portafolio Web Personal</strong> — este mismo sitio en Figma + HTML/CSS.<br><br>Puedes verlos en la página <a href="portafolio.html">Portafolio →</a>',
        'Sus proyectos cubren las tres áreas: diseño (branding, landing Resident Evil, portafolio web), desarrollo (dashboard con React, plataforma con IA) y sistemas (infraestructura cloud, auditoría de seguridad, soporte técnico). Visita la sección Portafolio para ver imágenes y detalles de cada uno.'
      ]},

    { id:'contacto',
      keys:['contacto','contactar','hablar','escribir','llamar','telefono','teléfono','celular','whatsapp','wsp','wa','correo','email','mail','escribirle','numero','número','comunicar'],
      replies: [
        'Puedes contactar a Leonardo por:<br><br>• <strong>WhatsApp:</strong> <a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102</a> (el más rápido)<br>• <strong>Email:</strong> <a href="mailto:lumar.321456@gmail.com">lumar.321456@gmail.com</a><br>• <strong>Formulario de contacto:</strong> en la página <a href="contacto.html">Contacto</a><br><br>¿Prefieres que te pase el link de WhatsApp directo?',
        'Lo más rápido es escribirle al WhatsApp <a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102</a>. También recibe correos en lumar.321456@gmail.com y tiene un formulario de contacto en la página. ¿Necesitas algo urgente?'
      ]},

    { id:'ubicacion',
      keys:['donde','dónde','ubicacion','ubicación','direccion','dirección','ciudad','pais','país','vive','queda','colombia','sibate','sibaté','bogota','bogotá','cundinamarca','presencial','remoto','a domicilio','domicilio'],
      replies: [
        'Leonardo está en <strong>Sibaté, Cundinamarca, Colombia</strong>. Para soporte técnico atiende presencialmente en esa zona y también va a domicilio (tiene un recargo de $25.000–$35.000 COP por el desplazamiento). Para diseño y desarrollo web trabaja 100% remoto con clientes de cualquier parte del mundo.',
        'Está basado en Sibaté, Cundinamarca. El soporte técnico presencial es en esa zona, pero para diseño gráfico y desarrollo web atiende clientes remotamente desde cualquier lugar. ¿Estás cerca o necesitas servicio remoto?'
      ]},

    { id:'agendar', topic:'agendar',
      keys:['agendar','reunion','reunión','cita','llamada','meet','zoom','google meet','reservar','programar reunion','programar reunión','videollamada','video llamada'],
      replies: [
        'Para agendar una reunión lo más fácil es escribirle por WhatsApp y coordinar día y hora directamente:<br><br><a href="https://wa.me/573132049102?text=Hola%20Leonardo%2C%20quiero%20agendar%20una%20reuni%C3%B3n" target="_blank">Agendar reunión por WhatsApp →</a>',
        'Claro, puedes coordinar una llamada o videollamada escribiéndole al WhatsApp. Él tiene disponibilidad para atender y discutir tu proyecto. <a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102 →</a>'
      ]},

    { id:'pago',
      keys:['pago','pagos','formas de pago','metodos de pago','métodos de pago','transferencia','nequi','daviplata','bancolombia','tarjeta','efectivo','paypal','anticipo','como pago','cómo pago','contra entrega'],
      replies: [
        'Acepta <strong>transferencia bancaria, Nequi, Daviplata y efectivo</strong>. En proyectos más grandes generalmente se maneja con un <strong>50% de anticipo al inicio</strong> y el otro 50% al entregar. Para proyectos pequeños también se puede pago completo al final. ¿Tienes alguna preferencia?'
      ]},

    { id:'garantia',
      keys:['garantia','garantía','soporte post','despues de entregar','después de entregar','correcciones','cambios','revisiones','ajustes','retoques','incluye','qué incluye','que incluye'],
      replies: [
        'Todos los proyectos incluyen <strong>2 a 3 rondas de ajustes sin costo adicional</strong> dentro del alcance acordado. Para páginas web hay <strong>soporte de 30 días</strong> después de la entrega para corregir cualquier detalle. Los logos incluyen 2 revisiones. ¿Tienes alguna duda sobre lo que incluye un servicio específico?',
        'Sí, Leonardo trabaja con rondas de revisión incluidas. Para diseño son 2–3 ajustes, para web hay 30 días de soporte post-entrega. Si algo no quedó como querías, se corrige sin costo extra dentro del alcance del proyecto.'
      ]},

    { id:'idioma',
      keys:['ingles','inglés','english','espanol','español','spanish','idioma','idiomas','bilingue','bilingüe','en ingles','en inglés'],
      replies: [
        'Leonardo trabaja principalmente en <strong>español</strong>, pero puede entregar proyectos y comunicarse en <strong>inglés</strong> perfectamente. ¿Tu proyecto necesita contenido en inglés?'
      ]},

    { id:'estadisticas',
      keys:['estadisticas','estadísticas','datos','numeros','números','cuantos proyectos','cuántos proyectos','clientes','satisfaccion','satisfacción','compromiso','24/7','disponibilidad'],
      replies: [
        'Algunos datos del portafolio: <strong>5+ proyectos realizados</strong>, <strong>8+ tecnologías</strong> dominadas, <strong>100% de compromiso</strong> con cada cliente y <strong>disponibilidad 24/7</strong>. Es un profesional que toma en serio cada proyecto. ¿Quieres saber algo más?'
      ]},

    { id:'tecnologias',
      keys:['tecnologias','tecnologías','herramientas','stack','react','tailwind','typescript','figma','illustrator','photoshop','linux','docker','nginx','git','javascript','node','css','html'],
      replies: [
        'Leonardo maneja un stack bastante amplio. En <strong>diseño</strong>: Illustrator, Photoshop, Figma, After Effects, Canva. En <strong>desarrollo</strong>: React, TypeScript, JavaScript, HTML/CSS, Tailwind, Node.js, GraphQL. En <strong>sistemas</strong>: Linux, Docker, Nginx, Git, administración de redes y seguridad. ¿Te interesa alguna tecnología en específico?'
      ]},

    { id:'derivar_humano',
      keys:['hablar con leonardo','hablar con humano','persona real','que me responda','quiero hablar','asesor real','no eres real','eres bot','eres robot','quiero a leonardo','hablar directo'],
      replies: [
        '¡Claro! Te conecto directo con Leonardo ahora mismo:<br><br><a href="https://wa.me/573132049102" target="_blank">Abrir WhatsApp →</a>',
        'Sin problema, te paso directo con él. El WhatsApp es la vía más rápida:<br><a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102 →</a>'
      ]},

    { id:'agradecer',
      keys:['gracias','muchas gracias','mil gracias','genial','perfecto','excelente','buenisimo','buenísimo','chevere','chévere','bacano','super','súper','vale','ok','okay','dale','listo','entendido','claro'],
      replies: [
        '¡Con mucho gusto! Si tienes otra duda o quieres cotizar algo, estoy por aquí. Y cuando estés listo, Leonardo te espera por WhatsApp. 😊',
        '¡Para eso estoy! Si se te ocurre algo más, pregunta sin pena. Y si ya tienes todo claro, el próximo paso es escribirle directamente a Leonardo.',
        '¡Genial! Espero haberte ayudado. Cuando decidas avanzar con tu proyecto, contáctate con Leonardo por WhatsApp, él te atenderá rápido.'
      ]},

    { id:'despedida',
      keys:['adios','adiós','chao','chau','bye','nos vemos','hasta luego','hasta pronto','me voy','cuidate','cuídate'],
      replies: [
        '¡Hasta pronto! Que te vaya muy bien. Cuando necesites vuelve sin pena. 👋',
        '¡Chao! Fue un gusto orientarte. Si después tienes preguntas, aquí estaré.'
      ]},

    { id:'saludo_como_estas',
      keys:['como estas','cómo estás','como te va','cómo te va','todo bien','que hay','qué hay','como andas','cómo andas'],
      replies: [
        '¡Todo bien por acá, gracias por preguntar! Listo para ayudarte con lo que necesites del portafolio de Leonardo. ¿Qué te trae por aquí?',
        '¡Muy bien! Aquí atendiendo. ¿En qué te puedo ayudar hoy?'
      ]},

    { id:'filosofia',
      keys:['filosofia','filosofía','vision','visión','mision','misión','diferencia','diferente','unico','único','especializa','por qué','porque tu','por que tu','que te diferencia','qué te diferencia','propuesta','valor','propuesta de valor'],
      replies: [
        'Leonardo tiene un enfoque diferente al de la mayoría: no solo hace que las cosas se vean bien, sino que construye sistemas que <strong>funcionan impecablemente y escalan con tu negocio</strong>. Es un perfil híbrido que fusiona el ojo crítico del diseño con la lógica del desarrollo de software.',
        'Su lema es claro: <strong>diseño con propósito, desarrollo con precisión</strong>. No improvisa — cada proyecto tiene una estrategia detrás. Eso es lo que lo diferencia de un freelancer común.',
        'Lo que hace a Leonardo especial es que domina tres mundos: diseño gráfico, programación web y sistemas/infraestructura. Eso significa que puede tomar tu idea desde el boceto hasta el servidor, sin terceros.'
      ]},

    { id:'personalidad',
      keys:['como es','cómo es','personalidad','trato','atiende','atencion','atención','amable','confiable','serio','profesional','puntual','compromiso','trabaja','estilo'],
      replies: [
        'Leonardo es muy comprometido: tiene una tasa de satisfacción del <strong>100% de compromiso</strong> con cada proyecto y atiende con <strong>disponibilidad 24/7</strong>. Es puntual, directo y siempre mantiene al cliente informado del avance.',
        'Es un profesional con un trato cercano y honesto. No acepta proyectos que no pueda cumplir bien, y cuando trabaja contigo, lo hace como si fuera su propio negocio. Eso lo dicen sus clientes.',
        'Su forma de trabajar es: primero entiende bien qué necesitas, luego propone una solución clara, y ejecuta con precisión. Incluye rondas de revisión para que el resultado sea exactamente lo que esperabas.'
      ]},

    { id:'stack_tecnico',
      keys:['stack','tecnologia completa','tecnología completa','html css','node.js','node js','git','github','typescript','react hooks','tailwind css','graphql','api','rest','openai','inteligencia artificial','ia web','docker compose'],
      replies: [
        'El stack completo de Leonardo incluye: <strong>Frontend</strong>: React, TypeScript, Tailwind CSS, HTML5/CSS3, JavaScript. <strong>Backend</strong>: Node.js, APIs REST, GraphQL, integraciones con OpenAI. <strong>Sistemas</strong>: Linux, Docker, Nginx, Git, configuración de redes y hosting. <strong>Diseño</strong>: Figma, Illustrator, Photoshop, After Effects, Canva.',
        'Maneja tanto el lado visual como el técnico: desde diseñar un wireframe en Figma hasta desplegarlo en un servidor Linux con Docker. Eso hace que los proyectos queden integrados y optimizados desde el inicio.'
      ]},

    { id:'disponible',
      keys:['disponible','disponibilidad','acepta proyectos','nuevos proyectos','tiene cupo','tiene espacio','esta ocupado','está ocupado','cupos','agenda llena','trabaja ahora'],
      replies: [
        '¡Sí, Leonardo está disponible para nuevos proyectos! Su estado actual en el portafolio es <strong>"disponible para nuevos proyectos"</strong>. Lo mejor es contactarlo por WhatsApp para revisar los tiempos y disponibilidad: <a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102 →</a>',
        'Tiene disponibilidad 24/7 y actualmente acepta nuevos clientes. Para no perderte un cupo, escríbele directamente por WhatsApp y cuéntale tu proyecto. <a href="https://wa.me/573132049102" target="_blank">Contactar ahora →</a>'
      ]},

    { id:'combo_paquete',
      keys:['combo','paquete','pack','bundle','todo en uno','completo','integral','logo y web','web y diseño','diseño y web','completo emprendimiento','emprendimiento completo','todo junto'],
      replies: [
        '¡Claro que sí! Leonardo arma combos personalizados. Por ejemplo: logo + banner para redes + tarjeta de presentación es una combinación muy popular para emprendimientos. También hace web + diseño completo. Para un paquete a medida, escríbele por WhatsApp y le dices qué necesitas: <a href="https://wa.me/573132049102" target="_blank">Cotizar combo →</a>',
        'Puede armar paquetes según lo que necesites. Si quieres, por ejemplo, logo + web + gestión de redes, se puede negociar un precio especial. Contáctalo y cuéntale: <a href="https://wa.me/573132049102" target="_blank">WhatsApp →</a>'
      ]}
  ];

  // ---- Detector de intención ----
  function detectIntent(text) {
    const tokens = tokenize(text);
    if (!tokens.length) return { intent: null, score: 0 };
    const scores = KB.map(intent => {
      let score = 0, hits = 0;
      intent.keys.forEach(k => {
        const kTokens = normalize(k).split(' ');
        let local = 0;
        kTokens.forEach(kt => {
          let best = 0;
          tokens.forEach(t => {
            const m = fuzzyMatch(t, kt);
            if (m > best) best = m;
          });
          local += best;
        });
        if (local > 0) {
          hits++;
          // bonus si la frase clave completa está casi entera
          score += local * (kTokens.length === 1 ? 1 : 1.4);
        }
      });
      return { intent, score, hits };
    });
    scores.sort((a, b) => b.score - a.score);
    return scores[0];
  }

  // ---- Estado del chat ----
  const ctx = { lastTopic: null, history: [] };
  const HISTORY_KEY = 'lm_chat_history';

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        if (obj && Date.now() - obj.t < ONE_DAY_MS) {
          ctx.history   = obj.history || [];
          ctx.lastTopic = obj.lastTopic || null;
        }
      }
    } catch (e) {}
  }
  function saveHistory() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify({
        t: Date.now(),
        history: ctx.history.slice(-30),
        lastTopic: ctx.lastTopic
      }));
    } catch (e) {}
  }

  // ---- Generador de respuesta ----
  function generateReply(text) {
    const { intent, score } = detectIntent(text);

    // Continuación: el usuario dice "y cuanto cuesta?" después de hablar de un servicio
    const followsPrice = /\b(cuanto|cuánto|precio|costo|vale|cuesta)\b/i.test(text);
    if (followsPrice && ctx.lastTopic && (!intent || score < 0.7)) {
      const map = {
        diseno:  'Para <strong>diseño gráfico</strong> los precios son en pesos colombianos (COP): logo básico $60.000 (USD $15), banner redes $35.000 (USD $9), flyer $35.000 (USD $9), video reel $180.000 (USD $50), gestión de redes $180.000/mes (USD $50). Para cotizar tu proyecto:<br><a href="https://wa.me/573132049102" target="_blank">Cotizar por WhatsApp →</a>',
        web:     'Para <strong>desarrollo web</strong>, una landing page comienza en $400.000 COP y un sitio completo en $800.000 COP. Para tu caso específico:<br><a href="https://wa.me/573132049102" target="_blank">Cotizar por WhatsApp →</a>',
        soporte: 'En <strong>soporte técnico</strong> los precios son en pesos colombianos (COP): diagnóstico $35.000–$45.000 (USD $9–$12), formateo+Windows $80.000–$100.000 (USD $21–$26), mantenimiento preventivo $60.000–$75.000 (USD $15–$19), limpieza física $70.000–$85.000 (USD $18–$22). Más detalle:<br><a href="https://wa.me/573132049102" target="_blank">WhatsApp →</a>'
      };
      if (map[ctx.lastTopic]) return map[ctx.lastTopic];
    }

    // Umbral bajo: si hay CUALQUIER coincidencia razonable, responder
    if (intent && score >= 0.35) {
      if (intent.topic) ctx.lastTopic = intent.topic;
      return pick(intent.replies);
    }

    // Coincidencia parcial: usar el intent de mayor puntaje aunque sea bajo
    const { intent: bestIntent, score: bestScore } = detectIntent(text);
    if (bestIntent && bestScore > 0.15) {
      if (bestIntent.topic) ctx.lastTopic = bestIntent.topic;
      return pick(bestIntent.replies);
    }

    // Fallback inteligente: sugerencias por palabras clave
    const tokens = tokenize(text);
    const suggestions = [];
    if (tokens.some(t => fuzzyMatch(t,'cotizar') > 0 || fuzzyMatch(t,'precio') > 0 || fuzzyMatch(t,'costo') > 0)) suggestions.push('Precios');
    if (tokens.some(t => fuzzyMatch(t,'web') > 0 || fuzzyMatch(t,'pagina') > 0 || fuzzyMatch(t,'sitio') > 0))    suggestions.push('Desarrollo Web');
    if (tokens.some(t => fuzzyMatch(t,'logo') > 0 || fuzzyMatch(t,'diseno') > 0 || fuzzyMatch(t,'marca') > 0))   suggestions.push('Diseño Gráfico');
    if (tokens.some(t => fuzzyMatch(t,'soporte') > 0 || fuzzyMatch(t,'tecnico') > 0 || fuzzyMatch(t,'pc') > 0))  suggestions.push('Soporte Técnico');

    if (suggestions.length) {
      return `Cuéntame un poco más sobre lo que necesitas. ¿Te interesa algo de <strong>${suggestions.join('</strong> o <strong>')}</strong>? También puedes escribirle directo a Leonardo:<br><a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102 →</a>`;
    }

    return 'Puedo ayudarte con información sobre los <strong>servicios</strong>, <strong>precios</strong>, <strong>proyectos</strong>, <strong>tiempos de entrega</strong> o <strong>contacto</strong> de Leonardo. ¿Qué quieres saber?';
  }

  // ---- DOM del chat ----
  const chatFab    = document.getElementById('chat-fab');
  const chatWin    = document.getElementById('chat-window');
  const chatClose  = document.getElementById('chat-close');
  const chatBody   = document.getElementById('chat-body');
  const chatQuick  = document.getElementById('chat-quick');
  const chatForm   = document.getElementById('chat-form');
  const chatInput  = document.getElementById('chat-input');

  // ---- Personaje animado en el botón FAB ----
  if (chatFab) {
    chatFab.innerHTML = `
      <svg class="fab-char" viewBox="0 0 44 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <!-- Antena -->
        <line x1="22" y1="1" x2="22" y2="7" stroke="#00e5ff" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="22" cy="1" r="2" fill="#00e5ff"/>
        <!-- Cabeza -->
        <rect x="9" y="7" width="26" height="19" rx="6" fill="#0a0a0f" stroke="#00e5ff" stroke-width="1.5"/>
        <!-- Visera interna -->
        <rect x="12" y="10" width="20" height="10" rx="3" fill="#0d1a2e"/>
        <!-- Ojo izquierdo -->
        <circle cx="17" cy="15" r="3.2" fill="#00e5ff" opacity="0.95"/>
        <circle cx="17" cy="15" r="1.4" fill="#0a0a0f"/>
        <circle cx="18" cy="14" r="0.7" fill="white" opacity="0.9"/>
        <!-- Ojo derecho -->
        <circle cx="27" cy="15" r="3.2" fill="#d500f9" opacity="0.95"/>
        <circle cx="27" cy="15" r="1.4" fill="#0a0a0f"/>
        <circle cx="28" cy="14" r="0.7" fill="white" opacity="0.9"/>
        <!-- Boca/sensor -->
        <rect x="16" y="21.5" width="12" height="2.5" rx="1.2" fill="#00e5ff" opacity="0.5"/>
        <rect x="18" y="21.5" width="3" height="2.5" rx="1" fill="#00e5ff" opacity="0.9"/>
        <rect x="23" y="21.5" width="3" height="2.5" rx="1" fill="#00e5ff" opacity="0.9"/>
        <!-- Cuerpo -->
        <rect x="13" y="28" width="18" height="14" rx="4" fill="#0a0a0f" stroke="#00e5ff" stroke-width="1.3"/>
        <!-- Detalle pecho -->
        <circle cx="22" cy="32.5" r="2.5" fill="none" stroke="#00e5ff" stroke-width="1.2"/>
        <circle cx="22" cy="32.5" r="1" fill="#00e5ff" opacity="0.8"/>
        <rect x="16" y="37" width="4" height="2" rx="1" fill="#d500f9" opacity="0.7"/>
        <rect x="24" y="37" width="4" height="2" rx="1" fill="#00e5ff" opacity="0.7"/>
        <!-- Brazo izquierdo -->
        <rect x="6" y="29" width="6" height="10" rx="3" fill="#0a0a0f" stroke="#00e5ff" stroke-width="1.2"/>
        <!-- Brazo derecho -->
        <rect x="32" y="29" width="6" height="10" rx="3" fill="#0a0a0f" stroke="#d500f9" stroke-width="1.2"/>
      </svg>
      <span class="chat-fab-label">Chat</span>`;

    // CSS de animación del personaje — velocidad adaptada a móvil/escritorio
    const isMobileFab = isTouch || window.innerWidth < 900;
    const fabDuration = isMobileFab ? '4.5s' : '3s';
    const fabMoveY    = isMobileFab ? '-5px' : '-4px';
    const fabScale    = isMobileFab ? '1'    : '1.04';
    const fabStyle = document.createElement('style');
    fabStyle.textContent = `
      .fab-char { width: 34px; height: 38px; filter: drop-shadow(0 0 6px rgba(0,229,255,0.7)); }
      .chat-fab { flex-direction: column; gap: 2px; }
      @keyframes fabFloat {
        0%,100% { transform: translateY(0) scale(1); }
        50%      { transform: translateY(${fabMoveY}) scale(${fabScale}); }
      }
      .chat-fab:not(.hidden) { animation: fabFloat ${fabDuration} ease-in-out infinite; }
      .chat-fab:hover .fab-char { filter: drop-shadow(0 0 12px rgba(0,229,255,0.95)) drop-shadow(0 0 8px rgba(213,0,249,0.6)); }
    `;
    document.head.appendChild(fabStyle);
  }

  const QUICK = [
    { label: 'Servicios',  text: '¿Qué servicios ofreces?' },
    { label: 'Precios',    text: '¿Cuánto cuesta?' },
    { label: 'Soporte',    text: 'Cuéntame sobre soporte técnico' },
    { label: 'Diseño',     text: 'Cuéntame sobre diseño' },
    { label: 'Portafolio', text: '¿Puedo ver tus proyectos?' },
    { label: 'Agendar',    text: 'Quiero agendar una reunión' },
    { label: 'Contacto',   text: '¿Cómo puedo contactar a Leonardo?' },
    { label: 'WhatsApp',   text: 'Quiero hablar por WhatsApp' }
  ];

  function addMsg(html, who, save = true) {
    const el = document.createElement('div');
    el.className = 'msg ' + who;
    el.innerHTML = html;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    if (save) {
      ctx.history.push({ who, html });
      saveHistory();
    }
  }
  function addTyping() {
    const el = document.createElement('div');
    el.className = 'typing';
    el.id = 'typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
  function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }
  function renderQuickReplies() {
    chatQuick.innerHTML = '';
    QUICK.forEach(q => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = q.label;
      b.addEventListener('click', () => sendUserMessage(q.text));
      chatQuick.appendChild(b);
    });
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  // ===== Cerebro IA online (Pollinations.ai, sin API key) =====
  const AI_SYSTEM_PROMPT = [
    'Eres "LM AI", el asistente virtual exclusivo del portafolio de Leonardo Márquez.',
    'REGLA ABSOLUTA: Solo respondes preguntas relacionadas con el portafolio de Leonardo Márquez.',
    'Si el usuario pregunta algo que no tenga que ver con el portafolio (recetas, ciencia, deportes, historia, matemáticas, política, entretenimiento, etc.), responde: "Solo puedo ayudarte con temas del portafolio de Leonardo Márquez: servicios, precios, proyectos, contacto o información sobre él."',
    'Habla como una persona real: usa un tono cálido, natural y conversacional. Sé directo y útil. Puedes usar expresiones como "claro que sí", "sin problema", "eso lo maneja Leonardo muy bien", etc.',
    'Nunca uses listas con asteriscos. Si necesitas listar cosas, usa guiones o puntos (•). Respuestas máximo 5 frases salvo que se pida lista de precios.',
    '--- SOBRE LEONARDO MÁRQUEZ ---',
    'Es un perfil híbrido que fusiona el ojo crítico del diseño con la lógica implacable del desarrollo de software.',
    'Su filosofía: diseño con propósito, desarrollo con precisión. No solo hace que las cosas se vean bien — construye sistemas que funcionan impecablemente y escalan con el negocio del cliente.',
    'Lo que lo diferencia: domina tres mundos (diseño, desarrollo web y sistemas/infraestructura), lo que significa que puede tomar una idea desde el boceto hasta el servidor sin depender de terceros.',
    'Forma de trabajar: primero entiende a fondo la necesidad del cliente, luego propone una solución clara, y ejecuta con precisión incluyendo rondas de revisión para que el resultado sea exactamente lo esperado.',
    'Disponibilidad actual: abierto para nuevos proyectos. Estado: "Disponible para nuevos proyectos" según su portafolio.',
    'Personalidad: comprometido, puntual, honesto y cercano. Atiende como si el proyecto fuera propio.',
    'Tagline del portafolio: "Innovación en Análisis Para el Futuro — Soluciones digitales de alto impacto que transforman tu visión en una experiencia inolvidable."',
    'Es un freelance que trabaja como diseñador gráfico desde 2021, soporte técnico remoto desde 2022, desarrollo web desde 2023.',
    'Estudia Análisis y Desarrollo de Software (ADSO) en el SENA (en curso). Cursos de Adobe Creative Suite, UI/UX, Figma. Certificaciones en Linux, redes y seguridad (en desarrollo).',
    'Estadísticas: 5+ proyectos entregados, 8+ tecnologías dominadas, 100% compromiso con cada cliente, disponibilidad 24/7.',
    'Stack completo: Frontend: React, TypeScript, Tailwind CSS, HTML5/CSS3, JavaScript. Backend: Node.js, APIs REST, GraphQL, OpenAI API. Sistemas: Linux, Docker, Nginx, Git, redes. Diseño: Figma, Illustrator, Photoshop, After Effects, Canva.',
    'Ubicación: Sibaté, Cundinamarca, Colombia. Soporte técnico presencial en la zona, diseño y desarrollo 100% remoto al mundo.',
    'Contacto: WhatsApp +57 313 204 9102 — Email lumar.321456@gmail.com.',
    'Formas de pago: transferencia bancaria, Nequi, Daviplata, efectivo. Proyectos grandes: 50% anticipo, 50% al entregar.',
    'Garantía: 2-3 rondas de ajustes sin costo. Webs: 30 días de soporte post-entrega. Logos: 2 revisiones incluidas.',
    'Idiomas: trabaja principalmente en español, también puede comunicarse y entregar en inglés.',
    'Combos disponibles: arma paquetes personalizados (ej. logo + web + redes sociales) con precio especial.',
    '--- PROYECTOS DEL PORTAFOLIO (8 en total) ---',
    '1. Iconografía & Branding (Diseño) — colección de íconos vectoriales y símbolos de marca con Illustrator y Photoshop.',
    '2. Dashboard Analytics (Desarrollo) — panel de control con gráficos interactivos, TypeScript, React y GraphQL.',
    '3. Infraestructura Cloud (Sistemas) — migración a nube, APIs distribuidas, Linux, Docker y Nginx.',
    '4. Landing Resident Evil (Diseño) — landing cinematográfica con slider interactivo, Figma y After Effects.',
    '5. Plataforma con IA (Desarrollo) — app web con OpenAI API, React y Tailwind para análisis de datos.',
    '6. Soporte & Reparación (Sistemas) — mantenimiento, diagnóstico y reparación de hardware.',
    '7. Auditoría de Seguridad (Sistemas) — pentesting, OWASP y políticas de acceso corporativas.',
    '8. Portafolio Web Personal (Diseño) — este mismo sitio, diseñado en Figma y maquetado en HTML/CSS.',
    '--- TIEMPOS DE ENTREGA ---',
    'Logo: 3-7 días. Identidad de marca: 1-2 semanas. Landing page: 1-3 semanas. Sitio web completo: 3-6 semanas.',
    'Soporte técnico: mismo día o siguiente. Videos y flyers: 2-5 días.',
    '--- PRECIOS EN PESOS COLOMBIANOS (COP) Y DÓLARES (USD) ---',
    'Conversión de referencia: 1 USD ≈ 4.000 COP. Los pagos se realizan en COP por Nequi, Daviplata o transferencia bancaria.',
    'Si el usuario pregunta en dólares, responde SIEMPRE con el precio en USD. Si pregunta en pesos, responde en COP. Si pregunta el precio a secas, da ambos.',
    'SOPORTE TÉCNICO:',
    'Diagnóstico: $35.000-$45.000 COP (USD $9-$12). Formateo + Windows (incluye drivers y respaldo): $80.000-$100.000 COP (USD $21-$26).',
    'Mantenimiento preventivo: $60.000-$75.000 COP (USD $15-$19). Limpieza física interna (pasta térmica): $70.000-$85.000 COP (USD $18-$22).',
    'Mantenimiento integral (físico + software, el más solicitado): $120.000-$140.000 COP (USD $31-$36).',
    'Instalación repuestos (RAM, SSD, pantalla, teclado): $45.000-$60.000 COP (USD $12-$15).',
    'Eliminación virus/malware: $55.000-$70.000 COP (USD $14-$18). WiFi/red/router: $55.000-$70.000 COP (USD $14-$18).',
    'Software especializado (Office, antivirus, etc.): $45.000-$60.000 COP (USD $12-$15). Domicilio (recargo): $25.000-$35.000 COP (USD $6-$9).',
    'DISEÑO GRÁFICO Y MULTIMEDIA:',
    'Logo básico vector (2 revisiones): $60.000 COP (USD $15).',
    'Logo + manual de identidad (tipografía, colores, usos): $100.000 COP (USD $27).',
    'Banner redes sociales: $35.000 COP (USD $9). Banner para impresión/pendón: $60.000 COP (USD $15).',
    'Flyer o volante digital o impreso: $35.000 COP (USD $9). Tarjeta de presentación (frente y reverso): $30.000 COP (USD $8).',
    'Retoque de foto Photoshop: $25.000 COP por foto (USD $6).',
    'Portada Facebook/YouTube/Twitter: $45.000 COP (USD $12). Presentación PPT/Canva (hasta 10 diapos): $80.000 COP (USD $21).',
    'Video reel/corto hasta 1 min: $180.000 COP (USD $50).',
    'Video para YouTube por pieza: $253.000 COP (USD $70).',
    'Gestión de redes sociales / community manager (3 publicaciones/semana): $180.000 COP al mes (USD $50/mes).'
  ].join(' ');

  function buildAIPrompt(userText) {
    // Toma las últimas 4 interacciones para contexto
    const recent = ctx.history.slice(-8);
    const lines = [];
    lines.push('SISTEMA: ' + AI_SYSTEM_PROMPT);
    recent.forEach(m => {
      const t = String(m.html || '').replace(/<[^>]+>/g,' ').replace(/&[a-z]+;/gi,' ').replace(/\s+/g,' ').trim();
      if (!t) return;
      lines.push((m.who === 'user' ? 'USUARIO: ' : 'ASISTENTE: ') + t);
    });
    lines.push('USUARIO: ' + userText);
    lines.push('ASISTENTE:');
    return lines.join('\n');
  }

  function aiToHtml(text) {
    const safe = escapeHtml(String(text).trim());
    // links automáticos a wa.me y mailto
    return safe
      .replace(/\n+/g, '<br>')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noreferrer">$1</a>')
      .replace(/(\+?57[\s-]?313[\s-]?204[\s-]?9102)/g,
               '<a href="https://wa.me/573132049102" target="_blank" rel="noreferrer">$1</a>')
      .replace(/(lumar\.321456@gmail\.com)/g,
               '<a href="mailto:$1">$1</a>');
  }

  async function fetchSmartReply(userText) {
    const prompt = buildAIPrompt(userText);
    const url = 'https://text.pollinations.ai/' + encodeURIComponent(prompt)
              + '?model=openai&seed=' + Math.floor(Math.random() * 99999);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 18000);
    try {
      const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      clearTimeout(timer);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const txt = (await r.text()).trim();
      if (!txt || txt.length < 2) throw new Error('empty');
      // El servicio puede a veces devolver JSON con un mensaje de error
      if (/^\s*[{[]/.test(txt) && /error/i.test(txt)) throw new Error('upstream error');
      return txt;
    } finally {
      clearTimeout(timer);
    }
  }

  // IDs de intents considerados "del portafolio"
  const PORTFOLIO_INTENTS = new Set([
    'saludo','saludo_como_estas','servicios','diseno','logo','video','gestion_redes',
    'web','soporte','formateo','mantenimiento','virus_wifi','precio','tiempo',
    'experiencia','proyectos','contacto','ubicacion','agendar','pago',
    'garantia','idioma','estadisticas','tecnologias','filosofia','personalidad',
    'stack_tecnico','disponible','combo_paquete','derivar_humano','agradecer','despedida'
  ]);

  // Palabras clave de respaldo para detectar temas del portafolio
  const PORTFOLIO_KEYWORDS = [
    'leonardo','portafolio','portfolio','servicio','servicios',
    'diseño','disenar','disenio','diseno','diseñas','diseñar',
    'logo','logos','logotipo','branding','marca','banner','flyer','afiche','poster','volante',
    'tarjeta','portada','video','reel','fotografia','fotografía','retoque','presentacion','presentación',
    'redes sociales','community manager','identidad','identidad visual','imagen corporativa',
    'web','pagina','página','sitio','landing','ecommerce','react','javascript','html','css','app','aplicacion',
    'soporte','tecnico','técnico','mantenimiento','formateo','formatear','virus','malware','wifi','router','red','redes',
    'computador','computadora','laptop','portatil','portátil','pc','windows','linux','ram','ssd','disco','repuesto','pantalla','teclado',
    'lento','lenta','infectado','arreglar','reparar','reparacion','diagnóstico','diagnostico',
    'precio','precios','costo','costos','cuesta','cuestan','cuanto','cuánto','vale','cotizar','cotizacion','tarifa','presupuesto','plata','pesos','cop','usd',
    'tiempo','tiempos','entrega','demora','plazo','urgente','rapido','rápido','dias','semanas',
    'contacto','whatsapp','wsp','email','correo','telefono','teléfono','llamar','escribir','numero','número',
    'sena','adso','figma','photoshop','illustrator','after effects','docker','nginx','typescript','graphql','tailwind',
    'pago','pagos','nequi','daviplata','bancolombia','transferencia','efectivo','anticipo',
    'garantia','garantía','revision','revisión','ajustes','cambios','correcciones','incluye',
    'proyecto','proyectos','trabajo','trabajos','ejemplo','muestra','referencias',
    'experiencia','trayectoria','estudios','formacion','formación','sena','curriculum','perfil',
    'herramienta','herramientas','stack','tecnologia','tecnología','habilidad','habilidades',
    'sobre el','sobre él','sobre leonardo','quien es','quién es','acerca de',
    'sibate','sibaté','cundinamarca','colombia','presencial','remoto','domicilio','donde','dónde',
    'disponible','disponibilidad','nuevo proyecto','combo','paquete','pack',
    'filosofia','filosofía','diferencia','diferente','propuesta','estilo','como trabaja','cómo trabaja',
    'idioma','ingles','inglés','spanish','english'
  ];

  function isPortfolioMessage(text) {
    const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const lowerOrig = text.toLowerCase();
    // Coincidencia con intent conocido (umbral bajo)
    const { intent, score } = detectIntent(text);
    if (intent && PORTFOLIO_INTENTS.has(intent.id) && score >= 0.3) return true;
    // Saludo, despedida o expresión corta — siempre válido
    if (/^\s*(hola|hello|hi|buenas|hey|saludos|gracias|ok|bien|dale|listo|chao|bye|adios|ciao|claro|genial|perfecto|entendido)\s*[!¡.?]?\s*$/i.test(lower)) return true;
    // Contiene al menos una palabra/frase clave del portafolio (con/sin tildes)
    const lowerNorm = lower;
    if (PORTFOLIO_KEYWORDS.some(kw => {
      const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return lowerNorm.includes(kwNorm) || lowerOrig.includes(kw);
    })) return true;
    // Preguntas genéricas que probablemente son del portafolio
    if (/cu[aá]nto|c[oó]mo funciona|qu[eé] incluye|en qu[eé] consiste|me puede[sn]|puede[sn] ayudar|necesito (un|una|ayuda|informaci[oó]n|info)|tengo (un|una|problema)|que hace[sn]|qu[eé] hace[sn]|a qu[eé] te dedica|cu[aá]les son|como (trabaj|atien|cobr)|c[oó]mo (trabaj|atien|cobr)/i.test(lower)) return true;
    return false;
  }

  const OFF_TOPIC_MSG = 'Solo puedo ayudarte con temas del portafolio de Leonardo Márquez. Puedes preguntarme sobre <strong>servicios</strong>, <strong>precios</strong>, <strong>tiempos</strong>, <strong>proyectos</strong> o <strong>contacto</strong>.';

  function sendUserMessage(text) {
    if (!text || !text.trim()) return;
    addMsg(escapeHtml(text), 'user');
    chatInput.value = '';
    addTyping();

    // Filtro de tema: bloquear preguntas fuera del portafolio
    if (!isPortfolioMessage(text)) {
      setTimeout(() => {
        removeTyping();
        addMsg(OFF_TOPIC_MSG, 'bot');
      }, 350);
      return;
    }

    // Revisar si el KB local tiene una respuesta con suficiente confianza
    const { intent, score } = detectIntent(text);
    const kbHasAnswer = intent && PORTFOLIO_INTENTS.has(intent.id) && score >= 0.45;

    if (kbHasAnswer) {
      // Respuesta directa desde el KB local — rápida y completa
      setTimeout(() => {
        removeTyping();
        addMsg(generateReply(text), 'bot');
      }, 280);
      return;
    }

    // Para preguntas con poca coincidencia en el KB, intentar la IA online
    // Si la IA falla, usar el KB local de todos modos
    fetchSmartReply(text)
      .then(reply => {
        removeTyping();
        addMsg(aiToHtml(reply), 'bot');
      })
      .catch(() => {
        setTimeout(() => {
          removeTyping();
          addMsg(generateReply(text), 'bot');
        }, 200);
      });
  }

  let chatGreeted = false;
  function openChat() {
    if (!chatWin) return;
    chatWin.classList.add('open');
    chatWin.setAttribute('aria-hidden', 'false');
    chatFab.classList.add('hidden');

    if (!chatGreeted) {
      chatGreeted = true;
      // Si hay historial reciente, lo restauramos
      loadHistory();
      if (ctx.history.length > 0) {
        ctx.history.forEach(m => addMsg(m.html, m.who, false));
      } else {
        setTimeout(() => addMsg(
          '¡Hola! Soy <strong>LM AI</strong>, el asistente de Leonardo Márquez. Puedo ayudarte con información sobre sus <strong>servicios</strong>, <strong>precios</strong>, <strong>tiempos de entrega</strong>, <strong>portafolio</strong> y <strong>contacto</strong>. ¿En qué te puedo ayudar?',
          'bot'
        ), 250);
      }
      renderQuickReplies();
    }
  }
  function closeChat() {
    if (!chatWin) return;
    chatWin.classList.remove('open');
    chatWin.setAttribute('aria-hidden', 'true');
    chatFab.classList.remove('hidden');

    // Detener voz activa
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    // Reiniciar historial y contexto
    ctx.history   = [];
    ctx.lastTopic = null;
    try { localStorage.removeItem(HISTORY_KEY); } catch (e) {}

    // Limpiar mensajes del DOM para que al abrir aparezca el saludo inicial
    const chatBody = document.getElementById('chat-body');
    if (chatBody) chatBody.innerHTML = '';

    // Limpiar chips de sugerencias
    const chatQuick = document.getElementById('chat-quick');
    if (chatQuick) chatQuick.innerHTML = '';

    // Permitir que se muestre el saludo otra vez
    chatGreeted = false;
  }

  if (chatFab)   chatFab.addEventListener('click', openChat);
  if (chatClose) chatClose.addEventListener('click', closeChat);
  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendUserMessage(chatInput.value);
    });
  }

  // Cierra el chat con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatWin && chatWin.classList.contains('open')) closeChat();
  });

  /* --------------------------------------------------------
     14. Tabs de tarifas (Servicios)
  --------------------------------------------------------- */
  const pricingTabs   = document.querySelectorAll('.pricing-tab');
  const pricingPanels = {
    tech:   document.getElementById('panel-tech'),
    design: document.getElementById('panel-design')
  };
  pricingTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      pricingTabs.forEach(t => t.classList.toggle('active', t === tab));
      Object.entries(pricingPanels).forEach(([k, panel]) => {
        if (panel) panel.classList.toggle('active', k === target);
      });
    });
  });

})();


// --- service-prefill ---
(function () {
  if (typeof window === 'undefined') return;
  function init () {
    var form = document.getElementById('contact-form');
    if (!form) return;
    try {
      var params = new URLSearchParams(window.location.search);
      var srv = params.get('servicio');
      if (!srv) return;

      // Price lookup map — keyed by lowercase fragments of the service name
      var PRICE_MAP = [
        { re: /diagn.stico/,             tipo: 'Soporte Técnico',    cop: '$35.000 – $45.000 COP', usd: 'USD $9–$12' },
        { re: /formateo|windows/,         tipo: 'Soporte Técnico',    cop: '$80.000 – $100.000 COP', usd: 'USD $21–$26' },
        { re: /mantenimiento integral/,   tipo: 'Soporte Técnico',    cop: '$120.000 – $140.000 COP', usd: 'USD $31–$36' },
        { re: /mantenimiento preventivo/, tipo: 'Soporte Técnico',    cop: '$60.000 – $75.000 COP', usd: 'USD $15–$19' },
        { re: /limpieza f.sica|pasta/,   tipo: 'Soporte Técnico',    cop: '$70.000 – $85.000 COP', usd: 'USD $18–$22' },
        { re: /repuesto/,                 tipo: 'Soporte Técnico',    cop: '$45.000 – $60.000 COP', usd: 'USD $12–$15' },
        { re: /virus|malware/,            tipo: 'Soporte Técnico',    cop: '$55.000 – $70.000 COP', usd: 'USD $14–$18' },
        { re: /wifi|repetidor|red/,       tipo: 'Soporte Técnico',    cop: '$55.000 – $70.000 COP', usd: 'USD $14–$18' },
        { re: /software especializado/,   tipo: 'Soporte Técnico',    cop: '$45.000 – $60.000 COP', usd: 'USD $12–$15' },
        { re: /domicilio/,                tipo: 'Soporte Técnico',    cop: '$25.000 – $35.000 COP', usd: 'USD $6–$9' },
        { re: /logo.*manual|manual.*identidad/, tipo: 'Diseño Gráfico', cop: '$100.000 COP', usd: 'USD $27' },
        { re: /logo/,                     tipo: 'Diseño Gráfico',     cop: '$60.000 COP', usd: 'USD $15' },
        { re: /banner.*impresi.n|pend.n/, tipo: 'Diseño Gráfico',     cop: '$60.000 COP', usd: 'USD $15' },
        { re: /banner/,                   tipo: 'Diseño Gráfico',     cop: '$35.000 COP', usd: 'USD $9' },
        { re: /flyer|volante/,            tipo: 'Diseño Gráfico',     cop: '$35.000 COP', usd: 'USD $9' },
        { re: /tarjeta/,                  tipo: 'Diseño Gráfico',     cop: '$30.000 COP', usd: 'USD $8' },
        { re: /youtube.*pieza|pieza/,     tipo: 'Diseño Gráfico',     cop: '$253.000 COP', usd: 'USD $70' },
        { re: /video.*corto|reel/,        tipo: 'Diseño Gráfico',     cop: '$180.000 COP', usd: 'USD $50' },
        { re: /video/,                    tipo: 'Diseño Gráfico',     cop: '$180.000 COP', usd: 'USD $50' },
        { re: /photoshop|retoque|foto/,   tipo: 'Diseño Gráfico',     cop: '$25.000 COP', usd: 'USD $6' },
        { re: /portada/,                  tipo: 'Diseño Gráfico',     cop: '$45.000 COP', usd: 'USD $12' },
        { re: /presentaci.n|ppt|canva/,   tipo: 'Diseño Gráfico',     cop: '$80.000 COP', usd: 'USD $21' },
        { re: /gesti.n.*redes|community/, tipo: 'Diseño Gráfico',     cop: '$180.000 COP/mes', usd: 'USD $50' }
      ];

      var t = srv.toLowerCase();
      var priceInfo = null;
      for (var pi = 0; pi < PRICE_MAP.length; pi++) {
        if (PRICE_MAP[pi].re.test(t)) { priceInfo = PRICE_MAP[pi]; break; }
      }

      var msgEl = form.querySelector('#message');
      if (msgEl && !msgEl.value) {
        var priceStr = priceInfo
          ? '\nPrecio: ' + priceInfo.cop + ' (' + priceInfo.usd + ')\nTipo: ' + priceInfo.tipo
          : '';
        msgEl.value = 'Hola Leonardo, me interesa el servicio: "' + srv + '".' + priceStr + '\n¿Podrías darme más información y agendar?';
      }

      // Try to match the requested service to one of the select options
      var sel = form.querySelector('#service');
      if (sel) {
        var bestOpt = null, bestScore = 0;
        var srvWords = t.split(/[\s\-\+\/,()]+/).filter(function(w){ return w.length > 3; });
        Array.prototype.forEach.call(sel.options, function(opt) {
          if (!opt.value) return;
          var ov = opt.value.toLowerCase();
          var score = 0;
          srvWords.forEach(function(w){ if (ov.indexOf(w) !== -1) score++; });
          if (score > bestScore) { bestScore = score; bestOpt = opt; }
        });
        if (bestOpt && bestScore > 0) {
          sel.value = bestOpt.value;
        }
      }

      // Scroll to the form smoothly
      var contactSec = document.getElementById('contact');
      if (contactSec) {
        setTimeout(function () {
          contactSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }

      // Highlight the form briefly
      form.classList.add('prefilled');
      setTimeout(function () { form.classList.remove('prefilled'); }, 2200);
    } catch (e) { /* no-op */ }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();


// --- v3: voice + email branding ---
(function () {
  if (typeof window === 'undefined') return;

  /* =========== Voice (Text-to-Speech) for chat replies =========== */
  var VOICE_KEY = 'lm_chat_voice';
  var voiceOn = (function () {
    try { return localStorage.getItem(VOICE_KEY) !== '0'; } catch (e) { return true; }
  })();

  function injectVoiceButton() {
    var header = document.querySelector('.chat-window .chat-header');
    var closeBtn = document.querySelector('.chat-window .chat-close');
    if (!header || !closeBtn || header.querySelector('.chat-voice')) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chat-voice ' + (voiceOn ? 'on' : 'off');
    btn.setAttribute('aria-label', 'Activar/desactivar voz');
    btn.title = voiceOn ? 'Voz activada — clic para silenciar' : 'Voz silenciada — clic para activar';
    btn.innerHTML = voiceIconSVG(voiceOn);
    btn.addEventListener('click', function () {
      voiceOn = !voiceOn;
      try { localStorage.setItem(VOICE_KEY, voiceOn ? '1' : '0'); } catch (e) {}
      btn.classList.toggle('on', voiceOn);
      btn.classList.toggle('off', !voiceOn);
      btn.innerHTML = voiceIconSVG(voiceOn);
      btn.title = voiceOn ? 'Voz activada — clic para silenciar' : 'Voz silenciada — clic para activar';
      if (!voiceOn && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    });
    closeBtn.parentNode.insertBefore(btn, closeBtn);
  }
  function voiceIconSVG(on) {
    return on
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19 12c0-2.5-1.4-4.6-3.5-5.6"/><path d="M16 12c0-1.4-.7-2.5-1.7-3.1"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>';
  }

  function speakText(text) {
    if (!voiceOn) return;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      var clean = String(text)
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (!clean) return;
      // ---- Convertir precios a texto hablado en español ----
      // "USD $9–$12" → "equivalentes a 9–12 dólares"
      clean = clean.replace(/\(?USD\s*\$\s*([\d.,–\-]+)\)?/gi, function(_, v) {
        return 'equivalentes a ' + v.replace('.', '') + ' dólares';
      });
      // "$120.000 – $140.000 COP" → "120 mil a 140 mil pesos colombianos"
      clean = clean.replace(/\$([\d]+)\.([\d]{3})\s*[–\-]\s*\$([\d]+)\.([\d]{3})\s*COP/g, function(_, a1, a2, b1, b2) {
        var from = parseInt(a1, 10), to = parseInt(b1, 10);
        return from + ' mil a ' + to + ' mil pesos colombianos';
      });
      // "$35.000 COP" → "35 mil pesos colombianos"
      clean = clean.replace(/\$([\d]+)\.([\d]{3})\s*COP/g, function(_, a, b) {
        return parseInt(a, 10) + ' mil pesos colombianos';
      });
      // "$180.000" → "180 mil pesos"
      clean = clean.replace(/\$([\d]+)\.([\d]{3})/g, function(_, a) {
        return parseInt(a, 10) + ' mil pesos';
      });
      // Any remaining lone "$" → "pesos"
      clean = clean.replace(/\$/g, 'pesos ');
      // ---- Quitar términos técnicos que suenan feo al hablar ----
      clean = clean.replace(/\bhtml\b/gi, '');
      clean = clean.replace(/\bcss\b/gi, '');
      clean = clean.replace(/\bpdf\b/gi, '');
      clean = clean.replace(/→/g, '');
      clean = clean.replace(/\s{2,}/g, ' ').trim();
      // ---- fin conversión ----
      // Cap length to avoid super long readings
      if (clean.length > 360) clean = clean.slice(0, 360) + '…';
      var u = new SpeechSynthesisUtterance(clean);
      u.lang  = 'es-ES';
      u.rate  = 1.02;
      u.pitch = 1.0;
      u.volume = 1.0;
      // Pick a Spanish voice if available
      var voices = window.speechSynthesis.getVoices();
      var sp = voices.find(function (v) { return /^es/i.test(v.lang); });
      if (sp) u.voice = sp;
      window.speechSynthesis.speak(u);
    } catch (e) { /* noop */ }
  }

  // Hook into the chat: wrap addMsg if present so bot replies are spoken.
  function hookChatVoice() {
    var body = document.getElementById('chat-body');
    if (!body || body.__voiceHooked) return;
    body.__voiceHooked = true;
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (n.nodeType === 1 && n.classList && n.classList.contains('msg') && n.classList.contains('bot')) {
            speakText(n.innerText || n.textContent || '');
          }
        });
      });
    });
    observer.observe(body, { childList: true });
  }

  // Initialise once DOM is ready
  function initVoice() {
    injectVoiceButton();
    hookChatVoice();
    // Trigger voice list load (some browsers need this)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = function () { /* refresh */ };
      window.speechSynthesis.getVoices();
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoice);
  } else { initVoice(); }

  /* =========== Email branding for FormSubmit =========== */
  function brandFormSubmit() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var nameEl    = form.querySelector('#name');
    var emailEl   = form.querySelector('#email');
    var serviceEl = form.querySelector('#service');
    var msgEl     = form.querySelector('#message');
    var subjEl    = form.querySelector('input[name="_subject"]');
    var autoEl    = form.querySelector('#autoresponse-field');
    var replyEl   = form.querySelector('#replyto-field');

    function svcLabel() {
      if (!serviceEl) return '';
      var opt = serviceEl.options[serviceEl.selectedIndex];
      return opt ? opt.text : serviceEl.value;
    }
    function buildAutoresponse() {
      var nm = (nameEl && nameEl.value || 'amigo').trim();
      var sv = svcLabel() || 'tu solicitud';
      return [
        '════════════════════════════════',
        '   ⚡  L M  ·  LEONARDO MÁRQUEZ',
        '   SYS_ADMIN // DEV // DESIGN',
        '════════════════════════════════',
        '',
        'Hola ' + nm + ',',
        '',
        '¡Gracias por escribir! Recibí tu solicitud:',
        '➜ Servicio: ' + sv,
        '',
        'Te contactaré en menos de 24 horas para darte detalles, precio final y agendar.',
        'Mientras tanto, revisa tu carpeta de descargas: te dejé un PDF con el resumen y mis datos de contacto.',
        '',
        '📞 WhatsApp:  +57 313 204 9102',
        '✉️  Email:    lumar.321456@gmail.com',
        '📍 Ubicación: Sibaté, Colombia',
        '',
        '— Leonardo Márquez (LM)',
        '   "Convierto ideas en sistemas y diseños que funcionan."',
      ].join('\n');
    }
    function syncFields() {
      if (subjEl && serviceEl) {
        var sv = svcLabel();
        subjEl.value = sv ? ('🛠 Nueva solicitud: ' + sv + ' — ' + (nameEl && nameEl.value || '')) :
                            'Nueva solicitud — Portafolio Leonardo Márquez';
      }
      if (autoEl) autoEl.value = buildAutoresponse();
      if (replyEl && emailEl) replyEl.value = emailEl.value || '';
    }
    ['input', 'change'].forEach(function (ev) {
      form.addEventListener(ev, syncFields);
    });
    syncFields();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', brandFormSubmit);
  } else { brandFormSubmit(); }
})();
