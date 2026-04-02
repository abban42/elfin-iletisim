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

    const content = [];
    for (const img of images.slice(0, 5)) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: img.type || 'image/jpeg', data: img.data }
      });
    }

    content.push({
      type: 'text',
      text: `Bu gorsel bir Turkcell bayi tarife katalogu sayfasidir. Gorseldeki TUM tarifeleri asagidaki JSON formatinda cikar.

TURKCELL TARİFE YAPISI:
- Tarifeler kategorilere ayrilir (ornegin: Prestij, Rahat Ol, Avantaj+, GNC Avantaj+, Ilk Turkcellim, Mutlu Cocuk, Mutlu Emekli, Emek, Platinum, Data, Akilli Cocuk Saati, Mega Star, Cepte Yeni, Baslangic, Hemen, Avantajli Ekstra, Genc On Odemeli, Emektar, Mobil WiFi, Turist vb.)
- Her tarife: ad, internet (GB), dakika (DK), SMS ve aylik fiyat (TL) icerir
- "S.M" veya "SM" = Sosyal Medya bonus GB demek, toplam GB'ye dahil et
- Faturali tarifeler genelde 1 yillik taahhutlu
- On odemeli tarifeler aylik veya 3 aylik olabilir
- Bazi tarifelerin ozel sartlari var: GNC=7-26 yas, IKK=7-15 yas, EMEKLI=65+, EMEK=ciftci/ogretmen/saglik

KURALLAR:
- Gorselde gordugum HER tarife satirini JSON'a ekle, HICBIRINI ATLAMA
- Fiyatlari sayi olarak yaz (ornegin 300, 650, 1050)
- GB, DK, SMS degerlerini sayi olarak yaz
- Eger sayfada tarife yoksa (kapak sayfasi, reklam vs.) bos dizi don: {"tarifeler":[]}
- Tablolari satir satir oku, hicbir satiri atlama
- icerik alanina ornegin "5 GB + 1000 DK + 250 SMS" formatinda yaz
- Eger GB icinde sosyal medya varsa ornegin "10+10 GB (S.M) + 1000 DK + 250 SMS" yaz

tip belirle:
- "faturali" = faturali hat tarifeleri
- "onodemeli" = on odemeli / faturasiz / hazirkart tarifeleri

ikon sec (kategoriye gore):
Prestij=⭐, Rahat Ol=😌, Avantaj+=🏪, GNC=🎓, Ilk Turkcellim=👶, Mutlu Cocuk=🧒, Mutlu Emekli=🌿, Emek=🏛️, Platinum=👑, Data=📶, Saat=⌚, Mega Star=⭐, Cepte Yeni=🆕, Baslangic=🚀, Hemen=⚡, Avantajli Ekstra=💎, Emektar=🌿, Mobil WiFi=📡, Turist=✈️

renk sec:
Prestij=#7B61FF, Rahat Ol=#00B894, Avantaj+=#E17055, GNC=#E8A800, Ilk Turkcellim=#D4548A, Mutlu Cocuk=#FF8FAB, Emekli=#2E8B57, Emek=#3A7BD5, Platinum=#1a1a2e, Data=#00C3FF, Saat=#636e72, Hemen=#FF6B6B, Ekstra=#D4548A, WiFi=#636e72

SADECE asagidaki JSON formatinda cevap ver, BASKA HICBIR SEY YAZMA:
{"tarifeler":[{"ad":"Kategori Adi","sart":null,"aciklama":"Kisa aciklama","sure":"1 Yillik","tip":"faturali","ikon":"emoji","renk":"#hex","tarifeler":[{"ad":"Tarife Adi","icerik":"5 GB + 1000 DK + 250 SMS","gb":5,"dk":1000,"sms":250,"fiyat":300}]}]}`
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
    
    let tariffs = null;
    try {
      const clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      tariffs = JSON.parse(clean);
    } catch (e) {
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
