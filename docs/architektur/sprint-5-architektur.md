# Architekturdokument – Maschenrechner, Sprint 5 (Version 5.0)

Rolle: Architekt · Grundlage: Epic MAS-73, Stories MAS-28 (US-24), MAS-74 (US-41), MAS-27 (US-23);
Entscheidungen E5, E9, E10, E13, E32, E33, E34, E35, E36 · Baut auf
`architektur/sprint-4-architektur.md` v4.3 auf. Alles dort Festgelegte gilt weiter, sofern hier
nichts anderes steht.

**Die Abschnittsnummern dieses Dokuments sind Teil der Schnittstelle.** Code und Testberichte
verweisen darauf („Architektur Sprint 5, Abschnitt 4.2"). Ältere Dokumente werden nicht
umnumeriert.

## 1. Was sich gegenüber Sprint 4 ändert

| Bereich | Sprint 4 | Sprint 5 |
|---|---|---|
| Sprachen | nur `de` | `de` und **`en`** (MAS-27), 261 Schlüssel je Sprache |
| Längeneinheiten | nur `cm` | `cm` und **`in`** (MAS-28), Bezugsmaß 4 Zoll (E33) |
| Zahlendarstellung | immer dezimal, 2 Stellen | **dezimal oder Bruch**, einstellbar (MAS-74, E32) |
| Einstellungen (Oberfläche) | Farbschema, Datensicherung, Version | zusätzlich **Sprache, Einheit, Darstellung** (E10) |
| Einstellungen (Daten) | `sprache`, `laengeneinheit`, `farbschema` | zusätzlich **`laengenDarstellung`** |
| Gespeicherte Längen | immer in cm | in der **eingestellten Einheit**; beim Umstellen umgerechnet (E34, R4) |
| Datenmodell | Schema 3 | **Schema 3 bleibt**, ein additives optionales Feld (Abschnitt 3) |
| Schlüssel im Speicher | `maschenrechner.daten.v3` | **unverändert** – kein Schemawechsel, keine neue Migration |

**Technologie bleibt unverändert:** PWA, HTML/CSS/Vanilla-JS (ES-Module), kein Build-Schritt, keine
Abhängigkeiten, GitHub Pages, `node --test`, localStorage.

**Kein neues Modul.** Die Bruchformatierung kommt in `format.js`, die Umrechnung in `einheiten.js`,
der Datendurchlauf in `modell.js`. Damit bleibt `APP_DATEIEN` in `sw.js` unverändert und
`tests/sw-liste.test.js` braucht nur die neue Versionsnummer.

**Die Rechenwege bleiben unangetastet** (R7). `plan.js` und `ziel.js` werden in diesem Sprint nicht
geändert. Die Rechenlogik arbeitet weiter ausschließlich in Zentimetern; Einheit und Darstellung
wirken allein an den Rändern – bei der Eingabe über `zuCm`, bei der Ausgabe über `vonCm` und die
Formatierung.

### Was Sprint 1 schon vorbereitet hat

Dieser Sprint füllt vorbereitete Fächer. Nachgeprüft am 02.11.2026:

- `js/texte.js` trägt im Dateikopf die Anleitung, wie eine Sprache ergänzt wird, und **keiner der
  261 Schlüssel enthält eine Einheit fest** – überall steht der Platzhalter `{einheit}`.
- `js/einheiten.js` beschreibt den Zoll-Eintrag wörtlich: `in: { faktorZuCm: 2.54, standardBezug: 4 }`.
- `js/format.js` hängt bewusst keine Einheiten an; das erledigt `app.js` über `{einheit}`.
- `bereinigeEinstellungen` in `js/modell.js` prüft `sprache` und `laengeneinheit` bereits, mit
  Rückfall auf die Vorgabe, und sein Kommentar sagt: „Sprache, Einheit und Farbschema sind
  unabhängig."
- **Risiko R4 aus Sprint 1** nennt die Umrechnung beim Einheitenwechsel namentlich und verweist auf
  US-24. Dieses Dokument löst R4 ein.

**Die Lücke ist die Oberfläche:** `js/ansichten/einstellungen.js` bietet nur Farbschema,
Datensicherung und Version.

## 2. Dateistruktur (geändert: ✎)

```
index.html                     ✎  Vorlage: drei neue Auswahlgruppen in tpl-einstellungen
sw.js                          ✎  nur CACHE_NAME und Version
js/app.js                      ✎  Darstellung im ctx, Sprachwechsel zur Laufzeit
js/texte.js                    ✎  en-Eintrag (261 Schlüssel), einheit.in, Texte der Einstellungen
js/einheiten.js                ✎  in-Eintrag, stellen, umrechneWert
js/format.js                   ✎  formatBruch, formatLaenge, formatLaengeAbweichung, bruchVorlesbar
js/modell.js                   ✎  laengenDarstellung, DARSTELLUNGEN, darstellungFuer, einheitUmstellen
js/ansichten/einstellungen.js  ✎  drei Auswahlgruppen
js/ansichten/plankarte.js      ✎  zwei Längen-Anzeigestellen
js/ansichten/strickstueck.js   ✎  drei Längen-Anzeigestellen (eine davon mit Vorzeichen)
js/ansichten/zaehler.js        ✎  zwei Längen-Anzeigestellen
js/plan.js                     –  unverändert
js/ziel.js                     –  unverändert
js/eingabe.js                  –  unverändert (die Brucheingabe ist MAS-75, Sprint 6)
```

**Keine neue Datei.** `APP_DATEIEN` in `sw.js` bleibt inhaltlich gleich.

## 3. Datenmodell: Schema 3 bleibt, eine dritte Einstellung kommt hinzu

`SCHEMA_VERSION` bleibt **3**, der Speicherschlüssel bleibt `maschenrechner.daten.v3`. Es gibt
keine Migration. Wie in Sprint 4 ist das Feld **additiv und optional**; sein Fehlen bedeutet die
Vorgabe.

```js
einstellungen: {
  sprache: 'de' | 'en',                              // vorhanden
  laengeneinheit: 'cm' | 'in',                       // vorhanden, neuer Wert 'in'
  farbschema: 'system' | 'hell' | 'dunkel',          // vorhanden
  laengenDarstellung: 'auto' | 'dezimal' | 'bruch',  // NEU, Vorgabe 'auto'
}
```

### 3.1 Warum `auto` und nicht ein Wahrheitswert

MAS-74 AK3 verlangt zwei Dinge gleichzeitig: Die Darstellung soll der Einheit folgen (cm dezimal,
Zoll Bruch), **aber** eine eigene Wahl der Nutzerin soll bestehen bleiben, auch wenn sie später die
Einheit wechselt. Ein Wahrheitswert kann das nicht ausdrücken – man bräuchte ein zweites Feld
„wurde gesetzt".

Deshalb drei Zustände. `auto` ist die Vorgabe und leitet sich aus der Einheit ab:

```js
export function darstellungFuer(einstellungen) {
  const d = einstellungen.laengenDarstellung;
  if (d === 'dezimal' || d === 'bruch') return d;
  return einstellungen.laengeneinheit === 'in' ? 'bruch' : 'dezimal';
}
```

Das ist eine reine Funktion in `modell.js`. **Nur sie** darf die Darstellung bestimmen; die
Ansichten fragen nie selbst `laengeneinheit` ab, um auf die Darstellung zu schließen.

`bereinigeEinstellungen` erhält eine Zeile nach dem bestehenden Muster:

```js
laengenDarstellung: DARSTELLUNGEN.includes(e.laengenDarstellung) ? e.laengenDarstellung : 'auto',
```

mit `export const DARSTELLUNGEN = Object.freeze(['auto', 'dezimal', 'bruch']);`

### 3.2 Rückrichtung

**R13 gilt unverändert und wird um dieses Feld erweitert.** Eine noch installierte 0.4.0 liest
Daten von 0.5.0 fehlerfrei, kennt `laengenDarstellung` aber nicht und schneidet es beim nächsten
Speichern weg – genau wie 0.3.0 es mit `startReihe` und `eingeklappt` tut (Befund S4-06). Das ist
bewusst hingenommen.

**Neu und schwerwiegender:** 0.4.0 kennt auch den Einheitenwert `'in'` nicht.
`istBekannteEinheit('in')` ist dort `false`, also fällt `bereinigeEinstellungen` auf `'cm'` zurück –
**die in Zoll gespeicherten Zahlen werden dann als Zentimeter gelesen.** Aus 3,94 Zoll werden
3,94 cm. Das ist keine Datenverlust-, sondern eine Fehldeutungsgefahr. Siehe **R18**.

## 4. Einheiten

### 4.1 Der `in`-Eintrag

```js
export const LAENGENEINHEITEN = Object.freeze({
  cm: Object.freeze({ faktorZuCm: 1,    standardBezug: 10, stellen: 2 }),
  in: Object.freeze({ faktorZuCm: 2.54, standardBezug: 4,  stellen: 2 }),
});
```

`faktorZuCm` und `standardBezug` sind die Werte, die der Dateikopf seit Sprint 1 vorsieht (E33).
`stellen` ist neu und sagt, auf wie viele Nachkommastellen ein **gespeicherter** Wert beim
Umrechnen gerundet wird (Abschnitt 4.3). `zuCm`, `vonCm`, `standardBezug` und `istBekannteEinheit`
bleiben unverändert – sie sind schon allgemein geschrieben.

**Das Kürzel** steht als Text unter `einheit.in` in `texte.js` und ist in beiden Sprachen `in`.
Kein Text enthält eine Einheit fest; alle nutzen weiter `{einheit}`.

### 4.2 Umstellen der Einheit: genau diese Felder werden umgerechnet

Gespeicherte Längen liegen in der **eingestellten Einheit**, nicht in Zentimetern. Beim Umstellen
müssen sie umgerechnet werden (E34, R4, MAS-28 AK4/AK5). Die vollständige Liste – alles andere
bleibt unberührt:

| Ort | Felder | Warum |
|---|---|---|
| jede Probe (`anleitung` und `eigen`, je Probenpaar) | `maschenBezug`, `reihenBezug` | Bezugsmaß ist eine Länge |
| jedes Strickstück | `rechner.breiteZuMaschen.eingabe`, `rechner.laengeZuReihen.eingabe` | gewünschte Breite bzw. Länge |
| jeder Plan | `anfangBreite`, `endBreite`, `laenge` | Maße des Teils |

**Ausdrücklich nicht umgerechnet**, weil keine Längen:

- `maschenAnzahl`, `reihenAnzahl` der Proben – Stückzahlen
- `nadelstaerkeMm` – immer in mm (E35)
- `rechner.maschenAusAnleitung.eingabe`, `rechner.reihenAusAnleitung.eingabe` – Stückzahlen
- alle `anpassung`-Felder, `maschenProEreignis`, `startReihe`, `zaehler` – Stückzahlen bzw.
  Reihennummern
- `ereignisWahl`, `zielQuelle` – Auswahlwerte

Die Umstellung ist eine **reine Funktion** in `modell.js`:

```js
export function einheitUmstellen(daten, neueEinheit) // → neue daten, ohne Seiteneffekt
```

Sie läuft über alle Projekte, Proben, Strickstücke und Pläne und ersetzt die Felder der Tabelle.
Pro Feld wird `umrechneWert` aus `einheiten.js` benutzt:

```js
export function umrechneWert(text, vonEinheit, nachEinheit) // → string
```

**Regeln für `umrechneWert`:**

1. Leerer oder ungültiger Text bleibt **unverändert**. Eine halb getippte Eingabe wird nicht
   stillschweigend zu einer Zahl gemacht. Geprüft wird mit `parseZahl` aus `eingabe.js`.
2. Gültige Zahl: `vonCm(zuCm(wert, vonEinheit), nachEinheit)`, gerundet auf `stellen` der
   **Zieleinheit**.
3. Das Ergebnis wird mit **Punkt** als Dezimaltrenner geschrieben, nie mit Komma und nie
   locale-abhängig. Begründung: Gespeicherte Werte dürfen nicht von der Sprache abhängen, und der
   Punkt ist in Dezimalfeldern ein gültiger Dezimaltrenner (E13). Die Nutzerin sieht also nach
   einem Wechsel „3.94" im Feld, auch bei deutscher Oberfläche. Siehe **H6**.
4. **Sonderfall leere Probe:** Ist bei einer Probe `maschenAnzahl` bzw. `reihenAnzahl` leer, wird
   das zugehörige Bezugsmaß **nicht** umgerechnet, sondern auf `standardBezug(neueEinheit)`
   gesetzt. Eine noch nicht ausgefüllte Probe soll „4" zeigen, nicht „3.94". MAS-28 AK3
   (Vorbelegung) und AK4 (Umrechnen) greifen damit sauber ineinander: AK3 gilt für leere, AK4 für
   ausgefüllte Werte.

**Aufrufstelle:** allein `js/ansichten/einstellungen.js`, beim Wechsel des Auswahlfelds, in einem
Schritt zusammen mit `einstellungAendern`. Kein anderer Ort stellt Einheiten um.

### 4.3 Rundung und die Rückrichtung eines Wechsels

Mit `stellen: 2` für beide Einheiten driftet ein Hin-und-Zurück-Wechsel sichtbar:
10 cm → 3.94 in → 10.01 cm. MAS-28 AK5 lässt das zu („bis auf Rundung"), aber es ist messbar, und
bei mehrfachem Wechseln summiert es sich.

**Festlegung:** `stellen: 2` für beide Einheiten. Begründung: Es passt zu E5, zu den
Eingabefeldern und zu dem, was eine Strickerin selbst eintippen würde. Der Drift von einem
Hundertstel Zentimeter ist fachlich bedeutungslos – er liegt weit unter der Genauigkeit, mit der
man ein Strickstück messen kann.

**Alternative, die der Product Owner entscheiden kann:** `stellen: 3` für Zoll macht den
Hin-und-Zurück-Wechsel bei zwei Dezimalstellen in cm exakt (10 → 3.937 → 10.00), zeigt aber
„3.937" im Eingabefeld. Siehe **H5**.

Die QA prüft **einen** Wechsel hin und zurück und misst die Abweichung; sie prüft nicht
zehnfaches Wechseln, weil das kein realer Anwendungsfall ist.

## 5. Zahlendarstellung

### 5.1 `formatBruch`

Neu in `format.js`, reine Funktion:

```js
export function formatBruch(wert, locale)  // → '4½', '½', '4', '0'
```

**Regeln:**

1. Gerundet wird auf **Achtel** (E32): `Math.round(wert * 8) / 8`.
2. Der ganze Teil wird mit `formatGanzzahl(ganz, locale)` ausgegeben – damit bleibt die
   Ziffernform der Locale erhalten.
3. Der Bruchteil wird als **ein Zeichen** angehängt, ohne Leerzeichen:
   `⅛ ¼ ⅜ ½ ⅝ ¾ ⅞` (U+215B, U+00BC, U+215C, U+00BD, U+215D, U+00BE, U+215E).
4. Ist der Bruchteil 0, erscheint **nur** der ganze Teil („4").
5. Ist der ganze Teil 0 und ein Bruchteil vorhanden, erscheint **nur** der Bruch („½"), nicht „0½"
   (MAS-74 AK5).
6. Ist der Wert 0, erscheint „0".
7. Ungültige Werte ergeben `LEER_ANZEIGE` („–"), wie bei `formatZahl`.

**Vorlesbare Fassung** für Screenreader (MAS-74 AK10):

```js
export function bruchVorlesbar(wert, locale)  // → '4 1/2'
```

Dieselbe Rundung, aber mit Schrägstrich und Leerzeichen statt eines Bruchzeichens. Sie wird für
`aria-label` benutzt, wo eine Länge allein in einem Element steht. **Welche Screenreader das
wirklich brauchen, ist nicht geprüft** – die Entwicklung setzt das Attribut, die QA prüft die
Auszeichnung, nicht die Aussprache.

### 5.2 Die sieben Längen-Anzeigestellen

**Berichtigung gegenüber der Sprintplanung:** Es sind **sieben**, nicht sechs. Sechs rufen
`formatZahl`, eine siebte ruft `formatAbweichung` – auch sie zeigt eine Länge.

| Datei | Zeile (Stand `662add1`) | Was | Vorzeichen |
|---|---|---|---|
| `ansichten/plankarte.js` | 212 | Breite in der Auswahl der Endmaschenzahl | nein |
| `ansichten/plankarte.js` | 273 | Maße der Plan-Karte | nein |
| `ansichten/strickstueck.js` | 214 | Maß laut Anleitung | nein |
| `ansichten/strickstueck.js` | 227 | tatsächliches Maß | nein |
| `ansichten/strickstueck.js` | **228** | **Abweichung** | **ja** |
| `ansichten/zaehler.js` | 108 | gestrickte Länge | nein |
| `ansichten/zaehler.js` | 110 | Ziellänge | nein |

Alle sieben rufen heute `format…(vonCm(x, einheit), loc)`. Sie werden durch **zwei** gemeinsame
Funktionen in `format.js` ersetzt:

```js
export function formatLaenge(wertCm, einheit, locale, darstellung)            // ohne Vorzeichen
export function formatLaengeAbweichung(wertCm, einheit, locale, darstellung)  // mit Vorzeichen
```

Beide rechnen selbst mit `vonCm` um und wählen dann `formatZahl`/`formatAbweichung` oder
`formatBruch`. Damit verschwindet `vonCm` aus den Ansichten, und es gibt genau zwei Stellen, an
denen über die Darstellung entschieden wird.

**Die Einheit wird weiterhin nicht angehängt.** Das bleibt bei `app.js` über `{einheit}` – so wie
der Kopf von `format.js` es seit Sprint 1 festlegt. Die Textschlüssel der sieben Stellen bleiben
unverändert.

**Abweichung als Bruch:** `formatLaengeAbweichung` rundet zuerst auf Achtel und entscheidet dann
über das Vorzeichen, analog zu `formatAbweichung`. Ergibt die Rundung 0, erscheint „±0" – nicht
„+0" und nicht „−0". Eine Abweichung von 1 mm wird bei Zoll also zu „±0", weil sie unter einem
halben Achtel Zoll liegt. **Das ist gewollt und der Preis der Bruchdarstellung**; bei cm mit
dezimaler Darstellung bleibt die Abweichung so genau wie bisher. Siehe **H7**.

### 5.3 Was dezimal bleibt

- **Die Dichte** in `ansichten/projekt.js:129` (`anzahl / bezug`, also Maschen pro Einheit) bleibt
  immer `formatZahl` mit zwei Stellen (MAS-74 AK7). Sie ist keine Länge. E5 gilt dort unverändert.
- **Die Nadelstärke** bleibt mm und dezimal (E35).
- **Stückzahlen** (Maschen, Reihen, Zählerstand) bleiben `formatGanzzahl`.

E5 ist damit nicht aufgehoben, sondern eingeschränkt: Die zwei Nachkommastellen gelten ab jetzt
für **Dichten und die Nadelstärke**, nicht mehr für Längen (E32).

## 6. Sprache

### 6.1 Der `en`-Eintrag und die Locale

```js
en: Object.freeze({ locale: 'en-US', texte: Object.freeze({ /* 261 Schlüssel */ }) }),
```

**`en-US`, nicht `en-GB`.** Der Dateikopf von `texte.js` nennt `en-GB` als Beispiel; dieser Sprint
wählt `en-US`, weil das Ziel amerikanische Maße sind (MAS-73). Praktischer Unterschied:
Datumsformat (`11/2/2026` statt `02/11/2026`) – bei Zahlen sind beide gleich. Das Datum erscheint
nur beim Sicherungsdatum in den Einstellungen.

**Zur Übersetzung:**

- Die Fachbegriffe sind die üblichen englischen: *gauge* (Maschenprobe), *swatch*, *stitch*, *row*,
  *round*, *cast on*, *bind off*, *increase*, *decrease*, *needle size*.
- Platzhalter in geschweiften Klammern (`{einheit}`, `{maschen}`, `{reihe}`) müssen **unverändert**
  übernommen werden; eine Umbenennung bricht den Aufruf still.
- Der Rückfall in `text()` auf Deutsch bleibt. Er ist Netz, nicht Plan: MAS-27 AK3 verlangt
  vollständige Deckung, der Test in Abschnitt 9 prüft das.
- Englische Sätze sind oft länger. Betroffen sind vor allem die Plan-Zusammenfassung, die
  Kurzfassungen der zugeklappten Karten und die Zähleransicht – siehe **R17**.

### 6.2 Sprachwechsel zur Laufzeit

Der Farbschema-Wechsel ruft `ctx.farbschemaAnwenden()` und braucht keinen Neuaufbau, weil er nur
CSS betrifft. Ein **Sprachwechsel betrifft jeden Text** und erfordert einen Neuaufbau der aktuellen
Ansicht: `texteFuellen` läuft nur beim Aufbau.

Festlegung: Der Wechsel von Sprache, Einheit oder Darstellung baut die **aktuelle Ansicht neu auf**
(dieselbe Route, also die Einstellungen), und `app.js` setzt dabei `document.documentElement.lang`
neu. Die Nutzerin bleibt in den Einstellungen und sieht sie sofort in der neuen Sprache. Ein
vollständiges Neuladen der Seite ist **nicht** nötig und auch nicht gewollt – es würde den
Service Worker einbeziehen und wäre auf dem Handy sichtbar langsam.

## 7. Oberfläche: drei Auswahlgruppen in den Einstellungen

Alle drei folgen genau dem Muster des Farbschemas (US-26): eine Gruppe von `input[type=radio]` in
`tpl-einstellungen`, mit `data-text`-Beschriftungen, im Code eine Schleife über
`querySelectorAll('input[name="…"]')`.

| Gruppe | `name` | Werte | Beschriftungen |
|---|---|---|---|
| Sprache | `sprache` | `de`, `en` | „Deutsch", „English" – **beide immer in der eigenen Sprache**, nicht übersetzt |
| Einheit | `einheit` | `cm`, `in` | „Zentimeter (cm)", „Zoll (in)" bzw. „Centimeters (cm)", „Inches (in)" |
| Darstellung | `darstellung` | `auto`, `dezimal`, `bruch` | „Automatisch", „Dezimal (4,5)", „Bruch (4½)" |

**Begründung zu „Deutsch"/„English":** Wer die Oberfläche in einer Sprache sieht, die er nicht
liest, muss die eigene finden können. Sprachnamen werden deshalb nie übersetzt.

**Reihenfolge in der Ansicht:** Sprache, Einheit, Darstellung, dann Farbschema, dann
Datensicherung. Die drei Neuen stehen oben, weil sie die Oberfläche selbst betreffen.

**Der Einheitenwechsel rechnet Daten um** (Abschnitt 4.2) und ist damit der erste Schalter in den
Einstellungen, der **Projektdaten** verändert. Deshalb:

- Er läuft in **einem** `ctx.aendern`-Aufruf mit `{ sofort: true }`, damit kein Zwischenstand
  gespeichert wird.
- Danach erscheint im bestehenden `[data-rolle="status"]`-Feld der Ansicht ein kurzer Hinweis,
  z. B. „Maße wurden in Zoll umgerechnet." Das erfüllt MAS-28 AK6 (keine stille Verfälschung)
  mit dem Mittel, das die Ansicht schon hat.
- **Keine Rückfrage, kein Dialog.** E34 hat die Variante „fragen" verworfen, weil ihre Option
  „Zahlen behalten" gerade den Fehler anbietet, den die Entscheidung vermeiden will.

## 8. Datenschutz

Unverändert gegenüber Sprint 1, Abschnitt 7. Dieser Sprint ändert daran **nichts**:

- Kein Backend, keine externen Ressourcen, keine Schriftarten oder Skripte von fremden Servern.
  Die englischen Texte sind Teil von `texte.js` und werden mit der App ausgeliefert – **kein
  Übersetzungsdienst, keine Sprachdatei aus dem Netz.**
- Die Spracheinstellung des Browsers (`navigator.language`) wird **nicht** ausgelesen. Die Sprache
  kommt allein aus der Einstellung, Vorgabe Deutsch. Begründung: `navigator.language` ist ein
  Merkmal zur Wiedererkennung, und der Gewinn wäre gering – die Nutzerin stellt die Sprache
  einmal ein.
- Nichts verlässt das Gerät außer der Sicherungsdatei, die die Nutzerin selbst teilt (E6).
- Die neue Einstellung steht in der Sicherungsdatei. Sie verrät eine Vorliebe, keine Personendaten.

## 9. Tests (Vorgaben für Entwicklung und QA)

Alle neuen Funktionen sind rein und ohne DOM prüfbar. Pflicht:

**Einheiten (`tests/einheiten.test.js`, erweitert)**

1. `zuCm(4, 'in')` ist 10,16; `vonCm(2.54, 'in')` ist 1. `standardBezug('in')` ist 4.
2. **Eigenschaftstest:** `vonCm(zuCm(x, e), e) === x` für beide Einheiten über eine Reihe von
   Werten, mit Toleranz für Gleitkomma (R2).
3. `umrechneWert`: leerer Text, `'abc'`, `'12,'` bleiben **unverändert**; `'10'` von cm nach in
   ergibt `'3.94'`; das Ergebnis enthält **nie** ein Komma.
4. Ein Wechsel hin und zurück: `'10'` → in → cm ergibt `'10.01'`. Der Test schreibt den Drift
   ausdrücklich fest, damit er nicht unbemerkt wächst (Abschnitt 4.3).

**Umstellung (`tests/modell-einheit.test.js`, neu)**

5. `einheitUmstellen` rechnet **genau** die Felder aus der Tabelle in Abschnitt 4.2 um. Der Test
   baut Daten mit gefüllten Stückzahlen und prüft, dass `maschenAnzahl`, `nadelstaerkeMm`,
   `maschenProEreignis`, `startReihe`, `anpassung` und `zaehler` **unverändert** bleiben.
6. Eine Probe mit leerer `maschenAnzahl` bekommt `standardBezug` der neuen Einheit, keinen
   umgerechneten Wert (Abschnitt 4.2, Regel 4).
7. `einheitUmstellen` ist seiteneffektfrei: Das übergebene Objekt bleibt unverändert.
8. Mehrere Projekte, mehrere Proben, mehrere Strickstücke mit und ohne Plan werden alle erfasst.

**Darstellung (`tests/format.test.js`, erweitert)**

9. `formatBruch`: 4,5 → „4½"; 4,25 → „4¼"; 4,375 → „4⅜"; 4,0 → „4"; 0,5 → „½"; 0 → „0";
   0,06 → „0" (rundet auf Achtel ab); `NaN` → „–".
10. **Eigenschaftstest:** Der dargestellte Bruch weicht um höchstens 1/16 vom Ausgangswert ab, und
    die Darstellung ist monoton – ein größerer Wert ergibt nie einen kleineren Bruch.
11. `formatLaenge` mit `darstellung: 'dezimal'` liefert **bitgleich** dasselbe wie bisher
    `formatZahl(vonCm(x, e), loc)`. Das ist der Regressionstest für die Zusammenführung der
    sieben Aufrufstellen.
12. `formatLaengeAbweichung`: Vorzeichen bei Bruchdarstellung, „±0" bei gerundet 0.
13. `bruchVorlesbar`: 4,5 → „4 1/2"; 0,5 → „1/2".
14. `darstellungFuer`: `auto` + cm → `dezimal`; `auto` + in → `bruch`; eine eigene Wahl überlebt
    den Einheitenwechsel.

**Sprache (`tests/texte.test.js`, erweitert)**

15. Die Schlüsselmengen von `de` und `en` sind **gleich** – keine fehlenden, keine überzähligen
    (MAS-27 AK3). Der Test nennt die Abweichungen namentlich, nicht nur die Anzahl.
16. Jeder Text, der in `de` einen Platzhalter `{…}` enthält, enthält in `en` **dieselben**
    Platzhalter.
17. Kein Text enthält ein Einheitenkürzel fest („cm", „in") außerhalb der Schlüssel `einheit.*`.
18. `text('en', …)` fällt bei einem unbekannten Schlüssel auf Deutsch zurück, nicht auf den
    Schlüsselnamen.
19. `localeFuer('en')` ist `en-US`.

**Regression (bestehende Tests)**

20. **Alle 311 bestehenden Tests bleiben grün.** Mit Sprache `de`, Einheit `cm` und Darstellung
    `auto` muss die App bitgleich rechnen und anzeigen wie 0.4.0. Die Referenzwerte aus Sprint 1
    bis 4 sind unverändert zu reproduzieren (R7).
21. `tests/sw-liste.test.js`: Versionsnummern in `package.json`, `sw.js` und `js/app.js` gleich,
    `CACHE_NAME` erhöht.

**Im Browser zu prüfen (QA)**

22. Alle Kombinationen aus 2 Sprachen × 2 Einheiten × 3 Darstellungen sind erreichbar; `auto` zeigt
    bei Zoll Brüche und bei cm Dezimalzahlen.
23. **360 × 640 px mit englischen Texten** – Plan-Zusammenfassung, Kurzfassungen der zugeklappten
    Karten und die Zähleransicht ohne Querscrollen (R17, Fortführung von R9/R15).
24. Der Sprachwechsel wirkt sofort, ohne Neuladen, und `document.documentElement.lang` folgt.
25. Nach einem Einheitenwechsel erscheint der Hinweis, und die Werte in den Eingabefeldern sind
    umgerechnet.

## 10. Risiken und Hinweise an den Product Owner

| # | Risiko / Hinweis | Umgang |
|---|---|---|
| **R17** | Englische Texte sind länger und könnten die Mobilansicht sprengen – Fortführung von R9 und R15. | Keine neuen Zeilen, nur Texte; die Übersetzung hält sich kurz, wo der deutsche Text kurz ist. QA misst bei 360 × 640 px in beiden Sprachen (Abschnitt 9, Punkt 23). |
| **R18** | Eine noch installierte **0.4.0** kennt `'in'` nicht, fällt auf `'cm'` zurück und deutet in Zoll gespeicherte Zahlen als Zentimeter. Aus 3,94 in werden 3,94 cm. | Erweiterung von R13, aber ernster: keine verlorenen Felder, sondern **falsche Werte**. Nicht im Code behebbar, ohne 0.4.0 zu ändern. Tritt nur bei zwei Geräten mit unterschiedlichem Stand auf; GitHub Pages liefert allen dieselbe Version. In Abschnitt 3.2 festgehalten, gehört in den CHANGELOG. |
| **R19** | Die Zusammenführung der sieben Anzeigestellen auf zwei Funktionen ist ein Umbau an Code, der heute richtig rechnet. | `formatLaenge` mit dezimaler Darstellung muss bitgleich dasselbe liefern wie bisher (Abschnitt 9, Punkt 11). Kein Rechenweg wird angefasst (R7). |
| **R20** | Der Einheitenwechsel schreibt **alle** Projektdaten um – der erste Schalter in den Einstellungen, der das tut. Ein Fehler darin trifft jedes Projekt gleichzeitig. | Reine Funktion ohne Seiteneffekt, vollständige Feldliste in Abschnitt 4.2, Tests 5 bis 8. Ungültige und leere Eingaben bleiben unverändert. |
| **H5** | **Rundung beim Umrechnen.** Mit zwei Nachkommastellen driftet ein Hin-und-Zurück-Wechsel um 0,01 cm (10 → 3.94 → 10.01). Drei Stellen für Zoll wären exakt, zeigen aber „3.937" im Eingabefeld. | Dieses Dokument legt **zwei** Stellen fest (Abschnitt 4.3). Der Product Owner kann drei wählen, wenn ihm der exakte Rückweg wichtiger ist als lesbare Felder. |
| **H6** | **Dezimaltrenner in umgerechneten Feldern.** Gespeicherte Werte werden mit Punkt geschrieben, damit sie nicht von der Sprache abhängen. Bei deutscher Oberfläche steht nach einem Wechsel „3.94" im Feld statt „3,94". | Beides ist gültige Eingabe (E13). Die Alternative – ein Komma je Sprache – würde gespeicherte Daten von der Spracheinstellung abhängig machen und ist deshalb abgelehnt. Zur Kenntnis. |
| **H7** | **Abweichung in Brüchen verliert Genauigkeit.** Eine Abweichung von 1 mm erscheint bei Zoll als „±0", weil sie unter einem halben Achtel Zoll liegt. | Fachlich vertretbar – 1 mm ist beim Stricken nicht messbar. Wer es genau braucht, stellt die Darstellung auf dezimal. Zur Kenntnis (Abschnitt 5.2). |

**Keine Abweichung vom Datenschutzkonzept aus Sprint 1, Abschnitt 7.** Insbesondere wird
`navigator.language` nicht ausgelesen (Abschnitt 8).
