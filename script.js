// ==========================================
// BYTEFORGE - LÓGICA INTERACTIVA DEL SITIO
// Motor de Animación 3D Continua al Hacer Scroll
// Optimizado para Escritorio y Dispositivos Móviles
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Actualiza únicamente las secciones solicitadas para esta versión del portafolio.
  const projectsSection = document.querySelector("#proyectos");
  if (projectsSection) {
    const projects = [
      {
        title: "Portafolio ByteForge",
        type: "Proyecto personal",
        description: "Sitio personal para presentar mi perfil, habilidades y trabajo con una interfaz adaptable a distintos dispositivos.",
        image: "images/portfolio-ai-web.jpg",
        alt: "Visual conceptual de un portafolio web en tonos oscuros, magenta y cian",
        tags: ["HTML", "CSS", "JavaScript"]
      },
      {
        title: "Inventario de equipos",
        type: "Concepto de interfaz",
        description: "Idea de panel para organizar equipos, componentes y mantenimientos, inspirada en mi experiencia con hardware y soporte.",
        image: "images/portfolio-ai-inventory.jpg",
        alt: "Concepto visual de un panel de inventario de equipos",
        tags: ["Hardware", "Interfaz", "Responsive"]
      },
      {
        title: "Modelo de datos relacional",
        type: "Práctica de bases de datos",
        description: "Ejercicio de organización de proyectos, categorías y tecnologías mediante relaciones y consultas SQL.",
        image: "images/portfolio-ai-database.jpg",
        alt: "Diagrama conceptual de tablas y relaciones de una base de datos",
        tags: ["SQL", "MySQL", "Modelado"]
      },
      {
        title: "Identidad visual digital",
        type: "Práctica de diseño",
        description: "Exploración de piezas para canales digitales, cuidando la composición, la jerarquía visual y la coherencia de color.",
        image: "images/portfolio-ai-branding.jpg",
        alt: "Composición conceptual de piezas gráficas para una marca digital",
        tags: ["Photoshop", "Canva", "Diseño"]
      },
      {
        title: "Retoque y composición",
        type: "Práctica visual",
        description: "Ejercicio de edición fotográfica con ajustes de color, recorte y composición de imágenes.",
        image: "images/portfolio-ai-retouch.jpg",
        alt: "Composición fotográfica conceptual con paisaje de montaña",
        tags: ["Photoshop", "Retoque", "Color"]
      },
      {
        title: "Panel de soporte técnico",
        type: "Concepto de proyecto",
        description: "Propuesta visual para registrar equipos e incidencias, basada en tareas de soporte técnico independiente.",
        image: "images/portfolio-ai-support.jpg",
        alt: "Concepto de panel para registrar equipos y solicitudes de soporte",
        tags: ["Soporte", "Hardware", "Organización"]
      }
    ];

    const cards = projects.map((project, index) => `
      <article class="project-card reveal" style="transition-delay: ${index * 70}ms">
        <div class="project-card__image">
          <img src="${project.image}" alt="${project.alt}" loading="lazy">
          <span class="project-card__image-note">Visual provisional · generado con IA</span>
          <span class="project-card__number">0${index + 1}</span>
        </div>
        <div class="project-card__body">
          <div class="project-card__eyebrow">${project.type}</div>
          <h3>${project.title}</h3>
          <p>${project.description}</p>
          <div class="project-card__tags">
            ${project.tags.map(tag => `<span>${tag}</span>`).join("")}
          </div>
        </div>
      </article>
    `).join("");

    projectsSection.innerHTML = `
      <div class="project-gallery">
        <div class="project-gallery__heading reveal">
          <div>
            <p class="project-gallery__eyebrow">PORTAFOLIO · PRÁCTICAS · CONCEPTOS</p>
            <h2>PROYECTOS QUE <span>PUEDES EXPLORAR</span></h2>
            <p class="project-gallery__intro">Una selección basada en mi trabajo y en las habilidades que estoy desarrollando. Los visuales conceptuales son imágenes provisionales; después puedes reemplazarlas por capturas reales.</p>
          </div>
          <div class="project-gallery__controls" aria-label="Controles de proyectos">
            <span class="project-gallery__count">06 <span>PROYECTOS</span></span>
            <button class="project-gallery__arrow" type="button" data-project-direction="-1" aria-label="Ver proyectos anteriores">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6"></path></svg>
            </button>
            <button class="project-gallery__arrow" type="button" data-project-direction="1" aria-label="Ver más proyectos">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18l6-6-6-6"></path></svg>
            </button>
          </div>
        </div>
        <div class="project-gallery__track" tabindex="0" role="region" aria-label="Galería horizontal de proyectos">
          ${cards}
        </div>
        <p class="project-gallery__hint"><span aria-hidden="true">←</span> Desliza horizontalmente para ver los proyectos <span aria-hidden="true">→</span></p>
      </div>
    `;

    const track = projectsSection.querySelector(".project-gallery__track");
    projectsSection.querySelectorAll("[data-project-direction]").forEach(button => {
      button.addEventListener("click", () => {
        const direction = Number(button.dataset.projectDirection);
        track.scrollBy({ left: direction * Math.max(300, track.clientWidth * 0.78), behavior: "smooth" });
      });
    });
  }

  ["#fortalezas", "#experiencia", "#faq"].forEach(selector => {
    document.querySelector(selector)?.remove();
  });
  document.querySelectorAll('a[href="#experiencia"]').forEach(link => {
    link.closest("li")?.remove();
  });

  // 1. CAPAS DE FONDO PARA PARALLAX 3D
  const gridOverlay = document.querySelector(".grid-overlay");
  const ambientOverlay = document.querySelector(".ambient");

  // 2. HEADER CON FONDO AL HACER SCROLL
  const header = document.querySelector("header");
  if (header) {
    const handleScrollHeader = () => {
      if (window.scrollY > 24) {
        header.classList.add("bg-void/80", "backdrop-blur-md", "border-b", "border-line");
        header.classList.remove("bg-transparent", "py-5");
        header.classList.add("py-3.5");
      } else {
        header.classList.remove("bg-void/80", "backdrop-blur-md", "border-b", "border-line");
        header.classList.add("bg-transparent", "py-5");
        header.classList.remove("py-3.5");
      }
    };
    window.addEventListener("scroll", handleScrollHeader, { passive: true });
    handleScrollHeader();
  }

  // 3. MENÚ MÓVIL (TOGGLE)
  const mobileBtn = document.querySelector('button[aria-label*="menú"]');
  const mobileMenu = header ? header.querySelector(".lg\\:hidden.overflow-hidden") : null;

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      const isExpanded = mobileBtn.getAttribute("aria-expanded") === "true";
      mobileBtn.setAttribute("aria-expanded", !isExpanded);
      if (!isExpanded) {
        mobileMenu.classList.remove("max-h-0", "opacity-0");
        mobileMenu.classList.add("max-h-96", "opacity-100");
      } else {
        mobileMenu.classList.add("max-h-0", "opacity-0");
        mobileMenu.classList.remove("max-h-96", "opacity-100");
      }
    });

    mobileMenu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileBtn.setAttribute("aria-expanded", "false");
        mobileMenu.classList.add("max-h-0", "opacity-0");
        mobileMenu.classList.remove("max-h-96", "opacity-100");
      });
    });
  }

  // 4. ANIMACIONES 3D AL HACER SCROLL (INTERSECTION OBSERVER ESPACIAL)
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: [0.01, 0.05],
        rootMargin: "0px 0px 80px 0px"
      }
    );

    reveals.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 60 && rect.bottom >= 0) {
        el.classList.add("in-view");
      } else {
        observer.observe(el);
      }
    });

    let scrollTimeout;
    window.addEventListener("scroll", () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        reveals.forEach(el => {
          if (!el.classList.contains("in-view")) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight && rect.bottom >= 0) {
              el.classList.add("in-view");
              observer.unobserve(el);
            }
          }
        });
        scrollTimeout = null;
      }, 150);
    }, { passive: true });
  } else {
    reveals.forEach(el => el.classList.add("in-view"));
  }

  // 5. MOTOR DE INCLINACIÓN 3D CONTINUA (SCROLL 3D PHYSICS ENGINE)
  // Selecciona todas las tarjetas principales de la página y les aplica comportamiento 3D
  const tiltCards = document.querySelectorAll(
    ".skill-card, #sobre-mi .rounded-2xl, #proyectos .overflow-hidden, .glass"
  );

  tiltCards.forEach(card => {
    card.classList.add("scroll-3d-tilt");
  });

  // Loop de física tridimensional optimizado con requestAnimationFrame
  let ticking = false;

  const update3DScroll = () => {
    const scrollY = window.scrollY;

    // Parallax 3D en la cuadrícula del fondo y ambiente
    if (gridOverlay) {
      const gridPitch = 8 + (scrollY * 0.003);
      const gridY = (scrollY * 0.12) % 56;
      gridOverlay.style.transform = `perspective(800px) rotateX(${gridPitch}deg) translateY(${gridY}px)`;
    }
    if (ambientOverlay) {
      ambientOverlay.style.transform = `translateY(${-scrollY * 0.04}px)`;
    }

    // Inclinación espacial dinámica en tarjetas según su altura en pantalla
    const vh = window.innerHeight;
    const vCenter = vh / 2;

    tiltCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      // Solo calcular para tarjetas cercanas o visibles para máximo rendimiento
      if (rect.bottom >= -100 && rect.top <= vh + 100) {
        const cardCenter = rect.top + (rect.height / 2);
        const distFromCenter = (cardCenter - vCenter) / (vh * 0.6);
        const clampedDist = Math.max(-1, Math.min(1, distFromCenter));

        // Inclinación sutil y elegante de -4deg a +4deg
        const tiltX = clampedDist * 4.2;
        // Elevación Z hacia el usuario cuando está centrada en la vista
        const depthZ = Math.max(0, (1 - Math.abs(clampedDist)) * 14);

        card.style.setProperty("--scroll-tilt-x", `${tiltX.toFixed(2)}deg`);
        card.style.setProperty("--scroll-depth-z", `${depthZ.toFixed(1)}px`);
      }
    });

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(update3DScroll);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  update3DScroll();

  // 6. GIROSCOPIO 3D INTERACTIVO CON EL MOUSE (ESCRITORIO)
  // Al mover el ratón sobre cualquier tarjeta, gira sutilmente en 3D con reflejo especular
  tiltCards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Rotación en X y Y proporcional al cursor
      const rotY = ((x - centerX) / centerX) * 5;
      card.style.setProperty("--mouse-tilt-y", `${rotY.toFixed(2)}deg`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--mouse-tilt-y", "0deg");
    });
  });

  // 7. FEEDBACK TÁCTIL Y GLOW EN MÓVILES (BADGES, PILLS, CARDS Y BOTONES)
  let activeTouchTimeout;
  const touchInteractiveElements = document.querySelectorAll(
    ".tech-badge-3d, .skill-pill, .skill-card, .btn-sheen"
  );

  touchInteractiveElements.forEach(el => {
    el.addEventListener("touchstart", function () {
      touchInteractiveElements.forEach(item => {
        if (item !== el) item.classList.remove("touch-active");
      });

      el.classList.add("touch-active");

      clearTimeout(activeTouchTimeout);
      activeTouchTimeout = setTimeout(() => {
        el.classList.remove("touch-active");
      }, 1600);
    }, { passive: true });
  });

  // 8. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
  const faqButtons = document.querySelectorAll("#faq button[aria-expanded]");
  faqButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      const body = btn.nextElementSibling;
      const icon = btn.querySelector("svg");

      faqButtons.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute("aria-expanded", "false");
          const otherBody = otherBtn.nextElementSibling;
          if (otherBody) otherBody.classList.remove("open");
          const otherIcon = otherBtn.querySelector("svg");
          if (otherIcon) otherIcon.classList.remove("rotate-180");
        }
      });

      btn.setAttribute("aria-expanded", !isOpen);
      if (body) {
        body.classList.toggle("open", !isOpen);
      }
      if (icon) {
        icon.classList.toggle("rotate-180", !isOpen);
      }
    });
  });

  // 8.5 PESTAÑAS INTERACTIVAS DE PROYECTOS (TABS)
  const projectTabs = document.querySelectorAll(".project-tab-btn");
  const projectPanels = document.querySelectorAll(".project-tab-panel");

  projectTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");
      if (!targetId) return;

      // Actualizar estado de los botones de pestañas
      projectTabs.forEach(btn => {
        const isCurrent = btn === tab;
        btn.setAttribute("aria-selected", isCurrent ? "true" : "false");
        if (isCurrent) {
          btn.classList.add("bg-neon", "text-white", "shadow-neon");
          btn.classList.remove("text-muted", "hover:text-ink");
        } else {
          btn.classList.remove("bg-neon", "text-white", "shadow-neon");
          btn.classList.add("text-muted", "hover:text-ink");
        }
      });

      // Mostrar u ocultar paneles correspondientes
      projectPanels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.remove("hidden");
          panel.classList.add("block");
          panel.classList.add("in-view");
        } else {
          panel.classList.add("hidden");
          panel.classList.remove("block");
        }
      });
    });
  });

  // 9. NAVEGACIÓN SUAVE PARA ENLACES CON #
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId && targetId !== "#") {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: "smooth"
          });
        }
      }
    });
  });

  // 10. GESTIÓN INTELIGENTE DEL BOTÓN CORREO
  const correoBtn = document.querySelector(".contact-btn-correo");
  if (correoBtn) {
    correoBtn.addEventListener("click", (e) => {
      const email = "lumar312456@gmail.com";
      const subject = encodeURIComponent("Contacto desde Portafolio - Leonardo Márquez");
      const body = encodeURIComponent("Hola Leonardo,\n\nVi tu portafolio como desarrollador de software y me gustaría ponerme en contacto contigo para conversar sobre una oportunidad o proyecto.\n\nSaludos cordiales.");
      const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).catch(() => {});
      }

      const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        e.preventDefault();
        window.location.href = mailtoUrl;
      }
    });
  }

  // ==========================================
  // 11. SCROLL 3D PROFUNDO v2 · "se aplana al llegar"
  // Rota SOLO mientras la sección entra o sale de pantalla.
  // Dentro de la sección (o al llegar desde el menú) queda plana.
  // ==========================================
  const reducedMotion3D = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sections3D = Array.from(document.querySelectorAll("section[id]"));

  if (sections3D.length && !reducedMotion3D) {
    sections3D.forEach((sec, i) => {
      sec.classList.add("section-3d");
      sec.dataset.dir = i % 2 ? "-1" : "1"; // giro alternado izq/der
      const shade = document.createElement("div");
      shade.className = "sec-shade";
      shade.setAttribute("aria-hidden", "true");
      sec.appendChild(shade);
    });

    // Capas de parallax (h2 automático + cualquier elemento con data-depth)
    const layers = [];
    sections3D.forEach(sec => {
      const manual = Array.from(sec.querySelectorAll("[data-depth]"));
      manual.forEach(el =>
        layers.push({ sec, el, depth: parseFloat(el.dataset.depth) || 0.3 })
      );
      const h2 = sec.querySelector("h2");
      if (h2 && !manual.includes(h2)) {
        // el atributo activa la regla CSS [data-depth] { translate: ... }
        h2.setAttribute("data-depth", "0.35");
        layers.push({ sec, el: h2, depth: 0.35 });
      }
    });

    const clamp01 = v => Math.max(0, Math.min(1, v));
    let ticking3D = false;

    const update3DSections = () => {
      const vh = window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - vh;
      // Aplana la última sección al llegar al fondo de la página
      const settle = maxScroll > 0
        ? clamp01((maxScroll - window.scrollY) / (vh * 0.35))
        : 1;

      for (const sec of sections3D) {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -vh * 0.25 || r.top > vh * 1.25) { sec._parK = null; continue; }

        // ENTRADA: 0 = asoma por abajo · 1 = su top llegó a la línea de anclaje
        // (anclaje = 28% superior de la pantalla → ahí queda PLANA)
        const entry = clamp01((vh - r.top) / (vh * 0.72));
        const inTilt = 1 - entry;

        // SALIDA: crece solo cuando el bottom sube del 85% de la pantalla
        const exit = clamp01((vh * 0.85 - r.bottom) / (vh * 0.45));
        const outAmt = exit * exit; // easeInQuad

        const dir = Number(sec.dataset.dir || 1);
        let rx = 0, ry = 0, tz = 0, ty = 0, sc = 1, op = 1, sh = 0;

        if (inTilt * settle > 0.001) {
          // ENTRANDO: rota, gira de lado, se hunde en Z y aparece
          const a = Math.pow(1 - entry, 3) * settle; // 1 lejos → 0 al anclar
          rx = a * 24;       ry = a * 5 * dir;
          tz = -a * 300;     ty = a * 46;
          sc = 1 - a * 0.08; op = 1 - a * 0.75;
          sh = a * 0.55;
          sec._parK = -a;                  // título flota mientras entra
        } else if (outAmt > 0.001) {
          // SALIENDO por arriba: se inclina hacia atrás como carta que se va
          rx = -outAmt * 12;  ry = -outAmt * 2.5 * dir;
          tz = -outAmt * 160; ty = -outAmt * 24;
          sc = 1 - outAmt * 0.05; op = 1 - outAmt * 0.4;
          sec._parK = outAmt * 0.5;
        } else {
          // ✅ DENTRO DE LA SECCIÓN → completamente plana y visible
          sec._parK = 0;
        }

        sec.style.setProperty("--sec-rx", rx.toFixed(2) + "deg");
        sec.style.setProperty("--sec-ry", ry.toFixed(2) + "deg");
        sec.style.setProperty("--sec-tz", tz.toFixed(1) + "px");
        sec.style.setProperty("--sec-ty", ty.toFixed(1) + "px");
        sec.style.setProperty("--sec-sc", sc.toFixed(3));
        sec.style.setProperty("--sec-op", op.toFixed(3));
        sec.style.setProperty("--sec-shade", sh.toFixed(3));
      }

      // Parallax de capas: también llega a 0 al anclar (nada flotando mientras lees)
      for (const { sec, el, depth } of layers) {
        if (sec._parK === null || sec._parK === undefined) continue;
        el.style.setProperty("--par-y", (sec._parK * depth * 90).toFixed(1) + "px");
      }
      ticking3D = false;
    };

    const onScroll3D = () => {
      if (!ticking3D) { ticking3D = true; requestAnimationFrame(update3DSections); }
    };
    window.addEventListener("scroll", onScroll3D, { passive: true });
    window.addEventListener("resize", onScroll3D, { passive: true });
    update3DSections();
  }
});
