# פפטידים ישראל — Peptides Israel

Bilingual (Hebrew default / English) **sales-focused** peptide storefront.
Brand: **פפטידים ישראל / Peptides Israel** (a sub-brand of Amino Chains Solutions).
Israel based, worldwide shipping.

> RESEARCH USE ONLY. Products are for laboratory research only and are **not for
> human or animal consumption**. No dosing or administration guidance is provided.
> Educational/reference content is not medical advice.

This is a sub-brand of the Isra.Peptides reference site, recolored to the
steel/silver-blue brand identity and reoriented from *information* to *selling*:
real per-product pricing, an add-to-cart → cart-subtotal → order flow, a
free-shipping promo, and a shop-first navigation.

## Stack

- Single-file vanilla site: all HTML, CSS and JS live in `index.html`.
- No framework, no build step, no dependencies.
- Hash-router single-page app (`#products`, `#product/<id>`, `#bundles`, `#pricing`…).
- Progressive Web App (`manifest.json` + `sw.js`, offline caching).
- Fully bilingual HE (RTL) / EN (LTR) — every string carries `data-he`/`data-en`.
  Partial RU/AR dictionaries inherited from the parent site.

## What's different from the parent (sales focus)

- **Pricing engine** (`priceFor`, `PRICE_BASE`, `PRICE_OVR`) — per-product NIS
  prices shown on every card, the product page, the hero spotlight and the cart.
- **Cart → order** — line totals, subtotal, free-shipping threshold (₪600) and a
  grand total; checkout sends a complete order via WhatsApp or email.
- **Shop-first** — promo bar, sales hero CTAs ("Shop now"), trimmed top nav
  (Shop / Bundles / Pricing first); deeper research tools live in the footer.
- **Brand** — steel/silver-blue palette (replacing gold), new logo/hero imagery,
  Hebrew wordmark "פפטידים ישראל" with the tagline "מחקר · איכות · אמינות".

## Structure

```
index.html        The whole site (inline CSS + JS, relative img/ paths)
img/              Brand imagery + per-product visuals
manifest.json     PWA manifest
sw.js             Service worker (cache-first) — bump cache name C on asset changes
CLAUDE.md         Conventions for editing with Claude Code
netlify.toml      Netlify config (publish root)
.github/workflows/pages.yml   GitHub Pages deploy
posts/            Markdown research articles
models/vial.glb   AR model
```

## Local preview

Serve over HTTP (not file://) so relative paths and the service worker work:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Deploy

GitHub Pages: push, then Settings → Pages → source "GitHub Actions" (workflow
deploys the root on every push). Netlify/Vercel: no build command, output = root.

## To confirm with the owner

- WhatsApp `972506787586` (inherited) and email `info@peptides-israel.com` are
  placeholders — update in `index.html` (search `WA=` and `peptides-israel.com`).
- Prices in `PRICE_BASE` / `PRICE_OVR` are illustrative defaults — set real ones.
- Social handles (`peptides.israel`) in the head JSON-LD are placeholders.
