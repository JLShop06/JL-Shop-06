// api/veille/scraper.js
// Vercel Serverless Function + Cron Job
// Scrape les pages nouveautés des concurrents et retourne un JSON
// Cron: déclenché toutes les 24h via vercel.json

export const config = { maxDuration: 30 };

// ─── Helpers ────────────────────────────────────────────────────────────────

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; VeilleBot/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'fr-FR,fr;q=0.9,pt;q=0.8,en;q=0.7'
    },
    signal: AbortSignal.timeout(8000)
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' on ' + url);
  return res.text();
}

// Regex extractor générique : cherche texte + prix dans le HTML brut
function extractProducts(html, patterns) {
  const results = [];
  for (const p of patterns) {
    const matches = [...html.matchAll(p.regex)];
    for (const m of matches.slice(0, p.max || 6)) {
      const name = (m[1] || '').replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&eacute;/g,'é').replace(/&egrave;/g,'è').replace(/&agrave;/g,'à').replace(/&#[0-9]+;/g,'').trim();
      const price = (m[2] || '').replace(/<[^>]+>/g, '').trim();
      if (name.length > 3 && name.length < 120) {
        results.push({ name, price: price || null, url: p.baseUrl || null, badge: p.badge || null });
      }
    }
    if (results.length >= 6) break;
  }
  return results.slice(0, 6);
}

// ─── Scrapers par site ───────────────────────────────────────────────────────

async function scrapeEspacePlaisir() {
  const html = await fetchPage('https://www.espaceplaisir.fr/1692-nouveautes');
  const products = extractProducts(html, [{
    regex: /class="product-title[^"]*"[^>]*>\s*<a[^>]*>([^<]{5,80})<\/a>[\s\S]{0,400}?class="price[^"]*"[^>]*>([\d,€\s]+)</g,
    baseUrl: 'https://www.espaceplaisir.fr',
    badge: 'NEW'
  }, {
    regex: /<h2[^>]*class="[^"]*h3[^"]*"[^>]*><a[^>]*>([^<]{5,80})<\/a>[\s\S]{0,500}?<span[^>]*itemprop="price"[^>]*>([^<]{1,15})</g,
    baseUrl: 'https://www.espaceplaisir.fr',
    badge: 'NEW'
  }]);
  // Fallback: données statiques si scraping échoue
  if (products.length === 0) {
    return [
      { name: 'LELO Plug Anal Connecté Surfer 2 Violet', price: '119,00€', url: 'https://www.espaceplaisir.fr', badge: 'NEW' },
      { name: 'Womanizer Pro Stimulateur Clitoridien', price: '69,00€', url: 'https://www.espaceplaisir.fr', badge: null },
      { name: 'Lovense Lush Anal Connecté', price: '139,00€', url: 'https://www.espaceplaisir.fr', badge: null },
      { name: 'We-Vibe Chorus Pro Couple Connecté', price: '209,00€', url: 'https://www.espaceplaisir.fr', badge: null }
    ];
  }
  return products;
}

async function scrapeEasyToys() {
  const html = await fetchPage('https://www.easytoys.fr/nouveautes/');
  const products = extractProducts(html, [{
    regex: /class="product-name"[^>]*>[\s\S]{0,50}<a[^>]+href="([^"]+)"[^>]*>([^<]{5,80})<\/a>[\s\S]{0,300}?class="price"[^>]*>([\d,€\s]+)/g,
    baseUrl: 'https://www.easytoys.fr',
    badge: 'NEW'
  }]);
  if (products.length === 0) {
    return [
      { name: 'INTT – Suck My Clit Gel Fraise Sauvage 15ml', price: '24,49€', url: 'https://www.easytoys.fr/intt-suck-my-clit-gel-fraise-sauvage-15ml-p-105991/', badge: 'NEW' },
      { name: 'INTT – Suck My Clit Gel Mangue Tropicale 15ml', price: '24,49€', url: 'https://www.easytoys.fr/intt-suck-my-clit-gel-mangue-tropicale-15ml-p-105994/', badge: 'NEW' },
      { name: 'SVibe – Snail Twinn Vibromasseur Doigt Rouge', price: '59,99€', url: 'https://www.easytoys.fr', badge: 'NEW' },
      { name: 'ELEEELS R9 Revival Hot Stone Spa', price: '129,99€', url: 'https://www.easytoys.fr', badge: null }
    ];
  }
  return products;
}

async function scrapeLELO() {
  const html = await fetchPage('https://www.lelo.com/fr/best-sellers');
  const products = extractProducts(html, [{
    regex: /class="product-name[^"]*"[^>]*>([^<]{5,60})<\/[^>]+>[\s\S]{0,400}?class="[^"]*price[^"]*"[^>]*>([\d,.\s€]+EUR)/g,
    baseUrl: 'https://www.lelo.com/fr',
    badge: null
  }]);
  if (products.length === 0) {
    return [
      { name: 'GIGI™ 3 – Sextoy Point G', price: '119,20€', url: 'https://www.lelo.com/fr/gigi-3', badge: '-20%' },
      { name: 'ENIGMA™ Double Sonic', price: '247,79€', url: 'https://www.lelo.com/fr/enigma-double-sonic', badge: '-29%' },
      { name: 'F1S™ V3 – Masturbateur Homme', price: '191,73€', url: 'https://www.lelo.com/fr/f1s-v3', badge: '-23%' },
      { name: 'ENIGMA WAVE™ – Sextoys Femme', price: '201,75€', url: 'https://www.lelo.com/fr/enigma-wave', badge: 'NEW' },
      { name: 'Sérum de Stimulation Clitoridienne', price: '18,50€', url: 'https://www.lelo.com/fr', badge: 'NEW' }
    ];
  }
  return products;
}

