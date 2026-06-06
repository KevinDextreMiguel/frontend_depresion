import { useState, useEffect } from "react";
import { ArrowLeft, Lock, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { resetPassword } from "@/lib/api";

interface ResetPasswordProps {
  onBack: () => void;
}

export function ResetPassword({ onBack }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    // Extract access_token from URL hash
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const accessToken = params.get("access_token");
    if (accessToken) {
      setToken(accessToken);
    } else {
      setError("No se encontró un token válido. Por favor, solicita un nuevo enlace de recuperación.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Token inválido o expirado.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(password, token);
      setSuccess(true);
      // Clean up URL to prevent token reuse visually
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-manrope">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[1000px] flex flex-col md:flex-row bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 dark:border-slate-800/50 z-10">
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-gradient-to-br from-[#4A90E2] to-indigo-600 p-10 text-white">
          <div className="space-y-6">
            <div className="mt-12 space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold">Crear Nueva Contraseña</h1>
              <p className="text-blue-100 text-sm">
                Ingresa tu nueva contraseña para acceder a tu cuenta de forma segura.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                Restablecer Contraseña
              </h2>
            </div>

            {success ? (
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 rounded-xl p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-green-800 dark:text-green-400 font-bold">¡Contraseña Actualizada!</h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Tu contraseña se ha restablecido correctamente. Ya puedes iniciar sesión con tus nuevas credenciales.
                </p>
                <button
                  onClick={onBack}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Ir al Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border rounded-xl dark:bg-slate-900 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border rounded-xl dark:bg-slate-900 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4A90E2] to-indigo-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-70"
                >
                  {loading ? "Procesando..." : "Actualizar Contraseña"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}
            
            {!success && (
               <div className="text-center mt-4">
                 <button onClick={onBack} type="button" className="text-slate-500 hover:text-blue-600 text-sm font-semibold">
                   Volver a Iniciar Sesión
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
