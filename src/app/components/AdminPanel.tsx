import { useState, useEffect, useCallback, useRef } from "react";
import { getAccessToken, isAuthenticated, getAuthUser, updateAuthUser } from "@/lib/auth";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import {
  fetchStatistics,
  fetchReports,
  fetchDerivations,
  fetchTrends,
  fetchUsers,
  fetchModelStatus,
  retrainModel,
  fetchStudentHistory,
  fetchAssignedPatients,
  createAppointment,
  createObservation,
  updateObservation,
  fetchChatbotResponses,
  saveChatbotResponse,
  updateChatbotResponse,
  deactivateChatbotResponse,
  updateDerivation,
  updateUserRole,
  updateUserProfile,
  fetchInterventions,
  createIntervention,
  updateIntervention,
  fetchNotifications,
  markNotificationRevisada,
  fetchBackupConfig,
  updateBackupConfig,
  fetchBackupLogs,
  runBackupNow,
  restoreBackup,
  getBackupDownloadUrl,
  fetchDashboardKPIs,
  fetchTrendsAdvanced,
  fetchInterventionsEffectiveness,
  getExcelExportUrl,
  getPdfExportUrl,
  fetchResearcherDataset,
  fetchLiveMonitoring,
  fetchSettings,
  updateSetting,
  fetchMLAudits,
  fetchMLMetrics,
  type Statistics,
  type ReportItem,
  type DerivationItem,
  type StudentHistoryItem,
  type TrendPoint,
  type User,
  type ModelStatus,
  type ObservationResponse,
  type AssignedPatientItem,
  type AppointmentCreateRequest,
  type InterventionResponse,
  type NotificationResponse,
  type BackupConfigResponse,
  type BackupLogItem,
} from "@/lib/api";

interface AdminPanelProps {
  onLogout: () => void;
}

type TabType = "overview" | "analytics" | "reports" | "assigned" | "model" | "users" | "settings" | "backups" | "dashboard" | "monitoring" | "mlaudit" | "exports";

