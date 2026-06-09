# Surge Guru — marketing site

Bilingual (Hebrew default / English) landing + checkout for **Surge Guru**, a real-time
crypto explosion scanner (a base44 web app). **$34/week.**

Live: **https://wattsonworks.github.io/SG/** · App: https://surgeguru.base44.app/Scanner

## The product (grounded in the actual app)
- **Live scanner** — 480+ coins, SPOT & PERP, merged across OKX · Kraken · Coinbase · CMC, refresh ~1s.
- **🔥1+3 explosiveness** — core score = 1-minute + 3-minute move; sort by interval-to-interval change
  (1m→now, 15m→1m, 30m→15m, 45m→30m, 1h→45m). Persistence shown across 15m/30m/45m/1h.
- **AI technical analysis** · **chart-pattern detection** (Ascending Triangle, Bullish Flag, Double
  Bottom, Inverse H&S…) · **full-library correlation** · **surge alerts** · **OKX positions/PnL/margin**.
- **Access**: sign in with Google at the scanner, then admin approval.

## Structure
```
index.html        Landing (the persistence thesis + 7 feature pillars + pricing)
checkout.html     Payment page (renders from config.js)
404.html
assets/css/sg.css Design system (fire/surge theme, RTL/LTR) — recolored from the LIQUIDEX system
assets/js/i18n.js Bilingual engine (data-he / data-en, default Hebrew)
assets/js/config.js  👉 ALL payment + access settings ("FILL ME")
assets/js/app.js     Reveals, copy, live tick, config-driven checkout
assets/img/          Drop a real scanner screenshot here (e.g. scanner.webp) to feature it
```

## To finish setup (you)
Edit **`assets/js/config.js`** — replace every `FILL ME` (contact email/Gmail target, crypto wallets,
Bit number, bank details). IsraCart drops in once they send the link (`payments.isracart.checkoutUrl`
+ `status:"live"`). VAT is 0.18 where `vat:true`.

## Deploy
GitHub Pages from `main` root (`.nojekyll` present). Repo: `wattsonworks/SG`.
