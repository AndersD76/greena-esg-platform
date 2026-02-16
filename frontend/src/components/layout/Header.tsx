import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import { subscriptionService } from '../../services/subscription.service';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFreePlan, setIsFreePlan] = useState(true);

  useEffect(() => {
    if (user) {
      subscriptionService.getActivePlan()
        .then((plan) => setIsFreePlan(plan.isFreePlan))
        .catch(() => setIsFreePlan(true));
    }
  }, [user]);

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

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
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
                    Insights
                  </Link>
                  <Link to="/reports" className={navLinkClass('/reports', true)}>
                    Relatórios
                  </Link>
                  <Link to="/consultations" className={navLinkClass('/consultations')}>
                    Consultorias
                  </Link>
                </>
              )}
              {isFreePlan && (
                <Link
                  to="/checkout"
                  className="text-sm font-semibold text-brand-700 hover:text-brand-900 transition-colors"
                >
                  Fazer Upgrade
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className={navLinkClass('/admin')}>
                  Admin
                </Link>
              )}
              <Link to="/profile" className={navLinkClass('/profile', true)}>
                Perfil
              </Link>
            </nav>
          )}

          <div className="flex items-center gap-3">
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
                  className="px-5 py-2 text-sm font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50"
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
    </header>
  );
}
