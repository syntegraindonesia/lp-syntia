/*
 * Syntia chat widget — versi vanilla JS untuk landing page produk statis
 * (SynTask / SynPos / SynMeet). Merefleksikan components/ChatWidget.tsx tapi
 * tanpa React / next-intl, supaya bisa disuntik ke HTML snapshot.
 *
 * Cara pakai: <script defer src="/syntia-widget.js"></script> sebelum </body>.
 * Widget di-mount ke <body> (di luar React root) supaya aman dari re-render
 * hydration (khusus SynPos yang React app). Fetch ke /api/chat same-origin.
 */
(function () {
  "use strict";
  if (window.__syntiaWidgetLoaded) return;
  window.__syntiaWidgetLoaded = true;

  // ---- i18n (subset dari messages/*.json > chatbot) ----
  var DICT = {
    id: {
      title: "Syntia",
      subtitle: "Asisten AI • biasanya membalas dalam detik",
      greeting:
        "Halo! 👋 Aku Syntia, asisten AI Syntegra. Sebelum mulai, boleh kenalan dulu? Nama & nomor WhatsApp kamu berapa ya? Biar aku bisa bantu lebih personal 😊",
      placeholder: "Tulis pesan...",
      send: "Kirim",
      error: "Maaf, terjadi kesalahan. Coba lagi atau hubungi kami via WhatsApp.",
      openAria: "Buka chat dengan Syntia",
      closeAria: "Tutup chat",
      askCta: "Tanya Syntia",
    },
    en: {
      title: "Syntia",
      subtitle: "AI Assistant • usually replies in seconds",
      greeting:
        "Hi! 👋 I'm Syntia, Syntegra's AI assistant. Before we start, mind if we get acquainted? What's your name & WhatsApp number? So I can help you more personally 😊",
      placeholder: "Type a message...",
      send: "Send",
      error: "Sorry, something went wrong. Try again or contact us on WhatsApp.",
      openAria: "Open chat with Syntia",
      closeAria: "Close chat",
      askCta: "Ask Syntia",
    },
  };

  function currentLang() {
    var l = (document.documentElement.getAttribute("lang") || "id").toLowerCase();
    return l.indexOf("en") === 0 ? "en" : "id";
  }
  var lang = currentLang();
  function t(key) {
    return (DICT[lang] || DICT.id)[key];
  }

  // ---- Dark mode: dukung dua konvensi (data-theme & class .dark) ----
  function isDark() {
    var html = document.documentElement;
    if (html.getAttribute("data-theme") === "dark") return true; // SynTask/SynMeet
    if (html.classList.contains("dark")) return true; // SynPos (Tailwind class)
    return false;
  }

  // ---- Avatar SVG (dari components/SyntiaAvatar.tsx, id gradient di-prefix) ----
  function avatarSVG(size, wave) {
    return (
      '<svg viewBox="0 0 64 64" width="' + size + '" height="' + size +
      '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      "<defs>" +
      '<linearGradient id="sw-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#000731"/><stop offset="1" stop-color="#01247c"/></linearGradient>' +
      '<linearGradient id="sw-helmet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset="0.55" stop-color="#e0e7ff"/><stop offset="1" stop-color="#a5b4fc"/></linearGradient>' +
      '<linearGradient id="sw-ear" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#1e40af"/></linearGradient>' +
      '<linearGradient id="sw-visor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1730"/><stop offset="1" stop-color="#1e293b"/></linearGradient>' +
      '<radialGradient id="sw-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#67e8f9" stop-opacity="0.7"/><stop offset="1" stop-color="#67e8f9" stop-opacity="0"/></radialGradient>' +
      "</defs>" +
      '<style>.sw-glow{animation:sw-glowp 2.4s ease-in-out infinite}.sw-hand{transform-box:fill-box;transform-origin:33% 10%;animation:sw-wave 4.5s ease-in-out infinite}.sw-head{transform-box:fill-box;transform-origin:50% 95%;animation:sw-turn 4.5s ease-in-out infinite}@keyframes sw-glowp{0%,100%{opacity:.5}50%{opacity:1}}@keyframes sw-wave{0%,40%,100%{transform:rotate(0deg)}49%{transform:rotate(-157deg)}56%{transform:rotate(-148deg)}63%{transform:rotate(-163deg)}70%{transform:rotate(-150deg)}77%{transform:rotate(-161deg)}84%{transform:rotate(-155deg)}92%{transform:rotate(0deg)}}@keyframes sw-turn{0%,42%,100%{transform:rotate(0deg)}52%,83%{transform:rotate(-6deg)}92%{transform:rotate(0deg)}}@media(prefers-reduced-motion:reduce){.sw-glow,.sw-hand,.sw-head{animation:none}}</style>' +
      '<circle cx="32" cy="32" r="32" fill="url(#sw-bg)"/>' +
      '<g' + (wave ? ' class="sw-head"' : '') + '>' +
      '<circle class="sw-glow" cx="32" cy="6" r="4" fill="url(#sw-glow)"/>' +
      '<line x1="32" y1="11" x2="32" y2="6.5" stroke="#7dd3fc" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle cx="32" cy="6" r="1.6" fill="#7dd3fc"/>' +
      '<path d="M13 27 Q32 5 51 27" stroke="#475569" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
      '<path d="M13 25 Q32 3 51 25" stroke="#94a3b8" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.7"/>' +
      '<ellipse cx="32" cy="27" rx="15" ry="15.5" fill="url(#sw-helmet)"/>' +
      '<path d="M20 22 Q32 18 44 22" stroke="#93c5fd" stroke-width="0.7" fill="none" opacity="0.55"/>' +
      '<path d="M19 33 L45 33" stroke="#93c5fd" stroke-width="0.4" fill="none" opacity="0.4"/>' +
      '<circle cx="12" cy="28" r="6" fill="#0f172a"/><circle cx="12" cy="28" r="4.6" fill="url(#sw-ear)"/><circle cx="12" cy="28" r="2" fill="#7dd3fc" opacity="0.75"/>' +
      '<circle cx="52" cy="28" r="6" fill="#0f172a"/><circle cx="52" cy="28" r="4.6" fill="url(#sw-ear)"/><circle cx="52" cy="28" r="2" fill="#7dd3fc" opacity="0.75"/>' +
      '<path d="M12 32 Q14 40 22 40" stroke="#475569" stroke-width="1.7" fill="none" stroke-linecap="round"/>' +
      '<circle cx="22" cy="40" r="2.6" fill="#f43f5e" opacity="0.3"/><circle cx="22" cy="40" r="1.6" fill="#e11d48"/>' +
      '<rect x="19" y="22" width="26" height="11" rx="5.5" fill="url(#sw-visor)"/>' +
      '<circle cx="26" cy="27.5" r="4" fill="#22d3ee" opacity="0.3"/><circle cx="38" cy="27.5" r="4" fill="#22d3ee" opacity="0.3"/>' +
      '<circle cx="26" cy="27.5" r="2.7" fill="#22d3ee"/><circle cx="38" cy="27.5" r="2.7" fill="#22d3ee"/>' +
      '<circle cx="26.7" cy="26.8" r="1" fill="#e0f7ff"/><circle cx="38.7" cy="26.8" r="1" fill="#e0f7ff"/>' +
      '<path d="M27 30.5 Q32 33 37 30.5" stroke="#22d3ee" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
      '<rect x="28.5" y="42" width="7" height="4" fill="url(#sw-helmet)"/>' +
      "</g>" +
      '<path d="M14 64 Q14 46 32 46 Q50 46 50 64 Z" fill="url(#sw-helmet)"/>' +
      '<path d="M18 60 Q32 55 46 60" stroke="#93c5fd" stroke-width="0.6" fill="none" opacity="0.5"/>' +
      '<circle cx="18" cy="52" r="1.2" fill="#22d3ee" opacity="0.65"/><circle cx="46" cy="52" r="1.2" fill="#22d3ee" opacity="0.65"/>' +
      '<circle cx="32" cy="56" r="4" fill="#22d3ee" opacity="0.3"/><circle cx="32" cy="56" r="2.3" fill="#22d3ee"/><circle cx="32" cy="56" r="1" fill="#e0f7ff"/>' +
      (wave ? '<g class="sw-hand"><path d="M43 50 Q41.8 58 42.7 65 Q43 72.5 46.3 72.4 Q49.6 72.3 49 64 Q49.5 56 47.7 50 Q45.7 47.7 43 50 Z" fill="url(#sw-helmet)"/><path d="M43 50 Q41.8 58 42.7 65 Q43 72.5 46.3 72.4 Q49.6 72.3 49 64 Q49.5 56 47.7 50 Q45.7 47.7 43 50 Z" fill="none" stroke="#a5b4fc" stroke-width="0.5" opacity="0.5"/></g>' : "") +
      "</svg>"
    );
  }

  var ICON_X =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var ICON_SEND =
    '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  var ICON_SPIN =
    '<svg class="syntia-spin" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';

  // ---- Styles ----
  var CSS =
    ".syntia-root,.syntia-root *{box-sizing:border-box}" +
    ".syntia-root{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}" +
    "@keyframes syntia-spin{to{transform:rotate(360deg)}}" +
    ".syntia-spin{animation:syntia-spin .8s linear infinite}" +
    // launcher
    ".syntia-launcher{position:fixed;bottom:20px;right:20px;z-index:2147483000;display:flex;align-items:center;gap:8px}" +
    "@media(min-width:640px){.syntia-launcher{width:112px;flex-direction:column-reverse}}" +
    ".syntia-pill{display:inline-flex;align-items:center;gap:6px;border:0;cursor:pointer;border-radius:9999px;background:rgba(255,255,255,.95);padding:5px 12px;font-size:11px;font-weight:600;color:#1d4ed8;box-shadow:0 4px 12px rgba(15,23,42,.18),0 0 0 1px #e2e8f0;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:background .2s,box-shadow .2s;white-space:nowrap}" +
    ".syntia-pill:hover{background:#fff;box-shadow:0 6px 18px rgba(15,23,42,.26),0 0 0 1px #e2e8f0}" +
    ".syntia-fab{display:grid;place-items:center;cursor:pointer;border:0;height:56px;width:56px;border-radius:9999px;overflow:hidden;background:transparent;color:#fff;padding:0;box-shadow:0 12px 30px rgba(2,12,60,.35);transition:transform .15s}" +
    ".syntia-fab:hover{transform:scale(1.05)}.syntia-fab:active{transform:scale(.95)}" +
    ".syntia-fab--open{background:linear-gradient(135deg,#1f3fc7 0%,#20ADE4 100%)}" +
    // panel
    // NB: base display:none — jangan andalkan atribut [hidden] (UA display:none
    // kalah spesifisitas dari class .syntia-panel). Toggle via .syntia-open.
    ".syntia-panel{position:fixed;bottom:96px;right:20px;z-index:2147483000;display:none;flex-direction:column;overflow:hidden;height:70vh;max-height:560px;width:calc(100vw - 40px);max-width:380px;border-radius:16px;background:#fff;border:1px solid #e2e8f0;box-shadow:0 24px 60px rgba(15,23,42,.28)}" +
    ".syntia-panel.syntia-open{display:flex}" +
    ".syntia-header{display:flex;align-items:center;gap:12px;padding:12px 16px;color:#fff;background:linear-gradient(135deg,#000731 0%,#01247c 100%)}" +
    ".syntia-header .syntia-ava{display:grid;place-items:center;height:40px;width:40px;flex-shrink:0;border-radius:9999px;overflow:hidden;box-shadow:0 0 0 2px rgba(255,255,255,.2)}" +
    ".syntia-htitle{font-size:14px;font-weight:700;line-height:1.2}" +
    ".syntia-hsub{display:flex;align-items:center;gap:6px;font-size:11px;color:rgba(224,242,254,.8);margin-top:2px}" +
    ".syntia-dot{display:inline-block;height:6px;width:6px;border-radius:9999px;background:#34d399}" +
    ".syntia-msgs{flex:1;overflow-y:auto;padding:16px;background:rgba(248,250,252,.7);display:flex;flex-direction:column;gap:12px}" +
    ".syntia-bubble{max-width:85%;white-space:pre-wrap;word-wrap:break-word;border-radius:16px;padding:8px 14px;font-size:14px;line-height:1.45}" +
    ".syntia-b-user{align-self:flex-end;background:#2563eb;color:#fff;border-bottom-right-radius:4px}" +
    ".syntia-b-bot{align-self:flex-start;background:#fff;color:#334155;box-shadow:0 0 0 1px #e2e8f0;border-bottom-left-radius:4px}" +
    ".syntia-err{text-align:center;font-size:12px;color:#e11d48}" +
    ".syntia-form{display:flex;align-items:center;gap:8px;border-top:1px solid #e2e8f0;background:#fff;padding:12px}" +
    ".syntia-input{min-width:0;flex:1;border-radius:9999px;border:1px solid #e2e8f0;background:#f8fafc;padding:8px 16px;font-size:14px;color:#0f172a;outline:none}" +
    ".syntia-input:focus{border-color:#60a5fa}" +
    ".syntia-sendbtn{display:grid;place-items:center;height:36px;width:36px;flex-shrink:0;border:0;cursor:pointer;border-radius:9999px;background:#2563eb;color:#fff;transition:background .15s}" +
    ".syntia-sendbtn:hover{background:#1d4ed8}.syntia-sendbtn:disabled{opacity:.4;cursor:default}" +
    // dark
    ".syntia-dark .syntia-pill{background:rgba(15,23,42,.95);color:#93c5fd;box-shadow:0 4px 12px rgba(0,0,0,.4),0 0 0 1px #334155}" +
    ".syntia-dark .syntia-pill:hover{background:#0f172a}" +
    ".syntia-dark .syntia-panel{background:#020617;border-color:#1e293b}" +
    ".syntia-dark .syntia-msgs{background:rgba(15,23,42,.4)}" +
    ".syntia-dark .syntia-b-bot{background:#1e293b;color:#e2e8f0;box-shadow:0 0 0 1px #334155}" +
    ".syntia-dark .syntia-form{background:#020617;border-top-color:#1e293b}" +
    ".syntia-dark .syntia-input{background:#0f172a;border-color:#334155;color:#fff}";

  // ---- State ----
  var messages = []; // {role, content}
  var open = false;
  var loading = false;
  var root, launcher, pillBtn, fabBtn, panel, msgsEl, inputEl, sendBtn, errEl;

  function esc(s) {
    return s; // pakai textContent, tidak perlu escape HTML
  }

  // Jaring pengaman: buang sisa penanda Markdown (**tebal**, heading #, backtick)
  // biar balasan tampil polos seperti chat biasa. Utama tetap dari system prompt.
  function cleanMd(s) {
    return String(s).replace(/[*`]/g, "").replace(/^#{1,6}\s+/gm, "");
  }

  function scrollBottom() {
    if (msgsEl) msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function bubble(role, content) {
    var div = document.createElement("div");
    div.className = "syntia-bubble " + (role === "user" ? "syntia-b-user" : "syntia-b-bot");
    div.textContent = role === "user" ? content : cleanMd(content);
    return div;
  }

  function render() {
    // Header labels ikut bahasa terkini
    // Messages
    msgsEl.innerHTML = "";
    msgsEl.appendChild(bubble("assistant", t("greeting")));
    for (var i = 0; i < messages.length; i++) {
      var m = messages[i];
      var b = bubble(m.role, m.content);
      if (!m.content && loading && i === messages.length - 1 && m.role === "assistant") {
        b.innerHTML = ICON_SPIN;
      }
      msgsEl.appendChild(b);
    }
    if (errEl && errEl.parentNode) errEl.parentNode.removeChild(errEl);
    scrollBottom();
  }

  function showError() {
    errEl = document.createElement("p");
    errEl.className = "syntia-err";
    errEl.textContent = t("error");
    msgsEl.appendChild(errEl);
    scrollBottom();
  }

  function setOpen(v) {
    open = v;
    markInteracted();
    panel.classList.toggle("syntia-open", open);
    pillBtn.style.display = open ? "none" : "";
    fabBtn.className = "syntia-fab" + (open ? " syntia-fab--open" : "");
    fabBtn.innerHTML = open ? ICON_X : avatarSVG(56, true);
    fabBtn.setAttribute("aria-label", open ? t("closeAria") : t("openAria"));
    if (open) {
      render();
      setTimeout(function () { inputEl && inputEl.focus(); }, 0);
    }
  }

  function markInteracted() {
    try { sessionStorage.setItem("syntia-shown", "1"); } catch (e) {}
  }

  async function send() {
    var text = inputEl.value.trim();
    if (!text || loading) return;
    if (errEl && errEl.parentNode) errEl.parentNode.removeChild(errEl);

    var history = messages.concat([{ role: "user", content: text }]);
    messages = history.concat([{ role: "assistant", content: "" }]);
    inputEl.value = "";
    loading = true;
    updateSendBtn();
    render();

    try {
      var res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok || !res.body) throw new Error("request failed");

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var acc = "";
      for (;;) {
        var chunk = await reader.read();
        if (chunk.done) break;
        acc += decoder.decode(chunk.value, { stream: true });
        messages[messages.length - 1] = { role: "assistant", content: acc };
        render();
      }
      if (!acc.trim()) throw new Error("empty response");
    } catch (e) {
      // buang bubble assistant kosong
      var last = messages[messages.length - 1];
      if (last && last.role === "assistant" && !last.content) messages.pop();
      render();
      showError();
    } finally {
      loading = false;
      updateSendBtn();
    }
  }

  function updateSendBtn() {
    var empty = !inputEl.value.trim();
    sendBtn.disabled = loading || empty;
    sendBtn.innerHTML = loading ? ICON_SPIN : ICON_SEND;
  }

  function build() {
    var styleEl = document.createElement("style");
    styleEl.setAttribute("data-syntia", "1");
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    root = document.createElement("div");
    root.className = "syntia-root" + (isDark() ? " syntia-dark" : "");
    root.setAttribute("data-syntia-root", "1");

    // Launcher
    launcher = document.createElement("div");
    launcher.className = "syntia-launcher";

    pillBtn = document.createElement("button");
    pillBtn.type = "button";
    pillBtn.className = "syntia-pill";
    pillBtn.textContent = t("askCta");
    pillBtn.addEventListener("click", function () { setOpen(true); });

    fabBtn = document.createElement("button");
    fabBtn.type = "button";
    fabBtn.className = "syntia-fab";
    fabBtn.innerHTML = avatarSVG(56, true);
    fabBtn.setAttribute("aria-label", t("openAria"));
    fabBtn.addEventListener("click", function () { setOpen(!open); });

    launcher.appendChild(pillBtn);
    launcher.appendChild(fabBtn);

    // Panel
    panel = document.createElement("div");
    panel.className = "syntia-panel";

    var header = document.createElement("div");
    header.className = "syntia-header";
    var ava = document.createElement("span");
    ava.className = "syntia-ava";
    ava.innerHTML = avatarSVG(40);
    var htext = document.createElement("div");
    htext.style.minWidth = "0";
    var ht = document.createElement("div");
    ht.className = "syntia-htitle";
    ht.textContent = t("title");
    var hs = document.createElement("div");
    hs.className = "syntia-hsub";
    hs.innerHTML = '<span class="syntia-dot"></span>';
    hs.appendChild(document.createTextNode(t("subtitle")));
    htext.appendChild(ht);
    htext.appendChild(hs);
    header.appendChild(ava);
    header.appendChild(htext);

    msgsEl = document.createElement("div");
    msgsEl.className = "syntia-msgs";

    var form = document.createElement("form");
    form.className = "syntia-form";
    inputEl = document.createElement("input");
    inputEl.className = "syntia-input";
    inputEl.type = "text";
    inputEl.placeholder = t("placeholder");
    inputEl.addEventListener("input", updateSendBtn);
    sendBtn = document.createElement("button");
    sendBtn.type = "submit";
    sendBtn.className = "syntia-sendbtn";
    sendBtn.setAttribute("aria-label", t("send"));
    sendBtn.innerHTML = ICON_SEND;
    sendBtn.disabled = true;
    form.appendChild(inputEl);
    form.appendChild(sendBtn);
    form.addEventListener("submit", function (e) { e.preventDefault(); send(); });

    panel.appendChild(header);
    panel.appendChild(msgsEl);
    panel.appendChild(form);

    root.appendChild(launcher);
    root.appendChild(panel);
    document.body.appendChild(root);

    render();
    watchTheme();
    watchLang();
    autoOpenOnScroll();
  }

  // Sinkron dark mode saat toggle di LP
  function watchTheme() {
    try {
      new MutationObserver(function () {
        if (!root) return;
        var d = isDark();
        root.classList.toggle("syntia-dark", d);
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });
    } catch (e) {}
  }

  // Sinkron bahasa saat toggle ID/EN (LP ubah documentElement.lang)
  function watchLang() {
    try {
      new MutationObserver(function () {
        var l = currentLang();
        if (l === lang) return;
        lang = l;
        pillBtn.textContent = t("askCta");
        inputEl.placeholder = t("placeholder");
        fabBtn.setAttribute("aria-label", open ? t("closeAria") : t("openAria"));
        if (open) render();
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"],
      });
    } catch (e) {}
  }

  // Auto-open sekali per session saat user sampai (hampir) bottom halaman.
  function autoOpenOnScroll() {
    try { if (sessionStorage.getItem("syntia-shown")) return; } catch (e) {}
    var dwellTimer = null;
    var hasScrolled = false;
    function check() {
      if (window.scrollY > 200) hasScrolled = true;
      if (!hasScrolled) return;
      var nearBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;
      if (nearBottom) {
        if (dwellTimer == null) {
          dwellTimer = window.setTimeout(function () {
            var shown = false;
            try { shown = !!sessionStorage.getItem("syntia-shown"); } catch (e) {}
            if (!shown && !open) setOpen(true);
          }, 1200);
        }
      } else if (dwellTimer != null) {
        window.clearTimeout(dwellTimer);
        dwellTimer = null;
      }
    }
    window.addEventListener("scroll", check, { passive: true });
  }

  // Mount setelah load (aman dari hydration SynPos). Re-check kalau ter-remove.
  function init() {
    if (document.querySelector("[data-syntia-root]")) return;
    if (!document.body) return;
    build();
  }

  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init);
  }
  // Jaring pengaman: kalau React sempat wipe body child, re-mount.
  setTimeout(function () { if (!document.querySelector("[data-syntia-root]")) init(); }, 1500);
})();
