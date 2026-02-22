import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';
import api from '../services/api';

// Cores dos pilares ESG da marca
const PILLAR_COLORS = {
  environmental: '#7B9965',
  social: '#924131',
  governance: '#EFD4A8',
};

// Componente de Gráfico de Barras
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const maxValue = 100;

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
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: item.color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente de Gráfico de Radar (Spider Chart)
function RadarChart({ environmental, social, governance }: { environmental: number; social: number; governance: number }) {
  const size = 200;
  const center = size / 2;
  const radius = 70;

  const points = [
    { x: center, y: center - radius },
    { x: center + radius * Math.sin(2 * Math.PI / 3), y: center - radius * Math.cos(2 * Math.PI / 3) },
    { x: center + radius * Math.sin(4 * Math.PI / 3), y: center - radius * Math.cos(4 * Math.PI / 3) },
  ];

  const dataPoints = [
    {
      x: center + (environmental / 100) * (points[0].x - center),
      y: center + (environmental / 100) * (points[0].y - center)
    },
    {
      x: center + (social / 100) * (points[1].x - center),
      y: center + (social / 100) * (points[1].y - center)
    },
    {
      x: center + (governance / 100) * (points[2].x - center),
      y: center + (governance / 100) * (points[2].y - center)
    },
  ];

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const dataPolygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} className="mx-auto">
      {[20, 40, 60, 80, 100].map((percent) => (
        <polygon
          key={percent}
          points={points.map(p => {
            const factor = percent / 100;
            return `${center + factor * (p.x - center)},${center + factor * (p.y - center)}`;
          }).join(' ')}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {points.map((p, i) => (
        <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="1" />
      ))}

      <polygon points={polygonPoints} fill="none" stroke="#152F27" strokeWidth="1.5" />

      <polygon points={dataPolygonPoints} fill="#7B9965" fillOpacity="0.2" stroke="#7B9965" strokeWidth="2" />

      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill={Object.values(PILLAR_COLORS)[i]} />
      ))}

      <text x={center} y={center - radius - 12} textAnchor="middle" className="text-xs font-medium" fill="#152F27">E</text>
      <text x={center + radius + 12} y={center - radius * Math.cos(2 * Math.PI / 3) + 4} textAnchor="start" className="text-xs font-medium" fill="#152F27">S</text>
      <text x={center + radius * Math.sin(4 * Math.PI / 3) - 12} y={center - radius * Math.cos(4 * Math.PI / 3) + 4} textAnchor="end" className="text-xs font-medium" fill="#152F27">G</text>
    </svg>
  );
}

