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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-brand-900">Carregando consultorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-brand-900 mb-1">Consultorias ESG</h1>
            <p className="text-sm text-gray-500">Agende e gerencie suas consultorias com especialistas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            disabled={!remainingHours || remainingHours.remaining <= 0}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + Agendar Consultoria
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Horas Disponíveis</p>
            <p className="text-4xl font-bold text-brand-700">{remainingHours?.remaining || 0}h</p>
            <p className="text-xs text-gray-400 mt-1">de {remainingHours?.total || 0}h no plano</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Consultorias Agendadas</p>
            <p className="text-4xl font-bold text-brand-900">
              {consultations.filter((c) => c.status === 'scheduled').length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Consultorias Concluídas</p>
            <p className="text-4xl font-bold" style={{ color: '#7B9965' }}>
              {consultations.filter((c) => c.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                  filter === status
                    ? 'text-white bg-brand-900'
                    : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {status === '' ? 'Todas' : statusLabels[status]}
              </button>
            ))}
          </div>
        </div>

        {/* Consultation List */}
        {consultations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <h2 className="text-2xl font-bold text-brand-900 mb-3">
              Nenhuma consultoria encontrada
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Agende sua primeira consultoria com nossos especialistas ESG
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3 font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
            >
              Agendar Agora
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-3">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="p-5 rounded-xl bg-gray-50 hover:bg-brand-100 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: statusColors[consultation.status].bg,
                            color: statusColors[consultation.status].text,
                          }}
                        >
                          {statusLabels[consultation.status]}
                        </span>
                        {consultation.topic && (
                          <span className="text-xs text-gray-400">{consultation.topic}</span>
                        )}
                      </div>
                      <p className="font-bold text-brand-900 mb-0.5">{formatDate(consultation.scheduledAt)}</p>
                      <p className="text-xs text-brand-700">
                        {formatTime(consultation.scheduledAt)} - {consultation.duration} minutos
                      </p>
                      {consultation.consultantName && (
                        <p className="text-xs text-gray-400 mt-1">Consultor: {consultation.consultantName}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {consultation.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => navigate(`/consultations/${consultation.id}`)}
                            className="px-5 py-2 text-xs font-medium text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
                          >
                            Entrar
                          </button>
                          <button
                            onClick={() => handleCancel(consultation.id)}
                            className="px-5 py-2 text-xs font-medium text-red-700 border border-red-200 rounded-full transition-all hover:bg-red-50"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {consultation.status === 'in_progress' && (
                        <button
                          onClick={() => navigate(`/consultations/${consultation.id}`)}
                          className="px-5 py-2 text-xs font-medium text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
                        >
                          Continuar
                        </button>
                      )}
                      {consultation.status === 'completed' && (
                        <button
                          onClick={() => navigate(`/consultations/${consultation.id}`)}
                          className="px-5 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50"
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

        {/* Schedule Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-brand-900 mb-6">Agendar Consultoria</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Data</label>
                  <input
                    type="date"
                    min={minDate}
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30 focus:border-brand-700"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Horário</label>
                    {loadingSlots ? (
                      <p className="text-center py-4 text-sm text-gray-400">Carregando horários...</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              selectedTime === slot.time
                                ? 'text-white bg-brand-900'
                                : slot.available
                                ? 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                                : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Duração</label>
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30 focus:border-brand-700"
                  >
                    <option value={30}>30 minutos</option>
                    <option value={60}>1 hora</option>
                    <option value={90}>1 hora e 30 minutos</option>
                    <option value={120}>2 horas</option>
                  </select>
                  <p className="text-xs text-brand-700 mt-2">
                    Isso consumirá {selectedDuration / 60}h das suas horas disponíveis
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Tópico (opcional)</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Ex: Dúvidas sobre relatório ESG"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-700/30 focus:border-brand-700"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 text-sm font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedTime || scheduling}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90 disabled:opacity-50"
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
