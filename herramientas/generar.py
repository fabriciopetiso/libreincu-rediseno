"""Genera las páginas de documentación de la v2 a partir de contenido-original/*.md.

El texto no se modifica: solo se limpia la sintaxis propia de HackMD, se bajan las
imágenes a assets/docs/ y se arma cada página con el diseño del prototipo.

Uso:  python3 herramientas/generar.py
"""
import base64
import hashlib
import html
import re
import subprocess
from pathlib import Path

import markdown

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "contenido-original"
SALIDA = RAIZ / "prototipo" / "v2"
IMAGENES = RAIZ / "prototipo" / "assets" / "docs"

# (archivo de salida, título del menú, grupo, Markdown de origen o None si la página es a mano, foto de cabecera)
PAGINAS = [
    ("manual.html", "Manual básico de incubadoras", "Incubar", None, None),
    ("huevos.html", "Huevos Fértiles e Incubación", "Incubar", "Huevos Fértiles e Incubación.md", "huevos.jpg"),
    ("buenas-practicas.html", "Preguntas para Buenas Prácticas", "Incubar", "Preguntas para las Buenas Prácticas de Incubación.md", "pollitos-negros.jpg"),
    ("app.html", "LibrePollo - Aplicación", "App", "LibrePollo - Aplicación.md", "incu-celu.jpg"),
    ("problemas.html", "Solución de problemas", "App", "solucion de problemas.md", "incubadora-carga.jpg"),
    ("especificaciones.html", "Especificaciones técnicas", "Técnico", "Especificaciones_técnicas.md", "incubadoras.jpg"),
    ("ecosistema.html", "Ecosistema informático", "Técnico", "Ecosistema informático para la agricultura familiar.md", None),
    ("prensa.html", "Videos, prensa y difusión", "Comunidad", "Videos_prensa_y_difusión.md", "entrega.jpg"),
    ("contacto.html", "Contacto", "Comunidad", "Contacto.md", "gallinas.jpg"),
]

YOUTUBE = re.compile(r"(?:youtube\.com/watch\?v=|youtu\.be/)([\w-]{11})")


def bajar(url, prefijo):
    """Baja una imagen a assets/docs/ (una sola vez) y devuelve la ruta relativa desde v2/."""
    IMAGENES.mkdir(parents=True, exist_ok=True)
    nombre = f"{prefijo}-{hashlib.sha1(url.encode()).hexdigest()[:10]}"
    existentes = list(IMAGENES.glob(nombre + ".*"))
    if existentes:
        return f"../assets/docs/{existentes[0].name}"
    tmp = IMAGENES / (nombre + ".tmp")
    subprocess.run(["curl", "-sfL", "-o", str(tmp), url], check=True)
    tipo = subprocess.run(["file", "-b", "--mime-type", str(tmp)], capture_output=True, text=True).stdout.strip()
    ext = {"image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp"}.get(tipo, "img")
    final = IMAGENES / f"{nombre}.{ext}"
    tmp.rename(final)
    return f"../assets/docs/{final.name}"


