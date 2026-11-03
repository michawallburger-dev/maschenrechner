# Testbericht Sprint 5 – „Englisch und Zoll“ (v0.5.0)

Rolle: QA · Stand: 02.11.2026 · Prüfgegenstand: Branch `sprint-5`, Commit `1664e85` (plus die
QA-Tests dieses Berichts) · Grundlage: Epic **MAS-73** mit **MAS-28 (US-24)**, **MAS-74 (US-41)**
und **MAS-27 (US-23)**, `docs/architektur/sprint-5-architektur.md` **v5.2** (Abschnitt 9: 25
Pflichtprüfungen), `docs/entscheidungen.md` (E1–E36), Risikoregister in `docs/architektur.md`
(R17–R20, H5–H7)

> **Einschränkung: Der Jira-Stand ist nicht verifiziert.** Dieser Prüflauf hatte keinen Zugriff auf
> das Projekt MAS. Die Akzeptanzkriterien sind deshalb aus dem Architekturdokument v5.2,
> `docs/STATUS.md`, `CHANGELOG.md` und `docs/entscheidungen.md` rekonstruiert. Wo unten „AK“ steht,
> ist die im Architekturdokument zitierte Fassung gemeint. Ob die Stories in Jira auf „Erledigt“
> stehen, ob die Version 0.5.0 zugeordnet ist und ob die hier genannten AK-Nummern mit Jira
> übereinstimmen, wurde **nicht** geprüft.

## Ergebnis: **Freigabe**

Keine kritischen, keine hohen, keine mittleren Befunde. Die Umsetzung ist in ihrem Kern solide:

- **Keine Regression.** Mit `de`/`cm`/`auto` rechnet und zeigt die App bitgleich wie 0.4.0. Der
  Referenzfall aus Sprint 3 ergibt unverändert **50 → 85 M, 167 Reihen, Auswahl 84/86 M**.
  `plan.js` und `ziel.js` sind am Diff nachweislich **unberührt** (R7).
- **Der Referenzfall in Zoll stimmt.** Nach dem Umschalten liefert er dieselben Zahlen, und der Weg
  zurück nach cm ist exakt (`10` → `3.937` → `10`).
- **Die Behauptung zu den drei Nachkommastellen (H5) ist unabhängig nachgestellt und bestätigt** –
  in beide Richtungen, siehe Abschnitt 4. Sie ist sogar stärker, als der Entwickler sie formuliert
  hat.
- **Die Feldliste der Einheitenumstellung ist vollständig und nicht zu groß** – maschinell geprüft
  über einen Pfad-Vergleich aller Blattwerte (Abschnitt 3.1).
- **Datenschutz, Offlinefähigkeit und Datenerhalt unverändert in Ordnung.**
- **Alle zwölf Kombinationen** aus 2 Sprachen × 2 Einheiten × 3 Darstellungen sind erreichbar und
  liefern sinnvolle Anzeigen (Abschnitt 3.3).

Gefunden wurden **sieben niedrige bzw. kosmetische Befunde**. Keiner hindert die Veröffentlichung.
**Empfehlung: S5-01 vor dem Merge beheben** – es ist eine vorhandene CSS-Klasse, die an zwei
Stellen fehlt, und der Fehler steht auf der neuen Einstellungsseite gut sichtbar.

| Befund | Schwere | Betrifft |
|---|---|---|
| S5-01 „Sprache“ und „Längeneinheit“ haben zwei Optionen im Dreierraster – ein Drittel der Gruppe bleibt leer | niedrig | US-23/US-24, Architektur 7, R17 |
| S5-02 `bruchVorlesbar` wird in keiner Ansicht benutzt; es gibt kein `aria-label` mit der vorlesbaren Fassung | niedrig | US-41 AK10, Architektur 5.1 |
| S5-03 Achte Längen-Anzeigestelle übersehen: die Probenzeile zeigt „3.937 in“ als Rohtext | niedrig | US-41, Architektur 5.2 |
| S5-04 Eine Probe mit leerer Stückzahl verliert beim Wechsel ein selbst eingetragenes Bezugsmaß | niedrig | US-24 AK4, R6/R10 |
| S5-05 Umgerechnete Werte können Feldgrenzen sprengen (40 in → 101.6 cm > Höchstwert 100) | niedrig | US-24, Architektur 4.2 |
| S5-06 In englischer Schreibweise wird „1,000“ als 1 gelesen | niedrig | US-23, E13/MAS-30 |
| S5-07 Nach dem Sprachwechsel springt der Fokus auf den Seitentitel | niedrig | US-23 AK1, Architektur 6.2 |

Alle sieben sind als `todo`-Tests in `tests/qa-sprint5.test.js` festgehalten; sie werden grün,
sobald der jeweilige Befund behoben ist.

## 1. Vorgehen

- **Code-Review** aller 12 in Sprint 5 geänderten Quell- und Vorlagendateien gegen das Architekturdokument v5.2,
  unabhängig von Commit-Nachricht, CHANGELOG und `docs/STATUS.md`. Geprüft wurde am Diff
  `main..sprint-5`, nicht an der Beschreibung.
- **Automatische Tests:** `node --test` (Node 22.16, keine Abhängigkeiten).
  **Vorher 338 Tests, nachher 395** – 57 neue in `tests/qa-sprint5.test.js`.
  **384 grün, 0 rot, 11 `todo`** (4 aus Sprint 4, 7 neue zu den Befunden dieses Berichts).
- **Browsertests** in Chrome 156 (headless, über das DevTools-Protokoll ferngesteuert), lokal über
  `py -m http.server 8000`, Ansichtsfenster **360 × 640 px**, Gerätemodus. Gemessen wurden echte
  Layoutwerte (`getBoundingClientRect`, `scrollWidth`/`clientWidth`), nicht geschätzt. Tastatur-
  eingaben wurden als echte Tastenereignisse gesendet. Testdaten (erfunden) direkt in den
  `localStorage` gelegt. Server und Browser nach dem Testen beendet.
