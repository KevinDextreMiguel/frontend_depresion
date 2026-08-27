# Factibilidad de automatización E2E (Playwright) por criterio de aceptación

**Alcance**: los 152 criterios de aceptación de las 46 HU de MindCheck (misma numeración por
anclaje de contenido que `AUDITORIA_TRAZABILIDAD_HU.md`, en la raíz del repo).
**Objetivo de este documento**: para cada CA, decir si Playwright es la herramienta correcta
para verificarlo automáticamente, parcialmente, o si necesita otra cosa — no diseñar los
tests todavía (eso es la fase siguiente).

No se modificó la aplicación para este análisis. La infraestructura creada (config,
autenticación por rol, estructura de carpetas) está en `frontend/tests/` — ver `tests/README.md`.

---

## 1. Resumen ejecutivo

| Veredicto | Cantidad | % | Significado |
|---|---|---|---|
| ✅ Automatizable | 104 | 68% | Comportamiento 100% observable en el navegador, sin dependencias externas no controlables |
| ⚠️ Parcial | 24 | 16% | Playwright cubre una parte real; falta una pieza fuera de su alcance (email real, tiempo de servidor, contenido exacto de un PDF, etc.) |
| ❌ No aplica a Playwright | 12 | 8% | Requiere otro nivel de prueba (BD, red/TLS, proceso de servidor) o es un juicio subjetivo no verificable por aserción |
| 🚫 No implementado | 12 | 8% | La funcionalidad no existe todavía (confirmado en la auditoría) — no hay nada que automatizar hasta implementarla |

**104 + 24 = 128 de 152 criterios (84%) tienen valor real de automatización con la infraestructura ya creada.**

**Los 5 criterios de mayor prioridad para automatizar primero** (por criticidad clínica/seguridad, no por facilidad):
1. **HU0009** (detección de riesgo suicida) — las 6 CA son la funcionalidad más crítica del sistema; CA1/CA2/CA4/CA6 son ✅ puros, CA3 (notificación al psicólogo) es ✅ con un test multi-contexto (dos sesiones: estudiante envía, psicólogo ve la alerta).
2. **HU0022/HU0023** (historial y observaciones clínicas) — ideales para un test de regresión de seguridad que reproduzca el hallazgo T-002 (IDOR) y falle si alguien lo reintroduce.
3. **HU0038/HU0042/HU0045/HU0046** (paneles analíticos) — el mismatch de contrato de datos (T-006) que encontré manualmente es exactamente el tipo de bug que un E2E automatizado detecta solo con "¿el gráfico tiene puntos o está vacío?", sin lógica compleja.
4. **HU0034/HU0035** (consentimiento/T&C) — valor legal (Ley 29733); conviene un test de regresión para el bypass que corregí (T-011).
5. **HU0002/HU0004** (login/logout/roles) — base de todo lo demás; conviene tenerlos sólidos antes de construir sobre ellos.

**Herramientas complementarias recomendadas para lo que Playwright no cubre**:
- **pytest contra el backend** (con una BD de prueba dedicada) para todo lo marcado ❌ que es de BD/lógica interna (cifrado en reposo, auditoría de accesos, respaldo del artefacto ML).
- **`@axe-core/playwright`** (se integra dentro de Playwright, así que técnicamente sí conviene sumarlo a esta infraestructura) para accesibilidad automatizada — cubre gran parte de HU0012-CA2, aunque no reemplaza una prueba con lector de pantalla real.
- **Un servicio de email de prueba** (Mailosaur, Ethereal, o una bandeja de Gmail dedicada + IMAP) para cerrar HU0003-CA1/CA3/CA4 de punta a punta con el correo real, no solo el mensaje de éxito en la UI.
- **Ambiente de staging aislado con su propia BD** antes de automatizar HU0032/33-CA3 (restauración de respaldo) — nunca correr eso contra datos compartidos.

---

## 2. Criterios de clasificación usados

- **✅ Automatizable**: el resultado esperado es un cambio de UI, una redirección, un mensaje, datos mostrados, o un archivo descargado — todo verificable con `expect(page)`/`expect(locator)` o interceptando la red con `page.route`/`page.waitForResponse`.
- **⚠️ Parcial**: Playwright puede verificar el comportamiento observable en el navegador, pero el criterio tal como está escrito incluye algo que ocurre fuera del navegador (un correo real, un cron de servidor, contenido exacto de un binario) o depende de una funcionalidad hoy incompleta/simulada (ver auditoría) — el test automatizado sería honesto solo si prueba lo que realmente existe, no lo que el enunciado idealmente pide.
- **❌ No aplica a Playwright**: verificar el criterio requiere inspeccionar la base de datos directamente, el tráfico de red a nivel TLS, el sistema de archivos del servidor, o es un juicio subjetivo de lenguaje/diseño sin un oráculo automatizable.
- **🚫 No implementado**: confirmado en `AUDITORIA_TRAZABILIDAD_HU.md` que la funcionalidad no existe (❌) o no tiene sentido de producto todavía — no hay nada que un test pueda ejercitar.

