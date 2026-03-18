import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', exact: true },
  { path: '/admin/users', label: 'Usuários', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { path: '/admin/diagnoses', label: 'Diagnósticos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { path: '/admin/subscriptions', label: 'Assinaturas', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { path: '/admin/consultations', label: 'Consultorias', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { path: '/admin/reports', label: 'Relatórios', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

export function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-900 text-white flex flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-8 brightness-0 invert" />
          </Link>
          <p className="text-xs text-white/40 mt-1">Painel Administrativo</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-white/40 uppercase">{user?.role}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/dashboard" className="flex-1 text-center text-xs text-white/50 hover:text-white py-1.5 rounded bg-white/5 hover:bg-white/10 transition-all">
              Ir ao App
            </Link>
            <button onClick={signOut} className="flex-1 text-xs text-white/50 hover:text-white py-1.5 rounded bg-white/5 hover:bg-white/10 transition-all">
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