- **Zahlenanalyse** zu H5 außerhalb der App: 226 632 Kombinationen aus Bezugsmaß, Dichte und Länge,
  je mit 2, 3 und 4 Nachkommastellen (Abschnitt 4).

## 2. Automatische Tests

| Bereich | Tests | Ergebnis |
|---|---|---|
| Bestand Sprint 1–4 | 311 | ✓ alle grün (4 `todo` aus Sprint 4 unverändert) |
| davon neu aus der Entwicklung in Sprint 5 (`modell-einheit`, `einheiten`, `format`, `texte`) | 27 | ✓ |
| **Neu QA Sprint 5** (`tests/qa-sprint5.test.js`) | **57** | 50 ✓, 7 `todo` (S5-01 bis S5-07) |
| **Summe** | **395** | **384 ✓ · 0 ✗ · 11 todo** |

Die QA-Tests sind unabhängig von der Umsetzung formuliert. Schwerpunkte:

- **Pfad-Vergleich** aller Blattwerte vor und nach `einheitUmstellen`: Der Test listet die
  geänderten Pfade auf und vergleicht sie mit der Tabelle aus Architektur 4.2 – damit fällt sowohl
  ein vergessenes als auch ein zu viel angefasstes Feld auf.
- **Nachstellung von H5** mit frei wählbarer Stellenzahl, über 10 626 praxisnahe Kombinationen.
- **Regressionstest R19** über 2000 Werte × 2 Einheiten × 2 Gebietsschemata: `formatLaenge(…,
  'dezimal')` muss zeichengleich sein mit `formatZahl(vonCm(…))`.
- **Eigenschaftstest** der Bruchanzeige über 5001 Werte: Abweichung ≤ 1/16, Monotonie.
- **Textprüfungen**: gleiche Schlüsselmenge, gleiche Platzhalter, keine deutschen Reste (nach
  Abzug der Platzhalternamen), keine festen Einheitenkürzel, kein englischer Text mehr als
  25 Zeichen länger als der deutsche.
- **Strukturprüfungen**: `plan.js`, `ziel.js`, `rechner.js` und `zaehler.js` dürfen `format.js`
  nicht einbinden und das Wort „Darstellung“ nicht kennen (US-41 AK6); keine Ansicht darf `vonCm`
  benutzen oder selbst von der Einheit auf die Darstellung schließen (Architektur 3.1/5.2).

## 3. Testfälle je Akzeptanzkriterium

### 3.1 MAS-28 (US-24) – Längeneinheit Zoll

| # | Eingabe | Erwartet | Tatsächlich | Ergebnis |
|---|---|---|---|---|
| 1 | `zuCm(4,'in')` / `vonCm(2.54,'in')` / `standardBezug('in')` | 10,16 / 1 / 4 | 10,16 / 1 / 4 | ✓ |
| 2 | Einstellungen → Längeneinheit → „Zoll (in)“ | Einheit gespeichert, alle Maße umgerechnet, Hinweis sichtbar | `laengeneinheit:'in'`, Hinweis „Die Maße wurden umgerechnet.“ (294 × 44 px, `role="status"`) | ✓ |
| 3 | Probe 25 M / 37 R auf 10 cm → Zoll | Bezug 3.937 | `maschenBezug` = `reihenBezug` = `'3.937'` | ✓ |
| 4 | Rechnereingaben 20 cm / 45 cm → Zoll | 7.874 / 17.717 | 7.874 / 17.717 | ✓ |
| 5 | Plan 20 / 34 / 45 cm → Zoll | 7.874 / 13.386 / 17.717 | identisch | ✓ |
| 6 | Stückzahlen, Nadelstärke, Anpassungen, Startreihe, Zählerstand, Zielquelle, Klapp-Zustand | **unverändert** | alle unverändert (84, 120, „4,5“ mm, −1/+2, '', 39, `plan`, `{plan:true}`) | ✓ |
| 7 | `geaendert` der Projekte | unverändert (keine Umsortierung) | unverändert | ✓ |
| 8 | Leere Probe (Bezug 10, Anzahl leer) → Zoll | Bezug „4“, nicht „3.937“ | „4“ | ✓ |
| 9 | Eingaben `''`, `'12,'`, `'abc'`, `'-'` → Zoll | bleiben wörtlich stehen | bleiben stehen | ✓ |
| 10 | `einheitUmstellen` mit `'cm'`, `'yard'`, `null` | gibt dasselbe Objekt zurück | identisch (`===`) | ✓ |
| 11 | Seiteneffekt auf die Eingabedaten | keiner | Eingabe deepEqual zur Kopie | ✓ |
| 12 | 2 Projekte × 2 Proben × Strickstücke mit und ohne Plan | alle erfasst, `plan:null` stört nicht | alle erfasst | ✓ |
| 13 | Beschädigte Daten (`plan:'kaputt'`, `rechner:42`, Projekt ohne Proben) nach `pruefeDaten` | umstellbar ohne Ausnahme | läuft durch | ✓ |
| 14 | Umgerechnete Werte | nie mit Komma (H6) | nie mit Komma, immer Punkt | ✓ |
| 15 | Hin und zurück (2000 Werte 0,1–200,0 cm) | zeichengleich zum Ausgangstext | zeichengleich | ✓ |
| 16 | Zwölffaches Umschalten im Browser (siehe 3.3) | Werte bleiben exakt | `45` bleibt `45`, `17.717` bleibt `17.717` | ✓ |
| 17 | Bezugsmaß 40 in → cm | gültiger Feldwert | `101.6` – über dem Höchstwert 100 für Bezugsmaße | ✗ **S5-05** |
| 18 | Probe mit Bezug 15, Anzahl leer → Zoll | 5.906 (Eingabe erhalten) | „4“ – die Eingabe wird ersetzt | ✗ **S5-04** |

### 3.2 MAS-74 (US-41) – Dezimal oder Bruch

