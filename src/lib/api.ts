/** Base URL del backend FastAPI. En dev usa proxy de Vite si no se define. */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  (import.meta.env.DEV ? "" : "http://localhost:8000");

const LEGACY_PREFIX = "/make-server-d427d5bf";

// Static import of auth functions to avoid mixed import warning
import { getAccessToken as _getAccessToken } from "./auth";

function apiPath(segment: string): string {
  const path = `${LEGACY_PREFIX}${segment}`;
  return API_BASE ? `${API_BASE}${path}` : path;
}

export interface Statistics {
  total: number;
  averageScore: number;
  riskDistribution: {
    minimal: number;
    mild: number;
    moderate: number;
    moderatelySevere: number;
    severe: number;
  };
}

export interface ReportItem {
  id_anonimo: string;
  fecha: string;
  nivel_riesgo: string;
  puntaje: number;
  alerta_suicidio: boolean;
  carrera?: string | null;
  universidad?: string | null;
}

export interface DerivationItem {
  id: string;
  prioridad: string;
  accion: string;
  fecha: string;
  estado: string;
  institucion?: string | null;
  nivel_riesgo: string;
  alerta_suicidio: boolean;
}

export interface DerivationUpdateRequest {
  estado?: string;
  accion_tomada?: string;
  institucion_referencia?: string | null;
}

export interface StudentHistoryItem {
  id_anonimo: string;
  fecha: string;
  nivel_riesgo: string;
  puntaje: number;
  alerta_suicidio: boolean;
  carrera?: string | null;
  universidad?: string | null;
  estado_evaluacion?: string | null;
  comentarios?: string | null;
  observaciones?: ObservationResponse[];
}

export interface StudentEvolutionItem {
  fecha: string;
  puntaje: number;
  nivel_riesgo: string;
  alerta_suicidio: boolean;
}

export interface AssignedPatientItem {
  id_anonimo: string;
  carrera?: string | null;
  universidad?: string | null;
  ultima_evaluacion: string;
  nivel_riesgo: string;
  puntaje: number;
  alerta_suicidio: boolean;
  estado_evaluacion?: string | null;
}

export interface ObservationCreateRequest {
  id_evaluacion?: string | null;
  texto: string;
}

export interface ObservationResponse {
  id_observacion: string;
  id_evaluacion?: string | null;
  id_psicologo?: string | null;
  texto: string;
  created_at: string;
  updated_at?: string | null;
}

export interface SubmitQuestionnaireResult {
  success: boolean;
  id?: string;
  score: number;
  nivel_riesgo?: string;
  alerta_suicidio?: boolean;
  interpretabilidad?: Record<string, any> | null;
}

