import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { reportService, FullReport, PillarBreakdown } from '../services/report.service';

// Cores por pilar
const pillarColors: Record<string, string> = {
  E: '#4CAF50',
  S: '#2196F3',
  G: '#FF9800',
};

const pillarBgColors: Record<string, string> = {
  E: '#E8F5E9',
  S: '#E3F2FD',
  G: '#FFF3E0',
};

// Componente de Gráfico Radar
function RadarChart({ scores }: { scores: { environmental: number; social: number; governance: number } }) {
  const size = 200;
  const center = size / 2;
  const radius = 70;

  const points = [
    { label: 'E', value: scores.environmental, angle: -90 },
    { label: 'S', value: scores.social, angle: 30 },
    { label: 'G', value: scores.governance, angle: 150 },
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
      {/* Grid */}
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
        />
      ))}

      {/* Axes */}
      {points.map((p) => {
        const end = getPoint(100, p.angle);
        return (
          <line
            key={p.label}
            x1={center}
            y1={center}
            x2={end.x}
            y2={end.y}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={points.map((p) => {
          const pt = getPoint(p.value, p.angle);
          return `${pt.x},${pt.y}`;
        }).join(' ')}
        fill="rgba(123, 153, 101, 0.3)"
        stroke="#7B9965"
        strokeWidth="2"
      />

      {/* Data points */}
      {points.map((p) => {
        const pt = getPoint(p.value, p.angle);
        return (
          <circle
            key={p.label}
            cx={pt.x}
            cy={pt.y}
            r="4"
            fill={pillarColors[p.label]}
          />
        );
      })}

      {/* Labels */}
      {points.map((p) => {
        const labelPt = getPoint(115, p.angle);
        return (
          <text
            key={p.label}
            x={labelPt.x}
            y={labelPt.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="bold"
            fill={pillarColors[p.label]}
          >
            {p.label}
          </text>
        );
      })}
    </svg>
  );
}

// Componente de Barra de Progresso
function ProgressBar({ value, color, showLabel = true }: { value: number; color: string; showLabel?: boolean }) {
  return (
    <div className="w-full">
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(value, 100)}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <div className="text-right text-sm font-medium mt-1" style={{ color }}>
          {value.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

// Componente de Card de Pilar
function PillarCard({ breakdown }: { breakdown: PillarBreakdown }) {
  const color = pillarColors[breakdown.pillarCode];
  const bgColor = pillarBgColors[breakdown.pillarCode];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4" style={{ backgroundColor: bgColor }}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold" style={{ color }}>
            {breakdown.pillarName}
          </h3>
          <div
            className="text-2xl font-bold px-3 py-1 rounded"
            style={{ backgroundColor: color, color: 'white' }}
          >
            {breakdown.score.toFixed(1)}
          </div>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-700 mb-3">Temas Avaliados</h4>
        <div className="space-y-3">
          {breakdown.themes.map((theme) => (
            <div key={theme.themeId}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{theme.themeName}</span>
                <span className="font-medium" style={{ color }}>
                  {theme.percentage.toFixed(1)}%
                </span>
              </div>
              <ProgressBar value={theme.percentage} color={color} showLabel={false} />
            </div>
          ))}
        </div>

        {breakdown.strengths.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-semibold text-green-700 mb-2">Pontos Fortes</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {breakdown.strengths.map((s, i) => (
                <li key={i} className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {breakdown.weaknesses.length > 0 && (
          <div className="mt-4">
            <h5 className="text-sm font-semibold text-red-700 mb-2">Áreas de Melhoria</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {breakdown.weaknesses.map((w, i) => (
                <li key={i} className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Badge de Certificação
function CertificationBadge({ level, score }: { level: string; score: number }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    bronze: { bg: '#FEF3C7', text: '#92400E', border: '#CD7F32' },
    silver: { bg: '#F3F4F6', text: '#374151', border: '#C0C0C0' },
    gold: { bg: '#FEF3C7', text: '#92400E', border: '#FFD700' },
  };

  const c = colors[level] || colors.bronze;

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2"
      style={{ backgroundColor: c.bg, borderColor: c.border }}
    >
      <span className="text-2xl">
        {level === 'gold' ? '🥇' : level === 'silver' ? '🥈' : '🥉'}
      </span>
      <span className="font-bold" style={{ color: c.text }}>
        {level.toUpperCase()} - {score.toFixed(1)} pontos
      </span>
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
        setError(err.response?.data?.error || 'Erro ao carregar relatório');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-4 mx-auto"
            style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}
          />
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>
            Gerando relatório...
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {error || 'Relatório não encontrado'}
          </h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { companyInfo, scores, certification, pillarBreakdowns, insights, actionPlans, summary } = report;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Botões de ação (não imprimíveis) */}
      <div className="print:hidden bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <span>←</span> Voltar
          </button>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
            >
              <span>🖨️</span> Imprimir / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo do Relatório */}
      <div ref={printRef} className="max-w-5xl mx-auto py-8 px-4 print:py-0 print:px-0">
        {/* Cabeçalho */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none print:rounded-none">
          <div className="flex justify-between items-start border-b pb-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#152F27' }}>
                GREENA
              </h1>
              <p className="text-sm text-gray-500">Relatório ESG Detalhado</p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>
                Data: {new Date(report.reportDate).toLocaleDateString('pt-BR')}
              </p>
              <p>
                Diagnóstico: {new Date(report.completedAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h2 className="font-bold text-lg mb-2" style={{ color: '#152F27' }}>
                {companyInfo.name}
              </h2>
              <div className="text-sm text-gray-600 space-y-1">
                {companyInfo.cnpj && <p><strong>CNPJ:</strong> {companyInfo.cnpj}</p>}
                {companyInfo.city && <p><strong>Cidade:</strong> {companyInfo.city}</p>}
                {companyInfo.sector && <p><strong>Setor:</strong> {companyInfo.sector}</p>}
                {companyInfo.size && <p><strong>Porte:</strong> {companyInfo.size}</p>}
                {companyInfo.employeesRange && (
                  <p><strong>Funcionários:</strong> {companyInfo.employeesRange}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <CertificationBadge level={certification.level} score={scores.overall} />
              <p className="text-sm text-gray-600 mt-2">{certification.name}</p>
            </div>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none print:rounded-none print:break-before-page">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#152F27' }}>
            Resumo Executivo
          </h2>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <RadarChart scores={scores} />
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-700 mb-4">{summary.overallAssessment}</p>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg" style={{ backgroundColor: pillarBgColors.E }}>
                  <div className="text-2xl font-bold" style={{ color: pillarColors.E }}>
                    {scores.environmental.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Ambiental</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: pillarBgColors.S }}>
                  <div className="text-2xl font-bold" style={{ color: pillarColors.S }}>
                    {scores.social.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Social</div>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: pillarBgColors.G }}>
                  <div className="text-2xl font-bold" style={{ color: pillarColors.G }}>
                    {scores.governance.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">Governança</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">Pilar Mais Forte</h4>
              <p className="text-gray-700">
                {summary.strongestPillar} ({summary.strongestPillarScore.toFixed(1)} pontos)
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <h4 className="font-semibold text-amber-700 mb-2">Oportunidade de Melhoria</h4>
              <p className="text-gray-700">
                {summary.weakestPillar} ({summary.weakestPillarScore.toFixed(1)} pontos)
              </p>
            </div>
          </div>
        </div>

        {/* Detalhamento por Pilar */}
        <div className="mb-6 print:break-before-page">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#152F27' }}>
            Detalhamento por Pilar
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {pillarBreakdowns.map((breakdown) => (
              <PillarCard key={breakdown.pillarId} breakdown={breakdown} />
            ))}
          </div>
        </div>

        {/* Certificação */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none print:rounded-none">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#152F27' }}>
            Certificação ESG
          </h2>
          <div
            className="p-4 rounded-lg border-2"
            style={{ borderColor: certification.color, backgroundColor: `${certification.color}10` }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">
                {certification.level === 'gold' ? '🥇' : certification.level === 'silver' ? '🥈' : '🥉'}
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: certification.color }}>
                  {certification.title}
                </h3>
                <p className="text-gray-600">{certification.name} - Score {certification.scoreRange}</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4 italic">&quot;{certification.message}&quot;</p>
            <h4 className="font-semibold text-gray-700 mb-2">Características:</h4>
            <ul className="space-y-1">
              {certification.characteristics.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span style={{ color: certification.color }}>✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Insights Estratégicos */}
        {insights.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none print:rounded-none print:break-before-page">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#152F27' }}>
              Insights Estratégicos
            </h2>
            <div className="space-y-4">
              {insights.map((insight) => {
                const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
                  critical: { bg: '#FEE2E2', text: '#DC2626', border: '#DC2626' },
                  attention: { bg: '#FEF3C7', text: '#D97706', border: '#D97706' },
                  excellent: { bg: '#D1FAE5', text: '#059669', border: '#059669' },
                };
                const c = categoryColors[insight.category] || categoryColors.attention;

                return (
                  <div
                    key={insight.id}
                    className="p-4 rounded-lg border-l-4"
                    style={{ backgroundColor: c.bg, borderLeftColor: c.border }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={{ backgroundColor: c.border, color: 'white' }}
                      >
                        {insight.categoryLabel}
                      </span>
                      <h4 className="font-bold" style={{ color: c.text }}>
                        {insight.title}
                      </h4>
                    </div>
                    <p className="text-gray-700 text-sm">{insight.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Plano de Ação */}
        {actionPlans.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none print:rounded-none print:break-before-page">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#152F27' }}>
              Plano de Ação Recomendado
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Ação</th>
                    <th className="text-left py-2 px-2">Prioridade</th>
                    <th className="text-left py-2 px-2">Investimento</th>
                    <th className="text-left py-2 px-2">Prazo</th>
                    <th className="text-left py-2 px-2">Impacto</th>
                  </tr>
                </thead>
                <tbody>
                  {actionPlans.map((action, index) => {
                    const priorityColors: Record<string, string> = {
                      critical: '#DC2626',
                      high: '#D97706',
                      medium: '#3B82F6',
                      low: '#6B7280',
                    };

                    return (
                      <tr key={action.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 font-bold text-gray-500">{index + 1}</td>
                        <td className="py-2 px-2">
                          <div className="font-medium text-gray-800">
                            {action.title.replace(/^\d+\.\s*/, '')}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {action.description.substring(0, 100)}...
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className="px-2 py-1 rounded text-xs font-bold text-white"
                            style={{ backgroundColor: priorityColors[action.priority] }}
                          >
                            {action.priorityLabel}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-600">{action.investmentLabel}</td>
                        <td className="py-2 px-2 text-gray-600">{action.deadlineDays} dias</td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${action.impactScore * 10}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{action.impactScore}/10</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recomendação Final */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 print:shadow-none print:rounded-none">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#152F27' }}>
            Recomendação Principal
          </h2>
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF' }}>
            <p className="text-gray-700">{summary.recommendation}</p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center text-sm text-gray-500 py-4 border-t">
          <p>Relatório gerado pela plataforma GREENA</p>
          <p>© {new Date().getFullYear()} Greena ESG - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}
