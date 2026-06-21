import React, { useState, useEffect } from "react";
import { getAuthUser, getAccessToken, clearAuthSession, updateAuthUser } from "@/lib/auth";
import { fetchStudentEvolution, updateUserProfile } from "@/lib/api";
import { toast } from "sonner";
import { LogOut, Menu, X, User, Camera } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import { StudentEvolution } from "./StudentEvolution";
import { Support } from "./Support";
import { PrivacyConsentSettings } from "./PrivacyConsentSettings";

type StudentTab = "home" | "evaluation" | "evolution" | "support" | "privacy" | "profile";

interface StudentPanelProps {
  onLogout: () => void;
  onStartEvaluation: () => void;
  onNavigate: (screen: string) => void;
  hasSavedProgress?: boolean;
  lastScore?: number;
  lastRisk?: string;
  activeTabOverride?: StudentTab;
  children?: React.ReactNode;
}

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  minimo: { label: "Mínimo", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-400" },
  leve: { label: "Leve", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800", dot: "bg-yellow-400" },
  moderado: { label: "Moderado", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", dot: "bg-orange-400" },
  moderadamente_severo: { label: "Mod. Severo", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", dot: "bg-red-400" },
  severo: { label: "Severo", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", dot: "bg-rose-500" },
};

const NAV_ITEMS: { tab: StudentTab; icon: string; label: string }[] = [
  { tab: "home", icon: "home", label: "Inicio" },
  { tab: "evaluation", icon: "assignment", label: "Nueva Evaluación" },
  { tab: "evolution", icon: "trending_up", label: "Mi Evolución" },
  { tab: "support", icon: "support_agent", label: "Soporte y Recursos" },
  { tab: "privacy", icon: "lock", label: "Privacidad" },
  { tab: "profile", icon: "manage_accounts", label: "Mi Perfil" },
];

export function StudentPanel({ 
  onLogout, 
  onStartEvaluation, 
  onNavigate, 
  hasSavedProgress = false, 
  lastScore, 
  lastRisk,
  activeTabOverride,
  children
}: StudentPanelProps) {
  const [activeTab, setActiveTab] = useState<StudentTab>("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [evolutionData, setEvolutionData] = useState<any[]>([]);
  const currentTab = activeTabOverride || activeTab;
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const hasChildren = children && React.Children.toArray(children).filter(Boolean).length > 0;

  // Profile edit
  const user = getAuthUser();
  const [profileName, setProfileName] = useState(user?.nombre || "");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.foto_perfil || null);
  const [profileEdad, setProfileEdad] = useState<string>(user?.estudiante?.edad?.toString() || "");
  const [profileGenero, setProfileGenero] = useState(user?.estudiante?.genero || "");
  const [profileCarrera, setProfileCarrera] = useState(user?.estudiante?.carrera || "");
  const [profileUniversidad, setProfileUniversidad] = useState(user?.estudiante?.universidad || "");
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const loadEvolution = async () => {
      const token = getAccessToken();
      if (!token) return;
      setLoadingEvolution(true);
      try {
        const data = await fetchStudentEvolution(token);
        const normalized = (data || []).map((p: any) => ({
          fecha: new Date(p.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
          puntaje: p.puntaje,
          nivel_riesgo: p.nivel_riesgo,
          alerta_suicidio: p.alerta_suicidio,
        }));
        setEvolutionData(normalized);
      } catch {
        // Silent fail
      } finally {
        setLoadingEvolution(false);
      }
    };
    loadEvolution();
  }, [lastScore]);

  const handleSaveProfile = async () => {
    if (!profileName.trim()) { toast.error("El nombre no puede estar vacío."); return; }
    const token = getAccessToken();
    if (!token) return;
    try {
      setIsSavingProfile(true);
      const payload: any = { nombre: profileName, foto_perfil: profilePhoto };
      if (profileEdad) payload.edad = parseInt(profileEdad, 10);
      if (profileGenero) payload.genero = profileGenero;
      if (profileCarrera) payload.carrera = profileCarrera;
      if (profileUniversidad) payload.universidad = profileUniversidad;

      const updatedUser = await updateUserProfile(token, payload);
      updateAuthUser({ 
        nombre: updatedUser.nombre, 
        foto_perfil: updatedUser.foto_perfil,
        estudiante: updatedUser.estudiante
      });
      toast.success("Perfil actualizado correctamente");
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Error al actualizar el perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const latestEval = evolutionData.length > 0 ? evolutionData[evolutionData.length - 1] : null;
  const latestRiskConfig = RISK_CONFIG[latestEval?.nivel_riesgo || lastRisk || ""] || null;

  // ── Home tab ─────────────────────────────────────────────────────────────
  const renderHome = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Greeting */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Hola, {user?.nombre || user?.email?.split("@")[0] || "Estudiante"} 👋
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Aquí puedes seguir tu bienestar emocional. Cada evaluación importa.
        </p>
      </div>

      {/* Progress Banner */}
      {hasSavedProgress && (
        <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">assignment_late</span>
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-white text-sm">Evaluación en progreso</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tienes respuestas guardadas. ¡Retoma desde donde te quedaste!</p>
            </div>
          </div>
          <button
            onClick={() => { setActiveTab("evaluation"); onStartEvaluation(); }}
            className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all active:scale-95"
          >
            Continuar
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Total Evaluaciones</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">{evolutionData.length}</p>
          <p className="text-xs text-slate-400 mt-1">completadas</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Último Puntaje PHQ-9</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {latestEval ? latestEval.puntaje : (typeof lastScore === "number" ? lastScore : "—")}
            {(latestEval || typeof lastScore === "number") && <span className="text-base font-normal text-slate-400">/27</span>}
          </p>
          {latestRiskConfig && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block border ${latestRiskConfig.bg} ${latestRiskConfig.color} ${latestRiskConfig.border}`}>
              {latestRiskConfig.label}
            </span>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Promedio General</p>
          <p className="text-4xl font-bold text-slate-900 dark:text-white">
            {evolutionData.length > 0
              ? Math.round(evolutionData.reduce((a, b) => a + b.puntaje, 0) / evolutionData.length)
              : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-1">de tus evaluaciones</p>
        </div>
      </div>

      {/* Mini Chart */}
      {evolutionData.length > 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Evolución Reciente</h3>
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData.slice(-6)} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="homeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 27]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value: any) => [`${value}/27`, "Puntaje"]}
                />
                <ReferenceLine y={10} stroke="#FB923C" strokeDasharray="3 3" strokeWidth={1} />
                <Area type="monotone" dataKey="puntaje" stroke="#3B82F6" strokeWidth={2} fill="url(#homeGradient)"
                  dot={{ fill: "#3B82F6", r: 3, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 5, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <button
            onClick={() => setActiveTab("evolution")}
            className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
          >
            Ver historial completo
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={onStartEvaluation}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-600 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">quiz</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">Nueva Evaluación</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">PHQ-9 + MSPSS + Datos</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("evolution")}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">trending_up</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">Ver Mi Evolución</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Historial de evaluaciones</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 hover:border-purple-400 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">support_agent</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">Soporte</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Recursos y crisis</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 hover:border-slate-400 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">manage_accounts</span>
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-800 dark:text-white text-sm">Mi Perfil</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Editar datos personales</p>
            </div>
          </button>
        </div>
      </div>

      {/* Crisis CTA */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/20 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-rose-600 dark:text-rose-400">emergency</span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-rose-800 dark:text-rose-300 text-sm">¿Estás en crisis ahora?</p>
          <p className="text-xs text-rose-600 dark:text-rose-400">Si necesitas hablar con alguien de inmediato, llama al 113 (Perú).</p>
        </div>
        <a href="tel:113" className="shrink-0 bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-700 transition-all">
          Llamar al 113
        </a>
      </div>
    </div>
  );

  // ── Profile tab ───────────────────────────────────────────────────────────
  const renderProfile = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Mi Perfil</h2>
        <p className="text-slate-500 dark:text-slate-400">Gestiona tu información personal.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm max-w-lg">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center overflow-hidden">
              {profilePhoto ? (
                <img src={profilePhoto} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">
                  {(profileName || user?.email || "E")[0].toUpperCase()}
                </span>
              )}
            </div>
            {isEditingProfile && (
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera size={14} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) { toast.error("Imagen menor a 2MB"); return; }
                    const reader = new FileReader();
                    reader.onloadend = () => setProfilePhoto(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
              </label>
            )}
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-900 dark:text-white">{user?.nombre || user?.email}</p>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">Estudiante</span>
          </div>
        </div>

        {/* Diagnostic Badge */}
        {latestEval && latestRiskConfig && (
          <div className={`mb-8 p-4 rounded-xl border ${latestRiskConfig.bg} ${latestRiskConfig.border} flex items-start gap-3`}>
            <div className={`p-2 rounded-lg ${latestRiskConfig.badgeBg} ${latestRiskConfig.badgeText}`}>
              <span className="material-symbols-outlined">{latestRiskConfig.icon}</span>
            </div>
            <div>
              <h4 className={`font-bold ${latestRiskConfig.text}`}>
                Estado actual: {latestRiskConfig.label}
              </h4>
              <p className={`text-sm mt-1 ${latestRiskConfig.text} opacity-80`}>
                Según tu evaluación del {latestEval.fecha}. 
                {latestEval.nivel_riesgo.toLowerCase().includes("severo") || latestEval.nivel_riesgo.toLowerCase().includes("moderado") 
                  ? " Te recomendamos revisar la sección de soporte para contactar a un profesional." 
                  : " Recuerda seguir cuidando de tu salud mental periódicamente."}
              </p>
            </div>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">Nombre Completo</label>
            {isEditingProfile ? (
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800">
                {user?.nombre || "—"}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">Correo Electrónico</label>
            <p className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 text-sm">
              {user?.email}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">Edad</label>
              {isEditingProfile ? (
                <input
                  type="number"
                  value={profileEdad}
                  onChange={(e) => setProfileEdad(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800">
                  {user?.estudiante?.edad || "—"}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">Género</label>
              {isEditingProfile ? (
                <select
                  value={profileGenero}
                  onChange={(e) => setProfileGenero(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              ) : (
                <p className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800">
                  {user?.estudiante?.genero || "—"}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">Universidad</label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileUniversidad}
                  onChange={(e) => setProfileUniversidad(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800">
                  {user?.estudiante?.universidad || "—"}
                </p>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block uppercase tracking-wider">Carrera</label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileCarrera}
                  onChange={(e) => setProfileCarrera(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800">
                  {user?.estudiante?.carrera || "—"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          {isEditingProfile ? (
            <>
              <button
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-60"
              >
                {isSavingProfile ? "Guardando..." : "Guardar Cambios"}
              </button>
              <button
                onClick={() => { 
                  setIsEditingProfile(false); 
                  setProfileName(user?.nombre || ""); 
                  setProfilePhoto(user?.foto_perfil || null); 
                  setProfileEdad(user?.estudiante?.edad?.toString() || "");
                  setProfileGenero(user?.estudiante?.genero || "");
                  setProfileCarrera(user?.estudiante?.carrera || "");
                  setProfileUniversidad(user?.estudiante?.universidad || "");
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="flex-1 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 py-2.5 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
            >
              Editar Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-manrope text-slate-800 dark:text-slate-200 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen flex overflow-hidden transition-colors duration-300 relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className={`${isMobileMenuOpen ? "flex" : "hidden"} md:flex fixed md:relative z-50 flex-col h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm p-4 gap-2 transition-colors duration-300 shadow-2xl md:shadow-none`}>
        {/* Logo */}
        <div className="flex items-center justify-between px-2 py-6 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-blue-600 dark:text-blue-400 leading-tight">MindCheck</h2>
              <p className="text-xs text-slate-400 font-medium">Portal Estudiante</p>
            </div>
          </div>
          <button className="md:hidden p-1 text-slate-400" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ tab, icon, label }) => (
            <button
              key={tab}
              onClick={() => { 
                if (activeTabOverride) {
                  if (tab === "home") { onNavigate("student-panel"); setActiveTab("home"); }
                  else if (tab === "evaluation") onStartEvaluation();
                  else if (tab === "evolution") onNavigate("student-evolution");
                  else if (tab === "support") onNavigate("support");
                  else if (tab === "privacy") onNavigate("privacy-consent");
                  else if (tab === "profile") {
                    onNavigate("student-panel");
                    setActiveTab("profile");
                  }
                } else {
                  setActiveTab(tab); 
                  if (tab === "evaluation") onStartEvaluation();
                }
                setIsMobileMenuOpen(false); 
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-150 text-left ${
                currentTab === tab
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* User Info + Logout */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
              {user?.foto_perfil ? (
                <img src={user.foto_perfil} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">
                  {(user?.nombre || user?.email || "E")[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user?.nombre || user?.email}</p>
              <p className="text-xs text-slate-400 capitalize">Estudiante</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all font-semibold"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Top Bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-500 hover:text-primary transition-colors rounded-full">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">MindCheck</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{(user?.nombre || user?.email || "E")[0].toUpperCase()}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 max-w-4xl w-full">
          {hasChildren ? children : (
            <>
              {activeTab === "home" && renderHome()}
              {activeTab === "evaluation" && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nueva Evaluación</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Completa el cuestionario PHQ-9 junto con datos demográficos y escala MSPSS.</p>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm max-w-lg">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl">quiz</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Evaluación de Bienestar</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">El cuestionario consta de 3 secciones: datos personales, escala MSPSS y PHQ-9. Toma aproximadamente 5 minutos.</p>
                    <ul className="space-y-2 mb-8">
                      {["Datos Demográficos y Hábitos", "Escala MSPSS (Apoyo Social)", "PHQ-9 (Depresión)"].map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={onStartEvaluation}
                      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                      Comenzar Evaluación
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "evolution" && (
                <StudentEvolution onBack={() => setActiveTab("home")} />
              )}
              {activeTab === "support" && (
                <Support
                  onBack={() => setActiveTab("home")}
                  onNavigate={onNavigate}
                  onStartEvaluation={onStartEvaluation}
                />
              )}
              {activeTab === "privacy" && (
                <PrivacyConsentSettings onBack={() => setActiveTab("home")} />
              )}
              {activeTab === "profile" && renderProfile()}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentPanel;
