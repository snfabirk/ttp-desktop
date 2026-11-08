// Online-Accounts (v5.33.0, Supabase): Profil-Account mit eigenem
// Benutzernamen + Passwort, Fortschritts-Sync und verknuepfte Riot-Accounts.
//
// - Login nur mit Benutzername: Supabase braucht intern eine E-Mail. Ohne
//   echte Adresse wird eine unsichtbare Platzhalter-Adresse benutzt; wer
//   optional eine echte angibt, kann damit sein Passwort zuruecksetzen. Die
//   DB-Funktion login_email gibt die Adresse nur bei richtigem Passwort raus
//   (supabase/schema.sql).
// - Fortschritt (progression.js) liegt lokal pro Profil und wird nach jeder
//   Aenderung hochgeladen; offline geaenderte Staende gehen beim naechsten
//   Kontakt hoch ("dirty"-Merker).
// - Riot-Accounts: Besitz-Nachweis ueber ein vorgegebenes Profil-Icon, das
//   sich vom aktuellen unterscheidet (kein Riot-Login noetig).
// Nicht manipulationssicher - fuer privaten Gebrauch so gewollt.
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { DATA_DIR } = require('./dataPaths');
const progression = require('./progression');
const lcu = require('./lcu');
const challengeRuns = require('./challengeRuns');

const SUPABASE_URL = 'https://qrpfbnnapsvsfxvpwjfu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZiAFBoJeTHZZPQRvg_ylBQ_sSb6VO04';
const PLACEHOLDER_DOMAIN = 'users.three-trick-pony.app';
// Nutzerwunsch 2026-11-06: mindestens 8 Zeichen (Name und Passwort)
const USERNAME_RE = /^[A-Za-z0-9_]{8,20}$/;

// ----- Sitzung update-fest im userData-Ordner -----
const AUTH_FILE = path.join(DATA_DIR, 'auth-session.json');
function readAuthFile() {
  try { return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8')); } catch (e) { return {}; }
}
const fileStorage = {
  getItem: key => { const v = readAuthFile()[key]; return v === undefined ? null : v; },
  setItem: (key, value) => {
    const all = readAuthFile(); all[key] = value;
    fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
    fs.writeFileSync(AUTH_FILE, JSON.stringify(all));
  },
  removeItem: key => {
    const all = readAuthFile(); delete all[key];
    try { fs.writeFileSync(AUTH_FILE, JSON.stringify(all)); } catch (e) {}
  }
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: fileStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  // Realtime (v6.6.0) fuer Geschenke: Electrons Node 20 hat keinen eingebauten
  // WebSocket - das Paket "ws" springt ein.
  realtime: { transport: require('ws') }
});

// ----- Verbindungsstatus fuer das Banner -----
// ok | offline (kein Internet) | unreachable (Internet da, Server nicht -
// z.B. pausiertes Projekt) | unknown (noch nicht geprueft)
let connection = 'unknown';
let lastCheck = 0;

