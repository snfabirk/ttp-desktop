// Berechnet den echten Fortschritt aller 21 Trophies (16 universell + 5 je
// Rolle) aus den ueber die Challenge gesammelten Match-Daten. Siehe die
// Memory-Datei achievements-trophies-design.md fuer die volle Herleitung
// jeder einzelnen Zahl (alles an echten Cache-Daten kalibriert).

const { toComparableLP } = require('./rankHistory');

const TIER_INDEX = { easy: 0, normal: 1, hard: 2, very_hard: 3, majestic: 4 };

function tierVal(arr, level) {
  const i = TIER_INDEX[level];
  return arr[i === undefined ? 1 : i];
}

// "Erwartete Spiele" - Kernformel fuer alle skalierenden Achievements.
// Annahme: 60% WR, symmetrisch +-20 LP -> 4 Netto-LP/Spiel im Schnitt.
function computeErwarteteSpiele(currentRank, lpGoal) {
  if (!currentRank || !lpGoal || !lpGoal.tier) return 20;
  const currentLP = toComparableLP(currentRank.tier, currentRank.rank, currentRank.leaguePoints);
  const goalLP = toComparableLP(lpGoal.tier, lpGoal.division || '', Number(lpGoal.lp) || 0);
  const distance = goalLP - currentLP;
  return Math.max(20, Math.round(distance / 4));
}

// ----- Pro Spiel benoetigte Rohdaten aus einem einzelnen Match-Teilnehmer -----
function extractGameStats(me, match) {
  const c = me.challenges || {};
  const gameDurationMin = (match.info.gameDuration || 0) / 60;
  const cs = (me.totalMinionsKilled || 0) + (me.neutralMinionsKilled || 0);
  return {
    win: Boolean(me.win),
    deaths: me.deaths || 0,
    kills: me.kills || 0,
    assists: me.assists || 0,
    cs,
    gold: me.goldEarned || 0,
    damage: me.totalDamageDealtToChampions || 0,
    doubleKills: me.doubleKills || 0,
    tripleKills: me.tripleKills || 0,
    quadraKills: me.quadraKills || 0,
    pentaKills: me.pentaKills || 0,
    firstBlood: me.firstBloodKill ? 1 : 0,
    saveAllyFromDeath: c.saveAllyFromDeath || 0,
    damageDealtToTurrets: me.damageDealtToTurrets || 0,
    damageTaken: me.totalDamageTaken || 0,
    epicTakedowns: (c.dragonTakedowns || 0) + (c.baronTakedowns || 0) + (c.riftHeraldTakedowns || 0),
    epicSteals: c.epicMonsterSteals || 0,
    killParticipation: c.killParticipation || 0,
    soloKills: c.soloKills || 0,
    roamAllLanes: c.getTakedownsInAllLanesEarlyJungleAsLaner || 0,
    dpm: c.damagePerMinute || 0,
    teamDamagePct: c.teamDamagePercentage || 0,
    legendaryCount: c.legendaryCount || 0,
    earlyCs: c.laneMinionsFirst10Minutes || 0,
    csPerMin: gameDurationMin > 0 ? cs / gameDurationMin : 0,
    visionScore: me.visionScore || 0,
    ccTime: me.timeCCingOthers || 0,
    healShield: c.effectiveHealAndShielding || 0
  };
}

function createAchievementAccumulator() {
  return {
    totalGames: 0,
    wins: 0,
    games: [], // {win, gameCreation} fuer Win-Streak
    sum: {
      kills: 0, cs: 0, gold: 0, assists: 0, damage: 0,
      doubleKills: 0, tripleKills: 0, quadraKills: 0, pentaKills: 0, firstBlood: 0,
      saveAllyFromDeath: 0, damageDealtToTurrets: 0, damageTaken: 0,
      epicTakedowns: 0, epicSteals: 0, killParticipation: 0, soloKills: 0,
      roamAllLanes: 0, teamDamagePct: 0, legendaryCount: 0, csPerMin: 0, dpm: 0,
      visionScore: 0, ccTime: 0, healShield: 0,
      soloTowerKills: 0 // via Timeline-API befuellt, siehe addSoloTowerKills()
    },
    max: {
      flawlessKills: 0, rampageKills: 0, rampageAssists: 0, towerDmg: 0,
      damageTaken: 0, epicTakedowns: 0, killParticipation: 0, soloKills: 0,
      dpm: 0, teamDamagePct: 0, earlyCs: 0, visionScore: 0, ccTime: 0,
      soloTowerKillsPeak: 0
    },
    countGuardianI: 0, // Spiele mit >=1 Save
    countGuardianII: 0, // Spiele mit >=5 Saves
    countGuardianAngel: 0 // Spiele mit >=8 Saves
  };
}

