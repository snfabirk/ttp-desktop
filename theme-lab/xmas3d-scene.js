// Stufe 30 "Christmas Eve" (v2, echtes 3D mit Three.js): verschneiter Dorfplatz
// bei Nacht. Grosser Tannenbaum (Astebenen + Nadel-Buesche + Schneespitzen,
// spiegelnde Kugeln, Lichter, Stern), 3D-Haeuser mit Schneedaechern und warmen
// Fenstern, Lichterketten, Laternen mit echtem Licht, Geschenke, Wald, Mond mit
// Schatten, Nebel, Bloom, fallender 3D-Schnee, Kamera schwebt + folgt der Maus,
// warmes Licht an der Maus auf dem Schnee. Easter Egg: 5x auf den Stern.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const canvas = document.getElementById('xmas3d');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a1128, 0.017);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);

// Spiegelungen fuer Kugeln
const pmrem = new THREE.PMREMGenerator(renderer);
const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

// ---------- Zufall (deterministisch) ----------
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

// ---------- Himmel ----------
const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {},
  vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
  fragmentShader: `varying vec3 vP; void main(){ float h = vP.y;
    vec3 top = vec3(.01,.015,.05), mid = vec3(.035,.05,.13), hor = vec3(.13,.09,.19);
    vec3 c = mix(hor, mid, smoothstep(-.02,.25,h)); c = mix(c, top, smoothstep(.25,.85,h));
    gl_FragColor = vec4(c,1.); }`
}));
scene.add(sky);
{ // Sterne
  const n = 900, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = rnd() * 6.283, b = 0.12 + rnd() * 1.3; const r = 190;
    pos.set([Math.cos(a) * Math.cos(b) * r, Math.sin(b) * r, Math.sin(a) * Math.cos(b) * r], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true, fog: false, transparent: true, opacity: 0.85 })));
}
// Mond + Mondlicht (wirft Schatten)
const moonDir = new THREE.Vector3(-0.75, 0.42, -0.5).normalize();
const moon = new THREE.Mesh(new THREE.SphereGeometry(7, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.5, 1.25), fog: false }));
moon.position.copy(moonDir.clone().multiplyScalar(170)); scene.add(moon);
const moonLight = new THREE.DirectionalLight(0x9fb8ff, 0.55);
moonLight.position.copy(moonDir.clone().multiplyScalar(60)); moonLight.castShadow = true;
moonLight.shadow.mapSize.set(2048, 2048);
Object.assign(moonLight.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 140 });
moonLight.shadow.bias = -0.0005;
scene.add(moonLight);
scene.add(new THREE.HemisphereLight(0x3a4c8a, 0x2a1a14, 0.26));

// ---------- Schneeboden (leicht wellig) ----------
const groundG = new THREE.PlaneGeometry(260, 260, 160, 160); groundG.rotateX(-Math.PI / 2);
{ const p = groundG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i);
  p.setY(i, Math.sin(x * 0.13) * 0.18 + Math.cos(z * 0.11) * 0.2 + Math.sin((x + z) * 0.37) * 0.06 + Math.max(0, (Math.hypot(x, z) - 40) * 0.05)); }
  groundG.computeVertexNormals(); }
const snowMat = new THREE.MeshStandardMaterial({ color: 0xe8eef8, roughness: 0.85, metalness: 0 });
const ground = new THREE.Mesh(groundG, snowMat); ground.receiveShadow = true; scene.add(ground);
{ // Glitzer im Schnee
  const n = 2500, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const r = Math.sqrt(rnd()) * 38, a = rnd() * 6.283; pos.set([Math.cos(a) * r, 0.25, Math.sin(a) * r + 2], i * 3); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: new THREE.Color(2.2, 2.2, 2.4), size: 0.06, transparent: true, opacity: 0.8 })));
}

