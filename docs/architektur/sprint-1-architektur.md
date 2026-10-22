<!-- Original aus dem Claude-Projekt „Stricken und Häckeln“, dort als architektur/sprint-1-architektur.md geführt.
     Am 22.10.2026 aus dem Word-Export ins Repo übernommen; Inhalt unverändert,
     nur das Format ist jetzt Markdown. Abgeschlossen mit v0.1.0. Der Code verweist auf die Abschnittsnummern dieses Dokuments. -->

# Architekturdokument – Maschenrechner, Sprint 1 (Version 1.2)

Rolle: Architekt · Grundlage: anforderungen/product-backlog.md (US-01 bis US-08) · freigegeben am 16.10.2026

**Änderungen in v1.2** (Rückmeldung aus der Entwicklung, freigegeben am 16.10.2026):

- Der Testbefehl lautet node --test. Die Form node --test tests/ mit Ordnerangabe funktioniert in aktuellen Node-Versionen nicht.
- speicher.js darf die reinen Module einheiten.js und texte.js nutzen, um Standardwerte zu ermitteln.

**Änderungen in v1.1:** Sprache und Längeneinheit sind technisch vorbereitet und **unabhängig voneinander** umstellbar (Entscheidung E9). Dafür kamen die Module texte.js und einheiten.js, der Bereich einstellungen im Datenmodell, data-text im HTML und locale als Parameter der Formatierung hinzu. Sprint 1 liefert nur Deutsch und cm, ohne Umschalter.

## 1. Technologiewahl

| **Entscheidung** | **Wahl** | **Begründung** |
|---|---|---|
| App-Typ | Progressive Web App (PWA) | Lässt sich am Handy wie eine App zum Startbildschirm hinzufügen und läuft offline (US-08). Es braucht keinen App-Store und kein natives Projekt. |
| Sprache | HTML5, CSS3, Vanilla JavaScript (ES-Module, ES2020) | Kein Framework, kein Build-Schritt. Der Code läuft so, wie er im Repository liegt. |
| Hosting | GitHub Pages (statisch, HTTPS) | Kostenlos; HTTPS ist Pflicht für Service Worker. Gleiches Vorgehen wie bei Wochenplan und Vorratskammer. |
| Schriften/Icons | System-Schriften, eigene Icons im Repository | Keine externen Ressourcen |
| Tests | Test-Runner von Node.js (node --test, ab Node 18) | Keine externen Abhängigkeiten, kein npm install |
| Speicherung | localStorage | Wenige kleine Werte, synchron und einfach. Über IndexedDB wird in Sprint 2 entschieden. |

**Mindestumgebung:** aktuelle Versionen von Safari (ab iOS 16), Chrome, Firefox und Edge.

## 2. Dateistruktur

```text
maschenrechner/
├── index.html               Einzige Seite; enthält keinen eingebetteten Code; Texte über data-text-Schlüssel
├── manifest.webmanifest     PWA-Manifest
├── sw.js                    Service Worker (im Wurzelverzeichnis)
├── .nojekyll                Verhindert die Jekyll-Verarbeitung durch GitHub Pages
├── package.json             Nur {"type": "module", "scripts": {"test": "node --test"}}, keine Abhängigkeiten
├── README.md                Starten, Testen, Deployen
├── css/style.css
├── icons/                   icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png
├── js/
│   ├── rechner.js           REINE Rechenlogik, intern immer in cm
│   ├── eingabe.js           REINE Eingabeprüfung (Komma/Punkt), liefert nur Fehlercodes
│   ├── format.js            REINE Ausgabeformatierung, Gebietsschema als Parameter
│   ├── texte.js             REINE Textsammlung je Sprache + text(sprache, schluessel, werte)
│   ├── einheiten.js         REINE Längeneinheiten: Anzeigeeinheit ↔ cm, Standard-Bezugsmaß
│   ├── speicher.js          Laden/Speichern/Zurücksetzen über eine austauschbare Speicher-Schnittstelle
│   └── app.js               Einstieg: DOM, Zustand, Darstellung, Registrierung des Service Workers
└── tests/                   *.test.js – werden von `node --test` automatisch gefunden
```

**Abhängigkeiten zwischen den Modulen (nur in eine Richtung)**

app.js ──► rechner.js · eingabe.js · format.js · texte.js · einheiten.js · speicher.js