---

## 3. Detalle por sprint

### Sprint 1

| HU | CA | Veredicto | Nota / técnica Playwright |
|---|---|---|---|
| HU0001 | CA1-CA4 | ✅✅✅✅ | Formulario simple; validar mensajes de éxito/error y redirecciones |
| HU0002 | CA1-CA4 | ✅✅✅✅ | CA4 (sesión activa → redirige): usar `storageState` guardado y visitar `/`, verificar auto-redirect |
| HU0003 | CA1 | ⚠️ | Se verifica el mensaje de éxito de la UI; confirmar que el correo *llegó* requiere un servicio de email de prueba |
| HU0003 | CA2 | ✅ | Correo no registrado → mensaje de error, 100% UI |
| HU0003 | CA3 | ⚠️ | Necesita un token de reseteo válido real (viene del correo); se puede obtener programáticamente vía API admin de Supabase en el setup, si se decide invertir en ello |
| HU0003 | CA4 | ✅ | Un token inválido/arbitrario ya dispara el mensaje de "enlace inválido" — no hace falta un enlace realmente expirado para probar esa rama de UI |
| HU0004 | CA1-CA2 | ✅✅ | Logout real + verificar que el panel protegido ya no se renderiza |
| HU0004 | CA3 | ✅ | Usar `page.clock` (Playwright ≥1.45) para adelantar el reloj 15+ min sin esperar en tiempo real |
| HU0034 | CA1-CA3 | ✅✅✅ | Incluye probar que "Rechazar" ahora sí cierra sesión (regresión del fix reciente) |

### Sprint 2

| HU | CA | Veredicto | Nota |
|---|---|---|---|
| HU0005 | CA1 | ✅ | Cambiar rol desde UI admin, verificar persistencia tras recargar |
| HU0005 | CA2 | 🚫 | No existe gestión de "permisos" separada del rol |
| HU0005 | CA3 | ✅ | Verificar que un psicólogo no ve la opción "Gestión de Usuarios"; opcionalmente, verificar 403 llamando la API directo con el fixture `request` |
| HU0005 | CA4 | ❌ | Se escribe auditoría pero no hay UI de consulta (T-013) — nada que verificar en pantalla |
| HU0006 | CA1-CA4 | ✅✅✅✅ | CA3 (foto): `locator.setInputFiles()` |
| HU0007 | CA1 | ⚠️ | "Multidispositivo" real (hardware) no es simulable; sí se puede emular viewport/UA |
| HU0007 | CA2 | ✅ | `use: { viewport }` o el fixture `devices['iPhone 13']` etc. |
| HU0007 | CA3 | ⚠️ | Cubre chromium/firefox/webkit, no dispositivos físicos reales |
| HU0007 | CA4 | ✅ | `context.setOffline(true)` para simular corte de conexión |
| HU0008 | CA1-CA2, CA4 | ✅✅✅ | Interceptar `POST /progress/save` con `page.waitForResponse` |
| HU0008 | CA3 | ⚠️ | Se puede probar el indicador visual, pero (como documenta la auditoría) es optimista — un test honesto debería comparar el indicador contra la respuesta real interceptada, exponiendo la discrepancia en vez de ocultarla |

### Sprint 3

| HU | CA | Veredicto | Nota |
|---|---|---|---|
| HU0009 | CA1, CA2, CA4, CA6 | ✅✅✅✅ | El corazón de la suite: responder el ítem 9 positivo con puntaje total bajo, verificar banner de crisis y orden de prioridad en el panel |
| HU0009 | CA3 | ✅ | Test multi-contexto: `browser.newContext()` para estudiante y otro para psicólogo (con su storageState), verificar que la notificación aparece en el segundo |
| HU0009 | CA5 | ❌ | Registro en `AuditoriaAcceso`/`AuditoriaModelML`, no expuesto en UI |
| HU0010 | CA1, CA4 | ✅✅ | |
| HU0010 | CA2 | ⚠️ | La UI se puede probar; no hay persistencia real que verificar (T-011 relacionado) |
| HU0010 | CA3 | ❌ | "Lenguaje comprensible" es subjetivo |
| HU0011 | CA1-CA4 | ✅✅✅✅ | Cálculos de porcentaje y contadores, todo en DOM |
| HU0012 | CA1 | ❌ | Subjetivo |
| HU0012 | CA2 | ⚠️ | `@axe-core/playwright` detecta violaciones ARIA automáticamente; no reemplaza una prueba con lector de pantalla real |
| HU0012 | CA3 | 🚫 | No implementado |
| HU0012 | CA4 | ❌ | Subjetivo/lingüístico |
| HU0013 | CA1-CA4 | ✅✅✅✅ | Ahora que los eventos del chatbot guiado funcionan (fix reciente), se puede verificar cada mensaje tras cada respuesta |
| HU0014 | — | 🚫 | Bloqueada, sin CA definidos |
| HU0015 | CA1-CA4 | ✅✅✅✅ | Mismo fundamento que HU0013 |
| HU0031 | CA1-CA3 | ❌❌❌ | TLS, contenido cifrado en BD, y gestión de claves — ninguno es observable desde el navegador |
| HU0035 | CA1, CA2, CA3, CA5, CA6 | ✅✅✅✅✅ | CA6: cambiar `consent_version` vía API admin y verificar que se re-muestra el modal |
| HU0035 | CA4 | ⚠️ | Se puede verificar que la UI bloquea el avance si la llamada falla (regresión del fix T-011); verificar que fecha/hora/IP/versión quedaron bien guardadas en la fila de BD requiere una verificación de backend aparte |

