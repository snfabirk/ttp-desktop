// Pass-Themes mit Szene (v5.12.0) - Designs aus theme-lab/ (vom Nutzer
// abgenommen). Steuert zusaetzlich die CSS-Animationen von Borders/Rahmen:
// <html> bekommt 'fx-off' (Einstellung Aus) bzw. 'fx-paused' (Nur bei
// Benutzung + gerade inaktiv), siehe cosmetics.css / style.css.
//
//   hallows (Stufe 15, simpel): stehende Szene HINTER dem Inhalt - Mondsichel,
//     Fledermaeuse, Huegel, Baum mit Laterne, Graeber, Zaun mit schwarzer
//     Katze, Kerzen, Kuerbisse. Nur kleine CSS-Akzente (Flammen, Glimmen).
//     Easter Egg: 5x auf die Katze -> sie schaut dich an, Augen rot, Lichter
//     aus, Kuerbisse grinsen boese, dann flackert alles wieder an.
//   haunted (Stufe 30, fancy): WebGL-Nebel, Mond, Sterne, Laterne folgt der
//     Maus (aus, wenn die Maus das Fenster verlaesst), 9 Geister fliehen vor
//     dem Licht, gedaempfte Blitze mit Spukhaus. Easter Egg: 5 Geister
//     anklicken -> Riesengeist, BOO.
//
// Einstellung (Setup, localStorage 'ttp_theme_anim'):
//   'off'    - nie (haunted zeigt dann nur den stehenden Hintergrund)
//   'active' - nur bei Benutzung: solange die Maus im Fenster ist bzw. bis
//              5 Sekunden nach der letzten Eingabe (Standard)
//   'always' - immer (solange das Fenster sichtbar ist)
// Ein- und Ausblenden passiert immer weich. Im Tray/minimiert laeuft nichts.
(function () {
  const ANIM_KEY = 'ttp_theme_anim';
  const IDLE_MS = 5000;
  const FADE_PER_SEC = 1.1;
  const SCENES = { hallows: hallowsScene, haunted: hauntedScene };

  let scene = null;
  let sceneKey = null;
  let level = 0;
  let rafId = null;
  let lastFrame = 0;
  let lastInteraction = Date.now();
  let pointerInside = true;
  const pointer = { x: innerWidth / 2, y: innerHeight * 0.55 };

  // Bewusst NICHT an Windows' "Animationen reduzieren" gekoppelt (beim Nutzer
  // war die Option an und die Animation dadurch nie zu sehen).
  const mode = () => {
    try { return localStorage.getItem(ANIM_KEY) || 'active'; } catch (e) { return 'active'; }
  };
  const currentTheme = () => document.documentElement.getAttribute('data-theme') || '';
  const isActive = () => pointerInside || Date.now() - lastInteraction < IDLE_MS;
  const rand = (a, b) => a + Math.random() * (b - a);
  // Klicks auf Bedienelemente/Boxen zaehlen nie fuer Easter Eggs
  const INTERACTIVE = 'a, button, input, select, textarea, label, summary, [role="button"], [contenteditable], .widget, .card, .dash-card, .prog-card, .top-nav, .side-panel, dialog';

  function targetLevel() {
    if (!scene || !scene.animated || document.hidden) return 0;
    const m = mode();
    if (m === 'off') return 0;
    if (m === 'always') return 1;
    return isActive() ? 1 : 0;
  }

  function syncTheme() {
    const key = currentTheme();
    if (key === sceneKey) return;
    if (scene) scene.unmount();
    sceneKey = key;
    level = 0;
    scene = SCENES[key] ? SCENES[key]() : null;
    if (scene) scene.mount();
    wake();
  }

  function wake() {
    if (!rafId && scene && scene.animated) { lastFrame = 0; rafId = requestAnimationFrame(frame); }
  }

  function frame(now) {
    rafId = null;
    if (!scene || !scene.animated) return;
    const target = targetLevel();
    const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1 / 60;
    lastFrame = now;
    level = target > level ? Math.min(target, level + FADE_PER_SEC * dt) : Math.max(target, level - FADE_PER_SEC * dt);
    scene.setLevel(level);
    if (level === 0 && target === 0) return; // schlafen bis zur naechsten Aktivitaet
    scene.frame(dt, now / 1000);
    rafId = requestAnimationFrame(frame);
  }

  function syncCssState() {
    const m = mode();
    const root = document.documentElement;
    root.classList.toggle('fx-off', m === 'off');
    root.classList.toggle('fx-paused', m === 'active' && !isActive());
  }

  // ----- Aktivitaet -----
  const touch = () => { lastInteraction = Date.now(); pointerInside = true; syncCssState(); wake(); };
  ['mousedown', 'keydown', 'wheel'].forEach(ev => window.addEventListener(ev, touch, { passive: true }));
  window.addEventListener('mousemove', e => { pointer.x = e.clientX; pointer.y = e.clientY; touch(); }, { passive: true });
  document.addEventListener('mouseleave', () => { pointerInside = false; lastInteraction = Date.now(); });
  document.addEventListener('mouseenter', touch);
  window.addEventListener('blur', () => { pointerInside = false; });
  document.addEventListener('visibilitychange', wake);
  window.addEventListener('resize', () => { if (scene && scene.resize) scene.resize(); });
  window.addEventListener('storage', e => { if (e.key === ANIM_KEY || e.key === 'ttp_theme') { setTimeout(syncTheme, 0); syncCssState(); wake(); } });
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  setInterval(() => { syncCssState(); wake(); }, 1000);
  syncCssState();

  if (document.body) syncTheme();
  else document.addEventListener('DOMContentLoaded', syncTheme);

  // ===================== Szene: All Hallows (Stufe 15) =====================
  function hallowsScene() {
    let bg = null;
    let top = null;
    let clicks = 0;
    let resetT = null;
    let busy = false;
    const wait = ms => new Promise(r => setTimeout(r, ms));

    async function egg(cat) {
      busy = true;
      const fires = [...bg.querySelectorAll('.fire')];
      const evil = [...top.querySelectorAll('.evil-face')];
      const dim = top.querySelector('.dim');
      // Loch im Abdunkeln genau um die Augen
      const m = cat.getScreenCTM();
      const c = new DOMPoint(15, 12).matrixTransform(m), e = new DOMPoint(25, 12).matrixTransform(m);
      dim.style.setProperty('--ex', `${c.x}px`);
      dim.style.setProperty('--ey', `${c.y}px`);
      dim.style.setProperty('--eh', `${(e.x - c.x) * 1.1}px`);
      cat.classList.add('stare');                                   // Kopf dreht sich zu dir
      await wait(1000);
      cat.classList.add('red');                                     // Augen werden rot
      await wait(500);
      fires.forEach(f => { f.classList.remove('relit'); f.classList.add('out'); });
      dim.classList.add('on');
      await wait(500);
      evil.forEach(f => f.classList.add('on'));                     // Kuerbisse grinsen boese
      await wait(1250);
      evil.forEach(f => f.classList.remove('on'));
      await wait(300);
      dim.classList.remove('on');
      cat.classList.remove('red');
      fires.forEach(f => { f.classList.remove('out'); f.classList.add('relit'); });
      await wait(900);
      cat.classList.remove('stare');                                // schaut wieder weg
      await wait(1300);
      fires.forEach(f => f.classList.remove('relit'));
      busy = false;
    }

    // Die Szene liegt hinter dem Inhalt - Klicks auf die Katze werden ueber
    // die Position erkannt (nur wenn dort kein Bedienelement liegt).
    function onClick(ev) {
      if (busy || !bg || ev.button !== 0) return;
      if (ev.target.closest && ev.target.closest(INTERACTIVE)) return;
      const cat = bg.querySelector('.cat');
      const r = cat.getBoundingClientRect();
      if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) return;
      cat.classList.remove('twitch'); void cat.getBoundingClientRect(); cat.classList.add('twitch');
      clicks++;
      clearTimeout(resetT);
      resetT = setTimeout(() => { clicks = 0; }, 8000);
      if (clicks >= 5) { clicks = 0; egg(cat); }
    }

    return {
      animated: false,
      mount() {
        bg = document.createElement('div');
        bg.className = 'hallows-fx';
        bg.setAttribute('aria-hidden', 'true');
        bg.innerHTML = `<div class="stars"></div><div class="moon"></div><svg class="bats" viewBox="0 0 140 70" fill="#3a3140"><defs><g id="hx-bat"><path d="M0 -2 Q7 -11 24 -9 Q19 -5 20 0 Q16 -2 13 2 Q10 -1 7 3 Q4 1 0 4 Q-4 1 -7 3 Q-10 -1 -13 2 Q-16 -2 -20 0 Q-19 -5 -24 -9 Q-7 -11 0 -2 Z"/><ellipse cx="0" cy="0" rx="2.8" ry="4.5"/><path d="M-2.2 -3.5 L-2.8 -7.5 L-0.8 -4.5 Z M2.2 -3.5 L2.8 -7.5 L0.8 -4.5 Z"/></g></defs><use href="#hx-bat" transform="translate(34 32) rotate(-8) scale(1.15)"/><use href="#hx-bat" transform="translate(88 16) rotate(10) scale(.85)"/><use href="#hx-bat" transform="translate(114 44) rotate(-14) scale(.7)"/></svg><svg class="web tl" viewBox="0 0 60 60" fill="none" stroke="#9a9aa3" stroke-width=".8" stroke-linecap="round"><path d="M0 0 L60 0 M0 0 L0 60 M0 0 L52 22 M0 0 L38 38 M0 0 L22 52"/><path d="M14 0 Q12 6 13 5.5 Q8 9 5.5 13 Q6 12 0 14"/><path d="M28 0 Q24 10 25.5 11 Q17 17 11 25.5 Q10 24 0 28"/><path d="M42 0 Q37 14 38.5 17 Q27 27 17 38.5 Q14 37 0 42"/></svg><svg class="web br" viewBox="0 0 60 60" fill="none" stroke="#9a9aa3" stroke-width=".8" stroke-linecap="round"><path d="M0 0 L60 0 M0 0 L0 60 M0 0 L52 22 M0 0 L38 38 M0 0 L22 52"/><path d="M14 0 Q12 6 13 5.5 Q8 9 5.5 13 Q6 12 0 14"/><path d="M28 0 Q24 10 25.5 11 Q17 17 11 25.5 Q10 24 0 28"/><path d="M42 0 Q37 14 38.5 17 Q27 27 17 38.5 Q14 37 0 42"/></svg><div class="scene"><svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice"><defs><radialGradient id="hx-lantG"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient><radialGradient id="hx-pg" cx=".5" cy=".55" r=".55"><stop offset="0" stop-color="#f7a04a"/><stop offset=".7" stop-color="#e2721c"/><stop offset="1" stop-color="#a84a0c"/></radialGradient><g id="hx-pk"><path d="M0 -34 q2 -12 12 -14" stroke="#33421f" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="0" cy="0" rx="38" ry="30" fill="url(#hx-pg)"/><ellipse cx="0" cy="0" rx="18" ry="30" fill="none" stroke="#b85a14" stroke-width="2" opacity=".7"/><ellipse cx="-24" cy="0" rx="12" ry="27" fill="none" stroke="#b85a14" stroke-width="1.5" opacity=".5"/><ellipse cx="24" cy="0" rx="12" ry="27" fill="none" stroke="#b85a14" stroke-width="1.5" opacity=".5"/></g><g id="hx-face"><path d="M-18 -6 l7 -10 l7 10 z M4 -6 l7 -10 l7 10 z" /><path d="M-20 6 q20 18 40 0 l-5 2 l-4 -4 l-4 5 l-5 -4 l-5 4 l-4 -5 l-4 4 z"/></g></defs><path d="M0 300 L0 170 Q200 120 420 160 T860 150 Q1100 110 1340 160 T1600 140 L1600 300 Z" fill="#141016"/><path d="M0 300 L0 220 Q260 190 520 215 T1040 205 Q1300 185 1600 215 L1600 300 Z" fill="#0b090c"/><path d="M150 300 L158 150 M156 190 L118 150 M157 172 L196 128 M118 150 L104 136 M196 128 L214 120 M157 210 L188 196" stroke="#0b090c" stroke-width="9" fill="none" stroke-linecap="round"/><g fill="#141016" stroke="#221c24" stroke-width="2"><path d="M640 230 L640 186 Q640 160 664 160 Q688 160 688 186 L688 230 Z" transform="rotate(-6 664 230)"/><path d="M760 232 L760 196 Q760 178 778 178 Q796 178 796 196 L796 232 Z" transform="rotate(5 778 232)"/></g><text x="652" y="200" font-family="Cinzel, serif" font-size="13" fill="#3a3038" transform="rotate(-6 664 230)">RIP</text><path d="M196 128 L196 150" stroke="#0b090c" stroke-width="2"/><g class="fire" style="--d:.5s"><circle class="lantern-glow" cx="196" cy="164" r="26" fill="url(#hx-lantG)"/></g><rect x="188" y="150" width="16" height="22" rx="3" fill="#1a1410" stroke="#0b090c" stroke-width="2"/><g class="fire" style="--d:.5s"><rect x="191" y="154" width="10" height="14" rx="2" fill="#ffb347" class="lantern-glow"/></g><g fill="#0b090c"><rect x="1180" y="168" width="9" height="60" transform="rotate(-6 1184 228)"/><rect x="1215" y="172" width="9" height="56" transform="rotate(4 1219 228)"/><rect x="1250" y="166" width="9" height="62" transform="rotate(-3 1254 228)"/><rect x="1285" y="174" width="9" height="54" transform="rotate(7 1289 228)"/><rect x="1320" y="170" width="9" height="58" transform="rotate(-5 1324 228)"/><rect x="1170" y="186" width="166" height="6" transform="rotate(-2 1250 189)"/><rect x="1170" y="206" width="166" height="6" transform="rotate(1.5 1250 209)"/></g><g fill="#070609" transform="translate(1262 150)" class="cat" id="hx-cat"><rect x="-10" y="-14" width="62" height="56" fill="transparent"/><path d="M0 36 Q-4 14 6 6 L4 -6 L11 2 Q15 0 19 2 L26 -6 L24 6 Q34 14 30 36 Z"/><path class="tail" d="M28 32 Q46 30 44 10 Q43 4 40 6 Q42 26 26 28 Z"/><g class="cat-look"><g class="cat-eyes"><ellipse class="cat-eye" cx="10" cy="12" rx="2.4" ry="2" fill="#f5d041"/><ellipse class="cat-eye" cx="20" cy="12" rx="2.4" ry="2" fill="#f5d041"/><ellipse class="cat-slit" cx="10" cy="12" rx=".45" ry="1.7" fill="#120303"/><ellipse class="cat-slit" cx="20" cy="12" rx=".45" ry="1.7" fill="#120303"/></g></g></g><g transform="translate(470 238)"><rect x="-5" y="-22" width="10" height="24" rx="2" fill="#e8dcc6"/><g class="fire" style="--d:.1s"><path class="flame" d="M0 -36 Q6 -28 0 -22 Q-6 -28 0 -36 Z" fill="#ffb347"/><circle cx="0" cy="-28" r="12" fill="#ffb347" opacity=".18"/></g></g><g transform="translate(1030 242)"><rect x="-4" y="-18" width="8" height="20" rx="2" fill="#e8dcc6"/><g class="fire" style="--d:0s"><path class="flame b" d="M0 -31 Q5 -24 0 -18 Q-5 -24 0 -31 Z" fill="#ffb347"/><circle cx="0" cy="-24" r="10" fill="#ffb347" opacity=".18"/></g></g><g opacity=".85"><path d="M560 262 q6 -8 12 0 q-6 6 -12 0 z" fill="#8a3b12"/><path d="M600 270 q5 -7 10 0 q-5 5 -10 0 z" fill="#a8551a" transform="rotate(30 605 270)"/><path d="M870 266 q6 -8 12 0 q-6 6 -12 0 z" fill="#6e2f10" transform="rotate(-20 876 266)"/><path d="M1110 268 q5 -7 10 0 q-5 5 -10 0 z" fill="#a8551a"/><path d="M1380 270 q6 -8 12 0 q-6 6 -12 0 z" fill="#8a3b12" transform="rotate(15 1386 270)"/><path d="M330 268 q5 -7 10 0 q-5 5 -10 0 z" fill="#6e2f10"/></g><g transform="translate(420 232) scale(.9)"><use href="#hx-pk"/><g class="pumpkin-face" fill="#2a1408"><use href="#hx-face"/></g></g><g transform="translate(520 240) scale(.7)"><use href="#hx-pk"/><g class="pumpkin-face b" fill="#2a1408"><use href="#hx-face"/></g></g><g transform="translate(980 236) scale(1.05)"><use href="#hx-pk"/><g class="pumpkin-face c" fill="#2a1408"><use href="#hx-face"/></g></g><g transform="translate(1440 238) scale(.8)"><use href="#hx-pk"/><g class="pumpkin-face" fill="#2a1408"><use href="#hx-face"/></g></g><g fill="#ffb347" opacity=".9"><g class="fire pk" style="--d:.35s"><g class="pumpkin-face" transform="translate(420 232) scale(.9)"><g transform="scale(.82)"><use href="#hx-face"/></g></g></g><g class="fire pk" style="--d:.2s"><g class="pumpkin-face b" transform="translate(520 240) scale(.7)"><g transform="scale(.82)"><use href="#hx-face"/></g></g></g><g class="fire pk" style="--d:.05s"><g class="pumpkin-face c" transform="translate(980 236) scale(1.05)"><g transform="scale(.82)"><use href="#hx-face"/></g></g></g><g class="fire pk" style="--d:0s"><g class="pumpkin-face" transform="translate(1440 238) scale(.8)"><g transform="scale(.82)"><use href="#hx-face"/></g></g></g></g></svg></div>`;
        top = document.createElement('div');
        top.className = 'hallows-fx-top';
        top.setAttribute('aria-hidden', 'true');
        top.innerHTML = `<div class="dim" id="hx-dim"></div><div class="scene evil" aria-hidden="true"><svg viewBox="0 0 1600 300" preserveAspectRatio="xMidYMax slice" fill="#ff4a14"><defs><g id="hx-evilFace"><path d="M-21 -15 L-5 -6 L-17 -1 Z M21 -15 L5 -6 L17 -1 Z"/><path d="M-23 3 L-16 8 L-12 4 L-7 10 L-3 5 L0 9 L3 5 L7 10 L12 4 L16 8 L23 3 Q16 21 0 21 Q-16 21 -23 3 Z"/></g></defs><g class="evil-face" style="--d:0s" transform="translate(1440 238) scale(.8)"><g transform="scale(.82)"><use href="#hx-evilFace"/></g></g><g class="evil-face" style="--d:.25s" transform="translate(980 236) scale(1.05)"><g transform="scale(.82)"><use href="#hx-evilFace"/></g></g><g class="evil-face" style="--d:.45s" transform="translate(520 240) scale(.7)"><g transform="scale(.82)"><use href="#hx-evilFace"/></g></g><g class="evil-face" style="--d:.6s" transform="translate(420 232) scale(.9)"><g transform="scale(.82)"><use href="#hx-evilFace"/></g></g></svg></div>`;
        document.body.append(bg, top);
        document.addEventListener('click', onClick, true);
      },
      unmount() {
        document.removeEventListener('click', onClick, true);
        if (bg) bg.remove();
        if (top) top.remove();
        bg = top = null;
      }
    };
  }

  // ===================== Szene: Haunted Night (Stufe 30) =====================
  function hauntedScene() {
    let root = null, glCanvas = null, fxCanvas = null, gl = null, fx = null, U = null, counter = null;
    let W = 0, H = 0;
    const light = { sx: pointer.x, sy: pointer.y, v: 0 };
    const ghosts = [];
    const poofs = [];
    let flash = 0, nextBolt = 3, bolt = null, boss = null;
    let caught = 0, caughtReset = null;

    const FS = `precision mediump float;
uniform vec2 r; uniform float t; uniform float flash;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r; float asp=r.x/r.y; vec2 p=uv*vec2(asp,1.)*2.6;
  float q=fbm(p+vec2(t*.04,t*.015));
  float f=fbm(p+q*2.2+vec2(-t*.07,t*.025));
  vec3 col=mix(vec3(.012,.01,.022),vec3(.05,.025,.09),uv.y);
  vec3 fogC=mix(vec3(.26,.14,.42),vec3(.78,.34,.10),smoothstep(.58,.95,f)*(1.-uv.y*.8));
  col+=fogC*f*f*.6*(1.22-uv.y);
  vec2 sp=uv*vec2(asp,1.)*90.; vec2 sg=floor(sp); vec2 sf=fract(sp)-.5; float s=h(sg);
  vec2 off=vec2(h(sg+3.1),h(sg+7.7))-.5; float sd=length(sf-off*.6);
  float star=step(.985,s)*smoothstep(.09,.0,sd)*(.55+.45*sin(t*(1.5+s*3.)+s*90.));
  col+=vec3(.95,.92,1.)*star*smoothstep(.3,.85,uv.y);
  float d=length((uv-vec2(.83,.78))*vec2(asp,1.));
  float disc=smoothstep(.066,.061,d);
  float crater=fbm((uv-vec2(.83,.78))*vec2(asp,1.)*38.);
  col=mix(col,vec3(1.,.96,.86)*(.78+.3*crater),disc);
  col+=vec3(1.,.8,.55)*(.35*exp(-d*7.)+.12*exp(-d*2.2))*(1.-disc);
  col+=vec3(.35,.35,.55)*flash*(.15+f*.5);
  gl_FragColor=vec4(col,1.);
}`;

    function initGl() {
      gl = glCanvas.getContext('webgl');
      if (!gl) return;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}'));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl = null; return; }
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const aLoc = gl.getAttribLocation(prog, 'a');
      gl.enableVertexAttribArray(aLoc);
      gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
      U = { r: gl.getUniformLocation(prog, 'r'), t: gl.getUniformLocation(prog, 't'), flash: gl.getUniformLocation(prog, 'flash') };
    }

    function resize() {
      W = innerWidth; H = innerHeight;
      glCanvas.width = Math.round(W * 0.75); glCanvas.height = Math.round(H * 0.75);
      if (gl) gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      const dpr = Math.min(2, devicePixelRatio || 1);
      fxCanvas.width = Math.round(W * dpr); fxCanvas.height = Math.round(H * dpr);
      fx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const newHome = g => { const a = rand(0, Math.PI * 2), v = rand(8, 18); g.wx = Math.cos(a) * v; g.wy = Math.sin(a) * v; g.homeT = rand(4, 9); };

    function drawGhost(g, t) {
      const s = g.s, x = g.x + Math.sin(t * 0.7 + g.ph) * 10, y = g.y + Math.sin(t * 1.4 + g.ph) * 5;
      fx.save(); fx.translate(x, y); fx.rotate(g.vx * 0.004);
      const grad = fx.createLinearGradient(0, -s * 0.5, 0, s * 0.8);
      grad.addColorStop(0, `rgba(240,236,255,${g.a})`); grad.addColorStop(1, 'rgba(200,190,255,0)');
      fx.fillStyle = grad; fx.shadowColor = 'rgba(190,170,255,.6)'; fx.shadowBlur = s * 0.6;
      fx.beginPath(); fx.arc(0, 0, s * 0.5, Math.PI, 0);
      const b = s * 0.85;
      fx.lineTo(s * 0.5, b);
      for (let i = 0; i < 5; i++) {
        const x1 = s * 0.5 - (i + 0.5) * (s / 5), x2 = s * 0.5 - (i + 1) * (s / 5);
        fx.quadraticCurveTo(x1, b - s * 0.22 + Math.sin(t * 5 + g.ph + i) * s * 0.08, x2, b);
      }
      fx.closePath(); fx.fill(); fx.shadowBlur = 0;
      const eye = ex => {
        const eg = fx.createRadialGradient(ex, -s * 0.06, 0, ex, -s * 0.06, s * 0.14);
        eg.addColorStop(0, `rgba(255,170,80,${g.a * 2})`); eg.addColorStop(1, 'rgba(255,120,40,0)');
        fx.fillStyle = eg; fx.beginPath(); fx.arc(ex, -s * 0.06, s * 0.14, 0, 7); fx.fill();
      };
      eye(-s * 0.17); eye(s * 0.17);
      fx.restore();
    }

    function makeBolt() {
      const pts = []; let x = rand(W * 0.15, W * 0.85), y = 0;
      while (y < H * 0.6) { pts.push([x, y]); x += rand(-38, 38); y += rand(18, 42); }
      return pts;
    }

    function drawManor() {
      const s = Math.min(W, H) / 900;
      fx.save(); fx.translate(W * 0.62, H); fx.scale(s, s);
      fx.fillStyle = `rgba(4,3,8,${Math.min(1, flash * 1.6)})`;
      fx.beginPath();
      fx.moveTo(-420, 0); fx.lineTo(-420, -180); fx.lineTo(-340, -260); fx.lineTo(-260, -180); fx.lineTo(-260, -230); fx.lineTo(-180, -330);
      fx.lineTo(-170, -420); fx.lineTo(-150, -330); fx.lineTo(-60, -250); fx.lineTo(-60, -300); fx.lineTo(40, -390); fx.lineTo(140, -300);
      fx.lineTo(140, -220); fx.lineTo(260, -300); fx.lineTo(380, -200); fx.lineTo(380, 0); fx.closePath(); fx.fill();
      fx.fillStyle = `rgba(255,170,60,${flash * 0.9})`;
      [[-330, -150], [-200, -200], [20, -240], [60, -240], [250, -170], [300, -170]].forEach(([wx, wy]) => fx.fillRect(wx, wy, 18, 26));
      fx.restore();
    }

    function respawnGhost(g) {
      g.hidden = true; g.vx = 0; g.vy = 0;
      setTimeout(() => {
        g.hidden = false;
        newHome(g);
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { g.x = -60; g.y = rand(H * 0.1, H * 0.9); g.vx = rand(60, 110); g.vy = rand(-20, 20); }
        if (side === 1) { g.x = W + 60; g.y = rand(H * 0.1, H * 0.9); g.vx = -rand(60, 110); g.vy = rand(-20, 20); }
        if (side === 2) { g.x = rand(W * 0.1, W * 0.9); g.y = H + 60; g.vx = rand(-20, 20); g.vy = -rand(70, 120); }
        if (side === 3) { g.x = rand(W * 0.1, W * 0.9); g.y = -60; g.vx = rand(-20, 20); g.vy = rand(50, 90); }
      }, 900 + Math.random() * 900);
    }

    // Geister liegen hinter dem Inhalt - Klicks werden ueber die Position erkannt
    function onClick(e) {
      if (boss || level < 0.5 || e.button !== 0) return;
      if (e.target.closest && e.target.closest(INTERACTIVE)) return;
      const t = performance.now() / 1000;
      for (const g of ghosts) {
        if (g.hidden) continue;
        const gx = g.x + Math.sin(t * 0.7 + g.ph) * 10, gy = g.y + Math.sin(t * 1.4 + g.ph) * 5 + g.s * 0.15;
        if (Math.hypot(e.clientX - gx, e.clientY - gy) < g.s * 0.65) {
          for (let k = 0; k < 18; k++) { const a = Math.random() * 6.28, v = 60 + Math.random() * 140; poofs.push({ x: gx, y: gy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1 }); }
          respawnGhost(g);
          caught++;
          counter.textContent = '👻'.repeat(caught) + '·'.repeat(5 - caught);
          counter.classList.add('show');
          clearTimeout(caughtReset);
          caughtReset = setTimeout(() => { caught = 0; counter.classList.remove('show'); }, 12000);
          if (caught >= 5) {
            caught = 0; clearTimeout(caughtReset);
            setTimeout(() => counter.classList.remove('show'), 600);
            boss = { t: 0 };
            root.classList.add('boss'); // Riesengeist kommt VOR den Inhalt
          }
          break;
        }
      }
    }

    function drawPoofsAndBoss(dt, t) {
      for (let i = poofs.length - 1; i >= 0; i--) {
        const p = poofs[i]; p.life -= dt * 1.4;
        if (p.life <= 0) { poofs.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96;
        fx.fillStyle = `rgba(230,225,255,${p.life * 0.7})`; fx.beginPath(); fx.arc(p.x, p.y, 3 + (1 - p.life) * 6, 0, 7); fx.fill();
      }
      if (!boss) return;
      boss.t += dt; const bt = boss.t;
      const S = Math.min(W, H) * 0.95;
      const dim = Math.min(1, bt / 1.2) * (bt > 4.6 ? Math.max(0, 1 - (bt - 4.6) / 1.2) : 1);
      fx.fillStyle = `rgba(0,0,0,${dim * 0.72})`; fx.fillRect(0, 0, W, H);
      const rise = Math.min(1, bt / 2), up = bt > 3.8 ? (bt - 3.8) * (bt - 3.8) * 420 : 0;
      const cx = W / 2 + Math.sin(bt * 1.3) * 30, cy = H + S * 0.55 - rise * S * 0.95 - up;
      const alpha = Math.min(0.9, bt * 0.8) * (bt > 4.4 ? Math.max(0, 1 - (bt - 4.4) / 1.4) : 1);
      const shake = bt > 2.2 && bt < 2.9 ? (Math.random() - 0.5) * 18 : 0;
      fx.save(); fx.translate(cx + shake, cy + shake * 0.6); fx.globalAlpha = alpha;
      const g = fx.createLinearGradient(0, -S * 0.5, 0, S * 0.7);
      g.addColorStop(0, 'rgba(235,230,255,.95)'); g.addColorStop(0.6, 'rgba(200,190,240,.75)'); g.addColorStop(1, 'rgba(160,150,220,0)');
      fx.fillStyle = g; fx.shadowColor = 'rgba(200,180,255,.8)'; fx.shadowBlur = 80;
      fx.beginPath(); fx.arc(0, 0, S * 0.42, Math.PI, 0);
      const b = S * 0.7;
      fx.lineTo(S * 0.42, b);
      for (let i = 0; i < 7; i++) {
        const x1 = S * 0.42 - (i + 0.5) * (S * 0.84 / 7), x2 = S * 0.42 - (i + 1) * (S * 0.84 / 7);
        fx.quadraticCurveTo(x1, b - S * 0.1 + Math.sin(t * 4 + i) * S * 0.03, x2, b);
      }
      fx.closePath(); fx.fill(); fx.shadowBlur = 0;
      const lx = Math.max(-1, Math.min(1, (light.sx - cx) / W * 3)), ly = Math.max(-1, Math.min(1, (light.sy - cy) / H * 3));
      [-1, 1].forEach(side => {
        const ex = side * S * 0.14, ey = -S * 0.08;
        fx.fillStyle = 'rgba(15,8,20,.95)'; fx.beginPath(); fx.ellipse(ex, ey, S * 0.065, S * 0.09, 0, 0, 7); fx.fill();
        const eg = fx.createRadialGradient(ex + lx * S * 0.025, ey + ly * S * 0.035, 0, ex + lx * S * 0.025, ey + ly * S * 0.035, S * 0.05);
        eg.addColorStop(0, 'rgba(255,190,90,1)'); eg.addColorStop(1, 'rgba(255,90,20,0)');
        fx.fillStyle = eg; fx.beginPath(); fx.arc(ex + lx * S * 0.025, ey + ly * S * 0.035, S * 0.05, 0, 7); fx.fill();
      });
      const open = bt > 2.1 && bt < 3.2 ? 1 : 0.35;
      fx.fillStyle = 'rgba(15,8,20,.95)'; fx.beginPath(); fx.ellipse(0, S * 0.12, S * 0.07 * (open > 0.5 ? 1.4 : 1), S * 0.06 * open + S * 0.02, 0, 0, 7); fx.fill();
      fx.restore();
      if (bt > 2.1 && bt < 3.6) {
        const k = Math.min(1, (bt - 2.1) * 4), fade = bt > 3.1 ? Math.max(0, 1 - (bt - 3.1) * 2) : 1;
        fx.save(); fx.globalAlpha = fade; fx.translate(W / 2 + shake, H * 0.3); fx.scale(0.6 + k * 0.5, 0.6 + k * 0.5);
        fx.font = `900 ${Math.round(S * 0.16)}px Cinzel, serif`; fx.textAlign = 'center';
        fx.fillStyle = '#ffb36b'; fx.shadowColor = '#ff6a1a'; fx.shadowBlur = 40; fx.fillText('BOO!', 0, 0);
        fx.restore();
      }
      if (bt > 6) { boss = null; root.classList.remove('boss'); }
    }

    return {
      animated: true,
      mount() {
        root = document.createElement('div');
        root.className = 'haunted-fx';
        root.setAttribute('aria-hidden', 'true');
        glCanvas = document.createElement('canvas');
        fxCanvas = document.createElement('canvas');
        root.append(glCanvas, fxCanvas);
        counter = document.createElement('div');
        counter.className = 'haunted-ghost-count';
        document.body.append(root, counter);
        fx = fxCanvas.getContext('2d');
        initGl();
        resize();
        for (let i = 0; i < 9; i++) ghosts.push({ x: rand(0, W), y: rand(0, H), vx: rand(-15, 15), vy: rand(-12, 4), s: rand(26, 52), ph: rand(0, 6.28), a: rand(0.25, 0.45) });
        document.addEventListener('click', onClick, true);
      },
      unmount() {
        document.removeEventListener('click', onClick, true);
        if (root) root.remove();
        if (counter) counter.remove();
        root = counter = null;
      },
      resize,
      setLevel(v) { if (root) root.style.opacity = v; },
      frame(dt, t) {
        if (W !== innerWidth || H !== innerHeight) resize();
        light.sx += (pointer.x - light.sx) * Math.min(1, dt * 6);
        light.sy += (pointer.y - light.sy) * Math.min(1, dt * 6);
        light.v += ((pointerInside ? 1 : 0) - light.v) * Math.min(1, dt * 2.5);
        const L = light.v;

        nextBolt -= dt;
        if (nextBolt <= 0) { flash = 1; bolt = makeBolt(); nextBolt = rand(7, 13); }
        flash = Math.max(0, flash - dt * 1.6);
        if (flash < 0.2) bolt = null;

        if (gl) {
          gl.uniform2f(U.r, glCanvas.width, glCanvas.height);
          gl.uniform1f(U.t, t);
          gl.uniform1f(U.flash, flash);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }

        fx.clearRect(0, 0, W, H);
        // Dunkelheit mit Laternen-Loch
        const dark = fx.createRadialGradient(light.sx, light.sy, 30, light.sx, light.sy, 380);
        const far = 0.66 - flash * 0.12;
        dark.addColorStop(0, `rgba(2,1,6,${far * (1 - L)})`);
        dark.addColorStop(0.35, `rgba(2,1,6,${0.36 * L + far * (1 - L) - flash * 0.06})`);
        dark.addColorStop(1, `rgba(2,1,6,${far})`);
        fx.fillStyle = dark; fx.fillRect(0, 0, W, H);
        // Mond bleibt leuchtend
        fx.save(); fx.globalCompositeOperation = 'destination-out';
        const mx = W * 0.83, my = H * 0.22, mr = Math.min(W, H) * 0.2;
        const mg = fx.createRadialGradient(mx, my, 0, mx, my, mr);
        mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
        fx.fillStyle = mg; fx.beginPath(); fx.arc(mx, my, mr, 0, 7); fx.fill(); fx.restore();
        // warmer Lichtkegel der Laterne
        if (L > 0.01) {
          fx.save(); fx.globalCompositeOperation = 'lighter';
          const flick = 0.92 + Math.sin(t * 11) * 0.03 + Math.sin(t * 23) * 0.02;
          const lg = fx.createRadialGradient(light.sx, light.sy, 0, light.sx, light.sy, 180);
          lg.addColorStop(0, `rgba(255,238,195,${0.40 * L * flick})`);
          lg.addColorStop(0.16, `rgba(255,208,145,${0.22 * L * flick})`);
          lg.addColorStop(0.5, `rgba(255,165,85,${0.07 * L})`);
          lg.addColorStop(1, 'rgba(255,140,60,0)');
          fx.fillStyle = lg; fx.beginPath(); fx.arc(light.sx, light.sy, 180, 0, 7); fx.fill();
          fx.restore();
        }
        if (flash > 0) drawManor();
        if (bolt) {
          fx.save(); fx.strokeStyle = `rgba(230,225,255,${flash})`; fx.lineWidth = 2.5; fx.shadowColor = '#b9a8ff'; fx.shadowBlur = 24;
          fx.beginPath(); bolt.forEach(([x, y], i) => i ? fx.lineTo(x, y) : fx.moveTo(x, y)); fx.stroke(); fx.restore();
        }

        // Geister: wandern frei, fliehen vor dem Licht, nur am Rand sanft nach innen
        ghosts.forEach(g => {
          if (g.hidden) return;
          const dx = g.x - light.sx, dy = g.y - light.sy, d = Math.hypot(dx, dy) || 1;
          if (d < 260) { const f = (260 - d) / 260 * 420 * L; g.vx += dx / d * f * dt; g.vy += dy / d * f * dt; }
          if (boss && boss.t > 2.2 && boss.t < 2.6) { const bx = g.x - W / 2, by = g.y - H, bd = Math.hypot(bx, by) || 1; g.vx += bx / bd * 900 * dt; g.vy += by / bd * 900 * dt; }
          if (g.wx === undefined) newHome(g);
          g.homeT -= dt; if (g.homeT <= 0) newHome(g);
          g.vx += (g.wx - g.vx) * 0.6 * dt; g.vy += (g.wy - g.vy) * 0.6 * dt;
          const ex = W * 0.1, ey = H * 0.1;
          if (g.x < ex) g.vx += (ex - g.x) * 2.2 * dt;
          if (g.x > W - ex) g.vx -= (g.x - (W - ex)) * 2.2 * dt;
          if (g.y < ey) g.vy += (ey - g.y) * 2.2 * dt;
          if (g.y > H - ey) g.vy -= (g.y - (H - ey)) * 2.2 * dt;
          g.vx *= 0.99; g.vy *= 0.99;
          g.x += g.vx * dt; g.y += g.vy * dt;
          if (g.y < -90) { g.y = H + 80; g.x = rand(0, W); }
          if (g.y > H + 100) g.y = -80;
          if (g.x < -90) g.x = W + 80;
          if (g.x > W + 90) g.x = -80;
          drawGhost(g, t);
        });
        drawPoofsAndBoss(dt, t);
      }
    };
  }
})();