| # | Eingabe | Erwartet | Tatsächlich | Ergebnis |
|---|---|---|---|---|
| 1 | `formatBruch` für 0 / 0,06 / 0,07 / 0,125 / 0,25 / 0,375 / 0,5 / 0,625 / 0,75 / 0,875 / 0,94 | 0 / 0 / ⅛ / ⅛ / ¼ / ⅜ / ½ / ⅝ / ¾ / ⅞ / 1 | wie erwartet | ✓ |
| 2 | 0,5 | „½“, nicht „0½“ | „½“ | ✓ |
| 3 | 4,0 | „4“, kein Bruchteil | „4“ | ✓ |
| 4 | `NaN`, `Infinity`, `null`, `undefined`, `'4,5'` | „–“ | „–“ | ✓ |
| 5 | 12345,5 | kein Tausendertrenner | „12345½“ | ✓ |
| 6 | Eigenschaft über 5001 Werte | Abweichung ≤ 1/16, monoton | erfüllt | ✓ |
| 7 | `formatLaengeAbweichung(0,1 cm, in, bruch)` | „±0“ (H7) | „±0“ | ✓ |
| 8 | 81 Abweichungen von −0,04 bis +0,04 in | nie „+0“ oder „−0“ | nie | ✓ |
| 9 | `formatLaengeAbweichung(±1,27 cm, in, bruch)` | „+½“ / „−½“ | „+½“ / „−½“ | ✓ |
| 10 | `formatLaenge(…, 'dezimal')`, 2000 Werte × 2 Einheiten × 2 Locales | zeichengleich zu 0.4.0 | zeichengleich (R19 eingelöst) | ✓ |
| 11 | `darstellungFuer` auto+cm / auto+in / fehlend / `null` / „roemisch“ | dezimal / bruch / wie auto / dezimal / wie auto | wie erwartet | ✓ |
| 12 | Eigene Wahl „dezimal“, dann Einheitenwechsel auf Zoll | Wahl bleibt | bleibt „dezimal“, Anzeige „17,72“ | ✓ |
| 13 | Plan mit Länge 45,3 cm, Darstellung Bruch | Anzeige 45¼, **Rechnung mit 45,3** → 168 Reihen | Anzeige 45¼, Rechnung 168 | ✓ (AK6) |
| 14 | `plan.js`/`ziel.js`/`rechner.js`/`zaehler.js` | kennen `format.js` nicht | kein Import, kein Bezug | ✓ (AK6) |
| 15 | Dichte „Maschen pro {einheit}“ bei Zoll | dezimal mit zwei Stellen (AK7) | „5.59“ bzw. „6,35“ – dezimal | ✓ |
| 16 | `bruchVorlesbar(4,5)` | „4 1/2“ | „4 1/2“ | ✓ |
| 17 | `aria-label` mit der vorlesbaren Fassung in der Oberfläche | an mindestens einer Stelle gesetzt | **nirgends** – die Funktion ist toter Code | ✗ **S5-02** |
| 18 | Probenzeile im Strickstück bei Zoll/Bruch | folgt der Darstellung | „25 M auf 3.937 in“ – Rohtext | ✗ **S5-03** |

### 3.3 MAS-27 (US-23) – Oberfläche auf Englisch

| # | Eingabe | Erwartet | Tatsächlich | Ergebnis |
|---|---|---|---|---|
| 1 | Schlüsselmengen `de` / `en` | identisch, 285 je Sprache | identisch, 285/285 | ✓ |
| 2 | Platzhalter je Schlüssel | identische Menge | identisch in allen 285 | ✓ |
| 3 | Leere Texte, leere Platzhalter `{}` | keine | keine | ✓ |
| 4 | Deutsche Reste im Englischen (Umlaute, „und“, „der/die/das“, „Reihe“, „Maschen“) | keine | keine (nach Abzug der Platzhalternamen) | ✓ |
| 5 | Feste Einheitenkürzel außerhalb von `einheit.*` | keine | keine; „mm“ bleibt zulässig (E35) | ✓ |
| 6 | `localeFuer('en')` | `en-US` | `en-US`; Zahlen „45.14“, Datum `11/2/2026` | ✓ |
| 7 | `text('en','gibt.es.nicht')` / `text('fr','proben.titel')` | Schlüssel / deutscher Text | wie erwartet | ✓ |
| 8 | Zielquelle im Zähler vs. Kartentitel, beide Sprachen, beide Quellen | gleich (S4-05) | gleich in `de` und `en` | ✓ |
| 9 | Sprachwechsel zur Laufzeit | sofort, ohne Neuladen, `lang` folgt | Marke `window.__qaMarke` überlebt → kein Neuladen; `lang="en"`, Titel „Settings – Maschenrechner“ | ✓ |
| 10 | Sprachnamen | „Deutsch“ / „English“, nie übersetzt | fest in `index.html`, ohne `data-text` | ✓ |
| 11 | Textlänge en vs. de | kein Text ≫ länger | Maximum +15 Zeichen (`plan.fehler.ZU_VIELE_EREIGNISSE`) | ✓ |
| 12 | Alle 12 Kombinationen Sprache × Einheit × Darstellung | erreichbar, sinnvoll | siehe Tabelle unten | ✓ |
| 13 | „1,000“ im englischen Zahlenfeld | 1000 | 1 | ✗ **S5-06** |
| 14 | Fokus nach dem Sprachwechsel per Tastatur | bleibt am Bedienelement | springt auf `h1#kopf-titel`, Seite scrollt nach oben | ✗ **S5-07** |

Die zwölf Kombinationen, im Browser durchgeschaltet (Anzeige der tatsächlichen Länge 45 cm bzw.
17,717 in; Kartentitel; Inhalt des Eingabefeldes):

| Sprache/Einheit/Darstellung | Anzeige | Kartentitel | Feld |
|---|---|---|---|
| de/cm/auto · de/cm/dezimal | 45,14 | Aus Länge (cm) → Reihen | 45 |
| de/cm/bruch | 45⅛ | Aus Länge (cm) → Reihen | 45 |
| de/in/auto · de/in/bruch | 17¾ | Aus Länge (in) → Reihen | 17.717 |
| de/in/dezimal | 17,77 | Aus Länge (in) → Reihen | 17.717 |
| en/cm/auto · en/cm/dezimal | 45.14 | From length (cm) → rows | 45 |
| en/cm/bruch | 45⅛ | From length (cm) → rows | 45 |
| en/in/auto · en/in/bruch | 17¾ | From length (in) → rows | 17.717 |
| en/in/dezimal | 17.77 | From length (in) → rows | 17.717 |

