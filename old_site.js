/* ============================================================================
 * RAN GS Eternity EP9 — Site App (config-driven)
 * ----------------------------------------------------------------------------
 * Renders everything from window.SITE_CONFIG (defaults from config.js,
 * overridden at build time by generated.js from config.ini).
 * Uses React + ReactDOM from CDN (react.production.min.js).
 * ========================================================================== */
(function () {
  "use strict";
  var C = window.SITE_CONFIG || {};
  var e = React.createElement;

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      if (!a) continue;
      if (typeof a === "string") out.push(a);
    }
    return out.join(" ");
  }
  function esc(s) {
    if (s == null) return "";
    return String(s);
  }
  function open(url) {
    if (url) window.open(url, "_blank", "noopener");
  }
  function scrollTop() {
    window.history.pushState(null, "", "#home");
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    window.setTimeout(function () { window.scrollTo({ top: 0, left: 0 }); }, 700);
  }

  /* Section eyebrow label */
  function Eyebrow(props) {
    return e("div", {
      style: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, letterSpacing: 3, color: "var(--accent)",
        textTransform: "uppercase", marginBottom: 8
      }
    }, props.children);
  }

  /* Decorative corner brackets */
  function Corners(props) {
    var pos = props.pos || "tl";
    var s = { position: "absolute", width: (props.size || 20), height: (props.size || 20), pointerEvents: "none" };
    var color = props.color || "var(--accent)";
    if (pos === "tl") { s.top = 10; s.left = 10; s.borderTop = "2px solid " + color; s.borderLeft = "2px solid " + color; }
    if (pos === "tr") { s.top = 10; s.right = 10; s.borderTop = "2px solid " + color; s.borderRight = "2px solid " + color; }
    if (pos === "bl") { s.bottom = 10; s.left = 10; s.borderBottom = "2px solid " + color; s.borderLeft = "2px solid " + color; }
    if (pos === "br") { s.bottom = 10; s.right = 10; s.borderBottom = "2px solid " + color; s.borderRight = "2px solid " + color; }
    return e("div", { style: s });
  }
  /* ---- NAV ---- */
  function Nav() {
    var site = C.site || {};
    var nav = C.nav || [];
    return e("nav", {
      style: {
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px",
        background: "linear-gradient(to bottom, rgba(8,12,24,.92), rgba(8,12,24,0))",
        backdropFilter: "blur(8px)"
      }
    },
      e("div", { style: { display: "flex", alignItems: "center", gap: 14 } },
        e("img", { src: site.logo || "/assets/logo.png", alt: "", style: { height: 38, width: "auto" } }),
        e("div", { style: { display: "flex", flexDirection: "column", lineHeight: 1 } },
          e("span", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 3, color: "var(--accent)" } }, site.brandShort || "RAN GS"),
          e("span", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2, color: "#fff" } }, site.brandLong || "ETERNITY")
        )
      ),
      e("div", {
        style: { display: "flex", gap: 32, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }
      }, nav.map(function (a) {
        return e("a", {
          key: a, href: "#" + a.toLowerCase(),
          onClick: a === "Home" ? function (t) { t.preventDefault(); scrollTop(); } : null
        }, a);
      })),
      e("button", {
        onClick: function () { var el = document.getElementById("download"); if (el) el.scrollIntoView({ behavior: "smooth" }); },
        style: {
          padding: "10px 20px", background: "var(--accent)", color: "#0A1020", border: "none",
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 2,
          textTransform: "uppercase", cursor: "pointer", fontWeight: 700
        }
      }, "PLAY NOW")
    );
  }

  /* ---- MUSIC CONTROL ---- */
  function MusicControl() {
    var m = C.music || {};
    if (m.enabled === false) return null;
    var audioRef = React.useRef(null);
    var [playing, setPlaying] = React.useState(false);
    var [errored, setErrored] = React.useState(false);
    React.useEffect(function () {
      window.addEventListener("rgse:pause-music", function () { setPlaying(false); });
    }, []);
    function toggle() {
      var a = audioRef.current;
      if (!a) return;
      if (a.paused) {
        a.volume = 0.35;
        a.play().then(function () { setPlaying(true); }).catch(function () { setErrored(true); });
      } else { a.pause(); setPlaying(false); }
    }
    return e("div", { className: "music-control" },
      e("button", {
        className: cx("music-toggle", playing && "is-playing"),
        onClick: toggle, "aria-label": playing ? "Pause background music" : "Play background music",
        title: playing ? "Pause background music" : "Play background music"
      },
        e("span", { className: "music-icon", "aria-hidden": "true" }, playing ? "II" : ">"),
        e("span", { className: "music-copy" },
          e("span", null, "BGM"),
          e("strong", null, errored ? "No audio" : (playing ? "Now Playing" : "Play Music"))
        ),
        e("span", { className: "music-bars", "aria-hidden": "true" },
          e("i", null), e("i", null), e("i", null))
      ),
      e("audio", { ref: audioRef, src: m.src || "", loop: true, preload: "none" })
    );
  }

  /* ---- TRAILER MODAL ---- */
  function Trailer(props) {
    var open = props.open, onClose = props.onClose, url = props.url;
    React.useEffect(function () {
      if (!open) return;
      window.dispatchEvent(new Event("rgse:pause-music"));
      var prev = document.body.style.overflow;
      var onKey = function (ev) { if (ev.key === "Escape") onClose(); };
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
      return function () { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
    }, [open, onClose]);
    if (!open) return null;
    return e("div", {
      role: "dialog", "aria-modal": "true", "aria-label": "RAN GS Eternity trailer",
      onClick: onClose,
      style: { position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(2,6,16,.86)", backdropFilter: "blur(10px)" }
    },
      e("div", {
        onClick: function (t) { t.stopPropagation(); },
        style: { position: "relative", width: "min(1040px, 100%)", border: "1px solid rgba(255,214,10,.55)", background: "rgba(8,12,24,.96)", boxShadow: "0 30px 90px rgba(0,0,0,.6)", clipPath: "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)" }
      },
        e("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 18px", borderBottom: "1px solid rgba(255,255,255,.12)" } },
          e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase" } }, "Now Playing / Trailer"),
          e("button", { type: "button", onClick: onClose, "aria-label": "Close trailer", style: { width: 42, height: 36, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.04)", color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: 18, lineHeight: 1, cursor: "pointer" } }, "x")
        ),
        e("div", { style: { position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#000" } },
          e("iframe", { src: url, title: "RAN GS Eternity trailer", allow: "autoplay; encrypted-media; fullscreen; picture-in-picture", allowFullScreen: true, referrerPolicy: "strict-origin-when-cross-origin", style: { position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 } })
        )
      )
    );
  }

  /* ---- RATE TIER (config-driven): low | lowhalf | mid | midhalf | high ----
     The displayed title is always LOW | MID | HIGH only. A "half" value does NOT
     change the title — it only shifts the bar fill position so it sits between
     two tiers (readable against the LOW / MID / HIGH scale below the bar). */
  function rateTierInfo(v) {
    var t = (v || "mid").toLowerCase();
    if (t === "low") return { label: "LOW", bar: 0.15, color: "#5aa9ff" };
    if (t === "lowhalf") return { label: "LOW", bar: 0.32, color: "#5aa9ff" };
    if (t === "mid") return { label: "MID", bar: 0.55, color: "var(--accent)" };
    if (t === "midhalf") return { label: "MID", bar: 0.72, color: "var(--accent)" };
    if (t === "high") return { label: "HIGH", bar: 0.9, color: "#ff6b6b" };
    return { label: (v || "MID").toUpperCase(), bar: 0.55, color: "var(--accent)" };
  }

  /* ---- HERO ---- */
  function Hero(props) {
    var h = C.hero || {};
    return e("section", {
      style: { position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", padding: "120px 48px" }
    },
      e("div", { style: { position: "absolute", inset: 0, backgroundImage: "url(" + (h.bg || "/assets/hero-bg.png") + ")", backgroundSize: "cover", backgroundPosition: "center", opacity: .35, filter: "blur(6px) saturate(1.2)" } }),
      e("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, var(--bg) 0%, rgba(10,16,32,.4) 40%, var(--bg) 100%)" } }),
      e("div", { style: { position: "relative", display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 40, alignItems: "center", maxWidth: 1280, margin: "0 auto", width: "100%" } },
        e("div", null,
          (C.site && C.site.version) ? e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, color: "var(--accent)", marginBottom: 18, textTransform: "uppercase" } }, esc(C.site.version) + " / " + (C.site.year || "2026")) : null,
          e("h1", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "clamp(56px, 9vw, 110px)", lineHeight: .9, letterSpacing: -2, margin: 0, color: "#fff" } }, esc(h.title || "RAN ONLINE")),
          e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: "clamp(28px, 4vw, 52px)", lineHeight: 1, letterSpacing: 2, color: "var(--accent)", marginTop: 6 } }, esc(h.subtitle || "ETERNITY EP9")),
          e("p", { style: { fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,.7)", maxWidth: 520, lineHeight: 1.6, marginTop: 22 } }, esc(h.description || "")),
          e("div", { style: { display: "flex", gap: 14, marginTop: 34, flexWrap: "wrap" } },
            e("button", {
              onClick: function () { props.onTrailer(); },
              style: { padding: "16px 26px", background: "transparent", color: "#fff", border: "1px solid rgba(255,214,10,.5)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }
            }, "▶ " + (h.ctaPlay || "WATCH TRAILER")),
            e("button", {
              onClick: function () { var el = document.getElementById("download"); if (el) el.scrollIntoView({ behavior: "smooth" }); },
              style: { padding: "16px 26px", background: "var(--accent)", color: "#0A1020", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 }
            }, h.ctaDownload || "DOWNLOAD NOW")
          )
        ),
        e("div", { style: { position: "relative", height: 420, display: "flex", alignItems: "center", justifyContent: "center" } },
          e("div", { style: { position: "absolute", width: 360, height: 360, borderRadius: "50%", border: "1px dashed rgba(255,214,10,.3)", animation: "spin 60s linear infinite" } }),
          e("div", { style: { position: "absolute", width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(255,214,10,.18)" } }),
          e("div", {
            style: { width: 320, height: 320, backgroundImage: "url(" + (h.bg || "/assets/hero-bg.png") + ")", backgroundSize: "cover", backgroundPosition: "center 25%", borderRadius: "50%", filter: "drop-shadow(0 30px 60px rgba(255,214,10,.25))", animation: "float 6s ease-in-out infinite" }
          })
        )
      )
    );
  }

  /* ---- SERVER (Server Information + Drop Rate tier) ---- */
  function Server() {
    var s = C.server || {};
    var stats = s.stats || [];
    var rates = s.rates || [];
    return e("section", { id: "server", style: { padding: "120px 48px", position: "relative", borderTop: "1px solid rgba(255,255,255,.06)" } },
      e("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 60, flexWrap: "wrap", gap: 16 } },
        e("div", null,
          e(Eyebrow, null, "// 01 — Configuration"),
          e("h2", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 92, lineHeight: .9, letterSpacing: -2, margin: "16px 0 0", color: "#fff" } },
            "SERVER", e("br", null), e("span", { style: { color: "var(--accent)" } }, "FEATURES."))
        ),
        e("div", { style: { maxWidth: 360, fontFamily: "'Inter', sans-serif", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,.6)" } }, esc(s.intro || ""))
      ),
      e("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, marginBottom: 60, border: "1px solid rgba(255,255,255,.08)" } },
        stats.map(function (t, n) {
          return e("div", {
            key: t.label, style: {
              padding: "36px 32px",
              borderRight: (n % 3 !== 2) ? "1px solid rgba(255,255,255,.08)" : "none",
              borderBottom: (n < 3) ? "1px solid rgba(255,255,255,.08)" : "none",
              position: "relative", background: (n % 2 === 0) ? "transparent" : "rgba(255,255,255,.015)"
            }
          },
            e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,.45)", marginBottom: 14 } }, esc(t.label)),
            e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 40, fontWeight: 700, color: "#fff", lineHeight: 1 } }, esc(t.value)),
            e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,.5)", marginTop: 8 } }, esc(t.note))
          );
        })
      ),
      e("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 18 } },
        rates.map(function (o) {
          var info = rateTierInfo(o.v);
          return e("div", {
            key: o.k, className: "card-hov", style: {
              position: "relative", padding: 24, minHeight: 150,
              border: "1px solid rgba(255,255,255,.1)", background: "rgba(8,12,24,.36)", backdropFilter: "blur(7px)",
              display: "flex", flexDirection: "column", gap: 12
            }
          },
            e(Corners, { pos: "tl", size: 20 }),
            e(Corners, { pos: "tr", size: 20 }),
            e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: "rgba(255,255,255,.5)", textTransform: "uppercase" } }, esc(o.k)),
            e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 26, fontWeight: 700, color: "#fff" } }, esc(info.label)),
            e("div", { style: { height: 4, borderRadius: 999, background: "rgba(255,255,255,.1)", overflow: "hidden" } },
              e("div", { style: { height: "100%", width: (Math.round(info.bar * 100)) + "%", background: info.color } })
            ),
            e("div", { style: { position: "relative", marginTop: 6 } },
              e("div", { style: { position: "absolute", top: -1, left: (Math.round(info.bar * 100)) + "%", width: 10, height: 10, marginLeft: -5, borderRadius: "50%", background: info.color, boxShadow: "0 0 8px " + info.color, transform: "translateY(-3px)" } }),
              e("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: 2, color: "rgba(255,255,255,.4)" } },
                e("span", { style: { color: info.label === "LOW" ? info.color : "rgba(255,255,255,.4)", fontWeight: info.label === "LOW" ? 700 : 400 } }, "LOW"),
                e("span", { style: { color: info.label === "MID" ? info.color : "rgba(255,255,255,.4)", fontWeight: info.label === "MID" ? 700 : 400 } }, "MID"),
                e("span", { style: { color: info.label === "HIGH" ? info.color : "rgba(255,255,255,.4)", fontWeight: info.label === "HIGH" ? 700 : 400 } }, "HIGH")
              )
            )
          );
        })
      )
    );
  }

  /* ---- CLASSES ---- */
  function Classes() {
    var list = C.classes || [];
    var [active, setX] = React.useState(0);
    var n = list[active] || {};
    if (list.length === 0) return e("section", { id: "classes" });
    function diffWord(d) { return d === 1 ? "VERY EASY" : d === 2 ? "EASY" : d === 3 ? "MEDIUM" : d === 4 ? "HARD" : "EXPERT"; }
    return e("section", { id: "classes", style: { position: "relative", padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,.06)", overflow: "hidden" } },
      e("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, var(--bg) 0%, rgba(10,16,32,.6) 30%, rgba(10,16,32,.6) 70%, var(--bg) 100%)" } }),
      e("div", { style: { position: "relative" } },
        e("div", { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 50, flexWrap: "wrap", gap: 12 } },
          e("div", null,
            e(Eyebrow, null, "// 02 — Roster"),
            e("h2", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 92, lineHeight: .9, letterSpacing: -2, margin: "16px 0 0", color: "#fff" } },
              "CHOOSE YOUR", e("br", null), e("span", { style: { color: "var(--accent)", fontStyle: "italic" } }, "LEGEND."))
          ),
          e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,.4)" } }, "ROSTER " + String(list.length).padStart(2, "0") + " / " + String(list.length).padStart(2, "0"))
        ),
        e("div", { style: { display: "grid", gridTemplateColumns: "260px 1fr 320px", gap: 32, alignItems: "stretch" } },
          e("div", { style: { display: "flex", flexDirection: "column", gap: 4 } },
            list.map(function (r, o) {
              return e("button", {
                key: r.name, onClick: function () { setX(o); }, style: {
                  textAlign: "left", padding: "18px 18px", cursor: "pointer",
                  background: o === active ? "rgba(255,214,10,.08)" : "rgba(255,255,255,.02)",
                  border: o === active ? "1px solid var(--accent)" : "1px solid rgba(255,255,255,.06)",
                  borderLeft: o === active ? "3px solid var(--accent)" : "3px solid transparent",
                  color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all .2s"
                }
              },
                e("span", null,
                  e("span", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "var(--accent)", letterSpacing: 2, marginRight: 10 } }, "0" + (o + 1)),
                  e("span", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, fontSize: 18, letterSpacing: 2 } }, r.name)
                ),
                o === active ? e("span", { style: { color: "var(--accent)" } }, "→") : null
              );
            })
          ),
          e("div", { style: { position: "relative", minHeight: 620, border: "1px solid rgba(255,255,255,.1)", overflow: "hidden" } },
            e(Corners, { pos: "tl", size: 28 }), e(Corners, { pos: "tr", size: 28 }),
            e(Corners, { pos: "bl", size: 28 }), e(Corners, { pos: "br", size: 28 }),
            e("div", { key: n.name, style: { position: "absolute", inset: 0, backgroundImage: "url(" + (n.img || "") + ")", backgroundSize: "auto 130%", backgroundPosition: "center 30%", backgroundRepeat: "no-repeat", animation: "fadeIn .5s ease", filter: "drop-shadow(0 30px 60px rgba(255,214,10,.2))" } }),
            e("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, transparent 55%, rgba(10,16,32,.95) 100%)" } }),
            e("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: "linear-gradient(to bottom, transparent, var(--accent), transparent)" } }),
            e("div", { style: { position: "absolute", top: 24, left: 24, fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,.6)", lineHeight: 1.8 } },
              e("div", null, "ID: ", e("span", { style: { color: "var(--accent)" } }, "RGSE-" + String(active + 1).padStart(3, "0"))),
              e("div", null, "SPEC: ", n.spec ? n.spec.toUpperCase() : "")
            ),
            e("div", { style: { position: "absolute", bottom: 28, left: 28, right: 28 } },
              e(Eyebrow, null, n.role),
              e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 88, fontWeight: 700, lineHeight: .9, color: "#fff", letterSpacing: -2, marginTop: 14 } }, n.name)
            )
          ),

          e("div", { style: { display: "flex", flexDirection: "column", gap: 14 } },
            e("div", { style: { padding: 20, border: "1px solid rgba(255,255,255,.1)", background: "rgba(10,16,32,.5)" } },
              e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,.5)", marginBottom: 18 } }, "◇ DIFFICULTY ON USING THE CLASS"),
              e("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 } },
                [1, 2, 3, 4, 5].map(function (r) { return e("span", { key: r, style: { flex: 1, height: 12, background: r <= (n.difficulty || 1) ? "var(--accent)" : "rgba(255,255,255,.08)", border: r <= (n.difficulty || 1) ? "none" : "1px solid rgba(255,255,255,.12)" } }); })
              ),
              e("div", { style: { display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2 } },
                e("span", { style: { color: "rgba(255,255,255,.5)" } }, "NOVICE"),
                e("span", { style: { color: "var(--accent)", fontWeight: 700 } }, diffWord(n.difficulty || 1)),
                e("span", { style: { color: "rgba(255,255,255,.5)" } }, "EXPERT")
              )
            ),
            e("div", { style: { padding: "16px 18px", background: "rgba(255,214,10,.06)", border: "1px solid rgba(255,214,10,.3)" } },
              e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: "var(--accent)", marginBottom: 8 } }, "◇ PLAYSTYLE"),
              e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,.72)", lineHeight: 1.5 } }, esc(n.playstyle || ""))
            ),
            e("div", { style: { padding: "16px 18px", background: "rgba(46,213,115,.07)", border: "1px solid rgba(46,213,115,.35)" } },
              e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: "rgb(46,213,115)", marginBottom: 8 } }, "◇ PVP ADVANTAGE"),
              e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(180,245,205,.85)", lineHeight: 1.5 } }, esc(n.pvpAdvantage || ""))
            ),
            e("div", { style: { padding: "16px 18px", background: "rgba(255,107,107,.07)", border: "1px solid rgba(255,107,107,.35)" } },
              e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: "rgb(255,107,107)", marginBottom: 8 } }, "◇ PVP DISADVANTAGE"),
              e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,200,200,.85)", lineHeight: 1.5 } }, esc(n.pvpDisadvantage || ""))
            )
          )
        )
      )
    );
  }
  function diffWord(d) { return d === 1 ? "VERY EASY" : d === 2 ? "EASY" : d === 3 ? "MEDIUM" : d === 4 ? "HARD" : "EXPERT"; }

  /* ---- COMBAT ---- */
  function Combat() {
    var cb = C.combat || {};
    var modes = cb.modes || [];
    var raids = cb.raids || [];
    var le = cb.liveEvent || {};
    return e("section", { id: "combat", style: { padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,.06)" } },
      e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" } },
        e("div", null,
          e(Eyebrow, null, "// 03 — Combat doctrine"),
          e("h2", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 92, lineHeight: .9, letterSpacing: -2, margin: "16px 0 12px", color: "#fff" } },
            "BREAK", e("br", null), e("span", { style: { color: "var(--accent)" } }, "EVERYTHING.")),
          e("p", { style: { fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,.6)", maxWidth: 460, lineHeight: 1.6 } }, esc(cb.intro || ""))
        ),
        e("div", { style: { position: "relative", padding: "32px 28px", border: "1px solid var(--accent)", background: "rgba(255,214,10,.04)" } },
          e(Corners, { pos: "tl" }), e(Corners, { pos: "br" }),
          e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: "var(--accent)", marginBottom: 8 } }, "▶ LIVE EVENT"),
          e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginBottom: 6 } }, esc(le.title || "")),
          e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,.65)" } }, esc(le.desc || "")),
          le.schedule ? e("div", { style: { marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,214,10,.22)", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase" } }, esc(le.schedule)) : null
        )
      ),
      e("div", { style: { marginTop: 50 } },
        e("div", { style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 22 } },
          e("span", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, color: "var(--accent)" } }, "// PVP MODES"),
          e("span", { style: { flex: 1, height: 1, background: "rgba(255,255,255,.1)" } }),
          e("span", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,.4)" } }, modes.length + " modes")
        ),
        e("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 } },
          modes.map(function (t, n) {
            return e("div", {
              key: t.n, className: "card-hov", style: {
                padding: "24px 20px", border: "1px solid rgba(255,255,255,.1)", position: "relative",
                background: t.hot ? "linear-gradient(180deg, rgba(255,214,10,.08), rgba(255,214,10,0))" : "rgba(255,255,255,.02)",
                minHeight: 230, display: "flex", flexDirection: "column", justifyContent: "space-between"
              }
            },
              t.hot ? e(Eyebrow, null, "● HOT") : null,
              e("div", null,
                e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "rgba(255,255,255,.4)", marginBottom: 8 } }, "P", String(n + 1).padStart(2, "0")),
                e("div", null,
                  e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", lineHeight: 1.1, letterSpacing: 1, marginBottom: 8 } }, esc(t.n)),
                  e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,.55)", marginBottom: 14 } }, esc(t.t)),
                  e("div", { style: { display: "grid", gap: 8, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.08)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 1 } },
                    e("div", { style: { display: "flex", justifyContent: "space-between", gap: 12 } },
                      e("span", { style: { color: "rgba(255,255,255,.4)" } }, "SCALE"),
                      e("span", { style: { color: "var(--accent)" } }, esc(t.cap))
                    ),
                    e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 } },
                      e("span", { style: { color: "rgba(255,255,255,.4)" } }, "SCHEDULE"),
                      e("span", { style: { color: "var(--accent)", textAlign: "right", lineHeight: 1.4 } }, esc(t.schedule))
                    )
                  )
                )
              )
            );
          })
        ),

        e("div", { style: { marginTop: 50 } },
          e("div", { style: { display: "flex", alignItems: "center", gap: 16, marginBottom: 22 } },
            e("span", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, color: "var(--accent)" } }, "// PVE CONTENT"),
            e("span", { style: { flex: 1, height: 1, background: "rgba(255,255,255,.1)" } }),
            e("span", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, color: "rgba(255,255,255,.4)" } }, raids.length + " pillars")
          ),
          e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 } },
            raids.map(function (t, n) {
              return e("div", {
                key: t.n, className: "card-hov", style: {
                  padding: "32px 32px", border: "1px solid rgba(255,255,255,.12)", display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "end", minHeight: 200,
                  background: "linear-gradient(135deg, rgba(255,255,255,.03), rgba(255,255,255,0))"
                }
              },
                e("div", null,
                  e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: "rgba(255,255,255,.4)", marginBottom: 10 } }, "RAID 0" + (n + 1)),
                  e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 44, fontWeight: 700, color: "#fff", letterSpacing: -1, lineHeight: 1, marginBottom: 12 } }, esc(t.n)),
                  e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,.6)", marginBottom: 18 } }, esc(t.t)),
                  e("div", { style: { display: "inline-flex", gap: 10, alignItems: "center", padding: "8px 10px", border: "1px solid rgba(255,214,10,.25)", background: "rgba(255,214,10,.05)", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase" } },
                    e("span", { style: { color: "rgba(255,255,255,.45)" } }, "DAILY LIMIT"),
                    e("span", null, esc(t.limit))
                  )
                ),
                e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 120, fontWeight: 700, color: "rgba(255,214,10,.12)", lineHeight: 1, letterSpacing: -4 } }, "0" + (n + 1))
              );
            })
          )
        )
      )
    );
  }

  /* ---- ROADMAP ---- */
  function Roadmap() {
    var r = C.roadmap || {};
    var items = r.items || [];
    var doneCount = items.filter(function (i) { return (i.status || "").toUpperCase() === "DONE"; }).length;
    var progress = parseInt(r.progress, 10);
    var hasProgress = items.length && progress >= 1 && progress <= items.length;
    var fillPct = hasProgress ? ((progress - 1) / items.length) * 100 : (items.length ? (100 * doneCount / items.length) : 12.5);
    function statusColor(s) {
      s = (s || "").toUpperCase();
      if (s === "DONE") return "var(--accent)";
      if (s === "IN PROGRESS") return "#5aa9ff";
      if (s === "PLANNED") return "rgba(255,255,255,.6)";
      return "rgba(255,255,255,.35)";
    }
    return e("section", { id: "roadmap", style: { padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,.06)" } },
      e("div", { style: { marginBottom: 60 } },
        e(Eyebrow, null, "// 04 — Roadmap"),
        e("h2", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 92, lineHeight: .9, letterSpacing: -2, margin: "16px 0 0", color: "#fff" } },
          "THE PATH", e("br", null), e("span", { style: { color: "var(--accent)", fontStyle: "italic" } }, "FORWARD."))
      ),
      e("div", { style: { position: "relative" } },
        e("div", { style: { position: "absolute", top: 31, left: "12.5%", right: "12.5%", height: 1, background: "rgba(255,255,255,.12)" } }),
        e("div", { style: { position: "absolute", top: 31, left: "12.5%", width: fillPct + "%", height: 1, background: "var(--accent)" } }),
        e("div", { style: { display: "grid", gridTemplateColumns: "repeat(" + Math.max(1, items.length) + ", minmax(0,1fr))", gap: 0, position: "relative" } },
          items.map(function (t, n) {
            return e("div", { key: t.phase, style: { textAlign: "center", padding: "0 16px" } },
              e("div", { style: { width: 14, height: 14, borderRadius: "50%", margin: "24px auto", background: ((hasProgress && n === progress - 1) || (t.status || "").toUpperCase() === "DONE") ? "var(--accent)" : "transparent", border: "2px solid " + ((hasProgress && n === progress - 1) ? "var(--accent)" : statusColor(t.status)), boxShadow: (hasProgress && n === progress - 1) ? "0 0 0 5px rgba(255,214,10,.16)" : "none" } }),
              e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,.45)", marginBottom: 10 } }, esc(t.phase)),
              e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 14 } }, esc(t.title)),
              e("div", { style: { display: "inline-block", fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 2, color: statusColor(t.status), textTransform: "uppercase", border: "1px solid " + statusColor(t.status), padding: "4px 10px", borderRadius: 999, marginBottom: 16 } }, esc(t.status)),
              e("ul", { style: { listStyle: "none", padding: 0, margin: 0, textAlign: "left", display: "grid", gap: 8 } },
                (t.points || []).map(function (p, i) {
                  return e("li", { key: i, style: { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.4 } }, "— " + esc(p));
                })
              )
            );
          })
        )
      )
    );
  }

  /* ---- DOWNLOAD ---- */
  function Download() {
    var d = C.download || {};
    var mirrors = d.mirrors && d.mirrors.length ? d.mirrors : (window.RGSE_DOWNLOAD_MIRRORS || {});
    var cards = [];
    function pushGroup(group) { (group || []).forEach(function (m) { cards.push(m); }); }
    pushGroup(mirrors.googleDrive); pushGroup(mirrors.mediafire);
    if (!cards.length) {
      cards = [
        { label: "Google Drive", url: d.discordUrl || "#", note: "Full client" },
        { label: "MediaFire", url: d.facebookUrl || "#", note: "Full client" }
      ];
    }
    return e("section", { id: "download", style: { position: "relative", padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,.06)", overflow: "hidden" } },
      e("div", { className: "download-art-bg", "aria-hidden": "true" }),
      e("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,16,32,.9) 0%, rgba(12,20,40,.38) 42%, rgba(10,16,32,.9) 100%), linear-gradient(90deg, rgba(10,16,32,.82) 0%, rgba(10,16,32,.3) 48%, rgba(10,16,32,.68) 100%)" } }),
      e("div", { style: { position: "relative", maxWidth: 1280, margin: "0 auto" } },
        e("div", { style: { marginBottom: 50 } },
          e(Eyebrow, null, "// 05 — Get the game"),
          e("h2", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 96, lineHeight: .9, letterSpacing: -2, margin: "16px 0 18px", color: "#fff" } },
            esc(d.title || "GET IN THE"), e("br", null), e("span", { style: { color: "var(--accent)" } }, esc(d.accent || "FIGHT."))),
          e("p", { style: { fontFamily: "'Inter', sans-serif", fontSize: 15, color: "rgba(255,255,255,.6)", maxWidth: 520, lineHeight: 1.6 } }, esc(d.intro || ""))
        ),
        e("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 18 } },
          cards.map(function (m, i) {
            return e("a", {
              key: i, href: m.url || "#", target: "_blank", rel: "noopener",
              className: "card-hov", style: {
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                padding: "26px 28px", border: "1px solid rgba(255,255,255,.14)", background: "rgba(8,12,24,.55)",
                backdropFilter: "blur(8px)", textDecoration: "none", color: "#fff"
              }
            },
              e("div", null,
                e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 1 } }, esc(m.label)),
                e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,.5)", marginTop: 4 } }, esc(m.note || ""))
              ),
              e("span", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 18, color: "var(--accent)" } }, "↓")
            );
          })
        )
      )
    );
  }

  /* ---- COMMUNITY ---- */
  function Community() {
    var cm = C.community || {};
    var stats = cm.stats || [];
    return e("section", { id: "community", style: { position: "relative", padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,.06)", overflow: "hidden" } },
      e("div", { style: { position: "absolute", inset: 0, backgroundImage: "url(/assets/discord-bg.png)", backgroundSize: "cover", backgroundPosition: "center", opacity: .55 } }),
      e("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(90deg, var(--bg) 0%, rgba(10,16,32,.7) 50%, var(--bg) 100%)" } }),
      e("div", { style: { position: "relative", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "center" } },
        e("div", null,
          e(Eyebrow, null, "// 06 — Community"),
          e("h2", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 92, lineHeight: .9, letterSpacing: -2, margin: "16px 0 20px", color: "#fff" } },
            esc(cm.title || "JOIN THE"), e("br", null), e("span", { style: { color: "var(--accent)", fontStyle: "italic" } }, esc(cm.accent || "LEGEND."))),
          e("p", { style: { fontFamily: "'Inter', sans-serif", fontSize: 16, color: "rgba(255,255,255,.7)", maxWidth: 540, lineHeight: 1.6, marginBottom: 36 } }, esc(cm.desc || "")),
          e("div", { style: { display: "flex", gap: 14, marginBottom: 40, flexWrap: "wrap" } },
            e("button", { onClick: function () { open(cm.discordUrl); }, style: { padding: "18px 28px", background: "var(--accent)", color: "#0A1020", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 } }, "JOIN DISCORD →"),
            e("button", { onClick: function () { open(cm.facebookUrl); }, style: { padding: "18px 28px", background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,.25)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer" } }, "FACEBOOK PAGE")
          ),
          stats.length ? e("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, maxWidth: 360 } },
            stats.map(function (row) {
              return e("div", { key: row[1] },
                e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 38, fontWeight: 700, color: "var(--accent)", lineHeight: 1 } }, esc(row[0])),
                e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,.55)" } }, esc(row[1]))
              );
            })
          ) : null
        ),
        e("div", { style: { display: "flex", justifyContent: "center" } },
          e("div", { style: { width: "100%", maxWidth: 420, aspectRatio: "9 / 16", border: "1px solid rgba(255,214,10,.3)", background: "rgba(8,12,24,.6)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14, textAlign: "center", padding: 24 } },
            e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 3, color: "var(--accent)", textTransform: "uppercase" } }, "DISCORD"),
            e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 26, fontWeight: 700, color: "#fff" } }, "Connect Live"),
            e("button", { onClick: function () { open(cm.discordUrl); }, style: { padding: "14px 22px", background: "var(--accent)", color: "#0A1020", border: "none", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", fontWeight: 700 } }, "OPEN DISCORD")
          )
        )
      )
    );
  }

  /* ---- FACEBOOK ---- */
  function Facebook() {
    var f = C.facebook || {};
    return e("section", { id: "facebook", style: { position: "relative", padding: "120px 48px", borderTop: "1px solid rgba(255,255,255,.06)", overflow: "hidden" } },
      e("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,16,32,1) 0%, rgba(20,30,60,.9) 50%, rgba(10,16,32,1) 100%)" } }),
      e("div", { style: { position: "relative", maxWidth: 1280, margin: "0 auto" } },
        e("div", { style: { marginBottom: 50 } },
          e(Eyebrow, null, "// 07 - Facebook"),
          e("h2", { style: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 96, lineHeight: .9, letterSpacing: -2, margin: "16px 0 18px", color: "#fff" } },
            esc(f.title || "FIND US ON"), e("br", null), e("span", { style: { color: "var(--accent)" } }, esc(f.accent || "FACEBOOK.")))
        ),
        e("div", { style: { display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: 28, alignItems: "start" } },
          e("div", { className: "facebook-feed-frame", style: { position: "relative", minHeight: 460, border: "1px solid rgba(255,255,255,.12)", background: "rgba(8,12,24,.5)", overflow: "hidden" } },
            e("iframe", {
              src: "https://www.facebook.com/plugins/page.php?href=https://www.facebook.com/" + encodeURIComponent(f.pageId || "RanGsEternityEp9") + "&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId",
              title: "Facebook feed", width: "100%", height: "600", style: { border: 0, width: "100%" }, loading: "lazy"
            })
          ),
          e("div", { style: { display: "flex", flexDirection: "column", gap: 16 } },
            e("a", { href: "https://facebook.com/" + (f.pageId || "RanGsEternityEp9"), target: "_blank", rel: "noopener", className: "card-hov", style: { display: "block", padding: "24px", border: "1px solid rgba(255,255,255,.14)", background: "rgba(8,12,24,.5)", textDecoration: "none", color: "#fff" } },
              e("div", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700 } }, "Visit Page"),
              e("div", { style: { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,.55)", marginTop: 6 } }, "@" + esc(f.pageId || "RanGsEternityEp9"))
            )
          )
        )
      )
    );
  }

  /* ---- FOOTER ---- */
  function Footer() {
    var ft = C.footer || {};
    var site = C.site || {};
    var cols = ft.columns || [];
    return e("footer", { style: { padding: "60px 48px 30px", borderTop: "1px solid rgba(255,255,255,.08)", background: "rgba(8,12,24,.6)" } },
      e("div", { style: { display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 60, marginBottom: 50 } },
        e("div", null,
          e("div", { style: { display: "flex", alignItems: "center", gap: 14, marginBottom: 18 } },
            e("img", { src: site.logo || "/assets/logo.png", alt: "", style: { height: 50 } }),
            e("div", { style: { display: "flex", flexDirection: "column", lineHeight: 1.1 } },
              e("span", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: 3, color: "var(--accent)" } }, site.brandShort || "RAN GS"),
              e("span", { style: { fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 2, color: "#fff" } }, site.brandLong || "ETERNITY")
            )
          ),
          e("p", { style: { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.6, maxWidth: 320 } }, esc(ft.tagline || ""))
        ),
        cols.map(function (col, ci) {
          return e("div", { key: ci },
            e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 2, color: "var(--accent)", textTransform: "uppercase", marginBottom: 16 } }, esc(col.title)),
            e("div", { style: { display: "flex", flexDirection: "column", gap: 10 } },
              (col.links || []).map(function (l, li) {
                return e("a", { key: li, href: l.href, target: l.href && l.href.indexOf("http") === 0 ? "_blank" : null, rel: "noopener", style: { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "rgba(255,255,255,.65)", textDecoration: "none" } }, esc(l.label));
              })
            )
          );
        })
      ),
      e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 24, flexWrap: "wrap", gap: 12 } },
        e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 1, color: "rgba(255,255,255,.4)" } }, esc(ft.copyright || "")),
        e("div", { style: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, letterSpacing: 1, color: "rgba(255,255,255,.3)" } }, esc((site.version || "EP9") + " / " + (site.year || "2026")))
      )
    );
  }

  /* ---- APP ---- */
  function App() {
    var [trailer, setTrailer] = React.useState(false);
    var hero = C.hero || {};
    var site = C.site || {};
    React.useEffect(function () {
      if (site.title) document.title = site.title + (site.tagline ? " — " + site.tagline : "");
      if (site.favicon) { var l = document.getElementById("page-favicon"); if (l) l.href = site.favicon; }
    }, []);
    return e(React.Fragment, null,
      e(Nav),
      e("main", null,
        e(Hero, { onTrailer: function () { setTrailer(true); } }),
        e(Server),
        e(Classes),
        e(Combat),
        e(Roadmap),
        e(Download),
        e(Community),
        e(Facebook)
      ),
      e(Footer),
      e(MusicControl),
      e(Trailer, { open: trailer, onClose: function () { setTrailer(false); }, url: hero.ctaPlayUrl || "" })
    );
  }

  function boot() {
    if (window.React && window.ReactDOM && document.getElementById("root")) {
      ReactDOM.render(e(App), document.getElementById("root"));
    } else {
      window.setTimeout(boot, 30);
    }
  }
  boot();
})();

