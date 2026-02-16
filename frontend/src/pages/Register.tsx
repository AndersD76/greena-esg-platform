import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    esgPainPoint: '',
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de uso e política de privacidade.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signUp(formData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
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
              to="/login"
              className="text-sm font-semibold text-brand-900 hover:text-brand-700 transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full">
          {/* Título */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-900 mb-2">Crie sua conta</h2>
            <p className="text-gray-500">Comece a avaliar suas práticas ESG gratuitamente</p>
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
                  Nome completo *
                </label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-900 mb-2">
                  Email *
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
                  Senha *
                </label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-900 mb-2">
                  Qual a maior dor no aspecto ESG que a sua empresa enfrenta?
                </label>
                <textarea
                  placeholder="Descreva brevemente o principal desafio ESG da sua empresa..."
                  value={formData.esgPainPoint}
                  onChange={(e) => setFormData({ ...formData, esgPainPoint: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-700/20 focus:border-brand-700 resize-none"
                />
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300"
                  style={{ accentColor: '#7B9965' }}
                />
                <label className="ml-2 text-sm text-gray-600">
                  Concordo com os{' '}
                  <Link to="/terms" className="font-semibold text-brand-700 hover:underline">
                    termos de uso
                  </Link>{' '}
                  e{' '}
                  <Link to="/privacy" className="font-semibold text-brand-700 hover:underline">
                    política de privacidade
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-brand-900 text-white font-semibold text-sm transition-all hover:bg-brand-900/90 disabled:opacity-50"
              >
                {loading ? 'Criando conta...' : 'Criar Conta Grátis'}
              </button>
            </form>

            <div className="mt-6 p-4 rounded-xl bg-brand-100">
              <p className="text-xs text-gray-500 text-center">
                Após o cadastro, complete seu perfil com os dados da empresa dentro da plataforma.
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Já tem uma conta?{' '}
                <Link to="/login" className="font-semibold text-brand-700 hover:underline">
                  Fazer login
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