function addMatchToAchievementAccumulator(acc, me, match) {
  const g = extractGameStats(me, match);
  acc.totalGames += 1;
  if (g.win) acc.wins += 1;
  acc.games.push({ win: g.win, gameCreation: match.info.gameCreation });

  for (const key of Object.keys(acc.sum)) {
    if (key === 'soloTowerKills') continue; // separat via Timeline
    if (g[key] !== undefined) acc.sum[key] += g[key];
  }

  if (g.win && g.deaths === 0) acc.max.flawlessKills = Math.max(acc.max.flawlessKills, g.kills);
  acc.max.rampageKills = Math.max(acc.max.rampageKills, g.kills);
  acc.max.rampageAssists = Math.max(acc.max.rampageAssists, g.assists);
  acc.max.towerDmg = Math.max(acc.max.towerDmg, g.damageDealtToTurrets);
  acc.max.damageTaken = Math.max(acc.max.damageTaken, g.damageTaken);
  acc.max.epicTakedowns = Math.max(acc.max.epicTakedowns, g.epicTakedowns);
  acc.max.killParticipation = Math.max(acc.max.killParticipation, g.killParticipation);
  acc.max.soloKills = Math.max(acc.max.soloKills, g.soloKills);
  acc.max.dpm = Math.max(acc.max.dpm, g.dpm);
  acc.max.teamDamagePct = Math.max(acc.max.teamDamagePct, g.teamDamagePct);
  acc.max.earlyCs = Math.max(acc.max.earlyCs, g.earlyCs);
  acc.max.visionScore = Math.max(acc.max.visionScore, g.visionScore);
  acc.max.ccTime = Math.max(acc.max.ccTime, g.ccTime);

  if (g.saveAllyFromDeath >= 1) acc.countGuardianI += 1;
  if (g.saveAllyFromDeath >= 5) acc.countGuardianII += 1;
  if (g.saveAllyFromDeath >= 8) acc.countGuardianAngel += 1;
}

// Fuer Top: "echt solo" zerstoerte Tuerme via Timeline-BUILDING_KILL-Events
// (leere assistingParticipantIds). Separat aufgerufen, weil das einen
// zusaetzlichen API-Call pro Match braucht (siehe getMatchTimeline() in
// riot.js) - nur fuer Top-Spieler ueberhaupt noetig.
function addSoloTowerKillsFromTimeline(acc, timeline, myPid) {
  let soloThisGame = 0;
  const frames = timeline?.info?.frames || [];
  for (const frame of frames) {
    for (const ev of frame.events || []) {
      if (ev.type === 'BUILDING_KILL' && ev.buildingType === 'TOWER_BUILDING' && ev.killerId === myPid) {
        const assists = ev.assistingParticipantIds || [];
        if (assists.length === 0) soloThisGame += 1;
      }
    }
  }
  acc.sum.soloTowerKills += soloThisGame;
  acc.max.soloTowerKillsPeak = Math.max(acc.max.soloTowerKillsPeak, soloThisGame);
}

function round(n) {
  return Math.round(n * 10) / 10;
}

function progressEntry(id, name, current, target, extra) {
  const safeTarget = target > 0 ? target : 0;
  const percent = safeTarget > 0 ? Math.min(100, Math.round((current / safeTarget) * 100)) : (current > 0 ? 100 : 0);
  return { id, name, current: round(current), target: round(safeTarget), percent, unlocked: current >= safeTarget && safeTarget > 0, ...extra };
}

