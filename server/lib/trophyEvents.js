// Freigeschaltete Trophies als Ereignisse (v6.3.0) - fuer die Activity
// (eigene + Freunde). Pro Summoner wird gemerkt, welche Trophies der
// laufenden Challenge schon frei waren; kommt nach einer Berechnung eine neue
// dazu, entsteht ein Ereignis. Beim ersten Mal / neuer Challenge wird nur
// still der Stand gemerkt (sonst kaeme ein Schwall alter Freischaltungen).
const fs = require('fs');
const path = require('path');
const { dataSubdir } = require('./dataPaths');

const fileFor = puuid => path.join(dataSubdir('trophy-events'), `${String(puuid).replace(/[^\w-]/g, '_')}.json`);
function read(puuid) {
  try { return JSON.parse(fs.readFileSync(fileFor(puuid), 'utf-8')); } catch (e) { return null; }
}

function record(puuid, since, progress) {
  if (!puuid || !progress || !Array.isArray(progress.trophies)) return;
  const unlocked = progress.trophies.filter(t => t.unlocked);
  const prev = read(puuid);
  const sameRun = prev && prev.since === since;
  const known = new Set(sameRun ? prev.unlocked : []);
  const events = sameRun ? prev.events || [] : (prev && prev.events) || [];
  if (sameRun) {
    unlocked.filter(t => !known.has(t.id)).forEach(t => events.push({ at: Date.now(), id: t.id, name: t.name }));
  }
  fs.writeFileSync(fileFor(puuid), JSON.stringify({
    since,
    unlocked: unlocked.map(t => t.id),
    unlockedCount: progress.unlockedCount || unlocked.length,
    totalCount: progress.totalCount || progress.trophies.length,
    events: events.slice(-20)
  }, null, 2));
}

// { unlockedCount, totalCount, events } fuer die laufende Challenge
function summary(puuid, since) {
  const rec = read(puuid);
  if (!rec) return null;
  return {
    unlockedCount: rec.since === since ? rec.unlockedCount : null,
    totalCount: rec.since === since ? rec.totalCount : null,
    events: rec.events || []
  };
}

module.exports = { record, summary };
