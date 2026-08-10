import Anthropic from '@anthropic-ai/sdk';
import prisma from '../config/database';

// ====== TOGGLE: ligar/desligar feature de IA ======
const AI_FEATURE_ENABLED = true;
// ==================================================

const anthropic = new Anthropic();

interface AiAnalysisContent {
  executiveSummary: string;
  strengths: string[];
  criticalRisks: Array<{ area: string; risk: string; financialImpact: string }>;
  strategicRecommendations: Array<{ title: string; description: string; priority: string; estimatedInvestment: string; expectedReturn: string }>;
  benchmarkInsight: string;
  regulatoryAlerts: string[];
  esgNarrative: string;
}

export class AiConsultantService {
  isEnabled() {
    return AI_FEATURE_ENABLED && !!process.env.ANTHROPIC_API_KEY;
  }

  async generate(diagnosisId: string): Promise<AiAnalysisContent> {
    if (!this.isEnabled()) {
      throw new Error('Consultor IA não está disponível no momento.');
    }

    const existing = await prisma.aiAnalysis.findFirst({
      where: { diagnosisId },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      return existing.content as unknown as AiAnalysisContent;
    }

    const diagnosis = await prisma.diagnosis.findUnique({
      where: { id: diagnosisId },
      include: {
        user: { select: { companyName: true, sector: true, employeesRange: true, city: true, companySize: true } },
        responses: {
          include: {
            assessmentItem: {
              include: {
                criteria: { include: { theme: { include: { pillar: true } } } },
              },
            },
          },
          orderBy: { assessmentItem: { order: 'asc' } },
        },
        actionPlans: { orderBy: { priority: 'asc' }, take: 10 },
        strategicInsights: { orderBy: { category: 'asc' } },
      },
    });

    if (!diagnosis) throw new Error('Diagnóstico não encontrado');
    if (diagnosis.status !== 'completed') throw new Error('Diagnóstico ainda não foi concluído');

    const pillarSummary = new Map<string, { name: string; scores: number[]; lowItems: string[] }>();
    for (const r of diagnosis.responses) {
      const p = r.assessmentItem.criteria.theme.pillar;
      const entry = pillarSummary.get(p.code) || { name: p.name, scores: [], lowItems: [] };
      entry.scores.push(Number(r.score));
      if (Number(r.score) <= 1) {
        entry.lowItems.push(r.assessmentItem.question);
      }
      pillarSummary.set(p.code, entry);
    }

    const pillarText = [...pillarSummary.entries()].map(([code, data]) => {
      const avg = data.scores.length > 0 ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length * 20).toFixed(1) : '0';
      const weakPoints = data.lowItems.slice(0, 5).map(q => `  - ${q}`).join('\n');
      return `**${data.name} (${code})**: Score médio ${avg}/100, ${data.scores.length} questões respondidas${weakPoints ? `\nPontos fracos:\n${weakPoints}` : ''}`;
    }).join('\n\n');

    const insightsText = diagnosis.strategicInsights.map(i =>
      `[${i.category}] ${i.title}: ${i.description}`
    ).join('\n');

    const companyInfo = diagnosis.user;
    const framework = diagnosis.framework === 'ESG_GRI' ? 'ESG+GRI' : diagnosis.framework;

    const prompt = `Você é um consultor ESG sênior com 15 anos de experiência. Analise o diagnóstico ${framework} desta empresa e gere um relatório estratégico completo.

## EMPRESA
- Nome: ${companyInfo.companyName || 'Não informado'}
- Setor: ${companyInfo.sector || 'Não informado'}
- Porte: ${companyInfo.companySize || 'Não informado'} (${companyInfo.employeesRange || '?'} funcionários)
- Cidade: ${companyInfo.city || 'Não informado'}

## SCORES
- Score Geral: ${Number(diagnosis.overallScore || 0).toFixed(1)}/100
- Framework: ${framework}

### Scores por Pilar:
${pillarText}

## INSIGHTS EXISTENTES
${insightsText || 'Nenhum insight gerado'}

## PLANOS DE AÇÃO EXISTENTES
${diagnosis.actionPlans.map(a => `[Prioridade: ${a.priority}] ${a.title}: ${a.description || ''}`).join('\n') || 'Nenhum plano'}

## INSTRUÇÕES
Responda EXCLUSIVAMENTE com um JSON válido (sem markdown, sem \`\`\`), com esta estrutura:
{
  "executiveSummary": "Parágrafo executivo de 3-4 linhas sobre a situação ESG da empresa, com tom profissional e direto",
  "strengths": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3"],
  "criticalRisks": [
    {"area": "Nome da área", "risk": "Descrição do risco", "financialImpact": "Estimativa de impacto financeiro"}
  ],
  "strategicRecommendations": [
    {"title": "Ação", "description": "O que fazer", "priority": "alta|média|baixa", "estimatedInvestment": "R$ X.XXX", "expectedReturn": "Retorno esperado"}
  ],
  "benchmarkInsight": "Comparação com empresas similares do setor, posicionamento relativo",
  "regulatoryAlerts": ["Alerta regulatório 1 relevante para o setor"],
  "esgNarrative": "Texto de 2-3 parágrafos que a empresa pode usar no relatório de sustentabilidade, LinkedIn ou proposta comercial"
}

Seja específico para o SETOR e PORTE da empresa. Use valores em reais. Cite regulamentações brasileiras (CONAMA, IBAMA, NRs, Lei 12.846, LGPD). No mínimo 3 riscos e 5 recomendações.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = message.content.find(b => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') throw new Error('Resposta da IA vazia');

    let analysis: AiAnalysisContent;
    try {
      analysis = JSON.parse(textBlock.text);
    } catch {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Resposta da IA não é JSON válido');
      analysis = JSON.parse(jsonMatch[0]);
    }

    await prisma.aiAnalysis.create({
      data: {
        diagnosisId,
        content: analysis as any,
        model: message.model,
        tokensUsed: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0),
      },
    });

    return analysis;
  }

  async getExisting(diagnosisId: string): Promise<AiAnalysisContent | null> {
    const existing = await prisma.aiAnalysis.findFirst({
      where: { diagnosisId },
      orderBy: { createdAt: 'desc' },
    });
    return existing ? (existing.content as unknown as AiAnalysisContent) : null;
  }
}
