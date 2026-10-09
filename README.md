# Runwise

One self-contained file: `index.html`. CSS, JS, font and favicon are inlined, with no external requests.

- Single viewport, no scrolling. Live WebGL backdrop (a procedural "video", about 3 KB of shader code).
- "Chat with Runwise" opens a prompt that collects the visitor's WhatsApp number and a one-time consent tick. It is in **preview mode** (sends nothing) until a backend endpoint is built in. Backend code is in `backend/`.
- Header has a Solutions dropdown. First entry: Founders (features and plans).
- Legal pages are in-page overlays at `#privacy`, `#terms`, `#refund`, `#cookies` (Esc closes).
- Font: Hanken Grotesk (SIL OFL). WhatsApp glyph: Phosphor Icons (MIT).
- `_headers`: security headers for Netlify / Cloudflare Pages. The CSP hashes the inline style and script, so regenerate the hashes if you edit them.
- `COMPLIANCE.md`: legal and security checklist and open items.
