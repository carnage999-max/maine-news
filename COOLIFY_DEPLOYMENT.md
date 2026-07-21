# Coolify Deployment Notes for se7en

These notes cover the two deployable services in this repo:

- `custom-ads/` - Next.js ad management and delivery service
- `maine-news/` - Next.js Maine News site

Coolify should build and run the containers. System Nginx on se7en handles DNS domains, TLS, and reverse proxying.

## Shared Settings

- Server: `se7en`
- Coolify: `https://deploy.se7eninc.com`
- Internal app port: `3000`
- Port mappings must bind to localhost only: `127.0.0.1:<host-port>:3000`
- Build pack: Nixpacks
- Package manager: pnpm
- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm build`
- Start command: `pnpm start`
- Node env: `NODE_ENV=production`

Set the Coolify base directory to the app folder being deployed.

## custom-ads

Recommended Coolify app settings:

- Base directory: `custom-ads`
- Host port: `3001`
- Port mapping: `127.0.0.1:3001:3000`
- Database: Coolify-provisioned Postgres 17
- Persistent storage: none required

Required environment variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@POSTGRES_CONTAINER:5432/DB"
CUSTOM_ADS_ADMIN_USERNAME="admin"
CUSTOM_ADS_ADMIN_PASSWORD="change-this-password"
CUSTOM_ADS_AUTH_SECRET="use-a-long-random-secret"
NEXT_PUBLIC_ADS_SERVICE_URL="https://ads.example.com"
NODE_ENV="production"
```

Optional email variables:

```bash
RESEND_API_KEY=""
ADS_NOTIFICATION_EMAILS=""
ADS_FROM_EMAIL="Ads by Se7enInc <ads@example.com>"
```

The service creates its own `custom_ads_ads` and `custom_ads_sites` tables at runtime. If migrating from Neon, restore the Neon database into the Coolify Postgres container before first production traffic.

Nginx can use the standard helper after DNS points to `68.68.239.212`:

```bash
~/add-site.sh ads.example.com 3001
sudo certbot --nginx -d ads.example.com
```

## maine-news

Recommended Coolify app settings:

- Base directory: `maine-news`
- Host port: `3002`
- Port mapping: `127.0.0.1:3002:3000`
- Database: Coolify-provisioned Postgres 17
- Media mount source: `/mnt/data/media/maine-news/`
- Media mount destination: `/app/media`

Required environment variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@POSTGRES_CONTAINER:5432/DB"
AUTH_SECRET="use-a-long-random-secret"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
NEXT_PUBLIC_SITE_URL="https://www.mainenewsnow.com"
MEDIA_ROOT="/app/media"
MEDIA_URL="/media/"
CUSTOM_ADS_SERVICE_URL="https://ads.example.com"
NEXT_PUBLIC_CUSTOM_ADS_URL="https://ads.example.com"
NODE_ENV="production"
```

Feature/integration variables used by the app:

```bash
NEXT_PUBLIC_CUSTOM_ADS_MAX_SLOTS="6"
NEXT_PUBLIC_CUSTOM_ADS_ALLOWED_PATHS="/,/article/*,/latest/*"
NEXT_PUBLIC_CUSTOM_ADS_BLOCKED_PATHS="/admin/*,/privacy/*,/terms/*"
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""
RESEND_API_KEY=""
TOMTOM_API_KEY=""
APIVERVE_API_KEY=""
MUSL_API_KEY=""
SCRAPER_API_KEY=""
CRON_SECRET=""
KEYSTATIC_GITHUB_CLIENT_ID=""
KEYSTATIC_GITHUB_CLIENT_SECRET=""
KEYSTATIC_GITHUB_TOKEN=""
```

Run database migrations after the app and database are deployed:

```bash
docker exec -it <maine-news-app-container> pnpm exec drizzle-kit migrate
```

Use a manual Nginx site so `/media/` is served from disk:

```nginx
server {
    listen 80;
    server_name mainenewsnow.com www.mainenewsnow.com;

    location /media/ {
        alias /mnt/data/media/maine-news/;
        sendfile on;
        tcp_nopush on;
        expires 30d;
        add_header Cache-Control "public";
    }

    location / {
        proxy_pass http://localhost:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        proxy_buffering off;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }
}
```

Then enable TLS:

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d mainenewsnow.com -d www.mainenewsnow.com
```

## Migration Checklist

- Create one Coolify Postgres 17 database for each service.
- If current data lives in Neon, restore it with `~/db-migrate.sh`.
- Set all environment variables in Coolify, including build-time vars if Coolify separates build and runtime env.
- Configure the localhost-only port mappings.
- Add the `maine-news` media directory mount.
- Deploy `custom-ads`, then `maine-news`.
- Confirm `maine-news` can load `/reader-tools/loader.js` and ad media through its first-party proxy.
