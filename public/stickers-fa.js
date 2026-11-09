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
        ${L.faMid ? L.faMid(s.id) : ''}${L.faFx ? L.faFx(s.id) : ''}${L.faPop(s.id)}${label(s)}
      </div>`
    : `<div class="stk-face stk-front stk-fa">
        <div class="fa-bg">${L.art(s.id)}</div>
        <div class="fa-art">${L.art(s.id)}</div>
        <div class="fa-foil"></div><div class="fa-glint"></div>${label(s)}
      </div>`;
  const square = (L, s) => real(L, s)
    ? `<div class="stk-square stk-fa-sq real">${L.faArt(s.id)}${L.faMidFlat && L.faMidFlat(s.id) ? `<div class="fa-sq-mid">${L.faMidFlat(s.id)}</div>` : ''}<div class="fa-foil"></div><div class="stk-sq-pop fa-sq-pop">${L.faPopFlat(s.id)}</div><div class="fa-glint"></div><span class="fa-chip">FA</span></div>`
    : `<div class="stk-square stk-fa-sq">${L.art(s.id)}<div class="fa-foil"></div><div class="fa-glint"></div><span class="fa-chip">FA</span></div>`;

  // 3D-Quadrat fuers Profil (v6.9.0, Nutzer: FA im Profil "nicht 3d genug"):
  // wie square3d der Animated Rares - Szene flach, Mittelebene + Figur als echte
  // Schichten in der 3D-Kette, tiltTo hebt sie an (gleiche Tiefe wie im Album).
  // Ausschnitt oben buendig (wie die obere Kartenhaelfte) - so liegen Szene,
  // Mittelebene und Figur genau wie auf der Album-Karte uebereinander.
  const top = h => h.replace(/xMidYMid slice/g, 'xMidYMin slice');
  const square3d = (L, s) => real(L, s)
    ? `<div class="stk-sq3d fa"><div class="stk-square stk-fa-sq real">${top(L.faArt(s.id))}<div class="fa-foil"></div><div class="fa-glint"></div></div>${L.faMid ? top(L.faMid(s.id)) : ''}${L.faFx ? top(L.faFx(s.id)) : ''}${L.faPop(s.id)}<span class="fa-chip">FA</span></div>`
    : square(L, s);

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
  /* Bewegte 3D-Ebene (v6.9.0): EIN flaches Blatt ohne Kanten-Schichten/Filter auf ~65 %
     Hoehe - darf sich drehen/pulsieren, ohne dass die Ebene treppig wird */
  .stk-fa.real .fa-fx, .stk-sq3d.fa > .fa-fx { position: absolute; inset: 0; z-index: 2; pointer-events: none; transform: translateZ(calc(var(--lift, 0px) * .65)) scale(calc(1 - (1 - var(--comp, 1)) * .65)); transition: transform .3s ease-out; }
  .stk-fa.real .fa-fx svg, .stk-sq3d.fa > .fa-fx svg { width: 100%; height: 100%; display: block; overflow: visible; }
  .stk-sq3d.fa > .fa-fx svg { overflow: hidden; }
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
  .stk-sq3d.fa > .stk-square { box-shadow: 0 0 14px rgba(196,155,255,.45), 0 6px 14px rgba(0,0,0,.45); }
  .stk-sq3d.fa > .pop, .stk-sq3d.fa > .pop-shadow { inset: 9.8% 4% auto 4%; aspect-ratio: 1; }
  .stk-sq3d.fa > .fa-mid, .stk-sq3d.fa > .fa-mid-shadow { position: absolute; inset: 0; pointer-events: none; border-radius: 12px; }
  .stk-sq3d.fa > .fa-mid { transform: translateZ(calc(var(--lift, 0px) * .45 + var(--i, 0) * var(--step, 0px) * .6)) scale(calc(1 - (1 - var(--comp, 1)) * .45)); transition: transform .3s ease-out; }
  /* Mittelebene im Quadrat auf den Bildausschnitt der Szene begrenzen (sonst ragt z.B. die Krone oben raus) */
  .stk-sq3d.fa > .fa-mid svg, .stk-sq3d.fa > .fa-mid-shadow svg { overflow: hidden; }
  .stk-sq3d.fa > .fa-mid.slab { filter: brightness(var(--shade, .5)) saturate(1.1); }
  .stk-sq3d.fa > .fa-mid-shadow { transform: translate(1.5%, 2.5%); filter: brightness(0) blur(3px); opacity: .45; }
  .stk-sq3d.fa > .fa-chip { position: absolute; z-index: 3; right: 5%; bottom: 5%; padding: 0 .45em; border-radius: .6em; font: bold .55em/1.6 Georgia, serif; color: #2a1640; background: linear-gradient(115deg, #ffd1ea, #fff1b8, #c8ffd4, #c6ecff, #e3d1ff); box-shadow: 0 1px 3px rgba(0,0,0,.5); transform: translateZ(1px); }
  .stk-fa-sq.real > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
  .stk-fa-sq .fa-sq-pop { inset: 6% 4% auto 4%; aspect-ratio: 1; }
  .stk-fa-sq .fa-chip { position: absolute; z-index: 3; right: 5%; bottom: 5%; padding: 0 .45em; border-radius: .6em; font: bold .55em/1.6 Georgia, serif; color: #2a1640; background: linear-gradient(115deg, #ffd1ea, #fff1b8, #c8ffd4, #c6ecff, #e3d1ff); box-shadow: 0 1px 3px rgba(0,0,0,.5); }
  @keyframes faFoil { from { background-position: 0 0, 0 0; } to { background-position: 0 0, -24em 0; } }
  @keyframes faGlint { from { background-position: 0 0; } to { background-position: 16em 0; } }
  html.fx-off .stk-fa *, html.fx-paused .stk-fa *, html.fx-off .stk-fa-sq *, html.fx-paused .stk-fa-sq * { animation-play-state: paused !important; }`;
  document.head.appendChild(css);
  // Profil-Quadrat zeigt nur y 0..120 der 120x168-Szene. Teile, die unten
  // angeschnitten waeren, lieber ganz weglassen (Nutzer: "wenn dann lieber 100%
  // abcutten", z.B. die 5 Totenkoepfe der Pentakill-FA). Mittelebene: alles mit
  // mehr als 25 % abgeschnitten; Szene: nur kleine Teile (Boden/Himmel bleiben).
  const CUT = 120;
  function trimSquare(box) {
    if (box.dataset.trimmed) return;
    box.dataset.trimmed = '1';
    box.querySelectorAll(':scope > .stk-square > svg, :scope > .fa-mid > svg, :scope > .fa-mid-shadow > svg').forEach(svg => {
      const mid = !svg.parentElement.classList.contains('stk-square');
      let kids = [...svg.children].filter(k => k.tagName !== 'defs');
      if (kids.length === 1 && kids[0].tagName === 'g' && kids[0].getAttribute('filter')) kids = [...kids[0].children];
      kids.forEach(k => {
        let b;
        try { b = k.getBBox(); } catch (e) { return; }
        if (!b || !b.height) return;
        const m = k.transform && k.transform.baseVal.consolidate();
        let y1 = b.y, y2 = b.y + b.height;
        if (m) {
          const M = m.matrix, ys = [[b.x, b.y], [b.x + b.width, b.y], [b.x, y2], [b.x + b.width, y2]].map(([x, y]) => M.b * x + M.d * y + M.f);
          y1 = Math.min(...ys); y2 = Math.max(...ys);
        }
        const h = y2 - y1;
        if (y1 >= CUT + 2 || y2 <= CUT + .5) return;   // +2: Konturen (getBBox ohne stroke)
        if ((y2 - CUT) / h > .25 && (mid || h < 40)) k.style.display = 'none';
      });
    });
  }
  const trimAll = () => document.querySelectorAll('.stk-sq3d.fa:not([data-trimmed])').forEach(trimSquare);
  let trimQ = false;
  new MutationObserver(() => { if (trimQ) return; trimQ = true; requestAnimationFrame(() => { trimQ = false; trimAll(); }); })
    .observe(document.documentElement, { childList: true, subtree: true });
  window.STICKER_FA = { front, square, square3d, num, real };
})();
