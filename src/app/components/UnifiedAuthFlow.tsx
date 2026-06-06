import { useState } from "react";
import { 
  ArrowLeft, Mail, Lock, User, Eye, EyeOff, 
  BookOpen, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2
} from "lucide-react";
import { loginStudent, signupStudent, loginAdmin, signupAdmin } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";
import { toast } from "sonner";

type AuthMode = "role-select" | "student-login" | "student-register" | "admin-login" | "admin-register" | "forgot-password" | "success";

interface UnifiedAuthFlowProps {
  onAuthSuccess: () => void;
  onBack?: () => void;
}

interface FormData {
  email: string;
  password: string;
  nombre: string;
  edad: string;
  carrera: string;
  universidad: string;
  confirmPassword?: string;
}

export function UnifiedAuthFlow({ onAuthSuccess, onBack }: UnifiedAuthFlowProps) {
  const [mode, setMode] = useState<AuthMode>("role-select");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    nombre: "",
    edad: "",
    carrera: "",
    universidad: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      nombre: "",
      edad: "",
      carrera: "",
      universidad: "",
    });
    setError("");
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);

  const validateStudentRegister = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.email.trim()) newErrors.email = "El correo es obligatorio";
    else if (!validateEmail(formData.email)) newErrors.email = "Correo inválido";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";
    else if (formData.password.length < 6) newErrors.password = "Mínimo 6 caracteres";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
    if (!formData.edad) newErrors.edad = "La edad es obligatoria";
    else if (parseInt(formData.edad) < 13) newErrors.edad = "Debes tener al menos 13 años";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "El correo es obligatorio";
    else if (!validateEmail(formData.email)) newErrors.email = "Correo inválido";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) {
      toast.error("Por favor, completa los campos correctamente");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const session = await loginStudent({
        email: formData.email,
        password: formData.password,
      });
      setAuthSession(session);
      setMode("success");
      setTimeout(onAuthSuccess, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStudentRegister()) {
      toast.error("Por favor, completa los campos correctamente");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const session = await signupStudent({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        edad: parseInt(formData.edad),
        carrera: formData.carrera || undefined,
        universidad: formData.universidad || undefined,
      });
      if (session) {
        setAuthSession(session);
        setMode("success");
        setTimeout(onAuthSuccess, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) {
      toast.error("Por favor, completa los campos correctamente");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const session = await loginAdmin({
        email: formData.email,
        password: formData.password,
      });
      setAuthSession(session);
      setMode("success");
      setTimeout(onAuthSuccess, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) {
      toast.error("Por favor, completa los campos correctamente");
      return;
    }

    if (!formData.nombre) {
      setErrors({ nombre: "El nombre es obligatorio" });
      return;
    }

    if (formData.password.length < 6) {
      setErrors({ password: "Mínimo 6 caracteres" });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const session = await signupAdmin({
        email: formData.email,
        password: formData.password,
        name: formData.nombre,
      });
      setAuthSession(session);
      setMode("success");
      setTimeout(onAuthSuccess, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] to-blue-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-manrope">
      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header con botón atrás */}
        {mode !== "role-select" && (
          <button
            onClick={() => {
              resetForm();
              setMode("role-select");
            }}
            className="mb-6 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Volver</span>
          </button>
        )}

        {/* Role Selection */}
        {mode === "role-select" && (
          <div className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bienvenido a MindCheck</h1>
              <p className="text-slate-500 dark:text-slate-400">Selecciona cómo deseas ingresar</p>
            </div>

            <div className="space-y-3">
              {/* Student Option */}
              <button
                onClick={() => { resetForm(); setMode("student-login"); }}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 dark:hover:border-blue-500 p-6 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Estudiante</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Inicia sesión o crea tu cuenta</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </button>

              {/* Admin Option */}
              <button
                onClick={() => { resetForm(); setMode("admin-login"); }}
                className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 p-6 transition-all duration-300 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Portal Administrativo</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Acceso para administradores</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                    <Shield size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </button>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-medium py-2"
              >
                Volver al inicio
              </button>
            )}
          </div>
        )}

        {/* Student Login */}
        {mode === "student-login" && (
          <form onSubmit={handleStudentLogin} className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Iniciar Sesión</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Accede a tu evaluación</p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                    errors.email
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  } outline-none`}
                  placeholder="tu@correo.com"
                />
                {errors.email && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                      errors.password
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                    } outline-none`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              Iniciar Sesión
            </button>

            <button
              type="button"
              onClick={() => { resetForm(); setMode("student-register"); }}
              className="w-full text-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium py-2 transition-colors"
            >
              ¿No tienes cuenta? <span className="font-semibold">Regístrate aquí</span>
            </button>
          </form>
        )}

        {/* Student Register */}
        {mode === "student-register" && (
          <form onSubmit={handleStudentRegister} className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crear Cuenta</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Únete a MindCheck</p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                    errors.nombre
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  } outline-none`}
                  placeholder="Tu nombre completo"
                />
                {errors.nombre && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                    errors.email
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  } outline-none`}
                  placeholder="tu@correo.com"
                />
                {errors.email && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Edad *
                </label>
                <input
                  type="number"
                  name="edad"
                  value={formData.edad}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                    errors.edad
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                  } outline-none`}
                  placeholder="18"
                  min="13"
                  max="120"
                />
                {errors.edad && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.edad}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Carrera (opcional)
                </label>
                <input
                  type="text"
                  name="carrera"
                  value={formData.carrera}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                  placeholder="Ej: Ingeniería"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Universidad (opcional)
                </label>
                <input
                  type="text"
                  name="universidad"
                  value={formData.universidad}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                  placeholder="Ej: UPC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                      errors.password
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                    } outline-none`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirmar contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword || ""}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, confirmPassword: e.target.value }));
                      if (errors.confirmPassword) {
                        setErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors.confirmPassword;
                          return newErrors;
                        });
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                      errors.confirmPassword
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400"
                    } outline-none`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              Crear Cuenta
            </button>

            <button
              type="button"
              onClick={() => { resetForm(); setMode("student-login"); }}
              className="w-full text-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium py-2 transition-colors"
            >
              ¿Ya tienes cuenta? <span className="font-semibold">Inicia sesión</span>
            </button>
          </form>
        )}

        {/* Admin Login */}
        {mode === "admin-login" && (
          <form onSubmit={handleAdminLogin} className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Portal Administrativo</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Acceso para administradores</p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                    errors.email
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                  } outline-none`}
                  placeholder="admin@correo.com"
                />
                {errors.email && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                      errors.password
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                    } outline-none`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              Iniciar Sesión
            </button>

            <button
              type="button"
              onClick={() => { resetForm(); setMode("admin-register"); }}
              className="w-full text-center text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium py-2 transition-colors"
            >
              ¿No tienes cuenta? <span className="font-semibold">Regístrate aquí</span>
            </button>
          </form>
        )}

        {/* Admin Register */}
        {mode === "admin-register" && (
          <form onSubmit={handleAdminRegister} className="space-y-6 animate-in fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Crear Cuenta Admin</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Portal Administrativo</p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex gap-3">
                <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                    errors.nombre
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                  } outline-none`}
                  placeholder="Tu nombre completo"
                />
                {errors.nombre && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                    errors.email
                      ? "border-red-500 dark:border-red-400"
                      : "border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                  } outline-none`}
                  placeholder="admin@correo.com"
                />
                {errors.email && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-50 dark:bg-slate-800 transition-colors ${
                      errors.password
                        ? "border-red-500 dark:border-red-400"
                        : "border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400"
                    } outline-none`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              Crear Cuenta
            </button>

            <button
              type="button"
              onClick={() => { resetForm(); setMode("admin-login"); }}
              className="w-full text-center text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium py-2 transition-colors"
            >
              ¿Ya tienes cuenta? <span className="font-semibold">Inicia sesión</span>
            </button>
          </form>
        )}

        {/* Success Screen */}
        {mode === "success" && (
          <div className="text-center space-y-6 py-8 animate-in zoom-in">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">¡Bienvenido!</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Tu sesión se ha iniciado correctamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
