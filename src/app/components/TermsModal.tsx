import { useState, useEffect } from "react";
import { fetchTcStatus, acceptTc } from "@/lib/api";
import { toast } from "sonner";
import { ShieldCheck, AlertCircle } from "lucide-react";

interface TermsModalProps {
  onAccept: () => void;
}

export function TermsModal({ onAccept }: TermsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tcVersion, setTcVersion] = useState("1.0");
  const [tcContent, setTcContent] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check local storage first
    const acceptedVersion = localStorage.getItem("mindcheck_tc_accepted");
    
    // Query backend for status
    fetchTcStatus(undefined, "127.0.0.1")
      .then((data) => {
        setTcVersion(data.version);
        setTcContent(data.content);
        if (!data.accepted && acceptedVersion !== data.version) {
          setIsOpen(true);
        }
      })
      .catch((err) => {
        console.error("Error loading T&C status:", err);
        // Fallback if backend offline and not accepted locally
        if (!acceptedVersion) {
          setIsOpen(true);
          setTcContent("Términos y Condiciones Generales: Al ingresar a MindCheck, aceptas que tus datos de navegación y respuestas serán tratadas para el tamizaje clínico y apoyo terapéutico, bajo la Ley N.° 29733 de Protección de Datos Personales del Perú.");
        }
      });
  }, []);

  const handleConfirm = async () => {
    if (!isChecked) {
      setShowWarning(true);
      toast.error("Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    try {
      await acceptTc(tcVersion);
      localStorage.setItem("mindcheck_tc_accepted", tcVersion);
      toast.success("Términos y condiciones aceptados");
      setIsOpen(false);
      onAccept();
    } catch (err) {
      // Local fallback anyway to allow user to work
      localStorage.setItem("mindcheck_tc_accepted", tcVersion);
      setIsOpen(false);
      onAccept();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-manrope">
              Términos y Condiciones de Uso
            </h2>
            <p className="text-xs text-slate-400">Versión {tcVersion}</p>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="flex-1 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed pr-2 space-y-4 mb-6 select-none bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850">
          <p className="font-semibold text-slate-700 dark:text-slate-200">
            Bienvenido a MindCheck, la iniciativa de bienestar universitario.
          </p>
          <div className="whitespace-pre-line">{tcContent}</div>
          <p className="text-xs text-slate-400 mt-6">
            Por favor, lee detalladamente los términos. Si no estás de acuerdo con el tratamiento de datos para tamizaje, no podrás utilizar el servicio.
          </p>
        </div>

        {/* Checkbox Warning */}
        {showWarning && (
          <div className="flex items-center gap-2 p-3 bg-error/10 text-error rounded-xl mb-4 text-xs font-semibold animate-shake">
            <AlertCircle size={16} />
            <span>Debes marcar la casilla para poder habilitar el acceso.</span>
          </div>
        )}

        {/* Checkbox */}
        <label className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl cursor-pointer hover:bg-slate-100/50 transition-colors mb-6">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => {
              setIsChecked(e.target.checked);
              if (e.target.checked) setShowWarning(false);
            }}
            className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-xs text-slate-600 dark:text-slate-300 leading-5">
            He leído y acepto los Términos y Condiciones antes detallados. Comprendo el propósito de la plataforma.
          </span>
        </label>

        {/* Action Button */}
        <div className="flex gap-4">
          <button
            onClick={() => {
              toast.warning("El acceso ha sido bloqueado por rechazo de términos.");
            }}
            className="flex-1 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Rechazar y Salir
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-primary text-on-primary py-3.5 rounded-xl font-semibold text-sm hover:bg-primary-container transition-all shadow-md shadow-primary/10 hover:shadow-lg active:scale-98"
          >
            Aceptar y Continuar
          </button>
        </div>

      </div>
    </div>
  );
}
