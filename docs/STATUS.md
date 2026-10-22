# Projektstatus Maschenrechner

Kurze Übergabe zwischen Sessions und Rechnern. Bei Widerspruch zu `git log` gilt `git log`.

- **Aktiver Branch:** `sprint-4`
- **Veröffentlicht:** Version 0.3.0 auf https://michawallburger-dev.github.io/maschenrechner/
- **Sprint:** 3 **abgeschlossen** – Praxistest MAS-56 am 21.10.2026 bestanden, Epic MAS-3
  geschlossen
- **Rolle:** Product Owner **abgeschlossen** – Sprint-4-Umfang steht (Epic MAS-60). Als Nächstes
  ist der Architekt dran.
- **Letzte Freigabe:** Sprint-4-Umfang, E24 bestätigt, E25 mit der Enduserin klären, US-25 und
  US-38 gemeinsam planen (22.10.2026)
- **Tests:** 224 Tests, alle grün (Node.js 22.16); CI läuft bei jedem Push
- **Jira-Releases:** 0.1.0 (16.10.), 0.2.0 (16.10.), 0.3.0 (17.10.) angelegt; alle 40 erledigten
  Vorgänge zugeordnet
- **Branches:** `sprint-2` und `sprint-3` auf GitHub gelöscht (beide ohne eigene Arbeit)

## Nächster Schritt
**Rolle Architekt:** `docs/architektur/sprint-4-architektur.md` anlegen, aufbauend auf Sprint 3
(v3.1). Zu entwerfen sind die Maschenzahl je Ereignis als reine Funktion, der gemeinsame
Klapp-Mechanismus für beide Ansichten (E30) samt Speicherung und Datensicherung, und die Frage,
wie die zusätzlichen Zahlen in die Zähleransicht passen, ohne Risiko R9 zu verletzen.

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
- **Jira-Abgleich für den Tausch aus E29 ist offen.** Die Atlassian-Verbindung lief am 22.10.2026
  in Zeitüberschreitungen, während MAS-62 ins Sprint-Epic und MAS-29 zurück in den Backlog
  umgehängt werden sollten. **Ob diese beiden Änderungen angekommen sind, ist ungeprüft** – vor
  dem nächsten Schritt in Jira kontrollieren: MAS-62 muss an MAS-60 hängen mit Version 0.4.0,
  MAS-29 an MAS-4 ohne Version. Auch die Umfangstabelle in der Beschreibung von MAS-60 ist noch
  auf dem Stand vor dem Tausch.
- **Tags:** v0.2.0 und v0.3.0 fehlen (wird später nachgezogen).
