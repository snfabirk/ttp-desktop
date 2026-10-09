# Theme Lab

Entwurfs- und Vorlagen-Seiten fuer die monatlichen Pass-Cosmetics. **Nicht im
Installationspaket** (electron-builder packt nur `public/` und `server/`).
Im Browser bzw. in der Testinstanz direkt per `file://` oeffnen.

Aufbau pro Monat (siehe server/lib/cosmetics.js):

| Stufe | Cosmetic |
|---|---|
| 5 / 20 | Profilbild-Rahmen (simpel / fancy) |
| 10 / 25 | Profil-Rahmen um die Widgets (simpel / fancy) |
| 15 / 30 | App-Theme (simpel mit Akzenten / fancy animiert) |

- `2026-10-haunted-night.html` - Oktober, Stufe 30-Paket (vom Nutzer
  abgenommen): WebGL-Nebel + Mond + Sterne, Laterne an der Maus (geht aus,
  wenn die Maus das Fenster verlaesst), 9 Geister fliehen vor dem Licht,
  gedaempfter Blitz mit Spukhaus-Silhouette, Easter Egg (5 Geister anklicken
  -> Riesengeist "BOO!"). Profilbild-Rahmen "Widow's Nest" (Stufe 20:
  Dachboden-Spinnweben am Ring, abseilende Spinne, leuchtender Ektoplasma-
  Rand) und Profil-Rahmen "Ectoplasm Manor" (Stufe 25: wabernder Rand, Ranken
  wachsen nur bei Hover und drehen mitten in der Bewegung um, 3D-Neigung).
  Dient als Grundgeruest fuer kuenftige Themes.
- `2026-10-all-hallows.html` - Oktober, Stufe 15 (abgenommen): stehende
  Szene (Mondsichel "C"-foermig, Fledermaeuse, Huegel, Baum + Laterne,
  Graeber, Zaun mit schwarzer Katze, Kerzen, Kuerbisse). Easter Egg: 5x auf
  die Katze -> sie schaut dich an, Augen rot, Lichter aus, Kuerbisse grinsen
  boese, dann flackert alles wieder an. Dazu Stufe 5 "Pumpkin Ring"
  (Kuerbiskoerper um das Bild, nur Holzstiel) und Stufe 10 "Cobweb"
  (klassische Eckennetze ganz oben, durchhaengender Faden).

Alles oben ist seit v5.12.0 in der App (cosmetics-fx.js, cosmetics.css,
theme-fx.js, style.css).

## Seltenheiten (seit v5.16.0)

Basic (gratis) -> Refined -> Fancy -> Animated. Pass: Stufe 5/10/15 Refined,
20/25 Fancy, 30 Animated. Preise im Shop nach Seltenheit x Typ
(server/lib/cosmetics.js `PRICES`).

## Naechster Schritt: echte Shop-Cosmetics

Im Shop stehen noch Platzhalter (server/lib/progression.js `SHOP_ITEMS`,
nur Farbverlauf als Vorschau, nicht kaufbar). Sie sollen hier als Demos
entstehen - gleiche Qualitaet wie Haunted Night, aber NICHT halloween-
gebunden (Shop-Sachen kommen immer wieder in die Rotation):

| Platzhalter | Typ | Seltenheit |
|---|---|---|
| Plain Ring, Ash Ring | Border | Basic |
| Slate Frame, Oak Frame | Rahmen | Basic |
| Ember Ring, Frost Rim, Moonlit Ring, Thorn Ring | Border | Refined |
| Iron Frame, Ivy Frame, Rune Frame, Gilded Frame | Rahmen | Refined |
| Deep Sea | Theme | Refined |
| Dragonfire Ring | Border | Fancy |
| Void Rift | Rahmen | Fancy |
| Starfall | Theme | Fancy |
| Storm Crown | Border | Animated |
| Sakura Garden | Theme | Animated |

Namen/Auswahl sind nicht fix - mit dem Nutzer abstimmen.

## Checkliste: Demo -> App

1. `server/lib/cosmetics.js`: Eintrag mit `id`, `type`, `name`, `rarity`
   (+ `passMonth`/`tier` fuer Pass, `themeKey`/`animated` fuer Themes).
   Shop-Artikel: Platzhalter in `SHOP_ITEMS` (progression.js) ersetzen.
2. Border: `.cos-<id>` in `public/cosmetics.css`; braucht sie Deko-Elemente
   (SVG ueber/unter dem Bild), Funktion in `BORDERS` in
   `public/cosmetics-fx.js` (haengt sich automatisch an jedes `.cos-border`).
3. Rahmen: `.pframe-<id>` in cosmetics.css + ggf. `FRAMES` in
   cosmetics-fx.js; Mini-Vorschau `.mini-frame-<id>`.
4. Theme: `html[data-theme="<key>"]` (Farben) in `public/style.css`, Szene in
   `SCENES` in `public/theme-fx.js`, Mini-Vorschau `.mini-theme-<key>`.
5. Animationen muessen `html.fx-off` / `html.fx-paused` respektieren.
6. Auf allen Themes pruefen (vor allem Light) - alles ist mit allem kombinierbar.

