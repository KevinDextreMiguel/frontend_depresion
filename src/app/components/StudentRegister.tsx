import { useState } from "react";
import { signupStudent } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft, User, Mail, Lock, BookOpen, UserPlus } from "lucide-react";

interface StudentRegisterProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function StudentRegister({ onSuccess, onBack }: StudentRegisterProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    edad: "",
    carrera: "",
    universidad: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre.trim()) newErrors.nombre = "El nombre es obligatorio";
    if (!formData.email.trim()) newErrors.email = "El correo es obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Formato de correo inválido";
    if (!formData.password) newErrors.password = "La contraseña es obligatoria";
    else if (formData.password.length < 6) newErrors.password = "Debe tener al menos 6 caracteres";
    if (!formData.edad) newErrors.edad = "La edad es obligatoria";
    else if (parseInt(formData.edad) <= 0) newErrors.edad = "Edad inválida";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor, completa los campos correctamente.");
      return;
    }

    setIsLoading(true);
    try {
      await signupStudent({
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        edad: parseInt(formData.edad),
        carrera: formData.carrera,
        universidad: formData.universidad,
      });
      toast.success("Registro exitoso. Ya puedes iniciar tu evaluación.");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrarse");
      if (error instanceof Error && error.message.toLowerCase().includes("uso")) {
        setErrors((prev) => ({ ...prev, email: "El correo ya está en uso" }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl p-8 animate-in fade-in slide-in-from-bottom-4">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Volver al inicio</span>
        </button>

        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-primary" size={32} />
          </div>
          <h2 className="text-2xl font-h2 text-slate-800">Crea tu cuenta</h2>
          <p className="text-slate-500 mt-2">Únete a MindCheck para comenzar tu evaluación</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.nombre ? "border-error focus:ring-error" : "border-slate-200 focus:border-primary focus:ring-primary/20"} focus:ring-4 outline-none transition-all`}
                placeholder="Juan Pérez"
              />
            </div>
            {errors.nombre && <p className="text-error text-xs mt-1">{errors.nombre}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Correo electrónico *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.email ? "border-error focus:ring-error" : "border-slate-200 focus:border-primary focus:ring-primary/20"} focus:ring-4 outline-none transition-all`}
                placeholder="juan@ejemplo.com"
              />
            </div>
            {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border ${errors.password ? "border-error focus:ring-error" : "border-slate-200 focus:border-primary focus:ring-primary/20"} focus:ring-4 outline-none transition-all`}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Edad *</label>
              <input
                name="edad"
                type="number"
                value={formData.edad}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border ${errors.edad ? "border-error focus:ring-error" : "border-slate-200 focus:border-primary focus:ring-primary/20"} focus:ring-4 outline-none transition-all`}
                placeholder="Ej. 20"
              />
              {errors.edad && <p className="text-error text-xs mt-1">{errors.edad}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Carrera (Opcional)</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  name="carrera"
                  value={formData.carrera}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Ej. Psicología"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Universidad (Opcional)</label>
            <input
              name="universidad"
              value={formData.universidad}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all"
              placeholder="Ej. UPC"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-button hover:bg-primary-container hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Registrarse"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
