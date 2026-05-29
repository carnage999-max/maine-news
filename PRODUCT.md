# Product

## Register

product

## Users

Maine News editors and ad-ops admins use this repository to publish news and manage local advertising inventory. Future users include operators for other sites that need the same ad behavior through a small embed script.

## Product Purpose

The product publishes Maine News content and now includes a reusable custom ad service. The ad service lets an admin upload structured ad media and advertiser information, prioritize some ads, and serve them automatically across client sites through one script tag.

## Brand Personality

Clear, restrained, operational. The admin experience should feel direct and trustworthy, with enough density for repeated daily work.

## Anti-references

Avoid campaign-management bloat, decorative dashboards, arbitrary raw advertiser JavaScript, generic purple SaaS styling, emojis, and marketing-page layouts for admin workflows.

## Design Principles

1. The embed contract stays simple: one script tag should be enough for basic site-wide placement.
2. Ad records are structured and safe by default: media, text, link, priority, placement rules.
3. Priority influences delivery without removing randomness.
4. Admin screens should support quick review and editing, not visual spectacle.
5. Storage and media adapters should be replaceable without changing client-site integration.

## Accessibility & Inclusion

Target WCAG AA contrast for admin UI and rendered ads. Respect reduced-motion preferences. Generated ad markup should include alt text, sponsored labels, keyboard-accessible links, and no inaccessible emoji-only controls.
