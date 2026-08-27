# psicologo/

Specs que requieren sesión de psicólogo (storageState `playwright/.auth/psicologo.json`).
Corresponde al proyecto Playwright `psicologo`. Cubre el subconjunto de
AdminPanel.tsx visible para este rol (sin Configuración/Reentrenar Modelo/
Backups/Monitoreo/Auditoría ML, que son admin-only).

HU relevantes: HU0005 (acceso restringido), HU0009 (notificaciones de riesgo),
HU0021, HU0022–HU0030 (historial, observaciones, intervenciones, pacientes
asignados, filtrado por riesgo, citas).

**Piloto implementado**: `HU0009/` (CA3, CA6 — notificación y priorización
de casos de riesgo suicida, lado psicólogo). Ver
`docs/e2e-fase3-piloto-informe.md`.

El resto de HU de este proyecto se agrega en siguientes iteraciones.
