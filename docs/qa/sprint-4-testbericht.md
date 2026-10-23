# Testbericht Sprint 4 – „Überblick beim Stricken“ (v0.4.0)

Rolle: QA · Stand: 23.10.2026 · Prüfgegenstand: Branch `sprint-4`, Commit `bad253d` (plus die QA-Tests
dieses Berichts) · Grundlage: Epic **MAS-60** mit den Vorgängen **MAS-57, MAS-58, MAS-62, MAS-59**
(Jira ist die verbindliche Quelle), `docs/architektur/sprint-4-architektur.md` **v4.2**,
`docs/entscheidungen.md` (E1–E31), Risikoregister in `docs/architektur.md` (R13–R16, H3–H4)

## Ergebnis: **Zurück an Entwickler**

Keine kritischen, keine hohen Befunde. Die **Fachlogik ist sauber** – alle Akzeptanzkriterien von
MAS-58 und MAS-62, die sich rechnerisch prüfen lassen, sind erfüllt, der Regressionsschutz greift,
und der Referenzfall aus Sprint 3 wird exakt reproduziert.

Zurück geht es wegen **zwei mittleren Befunden an der neuen Klapp-Funktion** (MAS-59), die beide im
Praxistest sofort auffallen würden:

- **S4-01 (MAS-64, mittel):** Die Karten zeigen kein Aufklapp-Dreieck. Dass man sie zuklappen kann,
  ist nicht erkennbar, und ob eine Karte zu ist, ebenso wenig.
- **S4-02 (MAS-65, mittel):** Eine zugeklappte Karte verbirgt die Statusmeldung vollständig – eine
  zu große Startreihe führt dann kommentarlos zu „kein Plan“. Das verletzt MAS-62 AK3 und R16.

Dazu drei niedrige Befunde (S4-03 bis S4-06). **MAS-57 und MAS-58 sind aus QA-Sicht fertig.**

| Befund | Jira | Schwere | Betrifft |
|---|---|---|---|
| S4-01 Kein Dreieck am `<summary>`, Klappzustand nicht sichtbar | MAS-64 | **mittel** | US-38 AK1/AK4, Architektur 5.4 |
| S4-02 Zugeklappte Karte verbirgt die Statusmeldung | MAS-65 | **mittel** | US-39 AK3, US-38 AK6, R16 |
| S4-03 Karte mit Eingabefehler lässt sich wieder zuklappen | MAS-66 | niedrig | US-38 AK6, Architektur 5.4 |
| S4-04 „ab der ersten“ am Schalter „nur jede 2.“ ist irreführend | MAS-67 | niedrig | US-39 AK1, P3-01 |
| S4-05 Zielquelle im Zähler heißt noch „Länge in Reihen“ | MAS-67 | niedrig | MAS-57, P3-01 |
| S4-06 0.3.0 löscht Startreihe und Klapp-Zustand still | MAS-68 | niedrig | R13, R6/R10 |

Alle sechs Befunde hängen als Kind an **MAS-60**, tragen das Label `qa-sprint-4` und die Version
**0.4.0**.

## 1. Vorgehen

- **Code-Review** aller 17 in Sprint 4 geänderten Dateien gegen das Architekturdokument v4.2 und
  die Akzeptanzkriterien in Jira, unabhängig von den Commit-Nachrichten des Entwicklers.
- **Automatische Tests:** `node --test` (Node 22.16, keine Abhängigkeiten).
  **Vorher 245 Tests, nachher 287** – 42 neue in `tests/qa-sprint4.test.js`.
  **285 grün, 0 rot, 2 `todo`** (die beiden `todo`-Tests halten S4-04 und S4-05 fest und werden
  grün, sobald die Texte geändert sind).
- **Browsertests** in Chromium (Vorschau-Fenster), lokal über `py -m http.server`, Ansichtsfenster
  **360 × 640 px**, hell und dunkel: Kartentitel, Klappen, Fehlerverhalten, Platz in der
  Zähleransicht, Touch-Ziele, Live-Regionen, Netzwerkverkehr. Testdaten per dynamischem Import von
  `js/modell.js` in den `localStorage` gelegt (erfundene Daten).
- **Rückwärtstest 0.3.0:** Die Module `js/modell.js` und `js/plan.js` aus Commit `7a7bae2`
  (Version 0.3.0) gegen einen Datensatz laufen lassen, den 0.4.0 geschrieben hat (Risiko R13).

## 2. Automatische Tests

| Bereich | Tests | Ergebnis |
|---|---|---|
| Bestand Sprint 1–3 (Rechnen, Eingabe, Format, Texte, Einheiten, Router, Speicher, Sicherung, Migration) | 245 | ✓ alle grün |
| davon neu aus der Entwicklung in Sprint 4 (Plan, Modell v3, Sicherung v3, Ziel) | 21 | ✓ |
| **Neu QA Sprint 4** (`tests/qa-sprint4.test.js`) | **42** | 40 ✓, 2 `todo` (S4-04, S4-05) |
| **Summe** | **287** | **285 ✓ · 0 ✗ · 2 todo** |

Die QA-Tests sind unabhängig von der Umsetzung formuliert. Schwerpunkte:

- `erlaubteReihen` ohne Startreihe gegen die **noch einmal ausgeschriebene Sprint-3-Regel**, für
  alle Reihenzahlen 1 … 300 und beide Werte von „nur jede 2.“ (Regressionskern, MAS-62 AK9).
- `erlaubteReihen` mit eigener Startreihe 1 … 12 gegen eine unabhängig erzeugte Liste.
- **Eigenschaftstests** über 400 deterministisch gewürfelte Eingaben (376 ergeben einen Plan) (xorshift32, feste Saat):
  letzte Maschenzahl = Endmaschenzahl, strenge Monotonie, keine Maschenzahl unter 1, alle Reihen
  zwischen Startreihe und `reihen − 1`, keine Doppelten, Abstände ±1 bzw. ±2, Parität folgt der
  Startreihe, Determinismus.
- 14 Randfälle der Eingaberegel `startReihe` in einer Tabelle (siehe Abschnitt 4).
- 11 beschädigte Klapp-Zustände, die alle repariert statt verworfen werden.
- Datenschutz- und Offline-Prüfungen als Dateiscan (Abschnitte 6 und 7).

## 3. Testfälle je Akzeptanzkriterium

### MAS-57 – Kartentitel berichtigen (P3-01)

| AK | Eingabe / Aktion | Erwartet | Tatsächlich | |
|---|---|---|---|---|
| AK1 | `rechner.breiteZuMaschen.titel` | nennt die Eingabe, nicht das Ergebnis | „Aus Breite (cm) → Maschen“ | ✓ |
| AK1 | `rechner.laengeZuReihen.titel` | dito | „Aus Länge (cm) → Reihen“ | ✓ |
| AK1 | Titel der beiden Anleitungs-Rechner | unverändert | „Maschen aus der Anleitung“, „Reihen aus der Anleitung“ | ✓ |
| AK2 | Browser 360 × 640 px, beide Titel gemessen | eine Zeile | Höhe = 1 × `line-height`, kein Querscrollen (`scrollWidth` 360) | ✓ |
| AK3 | Herkunft der Texte | nur `js/texte.js`, mit `{einheit}` | beide Titel mit `{einheit}`; mit „in“ wird „Aus Breite (in) → Maschen“ | ✓ |
| AK4 | Bestätigung der Enduserin | – | **ungeprüft**, gehört in den Praxistest | – |
| – | Zielquelle im Zähler (`zaehler.quelle.laengeZuReihen`) | passt zum Kartentitel | weiterhin „Länge in Reihen“ | ✗ **S4-05** |

### MAS-58 – Maschenzahl nach jedem Ereignis (US-37)

