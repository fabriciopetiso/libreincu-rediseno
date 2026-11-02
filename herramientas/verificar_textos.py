"""Compara, palabra por palabra, el texto original (Markdown) con el de cada página generada.

Ignora emojis, signos de puntuación sueltos y sintaxis; reporta palabras agregadas o faltantes.
Uso:  python3 herramientas/verificar_textos.py
"""
import difflib
import html
import re
import sys
from pathlib import Path

import markdown

sys.path.insert(0, str(Path(__file__).parent))
from generar import ORIGEN, PAGINAS, PROPIAS, SALIDA, EMOJI  # noqa: E402


def palabras(texto):
    texto = html.unescape(re.sub(r"<[^>]+>", " ", texto))
    texto = EMOJI.sub(" ", texto)
    return re.findall(r"[\wÁÉÍÓÚÑÜáéíóúñü°%¿?¡!]+", texto)


errores = 0
for archivo, nombre, grupo, origen, _ in PAGINAS:
    if not origen or archivo in PROPIAS:
        continue
    md = (ORIGEN / origen).read_text(encoding="utf-8")
    md = re.sub(r"\A---\n.*?\n---\n", "", md, flags=re.S)
    md = re.sub(r":::success.*?:::", "", md, flags=re.S)
    md = re.sub(r"\[image\d+\]: <data:[^>]+>", "", md)
    md = re.sub(r"!\[[^\]]*\](\([^)]*\)|\[[^\]]*\])", "", md)
    md = md.replace(":hatching_chick:", "")
    a = palabras(markdown.markdown(md, extensions=["extra"]))
    pagina = (SALIDA / archivo).read_text(encoding="utf-8")
    cuerpo = re.search(r'<article class="prosa[^"]*">(.*?)<nav class="pager"', pagina, re.S).group(1)
    titulo = re.search(r"<h1>(.*?)</h1>", pagina, re.S).group(1)
    cuerpo = re.sub(r'<span class="etapa-n"[^>]*>\d+</span>|<span class="play">.*?</span>', " ", cuerpo)
    # Si el original tiene título principal, la página lo muestra en la cabecera
    tiene_h1 = re.search(r"^#\s", md, re.M) is not None
    b = palabras((titulo + " " if tiene_h1 else "") + cuerpo)
    dif = [d for d in difflib.ndiff(a, b) if d[0] in "+-"]
    if dif:
        errores += 1
        print(f"{archivo}: {len(dif)} diferencias → {' '.join(dif[:20])}")
    else:
        print(f"{archivo}: texto idéntico ({len(a)} palabras)")
sys.exit(1 if errores else 0)
