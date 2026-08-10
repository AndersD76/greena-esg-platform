import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { usePlan } from '../../hooks/usePlan';
import GuidedTour from '../GuidedTour';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isFreePlan } = usePlan();
  const [showTour, setShowTour] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string, exact = false) =>
    `text-sm font-medium transition-colors ${
      isActive(path, exact)
        ? 'text-brand-700'
        : 'text-brand-900/70 hover:text-brand-900'
    }`;

  const mobileNavLinkClass = (path: string, exact = false) =>
    `block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive(path, exact)
        ? 'text-brand-700 bg-brand-50'
        : 'text-brand-900/70 hover:bg-gray-50'
    }`;

  return (
    <header className="bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center">
            <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-10" />
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className={navLinkClass('/dashboard', true)}>
                Dashboard
              </Link>
              <Link to="/diagnosis/new" className={navLinkClass('/diagnosis')}>
                Novo Diagnóstico
              </Link>
              {!isFreePlan && (
                <>
                  <Link to="/insights" className={navLinkClass('/insights', true)}>
                    Planos de Ação
                  </Link>
                  <Link to="/reports" className={navLinkClass('/reports', true)}>
                    Relatórios
                  </Link>
                  <Link to="/ai-chat" className={navLinkClass('/ai-chat', true)}>
                    Consultor IA
                  </Link>
                  <Link to="/consultations" className={navLinkClass('/consultations')}>
                    Consultorias
                  </Link>
                </>
              )}
              {isFreePlan && (
                <Link to="/checkout" className="text-sm font-semibold text-brand-700 hover:text-brand-900 transition-colors">
                  Fazer Upgrade
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className={navLinkClass('/admin')}>
                  Admin
                </Link>
              )}
              <Link to="/manual" className={navLinkClass('/manual', true)}>
                Manual
              </Link>
              <button onClick={() => setShowTour(true)} className="text-sm font-medium text-brand-900/70 hover:text-brand-900 transition-colors">
                Tour
              </button>
              <Link to="/profile" className={navLinkClass('/profile', true)}>
                Perfil
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-brand-900">{user.name}</p>
                  {user.companyName && (
                    <p className="text-xs text-brand-700">{user.companyName}</p>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="hidden sm:block px-5 py-2 text-sm font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button className="px-5 py-2 text-sm font-medium text-brand-900 transition-colors hover:text-brand-700">
                    Entrar
                  </button>
                </Link>
                <Link to="/register">
                  <button className="px-5 py-2 text-sm font-medium text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                    Cadastrar
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {user && mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <nav className="px-4 py-3 space-y-1" onClick={() => setMobileMenuOpen(false)}>
            <Link to="/dashboard" className={mobileNavLinkClass('/dashboard', true)}>Dashboard</Link>
            <Link to="/diagnosis/new" className={mobileNavLinkClass('/diagnosis')}>Novo Diagnóstico</Link>
            {!isFreePlan && (
              <>
                <Link to="/insights" className={mobileNavLinkClass('/insights', true)}>Planos de Ação</Link>
                <Link to="/reports" className={mobileNavLinkClass('/reports', true)}>Relatórios</Link>
                <Link to="/ai-chat" className={mobileNavLinkClass('/ai-chat', true)}>Consultor IA</Link>
                <Link to="/consultations" className={mobileNavLinkClass('/consultations')}>Consultorias</Link>
              </>
            )}
            {isFreePlan && (
              <Link to="/checkout" className="block px-4 py-3 text-sm font-semibold text-brand-700">Fazer Upgrade</Link>
            )}
            {isAdmin && <Link to="/admin" className={mobileNavLinkClass('/admin')}>Admin</Link>}
            <Link to="/manual" className={mobileNavLinkClass('/manual', true)}>Manual</Link>
            <Link to="/profile" className={mobileNavLinkClass('/profile', true)}>Perfil</Link>
            <div className="border-t border-gray-100 pt-2 mt-2">
              <button onClick={handleSignOut} className="block w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">
                Sair
              </button>
            </div>
          </nav>
        </div>
      )}

      <GuidedTour isOpen={showTour} onClose={() => setShowTour(false)} />
    </header>
  );
}
