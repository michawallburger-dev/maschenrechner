# Architekturdokument – Maschenrechner, Sprint 6 (Version 6.0)

Rolle: Architekt · Grundlage: Epic MAS-79, Stories MAS-77 (S5-06), MAS-75 (US-42), MAS-21 (US-17),
MAS-63 (US-40); Entscheidungen E4, E13, E24, E28, E31, E32, E37, E38, E39 · Baut auf
`architektur/sprint-5-architektur.md` v5.3 auf. Alles dort Festgelegte gilt weiter, sofern hier
nichts anderes steht.

**Die Abschnittsnummern dieses Dokuments sind Teil der Schnittstelle.** Code und Testberichte
verweisen darauf („Architektur Sprint 6, Abschnitt 6.2"). Ältere Dokumente werden nicht
umnumeriert.

**Alle Zahlen in diesem Dokument sind nachgerechnet, nicht geschätzt.** Die Referenzlisten in
Abschnitt 6.3 und die Aussage „bitgleich" in Abschnitt 5.2 stammen aus Läufen gegen den
vorhandenen Code (`js/plan.js`, `js/rechner.js`) mit dem hier entworfenen Rundungs- und
Verteilungsweg.

## 1. Was sich gegenüber Sprint 5 ändert

| Bereich | Sprint 5 | Sprint 6 |
|---|---|---|
| Tausendertrenner | Punkt vor drei Ziffern in Ganzzahlfeldern (E13) | **entfällt** (MAS-77, E38) |
| Längeneingabe | nur dezimal, Komma oder Punkt | zusätzlich **Brüche**: „4 1/2", „4½", „1/2", „½" (MAS-75) |
| Prüfregeln | 9 Regeln | **12**: `bezugsmass` und `laenge` nehmen Brüche, neu `rapport` und `versatz` |
| Rundung | immer kaufmännisch auf eine ganze Zahl (E4) | zusätzlich **gerade Zahl** oder **Vielfaches von n mit Versatz m**, je Strickstück (MAS-21, E37) |
| Auswahl nach E28 | Schrittweite ist `maschenProEreignis` | Schrittweite ist **kgV(n, maschenProEreignis)** – die Optionen folgen der Rundungsregel (MAS-21 AK9) |
| Startreihe des Plans | nur „frühestens ab" (E31) | „frühestens ab" **oder** „erste genau in" (MAS-63) |
| Datenmodell | Schema 3 | **Schema 3 bleibt**, zwei additive optionale Felder (Abschnitt 3) |
| Schlüssel im Speicher | `maschenrechner.daten.v3` | **unverändert** – kein Schemawechsel, keine Migration |
| Sprachen, Einheiten, Darstellung | `de`/`en`, `cm`/`in`, dezimal/Bruch | **unverändert** |

**Technologie bleibt unverändert:** PWA, HTML/CSS/Vanilla-JS (ES-Module), kein Build-Schritt, keine
Abhängigkeiten, GitHub Pages, `node --test`, localStorage.

**Kein neues Modul.** Die Brucherkennung kommt in `eingabe.js`, die Musterrundung in `rechner.js`,
die neue Verteilung in `plan.js`, die zwei Felder in `modell.js`. `APP_DATEIEN` in `sw.js` bleibt
inhaltlich gleich; `tests/sw-liste.test.js` braucht nur die neue Versionsnummer **0.6.0** und ein
erhöhtes `CACHE_NAME`.

**Die Rechenwege bleiben unangetastet, wo keine Story sie ändert** (R7). Die beiden Stories, die
sie ändern, ändern sie **nur bei eingeschalteter Regel**: Mit der Vorbelegung „keine Rundungsregel"
und „frühestens ab" ist jeder Rechenweg bitgleich der aus 0.5.0 (Abschnitte 5.2, 6.2, 6.3).

### 1.1 Zur Reihenfolge innerhalb der Eingabeschicht

Die Epic-Beschreibung von MAS-79 listet MAS-75 vor MAS-77, `docs/STATUS.md` umgekehrt. Das ist kein
Widerspruch, weil beide **in einem Zug dieselbe Datei** anfassen (E39). Dieses Dokument entwirft
**MAS-77 zuerst** (Abschnitt 4.1) und MAS-75 darauf (Abschnitt 4.2): Erst fällt ein Zweig aus
`pruefeZahl` weg, dann kommt der neue hinzu. Umgekehrt müsste der neue Zweig gegen Code entworfen
werden, der im selben Commit verschwindet.

## 2. Dateistruktur (geändert: ✎)

```
index.html                     ✎  tpl-musterkarte (neu), Umschalter in tpl-plankarte,
                                  Rundungszeile in tpl-rechner und tpl-plankarte, inputmode
sw.js                          ✎  nur CACHE_NAME und Version
js/app.js                      ✎  nur Version
js/eingabe.js                  ✎  TAUSENDER_MUSTER weg; Brucherkennung, parseLaenge,
                                  neue Reihenfolge in pruefeZahl, Regeln rapport/versatz
js/rechner.js                  ✎  KEINE_RUNDUNG, rundeAufMuster, pruefeRundung, ggt;
                                  umrechnenAusAnleitung/AusCm bekommen einen Parameter
js/plan.js                     ✎  kgV-Schrittweite der Auswahl, verteileEreignisse, startArt
js/einheiten.js                ✎  umrechneWert liest Brüche (Abschnitt 4.6)
js/modell.js                   ✎  rundung am Strickstück, startArt am Plan, RUNDUNG_ARTEN,
                                  START_ARTEN, pruefeRundungFelder in pruefeDaten
js/texte.js                    ✎  neue Schlüssel in de und en
js/ansichten/strickstueck.js   ✎  Musterkarte, Rundungsregel an die vier Rechner durchgeben
js/ansichten/plankarte.js      ✎  Umschalter, Rundungsregel an planAusTexten durchgeben
js/ansichten/gemeinsam.js      –  unverändert (pruefeUndZeige trägt die neuen Fälle schon)
js/ziel.js                     –  unverändert, solange die Regel nur Maschen betrifft (5.5)
js/format.js                   –  unverändert (keine neue Länge, Abschnitt 7.4)
```

**Keine neue Datei.**

## 3. Datenmodell: Schema 3 bleibt

`SCHEMA_VERSION` bleibt **3**, der Speicherschlüssel bleibt `maschenrechner.daten.v3`. Es gibt
keine Migration. Wie in Sprint 4 und 5 sind die neuen Felder **additiv und optional**; ihr Fehlen
bedeutet die Vorgabe und damit das Verhalten von 0.5.0 (MAS-21 AK10, MAS-63 AK6).

### 3.1 Rundungsregel am Strickstück (MAS-21)

```js
strickstueck: {
  …,
  rundung: {                  // NEU, optional
    art: 'keine' | 'gerade' | 'vielfaches',   // Vorgabe 'keine'
    n: string,                                 // Text des Eingabefeldes, Vorbelegung '4'
    m: string,                                 // Text des Eingabefeldes, Vorbelegung '0'
  },
}
```

**`n` und `m` sind Texte, keine Zahlen.** Das folgt der Konvention aller anderen Zahleneingaben im
Modell (`rechner.*.eingabe`, `plan.anfangBreite`, `anpassung`): Gespeichert wird, was die Nutzerin
getippt hat; geprüft wird beim Rechnen. Nur so kann ein halb getippter Wert stehen bleiben, ohne
dass das Modell ihn verfälscht, und nur so greift die bestehende Feldmeldung aus Sprint 1
(MAS-21 AK3).

**Vorbelegung `n: '4'`, `m: '0'`.** Begründung: `maschenProEreignis: '2'` ist der Präzedenzfall –
ein plausibler, sofort lesbarer Wert ist besser als ein leeres Feld, das beim Umschalten auf
„Vielfaches" sofort eine Fehlermeldung erzeugt. Wirksam wird es erst mit `art: 'vielfaches'`, und
weil `art` auf `'keine'` steht, ändert sich für vorhandene Strickstücke nichts (MAS-21 AK11).

`art: 'gerade'` ist fachlich n = 2, m = 0 und bleibt trotzdem eine eigene Wahl (MAS-21 AK4). Im
Code steckt diese Gleichsetzung an **einer** Stelle, in `musterVon` (Abschnitt 5.1) – nicht in der
Oberfläche.

In `modell.js`:

```js
export const RUNDUNG_ARTEN = Object.freeze(['keine', 'gerade', 'vielfaches']);
export function leereRundung() { return { art: 'keine', n: '4', m: '0' }; }
```

`strickstueckAendern` nimmt `rundung` nach dem Muster von `plan`: bekannte `art`-Werte werden
übernommen, `n` und `m` als Text auf `GRENZEN.feld` gekürzt. `pruefeDaten` setzt fehlende oder
unbekannte Werte auf die Vorbelegung – **das Strickstück wird nie verworfen** (R6/R10).

### 3.2 Bedeutung der Startreihe am Plan (MAS-63)

```js
plan: {
  …,
  startReihe: string,                        // vorhanden, unverändert
  startArt: 'frueheste' | 'genau',           // NEU, Vorgabe 'frueheste'
}
```

`startArt` wird wie `arbeitsweise` behandelt: ein Auswahlwert, kein Text, geprüft gegen
`START_ARTEN = Object.freeze(['frueheste', 'genau'])`. `PLAN_TEXTFELDER` bleibt unverändert.

**`startReihe` behält seine Bedeutung „leer = automatisch" (E31), unabhängig von `startArt`.**
Ein leeres Feld mit `startArt: 'genau'` verhält sich also wie „frühestens ab, automatisch". Das ist
eine bewusste Vereinfachung: „genau in Reihe nichts" hat keinen Sinn, und die Alternative wäre ein
neuer Fehlerzustand im Plan. So bleibt es bei **einer** Regel für das Feld, E31 gilt unverändert,
und der Feldhinweis sagt, was gilt (Abschnitt 7.3). Der Umschalter wirkt, sobald eine Reihe
eingetragen ist – und genau davon sprechen MAS-63 AK1 und AK2.

### 3.3 Rückrichtung

**R13 gilt unverändert und wird um diese zwei Felder erweitert.** Eine noch installierte 0.5.0
liest Daten von 0.6.0 fehlerfrei, kennt `rundung` und `startArt` nicht und schneidet sie beim
nächsten Speichern weg – genau wie 0.4.0 es mit `laengenDarstellung` tut (Befund S4-06). Bewusst
hingenommen.

**Neu und schwerer als bisher:** Eine Länge, die als Bruch gespeichert ist („4 1/2" im Feld
`maschenBezug`), ist für 0.5.0 **keine Zahl**. 0.5.0 zeigt dort keinen Wert und rechnet nicht,
statt falsch zu rechnen – der Ausfall ist also sichtbar, nicht still. Der Weg dorthin ist derselbe
einzige wie bei R18: eine von Hand übertragene Sicherungsdatei in ein Gerät, das seit der
Veröffentlichung nicht online war. **Keine Maßnahme im Code**, siehe **R22**.

## 4. Eingabe (`js/eingabe.js`)

Dies ist der Code, aus dem die Befunde MAS-30 und MAS-31 stammen. Er wird in diesem Sprint zweimal
angefasst, in einem Zug (Abschnitt 1.1).

### 4.1 MAS-77: Der Tausendertrenner entfällt

Es fallen weg:

- die Konstante `TAUSENDER_MUSTER` (`js/eingabe.js:37`),
- ihr Zweig in `pruefeZahl` (`js/eingabe.js:79–81`) samt Kommentar.

Kein Ersatz, kein toter Code (MAS-77 AK4). `ZAHL_MUSTER` und `UNVOLLSTAENDIG_MUSTER` bleiben in
diesem Schritt unverändert; Komma und Punkt bleiben Dezimaltrenner, unabhängig von der Sprache
(MAS-77 AK2, Zusage im Dateikopf).

Danach ergeben „1.000" und „1,000" in einem Ganzzahlfeld beide **1** und werden von
`KEINE_GANZZAHL` abgewiesen – in beiden Sprachen dasselbe (MAS-77 AK3).

**Zu MAS-77 AK8 (Beispiel ohne Trenner im Hinweistext):** Nachgeprüft – `fehler.KEINE_ZAHL` lautet
heute „Bitte eine Zahl eingeben, z. B. 12 oder 12,5." bzw. „…, e.g. 12 or 12.5." Beide Beispiele
sind schon ohne Trenner. **AK8 ist ohne Textänderung erfüllt**; zu ändern ist nichts, zu prüfen
schon.

### 4.2 MAS-75: Brucherkennung

Die Brucherkennung kommt **neben** die Dezimalerkennung, nicht in sie hinein. `parseZahl` und
`ZAHL_MUSTER` bleiben Zeichen für Zeichen unverändert – das ist die Bedingung dafür, dass kein
bestehendes Feld sein Verhalten ändert (MAS-75 AK7).

Zwei neue Prüfregeln-Eigenschaften, sonst nichts an `REGELN`:

```js
bezugsmass: Object.freeze({ ganzzahl: false, positiv: true, max: 100,  brueche: true }),
laenge:     Object.freeze({ ganzzahl: false, positiv: true, max: 9999, brueche: true }),
```

Genau diese zwei Regeln nehmen Brüche (MAS-75 AK1). Alle übrigen sind Stückzahlen, Reihennummern
oder Millimeter.

**Die Muster:**

```js
// Die sieben Bruchzeichen, die formatBruch erzeugt (Sprint 5, Abschnitt 5.1)
const BRUCH_ZEICHEN = Object.freeze({ '⅛': 1/8, '¼': 1/4, '⅜': 3/8, '½': 1/2, '⅝': 5/8, '¾': 3/4, '⅞': 7/8 });

// „4½“, „4 ½“, „½“
const BRUCH_ZEICHEN_MUSTER = /^(\d{1,4})?\s*([⅛¼⅜½⅝¾⅞])$/;

// „4 1/2“, „1/2“, „3/16“ – zwischen ganzem Teil und Bruch steht mindestens ein Leerzeichen
const BRUCH_SCHRAEG_MUSTER = /^(?:(\d{1,4})\s+)?(\d{1,2})\s*\/\s*(\d{1,2})$/;

// Tippzwischenstand: „4 1“, „4 1/“, „1/“, „4 /“ (Abschnitt 4.3)
const BRUCH_UNVOLLSTAENDIG_MUSTER = /^(?:\d{1,4}\s+)?\d{0,2}\/?$/;
```

```js
/**
 * Liest einen Bruch. Gibt null zurück, wenn der Text gar kein Bruch sein will.
 * @returns {{wert:number} | {fehler:'KEIN_BRUCH'} | null}
 */
export function parseBruch(text)

/** Dezimalzahl oder Bruch. Für Längenfelder und für umrechneWert (4.6). */
export function parseLaenge(text)   // → number|null
```

**Nur die sieben Zeichen aus `formatBruch`.** Damit ist der Weg Anzeige → Eingabe geschlossen: Was
die App als „4⅜" zeigt, nimmt sie auch so an (MAS-75 AK5). Drittel und Sechstel (⅓, ⅔, ⅙) sind
**keine** gültigen Zeichen – als „1/3" sind sie über die Schrägstrichform aber eingebbar.

### 4.3 Die neue Reihenfolge in `pruefeZahl` – der Knackpunkt

Heute prüft `pruefeZahl` **erst** auf Tippzwischenstand und **dann** auf eine Zahl. Das funktioniert
nur, solange `UNVOLLSTAENDIG_MUSTER` das genaue Komplement der gültigen Eingaben ist. Genau an
dieser Bedingung sind MAS-30 und MAS-31 entstanden, und mit Brüchen wird sie unhaltbar: „4" ist
sowohl eine fertige Zahl als auch der Anfang von „4 1/2".

**Festlegung: Es wird zuerst gelesen, dann auf Zwischenstand geprüft.**

```text
1. leer                      → LEER bzw. leerWert
2. parseZahl(roh)            → Zahl? dann weiter mit den Grenzprüfungen (unverändert)
3. nur bei regel.brueche:
   parseBruch(roh)           → Zahl? dann weiter mit den Grenzprüfungen
4. UNVOLLSTAENDIG_MUSTER, oder bei regel.brueche auch
   BRUCH_UNVOLLSTAENDIG_MUSTER → UNVOLLSTAENDIG
5. parseBruch lieferte einen Fehler → KEIN_BRUCH
6. sonst                     → KEINE_ZAHL
```

Die Grenzprüfungen (`ganzzahl`, `positiv`, `min`, `max`, −0) bleiben Zeile für Zeile, wie sie sind,
und gelten für den aus dem Bruch gelesenen Wert genauso.

**Diese Umstellung ändert für Dezimalzahlen nichts, und das ist beweisbar, nicht nur geprüft:**
`ZAHL_MUSTER` und `UNVOLLSTAENDIG_MUSTER` sind **disjunkt**. `UNVOLLSTAENDIG_MUSTER` verlangt, dass
der Text nach einem optionalen Vorzeichen mit einem Dezimaltrenner endet oder leer ist;
`ZAHL_MUSTER` verlangt nach einem Dezimaltrenner mindestens eine Ziffer. Kein Text erfüllt beides –
nachgeprüft über alle Formen aus `tests/eingabe.test.js` („", „+", „−", „.", „,", „12.", „12,",
„1", „1.2"). Weil die Mengen disjunkt sind, ist die Reihenfolge der beiden Prüfungen für
Dezimaleingaben gleichgültig. **MAS-31 bleibt damit unverändert gültig** (MAS-77 AK6, MAS-75 AK7)
und braucht keinen geänderten Test.

**Der Tippweg „4 1/2", Schritt für Schritt** (so muss es sich verhalten; `pruefeZahl` schneidet
führende und folgende Leerzeichen wie bisher ab):

