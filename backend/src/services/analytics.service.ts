import prisma from '../config/database';

export class AnalyticsService {
  /**
   * Registra um page view
   */
  async trackPageView(data: {
    path: string;
    userId?: string;
    sessionId: string;
    referrer?: string;
    userAgent?: string;
    ip?: string;
  }) {
    return prisma.pageView.create({ data });
  }

  /**
   * Métricas de acesso para o admin
   */
  async getAccessMetrics(dateFrom: Date, dateTo: Date) {
    const [
      totalViews,
      uniqueSessions,
      uniqueUsers,
      viewsByDay,
      topPages,
      topReferrers,
      viewsByHour,
    ] = await Promise.all([
      // Total de page views no período
      prisma.pageView.count({
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
      }),

      // Sessões únicas
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
      }).then(r => r.length),

      // Usuários únicos (logados)
      prisma.pageView.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: dateFrom, lte: dateTo },
          userId: { not: null },
        },
      }).then(r => r.length),

      // Views por dia
      prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT DATE(created_at) as date, COUNT(*)::bigint as count
        FROM page_views
        WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,

      // Páginas mais visitadas
      prisma.$queryRaw<{ path: string; count: bigint }[]>`
        SELECT path, COUNT(*)::bigint as count
        FROM page_views
        WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}
        GROUP BY path
        ORDER BY count DESC
        LIMIT 10
      `,

      // Top referrers
      prisma.$queryRaw<{ referrer: string; count: bigint }[]>`
        SELECT referrer, COUNT(*)::bigint as count
        FROM page_views
        WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}
          AND referrer IS NOT NULL AND referrer != ''
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 10
      `,

      // Views por hora (para gráfico de atividade)
      prisma.$queryRaw<{ hour: number; count: bigint }[]>`
        SELECT EXTRACT(HOUR FROM created_at)::int as hour, COUNT(*)::bigint as count
        FROM page_views
        WHERE created_at >= ${dateFrom} AND created_at <= ${dateTo}
        GROUP BY hour
        ORDER BY hour ASC
      `,
    ]);

    // Métricas de hoje
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const [todayViews, activeNow] = await Promise.all([
      prisma.pageView.count({
        where: { createdAt: { gte: todayStart } },
      }),
      // Usuários ativos nos últimos 5 min
      prisma.pageView.groupBy({
        by: ['sessionId'],
        where: {
          createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        },
      }).then(r => r.length),
    ]);

    // Calcular média de páginas por sessão
    const avgPagesPerSession = uniqueSessions > 0
      ? Math.round((totalViews / uniqueSessions) * 10) / 10
      : 0;

    return {
      summary: {
        totalViews,
        uniqueSessions,
        uniqueUsers,
        todayViews,
        activeNow,
        avgPagesPerSession,
      },
      viewsByDay: viewsByDay.map(d => ({
        date: String(d.date).split('T')[0],
        count: Number(d.count),
      })),
      topPages: topPages.map(p => ({
        path: p.path,
        count: Number(p.count),
      })),
      topReferrers: topReferrers.map(r => ({
        referrer: r.referrer,
        count: Number(r.count),
      })),
      viewsByHour: viewsByHour.map(h => ({
        hour: h.hour,
        count: Number(h.count),
      })),
    };
  }
}
