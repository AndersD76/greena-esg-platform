import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-10" />
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-brand-900 hover:text-brand-700 transition-colors"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          {/* Título */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-900 mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-500">Faça login para acessar sua plataforma ESG</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-brand-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-900 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                    style={{ accentColor: '#7B9965' }}
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Lembrar-me
                  </span>
                </label>
                <a href="#" className="text-sm font-medium text-brand-700 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-brand-900 text-white font-semibold text-sm transition-all hover:bg-brand-900/90 disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar na Plataforma'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Não tem uma conta?{' '}
                <Link to="/register" className="font-semibold text-brand-700 hover:underline">
                  Cadastre-se grátis
                </Link>
              </p>
            </div>
          </div>

          {/* Voltar para home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-brand-900 transition-colors inline-flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar para página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
