# Roadmap para Claude Code — Rediseño LibreIncu (v2 → arquitectura de landings)

Repo: `fabriciopetiso/libreincu-rediseno`. Trabajar siempre en local (`python3 herramientas/servidor.py 8766 prototipo` → http://127.0.0.1:8766/v2/).

**Cómo usarlo:** un prompt por sesión (o por fase), en orden. Al terminar cada fase revisás en local y recién ahí das el OK para commit. Si una fase sale mal, se corrige antes de pasar a la siguiente.

---

## Antes de empezar (decisiones tuyas, no de Claude Code)

La landing comercial necesita datos que la web no puede inventar. Mientras no estén, van como bloques **pendientes** (visibles solo en local):

- Precio o rango, o solo "pedí presupuesto"
- Quién fabrica, vende y factura
- Garantía y soporte técnico (quién, cómo, cuánto tiempo)
- Plazo de entrega y zona de envío
- 4 landings (como la propuesta) o 3 (fusionando Proyecto + Producción). **El roadmap asume 4.**

---

## Fase 0 — Contexto fijo (CLAUDE.md)

```
Leé README.md, herramientas/generar.py, herramientas/verificar_textos.py, prototipo/v2/index.html, prototipo/v2/v2.css y prototipo/v2/v2.js. Después leé docs/PROPUESTA.md [guardar en el repo la propuesta que está al principio de este archivo]. Esa propuesta manda: si algo de este roadmap la contradice, seguí la propuesta y avisame.

Creá un CLAUDE.md en la raíz con las reglas de trabajo de este repo:
- Nunca hacer commit ni push sin mi OK explícito después de revisar en local.
- Nada se sube al repo de AlterMundi.
- contenido-original/ no se modifica; las páginas de documentación se generan con herramientas/generar.py y se controlan con herramientas/verificar_textos.py (debe pasar sin errores).
- El sitio es autosuficiente: nada de CDNs, fuentes o scripts externos.
- Reutilizar v2.css y los componentes existentes; no agregar frameworks ni build steps.
- Textos pendientes: usar un componente .pendiente (definilo en v2.css) que se vea claramente en local y que sea fácil de encontrar con grep antes de publicar.
- Responder en español.
- Cada landing es una puerta de entrada independiente (sección 8 de la propuesta): tiene que entenderse sola si alguien llega directo desde un link, con una línea de qué es LibreIncu, sus propios meta title/description/Open Graph con foto, y accesos a las otras 3 landings.
- Criterios de la sección 9: jerarquización, claridad (textos cortos, sin repetir), profesionalismo, autonomía, identidad cooperativa y escalabilidad.

Resumime en 10 líneas cómo está armado el sitio hoy (qué es generado, qué es a mano, dónde está el menú). No cambies nada más todavía.
```

**Revisás:** que el resumen sea correcto. Ojo: el menú hoy está duplicado (en `index.html` y en `CABECERA` dentro de `generar.py`).

---

## Fase 1 — Arquitectura y navegación

```
Objetivo: pasar a la arquitectura de la propuesta: portada + 4 landings.

1. Unificá el menú en una sola fuente (que index.html y las páginas generadas usen el mismo). Nuevo menú:
   Inicio(logo) | Incubadora | Proyecto | Tecnología | Producción | Contacto
2. Creá 4 páginas nuevas hechas a mano (no generadas) con el mismo header/footer: incubadora.html, proyecto.html, tecnologia.html, produccion.html. Por ahora con hero (título + bajada) y bloques vacíos marcados .pendiente según la estructura de la propuesta.
3. Reagrupá las páginas de documentación en generar.py:
   - Tecnología: especificaciones, ecosistema, app, problemas, manual
   - Producción: huevos, buenas-practicas
   - Comunidad/Proyecto: prensa
   - contacto queda como está
   Actualizá grupo_enlace() y el menú lateral para que reflejen esos grupos.
4. Corré generar.py y verificar_textos.py. Comprobá que no quede ningún link roto (escribí un chequeo simple en herramientas/ si hace falta).

No toques todavía el contenido de index.html más allá del menú.
```

**Revisás:** que se pueda navegar a las 4 secciones desde cualquier página, también en el celular (menú hamburguesa).

---

## Fase 2 — Portada como distribuidor

```
Reformulá prototipo/v2/index.html como portada distribuidora (ver sección 2 de la propuesta):

- Hero: título LibreIncu + subtítulo entendible para alguien que no conoce la sigla AFCI (ej. "Incubadora libre de 150 huevos para la producción avícola familiar"). Dos botones: "Conocé la incubadora" → incubadora.html y "Pedí presupuesto" → incubadora.html#presupuesto.
- Párrafo corto de qué es LibreIncu (máximo 3 líneas).
- 4 accesos visuales grandes (tarjeta con foto real de assets/, título y una línea) a las 4 landings.
- La portada NO desarrolla contenidos (sección 2 de la propuesta): como mucho una franja con 4 cifras (+3 años, 7 cooperativas, +2.500 huevos, 86 % de eclosión) que lleve a proyecto.html. "Dónde estamos hoy" completo, su video y los videos de YouTube pasan a proyecto.html.
- La sección "triple dependencia" y el bloque de la incubadora se mueven a proyecto.html (no los borres: movelos).
- Sacá los bloques "Foto pendiente" de la portada.
- El video de "Hoy" no debe arrancar con sonido ni autoplay pesado en celular; revisá preload.
- Corregí "Aviagem" → "Aviagen".

Mantené el huevo-cursor y las animaciones existentes salvo que rompan algo.
```

**Revisás:** que la portada se entienda en 10 segundos y que nada importante se haya perdido (todo lo movido tiene que estar en Proyecto).

---

## Fase 3 — Landing LA INCUBADORA (comercial)

```
Armá incubadora.html como página de producto (sección 3 de la propuesta). Orden:

1. Hero con foto principal del producto (incubadora-carga.jpg o la mejor disponible) + propuesta de valor en una frase + botón "Pedí presupuesto".
2. Ficha de datos: reutilizá la ficha de 8 datos que hoy está en FICHAS["especificaciones.html"] de generar.py (movela a esta página; en especificaciones dejá solo el texto técnico).
3. Qué resuelve / para quién es (productores familiares, cooperativas, organizaciones).
4. Ventajas y diferenciales: hardware y software libres, repuestos del mercado, control desde el celular, fabricada en la ruralidad.
5. Cómo funciona en 3 pasos (cargar huevos → monitorear desde la app → nacimiento), con link a la app.
6. Fabricación y componentes (resumen; el detalle va en Tecnología).
7. Garantía, mantenimiento y soporte → .pendiente
8. Preguntas frecuentes (acordeón accesible). Redactá 6 preguntas con respuestas SOLO a partir de lo que ya dice contenido-original/. Las que no tengan respuesta ahí van como .pendiente. No inventes datos.
9. #presupuesto: bloque de contacto comercial con WhatsApp con mensaje precargado ("Hola, quiero pedir presupuesto por la incubadora LibreIncu 150") y mail. Precio → .pendiente.

El 86 % siempre con su contexto ("en las pruebas realizadas"). No uses afirmaciones comparativas con marcas comerciales.
```

**Revisás:** que no haya ningún dato inventado. Completás vos los `.pendiente`.

---

## Fase 4 — Landing EL PROYECTO

```
Armá proyecto.html (sección 4 de la propuesta) con el contenido que se movió de la portada:

1. Origen: quiénes (AlterMundi, CTO, organizaciones de la AFCI — acá sí explicá la sigla).
2. Problema: la triple dependencia (el bloque interactivo que ya existe, movido de index).
3. La respuesta: soberanía tecnológica, alimentaria, producción familiar, desarrollo cooperativo — 4 bloques cortos.
4. Organizaciones participantes → logos/nombres; lo que no esté en el repo, .pendiente.
5. Resultados e impacto: la lista completa de "Dónde estamos hoy" que salió de la portada, con el video de "Hoy". "Plantinera hortícola" no es de la incubadora: dejala marcada .pendiente para que yo decida si va.
6. Videos, prensa y difusión: los dos videos de YouTube que salieron de la portada + link a prensa.html.
7. CTA institucional: "Sumate / Contactanos" → contacto.html con motivo institucional.
```

---

## Fase 5 — Landing TECNOLOGÍA LIBRE

```
Armá tecnologia.html (sección 5 de la propuesta) como hub técnico:

1. Hero: "Hardware y software libres" + bajada sobre apropiación y replicabilidad.
2. Arquitectura tecnológica: el diagrama general (diagrama_general.png en assets) con 3-4 líneas de explicación.
3. Bloques cortos con contenido propio (resumen, no solo links), tomando el texto de contenido-original/: Hardware y electrónica · Componentes y sensores (BME280, reed, ventilador, resistencia, bomba) · Firmware y actualizaciones (NodeMCU/Lua) · App LibrePollo. Cada bloque termina en un link a la página de documentación completa.
4. Manuales y documentación: tarjetas a Especificaciones técnicas, Ecosistema informático, Manual básico, Solución de problemas.
5. Código fuente: links a los repos de GitHub que ya aparecen en contenido-original (el de la incubadora, src/embedded). No agregues repos que no estén citados ahí.
6. Licencias: hardware/software libres + CC BY 4.0 de la documentación.
7. Comunidad de desarrollo: cómo participar → .pendiente si no hay info.
8. CTA: "Contacto técnico" → contacto.html con motivo técnico.
```

---

## Fase 6 — Landing PRODUCCIÓN AVÍCOLA

```
Armá produccion.html (sección 6 de la propuesta):

1. Hero con foto de gallinas/pollitos.
2. Genética propia: el texto que hoy está en la portada (criollas + razas pesadas, Negra INTA).
3. Alimentación agroecológica: texto de la portada + link a https://materialavicola.cto.ar/
4. Buenas prácticas de incubación: tarjetas a huevos.html y buenas-practicas.html.
5. Manejo de aves → .pendiente
6. Experiencias de productores → .pendiente (estructura de testimonio con foto, nombre, cooperativa y cita, vacía).
7. Cooperativas, organizaciones y articulación territorial: Córdoba, Tucumán, Santa Fe, Mendoza; acompañamiento a productores → .pendiente si no hay texto.
8. CTA para productores: WhatsApp con mensaje precargado "Soy productor/a y quiero saber más".
```

---

## Fase 7 — Contacto

```
Rehacé contacto.html (es una página PROPIA en generar.py, PROPIAS["contacto.html"]):
- Breve texto de bienvenida.
- 3 accesos según motivo, cada uno con WhatsApp y mensaje precargado distinto: Comprar / presupuesto · Soporte técnico · Institucional / alianzas.
- Mail libreincu@gmail.com.
- Si alguna landing linkea a contacto.html?motivo=..., que se resalte el bloque correspondiente (JS mínimo en v2.js).
Sin formularios que dependan de servicios externos.
```

---

## Fase 8 — Pulido visual y responsive

```
Revisá todas las páginas en 360px, 768px y 1280px de ancho (usá Playwright o un script con capturas en herramientas/ si lo tenés disponible; si no, decime cómo revisarlo yo).
- Que las 4 landings compartan identidad pero tengan un tratamiento propio (por ejemplo, un color de acento por sección dentro de la paleta actual).
- Que cada landing tenga al final accesos a las otras 3.
- Accesibilidad básica: alt en todas las imágenes, contraste, foco visible, acordeón con teclado.
- Peso: imágenes en WebP o JPG optimizado, lazy-loading debajo del pliegue; reportame el peso total de cada página.
Pasame una lista de lo que encontraste y lo que cambiaste.
```

---

## Fase 9 — Control final antes de publicar

```
Antes del commit final:
1. Corré generar.py y verificar_textos.py (sin errores).
2. Chequeo de links internos y externos.
3. grep de .pendiente: listame todos los que quedan, por página.
4. Revisá que no haya ningún recurso cargado desde servidores externos (salvo el reproductor de YouTube al tocar el video).
5. Actualizá README.md con la nueva estructura.
No hagas commit hasta que te dé el OK.
```

---

## Pendiente fuera de Claude Code

- Errores dentro de `contenido-original/` (ej. "diseño iterativo ," en Especificaciones): la regla actual es no tocar esos textos. Si querés corregirlos, decidí si se editan los .md (y se actualiza la regla) o se dejan.
- Fotos faltantes: productores con sus pollitos en el campo, equipo armando/reparando una incubadora, foto de producto completo con fondo limpio para la landing comercial.
- Dominio propio.
