// Arena-Profil-Widgets (v6.13.0): nur Daten, die WAEHREND Arena-Challenges
// gesammelt wurden (Nutzervorgabe: keine Altdaten aus der Match-Historie).
// Siege/Champions kommen aus dem XP-Ledger (progression.arenaLifetime), hier
// liegen nur die Titel pro Summoner: Riot God / Elder God / Ultimate God,
// sobald die jeweilige Arena-Challenge geschafft ist (recordTitle aus
// server.js processArena). Wie alle Profil-Stats je Summoner.
const fs = require('fs');
const path = require('path');
const { dataSubdir } = require('./dataPaths');

const TITLE_ORDER = ['riot', 'elder', 'ultimate'];

function fileFor(puuid) {
  return path.join(dataSubdir('arena-stats'), `${String(puuid).replace(/[^\w-]/g, '_')}.json`);
}
function read(puuid) {
  try { return { titles: {}, ...JSON.parse(fs.readFileSync(fileFor(puuid), 'utf-8')) }; } catch (e) { return { titles: {} }; }
}

function recordTitle(puuid, variant, at = Date.now()) {
  if (!puuid || !TITLE_ORDER.includes(variant)) return false;
  const s = read(puuid);
  if (s.titles[variant]) return false;
  s.titles[variant] = at;
  try { fs.writeFileSync(fileFor(puuid), JSON.stringify(s)); } catch (e) {}
  return true;
}

function titles(puuid) {
  const s = puuid ? read(puuid) : { titles: {} };
  return TITLE_ORDER.map(id => ({ id, at: s.titles[id] || null }));
}

module.exports = { recordTitle, titles };
