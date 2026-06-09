/* ╔══════════════════════════════════════════════════════════════╗
   ║  SURGE GURU i18n — trilingual HE(default,RTL) / EN(LTR) / AR(RTL)║
   ║  Markup pattern:                                               ║
   ║    <h2 data-he="כותרת" data-en="Title" data-ar="عنوان"></h2>   ║
   ║    <p data-he … data-en … data-ar … data-html></p> (allows tags)║
   ║    <input data-he-ph data-en-ph data-ar-ph>   (placeholder)    ║
   ║  Fallback: a missing data-ar gracefully shows data-en.         ║
   ║  Switcher: <div data-lang-switch> + <button data-lang-set="ar">║
   ║  (legacy single <button data-lang-toggle> still cycles).       ║
   ╚══════════════════════════════════════════════════════════════╝ */
(function () {
  const KEY = "liquidex_lang";
  const DEFAULT = "he";
  const LANGS = ["en", "he", "ar"];      // switcher order
  const CYCLE = ["he", "en", "ar"];      // legacy toggle order
  const RTL = new Set(["he", "ar"]);

  // pick the best available attribute for a lang, falling back ar→en
  function pick(el, lang, suffix) {
    const a = "data-" + lang + suffix;
    if (el.hasAttribute(a)) return el.getAttribute(a);
    if (lang === "ar" && el.hasAttribute("data-en" + suffix)) return el.getAttribute("data-en" + suffix);
    return null;
  }

  function detect() {
    const saved = localStorage.getItem(KEY);
    if (saved && LANGS.includes(saved)) return saved;
    const q = new URLSearchParams(location.search).get("lang");
    if (q && LANGS.includes(q)) return q;
    return DEFAULT;
  }

  function apply(lang) {
    const dir = RTL.has(lang) ? "rtl" : "ltr";
    const html = document.documentElement;
    html.setAttribute("lang", lang);
    html.setAttribute("dir", dir);

    document.querySelectorAll("[data-he],[data-en],[data-ar]").forEach((el) => {
      const val = pick(el, lang, "");
      if (val == null) return;
      if (el.hasAttribute("data-html")) el.innerHTML = val;
      else el.textContent = val;
    });
    document.querySelectorAll("[data-he-ph],[data-en-ph],[data-ar-ph]").forEach((el) => {
      const val = pick(el, lang, "-ph");
      if (val != null) el.setAttribute("placeholder", val);
    });

    // segmented switcher: highlight the active language
    document.querySelectorAll("[data-lang-set]").forEach((b) => {
      b.classList.toggle("on", b.getAttribute("data-lang-set") === lang);
      b.setAttribute("aria-pressed", b.getAttribute("data-lang-set") === lang ? "true" : "false");
    });
    // legacy single toggle: label shows the NEXT language
    document.querySelectorAll("[data-lang-toggle]").forEach((b) => {
      const next = CYCLE[(CYCLE.indexOf(lang) + 1) % CYCLE.length];
      b.textContent = next === "he" ? "עב" : next === "ar" ? "ع" : "EN";
    });

    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang, dir } }));
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) return;
    localStorage.setItem(KEY, lang);
    apply(lang);
  }

  window.LIQ_I18N = {
    get current() { return document.documentElement.getAttribute("lang") || DEFAULT; },
    set: setLang,
    toggle() { setLang(CYCLE[(CYCLE.indexOf(this.current) + 1) % CYCLE.length]); },
  };

  // apply ASAP (lang/dir already inlined in <html>, this fills text)
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => apply(detect()));
  else apply(detect());

  document.addEventListener("click", (e) => {
    const set = e.target.closest("[data-lang-set]");
    if (set) { e.preventDefault(); setLang(set.getAttribute("data-lang-set")); return; }
    const tog = e.target.closest("[data-lang-toggle]");
    if (tog) { e.preventDefault(); window.LIQ_I18N.toggle(); }
  });
})();
