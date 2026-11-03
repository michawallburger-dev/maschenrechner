# Projektstatus Maschenrechner

Kurze Übergabe zwischen Sessions und Rechnern. Bei Widerspruch zu `git log` gilt `git log`.

- **Aktiver Branch:** keiner – `sprint-5` ist nach `main` gemergt. Der nächste Sprint beginnt
  mit einem neuen Branch `sprint-6`.
- **Veröffentlicht:** Version **0.5.0** am 03.11.2026 auf https://michawallburger-dev.github.io/maschenrechner/
- **Sprint:** 5 **abgeschlossen** „Englisch und Zoll“ – QA-Freigabe am 02.11.2026, Epic MAS-73
  geschlossen, Jira-Release 0.5.0 freigegeben. Die Praxistests von 0.4.0 **und** 0.5.0 stehen
  beide noch aus.
- **Rolle:** keine aktiv. Sprint 5 ist durch alle vier Rollen gelaufen. Der nächste Sprint
  beginnt beim **Product Owner**.
- **QA Sprint 4:** Nachtest zu `cf49a64` → **Freigabe**. Bericht im Abschnitt „Nachtest"
  von `docs/qa/sprint-4-testbericht.md`. S4-01 bis S4-05 behoben, S4-06 dokumentiert,
  vier neue niedrige Befunde S4-07 bis S4-10 offen, angelegt als MAS-69 bis MAS-72.
- **Tests:** 393 Tests, 386 grün, 0 rot, 7 `todo` – 4 aus Sprint 4 (S4-07 bis S4-10) und 3 aus
  Sprint 5 (S5-05 bis S5-07). S5-01 bis S5-04 sind behoben und ihre Tests scharf.
- **Letzte Freigabe:** Sprint-5-Zuschnitt (02.11.2026) – Englisch, Zoll und die Bruch**anzeige**
  als Einstellung; die Bruch**eingabe** ausdrücklich geschoben. Bezugsmaß 4 Zoll bestätigt.
- **CI:** läuft bei jedem Push (`.github/workflows/test.yml`)
- **Jira-Releases:** 0.1.0 bis **0.5.0** alle als freigegeben markiert
- **Branches:** `sprint-2` und `sprint-3` auf GitHub gelöscht (beide ohne eigene Arbeit)

## Nächster Schritt

**1. Praxistest – inzwischen für zwei Versionen offen.**

- **0.4.0:** neue Kartentitel (damit hängt **MAS-57 AK4**), Maschenzahlen im Plan und im Zähler,
  eigene Startreihe, Klappverhalten.
- **0.5.0:** eine amerikanische Anleitung in Zoll durchrechnen. **Mitprüfen:** ob ein
  Screenreader die Bruchzeichen (½, ¼, ⅜) richtig vorliest – der offene Punkt aus S5-02, den
  nur der Praxistest beantworten kann.

Ergebnis als Jira-Vorgang mit Label `praxistest` anlegen, so wie MAS-56 für 0.3.0.

**2. Sprint 6 planen** (Rolle Product Owner). Was bereitliegt:

| Vorgang | Was | Zusammenhang |
|---|---|---|
| **MAS-75** | US-42 Brucheingabe | in Sprint 5 ausdrücklich geschoben (E36) |
| **MAS-77** | S5-06 „1,000“ wird englisch als 1 gelesen | **derselbe Code** wie MAS-75 |
| **MAS-76** | S5-05 Umgerechnete Werte sprengen Feldgrenzen | Entscheidung offen |
| **MAS-78** | S5-07 Fokussprung nach dem Sprachwechsel | klein |
| **MAS-69 bis MAS-72** | S4-07 bis S4-10 aus Sprint 4 | drei davon in derselben Datei |
| **MAS-29** | US-25 Proben automatisch einklappen | nutzt den Mechanismus aus US-38 (E30) |

