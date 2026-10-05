# Compliance & security checklist

Not legal advice. Have an Indian lawyer review before launch.

## Done in this build
- Privacy, Terms, Refund, Cookie pages as overlays; 18+ and Terms/Privacy consent shown next to the WhatsApp button.
- Cookie notice; only essential storage used; analytics hook loads only after consent (`loadOptional` in `index.html`).
- Fonts self-hosted (OFL: Bricolage Grotesque, Instrument Sans, IBM Plex Mono); no Google requests. No session replay, no third-party embeds, no analytics.
- No testimonials, logos or fake reviews; sample figures are labelled "Sample data"; third-party trademark disclaimer in footer.
- Pricing and signup form removed from the page for the one-screen design; Terms still describe plans. Update Terms §5 when pricing is shown elsewhere.
- Accessibility: skip link, labels, visible focus, keyboard-friendly form, aria-live messages, reduced-motion, high contrast text.
- Security: strict CSP (inline code allowed only by hash), headers in `_headers`, honeypot field, `.gitignore` for secrets, no secrets in repo.

## You must fill in / decide
1. Legal entity name, registered address, GSTIN/CIN (footer + policies) — highlighted placeholders.
2. Grievance Officer name (IT Rules 2021 / DPDP Act).
3. Refund windows, GST inclusive/exclusive, jurisdiction city, retention periods.
4. Sub-processors list (WhatsApp/Meta, hosting, AI provider, payment gateway).
5. **Age gate is 18+, not 13+**: Indian minors can't contract, and the DPDP Act treats under-18s as children (verifiable parental consent). Change only with legal advice.
6. WhatsApp Business API: Meta requires opt-in and approved message templates; users must consent before we message them.
7. Investor / CA updates sent on a founder's behalf: Terms make the founder responsible; keep an audit log.
8. Recurring payments: RBI e-mandate rules (pre-debit notification, limits) — confirm with the gateway.
9. Trademark: check "Runwise" availability (Class 9/42) before spending on brand.
10. DMCA agent (US only): register at copyright.gov/dmca-directory ($6) if you serve US users, then list the agent in Terms §10.
11. Marketing emails: unsubscribe link + postal address in every email (CAN-SPAM / good practice; India: TRAI/DPDP for messages).
12. Scraping competitor/news data: use licensed APIs or RSS; respect site ToS and copyright (summarise + link, don't republish).

## Backend security checklist (when the form/API is built)
- Secrets only in env vars/secret manager; rotate if ever committed (`git log -p | grep -i key`).
- Server-side validation + output escaping (XSS), parameterised queries, rate limiting on form/API, CAPTCHA if abused.
- CORS: allow only your own origin. Auth + authorisation on every admin route; MFA for admin.
- Passwords (if any): argon2id/bcrypt. Encrypt connected-tool OAuth tokens at rest.
- Database: no public access, least-privilege roles, backups. Debug off in production.
- `npm audit` / Dependabot; remove unused packages; secret scanning (gitleaks) in CI.
