# Ads by Se7enInc

Standalone ad management and delivery service for Maine News and future sites.

## What it does

- Admins create structured ads with media, advertiser info, CTA, priority, site rules, and placement rules.
- Client sites install one script tag.
- The script automatically inserts ad slots into strategic page positions when no manual slots exist.
- Delivery uses eligibility filters plus weighted randomness, so higher-priority ads appear more often without making lower-priority ads impossible.
- Impression and click counts are tracked through `/api/events`.
- Uploaded media is stored in Neon as base64 and served through `/api/media/:id` with long-lived cache headers.
- Resend emails notify the configured admin when ads are created, updated, paused, activated, deleted, or hit their impression limit.

## Environment

Copy `.env.example` to `.env.local` and fill these values:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
CUSTOM_ADS_ADMIN_USERNAME="admin"
CUSTOM_ADS_ADMIN_PASSWORD="change-this-password"
CUSTOM_ADS_AUTH_SECRET="use-a-long-random-secret"
NEXT_PUBLIC_ADS_SERVICE_URL="https://ads.yourdomain.com"
RESEND_API_KEY="re_..."
ADS_NOTIFICATION_EMAILS="admin@example.com,ops@example.com"
ADS_FROM_EMAIL="Ads by Se7enInc <ads@yourdomain.com>"
```

`DATABASE_URL` is required at runtime. The service creates its Neon table automatically as `custom_ads_ads`.

`CUSTOM_ADS_ADMIN_USERNAME` and `CUSTOM_ADS_ADMIN_PASSWORD` protect `/admin` and `/api/admin/*` through the designed `/login` page. If `CUSTOM_ADS_ADMIN_PASSWORD` is missing, local auth is disabled. `CUSTOM_ADS_AUTH_SECRET` signs the HTTP-only session cookie; set it to a long random value in production.

`RESEND_API_KEY` and `ADS_NOTIFICATION_EMAILS` are optional for local development. If either is missing, emails are skipped. `ADS_NOTIFICATION_EMAILS` accepts comma, semicolon, or newline-separated addresses. `ADS_NOTIFICATION_EMAIL` is still supported as a single-recipient fallback.

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/admin`.

To protect the admin surface:

```bash
CUSTOM_ADS_ADMIN_USERNAME=admin CUSTOM_ADS_ADMIN_PASSWORD=change-me pnpm dev
```

Visit `/login` and sign in with `CUSTOM_ADS_ADMIN_USERNAME` and `CUSTOM_ADS_ADMIN_PASSWORD`.

## Embed

Add this to a site:

```html
<script async src="https://ads.example.com/widget.js" data-site="maine-news"></script>
```

Optional controls:

```html
<script
  async
  src="https://ads.example.com/widget.js"
  data-site="maine-news"
  data-max-slots="4"
  data-allowed-paths="/article/*,/latest/*"
  data-blocked-paths="/admin/*,/privacy/*"
></script>
```

`data-allowed-paths` and `data-blocked-paths` are comma-separated path rules for that specific integration. That is where per-site path scoping belongs.

Manual slots are optional. If present, the script uses them:

```html
<div data-custom-ad-slot="auto-inline"></div>
```

If no slots exist, the script injects top, inline, feed, bottom, and mobile sticky positions where the page structure allows.

For the standard first-party proxy pattern used to reduce client-side blocking, see [INTEGRATION.md](./INTEGRATION.md).

## Production notes

This version does not require S3. Media is stored as base64 in Neon and exposed through cacheable media URLs. That keeps the client payload small compared with sending raw base64 in `/api/delivery`, and it lets browsers/CDNs cache media normally.

For large video ads or high traffic, move media to object storage later and keep the same `mediaUrl` contract.

## Branding

The admin header is branded as Ads by Se7enInc and uses `public/se7eninc.png`.
