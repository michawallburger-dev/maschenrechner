<!-- Original aus dem Claude-Projekt „Stricken und Häckeln“, dort als architektur/sprint-2-architektur.md geführt.
     Am 22.10.2026 aus dem Word-Export ins Repo übernommen; Inhalt unverändert,
     nur das Format ist jetzt Markdown. Abgeschlossen mit v0.2.0. Baut auf Sprint 1 auf. -->

# Architekturdokument – Maschenrechner, Sprint 2 (Version 2.0)

Rolle: Architekt · Grundlage: anforderungen/product-backlog.md v2.0, Sprint 2 (US-09, US-10, US-11, US-12, US-26, US-27, Bugs MAS-30 bis MAS-33) · Baut auf architektur/sprint-1-architektur.md v1.2 auf. Alles dort Festgelegte gilt weiter, sofern hier nichts anderes steht.

## 1. Was sich gegenüber Sprint 1 ändert

| **Bereich** | **Sprint 1** | **Sprint 2** |
|---|---|---|
| Oberfläche | eine Seite | **mehrere Ansichten** mit Hash-Navigation (Projektliste → Projekt → Strickstück → Zähler, dazu die Einstellungen) |
| Datenmodell | ein Zustand mit 2 Proben und 4 Rechnern | **Projekte → Strickstücke**. Proben, Garn und Nadel gehören zum Projekt, Rechner und Zähler zum Strickstück. |
| Speicherung | maschenrechner.zustand (Schema 1) | neuer Schlüssel maschenrechner.daten.v2 (Schema 2). Der alte Schlüssel bleibt unverändert als Rückfallebene erhalten. |
| Neue Fähigkeiten des Browsers | – | Screen Wake Lock (Bildschirm bleibt an), Web Share mit Dateien (Teilen-Menü), Dateiauswahl |
| Farbschema | nur nach Systemeinstellung | zusätzlich Hell oder Dunkel per Einstellung |

**Technologie bleibt:** PWA mit HTML, CSS und Vanilla-JS (ES-Module), ohne Build-Schritt, ohne Abhängigkeiten, auf GitHub Pages, getestet mit node --test.

**Speicherung bleibt localStorage.** Ein Projekt mit vier Strickstücken braucht etwa 3 KB, auch 100 Projekte bleiben weit unter dem Limit von etwa 5 MB. IndexedDB wäre asynchron und deutlich aufwendiger, ohne Nutzen für diese Datenmenge. Die Entscheidung wird überprüft, sobald Bilder oder Anleitungen gespeichert werden sollen.

## 2. Dateistruktur (neu:** **★****, ge****ä****ndert:** **✎****)

```text
maschenrechner/
├── index.html            ✎ Grundgerüst + <template> je Ansicht, Texte über data-text
├── manifest.webmanifest
├── sw.js                 ✎ neue Dateien in APP_DATEIEN, Laden mit cache:'reload' (MAS-33), CACHE_NAME v0.2.0
├── css/style.css         ✎ Ansichten, Zähler, Farbschema über data-farbschema
├── js/
│   ├── rechner.js           (unverändert)
│   ├── eingabe.js        ✎ Tausenderpunkt in Ganzzahlfeldern (MAS-30), Code UNVOLLSTAENDIG (MAS-31)
│   ├── format.js            (unverändert)
│   ├── einheiten.js         (unverändert)
│   ├── texte.js          ✎ neue Texte
│   ├── modell.js         ★ REIN: Datenmodell v2 – Erzeugen, Ändern, Löschen, Sortieren, Prüfen
│   ├── migration.js      ★ REIN: Schema 1 → Schema 2 (US-27)
│   ├── sicherung.js      ★ REIN: Sicherungsdatei erzeugen und prüfen (US-12)
│   ├── zaehler.js        ★ REIN: Zählerlogik (US-11)
│   ├── speicher.js       ✎ Laden/Speichern v2, Übernahme aus v1, Sicherheitskopie vor Import
│   ├── geraet.js         ★ Hülle um Browser-Fähigkeiten: Wake Lock, Teilen/Herunterladen, Datei lesen, Farbschema des Systems
│   ├── router.js         ★ Hash-Navigation, Ansicht wählen, Fokus und Seitentitel setzen
│   ├── ansichten/        ★ je Ansicht ein Modul: aufbauen, aktualisieren, Ereignisse
│   │   ├── projektliste.js
│   │   ├── projekt.js
│   │   ├── strickstueck.js   (die 4 Rechner, Logik aus dem bisherigen app.js)
│   │   ├── zaehler.js
│   │   └── einstellungen.js
│   ├── dom.js            ★ kleine DOM-Helfer: Vorlage klonen, Texte füllen, Dialog bestätigen (ohne innerHTML)
│   └── app.js            ✎ nur noch Start: Daten laden, Farbschema setzen, Router starten, Service Worker
└── tests/
├── (alle bisherigen Tests)
├── modell.test.js       ★
├── migration.test.js    ★
├── sicherung.test.js    ★
├── zaehler.test.js      ★
└── speicher-v2.test.js  ★
```