// ---------- Weihnachtsbaum ----------
const tree = new THREE.Group(); tree.position.set(7, 0, 0); tree.scale.setScalar(0.8); scene.add(tree); // Stern bleibt unter den Karten sichtbar
const TREE_H = 11.5;
const needleMat = new THREE.MeshStandardMaterial({ color: 0x1c4a2a, roughness: 0.9, flatShading: true });
const snowTipMat = new THREE.MeshStandardMaterial({ color: 0xf2f6ff, roughness: 0.8 });
// Stamm
const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0x3a2414, roughness: 1 }));
trunk.position.y = 1.1; trunk.castShadow = true; tree.add(trunk);
// Astebenen: gezackte Kegel
const TIERS = 9;
for (let i = 0; i < TIERS; i++) {
  const t = i / TIERS, y = 1.6 + t * (TREE_H - 2.6), r = 4.3 * (1 - t) + 0.5, h = 2.4 - t * 0.9;
  const g = new THREE.ConeGeometry(r, h, 28, 3, true);
  const p = g.attributes.position;
  for (let k = 0; k < p.count; k++) { const yy = p.getY(k); if (yy < -h / 2 + 0.01) { const ang = Math.atan2(p.getZ(k), p.getX(k)); const j = 1 + 0.16 * Math.sin(ang * 14 + i) + 0.08 * Math.sin(ang * 31);
      p.setX(k, p.getX(k) * j); p.setZ(k, p.getZ(k) * j); p.setY(k, yy - 0.25 * Math.abs(Math.sin(ang * 14 + i))); } }
  g.computeVertexNormals();
  const cone = new THREE.Mesh(g, needleMat); cone.position.y = y + h / 2; cone.rotation.y = i * 0.7; cone.castShadow = true; cone.receiveShadow = true; tree.add(cone);
  // Schnee auf den Spitzen der Ebene
  const sg = new THREE.TorusGeometry(r * 0.86, 0.09, 6, 40); sg.rotateX(Math.PI / 2);
  const sp = sg.attributes.position; for (let k = 0; k < sp.count; k++) { const ang = Math.atan2(sp.getZ(k), sp.getX(k)); sp.setY(k, sp.getY(k) + 0.12 * Math.sin(ang * 14 + i)); }
  const sm = new THREE.Mesh(sg, snowTipMat); sm.position.y = y + 0.22; tree.add(sm);
}
// Nadel-Buesche fuer Fuelle (Instanced)
{ const bushG = new THREE.ConeGeometry(0.32, 0.9, 6); bushG.rotateX(Math.PI / 2);
  const N = 900, inst = new THREE.InstancedMesh(bushG, new THREE.MeshStandardMaterial({ color: 0x24603a, roughness: 0.9, flatShading: true }), N);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), up = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i < N; i++) { const yy = 1.5 + rnd() * (TREE_H - 2.5), t = (yy - 1.5) / (TREE_H - 2.5), r = (4.3 * (1 - t) + 0.4) * (0.82 + rnd() * 0.18), a = rnd() * 6.283;
    v.set(Math.cos(a) * r, yy, Math.sin(a) * r);
    const dir = new THREE.Vector3(Math.cos(a), -0.35, Math.sin(a)).normalize();
    q.setFromUnitVectors(up, dir); s.setScalar(0.8 + rnd() * 0.7); m.compose(v, q, s); inst.setMatrixAt(i, m);
    inst.setColorAt(i, new THREE.Color().setHSL(0.36 + rnd() * 0.04, 0.45, 0.14 + rnd() * 0.12)); }
  inst.castShadow = true; tree.add(inst); }
// Lichter (Spirale) - hell fuer Bloom
const LIGHT_COLORS = [[2.6, 1.7, 0.6], [2.6, 0.9, 0.5], [2.4, 2.2, 1.6], [0.8, 1.7, 2.8], [2.6, 0.7, 1.2]];
const lightG = new THREE.SphereGeometry(0.075, 8, 6);
const N_LIGHTS = 330, lights = new THREE.InstancedMesh(lightG, new THREE.MeshBasicMaterial(), N_LIGHTS);
const lightData = [];
{ const m = new THREE.Matrix4();
  for (let i = 0; i < N_LIGHTS; i++) { const strand = i % 3, t = Math.floor(i / 3) / (N_LIGHTS / 3); const yy = 1.7 + t * (TREE_H - 2.4), r = (4.3 * (1 - (yy - 1.5) / (TREE_H - 2.5)) + 0.45) * 0.97, a = t * 6.283 * 6 + strand * 2.094;
    m.setPosition(Math.cos(a) * r, yy, Math.sin(a) * r); lights.setMatrixAt(i, m);
    const c = LIGHT_COLORS[i % LIGHT_COLORS.length]; lightData.push({ t, c }); lights.setColorAt(i, new THREE.Color(c[0], c[1], c[2])); }
  tree.add(lights); }
