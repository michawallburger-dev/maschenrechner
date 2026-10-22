<!-- Original aus dem Claude-Projekt „Stricken und Häckeln“, dort als architektur/sprint-3-architektur.md geführt.
     Am 22.10.2026 aus dem Word-Export ins Repo übernommen; Inhalt unverändert,
     nur das Format ist jetzt Markdown. Abgeschlossen mit v0.3.0. Baut auf Sprint 2 auf. Aktueller Stand. -->

# Architekturdokument – Maschenrechner, Sprint 3 (Version 3.1)

**Änderungen in v3.1** (17.10.2026): Grenze ZU_VIELE_EREIGNISSE auf 9999 gesetzt (H1), Bedeutung des Zählerstands bestätigt (R11).

Rolle: Architekt · Grundlage: anforderungen/product-backlog.md v2.5, Sprint 3 (US-32, US-13, US-14, US-15, US-30, US-16, US-33; E16–E27) · Baut auf architektur/sprint-2-architektur.md v2.0 auf. Alles dort Festgelegte gilt weiter, sofern hier nichts anderes steht.

## 1. Was sich gegenüber Sprint 2 ändert

| **Bereich** | **Sprint 2** | **Sprint 3** |
|---|---|---|
| Proben | genau ein Paar je Projekt, Nadel am Projekt | **Liste von Proben** je Projekt (Paar + Name + Nadel), jedes Strickstück verweist auf genau eine (probeId) |
| Strickstück | 4 Rechner, Zähler | zusätzlich **höchstens ein Plan** (Zu-/Abnahmen) und die gewählte **Zielquelle** |
| Rechenlogik | rechner.js | neu plan.js (Zu-/Abnahmeplan, Verteilung) und ziel.js (Ziel, gestrickte Länge, Ereignisse rund um die aktuelle Reihe) – beide rein |
| Speicherung | Schlüssel maschenrechner.daten.v2 (Schema 2) | neuer Schlüssel maschenrechner.daten.v3 (Schema 3); .v2 und maschenrechner.zustand bleiben unverändert als Rückfallebene |
| Zähleransicht | Zahl, +1/−1 | Ereignisbereich (letzte/nächste/übernächste), Hinweis „Jetzt“, Ziel „X von Y“, Länge in cm, Zielquellen-Auswahl, Zahl mit sichtbarem Rahmen und Stift |

**Technologie bleibt unverändert:** PWA, HTML/CSS/Vanilla-JS (ES-Module), kein Build-Schritt, keine Abhängigkeiten, GitHub Pages, node --test, localStorage. Ein Projekt mit 4 Strickstücken, 3 Proben und Plänen bleibt unter 6 KB; ein Wechsel zu IndexedDB ist weiterhin nicht nötig.

## 2. Dateistruktur (neu:** **★****, ge****ä****ndert:** **✎****)

