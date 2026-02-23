import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';
import api from '../services/api';

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

// ─── CHART COMPONENTS ───────────────────────────────────────────

function ScoreGauge({ score, size = 120, color }: { score: number; size?: number; color?: string }) {
  const sw = size > 140 ? 12 : size > 100 ? 10 : 7;
  const r = (size - sw) / 2;
  const c = r * 2 * Math.PI;
  const off = c - (score / 100) * c;
  const col = color || scoreColor(score);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth={sw} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={col} strokeWidth={sw} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold" style={{ color: col, fontSize: size > 140 ? '2.5rem' : size > 100 ? '1.75rem' : '1.25rem', lineHeight: 1 }}>
          {score.toFixed(0)}
        </span>
        {size > 100 && <span className="text-[10px] text-gray-400 mt-0.5">pontos</span>}
      </div>
    </div>
  );
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

// Radar Chart
function RadarChart({ environmental, social, governance, size = 200 }: { environmental: number; social: number; governance: number; size?: number }) {
  const center = size / 2;
  const radius = size * 0.33;
  const angles = [-90, 30, 150];
  const pt = (v: number, ai: number) => {
    const rad = (angles[ai] * Math.PI) / 180;
    const rr = (v / 100) * radius;
    return { x: center + rr * Math.cos(rad), y: center + rr * Math.sin(rad) };
  };
  const data = [pt(environmental, 0), pt(social, 1), pt(governance, 2)];
  const colors = [PILLAR_COLORS.environmental, PILLAR_COLORS.social, PILLAR_COLORS.governance];
  const labels = ['Ambiental', 'Social', 'Governança'];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[20, 40, 60, 80, 100].map((pct) => (
        <polygon key={pct} points={angles.map((_, i) => { const p = pt(pct, i); return `${p.x},${p.y}`; }).join(' ')}
          fill="none" stroke={pct === 100 ? '#d1d5db' : '#f3f4f6'} strokeWidth="1" />
      ))}
      {angles.map((_, i) => {
        const p = pt(100, i);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#f3f4f6" strokeWidth="1" />;
      })}
      <polygon points={data.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(123,153,101,0.12)" stroke="#7B9965" strokeWidth="2" />
      {data.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke={colors[i]} strokeWidth="2.5" />
      ))}
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return <text key={i} x={center + (radius + 24) * Math.cos(rad)} y={center + (radius + 24) * Math.sin(rad)}
          textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill={colors[i]}>{labels[i]}</text>;
      })}
    </svg>
  );
}