### Sprint 4

| HU | CA | Veredicto | Nota |
|---|---|---|---|
| HU0016 | CA1, CA2, CA4 | ✅✅✅ | CRUD simple |
| HU0016 | CA3 | ⚠️ | Es texto libre sin agrupación real; se puede testear que el campo se guarda, no un filtrado que no existe |
| HU0017 | CA1-CA4 | 🚫🚫🚫🚫 | No implementado |
| HU0018 | CA1-CA3 | ⚠️⚠️⚠️ | Ahora visible al psicólogo (fix reciente): se puede verificar que la sección se renderiza con datos, no la correctness científica de la explicación |
| HU0019 | CA1, CA3 | ✅✅ | Ojo: dispara un reentrenamiento real (varios segundos/minutos) — correrlo en CI con moderación |
| HU0019 | CA2 | ❌ | No existe carga controlada de datos que probar |
| HU0019 | CA4 | ❌ | Verificar que el `.joblib` anterior se conservó es un chequeo de filesystem del servidor |
| HU0020 | CA1-CA3 | ✅✅✅ | |
| HU0021 | CA1, CA3 | ✅✅ | |
| HU0021 | CA2 | ⚠️ | Se puede verificar el comportamiento real (polling/refresco), no una garantía de "tiempo real" que no existe |
| HU0032 | CA1 | ⚠️ | Se verifica que la config se guarda; que el cron se ejecute a la hora exacta no es probable en un E2E |
| HU0032 | CA2 | ✅ | Ejecutar backup manual y verificar el registro/notificación |
| HU0032 | CA3 | ⚠️ | Automatizable técnicamente pero **solo contra una BD de prueba aislada** — nunca en un ambiente compartido |

### Sprint 5

| HU | CA | Veredicto | Nota |
|---|---|---|---|
| HU0022 | CA1-CA3 | ✅✅✅ | CA1 ideal para test de regresión de seguridad (T-002/IDOR) con dos psicólogos de prueba |
| HU0023 | CA1, CA3 | ✅✅ | |
| HU0023 | CA2 | ✅ | Incluye test de regresión de autoría (T-007): psicólogo B no puede editar nota de A |
| HU0024 | CA1, CA3 | ✅✅ | |
| HU0024 | CA2 | ⚠️ | Solo existe comparación primer/último punto, no un selector de rango — se testea lo que hay |
| HU0025 | CA1-CA3 | ✅✅✅ | |
| HU0026 | CA1-CA3 | ✅✅✅ | Filtrado real en backend, ideal para verificar vía interceptación de query params |
| HU0033 | CA1 | ⚠️ | Igual que HU0032-CA1 |
| HU0033 | CA2 | ✅ | |
| HU0033 | CA3 | ⚠️ | Igual que HU0032-CA3 — solo en BD aislada |

### Sprint 6

| HU | CA | Veredicto | Nota |
|---|---|---|---|
| HU0027 | CA1 | ⚠️ | Se guarda la cita; "confirmación" real (email) no verificable |
| HU0027 | CA2 | ✅ | Doble reserva en el mismo horario → 409 |
| HU0027 | CA3 | 🚫 | No implementado |
| HU0028 | CA1-CA3 | ✅✅✅ | Ya existe un test manual de referencia en `backend/tests/test_interventions.py` |
| HU0029 | CA1, CA2 | 🚫🚫 | No existe reporte individual por estudiante (T-012) |
| HU0029 | CA3 | ⚠️ | Se puede simular el error forzando un 500 con `page.route`, y verificar el mensaje + reintento |
| HU0030 | CA1-CA3 | ✅✅✅ | Mismo patrón multi-contexto que HU0009-CA3, ahora que el panel de notificaciones existe |
| HU0036 | CA1 | ✅ | |
| HU0036 | CA2 | ❌ | No existe "tiempo real"; nada que verificar como tal |
| HU0036 | CA3 | 🚫 | No implementado |
| HU0037 | CA1 | ✅ | Seleccionar rango de fechas y verificar que cambia el resultado |
| HU0037 | CA2 | 🚫 | No implementado |