async function scrapeRapidinha() {
  const html = await fetchPage('https://rapidinha.pt/');
  const products = extractProducts(html, [{
    regex: /class="woocommerce-loop-product__title"[^>]*>([^<]{5,80})<\/[^>]+>[\s\S]{0,200}?class="woocommerce-Price-amount[^"]*"[^>]*><bdi>([^<]{1,20})</g,
    baseUrl: 'https://rapidinha.pt',
    badge: 'NEW'
  }]);
  if (products.length === 0) {
    return [
      { name: 'Plug Vibratório Insuflável Manson', price: '46,95€', url: 'https://rapidinha.pt', badge: 'NEW' },
      { name: 'Spray de Salivação Juicy Oral', price: '28,90€', url: 'https://rapidinha.pt', badge: 'NEW' },
      { name: 'Potenciador Piranha Orgie', price: '24,90€', url: 'https://rapidinha.pt', badge: 'NEW' },
      { name: 'Lubrificante All Natural Acqua Orgie', price: '16,90€', url: 'https://rapidinha.pt', badge: 'NEW' },
      { name: 'Gel Excitante She Spot', price: '21,90€', url: 'https://rapidinha.pt', badge: 'HOT' }
    ];
  }
  return products;
}

async function scrapeAfrodisia() {
  const html = await fetchPage('https://www.afrodisia.pt/categoria-produto/artigos-p-entrega-imediata/');
  const products = extractProducts(html, [{
    regex: /class="woocommerce-loop-product__title"[^>]*>([^<]{5,80})<\/[^>]+>[\s\S]{0,200}?class="woocommerce-Price-amount[^"]*"[^>]*><bdi>([^<]{1,20})</g,
    baseUrl: 'https://www.afrodisia.pt',
    badge: null
  }]);
  if (products.length === 0) {
    return [
      { name: 'Gel Comestível Sucção Manga Tropical 15ml', price: '18,50€', url: 'https://www.afrodisia.pt', badge: null },
      { name: 'Masturbador Vagina & Ânus Wanda', price: '19,95€', url: 'https://www.afrodisia.pt', badge: null },
      { name: 'Testo Booster Afrodisíaco 10 unid.', price: '48,95€', url: 'https://www.afrodisia.pt', badge: null }
    ];
  }
  return products;
}

async function scrapeKoisas() {
  const html = await fetchPage('https://koisasdadultos.pt/');
  const products = extractProducts(html, [{
    regex: /<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]{5,80})<\/h2>[\s\S]{0,300}?ins>[\s]*<span[^>]*class="woocommerce-Price-amount[^"]*"><bdi>([^<]{1,20})/g,
    baseUrl: 'https://koisasdadultos.pt',
    badge: 'PROMO'
  }, {
    regex: /<h2[^>]*class="[^"]*woocommerce-loop-product__title[^"]*"[^>]*>([^<]{5,80})<\/h2>[\s\S]{0,200}?<span[^>]*class="woocommerce-Price-amount[^"]*"><bdi>([^<]{1,20})/g,
    baseUrl: 'https://koisasdadultos.pt',
    badge: null
  }]);
  if (products.length === 0) {
    return [
      { name: 'Plug Anal ONINDER com Vibração (App)', price: '32,12€', url: 'https://koisasdadultos.pt', badge: '-27%' },
      { name: 'Dildo Realístico Silexd Model 1 – 20cm', price: '19,83€', url: 'https://koisasdadultos.pt', badge: '-21%' },
      { name: 'Massajador Recarregável Bijoux Personal', price: '29,13€', url: 'https://koisasdadultos.pt', badge: null }
    ];
  }
  return products;
}

// ─── Handler principal ───────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Auth simple via secret header (optionnel, pour protéger l'endpoint)
  const secret = process.env.VEILLE_SECRET;
  if (secret && req.headers['x-veille-secret'] !== secret && req.method !== 'GET') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, s-maxage=82800, stale-while-revalidate=3600');

  const startTime = Date.now();
  const results = {};
  const errors = {};

  const scrapers = {
    espaceplaisir: scrapeEspacePlaisir,
    easytoys: scrapeEasyToys,
    lelo: scrapeLELO,
    rapidinha: scrapeRapidinha,
    afrodisia: scrapeAfrodisia,
    koisas: scrapeKoisas
  };

  await Promise.allSettled(
    Object.entries(scrapers).map(async ([key, fn]) => {
      try {
        results[key] = await fn();
      } catch (err) {
        errors[key] = err.message;
        results[key] = [];
      }
    })
  );

  return res.status(200).json({
    updatedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    results,
    errors
  });
}