| AK | Eingabe / Aktion | Erwartet | Tatsächlich | |
|---|---|---|---|---|
| AK1 | Referenzfall 20 → 34 cm, 45 cm, 25 M / 37 R, 2 M, Auswahl „weniger“ | 50 → 84 M, 167 Reihen, 17 Zunahmen, `maschenDanach` 52, 54 … 84 | exakt so | ✓ |
| AK1 | Plan-Liste im Browser | „Reihe 10: 2 M zunehmen → 52 M“ | genau so | ✓ |
| AK2 | Zähler bei Reihe 22 | letzte / nächste / übernächste mit Maschenzahl | „Reihe 19: +2 M → 54 M“, „Reihe 28: +2 M → 56 M“, „Reihe 37: +2 M → 58 M“ | ✓ |
| AK2 | `ereignisseUm` mit US-15-Referenz (Reihen 16/22/25 bei 50 M) | 49 / 47 / 44 M | so, und die Ereignisobjekte werden unverändert durchgereicht | ✓ |
| AK3 | 400 gewürfelte Eingaben, davon 376 gültige Pläne | letzte Maschenzahl = Endmaschenzahl | 0 Abweichungen | ✓ |
| AK3 | nicht teilbare Differenz, Option „weniger“ **und** „mehr“ | Folge endet auf der **gewählten** Endmaschenzahl | ✓ in beiden Fällen | ✓ |
| AK4 | Abnahme · Runden · „jede 2.“ · alles kombiniert | Zusage gilt überall | `maschenDanach = anfang + vorzeichen · pro · (i+1)` in allen vier Fällen | ✓ |
| AK5 | Anpassung Anfang −4 / Ende +2 / Reihen −50 | alle Maschenzahlen wandern mit, Ende stimmt weiter | ✓ (Bezug ist `anfang`, nicht `anfangGerundet`) | ✓ |
| AK6 | Zähleransicht 360 × 640 px | ohne Scrollen bedienbar | 640 px genau, kein Scrollbalken – siehe Abschnitt 8 | ✓ (knapp) |
| AK6 | Ansage der Maschenzahl | Screenreader hört sie zum Ereignis | die drei Einträge stehen als Text im DOM ✓; die Live-Ansage beim Zählen (`zaehler.ansageJetzt`) nennt sie **nicht** | teils – siehe Abschnitt 9 |
| AK7 | reine Funktion in `plan.js`, Eigenschaftstest | – | `berechnePlan` bleibt rein, Eigenschaftstests vorhanden (Entwicklung und QA) | ✓ |

### MAS-62 – Startreihe selbst festlegen (US-39)

| AK | Eingabe / Aktion | Erwartet | Tatsächlich | |
|---|---|---|---|---|
| AK1 | neuer Plan | Feld leer vorbelegt (E31) | `leererPlan().startReihe === ''` | ✓ |
| AK1 | leeres Feld, ohne „jede 2.“ | Standard Reihe 2 | `standardStartReihe(false) === 2` | ✓ |
| AK1 | leeres Feld, mit „jede 2.“ | Standard Reihe 3 | `standardStartReihe(true) === 3` | ✓ |
| AK1 | Feldhinweis im Browser, Schalter umlegen | nennt die sich ergebende Reihe und wechselt | „… automatisch: Reihe 2.“ ↔ „Reihe 3.“ | ✓ |
| AK1 | Beschriftung | laut AK „Erste Reihe mit Zu-/Abnahme“ | **„Frühestens ab Reihe“** – Abweichung am 23.10.2026 in MAS-62 abgenommen, Folgefrage als MAS-63 aufgenommen | ✓ (abgenommen) |
| AK1 | Arbeitsweise „Runden“ | „Frühestens ab Runde“ | Beschriftung und Hinweis folgen der Arbeitsweise | ✓ |
| AK2 | 14 Randfälle der Eingabe | siehe Abschnitt 4 | alle wie erwartet | ✓ |
| AK3 | Startreihe 167, 168, 500, 99999 bei 167 Reihen, beide „jede 2.“-Werte | `ZU_WENIG_REIHEN`, `moeglich: 0`, kein Plan | genau so, kein neuer Fehlercode | ✓ |
| AK3 | Startreihe 166 (genau ein Platz) | `moeglich: 1`, Meldung in der Einzahl | ✓ (S3-03 greift weiter) | ✓ |
| AK3 | Hinweis bei **zugeklappter** Karte | Hinweis erscheint | Karte bleibt zu, nichts ist sichtbar | ✗ **S4-02** |
| AK4 | „jede 2.“ mit Startreihe 4 | alle Ereignisse auf **geraden** Reihen ab 4 | ✓ (H4, bewusst zugelassen) | ✓ |
| AK4 | die 183 gewürfelten Pläne mit „jede 2.“ | Parität = Parität der Startreihe | 0 Abweichungen | ✓ |
| AK5 | Startreihen null/1/2/5/40, beide „jede 2.“-Werte | letzte Reihe bleibt frei | letztes Ereignis stets ≤ `reihen − 1` | ✓ |
| AK5 | Startreihe 1 | Ereignis darf in Reihe 1 liegen | ✓ (E24 ist am Anfang nur noch Vorbelegung) | ✓ |
| AK6 | dieselben gewürfelten Pläne | Abstände ±1, mit „jede 2.“ ±2; Determinismus | 0 Abweichungen | ✓ |
| AK7 | 0.3-Plan **ohne** das Feld vs. leeres Feld | identisch, keine Migration | `deepEqual`, für beide „jede 2.“-Werte | ✓ |
| AK7 | Sicherung ohne `startReihe` einlesen | Feld leer, Plan rechnet unverändert | ✓ | ✓ |
| AK8 | Startreihe 40 im Referenzfall | Plan und Zähler folgen sofort | Reihen verschieben sich, Maschenzahlen bleiben gleich; `ereignisseUm` liefert die neuen Reihen | ✓ |
| AK9 | Referenzfall mit leerer Startreihe, beide „jede 2.“-Werte | bitgleich wie Sprint 3 | 50 → 84 M, 167 Reihen, 17 Zunahmen, Abstand 9–10; mit „jede 2.“ alle Reihen ungerade ab 3 | ✓ |
| AK9 | `erlaubteReihen` für 1 … 300 Reihen gegen die ausgeschriebene Sprint-3-Regel | identisch | 600 Kombinationen (Reihenzahl × „jede 2.“), 0 Abweichungen | ✓ |

### MAS-59 – Kacheln zusammenklappen (US-38)

| AK | Eingabe / Aktion | Erwartet | Tatsächlich | |
|---|---|---|---|---|
| AK1 | Kartentitel antippen | Karte klappt zu und auf | ✓ für alle fünf Karten | ✓ |
| AK1 | erkennbar, dass es geht | Dreieck als Zustandsanzeige (Architektur 5.4) | **kein Dreieck**, Kopf sieht offen wie zu gleich aus | ✗ **S4-01** |
| AK2 | zuklappen, App neu laden | Zustand ist wieder da, je Strickstück und Karte | `eingeklappt: { maschenAusAnleitung: true, … }` im Speicher, nach dem Laden zu | ✓ |
| AK2 | aufklappen | Schlüssel wird entfernt (fehlt = offen) | ✓ | ✓ |
| AK3 | Sicherungsrundreise mit Klapp-Zustand | bleibt erhalten | `deepEqual` | ✓ |
| AK3 | Sicherung **ohne** `eingeklappt` (wie 0.3) | lässt sich einlesen, alle Karten offen | `{}` | ✓ |
| AK3 | 11 beschädigte Zustände (`null`, Liste, Text, Zahl, Nicht-Boolean, unbekannte Kartennamen, untergeschobenes `__proto__`) | repariert, Rest des Strickstücks unberührt | alle auf gültige Objekte reduziert, Plan bleibt | ✓ |
| AK4 | Tastatur | `summary` fokussierbar, Enter/Leertaste klappt | `tabIndex 0`, Fokusring vorhanden, Browserverhalten von `<details>` | ✓ |
| AK4 | Touch-Ziel | ≥ 44 × 44 px | gemessen 44 × 294 px; kein Bedienelement der Ansicht unter 44 px | ✓ |
| AK4 | Screenreader erkennt auf/zu | – | `<details>`/`<summary>` melden den Zustand; **VoiceOver ungeprüft** | ✓ (Mechanik) |
| AK5 | zugeklappte Karte mit gültiger Eingabe | Hauptergebnis in Kurzform | „Deine Maschen: 125“, Plan-Karte „17 × 2 M zunehmen, alle 9–10 Reihen“ | ✓ |
| AK5 | leere oder ungültige Eingabe | nur der Titel | Kurzfassung bleibt leer | ✓ |
| AK6 | Zuklappen ändert Eingabe oder Rechnung | nein | Werte und Plan unverändert, `eingeklappt` ist ein eigenes Feld | ✓ |
| AK6 | zugeklappte Karte, Feldfehler „abc“ | klappt auf | ✓ | ✓ |
| AK6 | danach wieder zuklappen, Fehler besteht weiter | bleibt aufgeklappt | bleibt **zu**, Hinweis verborgen | ✗ **S4-03** |
| AK6 | zugeklappte Karte, Statusmeldung statt Feldfehler | klappt auf bzw. meldet sich | bleibt zu, Kurzfassung leer | ✗ **S4-02** |