// "Sustained across the challenge" (Ø-Wert) Trophies sind die einzige nicht
// monotone Kategorie - im Gegensatz zu kumulativen Summen oder Peak-Werten
// kann ein Durchschnitt durch neue Spiele wieder UNTER das Ziel rutschen.
// Ein simples "X Spiele Minimum" (wie fruehere Version) loest das nicht
// wirklich, es verschiebt nur wann genau. Stattdessen: immer der echte
// laufende Durchschnitt ab Spiel 1, aber der Status bleibt "vorlaeufig" bis
// das LP-Ziel erreicht ist - erst dann (bei irgendeinem Check danach, auch
// automatisch alle 15 Minuten im Hintergrund) wird einmalig endgueltig
// geprueft und bei Erfolg dauerhaft (persistiert) freigeschaltet, siehe
// applyAverageTrophyFinalization() + server/lib/achievementState.js.
const AVERAGE_TROPHY_IDS = new Set([
  'consistency', 'jungle-boss', 'mid-diff', 'death-dealer', 'marksman', 'all-seeing-eye', 'puppet-master'
]);

// scale: 1 fuer rohe Zahlen (DPM, Vision Score, CC-Sekunden, CS/min), 100
// fuer Anteils-/Prozent-Werte (Kill Participation, Team-Damage-%), die als
// 0-1-Bruch in den acc.sum-Feldern stecken und als Prozentzahl angezeigt
// werden sollen.
function sustainedAverageEntry(id, name, sum, totalGames, target, scale = 1) {
  const value = totalGames > 0 ? (sum / totalGames) * scale : 0;
  return progressEntry(id, name, value, target);
}

// Wendet den vorlaeufig/final-Zustand auf alle AVERAGE_TROPHY_IDS an. Rein
// funktional (kein Dateizugriff hier) - liest/schreibt den persistierten
// Zustand nicht selbst, nimmt ihn als finalizedState entgegen und gibt die
// NEU finalisierten IDs zurueck, damit der Aufrufer (server.js) sie
// speichern kann.
function applyAverageTrophyFinalization(trophies, { goalReached, finalizedState }) {
  const newlyFinalized = [];
  for (const t of trophies) {
    if (!AVERAGE_TROPHY_IDS.has(t.id)) continue;

    if (finalizedState[t.id]) {
      // Schon in einer frueheren Session final freigeschaltet - bleibt es,
      // auch wenn der aktuelle Durchschnitt inzwischen wieder gefallen ist.
      t.unlocked = true;
      t.percent = 100;
      continue;
    }

    const currentlyMeetsTarget = t.current >= t.target && t.target > 0;
    if (goalReached && currentlyMeetsTarget) {
      t.unlocked = true;
      newlyFinalized.push(t.id);
    } else {
      t.unlocked = false;
      if (currentlyMeetsTarget) {
        // Ziel rechnerisch schon erreicht, aber die Challenge (LP-Ziel)
        // selbst noch nicht - zaehlt erst, sobald das der Fall ist.
        t.provisional = true;
      }
    }
  }
  return newlyFinalized;
}

// Wird von Hand hochgezaehlt, wann immer sich etwas an den Trophies SELBST
// aendert (Zielzahlen in RATES, eine Trophy kommt dazu/faellt weg) - NICHT
// bei rein kosmetischen Aenderungen (Beschreibungstext, Icons, Layout). Jede
// finalisierte Ø-Trophy (siehe applyAverageTrophyFinalization) merkt sich,
// unter welcher Version sie finalisiert wurde, damit die Trophies-Seite
// anzeigen kann, ob der Stand noch zu den aktuell geltenden Regeln passt -
// siehe achievementState.js/server.js "rulesUpToDate".
const RULES_VERSION = 2;

