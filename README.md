# Maschenrechner

Progressive Web App zum Umrechnen von Strickanleitungen auf die eigene Maschenprobe.
Läuft im Browser, ist nach dem ersten Aufruf offline nutzbar und speichert alle Eingaben
nur auf dem eigenen Gerät.

**Version:** 0.3.0 – Sprint 3 „Zu- und Abnahmen & Proben je Strickstück“ (US-32, US-13 bis US-16, US-30, US-33)

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
py -m http.server 8000
```
Danach `http://localhost:8000` im Browser öffnen. Den Server nach dem Testen wieder stoppen.

Auf dem Desktop-PC heißt der Python-Starter `py`; unter macOS und Linux stattdessen `python3`.

## Tests
Entwickelt und geprüft mit **Node.js 22** (ältere Versionen sind nicht geprüft). Es muss nichts installiert werden:

```bash
npm test
# oder direkt:
node --test
```

## Veröffentlichung
GitHub Pages liefert den Branch `main` aus (Quelle *Deploy from a branch*, Ordner `/ (root)`, die Datei `.nojekyll` gehört dazu):

**https://michawallburger-dev.github.io/maschenrechner/**

Gearbeitet wird nie direkt auf `main`, sondern auf einem Arbeitsbranch je Sprint (`sprint-N`) oder Thema (`setup/…`). Der Merge nach `main` ist die Freigabe und veröffentlicht damit zugleich.

### Neue Version ausliefern
In `sw.js` den Wert `CACHE_NAME` erhöhen, z. B. von `maschenrechner-v0.2.0` auf `maschenrechner-v0.3.0`. Sonst zeigen bereits installierte Apps weiter die alte Version.
Neue Dateien müssen außerdem in die Liste `APP_DATEIEN` in `sw.js` eingetragen werden.

## Am Handy installieren
- **iPhone (Safari):** Seite öffnen → Teilen-Symbol → „Zum Home-Bildschirm“
- **Android (Chrome):** Seite öffnen → Menü ⋮ → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“

**Wichtig für iPhone:** Safari löscht die Daten einer Website nach 7 Tagen ohne Nutzung, wenn sie *nicht* zum Home-Bildschirm hinzugefügt wurde. Deshalb die App am besten installieren.

## Datenschutz
- Kein Server, keine Konten, keine Cookies, keine Tracker, keine externen Schriften oder Bibliotheken
- Die Eingaben liegen ausschließlich im `localStorage` des Geräts (Schlüssel `maschenrechner.daten.v3`; die Daten aus 0.2 bleiben unter `maschenrechner.daten.v2` und die aus 0.1 unter `maschenrechner.zustand` unverändert)
- Eine Content Security Policy verhindert technisch, dass Daten an fremde Adressen gehen
- Löschen über „Projekt löschen“ bzw. „Strickstück löschen“ oder über die Websitedaten im Browser
- Die Sicherungsdatei verlässt das Gerät nur, wenn die Nutzerin sie selbst teilt

## Projektunterlagen
- **Backlog, Stories und Fehler:** Jira-Projekt [Masche (MAS)](https://wallburgermicha.atlassian.net/browse/MAS) – das ist die verbindliche Quelle, nicht das Repo
- **Ausgangsanforderung und Excel-Formeln:** `docs/anforderungen/`
- **Produktentscheidungen:** `docs/entscheidungen.md` (E1 bis E28)
- **Architektur:** `docs/architektur/` je Sprint, Übersicht und Risikoregister in `docs/architektur.md`
- **QA-Testberichte:** `docs/qa/` je Sprint
- **Stand der Arbeit:** `docs/STATUS.md`
- **Arbeitsweise und Rollen:** `CLAUDE.md`
- **Was in welcher Version steckt:** `CHANGELOG.md`

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