async function internetReachable() {
  try {
    const r = await fetch('https://ddragon.leagueoflegends.com/api/versions.json', { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    return r.ok;
  } catch (e) { return false; }
}
async function checkConnection() {
  lastCheck = Date.now();
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/username_available`, {
      method: 'POST',
      headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'healthcheck' }),
      signal: AbortSignal.timeout(8000)
    });
    connection = r.ok ? 'ok' : (await internetReachable() ? 'unreachable' : 'offline');
  } catch (e) {
    connection = (await internetReachable()) ? 'unreachable' : 'offline';
  }
  if (connection === 'ok') flushPending();
  return connection;
}
function noteNetworkError(e) {
  // Netzwerkfehler (kein HTTP-Status) -> Status beim naechsten Mal neu pruefen
  if (e && !e.status && /fetch|network|ENOTFOUND|ECONN|timeout/i.test(String(e.message || e))) checkConnection();
}
setInterval(checkConnection, 5 * 60 * 1000).unref();

// ----- Aktueller Nutzer -----
let current = null; // { id, username, avatar, email }

function isPlaceholderEmail(email) {
  return !email || email.toLowerCase().endsWith(`@${PLACEHOLDER_DOMAIN}`);
}
async function loadProfile(user) {
  const { data, error } = await supabase.from('profiles').select('username, avatar').eq('id', user.id).single();
  if (error) throw error;
  return { id: user.id, username: data.username, avatar: data.avatar, email: isPlaceholderEmail(user.email) ? null : user.email };
}

// ----- Fortschritts-Sync -----
function syncFile(userId) { return path.join(DATA_DIR, 'progression', `${userId}.sync.json`); }
function readSync(userId) { try { return JSON.parse(fs.readFileSync(syncFile(userId), 'utf-8')); } catch (e) { return { dirty: false, at: null }; } }
function writeSync(userId, s) { fs.mkdirSync(path.dirname(syncFile(userId)), { recursive: true }); fs.writeFileSync(syncFile(userId), JSON.stringify(s)); }

let pushTimer = null;
let pushing = false;
// Isolierte Testinstanz (TTP_TEST_NO_PUSH=1): nichts in die Cloud schreiben
const NO_PUSH = process.env.TTP_TEST_NO_PUSH === '1';
async function pushNow() {
  if (!current || pushing || NO_PUSH) return;
  pushing = true;
  const userId = current.id;
  try {
    const data = progression.exportState();
    const { data: row, error } = await supabase.from('progression')
      .upsert({ user_id: userId, data, updated_at: new Date().toISOString() })
      .select('updated_at').single();
    if (error) throw error;
    writeSync(userId, { dirty: false, at: row.updated_at });
  } catch (e) {
    noteNetworkError(e);
  } finally {
    pushing = false;
  }
}
function schedulePush() {
  if (!current) return;
  writeSync(current.id, { ...readSync(current.id), dirty: true });
  clearTimeout(pushTimer);
  pushTimer = setTimeout(pushNow, 2000);
}
function flushPending() {
  if (current && readSync(current.id).dirty) pushNow();
  if (typeof flushPendingRuns === 'function') flushPendingRuns();
}
progression.setOnWrite(schedulePush);

// ----- Challenge-Laeufe pro Summoner (v6.0, challengeRuns.js) -----
// Lokal ist die Quelle; jede Aenderung geht nach challenge_runs. Was offline
// nicht hochging, steht in pendingRuns und wird nachgeholt.
const pendingRuns = new Set();
async function pushRun(puuid) {
  if (NO_PUSH) return;
  if (!current) { pendingRuns.add(puuid); return; }
  const rec = challengeRuns.getRecord(puuid);
  if (!rec) return;
  try {
    const { error } = await supabase.from('challenge_runs')
      .upsert({ puuid, user_id: current.id, data: rec.run, updated_at: rec.updatedAt });
    if (error) throw error;
    pendingRuns.delete(puuid);
  } catch (e) {
    pendingRuns.add(puuid);
    noteNetworkError(e);
  }
}
challengeRuns.setOnChange(puuid => { pushRun(puuid); });
function flushPendingRuns() { [...pendingRuns].forEach(pushRun); }

// Lauf fuer einen Summoner holen: lokal, sonst online (anderer PC).
async function getChallengeRun(puuid) {
  const local = challengeRuns.getRecord(puuid);
  if (local) return local.run;
  if (!current) return null;
  try {
    const { data, error } = await supabase.from('challenge_runs').select('data, updated_at').eq('puuid', puuid).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return challengeRuns.importRecord(puuid, { run: data.data, updatedAt: data.updated_at }).run;
  } catch (e) { noteNetworkError(e); return null; }
}

// Beim Anmelden: lokale und Online-Laeufe der verknuepften Summoner
// abgleichen - der juengere Stand gewinnt.
async function syncRuns() {
  if (!current) return;
  try {
    const accounts = await listRiotAccounts();
    if (!accounts.length) return;
    const { data, error } = await supabase.from('challenge_runs').select('puuid, data, updated_at').in('puuid', accounts.map(a => a.puuid));
    if (error) throw error;
    const byPuuid = new Map((data || []).map(r => [r.puuid, r]));
    for (const a of accounts) {
      const local = challengeRuns.getRecord(a.puuid), remote = byPuuid.get(a.puuid);
      if (local && (!remote || new Date(local.updatedAt) > new Date(remote.updated_at))) await pushRun(a.puuid);
      else if (remote && (!local || new Date(remote.updated_at) > new Date(local.updatedAt))) challengeRuns.importRecord(a.puuid, { run: remote.data, updatedAt: remote.updated_at });
    }
  } catch (e) { noteNetworkError(e); }
}

// Beim Anmelden: Cloud-Stand und lokalen Stand zusammenfuehren.
async function activate(user) {
  const profile = await loadProfile(user);
  progression.setUserScope(user.id);
  current = profile;
  const sync = readSync(user.id);
  const { data: row, error } = await supabase.from('progression').select('data, updated_at').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  const cloudEmpty = !row || !row.data || !Object.keys(row.data).length;
  if (progression.hasUserFile(user.id)) {
    if (sync.dirty || cloudEmpty) await pushNow();
    else if (!sync.at || new Date(row.updated_at) > new Date(sync.at)) {
      progression.importState(row.data);
      writeSync(user.id, { dirty: false, at: row.updated_at });
    }
  } else if (!cloudEmpty) {
    // Liegt auf diesem PC noch ein unbeanspruchter alter Stand, der NEUER ist
    // als der Online-Stand (z.B. Konto vorher in einer Test-Instanz mit einer
    // aelteren Kopie angelegt), gewinnt der Stand dieses PCs.
    const legacyAt = progression.legacyStateTime();
    if (legacyAt && legacyAt > new Date(row.updated_at).getTime()) {
      progression.claimLegacyState(user.id);
      await pushNow();
    } else {
      progression.importState(row.data);
      writeSync(user.id, { dirty: false, at: row.updated_at });
    }
  } else {
    // Allererste Anmeldung auf diesem PC mit leerem Online-Konto: der alte
    // Fortschritt von vor den Accounts (progression.json) wird uebernommen -
    // genau einmal, danach gehoert er diesem Profil.
    progression.claimLegacyState(user.id);
    await pushNow();
  }
  syncRuns();
  watchGifts();
  return current;
}

let restored = null;
function restoreSession() {
  if (!restored) {
    restored = (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session && data.session.user) await activate(data.session.user);
      } catch (e) {
        noteNetworkError(e);
        // Offline: mit dem lokal gespeicherten Profil weitermachen
        const cached = readAuthFile().ttpProfile;
        if (cached) { progression.setUserScope(cached.id); current = cached; }
      }
      if (current) fileStorage.setItem('ttpProfile', current);
      await checkConnection();
    })();
  }
  return restored;
}

function validUsername(name) {
  if (!USERNAME_RE.test(name || '')) {
    const err = new Error('Username: 8-20 characters, only letters, numbers and _'); err.status = 400; throw err;
  }
}
async function usernameAvailable(name) {
  if (!USERNAME_RE.test(name || '')) return { valid: false, available: false };
  if (current && current.username.toLowerCase() === String(name).toLowerCase()) return { valid: true, available: true, own: true };
  try {
    const { data, error } = await supabase.rpc('username_available', { name });
    if (error) throw error;
    return { valid: true, available: !!data };
  } catch (e) { throw friendly(e); }
}
function validPassword(pw) {
  if (!pw || pw.length < 8) { const err = new Error('Password: at least 8 characters'); err.status = 400; throw err; }
}
function friendly(e) {
  noteNetworkError(e);
  if (e && e.status === 400 && e.message) return e;
  const msg = String((e && e.message) || e);
  if (/fetch|network|ENOTFOUND|ECONN|timeout/i.test(msg)) {
    const err = new Error(connection === 'offline' ? "You're offline - check your internet connection." : 'The online server is unreachable right now.'); err.status = 503; return err;
  }
  const err = new Error(msg); err.status = e && e.status && e.status < 500 ? e.status : 500; return err;
}

async function signUp({ username, password, email }) {
  try {
    validUsername(username); validPassword(password);
    const { data: free, error: e1 } = await supabase.rpc('username_available', { name: username });
    if (e1) throw e1;
    if (!free) { const err = new Error('This username is already taken.'); err.status = 400; throw err; }
    const realEmail = (email || '').trim();
    if (realEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(realEmail)) { const err = new Error('That e-mail address does not look right.'); err.status = 400; throw err; }
    const { data, error } = await supabase.auth.signUp({
      email: realEmail || `${username.toLowerCase()}@${PLACEHOLDER_DOMAIN}`,
      password,
      options: { data: { username } }
    });
    if (error) throw error;
    if (!data.session) { const err = new Error('Account created, but the server wants an e-mail confirmation - "Confirm email" must be off in Supabase.'); err.status = 500; throw err; }
    await activate(data.user);
    fileStorage.setItem('ttpProfile', current);
    return current;
  } catch (e) { throw friendly(e); }
}

async function signIn({ username, password }) {
  try {
    const { data: email, error: e1 } = await supabase.rpc('login_email', { name: (username || '').trim(), pass: password || '' });
    if (e1) throw e1;
    if (!email) { const err = new Error('Wrong username or password.'); err.status = 400; throw err; }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await activate(data.user);
    fileStorage.setItem('ttpProfile', current);
    return current;
  } catch (e) { throw friendly(e); }
}

async function signOut() {
  unwatchGifts();
  if (current) { clearTimeout(pushTimer); await pushNow(); }
  try { await supabase.auth.signOut(); } catch (e) {}
  fileStorage.removeItem('ttpProfile');
  current = null;
  progression.setUserScope(null);
}

async function requestPasswordReset(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail((email || '').trim());
    if (error) throw error;
  } catch (e) { throw friendly(e); }
}

// Code aus der Reset-Mail (Vorlage "Reset Password" muss {{ .Token }}
// enthalten) + neues Passwort -> angemeldet.
async function completePasswordReset({ email, code, password }) {
  try {
    validPassword(password);
    const { data, error } = await supabase.auth.verifyOtp({ email: (email || '').trim(), token: (code || '').trim(), type: 'recovery' });
    if (error) throw error;
    const { error: e2 } = await supabase.auth.updateUser({ password });
    if (e2) throw e2;
    await activate(data.user);
    fileStorage.setItem('ttpProfile', current);
    return current;
  } catch (e) { throw friendly(e); }
}

async function updateAccount({ username, password, email }) {
  if (!current) { const err = new Error('Not signed in.'); err.status = 401; throw err; }
  try {
    if (username && username !== current.username) {
      validUsername(username);
      const { data: free, error: e1 } = await supabase.rpc('username_available', { name: username });
      if (e1) throw e1;
      if (!free && username.toLowerCase() !== current.username.toLowerCase()) { const err = new Error('This username is already taken.'); err.status = 400; throw err; }
      const { error } = await supabase.from('profiles').update({ username }).eq('id', current.id);
      if (error) throw error;
      current.username = username;
      // Ohne echte E-Mail haengt die versteckte Platzhalter-Adresse am Namen -
      // mitziehen, sonst koennte sich niemand mehr mit dem alten Namen
      // registrieren (Adresse waere noch belegt).
      if (!current.email) {
        const { error: e2 } = await supabase.rpc('set_my_email', { new_email: '' });
        if (e2) noteNetworkError(e2);
      }
    }
    if (password) {
      validPassword(password);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    }
    if (email !== undefined) {
      // v6.2.0: ueber die DB-Funktion set_my_email (supabase/006) statt
      // auth.updateUser - das verlangt immer eine Bestaetigungs-Mail.
      const real = (email || '').trim();
      const { data: saved, error } = await supabase.rpc('set_my_email', { new_email: real });
      if (error) { const err = new Error(error.message || 'Could not save the e-mail.'); err.status = 400; throw err; }
      current.email = isPlaceholderEmail(saved) ? null : saved;
    }
    fileStorage.setItem('ttpProfile', current);
    return current;
  } catch (e) { throw friendly(e); }
}

// ----- Riot-Accounts -----
const pendingVerifications = new Map(); // puuid -> { target, gameName, tagLine, expires }
// Nutzerwunsch: hoechstens 5 Summoner pro Profil (zusaetzlich per DB-Trigger)
const MAX_RIOT_ACCOUNTS = 5;
const STARTER_ICONS = Array.from({ length: 29 }, (_, i) => i); // Icons 0-28 hat jeder Account

async function listRiotAccounts() {
  if (!current) return [];
  try {
    const { data, error } = await supabase.from('riot_accounts').select('*').eq('user_id', current.id).order('created_at');
    if (error) throw error;
    fileStorage.setItem('ttpRiot', data);
    return data;
  } catch (e) {
    noteNetworkError(e);
    return readAuthFile().ttpRiot || [];
  }
}

function limitError() {
  const err = new Error(`You can link up to ${MAX_RIOT_ACCOUNTS} summoners - unlink one first.`); err.status = 400; return err;
}
async function linkVerified(puuid, gameName, tagLine) {
  try {
    const existing = await listRiotAccounts();
    if (existing.length >= MAX_RIOT_ACCOUNTS) throw limitError();
    const { error } = await supabase.from('riot_accounts').insert({
      user_id: current.id, puuid, game_name: gameName, tag_line: tagLine, is_active: existing.length === 0
    });
    if (error) {
      if (/at most 5/i.test(error.message || '')) throw limitError();
      if (error.code === '23505') { const err = new Error('This summoner is already linked to another profile.'); err.status = 400; throw err; }
      throw error;
    }
    pendingVerifications.delete(puuid);
    return { verified: true, accounts: await listRiotAccounts() };
  } catch (e) { throw friendly(e); }
}

// Besitz-Nachweis (v5.33.0): 1) League-Client auf diesem PC ist mit genau
// diesem Account eingeloggt -> sofort verknuepft. 2) Sonst Profil-Icon auf ein
// vorgegebenes aendern; geprueft wird ueber den Client (sofort) und die
// Riot-Web-API (kann stark verzoegert sein).
async function startVerification({ gameName, tagLine, riot }) {
  if (!current) { const err = new Error('Not signed in.'); err.status = 401; throw err; }
  const account = await riot.getAccount(gameName, tagLine);
  const existing = await listRiotAccounts();
  if (existing.some(a => a.puuid === account.puuid)) { const err = new Error('This summoner is already linked to your profile.'); err.status = 400; throw err; }
  if (existing.length >= MAX_RIOT_ACCOUNTS) throw limitError();
  const client = await lcu.currentSummoner();
  if (lcu.sameRiotId(client, account.gameName, account.tagLine)) {
    return { ...(await linkVerified(account.puuid, account.gameName, account.tagLine)), via: 'client' };
  }
  const summoner = await riot.getSummoner(account.puuid);
  const options = STARTER_ICONS.filter(i => i !== summoner.profileIconId);
  const target = options[Math.floor(Math.random() * options.length)];
  pendingVerifications.set(account.puuid, { target, gameName: account.gameName, tagLine: account.tagLine, expires: Date.now() + 30 * 60 * 1000 });
  return { verified: false, puuid: account.puuid, gameName: account.gameName, tagLine: account.tagLine, currentIcon: summoner.profileIconId, targetIcon: target };
}

async function checkVerification({ puuid, riot }) {
  if (!current) { const err = new Error('Not signed in.'); err.status = 401; throw err; }
  const pending = pendingVerifications.get(puuid);
  if (!pending || pending.expires < Date.now()) { const err = new Error('This check expired - please start again.'); err.status = 400; throw err; }
  const client = await lcu.currentSummoner();
  if (lcu.sameRiotId(client, pending.gameName, pending.tagLine)) {
    return { ...(await linkVerified(puuid, pending.gameName, pending.tagLine)), via: 'client' };
  }
  const summoner = await riot.getSummoner(puuid);
  if (summoner.profileIconId !== pending.target) {
    return { verified: false, currentIcon: summoner.profileIconId, targetIcon: pending.target };
  }
  return { ...(await linkVerified(puuid, pending.gameName, pending.tagLine)), via: 'icon' };
}

async function setActiveRiotAccount(id) {
  if (!current) { const err = new Error('Not signed in.'); err.status = 401; throw err; }
  try {
    const { error: e1 } = await supabase.from('riot_accounts').update({ is_active: false }).eq('user_id', current.id).eq('is_active', true);
    if (e1) throw e1;
    const { error } = await supabase.from('riot_accounts').update({ is_active: true }).eq('id', id).eq('user_id', current.id);
    if (error) throw error;
    return listRiotAccounts();
  } catch (e) { throw friendly(e); }
}

async function removeRiotAccount(id) {
  if (!current) { const err = new Error('Not signed in.'); err.status = 401; throw err; }
  try {
    const before = await listRiotAccounts();
    const removed = before.find(a => a.id === id);
    const { error } = await supabase.from('riot_accounts').delete().eq('id', id).eq('user_id', current.id);
    if (error) throw error;
    let after = await listRiotAccounts();
    if (removed && removed.is_active && after.length) after = await setActiveRiotAccount(after[0].id);
    return after;
  } catch (e) { throw friendly(e); }
}

function getCurrent() { return current; }
async function setAvatar(id) {
  if (!current) return;
  try {
    const { error } = await supabase.from('profiles').update({ avatar: id }).eq('id', current.id);
    if (error) throw error;
    current.avatar = id;
    fileStorage.setItem('ttpProfile', current);
  } catch (e) { noteNetworkError(e); }
}
// Aktiver Riot-Account aus der zuletzt geladenen Liste (auch offline)
function activeRiotAccount() {
  if (!current) return null;
  return (readAuthFile().ttpRiot || []).find(a => a.is_active && a.user_id === current.id) || null;
}
// Alle verknuepften Riot-Accounts des angemeldeten Profils (lokal gespeichert)
function linkedRiotAccounts() {
  if (!current) return [];
  return (readAuthFile().ttpRiot || []).filter(a => a.user_id === current.id);
}
function getConnection() { return { status: connection, checkedAt: lastCheck }; }

// ----- Freunde (v6.1.0, supabase/005-friends.sql) -----
// Gefunden wird nur ueber den TTP-Benutzernamen (Riot-Namen lassen sich
// aendern). Eine Freundschaft: requester -> addressee, pending/accepted.
function needUser() {
  if (!current) { const err = new Error('Not signed in.'); err.status = 401; throw err; }
}

async function searchUsers(q) {
  needUser();
  const term = String(q || '').trim();
  if (term.length < 2 || !/^[A-Za-z0-9_]+$/.test(term)) return [];
  try {
    const { data, error } = await supabase.from('profiles').select('id, username, avatar')
      .ilike('username', `${term.replace(/_/g, '\\_')}%`).neq('id', current.id).order('username').limit(8);
    if (error) throw error;
    return data || [];
  } catch (e) { throw friendly(e); }
}

async function listFriends() {
  needUser();
  try {
    const { data: rows, error } = await supabase.from('friendships').select('*')
      .or(`requester.eq.${current.id},addressee.eq.${current.id}`).order('created_at');
    if (error) throw error;
    const otherIds = [...new Set((rows || []).map(r => (r.requester === current.id ? r.addressee : r.requester)))];
    let profiles = [], snaps = [];
    if (otherIds.length) {
      const p = await supabase.from('profiles').select('id, username, avatar').in('id', otherIds);
      if (p.error) throw p.error;
      profiles = p.data || [];
      // Level o.ae. nur von Freunden lesbar (RLS) - bei offenen Anfragen leer
      const s = await supabase.from('public_profiles').select('user_id, data, updated_at').in('user_id', otherIds);
      snaps = s.error ? [] : (s.data || []);
    }
    const byId = new Map(profiles.map(p => [p.id, p]));
    const snapBy = new Map(snaps.map(s => [s.user_id, s]));
    const view = r => {
      const otherId = r.requester === current.id ? r.addressee : r.requester;
      const p = byId.get(otherId) || {};
      const snap = snapBy.get(otherId);
      const st = snap && snap.data && snap.data.stats;
      return {
        id: r.id, userId: otherId, username: p.username || '?', avatar: p.avatar || null,
        level: st && st.level ? st.level.level : null,
        lastSeen: snap ? snap.updated_at : null
      };
    };
    const out = { friends: [], incoming: [], outgoing: [] };
    (rows || []).forEach(r => {
      if (r.status === 'accepted') out.friends.push(view(r));
      else if (r.addressee === current.id) out.incoming.push(view(r));
      else out.outgoing.push(view(r));
    });
    out.friends.sort((a, b) => a.username.localeCompare(b.username));
    return out;
  } catch (e) { throw friendly(e); }
}

async function sendFriendRequest(userId) {
  needUser();
  if (!userId || userId === current.id) { const err = new Error('You cannot add yourself.'); err.status = 400; throw err; }
  try {
    // Hat der andere schon angefragt? Dann einfach annehmen.
    const { data: existing, error: e1 } = await supabase.from('friendships').select('*')
      .or(`and(requester.eq.${userId},addressee.eq.${current.id}),and(requester.eq.${current.id},addressee.eq.${userId})`);
    if (e1) throw e1;
    const ex = (existing || [])[0];
    if (ex) {
      if (ex.status === 'accepted') { const err = new Error('You are already friends.'); err.status = 400; throw err; }
      if (ex.requester === userId) return acceptFriendRequest(ex.id);
      const err = new Error('Request already sent.'); err.status = 400; throw err;
    }
    const { error } = await supabase.from('friendships').insert({ requester: current.id, addressee: userId });
    if (error) throw error;
    return listFriends();
  } catch (e) { throw friendly(e); }
}

async function acceptFriendRequest(id) {
  needUser();
  try {
    const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', id).eq('addressee', current.id);
    if (error) throw error;
    return listFriends();
  } catch (e) { throw friendly(e); }
}

// Ablehnen, zurueckziehen oder Freundschaft beenden
async function removeFriendship(id) {
  needUser();
  try {
    const { error } = await supabase.from('friendships').delete().eq('id', id);
    if (error) throw error;
    return listFriends();
  } catch (e) { throw friendly(e); }
}

// Momentaufnahme des eigenen Profils, die Freunde sehen (Widgets, Level,
// Cosmetics, Theme, Rang, Pool) - der Server baut sie, cloud.js laedt hoch.
async function publishProfile(snapshot) {
  if (!current) return { ok: false };
  try {
    const { error } = await supabase.from('public_profiles')
      .upsert({ user_id: current.id, data: { ...snapshot, username: current.username, avatar: current.avatar || null }, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { ok: true };
  } catch (e) { noteNetworkError(e); return { ok: false }; }
}

// Activity der Freunde (v6.2.0) aus ihren Profil-Momentaufnahmen
async function friendsActivity() {
  needUser();
  try {
    const { friends } = await listFriends();
    if (!friends.length) return [];
    const { data, error } = await supabase.from('public_profiles').select('user_id, data').in('user_id', friends.map(f => f.userId));
    if (error) throw error;
    const byId = new Map(friends.map(f => [f.userId, f]));
    const out = [];
    (data || []).forEach(row => {
      const f = byId.get(row.user_id);
      ((row.data && row.data.activity) || []).forEach(ev => out.push({ ...ev, userId: row.user_id, username: f.username, avatar: f.avatar }));
    });
    return out.sort((a, b) => b.at - a.at).slice(0, 30);
  } catch (e) { throw friendly(e); }
}

// ----- Booster verschenken (v6.6.0, supabase/007-booster-gifts.sql) -----
async function sendBoosterGift({ to, set, qty, message }) {
  needUser();
  qty = Math.floor(Number(qty) || 1);
  const msg = String(message || '').replace(/\s+/g, ' ').trim().slice(0, 80) || null;
  if (!to || to === current.id) { const err = new Error('Pick a friend to send it to.'); err.status = 400; throw err; }
  const taken = progression.takeBoostersForGift(set, qty);
  if (!taken.ok) { const err = new Error(taken.error); err.status = 400; throw err; }
  try {
    const { error } = await supabase.from('booster_gifts').insert({ sender: current.id, recipient: to, set_id: set, qty, message: msg });
    if (error) {
      // RLS lehnt ab = keine Freunde (mehr)
      if (/row-level security/i.test(error.message || '')) { const err = new Error('You can only send gifts to friends.'); err.status = 400; throw err; }
      throw error;
    }
    return { ok: true, owned: taken.owned };
  } catch (e) {
    progression.returnGiftBoosters(set, qty);
    throw friendly(e);
  }
}
// Offene Geschenke beobachten: Supabase Realtime meldet neue Zeilen sofort
// (RLS: nur eigene), dazu alle 60 s ein Abgleich als Rueckfallebene. Die
// Seiten hoeren ueber /api/events (SSE) mit und lassen das Symbol leuchten.
let pendingGifts = 0, pendingTrades = 0, giftChannel = null, giftTimer = null;
const giftListeners = new Set();
function onGiftsChange(fn) { giftListeners.add(fn); return () => giftListeners.delete(fn); }
function getPendingGifts() { return pendingGifts; }
function getNotices() { return { gifts: pendingGifts, trades: pendingTrades }; }
const emitNotices = () => giftListeners.forEach(fn => { try { fn(getNotices()); } catch (e) {} });
function setPending(n) {
  if (n === pendingGifts) return;
  pendingGifts = n;
  emitNotices();
}
function setPendingTrades(n) {
  if (n === pendingTrades) return;
  pendingTrades = n;
  emitNotices();
}
// Tausch: offene Angebote AN mich + entschiedene eigene, noch nicht abgerechnet
async function refreshPendingTrades() {
  if (!current) { setPendingTrades(0); return 0; }
  try {
    const me = current.id;
    const { data, error } = await supabase.from('sticker_trades').select('id, proposer, partner, status, proposer_settled')
      .or(`and(partner.eq.${me},status.eq.open),and(proposer.eq.${me},proposer_settled.eq.false,status.neq.open)`);
    if (error) throw error;
    setPendingTrades((data || []).length);
  } catch (e) { noteNetworkError(e); }
  return pendingTrades;
}
async function refreshPendingGifts() {
  if (!current) { setPending(0); return 0; }
  try {
    const { data, error } = await supabase.from('booster_gifts').select('qty')
      .eq('recipient', current.id).is('claimed_at', null);
    if (error) throw error;
    setPending((data || []).reduce((a, r) => a + r.qty, 0));
  } catch (e) { noteNetworkError(e); }
  return pendingGifts;
}
async function watchGifts() {
  unwatchGifts();
  if (!current) return;
  const me = current.id;
  refreshPendingGifts(); refreshPendingTrades();
  giftTimer = setInterval(() => { refreshPendingGifts(); refreshPendingTrades(); }, 60000);
  try {
    try { await supabase.realtime.setAuth(); } catch (e) {}
    giftChannel = supabase.channel(`gifts-${me}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booster_gifts', filter: `recipient=eq.${me}` }, () => refreshPendingGifts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sticker_trades', filter: `partner=eq.${me}` }, () => refreshPendingTrades())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sticker_trades', filter: `proposer=eq.${me}` }, () => refreshPendingTrades())
      .subscribe();
  } catch (e) { /* Realtime nicht verfuegbar - der 60-s-Abgleich reicht */ }
}
function unwatchGifts() {
  clearInterval(giftTimer); giftTimer = null;
  if (giftChannel) { try { supabase.removeChannel(giftChannel); } catch (e) {} giftChannel = null; }
  setPending(0); setPendingTrades(0);
}

