import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { consultationService, Consultation, ConsultationMessage } from '../services/consultation.service';

export default function ConsultationRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ConsultationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [ending, setEnding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (id) {
      loadConsultation();
      loadMessages();

      // Polling para novas mensagens (a cada 5 segundos)
      pollIntervalRef.current = setInterval(loadMessages, 5000);

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadConsultation() {
    try {
      setLoading(true);
      const data = await consultationService.getById(id!);
      setConsultation(data);
    } catch (error) {
      console.error('Erro ao carregar consultoria:', error);
      navigate('/consultations');
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages() {
    try {
      const data = await consultationService.getMessages(id!);
      setMessages(data);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      await consultationService.sendMessage(id!, newMessage);
      setNewMessage('');
      loadMessages();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  }

  async function handleStartConsultation() {
    try {
      await consultationService.start(id!);
      loadConsultation();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao iniciar consultoria');
    }
  }

  async function handleEndConsultation() {
    try {
      setEnding(true);
      await consultationService.complete(id!, notes);
      setShowEndModal(false);
      navigate('/consultations');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao finalizar consultoria');
    } finally {
      setEnding(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-4 mx-auto"
            style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}
          />
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>
            Carregando sala de consultoria...
          </p>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Consultoria nao encontrada</h2>
          <button
            onClick={() => navigate('/consultations')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = consultation.status === 'completed';
  const isCancelled = consultation.status === 'cancelled';
  const canJoin = consultation.status === 'scheduled' || consultation.status === 'in_progress';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/consultations')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Voltar
            </button>
            <div>
              <h1 className="font-bold" style={{ color: '#152F27' }}>
                Sala de Consultoria
              </h1>
              <p className="text-sm text-gray-500">
                {consultation.topic || 'Consultoria ESG'} - {formatDate(consultation.scheduledAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {consultation.status === 'scheduled' && (
              <button
                onClick={handleStartConsultation}
                className="px-4 py-2 rounded-lg font-semibold text-white"
                style={{ backgroundColor: '#7B9965' }}
              >
                Iniciar Consultoria
              </button>
            )}
            {consultation.status === 'in_progress' && (
              <button
                onClick={() => setShowEndModal(true)}
                className="px-4 py-2 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700"
              >
                Finalizar
              </button>
            )}
            {(isCompleted || isCancelled) && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  isCompleted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {isCompleted ? 'Concluída' : 'Cancelada'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid lg:grid-cols-3 gap-4" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Área de Vídeo */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden">
            {canJoin && consultation.meetingUrl ? (
              <iframe
                src={consultation.meetingUrl}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full"
                style={{ minHeight: '400px' }}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-900 text-white">
                <div className="text-center p-8">
                  {isCompleted ? (
                    <>
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#10B981" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h2 className="text-xl font-bold mb-2">Consultoria Concluida</h2>
                      <p className="text-gray-400">
                        Esta consultoria foi finalizada em{' '}
                        {formatDate(consultation.updatedAt)}
                      </p>
                      {consultation.notes && (
                        <div className="mt-4 p-4 bg-gray-800 rounded-lg text-left">
                          <h3 className="font-semibold mb-2">Notas da Sessão:</h3>
                          <p className="text-gray-300">{consultation.notes}</p>
                        </div>
                      )}
                    </>
                  ) : isCancelled ? (
                    <>
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#DC2626" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h2 className="text-xl font-bold mb-2">Consultoria Cancelada</h2>
                      <p className="text-gray-400">Esta consultoria foi cancelada</p>
                    </>
                  ) : consultation.status === 'scheduled' ? (
                    <>
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <h2 className="text-xl font-bold mb-2">Aguardando Inicio</h2>
                      <p className="text-gray-400 mb-4">
                        Clique em "Iniciar Consultoria" para entrar na sala de vídeo
                      </p>
                      <p className="text-sm text-gray-500">
                        Agendada para: {formatDate(consultation.scheduledAt)}
                      </p>
                    </>
                  ) : (
                    <>
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <h2 className="text-xl font-bold mb-2">Sala de Video</h2>
                      <p className="text-gray-400">
                        A videochamada será exibida aqui
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="bg-white rounded-lg shadow-md flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold" style={{ color: '#152F27' }}>
                Chat da Consultoria
              </h2>
              <p className="text-sm text-gray-500">
                {consultation.consultantName || 'Consultor Greena'}
              </p>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '400px' }}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Nenhuma mensagem ainda</p>
                  <p className="text-sm">Comece a conversa!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderType === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.senderType === 'user'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="text-xs font-semibold mb-1">
                        {message.senderName}
                      </div>
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de Mensagem */}
            {!isCompleted && !isCancelled && (
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: '#7B9965' }}
                  >
                    {sending ? '...' : '→'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Finalização */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#152F27' }}>
              Finalizar Consultoria
            </h2>

            <p className="text-gray-600 mb-4">
              Ao finalizar, as horas desta consultoria serão registradas no seu plano.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas da Sessão (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Resumo da consultoria, próximos passos..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleEndConsultation}
                disabled={ending}
                className="flex-1 px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                style={{ backgroundColor: '#7B9965' }}
              >
                {ending ? 'Finalizando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