### Sprint 7

| HU | CA | Veredicto | Nota |
|---|---|---|---|
| HU0038 | CA1, CA2 | ✅✅ | Justo el tipo de test que hubiera detectado el bug de contrato de datos (T-006) corregido en esta sesión |
| HU0039 | CA1-CA3 | ✅✅✅ | `page.waitForEvent('download')`; se verifica que el archivo se genera y su nombre, no el contenido visual exacto del PDF |
| HU0040 | CA1 | ⚠️ | El rol "investigador" no es alcanzable por ningún flujo de UI (T-003); solo testeable creando la cuenta directo por API si el backend lo permite |
| HU0040 | CA2 | ✅ | Verificar 403 para roles no autorizados |
| HU0041 | CA1-CA3 | ✅✅✅ | Con la salvedad de que "crear" usuario no existe desde el panel — se testea lo que hay (editar rol/activo) |
| HU0042 | CA1 | ⚠️ | Los números son sintéticos; se testea que el panel carga y refresca, no que reflejen uso real |
| HU0042 | CA2 | ✅ | Ahora que las alertas se renderizan (fix reciente), se puede provocar el umbral y verificar que aparecen |
| HU0043 | CA1, CA2 | ✅✅ | Con el fix de agregación de esta sesión |
| HU0044 | CA1 | ❌ | El login no audita nada todavía — no hay nada que verificar |
| HU0044 | CA2 | ⚠️ | Solo verificable indirectamente si existiera una UI de consulta — hoy no la hay |
| HU0044 | CA3 | 🚫 | No implementado |
| HU0045 | CA1, CA2 | ✅✅ | Disparar reentrenamiento/predicción y verificar que aparecen en la tabla de auditoría ML (esa UI sí existe) |
| HU0045 | CA3 | ⚠️ | La tabla se puede probar sin filtros; el backend acepta filtros nuevos pero el frontend aún no los usa |
| HU0046 | CA1, CA2, CA4 | ✅✅✅ | Ahora que no fabrica datos (fix T-005): verificar que se muestran huecos/aviso en vez de valores falsos — excelente test de regresión |
| HU0046 | CA3 | ✅ | Reentrenar y verificar que las métricas se actualizan |

---

## 4. Qué NO automatizar con Playwright (y con qué sí)

| Necesidad | Por qué no es Playwright | Alternativa recomendada |
|---|---|---|
| Cifrado en reposo/tránsito, gestión de claves (HU0031) | No es observable desde el navegador | Test de backend (pytest) que consulte la BD directamente |
| Auditoría de accesos sin UI de lectura (HU0005-CA4, HU0044) | No hay pantalla que renderice el resultado | pytest contra el endpoint una vez exista, o consulta SQL directa en un entorno de prueba |
| Backup del artefacto ML (HU0019-CA4) | Requiere revisar el filesystem del servidor | Script de verificación en el pipeline de despliegue, no E2E |
| Recordatorios/crons reales (HU0026-CA3, HU0032-CA1) | Dependen de tiempo real de servidor, no del reloj del navegador | Test de integración del backend con mocking del scheduler (ej. congelar tiempo con `freezegun` en pytest) |
| Juicios de "lenguaje claro/comprensible/inclusivo" | No hay oráculo automatizable | Revisión editorial humana / checklist de UX writing |
| Correo real entregado (HU0003) | Fuera del navegador | Mailosaur / Ethereal / bandeja IMAP dedicada |

---

## 5. Siguiente paso sugerido

No implementar los 128 automatizables de una sola vez. Sugiero, en este orden, alineado con
el plan de la auditoría (`AUDITORIA_TRAZABILIDAD_HU.md`, sección 5):

1. `e2e/public/auth.spec.ts` — HU0001, HU0002, HU0004, HU0034 (base de todo lo demás).
2. `e2e/estudiante/cuestionario-riesgo-suicida.spec.ts` + su contraparte en `e2e/psicologo/` — HU0009 completa, multi-contexto. Máxima prioridad clínica.
3. Regresiones de seguridad: HU0022/HU0023 (IDOR y autoría) en `e2e/psicologo/`.
4. Paneles analíticos ya corregidos (HU0038, HU0042, HU0045, HU0046) — bajo esfuerzo, alto valor de no-regresión sobre los fixes de esta sesión.
5. El resto, HU por HU, siguiendo el orden de sprints.

Este documento no crea ningún spec todavía — es la base para decidir, contigo, con cuál empezar.
