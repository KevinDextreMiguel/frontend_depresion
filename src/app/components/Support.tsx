import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Menu, X } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  time?: string;
}

const FAQ_RESPONSES: Record<string, string> = {
  "¿qué es phq-9?": "El PHQ-9 es un cuestionario de 9 preguntas validado científicamente para detectar síntomas de depresión. Es utilizado por profesionales de salud mental en todo el mundo.",
  "¿es confidencial?": "Sí, tus respuestas son completamente anónimas. No solicitamos datos personales identificables.",
  "¿cuánto tarda?": "El cuestionario toma aproximadamente 3-5 minutos en completarse.",
  "¿qué hago si tengo síntomas?": "Si tus resultados indican síntomas moderados o severos, te recomendamos contactar a un profesional de salud mental. En la pantalla de resultados encontrarás recursos de apoyo.",
  "¿es un diagnóstico?": "No, este cuestionario es una herramienta de tamizaje, NO un diagnóstico clínico. Solo un profesional de salud mental puede realizar un diagnóstico formal.",
  "ayuda": "Puedo ayudarte con preguntas sobre el cuestionario, cómo funciona, confidencialidad, y recursos de apoyo. ¿Qué necesitas saber?"
};

interface SupportProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onStartEvaluation: () => void;
}

export function Support({ onBack, onNavigate, onStartEvaluation }: SupportProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de MindCheck. ¿Cómo te sientes hoy? Puedo ayudarte con dudas sobre tu evaluación o conectarte con recursos de apoyo.",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },
    {
      id: 2,
      text: "Si estás aquí para la Evaluación, toma unos 5-10 minutos. Por favor, busca un lugar tranquilo donde puedas ser honesto/a contigo mismo/a. No hay respuestas correctas o incorrectas.",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text: string = inputValue) => {
    if (!text.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: Message = {
      id: Date.now(),
      text: text,
      sender: "user",
      time: timeString
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    const lowerInput = text.toLowerCase();
    let botResponse = "Entiendo. Aquí hay algunos temas sobre los que puedo ayudarte:\n\n• ¿Qué es el PHQ-9?\n• ¿Es confidencial?\n• ¿Cuánto tiempo tarda?\n• ¿Qué hago si tengo síntomas?\n• ¿Es un diagnóstico?\n\n¿Sobre cuál te gustaría saber más?";

    for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
      if (lowerInput.includes(keyword)) {
        botResponse = response;
        break;
      }
    }

    if (lowerInput.includes("suicidio") || lowerInput.includes("hacerme daño") || lowerInput.includes("quitarme la vida")) {
      botResponse = "⚠️ Si estás en crisis o tienes pensamientos de hacerte daño, por favor contacta inmediatamente:\n\n📞 Línea de Prevención del Suicidio: 0800-00-232 (24/7 gratuito)\n📞 Línea 113 opción 5 - MINSA (24/7)\n📞 Emergencias: 105 o 106\n\nNo estás solo/a. Hay profesionales disponibles para ayudarte.";
    }

    const botMessage: Message = {
      id: Date.now() + 1,
      text: botResponse,
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="bg-background font-body-md text-on-background w-full flex flex-col">
      {/* Main Chat Canvas */}
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-[800px] h-[750px] bg-white border border-outline-variant rounded-xl shadow-[0px_4px_20px_rgba(74,144,226,0.08)] flex flex-col overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="bg-primary px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img alt="AI Support Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp5aMItmUhPAj3pCdPaYbPiq6_mkk0eRbFYh5hCmB3R-9DYhuZoVCcPeCPaUGfxuVIdPE2fkvKDHADzmYCaZuso1LPjVLF9blhK_cMqDa9lJKP7oA1SnSrWhh-ViqbOE117HfZO111DI4TM2P_PnJ7wUJpRo0skyD9leMkxBplUbf38mC9PftO5kcoDzThavKIWbBdrR2K5PpI3HCiDvokwlitYreCkhNVYsdkIcFE2vWMswlQXxipDCEjr4Ay6UR5-4gsUO52uQ" />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary-fixed rounded-full border-2 border-primary"></span>
              </div>
              <div>
                <h3 className="font-h2 text-body-md text-on-primary font-bold">MindCheck Assistant</h3>
                <p className="text-label-caps text-on-primary opacity-80 uppercase tracking-widest">Siempre aquí para ayudar</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onNavigate("landing")} className="material-symbols-outlined text-on-primary opacity-80 hover:opacity-100">close</button>
            </div>
          </div>

          {/* Chat History Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-stack-md chat-scrollbar bg-surface-container-lowest">
            <div className="text-center">
              <span className="text-label-caps text-outline bg-surface-container px-3 py-1 rounded-full">Hoy</span>
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 max-w-[85%] ${message.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-secondary-container' : 'bg-primary-container'}`}>
                  <span className={`material-symbols-outlined text-sm ${message.sender === 'user' ? 'text-on-secondary-container' : 'text-on-primary-container'}`}>
                    {message.sender === 'user' ? 'person' : 'smart_toy'}
                  </span>
                </div>
                <div className={`p-4 rounded-xl border border-outline-variant/30 ${message.sender === 'user' ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container-low text-on-surface rounded-tl-none'}`}>
                  <p className="font-body-md whitespace-pre-line">{message.text}</p>
                  <span className={`text-[10px] mt-2 block ${message.sender === 'user' ? 'opacity-70 text-right' : 'text-outline'}`}>
                    {message.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Critical Alert shown at bottom if specific keywords are detected, or optionally just sent as a message. We sent it as a message above. */}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Section */}
          <div className="px-6 py-4 bg-white border-t border-outline-variant/50">
            <p className="text-label-caps text-outline mb-3 uppercase font-semibold">Acciones Rápidas</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleSendMessage("¿Es confidencial?")} className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container hover:border-primary-container transition-all active:scale-95">¿Es confidencial?</button>
              <button onClick={onStartEvaluation} className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container hover:border-primary-container transition-all active:scale-95">Iniciar Evaluación</button>
              <button onClick={() => handleSendMessage("ayuda para crisis")} className="px-4 py-2 bg-surface-container-low border border-outline-variant rounded-full text-sm font-medium hover:bg-primary-container hover:text-on-primary-container hover:border-primary-container transition-all active:scale-95">Apoyo en Crisis</button>
            </div>
          </div>

          {/* Input Area */}
          <div className="px-6 py-6 bg-white flex gap-3 items-center">
            <div className="flex-grow relative">
              <input 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full h-12 pl-4 pr-12 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background transition-all outline-none" 
                placeholder="Escribe tu pregunta aquí..." 
                type="text"
              />
              <button onClick={() => handleSendMessage()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-full transition-all">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <button className="p-3 border border-outline-variant rounded-lg text-outline hover:text-primary transition-all">
              <span className="material-symbols-outlined">attach_file</span>
            </button>
          </div>
        </div>
      </main>

    </div>
  );
}