// ----- Rate-Tabellen (Easy/Normal/Hard/VeryHard/Majestic), 1:1 aus der
// finalen Design-Runde (siehe achievements-trophies-design.md Memory) -----
const RATES = {
  // Neu kalibriert (2026-09-26) anhand echter Ø-Werte aus 733 realen Ranked-
  // Solo-Spielen des Nutzers (0.962/0.145/0.018 Double/Triple/Quadra pro
  // Spiel) - Normal = echter Schnitt minus 10%/60%/70% (explizite Nutzer-
  // vorgabe: Double war schon fast passend kalibriert, Triple/Quadra waren
  // 3x/5x zu hoch). Die anderen 4 Tiers behalten das gleiche relative
  // Verhaeltnis zu Normal wie zuvor (5/9, 1, 13/9, 17/9, 21/9).
  doubleKill: [0.481, 0.866, 1.251, 1.636, 2.021],
  tripleKill: [0.032, 0.058, 0.084, 0.110, 0.135],
  quadraKill: [0.003, 0.0054, 0.0078, 0.0102, 0.0126],
  pentaKill: [1, 1, 1, 2, 3],
  firstBlood: [0.1, 0.2, 0.4, 0.6, 0.8],
  flawless: [2, 5, 7, 10, 14],
  rampageKills: [10, 13, 17, 20, 25],
  rampageAssistsSupport: [15, 20, 23, 27, 30],
  killsInsgesamt: [5, 7, 9, 11, 13],
  killsInsgesamtSupport: [2.5, 3.5, 4.5, 5.5, 6.5],
  csInsgesamt: [100, 140, 180, 220, 240],
  csInsgesamtSupport: [19, 27, 35, 43, 46],
  goldInsgesamt: [10000, 13000, 16000, 19000, 22000],
  goldInsgesamtSupport: [6500, 8500, 10400, 12350, 14300],
  winStreak: [2, 3, 4, 5, 6],
  assistsInsgesamt: [4, 5, 6, 8, 10],
  assistsInsgesamtSupport: [8, 10, 12, 16, 20],
  damageInsgesamt: [12000, 18000, 24000, 32000, 42000],
  damageInsgesamtSupport: [7000, 10000, 13000, 18000, 23000],
  winrate: [0.51, 0.52, 0.53, 0.54, 0.55],
  guardianI: [0.5, 0.9, 1.3, 1.7, 2.1],
  guardianII: [0.25, 0.45, 0.65, 0.85, 1.05],
  guardianIII: [1.5, 2.0, 2.5, 3.0, 3.5],
  guardianAngel: [1, 1, 1, 2, 3],
  // Top
  demolitionCrew: [0.7, 0.9, 1.1, 1.4, 1.8],
  wreckingBall: [1, 2, 4, 5, 7],
  splitPusher: [5000, 7000, 9000, 12000, 16000],
  ironWall: [35000, 45000, 55000, 65000, 78000],
  colossus: [20000, 28000, 35000, 45000, 58000],
  // Jungle
  epicHunter: [1.5, 2.0, 2.5, 3.2, 4.0],
  monsterSlayer: [3, 4, 5, 6, 8],
  thief: [0.01, 0.03, 0.05, 0.07, 0.1],
  ganker: [0.40, 0.50, 0.60, 0.70, 0.80],
  jungleBoss: [0.40, 0.45, 0.50, 0.55, 0.60],
  // Mid
  duelist: [1.5, 2.0, 2.6, 3.3, 4.2],
  assassin: [3, 4, 6, 8, 11],
  globalThreat: [0.017, 0.033, 0.05, 0.066, 0.083],
  burstKing: [900, 1100, 1350, 1550, 1900],
  midDiff: [750, 850, 950, 1100, 1300],
  // ADC
  hyperCarry: [0.28, 0.33, 0.38, 0.45, 0.55],
  deathDealer: [0.20, 0.23, 0.26, 0.29, 0.33],
  legendary: [0.04, 0.06, 0.08, 0.1, 0.14],
  farmMachine: [60, 70, 80, 90, 95],
  marksman: [6.5, 7.0, 7.5, 8.0, 8.7],
  // Support
  visionMaster: [75, 90, 110, 125, 150],
  allSeeingEye: [60, 68, 78, 90, 105],
  crowdController: [45, 60, 80, 95, 130],
  puppetMaster: [35, 42, 50, 60, 75],
  lifelineHeal: [1200, 2500, 5000, 9000, 16000],
  lifelineDamageTaken: [18000, 23000, 29000, 36000, 44000]
};

