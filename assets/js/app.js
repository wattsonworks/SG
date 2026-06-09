/* ╔══════════════════════════════════════════════════════════════╗
   ║  SURGE GURU — app interactions                                ║
   ╚══════════════════════════════════════════════════════════════╝ */
(function () {
  const t = (he, en, ar) => { const l = window.LIQ_I18N?.current; return l === "en" ? en : l === "ar" ? (ar ?? en) : he; };
  const C = () => window.SG_CONFIG || {};

  /* reveal on scroll */
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -8% 0px" })
    : null;
  function bindReveals() { document.querySelectorAll(".reveal:not(.in)").forEach((el) => io ? io.observe(el) : el.classList.add("in")); }

  /* copy buttons */
  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]"); if (!btn) return;
    const text = btn.getAttribute("data-copy");
    try { await navigator.clipboard.writeText(text); } catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    const prev = btn.textContent; btn.textContent = t("✓ הועתק", "✓ Copied", "✓ تم النسخ"); setTimeout(() => (btn.textContent = prev), 1600);
  });

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* live scanner liveliness: "updated Ns ago" + occasional row flash */
  function liveTick() {
    const clocks = document.querySelectorAll("[data-sg-clock]");
    const rows = document.querySelectorAll(".sgx-row:not(.head)");
    let n = 0;
    setInterval(() => {
      n = (n + 1) % 45;
      clocks.forEach((c) => (c.textContent = t(`עודכן לפני ${n}s`, `Updated ${n}s ago`, `تم التحديث قبل ${n} ث`)));
      if (n % 5 === 0 && rows.length) {
        const r = rows[Math.floor((Date.now() / 5000) % rows.length)];
        if (r) { r.style.transition = "background .25s"; r.style.background = "rgba(255,122,26,.10)"; setTimeout(() => (r.style.background = ""), 450); }
      }
    }, 1000);
  }

  /* ── Checkout ─────────────────────────────────────────────── */
  const money = (usd) => `${C().currencySymbol}${usd.toFixed(0)}`;
  const per = () => t(C().period?.he || "שבוע", C().period?.en || "week", C().period?.ar || "أسبوع");
  const withVat = (usd) => usd * (1 + (C().vatRate || 0));
  function qr(data) { const enc = encodeURIComponent(data); return `<img class="qr" alt="QR" loading="lazy" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&margin=0&data=${enc}" onerror="this.style.display='none'">`; }

  function waLink(msg) { const wa = (C().whatsapp || "").replace(/[^0-9]/g, ""); return wa ? `https://wa.me/${wa}?text=${encodeURIComponent(msg)}` : ""; }
  function mailLink(subj, msg) { const e = C().contactEmail || ""; return (e && !/FILL ME/i.test(e)) ? `mailto:${e}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(msg)}` : ""; }
  function usernameSend(msgHe, msgEn, msgAr, subjHe, subjEn) {
    const msg = t(msgHe, msgEn, msgAr), subj = t(subjHe, subjEn, subjEn);
    const ml = mailLink(subj, msg), wl = waLink(msg);
    let h = `<div class="send-actions">`;
    if (ml) h += `<a class="btn btn-primary" href="${ml}">✉&nbsp; ${t("שליחה במייל", "Send by email", "إرسال بالبريد")}</a>`;
    if (wl) h += `<a class="btn btn-wa" href="${wl}" target="_blank" rel="noopener">${t("שליחה ב-WhatsApp", "Send on WhatsApp", "إرسال عبر WhatsApp")}</a>`;
    h += `<button class="btn btn-outline btn-sm" data-copy="${msg.replace(/"/g, "&quot;")}">${t("העתקה", "Copy", "نسخ")}</button></div>`;
    if (!ml && !wl) h += `<p style="font-size:12.5px;color:var(--muted-2);margin-top:8px">${t("הגדירו אימייל / וואטסאפ ב-config.js", "Set email / WhatsApp in config.js", "اضبط البريد / WhatsApp في config.js")}</p>`;
    return h;
  }
  function accessBlock() {
    const c = C();
    const mHe = "שלום, שילמתי על Surge Guru. ה-Gmail שאיתו התחברתי לסורק: ______";
    const mEn = "Hi, I paid for Surge Guru. The Gmail I signed into the scanner with is: ______";
    const mAr = "مرحبًا، لقد دفعت مقابل Surge Guru. الـ Gmail الذي سجّلت به الدخول إلى الماسح هو: ______";
    return `<p style="color:var(--muted);font-size:14px;margin-top:16px">
      ${t("לאחר התשלום: פתחו את הסורק והתחברו עם Google, ואז שלחו לנו את ה-Gmail באחת משתי הדרכים — נאשר את הגישה תוך 24 שעות:",
           "After payment: open the scanner, sign in with Google, then send us that Gmail one of two ways — we approve within 24h:",
           "بعد الدفع: افتح الماسح، سجّل الدخول عبر Google، ثم أرسل لنا الـ Gmail بإحدى الطريقتين — نوافق على الوصول خلال 24 ساعة:")}
      <br><a class="g" href="${c.scannerUrl}" target="_blank" rel="noopener" style="font-weight:700">${t("פתחו את הסורק ↗", "Open the scanner ↗", "افتح الماسح ↗")}</a></p>
      ${usernameSend(mHe, mEn, mAr, "Surge Guru access", "Surge Guru access")}`;
  }
  function priceLine(vat, base) {
    if (!vat) return `<div class="detail-row"><span>${t("לתשלום", "Due today", "المستحق اليوم")}</span><span>${money(base)} / ${per()}</span></div>`;
    return `<div class="detail-row"><span>${t("מנוי", "Subscription", "اشتراك")}</span><span>${money(base)}</span></div>
            <div class="detail-row"><span>${t("מע״מ 18%", "VAT 18%", "ضريبة 18%")}</span><span>${money(base * 0.18)}</span></div>
            <div class="detail-row"><span><b>${t("סה״כ", "Total", "الإجمالي")}</b></span><span><b>${money(withVat(base))} / ${per()}</b></span></div>`;
  }
  function renderCheckout() {
    const host = document.getElementById("pay-app"); if (!host || !window.SG_CONFIG) return;
    const c = C(), P = c.payments, base = c.priceUSD;
    const methods = [
      P.isracart?.enabled && { id: "isracart", ico: "💳", nm: t("כרטיס אשראי", "Credit / Debit Card", "بطاقة ائتمان / خصم"), sub: "IsraCart", soon: P.isracart.status === "coming-soon", vat: P.isracart.vat },
      P.bit?.enabled && { id: "bit", ico: "📲", nm: "Bit", sub: t("העברה מיידית", "Instant transfer", "تحويل فوري"), vat: P.bit.vat },
      P.crypto?.enabled && { id: "crypto", ico: "₿", nm: t("מטבע קריפטו", "Crypto", "كريبتو"), sub: "USDT · USDC", vat: P.crypto.vat },
      P.bank?.enabled && { id: "bank", ico: "🏦", nm: t("העברה בנקאית", "Bank Transfer", "تحويل بنكي"), sub: t("מקומי / בינ״ל", "Local / Intl.", "محلي / دولي"), vat: P.bank.vat },
      P.cash?.enabled && { id: "cash", ico: "💵", nm: t("מזומן", "Cash", "نقدًا"), sub: t("בתיאום", "By arrangement", "بالتنسيق"), vat: P.cash.vat },
    ].filter(Boolean);
    const tabs = methods.map((m, i) => `<button class="pay-method${i === 0 ? " active" : ""}" data-pm="${m.id}">${m.soon ? `<span class="soon">${t("בקרוב", "SOON", "قريبًا")}</span>` : ""}<div class="ico">${m.ico}</div><div class="nm">${m.nm}</div><div class="sub">${m.sub}</div></button>`).join("");
    const panels = methods.map((m, i) => `<div class="pay-panel" data-panel="${m.id}" ${i === 0 ? "" : "hidden"}>${buildPanel(m.id, m, base, c)}</div>`).join("");
    host.innerHTML = `<div class="pay-grid">${tabs}</div>${panels}`;
    host.querySelectorAll("[data-pm]").forEach((b) => b.addEventListener("click", () => {
      host.querySelectorAll(".pay-method").forEach((x) => x.classList.toggle("active", x === b));
      const id = b.getAttribute("data-pm");
      host.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.getAttribute("data-panel") !== id));
    }));
  }
  function buildPanel(id, m, base, c) {
    const P = c.payments;
    if (id === "isracart") {
      const live = P.isracart.status === "live" && P.isracart.checkoutUrl;
      return `<h4>${t("תשלום מאובטח בכרטיס אשראי", "Secure card payment", "دفع آمن بالبطاقة")}</h4><p style="color:var(--muted);font-size:14.5px">Visa · Mastercard · American Express · Isracard</p>${priceLine(m.vat, base)}
        ${live ? `<a class="btn btn-primary btn-block mt-2" href="${P.isracart.checkoutUrl}">${t("המשך לתשלום ↗", "Continue to checkout ↗", "تابع إلى الدفع ↗")}</a>`
               : `<div class="copy-row" style="color:var(--amber);border-color:rgba(255,184,0,.4)">${t("סליקת האשראי מופעלת בימים אלו — בחרו Bit / קריפטו / העברה בינתיים.", "Card processing is being activated — use Bit / crypto / transfer meanwhile.", "تفعيل الدفع بالبطاقة جارٍ — استخدم Bit / كريبتو / تحويل في الوقت الحالي.")}</div>`}${accessBlock()}`;
    }
    if (id === "crypto") {
      const nets = (P.crypto.networks || []).map((n) => `<div style="border:1px solid var(--line);border-radius:10px;padding:14px;margin-top:12px"><div style="display:flex;justify-content:space-between;align-items:center"><b>${n.coin}</b><span class="chip cyan">${n.chain}</span></div><div class="copy-row"><span>${n.address}</span><button data-copy="${n.address}">${t("העתק", "Copy", "نسخ")}</button></div>${qr(n.address)}</div>`).join("");
      return `<h4>${t("תשלום בקריפטו", "Pay with crypto", "الدفع بالكريبتو")}</h4>${priceLine(m.vat, base)}<p style="color:var(--muted);font-size:13.5px;margin-top:8px">${t("שלחו את הסכום המדויק ואז שלחו צילום עסקה + ה-Gmail שלכם.", "Send the exact amount, then send the tx screenshot + your Gmail.", "أرسل المبلغ الدقيق ثم أرسل لقطة المعاملة + الـ Gmail الخاص بك.")}</p>${nets}${accessBlock()}`;
    }
    if (id === "bit") return `<h4>Bit</h4>${priceLine(m.vat, base)}<div class="detail-row"><span>${t("מספר Bit", "Bit number", "رقم Bit")}</span><span>${P.bit.phone}</span></div><div class="detail-row"><span>${t("על שם", "Name", "الاسم")}</span><span>${P.bit.name}</span></div><div class="copy-row"><span>${P.bit.phone}</span><button data-copy="${P.bit.phone}">${t("העתק", "Copy", "نسخ")}</button></div>${accessBlock()}`;
    if (id === "bank") { const b = P.bank; const rows = [[t("בנק", "Bank", "البنك"), b.bankName], [t("סניף", "Branch", "الفرع"), b.branch], [t("חשבון", "Account", "الحساب"), b.account], [t("מוטב", "Beneficiary", "المستفيد"), b.beneficiary], ["IBAN", b.iban], ["SWIFT", b.swift]].map(([k, v]) => `<div class="detail-row"><span>${k}</span><span>${v}</span></div>`).join(""); return `<h4>${t("העברה בנקאית", "Bank transfer", "تحويل بنكي")}</h4>${priceLine(m.vat, base)}${rows}${accessBlock()}`; }
    if (id === "cash") return `<h4>${t("מזומן", "Cash", "نقدًا")}</h4>${priceLine(m.vat, base)}<p style="color:var(--muted)">${t(P.cash.note.he, P.cash.note.en, P.cash.note.ar || P.cash.note.en)}</p>${accessBlock()}`;
    return "";
  }

  function init() { bindReveals(); renderCheckout(); liveTick(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  document.addEventListener("langchange", () => { renderCheckout(); });
})();
