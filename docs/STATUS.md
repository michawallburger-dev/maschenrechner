# Projektstatus Maschenrechner

Kurze Übergabe zwischen Sessions und Rechnern. Bei Widerspruch zu `git log` gilt `git log`.

- **Aktiver Branch:** `sprint-4`
- **Veröffentlicht:** Version 0.3.0 auf https://michawallburger-dev.github.io/maschenrechner/
- **Sprint:** 3 **abgeschlossen** – Praxistest MAS-56 am 21.10.2026 bestanden, Epic MAS-3
  geschlossen
- **Rolle:** QA **abgeschlossen** (23.10.2026) – Ergebnis **Zurück an Entwickler**. Bericht:
  `docs/qa/sprint-4-testbericht.md`. Keine kritischen oder hohen Befunde; zwei mittlere an der
  Klapp-Funktion (MAS-64, MAS-65), vier niedrige (MAS-66, MAS-67, MAS-68).
- **Tests:** 287 Tests, 285 grün, 0 rot, 2 `todo` (vorher 245), davon 42 neue in
  `tests/qa-sprint4.test.js`
- **Letzte Freigabe:** Sprint-4-Umfang, E24 bestätigt, E25 mit der Enduserin klären, US-25 und
  US-38 gemeinsam planen (22.10.2026)
- **Tests:** 224 Tests, alle grün (Node.js 22.16); CI läuft bei jedem Push
- **Jira-Releases:** 0.1.0 (16.10.), 0.2.0 (16.10.), 0.3.0 (17.10.) angelegt; alle 40 erledigten
  Vorgänge zugeordnet
- **Branches:** `sprint-2` und `sprint-3` auf GitHub gelöscht (beide ohne eigene Arbeit)

## Nächster Schritt
**Rolle Entwickler, Nachbesserung.** Die QA hat am 23.10.2026 **„Zurück an Entwickler“** gegeben.
Zu beheben sind mindestens die beiden mittleren Befunde:

| Befund | Jira | Schwere | Kurz |
|---|---|---|---|
| S4-01 | MAS-64 | mittel | `summary { display: flex }` nimmt das Aufklapp-Dreieck weg – nicht erkennbar, dass und ob eine Karte klappt |
| S4-02 | MAS-65 | mittel | Zugeklappte Karte verbirgt die Statusmeldung (z. B. „keine passende Reihe“) vollständig; Kurzfassung bleibt leer |
| S4-03 | MAS-66 | niedrig | Karte mit sichtbarem Eingabefehler lässt sich wieder zuklappen und bleibt zu |
| S4-04/05 | MAS-67 | niedrig | „ab der ersten“ am Schalter „nur jede 2.“ und „Länge in Reihen“ als Zielquelle im Zähler |
| S4-06 | MAS-68 | niedrig | 0.3.0 liest Daten von 0.4.0, löscht Startreihe und Klapp-Zustand aber beim nächsten Speichern (R13) |

Alle fünf Vorgänge hängen an Epic MAS-60, Label `qa-sprint-4`, Version 0.4.0.

**Außerdem offen:** Die vier Sprint-Vorgänge MAS-57, MAS-58, MAS-62 und MAS-59 stehen in Jira noch
auf „Zu erledigen“ und gehören auf „Erledigt“. Die Testzahl im `CHANGELOG` (245) ist auf 287 zu
heben.

**Zwei Punkte brauchen die Bestätigung des Product Owners** (im Entwickler-Commit zu MAS-62
ausführlich begründet):

1. Die Beschriftung des neuen Feldes heißt **„Frühestens ab Reihe"**, nicht wie in AK1 vorgesehen
   „Erste Reihe mit Zu-/Abnahme". Die Ereignisse werden gleichmäßig verteilt, das erste liegt also
   in der Regel später – bei Startreihe 4 und 17 Zunahmen beginnt der Plan bei Reihe 10. Die
   vorgesehene Beschriftung hätte genau den Fehler wiederholt, den P3-01 beschreibt.
2. Offene Frage dahinter: Soll die Startreihe die **früheste erlaubte** Reihe sein (so umgesetzt,
   so entworfen) oder die Reihe, in der das **erste Ereignis** liegt? Beim Ärmel könnte Letzteres
   gemeint sein. Das wäre eine eigene Story.

**Für den Praxistest gemessen** (360 × 640 px, lokaler Browser): Die neuen Maschenzahlen kosten
**0 px** zusätzliche Höhe, die Ereigniszeilen bleiben einzeilig. Die Zähleransicht ist dort genau
640 px hoch, passt also – aber **ohne jede Reserve**. Der Hinweis „Bildschirm kann nicht
wachgehalten werden" belegt allein 164 px; wo er erscheint, muss gescrollt werden. Auf dem
installierten iPhone ab iOS 18.4 erscheint er nicht.

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
- **21 offene Jira-Vorgänge**, davon 5 in Sprint 4 und 16 im Backlog für später.
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
