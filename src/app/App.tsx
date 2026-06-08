import React, { useState, useEffect } from "react";
import type { CuestionarioCompletoPayload } from "@/lib/api";
import { LandingPage } from "./components/LandingPage";
import { EvaluationInstructions } from "./components/EvaluationInstructions";
import { Questionnaire } from "./components/Questionnaire";
import { Results } from "./components/Results";
import { UnifiedAuthFlow } from "./components/UnifiedAuthFlow";
import { AdminPanel } from "./components/AdminPanel";
import { StudentPanel } from "./components/StudentPanel";
import { Chatbot } from "./components/Chatbot";
import { Support } from "./components/Support";
import { InfoDialog } from "./components/InfoDialog";
import { StudentEvolution } from "./components/StudentEvolution";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { submitQuestionnaire, checkApiHealth } from "@/lib/api";
import { isValidPhq9Responses } from "@/lib/phq9";
import { clearAuthSession, isAuthenticated, getAccessToken, getAuthUser } from "@/lib/auth";
import { TermsModal } from "./components/TermsModal";
import { ConsentModal } from "./components/ConsentModal";
import { PrivacyConsentSettings } from "./components/PrivacyConsentSettings";
import { Menu as MenuIcon, X as XIcon, User as UserIcon, LogOut as LogOutIcon } from "lucide-react";

