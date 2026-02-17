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

// Escala de maturidade ESG (0-5)
const evaluationOptions = [
  { value: 'Não se aplica', label: 'N/A', fullLabel: 'Não se aplica', maturity: 'N/A', score: 0, counted: false },
  { value: 'Não iniciado', label: '1', fullLabel: 'Não iniciado', maturity: 'ELEMENTAR', score: 1, counted: true },
  { value: 'Planejado', label: '2', fullLabel: 'Planejado', maturity: 'NÃO INTEGRADO', score: 2, counted: true },
  { value: 'Em andamento', label: '3', fullLabel: 'Em andamento', maturity: 'GERENCIAL', score: 3, counted: true },
  { value: 'Implementado parcialmente', label: '4', fullLabel: 'Implementado parcialmente', maturity: 'ESTRATÉGICO', score: 4, counted: true },
  { value: 'Totalmente implementado', label: '5', fullLabel: 'Totalmente implementado', maturity: 'TRANSFORMADOR', score: 5, counted: true },
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
      console.error('Erro ao finalizar diagnóstico:', error);
      alert('Erro ao finalizar diagnóstico. Tente novamente.');
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
              Nenhuma questão encontrada
            </h2>
            <p className="text-gray-600 mb-6">
              Não foi possível carregar as questões do diagnóstico.
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
                <h1 className="text-lg font-bold" style={{ color: '#152F27' }}>Diagnóstico ESG</h1>
                <p className="text-xs text-gray-500">
                  {pillarCode === 'E' ? 'Ambiental' : pillarCode === 'S' ? 'Social' : 'Governança'} — Questão {currentQuestionIndexInPillar + 1} de {questionsOfCurrentPillar.length}
                </p>
              </div>
            </div>

            {/* Progress bar geral no header */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: '#666' }}>{overallProgress}% concluido</span>
                <div className="w-32 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${overallProgress}%`, background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
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
                  className="w-full p-3 rounded-xl transition-all shadow-sm"
                  style={
                    pillarCode === 'E'
                      ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)', color: 'white' }
                      : { backgroundColor: '#f5f5f5' }
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <CircularProgress
                        value={pillarProgress.E.total > 0 ? (pillarProgress.E.answered / pillarProgress.E.total) * 100 : 0}
                        size={44}
                        strokeWidth={4}
                        color={pillarCode === 'E' ? '#fff' : '#7B9965'}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: pillarCode === 'E' ? '#fff' : '#7B9965' }}>
                        {pillarProgress.E.answered}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold" style={{ color: pillarCode === 'E' ? '#fff' : '#152F27' }}>Ambiental</p>
                      <p className="text-xs" style={{ color: pillarCode === 'E' ? 'rgba(255,255,255,0.7)' : '#666' }}>
                        {pillarProgress.E.answered}/{pillarProgress.E.total} respostas
                      </p>
                    </div>
                  </div>
                </button>

                {/* Social */}
                <button
                  onClick={() => navigateToPillar('S')}
                  className="w-full p-3 rounded-xl transition-all shadow-sm"
                  style={
                    pillarCode === 'S'
                      ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)', color: 'white' }
                      : { backgroundColor: '#f5f5f5' }
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <CircularProgress
                        value={pillarProgress.S.total > 0 ? (pillarProgress.S.answered / pillarProgress.S.total) * 100 : 0}
                        size={44}
                        strokeWidth={4}
                        color={pillarCode === 'S' ? '#fff' : '#152F27'}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: pillarCode === 'S' ? '#fff' : '#152F27' }}>
                        {pillarProgress.S.answered}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold" style={{ color: pillarCode === 'S' ? '#fff' : '#152F27' }}>Social</p>
                      <p className="text-xs" style={{ color: pillarCode === 'S' ? 'rgba(255,255,255,0.7)' : '#666' }}>
                        {pillarProgress.S.answered}/{pillarProgress.S.total} respostas
                      </p>
                    </div>
                  </div>
                </button>

                {/* Governança */}
                <button
                  onClick={() => navigateToPillar('G')}
                  className="w-full p-3 rounded-xl transition-all shadow-sm"
                  style={
                    pillarCode === 'G'
                      ? { background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)', color: 'white' }
                      : { backgroundColor: '#f5f5f5' }
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <CircularProgress
                        value={pillarProgress.G.total > 0 ? (pillarProgress.G.answered / pillarProgress.G.total) * 100 : 0}
                        size={44}
                        strokeWidth={4}
                        color={pillarCode === 'G' ? '#fff' : '#EFD4A8'}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: pillarCode === 'G' ? '#fff' : '#B8965A' }}>
                        {pillarProgress.G.answered}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold" style={{ color: pillarCode === 'G' ? '#fff' : '#152F27' }}>Governança</p>
                      <p className="text-xs" style={{ color: pillarCode === 'G' ? 'rgba(255,255,255,0.7)' : '#666' }}>
                        {pillarProgress.G.answered}/{pillarProgress.G.total} respostas
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Legenda de maturidade */}
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#666' }}>Escala de Maturidade</h4>
                <div className="space-y-1.5 text-xs" style={{ color: '#666' }}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#E5E7EB', color: '#666' }}>0</span>
                    <span>Não se aplica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#FEE2E2', color: '#924131' }}>1</span>
                    <span>Não iniciado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>2</span>
                    <span>Planejado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#EFD4A8', color: '#B8965A' }}>3</span>
                    <span>Em andamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#D4E8C7', color: '#7B9965' }}>4</span>
                    <span>Implementado parcialmente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#C5E1B5', color: '#152F27' }}>5</span>
                    <span>Totalmente implementado</span>
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
              <div className="px-6 py-4" style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-white font-bold text-lg">
                    {pillarCode === 'E' ? 'Ambiental' : pillarCode === 'S' ? 'Social' : 'Governança'}
                  </h2>
                  <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-white text-sm font-medium">
                    {currentQuestionIndexInPillar + 1} / {questionsOfCurrentPillar.length}
                  </span>
                </div>
                <div className="text-white/90 text-sm">
                  <span className="font-semibold">{themeName}</span>
                </div>
                <div className="mt-1 px-3 py-1.5 rounded-lg bg-white/15 inline-block">
                  <span className="text-white text-xs font-bold uppercase tracking-wide">
                    Critério: {criteriaName}
                  </span>
                </div>
              </div>

              {/* Corpo do card */}
              <div className="p-6">
                {/* Pergunta */}
                <h3 className="text-xl font-semibold text-gray-800 leading-relaxed mb-8">
                  {currentQuestion.question}
                </h3>

                {/* Opcoes de avaliacao - Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-3">
                    Qual o nível de maturidade desta prática na sua empresa?
                  </label>

                  <select
                    value={currentResponse.evaluation || ''}
                    onChange={(e) => updateResponse('evaluation', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 font-semibold text-base transition-all focus:outline-none appearance-none cursor-pointer"
                    style={{
                      borderColor: currentResponse.evaluation ? '#7B9965' : '#e0e0e0',
                      color: currentResponse.evaluation ? '#152F27' : '#999',
                      backgroundColor: '#fff',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '20px',
                      paddingRight: '44px',
                    }}
                  >
                    <option value="" disabled>Selecione o nível de maturidade...</option>
                    {evaluationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.score === 0 ? 'N/A' : option.score} - {option.fullLabel} ({option.maturity})
                      </option>
                    ))}
                  </select>

                  {currentResponse.evaluation && (
                    <div className="mt-3 px-4 py-2.5 rounded-lg" style={{
                      backgroundColor: currentResponse.evaluation === 'Não se aplica' ? '#f5f5f5' :
                        currentResponse.evaluation === 'Não iniciado' ? '#FEE2E2' :
                        currentResponse.evaluation === 'Planejado' ? '#FEF3C7' :
                        currentResponse.evaluation === 'Em andamento' ? '#FEF3C7' :
                        currentResponse.evaluation === 'Implementado parcialmente' ? '#D4E8C7' : '#C5E1B5'
                    }}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{
                          color: currentResponse.evaluation === 'Não se aplica' ? '#666' :
                            currentResponse.evaluation === 'Não iniciado' ? '#991B1B' :
                            currentResponse.evaluation === 'Planejado' ? '#92400E' :
                            currentResponse.evaluation === 'Em andamento' ? '#92400E' :
                            currentResponse.evaluation === 'Implementado parcialmente' ? '#3D6B2E' : '#152F27'
                        }}>
                          {evaluationOptions.find(o => o.value === currentResponse.evaluation)?.maturity}
                        </span>
                        {currentResponse.evaluation === 'Não se aplica' && (
                          <span className="text-xs text-gray-500 italic">
                            - Não será contabilizada no cálculo do score
                          </span>
                        )}
                      </div>
                    </div>
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
                    Adicionar observação (opcional)
                  </button>

                  {showObservations && (
                    <textarea
                      value={currentResponse.observations || ''}
                      onChange={(e) => updateResponse('observations', e.target.value)}
                      rows={3}
                      className="w-full mt-3 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm"
                      placeholder="Adicione observações relevantes sobre esta questão..."
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
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #152F27 0%, #7B9965 100%)' }}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        {currentIndex === questions.length - 1 ? 'Finalizar' : 'Próxima'}
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
              Suas respostas são salvas automaticamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