```text
maschenrechner/
├── index.html            ✎ Vorlagen: Probenkarte, Plan-Karte, Zähler neu, Auswahl-Dialog
├── sw.js                 ✎ CACHE_NAME 'maschenrechner-v0.3.0', neue Dateien in APP_DATEIEN
├── css/style.css         ✎ Probenkarten, Plan-Liste, Zähler (Ereignisse, Hinweis, Feldrahmen), neue Farb-Token
├── js/
│   ├── rechner.js           (unverändert)
│   ├── plan.js           ★ REIN: Zu-/Abnahmeplan berechnen und verteilen (US-13, US-16)
│   ├── ziel.js           ★ REIN: Zielquellen, Ziel wählen, gestrickte Länge, Ereignisse um die aktuelle Reihe (US-15, US-30)
│   ├── eingabe.js        ✎ neue Regel `proEreignis`
│   ├── format.js         ✎ neu `formatVorzeichenGanz` („+2“, „−2“)
│   ├── texte.js          ✎ neue Texte
│   ├── modell.js         ✎ Schema 3: Proben, Zuordnung, Plan, Zielquelle; pruefeDaten v3
│   ├── migration.js      ✎ zusätzlich `vonSchema2` (US-32 AK8)
│   ├── sicherung.js      ✎ liest Schema 2 und 3, schreibt Schema 3 (US-32 AK9, US-14 AK5)
│   ├── speicher.js       ✎ Ladereihenfolge v3 → v2 → v1 → leer
│   ├── dom.js            ✎ neu `waehle({ titel, optionen })` (Radio-Dialog), `frageStrickstueck()` (Name + ggf. Probe)
│   ├── ansichten/
│   │   ├── projekt.js       ✎ Probenliste, Strickstückliste mit Probe und Plan-Kurzinfo
│   │   ├── strickstueck.js  ✎ Probe-Kurzfassung + „Probe wechseln“, Plan-Karte
│   │   ├── plankarte.js  ★ Aufbau und Ereignisse der Karte „Zu- und Abnahmen“
│   │   └── zaehler.js       ✎ Ereignisse, Hinweis, Ziel, Länge, Zielquelle, Feldrahmen
│   └── (übrige Module unverändert)
└── tests/
├── plan.test.js          ★ inkl. Eigenschaftstests
├── ziel.test.js          ★
├── migration-v3.test.js  ★
├── modell-v3.test.js     ★
└── sicherung-v3.test.js  ★
```

**Abhängigkeiten (nur in eine Richtung, keine Zyklen)**

