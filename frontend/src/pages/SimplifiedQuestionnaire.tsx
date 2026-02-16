import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { diagnosisService } from '../services/diagnosis.service';

const demoQuestions = [
  {
    category: 'Ambiental',
    categoryColor: '#7B9965',
    pillarCode: 'E',
    question: 'Sua empresa possui política de gestão de resíduos sólidos?',
    options: ['Não possui', 'Em desenvolvimento', 'Parcialmente implementada', 'Totalmente implementada'],
  },
  {
    category: 'Ambiental',
    categoryColor: '#7B9965',
    pillarCode: 'E',
    question: 'A empresa monitora e busca reduzir seu consumo de energia?',
    options: ['Não monitora', 'Monitora mas não atua', 'Monitora e tem metas', 'Monitora, tem metas e as atinge'],
  },
  {
    category: 'Social',
    categoryColor: '#924131',
    pillarCode: 'S',
    question: 'A empresa possui programa de diversidade e inclusão?',
    options: ['Não possui', 'Em planejamento', 'Possui programa básico', 'Programa estruturado com metas'],
  },
  {
    category: 'Social',
    categoryColor: '#924131',
    pillarCode: 'S',
    question: 'Como a empresa avalia a satisfação dos colaboradores?',
    options: ['Não avalia', 'Avaliação informal', 'Pesquisa anual', 'Pesquisas frequentes com planos de ação'],
  },
  {
    category: 'Governança',
    categoryColor: '#152F27',
    pillarCode: 'G',
    question: 'A empresa possui código de ética e conduta documentado?',
    options: ['Não possui', 'Em elaboração', 'Possui mas não divulga', 'Possui e todos conhecem'],
  },
  {
    category: 'Governança',
    categoryColor: '#152F27',
    pillarCode: 'G',
    question: 'Existe canal de denúncias para questões éticas?',
    options: ['Não existe', 'Existe informalmente', 'Canal formal interno', 'Canal independente e anônimo'],
  },
];

function getCertLevel(score: number) {
  if (score >= 70) return { label: 'Ouro', color: '#DAA520', seal: '/images/assets/selo-ouro.png' };
  if (score >= 40) return { label: 'Prata', color: '#A0A0A0', seal: '/images/assets/selo-prata.png' };
  return { label: 'Bronze', color: '#CD7F32', seal: '/images/assets/selo-bronze.png' };
}