**MAS-75 und MAS-77 gehören zusammen:** beide fassen `js/eingabe.js` an – die Stelle, aus der
MAS-30 und MAS-31 stammen. Zweimal dort hineinzugreifen wäre die schlechtere Reihenfolge.

**3. Zwei Entscheidungen bestätigen:** **E34** (Umschalten rechnet um) und **E35** (Nadelstärke
bleibt mm) stehen weiter als *vorläufig* in `docs/entscheidungen.md`, obwohl beide umgesetzt,
von der QA abgenommen und jetzt veröffentlicht sind.

## Sprint 5 „Englisch und Zoll“ – Epic MAS-73, Ziel Version 0.5.0

Ziel: Die App lässt sich auf Englisch bedienen und mit amerikanischen Maßen benutzen. Sprache,
Längeneinheit und Zahlendarstellung sind **drei unabhängige Einstellungen** (E9, E32) – deutsche
Oberfläche mit Zoll ist also ausdrücklich möglich und der Fall der Enduserin, die nach
amerikanischen Anleitungen strickt.

| # | Jira | Was | Priorität |
|---|---|---|---|
| 1 | MAS-28 | **US-24** Längeneinheit Zoll, Bezugsmaß 4 Zoll (E33), Umschalten rechnet um (E34) | Muss |
| 2 | MAS-74 | **US-41** Längen wahlweise dezimal oder als Bruch anzeigen (E32) | Muss |
| 3 | MAS-27 | **US-23** Oberfläche auf Englisch, 261 Texte | Muss |
| – | MAS-75 | **US-42** Brucheingabe – **nicht** in Sprint 5, vorgemerkt für Sprint 6 (E36) | Soll |

**Die Vorarbeit aus Sprint 1 trägt weit.** `js/texte.js` hat das Sprachgerüst mit 261 Schlüsseln,
von denen keiner eine Einheit fest enthält; `js/einheiten.js` sieht den Zoll-Eintrag wörtlich vor;
`js/modell.js` speichert und prüft Sprache und Einheit schon. **Die Lücke ist die Oberfläche:**
Die Einstellungen bieten nur Farbschema, Datensicherung und Version. Der eigentliche Aufwand sind
die 261 Übersetzungen.

**Umgesetzt am 02.11.2026.** Architektur **v5.2** festgelegt: dritte Einstellung `laengenDarstellung` mit den
Werten `auto`/`dezimal`/`bruch` (Schema 3 bleibt), Zoll-Eintrag mit `standardBezug: 4`,
Brüche auf Achtel, Locale **en-US**, Umrechnung als reine Funktion `einheitUmstellen` mit
vollständiger Feldliste. Vier neue Risiken **R17–R20**, drei Hinweise **H5–H7**. **R4 aus
Sprint 1 ist damit eingelöst.** Kein neues Modul, `plan.js` und `ziel.js` bleiben unverändert.

**Zwei Funde beim Bauen, beide in der Architektur nachgezogen:**

1. Es sind **sieben** Längen-Anzeigestellen, nicht sechs – die Abweichung in
   `strickstueck.js:228` läuft über `formatAbweichung`. An MAS-74 kommentiert.
2. **H5 war keine Kosmetikfrage.** Mit zwei Nachkommastellen für Zoll ergibt der Referenzfall
   aus Sprint 3 nach einem Wechsel **166 statt 167 Reihen** – im Browser nachgestellt. Zoll
   rechnet deshalb mit **drei** Stellen; damit bleibt es bei 167 und der Weg zurück ist exakt.
   Dafür steht im Eingabefeld 3.937 statt 3.94.

Dazu berichtigt: Es sind **285 Textschlüssel** je Sprache, nicht 261 – meine Zählung per
Textsuche hatte Schlüssel übersprungen.

**Nachbesserung am 03.11.2026:** S5-01 bis S5-04 behoben, Architektur auf **v5.3**. Dabei
bestätigt sich die QA-Zahl: Es sind **acht** Längen-Anzeigestellen, nicht sieben – die
Probenzeile war die achte.