`auto` löst bei cm nach dezimal und bei Zoll nach Bruch auf – wie festgelegt.

### 3.4 Regression: der Referenzfall aus Sprint 3

Probe 25 M / 37 R auf 10 cm, Plan 20 → 34 cm, Länge 45 cm, 2 M je Ereignis.

| Größe | 0.4.0 (Soll) | de/cm (gemessen) | de/in nach Wechsel (gemessen) |
|---|---|---|---|
| Maschen am Anfang | 50 | 50 | 50 |
| Maschen am Ende (berechnet) | 85 | 85 | 85 |
| Reihen gesamt | **167** | **167** | **167** |
| Auswahl bei nicht teilbarer Differenz | 84 / 86 M | 84 / 86 | 84 / 86 |
| Zusammenfassung | 17 × 2 M zunehmen, alle 9–10 Reihen | identisch | identisch |
| Tatsächliche Breite / Länge | 33,60 cm / 45,14 cm | identisch | 13¼ in / 17¾ in |

`git diff main..sprint-5 -- js/plan.js js/ziel.js` ist **leer**. R7 ist eingehalten.

## 4. Die drei Nachkommastellen (H5) – unabhängig nachgestellt

Geprüft wurde beides: ob zwei Stellen den Fehler wirklich erzeugen und ob drei ihn wirklich
beheben. Nachgerechnet wurde mit demselben Rundungsweg wie im Code (`toFixed`, Nullen weg), aber
mit frei wählbarer Stellenzahl.

**Der Referenzfall allein:**

| Stellen | Bezug | Länge | Reihen |
|---|---|---|---|
| 1 | 3.9 | 17.7 | 168 |
| 2 | 3.94 | 17.72 | **166** |
| 3 | 3.937 | 17.717 | **167** |
| 4 | 3.937 | 17.7165 | 167 |

**Die Behauptung des Entwicklers stimmt.** Mit zwei Stellen kippt der Referenzfall auf 166, mit
drei bleibt er bei 167.

**Darüber hinaus** (das war nicht Teil der Begründung, stützt sie aber): Im praxisnahen Bereich
(Bezug 10 cm, 15–60 Reihen auf 10 cm, Längen 5–120 cm in Schritten von 0,5 cm; 10 626
Kombinationen) verschieben

- **zwei Stellen** die Reihenzahl in **1 341 Fällen (12,6 %)**,
- **drei Stellen** in **keinem einzigen Fall**.

Über einen breiteren Bereich (Bezugsmaße 2,5–20 cm, 226 632 Kombinationen) sind es mit zwei Stellen
101 543 Verschiebungen mit **bis zu 28 Reihen** Abweichung, mit drei Stellen 19 933 mit höchstens
2 Reihen. Auch der Rückweg trägt: Für alle 2000 Zehntelwerte von 0,1 bis 200,0 cm ist er mit drei
Stellen **exakt**, mit zwei Stellen in 1 214 Fällen nicht.

**Eine Einschränkung, die in der Architektur fehlt:** Drei Stellen sind nicht „exakt“, sondern
„im Praxisbereich fehlerfrei“. Es bleiben **Kippfälle** – Werte, die in cm genau auf x,5 landen
(z. B. 45 cm bei 37 R/10 cm = 166,5). Dort entscheidet jede noch so kleine Störung neu. Im
praxisnahen Bereich liegen 943 der 10 626 Kombinationen auf einer solchen Kante, 320 davon (3,0 %
aller Kombinationen) kippen beim Wechsel um **eine** Reihe. Der Referenzfall ist selbst ein
Kippfall und fällt zufällig auf die richtige Seite. Das ist keine Schwäche der Umsetzung – es ist
eine Eigenschaft des Rundens –, sollte in H5 aber als Nebensatz stehen, damit sich später niemand
auf „exakt“ beruft.

**Fazit: Die Abweichung vom Entwurf (3 statt 2 Stellen) ist begründet und belegt.** Der Preis
(„3.937“ statt „3.94“ im Eingabefeld) ist der kleinere Schaden.

## 5. Randfälle

| Eingabe | Erwartet | Tatsächlich | Ergebnis |
|---|---|---|---|
| `umrechneWert('')`, `'   '`, `'abc'`, `'12,'`, `'12.'`, `'-'`, `'+'`, `'1,2,3'`, `'1e3'`, `'½'` | unverändert | unverändert | ✓ |
| `umrechneWert('0','cm','in')` | „0“ | „0“ | ✓ |
| `umrechneWert('-5','cm','in')` | rechnet, bleibt ungültig | „-1.969“, Feld meldet weiter „größer als 0“ | ✓ |
| `umrechneWert('10,16','cm','in')` | „4“ (Komma wird gelesen) | „4“ | ✓ |
| `umrechneWert('254','cm','in')` | „100“, nicht „1“ | „100“ | ✓ |
| **„1.000“ (E13)** in einem Längenfeld | 1,0 – wie `pruefeZahl` es liest | 1,0 → „0.394“ in | ✓ |
| **„1.000“** in einem Ganzzahlfeld | 1000 | 1000 | ✓ |
| **„1,000“** in einem Ganzzahlfeld (englische Schreibweise) | 1000 | **1** | ✗ **S5-06** |
| `umrechneWert('99999','cm','in')` | passt in 20 Zeichen | „39369.685“ (9 Zeichen) | ✓ |
| `vonCm(zuCm(x))` für 0; 0,001; 1; 4; 10; 45; 9999; 99999; 10⁶ | identisch (R2) | Abweichung < 1e-9 relativ | ✓ |
| Leere Projektliste | unverändert | `projekte: []` | ✓ |
| Projekt ohne Strickstücke, Strickstück ohne Plan | unberührt | `plan` bleibt `null` | ✓ |
| Doppelte 64-Zeichen-IDs in einer Sicherung | zweite wird eindeutig gemacht | `aaa…a` und `aaa…a-2` (bekannt: MAS-46, Ersatz-ID 66 Zeichen) | ✓ (Altbefund) |
| ID genau 64 Zeichen | bleibt erhalten | bleibt | ✓ |
| Beschädigte Daten (`plan:'kaputt'`, `rechner:42`, Projekt ohne Proben, Nicht-Objekt in der Liste) | repariert, nie still verworfen | repariert, Projekte bleiben | ✓ |
| `laengenDarstellung: 42` bzw. `'roemisch'` | Rückfall auf „auto“ | „auto“ | ✓ |
| 40 Zoll Bezugsmaß → cm | gültig | 101.6 – über der Grenze 100 | ✗ **S5-05** |