export default function SimplifiedQuestionnaire() {
  const { diagnosisId } = useParams<{ diagnosisId: string }>();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [finalScores, setFinalScores] = useState<{ environmental: number; social: number; governance: number; overall: number } | null>(null);

  const currentQuestion = demoQuestions[currentIndex];
  const progress = Math.round(((currentIndex + (answers[currentIndex] !== undefined ? 1 : 0)) / demoQuestions.length) * 100);

  function handleSelectOption(optionIndex: number) {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  }

  function handleNext() {
    if (currentIndex < demoQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }

  async function handleFinalize() {
    if (!diagnosisId) return;

    // Calcular scores por pilar (cada opção vale 0-3, score = média / 3 * 100)
    const pillarScores: Record<string, number[]> = { E: [], S: [], G: [] };
    demoQuestions.forEach((q, idx) => {
      if (answers[idx] !== undefined) {
        pillarScores[q.pillarCode].push(answers[idx]);
      }
    });

    const calcScore = (values: number[]) => {
      if (values.length === 0) return 0;
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return Math.round((avg / 3) * 100 * 100) / 100;
    };

    const scores = {
      environmental: calcScore(pillarScores.E),
      social: calcScore(pillarScores.S),
      governance: calcScore(pillarScores.G),
    };

    try {
      setSaving(true);
      const result = await diagnosisService.completeSimplified(diagnosisId, scores);
      setFinalScores(result.scores);
      setShowResults(true);
    } catch (error) {
      console.error('Erro ao finalizar:', error);
      alert('Erro ao finalizar o diagnóstico. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  const allAnswered = Object.keys(answers).length === demoQuestions.length;

  // === TELA DE RESULTADOS ===
  if (showResults && finalScores) {
    const cert = getCertLevel(finalScores.overall);
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Header com gradiente */}
            <div className="px-8 py-8 text-center" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
              <img src="/images/assets/logo-engreena.png" alt="engreena" className="h-12 mx-auto mb-4" style={{ filter: 'brightness(10)' }} />
              <h1 className="text-2xl font-black text-white">Resultado do Diagnóstico</h1>
              <p className="text-white/70 text-sm mt-1">Avaliação simplificada ESG</p>
            </div>

            <div className="p-8">
              {/* Selo e score */}
              <div className="flex items-center justify-center gap-6 mb-8">
                <img src={cert.seal} alt={`Selo ${cert.label}`} className="w-32 h-32 object-contain" />
                <div className="text-center">
                  <div className="text-5xl font-black" style={{ color: '#152F27' }}>
                    {finalScores.overall.toFixed(1)}
                  </div>
                  <div className="text-sm font-bold text-gray-500 mt-1">pontos</div>
                  <div className="mt-2 px-4 py-1.5 rounded-full text-sm font-bold text-white" style={{ backgroundColor: cert.color }}>
                    Nível {cert.label}
                  </div>
                </div>
              </div>

              {/* Scores por pilar */}
              <div className="space-y-4 mb-8">
                {[
                  { label: 'Ambiental', score: finalScores.environmental, color: '#7B9965' },
                  { label: 'Social', score: finalScores.social, color: '#924131' },
                  { label: 'Governança', score: finalScores.governance, color: '#152F27' },
                ].map((p) => (
                  <div key={p.label}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-bold" style={{ color: '#152F27' }}>{p.label}</span>
                      <span className="text-lg font-black" style={{ color: p.color }}>{p.score.toFixed(1)}</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(p.score, 100)}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA upgrade */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 mb-6">
                <h3 className="text-lg font-black mb-2" style={{ color: '#152F27' }}>
                  Quer um diagnóstico completo?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Faça upgrade para um plano pago e tenha acesso ao questionário completo com 215 perguntas,
                  relatório detalhado, insights estratégicos, plano de ação e certificação ESG.
                </p>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 rounded-xl text-white font-bold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                >
                  Ver Planos
                </button>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 rounded-xl border-2 font-bold transition-all hover:bg-gray-50"
                style={{ borderColor: '#e0e0e0', color: '#666' }}
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === TELA DO QUESTIONÁRIO ===
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header fixo */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold" style={{ color: '#152F27' }}>Diagnóstico ESG Rápido</h1>
                <p className="text-xs text-gray-500">Questão {currentIndex + 1} de {demoQuestions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: '#666' }}>{progress}%</span>
              <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${progress}%`, background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Card da questão */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header do card */}
          <div className="px-6 py-4" style={{ backgroundColor: currentQuestion.categoryColor }}>
            <div className="flex items-center justify-between">
              <div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-xs font-bold">
                  {currentQuestion.category}
                </span>
              </div>
              <span className="text-white/80 text-sm font-medium">
                {currentIndex + 1} / {demoQuestions.length}
              </span>
            </div>
          </div>

          {/* Pergunta */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 leading-relaxed mb-8">
              {currentQuestion.question}
            </h3>

            {/* Opções */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="w-full text-left px-5 py-4 rounded-xl border-2 transition-all hover:shadow-md"
                    style={{
                      borderColor: isSelected ? currentQuestion.categoryColor : '#e0e0e0',
                      backgroundColor: isSelected ? `${currentQuestion.categoryColor}10` : '#fff',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{
                          backgroundColor: isSelected ? currentQuestion.categoryColor : '#f5f5f5',
                          color: isSelected ? '#fff' : '#666',
                        }}
                      >
                        {idx}
                      </div>
                      <span className="font-semibold" style={{ color: isSelected ? currentQuestion.categoryColor : '#333' }}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer com navegação */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Anterior
            </button>

            {currentIndex === demoQuestions.length - 1 ? (
              <button
                onClick={handleFinalize}
                disabled={!allAnswered || saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Finalizando...
                  </>
                ) : (
                  <>
                    Finalizar
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={answers[currentIndex] === undefined}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
              >
                Próxima
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Indicadores de questão */}
        <div className="flex justify-center gap-2 mt-6">
          {demoQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="w-3 h-3 rounded-full transition-all"
              style={{
                backgroundColor: idx === currentIndex ? q.categoryColor : answers[idx] !== undefined ? `${q.categoryColor}60` : '#ddd',
                transform: idx === currentIndex ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Diagnóstico rápido - 6 perguntas para uma avaliação inicial ESG
        </p>
      </div>
    </div>
  );
}
