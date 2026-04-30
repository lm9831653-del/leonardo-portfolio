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
  if (blob && !reduceMotion) {
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

  // ---- Base de conocimiento ----
  const KB = [
    { id:'saludo',
      keys:['hola','buenas','holi','holaa','saludos','hey','que tal','qué tal','buen dia','buen día','buenas tardes','buenas noches','buenos dias','buenos días','hi','hello'],
      replies: [
        '¡Hola! Soy el asistente virtual de Leonardo. Puedo ayudarte con información sobre <strong>servicios</strong>, <strong>precios</strong>, <strong>tiempos de entrega</strong> o ponerte en contacto directo con él. ¿En qué te puedo ayudar?',
        '¡Hey! Bienvenido al portafolio de Leonardo. Soy su asistente. ¿Quieres saber sobre algún servicio en específico o necesitas una cotización?',
        '¡Hola! Qué bueno tenerte por aquí. Cuéntame qué proyecto tienes en mente y te oriento.'
      ]},

    { id:'servicios',
      keys:['servicio','servicios','que haces','qué haces','que ofreces','qué ofreces','que vendes','qué vendes','catalogo','catálogo','en que ayudas','en qué ayudas','lo que haces'],
      replies: [
        'Leonardo ofrece <strong>tres áreas principales</strong>:<br><br>• <strong>Diseño Gráfico</strong> — logos, identidad de marca, redes sociales, material editorial.<br>• <strong>Desarrollo Web</strong> — landing pages, e-commerce, aplicaciones interactivas.<br>• <strong>Soporte y Sistemas</strong> — redes, hosting, seguridad, mantenimiento.<br><br>¿Sobre cuál quieres saber más?'
      ]},

    { id:'diseno', topic:'diseno',
      keys:['diseno','diseño','disenio','logo','logos','logotipo','branding','marca','identidad','imagen','flyer','afiche','poster','banner','social media','redes sociales','illustrator','photoshop','grafico','gráfico','arte','artistico','artístico','editorial','print'],
      replies: [
        'En <strong>diseño gráfico</strong> Leonardo crea identidades visuales completas: logotipos, manuales de marca, contenido para redes sociales, material editorial y piezas publicitarias. Trabaja con Illustrator, Photoshop, Figma y After Effects.<br><br>¿Quieres una cotización para tu marca?',
        'Para <strong>diseño</strong> Leonardo cubre desde un logo individual hasta sistemas completos de identidad visual. También crea plantillas para Instagram, Facebook y TikTok. ¿Qué necesitas para tu marca?'
      ]},

    { id:'web', topic:'web',
      keys:['web','página','pagina','sitio','site','website','landing','tienda','ecommerce','e-commerce','online','plataforma','frontend','desarrollo','programacion','programación','programar','react','html','css','javascript','app','aplicacion','aplicación','wordpress','responsive','responsiva'],
      replies: [
        'En <strong>desarrollo web</strong> Leonardo construye landing pages, tiendas online y aplicaciones modernas con React, Tailwind y JavaScript. Diseño responsivo, animaciones fluidas y enfoque total en conversión.<br><br>¿Tienes una idea concreta? Te paso una cotización rápida.',
        'Para <strong>web</strong> trabaja con tecnologías modernas: React, Tailwind, animaciones, integración con APIs e IA. Todo se ve impecable en celular y computadora. ¿Qué tipo de página necesitas?'
      ]},

    { id:'soporte', topic:'soporte',
      keys:['soporte','sistema','sistemas','red','redes','hosting','servidor','servidores','seguridad','linux','windows','reparar','reparacion','reparación','mantenimiento','computador','pc','tecnico','técnico','arreglar','formatear','virus','antivirus','wifi','router','impresora'],
      replies: [
        'En <strong>soporte y sistemas</strong> Leonardo ofrece configuración de hosting, administración de redes, seguridad informática, mantenimiento preventivo y reparación de hardware. Atención presencial en Sibaté y remota a todo el país.',
        'Para <strong>soporte técnico</strong> resuelve problemas de redes, hosting, servidores, seguridad, virus, lentitud, configuración de WiFi e impresoras, y mantenimiento general de equipos. ¿Qué problema tienes?'
      ]},

    { id:'precio', topic:'precio',
      keys:['precio','precios','costo','costos','cuesta','cuestan','cobra','cobras','cuanto','cuánto','vale','valor','valor','tarifa','tarifas','presupuesto','cotizar','cotizacion','cotización','cuanto sale','cuánto sale','plata','dinero','pesos','pago','barato','caro','económico','economico'],
      replies: [
        'El precio depende del alcance del proyecto. Como referencia general:<br><br>• Logo simple: desde <strong>$80.000 COP</strong><br>• Identidad de marca: desde <strong>$250.000 COP</strong><br>• Landing page: desde <strong>$400.000 COP</strong><br>• Sitio web completo: desde <strong>$800.000 COP</strong><br>• Soporte técnico: desde <strong>$30.000 COP</strong> (visita)<br><br>Para una cotización exacta, escríbele por WhatsApp:<br><a href="https://wa.me/573132049102" target="_blank">Cotizar ahora →</a>',
        'Cada proyecto tiene un precio distinto según lo que necesites. Para darte un valor exacto en pocos minutos, lo mejor es escribirle por WhatsApp con los detalles:<br><br><a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102</a>'
      ]},

    { id:'tiempo', topic:'tiempo',
      keys:['tiempo','tiempos','demora','demoras','tarda','tarde','dias','días','semanas','meses','plazo','plazos','entrega','rapido','rápido','urgente','cuando','cuándo','listo','disponible','disponibilidad'],
      replies: [
        'Los tiempos típicos son:<br><br>• <strong>Logo:</strong> 3 a 7 días<br>• <strong>Identidad de marca completa:</strong> 1 a 2 semanas<br>• <strong>Landing page:</strong> 1 a 3 semanas<br>• <strong>Sitio web completo:</strong> 3 a 6 semanas<br>• <strong>Soporte técnico:</strong> mismo día o al siguiente<br><br>Para urgencias, contáctalo por WhatsApp.',
        'Depende de la complejidad. Un trabajo sencillo puede estar en menos de una semana, un sitio completo entre 3 y 6 semanas. Si es urgente, díselo por WhatsApp y vemos.'
      ]},

    { id:'experiencia',
      keys:['experiencia','años','trayectoria','curriculum','cv','sena','adso','estudios','estudia','formacion','formación','quien es','quién es','quien eres','quién eres','sobre el','sobre él','acerca de','perfil'],
      replies: [
        'Leonardo es estudiante de <strong>Análisis y Desarrollo de Software (SENA)</strong>. Trabaja como freelance de diseño gráfico desde 2021 y en soporte técnico remoto desde 2022. Combina visión creativa con conocimientos técnicos sólidos en programación, diseño y sistemas.'
      ]},

    { id:'contacto',
      keys:['contacto','contactar','hablar','escribir','llamar','telefono','teléfono','celular','whatsapp','wsp','wa','correo','email','mail','escribirle'],
      replies: [
        'Estos son sus canales de contacto:<br><br>• <strong>WhatsApp:</strong> <a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102</a><br>• <strong>Email:</strong> <a href="mailto:lumar.321456@gmail.com">lumar.321456@gmail.com</a><br>• <strong>Formulario:</strong> baja a la sección de Contacto en esta página.<br><br>El más rápido es WhatsApp.'
      ]},

    { id:'ubicacion',
      keys:['donde','dónde','ubicacion','ubicación','direccion','dirección','ciudad','pais','país','vive','queda','colombia','sibate','sibaté','bogota','bogotá','cundinamarca','presencial','remoto'],
      replies: [
        'Leonardo está en <strong>Sibaté, Cundinamarca (Colombia)</strong>. Atiende presencialmente en la zona y trabaja de forma <strong>remota</strong> con clientes en cualquier parte del mundo.'
      ]},

    { id:'portafolio',
      keys:['portafolio','portfolio','proyecto','proyectos','trabajo','trabajos','ejemplo','ejemplos','muestra','muestras','demos','ver','mostrar','referencias'],
      replies: [
        'Sus proyectos están en la sección <strong>Portafolio</strong> de esta misma página. Hay 8 trabajos de diseño, desarrollo web e infraestructura. Haz clic en cualquier tarjeta para ver el detalle completo, las tecnologías usadas y la imagen.'
      ]},

    { id:'agendar', topic:'agendar',
      keys:['agendar','reunion','reunión','cita','llamada','meet','zoom','google meet','reservar','programar reunion','programar reunión'],
      replies: [
        'Para agendar una reunión, lo más rápido es escribirle por WhatsApp y coordinar el horario directamente:<br><br><a href="https://wa.me/573132049102?text=Hola%20Leonardo%2C%20quiero%20agendar%20una%20reuni%C3%B3n" target="_blank">Agendar por WhatsApp →</a>'
      ]},

    { id:'pago',
      keys:['pago','pagos','formas de pago','metodos de pago','métodos de pago','transferencia','nequi','daviplata','bancolombia','tarjeta','efectivo','paypal','anticipo'],
      replies: [
        'Acepta varias formas de pago: <strong>transferencia bancaria, Nequi, Daviplata y efectivo</strong>. Para proyectos grandes normalmente se trabaja con un <strong>50% de anticipo</strong> y el 50% restante a la entrega. Para confirmar con tu caso específico, escríbele por WhatsApp.'
      ]},

    { id:'garantia',
      keys:['garantia','garantía','soporte post','despues de entregar','después de entregar','correcciones','cambios','revisiones','ajustes','retoques'],
      replies: [
        'Sí, todos los proyectos incluyen <strong>2 a 3 rondas de ajustes sin costo</strong> dentro del alcance acordado. Para sitios web hay además <strong>soporte por 30 días</strong> después de la entrega para corregir cualquier detalle.'
      ]},

    { id:'idioma',
      keys:['ingles','inglés','english','espanol','español','spanish','idioma','idiomas','bilingue','bilingüe'],
      replies: [
        'Leonardo trabaja principalmente en <strong>español</strong>, pero puede entregar contenido y comunicarse en <strong>inglés</strong> sin problema. ¿En qué idioma necesitas tu proyecto?'
      ]},

    { id:'derivar_humano',
      keys:['hablar con leonardo','hablar con un humano','persona real','que me responda','quiero hablar','llamar','asesor real','no eres real','eres bot','eres robot','quiero a leonardo'],
      replies: [
        '¡Claro! Te conecto con Leonardo directamente. Toca el botón:<br><br><a href="https://wa.me/573132049102" target="_blank">Abrir WhatsApp ahora →</a>'
      ]},

    { id:'agradecer',
      keys:['gracias','muchas gracias','mil gracias','genial','perfecto','excelente','bueno','vale','ok','okay','dale','listo','chevere','chévere','bacano','super','súper'],
      replies: [
        '¡Con gusto! Si te queda otra duda estoy aquí. Cuando quieras avanzar, escríbele a Leonardo por WhatsApp.',
        '¡Para servirte! Cualquier otra cosa que necesites, dímelo nomás.'
      ]},

    { id:'despedida',
      keys:['adios','adiós','chao','bye','nos vemos','hasta luego','hasta pronto','me voy'],
      replies: [
        '¡Hasta pronto! Que tengas un excelente día. Vuelve cuando quieras.',
        '¡Chao! Cuídate mucho. Acá estoy para cuando me necesites.'
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
        diseno:  'El precio de un trabajo de <strong>diseño</strong> arranca desde $80.000 COP (logo simple) y sube según el alcance. Para una cotización exacta:<br><a href="https://wa.me/573132049102" target="_blank">Cotizar por WhatsApp →</a>',
        web:     'Para <strong>desarrollo web</strong>, una landing page comienza en $400.000 COP y un sitio completo en $800.000 COP. Para tu caso específico:<br><a href="https://wa.me/573132049102" target="_blank">Cotizar por WhatsApp →</a>',
        soporte: 'En <strong>soporte técnico</strong> el valor base es $30.000 COP por visita o sesión remota; trabajos de instalación/configuración se cotizan aparte. Más detalle:<br><a href="https://wa.me/573132049102" target="_blank">WhatsApp →</a>'
      };
      if (map[ctx.lastTopic]) return map[ctx.lastTopic];
    }

    if (intent && score >= 0.6) {
      if (intent.topic) ctx.lastTopic = intent.topic;
      return pick(intent.replies);
    }

    // Fallback inteligente: sugerencias específicas según las palabras detectadas
    const tokens = tokenize(text);
    const suggestions = [];
    if (tokens.some(t => fuzzyMatch(t,'cotizar') > 0 || fuzzyMatch(t,'precio') > 0)) suggestions.push('Precios');
    if (tokens.some(t => fuzzyMatch(t,'web') > 0 || fuzzyMatch(t,'pagina') > 0))     suggestions.push('Desarrollo Web');
    if (tokens.some(t => fuzzyMatch(t,'logo') > 0 || fuzzyMatch(t,'diseno') > 0))    suggestions.push('Diseño Gráfico');

    if (suggestions.length) {
      return `No estoy 100% seguro de tu pregunta. ¿Te refieres a <strong>${suggestions.join('</strong> o <strong>')}</strong>? También puedes escribirle directo a Leonardo:<br><a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102 →</a>`;
    }

    return 'Hmm, no estoy seguro de entenderte. Puedo ayudarte con: <strong>servicios</strong>, <strong>precios</strong>, <strong>tiempos</strong>, <strong>portafolio</strong>, <strong>contacto</strong> o <strong>ubicación</strong>.<br><br>Si prefieres hablar con Leonardo directo: <a href="https://wa.me/573132049102" target="_blank">WhatsApp →</a>';
  }

  // ---- DOM del chat ----
  const chatFab    = document.getElementById('chat-fab');
  const chatWin    = document.getElementById('chat-window');
  const chatClose  = document.getElementById('chat-close');
  const chatBody   = document.getElementById('chat-body');
  const chatQuick  = document.getElementById('chat-quick');
  const chatForm   = document.getElementById('chat-form');
  const chatInput  = document.getElementById('chat-input');

  const QUICK = [
    { label: 'Servicios',     text: '¿Qué servicios ofreces?' },
    { label: 'Precios',       text: '¿Cuánto cuesta?' },
    { label: 'Soporte',       text: 'Cuéntame sobre soporte técnico' },
    { label: 'Diseño',        text: 'Cuéntame sobre diseño' },
    { label: 'Agendar',       text: 'Quiero agendar una reunión' },
    { label: 'WhatsApp',      text: 'Quiero hablar por WhatsApp' },
    { label: '💡 Tema libre', text: 'Cuéntame algo curioso de tecnología' },
    { label: '🧠 Pregúntame', text: 'Pregúntame lo que quieras, puedo hablar de cualquier tema.' }
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
    'Eres "LM AI", el asistente personal del portafolio de Leonardo Márquez.',
    'Leonardo es Técnico en Sistemas y Diseñador Gráfico de Sibaté, Colombia.',
    'Sus servicios incluyen: reparación y mantenimiento de PC, formateo Windows,',
    'instalación de software, redes/WiFi, eliminación de virus, soporte a domicilio,',
    'diseño de logos, banners, flyers, edición de video, fotografía y gestión de redes sociales.',
    'Contacto: WhatsApp +57 313 204 9102 — Email lumar.321456@gmail.com.',
    'Si te preguntan por servicios, precios o agendar, recomienda contactar por WhatsApp o llenar el formulario en /contacto.html.',
    'PERO también puedes conversar libremente de CUALQUIER tema: cultura, ciencia, historia, tecnología,',
    'consejos, recetas, programación, matemáticas, deportes, salud, viajes, estudios, ayuda con tareas, etc.',
    'Responde SIEMPRE en español, de forma clara, amigable y breve (máximo 4 frases).',
    'No uses Markdown ni asteriscos; usa texto plano. Si el usuario pide código, devuélvelo claro.',
    'Si no sabes algo, dilo con honestidad.'
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

  function sendUserMessage(text) {
    if (!text || !text.trim()) return;
    addMsg(escapeHtml(text), 'user');
    chatInput.value = '';
    addTyping();

    // Intenta IA online; si falla, usa el motor local
    fetchSmartReply(text)
      .then(reply => {
        removeTyping();
        addMsg(aiToHtml(reply), 'bot');
      })
      .catch(() => {
        // pequeño delay para que se vea natural
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
          '¡Hola! Soy <strong>LM AI</strong>, el asistente de Leonardo. Puedo hablarte de sus <strong>servicios</strong>, <strong>precios</strong> y <strong>tiempos</strong>, o también <strong>conversar de cualquier tema</strong>: tecnología, ciencia, recetas, ayuda con tareas… ¿En qué te ayudo?',
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

      var msgEl = form.querySelector('#message');
      if (msgEl && !msgEl.value) {
        msgEl.value = 'Hola Leonardo, me interesa el servicio: "' + srv + '". ¿Podrías darme más información y agendar?';
      }

      // Try to map the requested service to one of the select options
      var sel = form.querySelector('#service');
      if (sel) {
        var t = srv.toLowerCase();
        var pick = '';
        if (/(logo|banner|flyer|tarjeta|portada|fotograf|video|presentaci|photoshop|gesti.n de redes)/.test(t)) {
          pick = 'design';
        } else if (/(web|sitio|html|p.gina)/.test(t)) {
          pick = 'web';
        } else if (/(diagn.stico|formateo|mantenimiento|limpieza|repuesto|domicilio|wifi|virus|software|red)/.test(t)) {
          pick = 'support';
        } else if (/(consultor)/.test(t)) {
          pick = 'consulting';
        } else {
          pick = 'other';
        }
        sel.value = pick;
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
