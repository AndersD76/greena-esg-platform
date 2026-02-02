import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, AdminConsultation } from '../../services/admin.service';

export default function AdminConsultations() {
  const [consultations, setConsultations] = useState<AdminConsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedConsultation, setSelectedConsultation] = useState<AdminConsultation | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadConsultations();
  }, [filter]);

  async function loadConsultations() {
    try {
      setLoading(true);
      const data = await adminService.getConsultations(filter || undefined);
      setConsultations(data);
    } catch (error) {
      console.error('Erro ao carregar consultorias:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus() {
    if (!selectedConsultation || !newStatus) return;

    try {
      await adminService.updateConsultationStatus(selectedConsultation.id, newStatus, notes || undefined);
      setShowStatusModal(false);
      setSelectedConsultation(null);
      setNewStatus('');
      setNotes('');
      loadConsultations();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da consultoria');
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'in_progress':
        return 'Em andamento';
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const scheduledCount = consultations.filter(c => c.status === 'scheduled').length;
  const inProgressCount = consultations.filter(c => c.status === 'in_progress').length;
  const completedCount = consultations.filter(c => c.status === 'completed').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="text-white py-6 px-8" style={{ background: 'linear-gradient(135deg, #152F27 0%, #1a3d33 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin" className="hover:opacity-80">
                <span className="text-2xl">←</span>
              </Link>
              <div>
                <h1 className="text-3xl font-black">Gestão de Consultorias</h1>
                <p className="text-green-200 mt-1">Gerenciar agendamentos e reuniões</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black" style={{ color: '#152F27' }}>{consultations.length}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Total</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black text-blue-600">{scheduledCount}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Agendadas</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black text-yellow-600">{inProgressCount}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Em andamento</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-black text-green-600">{completedCount}</p>
            <p className="text-sm font-bold" style={{ color: '#666' }}>Concluídas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-2">
            {['', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                  filter === status ? 'text-white' : 'border-2'
                }`}
                style={
                  filter === status
                    ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }
                    : { borderColor: '#e5e5e5', color: '#666' }
                }
              >
                {status === '' ? 'Todas' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Consultations List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
              <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando consultorias...</p>
            </div>
          ) : consultations.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-xl" style={{ color: '#666' }}>Nenhuma consultoria encontrada</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {consultations.map((consultation) => {
                const { date, time } = formatDate(consultation.scheduledAt);
                return (
                  <div key={consultation.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(consultation.status)}`}>
                            {getStatusLabel(consultation.status)}
                          </span>
                          <span className="text-sm font-bold" style={{ color: '#152F27' }}>
                            {date} às {time}
                          </span>
                          <span className="text-sm" style={{ color: '#666' }}>
                            ({consultation.duration} min)
                          </span>
                        </div>

                        <div className="flex items-center gap-6">
                          <div>
                            <p className="font-bold" style={{ color: '#152F27' }}>{consultation.user.name}</p>
                            <p className="text-sm" style={{ color: '#666' }}>{consultation.user.companyName || consultation.user.email}</p>
                          </div>

                          {consultation.topic && (
                            <div>
                              <p className="text-xs font-bold" style={{ color: '#666' }}>TÓPICO</p>
                              <p className="text-sm" style={{ color: '#152F27' }}>{consultation.topic}</p>
                            </div>
                          )}

                          {consultation._count.messages > 0 && (
                            <div>
                              <p className="text-xs font-bold" style={{ color: '#666' }}>MENSAGENS</p>
                              <p className="text-sm" style={{ color: '#152F27' }}>{consultation._count.messages}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {consultation.meetingUrl && consultation.status === 'scheduled' && (
                          <a
                            href={consultation.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg font-bold text-sm text-white"
                            style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                          >
                            Entrar na Sala
                          </a>
                        )}
                        <button
                          onClick={() => { setSelectedConsultation(consultation); setNewStatus(consultation.status); setShowStatusModal(true); }}
                          className="px-4 py-2 rounded-lg font-bold text-sm border-2"
                          style={{ borderColor: '#152F27', color: '#152F27' }}
                        >
                          Alterar Status
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && selectedConsultation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Alterar Status</h3>
            <p className="mb-4" style={{ color: '#666' }}>
              Consultoria de <strong>{selectedConsultation.user.name}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>Novo Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2"
                style={{ borderColor: '#e5e5e5' }}
              >
                <option value="scheduled">Agendada</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>Observações (opcional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 resize-none"
                style={{ borderColor: '#e5e5e5' }}
                rows={3}
                placeholder="Adicionar observações..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => { setShowStatusModal(false); setSelectedConsultation(null); setNewStatus(''); setNotes(''); }}
                className="flex-1 px-6 py-3 border-2 rounded-xl font-bold"
                style={{ borderColor: '#152F27', color: '#152F27' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                className="flex-1 px-6 py-3 text-white font-bold rounded-xl"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
