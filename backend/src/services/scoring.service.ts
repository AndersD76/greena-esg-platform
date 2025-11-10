import prisma from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

export class ScoringService {
  /**
   * Calcula o score de um pilar
   */
  async calculatePillarScore(diagnosisId: string, pillarCode: string): Promise<number> {
    // Buscar pillar
    const pillar = await prisma.pillar.findUnique({
      where: { code: pillarCode },
      include: {
        themes: {
          include: {
            criteria: {
              include: {
                assessmentItems: true,
              },
            },
          },
        },
      },
    });

    if (!pillar) {
      throw new Error('Pilar não encontrado');
    }

    // Obter todas as questões do pilar
    const assessmentItemIds: number[] = [];
    pillar.themes.forEach((theme) => {
      theme.criteria.forEach((criteria) => {
        criteria.assessmentItems.forEach((item) => {
          assessmentItemIds.push(item.id);
        });
      });
    });

    // Buscar respostas do diagnóstico para este pilar
    const responses = await prisma.response.findMany({
      where: {
        diagnosisId,
        assessmentItemId: { in: assessmentItemIds },
      },
    });

    if (responses.length === 0) {
      return 0;
    }

    // Calcular score
    let totalScore = 0;
    let validQuestions = 0;

    responses.forEach((response) => {
      // Ignorar "Não se aplica"
      if (response.evaluation === 'Não se aplica') {
        return;
      }

      totalScore += response.importanceValue * response.evaluationValue;
      validQuestions++;
    });

    if (validQuestions === 0) {
      return 0;
    }

    const maxPossible = validQuestions * 81; // 9 × 9
    const score = (totalScore / maxPossible) * 100;

    return Math.round(score * 100) / 100; // 2 casas decimais
  }

  /**
   * Calcula todos os scores de um diagnóstico
   */
  async calculateAllScores(diagnosisId: string) {
    const environmentalScore = await this.calculatePillarScore(diagnosisId, 'E');
    const socialScore = await this.calculatePillarScore(diagnosisId, 'S');
    const governanceScore = await this.calculatePillarScore(diagnosisId, 'G');

    const overallScore = (environmentalScore + socialScore + governanceScore) / 3;

    // Atualizar diagnóstico
    await prisma.diagnosis.update({
      where: { id: diagnosisId },
      data: {
        environmentalScore: new Decimal(environmentalScore),
        socialScore: new Decimal(socialScore),
        governanceScore: new Decimal(governanceScore),
        overallScore: new Decimal(Math.round(overallScore * 100) / 100),
      },
    });

    return {
      environmental: environmentalScore,
      social: socialScore,
      governance: governanceScore,
      overall: Math.round(overallScore * 100) / 100,
    };
  }

  /**
   * Classifica score por nível
   */
  getScoreLevel(score: number): {
    level: string;
    label: string;
    color: string;
  } {
    if (score < 26) {
      return { level: 'critical', label: 'Crítico', color: '#DC2626' };
    }
    if (score < 51) {
      return { level: 'attention', label: 'Atenção', color: '#F59E0B' };
    }
    if (score < 71) {
      return { level: 'good', label: 'Bom', color: '#FCD34D' };
    }
    if (score < 86) {
      return { level: 'very-good', label: 'Muito Bom', color: '#84CC16' };
    }
    return { level: 'excellent', label: 'Excelente', color: '#22C55E' };
  }

  /**
   * Retorna o nível de certificação ESG baseado na pontuação
   */
  getCertificationLevel(score: number): {
    level: 'bronze' | 'silver' | 'gold';
    name: string;
    title: string;
    message: string;
    color: string;
    scoreRange: string;
    characteristics: string[];
  } {
    if (score < 40) {
      return {
        level: 'bronze',
        name: 'Compromisso ESG',
        title: 'Fundamentos ESG',
        message: 'Quem dá o primeiro passo na transformação sustentável.',
        color: '#CD7F32',
        scoreRange: '0-39',
        characteristics: [
          'Atua na conformidade básica legal e regulatória',
          'Possui políticas iniciais ou ações pontuais de sustentabilidade',
          'Liderança comprometida com o tema, mas ainda sem integração estratégica',
          'Iniciou sua trajetória rumo à sustentabilidade corporativa'
        ]
      };
    }

    if (score < 70) {
      return {
        level: 'silver',
        name: 'Integração ESG',
        title: 'Gestão ESG',
        message: 'Quem transforma intenções em práticas consistentes.',
        color: '#C0C0C0',
        scoreRange: '40-69',
        characteristics: [
          'Gestão integrada das dimensões ESG',
          'Políticas estruturadas e metas claras para reduzir impactos',
          'Indicadores ESG integrados ao planejamento estratégico',
          'Práticas de governança ativas, com transparência e compliance',
          'Comunicação interna e externa sobre ações e resultados ESG'
        ]
      };
    }

    return {
      level: 'gold',
      name: 'Liderança ESG',
      title: 'Excelência ESG',
      message: 'Quem inspira o mercado e multiplica o impacto positivo.',
      color: '#FFD700',
      scoreRange: '70-100',
      characteristics: [
        'Excelência em ESG com impacto positivo em todo ecossistema',
        'Estratégia ESG integrada à governança e cultura organizacional',
        'Relatórios públicos seguindo padrões reconhecidos (GRI, SASB, IFRS)',
        'Engajamento ativo com comunidades, fornecedores e stakeholders',
        'Referência setorial em inovação e impacto positivo',
        'Contribui para um futuro regenerativo e de baixo carbono'
      ]
    };
  }

  /**
   * Calcula scores parciais baseado nas respostas atuais (mesmo sem finalizar)
   */
  async calculatePartialScores(diagnosisId: string) {
    const environmentalScore = await this.calculatePillarScore(diagnosisId, 'E');
    const socialScore = await this.calculatePillarScore(diagnosisId, 'S');
    const governanceScore = await this.calculatePillarScore(diagnosisId, 'G');

    const overallScore = (environmentalScore + socialScore + governanceScore) / 3;

    return {
      environmental: environmentalScore,
      social: socialScore,
      governance: governanceScore,
      overall: Math.round(overallScore * 100) / 100,
    };
  }
}
