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

  // Informações do pilar atual
  const pillarName = currentQuestion?.criteria.theme.pillar.name || '';
  const pillarCode = currentQuestion?.criteria.theme.pillar.code || '';
  const themeName = currentQuestion?.criteria.theme.name || '';
  const criteriaName = currentQuestion?.criteria.name || '';

  // Cores por pilar
  const pillarColors: Record<string, { bg: string; text: string; border: string }> = {
    'E': { bg: '#e8f5e9', text: '#1b5e20', border: '#4CAF50' },
    'S': { bg: '#e3f2fd', text: '#0d47a1', border: '#2196F3' },
    'G': { bg: '#fff3e0', text: '#e65100', border: '#FF9800' }
  };

  const currentPillarColor = pillarColors[pillarCode] || pillarColors['E'];

  // Calcular progresso por pilar
  const pillarProgress: Record<string, { answered: number; total: number }> = {
    E: { answered: 0, total: 75 },
    S: { answered: 0, total: 75 },
    G: { answered: 0, total: 65 }
  };

  questions.forEach((q) => {
    const code = q.criteria.theme.pillar.code;
    if (responses[q.id]?.importance && responses[q.id]?.evaluation) {
      if (pillarProgress[code]) {
        pillarProgress[code].answered++;
      }
    }
  });

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

        {/* Pillar Progress Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: '#4CAF50' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                   style={{ backgroundColor: '#4CAF50' }}>
                E
              </div>
              <span className="text-2xl font-bold" style={{ color: '#1b5e20' }}>
                {pillarProgress.E.answered}/{pillarProgress.E.total}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-600">Ambiental</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="h-full rounded-full"
                   style={{
                     width: `${(pillarProgress.E.answered / pillarProgress.E.total) * 100}%`,
                     backgroundColor: '#4CAF50'
                   }} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: '#2196F3' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                   style={{ backgroundColor: '#2196F3' }}>
                S
              </div>
              <span className="text-2xl font-bold" style={{ color: '#0d47a1' }}>
                {pillarProgress.S.answered}/{pillarProgress.S.total}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-600">Social</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="h-full rounded-full"
                   style={{
                     width: `${(pillarProgress.S.answered / pillarProgress.S.total) * 100}%`,
                     backgroundColor: '#2196F3'
                   }} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: '#FF9800' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                   style={{ backgroundColor: '#FF9800' }}>
                G
              </div>
              <span className="text-2xl font-bold" style={{ color: '#e65100' }}>
                {pillarProgress.G.answered}/{pillarProgress.G.total}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-600">Governança</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="h-full rounded-full"
                   style={{
                     width: `${(pillarProgress.G.answered / pillarProgress.G.total) * 100}%`,
                     backgroundColor: '#FF9800'
                   }} />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="mb-6 bg-white rounded-2xl shadow-lg p-6" style={{
          borderLeft: `6px solid ${currentPillarColor.border}`,
          backgroundColor: currentPillarColor.bg
        }}>
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-4 py-1.5 rounded-full text-sm font-bold" style={{
                backgroundColor: currentPillarColor.border,
                color: 'white'
              }}>
                {pillarCode} - {pillarName}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-700 font-medium">{themeName}</span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-700 font-medium">{criteriaName}</span>
            </div>
            <p className="text-sm font-semibold mb-4" style={{ color: currentPillarColor.text }}>
              Questão {currentIndex + 1} de {questions.length}
            </p>
            <h2 className="text-xl font-semibold leading-relaxed" style={{ color: '#152F27' }}>
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
