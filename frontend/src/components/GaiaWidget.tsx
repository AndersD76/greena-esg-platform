import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { usePlan } from '../hooks/usePlan';

interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
}

export default function GaiaWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [preview, setPreview] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { isFreePlan } = usePlan();

  useEffect(() => {
    if (isFreePlan) return;
    checkAndGreet();
  }, [isFreePlan]);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  async function checkAndGreet() {
    try {
      const statusRes = await api.get('/ai/chat/status');
      if (!statusRes.data.enabled) return;
      setEnabled(true);

      const historyRes = await api.get('/ai/chat/history');
      const history: ChatMessage[] = historyRes.data;

      if (history.length > 0) {
        setMessages(history);
        setInitialized(true);
        return;
      }

      const greetingRes = await api.post('/ai/chat/greeting');
      if (greetingRes.data.greeting) {
        const greeting = greetingRes.data.greeting;
        setMessages([{ role: 'assistant', content: greeting }]);
        setInitialized(true);

        const firstLine = greeting.split('\n')[0].substring(0, 80);
        setPreview(firstLine);
        setShowPreview(true);
        setTimeout(() => setShowPreview(false), 8000);
      }
    } catch {
      // silent
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
    return content.split('\n').map((line, i) => {
      const formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <p key={i} className={i > 0 ? 'mt-1.5' : ''} dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  }

  function handleOpen() {
    setOpen(true);
    setShowPreview(false);
    if (!initialized && enabled) {
      checkAndGreet();
    }
  }

  if (isFreePlan || !enabled) return null;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/20 z-[998] md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Preview bubble */}
      {showPreview && !open && preview && (
        <div
          className="fixed bottom-24 right-6 z-[999] max-w-xs bg-white rounded-2xl rounded-br-md shadow-xl border border-gray-100 p-4 cursor-pointer animate-fade-in"
          onClick={handleOpen}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#7B9965' }}>
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-bold" style={{ color: '#152F27' }}>Gaia</span>
          </div>
          <p className="text-sm text-gray-700 leading-snug">{preview}</p>
          <button
            onClick={(e) => { e.stopPropagation(); setShowPreview(false); }}
            className="absolute top-2 right-2 text-gray-300 hover:text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
          style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
          title="Falar com a Gaia"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-white animate-pulse" />
          )}
        </button>
      )}

      {/* Chat panel */}
      <div className={`fixed z-[999] transition-all duration-300 ease-in-out ${
        open
          ? 'bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-full sm:h-[600px] sm:max-h-[80vh]'
          : 'bottom-6 right-6 w-0 h-0 opacity-0 pointer-events-none'
      }`}>
        {open && (
          <div className="flex flex-col h-full bg-white sm:rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm">Gaia</h3>
                <p className="text-white/60 text-[11px]">Consultora ESG</p>
              </div>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-[11px] text-white/50">Online</span>
              </span>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-1">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#f8faf7' }}>
              {messages.filter(m => m.content !== '[Início de sessão]').map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                  }`} style={msg.role === 'user' ? { background: '#152F27' } : undefined}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-gray-100">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#7B9965' }}>
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="text-[11px] font-semibold" style={{ color: '#7B9965' }}>Gaia</span>
                      </div>
                    )}
                    <div>{formatMessage(msg.content)}</div>
                    {msg.createdAt && (
                      <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/40' : 'text-gray-300'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7B9965', animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7B9965', animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#7B9965', animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 bg-white px-3 py-2.5 flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte sobre ESG..."
                  rows={1}
                  className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-700 focus:border-transparent"
                  style={{ minHeight: '40px', maxHeight: '80px' }}
                  onInput={(e) => {
                    const t = e.target as HTMLTextAreaElement;
                    t.style.height = 'auto';
                    t.style.height = Math.min(t.scrollHeight, 80) + 'px';
                  }}
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                  style={{ background: '#152F27' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