// ----- Sticker tauschen (v6.6.0, supabase/009-sticker-trades.sql) -----
const badReq = msg => { const err = new Error(msg); err.status = 400; return err; };
async function createTrade({ to, give, want, message }) {
  needUser();
  const g = progression.normTradeItems(give), w = progression.normTradeItems(want);
  if (!g || !w) throw badReq('Pick 1 to 10 stickers on each side.');
  if (!to || to === current.id) throw badReq('Pick a friend to trade with.');
  const msg = String(message || '').replace(/\s+/g, ' ').trim().slice(0, 80) || null;
  const res = progression.tradeReserve(g, w);
  if (!res.ok) throw badReq(res.error);
  try {
    const { error } = await supabase.from('sticker_trades').insert({ proposer: current.id, partner: to, give: g, want: w, message: msg });
    if (error) {
      if (/row-level security/i.test(error.message || '')) throw badReq('You can only trade with friends.');
      throw error;
    }
    return { ok: true };
  } catch (e) {
    progression.tradeUnreserve(g, w);
    throw friendly(e);
  }
}
async function decideTrade(id, decision) {
  needUser();
  if (!['accepted', 'declined', 'cancelled'].includes(decision)) throw badReq('Unknown action.');
  try {
    const { data: row, error } = await supabase.from('sticker_trades').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!row || row.status !== 'open') throw badReq('This offer is no longer open.');
    const g = progression.normTradeItems(row.give) || [], w = progression.normTradeItems(row.want) || [];
    if (decision === 'accepted') {
      if (row.partner !== current.id) throw badReq('Only the other player can accept this.');
      const took = progression.tradeAcceptTake(g, w);
      if (!took.ok) throw badReq(took.error);
      let done = null;
      try {
        const r = await supabase.rpc('decide_sticker_trade', { trade_id: id, decision });
        if (r.error) throw r.error;
        done = (r.data || [])[0];
      } catch (e) { progression.tradeAcceptRollback(g, w); throw e; }
      if (!done) { progression.tradeAcceptRollback(g, w); throw badReq('This offer is no longer open.'); }
      progression.tradeReceive(g);
    } else {
      const r = await supabase.rpc('decide_sticker_trade', { trade_id: id, decision });
      if (r.error) throw r.error;
      if (!(r.data || []).length) throw badReq('This offer is no longer open.');
      if (decision === 'cancelled') await settleTrades();
    }
    refreshPendingTrades();
    return { ok: true };
  } catch (e) { throw e.status === 400 ? e : friendly(e); }
}
// Eigene entschiedene Angebote genau einmal abrechnen
async function settleTrades() {
  const { data, error } = await supabase.rpc('settle_sticker_trades');
  if (error) throw error;
  const rows = data || [];
  progression.tradeSettle(rows);
  return rows;
}
async function listTrades() {
  needUser();
  try {
    const settled = await settleTrades();
    const me = current.id;
    const { data, error } = await supabase.from('sticker_trades').select('*')
      .or(`proposer.eq.${me},partner.eq.${me}`).order('created_at', { ascending: false }).limit(40);
    if (error) throw error;
    const rows = data || [];
    const ids = [...new Set(rows.map(r => (r.proposer === me ? r.partner : r.proposer)))];
    let profs = [];
    if (ids.length) { const p = await supabase.from('profiles').select('id, username, avatar').in('id', ids); profs = p.data || []; }
    const by = new Map(profs.map(p => [p.id, p]));
    const newly = new Set(settled.map(r => r.id));
    const view = r => {
      const mine = r.proposer === me, other = by.get(mine ? r.partner : r.proposer) || {};
      const g = progression.normTradeItems(r.give) || [], w = progression.normTradeItems(r.want) || [];
      // aus MEINER Sicht: was ich gebe / bekomme
      const iGive = mine ? g : w, iGet = mine ? w : g;
      const out = { id: r.id, mine, with: { id: mine ? r.partner : r.proposer, username: other.username || '?', avatar: other.avatar || null },
        give: iGive, get: iGet, myFee: progression.tradeFee(g, w), theirFee: progression.tradeFee(g, w),
        message: r.message, status: r.status, at: r.created_at, decidedAt: r.decided_at, justSettled: newly.has(r.id) };
      if (!mine && r.status === 'open') {
        out.missing = progression.missingStickers(iGive);
        out.warnings = progression.tradeWarnings(iGive);
      }
      return out;
    };
    const all = rows.map(view);
    refreshPendingTrades();
    return {
      incoming: all.filter(t => !t.mine && t.status === 'open'),
      outgoing: all.filter(t => t.mine && t.status === 'open'),
      history: all.filter(t => t.status !== 'open').slice(0, 15),
      coins: progression.tradeInfo().coins
    };
  } catch (e) { throw e.status === 400 ? e : friendly(e); }
}

