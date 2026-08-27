# public/

Specs sin sesión iniciada: landing, registro/login (estudiante y staff),
recuperación de contraseña, términos y condiciones, y el cuestionario cuando
se completa de forma anónima. Corresponde al proyecto Playwright `public`
(sin `storageState`).

HU relevantes: HU0001, HU0002, HU0003, HU0004, HU0033/HU0034 (según
convención de numeración de AUDITORIA_TRAZABILIDAD_HU.md), HU0007–HU0012.

**Piloto implementado**: `HU0001/` (registro), `HU0002/` (login), `HU0003/`
(recuperación de contraseña, 2 de 4 CA con SKIP justificado) y `HU0004/`
(logout/sesión/inactividad, estudiante + admin). Ver
`docs/e2e-fase3-piloto-informe.md` para resultados y hallazgos.

El resto de HU de este proyecto se agrega en siguientes iteraciones.