## 6. Datenerhalt (R6, R10, R13)

- `SCHEMA_VERSION` bleibt **3**, der Schlüssel bleibt `maschenrechner.daten.v3`. Es gibt keinen
  vierten Schlüssel und keine neue Migration – maschinell geprüft.
- Eine **Sicherung aus 0.4.0** (ohne `laengenDarstellung`) wird vollständig gelesen; das fehlende
  Feld wird zu „auto“, alles andere (Zähler, Klapp-Zustand, Startreihe) bleibt unverändert.
- Eine **in Zoll gespeicherte Sicherung** übersteht `pruefeDaten`; ein fehlendes Bezugsmaß wird mit
  dem Standard der **gespeicherten** Einheit vorbelegt („4“), nicht mit „10“.
- Beschädigte **Einstellungen** werden ersetzt (`sprache:'kl'` → `de`, `laengeneinheit:'ellen'` →
  `cm`), **Projektdaten dabei nie angetastet**.
- Die Umstellung selbst verwirft nichts: ungültige und halb getippte Eingaben bleiben wörtlich
  stehen. **Eine Ausnahme: S5-04.**
- R18 (0.4.0 liest Zoll-Daten als Zentimeter) ist am Code nachvollziehbar – `istBekannteEinheit`
  kennt dort `in` nicht – und bleibt die vom Auftraggeber entschärfte Rest­gefahr. Keine Maßnahme
  nötig, aber die Regel aus S4-06 gilt weiter: unbekannte Werte lieber aufbewahren als ersetzen.

## 7. Datenschutz

Geprüft wurden `index.html`, `css/style.css`, `manifest.webmanifest`, `sw.js` und alle 23
JS-Dateien:

- **Keine externe Adresse**, kein `@import`, keine fremde Schriftart (`--schrift` nennt nur
  System-Schriften), kein Tracker, kein `document.cookie`.
- **`fetch` nur in `sw.js`**, und dort nur für die eigene Herkunft.
- **`navigator.language` kommt nirgends vor** – wie in Architektur 8 ausdrücklich gefordert.
- Die englischen Texte liegen in `js/texte.js` und werden mit der App ausgeliefert; kein
  Übersetzungsdienst, kein dynamischer Import.
- **CSP unverändert eng:** `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'
  data:; connect-src 'self'; manifest-src 'self'; worker-src 'self'; base-uri 'none'; form-action
  'none'; object-src 'none'` – kein `unsafe-inline`, kein `*`, kein Inline-Skript.
- **Im Browser mitgeschnitten** (DevTools-Protokoll, `Network`-Domäne, frisches Profil): Beim
  Start und beim Durchlaufen aller fünf Ansichten sowie beim Umschalten von Sprache, Einheit und
  Darstellung gingen **27 Anfragen** an `localhost:8000` und **keine einzige** nach außen.
  `Network.getAllCookies` liefert eine leere Liste, `document.cookie` ist leer, und die
  Fehlerkonsole bleibt still.
- Die neue Einstellung steht in der Sicherungsdatei und verrät eine Vorliebe, keine Personendaten.

## 8. Offlinefähigkeit

- `package.json`, `sw.js` (`CACHE_NAME = 'maschenrechner-v0.5.0'`) und `js/app.js`
  (`APP_VERSION = '0.5.0'`) stimmen überein; `CACHE_NAME` ist gegenüber 0.4.0 erhöht.
- **Keine neue Datei** in Sprint 5 – der Dateibestand unter `js/` ist Zeichen für Zeichen derselbe
  wie in 0.4.0 (eigener Test mit vollständiger Liste). `APP_DATEIEN` enthält alle 23 JS-Dateien,
  das CSS, alle vier Icons, `index.html`, `manifest.webmanifest` und `./`.
- Damit ist auch das Risiko erledigt, das Sprint 4 noch hatte: Es gibt keine Datei, die im Cache
  fehlen könnte.

## 9. Mobilansicht mit englischen Texten (360 × 640 px, R17)

Alle Werte sind gemessen, nicht geschätzt.

| Ansicht (en/in) | Messung | Bewertung |
|---|---|---|
| Alle geprüften Ansichten | `scrollWidth` = `clientWidth` = **360 px** | kein Querscrollen |
| Überlaufende Elemente | nur `*.visuell-versteckt` (per Definition außerhalb) | ✓ |
| Einstellungen | 1014 px hoch, 12 Bedienelemente, **keines unter 44 × 44 px** | ✓ |
| Strickstück, alle Karten offen | 5332 px (scrollt, wie bisher) | ✓ |
| Strickstück, alle Karten zu | 1176 px, `summary` je **57 px** hoch | ✓ |
| Kurzfassungen englisch | „Your stitches: 95“, „17 × increase 2 sts, every 9–10 rows“ | passen einzeilig bzw. zweizeilig |
| Plan-Karte zugeklappt **mit Problemtext** („Please check: For 17 increases …“) | 279 × 91 px, kein Querscrollen | ✓ |
| Zähleransicht | **640 px** = genau das Sichtfeld, **kein Scrollen** | ✓ (wie 0.4.0 deutsch) |
| Zähleransicht mit Wachhalter-Hinweis | **749 px**, scrollt | unverändert gegenüber 0.4.0 |
| Auswahlfeld der Zielquelle (englisch) | **217 px** breit (deutsch 0.4.0: 227 px) | ✓ |
| „+1“-Fläche / „−1“ | 328 × 112 px / 72 × 60 px | ✓ |
| Längenzeile im Zähler | „4⅛ in of 17¾ in“, 119 px | ✓ |

