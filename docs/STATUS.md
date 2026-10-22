# Projektstatus Maschenrechner

Kurze Übergabe zwischen Sessions und Rechnern. Bei Widerspruch zu `git log` gilt `git log`.

- **Aktiver Branch:** `setup/projektregeln`
- **Veröffentlicht:** Version 0.3.0 auf https://michawallburger-dev.github.io/maschenrechner/
- **Sprint:** 3 ausgeliefert, aber **nicht abgeschlossen** – Epic MAS-3 ist noch offen
- **Rolle:** keine (Setup-Arbeit, kein Sprint-Schritt)
- **Letzte Freigabe:** Projektunterlagen ins Repo holen, Jira-Releases nutzen, alte Branches
  aufräumen, Tests in CI (22.10.2026)
- **Tests:** 224 Tests, alle grün (Node.js 22.16); CI läuft bei jedem Push
- **Jira-Releases:** 0.1.0 (16.10.), 0.2.0 (16.10.), 0.3.0 (17.10.) angelegt; alle 40 erledigten
  Vorgänge zugeordnet
- **Branches:** `sprint-2` und `sprint-3` auf GitHub gelöscht (beide ohne eigene Arbeit)

## Nächster Schritt
**Praxistest MAS-56** – Version 0.3.0 am iPhone mit der Enduserin, 6 Prüfpunkte. Er ist Teil der
Definition of Done von Sprint 3; 0.3.0 wurde ohne ihn veröffentlicht. Danach Epic MAS-3 schließen,
dann Sprint 4 mit der Rolle Product Owner beginnen.

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
- **16 weitere offene Jira-Vorgänge**, darunter 14 Stories für Sprint 4 und später.
- **Vorläufige Entscheidungen** E24, E25 und die Zählerfeld-Variante a aus E22 – gehören in den
  nächsten Product-Owner-Durchgang, siehe Ende von `docs/entscheidungen.md`.
- **Zwei Sprachnachrichten der Enduserin** vom 21.10.2026 sind noch nicht ausgewertet. Sie liegen
  außerhalb des Repos und müssen angehört und als Text nach Jira gebracht werden.
- **Tags:** v0.2.0 und v0.3.0 fehlen (wird später nachgezogen).
