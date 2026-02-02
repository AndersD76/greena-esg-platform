import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService, AdminUser } from '../../services/admin.service';

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [additionalHours, setAdditionalHours] = useState(0);
  const [hoursReason, setHoursReason] = useState('');

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await adminService.getUsers(page, 10, search || undefined);
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(user: AdminUser) {
    if (!confirm(`Deseja ${user.isActive ? 'desativar' : 'ativar'} o usuário ${user.name}?`)) return;

    try {
      await adminService.toggleUserStatus(user.id);
      loadUsers();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status do usuário');
    }
  }

  async function handleUpdateRole() {
    if (!selectedUser || !newRole) return;

    try {
      await adminService.updateUserRole(selectedUser.id, newRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      setNewRole('');
      loadUsers();
    } catch (error) {
      console.error('Erro ao alterar role:', error);
      alert('Erro ao alterar permissão do usuário');
    }
  }

  async function handleAddHours() {
    if (!selectedUser || !additionalHours || !hoursReason) return;

    try {
      await adminService.addConsultationHours(selectedUser.id, additionalHours, hoursReason);
      setShowHoursModal(false);
      setSelectedUser(null);
      setAdditionalHours(0);
      setHoursReason('');
      alert('Horas adicionadas com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar horas:', error);
      alert('Erro ao adicionar horas');
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'Usuário';
    }
  };

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
                <h1 className="text-3xl font-black">Gestão de Usuários</h1>
                <p className="text-green-200 mt-1">Gerenciar usuários e permissões</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Buscar por nome, email ou empresa..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="flex-1 px-4 py-3 rounded-xl border-2 focus:outline-none"
              style={{ borderColor: '#e5e5e5' }}
            />
            <button
              onClick={() => loadUsers()}
              className="px-6 py-3 text-white font-bold rounded-xl"
              style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
              <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando usuários...</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#152F27' }}>Usuário</th>
                    <th className="px-6 py-4 text-left text-sm font-bold" style={{ color: '#152F27' }}>Empresa</th>
                    <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Permissão</th>
                    <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Status</th>
                    <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Atividade</th>
                    <th className="px-6 py-4 text-center text-sm font-bold" style={{ color: '#152F27' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-bold" style={{ color: '#152F27' }}>{user.name}</p>
                        <p className="text-sm" style={{ color: '#666' }}>{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p style={{ color: '#666' }}>{user.companyName || '-'}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-xs" style={{ color: '#666' }}>
                          <p>{user._count?.diagnoses || 0} diagnósticos</p>
                          <p>{user._count?.consultations || 0} consultorias</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedUser(user); setNewRole(user.role); setShowRoleModal(true); }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                            title="Alterar permissão"
                          >
                            🔑
                          </button>
                          <button
                            onClick={() => { setSelectedUser(user); setShowHoursModal(true); }}
                            className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                            title="Adicionar horas"
                          >
                            ⏰
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-2 rounded-lg ${user.isActive ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                            title={user.isActive ? 'Desativar' : 'Ativar'}
                          >
                            {user.isActive ? '🚫' : '✅'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                    style={{ color: '#152F27' }}
                  >
                    ← Anterior
                  </button>
                  <span className="px-4 py-2 font-bold" style={{ color: '#666' }}>
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                    style={{ color: '#152F27' }}
                  >
                    Próxima →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Alterar Permissão</h3>
            <p className="mb-4" style={{ color: '#666' }}>Usuário: <strong>{selectedUser.name}</strong></p>

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 mb-6"
              style={{ borderColor: '#e5e5e5' }}
            >
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>

            <div className="flex gap-4">
              <button
                onClick={() => { setShowRoleModal(false); setSelectedUser(null); }}
                className="flex-1 px-6 py-3 border-2 rounded-xl font-bold"
                style={{ borderColor: '#152F27', color: '#152F27' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateRole}
                className="flex-1 px-6 py-3 text-white font-bold rounded-xl"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hours Modal */}
      {showHoursModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-black mb-4" style={{ color: '#152F27' }}>Adicionar Horas</h3>
            <p className="mb-4" style={{ color: '#666' }}>Usuário: <strong>{selectedUser.name}</strong></p>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>Horas a adicionar</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={additionalHours}
                onChange={(e) => setAdditionalHours(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border-2"
                style={{ borderColor: '#e5e5e5' }}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>Motivo</label>
              <textarea
                value={hoursReason}
                onChange={(e) => setHoursReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 resize-none"
                style={{ borderColor: '#e5e5e5' }}
                rows={3}
                placeholder="Ex: Bonificação comercial, correção de erro..."
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => { setShowHoursModal(false); setSelectedUser(null); setAdditionalHours(0); setHoursReason(''); }}
                className="flex-1 px-6 py-3 border-2 rounded-xl font-bold"
                style={{ borderColor: '#152F27', color: '#152F27' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleAddHours}
                disabled={!additionalHours || !hoursReason}
                className="flex-1 px-6 py-3 text-white font-bold rounded-xl disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
