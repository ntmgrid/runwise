# Runwise — landing site

One self-contained file: `index.html` (CSS, JS, fonts and favicon inlined; no external requests).
Legal pages live inside it and open at `#privacy`, `#terms`, `#refund`, `#cookies`.

- Signup form is a **preview only: sends nothing**.
- Fonts: Inter + Fraunces, embedded, SIL Open Font License.
- `_headers`: security headers for Netlify / Cloudflare Pages. The CSP hashes the inline style/script, so **re-generate the hashes if you edit the CSS or JS**.
- `COMPLIANCE.md`: legal/security checklist and open items.