**Die englischen Texte sprengen die Mobilansicht nicht.** R17 ist damit entschärft.

Eine Ausnahme im Layout, die nicht an der Sprache liegt: die beiden neuen zweispaltigen
Auswahlgruppen – **S5-01**. Gemessen:

| Gruppe | Rahmenbreite | Summe der Optionen | leer |
|---|---|---|---|
| Sprache | 294 px | 97 + 97 = 194 px | **100 px** |
| Längeneinheit | 294 px | 100 + 95 = 195 px | **99 px** |
| Zahlen | 294 px | 97 + 97 + 97 = 291 px | 0 |
| Farbschema | 294 px | 291 px | 0 |
| Arbeitsweise im Plan (`segment-zwei`) | 294 px | 145 + 145 = 290 px | 0 |

## 10. Barrierefreiheit

- **Touch-Ziele:** kein sichtbares Bedienelement unter 44 × 44 px, in keiner geprüften Ansicht und
  in keiner Sprache. Die neuen Optionsfelder sind 95–100 px breit und 48–64 px hoch.
- **Beschriftungen:** Jede der drei neuen Gruppen hat ein `<legend>` mit `data-text`; die
  Optionen tragen sichtbaren Text. Die Radios liegen unsichtbar über der gesamten Fläche des
  Labels – Tastatur- und Zeigerbedienung funktionieren (mit echten Tastenereignissen geprüft).
- **Tastatur:** Der Einheitenwechsel per Pfeiltaste funktioniert vorbildlich – der Fokus bleibt
  auf dem Bedienelement, der Hinweis erscheint, die Daten sind umgerechnet. Der Sprachwechsel
  dagegen reißt den Fokus weg: **S5-07**.
- **Live-Regionen:** Sprint 5 fügt **genau eine** hinzu (`[data-rolle="einheit-status"]` mit
  `role="status"` in den Einstellungen). Sie wird nur auf ausdrückliche Bedienung hin gefüllt, und
  in der Einstellungsansicht ist immer höchstens eine der beiden Statuszeilen belegt. Damit bleibt
  es bei der Zurückhaltung, die MAS-32 und S3-04 verlangen – **kein neuer Befund**.
- **`lang`-Attribut** folgt der Sprache (`de` → `en`), auch ohne Neuladen.
- **Brüche für Screenreader:** nicht ausgezeichnet – **S5-02**. Wie `⅞` tatsächlich vorgelesen
  wird, bleibt ungeprüft (siehe Abschnitt 13).

## 11. Die zwei Abweichungen vom Entwurf

**1. Zoll mit drei Nachkommastellen (statt zwei).** Begründung trägt, siehe Abschnitt 4. Sie ist
gemessen, nicht behauptet, und die Messung ist reproduzierbar. Einzige Anmerkung: „der Weg zurück
ist exakt“ gilt für die Umrechnung, nicht für jede Reihenzahl (Kippfälle).

**2. Nur der Sprachwechsel baut die Ansicht neu auf.** Begründung trägt ebenfalls:

- Die Einstellungsansicht zeigt selbst **keine** Länge. Geprüft: Kein Text der Einstellungen
  enthält `{einheit}`, und kein Element dort zeigt einen umgerechneten Wert.
- Jede andere Ansicht wird beim Verlassen der Einstellungen ohnehin neu gebaut; die Einheit und
  die Darstellung lassen sich nur dort ändern. **Eine veraltete Anzeige konnte ich nirgends
  herstellen** – weder im Strickstück, im Plan, im Zähler, in der Projektliste noch im Projekt.
- Der Nutzen ist messbar: Beim Einheitenwechsel per Tastatur bleibt der Fokus auf dem Optionsfeld.
  Beim Sprachwechsel, der neu aufbaut, geht er verloren – das ist S5-07 und bestätigt die
  Entscheidung für die beiden anderen Schalter.

Nebenbefund ohne Befundcharakter: Beim Sprachwechsel verschwindet eine gerade sichtbare
Statusmeldung (z. B. „Die Maße wurden umgerechnet.“ oder die Rückmeldung nach dem Einlesen einer
Sicherung), weil die Ansicht neu gebaut wird. Das ist harmlos, aber beabsichtigt sollte es sein.

## 12. Die geänderten Sprint-4-Tests

Zwei Tests aus `tests/qa-sprint4.test.js` und `tests/qa-sprint4-nachtest.test.js` nagelten die
Version auf 0.4.0 fest und prüfen jetzt versionsunabhängig.

**Die Prüfabsicht bleibt im Kern erhalten, wird aber an einer Stelle schwächer.** Erhalten bleibt
die eigentliche Absicht: Die drei Stellen (`package.json`, `sw.js`, `js/app.js`) müssen
übereinstimmen – der Test liest jetzt die Version aus `package.json` und vergleicht die beiden
anderen damit, was sogar strenger ist als drei feste Zeichenketten. Verloren geht, dass
`CACHE_NAME` gegenüber der **Vorversion erhöht** sein muss: Ein versehentliches Zurückdrehen auf
0.3.0 in allen drei Dateien fiele nicht mehr auf.

Das ist vertretbar – ein Sprint-4-Test ist nicht der richtige Ort, um die Version von 0.5.0 zu
kennen. Damit die Lücke nicht offen bleibt, prüft `tests/qa-sprint5.test.js` jetzt beides:
die Gleichheit **und** dass `CACHE_NAME` größer als 0.4.0 ist. Kein Befund.

## 13. Befunde einzeln

### S5-01 – Zweispaltige Auswahlgruppen im Dreierraster (niedrig)

