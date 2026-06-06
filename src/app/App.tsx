import React, { useState, useEffect } from "react";
import type { CuestionarioCompletoPayload } from "@/lib/api";
import { LandingPage } from "./components/LandingPage";
import { EvaluationInstructions } from "./components/EvaluationInstructions";
import { Questionnaire } from "./components/Questionnaire";
import { Results } from "./components/Results";
import { UnifiedAuthFlow } from "./components/UnifiedAuthFlow";
import { AdminPanel } from "./components/AdminPanel";
import { Chatbot } from "./components/Chatbot";
import { Support } from "./components/Support";
import { InfoDialog } from "./components/InfoDialog";
import { AccessibilityMenu } from "./components/AccessibilityMenu";
import { StudentEvolution } from "./components/StudentEvolution";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { submitQuestionnaire, checkApiHealth } from "@/lib/api";
import { isValidPhq9Responses } from "@/lib/phq9";
import { clearAuthSession, isAuthenticated, getAccessToken } from "@/lib/auth";
import { TermsModal } from "./components/TermsModal";
import { ConsentModal } from "./components/ConsentModal";
import { PrivacyConsentSettings } from "./components/PrivacyConsentSettings";

type Screen = "landing" | "instructions" | "questionnaire" | "results" | "auth" | "admin-panel" | "support" | "student-evolution" | "privacy-consent";

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

  // Inactivity timeout reference
  const inactivityTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkApiHealth().then(setApiOnline);
    
    // Auto-login check
    if (isAuthenticated()) {
      setCurrentScreen("admin-panel");
    }
  }, []);

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
    setCurrentScreen("landing");
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
    setCurrentScreen("admin-panel");
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

  return (
    <div className="size-full">
      {apiOnline === false && currentScreen === "landing" && (
        <div
          role="status"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 px-4 py-3 rounded-xl text-sm shadow-lg"
        >
          El backend local no responde. Inicia FastAPI en el puerto 8000 para guardar evaluaciones.
        </div>
      )}

      {currentScreen === "landing" && (
        <LandingPage
          onStartEvaluation={handleStartEvaluation}
          onShowInfo={() => setShowInfo(true)}
          onNavigate={handleNavigate}
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

      {currentScreen !== "admin-panel" &&
        currentScreen !== "auth" &&
        currentScreen !== "support" && <Chatbot />}

      {currentScreen !== "admin-panel" && 
       currentScreen !== "auth" && (
        <AccessibilityMenu />
      )}

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
