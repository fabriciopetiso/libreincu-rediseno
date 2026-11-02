# LibreIncu — rediseño (privado)

Prototipo del rediseño del sitio de LibreIncu. Repo privado de trabajo.

- `prototipo/` — v1 (`index.html`, `manual.html`) y v2 (`v2/`, con el huevo-cursor y la sección "Hoy").
- `contenido-original/` — los textos del sitio actual (Markdown), que no se modifican.
- `herramientas/servidor.py` — servidor local que permite saltar dentro de los videos.

Ver local:

    python3 herramientas/servidor.py 8766 prototipo

y abrir http://127.0.0.1:8766/ (v1) o http://127.0.0.1:8766/v2/.

`fotos-rediseno/` (originales) no se sube.

## Autosuficiente

El sitio no carga nada de otros servidores: tipografías (`prototipo/assets/fuentes/`), imágenes de la documentación (`prototipo/assets/docs/`), miniaturas y el video de "Hoy" están en el repo. Lo único externo son los enlaces a notas y redes, y el reproductor de YouTube, que se carga recién al tocar un video.

Regenerar las páginas de documentación (no necesita internet, las imágenes ya están guardadas):

    pip install -r herramientas/requirements.txt
    python3 herramientas/generar.py

## Procedimiento de trabajo

1. Los cambios se hacen y se revisan **en local** (http://127.0.0.1:8766/v2/).
2. Recién cuando Fabricio da el **OK a la visualización**, se hace commit y push a este repo.
3. Nada de este rediseño se sube al repo de AlterMundi.

## Publicación

GitHub Pages publica la raíz de `main`: https://fabriciopetiso.github.io/libreincu-rediseno/ (redirige a `prototipo/v2/`). El dominio propio se define con la versión final.
