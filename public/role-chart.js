// Rollen-Balkendiagramm (explizite Nutzeranfrage 2026-09-30) - gemeinsam
// genutzt von role.html (volle Version mit Champ-Listen) und overview.html
// (Mini-Version in der "Roles & Picks"-Karte). Daten: roleStats aus dem
// /api/summary-batch-Ergebnis (server.js runSummaryBatch()).
//
// Vier Kategorien auf der x-Achse: Main Role mit Pool-Champ ("Ponys"), Main
// Role mit anderem Champ, Second Role (jeder Champ), Off Role. Jeder Balken
// ist so hoch wie die Anzahl Spiele, gestapelt in Wins (unten) und Losses
// (oben). Skala: der hoechste Balken reicht (nahezu) bis ganz oben, die
// Achse endet beim hoechsten Wert aufgerundet auf eine "runde" Schrittweite -
// so bleibt das Diagramm gleich gross, egal ob 8 oder 200 Spiele.
// Farben nur aus Theme-Variablen (--green/--red), damit es in allen 8 Themes
// passt.
(function () {
  const ROLE_LABELS = { TOP: 'Top', JUNGLE: 'Jungle', MIDDLE: 'Mid', BOTTOM: 'Bottom', UTILITY: 'Support' };
  const CATEGORY_IDS = ['mainPony', 'mainOther', 'second', 'off'];
  // 3 Champs direkt sichtbar, der Rest per "▾ N more" in einem aufklappbaren
  // Feld darunter (bis 10 Zeilen, dann scrollbar) - Nutzerwunsch 2026-09-30.
  const MAX_CHAMPS_SHOWN = 3;

  function categoryLabels(mainRole, secondRole) {
    const main = ROLE_LABELS[mainRole] || 'Main role';
    const second = ROLE_LABELS[secondRole] || 'Second role';
    return {
      mainPony: { title: main, sub: 'your 3 picks' },
      mainOther: { title: main, sub: 'other picks' },
      second: { title: second, sub: 'second role' },
      off: { title: 'Off role', sub: 'everything else' }
    };
  }

  // Schrittweite so, dass es hoechstens ~5 Teilstriche gibt; die Achse endet
  // beim naechsten Vielfachen davon (8 -> 8, 7 -> 8, 23 -> 25, 200 -> 200).
  function niceAxis(max) {
    if (max <= 0) return { axisMax: 5, step: 1 };
    const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
    const step = steps.find(s => max / s <= 5) || Math.ceil(max / 5);
    return { axisMax: Math.ceil(max / step) * step, step };
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function totals(roleStats) {
    return CATEGORY_IDS.map(id => {
      const c = (roleStats && roleStats[id]) || { wins: 0, losses: 0, champs: [] };
      return { id, wins: c.wins || 0, losses: c.losses || 0, games: (c.wins || 0) + (c.losses || 0), champs: c.champs || [] };
    });
  }

  function renderFull(container, roleStats, { mainRole, secondRole, iconUrl }) {
    const cats = totals(roleStats);
    const allGames = cats.reduce((n, c) => n + c.games, 0);
    if (!allGames) {
      container.innerHTML = '<p class="rc-empty">No ranked games in this challenge yet.</p>';
      return;
    }
    const labels = categoryLabels(mainRole, secondRole);
    const { axisMax, step } = niceAxis(Math.max(...cats.map(c => c.games)));
    const pct = v => (v / axisMax) * 100;
    // Pixel-Geometrie der Balkenflaeche (228px hoch, siehe .rc-axis/.rc-area
    // in role.html) - noetig, um WR-Schild und W/L-Zahlen kollisionsfrei zu
    // platzieren.
    const AREA = 228;
    const px = v => (v / axisMax) * AREA;
    const BADGE_H = 18; // Hoehe des WR-Schilds
    const EDGE = 3;     // Mindestabstand des Schilds zur Balkenkante
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

    let ticks = '';
    let gridlines = '';
    for (let v = 0; v <= axisMax; v += step) {
      ticks += `<span class="rc-tick" style="bottom:${pct(v)}%">${v}</span>`;
      gridlines += `<span class="rc-gridline" style="bottom:${pct(v)}%"></span>`;
    }

    // Ueber dem Balken nur die Anzahl Spiele; die Winrate sitzt als Schild
    // genau auf der Naht zwischen Wins (unten) und Losses (oben) - Nutzer-
    // wunsch 2026-09-30. Randfaelle:
    //  - 0 Spiele: kein Balken, kein Schild, nur "0".
    //  - nur Wins / nur Losses: keine Naht -> Schild an die obere bzw. untere
    //    Kante geklemmt, bleibt im Balken.
    //  - Balken niedriger als das Schild: Schild direkt UEBER den Balken,
    //    die Anzahl darueber.
    //  - "7W"/"4L" im Balken nur, wenn das Stueck hoch genug ist UND sie
    //    dem Schild nicht in die Quere kommen.
    const bars = cats.map(c => {
      if (!c.games) {
        return `
        <div class="rc-col">
          <div class="rc-bar rc-bar-empty"><div class="rc-bar-top"><span class="rc-count">0</span></div></div>
        </div>`;
      }
      const wr = Math.round((c.wins / c.games) * 100);
      const tone = wr > 50 ? 'pos' : wr < 50 ? 'neg' : 'even';
      const badge = `<span class="rc-wr rc-wr-${tone}">${wr}% WR</span>`;
      const barPx = px(c.games);
      const winPx = px(c.wins);
      const lossPx = px(c.losses);
      const badgeInside = barPx >= BADGE_H + 2 * EDGE;
      // Mitte des Schilds, gemessen von der Balken-Unterkante
      const badgeMid = badgeInside ? clamp(winPx, BADGE_H / 2 + EDGE, barPx - BADGE_H / 2 - EDGE) : null;
      const labelFits = (segPx, segMid) => segPx >= 16 &&
        (!badgeInside || Math.abs(segMid - badgeMid) >= BADGE_H / 2 + 9);
      const showLoss = c.losses && labelFits(lossPx, winPx + lossPx / 2);
      const showWin = c.wins && labelFits(winPx, winPx / 2);
      return `
        <div class="rc-col">
          <div class="rc-bar" style="height:${pct(c.games)}%" title="${c.wins}W ${c.losses}L · ${wr}% WR">
            <div class="rc-bar-top"><span class="rc-count">${c.games}</span>${badgeInside ? '' : badge}</div>
            ${c.losses ? `<div class="rc-seg rc-loss" style="flex:${c.losses}">${showLoss ? `<span>${c.losses}L</span>` : ''}</div>` : ''}
            ${c.wins ? `<div class="rc-seg rc-win" style="flex:${c.wins}">${showWin ? `<span>${c.wins}W</span>` : ''}</div>` : ''}
            ${badgeInside ? `<div class="rc-wr-anchor" style="bottom:${(badgeMid - BADGE_H / 2).toFixed(1)}px">${badge}</div>` : ''}
          </div>
        </div>`;
    }).join('');

    const xlabels = cats.map(c => `
      <div class="rc-xlabel"><strong>${escapeHtml(labels[c.id].title)}</strong><span>${escapeHtml(labels[c.id].sub)}</span></div>`).join('');

    const champItem = ch => `
        <li class="rc-champ">
          ${ch.id ? `<img src="${iconUrl(ch.id)}" alt="" loading="lazy">` : '<span class="rc-champ-noicon"></span>'}
          <span class="rc-champ-name">${escapeHtml(ch.name)}</span>
          <span class="rc-champ-rec">${ch.wins + ch.losses} <em>(${ch.wins}W/${ch.losses}L)</em></span>
        </li>`;
    // Jede Spalte ist ein eigenes Kaestchen, damit die Bilanz rechts nie so
    // aussieht, als gehoere sie zum Champ der Nachbarspalte (Nutzerfeedback).
    const champLists = cats.map(c => {
      if (!c.champs.length) return '<div class="rc-champ-col"><ul class="rc-champs"><li class="rc-champ-none">–</li></ul></div>';
      const shown = c.champs.slice(0, MAX_CHAMPS_SHOWN);
      const rest = c.champs.slice(MAX_CHAMPS_SHOWN);
      const more = rest.length ? `
        <button type="button" class="rc-more-btn" aria-expanded="false">
          <span class="rc-more-arrow">▾</span> <span class="rc-more-label">${rest.length} more</span>
        </button>
        <div class="rc-more-panel"><ul class="rc-champs">${rest.map(champItem).join('')}</ul></div>` : '';
      return `<div class="rc-champ-col"><ul class="rc-champs">${shown.map(champItem).join('')}</ul>${more}</div>`;
    }).join('');

    container.innerHTML = `
      <div class="rc-legend">
        <span><i class="rc-swatch rc-win"></i>Wins</span>
        <span><i class="rc-swatch rc-loss"></i>Losses</span>
      </div>
      <div class="rc-grid">
        <div class="rc-axis"><div class="rc-area">${ticks}</div></div>
        <div class="rc-plot"><div class="rc-area rc-bars">${gridlines}${bars}</div></div>
        <div></div>${xlabels}
        <div></div>${champLists}
      </div>`;

    // "▾ N more": klappt die restlichen Champs dieser Spalte als Feld unter
    // der Liste auf - legt sich UEBER die Seite (position:absolute), statt
    // sie zu verlaengern, damit nichts springt/scrollt. Immer nur eins offen;
    // Klick daneben oder Esc schliesst.
    const closeAll = except => container.querySelectorAll('.rc-champ-col.open').forEach(col => {
      if (col === except) return;
      col.classList.remove('open');
      const b = col.querySelector('.rc-more-btn');
      b.setAttribute('aria-expanded', 'false');
      b.querySelector('.rc-more-label').textContent = b.dataset.label;
    });
    container.querySelectorAll('.rc-more-btn').forEach(btn => {
      btn.dataset.label = btn.querySelector('.rc-more-label').textContent;
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const col = btn.closest('.rc-champ-col');
        closeAll(col);
        const open = col.classList.toggle('open');
        btn.setAttribute('aria-expanded', String(open));
        if (open) {
          // Nie unter den Fensterrand ragen lassen (sonst wuerde die ganze
          // Seite scrollbar) - hoechstens bis 12px vor den unteren Rand,
          // hoechstens 10 Zeilen; darueber scrollt das Feld selbst.
          // Ist unten zu wenig Platz (kleines Fenster), klappt es stattdessen
          // nach OBEN auf (ueber die Balken) - ebenfalls schwebend.
          const panel = col.querySelector('.rc-more-panel');
          const full = 10 * 28 + 16;
          col.classList.remove('up');
          panel.style.maxHeight = '';
          const colRect = col.getBoundingClientRect();
          const below = window.innerHeight - colRect.bottom - 6 - 12;
          const above = colRect.top - 6 - 12;
          const needed = Math.min(panel.scrollHeight, full);
          // Bevorzugt UNTER der Liste (Nutzerwunsch) - nur wenn dort nicht
          // mal 5 Zeilen Platz haben, nach oben.
          if (below < Math.min(needed, 5 * 28 + 16) && above > below) col.classList.add('up');
          panel.style.maxHeight = `${Math.min(col.classList.contains('up') ? above : below, full)}px`;
        }
        btn.querySelector('.rc-more-label').textContent = open ? 'Show less' : btn.dataset.label;
      });
    });
    container.querySelectorAll('.rc-more-panel').forEach(p => p.addEventListener('click', e => e.stopPropagation()));
    if (!container.dataset.rcCloseBound) {
      container.dataset.rcCloseBound = '1';
      document.addEventListener('click', () => closeAll(null));
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(null); });
    }
  }

  // Mini-Version fuer die Overview-Karte: 4 gestapelte Balken, 34x34px,
  // gleiche Skalierung (hoechster Balken = volle Hoehe).
  // Ohne Spiele (oder bevor Daten da sind): 4 leere graue Stummel statt
  // eines anderen Platzhalters - das Symbol sieht so immer gleich aus
  // (Nutzerwunsch 2026-09-30).
  function emptyMini() {
    const H = 34, W = 6, GAP = 3, STUB = 10;
    const rects = [0, 1, 2, 3].map(i =>
      `<rect x="${i * (W + GAP)}" y="${H - STUB}" width="${W}" height="${STUB}" rx="1" fill="var(--text-faint)" opacity="0.75"/>`).join('');
    return `<svg viewBox="0 0 ${4 * W + 3 * GAP} ${H}" class="role-breakdown-svg" aria-hidden="true">${rects}</svg>`;
  }

  function renderMini(roleStats) {
    const cats = totals(roleStats);
    const max = Math.max(...cats.map(c => c.games));
    if (!max) return emptyMini();
    const H = 34, W = 6, GAP = 3;
    const rects = cats.map((c, i) => {
      const x = i * (W + GAP);
      const winH = (c.wins / max) * H;
      const lossH = (c.losses / max) * H;
      return `<rect x="${x}" y="${(H - winH).toFixed(2)}" width="${W}" height="${winH.toFixed(2)}" rx="1" fill="var(--green)"/>` +
        `<rect x="${x}" y="${(H - winH - lossH).toFixed(2)}" width="${W}" height="${lossH.toFixed(2)}" rx="1" fill="var(--red)"/>` +
        (c.games ? '' : `<rect x="${x}" y="${H - 1}" width="${W}" height="1" fill="var(--border)"/>`);
    }).join('');
    return `<svg viewBox="0 0 ${4 * W + 3 * GAP} ${H}" class="role-breakdown-svg" aria-hidden="true">${rects}</svg>`;
  }

  // Kurzfassung fuer die Overview-Karte (Nutzerwunsch 2026-09-30): nur noch
  // die Winrate "nach Plan" (Main Role mit Pony), plus Tonalitaet fuer die
  // Einfaerbung (>50 positiv, <50 negativ).
  function summary(roleStats) {
    const plan = totals(roleStats)[0];
    if (!plan.games) return { text: 'No games yet', tone: '' };
    const wr = Math.round((plan.wins / plan.games) * 100);
    return { text: `${wr}% WR`, tone: wr > 50 ? 'pos' : wr < 50 ? 'neg' : '' };
  }

  window.TTPRoleChart = { renderFull, renderMini, emptyMini, summary, niceAxis };
})();
