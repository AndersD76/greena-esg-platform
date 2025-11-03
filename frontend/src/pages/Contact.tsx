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
              <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-14" />
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/#sobre" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Sobre
              </Link>
              <Link to="/#pilares" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Pilares ESG
              </Link>
              <Link to="/about" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Quem Somos
              </Link>
              <Link to="/solutions" className="text-sm font-semibold transition-colors" style={{ color: '#152F27' }}>
                Soluções
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
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
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

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Info Cards */}
              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#7B9965' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-2" style={{ color: '#152F27' }}>Endereço</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Av. Paulista, 1000 - 10º andar<br/>
                      Bela Vista, São Paulo - SP<br/>
                      CEP 01310-100
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#924131' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-2" style={{ color: '#152F27' }}>Telefone</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <a href="tel:+551133334444" className="hover:underline">(11) 3333-4444</a><br/>
                      <a href="tel:+5511999998888" className="hover:underline">(11) 99999-8888</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#152F27' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-2" style={{ color: '#152F27' }}>Email</h3>
                    <p className="text-gray-700 leading-relaxed">
                      <a href="mailto:contato@greena.com.br" className="hover:underline">contato@greena.com.br</a><br/>
                      <a href="mailto:suporte@greena.com.br" className="hover:underline">suporte@greena.com.br</a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EFD4A8' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#152F27" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-2" style={{ color: '#152F27' }}>Horário de Atendimento</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Segunda a Sexta: 9h às 18h<br/>
                      Sábado: 9h às 13h<br/>
                      Domingo e feriados: Fechado
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white p-8 rounded-3xl shadow-lg">
                <h3 className="text-xl font-black mb-4" style={{ color: '#152F27' }}>Redes Sociais</h3>
                <div className="flex gap-4">
                  {[
                    { name: 'LinkedIn', icon: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', color: '#0077B5' },
                    { name: 'Instagram', icon: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M6.5 2h11A4.5 4.5 0 0 1 22 6.5v11a4.5 4.5 0 0 1-4.5 4.5h-11A4.5 4.5 0 0 1 2 17.5v-11A4.5 4.5 0 0 1 6.5 2z', color: '#E4405F' },
                    { name: 'Facebook', icon: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z', color: '#1877F2' },
                    { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z', color: '#1DA1F2' }
                  ].map((social, i) => (
                    <a
                      key={i}
                      href="#"
                      className="w-12 h-12 rounded-full flex items-center justify-center hover:opacity-80 transition"
                      style={{ backgroundColor: social.color }}
                      title={social.name}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d={social.icon}/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black mb-8 text-center" style={{ color: '#152F27' }}>
            Nossa Localização
          </h2>
          <div className="bg-gray-200 rounded-3xl overflow-hidden shadow-lg" style={{ height: '450px' }}>
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mx-auto mb-4">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <p className="text-lg font-semibold">Mapa interativo será carregado aqui</p>
              </div>
            </div>
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
        <p className="text-sm">© 2025 GREENA ESG Platform. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
