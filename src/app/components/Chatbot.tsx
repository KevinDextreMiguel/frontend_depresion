import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { API_BASE } from "@/lib/api";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  time?: string;
}

interface ChatbotResponseItem {
  clave: string;
  texto: string;
  categoria?: string | null;
  activa: boolean;
  orden?: number | null;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! Soy tu asistente de MindCheck. Te guiaré durante la evaluación y ofreceré apoyo y recursos. IMPORTANTE: responde las preguntas en el cuestionario, no aquí.",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [chatbotResponses, setChatbotResponses] = useState<ChatbotResponseItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [guidedMode, setGuidedMode] = useState(false);
  const [guidedIndex, setGuidedIndex] = useState<number | null>(null);

  const getChatbotResponsesUrl = () => {
    const base = API_BASE?.replace(/\/$/, "") || "";
    return base
      ? `${base}/make-server-d427d5bf/chatbot/responses?active=true`
      : "/make-server-d427d5bf/chatbot/responses?active=true";
  };

  useEffect(() => {
    const loadResponses = async () => {
      try {
        const response = await fetch(getChatbotResponsesUrl());
        if (!response.ok) return;
        const results = await response.json();
        setChatbotResponses(results || []);
      } catch (error) {
        console.warn("No se pudieron cargar respuestas dinámicas del chatbot", error);
      }
    };

    loadResponses();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Event handlers to support guided questionnaire flow
  useEffect(() => {
    const onStartGuided = (e: any) => {
      const startIndex = e?.detail?.startIndex ?? 0;
      setIsOpen(true);
      setGuidedMode(true);
      setGuidedIndex(startIndex);
      const welcome = {
        id: Date.now() + 5,
        text: "Hola — te guiaré paso a paso durante la evaluación. Recuerda: responde las preguntas en el cuestionario (no en este chat).",
        sender: "bot",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } as Message;
      setMessages(prev => [...prev, welcome]);
      // Prompt first question
      setTimeout(() => {
        const prompt = {
          id: Date.now() + 6,
          text: `Comencemos. Por favor responde la pregunta ${startIndex + 1} en el formulario; te recordaré el siguiente paso aquí.`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } as Message;
        setMessages(prev => [...prev, prompt]);
      }, 400);
    };

    const onAnswered = (e: any) => {
      const { questionIndex, value } = e?.detail ?? {};
      const ack = {
        id: Date.now() + 7,
        text: `He registrado que respondiste la pregunta ${questionIndex + 1}. Recuerda: las respuestas se guardan desde el cuestionario.`,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } as Message;
      setMessages(prev => [...prev, ack]);
      // move to next
      const next = (questionIndex ?? 0) + 1;
      if (next < 9) {
        setTimeout(() => {
          const prompt = {
            id: Date.now() + 8,
            text: `Siguiente: por favor responde la pregunta ${next + 1}.`,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          } as Message;
          setMessages(prev => [...prev, prompt]);
        }, 400);
        setGuidedIndex(next);
      } else {
        const done = {
          id: Date.now() + 9,
          text: `Has completado todas las preguntas. Gracias por tu tiempo. Si necesitas soporte, te puedo mostrar recursos.`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } as Message;
        setTimeout(() => setMessages(prev => [...prev, done]), 400);
        setGuidedMode(false);
        setGuidedIndex(null);
      }
    };

    window.addEventListener('mindcheck:guide:start', onStartGuided as EventListener);
    window.addEventListener('mindcheck:guide:answered', onAnswered as EventListener);

    // support HU0014: motivational/containment messages based on progress
    const onProgress = (e: any) => {
      const detail = e?.detail ?? {};
      const answeredCount = detail.answeredCount ?? 0;
      const qIndex = detail.questionIndex ?? 0;
      const value = detail.value ?? 0;
      const suicideAlert = detail.suicideAlert ?? false;

      if (suicideAlert) {
        const msg = {
          id: Date.now() + 20,
          text: "Gracias por compartir. Si tienes pensamientos de hacerte daño, por favor detente y contacta ayuda inmediata: Línea de Prevención del Suicidio 0800-00-232 (24/7). Puedo también mostrarte recursos locales si lo deseas.",
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } as Message;
        setMessages(prev => [...prev, msg]);
        return;
      }

      // reinforcement every 3 answers
      if (answeredCount > 0 && answeredCount % 3 === 0) {
        const options = [
          "Buen trabajo — vas por buen camino, gracias por responder con sinceridad.",
          "Gracias por continuar. Recuerda respirar y tomarte tu tiempo si lo necesitas.",
          "Estás haciendo un gran trabajo completando esto paso a paso. Sigue así."
        ];
        const text = options[Math.floor(Math.random() * options.length)];
        const msg = { id: Date.now() + 21, text, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } as Message;
        setMessages(prev => [...prev, msg]);
        return;
      }

      // empathetic containment for high values on any question
      if (value >= 2) {
        const msg = { id: Date.now() + 22, text: `Siento que esa pregunta fue difícil. Si quieres, puedo ofrecerte recursos o sugerencias para manejar esto ahora.`, sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } as Message;
        setMessages(prev => [...prev, msg]);
        return;
      }
    };

    window.addEventListener('mindcheck:progress', onProgress as EventListener);

    return () => {
      window.removeEventListener('mindcheck:guide:start', onStartGuided as EventListener);
      window.removeEventListener('mindcheck:guide:answered', onAnswered as EventListener);
      window.removeEventListener('mindcheck:progress', onProgress as EventListener);
    };
  }, []);

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

    for (const responseItem of chatbotResponses) {
      const keyword = responseItem.clave.toLowerCase();
      if (keyword && lowerInput.includes(keyword)) {
        botResponse = responseItem.texto;
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

  if (!isOpen) {
    return (
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-primary-container rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 right-8 w-96 h-[600px] max-h-[80vh] bg-white border border-outline-variant rounded-xl shadow-[0px_4px_20px_rgba(74,144,226,0.08)] flex flex-col overflow-hidden z-50">
      {/* Chat Header */}
      <div className="bg-primary px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img alt="AI Support Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-primary-fixed" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDp5aMItmUhPAj3pCdPaYbPiq6_mkk0eRbFYh5hCmB3R-9DYhuZoVCcPeCPaUGfxuVIdPE2fkvKDHADzmYCaZuso1LPjVLF9blhK_cMqDa9lJKP7oA1SnSrWhh-ViqbOE117HfZO111DI4TM2P_PnJ7wUJpRo0skyD9leMkxBplUbf38mC9PftO5kcoDzThavKIWbBdrR2K5PpI3HCiDvokwlitYreCkhNVYsdkIcFE2vWMswlQXxipDCEjr4Ay6UR5-4gsUO52uQ" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-secondary-fixed rounded-full border-2 border-primary"></span>
          </div>
          <div>
            <h3 className="font-h2 text-sm text-on-primary font-bold m-0 leading-tight">MindCheck Assistant</h3>
            <p className="text-[10px] text-on-primary opacity-80 uppercase tracking-widest m-0 leading-tight">Siempre aquí para ayudar</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="material-symbols-outlined text-on-primary opacity-80 hover:opacity-100 transition-opacity">
          close
        </button>
      </div>

      {/* Chat History Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-surface-container-lowest">
        <div className="text-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-outline bg-surface-container px-3 py-1 rounded-full">Hoy</span>
        </div>

        {messages.map((message) => (
          <div key={message.id} className={`flex gap-2 max-w-[90%] ${message.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'user' ? 'bg-secondary-container' : 'bg-primary-container'}`}>
              <span className={`material-symbols-outlined text-sm ${message.sender === 'user' ? 'text-on-secondary-container' : 'text-on-primary-container'}`}>
                {message.sender === 'user' ? 'person' : 'smart_toy'}
              </span>
            </div>
            <div className={`p-3 rounded-xl border border-outline-variant/30 ${message.sender === 'user' ? 'bg-primary text-on-primary rounded-tr-none' : 'bg-surface-container-low text-on-surface rounded-tl-none'}`}>
              <p className="text-sm whitespace-pre-line m-0">{message.text}</p>
              <span className={`text-[10px] mt-1 block ${message.sender === 'user' ? 'opacity-70 text-right' : 'text-outline'}`}>
                {message.time}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Section */}
      <div className="px-4 py-3 bg-white border-t border-outline-variant/50">
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
          <button onClick={() => handleSendMessage("¿Es confidencial?")} className="whitespace-nowrap px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-xs font-medium hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95">¿Confidencial?</button>
          <button onClick={() => handleSendMessage("ayuda")} className="whitespace-nowrap px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-full text-xs font-medium hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95">Opciones</button>
        </div>
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-white border-t border-outline-variant/30 flex gap-2 items-center flex-shrink-0">
        <div className="flex-grow relative">
          <input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-10 pl-3 pr-10 rounded-lg border border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20 bg-background transition-all outline-none text-sm" 
            placeholder="Escribe aquí..." 
            type="text"
          />
          <button onClick={() => handleSendMessage()} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:bg-primary/10 rounded-full transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
