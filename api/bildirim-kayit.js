// /api/bildirim-kayit.js — Vercel Serverless Function
// Supabase'e bildirim kaydı ekler
// Supabase'te "bildirim_kayitlari" tablosu oluşturulmalı:
// CREATE TABLE bildirim_kayitlari (
//   id SERIAL PRIMARY KEY,
//   name TEXT NOT NULL,
//   phone TEXT NOT NULL,
//   interest TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, phone, interest, date } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: "Ad ve telefon gerekli" });
    }

    // Telefon numarası format kontrolü
    const cleanPhone = phone.replace(/\s/g, "");
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: "Geçersiz telefon numarası" });
    }

    // Aynı telefon zaten kayıtlı mı?
    const { data: existing } = await supabase
      .from("bildirim_kayitlari")
      .select("id")
      .eq("phone", cleanPhone)
      .maybeSingle();

    if (existing) {
      // Güncelle
      await supabase
        .from("bildirim_kayitlari")
        .update({ name, interest, updated_at: new Date().toISOString() })
        .eq("phone", cleanPhone);
      return res.status(200).json({ success: true, message: "Kaydınız güncellendi" });
    }

    // Yeni kayıt
    const { error } = await supabase.from("bildirim_kayitlari").insert({
      name,
      phone: cleanPhone,
      interest: interest || null,
      created_at: date || new Date().toISOString(),
    });

    if (error) throw error;

    return res.status(200).json({ success: true, message: "Kayıt başarılı" });
  } catch (err) {
    console.error("Bildirim kayıt hatası:", err);
    return res.status(500).json({ success: false, error: "Sunucu hatası" });
  }
}
