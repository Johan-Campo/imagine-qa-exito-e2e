# Pruebas automáticas de exito.com

Este proyecto contiene un conjunto de pruebas automáticas para la tienda en línea Éxito. El programa interactúa con el sitio como lo haría un usuario: busca un producto, selecciona la tienda donde desea recogerlo, lo agrega al carrito y verifica que el flujo funcione correctamente.

El proyecto fue desarrollado como parte de una prueba técnica para un proceso de selección de QA. Además de las pruebas automatizadas, incluye una pequeña herramienta que utiliza inteligencia artificial (IA) para apoyar el análisis de posibles causas cuando una prueba falla.

## Qué comprueba

| Prueba                     | Qué revisa                                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TC-07 · Compra normal**  | Busca "arroz", selecciona la tienda Chapinero en Bogotá, agrega el producto y verifica el carrito y su total.                                           |
| **TC-05 · Error esperado** | Si no se selecciona una tienda, el sitio solicita la ciudad y el almacén correspondiente y no permite agregar el producto hasta completar la selección. |
| **TC-09 · Límite**         | En un producto digital, verifica que el sitio no permita agregar más unidades de las permitidas y que muestre el aviso correspondiente.                 |

Además, hay una prueba rápida que comprueba únicamente que el buscador funcione correctamente.

Los códigos **TC-07, TC-05 y TC-09** corresponden a los casos de prueba definidos en el documento de pruebas, que se entrega como parte de la prueba técnica.

## Cómo ejecutarlo

Necesitas **Node.js 24**, Google Chrome instalado y conexión a internet. El proyecto fue probado en Windows 11.

Abre una terminal y sigue estos pasos:

1. Clona el repositorio:

```
git clone https://github.com/Johan-Campo/imagine-qa-exito-e2e.git
```

2. Entra en la carpeta del proyecto:

```
cd imagine-qa-exito-e2e
```

3. Instala las dependencias:

```
npm ci
```

4. Ejecuta las pruebas en el sitio real:

```
npm run test:e2e
```

Este comando ejecuta las 4 pruebas directamente sobre el sitio real. Se abrirá una ventana de Chrome y la ejecución tarda aproximadamente entre 1 y 2 minutos. No cierres la ventana mientras las pruebas estén en ejecución.

5. Ejecuta las pruebas unitarias de la herramienta de IA:

```
npm run test:unit
```

Estas pruebas no abren el navegador.

6. Para ejecutar las pruebas y generar un reporte de ejemplo:

```
npm run test:sample
```

Para abrir el reporte:

```
npm run test:sample:report
```

También puedes revisar la calidad del código con:

```
npm run typecheck
npm run lint
npm run format:check
```

La ejecución con una ventana visible de Chrome es intencional. El sitio cuenta con mecanismos de protección frente a automatizaciones, por lo que las pruebas se ejecutan una a la vez y con tiempos controlados para reducir posibles bloqueos o falsos negativos.

### Herramienta de IA (opcional)

Para utilizar la herramienta de análisis de fallos, copia `.env.example` como `.env` y agrega tu clave de DeepInfra en:

```
DEEPINFRA_API_KEY=tu_clave
```

Después puedes ejecutar:

```
npm run triage -- <ruta a un error-context.md>
```

o:

```
npm run triage:eval
```

La utilización de esta herramienta puede generar costos asociados al servicio de IA. El archivo `.env` contiene información sensible y **no debe subirse al repositorio ni compartirse públicamente**.

## Qué hay en cada carpeta

- `tests/` contiene las pruebas automatizadas y sus componentes.
- `tools/failure-triage/` contiene la herramienta de IA para el análisis de fallos.
- `reports/sample-run/` contiene un reporte de una ejecución real, incluyendo los pasos realizados y capturas de pantalla. Las 4 pruebas de esa ejecución finalizaron correctamente.

Para obtener un nivel mayor de detalle se pueden activar las trazas de Playwright:

```
npx playwright test --trace on
```