function rate(key, tier) {
  return tierVal(RATES[key], tier);
}

function ceilAtLeast1(n) {
  return Math.max(1, Math.ceil(n));
}

// ----- Die 16 universellen Trophies (mit Support-Ersatzvarianten) -----
function computeUniversalProgress(acc, { tier, erwarteteSpiele, role }) {
  const isSupport = role === 'UTILITY';
  const list = [];

  if (isSupport) {
    list.push(progressEntry('double-kill', 'Guardian I', acc.countGuardianI, ceilAtLeast1(rate('guardianI', tier) * erwarteteSpiele)));
    list.push(progressEntry('triple-kill', 'Guardian II', acc.countGuardianII, ceilAtLeast1(rate('guardianII', tier) * erwarteteSpiele)));
    list.push(progressEntry('quadra-kill', 'Guardian III', acc.sum.saveAllyFromDeath, ceilAtLeast1(rate('guardianIII', tier) * erwarteteSpiele)));
    list.push(progressEntry('penta-kill', 'Guardian Angel', acc.countGuardianAngel, rate('guardianAngel', tier)));
  } else {
    list.push(progressEntry('double-kill', 'Double Kill', acc.sum.doubleKills, ceilAtLeast1(rate('doubleKill', tier) * erwarteteSpiele)));
    list.push(progressEntry('triple-kill', 'Triple Kill', acc.sum.tripleKills, ceilAtLeast1(rate('tripleKill', tier) * erwarteteSpiele)));
    list.push(progressEntry('quadra-kill', 'Quadra Kill', acc.sum.quadraKills, ceilAtLeast1(rate('quadraKill', tier) * erwarteteSpiele)));
    list.push(progressEntry('penta-kill', 'Pentakill', acc.sum.pentaKills, rate('pentaKill', tier)));
  }

  list.push(progressEntry('first-strike', 'First Strike', acc.sum.firstBlood, ceilAtLeast1(rate('firstBlood', tier) * erwarteteSpiele)));
  list.push(progressEntry('flawless-victory', 'Flawless Victory', acc.max.flawlessKills, rate('flawless', tier)));

  if (isSupport) {
    list.push(progressEntry('rampage', 'Rampage', acc.max.rampageAssists, rate('rampageAssistsSupport', tier)));
  } else {
    list.push(progressEntry('rampage', 'Rampage', acc.max.rampageKills, rate('rampageKills', tier)));
  }

  list.push(progressEntry('slayer', 'Slayer', acc.sum.kills, Math.ceil(rate(isSupport ? 'killsInsgesamtSupport' : 'killsInsgesamt', tier) * erwarteteSpiele)));
  list.push(progressEntry('farm-king', 'Farm King', acc.sum.cs, Math.ceil(rate(isSupport ? 'csInsgesamtSupport' : 'csInsgesamt', tier) * erwarteteSpiele)));
  list.push(progressEntry('gold-rush', 'Gold Rush', acc.sum.gold, Math.ceil(rate(isSupport ? 'goldInsgesamtSupport' : 'goldInsgesamt', tier) * erwarteteSpiele)));

  const { bestWinStreak } = computeStreaksLocal(acc.games);
  list.push(progressEntry('win-streak', 'Win Streak', bestWinStreak, rate('winStreak', tier)));
  // Erwartete Spiele bleibt die 60%-WR-Referenzzahl fuer alle anderen
  // Trophies - Marathon selbst braucht aber nur 70% davon, sonst poppt sie
  // bei einer ueberdurchschnittlichen Win-Streak (Ziel schon laengst erreicht,
  // aber noch nicht genug Spiele fuer die volle Erwartete-Spiele-Zahl) nie auf.
  list.push(progressEntry('marathon', 'Marathon', acc.totalGames, Math.round(erwarteteSpiele * 0.7)));

  list.push(progressEntry('playmaker', 'Playmaker', acc.sum.assists, Math.ceil(rate(isSupport ? 'assistsInsgesamtSupport' : 'assistsInsgesamt', tier) * erwarteteSpiele)));
  list.push(progressEntry('executioner', 'Executioner', acc.sum.damage, Math.ceil(rate(isSupport ? 'damageInsgesamtSupport' : 'damageInsgesamt', tier) * erwarteteSpiele)));

  list.push(sustainedAverageEntry('consistency', 'Consistency', acc.wins, acc.totalGames, Math.round(rate('winrate', tier) * 1000) / 10, 100));

  return list;
}

