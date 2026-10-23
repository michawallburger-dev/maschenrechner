# Projektstatus Maschenrechner

Kurze Übergabe zwischen Sessions und Rechnern. Bei Widerspruch zu `git log` gilt `git log`.

- **Aktiver Branch:** `sprint-4`
- **Veröffentlicht:** Version 0.3.0 auf https://michawallburger-dev.github.io/maschenrechner/
- **Sprint:** 3 **abgeschlossen** – Praxistest MAS-56 am 21.10.2026 bestanden, Epic MAS-3
  geschlossen
- **Rolle:** QA, **Nachtest zu `cf49a64` abgeschlossen** – Ergebnis **Freigabe** für 0.4.0.
  Bericht: Abschnitt „Nachtest" in `docs/qa/sprint-4-testbericht.md`.
  S4-01 bis S4-05 behoben, S4-06 dokumentiert; vier neue niedrige Befunde S4-07 bis S4-10
  (ohne Jira-Vorgang, der Product Owner entscheidet).
- **Tests:** 311 Tests, 307 grün, 0 rot, 4 `todo` (die vier neuen Befunde), davon 24 neue in
  `tests/qa-sprint4-nachtest.test.js`. Ohne die Nachtest-Datei: 287 grün, 0 `todo`.
- **Letzte Freigabe:** Sprint-4-Umfang, E24 bestätigt, E25 mit der Enduserin klären, US-25 und
  US-38 gemeinsam planen (22.10.2026)
- **CI:** läuft bei jedem Push (`.github/workflows/test.yml`)
- **Jira-Releases:** 0.1.0 (16.10.), 0.2.0 (16.10.), 0.3.0 (17.10.) angelegt; alle 40 erledigten
  Vorgänge zugeordnet
- **Branches:** `sprint-2` und `sprint-3` auf GitHub gelöscht (beide ohne eigene Arbeit)

## Nächster Schritt

**1. Jira-Buchführung ist nachgeholt (23.10.2026).** Alle neun Vorgänge stehen auf
**Erledigt**, jeder mit Kommentar und Commit-Beleg: MAS-57 (`56941ef`), MAS-58 (`de71e8b`),
MAS-62 (`aa3e57d`), MAS-59 (`df3d59c`), MAS-64 bis MAS-67 (`cf49a64`), MAS-68 als
Dokumentationsänderung mit Verweis auf R13. Vor dem Schreiben abgefragt, nichts doppelt
eingetragen.

Zwei Punkte stehen als Kommentar am Vorgang, damit sie nicht untergehen: **MAS-57 AK4 ist
offen** – die Enduserin hat die neuen Kartentitel noch nicht bestätigt, das leistet erst der
Praxistest von 0.4.0. **MAS-59 AK6** ist in der neuen Lesart vermerkt (Kurzfassung statt
erzwungenem Aufklappen, Architektur v4.3 Abschnitt 5.4).

Das Epic **MAS-60 bleibt offen** – es schließt nach der Freigabe des Merges, nicht vorher.

**2. Nachtest durch die QA – erledigt am 23.10.2026: Freigabe.** Geprüft gegen Commit `cf49a64`,
am Code und im Browser bei 360 × 640 px. Die Messwerte des Entwicklers sind bestätigt, bis auf
die Höhe der Zähleransicht mit Wachhalter-Hinweis (gemessen 749 px statt 773 px; dass sie
scrollt, stimmt). Offen bleiben die neuen niedrigen Befunde S4-07 bis S4-10.

**3. Danach:** Merge nach `main` – das veröffentlicht 0.4.0 über GitHub Pages –, Datum im
CHANGELOG eintragen, Praxistest am iPhone mit der Enduserin.

## Stand der Nachbesserung (23.10.2026, Commit cf49a64)

287 Tests, alle grün, keine `todo`-Tests mehr. Behoben: S4-01 bis S4-05. S4-06 nur dokumentiert.

**Im Browser bei 360 × 640 px nachgemessen** – diese Werte soll der Nachtest bestätigen oder
widerlegen:

- Dreieck 7 px in `--text-leise`, bei offener Karte um 90° gedreht, bei zugeklappter nicht.
  `summary` weiter 44 px hoch, kein Querscrollen.
- Zugeklappte Plan-Karte mit Startreihe 999 zeigt „Bitte prüfen: Für 17 Zu-/Abnahmen gibt es keine
  passende Reihe …" und bleibt zugeklappt. Mit gültigem Wert wieder „17 × 2 M zunehmen, alle
  9–10 Reihen", das Attribut `data-problem` verschwindet.
- Auswahlfeld der Zielquelle 227 px breit bei 360 px Sicht, mit dem längeren Namen
  „Aus Länge (cm) → Reihen".
- Zähleransicht unverändert genau 640 px ohne den Wachhalter-Hinweis, mit ihm 773 px.

**Abweichung vom Entwurf, freigegeben:** Fehler und Statusmeldungen gehen in die Kurzfassung,
statt die Karte erzwungen aufzuklappen. US-38 AK6 ist entsprechend zu lesen; die neue Fassung
steht in `docs/architektur/sprint-4-architektur.md` v4.3, Abschnitt 5.4.


