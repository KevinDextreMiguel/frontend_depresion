import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Brain, Shield, Users, Mail } from "lucide-react";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfoDialog({ open, onOpenChange }: InfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sobre el Proyecto</DialogTitle>
          <DialogDescription>
            Tamizaje de Depresión en Jóvenes Universitarios de Lima
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Objetivo del Proyecto
            </h3>
            <p className="text-sm text-gray-700">
              Esta aplicación web está diseñada para la detección temprana de indicios de depresión
              en estudiantes universitarios mediante el cuestionario estandarizado PHQ-9 (Patient Health
              Questionnaire-9). El objetivo es identificar estudiantes que puedan beneficiarse de apoyo
              profesional y facilitar el acceso a recursos de salud mental.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              ¿Qué es el PHQ-9?
            </h3>
            <p className="text-sm text-gray-700 mb-2">
              El PHQ-9 es un instrumento validado de 9 ítems basado en los criterios diagnósticos
              del DSM-IV para trastorno depresivo mayor. Ha sido ampliamente validado en poblaciones
              universitarias y se utiliza mundialmente para:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
              <li>Tamizaje de depresión</li>
              <li>Evaluación de severidad de síntomas</li>
              <li>Monitoreo de cambios en el tiempo</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Confidencialidad y Privacidad
            </h3>
            <p className="text-sm text-gray-700">
              Tus respuestas son completamente <strong>anónimas</strong>. No solicitamos nombre, correo
              electrónico, ni ningún dato personal identificable. Los resultados se almacenan únicamente
              con fines estadísticos agregados para mejorar los servicios de salud mental universitaria.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-yellow-800">
                <strong>Nota importante:</strong> Este prototipo es para fines educativos y demostrativos.
                Para uso clínico real, se requiere una plataforma que cumpla con normativas de privacidad
                y seguridad de datos de salud.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Interpretación de Resultados</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="font-medium">0-4 puntos</span>
                <span className="text-green-700">Mínima</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                <span className="font-medium">5-9 puntos</span>
                <span className="text-blue-700">Leve</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <span className="font-medium">10-14 puntos</span>
                <span className="text-yellow-700">Moderada</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="font-medium">15-19 puntos</span>
                <span className="text-orange-700">Moderadamente Severa</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                <span className="font-medium">20-27 puntos</span>
                <span className="text-red-700">Severa</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-gray-600" />
              Contacto y Recursos
            </h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Servicio Psicológico ULIMA:</strong><br />
                📞 437-6767 anexo 30074
              </p>
              <p>
                <strong>Línea de Prevención del Suicidio:</strong><br />
                📞 0800-00-232 (24/7 gratuito)
              </p>
              <p>
                <strong>Línea 113 - Salud Mental MINSA:</strong><br />
                📞 113 opción 5 (24/7)
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ Descargo de responsabilidad:</strong> Este cuestionario es una herramienta
              de tamizaje, NO un diagnóstico clínico. Solo un profesional de salud mental calificado
              puede realizar un diagnóstico formal. Si experimentas síntomas severos o pensamientos
              de hacerte daño, busca ayuda profesional de inmediato.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
