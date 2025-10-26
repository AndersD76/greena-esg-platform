import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pillarService, AssessmentItem } from '../services/pillar.service';
import { responseService, ResponseData } from '../services/response.service';
import { diagnosisService } from '../services/diagnosis.service';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { ProgressBar } from '../components/common/ProgressBar';

interface Response {
  [key: number]: {
    importance: ResponseData['importance'];
    evaluation: ResponseData['evaluation'];
    observations?: string;
  };
}

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
            importance: resp.importance,
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
    if (!response?.importance || !response?.evaluation) {
      alert('Por favor, preencha Importância e Avaliação');
      return;
    }

    try {
      setSaving(true);
      await responseService.upsert(diagnosisId, {
        assessmentItemId: currentQuestion.id,
        importance: response.importance,
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

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(responses).filter(
    (key) => responses[Number(key)]?.importance && responses[Number(key)]?.evaluation
  ).length;
  const progress = (answeredCount / questions.length) * 100;

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
  const pillarName = currentQuestion.criteria.theme.pillar.name;
  const themeName = currentQuestion.criteria.theme.name;
  const criteriaName = currentQuestion.criteria.name;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Diagnóstico ESG</h1>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Salvar e Sair
            </Button>
          </div>
          <ProgressBar
            progress={progress}
            label={`Progresso: ${answeredCount} de ${questions.length} questões`}
          />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {pillarName}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">{themeName}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">{criteriaName}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Questão {currentIndex + 1} de {questions.length}
            </p>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          <div className="space-y-6">
            {/* Importance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Importância <span className="text-red-500">*</span>
              </label>
              <Select
                value={currentResponse.importance || ''}
                onChange={(e) => updateResponse('importance', e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="Sem Importância">Sem Importância</option>
                <option value="Importante">Importante</option>
                <option value="Muito Importante">Muito Importante</option>
                <option value="Crítico">Crítico</option>
              </Select>
            </div>

            {/* Evaluation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliação <span className="text-red-500">*</span>
              </label>
              <Select
                value={currentResponse.evaluation || ''}
                onChange={(e) => updateResponse('evaluation', e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                <option value="Não se aplica">Não se aplica</option>
                <option value="Não é feito">Não é feito</option>
                <option value="É mal feito">É mal feito</option>
                <option value="É feito">É feito</option>
                <option value="É bem feito">É bem feito</option>
              </Select>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Adicione observações relevantes sobre esta questão..."
              />
            </div>
          </div>
        </Card>

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
              disabled={!currentResponse.importance || !currentResponse.evaluation}
            >
              {currentIndex === questions.length - 1 ? 'Finalizar' : 'Próxima →'}
            </Button>
          </div>
        </div>

        {/* Progress Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Suas respostas são salvas automaticamente</p>
          <p className="mt-1">Você pode pausar e continuar depois a qualquer momento</p>
        </div>
      </div>
    </div>
  );
}
