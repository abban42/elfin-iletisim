export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) return res.status(500).json({ error: 'GITHUB_TOKEN not configured' });

  try {
    const { password, file, data, message } = req.body;
    if (password !== 'elfin2026') return res.status(401).json({ error: 'Yanlis sifre' });

    // Legacy support: if "devices" field exists, treat as old devices upload
    const devices = req.body.devices;
    const targetFile = file || 'public/devices.json';
    const targetData = data || (devices ? { ...devices, _updated: new Date().toISOString() } : null);
    
    if (!targetData) return res.status(400).json({ error: 'Veri yok' });

    // Allowed files whitelist
    const ALLOWED = ['public/devices.json', 'public/promos.json', 'public/chatbot_kb_extra.json', 'public/chatbot_kb_main.json', 'public/tariffs_custom.json', 'public/banners.json', 'public/evinternet_docs.json', 'public/evinternet_tariffs.json'];
    if (!ALLOWED.includes(targetFile)) return res.status(400).json({ error: 'Gecersiz dosya: ' + targetFile });

    const REPO = 'abban42/elfin-iletisim';

    // Get current file SHA (needed for update)
    let sha = null;
    try {
      const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${targetFile}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'elfin' }
      });
      if (getRes.ok) { sha = (await getRes.json()).sha; }
    } catch (e) {}

    // Build commit message
    let commitMsg = message || `${targetFile} guncellendi - ${new Date().toLocaleDateString('tr-TR')}`;
    
    // Legacy: devices commit message
    if (devices && !message) {
      commitMsg = `Cihaz guncelleme - ${new Date().toLocaleDateString('tr-TR')} - ${devices.telefon?.length||0} tel, ${devices.tablet?.length||0} tab, ${devices.notebook?.length||0} nb, ${devices.aksesuar?.length||0} aks`;
    }

    const jsonStr = JSON.stringify(targetData);
    const content = Buffer.from(jsonStr).toString('base64');
    
    const commitRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${targetFile}`, {
      method: 'PUT',
      headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'elfin' },
      body: JSON.stringify({ message: commitMsg, content, sha, branch: 'main' })
    });

    if (!commitRes.ok) {
      const err = await commitRes.json();
      return res.status(500).json({ error: 'GitHub commit hatasi: ' + (err.message || 'Bilinmeyen hata') });
    }

    const result = await commitRes.json();
    
    // Legacy response for devices
    if (devices) {
      return res.status(200).json({
        success: true,
        message: `Cihaz verileri guncellendi! ${devices.telefon?.length||0} telefon, ${devices.tablet?.length||0} tablet, ${devices.notebook?.length||0} notebook, ${devices.aksesuar?.length||0} aksesuar. Site ~30 sn icinde guncellenecek.`,
        commit: result.commit?.sha?.substring(0, 7)
      });
    }

    return res.status(200).json({
      success: true,
      message: `${targetFile} basariyla guncellendi! Site ~30 sn icinde guncellenecek.`,
      commit: result.commit?.sha?.substring(0, 7)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatasi: ' + err.message });
  }
}
