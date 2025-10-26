import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { diagnosisService, Diagnosis } from '../services/diagnosis.service';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { getScoreColor, getScoreLevel } from '../types';

export default function Dashboard() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<Diagnosis | null>(null);

  useEffect(() => {
    loadDiagnoses();
  }, []);

  async function loadDiagnoses() {
    try {
      const data = await diagnosisService.list();
      setDiagnoses(data);
      const inProgress = data.find((d) => d.status === 'in_progress');
      if (inProgress) {
        setCurrentDiagnosis(inProgress);
      }
    } catch (error) {
      console.error('Erro ao carregar diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleStartNewDiagnosis() {
    try {
      const diagnosis = await diagnosisService.create();
      setCurrentDiagnosis(diagnosis);
      setDiagnoses([diagnosis, ...diagnoses]);
    } catch (error) {
      console.error('Erro ao criar diagnóstico:', error);
    }
  }

  const completedDiagnoses = diagnoses.filter((d) => d.status === 'completed');
  const lastCompleted = completedDiagnoses[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard ESG</h1>
          <p className="text-gray-600 mt-2">Acompanhe suas práticas de sustentabilidade</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {lastCompleted ? (
            <>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Score ESG Geral</p>
                  <p className={`text-4xl font-bold ${getScoreColor(Number(lastCompleted.overallScore))}`}>
                    {Number(lastCompleted.overallScore).toFixed(0)}
                  </p>
                  <Badge variant="success" className="mt-2">
                    {getScoreLevel(Number(lastCompleted.overallScore))}
                  </Badge>
                </div>
              </Card>

              <Card>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">🌍 Ambiental</span>
                    <span className={`font-semibold ${getScoreColor(Number(lastCompleted.environmentalScore))}`}>
                      {Number(lastCompleted.environmentalScore).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">👥 Social</span>
                    <span className={`font-semibold ${getScoreColor(Number(lastCompleted.socialScore))}`}>
                      {Number(lastCompleted.socialScore).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">🏢 Governança</span>
                    <span className={`font-semibold ${getScoreColor(Number(lastCompleted.governanceScore))}`}>
                      {Number(lastCompleted.governanceScore).toFixed(0)}
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Último Diagnóstico</p>
                  <p className="text-lg font-semibold">
                    {new Date(lastCompleted.completedAt!).toLocaleDateString('pt-BR')}
                  </p>
                  <Link to={`/diagnosis/${lastCompleted.id}/results`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      Ver Resultados
                    </Button>
                  </Link>
                </div>
              </Card>
            </>
          ) : (
            <Card className="lg:col-span-3">
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">🌱</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Bem-vindo ao GREENA!
                </h2>
                <p className="text-gray-600 mb-6">
                  Comece seu primeiro diagnóstico ESG e descubra como sua empresa pode ser mais sustentável.
                </p>
                <Button onClick={handleStartNewDiagnosis}>
                  Fazer Primeiro Diagnóstico
                </Button>
              </div>
            </Card>
          )}
        </div>

        {currentDiagnosis && (
          <Card className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Diagnóstico em Andamento</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Iniciado em {new Date(currentDiagnosis.startedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <Link to={`/diagnosis/${currentDiagnosis.id}/questionnaire`}>
                <Button>Continuar Diagnóstico</Button>
              </Link>
            </div>
          </Card>
        )}

        {!currentDiagnosis && lastCompleted && (
          <Card className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Novo Diagnóstico</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Inicie uma nova avaliação ESG e acompanhe sua evolução
                </p>
              </div>
              <Button onClick={handleStartNewDiagnosis}>
                Novo Diagnóstico
              </Button>
            </div>
          </Card>
        )}

        {completedDiagnoses.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Diagnósticos</h3>
            <div className="space-y-3">
              {completedDiagnoses.map((diagnosis) => (
                <div
                  key={diagnosis.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Score: {Number(diagnosis.overallScore).toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(diagnosis.completedAt!).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Link to={`/diagnosis/${diagnosis.id}/results`}>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
