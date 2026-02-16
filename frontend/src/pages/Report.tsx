import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService, FullReport, PillarBreakdown } from '../services/report.service';

// Cores do engreena
const COLORS = {
  primary: '#152F27',
  accent: '#7B9965',
  environmental: '#4CAF50',
  social: '#2196F3',
  governance: '#FF9800',
  bgEnv: '#E8F5E9',
  bgSoc: '#E3F2FD',
  bgGov: '#FFF3E0',
};

const pillarColors: Record<string, string> = {
  E: COLORS.environmental,
  S: COLORS.social,
  G: COLORS.governance,
};

const pillarBgColors: Record<string, string> = {
  E: COLORS.bgEnv,
  S: COLORS.bgSoc,
  G: COLORS.bgGov,
};

// Score color helper
function getScoreColor(score: number) {
  if (score >= 80) return '#22C55E';
  if (score >= 60) return '#84CC16';
  if (score >= 40) return '#F59E0B';
  if (score >= 20) return '#EF4444';
  return '#DC2626';
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Regular';
  if (score >= 20) return 'Em Desenvolvimento';
  return 'Inicial';
}

// Radar Chart - bigger, more detailed
function RadarChart({ scores }: { scores: { environmental: number; social: number; governance: number } }) {
  const size = 280;
  const center = size / 2;
  const radius = 100;

  const points = [
    { label: 'Ambiental', short: 'E', value: scores.environmental, angle: -90, color: COLORS.environmental },
    { label: 'Social', short: 'S', value: scores.social, angle: 30, color: COLORS.social },
    { label: 'Governanca', short: 'G', value: scores.governance, angle: 150, color: COLORS.governance },
  ];

  const getPoint = (value: number, angle: number, r: number = radius) => {
    const rad = (angle * Math.PI) / 180;
    const scaledR = (value / 100) * r;
    return {
      x: center + scaledR * Math.cos(rad),
      y: center + scaledR * Math.sin(rad),
    };
  };

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background grid */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={points.map((p) => {
            const pt = getPoint(level, p.angle);
            return `${pt.x},${pt.y}`;
          }).join(' ')}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="1"
          strokeDasharray={level === 100 ? '' : '2,2'}
        />
      ))}

      {/* Grid level labels */}
      {gridLevels.map((level) => {
        const pt = getPoint(level, -90);
        return (
          <text
            key={`label-${level}`}
            x={pt.x + 8}
            y={pt.y + 4}
            fontSize="9"
            fill="#999"
          >
            {level}
          </text>
        );
      })}

      {/* Axes */}
      {points.map((p) => {
        const end = getPoint(100, p.angle);
        return (
          <line
            key={p.short}
            x1={center}
            y1={center}
            x2={end.x}
            y2={end.y}
            stroke="#D1D5DB"
            strokeWidth="1"
          />
        );
      })}

      {/* Filled area */}
      <polygon
        points={points.map((p) => {
          const pt = getPoint(p.value, p.angle);
          return `${pt.x},${pt.y}`;
        }).join(' ')}
        fill="rgba(123, 153, 101, 0.2)"
        stroke={COLORS.accent}
        strokeWidth="2.5"
      />

      {/* Data points */}
      {points.map((p) => {
        const pt = getPoint(p.value, p.angle);
        return (
          <g key={p.short}>
            <circle cx={pt.x} cy={pt.y} r="6" fill="white" stroke={p.color} strokeWidth="2.5" />
            <circle cx={pt.x} cy={pt.y} r="3" fill={p.color} />
          </g>
        );
      })}

      {/* Labels with scores */}
      {points.map((p) => {
        const labelPt = getPoint(125, p.angle);
        return (
          <g key={`label-${p.short}`}>
            <text
              x={labelPt.x}
              y={labelPt.y - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="13"
              fontWeight="bold"
              fill={p.color}
            >
              {p.label}
            </text>
            <text
              x={labelPt.x}
              y={labelPt.y + 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="600"
              fill="#666"
            >
              {p.value.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Circular Score Gauge
function ScoreGauge({ score, size = 160 }: { score: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black" style={{ color: COLORS.primary }}>
          {score.toFixed(0)}
        </span>
        <span className="text-sm font-semibold" style={{ color: '#666' }}>pontos</span>
      </div>
    </div>
  );
}

// Horizontal bar for theme scores
function ThemeBar({ name, score, maxScore, color }: { name: string; score: number; maxScore: number; color: string }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{name}</span>
        <span className="text-sm font-bold ml-2" style={{ color }}>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// Contribution donut segment
function ContributionChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;

  const size = 160;
  const center = size / 2;
  const radius = 55;
  const innerRadius = 35;

  let currentAngle = -90;
  const segments = data.map((d) => {
    const angle = (d.value / total) * 360;
    const start = currentAngle;
    currentAngle += angle;
    return { ...d, startAngle: start, endAngle: start + angle };
  });

  const describeArc = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = center + outerR * Math.cos(startRad);
    const y1 = center + outerR * Math.sin(startRad);
    const x2 = center + outerR * Math.cos(endRad);
    const y2 = center + outerR * Math.sin(endRad);
    const x3 = center + innerR * Math.cos(endRad);
    const y3 = center + innerR * Math.sin(endRad);
    const x4 = center + innerR * Math.cos(startRad);
    const y4 = center + innerR * Math.sin(startRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(seg.startAngle, seg.endAngle, radius, innerRadius)}
            fill={seg.color}
          />
        ))}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="bold"
          fill="#666"
        >
          Contribuicao
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: seg.color }} />
            <span className="text-sm font-semibold text-gray-700">{seg.label}</span>
            <span className="text-sm font-bold" style={{ color: seg.color }}>
              {((seg.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Performance table per pillar
function PillarPerformance({ breakdown }: { breakdown: PillarBreakdown }) {
  const color = pillarColors[breakdown.pillarCode];
  const bgColor = pillarBgColors[breakdown.pillarCode];

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden print:shadow-none print:border">
      {/* Pillar header */}
      <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: bgColor }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg" style={{ backgroundColor: color }}>
            {breakdown.pillarCode}
          </div>
          <div>
            <h3 className="text-lg font-black" style={{ color: COLORS.primary }}>{breakdown.pillarName}</h3>
            <p className="text-xs text-gray-500">{breakdown.themes.length} temas avaliados</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black" style={{ color }}>{breakdown.score.toFixed(1)}</div>
          <div className="text-xs font-semibold" style={{ color: '#666' }}>{getScoreLabel(breakdown.score)}</div>
        </div>
      </div>

      {/* Theme scores */}
      <div className="p-6">
        {breakdown.themes.map((theme) => (
          <ThemeBar
            key={theme.themeId}
            name={theme.themeName}
            score={theme.score}
            maxScore={theme.maxScore}
            color={color}
          />
        ))}
      </div>

      {/* Strengths & Weaknesses */}
      {(breakdown.strengths.length > 0 || breakdown.weaknesses.length > 0) && (
        <div className="px-6 pb-6 grid grid-cols-2 gap-4">
          {breakdown.strengths.length > 0 && (
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#F0FDF4' }}>
              <h5 className="text-xs font-bold uppercase tracking-wide mb-2 text-green-700">Pontos Fortes</h5>
              <ul className="space-y-1">
                {breakdown.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {breakdown.weaknesses.length > 0 && (
            <div className="p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2' }}>
              <h5 className="text-xs font-bold uppercase tracking-wide mb-2 text-red-700">Oportunidades</h5>
              <ul className="space-y-1">
                {breakdown.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                    <svg className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
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

export default function Report() {
  const { diagnosisId } = useParams<{ diagnosisId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<FullReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadReport() {
      if (!diagnosisId) return;

      try {
        setLoading(true);
        const data = await reportService.getFullReport(diagnosisId);
        setReport(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erro ao carregar relatorio');
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [diagnosisId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: COLORS.accent, borderTopColor: 'transparent' }} />
          <p className="mt-4 font-semibold" style={{ color: COLORS.primary }}>Gerando relatorio...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#6B7280" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">{error || 'Relatorio nao encontrado'}</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2.5 rounded-xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)` }}
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { companyInfo, scores, certification, pillarBreakdowns, insights, actionPlans, summary } = report;

  const categoryInsightColors: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: '#FEE2E2', text: '#DC2626', border: '#DC2626' },
    attention: { bg: '#FEF3C7', text: '#D97706', border: '#D97706' },
    excellent: { bg: '#D1FAE5', text: '#059669', border: '#059669' },
  };

  const priorityColors: Record<string, string> = {
    critical: '#DC2626',
    high: '#D97706',
    medium: '#3B82F6',
    low: '#6B7280',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Action bar (non-printable) */}
      <div className="print:hidden bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)` }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Report content */}
      <div ref={printRef} className="max-w-6xl mx-auto py-8 px-4 print:py-0 print:px-0 print:max-w-none">

        {/* ========== HEADER ========== */}
        <div className="rounded-2xl shadow-md overflow-hidden mb-6 print:shadow-none print:rounded-none" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)` }}>
          <div className="px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-16 mb-3 print:h-12" style={{ filter: 'brightness(10)' }} />
                <h1 className="text-2xl font-black text-white">Relatorio ESG Detalhado</h1>
                <p className="text-white/70 text-sm mt-1">
                  Diagnostico concluido em {new Date(report.completedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right text-white/80 text-sm">
                <p>Data: {new Date(report.reportDate).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
          {/* Company info bar */}
          <div className="bg-white/10 backdrop-blur px-8 py-3">
            <div className="flex flex-wrap gap-x-8 gap-y-1 text-white/90 text-sm">
              <span className="font-bold">{companyInfo.name}</span>
              {companyInfo.cnpj && <span>CNPJ: {companyInfo.cnpj}</span>}
              {companyInfo.sector && <span>Setor: {companyInfo.sector}</span>}
              {companyInfo.city && <span>{companyInfo.city}</span>}
              {companyInfo.size && <span>Porte: {companyInfo.size}</span>}
            </div>
          </div>
        </div>

        {/* ========== SCORE OVERVIEW ========== */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6 print:shadow-none print:rounded-none">
          <h2 className="text-xl font-black mb-6" style={{ color: COLORS.primary }}>Resumo Executivo</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left - Overall score + Certification */}
            <div className="text-center">
              <ScoreGauge score={scores.overall} />
              <div className="mt-3">
                <span
                  className="inline-block px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{ backgroundColor: getScoreColor(scores.overall) + '20', color: getScoreColor(scores.overall) }}
                >
                  {getScoreLabel(scores.overall)}
                </span>
              </div>
              <div className="mt-4 flex justify-center">
                <img
                  src={`/images/assets/selo-${certification.level === 'gold' ? 'ouro' : certification.level === 'silver' ? 'prata' : 'bronze'}.png`}
                  alt={`Selo ${certification.level === 'gold' ? 'Ouro' : certification.level === 'silver' ? 'Prata' : 'Bronze'}`}
                  className="w-28 h-28 object-contain"
                />
              </div>
            </div>

            {/* Center - Radar Chart */}
            <div className="flex items-center justify-center">
              <RadarChart scores={scores} />
            </div>

            {/* Right - Pillar scores + contribution */}
            <div>
              <div className="space-y-4 mb-6">
                {[
                  { label: 'Ambiental', code: 'E', score: scores.environmental, color: COLORS.environmental },
                  { label: 'Social', code: 'S', score: scores.social, color: COLORS.social },
                  { label: 'Governanca', code: 'G', score: scores.governance, color: COLORS.governance },
                ].map((p) => (
                  <div key={p.code}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ backgroundColor: p.color }}>
                          {p.code}
                        </div>
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

              <ContributionChart
                data={[
                  { label: 'Ambiental', value: scores.environmental, color: COLORS.environmental },
                  { label: 'Social', value: scores.social, color: COLORS.social },
                  { label: 'Governanca', value: scores.governance, color: COLORS.governance },
                ]}
              />
            </div>
          </div>

          {/* Summary text */}
          <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#f8f9fa' }}>
            <p className="text-sm text-gray-700 leading-relaxed">{summary.overallAssessment}</p>
          </div>

          {/* Strongest / Weakest */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#F0FDF4' }}>
              <svg className="w-8 h-8 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-green-700">Pilar Mais Forte</h4>
                <p className="text-sm font-bold text-gray-700">
                  {summary.strongestPillar} - {summary.strongestPillarScore.toFixed(1)} pontos
                </p>
              </div>
            </div>
            <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#FFFBEB' }}>
              <svg className="w-8 h-8 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wide text-amber-700">Oportunidade de Melhoria</h4>
                <p className="text-sm font-bold text-gray-700">
                  {summary.weakestPillar} - {summary.weakestPillarScore.toFixed(1)} pontos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========== PERFORMANCE BY PILLAR ========== */}
        <div className="mb-6 print:break-before-page">
          <h2 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
            <svg className="w-6 h-6" fill="none" stroke={COLORS.accent} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Performance por Indicador
          </h2>
          <div className="space-y-6">
            {pillarBreakdowns.map((breakdown) => (
              <PillarPerformance key={breakdown.pillarId} breakdown={breakdown} />
            ))}
          </div>
        </div>

        {/* ========== CERTIFICATION ========== */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6 print:shadow-none print:rounded-none">
          <h2 className="text-xl font-black mb-4" style={{ color: COLORS.primary }}>Certificacao ESG</h2>
          <div
            className="p-6 rounded-2xl border-2"
            style={{ borderColor: certification.color, backgroundColor: `${certification.color}08` }}
          >
            <div className="flex items-start gap-6">
              <img
                src={`/images/assets/selo-${certification.level === 'gold' ? 'ouro' : certification.level === 'silver' ? 'prata' : 'bronze'}.png`}
                alt={`Selo ${certification.level === 'gold' ? 'Ouro' : certification.level === 'silver' ? 'Prata' : 'Bronze'}`}
                className="w-28 h-28 object-contain flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-black" style={{ color: certification.color }}>
                    {certification.title}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${certification.color}20`, color: certification.color }}>
                    Score {certification.scoreRange}
                  </span>
                </div>
                <p className="text-gray-600 italic mb-4">&quot;{certification.message}&quot;</p>
                <div className="grid md:grid-cols-2 gap-2">
                  {certification.characteristics.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke={certification.color} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== INSIGHTS ========== */}
        {insights.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-8 mb-6 print:shadow-none print:rounded-none print:break-before-page">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
              <svg className="w-6 h-6" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Insights Estrategicos
            </h2>
            <div className="space-y-3">
              {insights.map((insight) => {
                const c = categoryInsightColors[insight.category] || categoryInsightColors.attention;
                return (
                  <div
                    key={insight.id}
                    className="p-4 rounded-xl border-l-4"
                    style={{ backgroundColor: c.bg, borderLeftColor: c.border }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: c.border }}
                      >
                        {insight.categoryLabel}
                      </span>
                      <h4 className="font-bold text-sm" style={{ color: c.text }}>{insight.title}</h4>
                    </div>
                    <p className="text-gray-700 text-sm">{insight.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========== ACTION PLAN ========== */}
        {actionPlans.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-8 mb-6 print:shadow-none print:rounded-none print:break-before-page">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2" style={{ color: COLORS.primary }}>
              <svg className="w-6 h-6" fill="none" stroke={COLORS.accent} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              Plano de Acao Recomendado
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th className="text-left py-3 px-3 rounded-tl-lg font-bold text-gray-500 text-xs uppercase">#</th>
                    <th className="text-left py-3 px-3 font-bold text-gray-500 text-xs uppercase">Acao</th>
                    <th className="text-left py-3 px-3 font-bold text-gray-500 text-xs uppercase">Prioridade</th>
                    <th className="text-left py-3 px-3 font-bold text-gray-500 text-xs uppercase">Investimento</th>
                    <th className="text-left py-3 px-3 font-bold text-gray-500 text-xs uppercase">Prazo</th>
                    <th className="text-left py-3 px-3 rounded-tr-lg font-bold text-gray-500 text-xs uppercase">Impacto</th>
                  </tr>
                </thead>
                <tbody>
                  {actionPlans.map((action, index) => (
                    <tr key={action.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white" style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 100%)` }}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-gray-800">{action.title.replace(/^\d+\.\s*/, '')}</div>
                        {action.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{action.description.substring(0, 80)}...</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-white"
                          style={{ backgroundColor: priorityColors[action.priority] || '#6B7280' }}
                        >
                          {action.priorityLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-semibold">{action.investmentLabel}</td>
                      <td className="py-3 px-3 text-gray-600 font-semibold">{action.deadlineDays} dias</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${Number(action.impactScore) * 10}%`, backgroundColor: COLORS.accent }} />
                          </div>
                          <span className="text-xs font-bold text-gray-500">{Number(action.impactScore)}/10</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== RECOMMENDATION ========== */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6 print:shadow-none print:rounded-none">
          <h2 className="text-xl font-black mb-4" style={{ color: COLORS.primary }}>Recomendacao Principal</h2>
          <div className="p-5 rounded-xl" style={{ backgroundColor: '#f0f7ed', borderLeft: `4px solid ${COLORS.accent}` }}>
            <p className="text-gray-700 leading-relaxed">{summary.recommendation}</p>
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="text-center text-sm text-gray-400 py-6 border-t border-gray-200">
          <p className="font-semibold">Relatório gerado pela plataforma engreena</p>
          <p>&copy; {new Date().getFullYear()} engreena ESG - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
