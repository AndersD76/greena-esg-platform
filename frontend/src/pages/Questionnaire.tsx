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

// Opções de avaliação com valores
const evaluationOptions = [
  { value: 'Não se aplica', label: 'Não se aplica', score: 0, counted: false },
  { value: 'Não é feito', label: 'Não é feito', score: 1, counted: true },
  { value: 'É mal feito', label: 'É mal feito', score: 2, counted: true },
  { value: 'É feito', label: 'É feito', score: 3, counted: true },
  { value: 'É bem feito', label: 'É bem feito', score: 4, counted: true },
  { value: 'É muito bem feito', label: 'É muito bem feito', score: 5, counted: true },
];

export default function Questionnaire() {
  const { diagnosisId } = useParams<{ diagnosisId: string }>();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AssessmentItem[]>([]);
  const [responses, setResponses] = useState<Response>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      console.error('Erro ao carregar questionário:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveResponse() {
    if (!diagnosisId || !currentQuestion) return;

    const response = responses[currentQuestion.id];
    if (!response?.evaluation) {
      alert('Por favor, selecione uma avaliação');
      return;
    }

    try {
      setSaving(true);
      await responseService.upsert(diagnosisId, {
        assessmentItemId: currentQuestion.id,
        importance: 'Importante', // Valor fixo já que removemos o campo
        evaluation: response.evaluation,
        observations: response.observations,
      });

      // Move to next question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // All questions answered, finalize diagnosis
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
    }
  }

  function handleSkip() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
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

  // Navegar para a primeira questão de um pilar específico
  function navigateToPillar(pillarCode: string) {
    const firstQuestionIndex = questions.findIndex(
      (q) => q.criteria.theme.pillar.code === pillarCode
    );
    if (firstQuestionIndex !== -1) {
      setCurrentIndex(firstQuestionIndex);
    }
  }

  const currentQuestion = questions[currentIndex];

  // Informações do pilar atual
  const pillarName = currentQuestion?.criteria.theme.pillar.name || '';
  const pillarCode = currentQuestion?.criteria.theme.pillar.code || '';
  const themeName = currentQuestion?.criteria.theme.name || '';
  const criteriaName = currentQuestion?.criteria.name || '';

  // Cores por pilar
  const pillarColors: Record<string, { bg: string; text: string; border: string; bgLight: string }> = {
    'E': { bg: '#4CAF50', text: '#1b5e20', border: '#4CAF50', bgLight: '#e8f5e9' },
    'S': { bg: '#2196F3', text: '#0d47a1', border: '#2196F3', bgLight: '#e3f2fd' },
    'G': { bg: '#FF9800', text: '#e65100', border: '#FF9800', bgLight: '#fff3e0' }
  };

  const currentPillarColor = pillarColors[pillarCode] || pillarColors['E'];

  // Calcular progresso por pilar
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

  // Calcular índice da questão dentro do pilar atual
  const questionsOfCurrentPillar = questions.filter(
    (q) => q.criteria.theme.pillar.code === pillarCode
  );
  const currentQuestionIndexInPillar = questionsOfCurrentPillar.findIndex(
    (q) => q.id === currentQuestion?.id
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando questionário...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <span className="text-6xl mb-4 block">⚠️</span>
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar com progresso por eixo */}
        <div className="w-72 min-h-screen bg-white border-r border-gray-200 p-6 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-black mb-1" style={{ color: '#152F27' }}>Diagnóstico ESG</h2>
            <p className="text-sm text-gray-500">Progresso por eixo</p>
          </div>

          {/* Cards de Progresso Clicáveis */}
          <div className="space-y-4 flex-1">
            {/* Ambiental */}
            <button
              onClick={() => navigateToPillar('E')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                pillarCode === 'E' ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                borderColor: '#4CAF50',
                backgroundColor: pillarCode === 'E' ? '#e8f5e9' : 'white',
                ['--tw-ring-color' as any]: '#4CAF50'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: '#4CAF50' }}
                >
                  E
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: '#152F27' }}>Ambiental</p>
                  <p className="text-xs text-gray-500">Environmental</p>
                </div>
                <span className="text-xl font-black" style={{ color: '#1b5e20' }}>
                  {pillarProgress.E.answered}/{pillarProgress.E.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pillarProgress.E.total > 0 ? (pillarProgress.E.answered / pillarProgress.E.total) * 100 : 0}%`,
                    backgroundColor: '#4CAF50'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {pillarProgress.E.total > 0 ? Math.round((pillarProgress.E.answered / pillarProgress.E.total) * 100) : 0}% completo
              </p>
            </button>

            {/* Social */}
            <button
              onClick={() => navigateToPillar('S')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                pillarCode === 'S' ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                borderColor: '#2196F3',
                backgroundColor: pillarCode === 'S' ? '#e3f2fd' : 'white',
                ['--tw-ring-color' as any]: '#2196F3'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: '#2196F3' }}
                >
                  S
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: '#152F27' }}>Social</p>
                  <p className="text-xs text-gray-500">Social</p>
                </div>
                <span className="text-xl font-black" style={{ color: '#0d47a1' }}>
                  {pillarProgress.S.answered}/{pillarProgress.S.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pillarProgress.S.total > 0 ? (pillarProgress.S.answered / pillarProgress.S.total) * 100 : 0}%`,
                    backgroundColor: '#2196F3'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {pillarProgress.S.total > 0 ? Math.round((pillarProgress.S.answered / pillarProgress.S.total) * 100) : 0}% completo
              </p>
            </button>

            {/* Governança */}
            <button
              onClick={() => navigateToPillar('G')}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                pillarCode === 'G' ? 'ring-2 ring-offset-2' : ''
              }`}
              style={{
                borderColor: '#FF9800',
                backgroundColor: pillarCode === 'G' ? '#fff3e0' : 'white',
                ['--tw-ring-color' as any]: '#FF9800'
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: '#FF9800' }}
                >
                  G
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: '#152F27' }}>Governança</p>
                  <p className="text-xs text-gray-500">Governance</p>
                </div>
                <span className="text-xl font-black" style={{ color: '#e65100' }}>
                  {pillarProgress.G.answered}/{pillarProgress.G.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${pillarProgress.G.total > 0 ? (pillarProgress.G.answered / pillarProgress.G.total) * 100 : 0}%`,
                    backgroundColor: '#FF9800'
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {pillarProgress.G.total > 0 ? Math.round((pillarProgress.G.answered / pillarProgress.G.total) * 100) : 0}% completo
              </p>
            </button>
          </div>

          {/* Botão Salvar e Sair */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              Salvar e Sair
            </Button>
          </div>
        </div>

        {/* Área principal */}
        <div className="flex-1 p-8">
          <div className="max-w-3xl mx-auto">
            {/* Question Card */}
            <div
              className="bg-white rounded-2xl shadow-lg p-8 mb-6"
              style={{
                borderLeft: `6px solid ${currentPillarColor.border}`,
                backgroundColor: currentPillarColor.bgLight
              }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: currentPillarColor.bg,
                    color: 'white'
                  }}
                >
                  {pillarCode} - {pillarName}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-700 font-medium">{themeName}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-700 font-medium">{criteriaName}</span>
              </div>

              {/* Indicador de questão no pilar */}
              <p className="text-sm font-semibold mb-6" style={{ color: currentPillarColor.text }}>
                Questão {currentQuestionIndexInPillar + 1} de {questionsOfCurrentPillar.length} ({pillarName})
              </p>

              {/* Pergunta */}
              <h2 className="text-xl font-semibold leading-relaxed mb-8" style={{ color: '#152F27' }}>
                {currentQuestion.question}
              </h2>

              {/* Formulário */}
              <div className="space-y-6">
                {/* Evaluation - Caixas Seletoras */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Avaliação <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {evaluationOptions.map((option) => {
                      const isSelected = currentResponse.evaluation === option.value;
                      const isNaoSeAplica = option.value === 'Não se aplica';

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => updateResponse('evaluation', option.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'ring-2 ring-offset-2'
                              : 'hover:shadow-md'
                          }`}
                          style={{
                            borderColor: isSelected ? currentPillarColor.border : '#e5e7eb',
                            backgroundColor: isSelected ? currentPillarColor.bgLight : 'white',
                            ...(isSelected && { ringColor: currentPillarColor.border })
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isSelected ? 'text-white' : 'text-gray-500'
                              }`}
                              style={{
                                backgroundColor: isSelected
                                  ? currentPillarColor.bg
                                  : isNaoSeAplica
                                  ? '#9ca3af'
                                  : '#e5e7eb'
                              }}
                            >
                              {isNaoSeAplica ? 'N/A' : option.score}
                            </div>
                            <span
                              className={`text-sm font-medium ${
                                isSelected ? 'font-bold' : ''
                              }`}
                              style={{
                                color: isSelected ? currentPillarColor.text : '#374151'
                              }}
                            >
                              {option.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {currentResponse.evaluation === 'Não se aplica' && (
                    <p className="mt-3 text-xs text-gray-500 italic">
                      * Esta resposta não será contabilizada no cálculo do score
                    </p>
                  )}
                </div>

                {/* Observations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={currentResponse.observations || ''}
                    onChange={(e) => updateResponse('observations', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Adicione observações relevantes sobre esta questão..."
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
              >
                ← Anterior
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={currentIndex === questions.length - 1}
                >
                  Pular
                </Button>
                <Button
                  onClick={handleSaveResponse}
                  loading={saving}
                  disabled={!currentResponse.evaluation}
                >
                  {currentIndex === questions.length - 1 ? 'Finalizar' : 'Próxima →'}
                </Button>
              </div>
            </div>

            {/* Info */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Suas respostas são salvas automaticamente</p>
              <p className="mt-1">Você pode pausar e continuar depois a qualquer momento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