**QA-Freigabe am 02.11.2026** (`docs/qa/sprint-5-testbericht.md`). Die QA hat beide Abweichungen
vom Entwurf geprüft und bestätigt – die H5-Behauptung hat sie unabhängig nachgestellt und nennt
sie **stärker, als der Entwickler sie formuliert hatte**. Die Feldliste der Einheitenumstellung
hat sie maschinell über einen Pfad-Vergleich aller Blattwerte geprüft: vollständig und nicht zu
groß. Sieben niedrige Befunde, siehe oben.

**Warum die Brucheingabe draußen bleibt (E36):** Die Anzeige ist gut gekapselt – sechs
Aufrufstellen von `formatZahl` und eine reine Funktion. Die Eingabe bräuchte `UNVOLLSTAENDIG_MUSTER`
in `js/eingabe.js`, den Code, aus dem MAS-30 und MAS-31 stammen, während der Nutzen fast
vollständig im Lesen liegt.

## Stand der Nachbesserung (23.10.2026, Commit cf49a64)

287 Tests, alle grün, keine `todo`-Tests mehr. Behoben: S4-01 bis S4-05. S4-06 nur dokumentiert.

**Im Browser bei 360 × 640 px nachgemessen.** Der QA-Nachtest hat diese Werte unabhängig
bestätigt – mit einer Ausnahme: Die Zähleransicht mit Wachhalter-Hinweis ist **749 px**
hoch, nicht 773 px. Dass sie dann scrollt, stimmt.

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
- **25 offene Jira-Vorgänge** (02.11.2026). Davon vier in Sprint 5: Epic MAS-73 mit MAS-27,
  MAS-28 und MAS-74. Aus Sprint 4 ist nur noch das Epic
  **MAS-60** offen; es schließt nach der Freigabe des Merges.
- **Vier neue QA-Befunde S4-07 bis S4-10** aus dem Nachtest als **MAS-69 bis MAS-72** angelegt,
  alle niedrig bzw. kosmetisch. MAS-70 ist zuerst eine Produktentscheidung, kein Auftrag.
  S4-07 ist der gewichtigste: Die Plan-Karte verbirgt zugeklappt ihren eigenen Hinweis
  „Bitte zuerst die eigene Probe … ausfüllen“, weil `problemText()` nur `.fehler` und
  `[data-rolle="status"]` kennt. Damit ist der Zweck von US-38 AK6 noch nicht ganz erfüllt.
  Einzelheiten im Abschnitt „Nachtest“ des Testberichts.
- **E24 hängt an US-39:** Wird sie umgesetzt, ist „erste Reihe bleibt frei" nur noch eine
  Vorbelegung. Beim Umsetzen in `docs/entscheidungen.md` nachtragen. Die Zählerfeld-Variante a
  aus E22 ist unverändert bestätigt.
- **Tags:** v0.2.0, v0.3.0 und v0.4.0 fehlen (wird später nachgezogen).
- **Gemergte Branches** `setup/projektregeln` und `sprint-4` können auf GitHub gelöscht
  werden.

## Jira ist abgeglichen (23.10.2026)

Der Abgleich aus E29 ist vollständig: MAS-62 hängt an Epic MAS-60 mit Version 0.4.0 und Label
`sprint-4`, MAS-29 wieder an MAS-4 ohne Version. Die Beschreibungen von MAS-60 und MAS-62 sind auf
dem Stand nach dem Tausch.

**Nachtrag zur Störung vom 22.10.:** Die beiden Schreibvorgänge, die damals in Zeitüberschreitungen
liefen, sind serverseitig später doch angekommen (16:09 und 16:28) – nach Sitzungsende. Eine
Zeitüberschreitung beim Atlassian-MCP heißt also **nicht**, dass der Schreibvorgang verloren ist.
Vor dem Wiederholen immer erst per Abfrage den Ist-Stand prüfen, sonst schreibt man doppelt.
