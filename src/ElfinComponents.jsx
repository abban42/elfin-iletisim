import {useState, useEffect} from "react";
// ================================================================
// ELFIN İLETİŞİM — EK BİLEŞENLER
// Bu dosyadaki 3 bileşeni App.jsx'e ekleyin
// ================================================================

// ───────────────────────────────────────────────────────────────
// 1. SABİT WHATSAPP BUTONU
//    App.jsx'te <ChatBot /> satırının hemen altına ekleyin:
//    <WhatsAppFloat />
// ───────────────────────────────────────────────────────────────
export function WhatsAppFloat() {
  const phone = "905326822277";
  const msg = encodeURIComponent("Merhaba, bilgi almak istiyorum.");
  return (
    <>
      <style>{`
        .wa-float{position:fixed;bottom:80px;right:20px;z-index:8888;display:flex;align-items:center;gap:9px;background:#25D366;color:#fff;border-radius:50px;padding:13px 20px;font-family:inherit;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 4px 20px rgba(37,211,102,.45);transition:all .25s;animation:waPop 2.8s infinite}
        .wa-float:hover{transform:scale(1.07);box-shadow:0 6px 28px rgba(37,211,102,.65);background:#20c05e}
        .wa-float svg{width:22px;height:22px;flex-shrink:0}
        @keyframes waPop{0%,100%{box-shadow:0 4px 20px rgba(37,211,102,.45)}50%{box-shadow:0 4px 32px rgba(37,211,102,.75)}}
        @media(max-width:480px){.wa-float span{display:none}.wa-float{padding:14px;border-radius:50%;bottom:90px}}
      `}</style>
      <a
        href={`https://wa.me/${phone}?text=${msg}`}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-float"
      >
        <svg viewBox="0 0 32 32" fill="white">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.46.638 4.77 1.753 6.775L2 30l7.42-1.738A13.94 13.94 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 0 1-5.832-1.594l-.418-.247-4.33 1.015 1.036-4.21-.273-.432A11.454 11.454 0 0 1 4.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16 22.352 27.5 16 27.5zm6.29-8.538c-.344-.172-2.035-1.004-2.35-1.118-.316-.115-.546-.172-.776.172-.23.344-.89 1.118-1.09 1.348-.2.23-.4.258-.744.086-.344-.172-1.452-.536-2.767-1.707-1.022-.913-1.712-2.04-1.913-2.384-.2-.344-.021-.53.15-.702.155-.155.344-.4.516-.603.172-.2.23-.344.344-.573.115-.23.058-.43-.029-.603-.086-.172-.776-1.87-1.063-2.56-.28-.672-.565-.58-.776-.59-.2-.01-.43-.012-.66-.012-.23 0-.603.086-.918.43-.316.344-1.205 1.177-1.205 2.87 0 1.693 1.234 3.33 1.406 3.56.172.23 2.428 3.708 5.882 5.198.822.355 1.464.567 1.964.726.825.262 1.576.225 2.17.137.662-.099 2.035-.832 2.322-1.635.287-.803.287-1.49.2-1.635-.086-.144-.316-.23-.66-.4z"/>
        </svg>
        <span>WhatsApp'tan Yazın</span>
      </a>
    </>
  );
}

