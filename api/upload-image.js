export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  try {
    const { password, imageData, fileName } = req.body;
    if (password !== 'elfin2026') return res.status(401).json({ error: 'Yanlis sifre' });
    if (!imageData || !fileName) return res.status(400).json({ error: 'Gorsel veya dosya adi yok' });

    // Sanitize filename
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    const targetFile = 'public/images/' + safeName;
    const REPO = 'abban42/elfin-iletisim';

    // Check if file exists (get SHA for overwrite)
    let sha = null;
    try {
      const getRes = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + targetFile, {
        headers: { Authorization: 'token ' + GITHUB_TOKEN, 'User-Agent': 'elfin' }
      });
      if (getRes.ok) { sha = (await getRes.json()).sha; }
    } catch (e) {}

    // Remove data URL prefix if present
    const base64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    const commitRes = await fetch('https://api.github.com/repos/' + REPO + '/contents/' + targetFile, {
      method: 'PUT',
      headers: { Authorization: 'token ' + GITHUB_TOKEN, 'Content-Type': 'application/json', 'User-Agent': 'elfin' },
      body: JSON.stringify({
        message: 'Gorsel yukleme: ' + safeName,
        content: base64,
        sha: sha,
        branch: 'main'
      })
    });

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return res.status(500).json({ error: 'GitHub hatasi: ' + (err.message || 'Bilinmeyen') });
    }

    return res.status(200).json({
      success: true,
      url: '/images/' + safeName,
      message: safeName + ' yuklendi! ~30sn icinde aktif.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatasi: ' + err.message });
  }
}
