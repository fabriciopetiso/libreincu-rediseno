// LibreIncu — prototipo: scroll y videos
(() => {
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Menú en celular
  const top = document.querySelector(".top");
  document.querySelector(".menu-btn")?.addEventListener("click", () => top.classList.toggle("abierto"));

  // Progreso de scroll (0–1) en secciones con data-progreso → variable CSS --p
  const conProgreso = [...document.querySelectorAll("[data-progreso]")];
  const hero = document.querySelector(".hero");
  const cuadro = () => {
    const h = innerHeight;
    for (const el of conProgreso) {
      const r = el.getBoundingClientRect();
      const recorrido = el.dataset.progreso === "salida" ? r.height : r.height - h;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, recorrido)));
      el.style.setProperty("--p", p.toFixed(4));
    }
    if (hero) document.body.classList.toggle("solid", scrollY > h * 0.55);
    volar();
  };

  // Logo del huevo con la grieta y el piquito listos para aparecer (se activan con la clase .rompe)
  const crearCuerpo = (alt = "") => {
    const c = document.createElement("div");
    c.className = "cuerpo";
    c.innerHTML = `<img src="assets/huevo-yema.png" alt="${alt}">
      <svg class="grieta" viewBox="0 0 518 632" aria-hidden="true">
        <text class="nombre" x="253" y="357" text-anchor="middle" dominant-baseline="middle">LibreIncu</text>
        <g class="rajas" fill="none" stroke="#111" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
          <path pathLength="1" d="M322 38 L342 56 L335 66 L358 80"/>
          <path pathLength="1" d="M300 92 L324 102 L318 114 L346 122 L354 142"/>
          <path pathLength="1" d="M287 127 L264 148 L272 158 L248 176"/>
        </g>
        <polygon class="hueco" points="306,58 328,46 352,58 362,82 344,100 318,96 302,78" fill="#1a1a1a"/>
        <g transform="translate(336 74) rotate(-30)"><g class="pico-in">
          <polygon points="-8,-26 62,0 -8,26" fill="#F29F2D" stroke="#111" stroke-width="6" stroke-linejoin="round"/>
          <line x1="-4" y1="0" x2="44" y2="0" stroke="#111" stroke-width="5" stroke-linecap="round"/>
        </g></g>
      </svg>`;
    return c;
  };

  // Huevo viajero: cae desde la apertura hasta el nido, meciéndose, y aterriza con un rebote
  const viajero = document.querySelector(".viajero");
  if (viajero) viajero.replaceChildren(crearCuerpo(viajero.querySelector("img").alt));
  const salida = document.querySelector(".hero .huevo-logo");
  const lugar = document.querySelector(".nido .lugar");
  const sombra = document.querySelector(".nido .sombra");
  let A, B, S;
  const caja = (el) => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width }; };
  const medir = () => {
    if (!viajero) return;
    A = caja(salida); B = caja(lugar);
    // Aterriza cuando el nido llega a la parte baja de la pantalla
    S = Math.max(1, B.y + lugar.offsetHeight - innerHeight * 0.8);
  };
  const suave = (t) => t * t * (3 - 2 * t);
  function volar() {
    if (!viajero || !A) return;
    const t = reducido ? 0 : Math.min(1, Math.max(0, scrollY / S));
    const yA = A.y, yB = B.y - S;                         // posición en pantalla al salir y al llegar
    const y = yA + (yB - yA) * t * t + t * S;             // t² = cae con aceleración
    const vaiven = Math.sin(t * Math.PI * 2) * Math.min(70, innerWidth * 0.09) * (1 - t);
    const x = A.x + (B.x - A.x) * suave(t) + vaiven;
    const giro = Math.sin(t * Math.PI * 3) * 16 * (1 - t);
    viajero.style.width = A.w + (B.w - A.w) * suave(t) + "px";
    viajero.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${giro}deg)`;
    viajero.classList.toggle("arriba", t < 0.02);
    viajero.classList.toggle("aterriza", t >= 1);
    viajero.classList.toggle("rompe", t >= 1);
    sombra?.style.setProperty("--s", (t ** 4).toFixed(3));
  }
  const recalcular = () => { medir(); cuadro(); };
  addEventListener("resize", recalcular);
  addEventListener("load", recalcular);
  document.fonts?.ready.then(recalcular);
  if (!reducido) addEventListener("scroll", () => requestAnimationFrame(cuadro), { passive: true });
  recalcular();

  // Huevito guía (páginas de documentación): sigue la lectura, ilumina el bloque en foco
  // y al llegar al final se rompe y asoma el pico
  const prosa = document.querySelector(".prosa");
  if (prosa) {
    const guia = document.createElement("div");
    guia.className = "guia";
    guia.setAttribute("aria-hidden", "true");
    guia.append(crearCuerpo());
    document.body.append(guia);
    const bloques = [...prosa.querySelectorAll(":scope > h2, :scope > h3, :scope > p, :scope > ul > li, :scope > ol > li, .sistema, details, .aviso")];
    bloques.forEach((b) => b.classList.add("enfocable"));
    const cierre = prosa.querySelector(".cierre");
    let y = innerHeight * 0.4, actual = null, andando = false;
    const seguir = () => {
      const linea = innerHeight * 0.42;
      // El bloque que cruza la línea de lectura; si ninguno, el más cercano
      let foco = null, menor = Infinity;
      for (const b of bloques) {
        const r = b.getBoundingClientRect();
        const d = r.top > linea ? r.top - linea : r.bottom < linea ? linea - r.bottom : 0;
        if (d < menor) { menor = d; foco = b; }
      }
      if (menor > innerHeight * 0.3) foco = null;
      if (foco !== actual) {
        actual?.classList.remove("foco");
        foco?.classList.add("foco");
        if (foco?.tagName === "DETAILS") foco.open = true;
        actual = foco;
      }
      const ancho = guia.offsetWidth, alto = ancho * 632 / 518;
      const art = prosa.getBoundingClientRect();
      const angosto = art.left < ancho + 40;
      let objetivo, x;
      if (angosto) {
        // En celular: en la esquina, sin tapar el texto
        x = innerWidth - ancho - 14;
        objetivo = innerHeight - alto - 18;
      } else {
        x = art.left - ancho - 18;
        const r = foco?.getBoundingClientRect();
        objetivo = r ? r.top + Math.min(r.height, 70) / 2 - alto / 2 : linea;
        objetivo = Math.min(Math.max(objetivo, 76), innerHeight - alto - 16);
      }
      const v = objetivo - y;
      y = reducido ? objetivo : y + v * 0.16;
      const giro = Math.max(-28, Math.min(28, v * 0.5));
      guia.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${giro}deg)`;
      guia.classList.toggle("rompe", !!cierre && cierre.getBoundingClientRect().top < innerHeight * 0.75);
      andando = Math.abs(v) > 0.5 && !reducido;
      if (andando) requestAnimationFrame(seguir);
    };
    const despertar = () => { if (!andando) { andando = true; requestAnimationFrame(seguir); } };
    addEventListener("scroll", despertar, { passive: true });
    addEventListener("resize", despertar);
    seguir();
  }

  // Apariciones
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -12% 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Scrollytelling: el paso visible decide qué foto se muestra
  document.querySelectorAll(".scrolly").forEach((s) => {
    const fotos = s.querySelectorAll(".medios .foto");
    const num = s.querySelector(".medios .num");
    const pasos = s.querySelectorAll(".paso");
    const ver = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const i = [...pasos].indexOf(e.target);
      pasos.forEach((p, j) => p.classList.toggle("activa", i === j));
      fotos.forEach((f, j) => f.classList.toggle("activa", i === j));
      if (num) num.textContent = String(i + 1).padStart(2, "0");
    }), { rootMargin: "-45% 0px -45% 0px" });
    pasos.forEach((p) => ver.observe(p));
  });

  // YouTube liviano: carga el reproductor recién al hacer clic
  document.querySelectorAll(".yt[data-id]").forEach((b) => b.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${b.dataset.id}?autoplay=1&rel=0`;
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.title = b.getAttribute("aria-label") || "Video";
    b.replaceChildren(f);
  }, { once: true }));

  // Índice "en esta página"
  const enlaces = [...document.querySelectorAll(".toc a")];
  if (enlaces.length) {
    const marcar = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) enlaces.forEach((a) => a.classList.toggle("activa", a.hash === "#" + e.target.id));
    }), { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll(".prosa h2[id]").forEach((h) => marcar.observe(h));
  }
})();
