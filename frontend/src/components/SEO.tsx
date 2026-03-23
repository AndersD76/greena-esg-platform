import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.engreena.com.br';
const DEFAULT_TITLE = 'engreena - Soluções em Sustentabilidade';
const DEFAULT_DESCRIPTION = 'Plataforma de diagnóstico ESG completo para empresas. Avalie práticas ambientais, sociais e de governança com certificação, plano de ação e consultoria especializada.';
const DEFAULT_IMAGE = `${SITE_URL}/images/assets/logo-engreena.png`;

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
}

export function SEO({ title, description, image, url, type = 'website', noindex = false }: SEOProps) {
  const fullTitle = title ? `${title} | engreena` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESCRIPTION;
  const img = image || DEFAULT_IMAGE;
  const canonical = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="engreena" />
      <meta property="og:locale" content="pt_BR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
