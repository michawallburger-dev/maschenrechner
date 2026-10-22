# Projektstatus Maschenrechner

Kurze Übergabe zwischen Sessions und Rechnern. Bei Widerspruch zu `git log` gilt `git log`.

- **Aktiver Branch:** `sprint-4`
- **Veröffentlicht:** Version 0.3.0 auf https://michawallburger-dev.github.io/maschenrechner/
- **Sprint:** 3 **abgeschlossen** – Praxistest MAS-56 am 21.10.2026 bestanden, Epic MAS-3
  geschlossen
- **Rolle:** Product Owner, Sprint 4 – neue Anforderungen aufgenommen, Umfang noch offen
- **Letzte Freigabe:** Merge der Projektunterlagen nach `main`; Sprint 3 schließen (22.10.2026)
- **Tests:** 224 Tests, alle grün (Node.js 22.16); CI läuft bei jedem Push
- **Jira-Releases:** 0.1.0 (16.10.), 0.2.0 (16.10.), 0.3.0 (17.10.) angelegt; alle 40 erledigten
  Vorgänge zugeordnet
- **Branches:** `sprint-2` und `sprint-3` auf GitHub gelöscht (beide ohne eigene Arbeit)

## Nächster Schritt
**Umfang von Sprint 4 festlegen.** Dazu braucht der Product Owner Prioritäten und die Antworten
auf die offenen Punkte in `docs/entscheidungen.md` (E24, E25, Verhältnis von US-25 zu US-38).
Erst danach übernimmt der Architekt und legt `docs/architektur/sprint-4-architektur.md` an.

## Aus dem Praxistest vom 21.10.2026
Bestanden, keiner der sechs Prüfpunkte beanstandet. Drei neue Vorgänge daraus:

| Jira | Was |
|---|---|
| MAS-57 | **P3-01** Kartentitel „Breite in Maschen" und „Länge in Reihen" sind irreführend – die Enduserin hat dort Maschen statt Zentimeter eingegeben. Priorität hoch. |
| MAS-58 | **US-37** Plan und Reihenzähler zeigen die Maschenzahl nach jedem Zu-/Abnahmeereignis |
| MAS-59 | **US-38** Kacheln der Strickstück-Ansicht zusammenklappen |

Alle drei hängen vorläufig an Epic MAS-4 „Spätere Ausbaustufen" und wandern in das Sprint-4-Epic,
sobald der Umfang steht. Das Kürzel **P3** bezeichnet Befunde aus dem Praxistest von Sprint 3, in
Abgrenzung zu den QA-Befunden S3-01 bis S3-06.

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
- **19 offene Jira-Vorgänge** (16 aus dem Backlog plus die drei neuen aus dem Praxistest).
- **Vorläufige Entscheidungen** E24 und E25 – gehören in den nächsten Product-Owner-Durchgang,
  siehe Ende von `docs/entscheidungen.md`. Die Zählerfeld-Variante a aus E22 ist durch den
  Praxistest bestätigt.
- **Tags:** v0.2.0 und v0.3.0 fehlen (wird später nachgezogen).
