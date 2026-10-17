---
description: Detecta archivos sin tests y delega a test-writer
---
Revisa src/utils, src/hooks y src/components/atoms|molecules.
Lista los archivos que no tienen un test en su carpeta __tests__.
Delega a @test-writer los 3 de mayor prioridad (lógica pura primero)
y al final corre `pnpm test` y resume el resultado.