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
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #152F27 0%, #2d5a45 50%, #7B9965 100%)' }}>
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-14" />
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold transition-colors"
              style={{ color: '#152F27' }}
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full">
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-32" />
            </div>
            <h2 className="text-4xl font-black text-white mb-3">Bem-vindo de volta</h2>
            <p className="text-xl text-white opacity-90">Faça login para acessar sua plataforma ESG</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl" style={{ backgroundColor: '#fee', border: '2px solid #fcc' }}>
                <p className="text-sm font-semibold" style={{ color: '#c33' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                  style={{ borderColor: '#e0e0e0' }}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                  style={{ borderColor: '#e0e0e0' }}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#7B9965' }}
                  />
                  <span className="ml-2 text-sm font-semibold" style={{ color: '#152F27' }}>
                    Lembrar-me
                  </span>
                </label>
                <a href="#" className="text-sm font-bold hover:underline" style={{ color: '#7B9965' }}>
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl text-white font-black text-lg transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                {loading ? 'Entrando...' : 'Entrar na Plataforma'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-semibold" style={{ color: '#666' }}>
                Não tem uma conta?{' '}
                <Link to="/register" className="font-black hover:underline" style={{ color: '#7B9965' }}>
                  Cadastre-se grátis
                </Link>
              </p>
            </div>
          </div>

          {/* Voltar para home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-sm font-bold text-white hover:underline flex items-center justify-center gap-2">
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