ansichten/*.js ──► plan.js · ziel.js        (zusätzlich zu Sprint 2)

ziel.js ──► rechner.js · plan.js

plan.js ──► rechner.js                      (nur `runden`, `cmZuAnzahl`, `anzahlZuCm`)

plan.js und ziel.js greifen nicht auf DOM, navigator oder Speicher zu, werfen keine Ausnahmen und bekommen bereits geprüfte Zahlen.

## 3. Datenmodell (Schema 3)

json

{

"schemaVersion": 3,

"einstellungen": { "sprache": "de", "laengeneinheit": "cm", "farbschema": "system" },

"hinweise": { "projektlisteErklaert": true, "wachhaltenNichtMoeglich": false },

"projekte": [{

"id": "p-1b9d6bcd", "name": "Pullover für meinen Sohn", "beschreibung": "", "garn": "Merino 4-fach",

"erstellt": "…", "geaendert": "…",

"proben": [

{ "id": "pr-0a1b", "name": "Glatt", "nadelstaerkeMm": "3,5",

"anleitung": { "maschenAnzahl": "34", "maschenBezug": "10", "reihenAnzahl": "52", "reihenBezug": "10" },

"eigen":     { "maschenAnzahl": "25", "maschenBezug": "10", "reihenAnzahl": "37", "reihenBezug": "10" } },

{ "id": "pr-7c2d", "name": "Ärmel", "nadelstaerkeMm": "3,0", "anleitung": {…}, "eigen": {…} }

],

"strickstuecke": [{

"id": "s-6f1c2a90", "name": "Ärmel links", "erstellt": "…", "geaendert": "…",

"probeId": "pr-7c2d",

"rechner": { … wie Schema 2 … },

"zaehler": 42,

"zielQuelle": null,

"plan": {

"anfangBreite": "20", "endBreite": "34", "laenge": "45",

"maschenProEreignis": "2", "arbeitsweise": "reihen", "jedeZweite": false,

"ereignisWahl": null,

"anpassung": { "anfang": "0", "ende": "0", "reihen": "0" }

}

}]

}]

}

**Regeln**

- Eingaben bleiben Text (wie bisher). Ausnahmen: zaehler (ganze Zahl), jedeZweite (boolesch).
- projekt.nadelstaerkeMm entfällt; die Nadel steht an der Probe (E18).
- Probenname: getrimmt, 1–40 Zeichen, muss nicht eindeutig sein. Neue Proben heißen „Probe n“ (nächste freie Zahl).
- arbeitsweise: "reihen" oder "runden". ereignisWahl: null, "weniger" oder "mehr" (Abschnitt 4.3). zielQuelle: null, "plan", "laengeZuReihen" oder "reihenAusAnleitung".
- plan: null heißt „kein Plan“. „Plan anlegen“ erzeugt die Vorbelegung: Breiten und Länge leer, 2 M, Reihen, jedeZweite: false, Anpassungen "0".

**modell.js – neue und geänderte Funktionen (alle rein)**

| **Funktion** | **Zweck** |
|---|---|
| neueProbe(daten, projektId, id, jetzt) | Leere Probe „Probe n“, Bezugsmaße auf standardBezug |
| probeAendern(daten, projektId, probeId, felder, jetzt) | Name, Nadel, Anleitungs- oder eigene Probe |
| probeLoeschen(daten, projektId, probeId) | Liefert { daten } oder { daten: unverändert, fehler: 'PROBE_VERWENDET', stuecke: [Namen] } bzw. fehler: 'LETZTE_PROBE' (E20) |
| neuesStrickstueck(daten, projektId, name, probeId, id, jetzt) | ✎ jetzt mit probeId (Pflicht) |
| strickstueckProbeSetzen(daten, projektId, stueckId, probeId, jetzt) | „Probe wechseln“; Rechner, Plan und Zähler bleiben (US-32 AK5) |
| planAnlegen / planAendern(…, felder) / planLoeschen | US-14 |
| zielQuelleSetzen(daten, projektId, stueckId, quelle, jetzt) | US-30 AK7 |
| probeVon(projekt, stueck) | Probe des Strickstücks oder null |
| pruefeDaten(roh) | ✎ prüft Schema 3 (siehe 5.3) |

## 4. Zu-/Abnahmeplan (plan.js, US-13, US-16)

### 4.1 Ablauf von berechnePlan(eingaben, probeEigen)

eingaben = geprüfte Zahlen { anfangCm, endCm, laengeCm, proEreignis, runden, jedeZweite, ereignisWahl, anpassung: { anfang, ende, reihen } }; probeEigen = { maschen: {anzahl, bezugCm}, reihen: {anzahl, bezugCm} }.

- **Grundwerte (AK2):** anfangGerundet = runden(cmZuAnzahl(anfangCm, maschen)), ebenso endGerundet und reihenGerundet (mit der Reihenprobe). Regel runden aus Sprint 1 (Gleitkomma-Bereinigung).
- **Anpassungen (US-16):** anfang = anfangGerundet + anpassung.anfang, ende = endGerundet + anpassung.ende, reihen = reihenGerundet + anpassung.reihen. Ist einer < 1 → fehler: 'ERGEBNIS_ZU_KLEIN' (wie Sprint 1). Dazu je tatsächliche cm über anzahlZuCm.
- **Richtung (AK3):** differenz = ende − anfang. 0 → { gueltig: true, keinPlan: true }.
- **Teilbarkeit (AK4):** rest = |differenz| mod proEreignis. Ist rest ≠ 0:

  - weniger: E = floor(|differenz| / proEreignis), Endmaschen = anfang ± E·proEreignis

  - mehr: E = ceil(|differenz| / proEreignis), Endmaschen entsprechend

  - Eine Option, deren Endmaschen < 1 wären (nur bei Abnahmen möglich), oder mit E = 0 entfällt.

  - Ohne gültige ereignisWahl → { gueltig: true, auswahlNoetig: true, optionen: [{ wahl, endMaschen, endCm, ereignisse }] }, kein Plan.

  - Die Wahl ist **richtungsneutral** gespeichert und bleibt bei geänderten Eingaben sinnvoll. Wird die Differenz teilbar (auch durch die Anpassung „ende“), wird die Wahl ignoriert, aber nicht gelöscht. So „ersetzt“ die Anpassung der Endmaschen die Auswahl (US-16 AK2).

- **Verfügbare Reihen (E24, E25):** Liste S der erlaubten Reihen:

  - normal: alle Reihen 2 … reihen − 1

  - „nur jede 2. Reihe/Runde“: nur **ungerade** Reihen 3, 5, 7 … ≤ reihen − 1 (gilt gleichermaßen für Reihen und Runden)

- **Zu wenig Platz (AK7):** E > S.length → fehler: 'ZU_WENIG_REIHEN', moeglich: S.length.
- **Technische Grenze:** E > 9999 → fehler: 'ZU_VIELE_EREIGNISSE' (Schutz der Oberfläche vor sehr langen Listen; vom PO bestätigt, siehe H1).
- **Verteilung (AK6)** – verbindliche Regel, nur Ganzzahl-Arithmetik:

js

// Ereignis i (0 … E−1) liegt auf S[ floor((i + 1) · (|S| + 1) / (E + 1)) − 1 ]

export function verteile(anzahlEreignisse, slots) {

const n = slots.length, e = anzahlEreignisse, ergebnis = [];

for (let i = 0; i < e; i++) ergebnis.push(slots[Math.floor(((i + 1) * (n + 1)) / (e + 1)) - 1]);

return ergebnis;

}

Die Ereignisse liegen dadurch symmetrisch mit möglichst gleichem Abstand zu Anfang, Ende und untereinander. Geprüft vor Freigabe: 160 400 Kombinationen (Reihen 1–400, alle E, mit/ohne „jede 2.“) → keine doppelten Reihen, keine Randreihe belegt, bei „jede 2.“ nur ungerade Reihen ≥ 3, Abstände unterscheiden sich um ≤ 1 bzw. ≤ 2.

- **Ergebnis:** { gueltig: true, richtung: 'zu'|'ab', anfang, ende, reihen, anfangCm, endCm, laengeCm, proEreignis, ereignisse: [{ reihe, maschen: ±proEreignis }], abstandMin, abstandMax, auswahl? }.

### 4.2 Referenzfall (Backlog „Referenzwerte für Sprint 3“)

20 → 34 cm, 45 cm, eigene Probe 25 M / 37 R je 10 cm, 2 M → 50 → 85 M, 167 Reihen, Differenz 35 → Auswahl:

| **Wahl** | **Endmaschen** | **Endbreite** | **Ereignisse** | **Reihen (normal)** | **Zusammenfassung** |
|---|---|---|---|---|---|
| weniger | 84 | 33,60 cm | 17 | 10, 19, 28, 37, 47, 56, 65, 74, 84, 93, 102, 111, 120, 130, 139, 148, 157 | 17 × 2 M zunehmen, alle 9–10 Reihen |
| mehr | 86 | 34,40 cm | 18 | 9, 18, 27, 35, 44, 53, 62, 70, 79, 88, 97, 105, 114, 123, 132, 140, 149, 158 | 18 × 2 M zunehmen, alle 8–9 Reihen |

Mit „nur jede 2. Reihe“ (17 Ereignisse): 9, 19, 27, 37, 47, 55, 65, 73, 83, 93, 101, 111, 119, 129, 139, 147, 157 – alle ungerade, Abstände 8–10. Diese drei Listen sind Pflicht-Testfälle.

### 4.3 Zusammenfassung und Texte

- Zeile je Ereignis: „Reihe 10: 2 M zunehmen“ bzw. „Runde 10: …“ (je nach arbeitsweise).
- Zusammenfassung: „17 × 2 M zunehmen, alle 9–10 Reihen“; bei gleichem Abstand „alle 9 Reihen“; bei einem Ereignis „1 × 2 M zunehmen in Reihe 84“.
- Kurzinfo für die Projektansicht (US-14 AK3): planKurzinfo(ergebnis) → „17 × 2 M zunehmen“ bzw. „Auswahl nötig“ / „–“.

## 5. Ziel und Ereignisse im Zähler (ziel.js, US-15, US-30)

### 5.1 Zielquellen (E23, E26)

zielQuellen(stueck, probe) liefert die **gültigen** Quellen in fester Reihenfolge:

| **Quelle** | **Zielreihen** | **Ziellänge** |
|---|---|---|
| plan | reihen (endgültig, inkl. Anpassung) | laengeCm (tatsächlich) |
| laengeZuReihen | endgueltig aus US-06 | cmTatsaechlich |
| reihenAusAnleitung | endgueltig aus US-04 | cmTatsaechlich |

Der Plan zählt als gültige Quelle, sobald reihen gültig ist – auch wenn noch eine Auswahl nach 4.1 Schritt 4 aussteht.

waehleZiel(quellen, gespeicherteWahl):

- keine Quelle → null (AK5)
- gespeicherte Wahl gültig → diese
- sonst die erste der Liste (Reihenfolge Plan, „Länge in Reihen“, „Reihen aus Anleitung“; AK7)
- auswahlAnzeigen = quellen.length ≥ 2

### 5.2 Länge und Ereignisse

- gestrickteLaengeCm(reihe, probeEigen) = reihe × reihenBezug ÷ reihenAnzahl (AK3); null, wenn die Reihenprobe ungültig ist.
- ereignisseUm(ereignisse, reihe) → { letzte, naechste, uebernaechste, jetzt }:

  - jetzt = Ereignis mit reihe === aktuelle Reihe oder null

  - letzte = größtes Ereignis **kleiner** als die aktuelle Reihe

  - naechste, uebernaechste = die beiden kleinsten **größer** als die aktuelle Reihe

  - Referenz: Ereignisse 16 (−1), 22 (−2), 25 (−3); Reihe 20 → 16 / 22 / 25; Reihe 22 → jetzt 22 (−2), letzte 16, nächste 25, übernächste –.

  - Die Funktion nimmt eine beliebige Ereignisliste. Der Referenzfall mit unterschiedlichen Maschenzahlen (−1/−2/−3) wird damit getestet, auch wenn ein Plan aus US-13 immer gleiche Maschenzahlen erzeugt.

- zielErreicht(reihe, ziel) = ziel && reihe >= ziel.reihen.

## 6. Speicherung, Übernahme und Sicherung

### 6.1 Übernahme aus 0.2 (migration.js, US-32 AK8)

vonSchema2(v2, ids):

- je Projekt eine Probe „Probe 1“ (Text aus texte.js) mit anleitung = probeAnleitung, eigen = probeEigen und nadelstaerkeMm = projekt.nadelstaerkeMm
- jedes Strickstück: probeId = diese Probe, plan: null, zielQuelle: null
- alle übrigen Felder unverändert; ids wird übergeben (rein, testbar)

### 6.2 Ladereihenfolge (speicher.js)

- maschenrechner.daten.v3 → pruefeDaten
- sonst maschenrechner.daten.v2 → prüfen (Schema 2) → vonSchema2 → unter .v3 speichern
- sonst maschenrechner.zustand (0.1) → vonSchema1 → vonSchema2 → .v3
- sonst leer

Alte Schlüssel werden **nie verändert oder gelöscht**. Schlägt Schritt 2 oder 3 fehl, gilt das Verhalten aus Sprint 2 (Hinweis beschaedigt, alte Daten bleiben).

Sicherheitskopie vor Import: maschenrechner.daten.v3.vorImport.

### 6.3 pruefeDaten für Schema 3 – Reparatur statt Verwerfen (R6)

- Projekt ohne Proben → eine leere „Probe 1“ wird ergänzt.
- probeId zeigt auf keine Probe des Projekts → erste Probe zuordnen.
- Ungültiger plan (falsche Typen) → Felder auf Vorbelegung, plan bleibt erhalten; plan kein Objekt → null.
- Unbekannte arbeitsweise/ereignisWahl/zielQuelle → Standardwert bzw. null.
- Proben-IDs werden wie Projekt-IDs geprüft (gemeinsames Muster aus MAS-43).

### 6.4 Datensicherung (sicherung.js, US-32 AK9, US-14 AK5)

- Format bleibt "format": 1, appVersion: "0.3.0", Daten in Schema 3.
- leseSicherung akzeptiert daten.schemaVersion 2 **und** 3; Schema 2 wird über vonSchema2 übernommen. Die Zusammenfassung vor dem Einlesen nennt zusätzlich die Zahl der Proben.

## 7. Oberfläche

### 7.1 Projektansicht (US-32, US-14)

- Abschnitt **„Maschenproben“**: je Probe eine Karte (<section> mit h3) mit Name, Nadelstärke und den beiden Proben-Fieldsets aus Sprint 2. Unten „Probe hinzufügen“ und je Karte „Probe löschen“.
- Löschen einer verwendeten Probe: Hinweisdialog „Diese Probe wird noch von Ärmel links und Ärmel rechts verwendet. Ordne den Strickstücken zuerst eine andere Probe zu.“ – nur OK, nichts wird gelöscht (AK7).
- Strickstückliste: Zusatzzeile „Reihe 42 · Probe: Ärmel · 17 × 2 M zunehmen“.
- „Strickstück hinzufügen“: frageStrickstueck() – Name; bei mehreren Proben im selben Dialog eine Radiogruppe „Welche Probe gilt?“ ohne Vorauswahl (Anlegen erst nach Wahl). Bei einer Probe wird sie still zugeordnet (E17).
- Ohne US-25 werden lange Projektansichten in Kauf genommen (E27).

### 7.2 Strickstück-Ansicht

- Kopf: Probe-Kurzfassung „Probe: Ärmel · Nadel 3,0 mm · Anleitung 34 M / 52 R · Eigene 20 M / 30 R je 10 cm“ und Knopf **„Probe wechseln“** → waehle()-Dialog mit allen Proben (aktuelle vorausgewählt). Bei nur einer Probe öffnet der Knopf stattdessen die Projektansicht an den Proben.
- Die vier Rechner unverändert.
- Karte **„Zu- und Abnahmen“** (plankarte.js):

  - ohne Plan: kurzer Text und Knopf „Plan anlegen“

  - Eingaben: Anfangsbreite, Endbreite, Länge (cm), Maschen pro Ereignis; Arbeitsweise als Radiogruppe „In Reihen (gewendet) / In Runden“; Kontrollkästchen „Nur jede 2. Reihe/Runde“

  - Ergebnisse: Anfangsmaschen, Endmaschen, Reihen gesamt – je mit −/+-Anpassung, endgültiger Zahl und tatsächlichen cm (US-16, Bauweise der Sprint-1-Rechner)

  - bei auswahlNoetig: Radiogruppe mit beiden Optionen, z. B. „84 M · 33,60 cm · 17 Zunahmen“

  - Zusammenfassung (einzige Live-Region der Karte) und <ol> mit einer Zeile je Ereignis

  - Knöpfe „Anpassungen zurücksetzen“ und „Plan löschen“ (mit Sicherheitsabfrage)

  - Fehler (ZU_WENIG_REIHEN, ZU_VIELE_EREIGNISSE, ERGEBNIS_ZU_KLEIN) als Text am Ergebnis, Liste entfällt

### 7.3 Zähleransicht (US-15, US-30, US-33)

Von oben nach unten (360 × 640 px muss ohne Scrollen passen, +1 bleibt mindestens 96 × 96 px):

- Kopf: Projekt- und Strickstückname (Sprint 2)
- **Ereignisbereich** (nur mit gültigem Plan): <dl> mit drei Zeilen „Letzte · Reihe 16: −1 M“, „Nächste · Reihe 22: −2 M“, „Übernächste · Reihe 25: −3 M“; fehlend „–“ (AK4). Bei Runden „Runde“.
- **Hinweis „Jetzt“** (nur wenn jetzt): Kasten mit Symbol und Text „Jetzt: 2 M abnehmen“, eigene Farb-Token --jetzt-hg / --jetzt-text (Kontrast ≥ 4,5:1 in Hell und Dunkel, dazu fetter Text und Symbol – nie nur Farbe).
- **Reihenfeld** (US-33 Variante a): <input inputmode="numeric"> mit dauerhaftem Rahmen 2 px in --feld-rahmen (Kontrast ≥ 3:1 zum Hintergrund), Stift-Symbol als Inline-SVG im <label> (aria-hidden="true"), Antippen von Zahl oder Stift fokussiert das Feld. Zugänglicher Name „Reihe eingeben“. Rechts daneben „von 50“ (nur mit Ziel).
- **Länge:** „10,00 cm von 13,51 cm“ bzw. nur „10,00 cm“ ohne Ziel; ganz ohne gültige Reihenprobe entfällt die Zeile.
- **Zielquelle** (nur bei ≥ 2 Quellen): <select> „Ziel aus: Zu-/Abnahmeplan | Länge in Reihen | Reihen aus Anleitung“, mindestens 48 px hoch. Die Wahl wird sofort gespeichert.
- **Ziel erreicht:** Hinweistext „Ziel erreicht“ unter dem Feld, solange reihe ≥ ziel.
- +1 / −1 wie Sprint 2.

**Ansagen für Screenreader (ändert Sprint 2, MAS-32):** Statt des Eingabefelds ist ein einziger, visuell versteckter Bereich <p class="nur-sr" aria-live="polite"> die Live-Region. Nach jedem Schritt wird ein Satz gesetzt: „Reihe 22. Jetzt: 2 Maschen abnehmen.“ bzw. „Reihe 50 von 50. Ziel erreicht.“ Gleiche Texte werden kurz geleert und neu gesetzt (S2-08).

### 7.4 Neue Texte (Auszug, texte.js)

probe.standardname („Probe {n}“), probe.verwendet, probe.letzte, strickstueck.probeWaehlen, plan.titel, plan.anlegen, plan.keineAenderung, plan.auswahl, plan.zuWenigReihen („Für {e} Zu-/Abnahmen gibt es nur {s} passende Reihen. Nimm mehr Maschen pro Zu-/Abnahme oder prüfe die Länge.“), plan.zuViele, zaehler.letzte/naechste/uebernaechste, zaehler.jetzt („Jetzt: {m} M {art}“), zaehler.von („von {n}“), zaehler.ziel*, zaehler.zielErreicht, zaehler.reiheEingeben.

## 8. Eingabeprüfung (Ergänzung)

| **Regel** | **Erlaubt** | **Bereich** | **Verwendet für** |
|---|---|---|---|
| proEreignis | ganze Zahl ≥ 1, Tausenderpunkt (E13) | ≤ 99 | Maschen pro Ereignis |
| laenge (bestehend) | Dezimalzahl > 0 | ≤ 9 999 | Anfangs-, Endbreite, Länge |
| anpassung (bestehend) | ganze Zahl, leer = 0 | −9 999 … 9 999 | drei Plan-Anpassungen |

## 9. Datenschutz

Unverändert gegenüber Sprint 1/2: kein Backend, keine fremden Adressen, keine Cookies, keine Tracker, CSP unverändert. Neu gespeichert werden nur Strickmaße, Probennamen und Planeingaben – kein zusätzlicher Personenbezug. Das Stift-Symbol ist Inline-SVG im HTML (keine externe Ressource).

## 10. Tests (Vorgaben für Entwicklung und QA)

- **Bestehende Tests** bleiben grün; Rechner-Referenzwerte zusätzlich mit Probe „Ärmel“ (320 M → 188 M).
- **plan.test.js:**

  - Referenzfall aus 4.2 (beide Optionen, mit und ohne „jede 2.“), Grundwerte 50 / 85 / 167

  - Abnahme (Breiten vertauscht) liefert gespiegelte Richtung und negative Maschenzahl

  - Differenz 0, teilbare Differenz ohne Auswahl, proEreignis 1, Anpassungen inkl. Ergebnis < 1, Anpassung „ende“ macht Differenz teilbar

  - ZU_WENIG_REIHEN (z. B. 3 Reihen, 2 Ereignisse; „jede 2.“ mit 4 Reihen), ZU_VIELE_EREIGNISSE (9999 Ereignisse erlaubt, 10 000 nicht)

  - **Eigenschaftstests** (Reihen 1–400, alle E): Anzahl = E, keine doppelte Reihe, Randreihen frei, „jede 2.“ nur ungerade ≥ 3, Abstände ±1 bzw. ±2, gleiche Eingaben → gleicher Plan, Summe der Maschen = Differenz

- **ziel.test.js:** Zielquellen-Kombinationen (0/1/2/3 gültig, gespeicherte Wahl ungültig → Rückfallreihenfolge), Referenz „37 von 50“ / „10,00 cm von 13,51 cm“, ereignisseUm Referenz 16/22/25, Reihe 0, Reihe nach dem letzten Ereignis.
- **migration-v3.test.js:** Schema 2 → 3 (Probe 1 mit Nadel, Zuordnung), Schema 1 → 3 in einem Durchlauf, alte Schlüssel unverändert.
- **modell-v3.test.js:** Proben anlegen/ändern/löschen inkl. PROBE_VERWENDET und LETZTE_PROBE, Probe wechseln erhält Rechner/Plan/Zähler, pruefeDaten-Reparaturen aus 6.3.
- **sicherung-v3.test.js:** Rundreise Schema 3, Einlesen einer Sicherung aus 0.2.
- **Service-Worker-Liste:** bestehender Test deckt plan.js, ziel.js, ansichten/plankarte.js ab.
- **Browser (QA):** Zähleransicht 360 × 640 ohne Scrollen mit allen Elementen; Kontraste Hinweis „Jetzt“ (≥ 4,5:1) und Feldrahmen (≥ 3:1) in Hell und Dunkel.

## 11. Risiken und Hinweise an den Product Owner

| **#** | **Punkt** | **Umgang** |
|---|---|---|
| R9 | Platz in der Zähleransicht bei 360 × 640 px (Ereignisse, Hinweis, Ziel, Länge, Auswahl) | Kompakte Zeilen (18 px), <select> nur bei ≥ 2 Quellen; QA misst; notfalls rückt der Ereignisbereich in eine Zeile („16 · 22 · 25“). |
| R10 | Schemawechsel v2 → v3 | Neuer Schlüssel, alte bleiben, Reparatur statt Verwerfen, Tests für gespeicherte Daten und Sicherungen |
| R11 | Bedeutung des Zählerstands: Die App behandelt den Zählerstand als „Reihe, in der ich bin“ (US-11). Der Hinweis „Jetzt“ erscheint also, wenn der Zähler auf der Ereignisreihe steht; die gestrickte Länge rechnet mit derselben Zahl. | **Vom PO bestätigt** (17.10.2026); wird zusätzlich im Praxistest mit der Enduserin geprüft. |
| R12 | Plan rechnet bei Änderung von Probe oder Eingaben sofort neu (AK9) – auch während des Strickens verschieben sich dann die Ereignisreihen. | So gewollt; im Praxistest beobachten. |
| H1 | Technische Grenze ZU_VIELE_EREIGNISSE bei mehr als **9999** Ereignissen. Schützt vor unrealistischen Eingaben. | **Vom PO bestätigt** (17.10.2026), Grenze 9999. Die Plan-Liste wird bei vielen Einträgen ohne Live-Region und ohne Neuaufbau je Tastendruck gerendert (Aktualisierung mit 300 ms Verzögerung ab 500 Einträgen). |
| H2 | Der Referenzfall im Zähler (−1/−2/−3) kann aus einem US-13-Plan nicht entstehen (gleiche Maschenzahl je Ereignis). | Wird über die reine Funktion ereignisseUm getestet; kein Fehler in der Anforderung, nur ein Hinweis. |
| R1 | Safari löscht Daten nach 7 Tagen ohne Nutzung (ohne Installation) | wie bisher: Sicherung (US-12) |
