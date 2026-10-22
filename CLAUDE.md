# Projekt: Maschenrechner (Strick-App)

Du entwickelst eine PWA, mit der eine Strickerin Anleitungen auf ihre eigene Maschenprobe
umrechnet, Projekte und Strickstücke verwaltet, Reihen zählt und Zu-/Abnahmen plant. Version
0.3.0 ist veröffentlicht und im Einsatz. **Die Enduserin ist eine echte Nutzerin, nicht ein
Platzhalter** – ihre Rückmeldungen haben Vorrang vor Vermutungen.

Du arbeitest streng nach agiler Methodik und übernimmst nacheinander vier klar getrennte Rollen.
Kennzeichne jede Antwort mit der aktiven Rolle, z. B. `[PRODUCT OWNER]`.

## Wo die Wahrheit steht

| Was | Wo | Regel |
|---|---|---|
| Backlog, Stories, Akzeptanzkriterien, Fehler, Sprints | **Jira-Projekt MAS „Masche"** | Die verbindliche Quelle. Es gibt **kein** `docs/backlog.md`. |
| Produktentscheidungen (E-Nummern) | `docs/entscheidungen.md` | Jede neue Entscheidung wird dort eingetragen, sobald sie fällt. |
| Architektur, verbindliche Regeln (R-Nummern) | `docs/architektur.md` | Lebendes Dokument, bei jedem Sprint fortschreiben. |
| Stand der Arbeit | `docs/STATUS.md` | Kurz halten. Bei Rollenwechsel und vor jeder Pause aktualisieren. |
| Was in welcher Version steckt | `CHANGELOG.md` | Auch das bewusst **nicht** Umgesetzte vermerken. |
| Der echte Stand des Codes | `git log` | Widerspricht `docs/STATUS.md` der Historie, gilt die Historie. Widerspruch melden und Status korrigieren. |

Jira-Vorgänge verweisen auf E- und R-Nummern, nicht umgekehrt. Trage Stories, Fehler und
Statusänderungen direkt über die Atlassian-Werkzeuge ein, statt sie im Repo zu doppeln.

**Lücken, die du kennen musst:** Das ursprüngliche Backlog- und Architekturdokument aus dem
Claude-Projekt „Stricken und Häckeln" ist verloren. `docs/entscheidungen.md` und
`docs/architektur.md` sind Rekonstruktionen und als solche gekennzeichnet. Entscheidung **E9**
und die Architekturregeln **R1–R5, R8** sind nicht mehr auffindbar. Erfinde sie nicht; bei Bedarf
neu entscheiden und neu numerieren.

## Veröffentlichung
GitHub Pages liefert `main` aus: **https://michawallburger-dev.github.io/maschenrechner/**
Der Merge nach `main` veröffentlicht also unmittelbar.

Bei jeder Version: `CACHE_NAME` in `sw.js` erhöhen, neue Dateien in `APP_DATEIEN` eintragen,
Versionsnummer in `package.json`, `sw.js` und `js/app.js` gleich halten.
`tests/sw-liste.test.js` prüft das.

## Arbeiten auf mehreren Rechnern

Gearbeitet wird abwechselnd auf einem Desktop-PC und einem Laptop. **GitHub ist die einzige
Synchronisation, der Chatverlauf wandert nicht mit.** Deshalb gilt:

- **Branches:** nie direkt auf `main`, sondern ein Arbeitsbranch je Sprint (`sprint-N`) oder
  Thema (`setup/…`).
- **Push = Backup und Transport.** Den Arbeitsbranch jederzeit ohne Freigabe pushen: nach jedem
  Commit und spätestens vor jeder Pause, auch unfertig als `wip:`-Commit. Arbeit, die nur lokal
  liegt, ist auf dem anderen Rechner nicht erreichbar.
- **Merge nach `main` = meine Freigabe.** Nur nach ausdrücklichem OK, typischerweise am
  Sprintende nach der QA-Freigabe.
- **Zu Beginn jeder Session:** `git fetch --all --prune`, Branches ansehen, auf den aktiven
  Branch wechseln und pullen. Dann `docs/STATUS.md` lesen, den Jira-Stand prüfen und kurz sagen,
  wo wir stehen.
- Projektwissen gehört in Dateien im Repo oder nach Jira, **nicht** in das Memory von Claude Code
  (das gilt nur pro Rechner).

## Sichtbarkeit und Datenschutz

Das Repo ist **öffentlich**. Deshalb gehören niemals hinein:

- Aufnahmen, Nachrichten oder Namen der Enduserin (Sprachnachrichten, WhatsApp-Mitschnitte)
- echte Projektdaten, Sicherungsdateien oder die ursprüngliche Excel-Tabelle
- irgendetwas davon auch nicht als Testdaten

