import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';
import { reportService, FullReport, PillarBreakdown } from '../services/report.service';
import api from '../services/api';

// Cores do engreena
const COLORS = {
  primary: '#152F27',
  accent: '#7B9965',
  environmental: '#7B9965',
  social: '#924131',
  governance: '#b8963a',
  bgEnv: '#f0f7ed',
  bgSoc: '#fdf2f0',
  bgGov: '#faf6ee',
};

const pillarColors: Record<string, string> = { E: COLORS.environmental, S: COLORS.social, G: COLORS.governance };
const pillarBgColors: Record<string, string> = { E: COLORS.bgEnv, S: COLORS.bgSoc, G: COLORS.bgGov };

function getScoreColor(score: number) {
  if (score >= 80) return '#7B9965';
  if (score >= 60) return '#b8963a';
  if (score >= 40) return '#924131';
  return '#9ca3af';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Regular';
  return 'Crítico';
}

function getScoreLevel(score: number) {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Regular';
  return 'Necessita Melhoria';
}

// Radar Chart SVG
function RadarChart({ scores }: { scores: { environmental: number; social: number; governance: number } }) {
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const points = [
    { label: 'Ambiental', short: 'E', value: scores.environmental, angle: -90, color: COLORS.environmental },
    { label: 'Social', short: 'S', value: scores.social, angle: 30, color: COLORS.social },
    { label: 'Governança', short: 'G', value: scores.governance, angle: 150, color: COLORS.governance },
  ];
  const getPoint = (value: number, angle: number, r: number = radius) => {
    const rad = (angle * Math.PI) / 180;
    const scaledR = (value / 100) * r;
    return { x: center + scaledR * Math.cos(rad), y: center + scaledR * Math.sin(rad) };
  };
  const gridLevels = [20, 40, 60, 80, 100];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {gridLevels.map((level) => (
        <polygon key={level} points={points.map((p) => { const pt = getPoint(level, p.angle); return `${pt.x},${pt.y}`; }).join(' ')} fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray={level === 100 ? '' : '2,2'} />
      ))}
      {gridLevels.map((level) => { const pt = getPoint(level, -90); return <text key={`l-${level}`} x={pt.x + 8} y={pt.y + 4} fontSize="9" fill="#999">{level}</text>; })}
      {points.map((p) => { const end = getPoint(100, p.angle); return <line key={p.short} x1={center} y1={center} x2={end.x} y2={end.y} stroke="#D1D5DB" strokeWidth="1" />; })}
      <polygon points={points.map((p) => { const pt = getPoint(p.value, p.angle); return `${pt.x},${pt.y}`; }).join(' ')} fill="rgba(123, 153, 101, 0.2)" stroke={COLORS.accent} strokeWidth="2.5" />
      {points.map((p) => { const pt = getPoint(p.value, p.angle); return (<g key={p.short}><circle cx={pt.x} cy={pt.y} r="6" fill="white" stroke={p.color} strokeWidth="2.5" /><circle cx={pt.x} cy={pt.y} r="3" fill={p.color} /></g>); })}
      {points.map((p) => { const labelPt = getPoint(125, p.angle); return (<g key={`lbl-${p.short}`}><text x={labelPt.x} y={labelPt.y - 8} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="bold" fill={p.color}>{p.label}</text><text x={labelPt.x} y={labelPt.y + 8} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill="#666">{p.value.toFixed(1)}%</text></g>); })}
    </svg>
  );
}

// Circular Score Gauge
function ScoreGauge({ score, size = 150 }: { score: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={getScoreColor(score)} strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black" style={{ color: COLORS.primary }}>{score.toFixed(0)}</span>
        <span className="text-xs font-semibold text-gray-500">pontos</span>
      </div>
    </div>
  );
}

