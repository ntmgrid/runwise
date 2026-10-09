# Backend for "Let Runwise text you"

Not deployed yet. The website runs in preview mode (nothing is sent) until an endpoint is set.

## What this does
1. Website posts the visitor's WhatsApp number and consent to `lead`.
2. `lead` validates it, rate-limits by hashed IP, stores it (`schema.sql`), and sends the first WhatsApp message with the Meta WhatsApp Cloud API.

## What you need first
- A Meta Business account with the WhatsApp Cloud API set up and a number connected.
- An approved message template (business-initiated chats must start with one). Put its name in `WA_TEMPLATE`.
- A permanent access token and the phone number ID.
- A Supabase project (free tier is fine).

## Deploy (Supabase)
1. Run `schema.sql` in the SQL editor.
2. Set secrets: `ALLOWED_ORIGIN` (your site, for example `https://runwise.in`), `IP_SALT` (any long random text), `WA_TOKEN`, `WA_PHONE_ID`, `WA_TEMPLATE`, `WA_LANG`.
3. Deploy `supabase/functions/lead`.
4. Give the function URL (`https://<project>.supabase.co/functions/v1/lead`) to whoever builds the site, and they rebuild `index.html` with it. The site's security policy then allows only that address.

## Not included yet
- The AI that replies after the first message (needs a WhatsApp webhook plus an AI model).
- This function has not been run yet. Test it with a number you own before launch.
