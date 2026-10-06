# Historial de evaluación

Siete fixtures, extractos reconstruidos de fallos reales vistos al construir esta suite, cada uno con su causa raíz verificada a mano (`fixtures/labels.json`). Una sola llamada por fixture, temperatura 0, modelo `deepseek-ai/DeepSeek-V4-Flash-0731`. Es una muestra pequeña: debe leerse como una ilustración del comportamiento, no como una cifra de precisión.

## En qué se diferencian las corridas

| Corrida | Configuración | Aceptadas por el validador | Correctas |
|---|---|---|---|
| A | `response_format: json_object` | 3/7 | 2/7 |
| B | `json_object` + un reintento ante respuesta vacía | 4/7 | 3/7 |
| C1 | Sin `response_format` (final) | 7/7 | 5/7 |
| C2 | Sin `response_format` (final) | 7/7 | 3/7 |
| C3 | Sin `response_format` (final) | 6/7 | 3/7 |

Las corridas C1 a C3 usan el mismo código y las mismas entradas. La única diferencia son las respuestas del modelo, que aun con temperatura 0 varían.

## Qué falló en A y B, y qué hice

Gran parte de A y B fue rechazada porque el modelo respondió `{}` (los cuatro campos ausentes). El primer diagnóstico fue "falla intermitente del proveedor" y se añadió un reintento (corrida B). Casi no ayudó, así que la causa se midió en lugar de suponerse: 5 llamadas sobre el mismo fixture con el modo `json_object` devolvieron `{}` 5 de 5 veces, y 5 llamadas sin `response_format` devolvieron los cuatro campos 5 de 5 veces. Se quitó el reintento y se eliminó el parámetro. El validador ya comprueba que la respuesta sea JSON válido, así que no se perdió nada.

No se cambió ninguna etiqueta, fixture ni redacción del prompt para mejorar los números. La única edición a los fixtures fue corregir el nombre del test en los fixtures 04 y 05 para que coincida con el test donde realmente ocurrió cada fallo.

## Configuración final, por fixture (3 corridas)

| Fixture | Esperada | Corrida 1 | Corrida 2 | Corrida 3 |
|---|---|---|---|---|
| 01 line items too broad | test_code_issue | correcta | correcta | correcta |
| 02 quantity spinner slow | timing_or_race | test_code_issue | test_code_issue | rechazada por el validador |
| 03 first card changed | timing_or_race | correcta | correcta | correcta |
| 04 confirm pointer events | test_code_issue | timing_or_race | timing_or_race | timing_or_race |
| 05 disabled combobox | test_code_issue | correcta | timing_or_race | timing_or_race |
| 06 timeout, no cause | undetermined | correcta | timing_or_race | timing_or_race |
| 07 cloudflare block | site_or_environment | correcta | correcta | correcta |

## Qué dicen los números

- Estables y correctos en 3 de 3 corridas: fixtures 01, 03 y 07.
- Incorrectos en todas las corridas: 04 y 02. El fixture 04 es el más revelador: el modelo propone un problema de tiempos, cuando la causa real es que el sitio bloquea el botón solo con CSS y el test intentó pulsarlo.
- El fixture 06 casi no contiene información (un timeout de 60 s sin contexto). La respuesta correcta es `undetermined`, y el modelo la dio solo una vez de tres. En las otras dos adivinó `timing_or_race`. Es la razón más fuerte por la que la herramienta solo propone y una persona decide.
- Cuando el validador rechazó una respuesta (corrida 3, fixture 02), cumplió su función: la respuesta se descartó y nunca se mostró como válida.
- No hay un fixture real de `product_bug`. Ninguno de los fallos automatizados fue un defecto del producto, así que esa categoría no está evaluada.
