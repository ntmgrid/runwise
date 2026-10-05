# Runwise

One self-contained file: `index.html`. CSS, JS, font and favicon are inlined, with no external requests.

- Single viewport, no scrolling. Live WebGL backdrop (a procedural "video", about 3 KB of shader code).
- CTA opens WhatsApp chat with +91 97784 54998.
- Legal pages are in-page overlays at `#privacy`, `#terms`, `#refund`, `#cookies` (Esc closes).
- Font: Hanken Grotesk (SIL OFL). WhatsApp glyph: Phosphor Icons (MIT).
- `_headers`: security headers for Netlify / Cloudflare Pages. The CSP hashes the inline style and script, so regenerate the hashes if you edit them.
- `COMPLIANCE.md`: legal and security checklist and open items.