def limpiar(texto, slug):
    """Quita la sintaxis de HackMD sin tocar el contenido."""
    texto = re.sub(r"\A---\n.*?\n---\n", "", texto, flags=re.S)            # cabecera YAML
    texto = re.sub(r":::success.*?:::", "", texto, flags=re.S)             # licencia (va en el pie)
    texto = texto.replace("[TOC]", "")
    # Imagen embebida en base64 (Especificaciones): se guarda como archivo
    def guardar_b64(m):
        ref, ext, datos = m.group(1), m.group(2), base64.b64decode(m.group(3))
        IMAGENES.mkdir(parents=True, exist_ok=True)
        nombre = f"{slug}-{hashlib.sha1(datos).hexdigest()[:10]}.{ext}"
        (IMAGENES / nombre).write_bytes(datos)
        return f"[{ref}]: ../assets/docs/{nombre}"
    texto = re.sub(r"\[(image\d+)\]: <data:image/(\w+);base64,([^>]+)>", guardar_b64, texto)
    texto = re.sub(r"(!\[[^\]]*\]\([^)\s]+)\s+=[\dx]*\)", r"\1)", texto)   # tamaños " =900x80"
    texto = re.sub(r"<center>\s*(<img[^>]*>)\s*</center>", r"\1", texto)
    # Listas sangradas con 4+ espacios que Markdown tomaría como código
    lineas = []
    for l in texto.split("\n"):
        if re.match(r"^\s{4,}(\d+\.|!\[)", l):
            l = l.strip()
        elif re.match(r"^\s{5,}- ", l):
            l = "    " + l.strip()
        lineas.append(l)
    texto = "\n".join(lineas)
    # Separadores de emojis de Huevos Fértiles → corte de etapa
    texto = re.sub(r"^(?:🥚🐣🐥🐓\s*)+🥚🐣\s*$", "\n<hr class=\"etapa\">\n", texto, flags=re.M)
    texto = texto.replace(":hatching_chick:", "")
    texto = re.sub(r"\*\*([^*\n]+?)\s+\*\*", r"**\1**", texto)   # negritas con espacio antes del cierre
    if slug == "buenas-practicas":
        # Los rótulos con 🐣 pasan a ser títulos (el texto queda igual)
        def rotulo(m):
            t = m.group(1).strip()
            nivel = "##" if t.rstrip(":").isupper() else "###"
            return f"\n{nivel} {t}\n"
        texto = re.sub(r"^\s*🐣\s*(.+)$", rotulo, texto, flags=re.M)
        texto = re.sub(r"^MANEJO DE REPRODUCTORES(.*)$", r"## MANEJO DE REPRODUCTORES\1", texto, flags=re.M)
    if slug == "ecosistema":
        # Renglones sueltos que el original escribe uno debajo del otro → lista (mismo texto)
        texto = re.sub(r"^((?:Innovaciones|Caracterización|Curaduría|Definición|Interfaces) .+)$", r"- \1", texto, flags=re.M)
    # Renglones que empiezan con un emoji o con "•" → ítems con el ícono de la marca que corresponde
    lineas = []
    for l in texto.split("\n"):
        m = re.match(r"^\s*(🥚|🐣|🐥|🐤|🐓|❌|✅|•)\s*(.*)$", l)
        if m and m.group(2).strip():
            clase = MARCAS[m.group(1)]
            if slug == "buenas-practicas" and clase == "punto":
                clase = "pregunta"
            resto = re.sub(r"\s*<br\s*/?>\s*$", "", m.group(2).strip())
            l = f"\n- {{{{i:{clase}}}}} {resto}"
        elif slug == "buenas-practicas" and re.match(r"^\s*¿.+\?\s*<br\s*/?>\s*$", l):
            l = "\n- {{i:pregunta}} " + re.sub(r"\s*<br\s*/?>\s*$", "", l.strip())
        lineas.append(l)
    texto = "\n".join(lineas)
    # El resto de los emojis se quitan: la página usa sus propios íconos
    # (si el emoji separaba dos palabras, queda un espacio entre ellas)
    def quitar(m):
        antes = texto[m.start() - 1:m.start()]
        despues = texto[m.end():m.end() + 1]
        return " " if re.match(r"\w", antes) and despues.strip() else ""
    return EMOJI.sub(quitar, texto)


MARCAS = {"🥚": "huevo", "🐣": "nace", "🐥": "pollito", "🐤": "pollito", "🐓": "gallina", "❌": "no", "✅": "si", "•": "punto"}
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐⭕▶️‍]+ ?")