Estas trazas pueden ocupar entre 50 y 60 MB por prueba, por lo que no fueron incluidas en el repositorio.

## Decisiones que tomé

- **Playwright con TypeScript:** elegí estas herramientas para automatizar el navegador, aprovechando las esperas automáticas de Playwright y sus capacidades de reporte y depuración.
- **Chrome con ventana visible y ejecución secuencial:** se definió así debido a las protecciones del sitio frente a automatizaciones.
- **Validación de comportamientos y reglas:** las pruebas se enfocan principalmente en comportamientos funcionales y reglas del flujo, evitando depender de precios o existencias que pueden cambiar constantemente.
- **Evitar escenarios no confirmados:** no incluí como prueba automatizada un posible error relacionado con un límite de unidades que no pude confirmar de forma consistente. Prefiero mantener pruebas basadas en comportamientos que se pueden repetir antes que generar fallos que no sean reales.

## Cómo usé la IA

Utilicé un asistente de IA como **herramienta de trabajo durante todo el proyecto**.

El enfoque de QA, los escenarios que debían probarse, las herramientas utilizadas y las decisiones sobre qué incluir en el proyecto fueron responsabilidad mía, y aprobé cada cambio antes de guardarlo en Git.

El asistente escribió buena parte del código y ejecutó en el navegador 8 de mis 10 casos manuales y una sesión de exploración libre. Yo ejecuté los otros 2 casos y comprobé en mi propio navegador los hallazgos de esa sesión. Los resultados del asistente se verificaron repitiendo las pruebas antes de aceptarlos.

Como los cambios guardados en Git no indican que hubo IA, dejo documentado aquí el uso que hice de esta herramienta.

### Herramienta de IA del proyecto

La herramienta de IA incluida en el proyecto analiza el archivo que se genera cuando una prueba falla y **sugiere** una posible causa:

- Error del producto.
- Error de la prueba.
- Problema de tiempos.
- Problema relacionado con el sitio.
- No se puede determinar.

La herramienta cuenta con validaciones para comprobar que la respuesta cumpla determinadas reglas y con un filtro para evitar enviar información sensible. La decisión final sobre la causa del fallo siempre corresponde a una persona.

Utiliza el modelo **DeepSeek mediante DeepInfra**, con una clave propia.

La probé utilizando 7 fallos reconstruidos y, en tres ejecuciones, obtuvo respectivamente 5, 3 y 3 aciertos de 7.

Es una muestra pequeña y los resultados pueden variar entre ejecuciones, por lo que no debe interpretarse como una medición definitiva de precisión. El detalle de estas pruebas se encuentra en [`HISTORY.md`](tools/failure-triage/results/HISTORY.md).

## Límites y qué sigue

- **Botones sin nombre:** algunos botones del sitio no tienen un nombre accesible para la automatización, por lo que en determinados casos fue necesario identificarlos mediante su posición. Si el sitio modifica su diseño, estas pruebas podrían requerir ajustes.
- **Un sitio real cambia:** los productos y los tiempos de respuesta pueden variar. Durante las pruebas se presentó una espera superior a 60 segundos que no pudo reproducirse posteriormente, por lo que cuando una prueba falla se realiza un segundo intento.
- **Producto de Netflix en TC-09:** el producto utilizado para este escenario podría dejar de estar disponible en el catálogo. Si esto ocurre, la prueba lo informa mediante un mensaje claro.
- **Sin ejecución automática en un servidor:** no configuré que las pruebas se ejecuten solas en un servidor. Antes de hacerlo sería necesario comprobar si el sitio permite ese tipo de ejecución sin bloquearla.
- **Alcance:** no se incluyeron pruebas específicas para la versión móvil, pruebas de rendimiento ni pruebas de carga.
- **Evaluación de la IA:** la evaluación realizada no incluye fallos reales del producto, por lo que la capacidad de la herramienta para identificar errores reales del producto todavía no ha sido medida.

## Video de la prueba

[ENLACE DEL VIDEO]