const RISK_LEVEL_OPTIONS = [
  { value: "minimo", label: "Mínimo" },
  { value: "leve", label: "Leve" },
  { value: "moderado", label: "Moderado" },
  { value: "moderadamente_severo", label: "Moderadamente severo" },
  { value: "severo", label: "Severo" },
];

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [derivations, setDerivations] = useState<DerivationItem[]>([]);
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [retrainLoading, setRetrainLoading] = useState(false);
  const [retrainMessage, setRetrainMessage] = useState<string | null>(null);
  const [retrainComparison, setRetrainComparison] = useState<any[] | null>(null);
  const [updatingDerivationId, setUpdatingDerivationId] = useState<string | null>(null);
  const [selectedStudentAnonId, setSelectedStudentAnonId] = useState<string | null>(null);
  const [studentHistory, setStudentHistory] = useState<StudentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [newObservationText, setNewObservationText] = useState("");
  const [selectedObservationId, setSelectedObservationId] = useState<string | null>(null);
  const [selectedObservationEvaluationId, setSelectedObservationEvaluationId] = useState<string | null>(null);
  const [savingObservation, setSavingObservation] = useState(false);

  // Interventions states (HU0027)
  const [interventionsList, setInterventionsList] = useState<InterventionResponse[]>([]);
  const [loadingInterventions, setLoadingInterventions] = useState(false);
  const [newInterventionType, setNewInterventionType] = useState("");
  const [newInterventionDescription, setNewInterventionDescription] = useState("");
  const [newInterventionDate, setNewInterventionDate] = useState("");
  const [selectedInterventionId, setSelectedInterventionId] = useState<string | null>(null);
  const [savingIntervention, setSavingIntervention] = useState(false);

  // Notifications states (HU0029)
  const [notificationsList, setNotificationsList] = useState<NotificationResponse[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(null);
  const [markingRevisada, setMarkingRevisada] = useState<string | null>(null);

  const [assignedPatients, setAssignedPatients] = useState<AssignedPatientItem[]>([]);
  const [loadingAssignedPatients, setLoadingAssignedPatients] = useState(false);
  const [assignedError, setAssignedError] = useState<string | null>(null);
  const [assignedRiskFilters, setAssignedRiskFilters] = useState<string[]>([]);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentStudentAnonId, setAppointmentStudentAnonId] = useState<string | null>(null);
  const [appointmentFechaInicio, setAppointmentFechaInicio] = useState("");
  const [appointmentDuration, setAppointmentDuration] = useState(60);
  const [appointmentDescription, setAppointmentDescription] = useState("");
  const [creatingAppointment, setCreatingAppointment] = useState(false);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);
  const [chatbotResponses, setChatbotResponses] = useState<null | Array<{
    id_respuesta: string;
    clave: string;
    texto: string;
    categoria?: string | null;
    activa: boolean;
    orden?: number | null;
  }>>(null);
  const [selectedChatbotResponseId, setSelectedChatbotResponseId] = useState<string | null>(null);
  const [chatbotClave, setChatbotClave] = useState("");
  const [chatbotTexto, setChatbotTexto] = useState("");
  const [chatbotCategoria, setChatbotCategoria] = useState("");
  const [chatbotActiva, setChatbotActiva] = useState(true);
  const [chatbotOrden, setChatbotOrden] = useState<number | undefined>(undefined);
  const [loadingChatbot, setLoadingChatbot] = useState(false);
  const [savingChatbot, setSavingChatbot] = useState(false);

  const [modelLoading, setModelLoading] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const [profileName, setProfileName] = useState(getAuthUser()?.nombre || "");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(getAuthUser()?.foto_perfil || null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Backup & Restore states (HU0032)
  const [backupConfig, setBackupConfig] = useState<BackupConfigResponse | null>(null);
  const [backupLogs, setBackupLogs] = useState<BackupLogItem[]>([]);
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [runningBackup, setRunningBackup] = useState(false);
  const [restoringBackupId, setRestoringBackupId] = useState<string | null>(null);
  const [backupConfigDirty, setBackupConfigDirty] = useState(false);
  const [savingBackupConfig, setSavingBackupConfig] = useState(false);
  const [backupPeriod, setBackupPeriod] = useState<"diaria" | "semanal" | "mensual" | "manual">("manual");
  const [backupHora, setBackupHora] = useState("02:00");
  const [backupDiaSemana, setBackupDiaSemana] = useState<number>(1);
  const [backupDiaMes, setBackupDiaMes] = useState<number>(1);
  const [backupActivo, setBackupActivo] = useState(false);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);

  // ── Extended Features States (HU0033–HU0045) ──────────────────────────────
  const [dashboardKPIs, setDashboardKPIs] = useState<any>(null);
  const [loadingKPIs, setLoadingKPIs] = useState(false);
  const [kpiStartDate, setKpiStartDate] = useState("");
  const [kpiEndDate, setKpiEndDate] = useState("");

  const [trendsAdvanced, setTrendsAdvanced] = useState<any[]>([]);
  const [loadingTrendsAdv, setLoadingTrendsAdv] = useState(false);
  const [trendsCareer, setTrendsCareer] = useState("");

  const [effectiveness, setEffectiveness] = useState<any[]>([]);
  const [loadingEffectiveness, setLoadingEffectiveness] = useState(false);

  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");
  const [exportCareer, setExportCareer] = useState("");
  const [researcherDataset, setResearcherDataset] = useState<any[]>([]);
  const [loadingResearcher, setLoadingResearcher] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const [liveMonitoring, setLiveMonitoring] = useState<any>(null);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);
  const monitoringInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const [systemSettings, setSystemSettings] = useState<any[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettingId, setSavingSettingId] = useState<string | null>(null);
  const [settingEditValues, setSettingEditValues] = useState<Record<string, string>>({});

  const [mlAudits, setMlAudits] = useState<any[]>([]);
  const [mlMetrics, setMlMetrics] = useState<any[]>([]);
  const [loadingML, setLoadingML] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Por favor selecciona un archivo de imagen válido.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("La imagen debe ser menor a 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      toast.error("El nombre no puede estar vacío.");
      return;
    }
    const token = getAccessToken();
    if (!token) return;
    try {
      setIsSavingProfile(true);
      const updatedUser = await updateUserProfile(token, { nombre: profileName, foto_perfil: profilePhoto });
      updateAuthUser({ nombre: updatedUser.nombre, foto_perfil: updatedUser.foto_perfil });
      toast.success("Perfil actualizado correctamente");
      setIsEditingProfile(false);
    } catch (err) {
      toast.error("Error al actualizar el perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    const user = getAuthUser();
    setProfileName(user?.nombre || "");
    setProfilePhoto(user?.foto_perfil || null);
    setIsEditingProfile(false);
  };

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAccessToken();
      const authUser = getAuthUser();

      if (!token) {
        setError("No hay sesión activa. Inicia sesión de nuevo.");
        return;
      }
      const [stats, reportsData, derivData, trends, modelInfo] = await Promise.all([
        fetchStatistics(token),
        fetchReports(token).catch(() => []),
        fetchDerivations(token).catch(() => []),
        fetchTrends(token).catch(() => []),
        fetchModelStatus(token).catch(() => null),
      ]);

      setStatistics(stats);
      setReports(reportsData);
      setDerivations(derivData);
      setTrendData(trends);
      setModelStatus(modelInfo);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al cargar datos";
      setError(errorMessage);
      
      // If error is related to authentication, force logout (AC2)
      if (errorMessage.toLowerCase().includes("unauthorized") || errorMessage.toLowerCase().includes("token") || errorMessage.includes("401")) {
        onLogout();
      }
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  const loadUsersData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingUsers(true);
      const data = await fetchUsers(token);
      setUsersList(data);
    } catch (err) {
      if (err instanceof Error && err.message === "403_FORBIDDEN") {
        toast.error("Acceso denegado: permisos insuficientes");
        setActiveTab("overview");
      } else {
        toast.error("No se pudo cargar la lista de usuarios.");
      }
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const handleToggleRiskFilter = (level: string) => {
    setAssignedRiskFilters((prev) =>
      prev.includes(level) ? prev.filter((item) => item !== level) : [...prev, level]
    );
  };

  const clearRiskFilters = () => {
    setAssignedRiskFilters([]);
  };

  const openAppointmentModal = (studentAnonId: string) => {
    setAppointmentStudentAnonId(studentAnonId);
    setAppointmentFechaInicio("");
    setAppointmentDuration(60);
    setAppointmentDescription("");
    setAppointmentError(null);
    setIsAppointmentModalOpen(true);
  };

  const closeAppointmentModal = () => {
    setIsAppointmentModalOpen(false);
    setAppointmentStudentAnonId(null);
    setAppointmentError(null);
  };

  const handleCreateAppointment = async () => {
    const token = getAccessToken();
    if (!token || !appointmentStudentAnonId) return;

    if (!appointmentFechaInicio) {
      setAppointmentError("Debes seleccionar fecha y hora de la sesión.");
      return;
    }

    const date = new Date(appointmentFechaInicio);
    if (Number.isNaN(date.getTime())) {
      setAppointmentError("Fecha y hora inválidas.");
      return;
    }

    try {
      setCreatingAppointment(true);
      setAppointmentError(null);
      await createAppointment(token, {
        id_estudiante: appointmentStudentAnonId,
        fecha_inicio: date.toISOString(),
        duracion_minutos: appointmentDuration,
        descripcion: appointmentDescription || undefined,
      });
      toast.success("Sesión programada correctamente.");
      closeAppointmentModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo programar la sesión.";
      setAppointmentError(message);
    } finally {
      setCreatingAppointment(false);
    }
  };

  const loadAssignedPatients = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setAssignedError(null);
      setLoadingAssignedPatients(true);
      const data = await fetchAssignedPatients(token, assignedRiskFilters);
      setAssignedPatients(data);
    } catch (err) {
      console.error("Error cargando pacientes asignados:", err);
      setAssignedError(err instanceof Error ? err.message : "No se pudo cargar la lista de pacientes asignados.");
    } finally {
      setLoadingAssignedPatients(false);
    }
  }, [assignedRiskFilters]);

  const loadModelStatus = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setModelError(null);
      setModelLoading(true);
      const status = await fetchModelStatus(token);
      setModelStatus(status);
    } catch (err) {
      console.error("Error cargando estado del modelo:", err);
      setModelError(err instanceof Error ? err.message : "Error al cargar información del modelo.");
    } finally {
      setModelLoading(false);
    }
  }, []);

  // Backup handlers (HU0032)
  const loadBackupData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingBackup(true);
      const [cfg, logs] = await Promise.all([
        fetchBackupConfig(token),
        fetchBackupLogs(token),
      ]);
      setBackupConfig(cfg);
      setBackupPeriod(cfg.periodicidad);
      setBackupHora(cfg.hora);
      setBackupDiaSemana(cfg.dia_semana ?? 1);
      setBackupDiaMes(cfg.dia_mes ?? 1);
      setBackupActivo(cfg.activo);
      setBackupLogs(logs);
      setBackupConfigDirty(false);
    } catch (err) {
      toast.error("Error al cargar configuración de respaldos.");
    } finally {
      setLoadingBackup(false);
    }
  }, []);

  const handleSaveBackupConfig = async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setSavingBackupConfig(true);
      const updated = await updateBackupConfig(token, {
        periodicidad: backupPeriod,
        hora: backupHora,
        dia_semana: backupPeriod === "semanal" ? backupDiaSemana : undefined,
        dia_mes: backupPeriod === "mensual" ? backupDiaMes : undefined,
        activo: backupActivo,
      });
      setBackupConfig(updated);
      setBackupConfigDirty(false);
      toast.success("Configuración de respaldo guardada correctamente.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar configuración.");
    } finally {
      setSavingBackupConfig(false);
    }
  };

  const handleRunBackup = async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setRunningBackup(true);
      const result = await runBackupNow(token);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      await loadBackupData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al ejecutar el respaldo.");
    } finally {
      setRunningBackup(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setRestoringBackupId(backupId);
      const result = await restoreBackup(token, backupId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
      await loadBackupData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error durante la restauración.");
    } finally {
      setRestoringBackupId(null);
      setConfirmRestoreId(null);
    }
  };

  // ── Extended Feature Loaders ────────────────────────────────────────────────
  const loadDashboardKPIs = useCallback(async (start?: string, end?: string) => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingKPIs(true);
      const [kpis, trendsAdv, eff] = await Promise.all([
        fetchDashboardKPIs(token, start, end),
        fetchTrendsAdvanced(token),
        fetchInterventionsEffectiveness(token),
      ]);
      setDashboardKPIs(kpis);
      setTrendsAdvanced(Array.isArray(trendsAdv) ? trendsAdv : []);
      setEffectiveness(Array.isArray(eff) ? eff : []);
    } catch (err) {
      toast.error("Error al cargar KPIs del dashboard.");
    } finally {
      setLoadingKPIs(false);
    }
  }, []);

  const loadLiveMonitoring = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingMonitoring(true);
      const data = await fetchLiveMonitoring(token);
      setLiveMonitoring(data);
    } catch (err) {
      console.error("Error de monitoreo:", err);
    } finally {
      setLoadingMonitoring(false);
    }
  }, []);

  const loadMLData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingML(true);
      const [audits, metrics] = await Promise.all([
        fetchMLAudits(token),
        fetchMLMetrics(token),
      ]);
      setMlAudits(Array.isArray(audits) ? audits : []);
      setMlMetrics(Array.isArray(metrics) ? metrics : []);
    } catch (err) {
      toast.error("Error al cargar datos ML.");
    } finally {
      setLoadingML(false);
    }
  }, []);

  const loadSystemSettings = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingSettings(true);
      const data = await fetchSettings(token);
      setSystemSettings(Array.isArray(data) ? data : []);
      const initial: Record<string, string> = {};
      (Array.isArray(data) ? data : []).forEach((s: any) => { initial[s.id_config] = s.valor; });
      setSettingEditValues(initial);
    } catch (err) {
      toast.error("Error al cargar configuración del sistema.");
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  const loadResearcherDataset = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingResearcher(true);
      const data = await fetchResearcherDataset(token);
      setResearcherDataset(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Error al cargar dataset de investigación.");
    } finally {
      setLoadingResearcher(false);
    }
  }, []);

  const handleDownloadExcel = async () => {
    const token = getAccessToken();
    if (!token) {
      toast.error("Sesión no iniciada o inválida.");
      return;
    }
    try {
      setDownloadingExcel(true);
      const url = getExcelExportUrl(exportStart || undefined, exportEnd || undefined, exportCareer || undefined);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("No se pudo obtener el archivo del servidor.");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `reporte_mindcheck_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Excel descargado correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al descargar reporte en Excel.");
    } finally {
      setDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    const token = getAccessToken();
    if (!token) {
      toast.error("Sesión no iniciada o inválida.");
      return;
    }
    try {
      setDownloadingPdf(true);
      const url = getPdfExportUrl(exportStart || undefined, exportEnd || undefined, exportCareer || undefined);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("No se pudo obtener el archivo del servidor.");
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `reporte_mindcheck_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("PDF descargado correctamente.");
    } catch (err) {
      console.error(err);
      toast.error("Error al descargar reporte en PDF.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSaveSetting = async (id: string) => {
    const token = getAccessToken();
    if (!token) return;
    const val = settingEditValues[id] ?? "";
    try {
      setSavingSettingId(id);
      const updated = await updateSetting(token, id, val);
      setSystemSettings((prev) => prev.map((s) => s.id_config === id ? updated : s));
      toast.success("Configuración actualizada.");
    } catch (err) {
      toast.error("Error al guardar configuración.");
    } finally {
      setSavingSettingId(null);
    }
  };

  // Effect to load users or model status when tab is opened
  useEffect(() => {
    if (activeTab === "users") { loadUsersData(); }
    if (activeTab === "assigned") { loadAssignedPatients(); }
    if (activeTab === "model") { loadModelStatus(); }
    if (activeTab === "backups") { loadBackupData(); }
    if (activeTab === "dashboard") { loadDashboardKPIs(kpiStartDate || undefined, kpiEndDate || undefined); }
    if (activeTab === "mlaudit") { loadMLData(); }
    if (activeTab === "exports") { loadResearcherDataset(); }
    if (activeTab === "monitoring") {
      loadLiveMonitoring();
      // Refresh live monitoring every 30 seconds
      monitoringInterval.current = setInterval(loadLiveMonitoring, 30000);
      return () => {
        if (monitoringInterval.current) clearInterval(monitoringInterval.current);
      };
    } else {
      if (monitoringInterval.current) { clearInterval(monitoringInterval.current); monitoringInterval.current = null; }
    }
  }, [activeTab, loadUsersData, loadAssignedPatients, loadModelStatus, loadBackupData,
      loadDashboardKPIs, loadMLData, loadResearcherDataset, loadLiveMonitoring,
      kpiStartDate, kpiEndDate]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const token = getAccessToken();
    if (!token) return;
    try {
      await updateUserRole(token, userId, newRole);
      toast.success("Rol actualizado correctamente");
      loadUsersData();
    } catch (err) {
      if (err instanceof Error && err.message === "403_FORBIDDEN") {
        toast.error("Acceso denegado: permisos insuficientes para modificar roles");
      } else {
        toast.error("Error al actualizar el rol.");
      }
    }
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    const token = getAccessToken();
    if (!token) return;
    try {
      await updateUserRole(token, userId, undefined, isActive);
      toast.success(isActive ? "Usuario habilitado" : "Usuario deshabilitado");
      loadUsersData();
    } catch (err) {
      if (err instanceof Error && err.message === "403_FORBIDDEN") {
        toast.error("Acceso denegado: permisos insuficientes para modificar estado");
      } else {
        toast.error("Error al actualizar el estado del usuario.");
      }
    }
  };

  const handleRetrainModel = async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setRetrainLoading(true);
      setRetrainMessage(null);
      setRetrainComparison(null);
      const result = await retrainModel(token, {
        comentario: "Reentrenamiento de modelo iniciado desde el panel administrativo.",
      });
      setRetrainMessage(result.message);
      if (result.comparison) {
        setRetrainComparison(result.comparison);
      }
      setModelStatus({
        model_name: result.model_name,
        version: result.version,
        active_records: result.updated_records,
        last_retrained_at: new Date().toISOString(),
        origen_datos: result.model_name,
        comentario: result.message,
        accuracy: result.comparison?.find(c => c.is_winner)?.accuracy,
        precision: result.comparison?.find(c => c.is_winner)?.precision,
        recall: result.comparison?.find(c => c.is_winner)?.recall,
        f1_score: result.comparison?.find(c => c.is_winner)?.f1_score,
      });
      toast.success("Modelo reentrenado y comparado exitosamente.");
      await loadDashboardData();
    } catch (err) {
      console.error("Retrain error", err);
      const message = err instanceof Error ? err.message : "Error al iniciar el reentrenamiento";
      toast.error(message);
      setRetrainMessage(message);
    } finally {
      setRetrainLoading(false);
    }
  };

  const handleUpdateDerivation = async (derivationId: string, status: string) => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setUpdatingDerivationId(derivationId);
      await updateDerivation(token, derivationId, {
        estado: status,
        accion_tomada:
          status === "contactado"
            ? "Se contactó al estudiante y se coordinó seguimiento inmediato."
            : "Caso atendido por el equipo de psicología universitaria.",
      });
      toast.success(`Caso marcado como ${status}.`);
      await loadDashboardData();
    } catch (err) {
      console.error("Error updating derivation", err);
      toast.error("No se pudo actualizar el estado de la derivación.");
    } finally {
      setUpdatingDerivationId(null);
    }
  };

  const loadStudentInterventions = useCallback(async (token: string, anonId: string) => {
    try {
      setLoadingInterventions(true);
      const list = await fetchInterventions(token, anonId);
      setInterventionsList(list);
    } catch (err) {
      console.error("Error al cargar intervenciones:", err);
      toast.error("No se pudieron cargar las intervenciones del estudiante.");
    } finally {
      setLoadingInterventions(false);
    }
  }, []);

  const loadStudentHistory = useCallback(async (anonId: string) => {
    const token = getAccessToken();
    if (!token) return;

    setHistoryError(null);
    setLoadingHistory(true);
    try {
      const history = await fetchStudentHistory(token, anonId);
      setStudentHistory(history);
      await loadStudentInterventions(token, anonId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar historial del estudiante.";
      setHistoryError(message);
      setStudentHistory([]);
      toast.error(message);
    } finally {
      setLoadingHistory(false);
    }
  }, [loadStudentInterventions]);

  const handleSelectStudentHistory = async (anonId: string) => {
    setSelectedStudentAnonId(anonId);
    await loadStudentHistory(anonId);
  };

  const handleEditObservation = (observation: ObservationResponse) => {
    setSelectedObservationId(String(observation.id_observacion));
    setSelectedObservationEvaluationId(observation.id_evaluacion ? String(observation.id_evaluacion) : null);
    setNewObservationText(observation.texto);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelObservation = () => {
    setSelectedObservationId(null);
    setSelectedObservationEvaluationId(null);
    setNewObservationText("");
  };

  const handleSaveObservation = async () => {
    const token = getAccessToken();
    if (!token || !selectedStudentAnonId) return;
    if (!newObservationText.trim()) {
      toast.error("El texto de la observación no puede estar vacío.");
      return;
    }
    try {
      setSavingObservation(true);
      if (selectedObservationId) {
        await updateObservation(token, selectedObservationId, { texto: newObservationText });
        toast.success("Observación actualizada correctamente.");
      } else {
        await createObservation(token, selectedStudentAnonId, {
          texto: newObservationText,
          id_evaluacion: selectedObservationEvaluationId ?? undefined,
        });
        toast.success("Observación guardada correctamente.");
      }
      setSelectedObservationId(null);
      setSelectedObservationEvaluationId(null);
      setNewObservationText("");
      await loadStudentHistory(selectedStudentAnonId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar observación.";
      toast.error(message);
    } finally {
      setSavingObservation(false);
    }
  };

  const handleClearStudentHistory = () => {
    setSelectedStudentAnonId(null);
    setStudentHistory([]);
    setHistoryError(null);
    setInterventionsList([]);
    setNewInterventionType("");
    setNewInterventionDescription("");
    setNewInterventionDate("");
    setSelectedInterventionId(null);
  };

  const handleEditIntervention = (intervention: InterventionResponse) => {
    setSelectedInterventionId(intervention.id_intervencion);
    setNewInterventionType(intervention.tipo_intervencion);
    setNewInterventionDescription(intervention.descripcion);
    try {
      const d = new Date(intervention.fecha_intervencion);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISODate = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setNewInterventionDate(localISODate);
    } catch (e) {
      setNewInterventionDate("");
    }
  };

  const handleCancelIntervention = () => {
    setSelectedInterventionId(null);
    setNewInterventionType("");
    setNewInterventionDescription("");
    setNewInterventionDate("");
  };

  const handleSaveIntervention = async () => {
    const token = getAccessToken();
    if (!token || !selectedStudentAnonId) return;

    if (!newInterventionType.trim()) {
      toast.error("El tipo de intervención es obligatorio.");
      return;
    }
    if (!newInterventionDescription.trim()) {
      toast.error("La descripción de la intervención es obligatoria.");
      return;
    }
    if (!newInterventionDate) {
      toast.error("La fecha y hora de la intervención es obligatoria.");
      return;
    }

    try {
      setSavingIntervention(true);
      const payloadDate = new Date(newInterventionDate).toISOString();

      if (selectedInterventionId) {
        await updateIntervention(token, selectedInterventionId, {
          tipo_intervencion: newInterventionType,
          descripcion: newInterventionDescription,
          fecha_intervencion: payloadDate,
        });
        toast.success("Intervención actualizada correctamente.");
      } else {
        await createIntervention(token, selectedStudentAnonId, {
          tipo_intervencion: newInterventionType,
          descripcion: newInterventionDescription,
          fecha_intervencion: payloadDate,
        });
        toast.success("Intervención registrada correctamente.");
      }

      handleCancelIntervention();
      const list = await fetchInterventions(token, selectedStudentAnonId);
      setInterventionsList(list);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar la intervención.";
      toast.error(message);
    } finally {
      setSavingIntervention(false);
    }
  };

  // Notification handlers (HU0029)
  const loadNotifications = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingNotifications(true);
      const data = await fetchNotifications(token);
      setNotificationsList(data);
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  const handleMarkRevisada = async (notifId: string) => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setMarkingRevisada(notifId);
      const updated = await markNotificationRevisada(token, notifId, true);
      setNotificationsList((prev) =>
        prev.map((n) => (n.id_notificacion === notifId ? updated : n))
      );
      if (selectedNotification?.id_notificacion === notifId) {
        setSelectedNotification(updated);
      }
      toast.success("Caso marcado como revisado.");
    } catch (err) {
      toast.error("No se pudo actualizar la notificación.");
    } finally {
      setMarkingRevisada(null);
    }
  };

  const loadChatbotResponses = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setLoadingChatbot(true);
      const responses = await fetchChatbotResponses(token);
      setChatbotResponses(responses);
    } catch (err) {
      toast.error("No se pudieron cargar las respuestas del chatbot.");
    } finally {
      setLoadingChatbot(false);
    }
  }, []);

  const handleSelectChatbotResponse = (responseId: string | null) => {
    setSelectedChatbotResponseId(responseId);
    if (!responseId) {
      setChatbotClave("");
      setChatbotTexto("");
      setChatbotCategoria("");
      setChatbotActiva(true);
      setChatbotOrden(undefined);
      return;
    }

    const selected = chatbotResponses?.find((item) => item.id_respuesta === responseId);
    if (!selected) return;

    setChatbotClave(selected.clave);
    setChatbotTexto(selected.texto);
    setChatbotCategoria(selected.categoria || "");
    setChatbotActiva(selected.activa);
    setChatbotOrden(selected.orden ?? undefined);
  };

  const handleSaveChatbotResponse = async () => {
    const token = getAccessToken();
    if (!token) return;
    if (!chatbotClave.trim() || !chatbotTexto.trim()) {
      toast.error("La clave y el texto son obligatorios.");
      return;
    }
    try {
      setSavingChatbot(true);
      if (selectedChatbotResponseId) {
        await updateChatbotResponse(token, selectedChatbotResponseId, {
          clave: chatbotClave,
          texto: chatbotTexto,
          categoria: chatbotCategoria || undefined,
          activa: chatbotActiva,
          orden: chatbotOrden,
        });
        toast.success("Respuesta actualizada correctamente.");
      } else {
        await saveChatbotResponse(token, {
          clave: chatbotClave,
          texto: chatbotTexto,
          categoria: chatbotCategoria || undefined,
          activa: chatbotActiva,
          orden: chatbotOrden,
        });
        toast.success("Respuesta creada correctamente.");
      }
      await loadChatbotResponses();
      handleSelectChatbotResponse(null);
    } catch (err) {
      toast.error("Error al guardar la respuesta del chatbot.");
    } finally {
      setSavingChatbot(false);
    }
  };

  const handleDeactivateChatbotResponse = async (responseId: string) => {
    const token = getAccessToken();
    if (!token) return;
    try {
      await deactivateChatbotResponse(token, responseId);
      toast.success("Respuesta desactivada correctamente.");
      await loadChatbotResponses();
      if (selectedChatbotResponseId === responseId) {
        handleSelectChatbotResponse(null);
      }
    } catch (err) {
      toast.error("Error al desactivar la respuesta del chatbot.");
    }
  };

  useEffect(() => {
    if (activeTab === "settings") {
      loadChatbotResponses();
    }
  }, [activeTab, loadChatbotResponses]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // AC2: Continuous session validation (Route protection)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isAuthenticated()) {
        onLogout();
      }
    }, 5000); // Revisa cada 5 segundos

    // Validar en la montura inicial
    if (!isAuthenticated()) {
      onLogout();
    }

    return () => clearInterval(interval);
  }, [onLogout]);

  const chartData = statistics
    ? [
        { name: "Mínima", value: statistics.riskDistribution.minimal, fill: "#10b981" },
        { name: "Leve", value: statistics.riskDistribution.mild, fill: "#3b82f6" },
        { name: "Moderada", value: statistics.riskDistribution.moderate, fill: "#f59e0b" },
        { name: "Mod. Sev.", value: statistics.riskDistribution.moderatelySevere, fill: "#f97316" },
        { name: "Severa", value: statistics.riskDistribution.severe, fill: "#ef4444" },
      ]
    : [];

  const pendingUrgentCount = derivations.filter(
    (item) => item.prioridad === "urgente" && item.estado === "pendiente"
  ).length;
  const activeDerivationsCount = derivations.filter(
    (item) => item.estado !== "cerrado"
  ).length;

  const sortedDerivations = [...derivations].sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      urgente: 0,
      alto: 1,
      moderado: 2,
    };
    const statusOrder: Record<string, number> = {
      pendiente: 0,
      contactado: 1,
      atendido: 2,
    };

    const priorityComparison = (priorityOrder[a.prioridad] ?? 99) - (priorityOrder[b.prioridad] ?? 99);
    if (priorityComparison !== 0) return priorityComparison;

    const statusComparison = (statusOrder[a.estado] ?? 99) - (statusOrder[b.estado] ?? 99);
    if (statusComparison !== 0) return statusComparison;

    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  const topAlerts = sortedDerivations.slice(0, 3);

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "urgente":
        return "Urgente";
      case "alto":
        return "Alto";
      default:
        return priority.charAt(0).toUpperCase() + priority.slice(1);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-200";
      case "contactado":
        return "bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200";
      case "atendido":
        return "bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  const renderOverview = () => (
    <>
      <div className="space-y-2">
        <h2 className="font-h1 text-h1 text-on-background dark:text-white">Buenos días, Dra. Ana</h2>
        <p className="font-body-lg text-body-lg text-tertiary dark:text-slate-400 max-w-2xl">
          Aquí tienes un resumen de las evaluaciones de bienestar en el campus durante este semestre.
        </p>
      </div>

      {pendingUrgentCount > 0 ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/80 dark:border-red-500/40 dark:bg-red-950/40 p-5 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 uppercase tracking-[0.16em]">
                Alerta urgente
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                Hay {pendingUrgentCount} derivación(es) urgente(s) pendiente(s). Revisa los casos críticos ahora.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("reports")}
              className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
            >
              Ver alertas
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-primary dark:text-blue-400 rounded-lg">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="text-xs font-semibold text-secondary flex items-center gap-1">En vivo</span>
          </div>
          <div className="mt-4">
            <p className="font-label-caps text-label-caps text-slate-500 dark:text-slate-400 uppercase">Total Evaluaciones</p>
            <h3 className="text-3xl font-bold mt-1 dark:text-white">{statistics?.total || 0}</h3>
          </div>
        </div>
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-red-50 dark:bg-red-500/10 text-error dark:text-red-400 rounded-lg">
              <span className="material-symbols-outlined">priority_high</span>
            </div>
            <span className="text-xs font-semibold text-error flex items-center gap-1">Urgente</span>
          </div>
          <div className="mt-4">
            <p className="font-label-caps text-label-caps text-slate-500 dark:text-slate-400 uppercase">Alertas de Riesgo</p>
            <h3 className="text-3xl font-bold mt-1 dark:text-white">
              {statistics ? statistics.riskDistribution.severe + statistics.riskDistribution.moderatelySevere : 0}
            </h3>
          </div>
        </div>
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-green-50 dark:bg-emerald-500/10 text-secondary dark:text-emerald-400 rounded-lg">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">Promedio</span>
          </div>
          <div className="mt-4">
            <p className="font-label-caps text-label-caps text-slate-500 dark:text-slate-400 uppercase">Puntaje PHQ-9</p>
            <h3 className="text-3xl font-bold mt-1 dark:text-white">{statistics?.averageScore.toFixed(1) || "0.0"}/27</h3>
          </div>
        </div>
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg">
              <span className="material-symbols-outlined">history</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">Estimado</span>
          </div>
          <div className="mt-4">
            <p className="font-label-caps text-label-caps text-slate-500 dark:text-slate-400 uppercase">Seguimientos Req.</p>
            <h3 className="text-3xl font-bold mt-1 dark:text-white">
              {statistics ? Math.round((statistics.riskDistribution.moderate + statistics.riskDistribution.moderatelySevere + statistics.riskDistribution.severe) * 0.8) : 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-h2 text-xl font-bold dark:text-white">Distribución de Bienestar</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Desglose de resultados por nivel de riesgo</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 py-1 pl-3 pr-8 focus:ring-primary">
              <option>Todo el tiempo</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.1 }} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-8">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-xs font-semibold dark:text-slate-300">Mínima/Leve</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span className="text-xs font-semibold dark:text-slate-300">Moderada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <span className="text-xs font-semibold dark:text-slate-300">Mod. Severa / Severa</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex-1 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Alertas Críticas Recientes</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Priorización de casos de riesgo alto y suicidio para atención inmediata.</p>
              </div>
              <button
                className="text-xs font-bold text-primary hover:underline"
                onClick={(event) => {
                  event.preventDefault();
                  setActiveTab("reports");
                }}
              >
                Ver todas
              </button>
            </div>
            <div className="space-y-4">
              {topAlerts.length > 0 ? (
                topAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-2xl border p-4 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.prioridad === "urgente" ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"}`}>
                          <span className="material-symbols-outlined text-sm">warning</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                            {getPriorityLabel(alert.prioridad)}
                          </p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {alert.nivel_riesgo.replace(/_/g, " ")}{alert.alerta_suicidio ? " ⚠" : ""}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusBadge(alert.estado)}`}>
                        {alert.estado}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{alert.accion}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        {new Date(alert.fecha).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{alert.institucion ?? "Institución derivada estándar"}</span>
                    </div>
                    {alert.estado === "pendiente" ? (
                      <button
                        type="button"
                        disabled={updatingDerivationId === alert.id}
                        onClick={() => handleUpdateDerivation(alert.id, "contactado")}
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingDerivationId === alert.id ? "Actualizando…" : "Marcar contactado"}
                      </button>
                    ) : alert.estado === "contactado" ? (
                      <button
                        type="button"
                        disabled={updatingDerivationId === alert.id}
                        onClick={() => handleUpdateDerivation(alert.id, "atendido")}
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updatingDerivationId === alert.id ? "Actualizando…" : "Marcar atendido"}
                      </button>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-5 text-sm text-slate-600 dark:text-slate-400">
                  No hay alertas críticas activas en este momento.
                </div>
              )}
            </div>
          </div>

          <div className="bg-primary dark:bg-blue-600 p-6 rounded-2xl text-white shadow-lg shadow-primary/20">
            <h4 className="font-bold mb-2">Asignación de Recursos</h4>
            <p className="text-xs text-blue-100 leading-relaxed mb-4">Tienes {activeDerivationsCount} casos abiertos para seguimiento. Ajusta las citas y el personal según prioridad.</p>
            <button className="w-full py-2 bg-white text-primary dark:text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-50 transition-colors">
              Asignar Consejeros
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold dark:text-white">Nota de Privacidad</h3>
        </div>
        <div className="p-6 text-sm text-slate-600 dark:text-slate-400">
          <p>Todos los datos recopilados son estrictamente anónimos. Los registros individuales de estudiantes no pueden mostrarse para proteger la privacidad del paciente. Los datos mostrados en los gráficos anteriores representan métricas agregadas solo para el monitoreo institucional.</p>
        </div>
      </div>
    </>
  );

  const analyticsTrends =
    trendData.length > 0
      ? trendData
      : [
          { month: "—", promedios: 0, evaluaciones: 0 },
        ];

  const pieData = statistics
    ? [
        {
          name: "Mínima/Leve",
          value: statistics.riskDistribution.minimal + statistics.riskDistribution.mild,
          color: "#10b981",
        },
        {
          name: "Moderada",
          value: statistics.riskDistribution.moderate,
          color: "#f59e0b",
        },
        {
          name: "Severa",
          value:
            statistics.riskDistribution.moderatelySevere + statistics.riskDistribution.severe,
          color: "#ef4444",
        },
      ].filter((d) => d.value > 0)
    : [];

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="space-y-2 mb-8">
        <h2 className="font-h1 text-h1 text-on-background dark:text-white">Analíticas Detalladas</h2>
        <p className="font-body-lg text-body-lg text-tertiary dark:text-slate-400 max-w-2xl">
          Análisis profundo de las tendencias de bienestar estudiantil a lo largo del tiempo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-h2 text-xl font-bold dark:text-white">Tendencia de Evaluaciones (Últimos 6 meses)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Volumen de pruebas tomadas por mes</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsTrends} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEval" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4A90E2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                <Area type="monotone" dataKey="evaluaciones" stroke="#4A90E2" strokeWidth={3} fillOpacity={1} fill="url(#colorEval)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold dark:text-white mb-2">Evolución del Puntaje Promedio</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Promedio de resultados PHQ-9</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.2} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 27]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                <Line type="monotone" dataKey="promedios" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold dark:text-white mb-2">Distribución Histórica</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Proporción de severidad global</p>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} itemStyle={{ color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold dark:text-white">100%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-[10px] font-semibold dark:text-slate-300">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="space-y-2 mb-8">
        <h2 className="font-h1 text-h1 text-on-background dark:text-white">Reportes de Estudiantes</h2>
        <p className="font-body-lg text-body-lg text-tertiary dark:text-slate-400 max-w-2xl">
          Registro de evaluaciones recientes. Recuerde que todos los datos se mantienen anónimos.
        </p>
      </div>

      {selectedStudentAnonId && (
        <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Historial de Evaluación</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{selectedStudentAnonId}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Lista cronológica de evaluaciones previas para este estudiante.</p>
            </div>
            <button
              type="button"
              onClick={handleClearStudentHistory}
              className="self-start rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cerrar historial
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Observations and Clinical History */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <label className="block text-sm font-semibold dark:text-slate-200 mb-2">{selectedObservationId ? "Editar observación" : "Agregar observación"}</label>
                <textarea
                  value={newObservationText}
                  onChange={(e) => setNewObservationText(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Escribe una observación o nota de seguimiento..."
                />
                <div className="mt-3 flex items-center justify-end gap-3">
                  <button
                    onClick={handleCancelObservation}
                    className="text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveObservation}
                    disabled={savingObservation}
                    className="text-sm px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-blue-600 disabled:opacity-50"
                  >
                    {savingObservation ? "Guardando..." : selectedObservationId ? "Actualizar observación" : "Guardar observación"}
                  </button>
                </div>
              </div>

              {loadingHistory ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-500 dark:text-slate-400">
                  Cargando historial...
                </div>
              ) : historyError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
                  {historyError}
                </div>
              ) : studentHistory.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-500 dark:text-slate-400">
                  No se encontraron evaluaciones previas para este estudiante.
                </div>
              ) : (
                <div className="grid gap-4">
                  {studentHistory.map((item) => (
                    <div key={item.fecha + item.nivel_riesgo} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.nivel_riesgo}{item.alerta_suicidio ? " ⚠" : ""}</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(item.fecha).toLocaleDateString("es-PE", { dateStyle: "medium" })}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                        <p>Puntaje: <span className="font-semibold text-slate-900 dark:text-white">{item.puntaje} / 27</span></p>
                        <p>Estado: <span className="font-semibold">{item.estado_evaluacion ?? "No registrado"}</span></p>
                        {item.comentarios && (
                          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.comentarios}</p>
                        )}
                        {item.observaciones && item.observaciones.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Observaciones</p>
                            <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                              {item.observaciones.map((o) => (
                                <li key={(o.id_observacion as string) + o.created_at} className="rounded-lg p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                                  <div className="flex flex-col gap-3">
                                    <div className="text-sm leading-relaxed">{o.texto}</div>
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-[11px] text-slate-400">{new Date(o.created_at).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleEditObservation(o)}
                                        className="text-xs font-semibold text-primary hover:underline"
                                      >
                                        Editar
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Interventions Registration (HU0027) */}
            <div className="lg:col-span-1 space-y-6">
              {/* Form Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-primary dark:text-blue-400">
                  <span className="material-symbols-outlined">psychology</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedInterventionId ? "Editar Intervención" : "Registrar Intervención"}
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {/* Tipo de Intervencion */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Tipo de Intervención <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newInterventionType}
                      onChange={(e) => setNewInterventionType(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">-- Seleccionar Tipo --</option>
                      <option value="Terapia Individual">Terapia Individual</option>
                      <option value="Contención Emocional">Contención Emocional</option>
                      <option value="Derivación Psiquiátrica">Derivación Psiquiátrica</option>
                      <option value="Triage Psicológico">Triage Psicológico</option>
                      <option value="Seguimiento Telefónico">Seguimiento Telefónico</option>
                      <option value="Talleres de Prevención">Talleres de Prevención</option>
                      <option value="Terapia Cognitivo-Conductual">Terapia Cognitivo-Conductual</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Fecha de Intervencion */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Fecha y Hora <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={newInterventionDate}
                      onChange={(e) => setNewInterventionDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Descripcion */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Descripción de la Intervención <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={newInterventionDescription}
                      onChange={(e) => setNewInterventionDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Escribe el detalle clínico de la intervención realizada..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {(selectedInterventionId || newInterventionType || newInterventionDescription || newInterventionDate) && (
                    <button
                      type="button"
                      onClick={handleCancelIntervention}
                      className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Limpiar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveIntervention}
                    disabled={savingIntervention}
                    className="text-xs px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-blue-600 disabled:opacity-50 transition"
                  >
                    {savingIntervention ? "Guardando..." : selectedInterventionId ? "Actualizar" : "Registrar"}
                  </button>
                </div>
              </div>

              {/* Interventions List Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Historial Clínico de Intervenciones</h4>
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300 font-semibold">
                    {interventionsList.length}
                  </span>
                </div>

                {loadingInterventions ? (
                  <p className="text-xs text-slate-500 text-center py-4">Cargando intervenciones...</p>
                ) : interventionsList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 italic">No se han registrado intervenciones para este estudiante.</p>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {interventionsList.map((intv) => (
                      <div
                        key={intv.id_intervencion}
                        className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-xl space-y-2 relative group hover:border-slate-300 dark:hover:border-slate-700 transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-200">
                            {intv.tipo_intervencion}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(intv.fecha_intervencion).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>
                        
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {intv.descripcion}
                        </p>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                          <span>Psicólogo asignado</span>
                          <button
                            type="button"
                            onClick={() => handleEditIntervention(intv)}
                            className="text-primary hover:underline font-bold text-[11px]"
                          >
                            Editar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">ID Anónimo</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Nivel de Riesgo</th>
                <th className="px-6 py-4 font-semibold">Puntaje</th>
                <th className="px-6 py-4 font-semibold">Acción</th>
                <th className="px-6 py-4 font-semibold text-right">Ver historial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hay evaluaciones registradas aún.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr
                    key={r.id_anonimo + r.fecha}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium dark:text-slate-200">{r.id_anonimo}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(r.fecha).toLocaleString("es-PE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.alerta_suicidio
                            ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {r.nivel_riesgo}
                        {r.alerta_suicidio ? " ⚠" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 dark:text-slate-300">
                      {r.puntaje} / 27
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {r.universidad ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelectStudentHistory(r.id_anonimo)}
                        className="text-primary text-xs font-semibold hover:underline"
                      >
                        Ver historial
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAssignedPatients = () => (
    <div className="space-y-6">
      <div className="space-y-2 mb-8">
        <h2 className="font-h1 text-h1 text-on-background dark:text-white">Pacientes Asignados</h2>
        <p className="font-body-lg text-body-lg text-tertiary dark:text-slate-400 max-w-2xl">
          Visualiza los estudiantes que te han sido asignados para seguimiento clínico y accede rápidamente al historial de cada caso.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex flex-wrap gap-2">
          {RISK_LEVEL_OPTIONS.map((option) => {
            const active = assignedRiskFilters.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleToggleRiskFilter(option.value)}
                className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={clearRiskFilters}
          className="text-slate-500 text-xs font-semibold hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Limpiar filtros
        </button>
      </div>

      {loadingAssignedPatients ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-slate-500 dark:text-slate-400">
          Cargando pacientes asignados...
        </div>
      ) : assignedError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 p-6 text-sm">
          {assignedError}
        </div>
      ) : assignedPatients.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-500 dark:text-slate-400">
          {assignedRiskFilters.length > 0
            ? "No se encontraron estudiantes que coincidan con el filtro de riesgo seleccionado."
            : "No tienes estudiantes asignados en este momento."}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID Anónimo</th>
                  <th className="px-6 py-4 font-semibold">Carrera</th>
                  <th className="px-6 py-4 font-semibold">Universidad</th>
                  <th className="px-6 py-4 font-semibold">Última evaluación</th>
                  <th className="px-6 py-4 font-semibold">Nivel de riesgo</th>
                  <th className="px-6 py-4 font-semibold">Puntaje</th>
                  <th className="px-6 py-4 font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignedPatients.map((patient) => (
                  <tr key={patient.id_anonimo + patient.ultima_evaluacion} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 font-medium dark:text-slate-200">{patient.id_anonimo}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{patient.carrera ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{patient.universidad ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(patient.ultima_evaluacion).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.alerta_suicidio ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}>
                        {patient.nivel_riesgo}
                        {patient.alerta_suicidio ? " ⚠" : ""}
                      </span>
                    </td>
                    <td className="px-6 py-4 dark:text-slate-300">{patient.puntaje} / 27</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => openAppointmentModal(patient.id_anonimo)}
                        className="text-primary text-xs font-semibold hover:underline"
                      >
                        Agendar sesión
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectStudentHistory(patient.id_anonimo)}
                        className="text-primary text-xs font-semibold hover:underline"
                      >
                        Ver historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Agendar sesión</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Coordina una nueva sesión para {appointmentStudentAnonId}.
                </p>
              </div>
              <button
                type="button"
                onClick={closeAppointmentModal}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha y hora</label>
                <input
                  type="datetime-local"
                  value={appointmentFechaInicio}
                  onChange={(event) => setAppointmentFechaInicio(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Duración (minutos)</label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={appointmentDuration}
                    onChange={(event) => setAppointmentDuration(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label>
                  <input
                    type="text"
                    value={appointmentDescription}
                    onChange={(event) => setAppointmentDescription(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    placeholder="Breve nota de la sesión"
                  />
                </div>
              </div>

              {appointmentError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{appointmentError}</div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeAppointmentModal}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateAppointment}
                  disabled={creatingAppointment}
                  className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                >
                  {creatingAppointment ? "Programando..." : "Programar sesión"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderModel = () => (
    <div className="space-y-6">
      <div className="space-y-2 mb-8">
        <h2 className="font-h1 text-h1 text-on-background dark:text-white">Reentrenar Modelo</h2>
        <p className="font-body-lg text-body-lg text-tertiary dark:text-slate-400 max-w-2xl">
          Administre el estado del modelo de riesgo y ejecute un reentrenamiento cuando cambien los datos.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 max-w-3xl">
        {modelLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined animate-spin text-3xl mb-4">refresh</span>
            Cargando estado del modelo...
          </div>
        ) : modelError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/40 p-6 text-sm text-red-700 dark:text-red-300">
            {modelError}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Estado del Modelo</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Información sobre la versión actual del modelo y los datos de reentrenamiento.</p>
              </div>
              <button
                onClick={handleRetrainModel}
                disabled={retrainLoading}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {retrainLoading ? "Reentrenando..." : "Reentrenar Modelo"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em]">Modelo</p>
                <p className="mt-2 font-semibold dark:text-white">{modelStatus?.model_name ?? "PHQ-9 Rule-based Engine"}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em]">Versión</p>
                <p className="mt-2 font-semibold dark:text-white">{modelStatus?.version ?? "1.0"}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em]">Registros en base de datos</p>
                <p className="mt-2 font-semibold dark:text-white">{modelStatus?.active_records ?? 0}</p>
              </div>
            </div>

            {modelStatus?.accuracy !== undefined && modelStatus?.accuracy !== null && (
              <div className="mt-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Métricas de Rendimiento (Modelo Ganador Activo)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Accuracy</p>
                    <p className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">{(modelStatus.accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">F1-Score</p>
                    <p className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{modelStatus.f1_score?.toFixed(3)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Precisión</p>
                    <p className="text-xl font-bold mt-1 text-amber-600 dark:text-amber-400">{(modelStatus.precision * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Recall</p>
                    <p className="text-xl font-bold mt-1 text-violet-600 dark:text-violet-400">{(modelStatus.recall * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            )}

            {retrainComparison && (
              <div className="mt-6 p-5 rounded-2xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">done_all</span>
                  Comparativa de Modelos Evaluados en Entrenamiento
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Algoritmo</th>
                        <th className="px-4 py-3 font-semibold">Accuracy</th>
                        <th className="px-4 py-3 font-semibold">F1-Score</th>
                        <th className="px-4 py-3 font-semibold">Precisión</th>
                        <th className="px-4 py-3 font-semibold">Recall</th>
                        <th className="px-4 py-3 font-semibold">Resultado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {retrainComparison.map((item) => (
                        <tr key={item.model_name} className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${item.is_winner ? "bg-emerald-50/30 dark:bg-emerald-950/10 font-medium" : ""}`}>
                          <td className="px-4 py-3 text-slate-900 dark:text-white">{item.model_name}</td>
                          <td className="px-4 py-3 text-slate-650 dark:text-slate-400">{(item.accuracy * 100).toFixed(1)}%</td>
                          <td className="px-4 py-3 text-slate-650 dark:text-slate-400">{item.f1_score.toFixed(3)}</td>
                          <td className="px-4 py-3 text-slate-650 dark:text-slate-400">{(item.precision * 100).toFixed(1)}%</td>
                          <td className="px-4 py-3 text-slate-650 dark:text-slate-400">{(item.recall * 100).toFixed(1)}%</td>
                          <td className="px-4 py-3">
                            {item.is_winner ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                                <span className="material-symbols-outlined text-[14px]">emoji_events</span>
                                Ganador (Activo)
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Evaluado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {modelStatus?.last_retrained_at && (
              <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                Último reentrenamiento: {new Date(modelStatus.last_retrained_at).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
              </div>
            )}
            {modelStatus?.origen_datos && (
              <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Fuente de datos: {modelStatus.origen_datos}
              </div>
            )}
            {retrainMessage && (
              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-700 dark:text-slate-300">
                {retrainMessage}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="space-y-2 mb-8">
        <h2 className="font-h1 text-h1 text-on-background dark:text-white">Gestión de Usuarios</h2>
        <p className="font-body-lg text-body-lg text-tertiary dark:text-slate-400 max-w-2xl">
          Administra los roles y el acceso de los usuarios del sistema. Los cambios se auditarán.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {loadingUsers ? (
          <div className="p-12 text-center text-slate-500">
            <span className="material-symbols-outlined animate-spin text-3xl mb-2">refresh</span>
            <p>Cargando usuarios...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nombre</th>
                  <th className="px-6 py-4 font-semibold">Correo</th>
                  <th className="px-6 py-4 font-semibold">Rol</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No hay usuarios registrados.</td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u.id_usuario} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium dark:text-slate-200">{u.nombre}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{u.correo || "N/A"}</td>
                      <td className="px-6 py-4">
                        <select
                          className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold py-1.5 pl-2 pr-6 focus:ring-primary dark:text-slate-200"
                          value={u.rol}
                          onChange={(e) => handleRoleChange(u.id_usuario, e.target.value)}
                        >
                          <option value="admin">Administrador</option>
                          <option value="psicologo">Psicólogo</option>
                          <option value="estudiante">Estudiante</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={u.activo}
                            onChange={(e) => handleStatusChange(u.id_usuario, e.target.checked)}
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                          <span className="ml-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                            {u.activo ? "Activo" : "Suspendido"}
                          </span>
                        </label>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(u.fecha_registro).toLocaleDateString("es-PE")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="space-y-2 mb-8">
        <h2 className="font-h1 text-h1 text-on-background dark:text-white">Configuración del Portal</h2>
        <p className="font-body-lg text-body-lg text-tertiary dark:text-slate-400 max-w-2xl">
          Administre sus preferencias de cuenta y ajustes de notificaciones.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8 max-w-3xl">
        <h3 className="font-bold dark:text-white text-lg mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Perfil Personal</h3>
        
        <div className="space-y-6 mb-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-500 text-3xl font-bold">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  profileName.charAt(0).toUpperCase() || "U"
                )}
              </div>
              {isEditingProfile && (
                <label className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <span className="material-symbols-outlined text-xl">photo_camera</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-semibold dark:text-slate-300">Nombre Completo</label>
              {isEditingProfile ? (
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)} 
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-primary focus:border-primary transition-all"
                  placeholder="Tu nombre completo"
                />
              ) : (
                <p className="text-lg font-medium dark:text-white">{getAuthUser()?.nombre || "Usuario"}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            {isEditingProfile ? (
              <>
                <button onClick={handleCancelProfile} className="px-4 py-2 text-slate-600 dark:text-slate-400 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  Cancelar
                </button>
                <button onClick={handleSaveProfile} disabled={isSavingProfile} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50">
                  {isSavingProfile ? "Guardando..." : "Guardar Cambios"}
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditingProfile(true)} className="px-6 py-2 border border-slate-200 dark:border-slate-700 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors dark:text-slate-300">
                Editar Perfil
              </button>
            )}
          </div>
        </div>

        <h3 className="font-bold dark:text-white text-lg mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">Preferencias de Alertas</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold dark:text-slate-200">Notificaciones por Email</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Recibe un correo cuando se detecte un caso de riesgo severo.</p>
            </div>
            <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold dark:text-slate-200">Resumen Semanal</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Recibe un reporte estadístico automatizado cada viernes.</p>
            </div>
            <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-white dark:bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="mt-10 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Estado del Modelo</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Información sobre la versión actual del modelo y los datos de reentrenamiento.</p>
            </div>
            <button
              onClick={handleRetrainModel}
              disabled={retrainLoading}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {retrainLoading ? "Reentrenando..." : "Reentrenar Modelo"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em]">Modelo</p>
              <p className="mt-2 font-semibold dark:text-white">{modelStatus?.model_name ?? "PHQ-9 Rule-based Engine"}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em]">Versión</p>
              <p className="mt-2 font-semibold dark:text-white">{modelStatus?.version ?? "1.0"}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em]">Registros anonimizados</p>
              <p className="mt-2 font-semibold dark:text-white">{modelStatus?.active_records ?? 0}</p>
            </div>
          </div>

          {modelStatus?.last_retrained_at && (
            <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Último reentrenamiento: {new Date(modelStatus.last_retrained_at).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
            </div>
          )}
          {modelStatus?.origen_datos && (
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Fuente de datos: {modelStatus.origen_datos}
            </div>
          )}
          {retrainMessage && (
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-700 dark:text-slate-300">
              {retrainMessage}
            </div>
          )}
        </div>

        <div className="mt-10 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Respuestas del Chatbot</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Crea y edita respuestas predeterminadas que el chatbot puede usar en el asistente.</p>
            </div>
            <button
              onClick={() => handleSelectChatbotResponse(null)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              Nueva respuesta
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <table className="min-w-full text-sm text-left">
                  <thead className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-[0.12em]">
                    <tr>
                      <th className="px-3 py-2">Clave</th>
                      <th className="px-3 py-2">Categoría</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loadingChatbot ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Cargando respuestas...</td>
                      </tr>
                    ) : chatbotResponses?.length ? (
                      chatbotResponses.map((item) => (
                        <tr key={item.id_respuesta} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedChatbotResponseId === item.id_respuesta ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}>
                          <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-100">{item.clave}</td>
                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{item.categoria || "General"}</td>
                          <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{item.activa ? "Activo" : "Inactivo"}</td>
                          <td className="px-3 py-3 text-right space-x-2">
                            <button
                              onClick={() => handleSelectChatbotResponse(item.id_respuesta)}
                              className="text-primary text-xs font-semibold hover:underline"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeactivateChatbotResponse(item.id_respuesta)}
                              className="text-red-500 text-xs font-semibold hover:underline"
                            >
                              Desactivar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">No hay respuestas configuradas.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white">Editor de respuesta</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Guarde cambios para actualizar el asistente de apoyo.</p>
              </div>
              <div className="space-y-4">
                <label className="block text-sm text-slate-700 dark:text-slate-300">Clave</label>
                <input
                  value={chatbotClave}
                  onChange={(e) => setChatbotClave(e.target.value)}
                  placeholder="e.g. saludo_inicial"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm text-slate-700 dark:text-slate-300">Texto</label>
                <textarea
                  value={chatbotTexto}
                  onChange={(e) => setChatbotTexto(e.target.value)}
                  rows={4}
                  placeholder="Escribe la respuesta que el chatbot debe usar."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm text-slate-700 dark:text-slate-300">Categoría</label>
                  <input
                    value={chatbotCategoria}
                    onChange={(e) => setChatbotCategoria(e.target.value)}
                    placeholder="e.g. Bienvenida"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm text-slate-700 dark:text-slate-300">Orden</label>
                  <input
                    type="number"
                    value={chatbotOrden ?? ""}
                    onChange={(e) => setChatbotOrden(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={chatbotActiva}
                    onChange={(e) => setChatbotActiva(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  Activa
                </label>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => handleSelectChatbotResponse(null)}
                  className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={handleSaveChatbotResponse}
                  disabled={savingChatbot}
                  className="px-4 py-3 rounded-xl bg-primary text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {savingChatbot ? "Guardando..." : selectedChatbotResponseId ? "Guardar Cambios" : "Crear Respuesta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- HU0032: Render Backup & Restore Tab ---
  const renderBackups = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="font-h1 text-h1 text-on-background dark:text-white">Copias de Seguridad</h2>
        <p className="font-body-lg text-body-lg text-tertiary dark:text-slate-400 max-w-2xl">
          Configure respaldos automáticos, ejecute copias manuales y restaure datos desde un punto de recuperación seguro.
        </p>
      </div>

      {loadingBackup ? (
        <div className="flex items-center justify-center p-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary mr-4">refresh</span>
          <span className="text-slate-500 dark:text-slate-400">Cargando datos de respaldo...</span>
        </div>
      ) : (
        <>
          {/* Scheduling Config Card (CA1) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-primary dark:text-blue-400 rounded-lg">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Programación Automática</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Define cuándo el sistema ejecutará copias automáticamente</p>
                </div>
              </div>
              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{backupActivo ? "Activo" : "Inactivo"}</span>
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors ${backupActivo ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}
                  onClick={() => { setBackupActivo(!backupActivo); setBackupConfigDirty(true); }}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${backupActivo ? "left-7" : "left-1"}`} />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Periodicidad */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Periodicidad</label>
                <select
                  id="backup-periodicidad"
                  value={backupPeriod}
                  onChange={(e) => { setBackupPeriod(e.target.value as typeof backupPeriod); setBackupConfigDirty(true); }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="manual">Manual</option>
                  <option value="diaria">Diaria</option>
                  <option value="semanal">Semanal</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>

              {/* Hora */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Hora de ejecución</label>
                <input
                  id="backup-hora"
                  type="time"
                  value={backupHora}
                  onChange={(e) => { setBackupHora(e.target.value); setBackupConfigDirty(true); }}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Dia semana */}
              {backupPeriod === "semanal" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Día de la semana</label>
                  <select
                    id="backup-dia-semana"
                    value={backupDiaSemana}
                    onChange={(e) => { setBackupDiaSemana(Number(e.target.value)); setBackupConfigDirty(true); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"].map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dia mes */}
              {backupPeriod === "mensual" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Día del mes</label>
                  <input
                    id="backup-dia-mes"
                    type="number"
                    min={1}
                    max={28}
                    value={backupDiaMes}
                    onChange={(e) => { setBackupDiaMes(Number(e.target.value)); setBackupConfigDirty(true); }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            {backupConfig && (
              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Configuración guardada: <span className="font-semibold capitalize">{backupConfig.periodicidad}</span>{" "}
                {backupConfig.periodicidad !== "manual" && <>a las <span className="font-semibold">{backupConfig.hora}</span></>}{" "}
                &mdash; Estado: <span className={`font-semibold ${backupConfig.activo ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}>{backupConfig.activo ? "Activo" : "Inactivo"}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                id="btn-run-backup"
                type="button"
                onClick={handleRunBackup}
                disabled={runningBackup}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <span className={`material-symbols-outlined text-sm ${runningBackup ? "animate-spin" : ""}`}>{runningBackup ? "refresh" : "cloud_upload"}</span>
                {runningBackup ? "Ejecutando..." : "Respaldo Manual Ahora"}
              </button>
              <button
                id="btn-save-backup-config"
                type="button"
                onClick={handleSaveBackupConfig}
                disabled={!backupConfigDirty || savingBackupConfig}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                {savingBackupConfig ? "Guardando..." : "Guardar Programación"}
              </button>
            </div>
          </div>

          {/* Backup History & Restore (CA2 & CA3) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <span className="material-symbols-outlined">history</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Historial de Respaldos</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{backupLogs.length} respaldos registrados &mdash; seleccione uno para restaurar o descargar</p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadBackupData}
                className="p-2 text-slate-400 hover:text-primary dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Actualizar historial"
              >
                <span className="material-symbols-outlined">refresh</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nombre</th>
                    <th className="px-6 py-4 font-semibold">Tipo</th>
                    <th className="px-6 py-4 font-semibold">Fecha</th>
                    <th className="px-6 py-4 font-semibold">Tamaño</th>
                    <th className="px-6 py-4 font-semibold">Estado</th>
                    <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {backupLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined text-4xl block mb-2 text-slate-300">backup</span>
                        No hay respaldos registrados. Ejecuta el primer respaldo usando el botón de arriba.
                      </td>
                    </tr>
                  ) : (
                    backupLogs.map((log) => (
                      <tr key={log.id_backup} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-800 dark:text-slate-200 text-xs font-mono truncate max-w-[200px]" title={log.nombre}>{log.nombre}</p>
                          {log.error_mensaje && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1 truncate max-w-[200px]" title={log.error_mensaje}>{log.error_mensaje}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            log.tipo === "automatico" ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300" :
                            log.tipo === "backup_pre_restore" ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300" :
                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}>
                            {log.tipo === "automatico" ? "Automático" : log.tipo === "backup_pre_restore" ? "Pre-restauración" : "Manual"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                          {new Date(log.fecha_creacion).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                          {log.tamano_bytes ? `${(log.tamano_bytes / 1024).toFixed(1)} KB` : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            log.estado === "completado"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300"
                              : "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300"
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">{log.estado === "completado" ? "check_circle" : "error"}</span>
                            {log.estado === "completado" ? "Completado" : "Fallido"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {log.estado === "completado" && (
                              <>
                                {/* Download */}
                                <a
                                  href={`${getBackupDownloadUrl(log.id_backup)}`}
                                  download={log.nombre}
                                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 font-semibold transition-colors"
                                  title="Descargar respaldo"
                                >
                                  <span className="material-symbols-outlined text-sm">download</span>
                                  Descargar
                                </a>
                                {/* Restore */}
                                {confirmRestoreId === log.id_backup ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">¿Confirmar?</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRestoreBackup(log.id_backup)}
                                      disabled={restoringBackupId === log.id_backup}
                                      className="text-xs px-2.5 py-1 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                      {restoringBackupId === log.id_backup ? "Restaurando..." : "Sí, restaurar"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmRestoreId(null)}
                                      className="text-xs px-2.5 py-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmRestoreId(log.id_backup)}
                                    disabled={restoringBackupId !== null}
                                    className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold transition-colors disabled:opacity-30"
                                    title="Restaurar base de datos a este punto"
                                  >
                                    <span className="material-symbols-outlined text-sm">restore</span>
                                    Restaurar
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Banner */}
          <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 p-5">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 flex-shrink-0">info</span>
              <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <p className="font-semibold">Proceso de restauración seguro</p>
                <p>Antes de restaurar, el sistema crea automáticamente una copia de seguridad preventiva del estado actual. Los respaldos se almacenan en el servidor en formato JSON cifrado. Para transferirlos a almacenamiento externo, use la opción de descarga.</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // \u2500\u2500 HU0037\u201338: Dashboard KPIs \u0026 Tendencias Avanzadas \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const renderDashboard = () => {
    const kpi = dashboardKPIs;
    return (
      <div className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Dashboard Analítico</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">KPIs y tendencias avanzadas del sistema de salud mental universitaria.</p>
        </div>

        {/* Date filter */}
        <div className="flex flex-wrap items-end gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Desde</label>
            <input type="date" value={kpiStartDate} onChange={(e) => setKpiStartDate(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Hasta</label>
            <input type="date" value={kpiEndDate} onChange={(e) => setKpiEndDate(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <button
            onClick={() => loadDashboardKPIs(kpiStartDate || undefined, kpiEndDate || undefined)}
            disabled={loadingKPIs}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loadingKPIs ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : <span className="material-symbols-outlined text-sm">filter_alt</span>}
            Aplicar filtro
          </button>
        </div>

        {/* KPI Cards */}
        {loadingKPIs ? (
          <div className="text-center py-16 text-slate-400"><span className="material-symbols-outlined animate-spin text-4xl">refresh</span><p className="mt-2">Cargando KPIs...</p></div>
        ) : kpi ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Evaluaciones", value: kpi.total_evaluaciones ?? "—", icon: "assignment", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                { label: "Estudiantes Únicos", value: kpi.total_estudiantes_unicos ?? "—", icon: "group", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                { label: "Tasa Riesgo Severo", value: kpi.tasa_riesgo_severo != null ? `${(kpi.tasa_riesgo_severo * 100).toFixed(1)}%` : "—", icon: "warning", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
                { label: "Promedio PHQ-9", value: kpi.promedio_phq9 != null ? kpi.promedio_phq9.toFixed(2) : "—", icon: "psychology", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
              ].map((item) => (
                <div key={item.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.bg}`}>
                    <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{String(item.value)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Distribucion por nivel */}
            {kpi.distribucion_riesgo && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Distribución por Nivel de Riesgo</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={Object.entries(kpi.distribucion_riesgo).map(([k, v]) => ({ name: k, valor: v }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="valor" fill="#4A90E2" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-slate-400">No hay KPIs disponibles.</div>
        )}

        {/* Trends Advanced */}
        {trendsAdvanced.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Tendencias por Carrera / Semana</h3>
            <div className="mb-3">
              <input value={trendsCareer} onChange={(e) => setTrendsCareer(e.target.value)} placeholder="Filtrar carrera..." className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 text-sm w-64" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendsAdvanced.filter((d) => !trendsCareer || d.carrera?.toLowerCase().includes(trendsCareer.toLowerCase()))}>
                <defs>
                  <linearGradient id="colorSevero" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#4A90E2" fill="#4A90E2" fillOpacity={0.1} name="Total" />
                <Area type="monotone" dataKey="severos" stroke="#ef4444" fill="url(#colorSevero)" name="Severos" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Interventions effectiveness */}
        {effectiveness.length > 0 && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Efectividad de Intervenciones</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart layout="vertical" data={effectiveness.slice(0, 8)} margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="tipo_intervencion" type="category" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="mejora_promedio" name="Mejora Promedio (pts)" fill="#10b981" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  // \u2500\u2500 HU0039\u201340: Exportación y Dataset de Investigación \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const renderExports = () => (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Exportación de Datos</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Descarga reportes y accede al dataset anonimizado para investigación.</p>
      </div>

      {/* Export filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-white">Exportar Reportes</h3>
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fecha inicio</label>
            <input type="date" value={exportStart} onChange={(e) => setExportStart(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Fecha fin</label>
            <input type="date" value={exportEnd} onChange={(e) => setExportEnd(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Carrera (opcional)</label>
            <input type="text" value={exportCareer} onChange={(e) => setExportCareer(e.target.value)} placeholder="Ej: Ingeniería"
              className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg px-3 py-2 text-sm w-48" />
          </div>
        </div>
        <div className="flex gap-3 flex-wrap pt-2">
          <button
            onClick={handleDownloadExcel}
            disabled={downloadingExcel}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {downloadingExcel ? "hourglass_empty" : "table_view"}
            </span>
            {downloadingExcel ? "Descargando..." : "Descargar Excel (.xlsx)"}
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              {downloadingPdf ? "hourglass_empty" : "picture_as_pdf"}
            </span>
            {downloadingPdf ? "Descargando..." : "Descargar PDF"}
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">Los archivos se generan en el servidor. Si no se aplican filtros, se exportan todos los registros disponibles.</p>
      </div>

      {/* Researcher dataset */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white">Dataset Anonimizado (Investigación)</h3>
          <button onClick={loadResearcherDataset} disabled={loadingResearcher}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition">
            <span className={`material-symbols-outlined text-sm ${loadingResearcher ? "animate-spin" : ""}`}>refresh</span>
            Recargar
          </button>
        </div>
        {loadingResearcher ? (
          <div className="text-center py-8 text-slate-400"><span className="material-symbols-outlined animate-spin text-3xl">refresh</span></div>
        ) : researcherDataset.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No hay registros disponibles para investigación.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  {Object.keys(researcherDataset[0] || {}).map((k) => (
                    <th key={k} className="px-4 py-3 text-left font-semibold">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {researcherDataset.slice(0, 50).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {Object.values(row).map((val, vi) => (
                      <td key={vi} className="px-4 py-2.5 text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                        {val == null ? "—" : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {researcherDataset.length > 50 && (
              <p className="text-xs text-slate-400 text-center py-3">Mostrando primeros 50 registros de {researcherDataset.length} totales.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // \u2500\u2500 HU0041\u201342: Monitoreo en Vivo y Configuración \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const renderMonitoring = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Monitoreo en Vivo</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Estado del sistema en tiempo real. Se actualiza cada 30 segundos automáticamente.</p>
        </div>
        <button onClick={loadLiveMonitoring} disabled={loadingMonitoring}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-300">
          <span className={`material-symbols-outlined text-sm ${loadingMonitoring ? "animate-spin" : ""}`}>refresh</span>
          Actualizar
        </button>
      </div>

      {loadingMonitoring && !liveMonitoring ? (
        <div className="text-center py-16 text-slate-400"><span className="material-symbols-outlined animate-spin text-4xl">refresh</span><p className="mt-2">Conectando...</p></div>
      ) : liveMonitoring ? (
        <>
          {/* System Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Usuarios Activos (24h)", value: liveMonitoring.usuarios_activos_24h ?? "—", icon: "person", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
              { label: "Evaluaciones Hoy", value: liveMonitoring.evaluaciones_hoy ?? "—", icon: "today", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
              { label: "Alertas Críticas Activas", value: liveMonitoring.alertas_criticas_activas ?? "—", icon: "emergency", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10" },
              { label: "Sesiones Abiertas", value: liveMonitoring.sesiones_abiertas ?? "—", icon: "manage_accounts", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.bg}`}>
                  <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                </div>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{String(item.value)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Live Indicator */}
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 rounded-xl">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
              Sistema operativo · Última actualización: {liveMonitoring.timestamp ? new Date(liveMonitoring.timestamp).toLocaleTimeString("es-PE") : "ahora"}
            </p>
          </div>

          {/* System Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Parámetros del Sistema</h3>
              <button onClick={loadSystemSettings} disabled={loadingSettings}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                <span className={`material-symbols-outlined text-sm ${loadingSettings ? "animate-spin" : ""}`}>refresh</span>
                Cargar configuración
              </button>
            </div>
            {loadingSettings ? (
              <div className="text-center py-8 text-slate-400"><span className="material-symbols-outlined animate-spin text-3xl">refresh</span></div>
            ) : systemSettings.length === 0 ? (
              <button onClick={loadSystemSettings} className="w-full py-6 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline">
                Cargar parámetros de configuración
              </button>
            ) : (
              <div className="space-y-3">
                {systemSettings.map((s: any) => (
                  <div key={s.id_config} className="flex flex-col md:flex-row md:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.clave}</p>
                      {s.descripcion && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{s.descripcion}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        value={settingEditValues[s.id_config] ?? s.valor}
                        onChange={(e) => setSettingEditValues((prev) => ({ ...prev, [s.id_config]: e.target.value }))}
                        className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 text-sm w-48"
                      />
                      <button
                        onClick={() => handleSaveSetting(s.id_config)}
                        disabled={savingSettingId === s.id_config}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                      >
                        {savingSettingId === s.id_config ? "..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-400">No se pudo conectar al sistema de monitoreo.</div>
      )}
    </div>
  );

  // \u2500\u2500 HU0043\u201345: ML Auditoría y Métricas \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
  const renderMLAudit = () => (
    <div className="space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Auditoría ML & Métricas</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Registro de reentrenamientos, métricas de rendimiento y conformidad del modelo de IA.</p>
      </div>

      {loadingML ? (
        <div className="text-center py-16 text-slate-400"><span className="material-symbols-outlined animate-spin text-4xl">refresh</span><p className="mt-2">Cargando datos ML...</p></div>
      ) : (
        <>
          {/* ML Metrics chart */}
          {mlMetrics.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-white mb-4">Evolución de Métricas del Modelo</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={mlMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="version" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val: any) => (typeof val === "number" ? val.toFixed(3) : val)} />
                  <Line type="monotone" dataKey="accuracy" stroke="#4A90E2" name="Accuracy" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="f1_score" stroke="#10b981" name="F1-Score" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="precision" stroke="#f59e0b" name="Precisión" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="recall" stroke="#ef4444" name="Recall" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-3">
                {[{ label: "Accuracy", color: "#4A90E2" }, { label: "F1-Score", color: "#10b981" }, { label: "Precisión", color: "#f59e0b" }, { label: "Recall", color: "#ef4444" }].map((leg) => (
                  <div key={leg.label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="w-3 h-1.5 rounded-full inline-block" style={{ backgroundColor: leg.color }}></span>
                    {leg.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest metrics summary */}
          {mlMetrics.length > 0 && (() => {
            const latest = mlMetrics[mlMetrics.length - 1];
            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Accuracy", value: latest.accuracy != null ? `${(latest.accuracy * 100).toFixed(1)}%` : "—", icon: "check_circle", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
                  { label: "F1-Score", value: latest.f1_score != null ? latest.f1_score.toFixed(3) : "—", icon: "balance", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                  { label: "Precisión", value: latest.precision != null ? `${(latest.precision * 100).toFixed(1)}%` : "—", icon: "target", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
                  { label: "Recall", value: latest.recall != null ? `${(latest.recall * 100).toFixed(1)}%` : "—", icon: "manage_search", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10" },
                ].map((item) => (
                  <div key={item.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.bg}`}>
                      <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                    </div>
                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{item.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.label} (última versión)</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Audit log */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white">Registro de Auditoría (Reentrenamientos)</h3>
              <button onClick={loadMLData} className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                <span className="material-symbols-outlined text-sm">refresh</span> Recargar
              </button>
            </div>
            {mlAudits.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No hay registros de auditoría disponibles.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Versión</th>
                      <th className="px-5 py-3 text-left font-semibold">Fecha</th>
                      <th className="px-5 py-3 text-left font-semibold">Usuario</th>
                      <th className="px-5 py-3 text-left font-semibold">Muestras</th>
                      <th className="px-5 py-3 text-left font-semibold">Comentario</th>
                      <th className="px-5 py-3 text-left font-semibold">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mlAudits.map((audit: any, idx) => (
                      <tr key={audit.id_auditoria ?? idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-blue-600 dark:text-blue-400">{audit.version ?? "—"}</td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400 text-xs">
                          {audit.fecha_reentrenamiento ? new Date(audit.fecha_reentrenamiento).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{audit.usuario_id ?? "Sistema"}</td>
                        <td className="px-5 py-3 text-slate-700 dark:text-slate-300 font-semibold">{audit.muestras_usadas ?? "—"}</td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">{audit.comentario ?? "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            audit.resultado === "exitoso" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300" :
                            audit.resultado === "fallido" ? "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300" :
                            "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                          }`}>
                            <span className="material-symbols-outlined text-[12px]">{audit.resultado === "exitoso" ? "check_circle" : audit.resultado === "fallido" ? "error" : "pending"}</span>
                            {audit.resultado ?? "pendiente"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="font-body-md text-on-background dark:text-slate-300 bg-background dark:bg-slate-950 min-h-screen flex overflow-hidden transition-colors duration-300 relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SideNavBar */}
      <aside className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex fixed md:relative z-50 flex-col h-screen w-64 border-r border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-manrope text-sm p-4 gap-2 transition-colors duration-300 shadow-2xl md:shadow-none`}>
        <div className="flex items-center justify-between px-2 py-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container dark:bg-blue-600/20 flex items-center justify-center text-[#4A90E2] dark:text-blue-400">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#4A90E2] dark:text-blue-400 leading-tight">Portal Admin</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Salud Mental UPC</p>
            </div>
          </div>
          <button 
            className="md:hidden p-1 text-slate-500"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
          {/* Sección Clínica */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Área Clínica</p>
            
            <button 
              onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
              className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "overview" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              {activeTab === "overview" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
              <span className="material-symbols-outlined">dashboard</span>
              <span>Resumen</span>
            </button>

            <button 
              onClick={() => { setActiveTab("assigned"); setIsMobileMenuOpen(false); }}
              className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "assigned" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              {activeTab === "assigned" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
              <span className="material-symbols-outlined">person_search</span>
              <span>Pacientes Asignados</span>
            </button>

            <button 
              onClick={() => { setActiveTab("reports"); setIsMobileMenuOpen(false); }}
              className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "reports" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              {activeTab === "reports" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
              <span className="material-symbols-outlined flex-shrink-0">assignment_ind</span>
              <span className="whitespace-nowrap">Reportes de Estudiantes</span>
            </button>

            {getAuthUser()?.rol === "admin" && (
              <button 
                onClick={() => { setActiveTab("users"); setIsMobileMenuOpen(false); }}
                className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "users" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
              >
                {activeTab === "users" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
                <span className="material-symbols-outlined">manage_accounts</span>
                <span>Gestión de Usuarios</span>
              </button>
            )}
          </div>

          {/* Sección Análisis */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Análisis y Datos</p>

            <button 
              onClick={() => { setActiveTab("analytics"); setIsMobileMenuOpen(false); }}
              className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "analytics" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              {activeTab === "analytics" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
              <span className="material-symbols-outlined">analytics</span>
              <span>Analíticas</span>
            </button>

            {getAuthUser()?.rol === "admin" && (
              <>
                <button
                  id="nav-dashboard"
                  onClick={() => { setActiveTab("dashboard"); setIsMobileMenuOpen(false); }}
                  className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "dashboard" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  {activeTab === "dashboard" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
                  <span className="material-symbols-outlined">bar_chart_4_bars</span>
                  <span>Dashboard KPIs</span>
                </button>
                <button
                  id="nav-exports"
                  onClick={() => { setActiveTab("exports"); setIsMobileMenuOpen(false); }}
                  className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "exports" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  {activeTab === "exports" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
                  <span className="material-symbols-outlined">download</span>
                  <span>Exportar Datos</span>
                </button>
              </>
            )}
          </div>

          {/* Sección Sistema */}
          <div className="space-y-1">
            <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Sistema y ML</p>

            <button 
              onClick={() => { setActiveTab("settings"); setIsMobileMenuOpen(false); }}
              className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "settings" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
            >
              {activeTab === "settings" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
              <span className="material-symbols-outlined">settings</span>
              <span>Configuración</span>
            </button>

            {getAuthUser()?.rol === "admin" && (
              <>
                <button 
                  onClick={() => { setActiveTab("model"); setIsMobileMenuOpen(false); }}
                  className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "model" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  {activeTab === "model" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
                  <span className="material-symbols-outlined">auto_graph</span>
                  <span>Reentrenar Modelo</span>
                </button>
                <button
                  id="nav-backups"
                  onClick={() => { setActiveTab("backups"); setIsMobileMenuOpen(false); }}
                  className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "backups" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  {activeTab === "backups" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
                  <span className="material-symbols-outlined">backup</span>
                  <span>Copias de Seguridad</span>
                </button>
                <button
                  id="nav-monitoring"
                  onClick={() => { setActiveTab("monitoring"); setIsMobileMenuOpen(false); }}
                  className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "monitoring" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  {activeTab === "monitoring" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
                  <span className="material-symbols-outlined">monitor_heart</span>
                  <span className="whitespace-nowrap">Monitoreo en Vivo</span>
                </button>
                <button
                  id="nav-mlaudit"
                  onClick={() => { setActiveTab("mlaudit"); setIsMobileMenuOpen(false); }}
                  className={`relative w-full flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-100 ${activeTab === "mlaudit" ? "bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  {activeTab === "mlaudit" && <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-[#4A90E2]" />}
                  <span className="material-symbols-outlined">model_training</span>
                  <span>Auditoría ML</span>
                </button>
              </>
            )}
          </div>
        </nav>
        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all font-semibold">
            <span className="material-symbols-outlined">logout</span>
            <span>Cerrar Sesión</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-4 mt-2 bg-surface-container-low dark:bg-slate-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-lg overflow-hidden">
              {getAuthUser()?.foto_perfil ? (
                <img src={getAuthUser()?.foto_perfil as string} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                getAuthUser()?.nombre?.substring(0, 2).toUpperCase() || "U"
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate dark:text-slate-200">{getAuthUser()?.nombre}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate capitalize">{getAuthUser()?.rol}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative">
        {/* Header */}
        <header className="sticky top-0 bg-[#F8FAFC]/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-20 transition-colors duration-300">
          <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto font-manrope antialiased tracking-tight">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-2 text-slate-600 dark:text-slate-400"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h1 className="text-xl font-bold text-[#4A90E2] dark:text-blue-400 capitalize">
                {activeTab === "overview" ? "Panel Administrativo" :
                 activeTab === "analytics" ? "Analíticas" :
                 activeTab === "reports" ? "Reportes" :
                 activeTab === "assigned" ? "Pacientes Asignados" :
                 activeTab === "users" ? "Gestión de Usuarios" :
                 activeTab === "model" ? "Reentrenar Modelo" :
                 activeTab === "backups" ? "Copias de Seguridad" :
                 activeTab === "dashboard" ? "Dashboard KPIs" :
                 activeTab === "exports" ? "Exportación de Datos" :
                 activeTab === "monitoring" ? "Monitoreo en Vivo" :
                 activeTab === "mlaudit" ? "Auditoría ML" :
                 "Configuración"}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary dark:bg-emerald-400 animate-pulse"></span>
                Sistema Online
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => document.documentElement.classList.toggle('dark')} 
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-[#4A90E2] dark:hover:text-blue-400 transition-colors duration-200 bg-slate-50 dark:bg-slate-800 rounded-full"
                  title="Alternar tema"
                >
                  <span className="material-symbols-outlined">contrast</span>
                </button>
                <button onClick={loadDashboardData} className="ml-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4A90E2] to-indigo-600 text-white font-button text-button rounded-full active:scale-95 transition-transform shadow-md hover:shadow-lg">
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  <span className="hidden sm:inline font-semibold">Actualizar</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-[calc(100vh-180px)]">
          {loading && activeTab === "overview" ? (
            <div className="text-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-500">
              <span className="material-symbols-outlined animate-spin text-3xl mb-4">refresh</span>
              <p>Cargando estadísticas...</p>
            </div>
          ) : error && activeTab === "overview" ? (
            <div className="text-center p-12 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
              <span className="material-symbols-outlined text-4xl mb-4">error</span>
              <p>Error: {error}</p>
              <button onClick={loadDashboardData} className="mt-4 px-6 py-2 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 rounded-full font-semibold transition-colors">Reintentar</button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "overview" && renderOverview()}
              {activeTab === "analytics" && renderAnalytics()}
              {activeTab === "reports" && renderReports()}
              {activeTab === "assigned" && renderAssignedPatients()}
              {activeTab === "model" && renderModel()}
              {activeTab === "users" && renderUsers()}
              {activeTab === "settings" && renderSettings()}
              {activeTab === "backups" && renderBackups()}
              {activeTab === "dashboard" && renderDashboard()}
              {activeTab === "exports" && renderExports()}
              {activeTab === "monitoring" && renderMonitoring()}
              {activeTab === "mlaudit" && renderMLAudit()}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-auto bg-[#F8FAFC] dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-6 px-8 flex flex-col md:flex-row justify-between items-center w-full gap-4 font-manrope text-xs tracking-wide">
          <p className="text-slate-500 dark:text-slate-400">© 2026 Iniciativa de Salud Mental Universitaria. Para apoyo en crisis, llama al 113.</p>
          <div className="flex gap-6">
            <a className="text-slate-500 dark:text-slate-400 hover:text-[#4A90E2] dark:hover:text-blue-400 transition-colors" href="#">Política de Privacidad</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-[#4A90E2] dark:hover:text-blue-400 transition-colors" href="#">Contactar Soporte</a>
            <a className="text-slate-500 dark:text-slate-400 hover:text-[#4A90E2] dark:hover:text-blue-400 transition-colors" href="#">Términos de Servicio</a>
          </div>
        </footer>
      </main>

      {/* Floating Quick Actions (Mobile) */}
      <button 
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[#4A90E2] to-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all md:hidden z-30"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
    </div>
  );
}