type Screen = "landing" | "instructions" | "questionnaire" | "results" | "auth" | "admin-panel" | "student-panel" | "support" | "student-evolution" | "privacy-consent";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [score, setScore] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [suicideAlert, setSuicideAlert] = useState(false);
  const [interpretability, setInterpretability] = useState<any | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Inactivity timeout reference
  const inactivityTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkApiHealth().then(setApiOnline);
    
    // Auto-login check: redirect to corresponding panel based on role
    if (isAuthenticated()) {
      const user = getAuthUser();
      if (user?.rol === "admin" || user?.rol === "psicologo") {
        setCurrentScreen("admin-panel");
      } else if (user?.rol === "estudiante") {
        setCurrentScreen("student-panel");
      }
    }
  }, []);

  // Check for saved progress whenever screen changes or on mount
  useEffect(() => {
    const progress = localStorage.getItem("mindcheck_phq9_progress");
    setHasSavedProgress(Boolean(progress));
  }, [currentScreen]);

  // Inactivity Timer (AC3)
  useEffect(() => {
    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutos

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      if (currentScreen === "admin-panel") {
        inactivityTimerRef.current = setTimeout(() => {
          handleLogout("Tu sesión ha expirado por inactividad.");
        }, INACTIVITY_LIMIT_MS);
      }
    };

    if (currentScreen === "admin-panel") {
      resetTimer(); // Start timer when entering admin panel

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        window.addEventListener(event, resetTimer);
      });

      return () => {
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
        events.forEach(event => {
          window.removeEventListener(event, resetTimer);
        });
      };
    }
  }, [currentScreen]);

  const handleStartEvaluation = () => {
    if (!isAuthenticated()) {
      toast.info("Por favor, inicia sesión o regístrate para comenzar la evaluación.");
      setCurrentScreen("auth");
      return;
    }
    setCurrentScreen("instructions");
  };

  const handleBeginQuestionnaire = () => {
    setShowConsent(true);
  };

  const confirmConsent = () => {
    setShowConsent(false);
    try {
      window.dispatchEvent(new CustomEvent('mindcheck:guide:start', { detail: { startIndex: 0 } }));
    } catch {}
    setCurrentScreen("questionnaire");
  };

  const cancelConsent = () => {
    setShowConsent(false);
    setCurrentScreen("landing");
  };

  const handleQuestionnaireComplete = async (wizardPayload: CuestionarioCompletoPayload) => {
    const phq9 = wizardPayload.phq9_respuestas;
    if (!isValidPhq9Responses(phq9)) {
      toast.error("Completa todas las preguntas antes de continuar.");
      return;
    }

    const localScore = phq9.reduce((a, b) => a + b, 0);
    setResponses(phq9);
    setScore(localScore);
    setIsSubmitting(true);

    try {
      const data = await submitQuestionnaire(wizardPayload);
      // Backend score is authoritative; update if present
      if (typeof data.score === "number") setScore(data.score);
      setInterpretability((data as any)?.interpretabilidad ?? null);
      setSuicideAlert(Boolean(data.alerta_suicidio));
      toast.success("Evaluación guardada correctamente");
      // Clear saved progress on successful submission
      localStorage.removeItem("mindcheck_phq9_progress");
      localStorage.removeItem("mindcheck_phq9_session");
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      setSuicideAlert(phq9[8] >= 1);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar en el servidor. Puedes ver tus resultados localmente."
      );
    } finally {
      setIsSubmitting(false);
      setCurrentScreen("results");
    }
  };

  const handleReturnHome = () => {
    // If student is authenticated, return to student panel instead of landing
    const currentUser = getAuthUser();
    if (isAuthenticated() && currentUser?.rol === "estudiante") {
      setCurrentScreen("student-panel");
    } else {
      setCurrentScreen("landing");
    }
    setResponses([]);
    setScore(0);
    setSuicideAlert(false);
    // Clear saved progress if user aborts and returns home
    localStorage.removeItem("mindcheck_phq9_progress");
  };

  const handleNavigate = (screen: string) => {
    if (screen === "admin-login" || screen === "student-register" || screen === "forgot-password" || screen === "reset-password") {
      setCurrentScreen("auth");
    } else {
      setCurrentScreen(screen as Screen);
    }
  };

  const handleLoginSuccess = () => {
    const user = getAuthUser();
    if (user?.rol === "admin" || user?.rol === "psicologo") {
      setCurrentScreen("admin-panel");
      toast.success(`Bienvenido al portal administrativo, ${user.nombre || "Administrador"}`);
    } else if (user?.rol === "estudiante") {
      setCurrentScreen("student-panel");
      toast.success(`¡Hola de nuevo, ${user?.nombre || "Estudiante"}! 👋`);
    } else {
      setCurrentScreen("landing");
      toast.success(`¡Bienvenido!`);
    }
  };

  const handleLogout = (message?: string | any) => {
    clearAuthSession();
    setCurrentScreen("landing");
    if (typeof message === "string" && message.trim() !== "") {
      toast.info(message);
    } else {
      toast.success("Sesión cerrada correctamente");
    }
  };

  const user = getAuthUser();
  const loggedIn = isAuthenticated();
  const isStudent = loggedIn && user?.rol === "estudiante";
  const showHeaderFooter = currentScreen !== "admin-panel" && 
                           currentScreen !== "student-panel" && 
                           currentScreen !== "auth" &&
                           !isStudent;

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background transition-colors duration-300">
      {apiOnline === false && currentScreen === "landing" && (
        <div
          role="status"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 px-4 py-3 rounded-xl text-sm shadow-lg"
        >
          {window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "El backend local no responde. Inicia FastAPI en el puerto 8000 para guardar evaluaciones."
            : "El servidor principal (backend) no responde. Por favor, comprueba tu conexión o inténtalo más tarde."}
        </div>
      )}

      {/* Cabecera Global y Unificada */}
      {showHeaderFooter && (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 top-0 z-50 sticky transition-all font-manrope antialiased tracking-tight">
          <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
            <div 
              onClick={handleReturnHome}
              className="flex items-center gap-2 cursor-pointer group animate-in fade-in"
            >
              <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
              <span className="text-xl font-bold text-primary dark:text-blue-400">MindCheck</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a
                className={`font-semibold transition-colors duration-200 ${currentScreen === "landing" ? "text-primary dark:text-blue-300 border-b-2 border-primary pb-1" : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-200"}`}
                href="#"
                onClick={(e) => { e.preventDefault(); handleReturnHome(); }}
              >
                Inicio
              </a>
              <a
                className={`font-semibold transition-colors duration-200 ${currentScreen === "instructions" || currentScreen === "questionnaire" || currentScreen === "results" ? "text-primary dark:text-blue-300 border-b-2 border-primary pb-1" : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-200"}`}
                href="#"
                onClick={(e) => { e.preventDefault(); handleStartEvaluation(); }}
              >
                Evaluación
              </a>
              {loggedIn && user?.rol === "estudiante" && (
                <>
                  <a
                    className={`font-semibold transition-colors duration-200 ${currentScreen === "student-evolution" ? "text-primary dark:text-blue-300 border-b-2 border-primary pb-1" : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-200"}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCurrentScreen("student-evolution"); }}
                  >
                    Mi Evolución
                  </a>
                  <a
                    className={`font-semibold transition-colors duration-200 ${currentScreen === "privacy-consent" ? "text-primary dark:text-blue-300 border-b-2 border-primary pb-1" : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-200"}`}
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCurrentScreen("privacy-consent"); }}
                  >
                    Privacidad
                  </a>
                </>
              )}
              {loggedIn && (user?.rol === "admin" || user?.rol === "psicologo") && (
                <a
                  className="text-purple-600 dark:text-purple-400 font-bold hover:text-purple-700 transition-colors duration-200"
                  href="#"
                  onClick={(e) => { e.preventDefault(); setCurrentScreen("admin-panel"); }}
                >
                  Portal Admin
                </a>
              )}
              <a
                className={`font-semibold transition-colors duration-200 ${currentScreen === "support" ? "text-primary dark:text-blue-300 border-b-2 border-primary pb-1" : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-200"}`}
                href="#"
                onClick={(e) => { e.preventDefault(); setCurrentScreen("support"); }}
              >
                Soporte
              </a>
            </nav>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 text-slate-500">
                <button 
                  onClick={() => document.documentElement.classList.toggle('dark')} 
                  className="material-symbols-outlined hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-all cursor-pointer"
                  title="Alternar Modo Oscuro"
                >
                  contrast
                </button>
              </div>

              {loggedIn ? (
                <div className="hidden md:flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <UserIcon size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {user?.nombre || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={() => handleLogout()}
                    className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-855 hover:border-red-200 hover:text-red-600 dark:hover:border-red-900/50 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400 transition-all hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                  >
                    <LogOutIcon size={12} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentScreen("auth")}
                  className="hidden md:flex bg-primary text-on-primary px-5 py-2.5 rounded-full font-button text-button hover:bg-primary-container active:scale-95 transition-all shadow-sm items-center gap-2 cursor-pointer animate-in fade-in"
                >
                  <span>Iniciar Sesión</span>
                  <UserIcon size={16} />
                </button>
              )}

              <button 
                className="md:hidden p-2 text-slate-500 hover:text-primary transition-colors rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>
          </div>

          {/* Menú Móvil */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-lg py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2 z-50">
              <a
                className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary"
                href="#"
                onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); handleReturnHome(); }}
              >
                Inicio
              </a>
              <a
                className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary"
                href="#"
                onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); handleStartEvaluation(); }}
              >
                Evaluación
              </a>
              {loggedIn && user?.rol === "estudiante" && (
                <>
                  <a
                    className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary"
                    href="#"
                    onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setCurrentScreen("student-evolution"); }}
                  >
                    Mi Evolución
                  </a>
                  <a
                    className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary"
                    href="#"
                    onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setCurrentScreen("privacy-consent"); }}
                  >
                    Privacidad
                  </a>
                </>
              )}
              {loggedIn && (user?.rol === "admin" || user?.rol === "psicologo") && (
                <a
                  className="text-purple-600 dark:text-purple-400 font-bold"
                  href="#"
                  onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setCurrentScreen("admin-panel"); }}
                >
                  Portal Admin
                </a>
              )}
              <a
                className="text-slate-500 dark:text-slate-400 font-medium hover:text-primary"
                href="#"
                onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setCurrentScreen("support"); }}
              >
                Soporte
              </a>
              <hr className="border-slate-200 dark:border-slate-800 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Modo Oscuro</span>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); document.documentElement.classList.toggle('dark'); }} 
                  className="material-symbols-outlined text-slate-500 hover:text-primary transition-colors p-2"
                >
                  contrast
                </button>
              </div>
              {loggedIn ? (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 px-1">
                    <UserIcon size={16} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {user?.nombre || user?.email}
                    </span>
                  </div>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    className="w-full bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 px-5 py-3 rounded-xl font-button text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogOutIcon size={14} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); setCurrentScreen("auth"); }}
                  className="w-full bg-primary text-on-primary px-5 py-3 rounded-xl font-button text-button hover:bg-primary-container active:scale-95 transition-all mt-2 cursor-pointer"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          )}
        </header>
      )}

      {/* Contenedor de Pantallas Dinámicas */}
      <main className="flex-grow w-full flex flex-col">
        {isStudent && currentScreen !== "landing" ? (
          <StudentPanel
            onLogout={handleLogout}
            onStartEvaluation={handleStartEvaluation}
            onNavigate={handleNavigate}
            hasSavedProgress={hasSavedProgress}
            lastScore={score > 0 ? score : undefined}
            activeTabOverride={
              currentScreen === "instructions" || currentScreen === "questionnaire" || currentScreen === "results"
                ? "evaluation"
                : currentScreen === "student-evolution"
                ? "evolution"
                : currentScreen === "privacy-consent"
                ? "privacy"
                : currentScreen === "support"
                ? "support"
                : "home"
            }
          >
            {currentScreen === "student-panel" && null}
            {currentScreen === "instructions" && (
              <EvaluationInstructions
                onBegin={handleBeginQuestionnaire}
                onCancel={handleReturnHome}
                onShowSupport={() => setCurrentScreen("support")}
              />
            )}
            {currentScreen === "questionnaire" && (
              <Questionnaire
                onComplete={handleQuestionnaireComplete}
                onBack={handleReturnHome}
                onNavigate={handleNavigate}
                isSubmitting={isSubmitting}
              />
            )}
            {currentScreen === "results" && (
              <Results
                score={score}
                responses={responses}
                suicideAlert={suicideAlert}
                interpretability={interpretability}
                onReturnHome={handleReturnHome}
                onNavigate={handleNavigate}
              />
            )}
            {currentScreen === "student-evolution" && (
              <StudentEvolution
                onBack={handleReturnHome}
              />
            )}
            {currentScreen === "support" && (
              <Support
                onBack={handleReturnHome}
                onNavigate={handleNavigate}
                onStartEvaluation={handleStartEvaluation}
              />
            )}
            {currentScreen === "privacy-consent" && (
              <PrivacyConsentSettings
                onBack={handleReturnHome}
              />
            )}
          </StudentPanel>
        ) : (
          <>
            {currentScreen === "landing" && (
              <LandingPage
                onStartEvaluation={handleStartEvaluation}
                onShowInfo={() => setShowInfo(true)}
                onNavigate={handleNavigate}
                hasSavedProgress={hasSavedProgress}
                onContinueEvaluation={() => {
                  if (!isAuthenticated()) {
                    toast.info("Por favor, inicia sesión o regístrate para continuar con tu evaluación.");
                    setCurrentScreen("auth");
                    return;
                  }
                  setCurrentScreen("questionnaire");
                }}
              />
            )}

            {currentScreen === "instructions" && (
              <EvaluationInstructions
                onBegin={handleBeginQuestionnaire}
                onCancel={handleReturnHome}
                onShowSupport={() => setCurrentScreen("support")}
              />
            )}

            {currentScreen === "questionnaire" && (
              <Questionnaire
                onComplete={handleQuestionnaireComplete}
                onBack={handleReturnHome}
                onNavigate={handleNavigate}
                isSubmitting={isSubmitting}
              />
            )}

            {currentScreen === "results" && (
              <Results
                score={score}
                responses={responses}
                suicideAlert={suicideAlert}
                interpretability={interpretability}
                onReturnHome={handleReturnHome}
                onNavigate={handleNavigate}
              />
            )}

            {currentScreen === "auth" && (
              <UnifiedAuthFlow
                onAuthSuccess={handleLoginSuccess}
                onBack={handleReturnHome}
              />
            )}

            {currentScreen === "admin-panel" && <AdminPanel onLogout={handleLogout} />}

            {currentScreen === "student-panel" && (
              <StudentPanel
                onLogout={handleLogout}
                onStartEvaluation={handleStartEvaluation}
                onNavigate={handleNavigate}
                hasSavedProgress={hasSavedProgress}
                lastScore={score > 0 ? score : undefined}
              />
            )}

            {currentScreen === "student-evolution" && (
              <StudentEvolution
                onBack={() => setCurrentScreen(score > 0 ? "results" : "landing")}
              />
            )}

            {currentScreen === "support" && (
              <Support
                onBack={handleReturnHome}
                onNavigate={handleNavigate}
                onStartEvaluation={handleStartEvaluation}
              />
            )}

            {currentScreen === "privacy-consent" && (
              <PrivacyConsentSettings
                onBack={() => setCurrentScreen("landing")}
              />
            )}
          </>
        )}
      </main>

      {/* Pie de Página Global */}
      {showHeaderFooter && (
        <footer className="bg-[#F8FAFC] dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-all font-manrope text-xs tracking-wide py-12">
          <div className="flex flex-col md:flex-row justify-between items-center w-full px-8 max-w-7xl mx-auto gap-8">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="material-symbols-outlined text-primary text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  psychology
                </span>
                <span className="text-lg font-bold text-primary">MindCheck</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-center md:text-left max-w-sm">
                © 2026 Iniciativa de Salud Mental Universitaria. Para apoyo en crisis, llama al 113.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              <a className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-300 transition-colors" href="#">
                Política de Privacidad
              </a>
              <a 
                className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-300 transition-colors" 
                href="#"
                onClick={(e) => { e.preventDefault(); setCurrentScreen("support"); }}
              >
                Contactar Soporte
              </a>
              <a className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-300 transition-colors" href="#">
                Términos de Servicio
              </a>
              <a className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-300 transition-colors" href="#">
                Accesibilidad
              </a>
            </div>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">language</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-xl">share</span>
              </button>
            </div>
          </div>
        </footer>
      )}

      {currentScreen !== "admin-panel" &&
        currentScreen !== "student-panel" &&
        currentScreen !== "auth" &&
        currentScreen !== "support" && <Chatbot />}


      <InfoDialog open={showInfo} onOpenChange={setShowInfo} />
      <TermsModal onAccept={() => console.log("T&C Accepted")} />
      <ConsentModal 
        open={showConsent} 
        accessToken={getAccessToken() || ""} 
        onAccept={confirmConsent} 
        onCancel={cancelConsent} 
      />
      <Toaster />
    </div>
  );
}
