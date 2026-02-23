import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';
import api from '../services/api';
import {
  RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  LineChart, Line, Legend,
  PieChart, Pie,
} from 'recharts';

const PILLAR_COLORS = {
  environmental: '#7B9965',
  social: '#924131',
  governance: '#b8963a',
};

interface ThemeScore {
  pillarCode: string;
  pillarName: string;
  themeName: string;
  score: number;
  answeredCount: number;
  totalCount: number;
}

function scoreColor(s: number) {
  if (s >= 80) return '#7B9965';
  if (s >= 60) return '#b8963a';
  if (s >= 40) return '#924131';
  return '#9ca3af';
}

function scoreLabel(s: number) {
  if (s >= 80) return 'Excelente';
  if (s >= 60) return 'Bom';
  if (s >= 40) return 'Regular';
  return 'Crítico';
}

// ─── GAUGE (SVG - this one stays as SVG, it's fine) ─────────
function ScoreGauge({ score, size = 160 }: { score: number; size?: number }) {
  const sw = 14;
  const r = (size - sw) / 2;
  const c = r * 2 * Math.PI;
  const off = c - (score / 100) * c;
  const col = scoreColor(score);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth={sw} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth={sw} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: col, lineHeight: 1 }}>{score.toFixed(0)}</span>
        <span className="text-xs text-gray-400 mt-1">pontos</span>
      </div>
    </div>
  );
}