speicher.js ──► einheiten.js · texte.js        (nur für Standardwerte, seit v1.2)

rechner.js, eingabe.js, format.js, texte.js und einheiten.js importieren nichts, greifen nicht auf window, document oder localStorage zu und haben keinen Zustand. Nur app.js greift auf das DOM zu. Zyklische Abhängigkeiten sind nicht erlaubt.

## 3. Rechenlogik (js/rechner.js)

### 3.1 Grundsätze

- Alle Funktionen sind **rein** und werfen keine Ausnahmen. Sie bekommen bereits geprüfte Zahlen und liefern Objekte zurück.
- **Alle Längen sind in cm.** Die Umrechnung aus der Anzeigeeinheit erledigt app.js vorher über einheiten.js.
- Eine Maschenprobe wird je Richtung als { anzahl, bezugCm } übergeben.
- Gerechnet wird immer über die Dichte pro cm, **nie** über das reine Verhältnis der Maschenzahlen (E2).

### 3.2 Rundung – verbindliche Regel

js

// Kaufmännisch runden; Gleitkomma-Rest vorher auf 9 Nachkommastellen bereinigen

export function runden(wert) {

return Math.round(Number(wert.toFixed(9)));

}

Die Funktion ist nur für nicht-negative Werte gedacht. Pflicht-Testfall: runden(10.2 * 25 / 10) === 26 (ohne Bereinigung käme 25,4999… heraus).

### 3.3 Funktionen

| **Funktion** | **Rückgabe** | **Formel** |
|---|---|---|
| dichteProCm(probe) | Zahl | anzahl / bezugCm |
| cmZuAnzahl(cm, probe) | Zahl, ungerundet | cm * anzahl / bezugCm |
| anzahlZuCm(n, probe) | Zahl | n * bezugCm / anzahl |
| umrechnenAusAnleitung(n, probeAnleitung, probeEigen, anpassung) | { gueltig, cmLautAnleitung, eigenGerundet, endgueltig, cmTatsaechlich, abweichungCm } | US-03, US-04 |
| umrechnenAusCm(cm, probeAnleitung, probeEigen, anpassung) | { gueltig, anleitungGerundet, eigenGerundet, endgueltig, cmTatsaechlich, abweichungCm } | US-05, US-06 |

Ist endgueltig < 1, wird gueltig: false, fehler: 'ERGEBNIS_ZU_KLEIN' zurückgegeben. Die Zwischenwerte bleiben trotzdem erhalten.

## 4. Eingabe, Texte, Einheiten, Daten

### 4.1 Eingabeprüfung (js/eingabe.js)

pruefeZahl(text, regel) liefert { gueltig: true, wert } oder { gueltig: false, fehler, grenze? }. Zurück kommen nur Codes, die Texte stehen in texte.js.

| **Regel** | **Erlaubt** | **Bereich** | **Verwendet für** |
|---|---|---|---|
| probenAnzahl | Dezimalzahl > 0 | ≤ 999 | Anzahl Maschen/Reihen der Probe |
| bezugsmass | Dezimalzahl > 0 | ≤ 100 | Bezugsmaß der Probe (Anzeigeeinheit) |
| nadel | Dezimalzahl > 0, leer erlaubt | ≤ 30 | Nadelstärke in mm |
| ganzPositiv | ganze Zahl ≥ 1 | ≤ 99 999 | Maschen-/Reihenzahl aus der Anleitung |
| laenge | Dezimalzahl > 0 | ≤ 9 999 | gewünschte Breite/Länge (Anzeigeeinheit) |
| anpassung | ganze Zahl, auch negativ, leer = 0 | −9 999 … 9 999 | Anpassungsfeld |

- Leerzeichen am Rand werden entfernt.
- Genau ein Dezimaltrenner ist erlaubt, Komma oder Punkt, unabhängig von der Sprache.
- Das typografische Minus (−) zählt wie „-“.
- Nicht erlaubt sind Tausendertrenner, die Schreibweise 1e3, Infinity und Buchstaben.

Fehlercodes: LEER, KEINE_ZAHL, KEINE_GANZZAHL, NICHT_POSITIV, ZU_GROSS, ZU_KLEIN.

### 4.2 Ausgabe (js/format.js)

