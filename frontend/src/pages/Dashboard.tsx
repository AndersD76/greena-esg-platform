import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';
import api from '../services/api';

const PILLAR_COLORS = {
  environmental: '#7B9965',
  social: '#924131',
  governance: '#EFD4A8',
};

// Circular Score Gauge
function ScoreGauge({ score, size = 120, label, color }: { score: number; size?: number; label?: string; color?: string }) {
  const strokeWidth = size > 100 ? 10 : 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = color || getScoreColorStatic(score);

  return (
    <div className="relative inline-flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color: scoreColor, fontSize: size > 100 ? '2rem' : '1.5rem' }}>
            {score.toFixed(0)}
          </span>
          {size > 100 && <span className="text-xs text-gray-400">pontos</span>}
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>}
    </div>
  );
}

function getScoreColorStatic(score: number) {
  if (score >= 80) return '#7B9965';
  if (score >= 60) return '#EFD4A8';
  if (score >= 40) return '#924131';
  return '#9ca3af';
}

// Bar Chart
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-brand-900">{item.label}</span>
            <span className="text-lg font-bold" style={{ color: item.color }}>{item.value.toFixed(0)}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(item.value / 100) * 100}%`, backgroundColor: item.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Radar Chart
function RadarChart({ environmental, social, governance }: { environmental: number; social: number; governance: number }) {
  const size = 220;
  const center = size / 2;
  const radius = 80;

  const angles = [-90, 30, 150];
  const getPoint = (value: number, angleIdx: number) => {
    const rad = (angles[angleIdx] * Math.PI) / 180;
    const r = (value / 100) * radius;
    return { x: center + r * Math.cos(rad), y: center + r * Math.sin(rad) };
  };

  const outerPoints = angles.map((_, i) => getPoint(100, i));
  const dataPoints = [
    getPoint(environmental, 0),
    getPoint(social, 1),
    getPoint(governance, 2),
  ];

  const colors = [PILLAR_COLORS.environmental, PILLAR_COLORS.social, '#b8963a'];
  const labels = ['Ambiental', 'Social', 'Governança'];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {[20, 40, 60, 80, 100].map((pct) => (
        <polygon
          key={pct}
          points={angles.map((_, i) => {
            const p = getPoint(pct, i);
            return `${p.x},${p.y}`;
          }).join(' ')}
          fill="none" stroke="#e5e7eb" strokeWidth="1"
          strokeDasharray={pct < 100 ? '3,3' : ''}
        />
      ))}

      {outerPoints.map((p, i) => (
        <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#d1d5db" strokeWidth="1" />
      ))}

      <polygon
        points={dataPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill="rgba(123, 153, 101, 0.15)"
        stroke="#7B9965"
        strokeWidth="2"
      />

      {dataPoints.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={colors[i]} strokeWidth="2.5" />
          <circle cx={p.x} cy={p.y} r="2" fill={colors[i]} />
        </g>
      ))}

      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const lx = center + (radius + 28) * Math.cos(rad);
        const ly = center + (radius + 28) * Math.sin(rad);
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="600" fill={colors[i]}>
            {labels[i]}
          </text>
        );
      })}
    </svg>
  );
}

// Line Chart
function LineChart({ diagnoses }: { diagnoses: Diagnosis[] }) {
  if (diagnoses.length === 0) return null;

  const width = 600;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;
  const points = diagnoses.slice(0, 5).reverse();

  const getX = (index: number) => padding + (chartWidth / (points.length - 1 || 1)) * index;
  const getY = (score: number) => height - padding - (score / 100) * chartHeight;

  const createPath = (scores: number[]) => {
    return scores.map((score, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(score)}`).join(' ');
  };

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {[0, 25, 50, 75, 100].map((value) => (
        <g key={value}>
          <line x1={padding} y1={getY(value)} x2={width - padding} y2={getY(value)} stroke="#e5e7eb" strokeWidth="1" />
          <text x={padding - 10} y={getY(value) + 4} textAnchor="end" className="text-xs" fill="#9ca3af">{value}</text>
        </g>
      ))}

      <path d={createPath(points.map(d => Number(d.environmentalScore)))} fill="none" stroke={PILLAR_COLORS.environmental} strokeWidth="2.5" />
      <path d={createPath(points.map(d => Number(d.socialScore)))} fill="none" stroke={PILLAR_COLORS.social} strokeWidth="2.5" />
      <path d={createPath(points.map(d => Number(d.governanceScore)))} fill="none" stroke="#b8963a" strokeWidth="2.5" />

      {points.map((d, i) => (
        <g key={i}>
          <circle cx={getX(i)} cy={getY(Number(d.environmentalScore))} r="3.5" fill={PILLAR_COLORS.environmental} />
          <circle cx={getX(i)} cy={getY(Number(d.socialScore))} r="3.5" fill={PILLAR_COLORS.social} />
          <circle cx={getX(i)} cy={getY(Number(d.governanceScore))} r="3.5" fill="#b8963a" />
          <text x={getX(i)} y={height - 10} textAnchor="middle" className="text-xs" fill="#9ca3af">
            {new Date(d.completedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </text>
        </g>
      ))}

      <g transform={`translate(${padding}, 10)`}>
        <circle cx="0" cy="0" r="3.5" fill={PILLAR_COLORS.environmental} />
        <text x="10" y="4" className="text-xs font-medium" fill="#152F27">Ambiental</text>
        <circle cx="100" cy="0" r="3.5" fill={PILLAR_COLORS.social} />
        <text x="110" y="4" className="text-xs font-medium" fill="#152F27">Social</text>
        <circle cx="180" cy="0" r="3.5" fill="#b8963a" />
        <text x="190" y="4" className="text-xs font-medium" fill="#152F27">Governança</text>
      </g>
    </svg>
  );
}

