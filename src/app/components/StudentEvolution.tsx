import React, { useEffect, useState } from "react";
import { fetchStudentEvolution } from "@/lib/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { isAuthenticated, getAccessToken } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, Calendar, BarChart2 } from "lucide-react";

type Point = {
  fecha: string;
  puntaje: number;
  nivel_riesgo: string;
  alerta_suicidio: boolean;
};

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  minimo: { label: "Mínimo", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800" },
  leve: { label: "Leve", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-950/30", border: "border-yellow-200 dark:border-yellow-800" },
  moderado: { label: "Moderado", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800" },
  moderadamente_severo: { label: "Moderadamente severo", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800" },
  severo: { label: "Severo", color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload as Point;
    const risk = RISK_CONFIG[point.nivel_riesgo] || RISK_CONFIG.leve;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xl">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{point.puntaje}<span className="text-sm font-normal text-slate-400">/27</span></p>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${risk.bg} ${risk.color} ${risk.border} border mt-1 inline-block`}>
          {risk.label}
        </span>
        {point.alerta_suicidio && (
          <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
            <AlertTriangle size={10} /> Alerta suicidio
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function StudentEvolution({ onBack }: { onBack: () => void }) {
  const [series, setSeries] = useState<Point[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated()) {
        toast.error("Debes iniciar sesión para ver tu evolución");
        return;
      }

      setLoading(true);
      try {
        const token = getAccessToken();
        const data = await fetchStudentEvolution(token || "");
        const normalized = (data || []).map((p: any) => ({
          fecha: new Date(p.fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
          puntaje: p.puntaje,
          nivel_riesgo: p.nivel_riesgo,
          alerta_suicidio: p.alerta_suicidio,
        }));
        setSeries(normalized);
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "No se pudo cargar la evolución");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Métricas calculadas
  const latestPoint = series.length > 0 ? series[series.length - 1] : null;
  const firstPoint = series.length > 0 ? series[0] : null;
  const trend = latestPoint && firstPoint ? latestPoint.puntaje - firstPoint.puntaje : 0;
  const avgScore = series.length > 0 ? Math.round(series.reduce((a, b) => a + b.puntaje, 0) / series.length) : 0;
  const highRiskCount = series.filter(p => p.nivel_riesgo === "moderado" || p.nivel_riesgo === "moderadamente_severo" || p.nivel_riesgo === "severo").length;
  const latestRisk = RISK_CONFIG[latestPoint?.nivel_riesgo || ""] || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-blue-50/30 dark:from-slate-950 dark:to-slate-900 font-manrope">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="p-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Mi Evolución</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Seguimiento de tus evaluaciones PHQ-9</p>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-500 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400">Cargando tu historial...</p>
          </div>
        )}

        {!loading && series.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Activity size={36} className="text-blue-300 dark:text-blue-700" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Sin evaluaciones aún</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
              Completa tu primera evaluación PHQ-9 para comenzar a ver tu progreso aquí.
            </p>
            <button
              onClick={onBack}
              className="mt-4 bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-600 transition-all"
            >
              Hacer mi primera evaluación
            </button>
          </div>
        )}

        {!loading && series.length > 0 && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Último puntaje */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Último puntaje</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{latestPoint?.puntaje}<span className="text-sm font-normal text-slate-400">/27</span></p>
                {latestRisk && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block border ${latestRisk.bg} ${latestRisk.color} ${latestRisk.border}`}>
                    {latestRisk.label}
                  </span>
                )}
              </div>
              
              {/* Tendencia */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Tendencia</p>
                <div className="flex items-center gap-2 mt-1">
                  {trend < 0 ? (
                    <>
                      <TrendingDown size={28} className="text-emerald-500" />
                      <div>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{Math.abs(trend)} pts</p>
                        <p className="text-xs text-emerald-500">Mejorando</p>
                      </div>
                    </>
                  ) : trend > 0 ? (
                    <>
                      <TrendingUp size={28} className="text-red-500" />
                      <div>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">+{trend} pts</p>
                        <p className="text-xs text-red-500">Aumentando</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Minus size={28} className="text-slate-400" />
                      <div>
                        <p className="text-xl font-bold text-slate-500">Estable</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Promedio */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Promedio</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{avgScore}<span className="text-sm font-normal text-slate-400">/27</span></p>
                <div className="flex items-center gap-1 mt-1">
                  <BarChart2 size={12} className="text-slate-400" />
                  <p className="text-xs text-slate-500">{series.length} evaluaciones</p>
                </div>
              </div>
              
              {/* Alto riesgo */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Alto riesgo</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{highRiskCount}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {highRiskCount === 0 ? "¡Sin evaluaciones de alto riesgo!" : `de ${series.length} evaluaciones`}
                </p>
              </div>
            </div>

            {/* Gráfico de Evolución */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">Evolución del Puntaje PHQ-9</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Seguimiento temporal de tus evaluaciones</p>
                </div>
              </div>
              
              {/* Leyenda de niveles */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-3 h-0.5 bg-green-400" />
                  <span>Mínimo (0-4)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-3 h-0.5 bg-yellow-400" />
                  <span>Leve (5-9)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-3 h-0.5 bg-orange-400" />
                  <span>Moderado (10-14)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="w-3 h-0.5 bg-red-500" />
                  <span>Severo (20+)</span>
                </div>
              </div>

              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <AreaChart data={series} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" className="dark:stroke-slate-700/50" />
                    <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 27]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    {/* Líneas de referencia para niveles */}
                    <ReferenceLine y={5} stroke="#FDE047" strokeDasharray="4 4" strokeWidth={1} />
                    <ReferenceLine y={10} stroke="#FB923C" strokeDasharray="4 4" strokeWidth={1} />
                    <ReferenceLine y={20} stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1} />
                    <Area
                      type="monotone"
                      dataKey="puntaje"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      fill="url(#scoreGradient)"
                      dot={{ fill: "#3B82F6", r: 4, strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: "#3B82F6", stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Historial Detallado */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar size={18} className="text-slate-400" />
                <h2 className="font-semibold text-slate-900 dark:text-white">Historial de Evaluaciones</h2>
              </div>
              <div className="space-y-3">
                {[...series].reverse().map((s, idx) => {
                  const risk = RISK_CONFIG[s.nivel_riesgo] || RISK_CONFIG.leve;
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{s.puntaje}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.fecha}</p>
                          {s.alerta_suicidio && (
                            <p className="text-xs text-rose-500 flex items-center gap-1 mt-0.5">
                              <AlertTriangle size={10} /> Alerta de suicidio
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${risk.bg} ${risk.color} ${risk.border}`}>
                        {risk.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Nota informativa */}
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5">
              <p className="text-sm text-blue-700 dark:text-blue-400 text-center">
                💙 Este historial es privado y está cifrado. Solo tú y los profesionales de salud mental asignados pueden verlo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentEvolution;
