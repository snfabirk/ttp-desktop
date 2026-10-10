// Shop-Themes mit Szene II (v5.20.0) - Designs aus theme-lab/ (alle vom Nutzer
// abgenommen). Melden sich bei theme-fx.js an (TTPThemeFx.register); theme-fx.js
// steuert Ein-/Ausblenden, Pausieren im Hintergrund und die Animations-Einstellung.
//   Animated+ : magmaplus (Magma Heart+, WebGL2-Raymarching mit Bloom) -
//               Maus = Kamera + Waerme auf dem See, Klick in den See = Lavablase
//   Animated  : magma (Magma Heart, WebGL-Shader), cyberpunk (Neon Overdrive,
//               Developer's Choice)
//   Fancy     : aurora, lanterns (Lantern Festival), skyisles (Sky Isles)
//   Refined   : cherry (Cherry Blossom Night), arctic (Arctic Shore) - stehend
// Easter Eggs: Magma Heart / Magma Heart+ - 5x auf den Lavafall: Augen dahinter,
//   dann Ausbruch. Neon Overdrive - blinkendes Terminal anklicken: Netzwerk-Hack.
(function () {
  if (!window.TTPThemeFx || window.TTPShopScenes2) return;
  window.TTPShopScenes2 = true;
  const INTERACTIVE = window.TTPThemeFx.INTERACTIVE;
  const rand = (a, b) => a + Math.random() * (b - a);
  const ease = u => u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u);
  function seeded(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const blocked = e => e.target.closest && e.target.closest(INTERACTIVE);

  // Erdbeben-Animation fuer die Ausbrueche (gilt fuer alle Seiten)
  if (!document.getElementById('ttpScenes2Css')) {
    const css = document.createElement('style'); css.id = 'ttpScenes2Css';
    css.textContent = `body.ttp-quake > *:not(canvas) { animation: ttpQuake .7s ease-out; }
@keyframes ttpQuake { 10% { transform: translate(-7px, 4px); } 25% { transform: translate(6px, -5px); } 40% { transform: translate(-5px, 3px); } 60% { transform: translate(3px, -2px); } 80% { transform: translate(-1px, 1px); } }`;
    document.head.appendChild(css);
  }
  const quake = () => { document.body.classList.remove('ttp-quake'); void document.body.offsetWidth; document.body.classList.add('ttp-quake'); setTimeout(() => document.body.classList.remove('ttp-quake'), 800); };

  // Vollbild-Canvas hinter dem Inhalt
  function fullCanvas(z = '-1') { const cv = document.createElement('canvas'); Object.assign(cv.style, { position: 'fixed', inset: '0', width: '100vw', height: '100vh', zIndex: z, pointerEvents: 'none', opacity: '0' }); return cv; }
  // WebGL1 mit einem Vollbild-Dreieck
  function gl1(cv, fs) {
    const gl = cv.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, 'attribute vec2 a; void main() { gl_Position = vec4(a, 0., 1.); }'));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(prog, 0, 'a'); gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const cache = {};
    const U = n => n in cache ? cache[n] : (cache[n] = gl.getUniformLocation(prog, n));
    return { gl, U, draw() { gl.drawArrays(gl.TRIANGLES, 0, 3); }, size(w, h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); } };
  }

  const SH = {
    magma: `precision highp float;
uniform vec2 R; uniform float T, uPart, uEye, uNarrow, uBlink, uErupt; uniform vec2 uLook, uShake;
const float YH = -.12, LF = .36;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 h22(vec2 p) { float n = h21(p); return vec2(n, h21(p + n)); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1., 0.)), u.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), u.x), u.y); }
const mat2 M = mat2(1.6, 1.2, -1.2, 1.6);
float fbm(vec2 p) { float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * noise(p); p = M * p; a *= .5; } return s; }
float fbm3(vec2 p) { float a = .5, s = 0.; for (int i = 0; i < 3; i++) { s += a * noise(p); p = M * p; a *= .5; } return s; }
// Abstand zur naechsten Plattenkante (F2 - F1)
float vor(vec2 p) { vec2 i = floor(p), f = fract(p); float d1 = 8., d2 = 8.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(float(x), float(y)), o = h22(i + g); o = .5 + .4 * sin(T * .25 + 6.2831 * o);
    float d = length(g + o - f); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
  return d2 - d1; }
// Temperatur -> Farbe (schwarz, dunkelrot, orange, gelb, weiss)
vec3 heat(float h) { h = clamp(h, 0., 1.25);
  vec3 c = mix(vec3(.03, .008, .004), vec3(.5, .05, .008), smoothstep(0., .35, h));
  c = mix(c, vec3(1., .3, .035), smoothstep(.3, .7, h));
  c = mix(c, vec3(1., .72, .28), smoothstep(.7, .95, h));
  return mix(c, vec3(1., .96, .82), smoothstep(.95, 1.25, h)); }
vec3 rock(vec2 rp, out float hgt) { // Hoehe + Normale aus Rauschen
  hgt = fbm(rp); float hx = fbm(rp + vec2(.012, 0.)), hy = fbm(rp + vec2(0., .012));
  return normalize(vec3((hgt - hx) * 80., (hgt - hy) * 80., 1.)); }

void main() {
  vec2 p = (gl_FragCoord.xy - .5 * R) / R.y + uShake; float asp = R.x / R.y;
  // Hitzeflimmern knapp ueber und auf dem See
  float sh = smoothstep(.3, 0., abs(p.y - YH + .03));
  p.x += (noise(vec2(p.x * 30., p.y * 40. - T * 3.)) - .5) * .007 * sh;
  p.y += (noise(vec2(p.x * 25. + 5., p.y * 30. - T * 2.5)) - .5) * .005 * sh;
  vec3 col;
  float dxs = p.x - LF;
  if (p.y < YH) {
    // ---- Lavasee in Perspektive ----
    float z = .32 / (YH - p.y);
    vec2 q = vec2(p.x * z, z + T * .1);
    vec2 warp = vec2(fbm3(q * .8 + vec2(0., T * .02)), fbm3(q * .8 + vec2(5.2, 1.3)));
    vec2 qq = q * 1.3 + warp * 1.6;
    float e = vor(qq), n = fbm(qq * 2.2);
    float molten = smoothstep(.56, .74, fbm3(q * .32 + vec2(T * .012, 0.)));
    float crack = 1. - smoothstep(0., .08 + .06 * n, e);
    float far = smoothstep(2.6, 8., z);
    float temp = .02 + .14 * n;
    temp = mix(temp, .82 + .28 * n, crack);
    temp = mix(temp, .72 + .38 * n, molten);
    temp += .05 * sin(T * 1.4 + q.y * 3.) + uErupt * .3;
    temp = mix(temp, .42, far);
    col = heat(temp);
    // erkaltete Platten: fast schwarzes Gestein mit leichtem grauen Schimmer
    float plate = (1. - crack) * (1. - molten) * (1. - far);
    col = mix(col, vec3(.05, .035, .03) * (.6 + 1.2 * fbm3(qq * 6.)), plate * .55);
    // Kruste: Woelbung der Platten, Kanten vom Riss angestrahlt
    float rim = smoothstep(.28, 0., e) * (1. - crack);
    col += vec3(.55, .12, .015) * rim * .5 * (1. - far);
    col *= mix(1., .55 + .45 * smoothstep(.0, .35, e), (1. - crack) * (1. - molten));
    // Dunst in der Tiefe
    float fog = 1. - exp(-z * .1);
    col = mix(col, vec3(.42, .1, .025), fog * .8);
    col = mix(col, vec3(.7, .2, .04), smoothstep(-.04, 0., p.y - YH) * .7); // weicher Horizont
    // Spiegelung des Lavafalls
    col += vec3(1., .5, .15) * exp(-abs(dxs) * 28.) * exp(-(YH - p.y) * 7.) * (.55 + .45 * noise(vec2(p.x * 40., p.y * 70. + T * 4.))) * .9;
  } else {
    // ---- Hoehlenwand hinten: Relief, von unten durch die Lava beleuchtet ----
    float hgt; vec3 nr = rock(p * vec2(2.6, 3.2), hgt);
    vec3 alb = vec3(.075, .052, .045) * (.55 + .9 * hgt);
    float li = exp(-(p.y - YH) * 3.) * (1. + uErupt * 1.2);
    col = alb * .12 + alb * vec3(1., .33, .07) * max(dot(nr, normalize(vec3(0., -1., .55))), 0.) * li * 6.5;
    col += alb * vec3(1., .5, .15) * max(dot(nr, normalize(vec3(-dxs, 0., .25))), 0.) * exp(-abs(dxs) * 5.) * 3.6;
    float v = pow(1. - abs(fbm(p * vec2(5., 6.) + vec2(3.1, 7.7)) * 2. - 1.), 60.) * smoothstep(.56, .7, fbm3(p * 2. + 9.));
    col += vec3(1., .32, .05) * v * (.55 + .45 * sin(T * 1.3 + p.x * 4.)) * (.5 + li) * 1.6;
    col += vec3(.8, .22, .04) * exp(-(p.y - YH) * 16.) * .45; // Gluehen ueber dem Horizont
    // Felsgrate zwischen Wand und See (zwei Ebenen = Tiefenstaffelung), von der Lava angestrahlt
    for (int k = 1; k >= 0; k--) {
      float fk = float(k);
      float rx = p.x * (4.5 - fk * 1.5) + fk * 7.;
      float ridge = YH + .01 + fk * .05 + pow(1. - abs(noise(vec2(rx * .7, fk)) * 2. - 1.), 2.) * (.08 + fk * .07) + fbm(vec2(rx * 2.5, fk + 3.)) * .05 - .02;
      float dr = ridge - p.y;
      if (dr > -.004) {
        float rh; vec3 rn = rock(p * (5. - fk * 1.5) + fk * 4., rh);
        vec3 rc = vec3(.03, .02, .018) * (.6 + rh) * (1.4 - fk * .5);
        rc += vec3(1., .3, .05) * max(dot(rn, normalize(vec3(0., -1., .5))), 0.) * exp(-(p.y - YH) * 12.) * .14;
        rc += vec3(1., .42, .1) * exp(-dr * (70. - fk * 25.)) * (.35 - fk * .12);   // Lichtkante oben
        rc = mix(rc, vec3(.4, .1, .025), fk * .35);                                // hintere Ebene im Dunst
        col = mix(col, rc, smoothstep(-.004, .002, dr));
      }
    }
    // ---- Easter Egg: Augen hinter dem Lavafall ----
    if (uEye > .001) {
      col *= 1. - .6 * uPart * exp(-abs(dxs) * 9.) * smoothstep(-.1, .1, p.y - YH); // dunkle Nische
      for (int k = 0; k < 2; k++) {
        float sx = k == 0 ? -1. : 1.;
        vec2 e = (p - vec2(LF + sx * .068, .055)) / .048;
        float a = -sx * .32; e = mat2(cos(a), -sin(a), sin(a), cos(a)) * e;
        float open = uEye * (1. - uBlink), lid = open * (1. - e.x * e.x) * .55 * (1. - uNarrow * .5);
        float inside = smoothstep(.05, -.03, abs(e.y) - lid) * step(abs(e.x), 1.);
        vec2 pe = e - uLook * .38;
        float slit = smoothstep(.15 - .07 * uNarrow, .07 - .04 * uNarrow, abs(pe.x)) * smoothstep(1.1, .6, abs(pe.y));
        vec3 ic = mix(vec3(1., .96, .62), vec3(1., .42, .04), smoothstep(0., .95, length(pe)));
        ic = mix(ic, vec3(.06, 0., 0.), slit);
        col = mix(col, ic * (1.5 + uNarrow), inside);
        col += vec3(1., .38, .06) * exp(-length(e * vec2(.55, 1.)) * 2.1) * uEye * (.45 + .6 * uNarrow);
      }
    }
    // ---- Lavafall (teilt sich beim Easter Egg) ----
    float edge = (noise(vec2(p.y * 12. - T * 6., 1.)) - .5) * .02;
    float wid = .028 + .006 * sin(p.y * 9. + T * 2.);
    float sd = min(abs(dxs + uPart * .16 + edge), abs(dxs - uPart * .16 + edge));
    float fall = smoothstep(wid, wid * .35, sd);
    float fn = fbm(vec2(dxs * 30., p.y * 5. + T * 2.4));
    col = mix(col, heat(.72 + .4 * fn), fall);
    col += vec3(1., .4, .1) * exp(-sd * 24.) * .35;
    col += vec3(1., .55, .2) * exp(-length(vec2(dxs * 2.4, p.y - YH)) * 13.) * .9; // Aufprall
    // Decke dunkel, Krater-Dunst
    col *= .2 + .8 * smoothstep(.62, .12, p.y);
  }
  // ---- nahe Seitenwaende ----
  for (int k = 0; k < 2; k++) {
    float side = k == 0 ? -1. : 1.;
    float bx = asp * .5 - .13 - .1 * fbm3(vec2(p.y * 2.4, side * 3.)) - .06 * smoothstep(.0, -.5, p.y);
    float d = side * p.x - bx;
    if (d > -.01) {
      float wh; vec3 wn = rock(p * 6.5 + vec2(side * 10., 0.), wh);
      float wl = exp(-(p.y + .5) * 1.7) * (1. + uErupt);
      vec3 wc = vec3(.034, .024, .02) * (.5 + wh);
      wc += vec3(.95, .26, .05) * max(dot(wn, normalize(vec3(-side * .7, -.8, .5))), 0.) * wl * .3 * (.5 + wh);
      wc += vec3(1., .35, .06) * exp(-max(d, 0.) * 32.) * (.18 + wl * .55);
      wc += vec3(1., .3, .05) * pow(1. - abs(fbm(p * 4.5 + side * 3.) * 2. - 1.), 50.) * smoothstep(.45, .6, fbm3(p * 3. + side)) * (.5 + .5 * sin(T * 1.1 + p.y * 5.));
      col = mix(col, wc, smoothstep(0., .0025, d));
    }
  }
  // Rauchschwaden, von unten angestrahlt
  float sm = fbm(vec2(p.x * 1.6 + T * .03, p.y * 2.2 - T * .06));
  col += vec3(.6, .17, .04) * sm * sm * smoothstep(-.4, .05, p.y) * smoothstep(.55, -.05, p.y) * .2 * (1. + uErupt);
  // Lesbarkeit oben, Vignette, Tonemapping
  col *= mix(1., .6, smoothstep(.05, .45, p.y));
  col *= 1. - .3 * dot(p * vec2(.9 / asp, 1.), p * vec2(.9 / asp, 1.)) * 1.6;
  col = 1. - exp(-col * 1.45);
  gl_FragColor = vec4(pow(col, vec3(.95)), 1.);
}`,
    aurora: `precision highp float;
uniform vec2 R; uniform float T;
const float YH = -.24;   // Seeufer
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n2(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p) { float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= .5; } return s; }

vec3 aurora(vec2 p) {
  vec3 acc = vec3(0.);
  for (int i = 0; i < 3; i++) {
    float fi = float(i), x = p.x * (1. + fi * .35) + fi * 3.7;
    float curve = -.02 + fi * .08 + .12 * sin(x * .9 + T * .06 + fi * 1.7) + .1 * fbm(vec2(x * 1.2 + T * .035, fi * 5.));
    float d = p.y - curve;
    if (d > -.01) {
      float fold = fbm(vec2(x * 2.6, T * .08 + fi));
      float rays = .25 + .75 * pow(n2(vec2(x * 46. + fold * 7., T * .25 + fi * 9.)), 2.4) + .2 * n2(vec2(x * 12. + fold * 3., fi));
      float fall = exp(-max(d, 0.) * (5.5 - fi)) * smoothstep(-.01, .012, d);
      float band = smoothstep(.15, .75, fbm(vec2(x * .9 - T * .05, fi * 3. + 1.)));
      vec3 c = mix(vec3(.12, 1., .55), vec3(.25, .85, .95), smoothstep(.02, .1, d));
      c = mix(c, vec3(.8, .3, .95), smoothstep(.1, .28, d));
      acc += c * rays * fall * band * (1.1 - fi * .3);
    }
  }
  return acc;
}
float ridge(float x, float far) {
  float big = pow(1. - abs(n2(vec2(x * (far > .5 ? 3.4 : 2.4), far * 7.)) * 2. - 1.), 1.8);
  float small = pow(1. - abs(n2(vec2(x * 9., far * 3. + 1.)) * 2. - 1.), 2.);
  return YH + (far > .5 ? .05 : .055) + (far > .5 ? .15 : .09) * big + .03 * small + .02 * fbm(vec2(x * 18., far));
}
vec3 sky(vec2 p) {
  vec3 col = mix(vec3(.02, .07, .1), vec3(.01, .015, .04), smoothstep(YH, .5, p.y));
  // Sterne + Milchstrasse
  vec2 g = p * 140.; vec2 id = floor(g), f = fract(g) - .5;
  float r = h21(id); if (r > .985) { float tw = .55 + .45 * sin(T * (1. + r * 3.) + r * 40.); col += vec3(.85, .9, 1.) * smoothstep(.12, 0., length(f)) * tw * (r - .985) * 60.; }
  float mw = exp(-pow((p.y - .25 - p.x * .35) * 3.2, 2.)) * fbm(p * 6.);
  col += vec3(.25, .3, .45) * mw * .25;
  col += aurora(p) * .9;
  col += vec3(.04, .2, .15) * exp(-(p.y - YH) * 5.) * .55;   // gruenes Leuchten ueber dem Horizont
  // Berge: hinten (Dunst, heller) und vorn (dunkel), Schnee nimmt das Nordlicht auf
  vec3 auroraTint = vec3(.15, .55, .4) * (.4 + .6 * smoothstep(-.3, .3, sin(p.x * 1.2 + T * .06)));
  for (int k = 0; k < 2; k++) {
    float far = k == 0 ? 1. : 0.;
    float top = ridge(p.x, far);
    if (p.y < top) {
      // Schnee nur auf den Gipfeln, mit Rinnen; Licht aus 2D-Relief statt Hangrichtung (keine Streifen)
      float snowline = YH + (far > .5 ? .135 : .1) + .03 * fbm(vec2(p.x * 5., far * 3.));
      float gully = fbm(vec2(p.x * 26., p.y * 7. + far * 4.));
      float snow = smoothstep(snowline - .01, snowline + .02, p.y + (gully - .5) * .05);
      vec2 rp = p * vec2(9., 11.) + far * 5.;
      float hc = fbm(rp), lit = clamp(.5 + (hc - fbm(rp + vec2(.08, -.05))) * 9., 0., 1.);
      vec3 rock = mix(vec3(.02, .035, .05), vec3(.045, .07, .09), far) * (.7 + .6 * lit);
      vec3 snowC = mix(vec3(.18, .25, .32), vec3(.5, .62, .7), lit) + auroraTint * .55;
      vec3 m = mix(rock, snowC * (far > .5 ? .6 : .9), snow);
      m = mix(m, vec3(.05, .12, .15), far * .5);                                  // Dunst auf der hinteren Kette
      m *= .75 + .25 * smoothstep(0., .08, top - p.y + .02);                       // Grat leicht abgesetzt
      col = m;
    }
  }
  return col;
}
float pines(vec2 p) { // Fichten-Silhouetten an den Raendern
  float a = R.x / R.y * .5, m = 0.;
  for (int i = 0; i < 7; i++) {
    float fi = float(i), side = mod(fi, 2.) < .5 ? -1. : 1.;
    float tx = side * (a - .03 - fi * .045 - h21(vec2(fi, 2.)) * .03), base = YH - .03 - h21(vec2(fi, 5.)) * .08;
    float top = base + .24 + h21(vec2(fi, 9.)) * .14 - fi * .02;
    if (p.y < top && p.y > base - .4) {
      float h = top - p.y;
      float w = h * .22 * (.55 + .45 * fract(h * 13. + fi * .3)) + .004;
      m = max(m, smoothstep(w, w - .003, abs(p.x - tx + sin(h * 40. + fi) * .003)));
    }
  }
  return m;
}
void main() {
  vec2 p = (gl_FragCoord.xy - .5 * R) / R.y;
  vec3 col;
  if (p.y > YH) col = sky(p);
  else {
    // See: gespiegelter Himmel, leichte Wellen, dunkler + kuehler; Eis-Glanzstreifen
    float d = YH - p.y;
    vec2 q = vec2(p.x + (n2(vec2(p.x * 4., p.y * 90. + T * .6)) - .5) * .012 * (.3 + d * 3.), 2. * YH - p.y);
    col = sky(q) * vec3(.55, .65, .7) * (.85 - d * .8);
    col += vec3(.1, .2, .22) * smoothstep(.9, 1., n2(vec2(p.x * 3., p.y * 160.))) * .15;
    col = mix(col, vec3(.02, .04, .06), smoothstep(.0, .3, d) * .4);
  }
  float pm = pines(p);
  col = mix(col, vec3(.008, .015, .02) + aurora(p * vec2(1., .6)) * .02, pm);
  // Lesbarkeit oben + Vignette + leichte Tonkurve
  col *= mix(1., .7, smoothstep(.15, .5, p.y));
  col *= 1. - .35 * dot(p * vec2(.8 / (R.x / R.y) * 1.6, 1.), p * vec2(.8 / (R.x / R.y) * 1.6, 1.));
  col = 1. - exp(-col * 1.6);
  gl_FragColor = vec4(pow(col, vec3(.92)), 1.);
}`,
    lanterns: `precision highp float;
uniform vec2 R; uniform float T;
const float YH = -.2;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n2(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p) { float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= .5; } return s; }
vec3 sky(vec2 p) {
  float y = p.y - YH;
  vec3 col = mix(vec3(1., .55, .28), vec3(.62, .28, .38), smoothstep(0., .14, y));
  col = mix(col, vec3(.22, .14, .36), smoothstep(.1, .38, y));
  col = mix(col, vec3(.05, .05, .16), smoothstep(.3, .7, y));
  col += vec3(1., .6, .3) * exp(-length(vec2((p.x + .35) * .7, y * 2.2)) * 4.) * .6;           // Sonnenglut links
  // zarte Wolkenbaender, unten angestrahlt
  float cl = fbm(vec2(p.x * 1.6 + T * .01, p.y * 7.));
  col = mix(col, col * vec3(1.25, .95, .9) + vec3(.08, .03, .02), smoothstep(.55, .75, cl) * smoothstep(.45, .08, y) * .7);
  // Sterne oben
  vec2 g = p * 150.; float r = h21(floor(g));
  if (r > .988) col += vec3(1.) * smoothstep(.15, 0., length(fract(g) - .5)) * (.5 + .5 * sin(T * 2. + r * 50.)) * smoothstep(.25, .5, y);
  // Huegel mit Dorflichtern
  float hill = YH + .012 + .09 * pow(fbm(vec2(p.x * 1.6, 3.)), 1.6) + .025 * sin(p.x * 2.3 + 1.) + .015 * fbm(vec2(p.x * 12., 1.));
  if (p.y < hill) {
    col = mix(vec3(.08, .05, .12), vec3(.16, .08, .14), smoothstep(hill - .05, hill, p.y));
    vec2 lg = vec2(p.x * 260., p.y * 260.); float lr = h21(floor(lg));
    if (lr > .993 && p.y > YH + .004 && p.y < hill - .006) col += vec3(1., .7, .35) * smoothstep(.4, 0., length(fract(lg) - .5)) * (.7 + .3 * sin(T * 3. + lr * 90.));
  }
  return col;
}
void main() {
  vec2 p = (gl_FragCoord.xy - .5 * R) / R.y;
  vec3 col;
  if (p.y > YH) col = sky(p);
  else {
    float d = YH - p.y;
    vec2 q = vec2(p.x + (n2(vec2(p.x * 3., p.y * 70. + T * .8)) - .5) * .014 * (.4 + d * 3.), 2. * YH - p.y);
    col = sky(q) * vec3(.62, .58, .7) * (.9 - d * .9);
    float gl = pow(n2(vec2(p.x * 40., p.y * 220. + T * 1.5)), 8.) * smoothstep(.35, 0., d);
    col += vec3(1., .65, .35) * gl * .6;
    col = mix(col, vec3(.04, .03, .08), smoothstep(.05, .35, d) * .45);
  }
  col *= mix(1., .72, smoothstep(.15, .5, p.y));
  col *= 1. - .3 * dot(p * vec2(.9 / (R.x / R.y) * 1.6, 1.), p * vec2(.9 / (R.x / R.y) * 1.6, 1.));
  col = 1. - exp(-col * 1.5);
  gl_FragColor = vec4(pow(col, vec3(.95)), 1.);
}`,
    skyisles: `precision highp float;
uniform vec2 R; uniform float T;
const vec2 SUN = vec2(-.42, -.06);
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n2(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p) { float a = .5, s = 0.; for (int i = 0; i < 5; i++) { s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= .5; } return s; }
// bauschige Kuppeln (Kumulus-Oberkante): Halbkreise mit zufaelliger Groesse
float domes(float x, float seed) {
  float c = floor(x), h = 0.;
  for (int k = -1; k <= 1; k++) { float ck = c + float(k), r = .55 + .45 * h21(vec2(ck, seed)), cx = ck + .5 + (h21(vec2(ck, seed + 1.)) - .5) * .5, d = (x - cx) / r; h = max(h, sqrt(max(0., 1. - d * d)) * r); }
  return h;
}
vec3 skyBase(vec2 p) {
  vec3 col = mix(vec3(1., .74, .42), vec3(.95, .6, .55), smoothstep(-.2, .05, p.y));
  col = mix(col, vec3(.48, .48, .78), smoothstep(0., .25, p.y));
  return mix(col, vec3(.1, .16, .42), smoothstep(.2, .55, p.y));
}
vec3 skyCol(vec2 p) {
  vec3 col = skyBase(p);
  vec2 d = p - SUN; float l = length(d);
  col += vec3(1., .8, .45) * exp(-l * 3.) * .85 + vec3(1., .96, .82) * smoothstep(.045, .035, l);
  col += vec3(1., .85, .55) * pow(n2(vec2(atan(d.y, d.x) * 9., T * .04)), 3.) * exp(-l * 1.6) * .35 * smoothstep(.04, .1, l);
  col = mix(col, col + vec3(.25, .16, .12), smoothstep(.6, .8, fbm(vec2(p.x * 1.2 + T * .006, p.y * 5.))) * smoothstep(.05, .3, p.y) * .5);
  return col;
}
void island(vec2 p, vec2 c, float w, float dep, float seed, float far, inout vec3 col) {
  c.y += sin(T * .35 + seed) * .006;
  float u = (p.x - c.x) / w;
  if (abs(u) > 1.) return;
  float top = c.y + .012 * (1. - u * u) + .005 * n2(vec2(p.x * 40., seed));
  float crowns = .03 * w / .17 * domes(p.x / w * 9., seed + 4.) * smoothstep(.95, .6, abs(u + .1));
  float bot = c.y - dep * pow(max(0., 1. - u * u), .8) - .03 * (fbm(vec2(p.x * 26., seed)) - .5) - .02 * pow(max(0., 1. - abs(u * 3. - .4)), 3.);
  if (p.y > top + crowns || p.y < bot) return;
  float sunSide = smoothstep(.5, -1., u);
  float hgt = clamp((top - p.y) / max(top - bot, .001), 0., 1.);
  vec3 c2;
  if (p.y > top) {                                   // Baumkronen
    float lit = smoothstep(.3, -.6, u) * .7 + .3 * n2(vec2(p.x * 200., p.y * 200.));
    c2 = mix(vec3(.12, .24, .14), vec3(.5, .62, .26), lit);
  } else if (p.y > top - .007) {                     // Grasnarbe
    c2 = mix(vec3(.22, .4, .18), vec3(.66, .7, .3), sunSide);
  } else {                                           // Fels: Gesteinsschichten, Sonnenseite warm, Unterseite dunkel
    float strata = .5 + .5 * sin(p.y * 160. + fbm(vec2(p.x * 12., seed)) * 6.);
    vec3 rock = mix(vec3(.34, .24, .3), vec3(.5, .36, .34), strata * .6 + .4 * fbm(vec2(p.x * 30., p.y * 40.) + seed));
    rock = mix(rock, rock * vec3(1.6, 1.3, 1.) + vec3(.12, .06, .0), sunSide * (1. - hgt) * .9);
    rock *= mix(1., .45, smoothstep(.3, 1., hgt));
    float edgeL = c.x - w * pow(max(0., 1. - pow(hgt, 1.25)), .5);
    rock += vec3(1., .7, .4) * smoothstep(.012, 0., abs(p.x - edgeL)) * .45 * (1. - hgt);
    c2 = rock;
  }
  col = mix(c2, skyBase(p) * vec3(.95, .9, 1.), far * .55);
}
void fall(vec2 p, vec2 c, float w, float seed, float far, inout vec3 col) {
  // Wasserfall: ohne harte Grenzen - Breite, Deckkraft und Schleier laufen weich aus
  c.y += sin(T * .35 + seed) * .006;
  float fx = c.x + w * .5, drop = c.y - p.y;
  if (drop < -.004) return;
  float spread = 1. + drop * 2.2, wd = (.004 + w * .022) * spread;
  float dx = abs(p.x - fx + sin(p.y * 30. + seed) * .0015);
  float s = smoothstep(wd, wd * .2, dx) * smoothstep(-.004, .01, drop);
  float streak = .5 + .5 * n2(vec2((p.x - fx) * 260. / spread, p.y * 22. + T * 5.));
  float fade = exp(-drop * 3.5);                                   // wird nach unten duenner und loest sich auf
  vec3 wc = mix(vec3(.95, .97, 1.), skyBase(p), far * .5);
  col = mix(col, wc, s * (.35 + .5 * streak) * fade);
  col += vec3(.9, .92, 1.) * exp(-dx / (wd * 1.6)) * .06 * fade * smoothstep(-.004, .02, drop);   // zarter Schleier, weich
}
// Wolkenfeld: weiches Maximum aus Bauschen-Kreisen und dem Wolkenkoerper unten -> keine Naehte zwischen Bauschen
float cloudF(vec2 q, float fk, float cs, float base) {
  float cell = floor(q.x / cs), kk = cs * .07, acc = exp(clamp((base - q.y) / kk, -30., 30.));
  for (int j = -2; j <= 2; j++) for (int row = 0; row < 3; row++) {
    float cj = cell + float(j), fr = float(row);
    float rnd = h21(vec2(cj, fk * 13. + fr * 7.)), rnd2 = h21(vec2(cj + 31., fk * 5. + fr));
    vec2 cc = vec2((cj + .5 + fr * .5 + (rnd2 - .5) * .6) * cs, base + cs * (.2 + .35 * rnd) - fr * cs * .55);
    float r = cs * (.5 + .5 * rnd) * (1. - fr * .1);
    acc += exp(clamp((r - length(q - cc)) / kk, -30., 30.));
  }
  return log(acc) * kk;
}
void main() {
  vec2 p = (gl_FragCoord.xy - .5 * R) / R.y;
  vec3 col = skyCol(p);
  island(p, vec2(.62, .06), .07, .06, 3., 1., col);
  island(p, vec2(-.02, .13), .05, .05, 9., 1., col);
  for (int k = 0; k < 3; k++) {
    float fk = float(k), sp = .008 + fk * .014;
    // Kumulus: Feld aus Bauschen, Normale aus dem Feldgradienten (weich ueber alle Bausche hinweg)
    float cs = .065 + fk * .032, base = -.25 - fk * .085, ex = p.x + T * sp;
    vec2 q = vec2(ex, p.y);
    float f = cloudF(q, fk, cs, base);
    float m = smoothstep(-.003, .003, f);
    if (m > .001) {
      float e = .002;
      vec2 grad = vec2(cloudF(q + vec2(e, 0.), fk, cs, base) - f, cloudF(q + vec2(0., e), fk, cs, base) - f) / e;
      vec2 nrm = -grad / max(length(grad), .0001);
      vec2 L = normalize(vec2(-.75, .65));
      float tex = fbm(vec2(ex * (14. + fk * 4.), p.y * 16. + fk * 3.));
      float edgeK = 1. - smoothstep(0., cs * .45, f);                         // nahe der Oberflaeche: gerichtetes Licht
      float lit = mix(.38 + .12 * tex, clamp(dot(nrm, L) * .65 + .45, 0., 1.), edgeK);
      lit *= .88 + .25 * tex;
      vec3 shade = mix(vec3(.44, .38, .64), vec3(.64, .55, .76), tex);
      vec3 cloud = mix(shade, vec3(1., .86, .64), lit);
      cloud += vec3(1., .92, .8) * smoothstep(.007, 0., f) * max(dot(nrm, L), 0.) * .45;   // Silberrand
      cloud *= 1. - smoothstep(0., .14, base - p.y) * .25;
      cloud = mix(cloud, skyBase(vec2(p.x, base + .08)), .5 - fk * .22);
      col = mix(col, cloud, m);
    }
    if (k == 0) {
      island(p, vec2(-.68, .16), .17, .2, 1., 0., col); fall(p, vec2(-.68, .16), .17, 1., 0., col);
      island(p, vec2(.52, -.02), .12, .14, 5., .25, col); fall(p, vec2(.52, -.02), .12, 5., .25, col);
    }
  }
  col *= mix(1., .8, smoothstep(.15, .5, p.y));
  col *= 1. - .2 * dot(p * vec2(.9 / (R.x / R.y) * 1.6, 1.), p * vec2(.9 / (R.x / R.y) * 1.6, 1.));
  col = 1. - exp(-col * 1.4);
  gl_FragColor = vec4(pow(col, vec3(1.05)), 1.);
}`,
    plusScene: `#version 300 es
precision highp float;
uniform vec2 R, uMouse, uCam; uniform float T, uPart, uEye, uNarrow, uBlink, uErupt, uHeat;
uniform vec2 uLook; uniform vec4 uBub;
out vec4 O;
const float FX = 2.0;           // Lavafall-x
const vec3 LP = vec3(FX, 3., 13.6);

float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 h22(vec2 p) { float n = h21(p); return vec2(n, h21(p + n)); }
float n2(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fbm2(vec2 p) { float a = .5, s = 0.; for (int i = 0; i < 4; i++) { s += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= .5; } return s; }
float h31(vec3 p) { p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1, 0, 0)), f.x), mix(h31(i + vec3(0, 1, 0)), h31(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(h31(i + vec3(0, 0, 1)), h31(i + vec3(1, 0, 1)), f.x), mix(h31(i + vec3(0, 1, 1)), h31(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
float fbm3(vec3 p) { float a = .5, s = 0.; for (int i = 0; i < 3; i++) { s += a * n3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= .5; } return s; }
float vor(vec2 p) { vec2 i = floor(p), f = fract(p); float d1 = 8., d2 = 8.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) { vec2 g = vec2(x, y), o = h22(i + g); o = .5 + .4 * sin(T * .2 + 6.2831 * o);
    float d = length(g + o - f); if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
  return d2 - d1; }
vec3 heat(float h) { h = clamp(h, 0., 1.3);
  vec3 c = mix(vec3(.02, .005, .003), vec3(.6, .05, .008), smoothstep(0., .35, h));
  c = mix(c, vec3(2., .55, .06), smoothstep(.3, .7, h));
  c = mix(c, vec3(3.2, 1.9, .7), smoothstep(.7, .98, h));
  return mix(c, vec3(4.5, 4., 3.2), smoothstep(.98, 1.3, h)); }

// ----- Hoehle als Distanzfeld -----
float map(vec3 p) {
  float d = 2.2 + .35 * p.z - abs(p.x);                        // Seitenwaende, laufen nach hinten auseinander
  d = min(d, 15. - p.z);                                       // Rueckwand
  d = min(d, 8.5 - p.y);                                       // Decke
  d = min(d, length((p - vec3(-2.2, -.5, 7.)) * vec3(.85, 1.4, 1.1)) - 1.05);   // Felsinseln im See
  d = min(d, length((p - vec3(3.6, -.7, 9.2)) * vec3(.8, 1.1, 1.)) - 1.2);
  d = min(d, length((p - vec3(-4.4, -.6, 11.8)) * vec3(.7, .9, .9)) - 1.5);
  return d + (fbm3(p * .5) - .5) * 1.8 + (n3(p * 1.6) - .5) * .35;
}
float mapN(vec3 p) { return map(p) + (n3(p * 2.6) - .5) * .22 + (n3(p * 7.) - .5) * .05; }
vec3 nrm(vec3 p) { vec2 e = vec2(.02, -.02);
  return normalize(e.xyy * mapN(p + e.xyy) + e.yyx * mapN(p + e.yyx) + e.yxy * mapN(p + e.yxy) + e.xxx * mapN(p + e.xxx)); }
float shadow(vec3 ro, vec3 rd, float maxt) { float r = 1., t = .15;
  for (int i = 0; i < 18; i++) { float h = map(ro + rd * t); r = min(r, 7. * h / t); t += clamp(h * .8, .15, 1.2); if (r < .02 || t > maxt) break; }
  return clamp(r, 0., 1.); }
float ao(vec3 p, vec3 n) { float o = 0., s = 1.; for (int i = 1; i <= 4; i++) { float h = .15 * float(i); o += (h - map(p + n * h)) * s; s *= .6; } return clamp(1. - o * 1.6, 0., 1.); }
// wie hell die Lava unter einem Punkt gluet (Licht von unten)
float lakeGlow(vec2 xz) { return .5 + .9 * smoothstep(.5, .75, fbm2(xz * .12 + vec2(T * .01, 0.))) + 2.2 * exp(-length(xz - vec2(FX, 14.)) * .45) + uErupt * 1.6; }
vec3 eye(vec2 q, vec3 col) { // Easter-Egg-Augen auf der Rueckwand
  for (int k = 0; k < 2; k++) {
    float sx = k == 0 ? -1. : 1.;
    vec2 e = (q - vec2(FX + sx * .78, 1.9)) / .6;
    float a = -sx * .32; e = mat2(cos(a), -sin(a), sin(a), cos(a)) * e;
    float open = uEye * (1. - uBlink), lid = open * (1. - e.x * e.x) * .55 * (1. - uNarrow * .5);
    float inside = smoothstep(.05, -.03, abs(e.y) - lid) * step(abs(e.x), 1.);
    vec2 pe = e - uLook * .38;
    float slit = smoothstep(.15 - .07 * uNarrow, .07 - .04 * uNarrow, abs(pe.x)) * smoothstep(1.1, .6, abs(pe.y));
    vec3 ic = mix(vec3(3., 2.6, 1.2), vec3(2.4, .7, .05), smoothstep(0., .95, length(pe)));
    col = mix(col, mix(ic, vec3(.02, 0., 0.), slit) * (1. + uNarrow), inside);
    col += vec3(1.5, .45, .06) * exp(-length(e * vec2(.55, 1.)) * 2.) * uEye * (.4 + .7 * uNarrow);
  }
  return col;
}
float crustE(vec2 w) { vec2 q = w + vec2(fbm2(w * .5), fbm2(w * .5 + 5.2)) * 1.4; return vor(q); }

void main() {
  vec2 p = (gl_FragCoord.xy - .5 * R) / R.y;
  vec3 ro = vec3(uCam.x * .55, 2.2 + uCam.y * .3, -3.5);
  vec3 ta = vec3(uCam.x * .2, 1.5, 8.);
  vec3 fw = normalize(ta - ro), rt = normalize(cross(vec3(0, 1, 0), fw)), up = cross(fw, rt);
  // Hitzeflimmern in der unteren Bildhaelfte
  float shim = smoothstep(.15, -.25, p.y);
  vec2 pp = p + (vec2(n2(p * 38. + vec2(0., -T * 3.)), n2(p * 30. + vec2(5., -T * 2.6))) - .5) * .006 * shim;
  vec3 rd = normalize(pp.x * rt + pp.y * up + 1.6 * fw);

  float tL = rd.y < 0. ? -ro.y / rd.y : 1e9;
  float t = .2, tHit = 1e9;
  float tMax = min(tL, 40.);
  for (int i = 0; i < 160; i++) { float d = map(ro + rd * t); if (d < .0015 * t) { tHit = t; break; } t += d * .45; if (t > tMax) break; }

  vec3 col = vec3(0.);
  float tEnd;
  if (tHit < tL) {
    // ---- Fels ----
    vec3 pos = ro + rd * tHit, n = nrm(pos);
    vec3 alb = vec3(.07, .055, .048) * (.5 + 1.1 * fbm3(pos * 1.7));
    float under = pow(clamp(.55 - .45 * n.y, 0., 1.), 1.5);
    col = alb * vec3(1., .3, .06) * lakeGlow(pos.xz) * exp(-max(pos.y, 0.) * .42) * under * 1.5;
    vec3 lv = LP - pos; float ld = length(lv); lv /= ld;
    col += alb * vec3(1., .5, .15) * max(dot(n, lv), 0.) * shadow(pos + n * .05, lv, ld) * 26. / (1. + ld * ld * .25);
    col *= ao(pos, n);
    col += vec3(2., .6, .08) * exp(-max(pos.y + .1, 0.) * 12.) * .7;                       // Rand zur Lava gluet
    float v = pow(1. - abs(n3(pos * 1.4) * 2. - 1.), 60.) * smoothstep(.6, .72, n3(pos * .45 + 3.));
    col += vec3(2.2, .55, .06) * v * (.6 + .4 * sin(T * 1.3 + pos.y));               // gluehende Adern
    col += vec3(.5, .12, .02) * pow(1. - max(dot(n, -rd), 0.), 4.) * exp(-max(pos.y, 0.) * .5) * .5; // Streiflicht-Kante
    if (uEye > .001 && pos.z > 12.) {
      col *= 1. - .7 * uPart * exp(-abs(pos.x - FX) * 1.2) * smoothstep(0., 1., pos.y);
      col = eye(pos.xy, col);
    }
    tEnd = tHit;
  } else if (tL < 1e8) {
    // ---- Lavasee ----
    vec3 pos = ro + rd * tL;
    vec2 w = pos.xz * .85 + vec2(0., T * .25);
    float far = smoothstep(12., 26., tL);
    float e0 = crustE(w), ex = crustE(w + vec2(.04, 0.)), ez = crustE(w + vec2(0., .04));
    float hc = smoothstep(0., .16, e0) * .1;
    vec3 n = normalize(vec3(-(smoothstep(0., .16, ex) * .1 - hc) / .04, 1., -(smoothstep(0., .16, ez) * .1 - hc) / .04));
    n = normalize(mix(n, vec3(0, 1, 0), far));
    float nn = fbm2(w * 2.4);
    float molten = smoothstep(.58, .76, fbm2(w * .25 + vec2(T * .015, 0.)));
    // Waerme vom Mauszeiger
    vec3 rdm = normalize(uMouse.x * rt + uMouse.y * up + 1.6 * fw);
    vec2 mp = rdm.y < 0. ? (ro + rdm * (-ro.y / rdm.y)).xz : vec2(1e3);
    float hot = exp(-dot(pos.xz - mp, pos.xz - mp) * .5) * uHeat;
    // Lavablase (Klick)
    float bd = length(pos.xz - uBub.xy), age = uBub.z;
    float ring = uBub.w * exp(-pow(bd - age * 3.2, 2.) * 5.) * exp(-age * 1.2);
    float dome = uBub.w * exp(-bd * bd * 3.) * exp(-age * 4.);
    float crack = 1. - smoothstep(0., .07 + .05 * nn + hot * .25 + ring * .2, e0);
    float temp = .02 + .12 * nn + hot * .25;
    temp = mix(temp, .84 + .3 * nn, crack);
    temp = mix(temp, .74 + .4 * nn, molten);
    temp += .05 * sin(T * 1.4 + w.y * 3.) + uErupt * .3 + ring * .5 + dome * .8;
    temp = mix(temp, .45, far);
    vec3 emit = heat(temp);
    // erkaltete Platten: dunkles Gestein, vom Lavafall und von den Rissen beleuchtet
    float plate = (1. - crack) * (1. - molten) * (1. - far) * (1. - hot);
    vec3 alb = vec3(.06, .045, .04) * (.6 + 1.2 * fbm2(w * 7.));
    vec3 lv = LP - pos; float ld = length(lv); lv /= ld;
    vec3 lit = alb * vec3(1., .5, .15) * max(dot(n, lv), 0.) * 26. / (1. + ld * ld * .25);
    lit += vec3(1.2, .3, .04) * smoothstep(.3, 0., e0) * .45;
    vec3 hv = normalize(lv - rd);
    lit += vec3(1., .55, .2) * pow(max(dot(n, hv), 0.), 40.) * 2.5 / (1. + ld * ld * .1);   // Glanz auf der Kruste
    col = mix(emit, lit, plate * .9);
    col += vec3(2.5, 1.1, .3) * exp(-abs(pos.x - FX) * 2.2) * exp(-abs(pos.z - 14.) * .35) * .5;     // Spiegelung/Aufprall Lavafall
    tEnd = tL;
  } else { tEnd = 40.; }

  // ---- Lavafall: leuchtender Vorhang vor der Rueckwand ----
  float tF = (13.9 - ro.z) / rd.z;
  if (tF > 0. && tF < tEnd) {
    vec3 pf = ro + rd * tF;
    if (pf.y > -.1) {
      float wob = (n2(vec2(pf.y * 1.5 - T * 3., 1.)) - .5) * .25;
      float wid = .36 + .05 * sin(pf.y * 2. + T * 2.);
      float sd = min(abs(pf.x - FX + uPart * 1.7 + wob), abs(pf.x - FX - uPart * 1.7 + wob));
      float fall = smoothstep(wid, wid * .4, sd);
      float fn = fbm2(vec2((pf.x - FX) * 5., pf.y * 1.2 + T * 2.6));
      col = mix(col, heat(.74 + .45 * fn), fall);
      col += vec3(1.5, .5, .1) * exp(-sd * 4.) * .25;
    }
  }

  // ---- volumetrischer Rauch, vom See und vom Lavafall angestrahlt ----
  float te = min(tEnd, 30.), sl = te / 22., tr = 1.;
  vec3 acc = vec3(0.);
  float jit = h21(gl_FragCoord.xy + fract(T) * 50.);
  for (int i = 0; i < 22; i++) {
    vec3 q = ro + rd * (sl * (float(i) + jit));
    float dens = .016 * (.3 + fbm3(q * .32 + vec3(0., -T * .18, T * .08))) * exp(-max(q.y, 0.) * .2) * (1. + uErupt);
    vec3 lt = vec3(1., .3, .06) * lakeGlow(q.xz) * exp(-max(q.y, 0.) * .6) * .9 + vec3(1., .5, .15) * 7. / (1. + dot(q - LP, q - LP) * .35);
    acc += tr * dens * lt * sl; tr *= exp(-dens * sl);
  }
  col = col * tr + acc;
  O = vec4(col, 1.);
}`,
    plusVs: `#version 300 es
in vec2 a; out vec2 uv; void main() { uv = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }`,
    plusBright: `#version 300 es
precision highp float; in vec2 uv; uniform sampler2D S; uniform vec2 px; out vec4 O;
void main() { // 4-fach verkleinern + helle Teile herausfiltern
  vec3 c = (texture(S, uv + px * vec2(-1, -1)).rgb + texture(S, uv + px * vec2(1, -1)).rgb + texture(S, uv + px * vec2(-1, 1)).rgb + texture(S, uv + px * vec2(1, 1)).rgb) * .25;
  float l = dot(c, vec3(.3, .5, .2)); O = vec4(c * smoothstep(.7, 2.2, l), 1.); }`,
    plusBlur: `#version 300 es
precision highp float; in vec2 uv; uniform sampler2D S; uniform vec2 dir; out vec4 O;
void main() { // 9-Tap Gauss ueber lineare Filterung
  vec3 c = texture(S, uv).rgb * .227;
  c += (texture(S, uv + dir * 1.385).rgb + texture(S, uv - dir * 1.385).rgb) * .316;
  c += (texture(S, uv + dir * 3.231).rgb + texture(S, uv - dir * 3.231).rgb) * .07;
  O = vec4(c, 1.); }`,
    plusComp: `#version 300 es
precision highp float; in vec2 uv; uniform sampler2D S, B1, B2; uniform float T; uniform vec2 R; out vec4 O;
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + .03)) / (x * (2.43 * x + .59) + .14), 0., 1.); }
void main() {
  vec2 c = uv - .5; float r2 = dot(c, c);
  vec2 off = c * .0025 * r2 * 4.;   // leichte Farbsaeume zum Rand hin
  vec3 col = vec3(texture(S, uv + off).r, texture(S, uv).g, texture(S, uv - off).b);
  col += texture(B1, uv).rgb * .55 + texture(B2, uv).rgb * .9;
  col *= .82;
  col = aces(col);
  col *= mix(1., .6, smoothstep(.55, .95, uv.y));        // Lesbarkeit oben
  col *= 1. - r2 * .9;                                    // Vignette
  col += (fract(sin(dot(uv * R + T, vec2(12.9898, 78.233))) * 43758.5453) - .5) * .025; // Koernung
  O = vec4(pow(col, vec3(.95)), 1.); }`
  };

  // ===================== Lava (gemeinsam fuer Magma Heart und Magma Heart+) =====================
  // Glut mit Tiefenunschaerfe, Lavafontaenen beim Ausbruch, Augen-Easter-Egg
  function lavaKit(cx, getWH, horizonY) {
    const embers = [], blobs = [];
    const spawnEmber = fore => { const [W, H] = getWH(), hy = horizonY(), d = fore ? rand(1.4, 2.2) : rand(.25, 1); embers.push({ x: rand(0, W), y: fore ? H + 20 : rand(hy, H), d, vx: rand(-8, 8), vy: -rand(25, 60) * d, life: 1, ph: rand(0, 6), fore }); };
    const kit = { egg: null, clicks: 0, reset: null, erupt: 0, shake: 0 };
    kit.eruptNow = () => {
      kit.erupt = 1; kit.shake = 1; quake();
      const [W, H] = getWH(), hy = horizonY();
      for (let g = 0; g < 5; g++) { const gx = rand(W * .18, W * .82), gy = hy + (H - hy) * rand(.25, .85), sc = .5 + 1.6 * (gy - hy) / (H - hy); for (let k = 0; k < 70; k++) blobs.push({ x: gx + rand(-8, 8) * sc, y: gy, vx: rand(-70, 70) * sc, vy: -rand(380, 780) * sc, r: rand(2.5, 7) * sc, life: 1, delay: g * .15 + k * .008, g: 750 * sc }); }
      for (let k = 0; k < 120; k++) spawnEmber(Math.random() < .2);
    };
    kit.click = () => { if (kit.egg) return; kit.clicks++; clearTimeout(kit.reset); kit.reset = setTimeout(() => { kit.clicks = 0; }, 3000); if (kit.clicks >= 5) { kit.clicks = 0; kit.egg = { t: 0, erupted: false }; } };
    // Zustand der Augen; eyeAt = Bildschirmpunkt zwischen den Augen
    kit.state = (dt, mouse, eyeAt) => {
      const s = { part: 0, eye: 0, narrow: 0, blink: 0, look: [0, 0] };
      kit.erupt = Math.max(0, kit.erupt - dt * .35); kit.shake = Math.max(0, kit.shake - dt * 1.6);
      if (!kit.egg) return s;
      const t = kit.egg.t += dt, [, H] = getWH();
      s.part = ease(t / .9) * (1 - ease((t - 7) / .9)); s.eye = ease((t - .8) / 1.2) * (1 - ease((t - 6.6) / .6));
      s.narrow = ease((t - 3) / .8) * (1 - ease((t - 6) / .6)); s.blink = t > 2.4 && t < 2.62 ? Math.sin((t - 2.4) / .22 * Math.PI) : 0;
      const [ex, ey] = eyeAt(); let lx = (mouse[0] - ex) / (H * .25), ly = -(mouse[1] - ey) / (H * .25); const l = Math.hypot(lx, ly); if (l > 1) { lx /= l; ly /= l; } s.look = [lx, ly];
      if (t > 4.2 && !kit.egg.erupted) { kit.egg.erupted = true; kit.eruptNow(); }
      if (t > 3 && t < 4.2) kit.shake = Math.max(kit.shake, (t - 3) / 1.2 * .25);
      if (t > 8.2) kit.egg = null;
      return s;
    };
    kit.drawFx = (t, dt) => {
      const [W, H] = getWH();
      cx.clearRect(0, 0, W, H);
      if (Math.random() < dt * 26) spawnEmber(false);
      if (Math.random() < dt * .7) spawnEmber(true);
      cx.save(); cx.globalCompositeOperation = 'lighter';
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]; e.life -= dt * (e.fore ? .25 : .32); if (e.life <= 0 || e.y < -40) { embers.splice(i, 1); continue; }
        e.x += (e.vx + Math.sin(t * 1.7 + e.ph) * 18 * e.d) * dt; e.y += e.vy * dt;
        const a = Math.min(1, e.life * 1.5) * (.55 + .45 * Math.sin(t * 9 + e.ph));
        if (e.fore) { const r = 7 * e.d, g = cx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r); g.addColorStop(0, `rgba(255,150,60,${.28 * a})`); g.addColorStop(.6, `rgba(255,90,20,${.12 * a})`); g.addColorStop(1, 'rgba(255,80,20,0)'); cx.fillStyle = g; cx.beginPath(); cx.arc(e.x, e.y, r, 0, 7); cx.fill(); }
        else { const r = .6 + 1.4 * e.d; cx.fillStyle = `rgba(255,${150 + 90 * e.life | 0},70,${a})`; cx.beginPath(); cx.arc(e.x, e.y, r, 0, 7); cx.fill(); cx.fillStyle = `rgba(255,110,30,${a * .25})`; cx.beginPath(); cx.arc(e.x, e.y, r * 3.5, 0, 7); cx.fill(); }
      }
      for (let i = blobs.length - 1; i >= 0; i--) {
        const b = blobs[i]; if (b.delay > 0) { b.delay -= dt; continue; }
        b.life -= dt * .55; b.vy += b.g * dt; b.x += b.vx * dt; b.y += b.vy * dt; if (b.life <= 0) { blobs.splice(i, 1); continue; }
        const g = cx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 3.5); g.addColorStop(0, `rgba(255,245,200,${b.life})`); g.addColorStop(.3, `rgba(255,140,40,${b.life * .8})`); g.addColorStop(1, 'rgba(200,40,0,0)');
        cx.fillStyle = g; cx.beginPath(); cx.arc(b.x, b.y, b.r * 3.5, 0, 7); cx.fill();
      }
      cx.restore();
    };
    return kit;
  }

  // ===================== Magma Heart (Animated) =====================
  function magmaScene() {
    const cv = fullCanvas(), fxc = fullCanvas(), cx = fxc.getContext('2d');
    let G = null, W = 0, H = 0, D = 1;
    const YH = -.12, LF = .36, GLS = .75;
    const toScreen = (px, py) => [W / 2 + px * H, H / 2 - py * H];
    const mouse = [innerWidth / 2, innerHeight / 2];
    const kit = lavaKit(cx, () => [W, H], () => toScreen(0, YH)[1]);
    const onMove = e => { mouse[0] = e.clientX; mouse[1] = e.clientY; };
    const onClick = e => { if (blocked(e)) return; const [fx0] = toScreen(LF, 0), [, hy] = toScreen(0, YH); if (Math.abs(e.clientX - fx0) > H * .05 || e.clientY > hy) return; kit.click(); };
    const resize = () => { D = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; if (G) G.size(Math.round(W * GLS), Math.round(H * GLS)); fxc.width = W * D; fxc.height = H * D; cx.setTransform(D, 0, 0, D, 0, 0); };
    let last = performance.now();
    return {
      animated: true,
      mount() { document.body.appendChild(cv); document.body.appendChild(fxc); try { G = gl1(cv, SH.magma); } catch (e) { G = null; } resize(); addEventListener('mousemove', onMove); addEventListener('click', onClick); },
      unmount() { removeEventListener('mousemove', onMove); removeEventListener('click', onClick); cv.remove(); fxc.remove(); },
      resize,
      setLevel(v) { cv.style.opacity = v; fxc.style.opacity = v; },
      frame() {
        const now = performance.now(), dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
        const s = kit.state(dt, mouse, () => toScreen(LF, .055));
        if (G) { const { gl, U } = G; gl.uniform2f(U('R'), cv.width, cv.height); gl.uniform1f(U('T'), t); gl.uniform1f(U('uPart'), s.part); gl.uniform1f(U('uEye'), s.eye); gl.uniform1f(U('uNarrow'), s.narrow); gl.uniform1f(U('uBlink'), s.blink); gl.uniform1f(U('uErupt'), kit.erupt); gl.uniform2f(U('uLook'), s.look[0], s.look[1]); gl.uniform2f(U('uShake'), rand(-1, 1) * kit.shake * .006, rand(-1, 1) * kit.shake * .006); G.draw(); }
        kit.drawFx(t, dt);
      }
    };
  }

  // ===================== Magma Heart+ (Animated+) =====================
  function magmaPlusScene() {
    const cv = fullCanvas(), fxc = fullCanvas(), cx = fxc.getContext('2d');
    let gl = null, P = null, RT = null, hdr = false, W = 0, H = 0, D = 1, scale = .66, avg = 16, settle = 0, heatAmt = 0, last = performance.now(), lastMove = -1e9;
    const cam = [0, 0], camT = [0, 0], mouse = [innerWidth / 2, innerHeight * .7], bub = { x: 0, z: 0, age: 9, on: 0 };
    const v3 = { sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], norm: a => { const l = Math.hypot(...a); return a.map(x => x / l); }, cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]] };
    const camera = () => { const ro = [cam[0] * .55, 2.2 + cam[1] * .3, -3.5], ta = [cam[0] * .2, 1.5, 8], fw = v3.norm(v3.sub(ta, ro)), rt = v3.norm(v3.cross([0, 1, 0], fw)), up = v3.cross(fw, rt); return { ro, fw, rt, up }; };
    const project = P3 => { const c = camera(), v = v3.sub(P3, c.ro), z = v3.dot(v, c.fw); return [W / 2 + v3.dot(v, c.rt) / z * 1.6 * H, H / 2 - v3.dot(v, c.up) / z * 1.6 * H]; };
    const lakePoint = (sx, sy) => { const c = camera(), px = (sx - W / 2) / H, py = (H / 2 - sy) / H, rd = v3.norm([0, 1, 2].map(i => px * c.rt[i] + py * c.up[i] + 1.6 * c.fw[i])); if (rd[1] >= 0) return null; const tt = -c.ro[1] / rd[1]; return [c.ro[0] + rd[0] * tt, c.ro[2] + rd[2] * tt]; };
    const kit = lavaKit(cx, () => [W, H], () => H * .5);
    function init() {
      gl = cv.getContext('webgl2', { antialias: false, alpha: false });
      if (!gl) return false;
      hdr = !!gl.getExtension('EXT_color_buffer_float'); gl.getExtension('OES_texture_float_linear');
      const prog = fs => {
        const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
        const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, SH.plusVs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p);
        const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
        return { p, u };
      };
      P = { scene: prog(SH.plusScene), bright: prog(SH.plusBright), blur: prog(SH.plusBlur), comp: prog(SH.plusComp) };
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      return true;
    }
    const target = (w, h) => { const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, hdr ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, hdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null); [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR)); [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE)); const fb = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fb); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0); return { tex, fb, w, h }; };
    const build = () => { if (!gl) return; if (RT) Object.values(RT).forEach(r => { gl.deleteTexture(r.tex); gl.deleteFramebuffer(r.fb); }); const sw = Math.max(64, Math.round(W * scale)), sh = Math.max(64, Math.round(H * scale)), qw = Math.max(16, Math.round(W / 4)), qh = Math.max(16, Math.round(H / 4)); RT = { S: target(sw, sh), A1: target(qw, qh), B1: target(qw, qh), A2: target(qw >> 1, qh >> 1), B2: target(qw >> 1, qh >> 1) }; };
    const resize = () => { D = Math.min(1.5, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = Math.round(W * D); cv.height = Math.round(H * D); fxc.width = W * D; fxc.height = H * D; cx.setTransform(D, 0, 0, D, 0, 0); build(); };
    const pass = (pr, out, setup) => { gl.useProgram(pr.p); if (out) { gl.bindFramebuffer(gl.FRAMEBUFFER, out.fb); gl.viewport(0, 0, out.w, out.h); } else { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height); } setup(pr.u); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const bind = (unit, tex, loc) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(loc, unit); };
    const onMove = e => { mouse[0] = e.clientX; mouse[1] = e.clientY; lastMove = performance.now(); camT[0] = (e.clientX / W - .5) * 2; camT[1] = -(e.clientY / H - .5) * 2; };
    const onClick = e => {
      if (blocked(e)) return;
      const [fx0, fyBottom] = project([2, 0, 13.9]), [fxR] = project([2.5, 0, 13.9]);
      if (Math.abs(e.clientX - fx0) < Math.max(18, (fxR - fx0) * 1.3) && e.clientY < fyBottom) { kit.click(); return; }
      const lp = lakePoint(e.clientX, e.clientY); if (lp) { bub.x = lp[0]; bub.z = lp[1]; bub.age = 0; bub.on = 1; }
    };
    return {
      animated: true,
      mount() { document.body.appendChild(cv); document.body.appendChild(fxc); let ok = false; try { ok = init(); } catch (e) { ok = false; } if (!ok) gl = null; resize(); addEventListener('mousemove', onMove); addEventListener('click', onClick); },
      unmount() { removeEventListener('mousemove', onMove); removeEventListener('click', onClick); cv.remove(); fxc.remove(); },
      resize,
      setLevel(v) { cv.style.opacity = v; fxc.style.opacity = v; },
      frame() {
        const now = performance.now(), dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
        if (!gl) return;
        avg = avg * .95 + dt * 1000 * .05; settle += dt;
        if (settle > 1.5) { if (avg > 24 && scale > .4) { scale = Math.max(.4, scale - .06); build(); settle = 0; } else if (avg < 15 && scale < .85) { scale = Math.min(.85, scale + .04); build(); settle = 0; } }
        cam[0] += (camT[0] - cam[0]) * Math.min(1, dt * 2); cam[1] += (camT[1] - cam[1]) * Math.min(1, dt * 2);
        heatAmt += ((mouse[1] > H * .55 && now - lastMove < 2500 ? 1 : 0) - heatAmt) * Math.min(1, dt * 3);
        bub.age += dt; if (bub.age > 4) bub.on = 0;
        const s = kit.state(dt, mouse, () => project([2, 1.9, 14.2]));
        pass(P.scene, RT.S, u => { gl.uniform2f(u.R, RT.S.w, RT.S.h); gl.uniform1f(u.T, t); gl.uniform2f(u.uMouse, (mouse[0] - W / 2) / H, (H / 2 - mouse[1]) / H); gl.uniform2f(u.uCam, cam[0], cam[1]); gl.uniform1f(u.uPart, s.part); gl.uniform1f(u.uEye, s.eye); gl.uniform1f(u.uNarrow, s.narrow); gl.uniform1f(u.uBlink, s.blink); gl.uniform1f(u.uErupt, kit.erupt); gl.uniform1f(u.uHeat, heatAmt); gl.uniform2f(u.uLook, s.look[0], s.look[1]); gl.uniform4f(u.uBub, bub.x, bub.z, bub.age, bub.on); });
        pass(P.bright, RT.A1, u => { bind(0, RT.S.tex, u.S); gl.uniform2f(u.px, 1 / RT.S.w, 1 / RT.S.h); });
        pass(P.blur, RT.B1, u => { bind(0, RT.A1.tex, u.S); gl.uniform2f(u.dir, 1 / RT.A1.w, 0); });
        pass(P.blur, RT.A1, u => { bind(0, RT.B1.tex, u.S); gl.uniform2f(u.dir, 0, 1 / RT.A1.h); });
        pass(P.bright, RT.A2, u => { bind(0, RT.A1.tex, u.S); gl.uniform2f(u.px, .5 / RT.A1.w, .5 / RT.A1.h); });
        for (let k = 0; k < 2; k++) { pass(P.blur, RT.B2, u => { bind(0, RT.A2.tex, u.S); gl.uniform2f(u.dir, 1.5 / RT.A2.w, 0); }); pass(P.blur, RT.A2, u => { bind(0, RT.B2.tex, u.S); gl.uniform2f(u.dir, 0, 1.5 / RT.A2.h); }); }
        pass(P.comp, null, u => { bind(0, RT.S.tex, u.S); bind(1, RT.A1.tex, u.B1); bind(2, RT.A2.tex, u.B2); gl.uniform1f(u.T, t % 100); gl.uniform2f(u.R, cv.width, cv.height); });
        kit.drawFx(t, dt);
      }
    };
  }

  // ===================== Fancy-Shader-Themes mit kleinem Overlay =====================
  function shaderScene(fs, gls, overlay) {
    return () => {
      const cv = fullCanvas(), fxc = fullCanvas(), cx = fxc.getContext('2d');
      let G = null, W = 0, H = 0, D = 1, st = {}, last = performance.now();
      const resize = () => { D = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; if (G) G.size(Math.round(W * gls), Math.round(H * gls)); fxc.width = W * D; fxc.height = H * D; cx.setTransform(D, 0, 0, D, 0, 0); st = overlay.setup(W, H); };
      return {
        animated: true,
        mount() { document.body.appendChild(cv); document.body.appendChild(fxc); try { G = gl1(cv, fs); } catch (e) { G = null; } resize(); },
        unmount() { cv.remove(); fxc.remove(); },
        resize,
        setLevel(v) { cv.style.opacity = v; fxc.style.opacity = v; },
        frame() { const now = performance.now(), dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now; if (G) { G.gl.uniform2f(G.U('R'), cv.width, cv.height); G.gl.uniform1f(G.U('T'), t); G.draw(); } cx.clearRect(0, 0, W, H); overlay.draw(cx, W, H, t, dt, st); }
      };
    };
  }
  // Aurora: Schneefall mit Tiefenunschaerfe
  const auroraOverlay = {
    setup(W, H) { const nf = anyY => { const fore = Math.random() < .08, d = fore ? rand(2, 3.2) : rand(.3, 1.2); return { x: rand(0, W), y: anyY ? rand(0, H) : -10, d, fore, ph: rand(0, 6), vy: rand(10, 18) * d }; }; return { nf, flakes: Array.from({ length: Math.round(W * H / 15000) }, () => nf(true)) }; },
    draw(c, W, H, t, dt, s) {
      s.flakes.forEach((f, i) => { f.y += f.vy * dt; f.x += Math.sin(t * .6 + f.ph) * 8 * f.d * dt + 4 * dt; if (f.y > H + 10 || f.x > W + 10) s.flakes[i] = s.nf(false);
        if (f.fore) { const r = 3.5 * f.d, g = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, r); g.addColorStop(0, 'rgba(230,245,255,.22)'); g.addColorStop(1, 'rgba(230,245,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(f.x, f.y, r, 0, 7); c.fill(); }
        else { c.fillStyle = `rgba(230,245,255,${.35 + .35 * f.d / 1.2})`; c.beginPath(); c.arc(f.x, f.y, .5 + .9 * f.d, 0, 7); c.fill(); } });
    }
  };
  // Lantern Festival: Himmelslaternen + schwimmende Laternen, alle mit Spiegelung
  const LYH = -.2;
  function lanternShape(c, x, y, s, t, ph, alpha, blur) {
    const fl = .85 + .15 * Math.sin(t * 9 + ph) * Math.sin(t * 3.3 + ph * 2);
    const halo = c.createRadialGradient(x, y, 0, x, y, s * (blur ? 4.5 : 3.2)); halo.addColorStop(0, `rgba(255,170,80,${.35 * alpha * fl})`); halo.addColorStop(1, 'rgba(255,120,40,0)');
    c.fillStyle = halo; c.beginPath(); c.arc(x, y, s * (blur ? 4.5 : 3.2), 0, 7); c.fill();
    if (blur) return;
    const g = c.createLinearGradient(x, y - s, x, y + s); g.addColorStop(0, `rgba(255,150,70,${alpha})`); g.addColorStop(.6, `rgba(255,210,130,${alpha})`); g.addColorStop(1, `rgba(255,240,190,${alpha * fl})`);
    c.fillStyle = g; c.beginPath(); c.moveTo(x - s * .55, y - s); c.lineTo(x + s * .55, y - s); c.lineTo(x + s * .42, y + s * .8); c.quadraticCurveTo(x, y + s, x - s * .42, y + s * .8); c.closePath(); c.fill();
    c.strokeStyle = `rgba(180,80,30,${alpha * .5})`; c.lineWidth = .6; c.beginPath(); c.moveTo(x, y - s); c.lineTo(x, y + s * .9); c.stroke();
  }
  const lanternsOverlay = {
    setup(W, H) {
      const horizon = H / 2 - LYH * H;
      const newSky = anyY => { const d = Math.random() < .1 ? rand(1.6, 2.4) : rand(.25, 1.1); return { x: rand(-20, W + 20), y: anyY ? rand(-40, horizon) : horizon + rand(0, 20) * d, d, ph: rand(0, 6), vx: rand(-4, 4), vy: -rand(10, 18) * d, sw: rand(.5, 1.2) }; };
      return { horizon, newSky, sky: Array.from({ length: Math.round(W * H / 18000) }, () => newSky(true)), floaters: Array.from({ length: Math.round(W / 130) }, () => { const depth = rand(0, 1); return { x: rand(0, W), depth, ph: rand(0, 6), v: rand(3, 8) * (.4 + depth) }; }) };
    },
    draw(c, W, H, t, dt, s) {
      s.sky.sort((a, b) => a.d - b.d);
      c.save(); c.beginPath(); c.rect(0, s.horizon, W, H - s.horizon); c.clip();
      s.sky.forEach(l => { const ry = s.horizon + (s.horizon - l.y) * .55; if (ry > H + 30) return; const wob = Math.sin(t * 2 + l.ph + ry * .05) * 3; lanternShape(c, l.x + wob, ry, 7 * l.d, t, l.ph, .3 * Math.min(1, l.d), l.d > 1.5); });
      c.restore();
      s.sky.forEach((l, i) => { l.x += (l.vx + Math.sin(t * .4 + l.ph) * 3 * l.d) * dt; l.y += l.vy * dt; if (l.y < -60) s.sky[i] = s.newSky(false); const fade = Math.min(1, (l.y + 60) / 160) * (.45 + .55 * Math.min(1, l.d)); c.save(); c.translate(l.x, l.y); c.rotate(Math.sin(t * l.sw + l.ph) * .08); lanternShape(c, 0, 0, 7 * l.d, t, l.ph, fade, l.d > 1.5); c.restore(); });
      s.floaters.forEach(f => { f.x += f.v * dt; if (f.x > W + 30) f.x = -30; const y = s.horizon + 8 + f.depth * (H - s.horizon) * .85, sz = 3 + f.depth * 7, bob = Math.sin(t * 1.5 + f.ph) * 1.5;
        for (let k = 0; k < 4; k++) { const ry = y + sz * (.8 + k * .9), w = sz * (1.6 - k * .25) * (1 + .2 * Math.sin(t * 3 + k + f.ph)); c.fillStyle = `rgba(255,170,80,${.28 - k * .06})`; c.beginPath(); c.ellipse(f.x + Math.sin(t * 2 + k) * 1.5, ry, w, sz * .22, 0, 0, 7); c.fill(); }
        lanternShape(c, f.x, y + bob - sz * .3, sz * .7, t, f.ph, .95, false); c.fillStyle = 'rgba(60,30,20,.8)'; c.fillRect(f.x - sz * .9, y + bob + sz * .3, sz * 1.8, sz * .3); });
    }
  };
  // Sky Isles: Vogelschwaerme
  const skyOverlay = {
    setup() { return { flocks: [], next: 2 }; },
    draw(c, W, H, t, dt, s) {
      s.next -= dt;
      if (s.next <= 0) { s.next = rand(7, 14); const n = 5 + (Math.random() * 6 | 0), y = rand(H * .2, H * .55), sc = rand(.6, 1.3), birds = []; for (let k = 0; k < n; k++) { const row = Math.ceil(k / 2), side = k % 2 ? 1 : -1; birds.push({ dx: row * 16 * sc, dy: side * row * 9 * sc + rand(-2, 2), ph: rand(0, 6) }); } s.flocks.push({ x: W + 40, y, s: sc, v: rand(28, 45) * sc, birds }); }
      s.flocks = s.flocks.filter(f => f.x > -300);
      s.flocks.forEach(f => { f.x -= f.v * dt; f.y += Math.sin(t * .5) * 3 * dt; c.strokeStyle = `rgba(40,36,70,${.55 + .2 * f.s})`; c.lineWidth = 1.3 * f.s; c.lineCap = 'round';
        f.birds.forEach(b => { const x = f.x + b.dx, y = f.y + b.dy, flap = Math.sin(t * 9 + b.ph) * 4 * f.s, ww = 6 * f.s; c.beginPath(); c.moveTo(x - ww, y - flap); c.quadraticCurveTo(x - ww * .4, y - flap * .3 - 1, x, y); c.quadraticCurveTo(x + ww * .4, y - flap * .3 - 1, x + ww, y - flap); c.stroke(); }); });
    }
  };
  const aurora = shaderScene(SH.aurora, .8, auroraOverlay);
  const lanterns = shaderScene(SH.lanterns, .8, lanternsOverlay);
  const skyisles = shaderScene(SH.skyisles, .8, skyOverlay);

  // ===================== Neon Overdrive (Animated, Developer's Choice) =====================
  // Hommage an das Lieblingsspiel des Entwicklers (keine Originalnamen/-logos):
  // Megacity bei Nacht mit Neonstreifen, fliegenden Autos, Hologramm, Regen,
  // seltenen Glitches. Easter Egg: blinkendes Terminal an einem vorderen Gebaeude
  // anklicken -> Netzwerk-Hack-Minispiel (Zeile/Spalte waehlen, 15 s). Geschafft:
  // ein Virus frisst sich durch die Stadt und faerbt alles tiefrot, der ganze
  // Bildschirm verzerrt sich - dann erholt sich alles wieder.
  const CCOL = { red: [255, 74, 74], cyan: [94, 240, 240], yellow: [232, 212, 58], hack: [200, 8, 20] };
  function cyberCity(cx) {
    const city = { W: 0, H: 0, layers: [], terminal: null, holo: null, hacked: 0, virus: null, mouse: { x: .5, sx: .5 }, rain: [], cars: [], nextCar: 1, glitch: 0, nextGlitch: rand(8, 16) };
    const V_SPREAD = 1.8, V_HEAL_AT = 3.6, V_HEAL = 1.8;
    city.V_END = V_HEAL_AT + V_HEAL + .5;
    const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
    const infection = x => {
      const v0 = city.virus; if (!v0) return 0;
      const t = v0.t, front = t / V_SPREAD * (city.W + 300) - 150; let v = Math.max(0, Math.min(1, (front - x) / 90));
      if (v > 0 && v < 1 && Math.random() < .35) v = Math.random();
      const heal = t - V_HEAL_AT; if (heal > 0) { const back = heal / V_HEAL * (city.W + 300) - 150; v *= Math.max(0, Math.min(1, (x - back) / 120)); }
      return v;
    };
    const rgba = (c, a, x) => { const h = x === undefined ? city.hacked : infection(x); const [r, g, b] = h > .01 ? mix(CCOL[c], CCOL.hack, h) : CCOL[c]; return `rgba(${r | 0},${g | 0},${b | 0},${a})`; };
    city.build = (W, H) => {
      city.W = W; city.H = H;
      const r = seeded(2077), ground = H * .9;
      city.layers = [
        { depth: .2, fill: '#0b0d14', minH: .45, maxH: .8, minW: 50, maxW: 110, strip: .25, b: [] },
        { depth: .5, fill: '#090a10', minH: .35, maxH: .7, minW: 70, maxW: 150, strip: .4, b: [] },
        { depth: 1, fill: '#050609', minH: .25, maxH: .55, minW: 100, maxW: 200, strip: .55, b: [] }
      ];
      city.layers.forEach(L => {
        let x = -80;
        while (x < W + 80) {
          const w = L.minW + r() * (L.maxW - L.minW), h = H * (L.minH + r() * (L.maxH - L.minH)), strips = [], wins = [];
          if (r() < L.strip) strips.push({ x: r() < .5 ? 4 : w - 7, col: r() < .6 ? 'yellow' : 'cyan', ph: r() * 6 });
          if (r() < L.strip * .4) strips.push({ x: w * (.3 + r() * .4), col: r() < .8 ? 'cyan' : 'red', ph: r() * 6 });
          for (let wy = 18; wy < h - 10; wy += 10) for (let wx = 8; wx < w - 8; wx += 9) if (r() < .07) wins.push([wx, wy, r() < .5 ? 'yellow' : r() < .75 ? 'cyan' : 'red', r() * 6]);
          L.b.push({ x, w, h, top: ground - h, strips, wins, spire: r() < .25, chamfer: r() < .4 });
          x += w + 2 + r() * 8;
        }
      });
      const near = city.layers[2].b.filter(b => b.x > W * .55 && b.x + b.w < W * .9 && b.h > H * .3);
      const host = near[0] || city.layers[2].b[Math.floor(city.layers[2].b.length * .7)];
      city.terminal = { x: host.x + host.w * .5, y: ground - host.h * .45 };
      city.holo = { x: W * .2, y: H * .5, s: Math.min(W, H) * .1 };
      city.rain = Array.from({ length: Math.round(W * H / 9000) }, () => ({ x: rand(0, W), y: rand(0, H), l: rand(8, 18), v: rand(600, 900) }));
    };
    city.draw = (t, dt) => {
      const { W, H, mouse } = city, ground = H * .9;
      mouse.sx += (mouse.x - mouse.sx) * Math.min(1, dt * 3);
      cx.clearRect(0, 0, W, H);
      const sky = cx.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#05060a'); sky.addColorStop(.6, '#0b0b14'); sky.addColorStop(1, city.hacked > .01 ? `rgba(80,4,8,${.7 * city.hacked + .2})` : '#17140a');
      cx.fillStyle = sky; cx.fillRect(0, 0, W, H);
      const smog = cx.createRadialGradient(W * .5, H * .95, 0, W * .5, H * .95, W * .7); smog.addColorStop(0, rgba('yellow', .1)); smog.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = smog; cx.fillRect(0, 0, W, H);
      // fliegende Autos
      city.nextCar -= dt;
      if (dt && city.nextCar <= 0) { const dir = Math.random() < .5 ? 1 : -1; city.cars.push({ dir, x: dir > 0 ? -60 : W + 60, y: rand(H * .12, H * .5), v: rand(160, 320) * dir, z: rand(.5, 1) }); city.nextCar = rand(1.2, 3.5); }
      for (let i = city.cars.length - 1; i >= 0; i--) { const c = city.cars[i]; c.x += c.v * dt; if (c.x < -120 || c.x > W + 120) { city.cars.splice(i, 1); continue; } const len = 90 * c.z, g = cx.createLinearGradient(c.x, 0, c.x - c.dir * len, 0); g.addColorStop(0, rgba('red', .8 * c.z, c.x)); g.addColorStop(1, 'rgba(0,0,0,0)'); cx.strokeStyle = g; cx.lineWidth = 1.5 * c.z; cx.beginPath(); cx.moveTo(c.x, c.y); cx.lineTo(c.x - c.dir * len, c.y); cx.stroke(); cx.fillStyle = '#0a0c12'; cx.fillRect(c.x - 9 * c.z, c.y - 3 * c.z, 18 * c.z, 5 * c.z); cx.fillStyle = rgba('cyan', .9, c.x); cx.fillRect(c.x + c.dir * 8 * c.z - 1, c.y - 1, 2, 2); }
      // Stadt
      city.layers.forEach((L, li) => {
        const ox = (mouse.sx - .5) * -36 * L.depth;
        L.b.forEach(b => {
          const x = b.x + ox, top = b.top;
          cx.fillStyle = L.fill; cx.beginPath();
          if (b.chamfer) { cx.moveTo(x, ground); cx.lineTo(x, top + 14); cx.lineTo(x + 14, top); cx.lineTo(x + b.w, top); cx.lineTo(x + b.w, ground); } else cx.rect(x, top, b.w, ground - top);
          cx.fill();
          if (b.spire) { cx.fillRect(x + b.w * .5 - 1, top - 40, 2, 40); if (Math.sin(t * 2.5 + b.x) > .4) { cx.fillStyle = rgba('red', .9, x); cx.fillRect(x + b.w * .5 - 2, top - 42, 4, 3); } }
          const fade = li === 0 ? .35 : li === 1 ? .6 : 1;
          b.wins.forEach(([wx, wy, c, ph]) => { cx.fillStyle = rgba(c, (.35 + .25 * Math.sin(t * .5 + ph)) * fade, x + wx); cx.fillRect(x + wx, top + wy, 4, 2); });
          b.strips.forEach(s => { const flick = Math.sin(t * 9 + s.ph) > .97 ? .2 : 1; cx.fillStyle = rgba(s.col, .8 * fade * flick, x + s.x); cx.shadowColor = rgba(s.col, 1, x + s.x); cx.shadowBlur = 12 * fade; cx.fillRect(x + s.x, top + 6, 3, (ground - top) * .8); cx.shadowBlur = 0; });
        });
      });
      // Terminal (Easter Egg)
      { const ox = (mouse.sx - .5) * -36, x = city.terminal.x + ox, y = city.terminal.y;
        cx.fillStyle = '#0d1016'; cx.fillRect(x - 10, y - 13, 20, 26); cx.strokeStyle = rgba('yellow', .7); cx.lineWidth = 1; cx.strokeRect(x - 10, y - 13, 20, 26);
        cx.fillStyle = rgba('cyan', Math.sin(t * 4) > 0 ? .95 : .3); cx.fillRect(x - 6, y - 9, 12, 7);
        for (let k = 0; k < 3; k++) { cx.fillStyle = rgba('red', .6); cx.fillRect(x - 6 + k * 5, y + 2, 3, 3); }
        city.terminal.hit = { x: x - 14, y: y - 17, w: 28, h: 34 }; }
      cx.fillStyle = '#040508'; cx.fillRect(0, ground, W, H - ground);
      const refl = cx.createLinearGradient(0, ground, 0, H); refl.addColorStop(0, rgba('yellow', .1)); refl.addColorStop(1, 'rgba(0,0,0,0)'); cx.fillStyle = refl; cx.fillRect(0, ground, W, H - ground);
      // Hologramm
      { const { x, y, s } = city.holo, ox = (mouse.sx - .5) * -20; cx.save(); cx.translate(x + ox, y + Math.sin(t * .8) * 6); cx.globalCompositeOperation = 'lighter';
        const flick = Math.random() < .03 ? .3 : 1, beam = cx.createLinearGradient(0, s * .2, 0, H * .5); beam.addColorStop(0, rgba('cyan', .12 * flick, x)); beam.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = beam; cx.beginPath(); cx.moveTo(-s * .4, s * .3); cx.lineTo(s * .4, s * .3); cx.lineTo(s * 1.4, H * .5); cx.lineTo(-s * 1.4, H * .5); cx.fill();
        const pts = []; for (let k = 0; k < 8; k++) { const a = t * .7 + k / 8 * Math.PI * 2; pts.push([Math.cos(a) * s * .55, Math.sin(a) * s * .18]); }
        cx.strokeStyle = rgba('cyan', .7 * flick, x); cx.lineWidth = 1.2; pts.forEach(([px, py]) => { cx.beginPath(); cx.moveTo(0, -s * .6); cx.lineTo(px, py); cx.lineTo(0, s * .3); cx.stroke(); });
        cx.beginPath(); pts.forEach(([px, py], i) => i ? cx.lineTo(px, py) : cx.moveTo(px, py)); cx.closePath(); cx.stroke();
        cx.strokeStyle = rgba('yellow', .55 * flick, x); cx.beginPath(); cx.ellipse(0, s * .45, s * .8, s * .14, 0, 0, 7); cx.stroke(); cx.restore(); }
      // Regen
      cx.strokeStyle = 'rgba(170,190,220,.16)'; cx.lineWidth = 1; cx.beginPath();
      city.rain.forEach(d => { d.y += d.v * dt; d.x -= d.v * .12 * dt; if (d.y > H) { d.y = rand(-30, 0); d.x = rand(0, W + 60); } cx.moveTo(d.x, d.y); cx.lineTo(d.x + d.l * .12, d.y - d.l); });
      cx.stroke();
    };
    city.infection = infection; city.V = { V_SPREAD, V_HEAL_AT, V_HEAL };
    return city;
  }
  function cyberStill(c, W, H) { const city = cyberCity(c); city.build(W * 3, H * 3); c.save(); c.scale(1 / 3, 1 / 3); city.draw(3, 0); c.restore(); }
  const CYBER_CSS = `.cp-scan { position: fixed; inset: 0; pointer-events: none; z-index: -1; background: repeating-linear-gradient(0deg, rgba(0,0,0,.18) 0 1px, transparent 1px 3px); }
.cp-breach { position: fixed; inset: 0; z-index: 9800; display: none; align-items: center; justify-content: center; background: rgba(2,3,6,.78); backdrop-filter: blur(2px); font-family: 'Share Tech Mono', Consolas, monospace; color: #e8ecf2; }
.cp-breach.on { display: flex; }
.cp-bp { position: relative; display: grid; grid-template-columns: auto 230px; gap: 26px; padding: 22px 26px; border: 1px solid rgba(255,74,74,.6); background: rgba(8,10,14,.95); box-shadow: 0 0 40px rgba(255,74,74,.15); clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px)); }
.cp-bp h4 { grid-column: 1 / -1; margin: 0; color: #e8d43a; font-family: Rajdhani, 'Segoe UI', sans-serif; font-size: 1.3rem; letter-spacing: 4px; display: flex; justify-content: space-between; }
.cp-bp h4 span { font-family: 'Share Tech Mono', Consolas, monospace; font-size: 1rem; letter-spacing: 1px; }
.cp-grid { display: grid; grid-template-columns: repeat(5, 48px); gap: 4px; padding: 10px; border: 1px solid rgba(94,240,240,.25); }
.cp-grid b { display: flex; align-items: center; justify-content: center; height: 40px; color: rgba(232,236,242,.35); font-weight: normal; font-size: 1.05rem; cursor: default; }
.cp-grid b.live { color: #5ef0f0; cursor: pointer; background: rgba(94,240,240,.07); }
.cp-grid b.live:hover { background: rgba(94,240,240,.25); color: #fff; }
.cp-grid b.used { color: rgba(255,255,255,.12); }
.cp-side { display: flex; flex-direction: column; gap: 14px; font-size: .9rem; }
.cp-side small { color: #8c97a8; letter-spacing: 2px; }
.cp-buf, .cp-seq { display: flex; gap: 6px; }
.cp-buf i, .cp-seq i { font-style: normal; width: 34px; height: 30px; display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(242,226,74,.45); color: #e8d43a; }
.cp-seq i { border-style: solid; border-color: rgba(255,74,74,.5); color: #e8ecf2; }
.cp-seq i.ok { background: rgba(94,240,240,.2); border-color: #5ef0f0; color: #5ef0f0; }
.cp-msg { color: #8c97a8; min-height: 1.2em; }
.cp-msg.win { color: #5ef0f0; } .cp-msg.fail { color: #ff4a4a; }
.cp-x { position: absolute; bottom: 10px; right: 26px; color: #8c97a8; cursor: pointer; }`;
  function cyberScene() {
    const cv = fullCanvas(), cx = cv.getContext('2d'), city = cyberCity(cx);
    const scan = document.createElement('div'); scan.className = 'cp-scan';
    const css = document.createElement('style'); css.textContent = CYBER_CSS;
    const br = document.createElement('div'); br.className = 'cp-breach';
    br.innerHTML = '<div class="cp-bp"><h4>NETWORK BREACH <span class="cp-time">00:15</span></h4><div class="cp-grid"></div><div class="cp-side"><div><small>BUFFER</small><div class="cp-buf"></div></div><div><small>UPLOAD SEQUENCE</small><div class="cp-seq"></div></div><div class="cp-msg"></div></div><span class="cp-x">ESC</span></div>';
    const q = s => br.querySelector(s);
    let W = 0, H = 0, D = 1, last = performance.now(), timer = null;
    const resize = () => { D = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * D; cv.height = H * D; cx.setTransform(D, 0, 0, D, 0, 0); city.build(W, H); };
    // Glitch + Bildschirmverzerrung (Canvas und Seiteninhalt)
    const uiEls = () => [...document.body.children].filter(el => el !== cv && el !== br && el !== scan && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' && !el.classList.contains('shop-scene-cv') && el.id !== 'ttpInkVeil');
    const drawGlitch = g => { for (let k = 0; k < 4 + Math.floor(g * 6); k++) { const y = rand(0, H), h = rand(2, 14), dx = rand(-30, 30) * g; cx.drawImage(cv, 0, y * D, cv.width, h * D, dx, y, W, h); cx.fillStyle = Math.random() < .5 ? `rgba(94,240,240,${.15 * g})` : `rgba(255,74,74,${.15 * g})`; cx.fillRect(0, y, W, h); } };
    const distort = I => {
      const ui = uiEls();
      if (I <= .01) { ui.forEach(el => { el.style.translate = ''; el.style.filter = ''; el.style.clipPath = ''; }); return; }
      const sh = 4 + 14 * I; cx.save(); cx.globalCompositeOperation = 'lighter'; cx.globalAlpha = .35 * I; cx.drawImage(cv, sh * D, 0, cv.width - sh * D, cv.height, 0, 0, W - sh, H); cx.restore();
      for (let k = 0; k < 6 + 18 * I; k++) { const y = rand(0, H), h = rand(2, 4 + 26 * I), dx = rand(-1, 1) * 70 * I; cx.drawImage(cv, 0, y * D, cv.width, h * D, dx, y, W, h); if (Math.random() < .4) { cx.fillStyle = Math.random() < .5 ? `rgba(242,226,74,${.18 * I})` : Math.random() < .5 ? `rgba(94,240,240,${.16 * I})` : `rgba(200,8,20,${.22 * I})`; cx.fillRect(0, y, W, h); } }
      ui.forEach(el => { const jx = Math.random() < .5 ? rand(-1, 1) * 10 * I : 0, s2 = 2 + 6 * I; el.style.translate = `${jx}px 0`; el.style.filter = `drop-shadow(${s2}px 0 rgba(200,8,20,.9)) drop-shadow(${-s2}px 0 rgba(94,240,240,.7))`;
        if (Math.random() < .3 * I) { const a = rand(0, 85), b = a + rand(3, 15); el.style.clipPath = `polygon(0 0, 100% 0, 100% ${a}%, ${rand(0, 3)}% ${a}%, ${rand(0, 3)}% ${b}%, 100% ${b}%, 100% 100%, 0 100%)`; } else el.style.clipPath = ''; });
    };
    // ----- Netzwerk-Hack -----
    const CODES = ['1C', 'BD', '55', 'E9', '7A', 'FF'];
    const bp = { grid: [], seq: [], buf: [], mode: 'row', idx: 0, timer: 0, active: false, running: false, used: new Set() };
    const render = () => {
      const g = q('.cp-grid'); g.innerHTML = '';
      bp.grid.forEach((r, ri) => r.forEach((code, ci) => { const b = document.createElement('b'); b.textContent = code; const used = bp.used.has(ri + ',' + ci), live = bp.active && !used && (bp.mode === 'row' ? ri === bp.idx : ci === bp.idx); if (used) b.className = 'used'; else if (live) b.className = 'live'; if (live) b.onclick = () => pick(ri, ci); g.appendChild(b); }));
      q('.cp-buf').innerHTML = Array.from({ length: 4 }, (_, i) => `<i>${bp.buf[i] || ''}</i>`).join('');
      let done = 0; for (let n = bp.seq.length; n > 0; n--) { if (bp.buf.slice(-n).join(' ') === bp.seq.slice(0, n).join(' ')) { done = n; break; } }
      q('.cp-seq').innerHTML = bp.seq.map((c, i) => `<i class="${i < done ? 'ok' : ''}">${c}</i>`).join('');
    };
    const newPuzzle = () => {
      const N = 5, grid = Array.from({ length: N }, () => Array.from({ length: N }, () => CODES[Math.floor(Math.random() * CODES.length)]));
      let row = 0, col = -1; const seq = [], used = new Set();
      for (let k = 0; k < 3; k++) { if (k % 2 === 0) { let c; do { c = Math.floor(Math.random() * N); } while (used.has(row + ',' + c)); col = c; } else { let r; do { r = Math.floor(Math.random() * N); } while (used.has(r + ',' + col)); row = r; } used.add(row + ',' + col); seq.push(grid[row][col]); }
      Object.assign(bp, { grid, seq, buf: [], mode: 'row', idx: 0, timer: 15, active: true, running: false, used: new Set() }); render();
    };
    const finish = win => { bp.active = false; render(); const m = q('.cp-msg'); m.className = 'cp-msg ' + (win ? 'win' : 'fail'); m.textContent = win ? 'UPLOAD SUCCESSFUL. Enjoy the show.' : 'BREACH FAILED. Try again later.'; setTimeout(() => { br.classList.remove('on'); if (win) { city.virus = { t: 0 }; city.glitch = 1; } }, win ? 900 : 1400); };
    const pick = (ri, ci) => { bp.running = true; bp.used.add(ri + ',' + ci); bp.buf.push(bp.grid[ri][ci]); if (bp.mode === 'row') { bp.mode = 'col'; bp.idx = ci; } else { bp.mode = 'row'; bp.idx = ri; } if (bp.buf.join(' ').includes(bp.seq.join(' '))) return finish(true); if (bp.buf.length >= 4) return finish(false); render(); };
    const close = () => br.classList.remove('on');
    const onKey = e => { if (e.key === 'Escape') close(); };
    const onMove = e => { city.mouse.x = e.clientX / W; };
    const onClick = e => {
      if (br.classList.contains('on') || !city.terminal || !city.terminal.hit || blocked(e)) return;
      const h = city.terminal.hit; if (e.clientX < h.x || e.clientX > h.x + h.w || e.clientY < h.y || e.clientY > h.y + h.h) return;
      const m = q('.cp-msg'); m.className = 'cp-msg'; m.textContent = 'Pick from the highlighted row. Then column, then row...'; q('.cp-time').textContent = '00:15';
      newPuzzle(); city.glitch = .6; br.classList.add('on');
    };
    q('.cp-x').onclick = close;
    return {
      animated: true,
      mount() { document.head.appendChild(css); document.body.appendChild(cv); document.body.appendChild(scan); document.body.appendChild(br); resize(); addEventListener('mousemove', onMove); addEventListener('click', onClick); addEventListener('keydown', onKey);
        timer = setInterval(() => { if (!bp.active || !bp.running) return; bp.timer -= .1; q('.cp-time').textContent = `00:${String(Math.max(0, Math.ceil(bp.timer))).padStart(2, '0')}`; if (bp.timer <= 0) finish(false); }, 100); },
      unmount() { removeEventListener('mousemove', onMove); removeEventListener('click', onClick); removeEventListener('keydown', onKey); clearInterval(timer); distort(0); cv.remove(); scan.remove(); br.remove(); css.remove(); },
      resize,
      setLevel(v) { cv.style.opacity = v; scan.style.opacity = v; },
      frame() {
        const now = performance.now(), dt = Math.min(.05, (now - last) / 1000), t = now / 1000; last = now;
        city.draw(t, dt);
        city.nextGlitch -= dt; if (city.nextGlitch <= 0 && city.glitch <= 0) { city.glitch = rand(.4, .8); city.nextGlitch = rand(10, 20); }
        if (city.glitch > 0) { drawGlitch(city.glitch); city.glitch -= dt * 2.5; }
        const v = city.virus;
        if (v) {
          v.t += dt; const { V_SPREAD, V_HEAL_AT, V_HEAL } = city.V;
          city.hacked = Math.min(1, v.t / V_SPREAD) * (v.t > V_HEAL_AT ? Math.max(0, 1 - (v.t - V_HEAL_AT) / V_HEAL) : 1);
          const front = v.t < V_HEAL_AT ? v.t / V_SPREAD * (W + 300) - 150 : (v.t - V_HEAL_AT) / V_HEAL * (W + 300) - 150;
          const env = Math.min(1, v.t / .3) * Math.max(0, Math.min(1, (city.V_END - v.t) / 1.2));
          if (front > -50 && front < W + 50) for (let k = 0; k < 6; k++) { cx.fillStyle = `rgba(200,8,20,${.35 * env})`; cx.fillRect(front + rand(-40, 20), rand(0, H), rand(20, 80), rand(2, 10)); }
          const peak = v.t < V_SPREAD ? Math.sin(v.t / V_SPREAD * Math.PI) : v.t > V_HEAL_AT && v.t < V_HEAL_AT + V_HEAL ? Math.sin((v.t - V_HEAL_AT) / V_HEAL * Math.PI) : 0;
          distort((.3 + .6 * peak) * env);
          if (v.t > city.V_END) { city.virus = null; city.hacked = 0; distort(0); }
        }
      }
    };
  }

  // ===================== Refined: stehende Szenen (als Vektorbild auf Bildschirmgroesse) =====================
  // Entworfen fuer 420x230 - wird gleichmaessig skaliert und mittig beschnitten (bleibt scharf)
  const cover = (draw, VW = 420, VH = 230) => (c, W, H) => { const s = Math.max(W / VW, H / VH); c.save(); c.translate((W - VW * s) / 2, (H - VH * s) / 2); c.scale(s, s); draw(c, VW, VH); c.restore(); };
  const cherryDraw = cover((c, W, H) => {
    const r = seeded(31);
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#120c2a'); g.addColorStop(.6, '#2a1a48'); g.addColorStop(1, '#3a2450');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let k = 0; k < 60; k++) { c.fillStyle = `rgba(255, 245, 255, ${.3 + r() * .6})`; c.beginPath(); c.arc(r() * W, r() * H * .6, r() * .9 + .2, 0, 7); c.fill(); }
    // Mond mit Hof
    const mx = W * .74, my = H * .3;
    const halo = c.createRadialGradient(mx, my, 20, mx, my, 90); halo.addColorStop(0, 'rgba(255, 220, 240, .28)'); halo.addColorStop(1, 'rgba(255, 220, 240, 0)');
    c.fillStyle = halo; c.fillRect(0, 0, W, H);
    const mg = c.createRadialGradient(mx - 6, my - 6, 2, mx, my, 26); mg.addColorStop(0, '#fffaf4'); mg.addColorStop(1, '#f2d8e4');
    c.fillStyle = mg; c.beginPath(); c.arc(mx, my, 26, 0, 7); c.fill();
    c.fillStyle = 'rgba(200, 170, 190, .35)'; [[-8, -4, 5], [6, 6, 4], [9, -9, 3]].forEach(([dx, dy, rr2]) => { c.beginPath(); c.arc(mx + dx, my + dy, rr2, 0, 7); c.fill(); });
    // ferne Huegel mit Pagode
    c.fillStyle = '#1e1436'; c.beginPath(); c.moveTo(0, H * .78); for (let x = 0; x <= W; x += 10) c.lineTo(x, H * .74 + Math.sin(x * .015) * 10 + Math.sin(x * .04) * 4); c.lineTo(W, H); c.lineTo(0, H); c.fill();
    const px = W * .3, py = H * .72; c.fillStyle = '#160e2a';
    for (let k = 0; k < 3; k++) { const w = 26 - k * 6, y = py - k * 14; c.fillRect(px - w * .35, y - 10, w * .7, 10); c.beginPath(); c.moveTo(px - w * .7, y - 8); c.quadraticCurveTo(px, y - 18, px + w * .7, y - 8); c.lineTo(px + w * .5, y - 12); c.lineTo(px - w * .5, y - 12); c.fill(); }
    c.fillRect(px - 1, py - 52, 2, 10);
    c.fillStyle = 'rgba(255, 200, 120, .9)'; c.fillRect(px - 3, py - 8, 2, 3); c.fillRect(px + 2, py - 22, 2, 3);
    // Wasser mit Mondspiegelung
    c.fillStyle = '#140c26'; c.fillRect(0, H * .84, W, H * .16);
    for (let k = 0; k < 9; k++) { const y = H * .86 + k * 3.5, w = 30 - k * 2.5; c.fillStyle = `rgba(255, 225, 240, ${.5 - k * .045})`; c.fillRect(mx - w / 2 + Math.sin(k * 2) * 4, y, w, 1.2); }
    // Kirschbaum: Ast von links oben, Bluetenwolken
    const branch = (x0, y0, x1, y1, w) => { c.strokeStyle = '#1a0e1a'; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 10, x1, y1); c.stroke(); };
    branch(-10, H * .1, W * .42, H * .26, 7); branch(W * .14, H * .17, W * .26, H * .42, 4); branch(W * .3, H * .22, W * .5, H * .12, 3); branch(W * .06, H * .14, W * .1, -5, 4);
    const blossoms = (cx, cy, n, rad) => { for (let k = 0; k < n; k++) { const a = r() * 6.28, d = r() * rad, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .7, s = 2 + r() * 2.5;
      c.fillStyle = r() < .5 ? '#ffc8dc' : r() < .5 ? '#ff9ec2' : '#ffe4ee';
      for (let p = 0; p < 5; p++) { const pa = p / 5 * 6.28 + a; c.beginPath(); c.ellipse(x + Math.cos(pa) * s * .7, y + Math.sin(pa) * s * .7, s * .6, s * .4, pa, 0, 7); c.fill(); }
      c.fillStyle = '#c8406a'; c.beginPath(); c.arc(x, y, s * .25, 0, 7); c.fill(); } };
    [[W * .1, H * .12, 40, 30], [W * .26, H * .2, 45, 34], [W * .42, H * .25, 30, 24], [W * .25, H * .42, 26, 20], [W * .5, H * .12, 24, 20], [W * .05, H * .02, 26, 24]].forEach(([x, y, n, rad]) => blossoms(x, y, n, rad));
    // fallende Bluetenblaetter (stehend)
    for (let k = 0; k < 26; k++) { const x = r() * W, y = H * (.2 + r() * .7); c.save(); c.translate(x, y); c.rotate(r() * 6.28); c.fillStyle = `rgba(255, 190, 215, ${.5 + r() * .4})`; c.beginPath(); c.ellipse(0, 0, 3, 1.6, 0, 0, 7); c.fill(); c.restore(); }
    // Laterne rechts unten
    const lx = W * .9, ly = H * .7; const lg = c.createRadialGradient(lx, ly, 2, lx, ly, 34); lg.addColorStop(0, 'rgba(255, 190, 110, .45)'); lg.addColorStop(1, 'rgba(255, 190, 110, 0)');
    c.fillStyle = lg; c.beginPath(); c.arc(lx, ly, 34, 0, 7); c.fill();
    c.fillStyle = '#1a1020'; c.fillRect(lx - 2, ly + 8, 4, 40); c.fillRect(lx - 9, ly - 12, 18, 3);
    c.fillStyle = '#ffcf8a'; c.fillRect(lx - 6, ly - 9, 12, 16); c.fillStyle = '#1a1020'; c.fillRect(lx - 7, ly + 7, 14, 3);
  });
  const arcticDraw = cover((c, W, H) => {
    const r = seeded(47);
    const g = c.createLinearGradient(0, 0, 0, H * .6); g.addColorStop(0, '#5a6aa8'); g.addColorStop(.55, '#c8a0c0'); g.addColorStop(1, '#f6d0b8');
    c.fillStyle = g; c.fillRect(0, 0, W, H * .6);
    // tiefe Sonne knapp am Horizont
    const sun = c.createRadialGradient(W * .62, H * .58, 2, W * .62, H * .58, 70); sun.addColorStop(0, 'rgba(255, 240, 220, .95)'); sun.addColorStop(.15, 'rgba(255, 220, 200, .6)'); sun.addColorStop(1, 'rgba(255, 210, 200, 0)');
    c.fillStyle = sun; c.fillRect(0, 0, W, H * .6);
    // ferne Gletscherberge
    c.fillStyle = '#9aa8cc'; c.beginPath(); c.moveTo(0, H * .6); [[0, .5], [.08, .44], [.16, .52], [.25, .4], [.34, .5], [.42, .47], [.5, .56], [.8, .55], [.86, .45], [.93, .5], [1, .46], [1, .6]].forEach(([x, y]) => c.lineTo(W * x, H * y)); c.fill();
    c.fillStyle = 'rgba(255, 255, 255, .55)'; c.beginPath(); c.moveTo(W * .25, H * .4); c.lineTo(W * .29, H * .45); c.lineTo(W * .27, H * .44); c.lineTo(W * .22, H * .44); c.fill();
    // Meer
    const sea = c.createLinearGradient(0, H * .6, 0, H); sea.addColorStop(0, '#8a94bc'); sea.addColorStop(1, '#2a3a5e'); c.fillStyle = sea; c.fillRect(0, H * .6, W, H * .4);
    c.fillStyle = 'rgba(255, 230, 215, .5)'; for (let k = 0; k < 10; k++) { const w = 40 - k * 3; c.fillRect(W * .62 - w / 2 + Math.sin(k * 3) * 5, H * .62 + k * 3.2, w, 1.2); }
    // Eisberge mit Licht- und Schattenseite + Spiegelung
    const berg = (x, base, w, h) => {
      const top = [x + w * .45, base - h], L = [x, base], Rt = [x + w, base], mid = [x + w * .6, base - h * .45];
      c.fillStyle = '#eef6ff'; c.beginPath(); c.moveTo(...L); c.lineTo(...top); c.lineTo(...mid); c.lineTo(x + w * .55, base); c.fill();
      c.fillStyle = '#9ab8d8'; c.beginPath(); c.moveTo(...top); c.lineTo(...Rt); c.lineTo(x + w * .55, base); c.lineTo(...mid); c.fill();
      c.strokeStyle = 'rgba(255, 255, 255, .8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(...L); c.lineTo(...top); c.stroke();
      c.fillStyle = 'rgba(120, 180, 220, .35)'; c.beginPath(); c.moveTo(x + w * .1, base); c.lineTo(x + w * .45, base + h * .45); c.lineTo(x + w * .9, base); c.fill();
    };
    berg(W * .08, H * .7, 70, 40); berg(W * .78, H * .68, 50, 26); berg(W * .5, H * .66, 30, 14);
    // Ufer mit Schnee und Steinen vorn
    c.fillStyle = '#e8f0fa'; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H * .86); for (let x = 0; x <= W; x += 12) c.lineTo(x, H * .88 + Math.sin(x * .03) * 4 + r() * 2); c.lineTo(W, H); c.fill();
    c.fillStyle = 'rgba(150, 180, 220, .5)'; for (let x = 0; x <= W; x += 30) { c.beginPath(); c.ellipse(x + r() * 10, H * .95, 14, 2, 0, 0, 7); c.fill(); }
    for (let k = 0; k < 6; k++) { const x = r() * W, y = H * (.88 + r() * .08); c.fillStyle = '#3a4a62'; c.beginPath(); c.ellipse(x, y, 6 + r() * 6, 3 + r() * 2, 0, Math.PI, 0); c.fill(); c.fillStyle = '#f4f8ff'; c.beginPath(); c.ellipse(x, y - 2, 5 + r() * 4, 1.6, 0, Math.PI, 0); c.fill(); }
  });
  function staticScene(draw) {
    return () => {
      const cv = fullCanvas(); cv.style.opacity = '1'; const c = cv.getContext('2d');
      const resize = () => { const d = Math.min(2, devicePixelRatio || 1), W = innerWidth, H = innerHeight; cv.width = W * d; cv.height = H * d; c.setTransform(d, 0, 0, d, 0, 0); draw(c, W, H); };
      return { animated: false, mount() { document.body.appendChild(cv); addEventListener('resize', resize); resize(); }, unmount() { removeEventListener('resize', resize); cv.remove(); }, resize, setLevel() {}, frame() {} };
    };
  }

  // ===================== Shop-Vorschauen =====================
  // Shader-Standbild bzw. -Livebild in eine kleine Canvas (eigener WebGL-Kontext)
  function shaderInto(fs, cv, W, H, uniforms, once) {
    const off = document.createElement('canvas'); let G = null; try { G = gl1(off, fs); } catch (e) {} if (!G) return null;
    G.size(Math.max(2, Math.round(W)), Math.max(2, Math.round(H)));
    const c = cv.getContext('2d');
    return t => { G.gl.uniform2f(G.U('R'), off.width, off.height); G.gl.uniform1f(G.U('T'), t); if (uniforms) uniforms(G); G.draw(); c.clearRect(0, 0, W, H); c.drawImage(off, 0, 0, W, H); if (once) { const x = G.gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } };
  }
  const SHADER_PV = { magma: SH.magma, magmaplus: SH.magma, aurora: SH.aurora, lanterns: SH.lanterns, skyisles: SH.skyisles };
  const PV = window.TTPThemePV || {};
  Object.entries(SHADER_PV).forEach(([key, fs]) => { PV[key] = c => { const cvs = c.canvas, f = shaderInto(fs, cvs, cvs.width, cvs.height, null, true); if (f) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); f(12); c.restore(); } }; });
  PV.cherry = (c, W, H) => cherryDraw(c, W, H);
  PV.arctic = (c, W, H) => arcticDraw(c, W, H);
  PV.cyberpunk = (c, W, H) => cyberStill(c, W, H);
  window.TTPThemePV = PV;
  window.TTPThemeLiveExtra = window.TTPThemeLiveExtra || {};
  Object.entries(SHADER_PV).forEach(([key, fs]) => {
    window.TTPThemeLiveExtra[key] = (cv, W, H) => {
      const d = Math.min(2, devicePixelRatio || 1); cv.width = W * d; cv.height = H * d;
      const f = shaderInto(fs, cv, cv.width, cv.height); if (!f) return () => {};
      let raf = 0; const step = now => { f(now / 1000); raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    };
  });

  const R = window.TTPThemeFx.register;
  R('magma', magmaScene); R('magmaplus', magmaPlusScene); R('cyberpunk', cyberScene);
  R('aurora', aurora); R('lanterns', lanterns); R('skyisles', skyisles);
  R('cherry', staticScene(cherryDraw)); R('arctic', staticScene(arcticDraw));
})();
