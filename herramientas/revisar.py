"""Control antes de publicar: links internos y anclas, recursos externos, bloques .pendiente y peso por página.

Uso:  python3 herramientas/revisar.py              (todo menos links externos)
      python3 herramientas/revisar.py --externos   (además prueba cada link externo)
"""
import re
import sys
import urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

RAIZ = Path(__file__).resolve().parent.parent / "prototipo"
PAGINAS = sorted((RAIZ / "v2").glob("*.html"))
CARGA = {("img", "src"), ("script", "src"), ("link", "href"), ("video", "src"), ("video", "poster"),
         ("source", "src"), ("iframe", "src")}


class Lector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.enlaces, self.cargas, self.ids, self.pendientes = [], [], set(), 0
        self._pila = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.add(a["id"])
        if "pendiente" in (a.get("class") or "").split():
            self.pendientes += 1
        if tag == "a" and a.get("href"):
            self.enlaces.append(a["href"])
        for t, at in CARGA:
            if tag == t and a.get(at):
                if tag == "link" and a.get("rel") not in ("stylesheet", "icon"):
                    continue
                self.cargas.append(a[at])


def leer(ruta):
    lector = Lector()
    lector.feed(ruta.read_text(encoding="utf-8"))
    return lector


def es_externo(url):
    return urlparse(url).scheme in ("http", "https")


def main():
    externos = "--externos" in sys.argv
    lectores = {p.name: leer(p) for p in PAGINAS}
    errores, links_externos = [], set()

    for nombre, lec in lectores.items():
        base = RAIZ / "v2"
        for url in lec.enlaces:
            if url.startswith(("mailto:", "tel:")):
                continue
            if es_externo(url):
                links_externos.add(url)
                continue
            u = urlparse(url)
            destino = nombre if not u.path else Path(unquote(u.path)).name
            ruta = (base / unquote(u.path)).resolve() if u.path else base / nombre
            if not ruta.exists():
                errores.append(f"{nombre}: link roto → {url}")
            elif u.fragment and ruta.suffix == ".html":
                ids = lectores[destino].ids if destino in lectores else leer(ruta).ids
                if u.fragment not in ids:
                    errores.append(f"{nombre}: ancla inexistente → {url}")
        for url in lec.cargas:
            if es_externo(url):
                errores.append(f"{nombre}: recurso cargado desde afuera → {url}")
            elif not (base / unquote(url)).resolve().exists():
                errores.append(f"{nombre}: recurso que no existe → {url}")

    print("== Links internos y recursos")
    print("\n".join(errores) if errores else "Sin problemas.")

    print("\n== Bloques .pendiente por página")
    for nombre, lec in lectores.items():
        if lec.pendientes:
            print(f"{nombre}: {lec.pendientes}")
            texto = (RAIZ / "v2" / nombre).read_text(encoding="utf-8")
            for m in re.finditer(r'class="[^"]*\bpendiente\b[^"]*"[^>]*>(.*?)</(?:div|li|details|section)>', texto, re.S):
                resumen = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", m.group(1))).strip()
                print(f"   · {resumen[:110]}")

    print("\n== Peso de cada página (HTML + recursos que carga; los videos se cuentan aparte)")
    for nombre, lec in lectores.items():
        imagenes = videos = 0
        for url in set(lec.cargas):
            ruta = (RAIZ / "v2" / unquote(url)).resolve()
            if es_externo(url) or not ruta.exists():
                continue
            if ruta.suffix == ".mp4":
                videos += ruta.stat().st_size
            else:
                imagenes += ruta.stat().st_size
        total = (RAIZ / "v2" / nombre).stat().st_size + imagenes
        print(f"{nombre:24} {total / 1024:7.0f} KB" + (f"  + video {videos / 1024 / 1024:.1f} MB" if videos else ""))

    if externos:
        print("\n== Links externos")
        for url in sorted(links_externos):
            try:
                pedido = urllib.request.Request(url, method="GET", headers={"User-Agent": "Mozilla/5.0"})
                with urllib.request.urlopen(pedido, timeout=15) as r:
                    estado = r.status
            except Exception as e:  # noqa: BLE001
                estado = getattr(e, "code", type(e).__name__)
            marca = "ok " if estado == 200 else "!! "
            print(f"{marca}{estado}  {url}")

    sys.exit(1 if errores else 0)


if __name__ == "__main__":
    main()
