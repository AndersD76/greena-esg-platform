import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';
import api from '../services/api';

const PILLAR_COLORS = {
  environmental: '#7B9965',
  social: '#924131',
  governance: '#b8963a',
};

const PILLAR_BG = {
  environmental: '#f5ffeb',
  social: '#fdf5f3',
  governance: '#fdf8ef',
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

function ScoreGauge({
  score, size = 120, label, color, showLabel = true,
}: { score: number; size?: number; label?: string; color?: string; showLabel?: boolean }) {
  const sw = size > 140 ? 12 : size > 100 ? 10 : 7;
  const r = (size - sw) / 2;
  const c = r * 2 * Math.PI;
  const off = c - (score / 100) * c;
  const col = color || scoreColor(score);
  return (
    <div className="inline-flex flex-col items-center">
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
          {size > 120 && <span className="text-xs text-gray-400 mt-0.5">pontos</span>}
        </div>
      </div>
      {showLabel && label && <span className="mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>}
    </div>
  );
}

function scoreColor(s: number) {
  if (s >= 80) return '#7B9965';
  if (s >= 60) return '#b8963a';
  if (s >= 40) return '#924131';
  return '#9ca3af';
}

// Horizontal bar chart for themes
function ThemeBarChart({ themes, pillarColor }: { themes: ThemeScore[]; pillarColor: string }) {
  return (
    <div className="space-y-3">
      {themes.map((t, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600 truncate max-w-[70%]">{t.themeName}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{t.answeredCount}/{t.totalCount}</span>
              <span className="text-sm font-bold" style={{ color: pillarColor }}>{t.score.toFixed(0)}</span>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${t.score}%`, backgroundColor: pillarColor }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Radar Chart
function RadarChart({ environmental, social, governance, size = 220 }: { environmental: number; social: number; governance: number; size?: number }) {
  const center = size / 2;
  const radius = size * 0.33;
  const angles = [-90, 30, 150];
  const pt = (v: number, ai: number) => {
    const rad = (angles[ai] * Math.PI) / 180;
    const rr = (v / 100) * radius;
    return { x: center + rr * Math.cos(rad), y: center + rr * Math.sin(rad) };
  };
  const outer = angles.map((_, i) => pt(100, i));
  const data = [pt(environmental, 0), pt(social, 1), pt(governance, 2)];
  const colors = [PILLAR_COLORS.environmental, PILLAR_COLORS.social, PILLAR_COLORS.governance];
  const labels = ['Ambiental', 'Social', 'Governança'];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {[20, 40, 60, 80, 100].map((pct) => (
        <polygon key={pct} points={angles.map((_, i) => { const p = pt(pct, i); return `${p.x},${p.y}`; }).join(' ')}
          fill="none" stroke={pct === 100 ? '#d1d5db' : '#e5e7eb'} strokeWidth="1" strokeDasharray={pct < 100 ? '3,3' : ''} />
      ))}
      {outer.map((p, i) => <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth="1" />)}
      <polygon points={data.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(123,153,101,0.12)" stroke="#7B9965" strokeWidth="2" />
      {data.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={colors[i]} strokeWidth="2.5" />
          <circle cx={p.x} cy={p.y} r="2" fill={colors[i]} />
        </g>
      ))}
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return <text key={i} x={center + (radius + 28) * Math.cos(rad)} y={center + (radius + 28) * Math.sin(rad)}
          textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill={colors[i]}>{labels[i]}</text>;
      })}
    </svg>
  );
}

// Line Chart for evolution
function EvolutionChart({ diagnoses }: { diagnoses: Diagnosis[] }) {
  if (diagnoses.length < 2) return null;
  const w = 600, h = 200, pad = 40;
  const cw = w - 2 * pad, ch = h - 2 * pad;
  const pts = diagnoses.slice(0, 5).reverse();
  const gx = (i: number) => pad + (cw / (pts.length - 1 || 1)) * i;
  const gy = (s: number) => h - pad - (s / 100) * ch;
  const path = (scores: number[]) => scores.map((s, i) => `${i === 0 ? 'M' : 'L'} ${gx(i)} ${gy(s)}`).join(' ');

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={pad} y1={gy(v)} x2={w - pad} y2={gy(v)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={pad - 8} y={gy(v) + 4} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
        </g>
      ))}
      <path d={path(pts.map(d => Number(d.environmentalScore)))} fill="none" stroke={PILLAR_COLORS.environmental} strokeWidth="2.5" strokeLinecap="round" />
      <path d={path(pts.map(d => Number(d.socialScore)))} fill="none" stroke={PILLAR_COLORS.social} strokeWidth="2.5" strokeLinecap="round" />
      <path d={path(pts.map(d => Number(d.governanceScore)))} fill="none" stroke={PILLAR_COLORS.governance} strokeWidth="2.5" strokeLinecap="round" />
      {pts.map((d, i) => (
        <g key={i}>
          {[{ s: 'environmentalScore', c: PILLAR_COLORS.environmental }, { s: 'socialScore', c: PILLAR_COLORS.social }, { s: 'governanceScore', c: PILLAR_COLORS.governance }].map(({ s, c }) => (
            <circle key={s} cx={gx(i)} cy={gy(Number((d as any)[s]))} r="4" fill="white" stroke={c} strokeWidth="2" />
          ))}
          <text x={gx(i)} y={h - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">
            {new Date(d.completedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
          </text>
        </g>
      ))}
      <g transform={`translate(${pad}, 8)`}>
        {[{ label: 'Ambiental', c: PILLAR_COLORS.environmental, x: 0 }, { label: 'Social', c: PILLAR_COLORS.social, x: 90 }, { label: 'Governança', c: PILLAR_COLORS.governance, x: 160 }].map(l => (
          <g key={l.label}><circle cx={l.x} cy="0" r="3.5" fill={l.c} /><text x={l.x + 10} y="4" fontSize="10" fontWeight="600" fill="#374151">{l.label}</text></g>
        ))}
      </g>
    </svg>
  );
}

// Stacked pillar comparison bar
function PillarComparisonBar({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  const level = value >= 80 ? 'Excelente' : value >= 60 ? 'Bom' : value >= 40 ? 'Regular' : 'Crítico';
  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: bg }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-brand-900">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>{level}</span>
          <span className="text-xl font-bold" style={{ color }}>{value.toFixed(0)}</span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────

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
      const res = await api.get('/auth/me');
      setUserName(res.data.name?.split(' ')[0] || '');
    } catch {}
  }

  async function loadDiagnoses() {
    try {
      const data = await diagnosisService.list();
      setDiagnoses(data);
      const ip = data.find(d => d.status === 'in_progress');
      if (ip) {
        setCurrentDiagnosis(ip);
        loadPartialScores(ip.id);
      }
    } catch (e) {
      console.error('Erro ao carregar diagnósticos:', e);
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

  async function handleStartNewDiagnosis() {
    try {
      const d = await diagnosisService.create();
      navigate(`/diagnosis/${d.id}/questionnaire`);
    } catch (e) {
      console.error('Erro ao criar diagnóstico:', e);
    }
  }

  const completed = diagnoses.filter(d => d.status === 'completed');
  const last = completed[0];
  const greeting = (() => { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'; })();
  const certLevel = (s: number) => s >= 70 ? { k: 'ouro', n: 'Ouro', r: '70-100' } : s >= 40 ? { k: 'prata', n: 'Prata', r: '40-69' } : { k: 'bronze', n: 'Bronze', r: '0-39' };
  const scoreLevelLabel = (s: number) => s >= 80 ? 'Excelente' : s >= 60 ? 'Bom' : s >= 40 ? 'Regular' : 'Necessita Melhoria';

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

  // Helper: get theme scores for a pillar
  const getThemes = (pillar: string) => (partialScores?.themeScores || []).filter((t: ThemeScore) => t.pillarCode === pillar);

  return (
    <div className="min-h-screen bg-brand-100">
      {/* ═══════════ HERO BANNER ═══════════ */}
      <div className="bg-brand-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-brand-700"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-brand-700"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{greeting}{userName ? `, ${userName}` : ''}</h1>
              <p className="text-sm text-white/50">Painel de Inteligência ESG</p>
            </div>
            {(last || partialScores) && (
              <div className="hidden lg:flex items-center gap-5">
                {[
                  { l: 'E', v: last ? Number(last.environmentalScore) : partialScores?.environmental || 0, c: PILLAR_COLORS.environmental },
                  { l: 'S', v: last ? Number(last.socialScore) : partialScores?.social || 0, c: PILLAR_COLORS.social },
                  { l: 'G', v: last ? Number(last.governanceScore) : partialScores?.governance || 0, c: PILLAR_COLORS.governance },
                ].map(p => (
                  <div key={p.l} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: p.c }}>{p.l}</div>
                    <span className="text-xl font-bold text-white">{p.v.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KPI Row inside hero */}
          {(last || partialScores) && (() => {
            const overall = last ? Number(last.overallScore) : partialScores?.overall || 0;
            const env = last ? Number(last.environmentalScore) : partialScores?.environmental || 0;
            const soc = last ? Number(last.socialScore) : partialScores?.social || 0;
            const gov = last ? Number(last.governanceScore) : partialScores?.governance || 0;
            const answered = partialScores?.answeredCount ?? '—';
            const total = partialScores?.totalCount ?? '—';
            const progress = partialScores ? Math.round((partialScores.answeredCount / (partialScores.totalCount || 75)) * 100) : 0;

            return (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Score Geral', value: overall.toFixed(0), sub: scoreLevelLabel(overall), color: scoreColor(overall), icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                  { label: 'Ambiental', value: env.toFixed(0), sub: `${scoreLevelLabel(env)}`, color: PILLAR_COLORS.environmental, icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { label: 'Social', value: soc.toFixed(0), sub: `${scoreLevelLabel(soc)}`, color: PILLAR_COLORS.social, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                  { label: 'Governança', value: gov.toFixed(0), sub: `${scoreLevelLabel(gov)}`, color: PILLAR_COLORS.governance, icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                  { label: 'Progresso', value: currentDiagnosis ? `${answered}/${total}` : `${completed.length}`, sub: currentDiagnosis ? `${progress}% completo` : 'diagnóstico(s)', color: '#7B9965', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                ].map(kpi => (
                  <div key={kpi.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: kpi.color + '25' }}>
                        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke={kpi.color} strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d={kpi.icon} />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">{kpi.label}</p>
                        <p className="text-lg font-bold text-white leading-tight">{kpi.value}</p>
                        <p className="text-[10px] text-white/40">{kpi.sub}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ═══════════ WELCOME ═══════════ */}
        {!last && !currentDiagnosis && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 mb-8">
            <div className="flex items-center gap-12">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-brand-900 mb-3">Bem-vindo ao engreena!</h2>
                <p className="text-gray-500 mb-6 max-w-lg">Faça seu primeiro diagnóstico ESG e descubra como sua empresa pode ser mais sustentável.</p>
                <button onClick={handleStartNewDiagnosis} className="px-10 py-3.5 font-semibold text-white bg-brand-900 rounded-full transition-all hover:bg-brand-900/90">
                  Fazer Primeiro Diagnóstico
                </button>
              </div>
              <div className="hidden md:flex flex-col items-center">
                <div className="w-28 h-28 rounded-full bg-brand-300/30 flex items-center justify-center">
                  <svg className="w-14 h-14 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ IN-PROGRESS DIAGNOSIS ═══════════ */}
        {currentDiagnosis && partialScores && (
          <>
            {/* Progress Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 -mt-4">
              <div className="h-1 bg-brand-700"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-300/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-900">Diagnóstico em Andamento</h3>
                      <p className="text-xs text-gray-400">Iniciado em {new Date(currentDiagnosis.startedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <Link to={`/diagnosis/${currentDiagnosis.id}/questionnaire`}>
                    <button className="px-7 py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90 transition-all">Continuar Diagnóstico</button>
                  </Link>
                </div>

                {/* Progress bar */}
                <div className="p-4 rounded-xl bg-gray-50 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-brand-900">Progresso</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: '#EFD4A8', color: '#152F27' }}>PRELIMINAR</span>
                    </div>
                    <span className="text-sm font-bold text-brand-700">{partialScores.answeredCount || 0}/{partialScores.totalCount || 75} respostas</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-brand-700 transition-all duration-500" style={{ width: `${((partialScores.answeredCount || 0) / (partialScores.totalCount || 75)) * 100}%` }} />
                  </div>
                </div>

                {/* Scores Grid: Gauge | Radar | Pillar bars */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Score Gauge */}
                  <div className="flex flex-col items-center justify-center py-4">
                    <ScoreGauge score={partialScores.overall} size={150} label="Score Geral" />
                    {partialScores.certification && (
                      <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50 w-full">
                        <img src={`/images/assets/selo-${partialScores.certification.level === 'gold' ? 'ouro' : partialScores.certification.level === 'silver' ? 'prata' : 'bronze'}.png`} alt="Selo" className="w-12 h-12 object-contain" />
                        <div>
                          <p className="text-sm font-bold text-brand-900">Certificação Provisória</p>
                          <p className="text-xs text-gray-400">Baseada nas respostas atuais</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Radar */}
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50">
                    <h4 className="text-xs font-bold text-brand-900 mb-1 uppercase tracking-wider">Visão Geral</h4>
                    <RadarChart environmental={partialScores.environmental} social={partialScores.social} governance={partialScores.governance} />
                  </div>

                  {/* Pillar comparison bars */}
                  <div className="space-y-3">
                    <PillarComparisonBar label="Ambiental (E)" value={partialScores.environmental} color={PILLAR_COLORS.environmental} bg={PILLAR_BG.environmental} />
                    <PillarComparisonBar label="Social (S)" value={partialScores.social} color={PILLAR_COLORS.social} bg={PILLAR_BG.social} />
                    <PillarComparisonBar label="Governança (G)" value={partialScores.governance} color={PILLAR_COLORS.governance} bg={PILLAR_BG.governance} />
                  </div>
                </div>
              </div>
            </div>

            {/* Theme breakdown charts */}
            {partialScores.themeScores && partialScores.themeScores.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                {[
                  { code: 'E', name: 'Ambiental', color: PILLAR_COLORS.environmental, bg: PILLAR_BG.environmental },
                  { code: 'S', name: 'Social', color: PILLAR_COLORS.social, bg: PILLAR_BG.social },
                  { code: 'G', name: 'Governança', color: PILLAR_COLORS.governance, bg: PILLAR_BG.governance },
                ].map(pillar => {
                  const themes = getThemes(pillar.code);
                  if (themes.length === 0) return null;
                  return (
                    <div key={pillar.code} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-5 py-3 flex items-center gap-2.5" style={{ backgroundColor: pillar.bg }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: pillar.color }}>{pillar.code}</div>
                        <h4 className="text-sm font-bold text-brand-900">{pillar.name} por Tema</h4>
                      </div>
                      <div className="p-5">
                        <ThemeBarChart themes={themes} pillarColor={pillar.color} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ═══════════ COMPLETED DIAGNOSIS ═══════════ */}
        {last && (
          <>
            {/* Main: Gauge + Radar + Pillar Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6 -mt-4">
              {/* Score Gauge + Cert */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7 flex flex-col items-center justify-center">
                <ScoreGauge score={Number(last.overallScore)} size={170} />
                <span className="mt-3 px-4 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: scoreColor(Number(last.overallScore)) + '18', color: scoreColor(Number(last.overallScore)) }}>
                  {scoreLevelLabel(Number(last.overallScore))}
                </span>
                <p className="text-xs text-gray-400 mt-2">Avaliação de {new Date(last.completedAt!).toLocaleDateString('pt-BR')}</p>
                {(() => {
                  const c = certLevel(Number(last.overallScore));
                  return (
                    <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-gray-50 w-full">
                      <img src={`/images/assets/selo-${c.k}.png`} alt={`Selo ${c.n}`} className="w-12 h-12 object-contain" />
                      <div>
                        <p className="text-sm font-bold text-brand-900">Certificação {c.n}</p>
                        <p className="text-xs text-gray-400">{c.r} pontos</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Radar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
                <h3 className="text-sm font-bold text-brand-900 mb-2 uppercase tracking-wider">Visão Geral ESG</h3>
                <RadarChart environmental={Number(last.environmentalScore)} social={Number(last.socialScore)} governance={Number(last.governanceScore)} size={250} />
              </div>

              {/* Pillar Details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Detalhamento por Pilar</h3>
                <div className="flex-1 space-y-3">
                  <PillarComparisonBar label="Ambiental (E)" value={Number(last.environmentalScore)} color={PILLAR_COLORS.environmental} bg={PILLAR_BG.environmental} />
                  <PillarComparisonBar label="Social (S)" value={Number(last.socialScore)} color={PILLAR_COLORS.social} bg={PILLAR_BG.social} />
                  <PillarComparisonBar label="Governança (G)" value={Number(last.governanceScore)} color={PILLAR_COLORS.governance} bg={PILLAR_BG.governance} />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link to={`/diagnosis/${last.id}/insights`}>
                    <button className="w-full py-2.5 text-xs font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90 transition-all">Ver Insights</button>
                  </Link>
                  <Link to={`/diagnosis/${last.id}/results`}>
                    <button className="w-full py-2.5 text-xs font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50 transition-all">Resultados</button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Evolution Chart */}
            {completed.length > 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Evolução dos Scores</h3>
                <EvolutionChart diagnoses={completed} />
              </div>
            )}
          </>
        )}

        {/* ═══════════ QUICK ACTIONS ═══════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {!currentDiagnosis && last && (
            <button onClick={handleStartNewDiagnosis} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-brand-700/30 transition-all text-left group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <h3 className="text-base font-bold text-brand-900">Novo Diagnóstico</h3>
              </div>
              <p className="text-sm text-gray-500">Inicie uma nova avaliação ESG</p>
            </button>
          )}
          <Link to="/reports" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-brand-700/30 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-brand-300/20 transition-colors">
                <svg className="w-5 h-5 text-brand-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-base font-bold text-brand-900">Relatórios</h3>
            </div>
            <p className="text-sm text-gray-500 mb-2">Histórico de diagnósticos</p>
            <p className="text-sm font-medium text-brand-700">{completed.length} completo(s)</p>
          </Link>
          {last && (
            <Link to={`/diagnosis/${last.id}/insights`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-brand-700/30 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform" style={{ backgroundColor: '#fdf8ef' }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#b8963a"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <h3 className="text-base font-bold text-brand-900">Insights & Ações</h3>
              </div>
              <p className="text-sm text-gray-500 mb-2">Plano de ação personalizado</p>
              <p className="text-sm font-medium text-brand-700">Ver plano de ação</p>
            </Link>
          )}
        </div>

        {/* ═══════════ RECENT HISTORY ═══════════ */}
        {completed.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider">Histórico Recente</h3>
              <Link to="/reports"><button className="text-sm font-medium text-brand-700 hover:text-brand-900 transition-colors">Ver Todos</button></Link>
            </div>
            <div className="space-y-2">
              {completed.slice(0, 3).map(d => (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-brand-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: scoreColor(Number(d.overallScore)) + '15' }}>
                      <span className="text-base font-bold" style={{ color: scoreColor(Number(d.overallScore)) }}>{Number(d.overallScore).toFixed(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-900">Score: {Number(d.overallScore).toFixed(0)}</p>
                      <p className="text-xs text-gray-400">{new Date(d.completedAt!).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/diagnosis/${d.id}/results`}><button className="px-4 py-1.5 text-xs font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-white transition-all">Resultados</button></Link>
                    <Link to={`/diagnosis/${d.id}/insights`}><button className="px-4 py-1.5 text-xs font-medium text-white bg-brand-900 rounded-full hover:bg-brand-900/90 transition-all">Insights</button></Link>
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
