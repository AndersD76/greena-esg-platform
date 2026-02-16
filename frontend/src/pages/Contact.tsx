import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));

    setSuccess(true);
    setSending(false);
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: ''
    });

    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-14" />
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/#sobre" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Sobre
              </Link>
              <Link to="/#pilares" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Pilares ESG
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                Acessar Plataforma
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ background: 'linear-gradient(135deg, #152F27 0%, #2d5a45 100%)' }}>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center text-white">
            <h1 className="text-6xl font-black mb-6">Entre em Contato</h1>
            <p className="text-2xl opacity-90 max-w-3xl mx-auto">
              Estamos prontos para ajudar sua empresa na transformação ESG
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white p-10 rounded-3xl shadow-lg">
              <h2 className="text-3xl font-black mb-6" style={{ color: '#152F27' }}>
                Envie sua mensagem
              </h2>
              <p className="text-gray-600 mb-8">
                Preencha o formulário abaixo e nossa equipe entrará em contato em até 24 horas.
              </p>

              {success && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border-2 border-green-200">
                  <p className="text-sm font-semibold text-green-700">
                    Mensagem enviada com sucesso! Entraremos em contato em breve.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                    style={{ borderColor: '#e0e0e0' }}
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                    style={{ borderColor: '#e0e0e0' }}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                      placeholder="Sua empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                      style={{ borderColor: '#e0e0e0' }}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                    Assunto *
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600"
                    style={{ borderColor: '#e0e0e0' }}
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="demo">Solicitar demonstração</option>
                    <option value="quote">Solicitar orçamento</option>
                    <option value="support">Suporte técnico</option>
                    <option value="partnership">Parcerias</option>
                    <option value="other">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: '#152F27' }}>
                    Mensagem *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border-2 font-semibold transition-all focus:outline-none focus:border-green-600 resize-none"
                    style={{ borderColor: '#e0e0e0' }}
                    placeholder="Como podemos ajudar?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 rounded-xl text-white font-black text-lg transition-all hover:opacity-90 disabled:opacity-50 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                >
                  {sending ? 'Enviando...' : 'Enviar Mensagem'}
                </button>
              </form>
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-5xl font-black mb-6">Pronto para Começar?</h2>
          <p className="text-xl mb-8 opacity-90">
            Cadastre-se gratuitamente e inicie sua avaliação ESG hoje mesmo
          </p>
          <Link
            to="/register"
            className="inline-block px-12 py-4 bg-white text-xl font-black rounded-xl transition-all hover:scale-105 shadow-lg"
            style={{ color: '#152F27' }}
          >
            Criar Conta Grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 text-white text-center">
        <p className="text-sm">© 2025 engreena ESG Platform. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
