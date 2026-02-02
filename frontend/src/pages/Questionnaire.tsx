import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pillarService, AssessmentItem } from '../services/pillar.service';
import { responseService, ResponseData } from '../services/response.service';
import { diagnosisService } from '../services/diagnosis.service';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

interface Response {
  [key: number]: {
    evaluation: ResponseData['evaluation'];
    observations?: string;
  };
}

// Opcoes de avaliacao com valores
const evaluationOptions = [
  { value: 'Não se aplica', label: 'N/A', fullLabel: 'Não se aplica', score: 0, counted: false },
  { value: 'Não é feito', label: '1', fullLabel: 'Não é feito', score: 1, counted: true },
  { value: 'É mal feito', label: '2', fullLabel: 'É mal feito', score: 2, counted: true },
  { value: 'É feito', label: '3', fullLabel: 'É feito', score: 3, counted: true },
  { value: 'É bem feito', label: '4', fullLabel: 'É bem feito', score: 4, counted: true },
  { value: 'É muito bem feito', label: '5', fullLabel: 'É muito bem feito', score: 5, counted: true },
];

// Componente de progresso circular
function CircularProgress({ value, size = 60, strokeWidth = 6, color = '#7B9965' }: { value: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

export default function Questionnaire() {
  const { diagnosisId } = useParams<{ diagnosisId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AssessmentItem[]>([]);
  const [responses, setResponses] = useState<Response>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showObservations, setShowObservations] = useState(false);

  useEffect(() => {
    loadQuestionnaire();
  }, [diagnosisId]);

  async function loadQuestionnaire() {
    try {
      setLoading(true);
      const allQuestions = await pillarService.getAllQuestions();
      setQuestions(allQuestions);

      // Load existing responses
      if (diagnosisId) {
        const existingResponses = await responseService.getByDiagnosisId(diagnosisId);
        const responsesMap: Response = {};
        existingResponses.forEach((resp: any) => {
          responsesMap[resp.assessmentItemId] = {
            evaluation: resp.evaluation,
            observations: resp.observations,
          };
        });
        setResponses(responsesMap);
      }
    } catch (error) {
      console.error('Erro ao carregar questionario:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveResponse() {
    if (!diagnosisId || !currentQuestion) return;

    const response = responses[currentQuestion.id];
    if (!response?.evaluation) {
      alert('Por favor, selecione uma avaliacao');
      return;
    }

    try {
      setSaving(true);
      await responseService.upsert(diagnosisId, {
        assessmentItemId: currentQuestion.id,
        importance: 'Importante',
        evaluation: response.evaluation,
        observations: response.observations,
      });

      setShowObservations(false);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        await handleFinalizeDiagnosis();
      }
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      alert('Erro ao salvar resposta. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalizeDiagnosis() {
    if (!diagnosisId) return;

    try {
      setSaving(true);
      await diagnosisService.finalize(diagnosisId);
      navigate(`/diagnosis/${diagnosisId}/results`);
    } catch (error) {
      console.error('Erro ao finalizar diagnostico:', error);
      alert('Erro ao finalizar diagnostico. Tente novamente.');
      setSaving(false);
    }
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowObservations(false);
    }
  }

  function handleSkip() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowObservations(false);
    }
  }

  function updateResponse(field: keyof ResponseData, value: any) {
    if (!currentQuestion) return;

    setResponses({
      ...responses,
      [currentQuestion.id]: {
        ...responses[currentQuestion.id],
        [field]: value,
      },
    });
  }

  function navigateToPillar(pillarCode: string) {
    const firstQuestionIndex = questions.findIndex(
      (q) => q.criteria.theme.pillar.code === pillarCode
    );
    if (firstQuestionIndex !== -1) {
      setCurrentIndex(firstQuestionIndex);
      setShowObservations(false);
    }
  }

  const currentQuestion = questions[currentIndex];

  const pillarCode = currentQuestion?.criteria.theme.pillar.code || '';
  const themeName = currentQuestion?.criteria.theme.name || '';
  const criteriaName = currentQuestion?.criteria.name || '';

  const pillarColors: Record<string, { bg: string; text: string; border: string; bgLight: string; gradient: string }> = {
    'E': { bg: '#22c55e', text: '#166534', border: '#22c55e', bgLight: '#f0fdf4', gradient: 'from-green-500 to-emerald-600' },
    'S': { bg: '#3b82f6', text: '#1e40af', border: '#3b82f6', bgLight: '#eff6ff', gradient: 'from-blue-500 to-indigo-600' },
    'G': { bg: '#f59e0b', text: '#b45309', border: '#f59e0b', bgLight: '#fffbeb', gradient: 'from-amber-500 to-orange-600' }
  };

  const currentPillarColor = pillarColors[pillarCode] || pillarColors['E'];

  const pillarProgress: Record<string, { answered: number; total: number }> = {
    E: { answered: 0, total: 0 },
    S: { answered: 0, total: 0 },
    G: { answered: 0, total: 0 }
  };

  questions.forEach((q) => {
    const code = q.criteria.theme.pillar.code;
    if (pillarProgress[code]) {
      pillarProgress[code].total++;
      if (responses[q.id]?.evaluation) {
        pillarProgress[code].answered++;
      }
    }
  });

  const totalAnswered = pillarProgress.E.answered + pillarProgress.S.answered + pillarProgress.G.answered;
  const totalQuestions = pillarProgress.E.total + pillarProgress.S.total + pillarProgress.G.total;
  const overallProgress = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  const questionsOfCurrentPillar = questions.filter(
    (q) => q.criteria.theme.pillar.code === pillarCode
  );
  const currentQuestionIndexInPillar = questionsOfCurrentPillar.findIndex(
    (q) => q.id === currentQuestion?.id
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto" style={{ borderColor: '#7B9965', borderTopColor: 'transparent' }}></div>
          <p className="mt-4 font-semibold" style={{ color: '#152F27' }}>Carregando questionario...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nenhuma questao encontrada
            </h2>
            <p className="text-gray-600 mb-6">
              Nao foi possivel carregar as questoes do diagnostico.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Voltar ao Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentResponse = responses[currentQuestion.id] || {};

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header fixo */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
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
                <h1 className="text-lg font-bold" style={{ color: '#152F27' }}>Diagnostico ESG</h1>
                <p className="text-xs text-gray-500">Questao {currentIndex + 1} de {totalQuestions}</p>
              </div>
            </div>

            {/* Progress bar geral no header */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">{overallProgress}% concluido</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-300"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="text-sm"
              >
                Salvar e Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Pilares */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Progresso</h3>

              <div className="space-y-3">
                {/* Ambiental */}
                <button
                  onClick={() => navigateToPillar('E')}
                  className={`w-full p-3 rounded-xl transition-all ${
                    pillarCode === 'E'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <CircularProgress
                        value={pillarProgress.E.total > 0 ? (pillarProgress.E.answered / pillarProgress.E.total) * 100 : 0}
                        size={44}
                        strokeWidth={4}
                        color={pillarCode === 'E' ? '#fff' : '#22c55e'}
                      />
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${pillarCode === 'E' ? 'text-white' : 'text-green-600'}`}>
                        {pillarProgress.E.answered}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-bold ${pillarCode === 'E' ? 'text-white' : 'text-gray-800'}`}>Ambiental</p>
                      <p className={`text-xs ${pillarCode === 'E' ? 'text-green-100' : 'text-gray-500'}`}>
                        {pillarProgress.E.answered}/{pillarProgress.E.total} respostas
                      </p>
                    </div>
                  </div>
                </button>

                {/* Social */}
                <button
                  onClick={() => navigateToPillar('S')}
                  className={`w-full p-3 rounded-xl transition-all ${
                    pillarCode === 'S'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <CircularProgress
                        value={pillarProgress.S.total > 0 ? (pillarProgress.S.answered / pillarProgress.S.total) * 100 : 0}
                        size={44}
                        strokeWidth={4}
                        color={pillarCode === 'S' ? '#fff' : '#3b82f6'}
                      />
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${pillarCode === 'S' ? 'text-white' : 'text-blue-600'}`}>
                        {pillarProgress.S.answered}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-bold ${pillarCode === 'S' ? 'text-white' : 'text-gray-800'}`}>Social</p>
                      <p className={`text-xs ${pillarCode === 'S' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {pillarProgress.S.answered}/{pillarProgress.S.total} respostas
                      </p>
                    </div>
                  </div>
                </button>

                {/* Governanca */}
                <button
                  onClick={() => navigateToPillar('G')}
                  className={`w-full p-3 rounded-xl transition-all ${
                    pillarCode === 'G'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <CircularProgress
                        value={pillarProgress.G.total > 0 ? (pillarProgress.G.answered / pillarProgress.G.total) * 100 : 0}
                        size={44}
                        strokeWidth={4}
                        color={pillarCode === 'G' ? '#fff' : '#f59e0b'}
                      />
                      <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${pillarCode === 'G' ? 'text-white' : 'text-amber-600'}`}>
                        {pillarProgress.G.answered}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-bold ${pillarCode === 'G' ? 'text-white' : 'text-gray-800'}`}>Governanca</p>
                      <p className={`text-xs ${pillarCode === 'G' ? 'text-amber-100' : 'text-gray-500'}`}>
                        {pillarProgress.G.answered}/{pillarProgress.G.total} respostas
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Legenda de avaliacao */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Escala</h4>
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs font-bold">N/A</span>
                    <span>Nao se aplica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-red-100 text-red-700 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Nao e feito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">2</span>
                    <span>E mal feito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-yellow-100 text-yellow-700 flex items-center justify-center text-xs font-bold">3</span>
                    <span>E feito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-lime-100 text-lime-700 flex items-center justify-center text-xs font-bold">4</span>
                    <span>E bem feito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">5</span>
                    <span>E muito bem feito</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Area principal */}
          <div className="flex-1 max-w-3xl">
            {/* Card da questao */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Header do card com cor do pilar */}
              <div className={`bg-gradient-to-r ${currentPillarColor.gradient} px-6 py-4`}>
                <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                  <span>{themeName}</span>
                  <span>•</span>
                  <span>{criteriaName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold text-lg">
                    {pillarCode === 'E' ? 'Ambiental' : pillarCode === 'S' ? 'Social' : 'Governanca'}
                  </h2>
                  <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-sm font-medium">
                    {currentQuestionIndexInPillar + 1} / {questionsOfCurrentPillar.length}
                  </span>
                </div>
              </div>

              {/* Corpo do card */}
              <div className="p-6">
                {/* Pergunta */}
                <h3 className="text-xl font-semibold text-gray-800 leading-relaxed mb-8">
                  {currentQuestion.question}
                </h3>

                {/* Opcoes de avaliacao - Layout horizontal tipo escala */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-4">
                    Como voce avalia esta pratica na sua empresa?
                  </label>

                  <div className="flex gap-2">
                    {evaluationOptions.map((option, index) => {
                      const isSelected = currentResponse.evaluation === option.value;
                      const isNaoSeAplica = option.value === 'Não se aplica';

                      const bgColors = ['bg-gray-100', 'bg-red-50', 'bg-orange-50', 'bg-yellow-50', 'bg-lime-50', 'bg-green-50'];
                      const selectedBgColors = ['bg-gray-500', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
                      const textColors = ['text-gray-600', 'text-red-600', 'text-orange-600', 'text-yellow-600', 'text-lime-600', 'text-green-600'];

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateResponse('evaluation', option.value)}
                          className={`flex-1 py-4 px-2 rounded-xl transition-all transform hover:scale-105 ${
                            isSelected
                              ? `${selectedBgColors[index]} text-white shadow-lg scale-105`
                              : `${bgColors[index]} ${textColors[index]} hover:shadow-md`
                          }`}
                        >
                          <div className="text-center">
                            <span className={`text-2xl font-bold block ${isSelected ? 'text-white' : ''}`}>
                              {isNaoSeAplica ? 'N/A' : option.score}
                            </span>
                            <span className={`text-xs mt-1 block ${isSelected ? 'text-white/80' : 'opacity-80'}`}>
                              {option.fullLabel}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {currentResponse.evaluation === 'Não se aplica' && (
                    <p className="mt-3 text-xs text-gray-500 italic text-center">
                      Esta resposta nao sera contabilizada no calculo do score
                    </p>
                  )}
                </div>

                {/* Observacoes - colapsavel */}
                <div className="border-t pt-4">
                  <button
                    type="button"
                    onClick={() => setShowObservations(!showObservations)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <svg className={`w-4 h-4 transition-transform ${showObservations ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Adicionar observacao (opcional)
                  </button>

                  {showObservations && (
                    <textarea
                      value={currentResponse.observations || ''}
                      onChange={(e) => updateResponse('observations', e.target.value)}
                      rows={3}
                      className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                      placeholder="Adicione observacoes relevantes sobre esta questao..."
                    />
                  )}
                </div>
              </div>

              {/* Footer com navegacao */}
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

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSkip}
                    disabled={currentIndex === questions.length - 1}
                    className="px-4 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Pular
                  </button>
                  <button
                    onClick={handleSaveResponse}
                    disabled={!currentResponse.evaluation || saving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${currentPillarColor.gradient} hover:shadow-lg`}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        {currentIndex === questions.length - 1 ? 'Finalizar' : 'Proxima'}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Suas respostas sao salvas automaticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
