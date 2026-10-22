# Projektstatus Maschenrechner

Kurze Übergabe zwischen Sessions und Rechnern. Bei Widerspruch zu `git log` gilt `git log`.

- **Aktiver Branch:** `setup/projektregeln`
- **Veröffentlicht:** Version 0.3.0 auf https://michawallburger-dev.github.io/maschenrechner/
- **Sprint:** 3 ausgeliefert, aber **nicht abgeschlossen** – Epic MAS-3 ist noch offen
- **Rolle:** keine (Setup-Arbeit, kein Sprint-Schritt)
- **Letzte Freigabe:** Projektunterlagen ins Repo holen, Jira-Releases nutzen, alte Branches
  aufräumen, Tests in CI (22.10.2026)
- **Tests:** 224 Tests, alle grün (Node.js 22.16)

## Nächster Schritt
**Praxistest MAS-56** – Version 0.3.0 am iPhone mit der Enduserin, 6 Prüfpunkte. Er ist Teil der
Definition of Done von Sprint 3; 0.3.0 wurde ohne ihn veröffentlicht. Danach Epic MAS-3
schließen, dann Sprint 4 mit der Rolle Product Owner beginnen.

## Offen
- **MAS-46** (S2-09): doppelte 64-stellige IDs in einer Sicherung ergeben eine zu lange
  Ersatz-ID. Einziger offener Fehler.
- **17 weitere offene Jira-Vorgänge**, darunter 14 Stories für Sprint 4 und später.
- **Vorläufige Entscheidungen** E18, E24, E25 – gehören in den nächsten
  Product-Owner-Durchgang, siehe Ende von `docs/entscheidungen.md`.
- **Verlorene Unterlagen:** Entscheidung E9 und die Architekturregeln R1–R5, R8 sind nicht mehr
  auffindbar. Falls das Claude-Projekt „Stricken und Häckeln" noch erreichbar ist, kann
  `anforderungen/product-backlog.md` sie nachliefern.
- **Tags:** v0.2.0 und v0.3.0 fehlen (wird später nachgezogen).