def a_html(texto, slug):
    cuerpo = markdown.markdown(texto, extensions=["extra", "sane_lists", "toc"], output_format="html5")
    # Imágenes: locales y como figura
    def imagen(m):
        etiqueta = m.group(0)
        src = re.search(r'src="([^"]+)"', etiqueta).group(1)
        if src.startswith("http"):
            src = bajar(html.unescape(src), slug)
        elif src.startswith("images/"):
            src = "../assets/" + {"images/diagrama_general.png": "diagrama.png"}.get(src, src)
        alt = re.search(r'alt="([^"]*)"', etiqueta)
        alt = alt.group(1) if alt and not re.fullmatch(r"(image|imagen|photo|[0-9a-f-]{20,})", alt.group(1) or "") else ""
        ancho = re.search(r'width="(\d+)', etiqueta)
        estilo = f' style="width:min(100%,{ancho.group(1)}px)"' if ancho else ""
        return f'<img src="{src}" alt="{alt}" loading="lazy"{estilo}>'
    cuerpo = re.sub(r"<img[^>]*>", imagen, cuerpo)
    cuerpo = re.sub(r"<p>\s*((?:<img[^>]*>\s*)+)</p>", lambda m: f'<figure class="lamina">{m.group(1)}</figure>', cuerpo)
    cuerpo = re.sub(r"(?<!<figure class=\"lamina\">)(?<=>)\s*((?:<img[^>]*>\s*){1,})(?=\s*<(?:h\d|p|ul|ol|hr|figure)\b)",
                    lambda m: f'<figure class="lamina">{m.group(1)}</figure>', cuerpo)
    # Íconos de la marca en los ítems
    cuerpo = re.sub(r"<li>(\s*<p>)?\s*\{\{i:(\w+)\}\}\s*", lambda m: f'<li class="i i-{m.group(2)}">{m.group(1) or ""}', cuerpo)
    cuerpo = re.sub(r"<ul>(\s*<li class=\"i i-pregunta\")", r'<ul class="preguntas">\1', cuerpo)
    # Datos "Nombre: valor" → fila de dato
    cuerpo = re.sub(r"<li>\s*<p>(<strong>[^<]+</strong>\s*:?)\s*</p>", r"<li>\1", cuerpo)
    cuerpo = re.sub(r"<li>(\s*)<strong>([^<]+?)(:?)</strong>\s*(:?)\s*(?:<br\s*/?>)?\s*",
                    lambda m: f'<li class="fila">{m.group(1)}<span class="k">{m.group(2)}{m.group(3) or m.group(4)}</span> ', cuerpo)
    # Rótulos cortos que terminan en ":" (Recolección:, Nacedora:, Resultados:…)
    cuerpo = re.sub(r"<p>([^<]{2,45}):\s*(?:<br\s*/?>)?\s*</p>", r'<p class="rotulo">\1:</p>', cuerpo)
    # Títulos seguidos sin texto entre ellos (componentes) → tarjetas
    cuerpo = re.sub(r"((?:<h3[^>]*>.*?</h3>\s*){2,})",
                    lambda m: '<div class="componentes">' + re.sub(r"(<h3[^>]*>.*?</h3>)", r'<div class="componente">\1</div>', m.group(1)) + "</div>",
                    cuerpo, flags=re.S)
    # Etapas de Huevos Fértiles: cada tramo entre separadores es un bloque numerado
    if '<hr class="etapa">' in cuerpo:
        partes = [p for p in cuerpo.split('<hr class="etapa">')]
        cuerpo = partes[0] + "".join(
            f'<section class="etapa"><span class="etapa-n" aria-hidden="true">{i:02d}</span>{p}</section>'
            for i, p in enumerate((p for p in partes[1:] if p.strip()), 1))
    # Frase destacada entre comillas al final de un párrafo
    cuerpo = re.sub(r'\s*<strong>(["“][^<]+["”])</strong>\s*</p>', r'</p><blockquote class="cita">\1</blockquote>', cuerpo)
    # Título principal: sale del cuerpo y va a la cabecera
    titulo = None
    m = re.search(r"<h1[^>]*>(.*?)</h1>", cuerpo, flags=re.S)
    if m:
        titulo = m.group(1)
        cuerpo = cuerpo.replace(m.group(0), "", 1)
    # Si la página no tiene títulos de nivel 2, sus títulos de nivel 3 son los capítulos
    if "<h2" not in cuerpo:
        cuerpo = re.sub(r"<(/?)h3\b", r"<\1h2", cuerpo)
        cuerpo = re.sub(r"<(/?)h4\b", r"<\1h3", cuerpo)
    # Capítulos para el cursor-huevo y el índice
    capitulos = []
    def h2(m):
        attrs, contenido = m.group(1), m.group(2)
        ident = re.search(r'id="([^"]+)"', attrs)
        ident = ident.group(1) if ident else f"s{len(capitulos)}"
        texto_plano = re.sub(r"<[^>]+>", "", contenido).strip()
        corto = re.sub(r"^[^\wÁÉÍÓÚÑáéíóúñ¿]+", "", texto_plano)
        capitulos.append((ident, corto))
        return f'<h2 id="{ident}" data-capitulo="{html.escape(corto[:40])}">{contenido}</h2>'
    cuerpo = re.sub(r"<h2([^>]*)>(.*?)</h2>", h2, cuerpo, flags=re.S)
    # Videos de YouTube: además del enlace, una miniatura que se reproduce ahí mismo
    if slug == "prensa":
        def video(m):
            p = m.group(0)
            ids = YOUTUBE.findall(p)
            if not ids:
                return p
            vid = ids[0]
            mini = bajar(f"https://img.youtube.com/vi/{vid}/hqdefault.jpg", "yt")
            return (f'<div class="video-item"><button class="yt yt-doc" data-id="{vid}" aria-label="Reproducir video">'
                    f'<img src="{mini}" alt="" loading="lazy"><span class="play"><i></i>Ver video</span></button>{p}<!--fin--></div>')
        # Miniaturas solo en la sección de videos; el resto son notas
        partes = re.split(r'(<h2 id="[^"]+"[^>]*>.*?</h2>)', cuerpo, flags=re.S)
        for i in range(1, len(partes), 2):
            if "Videos" in partes[i] and i + 1 < len(partes):
                partes[i + 1] = re.sub(r"<p>.*?</p>", video, partes[i + 1], flags=re.S)
                partes[i + 1] = re.sub(r'((?:\s*<div class="video-item">.*?<!--fin--></div>)+)',
                                       r'<div class="video-grid">\1</div>', partes[i + 1], flags=re.S)
        cuerpo = "".join(partes)
        # Notas: enlace solo → tarjeta; si arriba hay un renglón con la fuente, va como rótulo de la tarjeta
        cuerpo = re.sub(r'<p>(<a [^>]+>[^<]+</a>)</p>', r'<div class="nota"><p>\1</p></div>', cuerpo)
        cuerpo = re.sub(r'<ul>\s*<li>([^<]*?)</li>\s*</ul>\s*(?:<div class="nota">)?<p>(.*?)</p>(?:</div>)?',
                        r'<div class="nota"><span class="fuente">\1</span><p>\2</p></div>', cuerpo, flags=re.S)
    return titulo, cuerpo, capitulos