- Funktionen: formatZahl(wert, locale, stellen), formatGanzzahl(wert, locale), formatAbweichung(wert, locale, stellen).
- Die Einheit hängt app.js an. So beeinflussen Sprache und Einheit die Ausgabe unabhängig voneinander.
- Längen haben 2 Nachkommastellen, Ganzzahlen stehen ohne Tausendertrenner.
- Die Abweichung hat immer ein Vorzeichen: −0,12, +0,04, ±0,00. Ungültige Werte erscheinen als –.

### 4.3 Texte (js/texte.js)

- SPRACHEN = { de: { locale: 'de-DE', texte: { … } } } mit den Funktionen text(sprache, schluessel, werte), localeFuer(sprache) und istBekannteSprache(sprache).
- Fehlt ein Text in einer Sprache, wird der deutsche verwendet. Fehlt er ganz, wird der Schlüssel selbst angezeigt, damit der Fehler im Test auffällt.
- Einheitenabhängige Texte nutzen den Platzhalter {einheit}. Kein Text enthält „cm“ fest.

### 4.4 Längeneinheiten (js/einheiten.js)

- LAENGENEINHEITEN = { cm: { faktorZuCm: 1, standardBezug: 10 } } mit den Funktionen zuCm, vonCm, standardBezug und istBekannteEinheit.
- Das Kürzel für die Anzeige kommt aus texte.js (einheit.cm).
- Zoll wird in Sprint 1 nicht eingetragen.
- Eine unbekannte Einheit ist ein Programmierfehler und löst einen TypeError aus.

### 4.5 Datenmodell

Gespeichert wird der eingegebene Text. Er gilt in der Längeneinheit aus einstellungen.

json

{

"schemaVersion": 1,

"einstellungen": { "sprache": "de", "laengeneinheit": "cm" },

"probeAnleitung": { "maschenAnzahl": "34", "maschenBezug": "10", "reihenAnzahl": "52", "reihenBezug": "10" },

"probeEigen": { "maschenAnzahl": "25", "maschenBezug": "10", "reihenAnzahl": "37", "reihenBezug": "10", "nadelstaerkeMm": "3,5" },

"rechner": {

"maschenAusAnleitung": { "eingabe": "320", "anpassung": "0" },

"reihenAusAnleitung": { "eingabe": "55", "anpassung": "0" },

"breiteZuMaschen": { "eingabe": "94", "anpassung": "0" },

"laengeZuReihen": { "eingabe": "13,5", "anpassung": "0" }

}

}

- sprache und laengeneinheit sind zwei getrennte Felder.
- **Ausgangswerte:** Anzahlen sind leer, Bezugsmaße stehen auf standardBezug(laengeneinheit), Anpassungen auf "0", die Nadelstärke ist leer.
- Beim Zurücksetzen bleiben die einstellungen erhalten. Unbekannte Einstellungen fallen auf de bzw. cm zurück.

### 4.6 Speicherung (js/speicher.js)

- Es gibt einen einzigen Schlüssel: maschenrechner.zustand.
- Funktionen: laden(speicher) → { zustand, speicherbar }, speichern(speicher, zustand) → true/false, zuruecksetzen(speicher, einstellungen), migrieren(daten).
- Kaputtes JSON oder eine unbekannte Schema-Version führen zum Ausgangszustand. Übernommen werden nur bekannte Felder, deren Wert ein Text ist.
- Gespeichert wird bei jeder Eingabe mit 300 ms Verzögerung und zusätzlich bei pagehide und visibilitychange.
- Alle Zugriffe laufen in try/catch. Ohne localStorage arbeitet die App weiter und zeigt einen Hinweis.

## 5. Oberfläche

### 5.1 Aufbau

- Kopfzeile
- Maschenproben (<details open>): Anleitung und eigene Probe, auf dem Handy untereinander, ab 700 px nebeneinander
- Vier Rechner-Karten mit Eingabe, Zwischenwerten, −/+-Anpassung und hervorgehobenem Endergebnis
- Fußzeile mit „Alle Eingaben zurücksetzen“, der Knopf öffnet ein <dialog>

Die Berechnung läuft bei jedem input-Ereignis.

### 5.2 Texte im HTML

- Texte werden über data-text="schluessel" und data-text-aria-label="schluessel" eingesetzt.
- app.js füllt sie beim Start aus texte.js, ersetzt {einheit} und setzt <html lang> sowie document.title.
- Deutscher Rohtext im HTML dient als Rückfall.

