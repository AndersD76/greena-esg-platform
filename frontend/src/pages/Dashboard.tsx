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
  const sw = size > 160 ? 14 : size > 120 ? 12 : size > 80 ? 9 : 7;
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
        <span className="font-bold" style={{ color: col, fontSize: size > 160 ? '3rem' : size > 120 ? '2.25rem' : size > 80 ? '1.5rem' : '1.25rem', lineHeight: 1 }}>
          {score.toFixed(0)}
        </span>
        {size > 100 && <span className="text-xs text-gray-400 mt-1">pontos</span>}
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
function RadarChart({ environmental, social, governance, size = 260 }: { environmental: number; social: number; governance: number; size?: number }) {
  const center = size / 2;
  const radius = size * 0.34;
  const angles = [-90, 30, 150];
  const pt = (v: number, ai: number) => {
    const rad = (angles[ai] * Math.PI) / 180;
    const rr = (v / 100) * radius;
    return { x: center + rr * Math.cos(rad), y: center + rr * Math.sin(rad) };
  };
  const data = [pt(environmental, 0), pt(social, 1), pt(governance, 2)];
  const colors = [PILLAR_COLORS.environmental, PILLAR_COLORS.social, PILLAR_COLORS.governance];
  const labels = ['Ambiental', 'Social', 'Governança'];
  const values = [environmental, social, governance];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[20, 40, 60, 80, 100].map((pct) => (
        <polygon key={pct} points={angles.map((_, i) => { const p = pt(pct, i); return `${p.x},${p.y}`; }).join(' ')}
          fill="none" stroke={pct === 100 ? '#d1d5db' : '#f0f0f0'} strokeWidth="1" />
      ))}
      {angles.map((_, i) => {
        const p = pt(100, i);
        return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#f0f0f0" strokeWidth="1" />;
      })}
      <polygon points={data.map(p => `${p.x},${p.y}`).join(' ')} fill="rgba(123,153,101,0.15)" stroke="#7B9965" strokeWidth="2.5" />
      {data.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="5" fill="white" stroke={colors[i]} strokeWidth="3" />
      ))}
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const lx = center + (radius + 30) * Math.cos(rad);
        const ly = center + (radius + 30) * Math.sin(rad);
        return (
          <g key={i}>
            <text x={lx} y={ly - 6} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="700" fill={colors[i]}>{labels[i]}</text>
            <text x={lx} y={ly + 9} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="800" fill={colors[i]}>{values[i].toFixed(0)}</text>
          </g>
        );
      })}
    </svg>
  );
}

