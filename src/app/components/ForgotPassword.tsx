import { useState } from "react";
import { ArrowLeft, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { forgotPassword } from "@/lib/api";

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, ingresa tu correo electrónico.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await forgotPassword(email);
      setSuccess(res.detail || "Enlace de recuperación enviado al correo.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar recuperación");
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
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
            <div className="mt-12 space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold">Recuperar Contraseña</h1>
              <p className="text-blue-100 text-sm">
                Te enviaremos un enlace a tu correo electrónico para que puedas restablecer tu acceso.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-7/12 p-8 sm:p-12 flex flex-col justify-center">
          <button
            onClick={onBack}
            className="md:hidden flex items-center gap-2 text-slate-500 mb-8 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="max-w-md mx-auto w-full space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                ¿Olvidaste tu contraseña?
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                Ingresa tu correo registrado para recibir las instrucciones de recuperación.
              </p>
            </div>

            {success ? (
              <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 rounded-xl p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-green-800 dark:text-green-400 font-bold">¡Correo enviado!</h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  {success}
                </p>
                <button
                  onClick={onBack}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Volver a Iniciar Sesión
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4A90E2] to-indigo-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-70"
                >
                  {loading ? "Procesando..." : "Enviar Enlace"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
