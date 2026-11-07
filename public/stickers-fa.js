// Three-Trick-Pony - Full Arts (v6.6.0, Nutzer 2026-11-07).
// Eine FA ist die Full-Art-Version einer bestehenden Karte (z.B. #027FA) - egal
// welche Raritaet die Vorlage hatte, alle FAs haben denselben besonderen Stil
// (technisch "Full Art Animated Rares"). Welche Karten eine FA haben, ist geheim
// (server/lib/stickers.js fullArts); hier nur die Darstellung.
// Echte FA-Kunst liefert das Set selbst (L.faArt = Vollbild-Szene 120x168,
// L.faPop = Hologramm-Figur mit Schichten). Fehlt sie noch, gibt es einen
// Platzhalter aus der normalen Kunst.
(function () {
  const pad = n => String(n).padStart(3, '0');
  const num = s => `#${pad(s.n)}FA`;
  const real = (L, s) => !!(L.faArt && L.faArt(s.id));
  const label = s => `<div class="fa-name">${s.name}</div><div class="fa-meta"><span>FULL ART</span><span>${num(s)}</span></div>`;
  // Echte FA: Szene als flaches Blatt (darf clippen/filtern), Figur-Schichten
  // direkt in der 3D-Kette der Karte (keine Filter/Transparenz auf Zwischenebenen)
  const front = (L, s) => real(L, s)
    ? `<div class="stk-face stk-front stk-fa real">
        <div class="fa-scene">${L.faArt(s.id)}<div class="fa-foil"></div><div class="fa-glint"></div><div class="fa-shade"></div></div>
        ${L.faMid ? L.faMid(s.id) : ''}${L.faPop(s.id)}${label(s)}
      </div>`
    : `<div class="stk-face stk-front stk-fa">
        <div class="fa-bg">${L.art(s.id)}</div>
        <div class="fa-art">${L.art(s.id)}</div>
        <div class="fa-foil"></div><div class="fa-glint"></div>${label(s)}
      </div>`;
  const square = (L, s) => real(L, s)
    ? `<div class="stk-square stk-fa-sq real">${L.faArt(s.id)}${L.faMidFlat && L.faMidFlat(s.id) ? `<div class="fa-sq-mid">${L.faMidFlat(s.id)}</div>` : ''}<div class="fa-foil"></div><div class="stk-sq-pop fa-sq-pop">${L.faPopFlat(s.id)}</div><div class="fa-glint"></div><span class="fa-chip">FA</span></div>`
    : `<div class="stk-square stk-fa-sq">${L.art(s.id)}<div class="fa-foil"></div><div class="fa-glint"></div><span class="fa-chip">FA</span></div>`;

  const RAINBOW = 'linear-gradient(115deg, #ff9ad5, #ffe08a, #9dffb0, #8fd8ff, #c49bff, #ff9ad5)';
  const css = document.createElement('style');
  css.textContent = `
  .stk-fa { position: absolute; inset: 0; border-radius: 12px; overflow: hidden; padding: 0; border: 2px solid transparent;
    background: linear-gradient(#0b1020, #0b1020) padding-box, ${RAINBOW} border-box; }
  .stk-fa .fa-bg { position: absolute; inset: -12%; filter: blur(.35em) saturate(1.4) brightness(.75); transform: scale(1.35); }
  .stk-fa .fa-bg svg, .stk-fa .fa-art svg { width: 100%; height: 100%; display: block; }
  .stk-fa .fa-art { position: absolute; left: 0; right: 0; top: 4%; aspect-ratio: 1; transform: scale(1.12); transform-origin: 50% 40%;
    -webkit-mask: linear-gradient(#000 70%, transparent 98%); mask: linear-gradient(#000 70%, transparent 98%); }
  /* echte FA: Karte selbst traegt die 3D-Kette, die Szene ist ein geclipptes Blatt */
  .stk-fa.real { overflow: visible; border: none; background: none; transform-style: preserve-3d; box-shadow: 0 0 16px rgba(196,155,255,.35); }
  .stk-fa.real .fa-scene { position: absolute; inset: 0; border-radius: 12px; overflow: hidden; border: 2px solid transparent; background: #0b1020 padding-box, ${RAINBOW} border-box; }
  .stk-fa.real .fa-scene > svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; border-radius: 10px; }
  .stk-fa .fa-shade { position: absolute; left: 0; right: 0; bottom: 0; height: 30%; background: linear-gradient(transparent, rgba(0,0,0,.78)); pointer-events: none; }
  .stk-fa.real .pop, .stk-fa.real .pop-shadow { left: 4%; right: 4%; top: 7%; }
  /* Mittlere Ebene (Nutzer): Hintergrund-Teile auf ~45 % der Figurenhoehe - gleiche
     Perspektiv-Ausgleichsrechnung wie die Figur, nur mit 45 % von --lift */
  .stk-fa.real .fa-mid, .stk-fa.real .fa-mid-shadow { position: absolute; inset: 0; pointer-events: none; border-radius: 12px; }
  .stk-fa.real .fa-mid { z-index: 2; transform: translateZ(calc(var(--lift, 0px) * .45 + var(--i, 0) * var(--step, 0px) * .6)) scale(calc(1 - (1 - var(--comp, 1)) * .45)); transition: transform .3s ease-out; }
  .stk-fa.real .fa-mid.slab { filter: brightness(var(--shade, .5)) saturate(1.1); }
  .stk-fa.real .fa-mid-shadow { z-index: 1; transform: translate(1.5%, 2.5%); filter: brightness(0) blur(3px); opacity: .45; }
  .stk-fa.real .fa-mid svg, .stk-fa.real .fa-mid-shadow svg { width: 100%; height: 100%; overflow: visible; display: block; }
  .stk-fa-sq .fa-sq-mid { position: absolute; inset: 0; pointer-events: none; filter: drop-shadow(2px 3px 2px rgba(0,0,0,.5)); }
  .stk-fa-sq .fa-sq-mid svg { width: 100%; height: 100%; display: block; }
  .stk-fa .fa-foil, .stk-fa-sq .fa-foil { position: absolute; inset: 0; pointer-events: none; opacity: .32;
    background: repeating-linear-gradient(60deg, rgba(255,255,255,.0) 0 .35em, rgba(255,255,255,.35) .35em .42em),
                linear-gradient(115deg, #ff9ad5, #ffe08a 20%, #9dffb0 40%, #8fd8ff 60%, #c49bff 80%, #ff9ad5);
    background-size: auto, 24em 100%; background-repeat: repeat, repeat-x; animation: faFoil 8s linear infinite; }
  .stk-fa.real .fa-foil, .stk-fa-sq.real .fa-foil { opacity: .16; }
  .stk-fa .fa-glint, .stk-fa-sq .fa-glint { position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(105deg, transparent 0%, transparent 38%, rgba(255,255,255,.38) 50%, transparent 62%, transparent 100%); background-size: 16em 100%; background-repeat: repeat-x; animation: faGlint 4s linear infinite; }
  .stk-fa .fa-name { position: absolute; z-index: 5; left: 0; right: 0; bottom: 11%; text-align: center; font-family: 'Cinzel', Georgia, serif; font-weight: bold; font-size: .78em; color: #fff; letter-spacing: .5px; text-shadow: 0 1px 4px #000, 0 0 10px rgba(0,0,0,.8); }
  .stk-fa .fa-meta { position: absolute; z-index: 5; left: 6%; right: 6%; bottom: 4%; display: flex; justify-content: space-between; font-size: .5em; font-weight: bold; letter-spacing: 1px; color: #fff; text-shadow: 0 1px 3px #000; }
  .stk-fa .fa-meta span:first-child { background: linear-gradient(90deg, #ffd1ea, #fff1b8, #c8ffd4, #c6ecff); -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: none; }
  .stk-fa-sq { position: relative; }
  .stk-fa-sq.real > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .stk-fa-sq .fa-sq-pop { inset: 6% 4% auto 4%; aspect-ratio: 1; }
  .stk-fa-sq .fa-chip { position: absolute; z-index: 3; right: 5%; bottom: 5%; padding: 0 .45em; border-radius: .6em; font: bold .55em/1.6 Georgia, serif; color: #2a1640; background: linear-gradient(115deg, #ffd1ea, #fff1b8, #c8ffd4, #c6ecff, #e3d1ff); box-shadow: 0 1px 3px rgba(0,0,0,.5); }
  @keyframes faFoil { from { background-position: 0 0, 0 0; } to { background-position: 0 0, -24em 0; } }
  @keyframes faGlint { from { background-position: 0 0; } to { background-position: 16em 0; } }
  html.fx-off .stk-fa *, html.fx-paused .stk-fa *, html.fx-off .stk-fa-sq *, html.fx-paused .stk-fa-sq * { animation-play-state: paused !important; }`;
  document.head.appendChild(css);
  window.STICKER_FA = { front, square, num, real };
})();
