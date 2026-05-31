# Integration Contract

This document defines the standard integration contract for connecting a site to Ads by Se7enInc.

## Goal

Give this document to an engineer or AI agent when the task is:

- integrate Ads by Se7enInc into a site
- choose between direct `widget.js` and first-party proxy
- implement the standard first-party proxy contract
- wire the script into the site layout
- verify ads render and analytics reach the ads service

The integration should not invent new route names, new request shapes, or new configuration keys.

## Short answer

Yes: the proxy shape should be the same for all integrations.

If we adopt the first-party pattern, every site should expose the same local paths:

- `/reader-tools/loader.js`
- `/reader-tools/delivery`
- `/reader-tools/events`
- `/reader-tools/media/:id`

That keeps every integration predictable and lets us document one standard instead of per-project variations.

## Why this exists

Directly loading `widget.js` from the ads service is the lowest-effort option:

```html
<script async src="https://ads.example.com/widget.js" data-site="maine-news"></script>
```

But desktop blockers can detect and block that third-party script.

The first-party pattern reduces that risk by making the browser load a local script and local routes from the client site itself.

## Standard first-party integration

Each site should implement the same four local routes:

### 1. Loader

```txt
/reader-tools/loader.js
```

Purpose:

- serves the widget runtime to the browser

Behavior:

- proxies the upstream ads service `widget.js`

### 2. Delivery

```txt
/reader-tools/delivery
```

Purpose:

- fetches ad selections for the current page

Behavior:

- proxies the upstream ads service `/api/delivery`

### 3. Events

```txt
/reader-tools/events
```

Purpose:

- forwards impression and click events

Behavior:

- proxies the upstream ads service `/api/events`

### 4. Media

```txt
/reader-tools/media/:id
```

Purpose:

- serves ad images/videos

Behavior:

- proxies the upstream ads service `/api/media/:id`

## Client site environment

For a first-party integration, the client site should define:

```env
CUSTOM_ADS_SERVICE_URL="https://ads.example.com"
NEXT_PUBLIC_CUSTOM_ADS_MAX_SLOTS="4"
NEXT_PUBLIC_CUSTOM_ADS_ALLOWED_PATHS="/,/article/*,/latest/*"
NEXT_PUBLIC_CUSTOM_ADS_BLOCKED_PATHS="/admin/*,/privacy/*,/terms/*"
```

Notes:

- `CUSTOM_ADS_SERVICE_URL` is the upstream Ads by Se7enInc service URL used by the local proxy routes.
- `NEXT_PUBLIC_CUSTOM_ADS_URL` should use the same base URL value as `CUSTOM_ADS_SERVICE_URL`.
- In the Maine News integration, `NEXT_PUBLIC_CUSTOM_ADS_URL` is used only as a feature flag for whether to render the loader script at all, while `CUSTOM_ADS_SERVICE_URL` is used by the server-side proxy routes.
- `NEXT_PUBLIC_CUSTOM_ADS_MAX_SLOTS` is the visible cap per page.
- `NEXT_PUBLIC_CUSTOM_ADS_ALLOWED_PATHS` and `NEXT_PUBLIC_CUSTOM_ADS_BLOCKED_PATHS` are optional and integration-specific.

## Site-specific inputs

For any new integration, the only values that should vary per site are:

- `data-site`
- `data-max-slots`
- `data-allowed-paths`
- `data-blocked-paths`
- `CUSTOM_ADS_SERVICE_URL`
- where the script is mounted in the site layout

Everything else should remain standard.

## Script tag on the client site

The site should load its own local loader:

```html
<script
  async
  src="/reader-tools/loader.js"
  data-base-url="/reader-tools"
  data-site="maine-news"
  data-max-slots="4"
  data-allowed-paths="/article/*,/latest/*"
  data-blocked-paths="/admin/*,/privacy/*"
></script>
```

## Standard Next.js adapter shape

For a Next.js integration, the site should add:

- one helper for upstream proxying
- one loader route
- one delivery route
- one events route
- one media route
- one script tag in the root layout