/** Full wizard payload sent to /questionnaire/submit-questionnaire */
export interface CuestionarioCompletoPayload {
  edad: number;
  genero: string;
  carrera: string;
  universidad: string;
  ciclo: string;
  promedio_ponderado: number;
  situacion_pareja: string;
  convivencia: string;
  distrito_residencia: string;
  trabajo_estudio: string;
  migracion: string;
  horas_sueno: number;
  calidad_sueno: string;
  historia_salud_mental: string;
  mspss_respuestas: number[];
  phq9_respuestas: number[];
  consentimiento_aceptado: boolean;
  test_user_id?: string;
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (typeof data.error === "string") return data.error;
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: { msg?: string }) => d.msg ?? "Error").join(", ");
    }
  } catch {
    /* ignore */
  }
  return `Error del servidor (${response.status})`;
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(apiPath("/health"), { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Submits the complete multi-step questionnaire payload to the backend.
 * Accepts either the old simple array (legacy) or the new full wizard payload.
 */
export async function submitQuestionnaire(
  payload: CuestionarioCompletoPayload | number[]
): Promise<SubmitQuestionnaireResult> {
  // Support legacy callers that still pass a plain responses array
  const body = Array.isArray(payload)
    ? { responses: payload, timestamp: new Date().toISOString() }
    : payload;

  const endpoint = Array.isArray(payload)
    ? apiPath("/submit-questionnaire")
    : `${API_BASE}/api/questionnaire/submit-questionnaire`;

  // Try to get the auth token for authenticated users
  const token = _getAccessToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export interface AuthSession {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    nombre?: string;
    rol: string;
  };
}

export async function loginStudent(payload: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const response = await fetch(apiPath("/login-student"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function loginAdmin(payload: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  const response = await fetch(apiPath("/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function signupStudent(payload: {
  email: string;
  password: string;
  nombre: string;
  edad: number;
  genero?: string;
  carrera?: string;
  universidad?: string;
}): Promise<AuthSession> {
  const response = await fetch(apiPath("/signup-student"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function signupAdmin(payload: {
  email: string;
  password: string;
  name: string;
}): Promise<AuthSession> {
  const response = await fetch(apiPath("/signup"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      name: payload.name,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function forgotPassword(email: string): Promise<{ detail: string }> {
  const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function resetPassword(password: string): Promise<{ detail: string }> {
  const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ new_password: password, access_token: _getAccessToken() || "" }),
  });
  if (!response.ok) {
    throw new Error("Error al restablecer la contraseña. El enlace puede haber expirado.");
  }
  return response.json();
}

// User Management (HU0005)
export interface User {
  id_usuario: string;
  nombre: string;
  foto_perfil?: string | null;
  correo: string;
  rol: string;
  fecha_registro: string;
  activo: boolean;
  estudiante?: {
    edad?: number;
    genero?: string;
    carrera?: string;
    universidad?: string;
  };
}

export async function updateUserProfile(
  token: string,
  payload: {
    nombre: string;
    foto_perfil: string | null;
    edad?: number;
    genero?: string;
    carrera?: string;
    universidad?: string;
  }
): Promise<User> {
  const response = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    if (response.status === 403) throw new Error("403_FORBIDDEN");
    throw new Error(await parseError(response));
  }
  return response.json();
}


export interface ModelStatus {
  model_name: string;
  version: string;
  active_records: number;
  last_retrained_at?: string | null;
  origen_datos?: string | null;
  comentario?: string | null;
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
}

export interface RetrainModelRequest {
  model_name?: string;
  version?: string;
  origen_datos?: string;
  comentario?: string;
}

export interface ModelPerformance {
  model_name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  is_winner: boolean;
}

export interface RetrainModelResponse {
  success: boolean;
  model_name: string;
  version: string;
  previous_version?: string | null;
  updated_records: number;
  message: string;
  comparison?: ModelPerformance[];
}

export async function fetchUsers(token: string): Promise<User[]> {
  const response = await fetch(apiPath("/admin/users"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error("403_FORBIDDEN");
    throw new Error("Error al cargar la lista de usuarios.");
  }
  return response.json();
}

export async function fetchModelStatus(token: string): Promise<ModelStatus> {
  const response = await fetch(apiPath("/admin/model/status"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error("403_FORBIDDEN");
    throw new Error("Error al obtener el estado del modelo.");
  }
  return response.json();
}

export async function retrainModel(token: string, payload: RetrainModelRequest): Promise<RetrainModelResponse> {
  const response = await fetch(apiPath("/admin/model/retrain"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error("403_FORBIDDEN");
    throw new Error(await parseError(response));
  }
  return response.json();
}

export async function updateUserRole(token: string, userId: string, rol?: string, activo?: boolean): Promise<User> {
  const body: any = {};
  if (rol !== undefined) body.rol = rol;
  if (activo !== undefined) body.activo = activo;

  const response = await fetch(apiPath(`/admin/users/${userId}`), {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error("403_FORBIDDEN");
    throw new Error("Error al actualizar el usuario.");
  }
  return response.json();
}

export interface ChatbotResponseItem {
  id_respuesta: string;
  clave: string;
  texto: string;
  categoria?: string | null;
  activa: boolean;
  orden?: number | null;
}

export async function fetchChatbotResponses(
  accessToken: string,
  active = true
): Promise<ChatbotResponseItem[]> {
  const url = new URL(apiPath("/chatbot/responses"), window.location.origin);
  if (active) url.searchParams.set("active", "true");
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function saveChatbotResponse(
  accessToken: string,
  payload: {
    clave: string;
    texto: string;
    categoria?: string;
    activa: boolean;
    orden?: number;
  }
): Promise<ChatbotResponseItem> {
  const response = await fetch(apiPath("/chatbot/responses"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateChatbotResponse(
  accessToken: string,
  responseId: string,
  payload: {
    clave?: string;
    texto?: string;
    categoria?: string;
    activa?: boolean;
    orden?: number;
  }
): Promise<ChatbotResponseItem> {
  const response = await fetch(apiPath(`/chatbot/responses/${responseId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function deactivateChatbotResponse(
  accessToken: string,
  responseId: string
): Promise<void> {
  const response = await fetch(apiPath(`/chatbot/responses/${responseId}`), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function fetchStatistics(
  accessToken: string
): Promise<Statistics> {
  const response = await fetch(apiPath("/statistics"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchReports(accessToken: string): Promise<ReportItem[]> {
  const response = await fetch(apiPath("/reports"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchDerivations(
  accessToken: string
): Promise<DerivationItem[]> {
  const response = await fetch(apiPath("/derivations"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateDerivation(
  accessToken: string,
  derivationId: string,
  payload: DerivationUpdateRequest,
): Promise<DerivationItem> {
  const response = await fetch(apiPath(`/derivations/${derivationId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export interface TrendPoint {
  month: string;
  evaluaciones: number;
  promedios: number;
}

export async function fetchTrends(accessToken: string): Promise<TrendPoint[]> {
  const response = await fetch(apiPath("/trends"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchStudentHistory(
  accessToken: string,
  anonStudentId: string,
): Promise<StudentHistoryItem[]> {
  const response = await fetch(apiPath(`/student-history/${encodeURIComponent(anonStudentId)}`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchStudentEvolution(accessToken: string): Promise<StudentEvolutionItem[]> {
  const response = await fetch(apiPath(`/student/evolution`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function fetchAssignedPatients(accessToken: string, riskLevels?: string[]): Promise<AssignedPatientItem[]> {
  const params = new URLSearchParams();
  if (riskLevels && riskLevels.length > 0) {
    riskLevels.forEach((level) => params.append("risk_levels", level));
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(apiPath(`/admin/assigned-patients${query}`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function createObservation(
  accessToken: string,
  anonStudentId: string,
  payload: { id_evaluacion?: string; texto: string },
): Promise<ObservationItem> {
  const response = await fetch(apiPath(`/student-history/${encodeURIComponent(anonStudentId)}/observations`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export interface AppointmentCreateRequest {
  id_estudiante: string;
  fecha_inicio: string; // ISO
  duracion_minutos?: number;
  descripcion?: string | null;
}

export interface AppointmentResponse {
  id_cita: string;
  id_psicologo: string;
  id_estudiante: string;
  fecha_inicio: string;
  duracion_minutos: number;
  estado: string;
  descripcion?: string | null;
  created_at: string;
}

export async function fetchAppointments(accessToken: string): Promise<AppointmentItem[]> {
  const response = await fetch(apiPath("/admin/appointments"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function createAppointment(
  accessToken: string,
  payload: AppointmentCreateRequest,
): Promise<AppointmentItem> {
  const response = await fetch(apiPath("/admin/appointments"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function updateObservation(
  accessToken: string,
  observationId: string,
  payload: { texto: string },
): Promise<ObservationItem> {
  const response = await fetch(apiPath(`/observations/${encodeURIComponent(observationId)}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}


// --- Clinical Interventions (HU0027) ---
export interface InterventionCreateRequest {
  tipo_intervencion: string;
  descripcion: string;
  fecha_intervencion: string; // ISO
}

export interface InterventionUpdateRequest {
  tipo_intervencion?: string;
  descripcion?: string;
  fecha_intervencion?: string; // ISO
}

export interface InterventionResponse {
  id_intervencion: string;
  id_estudiante: string;
  id_psicologo: string;
  tipo_intervencion: string;
  descripcion: string;
  fecha_intervencion: string;
  created_at: string;
  updated_at?: string | null;
}

export async function fetchInterventions(
  accessToken: string,
  anonStudentId: string
): Promise<InterventionResponse[]> {
  const response = await fetch(apiPath(`/student-history/${encodeURIComponent(anonStudentId)}/interventions`), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function createIntervention(
  accessToken: string,
  anonStudentId: string,
  payload: InterventionCreateRequest
): Promise<InterventionResponse> {
  const response = await fetch(apiPath(`/student-history/${encodeURIComponent(anonStudentId)}/interventions`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function updateIntervention(
  accessToken: string,
  interventionId: string,
  payload: InterventionUpdateRequest
): Promise<InterventionResponse> {
  const response = await fetch(apiPath(`/interventions/${interventionId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}


// --- Clinical Notifications (HU0029) ---
export interface NotificationResponse {
  id_notificacion: string;
  id_psicologo: string;
  id_resultado: string;
  titulo: string;
  mensaje: string;
  nivel_riesgo: string;
  alerta_suicidio: boolean;
  leida: boolean;
  revisada: boolean;
  fecha_revision?: string | null;
  created_at: string;
  // enriched fields
  id_anonimo?: string | null;
  carrera?: string | null;
  universidad?: string | null;
  puntaje?: number | null;
}

export async function fetchNotifications(
  accessToken: string,
  soloNoRevisadas = false
): Promise<NotificationResponse[]> {
  const url = new URL(apiPath("/admin/notifications"), window.location.origin);
  if (soloNoRevisadas) url.searchParams.set("solo_no_revisadas", "true");
  const response = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function markNotificationRevisada(
  accessToken: string,
  notificationId: string,
  revisada = true
): Promise<NotificationResponse> {
  const response = await fetch(
    apiPath(`/admin/notifications/${notificationId}/mark-revisada`),
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ revisada }),
    }
  );
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}


// --- Backup & Restore (HU0032) ---

/** Helper to build direct /api/admin/backups/* paths (not legacy prefix) */
function backupPath(segment: string): string {
  return API_BASE ? `${API_BASE}/api/admin/backups${segment}` : `/api/admin/backups${segment}`;
}

export interface BackupConfigResponse {
  id_config: string;
  periodicidad: "diaria" | "semanal" | "mensual" | "manual";
  hora: string;
  dia_semana?: number | null;
  dia_mes?: number | null;
  activo: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface BackupConfigUpdate {
  periodicidad?: "diaria" | "semanal" | "mensual" | "manual";
  hora?: string;
  dia_semana?: number | null;
  dia_mes?: number | null;
  activo?: boolean;
}

export interface BackupLogItem {
  id_backup: string;
  nombre: string;
  ruta: string;
  tamano_bytes?: number | null;
  estado: "completado" | "fallido";
  fecha_creacion: string;
  tipo: "automatico" | "manual" | "backup_pre_restore";
  error_mensaje?: string | null;
}

export interface BackupRunResult {
  success: boolean;
  message: string;
  backup?: BackupLogItem | null;
}

export interface BackupRestoreResult {
  success: boolean;
  message: string;
}

/** Obtiene la configuración actual de copias de seguridad automáticas (CA1) */
export async function fetchBackupConfig(accessToken: string): Promise<BackupConfigResponse> {
  const response = await fetch(backupPath("/config"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

/** Actualiza la política de respaldos automáticos (CA1) */
export async function updateBackupConfig(
  accessToken: string,
  payload: BackupConfigUpdate
): Promise<BackupConfigResponse> {
  const response = await fetch(backupPath("/config"), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

/** Lista el historial de copias de seguridad (CA2, CA3) */
export async function fetchBackupLogs(accessToken: string): Promise<BackupLogItem[]> {
  const response = await fetch(backupPath(""), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

/** Ejecuta una copia de seguridad manual inmediata (CA1, CA2) */
export async function runBackupNow(accessToken: string): Promise<BackupRunResult> {
  const response = await fetch(backupPath("/run"), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

/** Restaura la base de datos a un punto de restauración seleccionado (CA3) */
export async function restoreBackup(
  accessToken: string,
  backupId: string
): Promise<BackupRestoreResult> {
  const response = await fetch(backupPath(`/${backupId}/restore`), {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

/** Descarga el archivo JSON de un respaldo específico (CA3) */
export function getBackupDownloadUrl(backupId: string): string {
  return backupPath(`/${backupId}/download`);
}

// --- Extended Features (HU0033 - HU0045) ---

function extPath(segment: string): string {
  return API_BASE ? `${API_BASE}/api/admin-ext${segment}` : `/api/admin-ext${segment}`;
}

export async function fetchTcStatus(userId?: string, ip = "127.0.0.1"): Promise<{ version: string; content: string; accepted: boolean; fecha_aceptacion?: string }> {
  let url = `${extPath("/tc-status")}?ip=${ip}`;
  if (userId) url += `&user_id=${userId}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function acceptTc(version: string): Promise<any> {
  const response = await fetch(extPath("/tc-accept"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ version }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchConsentStatus(accessToken: string): Promise<{ version: string; content: string; accepted: boolean; fecha_aceptacion?: string }> {
  const response = await fetch(extPath("/consent-status"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function acceptConsent(accessToken: string, version: string): Promise<any> {
  const response = await fetch(extPath("/consent-accept"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ version }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchConsentHistory(accessToken: string): Promise<any[]> {
  const response = await fetch(extPath("/consent-history"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchDashboardKPIs(
  accessToken: string,
  start?: string,
  end?: string
): Promise<any> {
  let url = extPath("/dashboard-kpis");
  const params = new URLSearchParams();
  if (start) params.set("start_date", start);
  if (end) params.set("end_date", end);
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  const data = await response.json();
  
  // Map backend response to frontend expected structure
  const total = data.total_screenings || 0;
  const severeCount = (data.risk_distribution?.severe || 0);
  const tasaRiesgoSevero = total > 0 ? severeCount / total : 0;
  
  return {
    total_evaluaciones: total,
    total_estudiantes_unicos: data.active_users || 0,
    tasa_riesgo_severo: tasaRiesgoSevero,
    promedio_phq9: data.average_score,
    distribucion_riesgo: {
      "Mínimo": data.risk_distribution?.minimal || 0,
      "Leve": data.risk_distribution?.mild || 0,
      "Moderado": data.risk_distribution?.moderate || 0,
      "Mod. Severo": data.risk_distribution?.moderatelySevere || 0,
      "Severo": severeCount
    }
  };
}

export async function fetchTrendsAdvanced(
  accessToken: string,
  career?: string,
  university?: string
): Promise<any> {
  let url = extPath("/trends-advanced");
  const params = new URLSearchParams();
  if (career) params.set("career", career);
  if (university) params.set("university", university);
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchInterventionsEffectiveness(accessToken: string): Promise<any[]> {
  const response = await fetch(extPath("/interventions/effectiveness"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export function getExcelExportUrl(start?: string, end?: string, career?: string): string {
  let url = extPath("/reports/export/excel");
  const params = new URLSearchParams();
  if (start) params.set("start_date", start);
  if (end) params.set("end_date", end);
  if (career) params.set("career", career);
  if (params.toString()) url += `?${params.toString()}`;
  return url;
}

export function getPdfExportUrl(start?: string, end?: string, career?: string): string {
  let url = extPath("/reports/export/pdf");
  const params = new URLSearchParams();
  if (start) params.set("start_date", start);
  if (end) params.set("end_date", end);
  if (career) params.set("career", career);
  if (params.toString()) url += `?${params.toString()}`;
  return url;
}

export async function fetchResearcherDataset(accessToken: string): Promise<any[]> {
  const response = await fetch(extPath("/researcher/dataset"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchLiveMonitoring(accessToken: string): Promise<any> {
  const response = await fetch(extPath("/monitoring/live"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchSettings(accessToken: string): Promise<any[]> {
  const response = await fetch(extPath("/settings"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function updateSetting(
  accessToken: string,
  id: string,
  valor: string,
  descripcion?: string
): Promise<any> {
  const response = await fetch(`${extPath("/settings")}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ valor, descripcion }),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchMLAudits(accessToken: string): Promise<any[]> {
  const response = await fetch(extPath("/ml/audit"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function fetchMLMetrics(accessToken: string): Promise<any[]> {
  const response = await fetch(extPath("/ml/metrics"), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

// re-export to make getAccessToken available to components consuming from api.ts
export { getAccessToken } from "./auth";

