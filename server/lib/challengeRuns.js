// Laufende Challenge pro Riot-Account (v6.0, Schritt 3 des Umbaus): die
// beim Start festgelegten Einstellungen liegen hier pro puuid statt nur im
// localStorage der App. Die Seiten lesen weiterhin ihre ttp_*-Schluessel -
// nav.js spiegelt den Stand von hier dorthin (Quelle ist der Server).
// Online-Kopie: Tabelle challenge_runs (cloud.js), damit die Challenge auf
// einem anderen PC bzw. spaeter fuer Freunde sichtbar ist.
//
// run = { since, level, lpGoalTier, lpGoalDivision, lpGoalLp,
//         champions: [{ id, name, key, role }], mainRole, secondRole }
const fs = require('fs');
const path = require('path');
const { dataSubdir } = require('./dataPaths');

let onChange = null;
function setOnChange(fn) { onChange = fn; }

function fileFor(puuid) {
  return path.join(dataSubdir('challenge-runs'), `${String(puuid).replace(/[^\w-]/g, '_')}.json`);
}

function readFile(puuid) {
  try { return JSON.parse(fs.readFileSync(fileFor(puuid), 'utf-8')); } catch (e) { return null; }
}

// null = fuer diesen Summoner ist noch nichts bekannt (weder Lauf noch "keiner")
function getRecord(puuid) {
  return readFile(puuid);
}
function getRun(puuid) {
  const rec = readFile(puuid);
  return rec ? rec.run : null;
}

function cleanRun(run) {
  if (!run || !run.since) return null;
  const champions = Array.isArray(run.champions)
    ? run.champions.filter(c => c && c.key).slice(0, 3).map(c => ({ id: c.id || '', name: c.name || '', key: String(c.key), role: c.role || '' }))
    : [];
  return {
    since: new Date(run.since).toISOString(),
    level: run.level || '',
    lpGoalTier: run.lpGoalTier || '',
    lpGoalDivision: run.lpGoalDivision || '',
    lpGoalLp: Number(run.lpGoalLp) || 0,
    champions,
    mainRole: run.mainRole || '',
    secondRole: run.secondRole || ''
  };
}

function writeRecord(puuid, run, { silent, updatedAt } = {}) {
  const rec = { run, updatedAt: updatedAt || new Date().toISOString() };
  fs.writeFileSync(fileFor(puuid), JSON.stringify(rec, null, 2));
  if (!silent && onChange) onChange(puuid, rec);
  return rec;
}

function setRun(puuid, run) {
  return writeRecord(puuid, cleanRun(run));
}
function clearRun(puuid) {
  return writeRecord(puuid, null);
}
// Stand aus der Online-Kopie uebernehmen, ohne ihn wieder hochzuladen
function importRecord(puuid, rec) {
  return writeRecord(puuid, rec ? cleanRun(rec.run) : null, { silent: true, updatedAt: rec && rec.updatedAt });
}

module.exports = { getRun, getRecord, setRun, clearRun, importRecord, cleanRun, setOnChange };