// LP Ziel erreicht - einziges binaeres, nicht Challenge-Level-abhaengiges
// universelles Achievement (das Erreichen des Ziels IST die Challenge).
function computeGoalReachedProgress(currentRank, lpGoal) {
  const reached = Boolean(
    currentRank && lpGoal && lpGoal.tier &&
    toComparableLP(currentRank.tier, currentRank.rank, currentRank.leaguePoints) >=
      toComparableLP(lpGoal.tier, lpGoal.division || '', Number(lpGoal.lp) || 0)
  );
  return progressEntry('goal-reached', 'Goal Reached', reached ? 1 : 0, 1);
}

// ----- 5 rollenspezifische Trophies -----
function computeRoleProgress(acc, { tier, erwarteteSpiele, role }) {
  if (role === 'TOP') {
    return [
      progressEntry('demolition-crew', 'Demolition Crew', acc.sum.soloTowerKills, ceilAtLeast1(rate('demolitionCrew', tier) * erwarteteSpiele)),
      progressEntry('wrecking-ball', 'Wrecking Ball', acc.max.soloTowerKillsPeak, rate('wreckingBall', tier)),
      progressEntry('split-pusher', 'Split Pusher', acc.sum.damageDealtToTurrets, Math.ceil(rate('splitPusher', tier) * erwarteteSpiele)),
      progressEntry('iron-wall', 'Iron Wall', acc.max.damageTaken, rate('ironWall', tier)),
      progressEntry('colossus', 'Colossus', acc.sum.damageTaken, Math.ceil(rate('colossus', tier) * erwarteteSpiele))
    ];
  }
  if (role === 'JUNGLE') {
    return [
      progressEntry('epic-hunter', 'Epic Hunter', acc.sum.epicTakedowns, ceilAtLeast1(rate('epicHunter', tier) * erwarteteSpiele)),
      progressEntry('monster-slayer', 'Monster Slayer', acc.max.epicTakedowns, rate('monsterSlayer', tier)),
      progressEntry('thief', 'Thief', acc.sum.epicSteals, ceilAtLeast1(rate('thief', tier) * erwarteteSpiele)),
      progressEntry('ganker', 'Ganker', round(acc.max.killParticipation * 1000) / 10, round(rate('ganker', tier) * 1000) / 10),
      sustainedAverageEntry('jungle-boss', 'Jungle Boss', acc.sum.killParticipation, acc.totalGames, round(rate('jungleBoss', tier) * 1000) / 10, 100)
    ];
  }
  if (role === 'MIDDLE') {
    return [
      progressEntry('duelist', 'Duelist', acc.sum.soloKills, ceilAtLeast1(rate('duelist', tier) * erwarteteSpiele)),
      progressEntry('assassin', 'Assassin', acc.max.soloKills, rate('assassin', tier)),
      progressEntry('global-threat', 'Global Threat', acc.sum.roamAllLanes, ceilAtLeast1(rate('globalThreat', tier) * erwarteteSpiele)),
      progressEntry('burst-king', 'Burst King', acc.max.dpm, rate('burstKing', tier)),
      sustainedAverageEntry('mid-diff', 'Mid Diff', acc.sum.dpm, acc.totalGames, rate('midDiff', tier))
    ];
  }
  if (role === 'BOTTOM') {
    return [
      progressEntry('hyper-carry', 'Hyper Carry', round(acc.max.teamDamagePct * 1000) / 10, round(rate('hyperCarry', tier) * 1000) / 10),
      sustainedAverageEntry('death-dealer', 'Death Dealer', acc.sum.teamDamagePct, acc.totalGames, round(rate('deathDealer', tier) * 1000) / 10, 100),
      progressEntry('legendary', 'Legendary', acc.sum.legendaryCount, ceilAtLeast1(rate('legendary', tier) * erwarteteSpiele)),
      progressEntry('farm-machine', 'Farm Machine', acc.max.earlyCs, rate('farmMachine', tier)),
      sustainedAverageEntry('marksman', 'Marksman', acc.sum.csPerMin, acc.totalGames, rate('marksman', tier))
    ];
  }
  if (role === 'UTILITY') {
    const healProgress = ceilAtLeast1(rate('lifelineHeal', tier) * erwarteteSpiele) > 0
      ? acc.sum.healShield / Math.ceil(rate('lifelineHeal', tier) * erwarteteSpiele)
      : 0;
    const dmgTakenProgress = Math.ceil(rate('lifelineDamageTaken', tier) * erwarteteSpiele) > 0
      ? acc.sum.damageTaken / Math.ceil(rate('lifelineDamageTaken', tier) * erwarteteSpiele)
      : 0;
    const useHealPath = healProgress >= dmgTakenProgress;
    const lifeline = useHealPath
      ? progressEntry('lifeline', 'Lifeline', acc.sum.healShield, Math.ceil(rate('lifelineHeal', tier) * erwarteteSpiele), { path: 'heal' })
      : progressEntry('lifeline', 'Lifeline', acc.sum.damageTaken, Math.ceil(rate('lifelineDamageTaken', tier) * erwarteteSpiele), { path: 'tank' });
    return [
      progressEntry('vision-master', 'Vision Master', acc.max.visionScore, rate('visionMaster', tier)),
      sustainedAverageEntry('all-seeing-eye', 'All-Seeing Eye', acc.sum.visionScore, acc.totalGames, rate('allSeeingEye', tier)),
      progressEntry('crowd-controller', 'Crowd Controller', acc.max.ccTime, rate('crowdController', tier)),
      sustainedAverageEntry('puppet-master', 'Puppet Master', acc.sum.ccTime, acc.totalGames, rate('puppetMaster', tier)),
      lifeline
    ];
  }
  return [];
}