**Abhängigkeiten (weiterhin nur in eine Richtung, keine Zyklen)**

app.js ──► router.js ──► ansichten/*.js ──► dom.js · geraet.js · speicher.js

```text
└─► modell.js · zaehler.js · sicherung.js · rechner.js · eingabe.js · format.js · texte.js · einheiten.js
```

speicher.js ──► modell.js · migration.js

migration.js · sicherung.js ──► modell.js

modell.js ──► einheiten.js · texte.js   (nur für Standardwerte)

**Rein und ohne DOM** (vollständig mit Node testbar) sind: rechner, eingabe, format, texte, einheiten, modell, migration, sicherung und zaehler. Nur geraet.js greift auf navigator zu. Nur dom.js, router.js und ansichten/* greifen auf document zu.

## 3. Datenmodell (Schema 2)

json

{

"schemaVersion": 2,

"einstellungen": { "sprache": "de", "laengeneinheit": "cm", "farbschema": "system" },

"hinweise": { "projektlisteErklaert": false, "wachhaltenNichtMoeglich": false },

"projekte": [

{

"id": "p-1b9d6bcd",

"name": "Pullover für meinen Sohn",

"beschreibung": "",

"garn": "Merino 4-fach",

"nadelstaerkeMm": "3,5",

"erstellt": "2026-10-16T12:00:00.000Z",

"geaendert": "2026-10-16T12:30:00.000Z",

"probeAnleitung": { "maschenAnzahl": "34", "maschenBezug": "10", "reihenAnzahl": "52", "reihenBezug": "10" },

"probeEigen":     { "maschenAnzahl": "25", "maschenBezug": "10", "reihenAnzahl": "37", "reihenBezug": "10" },

"strickstuecke": [

{

"id": "s-6f1c2a90",

"name": "Ärmel links",

"erstellt": "…", "geaendert": "…",

"rechner": {

"maschenAusAnleitung": { "eingabe": "320", "anpassung": "0" },

"reihenAusAnleitung":  { "eingabe": "",    "anpassung": "0" },

"breiteZuMaschen":     { "eingabe": "",    "anpassung": "0" },

"laengeZuReihen":      { "eingabe": "",    "anpassung": "0" }

},

"zaehler": 42

}

]

}

]

}

**Regeln:**

- Eingaben bleiben **Text**, so wie in Sprint 1. Nur zaehler ist eine ganze Zahl von 0 bis 99 999, weil er nie halbfertig ist.
- Die **Nadelstärke** wandert von der eigenen Probe zum Projekt (US-09, AK2).
- **IDs** werden mit crypto.randomUUID() erzeugt (Safari ab 15.4), sonst ersatzweise aus Zeit und Zufall. Die ID wird modell.js übergeben, damit die Funktionen rein bleiben.
- geaendert von Projekt und Strickstück wird bei **jeder** Änderung gesetzt, auch beim Zählen. Danach sortiert die Projektliste (US-09, AK1).
- farbschema ist "system", "hell" oder "dunkel". Die drei Einstellungen sind voneinander unabhängig (E9, E10).
- Die Zeitstempel übergibt der Aufrufer (jetzt), damit die Funktionen rein und testbar bleiben.

**modell.js – Funktionen (alle rein, sie verändern ihre Eingabe nicht und geben neue Objekte zurück)**

| **Funktion** | **Zweck** |
|---|---|
| leereDaten(einstellungen?) | Ausgangszustand mit leerer Projektliste |
| neuesProjekt(daten, {name, beschreibung, garn, nadelstaerkeMm}, id, jetzt) | Projekt anlegen. Der Name ist Pflicht und wird getrimmt, 1–80 Zeichen. |
| projektAendern(daten, projektId, felder, jetzt) | Angaben oder Proben ändern |
| projektLoeschen(daten, projektId) | Projekt mit allen Strickstücken entfernen |
| neuesStrickstueck(daten, projektId, name, id, jetzt) | Strickstück mit leeren Rechnern und Zähler 0 |
| strickstueckAendern(daten, projektId, stueckId, felder, jetzt) | Name, Rechnerfelder oder Zähler ändern. Aktualisiert auch geaendert am Projekt. |
| strickstueckLoeschen(daten, projektId, stueckId) | Strickstück entfernen |
| projekteSortiert(daten) | Liste nach geaendert, neueste zuerst |
| finde(daten, projektId, stueckId?) | Projekt bzw. Strickstück oder null |
| pruefeDaten(roh) | Prüft unbekannte Daten (geladen oder importiert) gegen Schema 2. Liefert { gueltig: true, daten } mit bereinigten Daten oder { gueltig: false, fehler }. Fremde Felder werden verworfen, falsche Typen ersetzt oder führen zur Ablehnung. |

Die Grenzen für Freitexte (Name, Beschreibung, Garn) liegen bei 80, 500 und 80 Zeichen. Sie werden in der Oberfläche über maxlength und in pruefeDaten geprüft.

## 4. Übernahme aus 0.1 (migration.js, US-27)

- vonSchema1(v1, ids, jetzt) wandelt den alten Zustand in Schema 2 um: Daraus entstehen ein Projekt „Mein Projekt“ (Text aus texte.js) und ein Strickstück „Teil 1“ mit Zähler 0. Die Proben, die Rechner und die Einstellungen werden übernommen, probeEigen.nadelstaerkeMm wandert zu projekt.nadelstaerkeMm.
- hatInhalt(v1) prüft, ob die alten Daten überhaupt Eingaben enthalten, also ob irgendein Feld vom Ausgangswert abweicht. Ohne Inhalt entsteht **keine** Projektliste mit leerem Projekt (US-27, AK3).
- **Ablauf beim Start (speicher.js):**

  - Gibt es maschenrechner.daten.v2, wird es geladen und mit pruefeDaten geprüft.

  - Andernfalls wird maschenrechner.zustand gelesen. Hat er Inhalt, wird er übernommen, die neuen Daten werden unter .v2 geschrieben, und hinweise.projektlisteErklaert bleibt false.

  - Der alte Schlüssel wird **nie gelöscht und nie verändert** (US-27, AK4). Schlägt Schritt 2 fehl, startet die App mit leerer Liste. Die alten Daten bleiben für einen späteren Versuch liegen.

  - Nach einer erfolgreichen Übernahme öffnet die App das übernommene Projekt (AK2).

## 5. Datensicherung (sicherung.js + geraet.js, US-12)

**Dateiformat** (JSON, UTF-8, lesbar eingerückt):

json

{ "app": "maschenrechner", "format": 1, "appVersion": "0.2.0", "erstellt": "2026-10-16T14:00:00.000Z",

"daten": { "schemaVersion": 2, "einstellungen": {…}, "hinweise": {…}, "projekte": [ … ] } }

| **Funktion** | **Zweck** |
|---|---|
| erzeugeSicherung(daten, jetzt, appVersion) (rein) | Liefert { dateiname: 'maschenrechner-sicherung-2026-10-16.json', inhalt }. Der Dateiname nutzt das lokale Datum. |
| leseSicherung(text) (rein) | Prüft JSON, app, format und mit pruefeDaten die Daten. Liefert { gueltig: true, daten, zusammenfassung: { projekte, strickstuecke, erstellt } } oder { gueltig: false, fehler: 'KEIN_JSON' \| 'FALSCHE_APP' \| 'UNBEKANNTES_FORMAT' \| 'DATEN_UNGUELTIG' \| 'ZU_GROSS' }. Höchstgröße 2 MB. |
| teileDatei(name, inhalt) (geraet.js) | 1. navigator.canShare({ files }) → navigator.share({ files: [File] }) öffnet auf dem iPhone das Teilen-Menü. 2. Sonst wird die Datei per Blob-URL und <a download> heruntergeladen. Bricht die Nutzerin das Teilen ab (AbortError), ist das kein Fehler. |
| leseDatei(file) (geraet.js) | file.text() aus <input type="file" accept=".json,application/json"> |

**Ablauf beim Einlesen:**

- Datei wählen und mit leseSicherung prüfen.
- Ist sie gültig, zeigt ein Dialog die Zusammenfassung und fragt, ob die aktuellen Daten ersetzt werden sollen.
- Nach der Bestätigung legt speicher.js die **aktuellen** Daten zuerst unter maschenrechner.daten.v2.vorImport ab. Diese interne Sicherheitskopie wird bei jedem Import überschrieben. Danach werden die neuen Daten gespeichert.
- Ist die Datei ungültig, erscheint ein Hinweis, und es wird nichts verändert (AK4).

## 6. Reihenzähler (zaehler.js, geraet.js, US-11)

- zaehlerPlus(n) liefert höchstens 99 999. zaehlerMinus(n) liefert mindestens 0. zaehlerAusText(text) nutzt pruefeZahl(text, 'zaehler') (neue Regel: ganzzahlig, 0 bis 99 999, Tausenderpunkt erlaubt).
- **Jeder Schritt wird sofort gespeichert**, ohne die Verzögerung von 300 ms (US-11, AK4).
- **Bildschirm wachhalten** (geraet.js):

  - Beim Öffnen der Zähleransicht wird navigator.wakeLock.request('screen') angefordert.

  - Bei visibilitychange → visible wird die Sperre neu angefordert, weil iOS sie beim Wechsel in den Hintergrund freigibt.

  - Beim Verlassen der Ansicht wird sie freigegeben.

  - Wenn die Funktion fehlt oder abgelehnt wird, erscheint der Hinweis aus texte.js **einmalig** und wird in hinweise.wachhaltenNichtMoeglich vermerkt (AK5).

  - **Ohne Ersatz-Trick:** keine unsichtbaren Videos und keine Endlos-Animationen, wegen Akku und Datenschutz.

- **Zähleransicht:**

  - Oben stehen Projekt- und Strickstückname, in der Mitte die Reihenzahl in mindestens 96 px.

  - Der Knopf **+1** belegt die untere Bildschirmhälfte (mindestens 96 × 96 px). **−1** ist mindestens 56 px groß und steht mit mindestens 24 px Abstand oben rechts.

  - Die Zahl ist zugleich ein Eingabefeld (inputmode="numeric").

  - „Auf 0 setzen“ steht im Menü der Ansicht und braucht eine Sicherheitsabfrage.

  - Die Reihenzahl ist die **einzige** Live-Region der Ansicht (aria-live="polite", AK7).

## 7. Oberfläche und Navigation

### 7.1 Ansichten und Adressen (Hash-Routing)

| **Adresse** | **Ansicht** | **Inhalt** |
|---|---|---|
| / | Projektliste | Projekte nach letzter Änderung; Leerzustand mit „Neues Projekt“ |
| /p/<projektId> | Projekt | Angaben (Name, Beschreibung, Garn, Nadel), Maschenproben, Liste der Strickstücke mit Zählerstand, „Strickstück hinzufügen“, Projekt löschen |
| /p/<projektId>/s/<stueckId> | Strickstück | Kopf mit Name und Knopf **„Zählen“** (zeigt den Stand), darunter die vier Rechner aus Sprint 1 |
| /p/<projektId>/s/<stueckId>/zaehlen | Zähler | wie in Abschnitt 6 |
| /einstellungen | Einstellungen | Farbschema; „Daten sichern“; „Sicherung einlesen“ |

- **Hash-Routing** funktioniert auf GitHub Pages ohne Serverkonfiguration und offline. Die Zurück-Geste des iPhones funktioniert damit, und jede Ansicht hat eine eigene Adresse.
- **Kopfzeile auf jeder Ansicht:** links „‹ Zurück“ (außer in der Projektliste), in der Mitte der Titel, rechts das **Zahnrad** (48 × 48 px, aria-label „Einstellungen“).
- **Unbekannte oder gelöschte IDs** in der Adresse führen zurück zur Projektliste, ohne Fehler.
- **Beim Wechsel der Ansicht** passiert Folgendes: Der Fokus geht auf die Überschrift (h1, tabindex="-1"), document.title wird gesetzt (z. B. „Ärmel links – Pullover – Maschenrechner“), und die Seite scrollt nach oben.
- **Vorlagen:** Jede Ansicht steht als <template> in index.html und wird mit dom.js geklont. Texte kommen weiterhin über data-text aus texte.js, Werte werden nur über textContent und value gesetzt. **Kein innerHTML.**
- **Bestätigungsdialoge** (Löschen, Zähler auf 0, Import) laufen über einen gemeinsamen <dialog> mit Funktion bestaetigen({ titel, text, okText }) → Promise<boolean>.

### 7.2 Strickstück-Ansicht

- Die Logik der vier Rechner aus app.js (Sprint 1) wandert unverändert nach ansichten/strickstueck.js.
- Die Proben kommen aus dem Projekt. Die Proben-Eingabe selbst liegt in der Projektansicht, die Strickstück-Ansicht zeigt nur eine **Kurzfassung** mit dem Link „Proben ändern“ (z. B. „Anleitung 34 M / 52 R · Eigene 25 M / 37 R je 10 cm“).
- Sind die Proben unvollständig, zeigen die Karten wie bisher „Bitte zuerst beide Maschenproben vollständig ausfüllen.“, ergänzt um einen Link zur Projektansicht.

### 7.3 Farbschema (US-26)

- <html data-farbschema="hell|dunkel"> setzt das Schema fest. Ohne das Attribut (Einstellung „system“) gilt prefers-color-scheme.
- **CSS:** helle Werte stehen auf :root. Dunkle Werte gelten bei @media (prefers-color-scheme: dark) { :root:not([data-farbschema="hell"]) {…} } und bei :root[data-farbschema="dunkel"] {…}. Die Farbvariablen aus Sprint 1 bleiben, sie werden nur zusätzlich so ausgewählt.
- **theme-color:** app.js setzt ein einziges <meta name="theme-color"> passend zum **wirksamen** Schema. Bei „system“ reagiert es über matchMedia('(prefers-color-scheme: dark)').addEventListener('change', …) auf Umschalten (AK3).
- **Bedienelement:** eine Gruppe aus drei Optionsfeldern (fieldset/legend, input type="radio") in Form einer Segment-Schaltfläche. So ist sie für Screenreader eindeutig. Jede Option ist mindestens 48 px hoch.
- **Gegen kurzes Aufblitzen beim Start:** app.js setzt das Attribut, bevor die erste Ansicht aufgebaut wird. Da es kein Inline-Skript gibt (CSP), ist ein Aufblitzen von höchstens einem Frame möglich. Das ist akzeptiert.

## 8. Bugs aus Sprint 1

| **Bug** | **Lösung** |
|---|---|
| **MAS-30** Tausenderpunkt | In eingabe.js: Bei Regeln mit ganzzahl: true wird ein Text nach dem Muster ^[+-]?\d{1,3}(\.\d{3})+$ vor der Prüfung von Punkten befreit. So wird „1.000“ zu 1000 und „12.500.000“ zu 12500000 (danach greift die Obergrenze). „1.5“ bleibt KEINE_GANZZAHL. Dezimalregeln sind unverändert. Der QA-Test F-01 wird auf das neue Verhalten umgestellt. |
| **MAS-31** Fehler beim Tippen | Neuer Code UNVOLLSTAENDIG für ^[+-]?(\d+)?[.,]$ sowie für ein einzelnes „+“ oder „-“. Die Oberfläche zeigt dafür keine Meldung, solange das Feld den Fokus hat. Beim Verlassen erscheint der Text zu KEINE_ZAHL. Die Ergebnisse zeigen solange „–“. |
| **MAS-32** Live-Regionen | aria-live steht nur noch auf dem <output> des Hauptergebnisses je Karte und auf der Zählerzahl. dl.werte und .ergebnis haben kein aria-live mehr. Der Speicherhinweis bleibt role="status". |
| **MAS-33** Update-Cache | cache.addAll(APP_DATEIEN.map((u) => new Request(u, { cache: 'reload' }))). CACHE_NAME = 'maschenrechner-v0.2.0'. Alle neuen Module stehen in APP_DATEIEN. Ein Test prüft, dass jede Datei unter js/ in APP_DATEIEN steht. |

## 9. Datenschutz (Ergänzungen zu Sprint 1, §7)

| **Thema** | **Bewertung** |
|---|---|
| Neue Daten | Projektnamen, Beschreibungen und Garnangaben sind Freitext. Sie könnten Personenbezug haben (z. B. „Pullover für meinen Sohn“), bleiben aber **nur auf dem Gerät**. |
| Teilen (Web Share) | Die Datei geht nur auf ausdrückliche Handlung der Nutzerin an das Teilen-Menü des Betriebssystems. Die App selbst sendet nichts und kennt das Ziel nicht. |
| Datei einlesen | Die Datei wird lokal gelesen und nicht hochgeladen. Inhalte werden mit pruefeDaten geprüft und nur als Text dargestellt (textContent). Damit ist eingeschleuster Code ausgeschlossen. |
| Wake Lock | Es werden keine Daten verarbeitet, die Sperre gilt nur, solange die Zähleransicht sichtbar ist. |
| CSP | Sie bleibt unverändert. Der Download per blob:-URL ist eine Navigation und von default-src nicht betroffen. Weitere Quellen sind nicht nötig. |
| Hinweis für die Nutzerin | Die Einstellungen enthalten bei „Daten sichern“ einen Satz: „Die Datei enthält alle deine Projekte. Teile sie nur mit Personen, denen du vertraust.“ |

## 10. Barrierefreiheit und Bedienung (Ergänzungen)

- Alle neuen Bedienelemente sind mindestens 48 × 48 px groß. Der Zählerknopf +1 ist mindestens 96 × 96 px groß.
- Listen (Projekte, Strickstücke) sind <ul> mit Links (<a href="#/p/…">), mit sichtbarem Namen und Zusatzinfo, z. B. „3 Strickstücke · geändert heute“.
- Löschknöpfe sind nicht nur rot, sondern zusätzlich beschriftet („Projekt löschen“).
- Die Tastaturreihenfolge folgt der Ansicht. Escape schließt Dialoge.
- Kontrast mindestens 4,5:1 in beiden Schemata. QA misst wie in Sprint 1, auch mit festem Hell oder Dunkel.

## 11. Tests (Vorgaben für Entwicklung und QA)

- **Bestehende Tests** bleiben grün. Die Rechner-Referenzwerte werden zusätzlich innerhalb eines Strickstücks geprüft.
- **modell.test.js:**

  - Anlegen, Ändern, Löschen; Name leer → abgelehnt.

  - Sortierung nach geaendert; geaendert wird bei Zähleränderung am Projekt aktualisiert.

  - Unveränderlichkeit der Eingaben; pruefeDaten mit fremden Feldern, falschen Typen und Grenzwerten.

- **migration.test.js:**

  - Echter Zustand aus 0.1 → Projekt „Mein Projekt“/„Teil 1“ mit allen Werten.

  - Leerer 0.1-Zustand → keine Projekte.

  - Kaputter 0.1-Zustand → leere Liste, alter Schlüssel unverändert.

- **sicherung.test.js:**

  - Erzeugen und Lesen ergibt denselben Inhalt; Dateiname mit Datum.

  - Ungültig: kein JSON, falsche App, unbekanntes Format, kaputte Daten, mehr als 2 MB.

- **zaehler.test.js:** Grenzen 0 und 99 999, Text „1.000“, „-1“, „abc“.
- **speicher-v2.test.js:**

  - Ladereihenfolge v2 → v1 → leer.

  - Alter Schlüssel bleibt unverändert; Sicherheitskopie vor Import.

  - Gesperrter Speicher.

- **eingabe.test.js** wird für MAS-30 und MAS-31 ergänzt.
- **Service-Worker-Liste:** ein Test, dass jede Datei in js/ und js/ansichten/ in APP_DATEIEN steht.

## 12. Risiken

| **#** | **Risiko** | **Umgang** |
|---|---|---|
| R5 | Wake Lock funktioniert in Home-Bildschirm-Apps erst ab **iOS 18.4** ([WebKit-Bug 254545](https://bugs.webkit.org/show_bug.cgi?id=254545)). | Einmaliger Hinweis (AK5). QA prüft am iPhone der Enduserin, welche iOS-Version läuft. |
| R6 | Das Datenmodell wird größer, und damit steigt das Risiko, beim Laden Daten zu verlieren. | Neuer Schlüssel statt Überschreiben, der alte Schlüssel bleibt, Sicherheitskopie vor jedem Import, pruefeDaten verwirft nie still ganze Projekte. Ein ungültiges Strickstück wird repariert (Ausgangswerte), nicht gelöscht. |
| R7 | app.js aus Sprint 1 wird in Ansichten zerlegt (Umbau). | Rechenwege nicht verändern. Die Browser-Tests von QA aus Sprint 1 (Referenzwerte in der Oberfläche) laufen erneut. |
| R8 | Teilen wird abgebrochen oder ist im Browser nicht verfügbar. | AbortError wird still behandelt, ersatzweise wird heruntergeladen. |
| R1 | Safari löscht nach 7 Tagen ohne Nutzung (ohne Installation) | Wird mit US-12 entschärft. In der README steht die Empfehlung, regelmäßig zu sichern. |