def plantilla(archivo, nombre, grupo, titulo, cuerpo, capitulos, foto, previa, siguiente):
    lateral = ""
    for g in dict.fromkeys(p[2] for p in PAGINAS):
        lateral += f"    <h4>{g}</h4>\n"
        for a, n, gg, *_ in PAGINAS:
            if gg == g:
                actual = ' aria-current="page"' if a == archivo else ""
                lateral += f'    <a href="{a}"{actual}>{n}</a>\n'
    toc = "".join(f'    <a href="#{i}">{html.escape(t)}</a>\n' for i, t in capitulos)
    toc_html = f'  <nav class="toc" aria-label="En esta página">\n    <h4>En esta página</h4>\n{toc}  </nav>' if capitulos else '  <nav class="toc" aria-hidden="true"></nav>'
    palabras = len(re.sub(r"<[^>]+>", " ", cuerpo).split())
    meta = (f"{len(capitulos)} secciones · " if capitulos else "") + f"{max(1, round(palabras / 200))} min de lectura"
    ant = f'<a href="{previa[0]}"><small>← Anterior</small><strong>{previa[1]}</strong></a>' if previa else '<a href="index.html"><small>← Anterior</small><strong>Inicio</strong></a>'
    sig = f'<a href="{siguiente[0]}"><small>Siguiente →</small><strong>{siguiente[1]}</strong></a>' if siguiente else '<a href="index.html"><small>Volver →</small><strong>Inicio</strong></a>'
    return f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(nombre)} — LibreIncu</title>
