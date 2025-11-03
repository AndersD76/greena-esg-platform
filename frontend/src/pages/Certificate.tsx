import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CertificationLevel {
  level: 'bronze' | 'silver' | 'gold';
  name: string;
  title: string;
  message: string;
  color: string;
  icon: string;
  scoreRange: string;
  characteristics: string[];
}

interface Benefit {
  id: string;
  level: string;
  benefitType: string;
  title: string;
  description: string;
  value: string | null;
  order: number;
}

interface Certificate {
  id: string;
  userId: string;
  diagnosisId: string;
  certificateNumber: string;
  level: string;
  score: number;
  issuedAt: string;
  expiresAt: string | null;
  isValid: boolean;
  user: {
    name: string;
    email: string;
    companyName: string | null;
  };
  diagnosis: {
    id: string;
    createdAt: string;
  };
  certificationLevel: CertificationLevel;
  benefits: Benefit[];
}

export default function Certificate() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadCertificate();
  }, [certificateId]);

  const loadCertificate = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `http://localhost:3000/api/certificates/${certificateId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setCertificate(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar certificado:', err);
      setError(err.response?.data?.error || 'Erro ao carregar certificado');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    alert('Funcionalidade de download de PDF será implementada em breve!');
    // TODO: Implementar geração de PDF
  };

  const shareCertificate = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Certificado ${certificate?.certificationLevel.name} - GREENA ESG`,
        text: `Confira meu Certificado ESG ${certificate?.level.toUpperCase()}!`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Certificado não encontrado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { certificationLevel, user } = certificate;
  const medalColors: Record<string, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700'
  };

  const issueDate = new Date(certificate.issuedAt).toLocaleDateString('pt-BR');
  const expiryDate = certificate.expiresAt ? new Date(certificate.expiresAt).toLocaleDateString('pt-BR') : 'Indeterminado';

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #f0f9f4 0%, white 100%)' }}>
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Voltar
          </button>
          <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-12" />
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Certificate Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4" style={{ borderColor: medalColors[certificate.level] }}>
          {/* Header Section */}
          <div className="relative p-12 text-center" style={{ background: `linear-gradient(135deg, ${medalColors[certificate.level]}20 0%, white 100%)` }}>
            <div className="absolute top-6 right-6">
              {certificate.isValid ? (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Válido
                </span>
              ) : (
                <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold">Inválido</span>
              )}
            </div>

            <h1 className="text-5xl font-black mb-6" style={{ color: medalColors[certificate.level] }}>
              Certificado {certificationLevel.name}
            </h1>
            <p className="text-2xl text-gray-600 font-semibold mb-2">{certificationLevel.title}</p>
            <p className="text-lg text-gray-500 italic max-w-2xl mx-auto">{certificationLevel.message}</p>

            {/* Score Badge */}
            <div className="mt-8 inline-flex items-center gap-4 px-8 py-4 rounded-2xl border-2" style={{ borderColor: medalColors[certificate.level], backgroundColor: medalColors[certificate.level] + '10' }}>
              <div className="text-center">
                <div className="text-sm text-gray-600 font-semibold mb-1">Pontuação ESG</div>
                <div className="text-5xl font-black" style={{ color: medalColors[certificate.level] }}>
                  {certificate.score.toFixed(1)}
                </div>
              </div>
              <div className="w-px h-16 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-sm text-gray-600 font-semibold mb-1">Nível</div>
                <div className="text-3xl font-black" style={{ color: medalColors[certificate.level] }}>
                  {certificate.level.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="p-12 border-t-4" style={{ borderColor: medalColors[certificate.level] + '40' }}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-800 mb-3">Certificamos que</h2>
              <p className="text-4xl font-black mb-2" style={{ color: medalColors[certificate.level] }}>
                {user.companyName || user.name}
              </p>
              <p className="text-lg text-gray-600">
                Concluiu com sucesso a avaliação ESG GREENA, demonstrando compromisso com<br/>
                práticas ambientais, sociais e de governança responsáveis.
              </p>
            </div>

            {/* Certificate Info Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 font-semibold mb-2">Número do Certificado</div>
                <div className="text-lg font-black text-gray-800">{certificate.certificateNumber}</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 font-semibold mb-2">Data de Emissão</div>
                <div className="text-lg font-black text-gray-800">{issueDate}</div>
              </div>
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 font-semibold mb-2">Validade</div>
                <div className="text-lg font-black text-gray-800">{expiryDate}</div>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-black text-gray-800 mb-6 text-center">Benefícios Inclusos</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {certificate.benefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className="flex items-start gap-4 p-4 rounded-xl border-2 hover:shadow-md transition"
                    style={{ borderColor: medalColors[certificate.level] + '30', backgroundColor: medalColors[certificate.level] + '05' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: medalColors[certificate.level] }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 mb-1">{benefit.title}</h4>
                      <p className="text-sm text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={downloadPDF}
                className="px-8 py-4 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg flex items-center gap-3"
                style={{ backgroundColor: medalColors[certificate.level] }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Baixar PDF
              </button>
              <button
                onClick={shareCertificate}
                className="px-8 py-4 border-2 font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-3"
                style={{ borderColor: medalColors[certificate.level], color: medalColors[certificate.level] }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Compartilhar
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl transition-all hover:bg-gray-300"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="px-12 py-8 border-t-2" style={{ borderColor: medalColors[certificate.level] + '30', backgroundColor: medalColors[certificate.level] + '05' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 font-semibold mb-2">Autenticidade</div>
                <p className="text-xs text-gray-600">
                  Este certificado pode ser validado em greena.com.br/validar/{certificate.certificateNumber}
                </p>
              </div>
              <div className="text-right">
                <img src="/images/Logo_Vertical_Colorida.png" alt="GREENA" className="h-16 ml-auto mb-2" />
                <p className="text-xs text-gray-500 font-semibold">GREENA ESG Platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Characteristics */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg">
          <h3 className="text-2xl font-black text-gray-800 mb-6 text-center">Características deste Nível</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificationLevel.characteristics.map((char, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold" style={{ backgroundColor: medalColors[certificate.level] }}>
                  {idx + 1}
                </div>
                <p className="text-sm font-semibold text-gray-700">{char}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
