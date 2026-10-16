# Maschenrechner

Progressive Web App zum Umrechnen von Strickanleitungen auf die eigene Maschenprobe.
Läuft im Browser, ist nach dem ersten Aufruf offline nutzbar und speichert alle Eingaben
nur auf dem eigenen Gerät.

**Version:** 0.1.0 – Sprint 1 „Excel ersetzen“ (US-01 bis US-08)

## Funktionen
- Maschenproben der Anleitung und die eigene Probe erfassen, mit frei wählbaren Bezugsmaßen (Standard 10 × 10 cm)
- Maschen- und Reihenzahlen aus der Anleitung auf die eigene Probe umrechnen
- Breite/Länge in cm in Maschen/Reihen umrechnen, laut Anleitung und mit eigener Probe
- Kaufmännische Rundung und eine Anpassung (−/+), mit Anzeige von tatsächlichem Maß und Abweichung
- Eingaben bleiben gespeichert, mit Knopf zum Zurücksetzen

## Lokal starten
ES-Module und Service Worker funktionieren nicht über `file://`, deshalb die App über einen kleinen Webserver starten:

```bash
cd maschenrechner
python3 -m http.server 8000
```
Danach `http://localhost:8000` im Browser öffnen.

## Tests
Nötig ist Node.js ab Version 18. Es muss nichts installiert werden:

```bash
npm test
# oder direkt:
node --test
```

## Auf GitHub Pages veröffentlichen
1. Neues Repository anlegen (z. B. `maschenrechner`) und alle Dateien aus diesem Ordner hochladen. Die Datei `.nojekyll` gehört dazu.
2. Unter **Settings → Pages** als Quelle *Deploy from a branch* wählen, Branch `main`, Ordner `/ (root)`.
3. Nach ein bis zwei Minuten ist die App unter `https://<benutzername>.github.io/maschenrechner/` erreichbar.

### Neue Version ausliefern
In `sw.js` den Wert `CACHE_NAME` erhöhen, z. B. von `maschenrechner-v0.1.0` auf `maschenrechner-v0.2.0`. Sonst zeigen bereits installierte Apps weiter die alte Version.
Neue Dateien müssen außerdem in die Liste `APP_DATEIEN` in `sw.js` eingetragen werden.

## Am Handy installieren
- **iPhone (Safari):** Seite öffnen → Teilen-Symbol → „Zum Home-Bildschirm“
- **Android (Chrome):** Seite öffnen → Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“

**Wichtig für iPhone:** Safari löscht die Daten einer Website nach 7 Tagen ohne Nutzung, wenn sie *nicht* zum Home-Bildschirm hinzugefügt wurde. Deshalb die App am besten installieren.

## Datenschutz
- Kein Server, keine Konten, keine Cookies, keine Tracker, keine externen Schriften oder Bibliotheken
- Die Eingaben liegen ausschließlich im `localStorage` des Geräts
- Eine Content Security Policy verhindert technisch, dass Daten an fremde Adressen gehen
- Löschen über „Alle Eingaben zurücksetzen“ oder über die Websitedaten im Browser

## Aufbau
```
index.html            Seite (Texte über data-text-Schlüssel)
css/style.css         Gestaltung (mobil zuerst, hell/dunkel)
js/rechner.js         Rechenlogik (rein, intern immer in cm)
js/eingabe.js         Eingabeprüfung (rein, nur Fehlercodes)
js/format.js          Zahlenformat (rein, Gebietsschema als Parameter)
js/texte.js           Alle Texte je Sprache
js/einheiten.js       Längeneinheiten (Sprint 1: nur cm)
js/speicher.js        Laden/Speichern/Zurücksetzen
js/app.js             Verbindet Oberfläche und Module
sw.js                 Service Worker (offline)
tests/                Automatische Tests (node --test)
```
Sprache und Längeneinheit sind technisch vorbereitet und lassen sich unabhängig voneinander umstellen (`einstellungen.sprache`, `einstellungen.laengeneinheit`). In Sprint 1 gibt es nur Deutsch und cm.