`index.html` legt „Sprache“ und „Längeneinheit“ als `<fieldset class="segment">` an. `.segment-optionen`
ist in `css/style.css` auf `grid-template-columns: repeat(3, 1fr)` gesetzt; für zwei Optionen gibt
es die Klasse **`segment-zwei`**, die der Plan-Abschnitt „Arbeitsweise“ (Zeile 267) bereits
benutzt. Bei den beiden neuen Gruppen fehlt sie.

**Wirkung:** Rund 100 px der umrandeten Gruppe bleiben leer. Besonders auffällig, wenn die zweite
Option gewählt ist – dann steht rechts neben der farbig gefüllten Fläche ein weißer Rest im selben
Rahmen, und die Gruppe sieht aus, als fehle eine Option. Betrifft beide Sprachen und beide
Farbschemata; rein optisch, die Bedienung funktioniert.

**Abhilfe:** `class="segment segment-zwei"` an den beiden Fieldsets. Eine Zeile je Gruppe.

### S5-02 – `bruchVorlesbar` wird nirgends benutzt (niedrig)

`js/format.js` exportiert `bruchVorlesbar` („4 1/2“), und Architektur 5.1 schreibt dazu: „Sie wird
für `aria-label` benutzt, wo eine Länge allein in einem Element steht.“ Die Commit-Nachricht sagt
„bruchVorlesbar fuers aria-label“. **In keiner der sieben Ansichtsdateien kommt die Funktion vor**
– sie ist ausschließlich in Tests verwendet. Es gibt keine Stelle, an der ein `aria-label` mit der
vorlesbaren Fassung gesetzt wird.

**Wirkung:** Wer die App mit einem Screenreader bedient, bekommt die Bruchzeichen so vorgelesen,
wie der Screenreader sie eben liest. Ob das genügt, ist nicht geprüft (die Architektur sagt das
selbst) – geprüft ist nur die Auszeichnung, und die fehlt.

**Abhilfe:** Entweder die Funktion an den Stellen setzen, an denen eine Länge allein steht
(Zähler-Längenzeile, Abweichung, tatsächliches Maß), oder die Festlegung in Architektur 5.1
ausdrücklich zurücknehmen und `bruchVorlesbar` entfernen. Toter Code mit einer Zusage im
Architekturdokument ist die schlechteste der drei Möglichkeiten.

### S5-03 – Achte Längen-Anzeigestelle (niedrig)

Architektur 5.2 berichtigt die Zahl der Anzeigestellen von sechs auf sieben. Es sind **acht**:
`probeZeile` in `js/ansichten/strickstueck.js` (Zeile 30 ff.) zeigt die Bezugsmaße der beiden
Proben als Rohtext des Eingabefeldes.

**Wirkung:** Nach dem Wechsel auf Zoll steht dort „Laut Anleitung: 22 M auf **3.937** in · 30 R auf
3.937 in“, während direkt darunter dieselben Längen als „7⅞ in“ erscheinen. Der Punkt als
Dezimaltrenner bleibt auch bei deutscher Oberfläche (H6) – an einem Eingabefeld ist das vereinbart,
in einer reinen Anzeigezeile wirkt es wie ein Fehler.

**Abhilfe:** Die beiden Bezugsmaße über `formatLaenge` ausgeben (die Werte lassen sich mit
`pruefeZahl`/`zuCm` lesen, wie es `probeLesen` bereits tut), oder die Zeile bewusst als „Echo der
Eingabe“ im Architekturdokument festschreiben.

### S5-04 – Eine leere Probe verliert ein eingetragenes Bezugsmaß (niedrig)

`umgestellteProbe` in `js/modell.js` setzt das Bezugsmaß auf den Standard der neuen Einheit, sobald
die zugehörige **Stückzahl** leer ist – unabhängig davon, was im Bezugsfeld steht:

```js
const bezug = (anzahl, wert) => (leer(anzahl) ? String(standardBezug(nach)) : umrechneWert(wert, von, nach));
```

**Wirkung:** Wer „auf Breite: 15“ einträgt und die Maschenzahl noch nicht, verliert die 15 beim
Einheitenwechsel kommentarlos (sie wird zu „4“). Das widerspricht dem Grundsatz aus R6/R10 und der
eigenen Regel „halb getippte Eingaben werden nicht angetastet“. Der Fall ist schmal – man muss die
Felder in dieser Reihenfolge füllen und dann umschalten –, aber es ist der einzige Weg, auf dem die
Umstellung eine Eingabe verwirft.

**Abhilfe:** Das Standardmaß nur setzen, wenn das Bezugsfeld noch den Standardwert der **alten**
Einheit enthält; sonst umrechnen.

### S5-05 – Umgerechnete Werte können Feldgrenzen sprengen (niedrig)

Die Prüfregeln aus Sprint 1 gelten „in der jeweiligen Anzeigeeinheit“: Bezugsmaß höchstens 100,
Länge höchstens 9999. Beim Umrechnen von Zoll nach cm wird mit 2,54 multipliziert; aus einem
gültigen Wert kann ein ungültiger werden (40 in → 101.6 cm; 9999 in → 25397.46 cm).

**Wirkung:** Das Feld zeigt nach dem Wechsel „Der Wert darf höchstens 100 sein“, und der Rechner
bzw. der Plan liefert kein Ergebnis mehr. Der Wert geht **nicht** verloren, die Nutzerin kann ihn
korrigieren – aber die Ursache („weil Sie die Einheit gewechselt haben“) ist aus der Meldung nicht
erkennbar. Praktisch unwahrscheinlich: Eine Maschenprobe über 40 Zoll Breite kommt nicht vor.

**Abhilfe:** Entweder die Grenzen je Einheit festlegen oder den Fall in Architektur 4.2 als
hingenommen vermerken.

### S5-06 – „1,000“ wird in englischer Oberfläche als 1 gelesen (niedrig)

`eingabe.js` erkennt den Punkt vor genau drei Ziffern in Ganzzahlfeldern als Tausendertrenner
(E13, MAS-30). Das Komma gilt dort immer als Dezimaltrenner. In englischer Oberfläche ist die
Erwartung genau umgekehrt: „1,000“ heißt tausend.