// Evolution Line Chart
function EvolutionChart({ diagnoses }: { diagnoses: Diagnosis[] }) {
  if (diagnoses.length < 2) return null;
  const w = 600, h = 200, pad = 45;
  const cw = w - 2 * pad, ch = h - 2 * pad;
  const pts = diagnoses.slice(0, 6).reverse();
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
      {[
        { scores: pts.map(d => Number(d.environmentalScore)), color: PILLAR_COLORS.environmental },
        { scores: pts.map(d => Number(d.socialScore)), color: PILLAR_COLORS.social },
        { scores: pts.map(d => Number(d.governanceScore)), color: PILLAR_COLORS.governance },
      ].map((line, li) => (
        <g key={li}>
          <path d={path(line.scores)} fill="none" stroke={line.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {line.scores.map((s, i) => (
            <circle key={i} cx={gx(i)} cy={gy(s)} r="4" fill="white" stroke={line.color} strokeWidth="2" />
          ))}
        </g>
      ))}
      {pts.map((d, i) => (
        <text key={i} x={gx(i)} y={h - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">
          {new Date(d.completedAt!).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
        </text>
      ))}
    </svg>
  );
}

// Vertical Bar Chart — proper chart for themes within a pillar
function VerticalBarChart({ themes, color, pillarScore }: { themes: ThemeScore[]; color: string; pillarScore: number }) {
  const count = themes.length;
  if (count === 0) return <p className="text-sm text-gray-400 text-center py-8">Sem dados</p>;

  const chartW = 500;
  const chartH = 220;
  const padL = 35;
  const padR = 10;
  const padT = 20;
  const padB = 70;
  const areaW = chartW - padL - padR;
  const areaH = chartH - padT - padB;
  const barW = Math.min(40, (areaW / count) * 0.65);
  const gap = (areaW - barW * count) / (count + 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => {
          const y = padT + areaH - (v / 100) * areaH;
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#b0b0b0">{v}</text>
            </g>
          );
        })}
        {/* Average line */}
        {pillarScore > 0 && (() => {
          const avgY = padT + areaH - (pillarScore / 100) * areaH;
          return (
            <g>
              <line x1={padL} y1={avgY} x2={chartW - padR} y2={avgY} stroke={color} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
              <text x={chartW - padR + 2} y={avgY + 3} fontSize="9" fill={color} fontWeight="600">Média {pillarScore.toFixed(0)}</text>
            </g>
          );
        })()}
        {/* Bars */}
        {themes.map((t, i) => {
          const x = padL + gap + i * (barW + gap);
          const barH = (t.score / 100) * areaH;
          const y = padT + areaH - barH;
          const barColor = t.score >= 60 ? color : t.score >= 40 ? '#b8963a' : '#924131';
          // Truncate long names
          const maxChars = Math.max(8, Math.floor(barW / 3.5));
          const label = t.themeName.length > maxChars ? t.themeName.substring(0, maxChars) + '...' : t.themeName;
          return (
            <g key={i}>
              {/* Bar background */}
              <rect x={x} y={padT} width={barW} height={areaH} rx={3} fill="#f9fafb" />
              {/* Bar */}
              <rect x={x} y={y} width={barW} height={barH} rx={3} fill={barColor} opacity="0.85" className="transition-all duration-700" />
              {/* Value on top */}
              <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill={barColor}>
                {t.score.toFixed(0)}%
              </text>
              {/* Label rotated */}
              <text
                x={x + barW / 2}
                y={padT + areaH + 8}
                textAnchor="start"
                fontSize="9"
                fill="#6b7280"
                transform={`rotate(45, ${x + barW / 2}, ${padT + areaH + 8})`}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Horizontal bar chart — compact for critical themes
function CriticalThemeChart({ themes }: { themes: ThemeScore[] }) {
  if (themes.length === 0) return null;
  const chartW = 500;
  const barH = 24;
  const gap = 6;
  const padL = 200;
  const padR = 50;
  const totalH = themes.length * (barH + gap);

  return (
    <svg width="100%" height={totalH} viewBox={`0 0 ${chartW} ${totalH}`} preserveAspectRatio="xMidYMid meet">
      {themes.map((t, i) => {
        const y = i * (barH + gap);
        const barW = ((chartW - padL - padR) * t.score) / 100;
        const pillarColor = t.pillarCode === 'E' ? PILLAR_COLORS.environmental : t.pillarCode === 'S' ? PILLAR_COLORS.social : PILLAR_COLORS.governance;
        return (
          <g key={i}>
            {/* Pillar badge */}
            <rect x={0} y={y + 2} width={20} height={20} rx={4} fill={pillarColor} />
            <text x={10} y={y + 15} textAnchor="middle" fontSize="10" fontWeight="700" fill="white">{t.pillarCode}</text>
            {/* Theme name */}
            <text x={28} y={y + 16} fontSize="11" fill="#4b5563" fontWeight="500">{t.themeName}</text>
            {/* Bar background */}
            <rect x={padL} y={y + 2} width={chartW - padL - padR} height={20} rx={4} fill="#f3f4f6" />
            {/* Bar */}
            <rect x={padL} y={y + 2} width={Math.max(barW, 4)} height={20} rx={4} fill={scoreColor(t.score)} opacity="0.8" className="transition-all duration-700" />
            {/* Value */}
            <text x={padL + barW + 8} y={y + 16} fontSize="12" fontWeight="700" fill={scoreColor(t.score)}>{t.score.toFixed(0)}</text>
          </g>
        );
      })}
    </svg>
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
            {selected && (
              <div className="flex items-center gap-3">
                {/* Dropdown for diagnosis selection */}
                {completed.length > 1 && (
                  <select
                    value={selectedDiagnosisId || ''}
                    onChange={(e) => handleSelectDiagnosis(e.target.value)}
                    className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer appearance-none pr-8"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                  >
                    {completed.map(d => (
                      <option key={d.id} value={d.id} className="text-gray-900 bg-white">
                        {new Date(d.completedAt!).toLocaleDateString('pt-BR')} — Score {Number(d.overallScore).toFixed(0)}
                      </option>
                    ))}
                  </select>
                )}
                <div className="bg-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
                  <span className="text-3xl font-bold text-white">{overall.toFixed(0)}</span>
                  <span className="text-sm font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: scoreColor(overall) + '30', color: scoreColor(overall) }}>
                    {scoreLabel(overall)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* ═══════ ERROR ═══════ */}
        {loadError && !selected && !currentDiagnosis && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-brand-900 mb-2">Erro ao carregar dados</h2>
            <p className="text-sm text-gray-500 mb-5">Não foi possível conectar ao servidor.</p>
            <button onClick={() => { setLoading(true); loadDiagnoses(); loadUserName(); }} className="px-8 py-3 font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90 text-sm">
              Tentar Novamente
            </button>
          </div>
        )}

        {/* ═══════ WELCOME (no diagnoses) ═══════ */}
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
              <div className="hidden md:flex w-28 h-28 rounded-full bg-brand-300/20 items-center justify-center">
                <svg className="w-14 h-14 text-brand-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ DIAGNOSIS IN-PROGRESS BANNER ═══════ */}
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

        {/* ═══════ ACTION CARDS ROW ═══════ */}
        {completed.length > 0 && (
          <div className={`grid grid-cols-1 gap-4 ${currentDiagnosis ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {/* Card: Novo Diagnóstico */}
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

            {/* Card: Ações Pendentes */}
            {selected && (
              <Link to={`/diagnosis/${selected.id}/insights`} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-brand-700/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform ${pendingActions > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
                    {pendingActions > 0 ? (
                      <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ) : (
                      <svg className="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-brand-900">Plano de Ação</p>
                    <p className="text-sm text-gray-400">
                      {pendingActions > 0 ? `${pendingActions} ações pendentes` : actionPlans.length > 0 ? `${completedActionsCount} concluídas` : 'Nenhuma ação'}
                    </p>
                  </div>
                  {actionPlans.length > 0 && (
                    <span className={`text-2xl font-bold ${pendingActions > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                      {pendingActions > 0 ? pendingActions : completedActionsCount}/{actionPlans.length}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* Card: Certificado */}
            {selected && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-brand-700/30 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold text-brand-900">Certificado ESG</p>
                    <p className="text-sm text-gray-400">{certificate ? `#${certificate.certificateNumber}` : 'Não emitido'}</p>
                  </div>
                  {certificate ? (
                    <Link to={`/certificate/${certificate.id}`}>
                      <button className="px-5 py-2 text-sm font-semibold text-amber-700 bg-amber-100 rounded-full hover:bg-amber-200">Ver</button>
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
                      className="px-5 py-2 text-sm font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90"
                    >Emitir</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ MAIN SCORES SECTION ═══════ */}
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

            {/* Radar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold text-brand-900 mb-2 uppercase tracking-wider">Visão Geral ESG</h3>
              <RadarChart environmental={env} social={soc} governance={gov} size={260} />
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
                <Link to={`/diagnosis/${selected.id}/insights`}>
                  <button className="w-full py-2.5 text-sm font-semibold text-white bg-brand-900 rounded-full hover:bg-brand-900/90">Ações</button>
                </Link>
                <Link to={`/diagnosis/${selected.id}/results`}>
                  <button className="w-full py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50">Resultados</button>
                </Link>
                <Link to={`/diagnosis/${selected.id}/report`}>
                  <button className="w-full py-2.5 text-sm font-medium text-brand-900 border border-gray-200 rounded-full hover:bg-gray-50">Relatório</button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ═══════ THEME CHARTS BY PILLAR ═══════ */}
        {themeScores.length > 0 && (
          <>
            {/* Ambiental */}
            {envThemes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: PILLAR_COLORS.environmental }}>E</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-brand-900">Ambiental por Tema</h3>
                    <p className="text-xs text-gray-400">{envThemes.length} temas avaliados</p>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: PILLAR_COLORS.environmental }}>{env.toFixed(0)}</span>
                </div>
                <VerticalBarChart themes={envThemes} color={PILLAR_COLORS.environmental} pillarScore={env} />
              </div>
            )}

            {/* Social */}
            {socThemes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: PILLAR_COLORS.social }}>S</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-brand-900">Social por Tema</h3>
                    <p className="text-xs text-gray-400">{socThemes.length} temas avaliados</p>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: PILLAR_COLORS.social }}>{soc.toFixed(0)}</span>
                </div>
                <VerticalBarChart themes={socThemes} color={PILLAR_COLORS.social} pillarScore={soc} />
              </div>
            )}

            {/* Governança */}
            {govThemes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: PILLAR_COLORS.governance }}>G</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-brand-900">Governança por Tema</h3>
                    <p className="text-xs text-gray-400">{govThemes.length} temas avaliados</p>
                  </div>
                  <span className="text-2xl font-bold" style={{ color: PILLAR_COLORS.governance }}>{gov.toFixed(0)}</span>
                </div>
                <VerticalBarChart themes={govThemes} color={PILLAR_COLORS.governance} pillarScore={gov} />
              </div>
            )}
          </>
        )}

        {/* ═══════ TEMAS CRÍTICOS ═══════ */}
        {criticalThemes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Temas que Precisam de Atenção</h3>
            <CriticalThemeChart themes={criticalThemes} />
          </div>
        )}

        {/* ═══════ EVOLUTION ═══════ */}
        {completed.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-brand-900 uppercase tracking-wider">Evolução</h3>
              <div className="flex gap-4">
                {[{ l: 'Ambiental', c: PILLAR_COLORS.environmental }, { l: 'Social', c: PILLAR_COLORS.social }, { l: 'Governança', c: PILLAR_COLORS.governance }].map(x => (
                  <div key={x.l} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: x.c }} />
                    <span className="text-xs font-medium text-gray-500">{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <EvolutionChart diagnoses={completed} />
          </div>
        )}

        {/* ═══════ RECENT HISTORY ═══════ */}
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