// Custom tooltip for bar charts
function ThemeTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 text-sm">
      <p className="font-bold text-brand-900 mb-1">{d.fullName || d.name}</p>
      <p className="text-gray-600">Score: <span className="font-bold" style={{ color: scoreColor(d.score) }}>{d.score.toFixed(1)}%</span></p>
      {d.answeredCount !== undefined && (
        <p className="text-gray-400 text-xs mt-0.5">{d.answeredCount}/{d.totalCount} respostas</p>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────

export default function Dashboard() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<Diagnosis | null>(null);
  const [partialScores, setPartialScores] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [actionPlans, setActionPlans] = useState<any[]>([]);
  const [certificate, setCertificate] = useState<any>(null);
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string | null>(null);
  const [selectedScores, setSelectedScores] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDiagnoses();
    loadUserName();
  }, []);

  async function loadUserName() {
    try {
      const res = await api.get('/auth/me');
      setUserName(res.data.name?.split(' ')[0] || '');
    } catch {}
  }

  async function loadDiagnoses() {
    try {
      setLoadError(false);
      const data = await diagnosisService.list();
      setDiagnoses(data);
      const ip = data.find(d => d.status === 'in_progress');
      if (ip) {
        setCurrentDiagnosis(ip);
        loadPartialScores(ip.id);
      }
      const completed = data.filter(d => d.status === 'completed');
      if (completed.length > 0) {
        const lastId = completed[0].id;
        setSelectedDiagnosisId(lastId);
        loadSelectedScores(lastId);
        try {
          const ap = await diagnosisService.getActionPlans(lastId);
          setActionPlans(ap);
        } catch {}
        try {
          const certRes = await api.get(`/certificates/diagnosis/${lastId}`);
          if (certRes.data) setCertificate(certRes.data);
        } catch {}
      }
    } catch (e) {
      console.error('Erro ao carregar diagnósticos:', e);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  async function loadPartialScores(id: string) {
    try {
      const res = await api.get(`/diagnoses/${id}/partial-scores`);
      setPartialScores(res.data);
    } catch (e) {
      console.error('Erro ao carregar scores parciais:', e);
    }
  }

  async function loadSelectedScores(id: string) {
    try {
      const res = await api.get(`/diagnoses/${id}/partial-scores`);
      setSelectedScores(res.data);
    } catch (e) {
      console.error('Erro ao carregar scores:', e);
    }
  }

  async function handleSelectDiagnosis(id: string) {
    setSelectedDiagnosisId(id);
    setSelectedScores(null);
    setActionPlans([]);
    setCertificate(null);
    loadSelectedScores(id);
    try {
      const ap = await diagnosisService.getActionPlans(id);
      setActionPlans(ap);
    } catch {}
    try {
      const certRes = await api.get(`/certificates/diagnosis/${id}`);
      if (certRes.data) setCertificate(certRes.data);
    } catch {}
  }

  async function handleStartNewDiagnosis() {
    try {
      const d = await diagnosisService.create();
      navigate(`/diagnosis/${d.id}/questionnaire`);
    } catch (e) {
      console.error('Erro ao criar diagnóstico:', e);
    }
  }

  const completed = diagnoses.filter(d => d.status === 'completed');
  const selected = completed.find(d => d.id === selectedDiagnosisId) || null;
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; })();
  const pendingActions = actionPlans.filter(a => a.status === 'pending' || a.status === 'in_progress').length;
  const completedActionsCount = actionPlans.filter(a => a.status === 'completed').length;

  const overall = selected ? Number(selected.overallScore) : 0;
  const env = selected ? Number(selected.environmentalScore) : 0;
  const soc = selected ? Number(selected.socialScore) : 0;
  const gov = selected ? Number(selected.governanceScore) : 0;

  const themeScores: ThemeScore[] = selectedScores?.themeScores || [];
  const envThemes = themeScores.filter(t => t.pillarCode === 'E');
  const socThemes = themeScores.filter(t => t.pillarCode === 'S');
  const govThemes = themeScores.filter(t => t.pillarCode === 'G');

  // Recharts data
  const radarData = [
    { subject: 'Ambiental', value: env, fullMark: 100 },
    { subject: 'Social', value: soc, fullMark: 100 },
    { subject: 'Governança', value: gov, fullMark: 100 },
  ];

  const pillarPieData = [
    { name: 'Ambiental', value: env, color: PILLAR_COLORS.environmental },
    { name: 'Social', value: soc, color: PILLAR_COLORS.social },
    { name: 'Governança', value: gov, color: PILLAR_COLORS.governance },
  ];

  const makeBarData = (themes: ThemeScore[]) =>
    themes.map(t => ({
      name: t.themeName.length > 18 ? t.themeName.substring(0, 18) + '...' : t.themeName,
      fullName: t.themeName,
      score: t.score,
      answeredCount: t.answeredCount,
      totalCount: t.totalCount,
    }));

  const evolutionData = completed.length > 1
    ? completed.slice(0, 6).reverse().map(d => ({
        date: new Date(d.completedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        Ambiental: Number(d.environmentalScore),
        Social: Number(d.socialScore),
        Governança: Number(d.governanceScore),
        Geral: Number(d.overallScore),
      }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-brand-700 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-base font-medium text-brand-900">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ═══════ HERO ═══════ */}
      <div className="bg-brand-900">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{greeting}{userName ? `, ${userName}` : ''}</h1>
              <p className="text-sm text-white/50 mt-1">Painel ESG — Visão Geral</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Dropdown */}
              {completed.length > 1 && (
                <select
                  value={selectedDiagnosisId || ''}
                  onChange={(e) => handleSelectDiagnosis(e.target.value)}
                  className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem', appearance: 'none' as const }}
                >
                  {completed.map(d => (
                    <option key={d.id} value={d.id} className="text-gray-900 bg-white">
                      {new Date(d.completedAt!).toLocaleDateString('pt-BR')} — Score {Number(d.overallScore).toFixed(0)}
                    </option>
                  ))}
                </select>
              )}
              {selected && (
                <div className="bg-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
                  <span className="text-3xl font-bold text-white">{overall.toFixed(0)}</span>
                  <span className="text-sm font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: scoreColor(overall) + '30', color: scoreColor(overall) }}>
                    {scoreLabel(overall)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* ═══════ ERROR ═══════ */}
        {loadError && !selected && !currentDiagnosis && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <h2 className="text-xl font-bold text-brand-900 mb-2">Erro ao carregar dados</h2>
            <p className="text-sm text-gray-500 mb-5">Não foi possível conectar ao servidor.</p>
            <button onClick={() => { setLoading(true); loadDiagnoses(); loadUserName(); }} className="px-8 py-3 font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90 text-sm">
              Tentar Novamente
            </button>
          </div>
        )}

        {/* ═══════ WELCOME ═══════ */}
        {!loadError && !selected && !currentDiagnosis && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
            <div className="flex items-center gap-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-brand-900 mb-3">Bem-vindo ao engreena!</h2>
                <p className="text-base text-gray-500 mb-6 max-w-md">Faça seu primeiro diagnóstico ESG e descubra como sua empresa pode ser mais sustentável.</p>
                <button onClick={handleStartNewDiagnosis} className="px-10 py-3 font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90 text-base">
                  Fazer Primeiro Diagnóstico
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ IN-PROGRESS BANNER ═══════ */}
        {currentDiagnosis && partialScores && (
          <Link to={`/diagnosis/${currentDiagnosis.id}/questionnaire`} className="block">
            <div className="bg-white rounded-2xl shadow-sm border-2 border-amber-200 p-5 hover:border-amber-300 transition-all">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-brand-900">Diagnóstico em andamento</p>
                  <p className="text-sm text-gray-400 mt-0.5">{partialScores.answeredCount}/{partialScores.totalCount} respostas — clique para continuar</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-40 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(partialScores.answeredCount / (partialScores.totalCount || 75)) * 100}%` }} />
                  </div>
                  <span className="text-lg font-bold text-amber-700">{Math.round((partialScores.answeredCount / (partialScores.totalCount || 75)) * 100)}%</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ═══════ ACTION CARDS ═══════ */}
        {completed.length > 0 && (
          <div className={`grid grid-cols-1 gap-4 ${currentDiagnosis ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {!currentDiagnosis && (
              <button onClick={handleStartNewDiagnosis} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-brand-700/30 transition-all text-left group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-brand-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <div>
                    <p className="text-base font-bold text-brand-900">Novo Diagnóstico</p>
                    <p className="text-sm text-gray-400">Iniciar nova avaliação ESG</p>
                  </div>
                </div>
              </button>
            )}
            {selected && (
              <Link to={`/diagnosis/${selected.id}/insights`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-brand-700/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${pendingActions > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                    <svg className={`w-6 h-6 ${pendingActions > 0 ? 'text-amber-700' : 'text-green-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-brand-900">Plano de Ação</p>
                    <p className="text-sm text-gray-400">{pendingActions > 0 ? `${pendingActions} ações pendentes` : actionPlans.length > 0 ? `${completedActionsCount} concluídas` : 'Nenhuma ação'}</p>
                  </div>
                  {actionPlans.length > 0 && <span className={`text-2xl font-bold ${pendingActions > 0 ? 'text-amber-600' : 'text-green-600'}`}>{pendingActions > 0 ? pendingActions : completedActionsCount}/{actionPlans.length}</span>}
                </div>
              </Link>
            )}
            {selected && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-brand-900">Certificado ESG</p>
                    <p className="text-sm text-gray-400">{certificate ? `#${certificate.certificateNumber}` : 'Não emitido'}</p>
                  </div>
                  {certificate ? (
                    <Link to={`/certificate/${certificate.id}`}><button className="px-5 py-2 text-sm font-semibold text-amber-700 bg-amber-100 rounded-full hover:bg-amber-200">Ver</button></Link>
                  ) : (
                    <button onClick={async () => { if (!selected) return; try { const res = await api.post(`/certificates/${selected.id}`); setCertificate(res.data); navigate(`/certificate/${res.data.id}`); } catch (err: any) { alert(err?.response?.data?.error || 'Erro ao emitir certificado'); } }} className="px-5 py-2 text-sm font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90">Emitir</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ MAIN SCORES — Gauge + Radar + Pillar Bars ═══════ */}
        {selected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Score + Certification */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center">
              <ScoreGauge score={overall} size={170} />
              <span className="mt-3 text-sm font-bold px-4 py-1 rounded-full" style={{ backgroundColor: scoreColor(overall) + '18', color: scoreColor(overall) }}>
                {scoreLabel(overall)}
              </span>
              <p className="text-xs text-gray-400 mt-2">
                {new Date(selected.completedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              {(() => {
                const level = overall >= 70 ? 'ouro' : overall >= 40 ? 'prata' : 'bronze';
                const levelName = overall >= 70 ? 'Ouro' : overall >= 40 ? 'Prata' : 'Bronze';
                return (
                  <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50 w-full">
                    <img src={`/images/assets/selo-${level}.png`} alt={`Selo ${levelName}`} className="w-12 h-12 object-contain" />
                    <div>
                      <p className="text-sm font-bold text-brand-900">Certificação {levelName}</p>
                      <p className="text-xs text-gray-400">{overall >= 70 ? '70-100' : overall >= 40 ? '40-69' : '0-39'} pts</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Recharts Radar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
              <h3 className="text-sm font-bold text-brand-900 mb-2 uppercase tracking-wider">Visão Geral ESG</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RechartsRadar data={radarData}>
                  <PolarGrid strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13, fontWeight: 700, fill: '#152F27' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Score" dataKey="value" stroke="#7B9965" fill="#7B9965" fillOpacity={0.2} strokeWidth={2.5} dot={{ r: 5, fill: '#fff', stroke: '#7B9965', strokeWidth: 2.5 }} />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)}`, 'Score']} />
                </RechartsRadar>
              </ResponsiveContainer>
              {/* Mini pie for contribution */}
              <div className="flex items-center gap-4 mt-2">
                <div className="w-20 h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pillarPieData} dataKey="value" cx="50%" cy="50%" innerRadius={18} outerRadius={35} paddingAngle={3}>
                        {pillarPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v: number, name: string) => [`${v.toFixed(0)}`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1">
                  {pillarPieData.map(p => (
                    <div key={p.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: p.color }} />
                      <span className="text-gray-500">{p.name}</span>
                      <span className="font-bold" style={{ color: p.color }}>{p.value.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pillar Details + Navigation */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Pilares</h3>
              <div className="space-y-5 mb-6">
                {[
                  { label: 'Ambiental (E)', value: env, color: PILLAR_COLORS.environmental },
                  { label: 'Social (S)', value: soc, color: PILLAR_COLORS.social },
                  { label: 'Governança (G)', value: gov, color: PILLAR_COLORS.governance },
                ].map(p => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-600">{p.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: p.color + '15', color: p.color }}>{scoreLabel(p.value)}</span>
                        <span className="text-lg font-bold" style={{ color: p.color }}>{p.value.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${p.value}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Link to={`/diagnosis/${selected.id}/insights`}><button className="w-full py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90">Ações</button></Link>
                <Link to={`/diagnosis/${selected.id}/results`}><button className="w-full py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50">Resultados</button></Link>
                <Link to={`/diagnosis/${selected.id}/report`}><button className="w-full py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50">Relatório</button></Link>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ INTERACTIVE THEME CHARTS ═══════ */}
        {themeScores.length > 0 && (
          <>
            {/* Ambiental */}
            {envThemes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: PILLAR_COLORS.environmental }}>E</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-brand-900">Ambiental por Tema</h3>
                    <p className="text-xs text-gray-400">{envThemes.length} temas avaliados</p>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: PILLAR_COLORS.environmental }}>{env.toFixed(0)}</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={makeBarData(envThemes)} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-35} textAnchor="end" interval={0} height={80} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip content={<ThemeTooltip />} />
                    <ReferenceLine y={env} stroke={PILLAR_COLORS.environmental} strokeDasharray="6 4" strokeWidth={1.5} label={{ value: `Média ${env.toFixed(0)}`, position: 'right', fontSize: 11, fill: PILLAR_COLORS.environmental }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {makeBarData(envThemes).map((entry, i) => (
                        <Cell key={i} fill={entry.score >= 60 ? PILLAR_COLORS.environmental : entry.score >= 40 ? '#b8963a' : '#924131'} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Social */}
            {socThemes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: PILLAR_COLORS.social }}>S</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-brand-900">Social por Tema</h3>
                    <p className="text-xs text-gray-400">{socThemes.length} temas avaliados</p>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: PILLAR_COLORS.social }}>{soc.toFixed(0)}</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={makeBarData(socThemes)} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-35} textAnchor="end" interval={0} height={80} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip content={<ThemeTooltip />} />
                    <ReferenceLine y={soc} stroke={PILLAR_COLORS.social} strokeDasharray="6 4" strokeWidth={1.5} label={{ value: `Média ${soc.toFixed(0)}`, position: 'right', fontSize: 11, fill: PILLAR_COLORS.social }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {makeBarData(socThemes).map((entry, i) => (
                        <Cell key={i} fill={entry.score >= 60 ? PILLAR_COLORS.social : entry.score >= 40 ? '#b8963a' : '#924131'} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Governança */}
            {govThemes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: PILLAR_COLORS.governance }}>G</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-brand-900">Governança por Tema</h3>
                    <p className="text-xs text-gray-400">{govThemes.length} temas avaliados</p>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: PILLAR_COLORS.governance }}>{gov.toFixed(0)}</span>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={makeBarData(govThemes)} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} angle={-35} textAnchor="end" interval={0} height={80} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip content={<ThemeTooltip />} />
                    <ReferenceLine y={gov} stroke={PILLAR_COLORS.governance} strokeDasharray="6 4" strokeWidth={1.5} label={{ value: `Média ${gov.toFixed(0)}`, position: 'right', fontSize: 11, fill: PILLAR_COLORS.governance }} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} animationDuration={800}>
                      {makeBarData(govThemes).map((entry, i) => (
                        <Cell key={i} fill={entry.score >= 60 ? PILLAR_COLORS.governance : entry.score >= 40 ? '#b8963a' : '#924131'} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ═══════ EVOLUTION LINE CHART ═══════ */}
        {evolutionData.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Evolução ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={evolutionData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="Ambiental" stroke={PILLAR_COLORS.environmental} strokeWidth={2.5} dot={{ r: 5, fill: '#fff', stroke: PILLAR_COLORS.environmental, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="Social" stroke={PILLAR_COLORS.social} strokeWidth={2.5} dot={{ r: 5, fill: '#fff', stroke: PILLAR_COLORS.social, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="Governança" stroke={PILLAR_COLORS.governance} strokeWidth={2.5} dot={{ r: 5, fill: '#fff', stroke: PILLAR_COLORS.governance, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                <Line type="monotone" dataKey="Geral" stroke="#152F27" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#fff', stroke: '#152F27', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ═══════ HISTORY ═══════ */}
        {completed.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Histórico de Diagnósticos</h3>
            <div className="space-y-3">
              {completed.slice(0, 5).map(d => (
                <div key={d.id} className={`flex items-center justify-between p-4 rounded-xl transition-all ${selectedDiagnosisId === d.id ? 'bg-brand-100/60 ring-1 ring-brand-700/20' : 'bg-gray-50 hover:bg-brand-100/30'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ backgroundColor: scoreColor(Number(d.overallScore)) + '15' }}>
                      <span className="text-base font-bold" style={{ color: scoreColor(Number(d.overallScore)) }}>{Number(d.overallScore).toFixed(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-900">Score: {Number(d.overallScore).toFixed(0)} — {scoreLabel(Number(d.overallScore))}</p>
                      <p className="text-xs text-gray-400">{new Date(d.completedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedDiagnosisId !== d.id && (
                      <button onClick={() => handleSelectDiagnosis(d.id)} className="px-4 py-1.5 text-xs font-semibold text-brand-900 border border-brand-700/30 rounded-full hover:bg-brand-100">Visualizar</button>
                    )}
                    <Link to={`/diagnosis/${d.id}/insights`}><button className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90">Ações</button></Link>
                    <Link to={`/diagnosis/${d.id}/report`}><button className="px-4 py-1.5 text-xs font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-white">Relatório</button></Link>
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
