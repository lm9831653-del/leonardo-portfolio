/* ============================================================
   BYTEFORGE · NEBULA-3D ENGINE  (nebula3d.js)
   ------------------------------------------------------------
   Campo de partículas 3D sobre <canvas>:
   • Proyección en perspectiva manual (sin librerías)
   • Enlaces O(n) con rejilla espacial (spatial hash)
   • Sprites de brillo pre-renderizados (evita shadowBlur)
   • Calidad adaptativa según FPS real (4 niveles)
   • Pausa con pestaña oculta · respeta prefers-reduced-motion
   • Warp con scroll · repulsión de cursor · ondas al hacer clic
   ============================================================ */
(() => {
  "use strict";

  const canvas = document.getElementById("nebula-canvas");
  if (!canvas) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = matchMedia("(pointer: coarse)").matches;
  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) return;

  /* ---------------- Configuración (paleta ByteForge) --------- */
  const CFG = {
    fov: 340,               // distancia focal de la cámara 3D
    depth: 720,             // profundidad del campo (z: 0 → depth)
    linkDist: 118,          // distancia máx. de enlace (px de pantalla)
    mouseRadius: 190,       // radio de interacción del cursor
    colors: [               // neon · cyan · violet
      [255, 46, 136],
      [62, 224, 255],
      [139, 92, 246],
    ],
    dprCap: coarsePointer ? 1.75 : 2,
    fpsFloor: 34,           // por debajo → baja un nivel
    fpsCeil: 55,            // por encima → sube un nivel
  };

  /* Niveles de calidad: densidad de partículas + enlaces */
  const QUALITY = [
    { density: 0.000055, links: false },  // 0 · supervivencia
    { density: 0.000085, links: true  },  // 1 · móvil
    { density: 0.000120, links: true  },  // 2 · estándar
    { density: 0.000160, links: true  },  // 3 · escritorio potente
  ];
  let quality = coarsePointer ? 1 : 2;

  /* ---------------- Estado ----------------------------------- */
  let W = 0, H = 0, DPR = 1, CX = 0, CY = 0;
  let particles = [], targetCount = 0;
  let running = false, rafId = 0, lastT = 0;
  let fpsAcc = 0, fpsFrames = 0, cooldown = 0;
  let scrollBoost = 0, lastScrollY = window.scrollY;
  const rings = [];
  const pointer = { rawX: -9e3, rawY: -9e3, x: 0, y: 0, tx: 0, ty: 0, active: false };

  /* ------- Sprites de brillo pre-renderizados ----------------
     Mucho más barato que shadowBlur: se dibujan con drawImage() */
  const sprites = CFG.colors.map(([r, g, b]) => {
    const s = document.createElement("canvas");
    s.width = s.height = 64;
    const c = s.getContext("2d");
    const grad = c.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0.00, `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.28, `rgba(${r},${g},${b},.6)`);
    grad.addColorStop(0.65, `rgba(${r},${g},${b},.12)`);
    grad.addColorStop(1.00, `rgba(${r},${g},${b},0)`);
    c.fillStyle = grad;
    c.fillRect(0, 0, 64, 64);
    return s;
  });

  /* ---------------- Partículas -------------------------------- */
  const spawn = (anywhere = true) => ({
    x: (Math.random() - 0.5) * W * 1.6,
    y: (Math.random() - 0.5) * H * 1.6,
    z: anywhere ? Math.random() * CFG.depth : CFG.depth,
    vz: 0.14 + Math.random() * 0.30,
    r: 1.4 + Math.random() * 2.4,
    c: (Math.random() * sprites.length) | 0,
    tw: 0.6 + Math.random() * 1.6,          // velocidad de parpadeo
    ph: Math.random() * Math.PI * 2,        // fase de parpadeo
    px: 0, py: 0, ps: 0,                    // proyección cacheada
  });

  function rebuild() {
    targetCount = Math.min(
      Math.round(W * H * QUALITY[quality].density),
      coarsePointer ? 110 : 240
    );
    while (particles.length < targetCount) particles.push(spawn());
    if (particles.length > targetCount) particles.length = targetCount;
  }

  /* ---------------- Resize (con debounce) -------------------- */
  let resizeT;
  function resize() {
    DPR = Math.min(devicePixelRatio || 1, CFG.dprCap);
    W = innerWidth; H = innerHeight;
    CX = W / 2; CY = H / 2;
    canvas.width  = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width  = W + "px";
    canvas.style.height = H + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    rebuild();
  }
  addEventListener("resize", () => { clearTimeout(resizeT); resizeT = setTimeout(resize, 150); });

  /* ---------------- Proyección 3D ---------------------------- */
  function project(p) {
    const s = CFG.fov / (CFG.fov + p.z);   // perspectiva clásica
    p.ps = s;
    p.px = p.x * s + CX + pointer.x;       // pointer.x/y = parallax suave
    p.py = p.y * s + CY + pointer.y;
  }

  /* ---------------- Simulación -------------------------------- */
  function update(k, t) {
    // Parallax del cursor (lerp suave)
    pointer.x += (pointer.tx - pointer.x) * 0.05 * k;
    pointer.y += (pointer.ty - pointer.y) * 0.05 * k;

    scrollBoost *= 0.90;                    // inercia del scroll decae
    const warp = 1 + scrollBoost;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.z -= p.vz * warp * k;
      if (p.z < -CFG.fov + 60) {            // salió por la cámara → renace lejos
        const q = spawn(false);
        p.x = q.x; p.y = q.y; p.z = q.z; p.vz = q.vz;
      }
      project(p);

      // Repulsión del cursor (espacio de pantalla → espacio mundo)
      if (pointer.active) {
        const dx = p.px - pointer.rawX, dy = p.py - pointer.rawY;
        const d2 = dx * dx + dy * dy;
        if (d2 < CFG.mouseRadius * CFG.mouseRadius && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const f = ((CFG.mouseRadius - d) / CFG.mouseRadius) * 2.1 * k / Math.max(p.ps, 0.35);
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
      }
    }

    // Ondas expansivas al hacer clic: empujan + se desvanecen
    for (let i = rings.length - 1; i >= 0; i--) {
      const rg = rings[i];
      rg.r += 7 * k;
      rg.life -= 0.022 * k;
      if (rg.life <= 0) { rings.splice(i, 1); continue; }
      for (let j = 0; j < particles.length; j++) {
        const p = particles[j];
        const dx = p.px - rg.x, dy = p.py - rg.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 1 && Math.abs(Math.sqrt(d2) - rg.r) < 30) {
          const d = Math.sqrt(d2);
          const f = 1.4 * k / Math.max(p.ps, 0.25);
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }
      }
    }
  }

  /* --------- Enlaces con rejilla espacial (O(n)) ------------- */
  const ALPHA_BUCKETS = 6;                  // agrupa líneas por alpha → 1 stroke por grupo
  const NDX = [1, -1, 0, 1], NDY = [0, 1, 1, 1]; // vecinas "hacia adelante" (sin duplicados)
  const segs = Array.from({ length: ALPHA_BUCKETS }, () => []);

  function buildLinks() {
    const cell = CFG.linkDist;
    const cols = Math.max(1, Math.ceil(W / cell));
    const rows = Math.max(1, Math.ceil(H / cell));
    const grid = new Array(cols * rows);
    const maxD2 = cell * cell;

    for (let b = 0; b < ALPHA_BUCKETS; b++) segs[b].length = 0;

    // Clasificar partículas visibles en celdas
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.px < 0 || p.px > W || p.py < 0 || p.py > H) continue;
      const cx = Math.min(cols - 1, (p.px / cell) | 0);
      const cy = Math.min(rows - 1, (p.py / cell) | 0);
      const idx = cy * cols + cx;
      (grid[idx] || (grid[idx] = [])).push(i);
    }

    const test = (a, b) => {
      const dx = a.px - b.px, dy = a.py - b.py;
      const d2 = dx * dx + dy * dy;
      if (d2 >= maxD2) return;
      const alpha = (1 - Math.sqrt(d2) / cell) * Math.min(a.ps, b.ps);
      const bk = Math.min(ALPHA_BUCKETS - 1, (alpha * ALPHA_BUCKETS * 1.6) | 0);
      segs[bk].push(a.px, a.py, b.px, b.py);
    };

    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        const list = grid[cy * cols + cx];
        if (!list) continue;
        for (let a = 0; a < list.length; a++) {
          const pa = particles[list[a]];
          for (let b = a + 1; b < list.length; b++) test(pa, particles[list[b]]);
          for (let n = 0; n < 4; n++) {       // solo 4 vecinas → cada par 1 vez
            const nx = cx + NDX[n], ny = cy + NDY[n];
            if (nx < 0 || nx >= cols || ny >= rows) continue;
            const other = grid[ny * cols + nx];
            if (!other) continue;
            for (let b = 0; b < other.length; b++) test(pa, particles[other[b]]);
          }
        }
      }
    }
  }

  /* ---------------- Render ----------------------------------- */
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";   // suma de luz = glow cyberpunk

    // 1 · Enlaces (1 solo stroke por bucket de alpha)
    if (QUALITY[quality].links) {
      buildLinks();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgb(100,214,255)";
      for (let b = 0; b < ALPHA_BUCKETS; b++) {
        const s = segs[b];
        if (!s.length) continue;
        ctx.globalAlpha = ((b + 1) / ALPHA_BUCKETS) * 0.30;
        ctx.beginPath();
        for (let i = 0; i < s.length; i += 4) {
          ctx.moveTo(s[i], s[i + 1]);
          ctx.lineTo(s[i + 2], s[i + 3]);
        }
        ctx.stroke();
      }
    }

    // 2 · Partículas (sprites + parpadeo)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const size = p.r * p.ps * 7;
      if (size < 0.7) continue;
      ctx.globalAlpha = Math.min(1, p.ps * 1.15) * (0.75 + 0.25 * Math.sin(t * 0.001 * p.tw + p.ph));
      ctx.drawImage(sprites[p.c], p.px - size / 2, p.py - size / 2, size, size);
    }

    // 3 · Ondas de clic
    for (const rg of rings) {
      ctx.globalAlpha = rg.life * 0.55;
      ctx.strokeStyle = "rgb(62,224,255)";
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, 6.283); ctx.stroke();
      ctx.globalAlpha = rg.life * 0.30;
      ctx.strokeStyle = "rgb(255,46,136)";
      ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r * 0.72, 0, 6.283); ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  /* ---------------- Bucle + FPS adaptativo ------------------- */
  function frame(t) {
    rafId = requestAnimationFrame(frame);
    const dt = Math.min(64, t - lastT || 16.7);
    lastT = t;

    fpsAcc += dt; fpsFrames++;
    if (fpsAcc >= 600) {                      // muestrea FPS cada 600 ms
      const fps = 1000 / (fpsAcc / fpsFrames);
      fpsAcc = 0; fpsFrames = 0;
      if (cooldown > 0) cooldown--;
      else if (fps < CFG.fpsFloor && quality > 0)  { quality--; rebuild(); cooldown = 4; }
      else if (fps > CFG.fpsCeil  && quality < 3)  { quality++; rebuild(); cooldown = 6; }
    }

    update(dt / 16.667, t);                   // k normalizado a 60 fps
    draw(t);
  }

  const start = () => { if (!running) { running = true; lastT = 0; rafId = requestAnimationFrame(frame); } };
  const stop  = () => { running = false; cancelAnimationFrame(rafId); };

  /* ---------------- Eventos ---------------------------------- */
  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());

  addEventListener("scroll", () => {           // warp con inercia al hacer scroll
    const dy = scrollY - lastScrollY;
    lastScrollY = scrollY;
    scrollBoost = Math.min(3.2, scrollBoost + Math.abs(dy) * 0.012);
  }, { passive: true });

  addEventListener("pointermove", (e) => {
    pointer.rawX = e.clientX; pointer.rawY = e.clientY;
    pointer.active = true;
    pointer.tx = (e.clientX - CX) * -0.045;
    pointer.ty = (e.clientY - CY) * -0.045;
  }, { passive: true });

  addEventListener("pointerdown", (e) => {
    if (rings.length > 3) rings.shift();
    rings.push({ x: e.clientX, y: e.clientY, r: 0, life: 1 });
  }, { passive: true });

  addEventListener("blur", () => {
    pointer.active = false; pointer.tx = pointer.ty = 0;
    pointer.rawX = pointer.rawY = -9e3;
  });

  /* ---------------- Inicio ----------------------------------- */
  resize();

  if (reduceMotion) {                          // accesibilidad: solo un frame estático
    update(0.016, 0);
    draw(0);
    return;
  }
  start();
})();
