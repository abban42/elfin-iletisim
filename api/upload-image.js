export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password, imageData, fileName } = req.body;
  if (password !== "elfin2026") return res.status(401).json({ error: "Yetkisiz erişim" });
  if (!imageData || !fileName) return res.status(400).json({ error: "Eksik parametre" });

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO = process.env.GITHUB_REPO || "abban42/elfin-iletisim";
  const BRANCH = process.env.GITHUB_BRANCH || "main";

  // Sadece base64 verisi al (data:image/... başlığını kaldır)
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
  const filePath = `public/banners/${fileName}`;

  try {
    // Dosya zaten var mı kontrol et (SHA gerekli)
    let sha = undefined;
    const checkRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`,
      { headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json" } }
    );
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }

    // Dosyayı yükle
    const uploadRes = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${filePath}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Banner resmi: ${fileName}`,
          content: base64Data,
          branch: BRANCH,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.json();
      return res.status(500).json({ error: err.message || "GitHub yükleme hatası" });
    }

    // Public URL'i döndür
    const publicUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${filePath}`;
    return res.status(200).json({ success: true, url: publicUrl });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
