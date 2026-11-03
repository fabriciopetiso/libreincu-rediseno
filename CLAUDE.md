# LibreIncu — rediseño: reglas de trabajo

La propuesta vigente está en `docs/PROPUESTA.md` y el plan por fases en `docs/ROADMAP.md`. Si el roadmap contradice la propuesta, manda la propuesta (y se avisa).

## Reglas

- Nunca hacer commit ni push sin el OK explícito de Fabricio después de revisar en local (http://127.0.0.1:8766/v2/, servidor: `python3 herramientas/servidor.py 8766 prototipo`).
- Nada se sube al repo de AlterMundi.
- `contenido-original/` no se modifica. Las páginas de documentación se generan con `herramientas/generar.py` y se controlan con `herramientas/verificar_textos.py`, que tiene que pasar sin errores.
- `generar.py` es la única fuente del menú y del pie: también los reescribe en las páginas hechas a mano (`A_MANO`). No editar el `<header>` ni el `<footer>` a mano.
- El sitio es autosuficiente: nada de CDNs, fuentes ni scripts externos (lo único externo es el reproductor de YouTube, que se carga al tocar un video).
- Reutilizar `estilo.css`, `v2.css` y los componentes existentes. Sin frameworks ni build steps.
- Datos que faltan (precio, garantía, fotos, etc.): componente `.pendiente` de `v2.css`. Se ve solo en local (en GitHub Pages se oculta) y se encuentra con `grep -rn pendiente prototipo/v2`. Nunca inventar datos.
- Cada landing (`incubadora`, `proyecto`, `tecnologia`, `produccion`) es una puerta de entrada independiente: se entiende sola si alguien llega directo desde un link, tiene una línea de qué es LibreIncu, su propio title/description/Open Graph con foto, y accesos a las otras 3 al final.
- Criterios (sección 9 de la propuesta): jerarquización, claridad (textos cortos, sin repetir), profesionalismo, autonomía, identidad cooperativa y escalabilidad.
- El 86 % de eclosión siempre con su contexto ("en las pruebas realizadas"). Sin comparaciones con marcas comerciales.
- Responder en español.

## Control antes de publicar

    python3 herramientas/generar.py
    python3 herramientas/verificar_textos.py
    python3 herramientas/revisar.py
