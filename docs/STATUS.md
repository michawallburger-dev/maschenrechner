# Projektstatus Maschenrechner

Kurze Übergabe zwischen Sessions und Rechnern. Bei Widerspruch zu `git log` gilt `git log`.

- **Aktiver Branch:** `sprint-6` (am 03.11.2026 von `main` abgezweigt). `sprint-5` ist gemergt.
- **Veröffentlicht:** Version **0.5.0** am 03.11.2026 auf https://michawallburger-dev.github.io/maschenrechner/
- **Sprint:** **6 geplant** „Muster und Eingabe“ (Epic MAS-79, Ziel 0.6.0). Sprint 5 ist
  abgeschlossen und veröffentlicht; die Praxistests von 0.4.0 **und** 0.5.0 stehen beide aus.
- **Rolle:** **Architekt** – die Sprint-6-Planung ist am 03.11.2026 **freigegeben**.
  Der Entwurf `docs/architektur/sprint-6-architektur.md` ist noch nicht geschrieben.
- **QA Sprint 4:** Nachtest zu `cf49a64` → **Freigabe**. Bericht im Abschnitt „Nachtest"
  von `docs/qa/sprint-4-testbericht.md`. S4-01 bis S4-05 behoben, S4-06 dokumentiert,
  vier neue niedrige Befunde S4-07 bis S4-10 offen, angelegt als MAS-69 bis MAS-72.
- **Tests:** 393 Tests, 386 grün, 0 rot, 7 `todo` – 4 aus Sprint 4 (S4-07 bis S4-10) und 3 aus
  Sprint 5 (S5-05 bis S5-07). S5-01 bis S5-04 sind behoben und ihre Tests scharf.
- **Letzte Freigabe:** Sprint-5-Zuschnitt (02.11.2026) – Englisch, Zoll und die Bruch**anzeige**
  als Einstellung; die Bruch**eingabe** ausdrücklich geschoben. Bezugsmaß 4 Zoll bestätigt.
- **CI:** läuft bei jedem Push (`.github/workflows/test.yml`)
- **Jira-Releases:** 0.1.0 bis 0.5.0 freigegeben; **0.6.0 angelegt** (03.11.2026, noch nicht
  veröffentlicht), zugeordnet sind MAS-79, MAS-21, MAS-63, MAS-75 und MAS-77
- **Branches:** `sprint-2` und `sprint-3` auf GitHub gelöscht (beide ohne eigene Arbeit)

## Nächster Schritt

**1. Rolle Architekt** für Sprint 6 – **die Planung ist freigegeben**: neues
`docs/architektur/sprint-6-architektur.md`, aufbauend auf v5.3. Zu entwerfen sind die
Brucherkennung und der Wegfall des Tausendertrenners in `js/eingabe.js`, die Rundungsregel in
`js/rechner.js` und die neue Verteilung in `js/plan.js`.

**Offene Punkte für den Architekten**, aus den Stories:

- **MAS-75:** Soll „4 3/2“ abgelehnt oder als 5,5 gelesen werden? Sollen Sechzehntel
  eingegeben werden können, obwohl die Anzeige auf Achtel rundet (E32)?
- **MAS-63:** Zwei Felder oder ein Feld mit Umschalter? Die Plan-Karte ist auf 360 px schon
  voll (R9) – und mit US-17 kommen womöglich weitere Felder dazu.
- **MAS-21:** Wo in der Oberfläche steht die Rundungsregel? Sie gilt je Strickstück, betrifft
  aber fünf Karten.

**2. Eine Produktfrage ist noch offen** und steht als Vorschlag in MAS-21: **Gilt die
Rundungsregel auch für Reihen?** Vorschlag des Product Owners: nein, nur für Maschen – ein
Rapport ist ein Maschenmuster. Widerspricht der Auftraggeber, ändert das AK5.

**3. Praxistest – offen für zwei Versionen**, 0.4.0 und 0.5.0. Damit hängen MAS-57 AK4 und
die Frage aus S5-02, ob ein Screenreader die Bruchzeichen richtig vorliest. Je länger das
läuft, desto mehr sammelt sich für einen Termin an.

**4. Zwei Entscheidungen bestätigen:** **E34** und **E35** stehen weiter als vorläufig,
obwohl beide umgesetzt, von der QA abgenommen und veröffentlicht sind.

## Sprint 6 „Muster und Eingabe“ – Epic MAS-79, Ziel Version 0.6.0

Ziel: Die App rechnet auf das Muster, mit dem tatsächlich gestrickt wird, und nimmt Maße so an,
wie sie in der Anleitung stehen. Nach zwei Sprints an der Oberfläche wieder **Rechenfunktionen**
– sie wirken für deutschsprachige Nutzerinnen sofort und brauchen kaum neue Texte.

| # | Jira | Was | Priorität |
|---|---|---|---|
| 1 | MAS-77 | **S5-06** Tausendertrenner entfällt (E38, ersetzt E13) | Muss |
| 2 | MAS-75 | **US-42** Längen als Bruch eingeben | Muss |
| 3 | MAS-21 | **US-17** Rundung auf gerade Zahl oder Musterrapport (E37, löst E4 ein) | Muss |
| 4 | MAS-63 | **US-40** Erste Zu-/Abnahme genau in einer bestimmten Reihe | Muss |

**Die Reihenfolge geht durch die Schichten:** erst die Eingabe (MAS-77 und MAS-75 fassen
**dieselbe Datei** an – `js/eingabe.js`, die Stelle, aus der MAS-30 und MAS-31 stammen; zweimal
dort einzugreifen wäre die schlechtere Reihenfolge), dann die **Maschenzahlen** (MAS-21),
zuletzt die **Reihen** (MAS-63).

**Zwei Wechselwirkungen, die in den AK stehen:**

- **MAS-21 × E28:** Gerundete Anfangs- und Endmaschen können eine Differenz ergeben, die nicht
  durch die Maschen je Zu-/Abnahme teilbar ist – dann greift die Auswahl aus E28 häufiger. Die
  angebotenen Endmaschenzahlen müssen dann **ebenfalls** der Rundungsregel folgen.
- **MAS-21 × MAS-63:** Beide fassen den Plan an. Der Referenzfall muss nach **beiden** Änderungen
  stimmen, nicht nur nach einer – mit abgeschalteter Rundungsregel und „frühestens ab“.

**Was Zweisprachigkeit jetzt für jedes neue Feld heißt** (seit Sprint 5, beide leicht zu
vergessen):

1. Jeder neue Text liegt in `de` **und** `en` vor; ein Test erzwingt gleiche Schlüsselmengen
   und gleiche Platzhalter.
2. Jede neue **Länge** muss **zweimal** eingetragen werden: in die Anzeige über `formatLaenge`
   (acht Stellen) **und** in die Feldliste von `einheitUmstellen`. Wird das zweite vergessen,
   bricht ein Einheitenwechsel die Angabe still – genau das war Befund S5-03.

Für diesen Sprint gilt: Die neuen Felder sind **Stückzahlen und Reihennummern**, keine Längen.
Sie gehören also **nicht** in die Umrechnungsliste. Das ist zu prüfen, nicht anzunehmen.

**Nicht in diesem Sprint:** Garnbedarf (MAS-22) – er bräuchte zuerst eine Entscheidung über
Garn-Einheiten (Lauflänge und Knäuelgewicht, Meter/Gramm oder Yards/Ounces), für die
`js/einheiten.js` noch keine Behandlung hat. Ebenso die fünf übrigen Befunde MAS-69 bis MAS-72,
MAS-76 und MAS-78.

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