<link rel="icon" href="../assets/favicon-yema.png">
<link rel="stylesheet" href="../assets/fuentes.css">
<link rel="stylesheet" href="../estilo.css">
<link rel="stylesheet" href="v2.css">
</head>
<body>
<!-- Generado por herramientas/generar.py desde contenido-original/ -->

{marcar_cabecera(archivo, grupo)}

<div class="doc-hero doc-hero-v2">
  <div class="wrap">
    <div>
      <span class="kicker">{grupo}</span>
      <h1>{titulo or nombre}</h1>
      <p class="meta">{meta}</p>
    </div>
  </div>
</div>

<div class="doc">
  <aside class="lateral">
{lateral}  </aside>

  <article class="prosa doc-{archivo[:-5]}">
{cuerpo}
    <nav class="pager" data-m="sube">
      {ant}
      {sig}
    </nav>
  </article>

{toc_html}
</div>

{PIE}

<script src="v2.js"></script>
</body>
</html>
"""


def marcar_cabecera(archivo, grupo):
    """Marca en el menú la página actual, o si no está, la de su grupo."""
    destino = archivo if f'href="{archivo}"' in CABECERA else grupo_enlace(grupo)
    return CABECERA.replace(f'href="{destino}"', f'href="{destino}" aria-current="page"', 1)


def grupo_enlace(grupo):
    return {"Incubar": "manual.html", "App": "app.html", "Técnico": "especificaciones.html", "Comunidad": "contacto.html"}[grupo]


CABECERA = """<header class="top">
  <div class="wrap">
    <a class="marca" href="index.html">
      <img src="../assets/huevo-yema.png" alt="">
      <span><strong>LibreIncu</strong><small>AlterMundi · CTO</small></span>
    </a>
    <button class="menu-btn" aria-label="Abrir menú">Menú</button>
    <nav>
      <a href="index.html#hoy">Hoy</a>
      <a href="manual.html">Incubar</a>
      <a href="app.html">App LibrePollo</a>
      <a href="especificaciones.html">Técnico</a>
      <a href="prensa.html">Videos</a>
      <a href="contacto.html">Contacto</a>
    </nav>
  </div>
</header>"""

PIE = """<footer class="pie">
  <div class="wrap">
    <div class="marca-pie"><img src="../assets/huevo-yema.png" alt=""><strong>LibreIncu</strong></div>
    <div class="socios">
      <span>Desarrollado por</span>
      <img src="../assets/altermundi.png" alt="AlterMundi">
      <img src="../assets/cto-sello.png" alt="Comunidad, Trabajo y Organización (CTO) Traslasierra">
    </div>
    <p><a href="https://github.com/AlterMundi-MonitoreoyControl/website">GitHub</a> · Córdoba, Argentina</p>
    <p class="legal">This work is licensed under <a href="http://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a></p>
  </div>
</footer>"""


def main():
    for i, (archivo, nombre, grupo, origen, foto) in enumerate(PAGINAS):
        if origen is None:
            continue
        slug = archivo[:-5]
        texto = limpiar((ORIGEN / origen).read_text(encoding="utf-8"), slug)
        titulo, cuerpo, capitulos = a_html(texto, slug)
        previa = PAGINAS[i - 1][:2] if i > 0 else None
        siguiente = PAGINAS[i + 1][:2] if i + 1 < len(PAGINAS) else None
        (SALIDA / archivo).write_text(
            plantilla(archivo, nombre, grupo, titulo, cuerpo, capitulos, foto, previa, siguiente), encoding="utf-8")
        print(f"{archivo}: {len(capitulos)} capítulos")


if __name__ == "__main__":
    main()