## Sprint 4 „Überblick beim Stricken" – Epic MAS-60, Ziel Version 0.4.0
Alle Punkte stammen aus dem Praxistest von 0.3.0 am 21.10.2026 (MAS-56, bestanden).

| # | Jira | Was | Priorität |
|---|---|---|---|
| 1 | MAS-57 | **P3-01** Kartentitel „Breite in Maschen" und „Länge in Reihen" berichtigen – dort werden Zentimeter eingegeben, die Enduserin hat Maschen eingetragen | Muss |
| 2 | MAS-58 | **US-37** Plan und Reihenzähler zeigen die Maschenzahl nach jedem Zu-/Abnahmeereignis | Muss |
| 3 | MAS-62 | **US-39** Startreihe der Zu-/Abnahmen selbst festlegen | Muss |
| 4 | MAS-59 | **US-38** Kacheln der Strickstück-Ansicht auf Wunsch zusammenklappen | Soll |
| – | MAS-61 | Entscheidung **E25** mit der Enduserin klären – **erledigt** am 22.10.2026 | – |

MAS-29 (US-25, Proben automatisch einklappen) ist dafür zurück in den Backlog gegangen (E29).
MAS-58 vor MAS-62, weil US-37 nur Anzeige ergänzt, während US-39 die Reihenlogik ändert – so
greift der Regressionsschutz aus US-39 AK9 auf einem fertig getesteten Stand.

Das Kürzel **P3** bezeichnet Befunde aus dem Praxistest von Sprint 3, in Abgrenzung zu den
QA-Befunden S3-01 bis S3-06. Die Definition of Done steht in der Beschreibung von MAS-60.

## Unterlagen
Am 22.10.2026 vollständig aus dem Claude-Projekt „Stricken und Häckeln" übernommen: die drei
Architekturdokumente (`docs/architektur/`), die drei QA-Testberichte (`docs/qa/`), der Backlog v2.6
als eingefrorener Schnappschuss sowie die Anforderungsbeschreibung der Enduserin und die
Excel-Formeln (`docs/anforderungen/`). Die Entscheidungen E1–E28 stehen vollständig in
`docs/entscheidungen.md`. **Es fehlt nichts mehr.**

**Absichtlich nicht im Repo:** die Ausgangs-Excel `Maschenrechner.xlsx`. Sie trägt in ihren
Dokumenteigenschaften den Namen der Enduserin, und das Repo ist öffentlich. Fachlich wird sie nicht
gebraucht – ihre Formeln und Referenzwerte stehen in `docs/anforderungen/excel-formeln.md`.

## Offen
- **MAS-46** (S2-09): doppelte 64-stellige IDs in einer Sicherung ergeben eine zu lange Ersatz-ID.
  Einziger offener Fehler.
- **18 offene Jira-Vorgänge** (gezählt am 23.10.2026). Aus Sprint 4 ist nur noch das Epic
  **MAS-60** offen; es schließt nach der Freigabe des Merges.
- **Vier neue QA-Befunde S4-07 bis S4-10** aus dem Nachtest, alle niedrig bzw. kosmetisch und
  **ohne Jira-Vorgang** – der Product Owner entscheidet, was davon in den Backlog geht.
  S4-07 ist der gewichtigste: Die Plan-Karte verbirgt zugeklappt ihren eigenen Hinweis
  „Bitte zuerst die eigene Probe … ausfüllen“, weil `problemText()` nur `.fehler` und
  `[data-rolle="status"]` kennt. Damit ist der Zweck von US-38 AK6 noch nicht ganz erfüllt.
  Einzelheiten im Abschnitt „Nachtest“ des Testberichts.
- **E24 hängt an US-39:** Wird sie umgesetzt, ist „erste Reihe bleibt frei" nur noch eine
  Vorbelegung. Beim Umsetzen in `docs/entscheidungen.md` nachtragen. Die Zählerfeld-Variante a
  aus E22 ist unverändert bestätigt.
- **Tags:** v0.2.0 und v0.3.0 fehlen (wird später nachgezogen).
- **Branch `setup/projektregeln`** ist gemergt und kann auf GitHub gelöscht werden.

## Jira ist abgeglichen (23.10.2026)

Der Abgleich aus E29 ist vollständig: MAS-62 hängt an Epic MAS-60 mit Version 0.4.0 und Label
`sprint-4`, MAS-29 wieder an MAS-4 ohne Version. Die Beschreibungen von MAS-60 und MAS-62 sind auf
dem Stand nach dem Tausch.

**Nachtrag zur Störung vom 22.10.:** Die beiden Schreibvorgänge, die damals in Zeitüberschreitungen
liefen, sind serverseitig später doch angekommen (16:09 und 16:28) – nach Sitzungsende. Eine
Zeitüberschreitung beim Atlassian-MCP heißt also **nicht**, dass der Schreibvorgang verloren ist.
Vor dem Wiederholen immer erst per Abfrage den Ist-Stand prüfen, sonst schreibt man doppelt.