export default function Dashboard() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<Diagnosis | null>(null);
  const [partialScores, setPartialScores] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDiagnoses();
    loadUserName();
  }, []);

  async function loadUserName() {
    try {
      const response = await api.get('/auth/me');
      setUserName(response.data.name?.split(' ')[0] || '');
    } catch {}
  }

  async function loadDiagnoses() {
    try {
      const data = await diagnosisService.list();
      setDiagnoses(data);
      const inProgress = data.find((d) => d.status === 'in_progress');
      if (inProgress) {
        setCurrentDiagnosis(inProgress);
        loadPartialScores(inProgress.id);
      }
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPartialScores(diagnosisId: string) {
    try {
      const response = await api.get(`/diagnoses/${diagnosisId}/partial-scores`);
      setPartialScores(response.data);
    } catch (error) {
      console.error('Erro ao carregar scores parciais:', error);
    }
  }

  async function handleStartNewDiagnosis() {
    try {
      const diagnosis = await diagnosisService.create();
      navigate(`/diagnosis/${diagnosis.id}/questionnaire`);
    } catch (error) {
      console.error('Erro ao criar diagnóstico:', error);
    }
  }

  const completedDiagnoses = diagnoses.filter((d) => d.status === 'completed');
  const lastCompleted = completedDiagnoses[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Regular';
    return 'Necessita Melhoria';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-brand-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm font-medium text-brand-900">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-100">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header with greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-900 mb-1">
            {getGreeting()}{userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-sm text-gray-500">Acompanhe suas práticas de sustentabilidade</p>
        </div>

        {/* Welcome / First Diagnosis */}
        {!lastCompleted && !currentDiagnosis && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 mb-8">
            <div className="flex items-center gap-12">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-brand-900 mb-3">Bem-vindo à Greena!</h2>
                <p className="text-gray-500 mb-6 max-w-lg">
                  Faça seu primeiro diagnóstico ESG e descubra como sua empresa pode ser mais sustentável. A avaliação é rápida e você terá insights personalizados.
                </p>
                <button
                  onClick={handleStartNewDiagnosis}
                  className="px-10 py-3.5 font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
                >
                  Fazer Primeiro Diagnóstico
                </button>
              </div>
              <div className="hidden md:flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full bg-brand-300/30 flex items-center justify-center">
                  <svg className="w-16 h-16 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-400">75 perguntas</span>
              </div>
            </div>
          </div>
        )}

        {/* ========== COMPLETED DIAGNOSIS SECTION ========== */}
        {lastCompleted && (
          <>
            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-300/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Score Geral</p>
                    <p className="text-2xl font-bold" style={{ color: getScoreColorStatic(Number(lastCompleted.overallScore)) }}>
                      {Number(lastCompleted.overallScore).toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${Number(lastCompleted.overallScore)}%`, backgroundColor: getScoreColorStatic(Number(lastCompleted.overallScore)) }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f5ffeb' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#7B9965">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Ambiental</p>
                    <p className="text-2xl font-bold" style={{ color: PILLAR_COLORS.environmental }}>
                      {Number(lastCompleted.environmentalScore).toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Number(lastCompleted.environmentalScore)}%`, backgroundColor: PILLAR_COLORS.environmental }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fdf5f3' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#924131">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Social</p>
                    <p className="text-2xl font-bold" style={{ color: PILLAR_COLORS.social }}>
                      {Number(lastCompleted.socialScore).toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Number(lastCompleted.socialScore)}%`, backgroundColor: PILLAR_COLORS.social }} />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fdf8ef' }}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#b8963a">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Governança</p>
                    <p className="text-2xl font-bold" style={{ color: '#b8963a' }}>
                      {Number(lastCompleted.governanceScore).toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Number(lastCompleted.governanceScore)}%`, backgroundColor: '#b8963a' }} />
                </div>
              </div>
            </div>

            {/* Main Score + Certification + Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Score Gauge + Cert */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center">
                <ScoreGauge score={Number(lastCompleted.overallScore)} size={160} />
                <span
                  className="mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: getScoreColorStatic(Number(lastCompleted.overallScore)) + '15',
                    color: getScoreColorStatic(Number(lastCompleted.overallScore))
                  }}
                >
                  {getScoreLevel(Number(lastCompleted.overallScore))}
                </span>
                <p className="text-xs text-gray-400 mt-3">
                  Última avaliação: {new Date(lastCompleted.completedAt!).toLocaleDateString('pt-BR')}
                </p>

                {/* Certification seal */}
                {(() => {
                  const score = Number(lastCompleted.overallScore);
                  const level = score < 40 ? 'bronze' : score < 70 ? 'prata' : 'ouro';
                  const levelName = score < 40 ? 'Bronze' : score < 70 ? 'Prata' : 'Ouro';
                  return (
                    <div className="mt-4 flex items-center gap-3">
                      <img
                        src={`/images/assets/selo-${level}.png`}
                        alt={`Selo ${levelName}`}
                        className="w-14 h-14 object-contain"
                      />
                      <div>
                        <p className="text-sm font-bold text-brand-900">Nível {levelName}</p>
                        <p className="text-xs text-gray-400">{score < 40 ? '0-39' : score < 70 ? '40-69' : '70-100'} pontos</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Radar Chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                <h3 className="text-base font-bold text-brand-900 mb-2">Visão Geral ESG</h3>
                <RadarChart
                  environmental={Number(lastCompleted.environmentalScore)}
                  social={Number(lastCompleted.socialScore)}
                  governance={Number(lastCompleted.governanceScore)}
                />
              </div>

              {/* Bar Chart + Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h3 className="text-base font-bold text-brand-900 mb-5">Comparativo por Pilar</h3>
                <div className="flex-1">
                  <BarChart
                    data={[
                      { label: 'Ambiental (E)', value: Number(lastCompleted.environmentalScore), color: PILLAR_COLORS.environmental },
                      { label: 'Social (S)', value: Number(lastCompleted.socialScore), color: PILLAR_COLORS.social },
                      { label: 'Governança (G)', value: Number(lastCompleted.governanceScore), color: '#b8963a' },
                    ]}
                  />
                </div>
                <div className="mt-6 flex gap-2">
                  <Link to={`/diagnosis/${lastCompleted.id}/insights`} className="flex-1">
                    <button className="w-full py-2.5 text-xs font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                      Ver Insights
                    </button>
                  </Link>
                  <Link to={`/diagnosis/${lastCompleted.id}/results`} className="flex-1">
                    <button className="w-full py-2.5 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
                      Resultados
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Evolution Chart */}
            {completedDiagnoses.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-base font-bold text-brand-900 mb-5">Evolução dos Scores</h3>
                <LineChart diagnoses={completedDiagnoses} />
              </div>
            )}
          </>
        )}

        {/* ========== IN-PROGRESS DIAGNOSIS ========== */}
        {currentDiagnosis && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-300/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-900">Diagnóstico em Andamento</h3>
                  <p className="text-xs text-gray-400">
                    Iniciado em {new Date(currentDiagnosis.startedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <Link to={`/diagnosis/${currentDiagnosis.id}/questionnaire`}>
                <button className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                  Continuar Diagnóstico
                </button>
              </Link>
            </div>

            {/* Progress bar for questionnaire */}
            {partialScores && (
              <>
                <div className="mb-6 p-4 rounded-xl bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-brand-900">Progresso</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#EFD4A8', color: '#152F27' }}>
                        PRELIMINAR
                      </span>
                    </div>
                    <span className="text-sm font-bold text-brand-700">
                      {partialScores.answeredCount || 0}/{partialScores.totalCount || 75} respostas
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-700 transition-all duration-500"
                      style={{ width: `${((partialScores.answeredCount || 0) / (partialScores.totalCount || 75)) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Score gauges row */}
                <div className="flex items-center justify-around mb-6 py-4">
                  <ScoreGauge score={partialScores.overall} size={110} label="Geral" />
                  <ScoreGauge score={partialScores.environmental} size={90} label="Ambiental" color={PILLAR_COLORS.environmental} />
                  <ScoreGauge score={partialScores.social} size={90} label="Social" color={PILLAR_COLORS.social} />
                  <ScoreGauge score={partialScores.governance} size={90} label="Governança" color="#b8963a" />

                  {partialScores.certification && (
                    <div className="flex flex-col items-center">
                      <img
                        src={`/images/assets/selo-${partialScores.certification.level === 'gold' ? 'ouro' : partialScores.certification.level === 'silver' ? 'prata' : 'bronze'}.png`}
                        alt="Selo"
                        className="w-16 h-16 object-contain"
                      />
                      <span className="mt-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Certificação</span>
                    </div>
                  )}
                </div>

                {/* Charts side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-gray-50">
                    <h4 className="text-sm font-bold text-brand-900 mb-4">Comparativo Parcial</h4>
                    <BarChart
                      data={[
                        { label: 'Ambiental (E)', value: partialScores.environmental, color: PILLAR_COLORS.environmental },
                        { label: 'Social (S)', value: partialScores.social, color: PILLAR_COLORS.social },
                        { label: 'Governança (G)', value: partialScores.governance, color: '#b8963a' },
                      ]}
                    />
                  </div>

                  <div className="p-5 rounded-xl bg-gray-50 flex flex-col items-center">
                    <h4 className="text-sm font-bold text-brand-900 mb-2">Visão Geral Parcial</h4>
                    <RadarChart
                      environmental={partialScores.environmental}
                      social={partialScores.social}
                      governance={partialScores.governance}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========== QUICK ACTIONS ========== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {!currentDiagnosis && lastCompleted && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-brand-700/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-300/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-brand-900">Novo Diagnóstico</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">Inicie uma nova avaliação ESG e acompanhe sua evolução</p>
              <button
                onClick={handleStartNewDiagnosis}
                className="w-full py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
              >
                Novo Diagnóstico
              </button>
            </div>
          )}

          <Link to="/reports" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-brand-700/30 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-brand-900">Relatórios</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">Visualize todo o histórico de diagnósticos realizados</p>
            <p className="text-sm font-medium text-brand-700">{completedDiagnoses.length} diagnóstico(s) completo(s)</p>
          </Link>

          {lastCompleted && (
            <Link to={`/diagnosis/${lastCompleted.id}/insights`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-brand-700/30 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fdf8ef' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#b8963a">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-brand-900">Insights & Ações</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">Veja recomendações e plano de ação personalizado</p>
              <p className="text-sm font-medium text-brand-700">Ver plano de ação</p>
            </Link>
          )}
        </div>

        {/* ========== RECENT HISTORY ========== */}
        {completedDiagnoses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-brand-900">Histórico Recente</h3>
              <Link to="/reports">
                <button className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors">Ver Todos</button>
              </Link>
            </div>
            <div className="space-y-3">
              {completedDiagnoses.slice(0, 3).map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="flex items-center justify-between p-5 rounded-xl bg-gray-50 hover:bg-brand-100 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: getScoreColorStatic(Number(diagnosis.overallScore)) + '15' }}>
                      <span className="text-lg font-bold" style={{ color: getScoreColorStatic(Number(diagnosis.overallScore)) }}>
                        {Number(diagnosis.overallScore).toFixed(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-brand-900 mb-0.5">
                        Score Geral: {Number(diagnosis.overallScore).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(diagnosis.completedAt!).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/diagnosis/${diagnosis.id}/results`}>
                      <button className="px-4 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-white">
                        Resultados
                      </button>
                    </Link>
                    <Link to={`/diagnosis/${diagnosis.id}/insights`}>
                      <button className="px-4 py-2 text-xs font-medium text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                        Insights
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