Typical file shape:

```txt
src/lib/customAdsProxy.ts
src/app/reader-tools/loader.js/route.ts
src/app/reader-tools/delivery/route.ts
src/app/reader-tools/events/route.ts
src/app/reader-tools/media/[id]/route.ts
src/app/layout.tsx
```

## Route contract

These local routes should behave exactly like this:

### `/reader-tools/loader.js`

- Method support: `GET`, `HEAD`
- Upstream target: `/widget.js`
- Returns the upstream widget runtime

### `/reader-tools/delivery`

- Method support: `GET`, `OPTIONS`
- Upstream target: `/api/delivery`
- Must forward the full query string unchanged
- Should forward:
  - `origin`
  - `referer`
  - `user-agent`

### `/reader-tools/events`

- Method support: `POST`, `OPTIONS`
- Upstream target: `/api/events`
- Must forward the request body unchanged
- Must sanitize forwarded response headers before returning them locally
- Should forward:
  - `origin`
  - `referer`
  - `user-agent`
  - `content-type`

### `/reader-tools/media/:id`

- Method support: `GET`, `HEAD`
- Upstream target: `/api/media/:id`
- Must proxy the upstream response body and headers
- Must sanitize forwarded response headers before returning them locally

## Query parameters expected by delivery

The widget builds the delivery request. The integration should not rename these:

- `site`
- `page`
- `origin`
- `placements`
- `allowedPaths`
- `blockedPaths`
- `maxSlots`

The proxy does not interpret them. It forwards them unchanged to the ads service.

## Script attribute contract

These `data-*` attributes are the supported integration surface:

- `data-site`
- `data-base-url`
- `data-max-slots`
- `data-allowed-paths`
- `data-blocked-paths`

The integration should keep configuration here, not in the ads admin.

## Media URL mapping rule

The ads service returns media URLs in this form:

```txt
/api/media/:id
```

For a direct third-party integration, the widget can request that path from the ads service origin as-is.

For a first-party proxy integration, the widget runtime must map that path to the local proxy route:

```txt
/reader-tools/media/:id
```

It must not request:

```txt
/reader-tools/api/media/:id
```

That incorrect mapping will produce 404s and blank ad images.

## Proxy response header rule

When a client site proxies responses from the ads service, it should strip these headers before returning the local response:

- `content-encoding`
- `content-length`
- `transfer-encoding`

This matters especially for:

- `/reader-tools/events`
- `/reader-tools/media/:id`
- any generic proxy helper used by `/reader-tools/*`

If these headers are forwarded unchanged after response transformation, browsers can fail with `ERR_CONTENT_DECODING_FAILED`.

## Agent checklist

This is the execution checklist another AI agent should follow for a new site integration.

### Mode A: direct `widget.js`

1. Set the site-specific `data-site` value.
2. Add the script tag to the root layout or equivalent global template.
3. Set `data-max-slots`, `data-allowed-paths`, and `data-blocked-paths` if needed.
4. Verify the script loads.
5. Verify ads render on an allowed page.

### Mode B: first-party proxy

1. Set `CUSTOM_ADS_SERVICE_URL`.
2. Decide the site key to use in `data-site`.
3. Create `src/lib/customAdsProxy.ts`.
4. Add `/reader-tools/loader.js`.
5. Add `/reader-tools/delivery`.
6. Add `/reader-tools/events`.
7. Add `/reader-tools/media/[id]`.
8. Add the local loader script to the root layout:

   ```html
   <script
     async
     src="/reader-tools/loader.js"
     data-base-url="/reader-tools"
     data-site="your-site-key"
   ></script>
   ```

9. Add optional `data-max-slots`, `data-allowed-paths`, and `data-blocked-paths`.
10. Build the site.
11. Verify the local loader and proxy routes respond correctly.
12. Verify the ads service records the site in connected-site analytics.

## Request flow

The first-party request flow should look like this:

