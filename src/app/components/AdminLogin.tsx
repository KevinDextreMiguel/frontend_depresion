import { useState } from "react";
import { ArrowLeft, Mail, Lock, User, ShieldCheck, ArrowRight } from "lucide-react";
import { loginAdmin, signupAdmin } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBack: () => void;
  onForgotPassword?: () => void;
}

export function AdminLogin({ onLoginSuccess, onBack, onForgotPassword }: AdminLoginProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Por favor, completa el correo y la contraseña para iniciar sesión.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Auth vía FastAPI local — NO usa Supabase
      const session = await loginAdmin({ email, password });
      setAuthSession(session);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setError("Por favor, completa todos los campos para registrarte.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const session = await signupAdmin({ email, password, name });
      setAuthSession(session);
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cuenta");
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
              Volver al inicio
            </button>
            <div className="mt-12 space-y-4">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold">Portal Administrativo</h1>
              <p className="text-blue-100 text-sm">
                Autenticación vía backend FastAPI local (sin Supabase).
              </p>
            </div>
          </div>
          <p className="text-xs text-blue-100 italic mt-12">
            Ejecuta el backend en el puerto 8000 antes de iniciar sesión.
          </p>
        </div>

        <div className="w-full md:w-7/12 p-8 sm:p-12">
          <button
            onClick={onBack}
            className="md:hidden flex items-center gap-2 text-slate-500 mb-8 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="max-w-md mx-auto space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                {activeTab === "login" ? "Bienvenido de nuevo" : "Crear nueva cuenta"}
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                {activeTab === "login"
                  ? "Ingresa tus credenciales"
                  : "Registro para el panel de administración"}
              </p>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl relative">
              <div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-lg shadow-sm transition-transform ${activeTab === "signup" ? "translate-x-full" : ""}`}
              />
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setError("");
                }}
                className="relative flex-1 py-2 text-sm font-semibold z-10"
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signup");
                  setError("");
                }}
                className="relative flex-1 py-2 text-sm font-semibold z-10"
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={activeTab === "login" ? handleLogin : handleSignup} className="space-y-5">
              {activeTab === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 border rounded-xl dark:bg-slate-900 dark:border-slate-800"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border rounded-xl dark:bg-slate-900 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={activeTab === "signup" ? 6 : undefined}
                    className="w-full pl-11 pr-4 py-3 border rounded-xl dark:bg-slate-900 dark:border-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                {activeTab === "login" && onForgotPassword && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
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
                {loading ? "Procesando..." : activeTab === "login" ? "Ingresar al Panel" : "Completar Registro"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