// Kugeln (spiegelnd)
const ORN_COLORS = [0xb8231f, 0xd9a43a, 0x1f4f8a, 0xc23a7a, 0xe8e2d4, 0x2f7a3c];
for (let i = 0; i < 70; i++) { const yy = 2 + rnd() * (TREE_H - 3.6), t = (yy - 1.5) / (TREE_H - 2.5), r = (4.3 * (1 - t) + 0.45) * 0.96, a = rnd() * 6.283;
  const s = 0.16 + rnd() * 0.12;
  const orn = new THREE.Mesh(new THREE.SphereGeometry(s, 20, 14), new THREE.MeshStandardMaterial({ color: ORN_COLORS[i % ORN_COLORS.length], metalness: 0.85, roughness: 0.18, envMap: envTex, envMapIntensity: 1.2 }));
  orn.position.set(Math.cos(a) * r, yy - 0.15, Math.sin(a) * r); orn.castShadow = true; tree.add(orn); }
// Stern
const starShape = new THREE.Shape();
for (let k = 0; k < 10; k++) { const a = Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 0.28 : 0.68; const x = Math.cos(a) * r, y = Math.sin(a) * r; k ? starShape.lineTo(x, y) : starShape.moveTo(x, y); }
const starMat = new THREE.MeshStandardMaterial({ color: 0xffd86a, emissive: new THREE.Color(1.8, 1.25, 0.35), emissiveIntensity: 1.6, metalness: 0.6, roughness: 0.3 });
const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2 }), starMat);
star.geometry.center(); star.position.y = TREE_H + 0.55; tree.add(star);
const starLight = new THREE.PointLight(0xffd27a, 18, 14, 1.6); starLight.position.y = TREE_H + 0.4; tree.add(starLight);
const treeLight = new THREE.PointLight(0xffb070, 40, 22, 1.5); treeLight.position.set(0, 5, 3); tree.add(treeLight);

// ---------- Geschenke ----------
function gift(x, z, w, h, d, c1, c2, rot) {
  const g = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: c1, roughness: 0.55 }));
  box.position.y = h / 2; box.castShadow = true; box.receiveShadow = true; g.add(box);
  const rib = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.3, metalness: 0.4, envMap: envTex });
  const r1 = new THREE.Mesh(new THREE.BoxGeometry(w * 1.02, h * 1.02, d * 0.14), rib); r1.position.y = h / 2; g.add(r1);
  const r2 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.14, h * 1.02, d * 1.02), rib); r2.position.y = h / 2; g.add(r2);
  const bow = new THREE.Mesh(new THREE.TorusKnotGeometry(0.1, 0.035, 40, 6, 2, 3), rib); bow.position.y = h + 0.08; bow.scale.set(1.3, 0.7, 1.3); g.add(bow);
  g.position.set(x, 0, z); g.rotation.y = rot; return g;
}
[[4.1, 3.4, 1.1, 0.8, 1.1, 0xb8231f, 0xf2c25a, 0.3], [5.8, 4.2, 0.8, 0.6, 0.8, 0x1f4f8a, 0xe8e0d0, -0.4], [8.7, 3.8, 1.2, 0.9, 0.9, 0x2f7a3c, 0xd2231f, 0.6], [10.1, 2.4, 0.7, 1.0, 0.7, 0xe8b64a, 0xb8231f, -0.2], [5.1, 2.2, 0.6, 0.45, 0.6, 0xc23a7a, 0xf2c25a, 0.9], [7.5, 4.6, 0.7, 0.5, 0.7, 0xe8e2d4, 0xb8231f, 0.1]]
  .forEach(a => tree.parent.add(gift(...a)));

