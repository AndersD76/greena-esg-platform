import Anthropic from '@anthropic-ai/sdk';
import prisma from '../config/database';

const AI_FEATURE_ENABLED = true;

const anthropic = new Anthropic();

export class AiChatService {
  isEnabled() {
    return AI_FEATURE_ENABLED && !!process.env.ANTHROPIC_API_KEY;
  }

  private async buildSystemPrompt(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true, companyName: true, sector: true, city: true,
        companySize: true, employeesRange: true, esgPainPoint: true,
      },
    });

    const diagnoses = await prisma.diagnosis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true, status: true, framework: true, overallScore: true,
        environmentalScore: true, socialScore: true, governanceScore: true,
        completedAt: true, createdAt: true,
      },
    });

    const latestCompleted = diagnoses.find(d => d.status === 'completed');
    let actionPlanStatus = '';
    let insightsSummary = '';

    if (latestCompleted) {
      const actions = await prisma.actionPlan.findMany({
        where: { diagnosisId: latestCompleted.id },
        orderBy: { priority: 'asc' },
        take: 10,
      });
      const pending = actions.filter(a => a.status === 'pending').length;
      const inProgress = actions.filter(a => a.status === 'in_progress').length;
      const completed = actions.filter(a => a.status === 'completed').length;
      actionPlanStatus = `Plano de ação: ${actions.length} ações total (${pending} pendentes, ${inProgress} em andamento, ${completed} concluídas).\nAções pendentes:\n${actions.filter(a => a.status !== 'completed').slice(0, 5).map(a => `- [${a.priority}] ${a.title}`).join('\n')}`;

      const insights = await prisma.strategicInsight.findMany({
        where: { diagnosisId: latestCompleted.id },
        take: 5,
      });
      insightsSummary = insights.map(i => `[${i.category}] ${i.title}`).join('\n');
    }

    const inProgress = diagnoses.find(d => d.status === 'in_progress');
    let progressInfo = '';
    if (inProgress) {
      const total = await prisma.assessmentItem.count({
        where: { criteria: { theme: { pillar: { framework: inProgress.framework === 'ESG_GRI' ? undefined : inProgress.framework } } } },
      });
      const answered = await prisma.response.count({ where: { diagnosisId: inProgress.id } });
      progressInfo = `Diagnóstico ${inProgress.framework} em andamento: ${answered}/${total} questões respondidas (${total > 0 ? ((answered / total) * 100).toFixed(0) : 0}%)`;
    }

    const firstName = user?.name?.split(' ')[0] || 'usuário';
    const now = new Date();
    const hour = now.getHours() - 3; // BRT
    const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

    return `Você é a consultora ESG da plataforma engreena. Seu nome é **Gaia**. Você é especialista em ESG, GRI, sustentabilidade corporativa e regulamentação brasileira.

## PERSONALIDADE
- Profissional mas acolhedora, como uma consultora sênior que se preocupa com o cliente
- Direta e prática — dá orientações acionáveis, não teoria genérica
- Usa dados reais do diagnóstico do cliente nas respostas
- Cobra progresso com gentileza: "Vi que a ação X ainda está pendente, precisa de ajuda?"
- Celebra conquistas: "Parabéns pelo score de 56 em Ambiental, acima da média do setor!"
- Responde em pt-BR, tom profissional mas próximo
- Usa emojis com moderação (1-2 por mensagem no máximo)

## CONTEXTO DO CLIENTE
- Nome: ${user?.name || 'Não informado'}
- Empresa: ${user?.companyName || 'Não informada'}
- Setor: ${user?.sector || 'Não informado'}
- Porte: ${user?.companySize || 'Não informado'} (${user?.employeesRange || '?'} funcionários)
- Cidade: ${user?.city || 'Não informada'}
- Maior dor ESG: ${user?.esgPainPoint || 'Não informada'}

## DIAGNÓSTICOS
${diagnoses.length === 0 ? 'Nenhum diagnóstico realizado ainda.' :
  diagnoses.map(d => {
    const fw = d.framework === 'ESG_GRI' ? 'ESG+GRI' : d.framework;
    if (d.status === 'completed') {
      return `✅ ${fw} concluído em ${new Date(d.completedAt!).toLocaleDateString('pt-BR')} — Score: ${Number(d.overallScore).toFixed(0)}/100 (E:${Number(d.environmentalScore).toFixed(0)} S:${Number(d.socialScore).toFixed(0)} G:${Number(d.governanceScore).toFixed(0)})`;
    }
    return `🔄 ${fw} em andamento (iniciado ${new Date(d.createdAt).toLocaleDateString('pt-BR')})`;
  }).join('\n')
}
${progressInfo ? `\n${progressInfo}` : ''}

## PLANO DE AÇÃO
${actionPlanStatus || 'Sem plano de ação ainda.'}

## INSIGHTS
${insightsSummary || 'Sem insights ainda.'}

## SAUDAÇÃO INICIAL
Quando for a primeira mensagem da conversa (histórico vazio), cumprimente o cliente pelo primeiro nome ("${greeting}, ${firstName}!") e dê um resumo rápido do status atual — se tem diagnóstico, como estão os scores, se tem ações pendentes. Se não tem diagnóstico, incentive a começar.

## REGRAS
- NUNCA invente dados. Use apenas os dados acima. Se não sabe, diga "não tenho essa informação no seu perfil".
- Pode orientar sobre: ESG, GRI, ODS, LGPD, regulamentação ambiental brasileira (CONAMA, IBAMA, NRs), certificações, relatórios de sustentabilidade, linhas de crédito verde.
- Se o cliente perguntar sobre funcionalidades do app, oriente sobre as páginas: Dashboard, Questionário, Resultados, Relatórios, Planos de Ação, Certificado.
- Mantenha respostas concisas (2-4 parágrafos máximo). Para temas complexos, ofereça aprofundar.
- Se o cliente não tem diagnóstico concluído, incentive a finalizar. Se tem ações pendentes, pergunte sobre o progresso.`;
  }

  async sendMessage(userId: string, userMessage: string): Promise<string> {
    if (!this.isEnabled()) throw new Error('Consultor IA não disponível.');

    await prisma.aiChatMessage.create({
      data: { userId, role: 'user', content: userMessage },
    });

    const history = await prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    const systemPrompt = await this.buildSystemPrompt(userId);

    const messages = history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const textBlock = response.content.find(b => b.type === 'text');
    const assistantMessage = textBlock && textBlock.type === 'text' ? textBlock.text : 'Desculpe, não consegui processar sua mensagem.';

    await prisma.aiChatMessage.create({
      data: { userId, role: 'assistant', content: assistantMessage },
    });

    return assistantMessage;
  }

  async getHistory(userId: string) {
    return prisma.aiChatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: { id: true, role: true, content: true, createdAt: true },
    });
  }

  async getGreeting(userId: string): Promise<string> {
    if (!this.isEnabled()) throw new Error('Consultor IA não disponível.');

    const existing = await prisma.aiChatMessage.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      const hoursSince = (Date.now() - existing.createdAt.getTime()) / 3600000;
      if (hoursSince < 4) {
        return '';
      }
    }

    const systemPrompt = await this.buildSystemPrompt(userId);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: 'Inicie a conversa me cumprimentando e dando um resumo do meu status ESG atual.' }],
    });

    const textBlock = response.content.find(b => b.type === 'text');
    const greeting = textBlock && textBlock.type === 'text' ? textBlock.text : '';

    if (greeting) {
      await prisma.aiChatMessage.create({
        data: { userId, role: 'user', content: '[Início de sessão]' },
      });
      await prisma.aiChatMessage.create({
        data: { userId, role: 'assistant', content: greeting },
      });
    }

    return greeting;
  }
}
