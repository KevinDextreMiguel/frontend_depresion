import { useState, useEffect } from "react";
import { fetchConsentStatus, acceptConsent } from "@/lib/api";
import { toast } from "sonner";
import { HeartHandshake, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ConsentModalProps {
  open: boolean;
  accessToken: string;
  onAccept: () => void;
  onCancel: () => void;
}

export function ConsentModal({ open, accessToken, onAccept, onCancel }: ConsentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [consentVersion, setConsentVersion] = useState("1.0");
  const [consentContent, setConsentContent] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && accessToken) {
      setIsLoading(true);
      fetchConsentStatus(accessToken)
        .then((data) => {
          setConsentVersion(data.version);
          setConsentContent(data.content);
          if (data.accepted) {
            // Already accepted active version, bypass
            onAccept();
          } else {
            setIsOpen(true);
          }
        })
        .catch((err) => {
          console.error("Error reading consent status:", err);
          // Standard fallback
          setIsOpen(true);
          setConsentContent("Consentimiento Informado (Ley N.° 29733): Autorizo el tratamiento de mis respuestas de salud mental del cuestionario PHQ-9 de forma confidencial. Comprendo que mis respuestas se usarán para evaluar mi nivel de riesgo y activar los canales de derivación correspondientes.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (open && !accessToken) {
      // If student is doing evaluation anonymously, check locally or skip backend log but show consent
      setIsOpen(true);
      setConsentContent("Consentimiento Informado (Ley N.° 29733): Autorizo el tratamiento de mis respuestas de salud mental del cuestionario PHQ-9 de forma confidencial. Comprendo que mis respuestas se usarán para evaluar mi nivel de riesgo y activar los canales de derivación correspondientes.");
    }
  }, [open, accessToken]);

  const handleConfirm = async () => {
    if (!isChecked) {
      toast.error("Debes dar tu consentimiento expreso para realizar la evaluación.");
      return;
    }

    setIsLoading(true);
    try {
      if (accessToken) {
        await acceptConsent(accessToken, consentVersion);
      }
      toast.success("Consentimiento de tratamiento de datos registrado.");
      setIsOpen(false);
      onAccept();
    } catch (err) {
      toast.error("No se pudo registrar en el servidor, pero procedemos localmente.");
      setIsOpen(false);
      onAccept();
    } finally {
      setIsLoading(false);
    }
  };

  if (!open || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 rounded-2xl text-rose-500">
            <HeartHandshake size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-manrope">
              Consentimiento de Datos de Salud
            </h2>
            <p className="text-xs text-slate-400">Ley de Protección de Datos Personales N.° 29733 (Perú)</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/55 rounded-2xl p-4 mb-6 text-amber-800 dark:text-amber-300 text-xs">
          <ShieldAlert size={18} className="shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Tratamiento de Datos Sensibles:</strong> La legislación peruana exige autorización expresa por escrito (o medios digitales equiparables) para procesar datos de salud mental. Su información será tratada con absoluto anonimato.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-2 space-y-4 mb-6 select-none bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850">
          <div className="whitespace-pre-line font-manrope">{consentContent}</div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 space-y-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>Finalidad: Detección oportuna de factores de riesgo depresivo.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>Seguridad: Cifrado y almacenamiento en base de datos protegida.</span>
            </div>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors mb-6">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-xs text-slate-600 dark:text-slate-300 leading-5">
            <strong>Autorizo expresamente</strong> el tratamiento de mis respuestas de salud mental y datos clínicos para tamizaje y soporte de bienestar.
          </span>
        </label>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              toast.error("Has rechazado el consentimiento informado. No es posible iniciar la evaluación.");
              onCancel();
            }}
            className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Rechazar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-primary text-on-primary py-3.5 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-md shadow-primary/10 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Acepto y Continuar"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
