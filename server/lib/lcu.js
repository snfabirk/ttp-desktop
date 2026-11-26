// Lokaler League-Client (LCU-API, v5.33.0): wer welcher Account gerade im
// Client auf DIESEM PC eingeloggt ist. Dient als sofortiger Besitz-Nachweis
// beim Verknuepfen eines Summoners - Riots Web-API (summoner-v4) liefert ein
// geaendertes Profil-Icon oft erst sehr verzoegert (im Test >5 min).
// Port + Passwort stehen in der Kommandozeile von LeagueClientUx.exe.
const { execFile } = require('child_process');
const https = require('https');

function clientCredentials() {
  return new Promise(resolve => {
    if (process.platform !== 'win32') return resolve(null);
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      "(Get-CimInstance Win32_Process -Filter \"name='LeagueClientUx.exe'\" | Select-Object -First 1).CommandLine"],
    { timeout: 8000, windowsHide: true }, (err, out) => {
      if (err || !out) return resolve(null);
      const port = (out.match(/--app-port=(\d+)/) || [])[1];
      const token = (out.match(/--remoting-auth-token=([\w-]+)/) || [])[1];
      resolve(port && token ? { port, token } : null);
    });
  });
}

// Zugangsdaten zwischenspeichern (v6.14.0): der Champ-Select-Waechter fragt
// alle paar Sekunden - nicht jedes Mal PowerShell starten. Ohne Client
// hoechstens alle 15 s neu suchen; bei Verbindungsfehler verwerfen.
let credCache = { creds: null, at: 0 };
async function cachedCredentials() {
  if (credCache.creds) return credCache.creds;
  if (Date.now() - credCache.at < 15000) return null;
  credCache = { creds: await clientCredentials(), at: Date.now() };
  return credCache.creds;
}