// Componente de Gráfico de Linha (Evolução)
function LineChart({ diagnoses }: { diagnoses: Diagnosis[] }) {
  if (diagnoses.length === 0) return null;

  const width = 600;
  const height = 200;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const maxScore = 100;
  const points = diagnoses.slice(0, 5).reverse();

  const getX = (index: number) => padding + (chartWidth / (points.length - 1 || 1)) * index;
  const getY = (score: number) => height - padding - (score / maxScore) * chartHeight;

  const createPath = (scores: number[]) => {
    return scores.map((score, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(score)}`).join(' ');
  };

  const envPath = createPath(points.map(d => Number(d.environmentalScore)));
  const socPath = createPath(points.map(d => Number(d.socialScore)));
  const govPath = createPath(points.map(d => Number(d.governanceScore)));

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {[0, 25, 50, 75, 100].map((value) => (
        <g key={value}>
          <line x1={padding} y1={getY(value)} x2={width - padding} y2={getY(value)} stroke="#e5e7eb" strokeWidth="1" />
          <text x={padding - 10} y={getY(value) + 4} textAnchor="end" className="text-xs" fill="#9ca3af">{value}</text>
        </g>
      ))}

      <path d={envPath} fill="none" stroke={PILLAR_COLORS.environmental} strokeWidth="2.5" />
      <path d={socPath} fill="none" stroke={PILLAR_COLORS.social} strokeWidth="2.5" />
      <path d={govPath} fill="none" stroke={PILLAR_COLORS.governance} strokeWidth="2.5" />

      {points.map((d, i) => (
        <g key={i}>
          <circle cx={getX(i)} cy={getY(Number(d.environmentalScore))} r="3.5" fill={PILLAR_COLORS.environmental} />
          <circle cx={getX(i)} cy={getY(Number(d.socialScore))} r="3.5" fill={PILLAR_COLORS.social} />
          <circle cx={getX(i)} cy={getY(Number(d.governanceScore))} r="3.5" fill={PILLAR_COLORS.governance} />
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
        <circle cx="180" cy="0" r="3.5" fill={PILLAR_COLORS.governance} />
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
  const navigate = useNavigate();

  useEffect(() => {
    loadDiagnoses();
  }, []);

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#7B9965';
    if (score >= 60) return '#EFD4A8';
    if (score >= 40) return '#924131';
    return '#9ca3af';
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-900 mb-1">Dashboard ESG</h1>
          <p className="text-sm text-gray-500">Acompanhe suas práticas de sustentabilidade</p>
        </div>

        {/* Welcome / First Diagnosis */}
        {!lastCompleted && !currentDiagnosis && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mb-8">
            <h2 className="text-2xl font-bold text-brand-900 mb-3">Bem-vindo!</h2>
            <p className="text-gray-500 mb-8 max-w-xl mx-auto">
              Comece seu primeiro diagnóstico ESG e descubra como sua empresa pode ser mais sustentável.
            </p>
            <button
              onClick={handleStartNewDiagnosis}
              className="px-10 py-3.5 font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
            >
              Fazer Primeiro Diagnóstico
            </button>
          </div>
        )}

        {/* Score Overview */}
        {lastCompleted && (
          <>
            {/* Certification Badge */}
            {(() => {
              const scoringService = { getCertificationLevel: (score: number) => {
                if (score < 40) return {
                  level: 'bronze', name: 'Compromisso ESG', title: 'Fundamentos ESG',
                  message: 'Quem da o primeiro passo na transformacao sustentavel.',
                  color: '#CD7F32', levelLabel: 'BRONZE', scoreRange: '0-39'
                };
                if (score < 70) return {
                  level: 'silver', name: 'Integracao ESG', title: 'Gestao ESG',
                  message: 'Quem transforma intencoes em praticas consistentes.',
                  color: '#C0C0C0', levelLabel: 'PRATA', scoreRange: '40-69'
                };
                return {
                  level: 'gold', name: 'Lideranca ESG', title: 'Excelencia ESG',
                  message: 'Quem inspira o mercado e multiplica o impacto positivo.',
                  color: '#FFD700', levelLabel: 'OURO', scoreRange: '70-100'
                };
              }};
              const cert = scoringService.getCertificationLevel(Number(lastCompleted.overallScore));
              return (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: cert.color }}>
                      {cert.levelLabel.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold text-brand-900">
                          Certificação Nível {cert.level === 'bronze' ? 'Bronze' : cert.level === 'silver' ? 'Prata' : 'Ouro'}
                        </h2>
                        <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: cert.color }}>
                          {cert.scoreRange} pontos
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-1" style={{ color: cert.color }}>{cert.name}</h3>
                      <p className="text-sm text-gray-500">{cert.message}</p>
                      <p className="text-xs text-brand-700 mt-1">
                        Score alcançado: {Number(lastCompleted.overallScore).toFixed(0)} pontos
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Main Score Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-brand-900 mb-1">Score ESG Geral</h2>
                  <p className="text-xs text-gray-400">
                    Última avaliação: {new Date(lastCompleted.completedAt!).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Link to={`/diagnosis/${lastCompleted.id}/insights`}>
                  <button className="px-5 py-2 text-sm font-medium text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                    Ver Insights
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-5 rounded-xl bg-gray-50">
                  <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Score Geral</p>
                  <p className="text-5xl font-bold mb-2" style={{ color: getScoreColor(Number(lastCompleted.overallScore)) }}>
                    {Number(lastCompleted.overallScore).toFixed(0)}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: getScoreColor(Number(lastCompleted.overallScore)) + '15', color: getScoreColor(Number(lastCompleted.overallScore)) }}>
                    {getScoreLevel(Number(lastCompleted.overallScore))}
                  </span>
                </div>

                <div className="text-center p-5 rounded-xl" style={{ backgroundColor: '#f5ffeb' }}>
                  <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Ambiental</p>
                  <p className="text-5xl font-bold mb-2" style={{ color: PILLAR_COLORS.environmental }}>
                    {Number(lastCompleted.environmentalScore).toFixed(0)}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: PILLAR_COLORS.environmental + '15', color: PILLAR_COLORS.environmental }}>
                    {getScoreLevel(Number(lastCompleted.environmentalScore))}
                  </span>
                </div>

                <div className="text-center p-5 rounded-xl" style={{ backgroundColor: '#fdf5f3' }}>
                  <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Social</p>
                  <p className="text-5xl font-bold mb-2" style={{ color: PILLAR_COLORS.social }}>
                    {Number(lastCompleted.socialScore).toFixed(0)}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: PILLAR_COLORS.social + '15', color: PILLAR_COLORS.social }}>
                    {getScoreLevel(Number(lastCompleted.socialScore))}
                  </span>
                </div>

                <div className="text-center p-5 rounded-xl" style={{ backgroundColor: '#fdf8ef' }}>
                  <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Governança</p>
                  <p className="text-5xl font-bold mb-2" style={{ color: '#b8963a' }}>
                    {Number(lastCompleted.governanceScore).toFixed(0)}
                  </p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: PILLAR_COLORS.governance + '30', color: '#b8963a' }}>
                    {getScoreLevel(Number(lastCompleted.governanceScore))}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-brand-900 mb-5">Comparativo por Pilar</h3>
                <BarChart
                  data={[
                    { label: 'Ambiental (E)', value: Number(lastCompleted.environmentalScore), color: PILLAR_COLORS.environmental },
                    { label: 'Social (S)', value: Number(lastCompleted.socialScore), color: PILLAR_COLORS.social },
                    { label: 'Governança (G)', value: Number(lastCompleted.governanceScore), color: '#b8963a' },
                  ]}
                />
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-brand-900 mb-5 text-center">Visão Geral ESG</h3>
                <RadarChart
                  environmental={Number(lastCompleted.environmentalScore)}
                  social={Number(lastCompleted.socialScore)}
                  governance={Number(lastCompleted.governanceScore)}
                />
              </div>
            </div>

            {/* Evolution Chart */}
            {completedDiagnoses.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-base font-bold text-brand-900 mb-5">Evolução dos Scores</h3>
                <LineChart diagnoses={completedDiagnoses} />
              </div>
            )}

            {/* Pillar Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-300">
                    <svg className="w-5 h-5 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-900">Ambiental</h3>
                    <p className="text-xs text-gray-400">Environmental</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Gestão de recursos naturais, emissões, resíduos e impacto ambiental das operações.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" style={{ color: PILLAR_COLORS.environmental }}>
                    {Number(lastCompleted.environmentalScore).toFixed(0)}
                  </span>
                  <Link to={`/diagnosis/${lastCompleted.id}/results`}>
                    <button className="px-4 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
                      Ver Detalhes
                    </button>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fdf5f3' }}>
                    <svg className="w-5 h-5 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-900">Social</h3>
                    <p className="text-xs text-gray-400">Social</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Relações com colaboradores, diversidade, saúde, segurança e impacto na comunidade.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" style={{ color: PILLAR_COLORS.social }}>
                    {Number(lastCompleted.socialScore).toFixed(0)}
                  </span>
                  <Link to={`/diagnosis/${lastCompleted.id}/results`}>
                    <button className="px-4 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
                      Ver Detalhes
                    </button>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#fdf8ef' }}>
                    <svg className="w-5 h-5 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-900">Governança</h3>
                    <p className="text-xs text-gray-400">Governance</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Estrutura de gestão, ética, transparência, compliance e responsabilidade corporativa.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" style={{ color: '#b8963a' }}>
                    {Number(lastCompleted.governanceScore).toFixed(0)}
                  </span>
                  <Link to={`/diagnosis/${lastCompleted.id}/results`}>
                    <button className="px-4 py-2 text-xs font-medium text-brand-900 border border-gray-200 rounded-full transition-all hover:bg-gray-50">
                      Ver Detalhes
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Current Diagnosis with Partial Scores */}
        {currentDiagnosis && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-brand-900 mb-1">Diagnóstico em Andamento</h3>
                <p className="text-xs text-gray-400">
                  Iniciado em {new Date(currentDiagnosis.startedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Link to={`/diagnosis/${currentDiagnosis.id}/questionnaire`}>
                <button className="px-6 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                  Continuar Diagnóstico
                </button>
              </Link>
            </div>

            {partialScores && (
              <>
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-base font-bold text-brand-900">Resultados Parciais</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#EFD4A8', color: '#152F27' }}>
                      PRELIMINAR
                    </span>
                    {partialScores.certification && (
                      <img
                        src={`/images/assets/selo-${partialScores.certification.level === 'gold' ? 'ouro' : partialScores.certification.level === 'silver' ? 'prata' : 'bronze'}.png`}
                        alt={`Selo ${partialScores.certification.level === 'gold' ? 'Ouro' : partialScores.certification.level === 'silver' ? 'Prata' : 'Bronze'}`}
                        className="w-14 h-14 object-contain"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    Baseado nas respostas fornecidas até o momento
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl bg-gray-50">
                    <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Geral</p>
                    <p className="text-3xl font-bold" style={{ color: getScoreColor(partialScores.overall) }}>
                      {partialScores.overall.toFixed(0)}
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#f5ffeb' }}>
                    <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Ambiental</p>
                    <p className="text-3xl font-bold" style={{ color: PILLAR_COLORS.environmental }}>
                      {partialScores.environmental.toFixed(0)}
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#fdf5f3' }}>
                    <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Social</p>
                    <p className="text-3xl font-bold" style={{ color: PILLAR_COLORS.social }}>
                      {partialScores.social.toFixed(0)}
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#fdf8ef' }}>
                    <p className="text-xs font-medium text-brand-900 mb-2 uppercase tracking-wide">Governança</p>
                    <p className="text-3xl font-bold" style={{ color: '#b8963a' }}>
                      {partialScores.governance.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50">
                    <h4 className="text-sm font-bold text-brand-900 mb-3">Comparativo Parcial</h4>
                    <BarChart
                      data={[
                        { label: 'Ambiental (E)', value: partialScores.environmental, color: PILLAR_COLORS.environmental },
                        { label: 'Social (S)', value: partialScores.social, color: PILLAR_COLORS.social },
                        { label: 'Governança (G)', value: partialScores.governance, color: '#b8963a' },
                      ]}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-gray-50">
                    <h4 className="text-sm font-bold text-brand-900 mb-3 text-center">Visão Geral Parcial</h4>
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {!currentDiagnosis && lastCompleted && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-brand-900 mb-2">Novo Diagnóstico</h3>
              <p className="text-sm text-gray-500 mb-4">
                Inicie uma nova avaliação ESG e acompanhe sua evolução
              </p>
              <button
                onClick={handleStartNewDiagnosis}
                className="w-full py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90"
              >
                Novo Diagnóstico
              </button>
            </div>
          )}

          <Link to="/reports" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-brand-700/30 transition-all">
            <h3 className="text-base font-bold text-brand-900 mb-2">Relatórios</h3>
            <p className="text-sm text-gray-500 mb-4">
              Visualize todo o histórico de diagnósticos realizados
            </p>
            <p className="text-sm font-medium text-brand-700">
              {completedDiagnoses.length} diagnóstico(s) completo(s)
            </p>
          </Link>

          {lastCompleted && (
            <Link to={`/diagnosis/${lastCompleted.id}/insights`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-brand-700/30 transition-all">
              <h3 className="text-base font-bold text-brand-900 mb-2">Insights & Ações</h3>
              <p className="text-sm text-gray-500 mb-4">
                Veja recomendações e plano de ação personalizado
              </p>
              <p className="text-sm font-medium text-brand-700">
                Ver plano de ação
              </p>
            </Link>
          )}
        </div>

        {/* Recent History */}
        {completedDiagnoses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-brand-900">Histórico Recente</h3>
              <Link to="/reports">
                <button className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors">
                  Ver Todos
                </button>
              </Link>
            </div>
            <div className="space-y-3">
              {completedDiagnoses.slice(0, 3).map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="flex items-center justify-between p-5 rounded-xl bg-gray-50 hover:bg-brand-100 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-bold text-brand-900 mb-0.5">
                      Score Geral: {Number(diagnosis.overallScore).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(diagnosis.completedAt!).toLocaleDateString('pt-BR')}
                    </p>
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
