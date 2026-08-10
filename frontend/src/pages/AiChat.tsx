import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function init() {
    try {
      const statusRes = await api.get('/ai/chat/status');
      if (!statusRes.data.enabled) {
        setEnabled(false);
        setInitializing(false);
        return;
      }
      setEnabled(true);

      const historyRes = await api.get('/ai/chat/history');
      const history: ChatMessage[] = historyRes.data;

      if (history.length > 0) {
        setMessages(history);
        setInitializing(false);
        return;
      }

      const greetingRes = await api.post('/ai/chat/greeting');
      if (greetingRes.data.greeting) {
        setMessages([
          { role: 'user', content: '[Início de sessão]' },
          { role: 'assistant', content: greetingRes.data.greeting },
        ]);
      }
    } catch {
      // silent
    } finally {
      setInitializing(false);
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat/message', { message: text });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatMessage(content: string) {
    if (content === '[Início de sessão]') return null;

    return content.split('\n').map((line, i) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      return (
        <p key={i} className={i > 0 ? 'mt-2' : ''} dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-brand-900/60 text-sm">Conectando com a Gaia...</p>
        </div>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-brand-900 mb-2">Consultor IA Indisponível</h2>
          <p className="text-brand-900/60 text-sm">O consultor IA está temporariamente desativado.</p>
          <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2.5 bg-brand-900 text-white rounded-full text-sm font-medium hover:bg-brand-900/90 transition-all">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-brand-900 text-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold">Gaia</h1>
            <p className="text-white/60 text-xs">Consultora ESG</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/60">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.filter(m => m.content !== '[Início de sessão]').map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-900 text-white rounded-br-md'
                  : 'bg-white text-brand-900 shadow-sm border border-gray-100 rounded-bl-md'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                      <svg className="w-3 h-3 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-brand-700">Gaia</span>
                  </div>
                )}
                <div className={msg.role === 'assistant' ? 'text-brand-900/80' : ''}>
                  {formatMessage(msg.content)}
                </div>
                {msg.createdAt && (
                  <p className={`text-[10px] mt-2 ${msg.role === 'user' ? 'text-white/40' : 'text-brand-900/30'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl rounded-bl-md px-5 py-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-brand-700">Gaia</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-brand-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-brand-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre ESG, GRI, sustentabilidade..."
            rows={1}
            className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-brand-900 placeholder-brand-900/30 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 bg-brand-900 text-white rounded-xl hover:bg-brand-900/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="max-w-3xl mx-auto text-[10px] text-brand-900/30 mt-1.5 text-center">
          Gaia usa inteligência artificial para orientar sobre ESG. As respostas são baseadas nos seus dados reais.
        </p>
      </div>
    </div>
  );
}