// Theme bar
function ThemeBar({ name, score, maxScore, color }: { name: string; score: number; maxScore: number; color: string }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-start mb-1">
        <span className="text-sm font-semibold text-gray-700 flex-1 leading-snug pr-3">{name}</span>
        <span className="text-sm font-bold flex-shrink-0" style={{ color }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-3.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// Pillar section — stakeholder style
function PillarSection({ breakdown }: { breakdown: PillarBreakdown }) {
  const color = pillarColors[breakdown.pillarCode];
  const bgColor = pillarBgColors[breakdown.pillarCode];
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden print:shadow-none print:border">
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: bgColor }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ backgroundColor: color }}>{breakdown.pillarCode}</div>
          <div>
            <h3 className="text-lg font-black" style={{ color: COLORS.primary }}>{breakdown.pillarName}</h3>
            <p className="text-xs text-gray-500">{breakdown.themes.length} temas avaliados</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black" style={{ color }}>{breakdown.score.toFixed(1)}</div>
          <div className="text-xs font-semibold text-gray-500">{getScoreLabel(breakdown.score)}</div>
        </div>
      </div>
      <div className="p-6">
        {breakdown.themes.map((theme) => (
          <ThemeBar key={theme.themeId} name={theme.themeName} score={theme.score} maxScore={theme.maxScore} color={color} />
        ))}
      </div>
      {breakdown.strengths.length > 0 && (
        <div className="px-6 pb-6">
          <div className="p-3 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
            <h5 className="text-xs font-bold uppercase tracking-wide mb-2 text-green-700">Destaques de Performance</h5>
            <ul className="space-y-1">
              {breakdown.strengths.map((s, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                  <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {breakdown.weaknesses.length > 0 && (
            <div className="p-3 rounded-xl mt-3" style={{ backgroundColor: '#EFF6FF' }}>
              <h5 className="text-xs font-bold uppercase tracking-wide mb-2 text-blue-700">Compromissos de Melhoria</h5>
              <ul className="space-y-1">
                {breakdown.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Full Report View — stakeholder style (inline)
function FullReportView({ diagnosisId, onBack }: { diagnosisId: string; onBack: () => void }) {
  const navigate = useNavigate();
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const data = await reportService.getFullReport(diagnosisId);
        setReport(data);
        try {
          const certRes = await api.get(`/certificates/diagnosis/${diagnosisId}`);
          if (certRes.data) setCertificate(certRes.data);
        } catch {}
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data?.slug) setSlug(meRes.data.slug);
        } catch {}
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar relatório');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [diagnosisId]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }} />
          <p className="mt-4 font-semibold" style={{ color: COLORS.primary }}>Gerando relatório para stakeholders...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{error || 'Relatório não encontrado'}</h2>
        <button onClick={onBack} className="mt-4 px-6 py-2.5 rounded-xl font-bold text-white" style={{ backgroundColor: COLORS.primary }}>
          Voltar
        </button>
      </div>
    );
  }

  const { companyInfo, scores, certification: cert, pillarBreakdowns, summary } = report;
  const medalColor = cert.level === 'gold' ? '#FFD700' : cert.level === 'silver' ? '#C0C0C0' : '#CD7F32';
  const levelPt = cert.level === 'gold' ? 'Ouro' : cert.level === 'silver' ? 'Prata' : 'Bronze';
  const publicUrl = slug ? `${window.location.origin}/empresa/${slug}` : null;
  const qrUrl = publicUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}` : null;

  return (
    <div>
      {/* Print styles */}
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      {/* Action bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Voltar aos relatórios
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                const certRes = await api.get(`/certificates/diagnosis/${diagnosisId}`);
                if (certRes.data) navigate(`/certificate/${certRes.data.id}`);
              } catch {
                try {
                  const res = await api.post(`/certificates/${diagnosisId}`);
                  navigate(`/certificate/${res.data.id}`);
                } catch (err: any) {
                  alert(err?.response?.data?.error || 'Erro ao emitir certificado');
                }
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            Certificado
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)` }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div ref={printRef}>
        {/* ═══ HEADER INSTITUCIONAL ═══ */}
        <div className="rounded-2xl shadow-md overflow-hidden mb-6 print:shadow-none print:rounded-none" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)` }}>
          <div className="px-8 py-8">
            <div className="flex justify-between items-start">
              <div>
                <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-16 mb-4 print:h-12" style={{ filter: 'brightness(10)' }} />
                <h1 className="text-3xl font-black text-white mb-1">Relatório ESG — Stakeholders</h1>
                <p className="text-white/60 text-sm">Avaliação concluída em {new Date(report.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-sm">Emitido em</p>
                <p className="text-white font-bold">{new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur px-8 py-5">
            <h3 className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Dados da Empresa</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-white/50 text-xs">Empresa</p>
                <p className="text-white font-bold text-lg">{companyInfo.name}</p>
              </div>
              {companyInfo.cnpj && <div><p className="text-white/50 text-xs">CNPJ</p><p className="text-white font-semibold">{companyInfo.cnpj}</p></div>}
              {companyInfo.sector && <div><p className="text-white/50 text-xs">Setor</p><p className="text-white font-semibold">{companyInfo.sector}</p></div>}
              {companyInfo.city && <div><p className="text-white/50 text-xs">Localização</p><p className="text-white font-semibold">{companyInfo.city}</p></div>}
              {companyInfo.size && <div><p className="text-white/50 text-xs">Porte</p><p className="text-white font-semibold">{companyInfo.size}</p></div>}
            </div>
          </div>
        </div>

        {/* ═══ RESUMO EXECUTIVO (linguagem institucional) ═══ */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6 print:shadow-none print:rounded-none">
          <h2 className="text-xl font-black mb-2" style={{ color: COLORS.primary }}>Resumo Executivo</h2>
          <p className="text-sm text-gray-500 mb-6">Visão consolidada do desempenho ESG da organização</p>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Certificação</h4>
              <img src={`/images/assets/selo-${levelPt === 'Ouro' ? 'ouro' : levelPt === 'Prata' ? 'prata' : 'bronze'}.png`} alt={`Selo ${levelPt}`} className="w-24 h-24 object-contain mb-2" />
              <p className="text-lg font-black" style={{ color: medalColor }}>{levelPt}</p>
              <p className="text-xs text-gray-400">Score {cert.scoreRange}</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Score Geral</h4>
              <ScoreGauge score={scores.overall} size={140} />
              <span className="mt-2 text-sm font-bold px-4 py-1 rounded-full" style={{ backgroundColor: getScoreColor(scores.overall) + '18', color: getScoreColor(scores.overall) }}>{getScoreLabel(scores.overall)}</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Visão Geral ESG</h4>
              <RadarChart scores={scores} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Pilares</h4>
              <div className="space-y-4">
                {[
                  { label: 'Ambiental', code: 'E', score: scores.environmental, color: COLORS.environmental },
                  { label: 'Social', code: 'S', score: scores.social, color: COLORS.social },
                  { label: 'Governança', code: 'G', score: scores.governance, color: COLORS.governance },
                ].map((p) => (
                  <div key={p.code}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: p.color }}>{p.code}</div>
                        <span className="text-sm font-bold" style={{ color: COLORS.primary }}>{p.label}</span>
                      </div>
                      <span className="text-lg font-black" style={{ color: p.color }}>{p.score.toFixed(1)}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${Math.min(p.score, 100)}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Institutional summary text */}
          <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#f8f9fa' }}>
            <p className="text-sm text-gray-700 leading-relaxed">
              A empresa <strong>{companyInfo.name}</strong> demonstra um nível <strong>{getScoreLabel(scores.overall).toLowerCase()}</strong> de
              maturidade ESG, com score geral de <strong>{scores.overall.toFixed(1)}</strong> pontos. A organização
              apresenta maior destaque no pilar de <strong>{summary.strongestPillar}</strong> ({summary.strongestPillarScore.toFixed(1)} pontos),
              evidenciando compromisso com práticas sustentáveis e responsáveis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#F0FDF4' }}>
              <svg className="w-8 h-8 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-green-700">Principal Destaque</h4>
                <p className="text-sm font-bold text-gray-700">{summary.strongestPillar} — {summary.strongestPillarScore.toFixed(1)} pontos</p>
              </div>
            </div>
            <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#EFF6FF' }}>
              <svg className="w-8 h-8 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-blue-700">Foco de Evolução</h4>
                <p className="text-sm font-bold text-gray-700">{summary.weakestPillar} — {summary.weakestPillarScore.toFixed(1)} pontos</p>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ PERFORMANCE POR PILAR ═══ */}
        <div className="mb-6 print-break">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
            <svg className="w-6 h-6" fill="none" stroke={COLORS.accent} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Performance por Indicador
          </h2>
          <div className="space-y-6">
            {pillarBreakdowns.map((breakdown) => (
              <PillarSection key={breakdown.pillarId} breakdown={breakdown} />
            ))}
          </div>
        </div>

        {/* ═══ CERTIFICAÇÃO ESG + QR CODE ═══ */}
        <div className="rounded-2xl shadow-md overflow-hidden mb-6 print:shadow-none print:rounded-none print-break" style={{ border: `3px solid ${medalColor}` }}>
          <div className="p-8 bg-white">
            <h2 className="text-xl font-black mb-6" style={{ color: COLORS.primary }}>Certificação ESG</h2>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex flex-col items-center flex-shrink-0">
                <img src={`/images/assets/selo-${levelPt === 'Ouro' ? 'ouro' : levelPt === 'Prata' ? 'prata' : 'bronze'}.png`} alt={`Selo ${levelPt}`} className="w-36 h-36 object-contain mb-3" />
                <p className="text-2xl font-black" style={{ color: medalColor }}>Nível {levelPt}</p>
                <p className="text-sm text-gray-500">Score: {scores.overall.toFixed(1)} pontos</p>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black mb-1" style={{ color: cert.color }}>{cert.title}</h3>
                <p className="text-gray-600 italic mb-4">"{cert.message}"</p>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Características deste nível</h4>
                <div className="grid md:grid-cols-2 gap-2 mb-4">
                  {cert.characteristics.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke={cert.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      {c}
                    </div>
                  ))}
                </div>
                {certificate && (
                  <div className="mt-4 p-4 rounded-xl border-2" style={{ borderColor: medalColor + '40', backgroundColor: medalColor + '08' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Certificado emitido</p>
                        <p className="font-bold text-gray-800">#{certificate.certificateNumber}</p>
                        <p className="text-xs text-gray-500">
                          Emissão: {new Date(certificate.issuedAt).toLocaleDateString('pt-BR')}
                          {certificate.expiresAt && ` — Validade: ${new Date(certificate.expiresAt).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Válido</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* QR Code to public profile */}
            {qrUrl && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-6 justify-center">
                <img src={qrUrl} alt="QR Code - Perfil Público ESG" className="w-28 h-28 rounded-xl border border-gray-200" />
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-1">Verificação Pública</p>
                  <p className="text-xs text-gray-500 max-w-xs">Escaneie o QR Code para verificar a autenticidade deste relatório e acessar o perfil ESG público da empresa.</p>
                  <p className="text-xs text-blue-600 mt-2 font-mono break-all">{publicUrl}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ FOOTER INSTITUCIONAL ═══ */}
        <div className="text-center text-sm text-gray-400 py-8 border-t border-gray-200">
          <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-10 mx-auto mb-3 opacity-40" />
          <p className="font-semibold text-gray-500">Relatório gerado pela plataforma engreena ESG</p>
          <p className="text-xs mt-1">Este documento é destinado a stakeholders, investidores e parceiros comerciais.</p>
          <p className="text-xs mt-1">As informações são baseadas na autoavaliação da empresa, verificada pela metodologia engreena.</p>
          <p className="mt-3">&copy; {new Date().getFullYear()} engreena ESG — Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string | null>(null);

  useEffect(() => {
    loadDiagnoses();
  }, []);

  async function loadDiagnoses() {
    try {
      const data = await diagnosisService.list();
      setDiagnoses(data);
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredDiagnoses = diagnoses.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return d.status === 'completed';
    if (filter === 'in_progress') return d.status === 'in_progress';
    return true;
  });

  const completedDiagnoses = diagnoses.filter((d) => d.status === 'completed');
  const avgScore = completedDiagnoses.length > 0
    ? completedDiagnoses.reduce((sum, d) => sum + Number(d.overallScore), 0) / completedDiagnoses.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-brand-900">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  // If a diagnosis is selected, show the full report inline
  if (selectedDiagnosisId) {
    return (
      <div className="min-h-screen bg-brand-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <FullReportView diagnosisId={selectedDiagnosisId} onBack={() => setSelectedDiagnosisId(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-900 mb-1">Relatórios ESG</h1>
          <p className="text-sm text-gray-500">Histórico completo de diagnósticos</p>
        </div>

        {/* Summary Cards */}
        {completedDiagnoses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Total de Diagnósticos</p>
              <p className="text-4xl font-bold text-brand-900">{diagnoses.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Concluídos</p>
              <p className="text-4xl font-bold" style={{ color: '#7B9965' }}>{completedDiagnoses.length}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Score Médio</p>
              <p className="text-4xl font-bold" style={{ color: getScoreColor(avgScore) }}>
                {avgScore.toFixed(0)}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Último Score</p>
              <p className="text-4xl font-bold" style={{ color: getScoreColor(Number(completedDiagnoses[0]?.overallScore || 0)) }}>
                {Number(completedDiagnoses[0]?.overallScore || 0).toFixed(0)}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex gap-2">
            {[
              { key: 'all' as const, label: `Todos (${diagnoses.length})` },
              { key: 'completed' as const, label: `Concluídos (${completedDiagnoses.length})` },
              { key: 'in_progress' as const, label: `Em Andamento (${diagnoses.filter((d) => d.status === 'in_progress').length})` },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${
                  filter === item.key
                    ? 'text-white bg-brand-900'
                    : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-brand-900 mb-6">
            {filter === 'all' ? 'Todos os Diagnósticos' : filter === 'completed' ? 'Diagnósticos Concluídos' : 'Em Andamento'}
          </h2>

          {filteredDiagnoses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-500 mb-6">Nenhum diagnóstico encontrado</p>
              <Link to="/dashboard">
                <button className="px-8 py-3 font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                  Fazer Novo Diagnóstico
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDiagnoses.map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className={`p-5 rounded-xl bg-gray-50 hover:bg-brand-100 transition-all ${diagnosis.status === 'completed' ? 'cursor-pointer' : ''}`}
                  onClick={() => diagnosis.status === 'completed' && setSelectedDiagnosisId(diagnosis.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            diagnosis.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {diagnosis.status === 'completed' ? 'Concluído' : 'Em Andamento'}
                        </span>
                        <p className="text-xs text-gray-400">
                          {diagnosis.status === 'completed' && diagnosis.completedAt
                            ? `Concluído em ${new Date(diagnosis.completedAt).toLocaleDateString('pt-BR')}`
                            : `Iniciado em ${new Date(diagnosis.startedAt).toLocaleDateString('pt-BR')}`}
                        </p>
                      </div>

                      {diagnosis.status === 'completed' && (
                        <div className="grid grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Geral</p>
                            <div className="flex items-center gap-2">
                              <p className="text-2xl font-bold" style={{ color: getScoreColor(Number(diagnosis.overallScore)) }}>
                                {Number(diagnosis.overallScore).toFixed(0)}
                              </p>
                              <span className="text-xs font-medium" style={{ color: getScoreColor(Number(diagnosis.overallScore)) }}>
                                {getScoreLevel(Number(diagnosis.overallScore))}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Ambiental</p>
                            <p className="text-2xl font-bold" style={{ color: getScoreColor(Number(diagnosis.environmentalScore)) }}>
                              {Number(diagnosis.environmentalScore).toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Social</p>
                            <p className="text-2xl font-bold" style={{ color: getScoreColor(Number(diagnosis.socialScore)) }}>
                              {Number(diagnosis.socialScore).toFixed(0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Governança</p>
                            <p className="text-2xl font-bold" style={{ color: getScoreColor(Number(diagnosis.governanceScore)) }}>
                              {Number(diagnosis.governanceScore).toFixed(0)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex gap-2">
                      {diagnosis.status === 'completed' ? (
                        <Link to={`/diagnosis/${diagnosis.id}/results`} onClick={(e) => e.stopPropagation()}>
                          <button className="px-5 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
                            Resultados
                          </button>
                        </Link>
                      ) : (
                        <Link to={`/diagnosis/${diagnosis.id}/questionnaire`}>
                          <button className="px-5 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
                            Continuar
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
