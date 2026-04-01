export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  try {
    const { password, devices } = req.body;
    if (password !== 'elfin2026') return res.status(401).json({ error: 'Yanlis sifre' });
    if (!devices) return res.status(400).json({ error: 'Veri yok' });

    const REPO = 'abban42/elfin-iletisim';
    const FILE_PATH = 'public/devices.json';

    // Get current file SHA (needed for update)
    let sha = null;
    try {
      const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'elfin' }
      });
      if (getRes.ok) { sha = (await getRes.json()).sha; }
    } catch (e) {}

    // Commit devices.json to GitHub
    const jsonStr = JSON.stringify({ ...devices, _updated: new Date().toISOString() });
    const content = Buffer.from(jsonStr).toString('base64');
    
    const commitRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      method: 'PUT',
      headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'elfin' },
      body: JSON.stringify({
        message: `Cihaz guncelleme - ${new Date().toLocaleDateString('tr-TR')} - ${devices.telefon?.length||0} tel, ${devices.tablet?.length||0} tab, ${devices.notebook?.length||0} nb, ${devices.aksesuar?.length||0} aks`,
        content, sha, branch: 'main'
      })
    });

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return res.status(500).json({ error: 'GitHub commit hatasi: ' + (err.message || 'Bilinmeyen hata') });
    }

    const result = await commitRes.json();
    return res.status(200).json({
      success: true,
      message: `Cihaz verileri guncellendi! ${devices.telefon?.length||0} telefon, ${devices.tablet?.length||0} tablet, ${devices.notebook?.length||0} notebook, ${devices.aksesuar?.length||0} aksesuar. Site ~30 sn icinde guncellenecek.`,
      commit: result.commit?.sha?.substring(0, 7)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatasi: ' + err.message });
  }
}