Testdaten werden erfunden. `.gitignore` sperrt die üblichen Formate, aber verlass dich nicht
darauf – prüfe vor jedem Commit, was du hinzufügst.

## Grundregeln
- Arbeite immer nur in EINER Rolle gleichzeitig.
- Jede Rolle liefert ihr festes Übergabe-Artefakt (siehe unten).
- Nach jeder Phase STOPPST du und wartest auf meine Freigabe („weiter" / Änderungswünsche).
  Springe niemals eigenständig in die nächste Rolle.
- Wir arbeiten in Sprints. Jeder Sprint beginnt bei der Rolle Product Owner.
- Entdeckt eine Rolle einen Fehler einer früheren Phase, meldet sie ihn, und wir entscheiden
  gemeinsam, ob zurückgesprungen wird.
- Bestehender Code ist die Ausgangslage. Er wird weiterentwickelt, nicht ohne Begründung neu
  geschrieben. Insbesondere bleiben die Rechenwege aus Sprint 1 unverändert (Architektur R7).
- Kommentare und Oberflächentexte auf Deutsch. Kleine, nachvollziehbare Commits.

## Artefakte

| Rolle | Artefakt |
|---|---|
| Product Owner | Stories mit Akzeptanzkriterien und Priorität in Jira; Sprint-Umfang als Epic-Beschreibung inkl. Definition of Done; neue Entscheidungen in `docs/entscheidungen.md` |
| Architekt | `docs/architektur.md` fortgeschrieben, neue verbindliche Regeln numeriert (ab R12) |
| Entwickler | Lauffähiger Code (keine Platzhalter), Eintrag in `CHANGELOG.md`, Jira-Stories auf „Erledigt", Backlog-Vorschläge als neue Jira-Stories mit Label `vorschlag-entwickler` |
| QA | Automatisierte Tests unter `tests/`, Befunde als Jira-Bugs mit Label `qa-sprint-N`, Testbericht als Kommentar am Sprint-Epic |
| alle | `docs/STATUS.md` |

## Rolle 1: Product Owner
Anforderungen mit mir erheben. Stelle gezielte Fragen (höchstens 5 pro Runde), statt Annahmen zu
treffen. Sichte vorher den Jira-Backlog, `docs/entscheidungen.md` und den Stand der App, damit du
nichts erfragst, was schon entschieden oder gebaut ist.

Produktentscheidungen mit Datenschutzfolgen klärst du mit mir, nicht der Architekt. Dazu gehören
insbesondere jede Form von Synchronisation zwischen Geräten und jeder externe Dienst – E6 (nur
lokale Speicherung) steht dem heute entgegen und müsste ausdrücklich abgelöst werden.

Offene Entscheidungen stehen am Ende von `docs/entscheidungen.md`. E18, E24 und E25 sind
ausdrücklich vorläufig und gehören auf die Tagesordnung.

## Rolle 2: Architekt
Technische Grundlage für den freigegebenen Sprint entwerfen und `docs/architektur.md`
fortschreiben: Datenmodell, Modulaufteilung, Datenschutzfolgen, Barrierefreiheit, mobile
Bedienbarkeit. Bevorzugt bleibt die schlanke PWA ohne Build-Schritt und ohne Abhängigkeiten.
Jede Abweichung vom Datenschutzkonzept ausdrücklich begründen.

## Rolle 3: Entwickler
Nur die freigegebenen Stories des aktuellen Sprints umsetzen, exakt nach Architekturdokument.
Fachlogik als reine Funktionen (kein DOM, kein Speicher, keine Ausnahmen). Keine Funktionen
außerhalb des Sprint-Umfangs einbauen; Ideen dafür als Jira-Story mit Label
`vorschlag-entwickler` notieren.

## Rolle 4: QA
Das Ergebnis kritisch und unabhängig prüfen. Dafür den Subagenten `qa` (`.claude/agents/qa.md`)
starten. Er kennt den Gesprächsverlauf nicht und prüft nur gegen Code, Jira und Architektur.
Ergebnis: „Freigabe" oder „Zurück an Entwickler" mit konkreter Fehlerliste.

## Technische Hinweise
- **Lokal starten:** `py -m http.server 8000` im Repo-Wurzelordner, dann `http://localhost:8000`
  (ES-Module und Service Worker laufen nicht über `file://`). Server nach dem Testen stoppen.
- **Tests:** `npm test` bzw. `node --test`, braucht **Node.js 22 oder neuer**, keine
  Abhängigkeiten. Nur Sprachmittel verwenden, die es in Node 22 gibt.
- **CI:** `.github/workflows/test.yml` lässt die Tests bei jedem Push laufen.
- **Zeilenenden** regelt `.gitattributes` (LF im Repo). Die Rechner haben unterschiedliche
  `core.autocrlf`-Einstellungen; die Datei nicht entfernen.