// ---------- Haeuser ----------
const WINDOW = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.55, 0.6) });
const FRAME = new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 1 });
function house(x, z, w, d, h, color, rot, roofColor = 0x3a2420) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.9 }));
  body.position.y = h / 2; body.castShadow = true; body.receiveShadow = true; g.add(body);
  // Dach: Prisma
  const rs = new THREE.Shape(); rs.moveTo(-w / 2 - 0.35, 0); rs.lineTo(0, h * 0.62); rs.lineTo(w / 2 + 0.35, 0); rs.lineTo(-w / 2 - 0.35, 0);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: d + 0.6, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.9 }));
  roof.position.set(0, h, -d / 2 - 0.3); roof.castShadow = true; g.add(roof);
  // Schnee auf dem Dach (zwei leicht dickere Platten)
  const slope = Math.atan2(h * 0.62, w / 2 + 0.35), len = Math.hypot(h * 0.62, w / 2 + 0.35);
  [-1, 1].forEach(side => { const sn = new THREE.Mesh(new THREE.BoxGeometry(len + 0.1, 0.22, d + 0.7), snowMat);
    sn.position.set(side * (w / 4 + 0.17), h + h * 0.31 + 0.1, 0); sn.rotation.z = -side * slope; sn.castShadow = true; g.add(sn); });
  // Kamin
  const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), new THREE.MeshStandardMaterial({ color: 0x5a3a30, roughness: 1 }));
  ch.position.set(w * 0.25, h + h * 0.55, -d * 0.15); ch.castShadow = true; g.add(ch);
  const chs = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.62), snowMat); chs.position.set(w * 0.25, h + h * 0.55 + 0.74, -d * 0.15); g.add(chs);
  // Fenster vorne (leuchtend) + Sprossen
  const nWin = Math.max(2, Math.round(w / 1.6));
  for (let i = 0; i < nWin; i++) { const wx = -w / 2 + (i + 0.5) * (w / nWin); if (nWin > 2 && i === Math.floor(nWin / 2)) continue;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), WINDOW); win.position.set(wx, h * 0.58, d / 2 + 0.01); g.add(win);
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.05, 0.05), FRAME); f1.position.set(wx, h * 0.58, d / 2 + 0.03); g.add(f1);
    const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.82, 0.05), FRAME); f2.position.set(wx, h * 0.58, d / 2 + 0.03); g.add(f2);
    const sill = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.18), snowMat); sill.position.set(wx, h * 0.58 - 0.45, d / 2 + 0.08); g.add(sill); }
  // Tuer mit Kranz
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1.4, 0.08), new THREE.MeshStandardMaterial({ color: 0x5a2416, roughness: 0.8 }));
  door.position.set(nWin > 2 ? -w / 2 + (Math.floor(nWin / 2) + 0.5) * (w / nWin) : 0, 0.7, d / 2 + 0.03); g.add(door);
  const wreath = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.07, 8, 20), new THREE.MeshStandardMaterial({ color: 0x1f5a2a, roughness: 0.9 })); wreath.position.set(door.position.x, 1.05, d / 2 + 0.1); g.add(wreath);
  const berry = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshStandardMaterial({ color: 0xd2231f, emissive: 0x400000 })); berry.position.set(door.position.x, 0.86, d / 2 + 0.14); g.add(berry);
  // warmer Schein vor dem Haus
  const glow = new THREE.PointLight(0xffb060, 6, 7, 1.8); glow.position.set(0, h * 0.5, d / 2 + 1.2); g.add(glow);
  g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  return g;
}
const houses = [
  house(-14, -9, 4.4, 3.6, 3.4, 0x6b4a3a, 0.35), house(-8.5, -12, 5.2, 4, 4.2, 0x8a6a52, 0.15, 0x2a2a3a),
  house(-2, -14, 4.2, 3.6, 3.6, 0x5a6a7a, 0.0), house(4.5, -15, 5, 4, 4.6, 0x7a4a3a, -0.1, 0x2a2030),
  house(11, -13, 4.4, 3.8, 3.8, 0x6a5a4a, -0.3), house(16.5, -8.5, 4, 3.4, 3.2, 0x5a4a5a, -0.55),
  house(-19, -3, 3.8, 3.4, 3.0, 0x7a5a4a, 0.8)
];