## 4. Randfälle

### Eingaberegel `startReihe` (MAS-62 AK2, E13)

| Eingabe | Erwartet | Tatsächlich | |
|---|---|---|---|
| `""` | gültig, `null` („automatisch“) | wie erwartet | ✓ |
| `"   "` (nur Leerzeichen) | gültig, `null` | wie erwartet | ✓ |
| `"  7  "` | gültig, 7 | wie erwartet | ✓ |
| `"1"` | gültig, 1 | wie erwartet | ✓ |
| `"1.000"` (Tausendertrennung, E13) | gültig, **1000** | wie erwartet | ✓ |
| `"99999"` (obere Grenze) | gültig, 99999 | wie erwartet | ✓ |
| `"100000"` | `ZU_GROSS`, Grenze 99999 | wie erwartet | ✓ |
| `"12.500.000"` | `ZU_GROSS` | wie erwartet | ✓ |
| `"0"` | `NICHT_POSITIV` | wie erwartet | ✓ |
| `"-3"` | `NICHT_POSITIV` | wie erwartet | ✓ |
| `"−3"` (typografisches Minus) | `NICHT_POSITIV` | wie erwartet | ✓ |
| `"2,5"` | `KEINE_GANZZAHL` | wie erwartet | ✓ |
| `"2.5"` | `KEINE_GANZZAHL` (Punkt ist hier kein Tausendertrenner) | wie erwartet | ✓ |
| `"abc"` | `KEINE_ZAHL` | wie erwartet | ✓ |
| ungültiger Wert im gespeicherten Plan | kein Plan, Hinweis am Feld | `planAusTexten` → `null`, Hinweis erscheint, Karte klappt auf | ✓ |

### Rechen- und Datengrenzen

| Fall | Erwartet | Tatsächlich | |
|---|---|---|---|
| 0 Reihen, 1 Reihe, 2 Reihen × Startreihe 1/2/3/99999 | `anzahl` nie negativ | nie negativ | ✓ |
| sehr großer Plan: 1 → 9999 cm bei 1 M je Ereignis | `ZU_VIELE_EREIGNISSE`, Grenze 9999 | wie erwartet | ✓ |
| knapp darunter (1 → 3990 cm) | gültiger Plan, Ende stimmt | 9 972 Ereignisse, letzte Maschenzahl = Endmaschenzahl (9 975 M) | ✓ |
| leeres Projekt ohne Strickstücke | bleibt gültig | ✓ | ✓ |
| Strickstück ohne Plan | `plan: null`, `eingeklappt: {}` | ✓ | ✓ |
| ID an der Längengrenze (64 Zeichen) für Projekt und Strickstück | bleibt unverändert, Plan und Klapp-Zustand bleiben | ✓ | ✓ |
| doppelte Strickstück-IDs in einer Sicherung | Ersatz-ID, **beide** Strickstücke mit allen Daten | ✓ (die bekannte Grenze aus **MAS-46** betrifft 64-stellige Doppel-IDs und ist weiter offen) | ✓ |
| `startReihe` als Zahl, `null`, `{}`, `[]` im Speicher | Vorbelegung `''`, Plan bleibt erhalten | ✓ | ✓ |
| `startReihe` = `"kaputt"` im Speicher | Text wird **aufbewahrt**, Hinweis am Feld | bleibt `"kaputt"`, kein Plan, nichts gelöscht (R10) | ✓ |
| `startReihe` mit 40 Zeichen | auf `GRENZEN.feld` (20) gekürzt, nicht verworfen | ✓ | ✓ |
| `eingeklappt` = `null`/Liste/Text/Zahl | `{}` | ✓ | ✓ |
| `eingeklappt` mit unbekanntem Kartennamen | Schlüssel still verworfen, bekannte bleiben | ✓ | ✓ |
| `eingeklappt: { plan: "ja" }` bzw. `{ plan: 1 }` | kein Boolean → gilt als offen | ✓ | ✓ |

## 5. Datenerhalt (Risiken R6, R10, R13)

| Prüfung | Ergebnis |
|---|---|
| Schlüssel `maschenrechner.daten.v3` unverändert, keine neue Migration | ✓ – `SCHEMA_VERSION` bleibt 3, `migration.js` unangetastet |
| Alte Schlüssel (`…v1`, `…v2`) bleiben unberührt | ✓ – Sprint 4 fasst die Übernahme nicht an, die Tests aus Sprint 3 laufen weiter |
| Sicherung aus 0.3 (ohne beide Felder) einlesen | ✓ – Startreihe leer, alle Karten offen, **der Plan rechnet Reihe für Reihe identisch weiter** |
| Rundreise 0.4 (sichern → einlesen) mit Startreihe und Klapp-Zustand | ✓ – `deepEqual` |
| Beschädigtes wird repariert oder aufbewahrt, nie still verworfen | ✓ für alle geprüften Fälle innerhalb von 0.4.0 |
| **R13 Rückrichtung:** 0.3.0 liest Daten von 0.4.0 | **teils** – 0.3.0 liest fehlerfrei und rechnet, **verliert aber beide Felder beim nächsten Speichern** → **S4-06** |

Zur Rückrichtung im Detail: Die 0.3.0-Module aus Commit `7a7bae2` gegen einen 0.4.0-Datensatz mit
`startReihe: '40'` ergeben einen gültigen Plan mit 18 Ereignissen ab Reihe 9 (0.4.0: ab Reihe 45).
`pruefeDaten` aus 0.3.0 gibt `startReihe` und `eingeklappt` nicht zurück; `js/app.js` hält den
geprüften Datensatz und schreibt ihn bei der nächsten Änderung zurück – die Einstellung ist damit
ohne Meldung weg. Die Zusage in R13 („ignoriert sie und rechnet unverändert“) stimmt für das Lesen,
nicht für das Zurückschreiben.

## 6. Datenschutz

| Prüfung | Ergebnis |
|---|---|
| Externe Adressen in `index.html`, `css/`, `js/`, `sw.js`, `manifest.webmanifest`, Icons | **keine** – nur der SVG-Namensraum `http://www.w3.org/2000/svg` und die eigene Pages-Adresse in einem Kommentar |
| `<script src>` / `<link href>` | ausschließlich relativ (`./…`) |
| `@import` in CSS, externe Schriften | keine – die Oberfläche nutzt Systemschriften |
| `fetch` | nur in `sw.js`, und dort erst nach `url.origin !== self.location.origin → return` |
| `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `EventSource` | nirgends |
| Cookies | `document.cookie` kommt im Code nicht vor; im Browser nach voller Bedienung: `document.cookie === ""` |
| Tracker, Analyse, Einwilligungsbanner | keine |
| Netzwerkverkehr im Browser (volle Sitzung: Liste, Projekt, Strickstück, Plan, Zähler, Klappen) | **50 Anfragen, alle an `localhost`** – keine einzige fremde Herkunft |
| Content Security Policy in `index.html` | `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'` – ohne `unsafe-inline`, `unsafe-eval` oder `*` |