// Offene Geschenke abholen (atomar in der Datenbank) und lokal gutschreiben
async function claimBoosterGifts() {
  if (!current) return { gifts: [] };
  try {
    const { data, error } = await supabase.rpc('claim_booster_gifts');
    if (error) throw error;
    const rows = data || [];
    setPending(0);
    if (!rows.length) return { gifts: [] };
    progression.receiveGiftBoosters(rows);
    const ids = [...new Set(rows.map(r => r.sender))];
    const { data: profs } = await supabase.from('profiles').select('id, username, avatar').in('id', ids);
    const by = new Map((profs || []).map(p => [p.id, p]));
    return { gifts: rows.map(r => ({ id: r.id, from: (by.get(r.sender) || {}).username || 'A friend', avatar: (by.get(r.sender) || {}).avatar || null, set: r.set_id, setName: (require('./stickers').getSet(r.set_id) || {}).name || r.set_id, qty: r.qty, message: r.message, at: r.created_at })) };
  } catch (e) { noteNetworkError(e); return { gifts: [], error: String(e.message || e) }; }
}

async function getFriendProfile(userId) {
  needUser();
  try {
    const { data, error } = await supabase.from('public_profiles').select('data, updated_at').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (!data) { const err = new Error("This profile isn't available - you may not be friends (yet), or they haven't opened the app since."); err.status = 404; throw err; }
    return { ...data.data, updatedAt: data.updated_at };
  } catch (e) { throw e.status === 404 ? e : friendly(e); }
}

module.exports = {
  restoreSession, signUp, signIn, signOut, requestPasswordReset, completePasswordReset, updateAccount,
  listRiotAccounts, startVerification, checkVerification, setActiveRiotAccount, removeRiotAccount,
  getCurrent, getConnection, checkConnection, linkedRiotAccounts, usernameAvailable, MAX_RIOT_ACCOUNTS, getChallengeRun, activeRiotAccount, setAvatar,
  searchUsers, listFriends, sendFriendRequest, acceptFriendRequest, removeFriendship, publishProfile, getFriendProfile, friendsActivity,
  sendBoosterGift, claimBoosterGifts, onGiftsChange, getPendingGifts, refreshPendingGifts, getNotices,
  createTrade, decideTrade, listTrades, tradeWarnings: items => progression.tradeWarnings(progression.normTradeItems(items) || [])
};
