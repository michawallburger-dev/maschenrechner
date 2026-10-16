# Maschenrechner

Progressive Web App zum Umrechnen von Strickanleitungen auf die eigene Maschenprobe.
Läuft im Browser, ist nach dem ersten Aufruf offline nutzbar und speichert alle Eingaben
nur auf dem eigenen Gerät.

**Version:** 0.2.0 – Sprint 2 „Projekte & Reihenzähler“ (US-09 bis US-12, US-26, US-27)

## Funktionen
- Maschenproben der Anleitung und die eigene Probe erfassen, mit frei wählbaren Bezugsmaßen (Standard 10 × 10 cm)
- Maschen- und Reihenzahlen aus der Anleitung auf die eigene Probe umrechnen
- Breite/Länge in cm in Maschen/Reihen umrechnen, laut Anleitung und mit eigener Probe
- Kaufmännische Rundung und eine Anpassung (−/+), mit Anzeige von tatsächlichem Maß und Abweichung
- Projekte mit Strickstücken; jedes Strickstück hat eigene Rechner und einen Reihenzähler
- Reihenzähler mit großer +1-Fläche; der Bildschirm bleibt an, wo das Gerät es erlaubt (iPhone: installierte App ab iOS 18.4)
- Datensicherung als Datei (Teilen-Menü) und Einlesen
- Farbschema Wie System / Hell / Dunkel (Zahnrad oben rechts)

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
- Die Eingaben liegen ausschließlich im `localStorage` des Geräts (Schlüssel `maschenrechner.daten.v2`; die Daten aus 0.1 bleiben unter `maschenrechner.zustand` unverändert)
- Eine Content Security Policy verhindert technisch, dass Daten an fremde Adressen gehen
- Löschen über „Projekt löschen“ bzw. „Strickstück löschen“ oder über die Websitedaten im Browser
- Die Sicherungsdatei verlässt das Gerät nur, wenn die Nutzerin sie selbst teilt

## Aufbau
```
index.html                 Seite mit Vorlagen (<template>) und Dialogen
css/style.css              Gestaltung (mobil zuerst, Farbschema wählbar)
js/rechner.js              Rechenlogik (rein, intern immer in cm)
js/eingabe.js              Eingabeprüfung (rein, nur Fehlercodes)
js/format.js               Zahlenformat (rein)
js/texte.js                Alle Texte je Sprache
js/einheiten.js            Längeneinheiten (bisher nur cm)
js/modell.js               Datenmodell Projekte → Strickstücke (rein)
js/migration.js            Übernahme aus 0.1 (rein)
js/sicherung.js            Sicherungsdatei erzeugen/prüfen (rein)
js/zaehler.js              Zählerlogik (rein)
js/speicher.js             Laden/Speichern (Speicher als Parameter)
js/router.js               Hash-Navigation (#/p/<id>/s/<id> …)
js/geraet.js               Browser-Fähigkeiten: IDs, Wake Lock, Teilen, Farbschema
js/dom.js                  DOM-Helfer, Dialoge
js/ansichten/*.js          Projektliste, Projekt, Strickstück, Zähler, Einstellungen
js/app.js                  Start, Kontext für die Ansichten, Router
sw.js                      Service Worker (offline)
tests/                     Automatische Tests (node --test)
```
Sprache, Längeneinheit und Farbschema sind unabhängig voneinander (`einstellungen.sprache`, `einstellungen.laengeneinheit`, `einstellungen.farbschema`). Bisher gibt es nur Deutsch und cm.

Der Test `tests/sw-liste.test.js` schlägt fehl, wenn eine Datei in `APP_DATEIEN` fehlt oder die Versionsnummern in `package.json`, `sw.js` und `js/app.js` nicht übereinstimmen.