function lcuGet(creds, path) {
  return new Promise(resolve => {
    const req = https.get({
      host: '127.0.0.1', port: creds.port, path,
      rejectUnauthorized: false, // der Client nutzt ein selbstsigniertes Zertifikat
      headers: { Authorization: 'Basic ' + Buffer.from(`riot:${creds.token}`).toString('base64') },
      timeout: 5000
    }, res => {
      let body = '';
      res.on('data', c => { body += c; });
      res.on('end', () => { try { resolve(res.statusCode === 200 ? JSON.parse(body) : null); } catch (e) { resolve(null); } });
    });
    req.on('error', () => { if (credCache.creds === creds) credCache = { creds: null, at: 0 }; resolve(null); });
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

// { gameName, tagLine, profileIconId } des eingeloggten Accounts oder null
// (Client zu / nicht eingeloggt). Achtung: die puuid der LCU ist eine andere
// als die der Web-API - verglichen wird deshalb ueber die Riot-ID.
async function currentSummoner() {
  const creds = await clientCredentials();
  if (!creds) return null;
  const s = await lcuGet(creds, '/lol-summoner/v1/current-summoner');
  if (!s || !s.gameName) return null;
  return { gameName: s.gameName, tagLine: s.tagLine, profileIconId: s.profileIconId };
}

function sameRiotId(a, gameName, tagLine) {
  return !!a && a.gameName.toLowerCase() === String(gameName).toLowerCase() && String(a.tagLine).toLowerCase() === String(tagLine).toLowerCase();
}

// Queue-Liste des Clients (v6.13.0): fuer "ist Arena gerade im Spiel?".
// null = Client zu / nicht eingeloggt (dann bleibt der zuletzt bekannte Stand).
async function gameQueues() {
  const creds = await clientCredentials();
  if (!creds) return null;
  const q = await lcuGet(creds, '/lol-game-queues/v1/queues');
  return Array.isArray(q) ? q : null;
}

// Champ Select (v6.14.0): wer hat was gebannt / gepickt? null = gerade kein
// Champ Select (oder Client zu). Champion-IDs als Strings (= Data-Dragon-key).
//   queueId/gameMode  - aus der Gameflow-Session
//   banned            - gebannt von ANDEREN (eigene Bans bewusst nicht: sonst
//                       koennte man sich per Selbst-Ban gratis umwuerfeln)
//   pickedByOthers    - von Mitspielern/Gegnern gewaehlt (gelockt)
//   myPick            - eigener gelockter Champion (oder null)
//   hovered           - von Mitspielern gerade gehovert (als Ersatz meiden)
//   summoner          - eingeloggter Account { gameName, tagLine }
async function champSelect() {
  const st = await clientState();
  return st && st.champSelect ? st.champSelect : null;
}

// Gameflow-Stand (v6.15.0): { phase, queueId, gameMode, summoner,
// champSelect } - champSelect nur in der Phase ChampSelect (sonst null).
// null = Client zu / keine Session. Summoner pro Client-Start gemerkt.
let meCache = { creds: null, me: null };
async function clientState() {
  const creds = await cachedCredentials();
  if (!creds) return null;
  const flow = await lcuGet(creds, '/lol-gameflow/v1/session');
  if (!flow || !flow.phase) return null;
  if (meCache.creds !== creds || !meCache.me) {
    const me = await lcuGet(creds, '/lol-summoner/v1/current-summoner');
    meCache = { creds, me: me && me.gameName ? { gameName: me.gameName, tagLine: me.tagLine } : null };
  }
  const queue = (flow.gameData && flow.gameData.queue) || {};
  const base = {
    phase: flow.phase, queueId: Number(queue.id) || null,
    gameMode: queue.gameMode || (flow.gameData && flow.gameData.gameMode) || '',
    summoner: meCache.me, champSelect: null
  };
  if (flow.phase === 'ChampSelect') {
    const session = await lcuGet(creds, '/lol-champ-select/v1/session');
    if (session) {
      const disabled = await lcuGet(creds, '/lol-champ-select/v1/disabled-champion-ids');
      base.champSelect = parseChampSelect(flow, session, disabled, meCache.me ? { gameName: meCache.me.gameName, tagLine: meCache.me.tagLine } : null);
    }
  }
  return base;
}
function parseChampSelect(flow, session, disabled, me) {
  const queue = (flow.gameData && flow.gameData.queue) || {};
  const local = session.localPlayerCellId;
  const id = v => (Number(v) > 0 ? String(v) : null);
  const ownBans = new Set(), banned = new Set(), picked = new Set(), hovered = new Set();
  let myPick = null;
  for (const a of (session.actions || []).flat()) {
    const c = id(a && a.championId);
    if (!c) continue;
    if (!a.completed) { if (a.type === 'pick' && a.actorCellId !== local) hovered.add(c); continue; }
    if (a.type === 'ban') (a.actorCellId === local ? ownBans : banned).add(c);
    else if (a.type === 'pick') { if (a.actorCellId === local) myPick = c; else picked.add(c); }
  }
  const b = session.bans || {};
  [...(b.myTeamBans || []), ...(b.theirTeamBans || [])].map(id).filter(Boolean).forEach(c => banned.add(c));
  // Eigenes Team: championId ist waehrend des Zugs schon der Hover -> nur
  // abgeschlossene Aktionen (oben) zaehlen. Gegner sieht man erst gelockt.
  for (const p of session.myTeam || []) {
    if (p.cellId === local) continue;
    [p.championId, p.championPickIntent].map(id).filter(Boolean).forEach(c => hovered.add(c));
  }
  for (const p of session.theirTeam || []) {
    const c = id(p && p.championId);
    if (c) picked.add(c);
  }
  // Vom Client gesperrte Champions (Bans/Picks, auch wenn die Session sie
  // nicht einzeln zeigt, z.B. andere Arena-Teams) - ohne eigene Bans
  if (Array.isArray(disabled)) disabled.map(id).filter(Boolean).forEach(c => { if (!picked.has(c)) banned.add(c); });
  ownBans.forEach(c => { if (!picked.has(c)) banned.delete(c); });
  if (myPick) { banned.delete(myPick); picked.delete(myPick); }
  return {
    queueId: Number(queue.id) || null, gameMode: queue.gameMode || (flow.gameData && flow.gameData.gameMode) || '',
    banned: [...banned], pickedByOthers: [...picked], myPick,
    hovered: [...hovered].filter(c => !picked.has(c)), // nur als Ersatz meiden
    ownBans: [...ownBans], // loest nichts aus, darf aber nie Ersatz sein
    summoner: me && me.gameName ? { gameName: me.gameName, tagLine: me.tagLine } : null
  };
}

module.exports = { currentSummoner, sameRiotId, gameQueues, champSelect, clientState, parseChampSelect };
