/* ╔══════════════════════════════════════════════════════════════╗
   ║  SURGE GURU — SITE CONFIG                                      ║
   ║  👉 EDIT THE VALUES BELOW. Search "FILL ME".                  ║
   ╚══════════════════════════════════════════════════════════════╝ */
window.SG_CONFIG = {
  /* ── Pricing ─────────────────────────────────────────────── */
  priceUSD: 34,             // per WEEK
  period: { he: "שבוע", en: "week" },
  vatRate: 0.18,            // Israeli VAT (18%) where applicable
  currencySymbol: "$",

  /* ── App / access ────────────────────────────────────────── */
  scannerUrl: "https://surge.guru",   // the live app — signing in here sends an access request to the admin
  // Access model: user signs in with Google at the scanner, then an admin approves.
  contactEmail: "fraps32@gmail.com",   // ← "Send by email" button target. Change if you want a different inbox.
  whatsapp: "",             // 👉 FILL ME — your WhatsApp number, intl digits e.g. "9725XXXXXXXX" (powers the "Send on WhatsApp" button)
  telegram: "",             // optional, e.g. "https://t.me/handle"

  /* ── Payment methods (same stack as LIQUIDEX) ────────────── */
  payments: {
    isracart: { enabled: true, vat: true, status: "coming-soon", checkoutUrl: "", apiKey: "" },
    crypto: {
      enabled: true, vat: true,
      networks: [
        { coin: "USDT", chain: "TRC20 (Tron)", address: "FILL ME — TRON USDT address" },
        { coin: "USDT", chain: "ERC20 (Ethereum)", address: "FILL ME — ERC20 USDT address" },
        { coin: "USDC", chain: "ERC20 (Ethereum)", address: "FILL ME — ERC20 USDC address" },
      ],
    },
    bit:  { enabled: true, vat: false, phone: "FILL ME — Bit number", name: "FILL ME — name" },
    bank: { enabled: true, vat: false, bankName: "FILL ME", branch: "FILL ME", account: "FILL ME",
            beneficiary: "FILL ME", iban: "FILL ME — IL.. IBAN", swift: "FILL ME — SWIFT/BIC" },
    cash: { enabled: true, vat: false, note: { he: "תיאום מסירה במזומן בהודעה.", en: "Arrange cash handover by message." } },
  },
};
