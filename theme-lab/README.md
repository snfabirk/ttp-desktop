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
- `2026-10-all-hallows.html` - Oktober, Stufe 15: einfaches Theme (in Arbeit).
