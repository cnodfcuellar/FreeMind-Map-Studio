---
description: Ejecuta la suite completa de regresión y resume el resultado
---
Ejecuta `pnpm test:regression` (Vitest con `--pool=forks`, compatible Windows).
Si algo falla, delega el diagnóstico a @qa-tester sin borrar pruebas existentes.
Al final corre `pnpm lint` y resume: nº de tests, archivos, fallos con causa
y veredicto APTO / NO APTO para respaldo.