### 5.3 Mobile Bedienbarkeit

- Eingabefelder sind type="text" mit inputmode="decimal" bzw. "numeric", **kein** type="number".
- −/+-Knöpfe für die Anpassung.
- Touch-Ziele mindestens 48 × 48 px, Grundschrift 18 px, Eingabefelder mindestens 16 px.
- Ab 360 px Breite kein horizontales Scrollen. Zoomen bleibt erlaubt.

### 5.4 Barrierefreiheit (WCAG 2.1 AA)

- lang ist gesetzt, die Überschriften sind logisch aufgebaut, jedes Feld hat ein sichtbares <label>.
- Fehler setzen aria-invalid, der Fehlertext ist über aria-describedby verknüpft. Fehler werden nie nur über Farbe gezeigt.
- Der Hinweis „leer“ erscheint erst, wenn das Feld berührt wurde.
- Ergebnisse stehen in aria-live="polite", der Kontrast beträgt mindestens 4,5:1, :focus-visible ist sichtbar.
- Hell- und Dunkelmodus werden unterstützt, ebenso prefers-reduced-motion.

## 6. Offlinefähigkeit

- CACHE_NAME = 'maschenrechner-v1'; bei jeder Auslieferung wird der Wert erhöht.
- Bei install werden alle App-Dateien vorab geladen (feste Liste), danach skipWaiting(). Bei activate werden alte Caches gelöscht, danach clients.claim().
- Bei fetch werden nur GET-Anfragen an die eigene Herkunft bedient, zuerst aus dem Cache, dann aus dem Netz. Ohne Netz liefert ein Seitenaufruf index.html.
- Pfade sind relativ (./).

## 7. Datenschutzkonzept (DSGVO)

| **Prinzip** | **Umsetzung** |
|---|---|
| Datenminimierung | Gespeichert werden nur Maschenproben, Nadelstärke, Rechnereingaben und Einstellungen, keine personenbezogenen Daten. |
| Nur lokal | Daten liegen nur im localStorage. Es gibt keinen Server-Code, keine Aufrufe fremder Adressen, keine Konten und keine Synchronisierung. |
| Keine Dritten | Keine CDNs, keine Google Fonts, keine externen Bilder, keine Analytics, keine Tracker, keine Cookies. |
| Technisch abgesichert | CSP als <meta>: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'. |
| § 25 TDDDG | Das Speichern ist für den gewünschten Dienst unbedingt erforderlich (US-07). Ein Banner ist nicht nötig. |
| Löschen | Über „Alle Eingaben zurücksetzen“ oder die Websitedaten im Browser. |

**Begründete Abweichung beim Hosting:** GitHub verarbeitet beim Seitenabruf technisch bedingt die IP-Adresse. Das ist bei jedem Hosting unvermeidbar und betrifft nur den Abruf, nicht die Eingaben. Wird die App öffentlich bereitgestellt, sollten Impressum und Datenschutzerklärung ergänzt werden (Vorschlag fürs Backlog).

## 8. Qualitätssicherung

- npm test bzw. node --test läuft ohne Installation. Testdateien heißen tests/*.test.js.
- Pflicht-Testfälle:

  - alle Referenzwerte aus dem Backlog

  - runden(10.2 * 25 / 10) === 26

  - Randfälle: 0, negative Werte, Komma, Grenzen aus 4.1, Anpassung mit Ergebnis < 1

  - Vollständigkeit der Texte für alle data-text-Schlüssel

- Lokal ausprobieren: python3 -m http.server 8000, dann http://localhost:8000 öffnen.

## 9. Offene Punkte / Risiken

| **#** | **Punkt** | **Umgang** |
|---|---|---|
| R1 | Safari löscht die Daten nach 7 Tagen ohne Nutzung, wenn die App nicht installiert ist. | Hinweis in der README, Export folgt mit US-12 |
| R2 | Gleitkommafehler beim Runden | Regel aus 3.2 und Pflicht-Testfall |
| R3 | Datenschutzhinweis bei öffentlicher Nutzung | Vorschlag fürs Backlog |
| R4 | Beim Einheitenwechsel (US-24) müssen gespeicherte Längen umgerechnet werden. | Wird mit US-24 umgesetzt |
