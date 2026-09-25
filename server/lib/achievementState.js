const fs = require('fs');
const path = require('path');

// Persistiert, welche "Ø-Trophies" (sustained-average, siehe achievements.js
// AVERAGE_TROPHY_IDS) bereits ENDGUELTIG freigeschaltet wurden - noetig, weil
// ein Durchschnittswert durch neue Spiele wieder unter das Ziel rutschen
// kann. Alles andere (kumulative Summen, Peak-Werte) ist von Natur aus
// monoton/"sticky" und braucht keinen persistierten Zustand.
//
// Ein Eintrag wird "final" erst, sobald das LP-Ziel erreicht ist UND der
// Durchschnitt in genau diesem Moment (bei einem beliebigen spaeteren Check -
// Trophies-Seite oeffnen ODER der 15-Minuten-Hintergrund-Refresh) ebenfalls
// ueber dem Ziel liegt. Vorher gilt der Wert nur als "vorlaeufig".
//
// Datei pro puuid, an den Challenge-Start-Zeitstempel gebunden - startet
// jemand eine neue Challenge (anderer "since"-Wert), wird der alte Stand
// verworfen statt faelschlich in die neue Challenge uebernommen zu werden.
//
// "finalized" ist eine Map { trophyId: RULES_VERSION } - der Wert ist nicht
// einfach `true`, sondern die zum Zeitpunkt der Finalisierung gueltige
// achievements.js RULES_VERSION. So kann server.js erkennen, ob sich die
// Trophy-Regeln (Zielzahlen/Roster) seitdem geaendert haben, ohne den
// Fortschritt selbst neu berechnen zu muessen (siehe rulesUpToDate in
// server.js und /api/achievements/rules-status).

const STATE_DIR = path.join(__dirname, '..', 'data', 'achievement-state');
if (!fs.existsSync(STATE_DIR)) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
}

function statePath(puuid) {
  return path.join(STATE_DIR, `${puuid}.json`);
}

function loadFinalizedState(puuid, challengeStart) {
  try {
    const raw = fs.readFileSync(statePath(puuid), 'utf-8');
    const data = JSON.parse(raw);
    if (data.challengeStart !== challengeStart) return {}; // andere/neue Challenge - alter Stand zaehlt nicht
    return data.finalized || {};
  } catch (e) {
    return {};
  }
}

function saveFinalizedState(puuid, challengeStart, finalized) {
  try {
    // STATE_DIR kann zur Laufzeit verschwinden (der "Werkseinstellungen
    // zuruecksetzen"-Button loescht den Ordner bei laufendem Server), das
    // einmalige existsSync oben beim Modul-Laden deckt das nicht mehr ab -
    // deshalb hier vor jedem Schreibzugriff defensiv neu anlegen.
    if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(statePath(puuid), JSON.stringify({ challengeStart, finalized }));
  } catch (e) {
    // Nicht kritisch - beim naechsten Check wird einfach erneut versucht,
    // zu finalisieren, statt den ganzen Achievement-Request scheitern zu lassen.
  }
}

module.exports = { loadFinalizedState, saveFinalizedState };
