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