| getippt | Ergebnis | Meldung am Feld |
|---|---|---|
| `4` | gültig, 4 | keine |
| `4 ` | gültig, 4 (getrimmt) | keine |
| `4 1` | UNVOLLSTAENDIG | keine, solange das Feld den Fokus hat |
| `4 1/` | UNVOLLSTAENDIG | keine, solange das Feld den Fokus hat |
| `4 1/2` | gültig, 4,5 | keine |

`pruefeUndZeige` in `ansichten/gemeinsam.js` zeigt `UNVOLLSTAENDIG` schon heute erst, wenn das Feld
berührt **und** nicht mehr fokussiert ist. **MAS-75 AK2 und AK3 sind damit ohne eine Zeile in der
Oberfläche erfüllt:** Während des Tippens blinkt nichts, und „4 1/" meldet beim Verlassen des
Feldes den bekannten Hinweis „Bitte die Zahl vervollständigen".

### 4.4 Die beiden offenen Punkte aus MAS-75

**„4 3/2" wird abgelehnt** – und zwar als Teil einer allgemeineren Regel:

> **In einem Schrägstrichbruch muss der Zähler kleiner als der Nenner sein.** Ein Nenner 0 ist
> ebenfalls ungültig.

Damit sind „4 3/2", „3/2" und „1/0" Fehler (`KEIN_BRUCH`), „4 1/2", „1/2" und „3/16" gültig.

