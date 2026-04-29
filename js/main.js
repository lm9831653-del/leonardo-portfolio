
/* =========================================================
   LEONARDO MÁRQUEZ — PORTAFOLIO
   Vanilla JavaScript (sin dependencias)
   ========================================================= */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------
     1. Custom Cursor
  --------------------------------------------------------- */
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot && ring && window.matchMedia('(min-width: 901px)').matches) {
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
  }

  /* --------------------------------------------------------
     2. Scroll progress + nav scrolled state + active link
  --------------------------------------------------------- */
  const progress = document.getElementById('scroll-progress');
  const nav      = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = ['inicio','about','services','portfolio','contact'].map(id => document.getElementById(id));

  function onScroll() {
    const top = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = ((top / max) * 100) + '%';
    if (nav)      nav.classList.toggle('scrolled', top > 40);

    // active section
    const y = top + window.innerHeight * 0.35;
    let current = sections[0];
    sections.forEach(s => { if (s && s.offsetTop <= y) current = s; });
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
     8. Mouse parallax for hero visual
  --------------------------------------------------------- */
  const hero = document.getElementById('inicio');
  const parallaxEls = hero ? hero.querySelectorAll('[data-parallax]') : [];
  if (hero && parallaxEls.length && !reduceMotion) {
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
     10. Tilt cards (services)
  --------------------------------------------------------- */
  if (!reduceMotion) {
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
    document.getElementById('modal-img').src   = p.image;
    document.getElementById('modal-img').alt   = p.title;
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
     12. Contact form
       a) Abre WhatsApp con el mensaje pre-llenado al número de Leonardo
       b) Envía el formulario por POST a FormSubmit.co (correo a Leonardo
          y autorespuesta automática al cliente)
  --------------------------------------------------------- */
  const WHATSAPP_NUMBER = '573132049102'; // sin "+" ni espacios
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

      if (name.length < 2)    { showError('name',    'El nombre es muy corto'); ok = false; }
      if (!/^\S+@\S+\.\S+$/.test(email)) { showError('email', 'Correo electrónico inválido'); ok = false; }
      if (!service)           { showError('service', 'Selecciona un servicio'); ok = false; }
      if (message.length < 10){ showError('message', 'El mensaje debe tener al menos 10 caracteres'); ok = false; }
      if (!ok) return;

      // 1) Mensaje preformateado para WhatsApp
      const waText =
        `Hola Leonardo, soy *${name}*.\n` +
        `Me interesa el servicio: *${service}*.\n\n` +
        `${message}\n\n` +
        `Mi correo: ${email}`;
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;

      // 2) Mensaje del autoresponse al cliente
      const autoresponse =
        `Hola ${name}, gracias por contactar a Leonardo Márquez.\n\n` +
        `Hemos recibido tu solicitud para el servicio: ${service}.\n\n` +
        `Tu mensaje:\n"${message}"\n\n` +
        `Te responderé a la mayor brevedad. Si necesitas atención inmediata, escríbeme por WhatsApp al +57 313 204 9102.\n\n` +
        `— Leonardo Márquez`;
      const autoField = document.getElementById('autoresponse-field');
      if (autoField) autoField.value = autoresponse;

      const btn = document.getElementById('submit-btn');
      const txt = btn.querySelector('.btn-text');
      const orig = txt.textContent;
      txt.textContent = 'ABRIENDO WHATSAPP...';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      // 3) Abre WhatsApp en pestaña nueva
      window.open(waUrl, '_blank');

      // 4) Envío del formulario por correo (FormSubmit) en segundo plano
      const data = new FormData(form);
      fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .catch(() => { /* silencioso: WhatsApp ya se abrió */ })
        .finally(() => {
          txt.textContent = orig;
          btn.disabled = false;
          btn.style.opacity = '';
          form.reset();
          showToast(
            '¡Mensaje enviado con éxito!',
            'Se abrió WhatsApp y recibirás un correo de confirmación.'
          );
        });
    });
  }

  /* --------------------------------------------------------
     13. Asistente IA — Chat Widget
       Reconoce intenciones por palabras clave y responde
       en español con tono amigable. Ofrece quick-replies
       y deriva a WhatsApp cuando corresponde.
  --------------------------------------------------------- */
  const chatFab    = document.getElementById('chat-fab');
  const chatWin    = document.getElementById('chat-window');
  const chatClose  = document.getElementById('chat-close');
  const chatBody   = document.getElementById('chat-body');
  const chatQuick  = document.getElementById('chat-quick');
  const chatForm   = document.getElementById('chat-form');
  const chatInput  = document.getElementById('chat-input');

  // Base de conocimiento del asistente
  const KB = [
    { id:'saludo',    keys:['hola','hey','buenas','buen dia','buen día','saludos','que tal','qué tal','hi','hello'],
      reply: '¡Hola! Soy el asistente de Leonardo. Puedo ayudarte con información sobre <strong>servicios</strong>, <strong>precios</strong>, <strong>tiempos</strong> o ponerte en contacto directo con él. ¿Qué necesitas?' },
    { id:'servicios', keys:['servicio','servicios','que haces','qué haces','que ofreces','qué ofreces','que hace','qué hace'],
      reply: 'Leonardo trabaja en <strong>tres áreas principales</strong>:<br>• <strong>Diseño Gráfico</strong> (logos, branding, redes sociales)<br>• <strong>Desarrollo Web</strong> (landing pages, e-commerce, UI/UX)<br>• <strong>Soporte y Sistemas</strong> (redes, hosting, mantenimiento)<br>¿Sobre cuál quieres saber más?' },
    { id:'diseno',    keys:['diseno','diseño','logo','logos','branding','marca','identidad','imagen','redes sociales','flyer','afiche','social media','illustrator','photoshop'],
      reply: 'En <strong>diseño gráfico</strong> Leonardo crea identidades visuales completas: logotipos, manuales de marca, contenido para redes sociales, material editorial y ediciones publicitarias. Trabaja con Illustrator, Photoshop, Figma y After Effects.' },
    { id:'web',       keys:['web','pagina','página','sitio','landing','tienda','ecommerce','e-commerce','frontend','desarrollo','programacion','programación','react','html','css','javascript','app'],
      reply: 'En <strong>desarrollo web</strong> construye landing pages, tiendas online y aplicaciones modernas con React, Tailwind y JavaScript. Diseño responsivo, animaciones fluidas y enfoque en conversión.' },
    { id:'soporte',   keys:['soporte','sistema','sistemas','red','redes','hosting','servidor','seguridad','linux','windows','reparar','reparación','mantenimiento','computador','pc'],
      reply: 'En <strong>soporte y sistemas</strong> ofrece configuración de hosting, administración de redes, seguridad informática y mantenimiento preventivo. También reparación de hardware y atención remota.' },
    { id:'precio',    keys:['precio','precios','costo','costos','cobra','cobras','cuanto','cuánto','vale','valor','tarifa','presupuesto','cotizar','cotizacion','cotización'],
      reply: 'El precio depende del alcance del proyecto. Para una <strong>cotización personalizada</strong> en pocos minutos, escríbele por WhatsApp con los detalles de lo que necesitas.<br><br><a href="https://wa.me/573132049102" target="_blank">Cotizar ahora por WhatsApp →</a>' },
    { id:'tiempo',    keys:['tiempo','demora','demoras','dias','días','semanas','plazo','entrega','rapido','rápido','urgente','cuando','cuándo'],
      reply: 'Los tiempos varían según la complejidad: un <strong>logo</strong> entre 3-7 días, una <strong>landing page</strong> 1-3 semanas, y un <strong>sitio completo</strong> 3-6 semanas. Para urgencias, contáctalo por WhatsApp.' },
    { id:'experiencia',keys:['experiencia','años','años','trayectoria','curriculum','cv','sena','adso','estudios','estudia','formacion','formación'],
      reply: 'Leonardo es estudiante de <strong>Análisis y Desarrollo de Software (SENA)</strong>, freelance de diseño gráfico desde 2021 y soporte técnico remoto desde 2022. Combina visión creativa con conocimientos técnicos sólidos.' },
    { id:'contacto',  keys:['contacto','contactar','hablar','escribir','llamar','telefono','teléfono','celular','whatsapp','wsp','wa','correo','email','mail'],
      reply: 'Puedes contactar a Leonardo por:<br>• <strong>WhatsApp:</strong> <a href="https://wa.me/573132049102" target="_blank">+57 313 204 9102</a><br>• <strong>Email:</strong> <a href="mailto:lumar.321456@gmail.com">lumar.321456@gmail.com</a><br>• <strong>Formulario:</strong> en la sección de Contacto de esta página.' },
    { id:'ubicacion', keys:['donde','dónde','ubicacion','ubicación','ciudad','pais','país','vive','queda','colombia','sibate','sibaté','bogota','bogotá'],
      reply: 'Leonardo está ubicado en <strong>Sibaté, Cundinamarca (Colombia)</strong>. Trabaja presencialmente en la zona y de forma remota para clientes en cualquier parte del mundo.' },
    { id:'portafolio',keys:['portafolio','proyecto','proyectos','trabajo','trabajos','ejemplo','ejemplos','muestra','demos','ver','mostrar'],
      reply: 'Puedes ver sus proyectos destacados en la sección <strong>Portafolio</strong> de esta misma página. Hay trabajos de diseño, desarrollo web e infraestructura. Haz clic en cualquier tarjeta para ver el detalle.' },
    { id:'agradecer', keys:['gracias','muchas gracias','genial','perfecto','excelente','bueno','vale','ok','okay','dale'],
      reply: '¡Con gusto! Si necesitas algo más, estoy aquí. Cuando quieras avanzar, escríbele a Leonardo por WhatsApp y te responderá lo antes posible.' },
    { id:'despedida', keys:['adios','adiós','chao','bye','nos vemos','hasta luego'],
      reply: '¡Hasta pronto! Que tengas un excelente día. No dudes en volver a escribir cuando quieras.' }
  ];

  const FALLBACK =
    'No estoy seguro de entender. Puedo ayudarte con: <strong>servicios</strong>, <strong>precios</strong>, <strong>tiempos</strong>, <strong>portafolio</strong>, <strong>experiencia</strong> o <strong>contacto</strong>. También puedes <a href="https://wa.me/573132049102" target="_blank">escribir directo por WhatsApp</a>.';

  const QUICK = [
    { label: 'Servicios',  text: 'Quiero saber qué servicios ofreces' },
    { label: 'Precios',    text: '¿Cuánto cuesta?' },
    { label: 'Tiempos',    text: '¿Cuánto se demora?' },
    { label: 'Contacto',   text: '¿Cómo te contacto?' },
    { label: 'Ubicación',  text: '¿Dónde estás?' },
    { label: 'WhatsApp',   text: 'Quiero hablar por WhatsApp' }
  ];

  function normalize(s) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
      .replace(/[¿?¡!.,]/g, ' ')
      .replace(/\s+/g, ' ').trim();
  }

  function findReply(text) {
    const t = ' ' + normalize(text) + ' ';
    let best = null, bestScore = 0;
    for (const intent of KB) {
      let score = 0;
      for (const k of intent.keys) {
        const nk = normalize(k);
        if (t.includes(' ' + nk + ' ') || t.includes(' ' + nk) || t.includes(nk + ' ')) {
          score += nk.length; // las palabras más largas pesan más
        }
      }
      if (score > bestScore) { bestScore = score; best = intent; }
    }
    return best ? best.reply : FALLBACK;
  }

  function addMsg(html, who) {
    const el = document.createElement('div');
    el.className = 'msg ' + who;
    el.innerHTML = html;
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
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

  function sendUserMessage(text) {
    if (!text || !text.trim()) return;
    addMsg(text.replace(/</g, '&lt;'), 'user');
    chatInput.value = '';
    addTyping();
    const delay = 600 + Math.min(text.length * 20, 1200);
    setTimeout(() => {
      removeTyping();
      addMsg(findReply(text), 'bot');
    }, delay);
  }

  let chatGreeted = false;
  function openChat() {
    if (!chatWin) return;
    chatWin.classList.add('open');
    chatWin.setAttribute('aria-hidden', 'false');
    chatFab.classList.add('hidden');
    if (!chatGreeted) {
      chatGreeted = true;
      setTimeout(() => addMsg('¡Hola! Soy el asistente de Leonardo. Puedo resolver tus dudas sobre servicios, precios, tiempos o contactarte con él. ¿En qué te ayudo?', 'bot'), 250);
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

})();