// ---------- Lichterketten zwischen Haeusern ----------
const strLights = [];
{ const pts = [[-12.3, 3.6, -7.5], [-6.5, 4.4, -9.8], [-0.4, 3.9, -12], [6.6, 4.6, -12.8], [12.8, 4, -11], [17, 3.4, -6.6]];
  const geo = new THREE.SphereGeometry(0.06, 6, 4), N = 180;
  const inst = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial(), N); const m = new THREE.Matrix4();
  let k = 0;
  for (let s = 0; s < pts.length - 1 && k < N; s++) { const a = new THREE.Vector3(...pts[s]), b = new THREE.Vector3(...pts[s + 1]);
    const n = Math.floor(N / (pts.length - 1));
    for (let i = 0; i < n && k < N; i++, k++) { const t = i / n; const p = a.clone().lerp(b, t); p.y -= Math.sin(t * Math.PI) * 1.1;
      m.setPosition(p); inst.setMatrixAt(k, m); const c = LIGHT_COLORS[k % 4]; inst.setColorAt(k, new THREE.Color(...c)); strLights.push({ x: p.x, c }); } }
  inst.count = k; scene.add(inst); window.__str = inst; }

// ---------- Laternen ----------
function lamp(x, z) {
  const g = new THREE.Group(); const iron = new THREE.MeshStandardMaterial({ color: 0x1a1d24, metalness: 0.6, roughness: 0.5 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 3.4, 8), iron); pole.position.y = 1.7; pole.castShadow = true; g.add(pole);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.42), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.8, 0.8) })); head.position.y = 3.55; g.add(head);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.32, 4), iron); cap.position.y = 3.98; cap.rotation.y = Math.PI / 4; g.add(cap);
  const capSnow = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.16, 4), snowMat); capSnow.position.y = 4.1; capSnow.rotation.y = Math.PI / 4; g.add(capSnow);
  const l = new THREE.PointLight(0xffc070, 14, 11, 1.7); l.position.y = 3.4; l.castShadow = false; g.add(l);
  g.position.set(x, 0, z); scene.add(g);
}
lamp(-5, 1.5); lamp(-12, -2); lamp(12, -3);

// ---------- Wald im Hintergrund ----------
{ const g = new THREE.ConeGeometry(1.4, 5, 7); g.translate(0, 2.5, 0);
  const N = 160, inst = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: 0x0e2a1a, roughness: 1, flatShading: true }), N);
  const snowG = new THREE.ConeGeometry(0.75, 1.5, 7); snowG.translate(0, 4.4, 0);
  const instS = new THREE.InstancedMesh(snowG, snowMat, N); const m = new THREE.Matrix4(), s = new THREE.Vector3(), q = new THREE.Quaternion();
  for (let i = 0; i < N; i++) { const a = -2.6 + rnd() * 5.2 - Math.PI / 2, r = 26 + rnd() * 26; const p = new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (p.z > 6) p.z = -p.z; s.setScalar(0.7 + rnd() * 1.1); m.compose(p, q, s); inst.setMatrixAt(i, m); instS.setMatrixAt(i, m); }
  inst.castShadow = true; scene.add(inst); scene.add(instS); }

// ---------- Fallender Schnee (Shader, 3D) ----------
const SNOW_N = 4500;
const snowGeo = new THREE.BufferGeometry();
{ const p = new Float32Array(SNOW_N * 3), r = new Float32Array(SNOW_N);
  for (let i = 0; i < SNOW_N; i++) { p.set([(rnd() - 0.5) * 70, rnd() * 30, (rnd() - 0.5) * 60], i * 3); r[i] = rnd(); }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(p, 3)); snowGeo.setAttribute('aR', new THREE.BufferAttribute(r, 1)); }
