import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-14" />
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className={`text-sm font-semibold transition-colors hover:text-green-700 pb-1 ${
                  location.pathname === '/dashboard' ? 'border-b-2' : ''
                }`}
                style={{
                  color: location.pathname === '/dashboard' ? '#7B9965' : '#152F27',
                  borderColor: '#7B9965'
                }}
              >
                Dashboard
              </Link>
              <Link
                to="/diagnosis/new"
                className={`text-sm font-semibold transition-colors hover:text-green-700 pb-1 ${
                  location.pathname.startsWith('/diagnosis') ? 'border-b-2' : ''
                }`}
                style={{
                  color: location.pathname.startsWith('/diagnosis') ? '#7B9965' : '#152F27',
                  borderColor: '#7B9965'
                }}
              >
                Novo Diagnóstico
              </Link>
              <Link
                to="/insights"
                className={`text-sm font-semibold transition-colors hover:text-green-700 pb-1 ${
                  location.pathname === '/insights' ? 'border-b-2' : ''
                }`}
                style={{
                  color: location.pathname === '/insights' ? '#7B9965' : '#152F27',
                  borderColor: '#7B9965'
                }}
              >
                Insights
              </Link>
              <Link
                to="/reports"
                className={`text-sm font-semibold transition-colors hover:text-green-700 pb-1 ${
                  location.pathname === '/reports' ? 'border-b-2' : ''
                }`}
                style={{
                  color: location.pathname === '/reports' ? '#7B9965' : '#152F27',
                  borderColor: '#7B9965'
                }}
              >
                Relatórios
              </Link>
              <Link
                to="/consultations"
                className={`text-sm font-semibold transition-colors hover:text-green-700 pb-1 ${
                  location.pathname.startsWith('/consultations') ? 'border-b-2' : ''
                }`}
                style={{
                  color: location.pathname.startsWith('/consultations') ? '#7B9965' : '#152F27',
                  borderColor: '#7B9965'
                }}
              >
                Consultorias
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`text-sm font-semibold transition-colors hover:text-green-700 pb-1 ${
                    location.pathname.startsWith('/admin') ? 'border-b-2' : ''
                  }`}
                  style={{
                    color: location.pathname.startsWith('/admin') ? '#7B9965' : '#152F27',
                    borderColor: '#7B9965'
                  }}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/profile"
                className={`text-sm font-semibold transition-colors hover:text-green-700 pb-1 ${
                  location.pathname === '/profile' ? 'border-b-2' : ''
                }`}
                style={{
                  color: location.pathname === '/profile' ? '#7B9965' : '#152F27',
                  borderColor: '#7B9965'
                }}
              >
                Perfil
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold" style={{ color: '#152F27' }}>{user.name}</p>
                  {user.companyName && (
                    <p className="text-xs font-semibold" style={{ color: '#7B9965' }}>{user.companyName}</p>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button
                    className="px-6 py-2.5 text-sm font-semibold transition-colors"
                    style={{ color: '#152F27' }}
                  >
                    Entrar
                  </button>
                </Link>
                <Link to="/register">
                  <button
                    className="px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                  >
                    Cadastrar
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
