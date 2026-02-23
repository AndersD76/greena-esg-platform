import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000/api' : '/api');

interface PublicProfileData {
  company: { companyName: string | null; sector: string | null; city: string | null; slug: string | null };
  scores: { overall: number; environmental: number; social: number; governance: number } | null;
  certification: { level: string; name: string; title: string; message: string; color: string; scoreRange: string; characteristics: string[] } | null;
  certificate: { number: string; level: string; issuedAt: string; expiresAt: string | null; isValid: boolean } | null;
  completedAt: string | null;
}

const medalColors: Record<string, string> = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700' };
const PILLAR_COLORS = { environmental: '#7B9965', social: '#924131', governance: '#b8963a' };

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`${API_BASE}/public/company/${slug}`)
      .then(res => { if (!res.ok) throw new Error('Not found'); return res.json(); })
      .then(setData)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#7B9965] border-t-transparent"></div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Empresa não encontrada</h1>
          <p className="text-gray-500 mb-6">Este perfil ESG não existe ou não está público.</p>
          <Link to="/" className="px-8 py-3 bg-[#152F27] text-white rounded-full font-semibold hover:opacity-90 transition inline-block">
            Ir para engreena
          </Link>
        </div>
      </div>
    );
  }

  const { company, scores, certification, certificate, completedAt } = data;
  const level = certification?.level || 'bronze';
  const color = medalColors[level] || '#CD7F32';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.href)}`;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #152F27 0%, #1a3a30 40%, #f9fafb 40%)' }}>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-10 mx-auto opacity-80" />
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4" style={{ borderColor: color }}>
          {/* Header */}
          <div className="p-10 text-center" style={{ background: `linear-gradient(135deg, ${color}15 0%, white 100%)` }}>
            {/* Selo */}
            <img
              src={`/images/assets/selo-${level === 'gold' ? 'ouro' : level === 'silver' ? 'prata' : 'bronze'}.png`}
              alt={`Selo ${certification?.name}`}
              className="w-32 h-32 object-contain mx-auto mb-4"
            />
            <h1 className="text-3xl font-black text-[#152F27] mb-1">{company.companyName || 'Empresa'}</h1>
            {company.sector && <p className="text-sm text-gray-500">{company.sector}{company.city ? ` — ${company.city}` : ''}</p>}

            {certification && (
              <div className="mt-4">
                <span className="text-2xl font-black" style={{ color }}>{certification.name}</span>
                <p className="text-sm text-gray-500 mt-1">{certification.title}</p>
              </div>
            )}
          </div>

          {/* Scores */}
          {scores && (
            <div className="px-10 py-8 border-t" style={{ borderColor: color + '30' }}>
              {/* Overall */}
              <div className="text-center mb-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Score ESG Geral</p>
                <span className="text-6xl font-black" style={{ color }}>{scores.overall.toFixed(0)}</span>
                <span className="text-lg text-gray-400 ml-1">/100</span>
              </div>

              {/* Pillar bars */}
              <div className="space-y-4">
                {[
                  { label: 'Ambiental', value: scores.environmental, color: PILLAR_COLORS.environmental },
                  { label: 'Social', value: scores.social, color: PILLAR_COLORS.social },
                  { label: 'Governança', value: scores.governance, color: PILLAR_COLORS.governance },
                ].map(p => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-600">{p.label}</span>
                      <span className="text-lg font-bold" style={{ color: p.color }}>{p.value.toFixed(0)}</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.value}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificate */}
          {certificate && (
            <div className="px-10 py-6 border-t" style={{ borderColor: color + '30', backgroundColor: color + '05' }}>
              <div className="flex items-center gap-6">
                <img src={qrUrl} alt="QR Code" className="w-24 h-24 rounded-lg border border-gray-200" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Certificado Verificado</p>
                  <p className="text-lg font-bold text-[#152F27]">#{certificate.number}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Emitido em {new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}
                    {certificate.expiresAt && ` — Válido até ${new Date(certificate.expiresAt).toLocaleDateString('pt-BR')}`}
                  </p>
                  {certificate.isValid && (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><polyline points="20 6 9 17 4 12" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Certificado Válido
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-10 py-6 bg-[#152F27] text-center">
            <p className="text-white/60 text-xs">Verificado pela plataforma</p>
            <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-8 mx-auto mt-2 opacity-70" />
            {completedAt && <p className="text-white/40 text-[10px] mt-2">Última avaliação: {new Date(completedAt).toLocaleDateString('pt-BR')}</p>}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-3">Quer certificar sua empresa?</p>
          <Link to="/register" className="inline-block px-8 py-3 bg-[#152F27] text-white rounded-full font-semibold hover:opacity-90 transition">
            Criar Conta Gratuita
          </Link>
        </div>
      </div>
    </div>
  );
}