| Eingabe | de erwartet | en erwartet | tatsächlich |
|---|---|---|---|
| „1.000“ | 1000 | 1 | 1000 |
| „1,000“ | 1 | 1000 | 1 |

**Wirkung:** Eine englischsprachige Nutzerin, die „1,000“ in ein Reihen- oder Zählerfeld tippt,
bekommt kommentarlos 1. Selten, weil vierstellige Maschen- und Reihenzahlen ungewöhnlich sind –
aber es ist derselbe Fehler, der in MAS-30 für die deutsche Schreibweise behoben wurde.

**Abhilfe:** Die Tausenderregel von der Spracheinstellung abhängig machen, oder das Thema als
Nachfolger von MAS-30 in den Backlog legen. Gehört ohnehin in die Nähe von MAS-75 (Brucheingabe),
weil beide `js/eingabe.js` betreffen.

### S5-07 – Nach dem Sprachwechsel springt der Fokus auf den Seitentitel (niedrig)

`ctx.spracheAnwenden()` ruft `zeigeAnsicht(…)`; das setzt `window.scrollTo(0,0)` und
`kopfTitel.focus()`. Mit echten Tastenereignissen gemessen: Fokus vorher
`input[name=sprache][value=de]`, Bildlauf 300 px – nachher `h1#kopf-titel`, Bildlauf 0.

**Wirkung:** In einer Optionsgruppe wählt die Pfeiltaste zugleich aus. Wer die Sprache per Tastatur
oder Screenreader wechselt, verliert den Fokus mitten in der Bedienung und muss sich zur Gruppe
zurücktabben, um die Wahl zu korrigieren. Das ist genau das Argument, mit dem v5.2 den Neuaufbau
bei Einheit und Darstellung ausgeschlossen hat – beim Sprachwechsel ist der Neuaufbau nötig, die
Folge für den Fokus aber nicht.

**Abhilfe:** Nach dem Neuaufbau den Fokus auf das Optionsfeld der gewählten Sprache zurücksetzen
(die Ansicht ist dieselbe Route, das Element also wieder vorhanden).

## 14. Was ungeprüft bleibt

- **Das Verhalten auf dem iPhone** (Safari, installierte App, VoiceOver, Wake Lock). Bleibt dem
  Praxistest mit der Enduserin vorbehalten. Für 0.5.0 gehört eine amerikanische Anleitung dazu.
- **Wie Screenreader die Bruchzeichen aussprechen** (⅛, ⅜, ⅞). Dafür fehlt die Auszeichnung
  (S5-02) und ein echtes Gerät.
- **Der Jira-Stand** – siehe Hinweis im Kopf des Berichts. AK-Nummern, Status und Versionszuordnung
  sind nicht verifiziert.
- **Ob die englischen Fachbegriffe für die Zielgruppe die richtigen sind.** Geprüft ist, dass sie
  übersetzt, verständlich und in sich einheitlich sind (gauge, stitch, row, increase, decrease,
  cast on). Ob eine amerikanische Strickerin „From width (in) → stitches“ so erwartet, kann nur
  ein Praxistest sagen.
- **Drucken, sehr große Schrift, Hochkontrastmodus.** Wie in den Vorsprints nicht geprüft.
- **Das Zusammenspiel mit einer parallel installierten 0.4.0** (R18) wurde nur am Code
  nachvollzogen, nicht mit zwei Geräten.

## 15. Hinweise an den Product Owner und das Team

1. **E34 und E35 sind umgesetzt, stehen aber weiter als „vorläufig“** in `docs/entscheidungen.md`.
   Beide sollten jetzt bestätigt werden – sie sind im Code verankert.
2. **H5 ist entschieden, aber die Formulierung sollte nachgezogen werden:** „der Weg zurück ist
   exakt“ gilt für die Umrechnung; Reihenzahlen, die in cm genau auf x,5 landen, können trotzdem um
   eine Reihe kippen (3 % der praxisnahen Fälle). Siehe Abschnitt 4.
3. **Das Architekturdokument v5.2 widerspricht sich an drei Stellen selbst** (kosmetisch, aber die
   Abschnittsnummern sind laut `CLAUDE.md` Schnittstelle):
   - Abschnitt 4.1 zeigt im Codeblock weiterhin `in: { …, stellen: 2 }`, Abschnitt 4.3 legt 3 fest.
   - Abschnitt 9, Punkt 3 verlangt `'10'` → `'3.94'`, Punkt 4 einen Drift auf `'10.01'`. Beides ist
     durch v5.2 überholt; die Tests der Entwicklung prüfen (richtig) `'3.937'` und den exakten
     Rückweg.
   - Die H5-Zeile in Abschnitt 10 sagt noch „Dieses Dokument legt **zwei** Stellen fest“.
4. **`docs/architektur.md` führt Sprint 5 als „entworfen, noch nicht gebaut“** und nennt 311 Tests.
   Beides ist seit `1664e85` überholt.
5. **Die Zahl der Längen-Anzeigestellen ist acht, nicht sieben** (S5-03) – falls die Probenzeile
   bewusst Rohtext bleiben soll, gehört das in Abschnitt 5.2.
6. **Namen bleiben in der Sprache, in der sie angelegt wurden.** Ein deutsch angelegtes Projekt
   zeigt in englischer Oberfläche weiterhin „Probe 1“; eine danach angelegte Probe heißt
   „Gauge 2“. Das ist richtig so (Namen sind Nutzerdaten), kann aber gemischt aussehen. Falls das
   stören sollte, wäre es eine eigene Story.
7. **Die Statusmeldung nennt die Zieleinheit nicht:** „Die Maße wurden umgerechnet.“ Der Entwurf
   (Architektur 7) hatte „Maße wurden in Zoll umgerechnet.“ vorgeschlagen. Kein Befund – aber mit
   der Einheit im Satz wäre klarer, was passiert ist.
8. **MAS-46 (S2-09) ist weiterhin offen** und wurde durch Sprint 5 nicht berührt: Doppelte
   64-Zeichen-IDs ergeben eine 66 Zeichen lange Ersatz-ID.
