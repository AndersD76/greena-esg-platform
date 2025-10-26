import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-bold text-primary">GREENA</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/diagnosis/new" className="text-gray-700 hover:text-primary transition-colors">
                Novo Diagnóstico
              </Link>
              <Link to="/reports" className="text-gray-700 hover:text-primary transition-colors">
                Relatórios
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-primary transition-colors">
                Perfil
              </Link>
            </nav>
          )}

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  {user.companyName && (
                    <p className="text-xs text-gray-600">{user.companyName}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Cadastrar</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