// Lokale Kopie von computeStreaks (stats.js exportiert das schon, aber ein
// eigener Import wuerde hier nur unnoetig koppeln fuer eine 15-Zeilen-Funktion).
function computeStreaksLocal(games) {
  const sorted = [...games].sort((a, b) => a.gameCreation - b.gameCreation);
  let bestWinStreak = 0;
  let runWin = null;
  let runLength = 0;
  sorted.forEach(g => {
    if (g.win === runWin) {
      runLength += 1;
    } else {
      runWin = g.win;
      runLength = 1;
    }
    if (runWin) bestWinStreak = Math.max(bestWinStreak, runLength);
  });
  return { bestWinStreak };
}

function computeAllTrophyProgress(acc, { tier, erwarteteSpiele, role, currentRank, lpGoal, finalizedState = {} }) {
  const universal = computeUniversalProgress(acc, { tier, erwarteteSpiele, role });
  const goalEntry = computeGoalReachedProgress(currentRank, lpGoal);
  universal.push(goalEntry);
  const roleSpecific = computeRoleProgress(acc, { tier, erwarteteSpiele, role });
  const all = [...universal, ...roleSpecific];

  const newlyFinalizedIds = applyAverageTrophyFinalization(all, { goalReached: goalEntry.unlocked, finalizedState });

  const unlockedCount = all.filter(t => t.unlocked).length;
  return {
    trophies: all,
    unlockedCount,
    totalCount: all.length,
    platinumUnlocked: unlockedCount === all.length && all.length > 0,
    newlyFinalizedIds
  };
}

module.exports = {
  RULES_VERSION,
  computeErwarteteSpiele,
  createAchievementAccumulator,
  addMatchToAchievementAccumulator,
  addSoloTowerKillsFromTimeline,
  computeAllTrophyProgress
};
