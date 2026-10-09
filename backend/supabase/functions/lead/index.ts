// Supabase Edge Function: POST /functions/v1/lead
// Receives { phone, consent, consentVersion, source } from the website, stores it,
// and sends the first WhatsApp message through the Meta WhatsApp Cloud API.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "";          // e.g. https://runwise.in (no trailing slash)
const IP_SALT = Deno.env.get("IP_SALT") ?? "change-me";
const WA_TOKEN = Deno.env.get("WA_TOKEN");                            // permanent access token from Meta
const WA_PHONE_ID = Deno.env.get("WA_PHONE_ID");                      // WhatsApp phone number ID
const WA_TEMPLATE = Deno.env.get("WA_TEMPLATE") ?? "hello_world";     // approved template name
const WA_LANG = Deno.env.get("WA_LANG") ?? "en_US";
const MAX_PER_10_MIN = 5;

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const cors = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ ok: false }, 405);
  if (!ALLOWED_ORIGIN || req.headers.get("origin") !== ALLOWED_ORIGIN) return json({ ok: false }, 403);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ ok: false }, 400); }

  const phone = String(body.phone ?? "");
  if (!/^\+\d{8,15}$/.test(phone) || body.consent !== true) return json({ ok: false }, 400);

  // Rate limit per (salted, hashed) IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ipHash = await sha256(ip + IP_SALT);
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await db.from("lead_attempts").select("*", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since);
  if ((count ?? 0) >= MAX_PER_10_MIN) return json({ ok: false }, 429);
  await db.from("lead_attempts").insert({ ip_hash: ipHash });

  // Store (a repeat number is not messaged twice, and the response is the same to avoid number enumeration)
  const { data: row, error } = await db.from("leads").insert({
    phone,
    consent: true,
    consent_version: String(body.consentVersion ?? "unknown").slice(0, 32),
    source: String(body.source ?? "").slice(0, 32),
    ip_hash: ipHash,
    user_agent: (req.headers.get("user-agent") ?? "").slice(0, 300),
  }).select("id").single();
  if (error) return json({ ok: true });           // duplicate number: nothing more to do

  // First WhatsApp message (business-initiated messages must use an approved template)
  if (WA_TOKEN && WA_PHONE_ID) {
    try {
      const r = await fetch(`https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone.slice(1),
          type: "template",
          template: { name: WA_TEMPLATE, language: { code: WA_LANG } },
        }),
      });
      const out = await r.json().catch(() => ({}));
      await db.from("leads").update({
        wa_status: r.ok ? "sent" : "failed",
        wa_message_id: out?.messages?.[0]?.id ?? null,
      }).eq("id", row.id);
    } catch {
      await db.from("leads").update({ wa_status: "failed" }).eq("id", row.id);
    }
  } else {
    await db.from("leads").update({ wa_status: "skipped" }).eq("id", row.id);
  }
  return json({ ok: true });
});