Begründung:

1. **Es fängt den wahrscheinlichsten Tippfehler.** Ohne diese Regel liest „41/2" – das vergessene
   Leerzeichen – sauber als 20,5 durch. Bei einem Bezugsmaß wären das 20½ cm statt 4½ cm, ein
   Faktor 4,5 in jeder Folgerechnung, und nichts an der Anzeige fiele auf. Mit der Regel bekommt
   die Nutzerin eine Meldung mit der richtigen Form.
2. **Eine Regel statt zwei.** Die naheliegende Alternative – Zähler < Nenner nur im gemischten
   Bruch, bare Brüche beliebig – würde „3/2" erlauben und „41/2" durchlassen. Sie wäre schwerer zu
   erklären und schwerer zu testen.
3. **Der Preis ist gering.** „3/2" für 1,5 schreibt in einer Strickanleitung niemand; dort steht
   „1 1/2".

**Sechzehntel sind erlaubt** (und damit jeder Nenner von 1 bis 99). Begründung: Die Eingabe wird
unverändert gespeichert (MAS-75 AK4), gerechnet wird mit dem genauen Wert, und nur die **Anzeige**
rundet auf Achtel (E32). „3/16" abzulehnen hieße, ein Maß abzulehnen, das in amerikanischen
Anleitungen vorkommt, obwohl dasselbe Maß als „0.1875" längst zulässig ist. Dass die Anzeige daraus
„¼" macht, während im Feld „3/16" stehen bleibt, ist dieselbe bewusste Unschärfe wie in **H7** –
siehe **H8**.

### 4.5 Tastatur auf dem Handy: `inputmode`

**Das ist der Punkt, an dem MAS-75 auf dem Zielgerät scheitern oder gelingen wird.** Die sieben
bruchfähigen Felder tragen heute `inputmode="decimal"`. Diese Tastatur zeigt auf iOS Ziffern und
den Dezimaltrenner – **kein Leerzeichen, keinen Schrägstrich und keine Bruchzeichen**. Mit
`inputmode="decimal"` wäre „4 1/2" auf dem iPhone nicht tippbar, und die Story hätte genau dort
keine Wirkung, wo sie gebraucht wird.

**Festlegung: Die bruchfähigen Felder bekommen `inputmode="text"`.** Betroffen sind sieben
Feldarten:

| Vorlage / Ort | Feld | Regel |
|---|---|---|
| `tpl-probe` | `maschenBezug` | `bezugsmass` |
| `tpl-probe` | `reihenBezug` | `bezugsmass` |
| `tpl-rechner` (über `KARTEN` in `strickstueck.js`) | `breiteZuMaschen.eingabe` | `laenge` |
| `tpl-rechner` (über `KARTEN`) | `laengeZuReihen.eingabe` | `laenge` |
| `tpl-plankarte` | `plan-anfangBreite` | `laenge` |
| `tpl-plankarte` | `plan-endBreite` | `laenge` |
| `tpl-plankarte` | `plan-laenge` | `laenge` |

`maschenAnzahl` und `reihenAnzahl` der Probe behalten `inputmode="decimal"` (Regel `probenAnzahl`,
keine Brüche), alle Ganzzahlfelder behalten `numeric`.

**Der Preis, ausdrücklich benannt:** Auf dem Handy erscheint in diesen sieben Feldern die normale
Texttastatur statt des Ziffernblocks. Für die dezimale Eingabe ist das ein Rückschritt in der
Bequemlichkeit. **Verworfene Alternative:** `inputmode="decimal"` behalten und die Bruchzeichen
über eine Reihe kleiner Knöpfe anbieten. Das wäre bequemer, kostet aber eine weitere Zeile in
Karten, die auf 360 px schon voll sind (R9), und ist neue Bedienmaschinerie für einen Sprint, der
sonst ohne sie auskommt. Siehe **R21** – die QA prüft es, der Praxistest entscheidet, ob es bleibt.

### 4.6 Wechselwirkung mit `einheitUmstellen` (Sprint 5, Abschnitt 4.2)

**Hier liegt die stillste Gefahr dieses Sprints.** Regel 1 aus Sprint 5, Abschnitt 4.2 lautet:
„Leerer oder ungültiger Text bleibt **unverändert**. Geprüft wird mit `parseZahl` aus
`eingabe.js`." `parseZahl` kennt keine Brüche. Ohne Gegenmaßnahme würde ein Bezugsmaß „4 1/2" beim
Wechsel von Zoll nach Zentimeter unverändert stehen bleiben – aus 4½ Zoll würden lautlos 4½
Zentimeter. Das ist genau die stille Verfälschung, die E34 und R20 verhindern sollen, und sie wäre
schlimmer als Befund S5-03, weil der Wert sichtbar plausibel bleibt.

**Festlegung: `umrechneWert` liest mit `parseLaenge`, nicht mit `parseZahl`** (Abschnitt 4.2).
Damit ändert sich Sprint 5, Abschnitt 4.2 in genau einem Punkt:

> Regel 1 (neu gefasst): Leerer oder **weder als Dezimalzahl noch als Bruch lesbarer** Text bleibt
> unverändert. Geprüft wird mit `parseLaenge`.

Regeln 2 bis 4 bleiben unverändert, die **Feldliste bleibt unverändert**. Das ist zulässig und
genau richtig, weil `umrechneWert` ausschließlich auf Längenfelder angewendet wird – dieselben
Felder, deren Prüfregeln `brueche: true` tragen. Jede Zeile der Tabelle in Sprint 5, Abschnitt 4.2
ist entweder `bezugsmass` oder `laenge`; die Prüfung ist Teil der Testvorgaben (Abschnitt 10,
Punkt 16).

