'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ShieldAlert, Loader2 } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function SecuIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Bonjour ! Je suis **SecuIA**, l'expert juridique de SecuPRO.\\n\\nJe suis spécialisé dans la Convention Collective de la Sécurité Privée (IDCC 1351) et la réglementation CNAPS. Comment puis-je vous aider aujourd'hui concernant le droit du travail, les grilles de salaires ou les cartes professionnelles ?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string>('gratuit');
  const [loadingPlan, setLoadingPlan] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function checkPlan() {
      try {
        const { supabase } = await import('@/lib/supabaseClient');
        const societeId = '11111111-1111-1111-1111-111111111111'; // Mock
        const { data } = await supabase.from('societes').select('plan').eq('id', societeId).single();
        setPlan(data?.plan || 'gratuit');
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlan(false);
      }
    }
    checkPlan();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loadingPlan) return <div className="h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

  if (!['pro', 'premium'].includes(plan.toLowerCase())) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 p-8 rounded-2xl max-w-md w-full text-center border border-slate-700 shadow-xl">
          <ShieldAlert className="w-16 h-16 text-blue-500 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold text-white mb-2">Accès Réservé</h2>
          <p className="text-slate-400 mb-6">L'assistant SecuIA est une fonctionnalité exclusive aux plans Pro et Premium.</p>
          <a href="/pricing" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
            Découvrir les offres
          </a>
        </div>
      </div>
    );
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/secuia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Erreur de connexion à l'IA");
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
    } catch (error: any) {
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: `❌ Désolé, une erreur est survenue : ${error.message}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper pour un rendu Markdown très basique (gras et sauts de ligne)
  const renderContent = (content: string) => {
    // Remplacement des sauts de ligne par des <br/>
    const lines = content.split('\\n');
    return lines.map((line, i) => {
      // Remplacement rudimentaire de **texte** en gras
      const parts = line.split(/(\\*{2}[^*]+\\*{2})/g);
      return (
        <React.Fragment key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold">{part.slice(2, -2)}</strong>;
            }
            return <span key={j}>{part}</span>;
          })}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-200">
      
      {/* Header SecuIA */}
      <header className="flex-none bg-slate-800 border-b border-slate-700 p-4 flex items-center gap-3 shadow-md z-10">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">SecuIA</h1>
          <p className="text-xs text-blue-400 font-medium">Assistant Juridique IDCC 1351 & CNAPS</p>
        </div>
      </header>

      {/* Zone de chat */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div key={index} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  isUser 
                    ? 'bg-slate-800 border-slate-600 text-slate-400' 
                    : 'bg-blue-900/30 border-blue-600 text-blue-400'
                }`}>
                  {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Bulle de message */}
                <div className={`max-w-[85%] rounded-2xl px-5 py-3.5 shadow-sm text-[15px] leading-relaxed ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-tr-sm' 
                    : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                }`}>
                  {renderContent(msg.content)}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex gap-4 flex-row">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 bg-blue-900/30 border-blue-600 text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-slate-400 text-sm italic">SecuIA analyse la convention collective...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Zone de saisie */}
      <footer className="flex-none p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question sur le droit du travail en sécurité privée..."
              className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white p-4 rounded-xl transition-colors flex items-center justify-center shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-center text-xs text-slate-500 mt-3">
            SecuIA peut faire des erreurs. Vérifiez toujours les informations importantes auprès des textes légifrance ou de votre syndicat.
          </p>
        </div>
      </footer>
    </div>
  );
}