const snowFall = new THREE.Points(snowGeo, new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uT: { value: 0 }, uWind: { value: 0 } },
  vertexShader: `attribute float aR; uniform float uT; uniform float uWind; varying float vA;
    void main(){ vec3 p = position; float sp = .8 + aR * 1.6;
      p.y = mod(p.y - uT * sp, 30.);
      p.x += sin(uT * .6 + aR * 30.) * .6 + uWind * (30. - p.y) * .05;
      p.z += cos(uT * .5 + aR * 20.) * .4;
      vec4 mv = modelViewMatrix * vec4(p, 1.); gl_Position = projectionMatrix * mv;
      gl_PointSize = (2. + aR * 3.5) * (60. / -mv.z); vA = .55 + aR * .45; }`,
  fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(1., 1., 1., vA * smoothstep(.5, .1, d)); }`
}));
scene.add(snowFall);

// ---------- Warmes Licht an der Maus (Laterne in der Hand) ----------
const handLight = new THREE.PointLight(0xffb36a, 0, 10, 1.6); scene.add(handLight);
let handTarget = 0;

// ---------- Post-Processing (Bloom) ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 0.82);
composer.addPass(bloom);
composer.addPass(new OutputPass());

function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
resize(); addEventListener('resize', resize);

// ---------- Kamera + Maus ----------
const mouse = new THREE.Vector2(), ray = new THREE.Raycaster();
let mx = 0, my = 0, tmx = 0, tmy = 0;
addEventListener('mousemove', e => { tmx = e.clientX / innerWidth * 2 - 1; tmy = e.clientY / innerHeight * 2 - 1; mouse.set(tmx, -tmy); handTarget = 1;
  document.getElementById('warm').style.setProperty('--mx', e.clientX + 'px'); document.getElementById('warm').style.setProperty('--my', e.clientY + 'px'); document.getElementById('warm').classList.add('on'); });
document.addEventListener('mouseleave', () => { handTarget = 0; tmx = 0; tmy = 0; document.getElementById('warm').classList.remove('on'); });
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.8), hit = new THREE.Vector3();

// ---------- Easter Egg ----------
let hits = 0, egg = null; const fw = { pts: null, vel: null, life: 0 };
const sleigh = new THREE.Group(); sleigh.visible = false; scene.add(sleigh);
{ const dark = new THREE.MeshBasicMaterial({ color: 0x07050c, fog: false });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1), dark); sleigh.add(body);
  const run = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.08, 6, 20, Math.PI), dark); run.rotation.z = Math.PI; run.position.y = -0.2; run.scale.y = 0.3; sleigh.add(run);
  for (let i = 0; i < 4; i++) { const d = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.5, 0.4), dark); d.add(b);
    const hd = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.45, 0.3), dark); hd.position.set(0.6, 0.4, 0); d.add(hd);
    const an = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.4), dark); an.position.set(0.6, 0.75, 0); d.add(an);
    for (const lx of [-0.4, 0.4]) { const lg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), dark); lg.position.set(lx, -0.45, 0); d.add(lg); }
    d.position.set(-2.4 - i * 1.6, 0.2 + i * 0.12, 0); sleigh.add(d); } }
const trail = []; const trailGeo = new THREE.BufferGeometry(); const TRAIL_N = 400;
trailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL_N * 3), 3));
const trailPts = new THREE.Points(trailGeo, new THREE.PointsMaterial({ color: new THREE.Color(3, 2.2, 0.8), size: 0.35, transparent: true, opacity: 0.9, fog: false })); scene.add(trailPts);

addEventListener('click', e => {
  const m = new THREE.Vector2(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1));
  ray.setFromCamera(m, camera);
  if (!ray.intersectObject(star).length) return;
  star.scale.setScalar(1.3); setTimeout(() => star.scale.setScalar(1), 160);
  if (egg || ++hits < 5) return; hits = 0; egg = { t0: performance.now() };
});

// ---------- Animation ----------
const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime(), now = performance.now();
  mx += (tmx - mx) * 0.03; my += (tmy - my) * 0.03;
  // Kamera schwebt langsam + folgt der Maus
  const yaw = Math.sin(t * 0.07) * 0.12 + mx * 0.22, pitch = 0.16 + my * 0.05;
  const dist = 27;
  camera.position.set(Math.sin(yaw) * dist - 1, 3.2 + pitch * 8 + Math.sin(t * 0.11) * 0.3, Math.cos(yaw) * dist + 2);
  camera.lookAt(1.5, 9.2, -2);
  tree.rotation.y += egg ? 0 : 0.0016;
  star.rotation.y = t * 0.8;
  // Lichter-Welle die Spirale hoch
  const col = new THREE.Color(), gold = egg ? Math.min(1, Math.max(0, (now - egg.t0 - 1400) / 600)) : 0;
  const cascade = egg && now - egg.t0 < 1400 ? (now - egg.t0) / 1400 : -1;
  for (let i = 0; i < N_LIGHTS; i++) { const d = lightData[i]; let b = 0.45 + 0.55 * Math.sin(t * 2.2 - d.t * 30);
    if (cascade >= 0) b = Math.max(b, 1 - Math.abs(d.t - cascade) * 6);
    const c = gold > 0 ? [3, 2.2, 0.7] : d.c; col.setRGB(c[0] * (0.25 + b), c[1] * (0.25 + b), c[2] * (0.25 + b)); lights.setColorAt(i, col); }
  lights.instanceColor.needsUpdate = true;
  if (window.__str) { for (let i = 0; i < strLights.length; i++) { const s = strLights[i], b = 0.5 + 0.5 * Math.sin(t * 2.5 - s.x * 0.6); col.setRGB(s.c[0] * (0.3 + b), s.c[1] * (0.3 + b), s.c[2] * (0.3 + b)); window.__str.setColorAt(i, col); } window.__str.instanceColor.needsUpdate = true; }
  starLight.intensity = 16 + Math.sin(t * 3) * 3 + gold * 30;
  // Schnee
  snowFall.material.uniforms.uT.value = t; snowFall.material.uniforms.uWind.value = Math.sin(t * 0.2) * 1.5;
  // Laterne an der Maus
  ray.setFromCamera(mouse, camera);
  if (ray.ray.intersectPlane(groundPlane, hit)) handLight.position.set(hit.x, 1.6, hit.z);
  handLight.intensity += ((handTarget ? 14 : 0) - handLight.intensity) * 0.06;
  // Easter Egg
  if (egg) {
    const e = now - egg.t0;
    if (e > 1400 && e < 3600) tree.rotation.y += 0.004 + Math.pow((e - 1400) / 2200, 2) * 0.12;
    if (e > 3600 && !egg.burst) { egg.burst = true;
      const n = 900, pos = new Float32Array(n * 3), vel = []; const sp = new THREE.Vector3(); star.getWorldPosition(sp);
      for (let i = 0; i < n; i++) { pos.set([sp.x, sp.y, sp.z], i * 3); const a = Math.random() * 6.283, b = Math.acos(2 * Math.random() - 1), v = 0.06 + Math.random() * 0.12;
        vel.push(new THREE.Vector3(Math.sin(b) * Math.cos(a) * v, Math.cos(b) * v + 0.05, Math.sin(b) * Math.sin(a) * v)); }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      fw.pts = new THREE.Points(g, new THREE.PointsMaterial({ color: new THREE.Color(3, 2.1, 0.7), size: 0.16, transparent: true, opacity: 1 })); fw.vel = vel; fw.life = 1; scene.add(fw.pts);
      sleigh.visible = true; egg.s0 = now; }
    if (fw.pts) { const p = fw.pts.geometry.attributes.position; for (let i = 0; i < fw.vel.length; i++) { const v = fw.vel[i]; v.multiplyScalar(0.985); v.y -= 0.0012; p.setXYZ(i, p.getX(i) + v.x, p.getY(i) + v.y, p.getZ(i) + v.z); }
      p.needsUpdate = true; fw.life -= 0.004; fw.pts.material.opacity = Math.max(0, fw.life); if (fw.life <= 0) { scene.remove(fw.pts); fw.pts = null; } }
    if (egg.s0) { const pr = (now - egg.s0) / 7000;
      if (pr <= 1) { const a = -0.9 + pr * 1.9; sleigh.position.set(Math.sin(a) * 60 - 10, 26 + Math.sin(pr * Math.PI) * 6, -60 + Math.cos(a) * 10); sleigh.rotation.y = -a + Math.PI / 2;
        trail.push(sleigh.position.clone().add(new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)))); if (trail.length > TRAIL_N) trail.shift();
      } else sleigh.visible = false; }
    const tp = trailGeo.attributes.position; for (let i = 0; i < TRAIL_N; i++) { const v = trail[i]; if (v) { v.y -= 0.01; tp.setXYZ(i, v.x, v.y, v.z); } else tp.setXYZ(i, 0, -50, 0); } tp.needsUpdate = true;
    if (e > 11000) { egg = null; trail.length = 0; }
  }
  composer.render();
  requestAnimationFrame(frame);
}
frame();
