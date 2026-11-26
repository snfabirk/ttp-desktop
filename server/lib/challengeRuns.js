// Laufende Challenge pro Riot-Account (v6.0, Schritt 3 des Umbaus): die
// beim Start festgelegten Einstellungen liegen hier pro puuid statt nur im
// localStorage der App. Die Seiten lesen weiterhin ihre ttp_*-Schluessel -
// nav.js spiegelt den Stand von hier dorthin (Quelle ist der Server).
// Online-Kopie: Tabelle challenge_runs (cloud.js), damit die Challenge auf
// einem anderen PC bzw. spaeter fuer Freunde sichtbar ist.
//
// run = { since, level, lpGoalTier, lpGoalDivision, lpGoalLp,
//         champions: [{ id, name, key, role }], mainRole, secondRole }
//
// v6.13.0 (Nutzervorgabe): pro Summoner UND Spielmodus genau eine Challenge.
// Ranked (TTP/Duo) behaelt den alten Schluessel = puuid, alle anderen Modi
// bekommen "puuid:modus" (z.B. "puuid:arena") - Datei <puuid>_arena.json,
// online dieselbe challenge_runs-Tabelle (puuid-Spalte = dieser Schluessel),
// also keine Schema-Aenderung noetig. Alle Funktionen hier nehmen den
// Schluessel aus runKey().
// Arena-run = { mode: 'arena', since, variant: 'riot'|'elder'|'ultimate',
//   pool: [championKey] (verdeckte Zufallsauswahl, nur riot/elder),
//   won: { key: { at, matchId } }, roll: { champs: [key, key], at, seq, spent },
//   processed: [matchId], rerollDay }  - Logik in arena.js
const MODES = ['ranked', 'arena'];
function runKey(puuid, mode = 'ranked') {
  return !mode || mode === 'ranked' ? String(puuid) : `${puuid}:${mode}`;
}
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

const ARENA_VARIANTS = ['riot', 'elder', 'ultimate'];
function cleanRun(run) {
  if (!run || !run.since) return null;
  if (run.mode === 'arena') {
    return {
      mode: 'arena',
      since: new Date(run.since).toISOString(),
      variant: ARENA_VARIANTS.includes(run.variant) ? run.variant : 'riot',
      pool: Array.isArray(run.pool) ? run.pool.map(String) : null,
      won: run.won && typeof run.won === 'object' ? run.won : {},
      roll: run.roll && Array.isArray(run.roll.champs) ? {
        champs: run.roll.champs.map(String).slice(0, 2), at: Number(run.roll.at) || 0, seq: Number(run.roll.seq) || 0,
        // gesetzt, sobald ein Spiel mit einem der beiden gewertet wurde -> neu rollen
        spent: run.roll.spent ? { matchId: String(run.roll.spent.matchId || ''), key: String(run.roll.spent.key || ''), placement: Number(run.roll.spent.placement) || 0, won: Boolean(run.roll.spent.won) } : null,
        // v6.14.0: im Champ Select automatisch ersetzt (gebannt/gepickt)
        played: run.roll.played && run.roll.played.key ? { key: String(run.roll.played.key), at: Number(run.roll.played.at) || 0 } : null,
        replaced: Array.isArray(run.roll.replaced) ? run.roll.replaced.slice(0, 2).map(r => ({ from: String(r.from || ''), to: String(r.to || ''), reason: r.reason === 'picked' ? 'picked' : 'banned' })) : []
      } : null,
      processed: Array.isArray(run.processed) ? run.processed.map(String) : [],
      // v6.15.0: schon gespielte, aber von Riot noch nicht gelieferte Paare
      pending: Array.isArray(run.pending) ? run.pending.slice(-5).filter(p => p && Array.isArray(p.champs)).map(p => ({
        champs: p.champs.map(String).slice(0, 2), at: Number(p.at) || 0,
        played: p.played ? { key: String(p.played.key || ''), at: Number(p.played.at) || 0 } : null
      })) : [],
      rerollDay: run.rerollDay || null
    };
  }
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

module.exports = { getRun, getRecord, setRun, clearRun, importRecord, cleanRun, setOnChange, runKey, MODES };