// ───────────────────────────────────────────────────────────────
// 2. GÜVEN BÖLÜMİ
//    Home bileşeninin içinde, <div className="stat-grid" ...>
//    satırının hemen ÖNÜNE ekleyin:
//    <GuvenBolumu />
// ───────────────────────────────────────────────────────────────
export function GuvenBolumu() {
  const items = [
    { icon: "🏆", title: "DSN+ EXTRA Bayi", desc: "Turkcell'in en üst düzey yetkili bayi statüsü" },
    { icon: "📍", title: "Fiziksel Mağaza", desc: "Konya Zafer Meydanı'nda yüz yüze hizmet" },
    { icon: "🔒", title: "Kimliğiniz Güvende", desc: "Tüm işlemler Turkcell resmi sistemi üzerinden yapılır" },
    { icon: "⚡", title: "Aynı Gün İşlem", desc: "Numara taşıma işleminizi bugün tamamlayın" },
  ];
  return (
    <>
      <style>{`
        .guven-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:0 auto 28px;max-width:640px}
        .guven-kart{background:var(--bg2,#f8f9fc);border:1px solid var(--brd,#eee);border-radius:14px;padding:16px 12px;text-align:center;transition:box-shadow .2s}
        .guven-kart:hover{box-shadow:0 6px 20px rgba(37,59,128,.1)}
        .guven-icon{font-size:26px;margin-bottom:7px}
        .guven-title{font-size:11px;font-weight:800;color:var(--acc,#253B80);margin-bottom:4px;line-height:1.3}
        .guven-desc{font-size:9.5px;color:var(--txt2,#666);line-height:1.4}
        @media(max-width:520px){.guven-grid{grid-template-columns:repeat(2,1fr)}}
      `}</style>
      <div style={{ maxWidth: 640, margin: "0 auto 28px" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--acc,#253B80)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>
            Neden Elfin İletişim?
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--txt,#1a1a2e)" }}>
            Güvenle Tercih Edilen Turkcell Bayisi
          </div>
        </div>
        <div className="guven-grid">
          {items.map((it, i) => (
            <div key={i} className="guven-kart">
              <div className="guven-icon">{it.icon}</div>
              <div className="guven-title">{it.title}</div>
              <div className="guven-desc">{it.desc}</div>
            </div>
          ))}
        </div>
        {/* Kimlik uyarısı */}
        <div style={{ background: "linear-gradient(135deg,var(--acc,#253B80),#1a2d66)", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🪪</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 3 }}>Neden Kimlik İsteniyor?</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.8)", lineHeight: 1.5 }}>
              Numara taşıma işlemi için T.C. kimlik kartı <b>tüm operatörlerde yasal zorunluluktur.</b> Bilgileriniz yalnızca Turkcell'in resmi sistemine işlenir, üçüncü kişilerle paylaşılmaz.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ───────────────────────────────────────────────────────────────
// 3. HAT TRANSFERİ ADIM ADIM
//    Tariff sayfasının (TariffPage bileşeni) EN ÜSTÜNE ekleyin:
//    <HatTransferiAdimlar />
//    VEYA Home bileşeninde GuvenBolumu'nun hemen altına.
// ───────────────────────────────────────────────────────────────
export function HatTransferiAdimlar() {
  const steps = [
    { num: "01", icon: "💬", title: "Bize Ulaşın", desc: "WhatsApp veya telefon ile yazın. Operatörünüzü ve ihtiyaçlarınızı söyleyin.", sure: "2 dk" },
    { num: "02", icon: "📋", title: "Paket Seçimi", desc: "Size en uygun Turkcell tarifesini birlikte belirleriz. Fiyat, kapsam, avantaj hepsi netleşir.", sure: "5 dk" },
    { num: "03", icon: "📍", title: "Mağazaya Gelin", desc: "Sadece nüfus cüzdanınızla Zafer Meydanı mağazamıza gelin. Geri kalanını biz hallederiz.", sure: "10 dk" },
    { num: "04", icon: "🔄", title: "Transfer Başlatılır", desc: "Numara taşıma Turkcell sisteminde başlatılır. Mevcut numaranız korunur.", sure: "Aynı gün" },
    { num: "05", icon: "✅", title: "Hattınız Aktif!", desc: "İşlem tamamdır. Aynı numaranızla Turkcell'de kullanmaya başlarsınız.", sure: "1-4 saat" },
  ];
  return (
    <>
      <style>{`
        .adim-wrap{max-width:560px;margin:0 auto 32px;background:var(--bg,#fff);border-radius:18px;padding:20px;border:1px solid var(--brd,#eee);box-shadow:var(--sh,0 2px 10px rgba(0,0,0,.06))}
        .adim-hdr{text-align:center;margin-bottom:18px}
        .adim-item{display:flex;gap:14px;align-items:flex-start;padding-bottom:18px;position:relative}
        .adim-item:not(:last-child)::after{content:'';position:absolute;left:21px;top:50px;width:2px;bottom:0;background:linear-gradient(to bottom,var(--acc,#253B80),rgba(37,59,128,.1))}
        .adim-circle{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--acc,#253B80),#1a2d66);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;box-shadow:0 3px 12px rgba(37,59,128,.3);position:relative;z-index:1}
        .adim-body{flex:1;background:var(--bg2,#f8f9fc);border-radius:12px;padding:12px 14px}
        .adim-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
        .adim-num{font-size:10px;font-weight:800;color:var(--acc,#253B80);letter-spacing:.5px}
        .adim-sure{background:var(--acc,#253B80);color:#fff;font-size:9px;font-weight:700;padding:2px 8px;border-radius:10px}
        .adim-title{font-size:13px;font-weight:800;color:var(--txt,#1a1a2e);margin-bottom:3px}
        .adim-desc{font-size:11px;color:var(--txt2,#666);line-height:1.5}
      `}</style>
      <div className="adim-wrap">
        <div className="adim-hdr">
          <div style={{ fontSize: 10, fontWeight: 800, color: "var(--acc,#253B80)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>
            Hat Transferi
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--txt,#1a1a2e)", marginBottom: 4 }}>
            Numara Taşıma 5 Adımda
          </div>
          <div style={{ fontSize: 11, color: "var(--txt2,#666)" }}>Mevcut numaranızı koruyarak Turkcell'e geçin</div>
        </div>
        {steps.map((s, i) => (
          <div key={i} className="adim-item">
            <div className="adim-circle">{s.icon}</div>
            <div className="adim-body">
              <div className="adim-top">
                <span className="adim-num">ADIM {s.num}</span>
                <span className="adim-sure">⏱ {s.sure}</span>
              </div>
              <div className="adim-title">{s.title}</div>
              <div className="adim-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ───────────────────────────────────────────────────────────────
// 4. "SİZİ ARAYALIM" FORMU
//    Home bileşeninde, hero-btns div'inin HEMEN ALTINA ekleyin:
//    <SiziArayalim />
//
//    KURULUM: formspree.io → ücretsiz kayıt → form oluştur
//    → Form ID'yi aşağıdaki FORM_ID ile değiştirin
// ───────────────────────────────────────────────────────────────
export function SiziArayalim() {
  const FORM_ID = "mykvpzea"; // <-- formspree.io'dan aldığınız ID
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("hat-transfer");
  const [status, setStatus] = useState("idle");

  const topics = [
    { k: "hat-transfer", l: "Hat Transferi" },
    { k: "internet", l: "Ev İnterneti" },
    { k: "telefon", l: "Cihaz / Telefon" },
    { k: "diger", l: "Diğer" },
  ];

  const send = async () => {
    if (!phone || phone.length < 10) { alert("Geçerli bir telefon numarası girin."); return; }
    setStatus("loading");
    try {
      const r = await fetch(`https://formspree.io/f/${FORM_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ phone, topic }),
      });
      setStatus(r.ok ? "ok" : "err");
    } catch { setStatus("err"); }
  };

  return (
    <>
      <style>{`
        .cb-wrap{background:linear-gradient(135deg,var(--acc,#253B80),#1a2d66);border-radius:18px;padding:24px 20px;margin:20px auto;max-width:420px}
        .cb-card{background:#fff;border-radius:14px;padding:20px;margin-top:14px;box-shadow:0 12px 40px rgba(0,0,0,.2)}
        .cb-input{width:100%;border:2px solid #e8e8e8;border-radius:10px;padding:13px 14px;font-size:14px;font-family:inherit;color:#222;outline:none;transition:border .2s;box-sizing:border-box;margin-bottom:12px}
        .cb-input:focus{border-color:var(--acc,#253B80)}
        .cb-topics{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
        .cb-tbtn{border:2px solid #e8e8e8;border-radius:9px;padding:10px 6px;font-size:12px;font-weight:700;cursor:pointer;background:#fff;color:#555;transition:all .2s;font-family:inherit}
        .cb-tbtn.sel{border-color:var(--acc,#253B80);background:var(--acc,#253B80);color:#fff}
        .cb-tbtn:hover:not(.sel){border-color:var(--acc,#253B80);color:var(--acc,#253B80)}
        .cb-btn{width:100%;background:linear-gradient(135deg,var(--acc,#253B80),#1a2d66);color:#fff;border:none;border-radius:10px;padding:14px;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;transition:all .2s}
        .cb-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(37,59,128,.4)}
        .cb-btn:disabled{opacity:.6;cursor:not-allowed}
      `}</style>
      <div className="cb-wrap">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,.6)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
            📞 Ücretsiz Geri Arama
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
            Sizi <span style={{ color: "#FFD700" }}>Hemen</span> Arayalım
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>Numaranızı bırakın, 5 dakika içinde arayalım</div>
        </div>
        <div className="cb-card">
          {status === "ok" ? (
            <div style={{ textAlign: "center", padding: 8 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "var(--acc,#253B80)", marginBottom: 4 }}>Talebiniz Alındı!</div>
              <div style={{ fontSize: 12, color: "#666" }}>En kısa sürede uzmanımız sizi arayacak.</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 6 }}>Telefon Numaranız</div>
              <input
                className="cb-input"
                type="tel"
                placeholder="05XX XXX XX XX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
              <div style={{ fontSize: 11, fontWeight: 700, color: "#555", marginBottom: 8 }}>Konu Seçin</div>
              <div className="cb-topics">
                {topics.map(t => (
                  <button key={t.k} className={`cb-tbtn${topic === t.k ? " sel" : ""}`} onClick={() => setTopic(t.k)}>
                    {t.l}
                  </button>
                ))}
              </div>
              <button className="cb-btn" onClick={send} disabled={status === "loading"}>
                {status === "loading" ? "Gönderiliyor..." : "📲 Sizi Arayalım"}
              </button>
              {status === "err" && <div style={{ color: "#e74c3c", fontSize: 11, marginTop: 8, textAlign: "center" }}>Hata oluştu. WhatsApp'tan yazabilirsiniz.</div>}
              <div style={{ fontSize: 10, color: "#aaa", marginTop: 8, textAlign: "center" }}>🔒 Spam gönderilmez. Bilgileriniz güvende.</div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
