import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationService, Consultation, TimeSlot } from '../services/consultation.service';
import api from '../services/api';

const statusColors: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: '#DBEAFE', text: '#1E40AF' },
  in_progress: { bg: '#FEF3C7', text: '#92400E' },
  completed: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const statusLabels: Record<string, string> = {
  scheduled: 'Agendada',
  in_progress: 'Em andamento',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

export default function Consultations() {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [topic, setTopic] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [remainingHours, setRemainingHours] = useState<{ total: number; used: number; remaining: number } | null>(null);
  const [scheduling, setScheduling] = useState(false);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      setLoading(true);
      const [consultationsData, hoursData] = await Promise.all([
        consultationService.list(filter || undefined),
        api.get('/subscriptions/remaining-hours'),
      ]);
      setConsultations(consultationsData);
      setRemainingHours(hoursData.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadSlots(date: string) {
    try {
      setLoadingSlots(true);
      const slotsData = await consultationService.getAvailableSlots(date);
      setSlots(slotsData);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
    } finally {
      setLoadingSlots(false);
    }
  }

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setSelectedTime('');
    if (date) {
      loadSlots(date);
    }
  }

  async function handleSchedule() {
    if (!selectedDate || !selectedTime) return;

    try {
      setScheduling(true);
      const scheduledAt = `${selectedDate}T${selectedTime}:00`;
      await consultationService.schedule({
        scheduledAt,
        duration: selectedDuration,
        topic: topic || undefined,
      });
      setShowModal(false);
      setSelectedDate('');
      setSelectedTime('');
      setTopic('');
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao agendar consultoria');
    } finally {
      setScheduling(false);
    }
  }

  async function handleCancel(id: string) {
    if (!confirm('Tem certeza que deseja cancelar esta consultoria?')) return;

    try {
      await consultationService.cancel(id);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Erro ao cancelar consultoria');
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Obter data mínima (amanhã)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-4 mx-auto"
            style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}
          />
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>
            Carregando consultorias...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Cabecalho */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2" style={{ color: '#152F27' }}>
              Consultorias ESG
            </h1>
            <p className="text-lg font-semibold" style={{ color: '#7B9965' }}>Agende e gerencie suas consultorias com especialistas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={!remainingHours || remainingHours.remaining <= 0}
            className="px-6 py-3 rounded-xl font-black text-white transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
          >
            + Agendar Consultoria
          </button>
        </div>

        {/* Cards de Informacao */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#e8f5e9' }}>
              <svg className="w-6 h-6" fill="none" stroke="#7B9965" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: '#666' }}>Horas Disponiveis</div>
            <div className="text-4xl font-black" style={{ color: '#7B9965' }}>
              {remainingHours?.remaining || 0}h
            </div>
            <div className="text-sm font-semibold" style={{ color: '#999' }}>
              de {remainingHours?.total || 0}h no plano
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#e3f2fd' }}>
              <svg className="w-6 h-6" fill="none" stroke="#2196F3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: '#666' }}>Consultorias Agendadas</div>
            <div className="text-4xl font-black" style={{ color: '#2196F3' }}>
              {consultations.filter((c) => c.status === 'scheduled').length}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#e8f5e9' }}>
              <svg className="w-6 h-6" fill="none" stroke="#4CAF50" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-sm font-bold mb-1" style={{ color: '#666' }}>Consultorias Concluidas</div>
            <div className="text-4xl font-black" style={{ color: '#4CAF50' }}>
              {consultations.filter((c) => c.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            {['', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  filter === status
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                style={filter === status ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' } : { backgroundColor: '#f5f5f5' }}
              >
                {status === '' ? 'Todas' : statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Consultorias */}
        {consultations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
              <svg className="w-10 h-10" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-3" style={{ color: '#152F27' }}>
              Nenhuma consultoria encontrada
            </h2>
            <p className="text-lg font-semibold mb-6" style={{ color: '#666' }}>
              Agende sua primeira consultoria com nossos especialistas ESG
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3 rounded-xl font-black text-white transition-all hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
            >
              Agendar Agora
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="space-y-4">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="p-6 rounded-xl transition-all hover:shadow-md"
                  style={{ backgroundColor: '#f5f5f5' }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="px-4 py-1.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: statusColors[consultation.status].bg,
                            color: statusColors[consultation.status].text,
                          }}
                        >
                          {statusLabels[consultation.status]}
                        </span>
                        {consultation.topic && (
                          <span className="text-sm font-semibold" style={{ color: '#666' }}>
                            {consultation.topic}
                          </span>
                        )}
                      </div>
                      <div className="text-xl font-black mb-1" style={{ color: '#152F27' }}>
                        {formatDate(consultation.scheduledAt)}
                      </div>
                      <div className="text-sm font-semibold" style={{ color: '#7B9965' }}>
                        {formatTime(consultation.scheduledAt)} - {consultation.duration} minutos
                      </div>
                      {consultation.consultantName && (
                        <div className="text-sm font-semibold mt-2" style={{ color: '#666' }}>
                          Consultor: {consultation.consultantName}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {consultation.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => navigate(`/consultations/${consultation.id}`)}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                          >
                            Entrar
                          </button>
                          <button
                            onClick={() => handleCancel(consultation.id)}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all hover:bg-red-50"
                            style={{ borderColor: '#991B1B', color: '#991B1B' }}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {consultation.status === 'in_progress' && (
                        <button
                          onClick={() => navigate(`/consultations/${consultation.id}`)}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-lg"
                          style={{ backgroundColor: '#FF9800' }}
                        >
                          Continuar
                        </button>
                      )}
                      {consultation.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/consultations/${consultation.id}`)}
                          className="px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all hover:bg-gray-100"
                          style={{ borderColor: '#152F27', color: '#152F27' }}
                        >
                          Ver Detalhes
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de Agendamento */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
              <h2 className="text-2xl font-black mb-6" style={{ color: '#152F27' }}>
                Agendar Consultoria
              </h2>

              <div className="space-y-5">
                {/* Data */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                    Data
                  </label>
                  <input
                    type="date"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold"
                  />
                </div>

                {/* Horario */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Horario
                    </label>
                    {loadingSlots ? (
                      <div className="text-center py-4 font-semibold" style={{ color: '#666' }}>Carregando horarios...</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                              selectedTime === slot.time
                                ? 'text-white shadow-lg'
                                : slot.available
                                ? 'text-gray-700 hover:bg-gray-100'
                                : 'text-gray-400 cursor-not-allowed'
                            }`}
                            style={
                              selectedTime === slot.time
                                ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }
                                : { backgroundColor: slot.available ? '#f5f5f5' : '#fafafa' }
                            }
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Duracao */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                    Duracao
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1 hora e 30 minutos</option>
                    <option value={120}>2 horas</option>
                  </select>
                  <p className="text-xs font-semibold mt-2" style={{ color: '#7B9965' }}>
                    Isso consumira {selectedDuration / 60}h das suas horas disponiveis
                  </p>
                </div>

                {/* Topico */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                    Topico (opcional)
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Duvidas sobre relatorio ESG"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent font-semibold"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold border-2 transition-all hover:bg-gray-50"
                  style={{ borderColor: '#152F27', color: '#152F27' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedTime || scheduling}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-105 shadow-lg disabled:opacity-50 disabled:hover:scale-100"
                  style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                >
                  {scheduling ? 'Agendando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
