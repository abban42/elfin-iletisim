// api/market-prices.js — Vercel Serverless Function
// yigitech.com/liste/ sayfasından güncel piyasa fiyatlarını çeker
// Cache: 30 dakika (her ziyarette çekmemek için)

let cache = null;
let cacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 dakika

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');

  // Cache geçerliyse döndür
  if (cache && Date.now() - cacheTime < CACHE_TTL) {
    return res.json(cache);
  }

  try {
    const response = await fetch('https://yigitech.com/liste/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
        'Referer': 'https://yigitech.com/',
      },
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`yigitech.com yanıt vermedi: ${response.status}`);
    }

    const html = await response.text();
    const items = parseYigitech(html);

    if (items.length === 0) {
      throw new Error('Sayfa parse edilemedi veya ürün bulunamadı');
    }

    cache = {
      items,
      updated: new Date().toLocaleTimeString('tr-TR'),
      count: items.length,
    };
    cacheTime = Date.now();

    return res.json(cache);
  } catch (err) {
    console.error('[market-prices]', err.message);
    // Cache varsa eskiyi döndür
    if (cache) {
      return res.json({ ...cache, stale: true });
    }
    return res.status(500).json({ error: err.message, items: [] });
  }
}

/**
 * yigitech.com HTML'ini parse eder
 * Sayfa formatına göre hem tablo hem de liste yapısını destekler
 */
function parseYigitech(html) {
  const items = [];

  // --- YÖNTEM 1: <table> tabanlı yapı ---
  const tableMatch = html.match(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  if (tableMatch) {
    for (const table of tableMatch) {
      // Header satırından sütun isimlerini al
      const headerMatch = table.match(/<thead[^>]*>([\s\S]*?)<\/thead>/i);
      const headers = [];
      if (headerMatch) {
        const ths = headerMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/gi) || [];
        ths.forEach(th => headers.push(stripTags(th).trim().toLowerCase()));
      }

      // Sütun indekslerini bul
      const modelIdx = headers.findIndex(h => h.includes('model') || h.includes('ürün') || h.includes('cihaz'));
      const nakitIdx = headers.findIndex(h => h.includes('nakit') || h.includes('peşin'));
      const kartIdx  = headers.findIndex(h => h.includes('kart') || h.includes('kredi'));

      // Satırları işle
      const rows = table.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
      for (const row of rows) {
        if (row.includes('<th'))continue; // header satırını atla
        const cells = (row.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || []).map(td => stripTags(td).trim());
        if (cells.length < 2) continue;

        const modelRaw = cells[modelIdx >= 0 ? modelIdx : 0];
        if (!modelRaw || modelRaw.length < 3) continue;

        const parsed = parseModelString(modelRaw);
        if (!parsed) continue;

        const nakitStr = cells[nakitIdx >= 0 ? nakitIdx : (cells.length > 1 ? 1 : 0)];
        const kartStr  = cells[kartIdx  >= 0 ? kartIdx  : (cells.length > 2 ? 2 : -1)];

        const priceNakit = parsePrice(nakitStr);
        const priceKart  = kartStr ? parsePrice(kartStr) : 0;

        if (priceNakit < 1000) continue; // anlamsız değerleri at

        items.push({
          brand:      parsed.brand,
          model:      parsed.model,
          category:   parsed.category,
          priceNakit,
          priceKart: priceKart || priceNakit,
          price:     priceNakit,
        });
      }
    }
  }

  // --- YÖNTEM 2: Liste / div tabanlı yapı ---
  if (items.length === 0) {
    // Fiyat içeren satırları bul: "APPLE IPHONE 16 ... 55.000 TL"
    const lineRe = /([A-ZÇĞİÖŞÜa-zçğışöşü0-9 ]+?)\s+([\d\.]+)\s*[Tt][Ll]/g;
    let m;
    while ((m = lineRe.exec(html)) !== null) {
      const modelRaw = m[1].trim();
      const priceNakit = parsePrice(m[2]);
      if (priceNakit < 1000 || modelRaw.length < 5) continue;
      const parsed = parseModelString(modelRaw);
      if (!parsed) continue;
      items.push({
        brand:      parsed.brand,
        model:      parsed.model,
        category:   parsed.category,
        priceNakit,
        priceKart: priceNakit,
        price:     priceNakit,
      });
    }
  }

  // Deduplicate by model
  const seen = new Set();
  return items.filter(it => {
    const key = `${it.brand}|${it.model}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Model stringinden marka + model + kategori parse et */
function parseModelString(raw) {
  if (!raw || raw.length < 3) return null;
  const s = raw.toUpperCase().replace(/\s+/g, ' ').trim();

  // Bilinen markalar
  const brands = [
    'APPLE','SAMSUNG','XIAOMI','HUAWEI','OPPO','VIVO','REALME','NOKIA',
    'GOOGLE','SONY','ONEPLUS','ASUS','LENOVO','CASPER','GENERAL MOBILE',
    'TECNO','INFINIX','NUBIA','OMIX','TCL','PHILIPS','HIKING','CMF BY NOTHING',
  ];

  let brand = '';
  let rest  = s;
  for (const b of brands) {
    if (s.startsWith(b)) { brand = b; rest = s.slice(b.length).trim(); break; }
  }
  if (!brand) {
    // İlk kelimeyi marka say
    const firstSpace = s.indexOf(' ');
    if (firstSpace < 1) return null;
    brand = s.slice(0, firstSpace);
    rest  = s.slice(firstSpace + 1).trim();
  }

  // Kategori tespiti
  let category = 'Telefon';
  if (/\bIPAD\b|\bTABLET\b|\bTAB\b/.test(s)) category = 'Tablet';
  else if (/\bMACBOOK\b|\bNOTEBOOK\b|\bLAPTOP\b/.test(s)) category = 'Notebook';
  else if (/\bWATCH\b|\bSAAT\b/.test(s)) category = 'Aksesuar';

  const model = toTitleCase(brand) + ' ' + toTitleCase(rest);
  return { brand: toTitleCase(brand), model: toTitleCase(rest), fullModel: model, category };
}

function parsePrice(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
}

function toTitleCase(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
}