Sprint 4 fügt **keine** Abweichung vom Datenschutzkonzept aus Sprint 1, Abschnitt 7 hinzu. Beide
neuen Felder sind reine Rechen- und Darstellungsangaben ohne Personenbezug. In `docs/architektur.md`
ist nichts zu begründen – Abschnitt 6 des Sprint-4-Dokuments sagt das richtig voraus.

## 7. Offlinefähigkeit

| Prüfung | Ergebnis |
|---|---|
| `CACHE_NAME` erhöht | ✓ `maschenrechner-v0.4.0` (vorher `-v0.3.0`) |
| Version in `package.json`, `sw.js`, `js/app.js` gleich | ✓ alle drei `0.4.0` |
| Neue Dateien in `APP_DATEIEN` | ✓ – Sprint 4 hat **keine** neue Datei angelegt (Architektur 1: „Kein neues Modul“); die Liste deckt weiterhin jede ausgelieferte Datei ab, geprüft in beide Richtungen |
| Jeder Eintrag in `APP_DATEIEN` existiert | ✓ |
| Alte Caches werden beim Aktivieren gelöscht | ✓ unverändert |
| Fremde Herkunft wird vom Service Worker nicht angefragt | ✓ |

## 8. Mobilansicht (360 × 640 px)

| Prüfung | Erwartet | Tatsächlich | |
|---|---|---|---|
| Zähleransicht ohne Scrollen (R9 / R15) | `scrollHeight ≤ 640` | **genau 640 px** – kein Scrollbalken | ✓ |
| dieselbe Ansicht mit dem Hinweis „Bildschirm kann nicht wachgehalten werden“ | – | 773 px, also scrollbar; der Hinweis allein belegt 164 px | bekannt |
| Zusätzliche Maschenzahl in den Ereigniszeilen | kostet keine Zeile | „Reihe 19: +2 M → 54 M“ bleibt einzeilig, 0 px Mehrhöhe | ✓ |
| Querscrollen irgendwo | nein | `scrollWidth === innerWidth === 360` | ✓ |
| Kartentitel einzeilig | ja | alle vier Rechner einzeilig | ✓ |
| Touch-Ziele | ≥ 44 × 44 px | kein Knopf, Link, `summary`, `select` oder Textfeld darunter | ✓ |

Die Zähleransicht passt, **aber ohne jede Reserve**. Eine weitere Zeile oder eine größere
Schriftgröße im System bringt sie zum Scrollen. R15 ist damit nicht geschlossen, sondern knapp
bestanden – das gehört in den Praxistest.

## 9. Barrierefreiheit

| Prüfung | Ergebnis |
|---|---|
| Klappen per Tastatur | ✓ `summary` ist fokussierbar (`tabIndex 0`), sichtbarer Fokusring (`:focus-visible`, 2 px) |
| Zustand auf/zu für Screenreader | ✓ über `<details>`/`<summary>` vom Browser; **sichtbar aber nicht erkennbar → S4-01** |
| `aria-labelledby` der Karten zeigt weiter auf den Titel im `<summary>` | ✓ |
| `aria-describedby` am Feld „Frühestens ab Reihe“ | ✓ Feldhinweis **und** Fehlermeldung |
| Kontrast der Kurzfassung, hell | `#5f5450` auf `#ffffff` = **7,3 : 1** (gefordert 4,5 : 1 bei 15 px) | ✓ |
| Kontrast der Kurzfassung, dunkel | `#c8bdb6` auf `#282423` = **9,3 : 1** | ✓ |
| Farbe nie allein als Hinweis | ✓ für Fehler (Text) – **nicht** für den Klappzustand, dort fehlt jeder visuelle Hinweis → S4-01 |
| Live-Regionen in der Strickstück-Ansicht | 1 ausdrückliche (`plan-ansage`, verzögert nach S3-04) plus 4 implizite durch `<output>` der Rechner – **unverändert gegenüber 0.3.0**, Sprint 4 fügt keine hinzu |
| Live-Regionen in der Zähleransicht | genau **1** (`ansage`) | ✓ |
| Ansage beim Zählen nennt die Maschenzahl | **nein** – `zaehler.ansageJetzt` lautet „Jetzt 2 Maschen zunehmen“ ohne „→ 48 M“. Die drei Einträge tragen sie als Text; beim Weiterzählen wird sie nicht mitgesprochen. MAS-58 AK6 ist damit nur zum Teil erfüllt. Als Hinweis festgehalten, nicht als eigener Befund, weil die Zahl im Dokument steht und eine weitere Ansage dem Befund MAS-32/S3-04 zuwiderliefe. **Der Product Owner entscheidet.** |

## 10. Was ungeprüft bleibt

- **Alles am iPhone.** Darstellung, Touch-Bedienung beim Stricken, VoiceOver, das Update der
  installierten 0.3.0 auf 0.4.0 mit den echten Daten der Enduserin, das Verhalten des Wachhalters.
  Das bleibt dem Praxistest vorbehalten und ist Teil der Definition of Done von MAS-60.
- **MAS-57 AK4** – die Bestätigung der neuen Kartentitel durch die Enduserin.
- **Safari und Firefox.** Geprüft wurde in Chromium. S4-01 (fehlendes Dreieck) gilt nach der
  CSS-Regel auch für WebKit; nachgemessen ist es dort nicht.
- **Echte Screenreader.** Geprüft sind die Auszeichnung und die Zahl der Live-Regionen, nicht,
  was VoiceOver oder TalkBack daraus machen.
- **Langzeitverhalten des Speichers** (volle Quote, viele große Pläne) – unverändert gegenüber
  Sprint 2/3 und dort geprüft.
- **MAS-63 (US-40)** – ob „frühestens ab“ oder „erstes Ereignis in“ gemeint ist, ist eine offene
  fachliche Frage und ausdrücklich nicht Gegenstand dieses Sprints.

## 11. Hinweise an den Product Owner und das Team

1. **Die vier Vorgänge stehen in Jira noch auf „Zu erledigen“.** Laut Artefaktliste in `CLAUDE.md`
   setzt der Entwickler die Stories auf „Erledigt“. Das ist nachzuholen, sonst stimmt der
   Sprint-Stand in Jira nicht.
2. **Die Dokumentation ist auf dem Stand:** E24 ist an die Startreihe angepasst, E31 ist
   eingetragen, R13–R16 und H3–H4 stehen im Register, der `CHANGELOG`-Eintrag für 0.4.0 ist
   vollständig und nennt auch das bewusst Weggelassene. Nur die Testzahl im Changelog
   („245 automatische Tests“) ist nach diesem Bericht auf **287** zu heben.
3. **Zur Beschriftung „Frühestens ab Reihe“:** Die Abweichung von AK1 ist in MAS-62 abgenommen, die
   QA stimmt ihr fachlich zu – sie beschreibt, was die Regel leistet. Mit S4-04 und S4-05 bleiben
   aber zwei Texte stehen, die genau denselben Fehler wie P3-01 machen. Die drei Texte sollten
   gemeinsam mit der Enduserin durchgesehen werden.
4. **S4-06 kann auch als Dokumentationsänderung erledigt werden**, wenn der Product Owner die
   Rückrichtung für unerheblich hält: dann R13 im Register um den Satz ergänzen, dass die
   Rückrichtung die beiden Felder verliert.

## 12. Was für die Freigabe fehlt

- **S4-01 (MAS-64)** und **S4-02 (MAS-65)** beheben.
- **S4-03 bis S4-06** entweder beheben oder ausdrücklich zurückstellen.
- Nachtest durch die QA, danach Praxistest am iPhone mit der Enduserin.

---

# Nachtest nach der Nachbesserung (Commit `cf49a64`)

