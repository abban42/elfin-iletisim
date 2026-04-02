export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  try {
    const { password, images } = req.body;
    if (password !== 'elfin2026') return res.status(401).json({ error: 'Yanlis sifre' });
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Gorsel yok' });
    }

    // Build content blocks: images + extraction prompt
    const content = [];
    for (const img of images.slice(0, 10)) { // Max 10 pages
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.type || 'image/png',
          data: img.data
        }
      });
    }

    content.push({
      type: 'text',
      text: `Bu gorsel(ler) Turkcell tarife katalogu veya tarife listesi icermektedir.
Gorseldeki TUM tarifeleri asagidaki JSON formatinda cikar.

KURALLAR:
- Her tarife kategorisi icin bir grup olustur
- Fiyatlari sayi olarak yaz (TL/ay)
- GB, DK, SMS degerlerini sayi olarak yaz
- Eger goruntude birden fazla kategori varsa hepsini cikar
- tip: "faturali" veya "onodemeli" olarak belirle
- Gorselde acikca gorunmeyen bilgileri ekleme, sadece goruneni yaz

CIKTI FORMATI (sadece JSON, baska bir sey yazma):
{
  "tarifeler": [
    {
      "ad": "Kategori Adi",
      "sart": null,
      "aciklama": "Kisa aciklama",
      "sure": "1 Yillik",
      "tip": "faturali",
      "ikon": "uygun emoji",
      "renk": "#hex renk",
      "tarifeler": [
        {
          "ad": "Tarife Adi",
          "icerik": "5 GB + 1000 DK + 250 SMS",
          "gb": 5,
          "dk": 1000,
          "sms": 250,
          "fiyat": 300
        }
      ]
    }
  ]
}

Sadece JSON ciktisi ver, aciklama veya markdown ekleme.`
    });

    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{ role: 'user', content }]
      })
    });

    if (!apiRes.ok) {
      const err = await apiRes.json().catch(() => ({}));
      return res.status(500).json({ error: 'Anthropic API hatasi: ' + (err.error?.message || apiRes.statusText) });
    }

    const apiData = await apiRes.json();
    const text = apiData.content?.[0]?.text || '';
    
    // Try to parse JSON from response
    let tariffs = null;
    try {
      // Remove any markdown code fences
      const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      tariffs = JSON.parse(clean);
    } catch (e) {
      // Try to find JSON in the text
      const match = text.match(/\{[\s\S]*"tarifeler"[\s\S]*\}/);
      if (match) {
        try { tariffs = JSON.parse(match[0]); } catch (e2) {}
      }
    }

    if (!tariffs || !tariffs.tarifeler) {
      return res.status(200).json({ 
        success: false, 
        error: 'Tarife verisi cikarilmadi. Ham cikti: ' + text.substring(0, 500),
        raw: text 
      });
    }

    return res.status(200).json({ 
      success: true, 
      tariffs: tariffs.tarifeler,
      pageCount: images.length 
    });

  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatasi: ' + err.message });
  }
}
