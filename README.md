# LibreIncu — rediseño

Prototipo del rediseño del sitio de LibreIncu: una portada que distribuye y cuatro landings independientes, según `docs/PROPUESTA.md` (plan por fases en `docs/ROADMAP.md`, reglas de trabajo en `CLAUDE.md`).

## Estructura (`prototipo/v2/`)

| Página | Qué es | Cómo se hace |
|---|---|---|
| `index.html` | Portada: qué es LibreIncu y cuatro accesos | a mano |
| `incubadora.html` | Landing comercial: ficha, ventajas, cómo funciona, preguntas, presupuesto | a mano |
| `proyecto.html` | Landing institucional: triple dependencia, organizaciones, resultados, videos | a mano |
| `tecnologia.html` | Landing técnica: arquitectura, componentes, documentación, código y licencias | a mano |
| `produccion.html` | Landing productiva: genética, alimentación, buenas prácticas, territorio | a mano |
| `manual.html` | Manual básico (documentación) | a mano |
| `especificaciones`, `ecosistema`, `app`, `problemas`, `huevos`, `buenas-practicas`, `prensa`, `contacto` | Documentación | generadas desde `contenido-original/` |

- `herramientas/generar.py` genera la documentación y es la **única fuente** del menú, el pie, los accesos cruzados entre landings (`<!--otras-->`) y el menú lateral del manual: también los reescribe en las páginas hechas a mano.
- `prototipo/v2/v2.css` tiene los componentes (landings, tarjetas, preguntas, presupuesto, `.pendiente`), y `v2.js` el movimiento (huevo-cursor, video de resultados, contacto por motivo).
- `contenido-original/` son los textos del sitio actual (Markdown) y no se modifican.
- `fotos-rediseno/` (originales) no se sube.

## Ver local

    python3 herramientas/servidor.py 8766 prototipo

y abrir http://127.0.0.1:8766/v2/

## Pendientes

Lo que falta definir (precio, garantía, organizaciones, fotos…) va en bloques `.pendiente`: se ven en local y se ocultan solos en GitHub Pages. Para listarlos:

    python3 herramientas/revisar.py

## Antes de publicar

    pip install -r herramientas/requirements.txt
    python3 herramientas/generar.py
    python3 herramientas/verificar_textos.py
    python3 herramientas/revisar.py --externos

`revisar.py` controla links internos y anclas, recursos cargados desde afuera, bloques pendientes y peso de cada página.

## Autosuficiente

El sitio no carga nada de otros servidores: tipografías, imágenes y videos están en el repo. Lo único externo son los enlaces y el reproductor de YouTube, que se carga recién al tocar un video.

## Procedimiento de trabajo

1. Los cambios se hacen y se revisan **en local**.
2. Recién cuando Fabricio da el **OK a la visualización**, se hace commit y push a este repo.
3. Nada de este rediseño se sube al repo de AlterMundi.

## Publicación

GitHub Pages publica la raíz de `main`: https://fabriciopetiso.github.io/libreincu-rediseno/ (redirige a `prototipo/v2/`). Las imágenes de Open Graph de las landings apuntan a esa dirección: actualizarlas cuando se defina el dominio propio.
