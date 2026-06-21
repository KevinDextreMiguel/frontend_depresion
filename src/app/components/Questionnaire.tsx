import { useState, useEffect, useCallback } from "react";
import { Menu, X, Loader2, CheckCircle2, RotateCcw, ArrowRight, ArrowLeft } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import {
  PHQ9_QUESTIONS,
  PHQ9_OPTIONS,
  calculatePhq9Score,
  MSPSS_QUESTIONS,
  MSPSS_OPTIONS,
  CALIDAD_SUENIO_OPTIONS,
  HISTORIA_SALUD_MENTAL_OPTIONS,
  GENERO_OPTIONS,
  CICLO_OPTIONS,
  SITUACION_PAREJA_OPTIONS,
  CONVIVENCIA_OPTIONS,
  TRABAJO_ESTUDIO_OPTIONS,
  MIGRACION_OPTIONS
} from "@/lib/phq9";

const QUESTIONNAIRE_ID = "b1990c88-e25f-4a87-8d07-7ff7bd8de693";
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

interface QuestionnaireProps {
  onComplete: (payload: any) => void;
  onBack: () => void;
  onNavigate?: (screen: string) => void;
  isSubmitting?: boolean;
}

export function Questionnaire({
  onComplete,
  onBack,
  onNavigate,
  isSubmitting = false,
}: QuestionnaireProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveIndicatorVisible, setSaveIndicatorVisible] = useState(false);
  const [showRestartDialog, setShowRestartDialog] = useState(false);

  // Build user-specific storage keys so different students don't share progress
  const authUser = getAuthUser();
  const userSuffix = authUser?.id ? `_${authUser.id}` : "";
  const STORAGE_KEY = `mindcheck_phq9_progress${userSuffix}`;
  const SESSION_KEY = `mindcheck_phq9_session${userSuffix}`;

  const [sessionId] = useState<string>(() => {
    try {
      // Clear any anonymous (non-user-specific) session when a user is logged in
      if (authUser?.id) {
        localStorage.removeItem("mindcheck_phq9_session");
        localStorage.removeItem("mindcheck_phq9_progress");
      }
      let id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = authUser?.id || crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      return authUser?.id || crypto.randomUUID();
    }
  });

  // --- Estados del Wizard ---
  const [step, setStep] = useState<number>(0); // 0 = Demográficos, 1 = MSPSS, 2 = PHQ-9

  // Paso 0: Datos Demográficos
  const [demographics, setDemographics] = useState({
    edad: 20,
    genero: "Femenino",
    carrera: "Ingeniería de Sistemas",
    universidad: "UPC",
    ciclo: "5-6",
    promedio_ponderado: 15.0,
    situacion_pareja: "Soltero/a",
    convivencia: "Con familia",
    distrito_residencia: "Santiago de Surco",
    trabajo_estudio: "Solo estudio",
    migracion: "No",
    horas_sueno: 7.0,
    calidad_sueno: "Regular",
    historia_salud_mental: "Nunca"
  });

  // Paso 1: MSPSS
  const [mspssResponses, setMspssResponses] = useState<number[]>(new Array(12).fill(-1));
  const [currentMspssQuestion, setCurrentMspssQuestion] = useState<number>(0);

  // Paso 2: PHQ-9
  const [phq9Responses, setPhq9Responses] = useState<number[]>(new Array(9).fill(-1));
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);

  // --- Sync local storage ---
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        step,
        demographics,
        mspssResponses,
        currentMspssQuestion,
        phq9Responses,
        currentQuestion,
        consentAccepted
      })
    );
  }, [step, demographics, mspssResponses, currentMspssQuestion, phq9Responses, currentQuestion, consentAccepted]);

  // --- Auto-guardado en el backend ---
  const saveProgressToBackend = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/questionnaire/progress/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          cuestionario_id: QUESTIONNAIRE_ID,
          pregunta_actual: step, // Guardamos el paso actual
          respuestas: {
            step,
            demographics,
            mspssResponses,
            currentMspssQuestion,
            phq9Responses,
            currentQuestion,
            consentAccepted
          },
          consentimiento_aceptado: consentAccepted
        })
      });
    } catch (error) {
      console.error("Error saving progress to backend:", error);
    }
  }, [sessionId, step, demographics, mspssResponses, currentMspssQuestion, phq9Responses, currentQuestion, consentAccepted]);

  // --- Recuperación de progreso ---
  useEffect(() => {
    const recoverProgress = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/questionnaire/progress/recover/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          const savedObj = data.respuestas;
          if (savedObj && typeof savedObj === "object") {
            if (savedObj.step !== undefined) setStep(savedObj.step);
            if (savedObj.demographics) setDemographics(savedObj.demographics);
            if (savedObj.mspssResponses) setMspssResponses(savedObj.mspssResponses);
            if (savedObj.currentMspssQuestion !== undefined) setCurrentMspssQuestion(savedObj.currentMspssQuestion);
            if (savedObj.phq9Responses) setPhq9Responses(savedObj.phq9Responses);
            if (savedObj.currentQuestion !== undefined) setCurrentQuestion(savedObj.currentQuestion);
            if (savedObj.consentAccepted !== undefined) setConsentAccepted(savedObj.consentAccepted);
          } else if (Array.isArray(savedObj)) {
            // Compatibilidad con formato anterior (array de 9 números)
            setPhq9Responses(savedObj);
            setStep(2);
            setConsentAccepted(data.consentimiento_aceptado || false);
          }
        }
      } catch (error) {
        console.error("Error recovering progress from backend:", error);
      }
    };
    recoverProgress();
  }, [sessionId]);

  // Ejecutar auto-guardado con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProgressToBackend();
    }, 1000);
    return () => clearTimeout(timer);
  }, [saveProgressToBackend]);

  const flashSaveIndicator = () => {
    setSaveIndicatorVisible(true);
    setTimeout(() => setSaveIndicatorVisible(false), 1500);
  };

  const handleRestart = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/questionnaire/progress/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId })
      });
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
      
      setStep(0);
      setDemographics({
        edad: 20,
        genero: "Femenino",
        carrera: "Ingeniería de Sistemas",
        universidad: "UPC",
        ciclo: "5-6",
        promedio_ponderado: 15.0,
        situacion_pareja: "Soltero/a",
        convivencia: "Con familia",
        distrito_residencia: "Santiago de Surco",
        trabajo_estudio: "Solo estudio",
        migracion: "No",
        horas_sueno: 7.0,
        calidad_sueno: "Regular",
        historia_salud_mental: "Nunca"
      });
      setMspssResponses(new Array(12).fill(-1));
      setCurrentMspssQuestion(0);
      setPhq9Responses(new Array(9).fill(-1));
      setCurrentQuestion(0);
      setConsentAccepted(false);
      setShowRestartDialog(false);
    } catch (error) {
      console.error("Error deleting progress:", error);
    }
  };

  // --- Lógica del Wizard ---
  const isDemographicsValid = () => {
    const d = demographics;
    return (
      d.edad >= 15 &&
      d.edad <= 90 &&
      d.genero &&
      d.carrera.trim() !== "" &&
      d.universidad.trim() !== "" &&
      d.ciclo &&
      d.promedio_ponderado >= 0 &&
      d.promedio_ponderado <= 20 &&
      d.situacion_pareja &&
      d.convivencia &&
      d.distrito_residencia.trim() !== "" &&
      d.trabajo_estudio &&
      d.migracion &&
      d.horas_sueno > 0 &&
      d.calidad_sueno &&
      d.historia_salud_mental
    );
  };

  const handleDemographicsNext = () => {
    if (isDemographicsValid()) {
      setStep(1);
      flashSaveIndicator();
    }
  };

  const handleMspssAnswer = (value: number) => {
    const newMspss = [...mspssResponses];
    newMspss[currentMspssQuestion] = value;
    setMspssResponses(newMspss);
    flashSaveIndicator();

    // Avance automático
    if (currentMspssQuestion < 11) {
      setTimeout(() => {
        setCurrentMspssQuestion(currentMspssQuestion + 1);
      }, 300);
    } else {
      setTimeout(() => {
        setStep(2);
      }, 400);
    }
  };

  const handlePhq9Answer = (value: number) => {
    const newPhq = [...phq9Responses];
    newPhq[currentQuestion] = value;
    setPhq9Responses(newPhq);
    flashSaveIndicator();

    if (currentQuestion < 8) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  const handlePrevious = () => {
    if (step === 2) {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      } else {
        setStep(1);
        setCurrentMspssQuestion(11);
      }
    } else if (step === 1) {
      if (currentMspssQuestion > 0) {
        setCurrentMspssQuestion(currentMspssQuestion - 1);
      } else {
        setStep(0);
      }
    } else {
      onBack();
    }
  };

  const handleNext = () => {
    if (step === 0) {
      handleDemographicsNext();
    } else if (step === 1) {
      if (currentMspssQuestion < 11) {
        setCurrentMspssQuestion(currentMspssQuestion + 1);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      if (currentQuestion < 8) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (consentAccepted) {
        // Use authenticated user ID if available, otherwise fall back to sessionId
        const authUser = getAuthUser();
        const effectiveUserId = authUser?.id || sessionId;
        
        // Enviar payload completo
        onComplete({
          edad: demographics.edad,
          genero: demographics.genero,
          carrera: demographics.carrera,
          universidad: demographics.universidad,
          ciclo: demographics.ciclo,
          promedio_ponderado: demographics.promedio_ponderado,
          situacion_pareja: demographics.situacion_pareja,
          convivencia: demographics.convivencia,
          distrito_residencia: demographics.distrito_residencia,
          trabajo_estudio: demographics.trabajo_estudio,
          migracion: demographics.migracion,
          horas_sueno: demographics.horas_sueno,
          calidad_sueno: demographics.calidad_sueno,
          historia_salud_mental: demographics.historia_salud_mental,
          mspss_respuestas: mspssResponses,
          phq9_respuestas: phq9Responses,
          consentimiento_aceptado: consentAccepted,
          test_user_id: effectiveUserId
        });
      }
    }
  };

  // Estadísticas de progreso
  const totalQuestions = 1 + 12 + 9; // Datos + 12 MSPSS + 9 PHQ-9
  const answeredDemographics = isDemographicsValid() ? 1 : 0;
  const answeredMspss = mspssResponses.filter(v => v !== -1).length;
  const answeredPhq9 = phq9Responses.filter(v => v !== -1).length;
  const totalCompleted = answeredDemographics + answeredMspss + answeredPhq9;
  const progressPercent = Math.round((totalCompleted / totalQuestions) * 100);

  return (
    <div className="bg-[#FAFBFD] dark:bg-slate-950 font-body-md text-slate-800 dark:text-slate-200 min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 top-0 z-50 sticky transition-colors duration-300">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-bold text-[#4A90E2] dark:text-blue-400 font-manrope antialiased tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined">psychology</span>
            <span>MindCheck</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 font-semibold">
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="text-slate-500 dark:text-slate-400 hover:text-[#4A90E2] transition-colors">
              Inicio
            </a>
            <span className="text-[#4A90E2] dark:text-blue-400 border-b-2 border-[#4A90E2] pb-1">
              Evaluación
            </span>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('support'); }} className="text-slate-500 dark:text-slate-400 hover:text-[#4A90E2] transition-colors">
              Soporte
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('auth'); }} className="text-slate-500 dark:text-slate-400 hover:text-[#4A90E2] transition-colors">
              Portal Admin
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => document.documentElement.classList.toggle('dark')} className="p-2 text-slate-500 hover:text-[#4A90E2] transition-colors rounded-full" title="Alternar tema">
              <span className="material-symbols-outlined">contrast</span>
            </button>
            <button
              onClick={() => setShowRestartDialog(true)}
              className="p-2 text-slate-500 hover:text-red-500 transition-colors rounded-full"
              title="Reiniciar cuestionario"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              className="md:hidden p-2 text-slate-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onBack(); }} className="text-slate-500 dark:text-slate-400">
              Inicio
            </a>
            <span className="text-[#4A90E2] font-bold">Evaluación</span>
            <a href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigate?.('support'); }} className="text-slate-500 dark:text-slate-400">
              Soporte
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); onNavigate?.('auth'); }} className="text-slate-500 dark:text-slate-400">
              Portal Admin
            </a>
          </div>
        )}
      </header>

      <main className="flex-grow pt-8 pb-12">
        {/* Progress Bar Area */}
        <div className="max-w-3xl mx-auto px-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 mb-3">
            <div>
              <span className="font-bold text-xs uppercase tracking-widest text-[#4A90E2] dark:text-blue-400 block mb-1">
                {step === 0 ? "Paso 1: Datos Demográficos y de Salud" : step === 1 ? "Paso 2: Escala de Apoyo Social (MSPSS)" : "Paso 3: Evaluación de Síntomas (PHQ-9)"}
              </span>
              <h2 className="text-2xl font-black font-manrope">Cuestionario Integral de Bienestar</h2>
            </div>
            <div className="flex items-center gap-3">
              {saveIndicatorVisible && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold animate-pulse">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Guardado</span>
                </div>
              )}
              <div className="text-xs text-slate-500 text-right">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Progreso Total: {progressPercent}%
                </span>
                <span>{totalCompleted} de {totalQuestions} campos</span>
              </div>
            </div>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-[#4A90E2] transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Wizard Step Canvas */}
        <div className="max-w-3xl mx-auto px-6">
          {step === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-6 transition-all duration-300">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Ficha de Información Personal e Hábitos</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Esta información es necesaria para que nuestro modelo de aprendizaje automático pueda contextualizar tu nivel de riesgo y entregarte recomendaciones precisas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Edad */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Edad</label>
                  <input
                    type="number"
                    value={demographics.edad}
                    onChange={(e) => setDemographics({ ...demographics, edad: parseInt(e.target.value) || 20 })}
                    min="15"
                    max="90"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  />
                </div>

                {/* Género */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Género</label>
                  <div className="grid grid-cols-3 gap-2">
                    {GENERO_OPTIONS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setDemographics({ ...demographics, genero: g })}
                        className={`py-3 rounded-xl font-semibold border text-xs transition-all active:scale-95 ${
                          demographics.genero === g
                            ? "bg-blue-50 border-blue-400 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
                            : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Universidad */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Universidad</label>
                  <input
                    type="text"
                    value={demographics.universidad}
                    onChange={(e) => setDemographics({ ...demographics, universidad: e.target.value })}
                    placeholder="Ej. UPC, PUCP, UNMSM"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  />
                </div>

                {/* Carrera */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Carrera</label>
                  <input
                    type="text"
                    value={demographics.carrera}
                    onChange={(e) => setDemographics({ ...demographics, carrera: e.target.value })}
                    placeholder="Ej. Psicología, Medicina"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  />
                </div>

                {/* Ciclo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider block">Ciclo Académico</label>
                  <select
                    value={demographics.ciclo}
                    onChange={(e) => setDemographics({ ...demographics, ciclo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  >
                    {CICLO_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Promedio Ponderado */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Promedio Ponderado (0-20)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={demographics.promedio_ponderado}
                    onChange={(e) => setDemographics({ ...demographics, promedio_ponderado: parseFloat(e.target.value) || 0.0 })}
                    min="0"
                    max="20"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  />
                </div>

                {/* Situación Pareja */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Situación Sentimental</label>
                  <select
                    value={demographics.situacion_pareja}
                    onChange={(e) => setDemographics({ ...demographics, situacion_pareja: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  >
                    {SITUACION_PAREJA_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Convivencia */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">¿Con quién vives?</label>
                  <select
                    value={demographics.convivencia}
                    onChange={(e) => setDemographics({ ...demographics, convivencia: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  >
                    {CONVIVENCIA_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Distrito de Residencia */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Distrito de Residencia</label>
                  <input
                    type="text"
                    value={demographics.distrito_residencia}
                    onChange={(e) => setDemographics({ ...demographics, distrito_residencia: e.target.value })}
                    placeholder="Ej. Santiago de Surco, San Miguel"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  />
                </div>

                {/* Trabajo / Estudio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Situación laboral</label>
                  <select
                    value={demographics.trabajo_estudio}
                    onChange={(e) => setDemographics({ ...demographics, trabajo_estudio: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  >
                    {TRABAJO_ESTUDIO_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>

                {/* Migración */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">¿Eres estudiante migrante?</label>
                  <select
                    value={demographics.migracion}
                    onChange={(e) => setDemographics({ ...demographics, migracion: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  >
                    {MIGRACION_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o === "Sí" ? "Sí (de provincia o extranjero)" : "No (residente local)"}</option>
                    ))}
                  </select>
                </div>

                {/* Antecedentes de Salud Mental */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Atención Previa en Salud Mental</label>
                  <select
                    value={demographics.historia_salud_mental}
                    onChange={(e) => setDemographics({ ...demographics, historia_salud_mental: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                  >
                    {HISTORIA_SALUD_MENTAL_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o === "Nunca" ? "Nunca he recibido atención" : o === "Previo no actual" ? "Tratamiento previo (inactivo)" : o === "Actual" ? "Tratamiento psiquiátrico/psicológico actual" : o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Hábitos de Sueño */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Hábitos de Sueño (Variables Críticas del Modelo ML)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Horas de Sueño */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Horas de sueño promedio</label>
                      <span className="text-sm font-extrabold text-[#4A90E2] dark:text-blue-400">{demographics.horas_sueno} horas</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="12"
                      step="0.5"
                      value={demographics.horas_sueno}
                      onChange={(e) => setDemographics({ ...demographics, horas_sueno: parseFloat(e.target.value) || 7.0 })}
                      className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-100 dark:bg-slate-800 rounded-full"
                    />
                  </div>

                  {/* Calidad de Sueño */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Calidad de sueño autopercibida</label>
                    <select
                      value={demographics.calidad_sueno}
                      onChange={(e) => setDemographics({ ...demographics, calidad_sueno: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-medium"
                    >
                      <option value="" disabled>Selecciona...</option>
                      {CALIDAD_SUENIO_OPTIONS.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 transition-all duration-300">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Escala de Apoyo Social MSPSS
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pregunta {currentMspssQuestion + 1} de 12
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-950 dark:text-white font-manrope">
                  {MSPSS_QUESTIONS[currentMspssQuestion]}
                </h3>
                
                <div className="grid grid-cols-1 gap-3 pt-4">
                  {MSPSS_OPTIONS.map((opt) => {
                    const isActive = mspssResponses[currentMspssQuestion] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleMspssAnswer(opt.value)}
                        className={`flex justify-between items-center p-4 border rounded-2xl text-left font-semibold text-sm transition-all duration-100 active:scale-98 ${
                          isActive
                            ? "bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && <span className="material-symbols-outlined text-sm">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-xl space-y-6 transition-all duration-300">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="bg-blue-50 dark:bg-blue-500/10 text-[#4A90E2] dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Tamizaje PHQ-9 (Salud Mental)
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Pregunta {currentQuestion + 1} de 9
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  En las últimas 2 semanas, ¿con qué frecuencia te has sentido afectado por:
                </span>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white font-manrope">
                  {PHQ9_QUESTIONS[currentQuestion]}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                  {PHQ9_OPTIONS.map((opt) => {
                    const isActive = phq9Responses[currentQuestion] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handlePhq9Answer(opt.value)}
                        className={`flex justify-between items-center p-4 border rounded-2xl text-left font-semibold text-sm transition-all duration-100 active:scale-98 ${
                          isActive
                            ? "bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
                            : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && <span className="material-symbols-outlined text-sm">check_circle</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {currentQuestion === 8 && (
                <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <label className="flex items-start gap-3 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 dark:border-emerald-500/20 dark:bg-emerald-500/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentAccepted}
                      onChange={(e) => setConsentAccepted(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                      Autorizo expresamente el tratamiento de mis respuestas de salud mental y datos demográficos en base a la Ley N.° 29733 de Protección de Datos Personales del Perú para fines del tamizaje preliminar y derivación clínica en caso de riesgo alto.
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
            <button
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="w-full md:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
            
            {step === 0 && (
              <button
                onClick={handleNext}
                disabled={!isDemographicsValid() || isSubmitting}
                className={`w-full md:w-auto px-10 py-4 rounded-full font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  isDemographicsValid()
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 cursor-pointer"
                    : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                }`}
              >
                <span>Siguiente Paso</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 1 && (
              <button
                onClick={handleNext}
                disabled={mspssResponses[currentMspssQuestion] === -1 || isSubmitting}
                className={`w-full md:w-auto px-10 py-4 rounded-full font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  mspssResponses[currentMspssQuestion] !== -1
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 cursor-pointer"
                    : "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                }`}
              >
                <span>Siguiente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleNext}
                disabled={(currentQuestion === 8 && !consentAccepted) || phq9Responses[currentQuestion] === -1 || isSubmitting}
                className={`w-full md:w-auto px-12 py-4 rounded-full font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
                  (currentQuestion === 8 && !consentAccepted) || phq9Responses[currentQuestion] === -1 || isSubmitting
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-[#4A90E2] to-indigo-600 shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : currentQuestion === 8 ? (
                  <span>Enviar Respuestas</span>
                ) : (
                  <>
                    <span>Siguiente</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Restart confirmation dialog */}
      {showRestartDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Reiniciar Cuestionario
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
              ¿Estás seguro de que deseas reiniciar el cuestionario? Se perderán todas tus respuestas guardadas del progreso.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRestartDialog(false)}
                className="px-6 py-3 border border-slate-200 dark:border-slate-700 rounded-full font-semibold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRestart}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold text-xs transition-colors"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-6 px-8 mt-auto">
        <div className="flex flex-col md:flex-row justify-between items-center w-full max-w-7xl mx-auto gap-4 font-manrope text-[11px] tracking-wide text-slate-500 dark:text-slate-400">
          <p>© 2026 Iniciativa de Salud Mental Universitaria. Para apoyo en crisis de salud mental, llama al 113.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Política de Privacidad</a>
            <a href="#" className="hover:underline">Contactar Soporte</a>
            <a href="#" className="hover:underline">Términos de Servicio</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
