import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';

// Componente de Gráfico de Barras
function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const maxValue = 100;

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold" style={{ color: '#152F27' }}>{item.label}</span>
            <span className="text-lg font-black" style={{ color: item.color }}>{item.value.toFixed(0)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
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

  // Calcular pontos do triângulo externo (100%)
  const points = [
    { x: center, y: center - radius }, // Top (Environmental)
    { x: center + radius * Math.sin(2 * Math.PI / 3), y: center - radius * Math.cos(2 * Math.PI / 3) }, // Bottom Right (Social)
    { x: center + radius * Math.sin(4 * Math.PI / 3), y: center - radius * Math.cos(4 * Math.PI / 3) }, // Bottom Left (Governance)
  ];

  // Calcular pontos dos dados
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
      {/* Grid circles */}
      {[20, 40, 60, 80, 100].map((percent) => (
        <polygon
          key={percent}
          points={points.map(p => {
            const factor = percent / 100;
            return `${center + factor * (p.x - center)},${center + factor * (p.y - center)}`;
          }).join(' ')}
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="1"
        />
      ))}

      {/* Axes */}
      {points.map((p, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={p.x}
          y2={p.y}
          stroke="#e0e0e0"
          strokeWidth="1"
        />
      ))}

      {/* Outer triangle */}
      <polygon
        points={polygonPoints}
        fill="none"
        stroke="#152F27"
        strokeWidth="2"
      />

      {/* Data polygon */}
      <polygon
        points={dataPolygonPoints}
        fill="#7B9965"
        fillOpacity="0.3"
        stroke="#7B9965"
        strokeWidth="2"
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#7B9965"
        />
      ))}

      {/* Labels */}
      <text x={center} y={center - radius - 15} textAnchor="middle" className="text-xs font-bold" fill="#152F27">
        E
      </text>
      <text x={center + radius + 15} y={center - radius * Math.cos(2 * Math.PI / 3) + 5} textAnchor="start" className="text-xs font-bold" fill="#152F27">
        S
      </text>
      <text x={center + radius * Math.sin(4 * Math.PI / 3) - 15} y={center - radius * Math.cos(4 * Math.PI / 3) + 5} textAnchor="end" className="text-xs font-bold" fill="#152F27">
        G
      </text>
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
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((value) => (
        <g key={value}>
          <line
            x1={padding}
            y1={getY(value)}
            x2={width - padding}
            y2={getY(value)}
            stroke="#e0e0e0"
            strokeWidth="1"
          />
          <text
            x={padding - 10}
            y={getY(value) + 4}
            textAnchor="end"
            className="text-xs"
            fill="#666"
          >
            {value}
          </text>
        </g>
      ))}

      {/* Paths */}
      <path d={envPath} fill="none" stroke="#4CAF50" strokeWidth="3" />
      <path d={socPath} fill="none" stroke="#2196F3" strokeWidth="3" />
      <path d={govPath} fill="none" stroke="#FF9800" strokeWidth="3" />

      {/* Points */}
      {points.map((d, i) => (
        <g key={i}>
          <circle cx={getX(i)} cy={getY(Number(d.environmentalScore))} r="4" fill="#4CAF50" />
          <circle cx={getX(i)} cy={getY(Number(d.socialScore))} r="4" fill="#2196F3" />
          <circle cx={getX(i)} cy={getY(Number(d.governanceScore))} r="4" fill="#FF9800" />

          {/* Date labels */}
          <text
            x={getX(i)}
            y={height - 10}
            textAnchor="middle"
            className="text-xs"
            fill="#666"
          >
            {new Date(d.completedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </text>
        </g>
      ))}

      {/* Legend */}
      <g transform={`translate(${padding}, 10)`}>
        <circle cx="0" cy="0" r="4" fill="#4CAF50" />
        <text x="10" y="4" className="text-xs font-semibold" fill="#152F27">Ambiental</text>

        <circle cx="100" cy="0" r="4" fill="#2196F3" />
        <text x="110" y="4" className="text-xs font-semibold" fill="#152F27">Social</text>

        <circle cx="180" cy="0" r="4" fill="#FF9800" />
        <text x="190" y="4" className="text-xs font-semibold" fill="#152F27">Governança</text>
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
        // Carregar scores parciais
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
      const response = await fetch(`/api/diagnosis/${diagnosisId}/partial-scores`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPartialScores(data);
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
    return '#666';
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black mb-2" style={{ color: '#152F27' }}>Dashboard ESG</h1>
          <p className="text-lg font-semibold" style={{ color: '#7B9965' }}>Acompanhe suas práticas de sustentabilidade</p>
        </div>

        {/* Welcome / First Diagnosis */}
        {!lastCompleted && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center mb-8">
            <h2 className="text-4xl font-black mb-4" style={{ color: '#152F27' }}>
              Bem-vindo ao GREENA!
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: '#666' }}>
              Comece seu primeiro diagnóstico ESG e descubra como sua empresa pode ser mais sustentável.
            </p>
            <button
              onClick={handleStartNewDiagnosis}
              className="px-12 py-4 text-lg font-black text-white rounded-2xl transition-all hover:scale-105 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
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
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 mb-6 border-4"
                     style={{ borderColor: cert.color }}>
                  <div className="flex items-center gap-6">
                    <div className="text-4xl font-black" style={{ color: cert.color }}>{cert.levelLabel}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-black" style={{ color: '#152F27' }}>
                          Certificação Nível {cert.level === 'bronze' ? 'Bronze' : cert.level === 'silver' ? 'Prata' : 'Ouro'}
                        </h2>
                        <span className="px-4 py-1.5 rounded-full text-sm font-bold text-white" style={{ backgroundColor: cert.color }}>
                          {cert.scoreRange} pontos
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold mb-3" style={{ color: cert.color }}>{cert.name}</h3>
                      <p className="text-lg font-semibold mb-1" style={{ color: '#666' }}>{cert.message}</p>
                      <p className="text-sm font-semibold" style={{ color: '#7B9965' }}>
                        Score alcançado: {Number(lastCompleted.overallScore).toFixed(0)} pontos
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Main Score Card */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black mb-1" style={{ color: '#152F27' }}>Score ESG Geral</h2>
                  <p className="text-sm font-semibold" style={{ color: '#7B9965' }}>
                    Última avaliação: {new Date(lastCompleted.completedAt!).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Link to={`/diagnosis/${lastCompleted.id}/insights`}>
                  <button className="px-6 py-2.5 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
                    Ver Insights
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: '#f5f5f5' }}>
                  <p className="text-sm font-bold mb-3" style={{ color: '#666' }}>SCORE GERAL</p>
                  <p className="text-6xl font-black mb-2" style={{ color: getScoreColor(Number(lastCompleted.overallScore)) }}>
                    {Number(lastCompleted.overallScore).toFixed(0)}
                  </p>
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: getScoreColor(Number(lastCompleted.overallScore)) + '20', color: getScoreColor(Number(lastCompleted.overallScore)) }}>
                    {getScoreLevel(Number(lastCompleted.overallScore))}
                  </span>
                </div>

                <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: '#e8f5e9' }}>
                  <p className="text-sm font-bold mb-3" style={{ color: '#152F27' }}>AMBIENTAL</p>
                  <p className="text-6xl font-black mb-2" style={{ color: getScoreColor(Number(lastCompleted.environmentalScore)) }}>
                    {Number(lastCompleted.environmentalScore).toFixed(0)}
                  </p>
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: getScoreColor(Number(lastCompleted.environmentalScore)) + '20', color: getScoreColor(Number(lastCompleted.environmentalScore)) }}>
                    {getScoreLevel(Number(lastCompleted.environmentalScore))}
                  </span>
                </div>

                <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: '#e3f2fd' }}>
                  <p className="text-sm font-bold mb-3" style={{ color: '#152F27' }}>SOCIAL</p>
                  <p className="text-6xl font-black mb-2" style={{ color: getScoreColor(Number(lastCompleted.socialScore)) }}>
                    {Number(lastCompleted.socialScore).toFixed(0)}
                  </p>
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: getScoreColor(Number(lastCompleted.socialScore)) + '20', color: getScoreColor(Number(lastCompleted.socialScore)) }}>
                    {getScoreLevel(Number(lastCompleted.socialScore))}
                  </span>
                </div>

                <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: '#fff3e0' }}>
                  <p className="text-sm font-bold mb-3" style={{ color: '#152F27' }}>GOVERNANÇA</p>
                  <p className="text-6xl font-black mb-2" style={{ color: getScoreColor(Number(lastCompleted.governanceScore)) }}>
                    {Number(lastCompleted.governanceScore).toFixed(0)}
                  </p>
                  <span className="inline-block px-4 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: getScoreColor(Number(lastCompleted.governanceScore)) + '20', color: getScoreColor(Number(lastCompleted.governanceScore)) }}>
                    {getScoreLevel(Number(lastCompleted.governanceScore))}
                  </span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Bar Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-black mb-6" style={{ color: '#152F27' }}>Comparativo por Pilar</h3>
                <BarChart
                  data={[
                    { label: 'Ambiental (E)', value: Number(lastCompleted.environmentalScore), color: '#4CAF50' },
                    { label: 'Social (S)', value: Number(lastCompleted.socialScore), color: '#2196F3' },
                    { label: 'Governança (G)', value: Number(lastCompleted.governanceScore), color: '#FF9800' },
                  ]}
                />
              </div>

              {/* Radar Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-black mb-6 text-center" style={{ color: '#152F27' }}>Visão Geral ESG</h3>
                <RadarChart
                  environmental={Number(lastCompleted.environmentalScore)}
                  social={Number(lastCompleted.socialScore)}
                  governance={Number(lastCompleted.governanceScore)}
                />
              </div>
            </div>

            {/* Evolution Chart */}
            {completedDiagnoses.length > 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <h3 className="text-xl font-black mb-6" style={{ color: '#152F27' }}>Evolução dos Scores</h3>
                <LineChart diagnoses={completedDiagnoses} />
              </div>
            )}

            {/* Pillar Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Environmental Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f5e9' }}>
                    <svg className="w-6 h-6" style={{ color: '#152F27' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black" style={{ color: '#152F27' }}>Ambiental</h3>
                    <p className="text-sm font-semibold" style={{ color: '#7B9965' }}>Environmental</p>
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: '#666' }}>
                  Gestão de recursos naturais, emissões, resíduos e impacto ambiental das operações.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black" style={{ color: getScoreColor(Number(lastCompleted.environmentalScore)) }}>
                    {Number(lastCompleted.environmentalScore).toFixed(0)}
                  </span>
                  <Link to={`/diagnosis/${lastCompleted.id}/results`}>
                    <button className="px-4 py-2 text-xs font-bold border-2 rounded-lg transition-all hover:bg-green-50" style={{ borderColor: '#152F27', color: '#152F27' }}>
                      Ver Detalhes
                    </button>
                  </Link>
                </div>
              </div>

              {/* Social Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e3f2fd' }}>
                    <svg className="w-6 h-6" style={{ color: '#152F27' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black" style={{ color: '#152F27' }}>Social</h3>
                    <p className="text-sm font-semibold" style={{ color: '#7B9965' }}>Social</p>
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: '#666' }}>
                  Relações com colaboradores, diversidade, saúde, segurança e impacto na comunidade.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black" style={{ color: getScoreColor(Number(lastCompleted.socialScore)) }}>
                    {Number(lastCompleted.socialScore).toFixed(0)}
                  </span>
                  <Link to={`/diagnosis/${lastCompleted.id}/results`}>
                    <button className="px-4 py-2 text-xs font-bold border-2 rounded-lg transition-all hover:bg-green-50" style={{ borderColor: '#152F27', color: '#152F27' }}>
                      Ver Detalhes
                    </button>
                  </Link>
                </div>
              </div>

              {/* Governance Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fff3e0' }}>
                    <svg className="w-6 h-6" style={{ color: '#152F27' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-black" style={{ color: '#152F27' }}>Governança</h3>
                    <p className="text-sm font-semibold" style={{ color: '#7B9965' }}>Governance</p>
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: '#666' }}>
                  Estrutura de gestão, ética, transparência, compliance e responsabilidade corporativa.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black" style={{ color: getScoreColor(Number(lastCompleted.governanceScore)) }}>
                    {Number(lastCompleted.governanceScore).toFixed(0)}
                  </span>
                  <Link to={`/diagnosis/${lastCompleted.id}/results`}>
                    <button className="px-4 py-2 text-xs font-bold border-2 rounded-lg transition-all hover:bg-green-50" style={{ borderColor: '#152F27', color: '#152F27' }}>
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
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-black mb-2" style={{ color: '#152F27' }}>Diagnóstico em Andamento</h3>
                <p className="text-sm font-semibold" style={{ color: '#7B9965' }}>
                  Iniciado em {new Date(currentDiagnosis.startedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Link to={`/diagnosis/${currentDiagnosis.id}/questionnaire`}>
                <button className="px-8 py-3 text-lg font-black text-white rounded-xl transition-all hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
                  Continuar Diagnóstico →
                </button>
              </Link>
            </div>

            {/* Partial Scores */}
            {partialScores && (
              <>
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-black" style={{ color: '#152F27' }}>Resultados Parciais</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#EFD4A8', color: '#152F27' }}>
                      PRELIMINAR
                    </span>
                    {partialScores.certification && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-2"
                           style={{ borderColor: partialScores.certification.color, backgroundColor: partialScores.certification.color + '15' }}>
                        <span className="text-lg font-black" style={{ color: partialScores.certification.color }}>
                          {partialScores.certification.level === 'bronze' ? 'BRONZE' : partialScores.certification.level === 'silver' ? 'PRATA' : 'OURO'}
                        </span>
                        <div>
                          <p className="text-xs font-bold" style={{ color: '#152F27' }}>
                            Nivel {partialScores.certification.level === 'bronze' ? 'Bronze' : partialScores.certification.level === 'silver' ? 'Prata' : 'Ouro'}
                          </p>
                          <p className="text-xs font-semibold" style={{ color: partialScores.certification.color }}>
                            {partialScores.certification.name}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#666' }}>
                    Baseado nas respostas fornecidas até o momento
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#666' }}>GERAL</p>
                    <p className="text-4xl font-black" style={{ color: getScoreColor(partialScores.overall) }}>
                      {partialScores.overall.toFixed(0)}
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#e8f5e9' }}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#152F27' }}>AMBIENTAL</p>
                    <p className="text-4xl font-black" style={{ color: '#4CAF50' }}>
                      {partialScores.environmental.toFixed(0)}
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#e3f2fd' }}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#152F27' }}>SOCIAL</p>
                    <p className="text-4xl font-black" style={{ color: '#2196F3' }}>
                      {partialScores.social.toFixed(0)}
                    </p>
                  </div>

                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: '#fff3e0' }}>
                    <p className="text-xs font-bold mb-2" style={{ color: '#152F27' }}>GOVERNANÇA</p>
                    <p className="text-4xl font-black" style={{ color: '#FF9800' }}>
                      {partialScores.governance.toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Partial Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                    <h4 className="text-sm font-black mb-3" style={{ color: '#152F27' }}>Comparativo Parcial</h4>
                    <BarChart
                      data={[
                        { label: 'Ambiental (E)', value: partialScores.environmental, color: '#4CAF50' },
                        { label: 'Social (S)', value: partialScores.social, color: '#2196F3' },
                        { label: 'Governança (G)', value: partialScores.governance, color: '#FF9800' },
                      ]}
                    />
                  </div>

                  <div className="p-4 rounded-xl" style={{ backgroundColor: '#f5f5f5' }}>
                    <h4 className="text-sm font-black mb-3 text-center" style={{ color: '#152F27' }}>Visão Geral Parcial</h4>
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
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-black mb-2" style={{ color: '#152F27' }}>Novo Diagnóstico</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>
                Inicie uma nova avaliação ESG e acompanhe sua evolução
              </p>
              <button
                onClick={handleStartNewDiagnosis}
                className="w-full px-6 py-3 text-base font-black text-white rounded-lg transition-all hover:scale-105 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                Novo Diagnóstico
              </button>
            </div>
          )}

          <Link to="/reports" className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
            <h3 className="text-xl font-black mb-2" style={{ color: '#152F27' }}>Relatórios</h3>
            <p className="text-sm mb-4" style={{ color: '#666' }}>
              Visualize todo o histórico de diagnósticos realizados
            </p>
            <p className="text-sm font-bold" style={{ color: '#7B9965' }}>
              {completedDiagnoses.length} diagnóstico(s) completo(s) →
            </p>
          </Link>

          {lastCompleted && (
            <Link to={`/diagnosis/${lastCompleted.id}/insights`} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <h3 className="text-xl font-black mb-2" style={{ color: '#152F27' }}>Insights & Ações</h3>
              <p className="text-sm mb-4" style={{ color: '#666' }}>
                Veja recomendações e plano de ação personalizado
              </p>
              <p className="text-sm font-bold" style={{ color: '#7B9965' }}>
                Ver plano de ação →
              </p>
            </Link>
          )}
        </div>

        {/* Recent History */}
        {completedDiagnoses.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black" style={{ color: '#152F27' }}>Histórico Recente</h3>
              <Link to="/reports">
                <button className="text-sm font-bold" style={{ color: '#7B9965' }}>
                  Ver Todos →
                </button>
              </Link>
            </div>
            <div className="space-y-4">
              {completedDiagnoses.slice(0, 3).map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="flex items-center justify-between p-6 rounded-xl transition-all hover:shadow-md"
                  style={{ backgroundColor: '#f5f5f5' }}
                >
                  <div className="flex-1">
                    <p className="font-black text-xl mb-1" style={{ color: '#152F27' }}>
                      Score Geral: {Number(diagnosis.overallScore).toFixed(0)}
                    </p>
                    <p className="text-sm font-semibold" style={{ color: '#7B9965' }}>
                      {new Date(diagnosis.completedAt!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/diagnosis/${diagnosis.id}/results`}>
                      <button className="px-4 py-2 text-sm font-bold border-2 rounded-lg transition-all hover:bg-green-50" style={{ color: '#152F27', borderColor: '#152F27' }}>
                        Resultados
                      </button>
                    </Link>
                    <Link to={`/diagnosis/${diagnosis.id}/insights`}>
                      <button className="px-4 py-2 text-sm font-bold text-white rounded-lg transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
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
