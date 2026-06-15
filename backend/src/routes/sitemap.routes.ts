import { Router, Request, Response } from 'express';
import prisma from '../config/database';

const router = Router();
const SITE_URL = (process.env.SITE_URL || 'https://www.engreena.com.br').replace(/\/$/, '');

const EMPTY_SITEMAP =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';

// GET /api/sitemap-empresas.xml — perfis públicos de empresas
router.get('/', async (_req: Request, res: Response) => {
  res.header('Content-Type', 'application/xml; charset=utf-8');
  try {
    const users = await prisma.user.findMany({
      where: { isPublicProfile: true, slug: { not: null }, isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const urls = users
      .map((u) => {
        const lastmod = u.updatedAt.toISOString().split('T')[0];
        return `  <url>\n    <loc>${SITE_URL}/empresa/${u.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>`;
      })
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
    res.send(xml);
  } catch (error) {
    console.error('Erro ao gerar sitemap de empresas:', error);
    res.send(EMPTY_SITEMAP);
  }
});

export default router;
