import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl">🌱</span>
            <span className="text-3xl font-bold text-primary ml-2">GREENA</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Crie sua conta</h2>
          <p className="text-gray-600 mt-2">Comece a avaliar suas práticas ESG</p>
        </div>

        <Card>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Nome da Empresa (opcional)"
              type="text"
              placeholder="Sua Empresa LTDA"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />

            <Input
              label="Senha"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
            />

            <div className="flex items-start">
              <input
                type="checkbox"
                className="mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                required
              />
              <label className="ml-2 text-sm text-gray-700">
                Concordo com os{' '}
                <a href="#" className="text-primary hover:underline">
                  termos de uso
                </a>{' '}
                e{' '}
                <a href="#" className="text-primary hover:underline">
                  política de privacidade
                </a>
              </label>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Criar conta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
