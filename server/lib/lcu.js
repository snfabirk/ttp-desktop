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
    req.on('error', () => resolve(null));
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

module.exports = { currentSummoner, sameRiotId };