**Folge für die Nutzerin:** Nach einem Einheitenwechsel steht im Feld der umgerechnete
**Dezimalwert** („11.43"), nicht mehr ihr Bruch. Das ist kein Verstoß gegen MAS-75 AK5 („kein
stilles Umschreiben"): Der Wechsel der Einheit ersetzt den Wert ohnehin, er ist ausdrücklich
angestoßen, und die Ansicht meldet ihn (Sprint 5, Abschnitt 7). Die **Anzeige** zeigt bei Zoll
weiterhin Brüche.

### 4.7 Die zwei neuen Prüfregeln für die Rundung

```js
// Rapportbreite n der Rundungsregel (US-17): mindestens 2
rapport: Object.freeze({ ganzzahl: true, positiv: true, min: 2, max: 999 }),
// Versatz m der Rundungsregel: 0 ist erlaubt, geprüft wird m < n in pruefeRundung
versatz: Object.freeze({ ganzzahl: true, positiv: false, min: 0, max: 998 }),
```

`m < n` ist eine Bedingung über **zwei** Felder und gehört deshalb nicht in `REGELN`, sondern in
`pruefeRundung` (Abschnitt 5.3).

## 5. Rundung auf Muster (`js/rechner.js`)

### 5.1 `rundeAufMuster`

```js
/** Keine Rundungsregel – kaufmännisch auf eine ganze Zahl, wie E4. */
export const KEINE_RUNDUNG = Object.freeze({ art: 'keine', n: 1, m: 0 });

/**
 * Rundet auf die nächstgelegene Zahl, die der Regel entspricht (US-17 AK6).
 * @param {number} wert    nicht negativ, wie bei runden()
 * @param {{art:string, n:number, m:number}} [regel]
 * @returns {number}
 */
export function rundeAufMuster(wert, regel = KEINE_RUNDUNG) {
  const { n, m } = musterVon(regel);
  const x = Number(wert.toFixed(9));            // Gleitkomma-Bereinigung wie runden(), R2
  const unten = m + Math.floor((x - m) / n) * n;
  // Bei genau gleichem Abstand wird aufgerundet – kaufmännisch, wie E4 (AK6)
  let ergebnis = (x - unten) * 2 >= n ? unten + n : unten;
  // Unterhalb gibt es keine passende Zahl mehr (AK7) – nur bei aktiver Regel, siehe 5.2
  if (regel.art !== 'keine') while (ergebnis < 1) ergebnis += n;
  return ergebnis;
}

/** 'gerade' ist n = 2, m = 0 (AK4). Diese Gleichsetzung steht nur hier. */
function musterVon(regel) {
  if (regel.art === 'gerade') return { n: 2, m: 0 };
  if (regel.art === 'vielfaches') return { n: regel.n, m: regel.m };
  return { n: 1, m: 0 };
}
```

Nur Ganzzahl-Arithmetik nach der einen `toFixed(9)`-Bereinigung – dieselbe Absicherung, die
`runden` seit Sprint 1 trägt (R2).

Nachgerechnete Werte, die als Pflicht-Testfälle gelten:

| Wert | Regel | Ergebnis | warum |
|---|---|---|---|
| 85 | gerade | **86** | 84 und 86 sind gleich weit → aufgerundet (AK6) |
| 85 | Vielfaches von 4 + 2 | **86** | 82 und 86 erlaubt, 86 ist näher |
| 50 | Vielfaches von 4 + 2 | **50** | erfüllt die Regel schon |
| 1,9 | Vielfaches von 4 + 0 | **4** | 0 ist näher, aber < 1 (AK7) |
| 0,3 | Vielfaches von 4 + 2 | **2** | nächste erlaubte Zahl nach oben |
| 0 | gerade | **2** | AK7 |
| 0 | keine | **0** | bitgleich `runden(0)`, siehe 5.2 |

### 5.2 Warum „keine Regel" bitgleich bleibt – und warum die ≥ 1-Regel daran hängt

**Nachgerechnet:** `rundeAufMuster(x, KEINE_RUNDUNG)` liefert für 200 001 Werte von 0 bis 1000 in
Schritten von 0,005 **genau** dasselbe wie `runden(x)` – keine einzige Abweichung, einschließlich
aller „,5"-Fälle und des bereinigten 25,499999999999996 aus dem Kopf von `rechner.js`.

Das gilt nur, weil die Bedingung „Ergebnis mindestens 1" (MAS-21 AK7) **an die aktive Regel
gebunden** ist. Ohne diese Bindung würde `rundeAufMuster(0, KEINE_RUNDUNG)` eine 1 liefern statt
einer 0 – und damit den Fehlerpfad `ERGEBNIS_ZU_KLEIN` in `abschliessen` und in `berechnePlan`
verschieben, der genau auf „< 1" prüft. Zwei Referenzfälle aus Sprint 1 hingen daran.

**Die Lesart ist auch fachlich die richtige:** Ohne Regel ist *jede* ganze Zahl „passend", also gibt
es unterhalb nichts zu überspringen; die 0 ist ein zulässiges Rundungsergebnis, und der bestehende
Hinweis „Ergebnis zu klein" behandelt sie. AK7 spricht über den Fall, dass die **Regel** unterhalb
keine Zahl mehr übrig lässt.

### 5.3 `pruefeRundung`

```js
/**
 * Liest die Rundungsregel eines Strickstücks aus den gespeicherten Texten.
 * @param {object|null|undefined} rundung   Feld vom Strickstück (3.1)
 * @returns {{gueltig:true, regel:object} | {gueltig:false, feld:'n'|'m', fehler:string, grenze?:number}}
 */
export function pruefeRundung(rundung)
```

- Fehlt das Feld oder ist `art` unbekannt → `{ gueltig: true, regel: KEINE_RUNDUNG }`.
- `art: 'keine'` → `KEINE_RUNDUNG`; `art: 'gerade'` → `{ art: 'gerade' }`; `n` und `m` werden in
  beiden Fällen **nicht** geprüft, damit ein halb getippter Rapport keine Meldung auslöst, solange
  die Regel nicht gewählt ist.
- `art: 'vielfaches'` → `n` nach Regel `rapport`, `m` nach Regel `versatz`, beide über `pruefeZahl`.
  Der erste ungültige Wert bestimmt `feld` und `fehler` (Fehlercodes unverändert aus `pruefeZahl`).
- Ist `m >= n` → `{ gueltig: false, feld: 'm', fehler: 'VERSATZ_ZU_GROSS', grenze: n - 1 }`.
  Ein neuer Fehlercode mit einem neuen Text in beiden Sprachen; `grenzeAnzeigen` und
  `pruefeUndZeige` tragen ihn ohne Änderung.

`rechner.js` importiert dafür `pruefeZahl` aus `eingabe.js`. Das ist die erste Abhängigkeit von
`rechner.js` überhaupt; sie ist zulässig, weil `eingabe.js` selbst nichts importiert – es entsteht
kein Zyklus, und `plan.js` hängt längst an beiden. Die Reihenfolge der Schichten bleibt
`eingabe.js` → `rechner.js` → `plan.js`.

### 5.4 Wo die Regel wirkt – und wo nicht

Beide Rechenfunktionen bekommen einen **optionalen letzten Parameter**; alle vorhandenen
Aufrufstellen und Tests bleiben dadurch unverändert gültig:

```js
umrechnenAusAnleitung(n, probeAnleitung, probeEigen, anpassung = 0, rundung = KEINE_RUNDUNG)
umrechnenAusCm(cm, probeAnleitung, probeEigen, anpassung = 0, rundung = KEINE_RUNDUNG)
```

| Wert | Rundung | Begründung |
|---|---|---|
| `eigenGerundet` (US-03 bis US-06) | **Regel** | Das ist „Deine Maschen" / „Deine Reihen" – die Zahl, mit der gestrickt wird (AK5) |
| `anleitungGerundet` (US-05, US-06) | `runden` wie bisher | Das ist die Zahl **nach der Anleitung**. Sie auf den eigenen Rapport zu biegen würde die Anleitung falsch wiedergeben; sie dient dem Vergleich (E3) |
| `anpassung` | **nie** | Gerundet wird **vor** der Anpassung, die Anpassung wird unverändert addiert und nicht erneut gerundet (AK8). `abschliessen` bleibt dafür Zeile für Zeile unverändert |
| `cmTatsaechlich`, `abweichungCm` | – | folgen aus `endgueltig`, kein eigener Rundungsschritt |
| `reihenGerundet` im Plan | `runden` wie bisher | Reihen, nicht Maschen (5.5) |

### 5.5 Maschen oder auch Reihen – die offene Produktfrage

Ob die Regel auch für **Reihen** gilt, ist eine Produktfrage und steht als Vorschlag in MAS-21
(„nein, nur für Maschen"). **Dieser Entwurf hängt nicht von der Antwort ab**, weil die Zuordnung
Richtung → Regel an genau einer Stelle steht:

```js
/** Die Rundungsregel gilt für Maschen; Reihen runden kaufmännisch (MAS-21, offener Punkt 1). */
function rundungFuer(richtung, regel) {
  return richtung === 'maschen' ? regel : KEINE_RUNDUNG;
}
```

Diese Funktion liegt in `ansichten/strickstueck.js` neben `KARTEN` (das `richtung` je Karte schon
führt) und in `plan.js` implizit: Anfangs- und Endmaschen bekommen die Regel, `reihenGerundet`
nicht.

**Was eine Umkehrung kosten würde:** `ziel.js` ruft `umrechnenAusAnleitung` und `umrechnenAusCm`
für **Reihen** auf (`js/ziel.js:103` und `109`). Solange die Regel nur Maschen betrifft, bleibt
`ziel.js` unverändert. Würde sie auf Reihen ausgedehnt, müsste die Regel bis in `zielQuellen`
durchgereicht werden, sonst zeigt der Zähler ein anderes Ziel als der Rechner – ein Fehler, den
niemand bemerkt, bis die letzte Reihe nicht stimmt. **Das ist der Grund, die Frage vor dem Bauen zu
beantworten** (Abschnitt 12).

## 6. Zu-/Abnahmeplan (`js/plan.js`)

Dieser Abschnitt baut auf **Sprint 3, Abschnitt 4** und **Sprint 4, Abschnitt 4.1** auf. Die
verbindliche Verteilungsformel aus Sprint 3 bleibt Zeichen für Zeichen gültig; `verteile(e, n)`
wird **nicht geändert** – nur der Bereich, über den verteilt wird.

### 6.1 Gerundete Anfangs- und Endmaschen und die Auswahl nach E28

Schritt 1 von `berechnePlan` bekommt die Regel:

```js
const anfangGerundet = rundeAufMuster(cmZuAnzahl(e.anfangCm, probe.maschen), e.rundung);
const endGerundet    = rundeAufMuster(cmZuAnzahl(e.endCm,    probe.maschen), e.rundung);
const reihenGerundet = runden(cmZuAnzahl(e.laengeCm, probe.reihen));   // Reihen: unverändert
```

Damit erfüllen `anfang` und `ende` die Regel – **solange die Anpassung 0 ist**. Die Anpassung wird
danach addiert und bewusst nicht zurückgebogen (AK8); setzt die Nutzerin dort einen Wert, führt sie
den Plan selbst aus dem Muster heraus. Das ist ihre Übersteuerung, kein Fehler.

**MAS-21 AK9 – die Auswahl aus E28 muss der Regel folgen.** Mit Regel gilt
`anfang ≡ ende ≡ m (mod n)`, also ist die Differenz immer ein Vielfaches von `n`. Teilbar sein muss
sie aber durch `proEreignis`. Eine Option `anfang ± k·proEreignis` erfüllt die Regel nur, wenn
`k·proEreignis` ein Vielfaches von `n` ist. Die kleinste Maschenzahl, um die man sich im Muster
bewegen kann, ist deshalb

```text
schritt = kgV(n, proEreignis) = n · proEreignis / ggt(n, proEreignis)
```

**Festlegung: Die Auswahl rechnet mit `schritt` statt mit `proEreignis`.**

```text
betrag  = |ende − anfang|
teilbar = betrag mod schritt === 0           (vorher: betrag mod proEreignis === 0)
weniger: delta = floor(betrag / schritt) · schritt ,  Ereignisse = delta / proEreignis
mehr:    delta = ceil (betrag / schritt) · schritt ,  Ereignisse = delta / proEreignis
endMaschen = anfang ± delta
```

Alles andere an Schritt 4 bleibt, wie es ist: Optionen mit `endMaschen < 1` entfallen, „weniger" mit
0 Ereignissen ist die Option „keine Zu-/Abnahme" (E28/S3-01), die Optionen bleiben nach der Wahl im
Ergebnis (S3-02), die Wahl ist richtungsneutral gespeichert.

**Ohne Regel ist das bitgleich das heutige Verhalten:** `n = 1` ⇒ `ggt(1, pro) = 1` ⇒
`schritt = pro`. Die Formel ist also keine Alternative zur alten, sondern deren Verallgemeinerung.

Nachgerechnet am Referenzfall (Probe 25 M / 37 R je 10 cm, 20 → 34 cm):

| Regel | pro | Anfang → Ende | Differenz | Schritt | Auswahl nötig? | Ergebnis |
|---|---|---|---|---|---|---|
| keine | 2 | 50 → 85 | 35 | 2 | **ja** | 84 / 86 M – **der Referenzfall, unverändert** |
| gerade | 2 | 50 → **86** | 36 | 2 | nein | 18 × 2 M |
| Vielf. 4 + 2 | 2 | 50 → **86** | 36 | 4 | nein | 18 × 2 M |
| Vielf. 4 + 2 | 5 | 50 → **86** | 36 | **20** | **ja** | **70 / 90 M** (4 / 8 Ereignisse) – beide ≡ 2 (mod 4) |
| keine | 5 | 50 → 85 | 35 | 5 | nein | 7 × 5 M |

Die letzte Zeile mit Regel zeigt den Preis ehrlich: Mit n = 4 und 5 Maschen je Ereignis liegen die
beiden Angebote 20 Maschen auseinander. Das ist nicht zu vermeiden – es gibt dazwischen keine Zahl,
die beides erfüllt – und es ist der Grund, warum die Auswahl aus E28 häufiger und deutlicher wird.
Siehe **H9**.

**Die Regel gilt für Anfang und Ende, nicht für jede Zwischenstufe.** `maschenDanach` (US-37) läuft
in Schritten von `proEreignis` und verlässt das Muster unterwegs; nach dem letzten Ereignis ist es
genau `ende` – die Invariante aus Sprint 4, Abschnitt 4.2 bleibt gültig, weil
`Ereignisse · proEreignis = |ende − anfang|` weiter gilt. Fachlich ist das richtig: Während der
Formgebung ist man zwischen zwei Rapportbreiten.

### 6.2 MAS-63: „erste genau in" – `verteileEreignisse`

`erlaubteReihen` bleibt **unverändert** (Sprint 4, Abschnitt 4.1) und wird zweimal benutzt. Neu
kommt eine reine Funktion, die den Schritt 8 von `berechnePlan` kapselt:

```js
/**
 * Reihen der e Ereignisse, oder wie viele höchstens möglich wären.
 * @returns {{reihen:number[]} | {moeglich:number}}
 */
export function verteileEreignisse(e, reihen, jedeZweite, startReihe, startArt)
```

```text
erlaubt = erlaubteReihen(reihen, jedeZweite, startReihe)

A) startArt !== 'genau'  ODER  startReihe === null        (heutiger Weg, unverändert)
   e > erlaubt.anzahl            → { moeglich: erlaubt.anzahl }
   sonst                         → { reihen: verteile(e, erlaubt.anzahl).map(erlaubt.reihe) }

B) startArt === 'genau' mit einer Reihe s = startReihe
   erlaubt.anzahl === 0          → { moeglich: 0 }            (s liegt in oder nach der letzten Reihe)
   schritt = jedeZweite ? 2 : 1
   rest = erlaubteReihen(reihen, jedeZweite, s + schritt)     (die Reihen NACH s)
   e − 1 > rest.anzahl           → { moeglich: rest.anzahl + 1 }
   sonst                         → { reihen: [s, ...verteile(e − 1, rest.anzahl).map(rest.reihe)] }
```

Was daran hängt:

- **AK2:** Das erste Ereignis liegt genau in `s`; die übrigen `e − 1` werden mit **derselben**
  Formel über die Reihen danach verteilt. Ihre Abstände unterscheiden sich damit weiter um
  höchstens 1 (ohne „jede 2.") bzw. 2 (mit).
- **AK3:** `rest` kommt aus `erlaubteReihen`, dort gilt `letzte = reihen − 1` – die letzte Reihe
  bleibt frei (E24, zweite Hälfte).
- **AK5:** `s + schritt` mit `schritt = 2` erzeugt `s+2, s+4, …`; die Parität folgt der angegebenen
  Reihe, wie E31 es festlegt.
- **AK4:** Reicht der Platz nicht, liefert die Funktion `moeglich`, und der bestehende Pfad greift
  unverändert: `status: 'fehler'`, `fehler: 'ZU_WENIG_REIHEN'`. **Kein neuer Fehlercode, kein neuer
  Text** – die Einzahl/Mehrzahl-Behandlung aus S3-03 in `plankarte.js` trägt `moeglich: 0` und
  `moeglich: 1` schon.
- **AK8:** Im Fall A ist der Code der alte, buchstäblich. Mit der Vorbelegung `startArt:
  'frueheste'` kann kein Referenzwert sich ändern.

`basis` in `berechnePlan` nennt zusätzlich `startArt: e.startArt ?? 'frueheste'`, damit die Ansicht
nicht im Plan nachsehen muss. `startReiheWirksam` behält seine Bedeutung.

`planEingabenAusTexten` liest `startArt: planTexte.startArt === 'genau' ? 'genau' : 'frueheste'`
und reicht `rundung` durch; die beiden Einstiegspunkte bekommen je einen Parameter:

```js
planEingabenAusTexten(planTexte, einheit, rundung = KEINE_RUNDUNG)
planAusTexten(planTexte, probeEigenTexte, einheit, rundung = KEINE_RUNDUNG)
```

Die Vorgabe `KEINE_RUNDUNG` hält den Aufruf in `js/ziel.js:94` gültig. **Achtung beim Bauen:** Der
Zähler zeigt dann einen Plan ohne Rundungsregel, während die Plan-Karte einen mit zeigt. Die Regel
muss deshalb auch in `ziel.js` durchgereicht werden – sie steht am Strickstück, das `zielQuellen`
ohnehin bekommt. Siehe **R23**; die Vorgabe ist nur dafür da, dass kein Aufruf stillschweigend
etwas anderes bedeutet, nicht dafür, sie stehen zu lassen.

### 6.3 Referenzwerte, nachgerechnet

Alle Werte unten sind gegen den vorhandenen `js/plan.js` gerechnet. Probe 25 M / 37 R je 10 cm,
20 → 34 cm, Länge 45 cm, 2 M je Ereignis, Regel „keine", Wahl „weniger".

**Pflicht (unverändert aus Sprint 3, Abschnitt 4.2):** 50 → 84 M, 167 Reihen, Auswahl 84 / 86 M,
17 Ereignisse in den Reihen

```
10, 19, 28, 37, 47, 56, 65, 74, 84, 93, 102, 111, 120, 130, 139, 148, 157
```

**Neu, „erste genau in Reihe 21", sonst alles gleich:** 17 Ereignisse in den Reihen

```
21, 29, 38, 46, 55, 63, 72, 81, 89, 98, 106, 115, 124, 132, 141, 149, 158
```

**Neu, „erste genau in Reihe 21" mit „nur jede 2. Reihe":** 17 Ereignisse in den Reihen

```
21, 29, 37, 45, 55, 63, 71, 81, 89, 97, 105, 115, 123, 131, 141, 149, 157
```

– alle ungerade, die Parität folgt der 21 (AK5).

Der erste Abstand (21 → 29 = 8) liegt hier innerhalb der Spanne der übrigen (8–9); das muss nicht
so sein. Bei „erste genau in Reihe 60" wäre er deutlich kleiner als die übrigen. Der Product Owner
hat dazu vorgeschlagen, es so zu lassen und die Abstände wie bisher als Spanne zu nennen (MAS-63,
offener Punkt 1). **Dieser Entwurf folgt dem Vorschlag:** `abstandMin` und `abstandMax` werden
unverändert über **alle** Ereignisse gebildet. Siehe **H10**.

### 6.4 Was in `plan.js` unverändert bleibt

`standardStartReihe`, `erlaubteReihen`, `verteile`, `MAX_EREIGNISSE`, `probeAusTexten`, die
Reihenfolge der Schritte 1 bis 8, alle Statuswerte und alle Fehlercodes. Es kommt **kein** neuer
Status und **kein** neuer Fehlercode in diesem Sprint hinzu – mit einer Ausnahme in der Eingabe
(`KEIN_BRUCH`, Abschnitt 4.3) und einer in der Rundung (`VERSATZ_ZU_GROSS`, Abschnitt 5.3).

## 7. Oberfläche

### 7.1 Die Musterkarte im Strickstück

**Die Rundungsregel bekommt eine eigene, kompakte Karte in der Strickstück-Ansicht, oberhalb der
vier Rechner.** Das ist die Antwort auf den offenen Punkt 2 von MAS-21.

```text
tpl-strickstueck:
  Knopf „Reihen zählen"
  Karte „Probe"          (vorhanden)
  Karte „Muster"         ← NEU, data-rolle="muster"
  rechner-raster         (vier Karten)
  Plan-Karte
```

Begründung:

- Die Regel gilt **je Strickstück** (AK2). In die Karten gehört sie damit gerade nicht – fünfmal
  dasselbe Bedienelement wäre fünfmal die Gelegenheit, es verschieden einzustellen.
- Die Plan-Karte ist auf 360 px schon voll (R9) und bekommt in diesem Sprint ohnehin den
  Umschalter aus 7.3.
- Die Karte „Probe" ist der Präzedenzfall für eine kompakte Karte oberhalb der Rechner: Sie zeigt
  etwas, das für alle Karten gilt. Das Muster steht fachlich daneben.

Aufbau (`index.html`, neue Vorlage `tpl-musterkarte`):

```text
<section class="karte muster">
  <h2 data-text="muster.titel">Muster</h2>
  <fieldset class="segment">            drei Optionen, name="stueck-rundung"
    keine · gerade Zahl · Vielfaches
  </fieldset>
  <div class="plan-felder" data-rolle="vielfaches" hidden>    nur bei „Vielfaches“
    Feld n  (regel="rapport",  label „Vielfaches von“)
    Feld m  (regel="versatz",  label „plus“)
  </div>
  <p class="feldhinweis" data-rolle="muster-hinweis"></p>
</section>
```

- **Keine Klappe.** Die Karte ist drei Zeilen hoch; `KLAPPBARE_KARTEN` und das Feld `eingeklappt`
  bleiben unverändert (US-38 wird nicht angefasst).
- Die beiden Felder stehen **nur** bei `art: 'vielfaches'` sichtbar (`hidden` sonst). Beim
  Umschalten auf „Vielfaches" wandert der Fokus in das Feld `n`.
- Die Felder nutzen `.plan-felder`, also das vorhandene zweispaltige Raster – auf 360 px zwei
  schmale Felder in einer Zeile, kein neues CSS.
- Der Hinweis unter der Karte nennt die wirksame Regel in Worten („Gerundet wird auf Vielfache von
  4 plus 2") oder bei „keine" den heutigen Stand („Gerundet wird kaufmännisch auf ganze Maschen").
  Er ersetzt eine Erklärseite.
- Gespeichert wird wie jedes Feld: bei `input` sofort, bei der Auswahl mit `{ sofort: true }`,
  danach `aktualisieren()` – dieselbe Mechanik wie in der Plan-Karte.

### 7.2 Die Rundungszeile in den fünf Karten

Damit die Nutzerin **dort** sieht, warum eine Zahl so herauskommt, wo sie sie liest, bekommen die
vier Rechner-Karten und die Plan-Karte eine **einzelne, nicht bedienbare Zeile** unter dem
Hauptergebnis:

```text
<p class="feldhinweis" data-rolle="rundungshinweis" hidden></p>
```

- Sie ist **leer und `hidden`, solange keine Regel aktiv ist** – ohne Regel ändert sich an keiner
  Karte ein Pixel (R9, R17).
- Mit Regel steht dort ein kurzer Satz, z. B. „Auf Vielfache von 4 + 2 gerundet."
- In den beiden **Reihen**-Rechnern bleibt sie verborgen, solange die Regel nur für Maschen gilt
  (5.5). Das macht die Antwort auf die offene Produktfrage in der Oberfläche sichtbar – und
  ersetzt jede weitere Erklärung, warum „Deine Reihen" sich nicht ändert.
- **Keine Live-Region.** Das Hauptergebnis ist schon `aria-live="polite"`; eine zweite Ansage zur
  selben Änderung widerspricht Sprint 1, Abschnitt 5.4 („Screenreader-Ansagen sparsam").

### 7.3 Der Umschalter in der Plan-Karte (MAS-63)

**Ein Feld mit Umschalter, nicht zwei Felder.** Das ist die Antwort auf den offenen Punkt 2 von
MAS-63.

```text
<fieldset class="segment segment-zwei">        name="plan-startart"
  <legend data-text="plan.startArt">Erste Zu-/Abnahme</legend>
  frühestens ab · genau in
</fieldset>
<div class="feld">                              das vorhandene Feld, unverändert
  <label data-rolle="startReihe-label">…</label>
  <input id="plan-startReihe" …>
  <p class="feldhinweis" data-rolle="startReihe-hinweis">…</p>
</div>
```

Begründung:

- **Zwei Felder könnten sich widersprechen.** „Frühestens ab 4" und „genau in 21" gleichzeitig
  gefüllt wäre ein Zustand, den die App auflösen müsste – und jede Auflösung ignoriert eine
  Eingabe der Nutzerin.
- **Ein Feld ist schmaler.** Der Umschalter ist eine Zeile im vorhandenen `segment segment-zwei`
  (dasselbe Element wie „Arbeitsweise", Befund S5-01), zwei Felder wären ein Block aus Label,
  Eingabe, Hinweis und Fehlerzeile.
- **Das Feld beschriftet sich schon selbst.** `startLabel` und `startHinweis` werden in
  `plankarte.js:258–262` bereits bei jeder Berechnung neu gesetzt. Sie folgen jetzt zusätzlich
  `startArt`:

| `startArt` | Beschriftung | Feldhinweis |
|---|---|---|
| `frueheste` | „Frühestens ab Reihe" | „ohne Angabe: automatisch ab Reihe 3" (heute) |
| `genau` | „Erste Zu-/Abnahme in Reihe" | „ohne Angabe: automatisch ab Reihe 3" (3.2) |

Der Umschalter steht **über** dem Feld, weil er dessen Beschriftung bestimmt. Gespeichert wird im
`change`-Zweig von `plankarte.js` nach dem Muster von `plan-arbeitsweise`, mit `{ sofort: true }`.

### 7.4 Texte und Längen

**Etwa zwanzig neue Schlüssel je Sprache** (`muster.*`, `plan.startArt*`, `fehler.KEIN_BRUCH`,
`fehler.VERSATZ_ZU_GROSS`, die Rundungshinweise). Jeder liegt in `de` **und** `en` vor; der Test aus
Sprint 5, Abschnitt 9, Punkt 15/16 erzwingt gleiche Schlüsselmengen und gleiche Platzhalter
(MAS-21 AK13).

**Geprüft, nicht angenommen: Dieser Sprint bringt keine neue Länge.**

- `n`, `m`, `maschenProEreignis`, `startReihe` sind Stückzahlen bzw. Reihennummern, `startArt` und
  `art` sind Auswahlwerte.
- Also **kein** neuer Eintrag in `formatLaenge`/`formatLaengeAbweichung` (Sprint 5, Abschnitt 5.2,
  acht Stellen – bleiben acht) und **kein** neuer Eintrag in der Feldliste von `einheitUmstellen`
  (Sprint 5, Abschnitt 4.2 – bleibt, wie sie ist). Die neuen Felder gehören in die dortige Liste
  „ausdrücklich nicht umgerechnet", zu `startReihe` und `maschenProEreignis`.
- Die **einzige** Berührung mit Sprint 5, Abschnitt 4.2 ist Regel 1, und sie betrifft nicht die
  Liste, sondern das Lesen (Abschnitt 4.6).
- Neue Zahlen in der Oberfläche gehen über `formatGanzzahl` (Maschen) – nie über `formatLaenge`.

Das ist genau die Stelle, an der Befund S5-03 entstanden ist; die Prüfung steht deshalb als eigener
Testpunkt (Abschnitt 10, Punkt 16).

## 8. Barrierefreiheit und mobile Bedienbarkeit

- **Neue Bedienelemente folgen den vorhandenen Mustern:** `fieldset`/`legend` mit Radios wie
  Arbeitsweise und Farbschema, Felder mit `label`, `aria-describedby` auf Hinweis und Fehlerzeile,
  Touch-Ziele ≥ 44 × 44 px aus `.segment-optionen` und `.feld`.
- **Die Musterkarte bringt drei Radios und zwei Felder** – zwei Zeilen mehr in der
  Strickstück-Ansicht, die ohnehin scrollt. Die **Zähleransicht** wird nicht angefasst, R9/R15
  bleiben dort unberührt.
- **Die Plan-Karte wächst um eine Segmentzeile.** Die QA misst 360 × 640 px in **beiden** Sprachen
  (R17); „Erste Zu-/Abnahme" / „First increase/decrease" ist die längste neue Beschriftung.
- **Die Rundungszeile** ist bei abgeschalteter Regel verborgen und kostet dann keine Höhe (7.2).
- **Keine neue Live-Region.** Die Plan-Ansage (`ANSAGE_VERZOEGERUNG_MS`, S3-04) deckt die Änderungen
  des Plans weiter ab; die Rundungszeile ist Kontext, keine Meldung.
- **Fehlermeldungen erscheinen wie bisher:** `LEER` erst nach Berührung, `UNVOLLSTAENDIG` erst nach
  Verlassen des Feldes, alles andere sofort (`pruefeUndZeige`, unverändert). `KEIN_BRUCH` und
  `VERSATZ_ZU_GROSS` sind gewöhnliche Fehler und erscheinen sofort.
- **`inputmode="text"` in sieben Feldern** (4.5) ändert nur die Bildschirmtastatur, nicht die
  Semantik; `type="text"` stand dort schon. Die QA prüft, dass „4 1/2" auf dem Handy tippbar ist.

## 9. Datenschutz

Unverändert gegenüber Sprint 1, Abschnitt 7. Dieser Sprint ändert daran **nichts**:

- Kein Backend, keine Konten, keine Cookies, keine externen Ressourcen, keine Analytics. Die CSP
  bleibt unverändert.
- Nur lokale Speicherung (E6). Die zwei neuen Felder stehen im vorhandenen Schlüssel
  `maschenrechner.daten.v3` und in der Sicherungsdatei. Eine Rapportbreite und eine Reihennummer
  sind Angaben über ein Strickstück, keine Personendaten.
- Nichts verlässt das Gerät außer der Sicherungsdatei, die die Nutzerin selbst teilt (E15).
- **Keine Abweichung vom Datenschutzkonzept, also auch keine zu begründen.**

## 10. Tests (Vorgaben für Entwicklung und QA)

Alle neuen Funktionen sind rein und ohne DOM prüfbar.

**Eingabe (`tests/eingabe.test.js`, erweitert)**

1. **MAS-30 umgeschrieben, nicht gelöscht** (MAS-77 AK5): „1.000" ergibt in einem Ganzzahlfeld
   `KEINE_GANZZAHL`, „1,000" ebenso; „1000" ergibt 1000. Der Test trägt den Verweis auf **E38** im
   Namen oder im Kommentar, damit die Umkehrung als Entscheidung erkennbar bleibt.
2. **MAS-31 unverändert** (MAS-77 AK6, MAS-75 AK7): „12,", „12.", „-", „+" ergeben weiter
   `UNVOLLSTAENDIG`. Diese Testfälle werden **nicht angefasst**.
3. **Disjunktheit und Reihenfolge** (Abschnitt 4.3): Für alle Formen aus Punkt 2 gilt, dass
   `ZAHL_MUSTER` nicht zutrifft. Der Test hält fest, dass die Umstellung auf „erst lesen, dann
   Zwischenstand" für Dezimaleingaben nichts ändert.
4. **Brüche, Tabelle:** „4 1/2" → 4,5 · „4½" → 4,5 · „4 ½" → 4,5 · „1/2" → 0,5 · „½" → 0,5 ·
   „3/16" → 0,1875 · „4 3/16" → 4,1875 · „4  1/2" (zwei Leerzeichen) → 4,5.
5. **Brüche, Fehler:** „4 3/2" → `KEIN_BRUCH` · „3/2" → `KEIN_BRUCH` · „41/2" → `KEIN_BRUCH`
   (fehlendes Leerzeichen, Abschnitt 4.4) · „1/0" → `KEIN_BRUCH` · „½4" → `KEINE_ZAHL` ·
   „1//2" → `KEINE_ZAHL` · „1/2/3" → `KEINE_ZAHL` · „⅓" → `KEINE_ZAHL`.
6. **Brüche, Zwischenstand:** „4 1" · „4 1/" · „1/" · „4 /" ergeben `UNVOLLSTAENDIG`, nicht
   `KEIN_BRUCH` (MAS-75 AK2/AK3).
7. **Eigenschaftstest über alle Achtel von 0 bis 100** (MAS-75 AK6): Jeder Wert wird als
   Schrägstrichbruch **und** als Bruchzeichen geschrieben und wieder gelesen; die Abweichung ist 0.
   Das sind 801 Werte, zwei Schreibweisen – nachgerechnet, geht auf.
8. **Grenzen gelten auch für Brüche:** „200 1/2" ist bei `bezugsmass` `ZU_GROSS`, „0/2" ist
   `NICHT_POSITIV`.
9. **Nur zwei Regeln nehmen Brüche:** „4 1/2" ist bei `ganzPositiv`, `zaehler`, `anpassung`,
   `proEreignis`, `startReihe`, `nadel`, `probenAnzahl`, `rapport` und `versatz` **kein** gültiger
   Wert.

**Rundung (`tests/rechner.test.js`, erweitert)**

10. `rundeAufMuster` – die Tabelle aus Abschnitt 5.1, Wert für Wert.
11. **Bitgleichheit** (Abschnitt 5.2): `rundeAufMuster(x, KEINE_RUNDUNG) === runden(x)` über einen
    dichten Wertebereich einschließlich 0, aller „,5"-Fälle und 25,499999999999996.
12. **Eigenschaftstest** (MAS-21 AK12): Das Ergebnis erfüllt `ergebnis % n === m % n`, weicht um
    höchstens `n/2` vom Ausgangswert ab – **außer** wenn die ≥ 1-Regel gegriffen hat – und ist
    monoton: ein größerer Ausgangswert ergibt nie ein kleineres Ergebnis.
13. `pruefeRundung`: fehlendes Feld → `KEINE_RUNDUNG` · `art: 'gerade'` prüft `n`/`m` nicht ·
    `n: '1'` → `ZU_KLEIN` am Feld `n` · `m: '4'` bei `n: '4'` → `VERSATZ_ZU_GROSS` am Feld `m` ·
    `n: ''` → `LEER` am Feld `n`.
14. `umrechnenAusAnleitung`/`umrechnenAusCm` mit Regel: `eigenGerundet` folgt der Regel,
    `anleitungGerundet` **nicht**, die Anpassung wird unverändert addiert und nicht erneut gerundet
    (MAS-21 AK8, Abschnitt 5.4).

**Modell (`tests/modell-v3.test.js` und `tests/sicherung-v3.test.js`, erweitert)**

15. Ein Strickstück aus 0.5.0 **ohne** `rundung` und ein Plan ohne `startArt` werden unverändert
    gelesen und verhalten sich wie „keine Regel" / „frühestens ab" (MAS-21 AK10, MAS-63 AK6).
    Unbekannte Werte (`art: 'quadratisch'`, `startArt: 'spaeter'`) fallen auf die Vorbelegung
    zurück, ohne das Strickstück zu verwerfen.
16. **`einheitUmstellen` – die S5-03-Prüfung, diesmal in beide Richtungen** (Abschnitt 7.4):
    `rundung.n`, `rundung.m` und `startArt` bleiben bei einem Einheitenwechsel **unverändert**, und
    ein als Bruch eingetragenes Bezugsmaß („4 1/2" in Zoll) wird **umgerechnet**, nicht
    stehengelassen (Abschnitt 4.6). Der Test aus Sprint 5, Punkt 5 wird dafür erweitert.

**Plan (`tests/plan.test.js`, erweitert)**

17. **Der Referenzfall, unverändert** (Abschnitt 6.3, erste Liste): 50 → 85 M, 167 Reihen, Auswahl
    84 / 86 M, die 17 Reihen Zeichen für Zeichen – mit Regel „keine" **und** `startArt:
    'frueheste'`. Das ist die Prüfung der Wechselwirkung MAS-21 × MAS-63 aus der Definition of Done:
    **nach beiden Änderungen**, nicht nach einer.
18. Dieselbe Prüfung in **Zoll** und mit Sprache **en** (Definition of Done von MAS-79).
19. **Auswahl mit Regel** (MAS-21 AK9, Abschnitt 6.1): die vier Zeilen der Tabelle mit Regel. Der
    Fall n = 4, m = 2, pro = 5 ist der wichtigste: Optionen **70 / 90 M**, 4 bzw. 8 Ereignisse, und
    **beide** Endmaschenzahlen erfüllen `≡ 2 (mod 4)`.
20. **Eigenschaftstest zur Auswahl:** Für zufällige n, m, pro und Maße erfüllen `anfang`, `ende`
    und **jede** angebotene Endmaschenzahl die Regel, und `anzahlEreignisse · proEreignis =
    |ende − anfang|`.
21. **„Erste genau in"** (Abschnitt 6.3, zweite und dritte Liste): Reihe 21 ohne und mit „nur jede
    2.", die Listen Zeichen für Zeichen. Dazu: das erste Ereignis liegt **immer** in der
    angegebenen Reihe (AK2), die letzte Reihe ist **nie** belegt (AK3), und mit „nur jede 2."
    haben alle Reihen die Parität der angegebenen (AK5).
22. **Zu wenig Platz mit „genau"** (AK4): `s = reihen − 1` und mehr als ein Ereignis →
    `ZU_WENIG_REIHEN` mit `moeglich: 1`; `s = reihen` → `moeglich: 0`. Kein neuer Fehlercode.
23. **Breitentest wie in Sprint 3:** über alle Reihenzahlen 1 bis 400, alle Ereigniszahlen, mit und
    ohne „jede 2.", mit `startArt: 'genau'` für mehrere Startreihen – keine doppelte Reihe, keine
    Reihe außerhalb des erlaubten Bereichs, die letzte Reihe frei.
24. **`maschenDanach` bleibt gültig** (Sprint 4, Abschnitt 4.2): Der Wert nach dem letzten Ereignis
    ist genau `ende`, auch mit Rundungsregel und mit „genau in".

**Regression (bestehende Tests)**

25. **Alle 393 bestehenden Tests bleiben grün**, bis auf die nach Punkt 1 bewusst umgeschriebenen.
    Mit Regel „keine" und `startArt: 'frueheste'` muss die App bitgleich rechnen wie 0.5.0; die
    Referenzwerte aus Sprint 1 bis 5 sind unverändert zu reproduzieren (R7).
26. `tests/texte.test.js`: gleiche Schlüsselmengen und Platzhalter in `de` und `en`, einschließlich
    aller neuen Schlüssel.
27. `tests/sw-liste.test.js`: Versionsnummern in `package.json`, `sw.js` und `js/app.js` auf
    **0.6.0**, `CACHE_NAME` erhöht, `APP_DATEIEN` vollständig (unverändert, keine neue Datei).

**Im Browser zu prüfen (QA)**

28. **„4 1/2" auf dem Handy tippbar** – in allen sieben Feldern aus Abschnitt 4.5, mit der
    Tastatur, die `inputmode="text"` öffnet. Dazu: Während des Tippens blinkt in keinem Schritt
    eine Fehlermeldung auf (MAS-75 AK2).
29. **360 × 640 px in beiden Sprachen** mit Musterkarte und Umschalter, ohne Querscrollen (R9,
    R17, R21).
30. Die Rundungszeile erscheint in den Maschen-Karten und im Plan, sobald eine Regel aktiv ist, und
    verschwindet mit ihr. Die Reihen-Karten zeigen sie nicht (7.2).
31. Ein Strickstück mit Rapport 4 + 2 rechnen und einen Ärmel mit „erste Abnahme in Reihe 21" –
    beides als Vorlage für den Praxistest.

## 11. Risiken und Hinweise an den Product Owner

Neue Risiken beginnen bei **R21**, neue Hinweise bei **H8** (Stand `docs/architektur.md`).

| # | Risiko / Hinweis | Umgang |
|---|---|---|
| **R21** | **`inputmode="text"` in sieben Längenfeldern.** Ohne die Umstellung ist die Brucheingabe auf dem iPhone unbenutzbar (keine Taste für Leerzeichen oder Schrägstrich); mit ihr verlieren dieselben Felder den Ziffernblock für die dezimale Eingabe. | Festlegung in Abschnitt 4.5, mit der verworfenen Alternative (Knopfreihe mit Bruchzeichen) und ihrem Preis (eine Zeile mehr in Karten, die auf 360 px voll sind). QA prüft Punkt 28, der **Praxistest entscheidet**, ob es bleibt. |
| **R22** | **Eine als Bruch gespeicherte Länge ist für 0.5.0 keine Zahl.** Fortführung von R13/R18: Eine ältere Fassung zeigt dort keinen Wert und rechnet nicht. | Der Ausfall ist **sichtbar**, nicht still – das ist der wichtige Unterschied zu R18. Der Weg dorthin ist derselbe einzige: eine von Hand übertragene Sicherungsdatei in ein Gerät, das seit der Veröffentlichung nicht online war. Keine Maßnahme im Code (Abschnitt 3.3). |
| **R23** | **Zwei Pfade zum Plan.** `plankarte.js` und `ziel.js` rechnen denselben Plan getrennt. Wird die Rundungsregel nur im einen durchgereicht, zeigt der Zähler ein anderes Ziel als die Karte – ein Fehler, der erst in der letzten Reihe auffällt. | Beide Aufrufe von `planAusTexten` bekommen die Regel. Die Vorgabe `KEINE_RUNDUNG` am Parameter ist nur dafür da, dass kein Aufruf stillschweigend die Bedeutung wechselt, **nicht** dafür, `ziel.js` auszulassen (Abschnitt 6.2). Eigener Testpunkt: Ziel und Plan nennen dieselbe Maschenzahl. |
| **R24** | **Die Verteilungsformel wird zum zweiten Mal in drei Sprints angefasst** (nach R14) – und diesmal zusammen mit der Rundung, die die Maschenzahlen ändert. | `verteile` bleibt **unverändert**; geändert wird nur der Bereich, über den verteilt wird (6.2). Der Weg „frühestens ab" ist buchstäblich der alte Code. Die Referenzlisten aus Abschnitt 6.3 sind nachgerechnet und als Pflicht-Testfälle gesetzt, der Breitentest aus Sprint 3 läuft erneut mit „genau in" (Punkt 23). |
| **H8** | **Sechzehntel werden angenommen, aber als Achtel angezeigt.** Wer „3/16" eingibt, liest „¼" – im Feld bleibt „3/16" stehen. | Fachlich dieselbe bewusste Unschärfe wie **H7**; gerechnet wird mit dem genauen Wert, nur die Anzeige rundet (E32). Wer es genau sehen will, stellt die Darstellung auf dezimal. Zur Kenntnis (Abschnitt 4.4). |
| **H9** | **Mit Rapport liegen die beiden Endmaschen-Angebote weiter auseinander.** Bei Rapport 4 und 5 Maschen je Zu-/Abnahme sind es 70 oder 90 Maschen – 20 Maschen Unterschied, weil dazwischen keine Zahl beide Bedingungen erfüllt. | Unvermeidlich und richtig (Abschnitt 6.1). Der Product Owner sollte wissen, dass E28 damit **sichtbarer** wird als geplant: Die Auswahl erscheint häufiger und mit größeren Sprüngen. Eine mögliche Folgestory wäre, die Zahl der Maschen je Zu-/Abnahme vorzuschlagen, die zum Rapport passt. |
| **H10** | **Der erste Abstand kann aus der Spanne fallen.** Bei „erste genau in Reihe 60" von 167 steht in der Zusammenfassung dann z. B. „alle 6–59 Reihen". | Der Product Owner hat vorgeschlagen, es so zu lassen (MAS-63, offener Punkt 1); dieser Entwurf folgt dem (Abschnitt 6.3). Alternative, falls es im Praxistest stört: die Spanne nur über die Ereignisse **nach** dem ersten bilden und die erste Reihe eigens nennen. Das wäre eine Textänderung, kein Rechenweg. |
| **H11** | **Die Brucheingabe ist nirgends angekündigt.** Dass „4 1/2" geht, erfährt die Nutzerin nur, wenn sie es versucht – oder aus der Fehlermeldung `KEIN_BRUCH`, die die Form nennt. | Bewusst kein dauerhafter Hinweis unter den sieben Feldern: Das wären sieben Zeilen in Karten, die auf 360 px voll sind (R9). Die Fehlermeldung nennt die Form („z. B. 4 1/2 oder 4½"). Der Praxistest zeigt, ob das genügt. |

**Fortgeführte Risiken:** R2 (Gleitkomma – `rundeAufMuster` nutzt dieselbe Bereinigung), R6/R10
(Datenerhalt – additive Felder, Reparatur statt Verwerfen), R7 (Rechenwege – bitgleich bei
Vorbelegung), R9/R15/R17 (Platz auf 360 px – eine Segmentzeile und eine kompakte Karte mehr),
R13 (Rückrichtung), R14 (Startreihe), R20 (Einheitenwechsel – erweitert durch Abschnitt 4.6).

## 12. Offene Punkte für den Auftraggeber

1. **Gilt die Rundungsregel auch für Reihen?** Produktfrage, nicht Architekturfrage; Vorschlag des
   Product Owners in MAS-21: nein, nur für Maschen. **Dieser Entwurf setzt „nur Maschen" um** und
   kapselt die Zuordnung in `rundungFuer` (5.5), damit eine Umkehrung eine Zeile ist. Sie ist aber
   **nicht nur eine Zeile**: Bei „auch Reihen" muss die Regel bis in `ziel.js` durchgereicht
   werden, sonst weicht das Ziel des Zählers von der Rechnung ab (R23). **Die Antwort gehört
   deshalb vor den Baubeginn**, nicht danach.
2. **Bleibt `inputmode="text"`?** Die Entscheidung in 4.5 ist begründet, aber sie verschlechtert die
   dezimale Eingabe auf dem Handy für alle sieben Längenfelder. Der Praxistest ist der richtige Ort
   dafür; bis dahin ist R21 offen.
3. **E34 und E35 sind weiter als vorläufig eingetragen**, obwohl mit 0.5.0 veröffentlicht und von
   der QA abgenommen. Unverändert aus Sprint 5 übernommen.