Rolle: QA · Stand: 23.10.2026 · Prüfgegenstand: Branch `sprint-4`, Commit **`cf49a64`** („Korrekturen
aus der QA von Sprint 4") · Grundlage: `docs/architektur/sprint-4-architektur.md` **v4.3**,
Risikoregister in `docs/architektur.md` (R13–R16), `CHANGELOG.md` 0.4.0, die Akzeptanzkriterien aus
Abschnitt 3 dieses Berichts

## Ergebnis: **Freigabe** für Version 0.4.0

**S4-01 bis S4-05 sind behoben**, jeder einzeln am Code und im Browser nachgeprüft. **S4-06 ist
sauber dokumentiert** – die Berichtigung von R13 stimmt mit dem Verhalten der 0.3.0-Module überein.
Die beiden früheren `todo`-Tests sind echte Regressionstests und grün. Der Referenzfall aus Sprint 3
rechnet unverändert. Eine Regression durch die Nachbesserung wurde nicht gefunden.

Vier **neue, niedrige Befunde** (S4-07 bis S4-10) betreffen Fälle, die die neue Kurzfassung noch
nicht abdeckt, und einen vergessenen Vorgabetext. Keiner davon blockiert die Veröffentlichung;
S4-09 bestand schon vor der Nachbesserung. Der Product Owner entscheidet, ob sie in 0.4.1 oder in
den Backlog gehen. **Nachtrag vom 23.10.2026:** Die vier Befunde sind nach der Entscheidung des Product Owners
doch als Jira-Bugs angelegt – **MAS-69** (S4-07), **MAS-70** (S4-08), **MAS-71** (S4-09) und
**MAS-72** (S4-10), alle mit Label `qa-sprint-4` am Backlog-Epic MAS-4, weil Epic MAS-60 mit
dem Sprint geschlossen ist. Ebenfalls nachgetragen: Die vier Stories des Sprints, die in
Abschnitt 7 dieses Berichts noch als unbuchte Vorgänge bemängelt werden, stehen seit dem
23.10.2026 auf „Erledigt“.

| Befund | Jira | Stand nach dem Nachtest | Beleg |
|---|---|---|---|
| S4-01 Kein Dreieck, Klappzustand unsichtbar | MAS-64 | **behoben** | `.kartenkopf::before` gemessen: 7 px, `rgb(95,84,80)` = `--text-leise`; `rotate(90deg)` nur bei `details[open]` |
| S4-02 Zugeklappte Karte verbirgt die Statusmeldung | MAS-65 | **behoben** | Startreihe 999 bei zugeklappter Karte: „Bitte prüfen: Für 17 Zu-/Abnahmen …"; auch `probenFehlen` und `ergebnisZuKlein` der Rechner |
| S4-03 Karte mit Fehler lässt sich wieder zuklappen | MAS-66 | **behoben** (geänderter Entwurf) | Zuklappen bleibt erlaubt, der Fehler steht im Kartenkopf; Architektur v4.3, Abschnitt 5.4 |
| S4-04 „ab der ersten" am Schalter „nur jede 2." | MAS-67 | **behoben** | `plan.jedeZweiteHinweis` = „… ab der Startreihe."; im Browser so dargestellt |
| S4-05 Zielquelle hieß „Länge in Reihen" | MAS-67 | **behoben** | Auswahlfeld 227 × 48 px bei 360 px, Eintrag „Aus Länge (cm) → Reihen" |
| S4-06 0.3.0 verliert beide Felder beim Speichern | MAS-68 | **dokumentiert** (nicht behoben, so entschieden) | R13 in beiden Dokumenten berichtigt, CHANGELOG-Abschnitt „Bewusst nicht umgesetzt"; Verhalten der 0.3.0-Module unabhängig nachgestellt |
| S4-07 Plan-Karte verbirgt „Maschenprobe fehlt" | MAS-69 | **neu, niedrig** | zugeklappte Karte 44 px, Kurzfassung leer, Hinweis `checkVisibility() === false` |
| S4-08 Offene Auswahl bleibt zugeklappt unsichtbar | MAS-70 | **neu, niedrig** | Status „auswahl": Kurzfassung leer, kein `data-problem` |
| S4-09 Kurzfassung bleibt nach dem Löschen des Plans stehen | MAS-71 | **neu, niedrig** (Altbestand) | nach „Plan löschen" weiter „17 × 2 M zunehmen …", obwohl `plan === null` |
| S4-10 Vorgabetext in `index.html` nicht mitgezogen | MAS-72 | **neu, kosmetisch** | `data-text="plan.jedeZweiteHinweis"` enthält weiter „, ab der ersten." |

## N.1 Vorgehen

- **Code-Review** des vollständigen Diffs `cf49a64` (10 Dateien) gegen das Architekturdokument v4.3
  und die Akzeptanzkriterien. Die Commit-Botschaft wurde als Behauptung behandelt, nicht als Beleg.
- **Automatische Tests:** `npm test` (Node 22.16, keine Abhängigkeiten), dazu eine eigene neue Datei
  `tests/qa-sprint4-nachtest.test.js`, die unabhängig von den Tests des Entwicklers prüft.
- **Browsermessung:** lokaler Server `py -m http.server 8000`, Chrome 155 im Kopflosmodus über das
  DevTools-Protokoll ferngesteuert, Ansichtsfenster **360 × 640 px**, `mobile: true`. Gemessen wurde
  mit `getBoundingClientRect`, `getComputedStyle` (auch für `::before`), `checkVisibility()` und
  `document.documentElement.scrollHeight/scrollWidth`. Testdaten per dynamischem Import von
  `js/modell.js` in den `localStorage`, danach Neuladen – **erfundene Daten**, ein Projekt
  „Testprojekt" mit den Strickstücken „Teil A/B/C". Der Server wurde nach dem Testen beendet.
- **Rückwärtstest 0.3.0:** die Module aus Commit `7a7bae2` gegen einen von 0.4.0 geschriebenen
  Datensatz laufen lassen (für S4-06).

## N.2 Automatische Tests

| Lauf | Ergebnis |
|---|---|
| `npm test` auf dem Stand `cf49a64` (ohne die neue QA-Datei) | **287 Tests, 287 grün, 0 rot, 0 `todo`** – die Behauptung des Entwicklers stimmt |
| davon die beiden früheren `todo`-Tests (S4-04, S4-05) | echte Regressionstests, beide grün: `plan.jedeZweiteHinweis` ohne „ab der ersten" und mit „Startreihe"; Zielquelle = Kartentitel für dieselbe Einheit |
| `npm test` **mit** `tests/qa-sprint4-nachtest.test.js` | **311 Tests, 307 grün, 0 rot, 4 `todo`** – die vier `todo` halten die neuen Befunde S4-07 bis S4-10 fest |

Die neue Datei prüft eigenständig: das gezeichnete Dreieck und den abgeschalteten Browser-Marker im
Stylesheet, die Struktur `.kartenkopf-text` in beiden Vorlagen, das Fehlen von `setzeOffen`/`istOffen`
in allen drei betroffenen Modulen, die Abdeckung von `.fehler` **und** `[data-rolle="status"]` in
beiden `problemText`-Funktionen, beide Textkorrekturen in allen Einheiten, die Berichtigung von R13
in beiden Dokumenten, den Referenzfall aus Sprint 3 für beide Werte von „nur jede 2.", die
Gleichheit von „Feld fehlt" und „Feld leer", Datenschutz (fremde Adressen, `@import`, CSP) und die
Auslieferungsliste des Service Workers.

## N.3 Die Messwerte des Entwicklers – bestätigt oder widerlegt

| Behauptung aus `docs/STATUS.md` | Nachgemessen (Chrome 155, 360 × 640 px) | Urteil |
|---|---|---|
| Dreieck 7 px in `--text-leise` | `border-left: 7px`, `rgb(95, 84, 80)` – das ist `--text-leise` `#5f5450`; dunkles Schema `rgb(200, 189, 182)` = `#c8bdb6` | **bestätigt** |
| bei offener Karte um 90° gedreht, bei zugeklappter nicht | offen `matrix(0, 1, -1, 0, 0, 0)` (= `rotate(90deg)`), zugeklappt `none` | **bestätigt** |
| `summary` weiter 44 px hoch | offene Karte **44,0 × 294 px**; zugeklappt mit Kurzfassung 56,8 px, mit langem Problemtext bis 125 px | **bestätigt** (44 px ist die Mindesthöhe; der Kopf wächst mit der Kurzfassung, das Touch-Ziel bleibt ≥ 44 px) |
| kein Querscrollen | `scrollWidth === innerWidth === 360` in allen geprüften Zuständen, auch mit dem langen Problemtext | **bestätigt** |
| Startreihe 999, zugeklappte Plan-Karte zeigt „Bitte prüfen: Für 17 Zu-/Abnahmen gibt es keine passende Reihe …" und bleibt zu | Kurzfassung exakt „Bitte prüfen: Für 17 Zu-/Abnahmen gibt es keine passende Reihe. Nimm mehr Maschen pro Zu-/Abnahme oder prüfe die Länge.", `details.open === false`, `data-problem` gesetzt | **bestätigt** |
| mit gültigem Wert wieder „17 × 2 M zunehmen, alle 9–10 Reihen", `data-problem` verschwindet | genau so, `data-problem` nicht mehr vorhanden, Farbe zurück auf `--text-leise` | **bestätigt** |
| Auswahlfeld der Zielquelle 227 px breit, Name „Aus Länge (cm) → Reihen" | **227,0 × 48 px**; Einträge „Zu-/Abnahmeplan" und „Aus Länge (cm) → Reihen" | **bestätigt** |
| Zähleransicht unverändert genau 640 px ohne den Wachhalter-Hinweis | `scrollHeight === 640`, kein Scrollbalken | **bestätigt** |
| mit Wachhalter-Hinweis 773 px | **749 px** (der Hinweis selbst 140 px hoch, `clientHeight` 640) | **abweichend**: dass die Ansicht mit dem Hinweis scrollt, stimmt; die Zahl 773 ist hier nicht reproduzierbar (Schriftrendering, Scrollbalken). Kein Befund, aber die genaue Zahl taugt nicht als Zusage. |

## N.4 Befunde einzeln

### S4-01 (MAS-64) – **behoben**

| Prüfung | Erwartet | Tatsächlich | |
|---|---|---|---|
| Dreieck vorhanden und sichtbar | Zustandsanzeige am Kartenkopf | eigenes Rahmen-Dreieck in `.kartenkopf::before`, `content: ''` | ✓ |
| Zustand erkennbar | offen ≠ zu | Drehung um 90° nur bei `details[open]`; im Bildschirmfoto deutlich unterscheidbar | ✓ |
| nicht nur Farbe als Hinweis | Form trägt die Aussage | Richtung des Dreiecks, nicht die Farbe | ✓ |
| Kontrast des Dreiecks | ≥ 3 : 1 (grafisches Element) | hell 7,32 : 1, dunkel 8,35 : 1 | ✓ |
| Screenreader | kein zusätzliches Vorlesen | leerer `content`, kein Textknoten; den Zustand meldet `<details>` selbst | ✓ |
| Marker des Browsers | abgeschaltet, kein doppeltes Dreieck | `list-style: none` und `::-webkit-details-marker { display: none }` | ✓ |
| Touch-Ziel, Umbruch | ≥ 44 px, kein Querscrollen | 44 × 294 px, `.kartenkopf-text` bricht um, `scrollWidth` 360 | ✓ |

Die Begründung im Commit ist zutreffend: `display: flex` verhindert den `::marker`, weil der nur bei
`display: list-item` entsteht. Der falsche Kommentar im Stylesheet ist entfernt.

### S4-02 (MAS-65) – **behoben**

| Zustand der Karte (zugeklappt) | Erwartet | Tatsächlich | |
|---|---|---|---|
| Plan: Startreihe 999 (`ZU_WENIG_REIHEN`) | Meldung sichtbar | „Bitte prüfen: Für 17 Zu-/Abnahmen gibt es keine passende Reihe. …" | ✓ |
| Plan: Startreihe „abc" (Feldfehler) | Meldung sichtbar | „Bitte prüfen: Bitte eine Zahl eingeben, z. B. 12 oder 12,5." | ✓ |
| Rechner: Eingabe „abc" | Meldung sichtbar | dieselbe Meldung mit Vorspann | ✓ |
| Rechner: geleertes Pflichtfeld | Meldung sichtbar | „Bitte prüfen: Bitte einen Wert eingeben." | ✓ |
| Rechner: Maschenproben unvollständig | Meldung sichtbar | „Bitte prüfen: Bitte zuerst beide Maschenproben vollständig ausfüllen." | ✓ |
| Rechner: Anpassung zu groß (`ergebnisZuKlein`) | Meldung sichtbar | „Bitte prüfen: Mit dieser Anpassung bleibt weniger als 1 übrig. …" | ✓ |
| Plan: eigene Probe unvollständig | Meldung sichtbar | **Kurzfassung leer** → **S4-07** | ✗ |
| Plan: offene Auswahl, noch nicht entschieden | Hinweis erwartet | **Kurzfassung leer** → **S4-08** | ✗ |
| unberührtes leeres Feld | **keine** Meldung, nur der Titel (AK5) | Kurzfassung leer | ✓ |

Beide `problemText`-Funktionen werten nur **sichtbare** Meldungen aus (`!e.hidden` und Textinhalt),
Feldfehler haben Vorrang vor der Statusmeldung. Das Wort „Bitte prüfen:" trägt die Aussage; die
Farbe `--warnung-text` kommt hinzu (Kontrast hell 9,3 : 1, dunkel 11,5 : 1, Schriftstärke 600). Die
Kurzfassung ist **keine** Live-Region, es kommt also keine Ansage hinzu – MAS-32/S3-04 bleibt
gewahrt.

### S4-03 (MAS-66) – **behoben**, auf dem freigegebenen anderen Weg

Das erzwungene Aufklappen ist ersatzlos entfallen; `setzeOffen`/`istOffen` sind aus `js/dom.js`
entfernt. Eine Karte mit Fehler lässt sich zuklappen und **bleibt** zu – das ist jetzt zulässig,
weil der Fehler im Kartenkopf steht. Die Abweichung vom ursprünglichen Entwurf ist in
`docs/architektur/sprint-4-architektur.md` v4.3, Abschnitt 5.4 beschrieben und in R16 nachgezogen.

**Beurteilung gegen den Zweck von US-38 AK6** („ein Hinweis darf nicht verborgen bleiben"): Für
Feldfehler und für alle Statusmeldungen beider Kartenarten ist der Zweck erfüllt, und die neue
Lösung ist der alten überlegen, weil sie den Willen der Nutzerin nicht überschreibt. **Vollständig
ist sie nicht:** Die Plan-Karte kennt zwei weitere Zustände mit Handlungsbedarf, die die Kurzfassung
nicht erreicht (S4-07, S4-08). Das Architekturdokument zählt in Abschnitt 5.4 ausdrücklich
„Maschenproben fehlen" zu den abgedeckten Meldungen – das gilt für die Rechner-Karten, nicht für den
eigenen Probenhinweis der Plan-Karte.

### S4-04 und S4-05 (MAS-67) – **behoben**

| Prüfung | Erwartet | Tatsächlich | |
|---|---|---|---|
| `plan.jedeZweiteHinweis` | kein „ab der ersten" | „Dann nur jede zweite Reihe bzw. Runde ab der Startreihe." | ✓ |
| im Browser dargestellt | neuer Wortlaut | genau so | ✓ |
| Vorgabetext in `index.html` | mitgezogen | **weiter „…, ab der ersten."** → **S4-10** (nie sichtbar, `texteFuellen` ersetzt ihn) | ✗ |
| `zaehler.quelle.laengeZuReihen` = Kartentitel | gleich, in jeder Einheit | gleich für `cm` und `in`; der Rohtext trägt `{einheit}`, `ctx.t` füllt es immer | ✓ |
| Platz im Auswahlfeld bei 360 px | passt ohne Querscrollen | 227 px von 360 px, `scrollWidth` 360 | ✓ |
| übrige Zielquellen | unverändert | „Zu-/Abnahmeplan", „Reihen aus der Anleitung" | ✓ |

### S4-06 (MAS-68) – **dokumentiert**, bewusst nicht behoben

| Prüfung | Ergebnis |
|---|---|
| Verhalten unabhängig nachgestellt | `pruefeDaten` aus Commit `7a7bae2` (0.3.0) gegen einen 0.4.0-Datensatz: Ergebnis `gueltig`, das Strickstück behält `id, name, erstellt, geaendert, probeId, rechner, zaehler, zielQuelle, plan` – **`eingeklappt` fehlt, `plan.startReihe` fehlt**. Die Beschreibung des Befundes stimmt. |
| R13 in `docs/architektur.md` | berichtigt: „verliert die neuen Felder aber beim nächsten Speichern. Bewusst hingenommen (MAS-68)" – zutreffend |
| R13 in `docs/architektur/sprint-4-architektur.md`, Abschnitt 8 | ausführlich und richtig; nennt die Ursache (`pruefeDaten` schneidet unbekannte Felder weg), die Folge (Plan rechnet mit dem Standard) und einen Weg für später |
| R16 | auf die neue Lösung umgeschrieben, nennt die erste Fassung als Befund | ✓ |
| `CHANGELOG.md` | eigener Abschnitt „Bewusst nicht umgesetzt" mit S4-06, MAS-68 und Begründung | ✓ |
| Einschränkung | Der Punkt unter „Technisch" sagt unverändert, eine 0.3.0 könne Daten „lesen und unverändert rechnen". Das stimmt für das Lesen und wird zehn Zeilen später richtiggestellt, liest sich für sich genommen aber zu beruhigend. **Empfehlung**, kein Befund: den Halbsatz um „…, verliert sie aber beim Speichern" ergänzen. |

Damit ist S4-06 als Dokumentationsaufgabe **erledigt**. Der Datenverlust selbst bleibt bestehen und
ist in R13 nachlesbar; er tritt nur auf, wenn ein zweites Gerät ohne Update weiterarbeitet.

## N.5 Keine Regression durch die Nachbesserung

| Prüfung | Ergebnis |
|---|---|
| `setzeOffen` / `istOffen` wirklich unbenutzt | ✓ – kein Treffer mehr in `js/`, `index.html`, `tests/`; `klappbar()` gibt nichts mehr zurück, beide Aufrufstellen werten nichts aus; der JSDoc-`@returns` ist ebenfalls entfernt |
| Klappen weiterhin vollständig | ✓ – Klick auf den Kopf, **Enter** und **Leertaste** klappen zu und auf; der Zustand steht sofort in `eingeklappt` und überlebt das Neuladen; Aufklappen entfernt den Schlüssel wieder |
| Anfangszustand wird nicht als Wunsch gespeichert | ✓ – der `gemeldet`-Abgleich ist unverändert; beim Aufbau wird nichts geschrieben |
| Referenzfall Sprint 3, leere Startreihe, **ohne** „jede 2." | ✓ – 50 Anfangsmaschen, 84 Endmaschen, 167 Reihen, 17 Zunahmen, Abstand 9–10, letzte Maschenzahl 84, letztes Ereignis in Reihe 157 (≤ 166, E24) |
| derselbe Fall **mit** „jede 2." (US-39 AK9) | ✓ – gleiche Kennzahlen, alle 17 Ereignisse auf ungeraden Reihen (9 … 157) |
| Plan **ohne** das Feld `startReihe` gegen leeres Feld | ✓ – `deepEqual` für beide Werte von „jede 2." |
| `erlaubteReihen` ohne drittes Argument gegen `null` | ✓ – gleiche Anzahl, gleicher Start, gleiche Reihen (167 Reihen, beide Schalterstellungen) |
| Kurzfassung der Rechner-Karten bei gültiger Eingabe | ✓ – „Deine Maschen: 125", „Deine Reihen: 111"; nach dem Leeren des Feldes bleibt kein alter Wert stehen |
| Maschenzahl je Ereignis (US-37) im Zähler | ✓ – „Reihe 19: +2 M → 54 M", „Reihe 28: … → 56 M", „Reihe 37: … → 58 M", einzeilig |
| Randfälle `startReihe` (erneut geprüft) | ✓ – `""` und `"   "` → automatisch; `"1.000"` → 1000 (E13); `"0"`/`"-3"` → `NICHT_POSITIV`; `"2,5"` → `KEINE_GANZZAHL`; `"abc"` → `KEINE_ZAHL`; `"99999"` gültig, `"100000"` → `ZU_GROSS`; 999 → `ZU_WENIG_REIHEN` mit `moeglich 0`, 166 → `moeglich 1` |
| Datenerhalt bei 64-stelligen IDs | ✓ – Projekt- und Strickstück-ID mit 64 Zeichen bleiben, `startReihe: "1.000"` und `eingeklappt` erhalten |
| beschädigte Daten | ✓ – `eingeklappt: "ja"` → `{}`, unbekannte Kartennamen entfallen, `startReihe: "kaputt"` wird **aufbewahrt** (R10), der Rest des Strickstücks bleibt |
| gesamte Bestandssuite | ✓ – 287 von 287 grün |

## N.6 Datenschutz

| Prüfung | Ergebnis |
|---|---|
| Netzwerkverkehr einer vollen Sitzung (Liste, Strickstück, Plan, Zähler, Klappen, Löschdialog) | **28 Anfragen, alle an `localhost:8000`** – keine einzige fremde Herkunft |
| `fetch`, `<script src>`, `<link href>`, `@import`, Schriften | keine externen; nur relative Pfade, Systemschriften |
| Cookies nach der Sitzung | `document.cookie === ""` |
| Tracker, Analyse, Einwilligungsbanner | keine |
| Content Security Policy in `index.html` | unverändert eng: `default-src 'self'`, `script-src 'self'`, `base-uri 'none'`, `form-action 'none'`, `object-src 'none'`; kein `unsafe-inline`, kein `unsafe-eval`, kein `*` |
| die beiden neuen Felder | reine Darstellungs- und Rechenangaben ohne Personenbezug; in `docs/architektur.md` ist nichts zu begründen |

Die Nachbesserung ändert am Datenschutzkonzept aus Sprint 1, Abschnitt 7 nichts.

## N.7 Offlinefähigkeit

| Prüfung | Ergebnis |
|---|---|
| neue Dateien durch die Nachbesserung | **keine** – `cf49a64` ändert 10 vorhandene Dateien und legt keine an |
| alle geänderten Dateien in `APP_DATEIEN` | ✓ `css/style.css`, `js/dom.js`, `js/texte.js`, `js/ansichten/plankarte.js`, `js/ansichten/strickstueck.js`, `index.html` |
| `CACHE_NAME` | ✓ `maschenrechner-v0.4.0` |
| Versionsnummern `package.json` / `sw.js` / `js/app.js` | ✓ alle drei `0.4.0` |
| jeder Eintrag der Liste existiert | ✓ |

## N.8 Mobilansicht und Barrierefreiheit (360 × 640 px)

| Prüfung | Erwartet | Tatsächlich | |
|---|---|---|---|
| Zähleransicht ohne Scrollen (R9/R15) | `scrollHeight ≤ 640` | genau 640 px, unverändert gegenüber dem ersten Lauf | ✓ (knapp) |
| dieselbe Ansicht mit dem Wachhalter-Hinweis | – | 749 px, also scrollbar; alle Bedienelemente bleiben erreichbar, nichts wird abgeschnitten | bekannt (R15) |
| Querscrollen | nein | `scrollWidth` 360 in allen Ansichten und Zuständen | ✓ |
| Touch-Ziele in der Zähleransicht | ≥ 44 × 44 px | kein Element darunter | ✓ |
| Touch-Ziel des Kartenkopfes | ≥ 44 px | 44 × 294 px | ✓ |
| Tastatur | fokussierbar, Enter und Leertaste | `summary` mit `tabIndex 0`, beide Tasten klappen, Fokusring 2 px `--fokus` sichtbar | ✓ |
| Kontrast Kurzfassung normal | ≥ 4,5 : 1 | hell 7,32 : 1, dunkel 8,35 : 1 | ✓ |
| Kontrast Kurzfassung mit Problem | ≥ 4,5 : 1 | hell 9,30 : 1, dunkel 11,48 : 1 | ✓ |
| Farbe nie allein | das Wort trägt die Aussage | „Bitte prüfen:" im Text, Dreieck als Form | ✓ |
| Live-Regionen Strickstück-Ansicht | nicht mehr als bisher | unverändert: 1 ausdrückliche (`plan-ansage`, verzögert) und 4 implizite `<output>`; die neue Kurzfassung ist **keine** Live-Region | ✓ |
| Live-Regionen Zähleransicht | genau 1 | 1 (`ansage`) | ✓ |
| Kopf einer zugeklappten Karte mit langem Problemtext | lesbar, kein Überlauf | bricht um, bis 125 px hoch, kein Querscrollen | ✓ |

## N.9 Neue Befunde

### S4-07 (MAS-69) – Die Plan-Karte verbirgt zugeklappt den Hinweis „Maschenprobe fehlt" (niedrig)

**Fall:** Ein Strickstück hat einen Plan mit gültigen Werten, aber eine unvollständige eigene
Maschenprobe. Die Plan-Karte zeigt dann `[data-rolle="probe-fehlt"]`: „Bitte zuerst die eigene Probe
dieses Strickstücks vollständig ausfüllen."

**Gemessen:** Zugeklappt ist der Kartenkopf 44 px hoch, die Kurzfassung **leer**, kein
`data-problem`; der Hinweis ist tatsächlich unsichtbar (`checkVisibility() === false`). Die Nutzerin
sieht nur den Titel „Zu- und Abnahmen" und erfährt nicht, warum kein Plan erscheint.

**Ursache:** `problemText()` in `js/ansichten/plankarte.js` kennt nur `.fehler` und
`[data-rolle="status"]`. Der Probenhinweis ist ein drittes Element.

**Warum nur niedrig:** Der Probenkasten oben in derselben Ansicht zeigt im selben Fall
„Eigene Probe: – M auf 10 cm · – R auf 10 cm", und jede Rechner-Karte mit Eingabe meldet den Mangel
in ihrer Kurzfassung. Es gibt also andere Signale.

**Vorschlag:** `[data-rolle="probe-fehlt"]` in `problemText()` aufnehmen. Eine Zeile; die Zusage in
Architektur v4.3, Abschnitt 5.4 wäre dann auch für die Plan-Karte eingelöst.

### S4-08 (MAS-70) – Eine offene Auswahl bleibt zugeklappt unsichtbar (niedrig)

**Fall:** Die Differenz ist nicht durch die Maschen je Ereignis teilbar (z. B. 20 → 33 cm bei 2 M je
Ereignis), und die Nutzerin hat noch nicht gewählt. Status `auswahl` mit Optionen.

**Gemessen:** Zusammenfassung „–", Statusmeldung bewusst leer, Kurzfassung leer, kein
`data-problem`. Zugeklappt wirkt die Karte wie „nichts eingetragen", obwohl eine Entscheidung
aussteht.

**Bewertung:** Grenzfall. Es ist kein Fehler, aber Handlungsbedarf, und AK5 („Hauptergebnis in
Kurzform") trifft nicht zu, weil es noch kein Ergebnis gibt. Eine Kurzfassung wie „Bitte prüfen:
Auswahl offen" wäre folgerichtig. Der Product Owner entscheidet.

### S4-09 (MAS-71) – Nach dem Löschen des Plans bleibt die alte Kurzfassung stehen (niedrig, Altbestand)

**Fall:** Plan löschen, Karte danach zuklappen.

**Gemessen:** Die Karte zeigt weiter „17 × 2 M zunehmen, alle 9–10 Reihen", obwohl `plan === null`
ist und die Karte den Knopf „Plan anlegen" enthält. Erst beim nächsten Aufbau der Ansicht (Wechsel
und Zurück) ist die Kurzfassung leer.

**Ursache:** `berechneUndZeige()` verlässt den Zweig „kein Plan" vor `zeigeKurzfassung(…)`.
**Nicht durch die Nachbesserung entstanden** – der Zweig sieht in `bad253d` genauso aus; der erste
Lauf hat den Fall übersehen.

### S4-10 (MAS-72) – Vorgabetext in `index.html` nicht mitgezogen (kosmetisch)

`data-text="plan.jedeZweiteHinweis"` trägt in der Vorlage weiter den beanstandeten Wortlaut „Dann
nur jede zweite Reihe bzw. Runde, ab der ersten." Im Browser steht der neue Text, weil
`texteFuellen` ihn ersetzt – sichtbar wird der alte nie. Er führt aber beim Lesen der Vorlage in die
Irre und sollte beim nächsten Anfassen der Datei angeglichen werden.

## N.10 Hinweise an den Product Owner

1. **Beschriftung und Hinweis sprechen zwei Sprachen:** Das Feld heißt „Frühestens ab Reihe", der
   Hinweis am Schalter spricht von „der Startreihe". Beides ist für sich richtig; zusammen gelesen
   fehlt die Brücke. Das gehört zu der ohnehin offenen Frage **MAS-63** und am besten in die
   Durchsicht der Texte mit der Enduserin.
2. **Die Testzahl im `CHANGELOG`** steht mit 287 richtig. Nach Übernahme dieses Nachtests kommen
   24 QA-Tests hinzu (311 gesamt, davon 4 `todo` für S4-07 bis S4-10).
3. **S4-07 bis S4-10** sind inzwischen als MAS-69 bis MAS-72 angelegt (Nachtrag oben). S4-07 ist
   eine Ein-Zeilen-Änderung und könnte vor dem Praxistest mitgenommen werden; MAS-69, MAS-70
   und MAS-71 betreffen dieselbe Datei `js/ansichten/plankarte.js` und lohnen sich zusammen.
   **MAS-70 ist zuerst eine Produktentscheidung**, kein fertiger Auftrag.
4. **Zur Zähleransicht:** Sie passt weiterhin ohne jede Reserve in 640 px; mit dem
   Wachhalter-Hinweis scrollt sie. R15 bleibt offen und gehört in den Praxistest.

## N.11 Was ungeprüft bleibt

- **Alles am iPhone**: Darstellung, Touch-Bedienung beim Stricken, VoiceOver, das Update der
  installierten 0.3.0 auf 0.4.0 mit den echten Daten der Enduserin, der Wachhalter. Das bleibt dem
  Praxistest vorbehalten und ist Teil der Definition of Done von MAS-60.
- **Safari und Firefox.** Gemessen wurde in Chrome 155 (Chromium). Das Dreieck ist selbst gezeichnet
  und damit vom `::marker`-Verhalten des Browsers unabhängig; nachgemessen ist das in WebKit nicht.
- **Echte Screenreader.** Geprüft sind die Auszeichnung und die Zahl der Live-Regionen, nicht, was
  VoiceOver oder TalkBack daraus machen.
- **Jira.** In dieser Sitzung war kein Zugriff auf das Projekt MAS möglich. Die Akzeptanzkriterien
  wurden deshalb aus Abschnitt 3 dieses Berichts und dem Architekturdokument v4.3 gelesen; **ob
  MAS-57, MAS-58, MAS-59, MAS-62 und MAS-64 bis MAS-68 den richtigen Status tragen, ist ungeprüft.**
- **Bestätigung der Texte durch die Enduserin** (MAS-57 AK4 und jetzt auch die beiden geänderten
  Texte aus S4-04 und S4-05).
