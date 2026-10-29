// LibreIncu v2 — todo responde al scroll: el huevo se raja, nace el pico y se vuelve el cursor de la página
(() => {
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const suave = (t) => t * t * (3 - 2 * t);
  const mix = (a, b, t) => a + (b - a) * t;

  // ---------- Huevo vectorial ----------
  const EGG = "M100 4 C152 4 194 90 194 150 C194 206 152 236 100 236 C48 236 6 206 6 150 C6 90 48 4 100 4 Z";
  const HUECO = "M122 36 L131 42 L128 50 L140 55 L137 64 L151 66 L156 58 L150 47 L153 40 L143 33 L134 31 Z";
  // Grietas: [trazo, empieza, termina] dentro del avance 0–1 de la rotura
  const GRIETAS = [
    ["M122 36 L131 42 L128 50 L140 55 L137 64 L151 66 L156 58 L150 47 L153 40 L143 33 L134 31 L122 36", 0, 0.45],
    ["M128 50 L118 58 L121 66 L108 74 L111 84 L100 93", 0.3, 0.75],
    ["M137 64 L134 76 L141 86 L137 99", 0.45, 0.85],
    ["M131 42 L124 30 L128 20 L120 11", 0.55, 0.95],
    ["M150 47 L160 45 L167 52", 0.65, 1],
  ];
  let uid = 0;
  function crearHuevo({ texto = true } = {}) {
    const id = "hv" + uid++;
    const el = document.createElement("div");
    el.className = "huevo-svg";
    const rajas = GRIETAS.map(([d, a, b]) =>
      `<path class="raja luz" data-a="${a}" data-b="${b}" pathLength="1" d="${d}" transform="translate(.9 .9)"/>` +
      `<path class="raja" data-a="${a}" data-b="${b}" pathLength="1" d="${d}"/>`).join("");
    el.innerHTML = `
    <svg viewBox="0 0 200 240" overflow="visible" aria-hidden="true">
      <defs>
        <radialGradient id="${id}c" gradientUnits="userSpaceOnUse" cx="72" cy="67" r="185"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".55" stop-color="#F8F2E7"/><stop offset="1" stop-color="#D9C9AF"/></radialGradient>
        <radialGradient id="${id}y" cx="40%" cy="35%" r="72%"><stop offset="0" stop-color="#FFDB6E"/><stop offset=".65" stop-color="#F6BB26"/><stop offset="1" stop-color="#DF9810"/></radialGradient>
        <radialGradient id="${id}h" cx="45%" cy="60%" r="65%"><stop offset="0" stop-color="#3E2918"/><stop offset="1" stop-color="#120A05"/></radialGradient>
        <linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC857"/><stop offset="1" stop-color="#E2761B"/></linearGradient>
        <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
        <clipPath id="${id}k"><path d="${EGG}"/></clipPath>
        <clipPath id="${id}f"><path clip-rule="evenodd" d="M-60 -60 H260 V300 H-60 Z ${EGG} ${HUECO}"/></clipPath>
      </defs>
      <path d="${EGG}" fill="url(#${id}c)"/>
      <g clip-path="url(#${id}k)">
        <path d="${EGG}" fill="none" stroke="#7A5A33" stroke-opacity=".12" stroke-width="22" transform="translate(9 7)"/>
        <ellipse cx="64" cy="66" rx="13" ry="32" transform="rotate(-28 64 66)" fill="#fff" opacity=".85" filter="url(#${id}b)"/>
      </g>
      <circle cx="100" cy="146" r="60" fill="url(#${id}y)"/>
      <ellipse cx="80" cy="122" rx="20" ry="11" transform="rotate(-20 80 122)" fill="#fff" opacity=".35" filter="url(#${id}b)"/>
      ${texto ? `<text class="nombre" x="100" y="148" text-anchor="middle" dominant-baseline="middle">LibreIncu</text>` : ""}
      <path class="hueco" d="${HUECO}" fill="url(#${id}h)" stroke="#EFE4D0" stroke-width="2.4" stroke-linejoin="round"/>
      <g clip-path="url(#${id}f)"><g class="pico">
        <g class="mandibula"><path d="M-8 1 C8 0 22 0 31 2 C22 8 6 11 -8 10 Z" fill="#D9701A" stroke="#6B3A10" stroke-width="1.3" stroke-linejoin="round"/></g>
        <path d="M-8 -10 C6 -16 25 -11 38 0 C26 1 9 1 -8 2 Z" fill="url(#${id}p)" stroke="#6B3A10" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M2 -9 C12 -12 22 -9 30 -3" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="27" cy="-4" r="1.7" fill="#FFF8E8"/>
      </g></g>
      <path class="trozo" d="${HUECO}" fill="url(#${id}c)" stroke="#2B2118" stroke-width="1.6" stroke-linejoin="round" stroke-opacity="0"/>
      <g class="astillas" fill="#F4ECDD" stroke="#2B2118" stroke-width="1">
        <path d="M0 -4 L5 2 L-3 3 Z"/><path d="M0 -3 L4 3 L-4 1 Z"/><path d="M-2 -3 L3 -1 L0 4 Z"/>
      </g>
      <g class="rajas" fill="none" stroke-linecap="round" stroke-linejoin="round">${rajas}</g>
      <path d="${EGG}" fill="none" stroke="#2B2118" stroke-width="2.6"/>
    </svg>`;
    const q = (s) => el.querySelector(s);
    const rs = [...el.querySelectorAll(".raja")];
    const trozo = q(".trozo"), hueco = q(".hueco"), pico = q(".pico"), mand = q(".mandibula");
    const astillas = [...el.querySelectorAll(".astillas path")];
    const vuelo = [[-30, -40, 220], [18, -52, -160], [36, -18, 300]];
    // crack: se raja · open: salta el trozo · beak: asoma el pico · boca: pía
    el.estado = (crack, open, beak, boca = 0) => {
      for (const r of rs) r.style.strokeDashoffset = 1 - clamp((crack - r.dataset.a) / (r.dataset.b - r.dataset.a));
      hueco.style.opacity = open > 0.01 ? 1 : 0;
      const o = suave(open);
      trozo.style.transform = `translate(${o * 30}px, ${-o * 46 + o * o * 30}px) rotate(${o * 70}deg)`;
      trozo.style.opacity = 1 - clamp((open - 0.55) / 0.45);
      trozo.setAttribute("stroke-opacity", open > 0.01 ? 1 : 0);
      astillas.forEach((a, i) => {
        const [dx, dy, g] = vuelo[i];
        a.setAttribute("transform", `translate(${140 + dx * o} ${52 + dy * o + 60 * o * o}) rotate(${g * o})`);
        a.style.opacity = open > 0.02 ? 1 - clamp((open - 0.5) / 0.5) : 0;
      });
      pico.setAttribute("transform", `translate(140 52) rotate(-38) translate(${(suave(beak) - 1) * 40} 0)`);
      mand.setAttribute("transform", `rotate(${boca * 18} -8 2)`);
    };
    el.estado(0, 0, 0);
    return el;
  }

  // ---------- Motor de movimiento continuo ----------
  // --v: avance del elemento por la pantalla (0 entra abajo · 1 sale arriba)
  // --c: cercanía al centro (1 en el centro) · --q: avance de lectura para palabras
  document.querySelectorAll('[data-m~="palabras"]').forEach((el) => {
    const palabras = el.textContent.trim().split(/\s+/);
    el.style.setProperty("--n", palabras.length);
    el.innerHTML = palabras.map((p, i) => `<span class="w" style="--i:${i}">${p}</span>`).join(" ");
  });
  const moviles = [...document.querySelectorAll("[data-m]")];
  const conProgreso = [...document.querySelectorAll("[data-progreso]")];
  const hero = document.querySelector(".hero");
  const motor = () => {
    const H = innerHeight;
    for (const el of moviles) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -H * 0.5 || r.top > H * 1.5) continue;
      el.style.setProperty("--v", clamp((H - r.top) / (H + r.height)).toFixed(4));
      el.style.setProperty("--c", (1 - clamp(Math.abs(r.top + r.height / 2 - H / 2) / (H * 0.6))).toFixed(4));
      el.style.setProperty("--q", clamp((H * 0.9 - r.top) / (H * 0.55)).toFixed(4));
    }
    for (const el of conProgreso) {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--p", clamp(-r.top / Math.max(1, r.height - H)).toFixed(4));
    }
    if (hero) hero.style.setProperty("--hp", clamp(scrollY / H).toFixed(4));
    document.body.classList.toggle("solid", !hero || scrollY > H * 0.55);
  };

  // ---------- Pista de scroll con capítulos ----------
  const capitulos = [...document.querySelectorAll("[data-capitulo]")];
  const pista = document.createElement("nav");
  pista.className = "pista";
  pista.setAttribute("aria-label", "Recorrido de la página");
  pista.innerHTML = `<span class="relleno"></span>` + capitulos.map((c, i) =>
    `<button class="marca-cap" data-i="${i}"><span>${c.dataset.capitulo}</span></button>`).join("");
  document.body.append(pista);
  const marcas = [...pista.querySelectorAll(".marca-cap")];
  const etiqueta = document.createElement("div");
  etiqueta.className = "cursor-etiqueta";
  document.body.append(etiqueta);
  const recorrido = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const ubicarMarcas = () => marcas.forEach((m, i) => {
    const top = capitulos[i].getBoundingClientRect().top + scrollY;
    m.style.top = clamp((top - innerHeight * 0.3) / recorrido()) * 100 + "%";
  });
  pista.addEventListener("click", (e) => {
    const m = e.target.closest(".marca-cap");
    const destino = m ? capitulos[m.dataset.i].getBoundingClientRect().top + scrollY - 80
      : ((e.clientY - pista.getBoundingClientRect().top) / pista.offsetHeight) * recorrido();
    scrollTo({ top: destino, behavior: reducido ? "auto" : "smooth" });
  });

  // ---------- El huevo: de la apertura al cursor ----------
  const cursor = document.createElement("div");
  cursor.className = "cursor-huevo";
  const huevo = crearHuevo();
  cursor.append(huevo);
  document.body.append(cursor);
  const salida = document.querySelector(".hero .huevo-logo");
  const lugar = document.querySelector(".nido .lugar");
  const sombra = document.querySelector(".nido .sombra");
  let ultimo = scrollY, giro = 0, quieto = 0, boca = 0, nacer = 0, arrastrando = false;
  // A: lugar en la apertura (pantalla, con scroll 0) · B: nido (documento)
  // S1: scroll en que aterriza · S2: scroll en que deja el nido
  let A, B, S1, S2;
  const medirViaje = () => {
    if (!salida || !lugar) return;
    const hp = clamp(scrollY / innerHeight);
    const s = salida.getBoundingClientRect(), l = lugar.getBoundingClientRect();
    A = { x: s.left, y: s.top + scrollY + hp * 90, w: s.width };   // descuenta el corrimiento del título
    B = { x: l.left, y: l.top + scrollY, w: l.width };
    S1 = Math.max(1, B.y + l.height - innerHeight * 0.8);
    S2 = Math.max(S1 + 1, B.y - innerHeight * 0.22);
  };

  cursor.addEventListener("pointerdown", (e) => {
    if (!cursor.classList.contains("anclado")) return;
    arrastrando = true; cursor.setPointerCapture(e.pointerId); cursor.classList.add("agarrado");
  });
  cursor.addEventListener("pointermove", (e) => {
    if (!arrastrando) return;
    const r = pista.getBoundingClientRect();
    scrollTo({ top: clamp((e.clientY - r.top) / r.height) * recorrido(), behavior: "auto" });
  });
  const soltar = () => { arrastrando = false; cursor.classList.remove("agarrado"); };
  cursor.addEventListener("pointerup", soltar);
  cursor.addEventListener("pointercancel", soltar);

  const cuadro = (ahora) => {
    motor();
    const H = innerHeight;
    const prog = clamp(scrollY / recorrido());
    const vel = scrollY - ultimo; ultimo = scrollY;
    quieto = Math.abs(vel) < 0.5 ? quieto + 1 : 0;

    const chico = innerWidth < 700 ? 30 : 40;
    const pr = pista.getBoundingClientRect();
    const cx = pr.left + pr.width / 2 - chico / 2;
    const cy = pr.top + prog * (pr.height - chico * 1.2);
    let x = cx, y = cy, w = chico, crack, dock = 1, enNido = false, balanceo = 0;

    if (salida && A) {
      // 1) Cae desde la apertura hasta el nido, meciéndose y rajándose
      // 2) Aterriza, rebota y nace el pico
      // 3) Al seguir bajando salta del nido, se achica y se vuelve el cursor
      const t = clamp(scrollY / S1);
      dock = suave(clamp((scrollY - S2) / (H * 0.4)));
      enNido = t >= 1 && dock === 0;
      crack = clamp((t - 0.15) / 0.75);
      nacer = clamp(nacer + (t >= 1 ? 0.016 : -0.06));
      const yA = A.y, yB = B.y - S1;
      if (t < 1) {
        x = A.x + (B.x - A.x) * suave(t) + Math.sin(t * Math.PI * 2) * Math.min(70, innerWidth * 0.09) * (1 - t);
        y = yA + (yB - yA) * t * t;
        w = mix(A.w, B.w, suave(t));
        balanceo = Math.sin(t * Math.PI * 3) * 16 * (1 - t);
      } else {
        const nx = B.x, ny = B.y - scrollY;
        x = mix(nx, cx, dock) - Math.sin(dock * Math.PI) * 70;   // salta en arco hacia la pista
        y = mix(ny, cy, dock) - Math.sin(dock * Math.PI) * 50;
        w = mix(B.w, chico, dock);
      }
      sombra?.style.setProperty("--s", (t ** 4 * (1 - dock)).toFixed(3));
    } else {
      crack = clamp(prog / 0.75);
      nacer = clamp((prog - 0.78) / 0.2);
    }
    const open = clamp(nacer * 1.7), beak = clamp((nacer - 0.4) / 0.6);
    // Cuando el pico está afuera y la página se queda quieta, pía
    const piar = beak > 0.95 && quieto > 40 && Math.sin(ahora / 70) > 0.2 && (ahora % 2600) < 700;
    boca += ((piar ? 1 : 0) - boca) * 0.35;
    huevo.estado(crack, open, beak, boca);

    // Se inclina con la velocidad y tiembla mientras se raja
    giro += (clamp(vel * 1.4, -32, 32) - giro) * 0.12;
    const temblor = crack > 0 && crack < 1 ? Math.sin(ahora / 28) * 2.5 : 0;
    cursor.style.width = w + "px";
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${(enNido ? 0 : giro) + temblor + balanceo}deg)`;
    cursor.classList.toggle("en-nido", enNido);
    cursor.classList.toggle("anclado", dock > 0.98);
    pista.classList.toggle("visible", dock > 0.6);
    pista.style.setProperty("--prog", prog);

    // Capítulo actual: marcas recorridas y etiqueta junto al cursor
    let actual = -1;
    capitulos.forEach((c, i) => { if (c.getBoundingClientRect().top < H * 0.5) actual = i; });
    marcas.forEach((m, i) => { m.classList.toggle("pasado", i <= actual); m.classList.toggle("actual", i === actual); });
    const texto = actual >= 0 ? capitulos[actual].dataset.capitulo : "";
    if (etiqueta.textContent !== texto) etiqueta.textContent = texto;
    etiqueta.style.transform = `translate3d(0, ${y + w * 0.6}px, 0) translateY(-50%)`;
    etiqueta.classList.toggle("visible", dock > 0.98 && !!texto && (quieto < 50 || arrastrando));

    requestAnimationFrame(cuadro);
  };

  const recalcular = () => { ubicarMarcas(); motor(); medirViaje(); };
  addEventListener("resize", recalcular);
  addEventListener("load", recalcular);
  document.fonts?.ready.then(recalcular);
  recalcular();
  requestAnimationFrame(cuadro);

  // ---------- Dependencias: el paso en foco elige la foto ----------
  document.querySelectorAll(".scrolly").forEach((s) => {
    const fotos = s.querySelectorAll(".medios .foto");
    const num = s.querySelector(".medios .num");
    const pasos = s.querySelectorAll(".paso");
    const ver = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = [...pasos].indexOf(e.target);
      fotos.forEach((f, j) => f.classList.toggle("activa", i === j));
      if (num) num.textContent = String(i + 1).padStart(2, "0");
    }), { rootMargin: "-45% 0px -45% 0px" });
    pasos.forEach((p) => ver.observe(p));
  });

  // ---------- Manual: el bloque que se lee se ilumina ----------
  const prosa = document.querySelector(".prosa");
  if (prosa) {
    const bloques = [...prosa.querySelectorAll(":scope > h2, :scope > h3, :scope > p, :scope > ul > li, :scope > ol > li, .sistema, details, .aviso")];
    bloques.forEach((b) => b.classList.add("enfocable"));
    let previo = null;
    const enfocar = () => {
      const linea = innerHeight * 0.42;
      let foco = null, menor = Infinity;
      for (const b of bloques) {
        const r = b.getBoundingClientRect();
        const d = r.top > linea ? r.top - linea : r.bottom < linea ? linea - r.bottom : 0;
        if (d < menor) { menor = d; foco = b; }
      }
      if (menor > innerHeight * 0.3) foco = null;
      if (foco === previo) return;
      previo?.classList.remove("foco");
      foco?.classList.add("foco");
      if (foco?.tagName === "DETAILS") foco.open = true;
      previo = foco;
    };
    addEventListener("scroll", enfocar, { passive: true });
    enfocar();
    const enlaces = [...document.querySelectorAll(".toc a")];
    const marcar = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) enlaces.forEach((a) => a.classList.toggle("activa", a.hash === "#" + e.target.id));
    }), { rootMargin: "-20% 0px -70% 0px" });
    prosa.querySelectorAll("h2[id]").forEach((h) => marcar.observe(h));
  }

  // ---------- Hoy: el video avanza y se enciende el hito que corresponde ----------
  const video = document.getElementById("video-hoy");
  if (video) {
    const hitos = [...document.querySelectorAll(".hitos li")];
    const barra = document.querySelector(".hoy-barra span");
    const play = document.querySelector(".hoy-play");
    const sonido = document.querySelector(".hoy-sonido");
    let elegido = false;   // si la persona lo pausó, no lo volvemos a arrancar solos
    const pintar = () => {
      const t = video.currentTime;
      let actual = -1;
      hitos.forEach((h, i) => { if (+h.dataset.t <= t) actual = i; });
      hitos.forEach((h, i) => { h.classList.toggle("pasado", i < actual); h.classList.toggle("actual", i === actual); });
      barra.style.width = (video.duration ? (t / video.duration) * 100 : 0) + "%";
      play.textContent = video.paused ? "▶" : "❚❚";
      play.setAttribute("aria-label", video.paused ? "Reproducir" : "Pausar");
    };
    ["timeupdate", "play", "pause", "seeked"].forEach((ev) => video.addEventListener(ev, pintar));
    video.addEventListener("ended", () => { video.currentTime = 0; video.play(); });
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !elegido && !reducido) video.play().catch(() => {});
      if (!e.isIntersecting) video.pause();
    }, { threshold: 0.5 }).observe(video);
    play.addEventListener("click", () => { elegido = !video.paused; video.paused ? video.play() : video.pause(); });
    sonido.addEventListener("click", () => {
      video.muted = !video.muted;
      sonido.textContent = video.muted ? "Activar sonido" : "Silenciar";
      sonido.setAttribute("aria-pressed", !video.muted);
      if (video.paused) video.play();
    });
    hitos.forEach((h) => h.addEventListener("click", () => { video.currentTime = +h.dataset.t; video.play(); }));
    pintar();
  }

  // ---------- Menú en celular y videos livianos ----------
  const top = document.querySelector(".top");
  document.querySelector(".menu-btn")?.addEventListener("click", () => top.classList.toggle("abierto"));
  document.querySelectorAll(".yt[data-id]").forEach((b) => b.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.id}?autoplay=1&rel=0`;
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.title = b.getAttribute("aria-label") || "Video";
    b.replaceChildren(f);
  }, { once: true }));
})();
