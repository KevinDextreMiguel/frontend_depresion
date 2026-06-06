import { useEffect, useState } from "react";
import { fetchConsentHistory } from "@/lib/api";
import { isAuthenticated, getAccessToken } from "@/lib/auth";
import { toast } from "sonner";
import { ArrowLeft, KeyRound, Calendar, Globe, Shield, RefreshCw } from "lucide-react";

export function PrivacyConsentSettings({ onBack }: { onBack: () => void }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    if (!isAuthenticated()) {
      toast.error("Debes iniciar sesión para consultar tu historial de privacidad");
      return;
    }

    setLoading(true);
    try {
      const token = getAccessToken();
      const data = await fetchConsentHistory(token || "");
      setHistory(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "No se pudo recuperar el historial de consentimientos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-manrope">
      <main className="max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 sm:p-10 shadow-xl">
        
        {/* Top Navbar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                Privacidad y Consentimiento
              </h2>
              <p className="text-xs text-slate-400">Consulta los términos y consentimientos otorgados</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            <span>Volver</span>
          </button>
        </div>

        {/* Informative summary */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-850 mb-8 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Tratamiento de Datos Personales (Ley N.° 29733)</p>
          En cumplimiento con la legislación peruana, se registran evidencias de las autorizaciones otorgadas para el tratamiento de tus datos de salud mental. Tienes el derecho de acceder al registro histórico de tus consentimientos, versiones firmadas digitalmente y datos de auditoría.
        </div>

        {/* Load Status */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
            <RefreshCw className="animate-spin text-primary" size={24} />
            <span>Cargando historial de privacidad...</span>
          </div>
        )}

        {/* History List */}
        {!loading && history.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            No tienes registros de consentimiento almacenados aún.
          </div>
        )}

        {!loading && history.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm mb-4">Evidencias Registradas</h3>
            
            <div className="grid gap-4">
              {history.map((consent, idx) => (
                <div 
                  key={consent.id_consentimiento}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Badge */}
                  <div className="absolute top-0 right-0 px-4 py-1.5 text-[10px] font-bold tracking-wider rounded-bl-xl uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-l border-b border-slate-200 dark:border-slate-800">
                    Vigente / Aceptado
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-semibold text-slate-400">Documento:</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        Consentimiento Salud Mental ({consent.version_documento})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-50 dark:border-slate-850 pt-4 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        <span>F. Aceptación: {new Date(consent.fecha_aceptacion).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-slate-400" />
                        <span>IP Origen: {consent.ip_origen}</span>
                      </div>
                      <div className="flex items-center gap-2 md:col-span-1">
                        <KeyRound size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate" title={consent.hash_documento}>
                          Hash: {consent.hash_documento.substring(0, 16)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