1. The page loads `/reader-tools/loader.js`.
2. The loader inspects the page and discovers slots.
3. The loader requests:

   ```txt
   /reader-tools/delivery?site=...&page=...&placements=...
   ```

4. The local delivery route proxies the request to:

   ```txt
   https://ads.example.com/api/delivery
   ```

5. The widget renders the returned ads.
6. Media loads through:

   ```txt
   /reader-tools/media/:id
   ```

7. Impressions and clicks post to:

   ```txt
   /reader-tools/events
   ```

8. The local events route proxies to:

   ```txt
   https://ads.example.com/api/events
   ```

## What stays the same across integrations

These should stay standard:

- route names
- proxy behavior
- request/response contract
- widget runtime behavior
- analytics event contract

## What changes per site

Only a few things should differ:

- `data-site`
- `data-max-slots`
- `data-allowed-paths`
- `data-blocked-paths`
- `CUSTOM_ADS_SERVICE_URL`
- where the script is placed in the site layout

## What an AI agent should not do

The integrating agent should not:

- add per-site settings into the ads admin UI
- rename `/reader-tools/*` routes
- rename `data-*` configuration keys
- call the ads service directly from page markup when the task explicitly asks for the first-party proxy pattern
- create a one-off integration contract for a single project

## Common failure modes

1. Ad cards render but images do not:
   - usually the widget mapped `/api/media/:id` incorrectly in first-party mode
   - check that local requests go to `/reader-tools/media/:id`

2. Browser shows `ERR_CONTENT_DECODING_FAILED` on `/reader-tools/events`:
   - the proxy is likely forwarding upstream encoding headers unchanged
   - strip `content-encoding`, `content-length`, and `transfer-encoding`

3. Browser shows `ERR_BLOCKED_BY_CLIENT` for `widget.js`:
   - this is usually a client-side blocker or extension
   - use the standard first-party proxy pattern instead of loading `widget.js` directly from the ads-service domain

## Success criteria

An integration is complete when all of these are true:

1. The site layout includes the correct loader script.
2. `/reader-tools/loader.js` returns `200`.
3. `/reader-tools/delivery` returns `200` on an allowed page.
4. `/reader-tools/media/:id` returns `200` for at least one delivered ad.
5. At least one ad renders on the page.
6. Blocked paths do not render ads.
7. Impression events reach the ads service.
8. The site appears in connected-site analytics.

## Recommended policy

For future integrations, use one standard:

- public local script path: `/reader-tools/loader.js`
- public local API prefix: `/reader-tools/*`

That means every Next.js site can use the same small adapter with almost no custom logic.

## Two supported modes

### Mode A: direct third-party script

```html
<script async src="https://ads.example.com/widget.js" data-site="maine-news"></script>
```

Pros:

- fastest to add
- one script tag

Cons:

- more likely to be blocked

### Mode B: first-party proxy

```html
<script async src="/reader-tools/loader.js" data-base-url="/reader-tools" data-site="maine-news"></script>
```

Pros:

- more resilient against client-side blockers
- consistent local integration contract

Cons:

- requires a small adapter per site

## Recommendation

If the goal is lowest setup effort, use direct `widget.js`.

If the goal is production reliability, use the standard first-party proxy contract above for every site.

## Verification checklist

After integration, verify all of the following:

1. The page HTML includes the correct script tag.
2. The local loader responds with `200`.
3. The local delivery route responds with `200`.
4. The local media route responds with `200` for an existing ad.
5. At least one ad renders on an allowed page.
6. No ad renders on a blocked page.
7. An impression event reaches the ads service.
8. The connected site appears in admin analytics.

## Minimum handoff for another AI

If you are giving this task to another AI agent, provide:

- this document
- the target site repo
- the intended `data-site` value
- whether to use direct `widget.js` or first-party proxy
- the ads service base URL
- any path rules or slot cap for that site

Optional but useful:

- the exact pages where ads should and should not appear
- whether blocker resistance is required
- whether the site is Next.js or a different framework

That is enough for the agent to implement the integration without inventing a new contract.