// Evolution Chart
function EvolutionChart({ diagnoses }: { diagnoses: Diagnosis[] }) {
  if (diagnoses.length < 2) return null;
  const w = 500, h = 160, pad = 35;
  const cw = w - 2 * pad, ch = h - 2 * pad;
  const pts = diagnoses.slice(0, 5).reverse();
  const gx = (i: number) => pad + (cw / (pts.length - 1 || 1)) * i;
  const gy = (s: number) => h - pad - (s / 100) * ch;
  const path = (scores: number[]) => scores.map((s, i) => `${i === 0 ? 'M' : 'L'} ${gx(i)} ${gy(s)}`).join(' ');

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {[0, 50, 100].map(v => (
        <g key={v}>
          <line x1={pad} y1={gy(v)} x2={w - pad} y2={gy(v)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={pad - 6} y={gy(v) + 3} textAnchor="end" fontSize="9" fill="#9ca3af">{v}</text>
        </g>
      ))}
      <path d={path(pts.map(d => Number(d.environmentalScore)))} fill="none" stroke={PILLAR_COLORS.environmental} strokeWidth="2" strokeLinecap="round" />
      <path d={path(pts.map(d => Number(d.socialScore)))} fill="none" stroke={PILLAR_COLORS.social} strokeWidth="2" strokeLinecap="round" />
      <path d={path(pts.map(d => Number(d.governanceScore)))} fill="none" stroke={PILLAR_COLORS.governance} strokeWidth="2" strokeLinecap="round" />
      {pts.map((d, i) => (
        <text key={i} x={gx(i)} y={h - 8} textAnchor="middle" fontSize="9" fill="#9ca3af">
          {new Date(d.completedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </text>
      ))}
    </svg>
  );
}

// Theme Bar Chart — horizontal bars for a single pillar
function ThemeBarChart({ themes, color }: { themes: ThemeScore[]; color: string }) {
  return (
    <div className="space-y-2.5">
      {themes.map((t, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-medium text-gray-600 truncate flex-1 mr-2">{t.themeName}</span>
            <span className="text-[11px] font-bold flex-shrink-0" style={{ color: scoreColor(t.score) }}>{t.score.toFixed(0)}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(t.score, 100)}%`, backgroundColor: color }} />
          </div>
        </div>
      ))}
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
      // Load scores for last completed
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

  // Scores from selected diagnosis
  const overall = selected ? Number(selected.overallScore) : 0;
  const env = selected ? Number(selected.environmentalScore) : 0;
  const soc = selected ? Number(selected.socialScore) : 0;
  const gov = selected ? Number(selected.governanceScore) : 0;

  // Theme scores from selected
  const themeScores: ThemeScore[] = selectedScores?.themeScores || [];
  const envThemes = themeScores.filter(t => t.pillarCode === 'E');
  const socThemes = themeScores.filter(t => t.pillarCode === 'S');
  const govThemes = themeScores.filter(t => t.pillarCode === 'G');
  const criticalThemes = [...themeScores].sort((a, b) => a.score - b.score).slice(0, 5);

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
    <div className="min-h-screen bg-gray-50">
      {/* ═══════ HERO COMPACTO ═══════ */}
      <div className="bg-brand-900">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{greeting}{userName ? `, ${userName}` : ''}</h1>
              <p className="text-xs text-white/40 mt-0.5">Painel ESG</p>
            </div>
            {selected && (
              <div className="flex items-center gap-2">
                <div className="bg-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">{overall.toFixed(0)}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: scoreColor(overall) + '30', color: scoreColor(overall) }}>
                    {scoreLabel(overall)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-5">
        {/* ═══════ ERROR ═══════ */}
        {loadError && !selected && !currentDiagnosis && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 mb-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-brand-900 mb-2">Erro ao carregar dados</h2>
            <p className="text-sm text-gray-500 mb-5">Nao foi possivel conectar ao servidor.</p>
            <button onClick={() => { setLoading(true); loadDiagnoses(); loadUserName(); }} className="px-8 py-2.5 font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90">
              Tentar Novamente
            </button>
          </div>
        )}

        {/* ═══════ WELCOME (no diagnoses) ═══════ */}
        {!loadError && !selected && !currentDiagnosis && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 mb-6">
            <div className="flex items-center gap-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-brand-900 mb-2">Bem-vindo ao engreena!</h2>
                <p className="text-sm text-gray-500 mb-5 max-w-md">Faca seu primeiro diagnostico ESG e descubra como sua empresa pode ser mais sustentavel.</p>
                <button onClick={handleStartNewDiagnosis} className="px-8 py-3 font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90">
                  Fazer Primeiro Diagnostico
                </button>
              </div>
              <div className="hidden md:flex w-24 h-24 rounded-full bg-brand-300/20 items-center justify-center">
                <svg className="w-12 h-12 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ DIAGNOSIS IN-PROGRESS BANNER ═══════ */}
        {currentDiagnosis && partialScores && (
          <Link to={`/diagnosis/${currentDiagnosis.id}/questionnaire`} className="block mb-5">
            <div className="bg-white rounded-xl shadow-sm border-2 border-amber-200 p-4 hover:border-amber-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-brand-900">Diagnostico em andamento</p>
                  <p className="text-xs text-gray-400">{partialScores.answeredCount}/{partialScores.totalCount} respostas — clique para continuar</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(partialScores.answeredCount / (partialScores.totalCount || 75)) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-amber-700">{Math.round((partialScores.answeredCount / (partialScores.totalCount || 75)) * 100)}%</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ═══════ DIAGNOSIS DATE SELECTOR + ACTION CARDS ═══════ */}
        {completed.length > 0 && (
          <>
            {/* Date filter */}
            {completed.length > 1 && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Diagnostico:</span>
                <div className="flex gap-2 flex-wrap">
                  {completed.map(d => (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDiagnosis(d.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selectedDiagnosisId === d.id
                          ? 'bg-brand-900 text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-700/30'
                      }`}
                    >
                      {new Date(d.completedAt!).toLocaleDateString('pt-BR')} — Score {Number(d.overallScore).toFixed(0)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action cards row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {/* Card: Novo Diagnostico / Continuar */}
              {currentDiagnosis ? null : (
                <button onClick={handleStartNewDiagnosis} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-brand-700/30 transition-all text-left group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-900">Novo Diagnostico</p>
                      <p className="text-xs text-gray-400">Iniciar nova avaliacao ESG</p>
                    </div>
                  </div>
                </button>
              )}

              {/* Card: Acoes Pendentes */}
              {selected && (
                <Link to={`/diagnosis/${selected.id}/insights`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-brand-700/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${pendingActions > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                      {pendingActions > 0 ? (
                        <svg className="w-5 h-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-brand-900">Plano de Acao</p>
                      <p className="text-xs text-gray-400">
                        {pendingActions > 0 ? `${pendingActions} acoes pendentes` : actionPlans.length > 0 ? `${completedActionsCount} concluidas` : 'Nenhuma acao'}
                      </p>
                    </div>
                    {actionPlans.length > 0 && (
                      <span className={`text-lg font-bold ${pendingActions > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {pendingActions > 0 ? pendingActions : completedActionsCount}/{actionPlans.length}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              {/* Card: Certificado */}
              {selected && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:border-brand-700/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-brand-900">Certificado ESG</p>
                      <p className="text-xs text-gray-400">{certificate ? `#${certificate.certificateNumber}` : 'Nao emitido'}</p>
                    </div>
                    {certificate ? (
                      <Link to={`/certificate/${certificate.id}`}>
                        <button className="px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full hover:bg-amber-200">Ver</button>
                      </Link>
                    ) : (
                      <button
                        onClick={async () => {
                          if (!selected) return;
                          try {
                            const res = await api.post(`/certificates/${selected.id}`);
                            setCertificate(res.data);
                            navigate(`/certificate/${res.data.id}`);
                          } catch (err: any) {
                            alert(err?.response?.data?.error || 'Erro ao emitir certificado');
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90"
                      >Emitir</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ═══════ MAIN SCORES SECTION ═══════ */}
        {selected && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            {/* Score + Certification */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center">
              <ScoreGauge score={overall} size={140} />
              <span className="mt-2 text-xs font-bold px-3 py-0.5 rounded-full" style={{ backgroundColor: scoreColor(overall) + '18', color: scoreColor(overall) }}>
                {scoreLabel(overall)}
              </span>
              <p className="text-[10px] text-gray-400 mt-1">
                {new Date(selected.completedAt!).toLocaleDateString('pt-BR')}
              </p>
              {(() => {
                const level = overall >= 70 ? 'ouro' : overall >= 40 ? 'prata' : 'bronze';
                const levelName = overall >= 70 ? 'Ouro' : overall >= 40 ? 'Prata' : 'Bronze';
                return (
                  <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-gray-50 w-full">
                    <img src={`/images/assets/selo-${level}.png`} alt={`Selo ${levelName}`} className="w-10 h-10 object-contain" />
                    <div>
                      <p className="text-xs font-bold text-brand-900">Certificacao {levelName}</p>
                      <p className="text-[10px] text-gray-400">{overall >= 70 ? '70-100' : overall >= 40 ? '40-69' : '0-39'} pts</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Radar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center">
              <h3 className="text-xs font-bold text-brand-900 mb-1 uppercase tracking-wider">Visao Geral ESG</h3>
              <RadarChart environmental={env} social={soc} governance={gov} size={210} />
            </div>

            {/* Pillar Details + Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-brand-900 mb-3 uppercase tracking-wider">Pilares</h3>
              <div className="space-y-3 mb-4">
                {[
                  { label: 'Ambiental (E)', value: env, color: PILLAR_COLORS.environmental },
                  { label: 'Social (S)', value: soc, color: PILLAR_COLORS.social },
                  { label: 'Governanca (G)', value: gov, color: PILLAR_COLORS.governance },
                ].map(p => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600">{p.label}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: p.color + '15', color: p.color }}>{scoreLabel(p.value)}</span>
                        <span className="text-sm font-bold" style={{ color: p.color }}>{p.value.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${p.value}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Link to={`/diagnosis/${selected.id}/insights`}>
                  <button className="w-full py-2 text-[11px] font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90">Acoes</button>
                </Link>
                <Link to={`/diagnosis/${selected.id}/results`}>
                  <button className="w-full py-2 text-[11px] font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50">Resultados</button>
                </Link>
                <Link to={`/diagnosis/${selected.id}/report`}>
                  <button className="w-full py-2 text-[11px] font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50">Relatorio</button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ THEME BREAKDOWN BY PILLAR ═══════ */}
        {themeScores.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            {/* Ambiental */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: PILLAR_COLORS.environmental }}>E</div>
                <div>
                  <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider">Ambiental por Tema</h3>
                  <p className="text-[10px] text-gray-400">{envThemes.length} temas</p>
                </div>
                <span className="ml-auto text-lg font-bold" style={{ color: PILLAR_COLORS.environmental }}>{env.toFixed(0)}</span>
              </div>
              {envThemes.length > 0 ? (
                <ThemeBarChart themes={envThemes} color={PILLAR_COLORS.environmental} />
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Sem dados</p>
              )}
            </div>

            {/* Social */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: PILLAR_COLORS.social }}>S</div>
                <div>
                  <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider">Social por Tema</h3>
                  <p className="text-[10px] text-gray-400">{socThemes.length} temas</p>
                </div>
                <span className="ml-auto text-lg font-bold" style={{ color: PILLAR_COLORS.social }}>{soc.toFixed(0)}</span>
              </div>
              {socThemes.length > 0 ? (
                <ThemeBarChart themes={socThemes} color={PILLAR_COLORS.social} />
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Sem dados</p>
              )}
            </div>

            {/* Governanca */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: PILLAR_COLORS.governance }}>G</div>
                <div>
                  <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider">Governanca por Tema</h3>
                  <p className="text-[10px] text-gray-400">{govThemes.length} temas</p>
                </div>
                <span className="ml-auto text-lg font-bold" style={{ color: PILLAR_COLORS.governance }}>{gov.toFixed(0)}</span>
              </div>
              {govThemes.length > 0 ? (
                <ThemeBarChart themes={govThemes} color={PILLAR_COLORS.governance} />
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">Sem dados</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════ TEMAS CRITICOS ═══════ */}
        {criticalThemes.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <h3 className="text-xs font-bold text-brand-900 mb-3 uppercase tracking-wider">Temas que Precisam de Atencao</h3>
            <div className="space-y-2">
              {criticalThemes.map((t, i) => {
                const pillarColor = t.pillarCode === 'E' ? PILLAR_COLORS.environmental : t.pillarCode === 'S' ? PILLAR_COLORS.social : PILLAR_COLORS.governance;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: pillarColor }}>
                      {t.pillarCode}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-gray-600 truncate">{t.themeName}</span>
                        <span className="text-xs font-bold ml-2" style={{ color: scoreColor(t.score) }}>{t.score.toFixed(0)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${t.score}%`, backgroundColor: scoreColor(t.score) }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════ EVOLUTION ═══════ */}
        {completed.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider">Evolucao</h3>
              <div className="flex gap-3">
                {[{ l: 'Ambiental', c: PILLAR_COLORS.environmental }, { l: 'Social', c: PILLAR_COLORS.social }, { l: 'Governanca', c: PILLAR_COLORS.governance }].map(x => (
                  <div key={x.l} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: x.c }} />
                    <span className="text-[10px] text-gray-400">{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <EvolutionChart diagnoses={completed} />
          </div>
        )}

        {/* ═══════ RECENT HISTORY ═══════ */}
        {completed.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider">Historico</h3>
            </div>
            <div className="space-y-2">
              {completed.slice(0, 5).map(d => (
                <div key={d.id} className={`flex items-center justify-between p-3 rounded-lg transition-all ${selectedDiagnosisId === d.id ? 'bg-brand-100/60 ring-1 ring-brand-700/20' : 'bg-gray-50 hover:bg-brand-100/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: scoreColor(Number(d.overallScore)) + '15' }}>
                      <span className="text-sm font-bold" style={{ color: scoreColor(Number(d.overallScore)) }}>{Number(d.overallScore).toFixed(0)}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-900">Score: {Number(d.overallScore).toFixed(0)} - {scoreLabel(Number(d.overallScore))}</p>
                      <p className="text-[10px] text-gray-400">{new Date(d.completedAt!).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {selectedDiagnosisId !== d.id && (
                      <button onClick={() => handleSelectDiagnosis(d.id)} className="px-3 py-1 text-[10px] font-semibold text-brand-900 border border-brand-700/30 rounded-full hover:bg-brand-100">Selecionar</button>
                    )}
                    <Link to={`/diagnosis/${d.id}/insights`}><button className="px-3 py-1 text-[10px] font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90">Acoes</button></Link>
                    <Link to={`/diagnosis/${d.id}/report`}><button className="px-3 py-1 text-[10px] font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-white">Relatorio</button></Link>
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
