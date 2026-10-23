# Architekturdokument – Maschenrechner, Sprint 4 (Version 4.1)

**Änderungen in v4.1** (23.10.2026): Hinweis H3 ist entschieden – die Vorbelegung der Startreihe
ist als **E31** festgelegt („leer bedeutet automatisch"), AK1 von MAS-62 ist in Jira berichtigt.
Abschnitt 4.1 war damit von Anfang an der freigegebene Entwurf und bleibt unverändert.

Rolle: Architekt · Grundlage: Epic MAS-60, Stories MAS-57, MAS-58, MAS-62, MAS-59; Entscheidungen E22, E24, E25, E29, E30 · Baut auf `architektur/sprint-3-architektur.md` v3.1 auf. Alles dort Festgelegte gilt weiter, sofern hier nichts anderes steht.

**Die Abschnittsnummern dieses Dokuments sind Teil der Schnittstelle.** Code und Testberichte verweisen darauf („Architektur Sprint 4, Abschnitt 3"). Ältere Dokumente werden nicht umnumeriert.

## 1. Was sich gegenüber Sprint 3 ändert

| Bereich | Sprint 3 | Sprint 4 |
|---|---|---|
| Erlaubte Reihen im Plan | feste Regeln: ab Reihe 2, mit „jede 2." ungerade ab 3 | **Startreihe ist Eingabe** (MAS-62); leer bedeutet „automatisch" und ergibt genau das bisherige Verhalten |
| Plan-Ereignisse | `{ reihe, maschen }` | zusätzlich **`maschenDanach`** (MAS-58) |
| Kartentitel der Rechner | „Breite in Maschen", „Länge in Reihen" | Titel benennen die **Eingabe** (MAS-57) |
| Strickstück-Ansicht | fünf Karten, immer offen | Karten **klappbar**, Zustand gespeichert (MAS-59) |
| Datenmodell | Schema 3 | **Schema 3 bleibt**, zwei additive optionale Felder (Abschnitt 3) |
| Schlüssel im Speicher | `maschenrechner.daten.v3` | **unverändert** – kein Schemawechsel, keine neue Migration |

**Technologie bleibt unverändert:** PWA, HTML/CSS/Vanilla-JS (ES-Module), kein Build-Schritt, keine Abhängigkeiten, GitHub Pages, `node --test`, localStorage.

**Kein neues Modul.** Die Rechenlogik bleibt in `plan.js` und `ziel.js`, der Klapp-Mechanismus kommt als Helfer in `dom.js`, der Klapp-Zustand als Daten in `modell.js`. Damit bleibt `APP_DATEIEN` in `sw.js` unverändert und `tests/sw-liste.test.js` braucht nur die neue Versionsnummer.

## 2. Dateistruktur (geändert: ✎)

```text
maschenrechner/
├── index.html            ✎ Startreihe in der Plan-Karte; Karten der Strickstück-Ansicht als <details>
├── sw.js                 ✎ CACHE_NAME 'maschenrechner-v0.4.0' (keine neuen Dateien)
├── package.json          ✎ version 0.4.0
├── css/style.css         ✎ <summary> als Kartenkopf, Kurzfassung im zugeklappten Zustand
├── js/
│   ├── app.js            ✎ APP_VERSION '0.4.0'
│   ├── plan.js           ✎ erlaubteReihen(…, startReihe), maschenDanach je Ereignis
│   ├── ziel.js              (unverändert – siehe Abschnitt 4.3)
│   ├── eingabe.js        ✎ neue Regel `startReihe`
│   ├── texte.js          ✎ Kartentitel, Startreihe, Ereigniszeile mit Maschenzahl, Klapp-Beschriftungen
│   ├── modell.js         ✎ plan.startReihe, stueck.eingeklappt; pruefeDaten ergänzt
│   ├── sicherung.js         (unverändert – die neuen Felder reisen im Datenmodell mit)
│   ├── migration.js         (unverändert – kein Schemawechsel)
│   ├── dom.js            ✎ neu `klappbar(bereich, { offen, aufToggle })`
│   └── ansichten/
│       ├── strickstueck.js  ✎ Karten klappbar machen, Kurzfassung je Karte
│       ├── plankarte.js     ✎ Feld Startreihe, Maschenzahl in der Ereigniszeile, Listen-Schlüssel
│       └── zaehler.js       ✎ Maschenzahl in den drei Ereigniseinträgen
└── tests/
    ├── plan.test.js         ✎ Startreihe, maschenDanach, Eigenschaftstests, Regressionsfälle
    ├── modell-v3.test.js    ✎ Vorbelegung und Reparatur der neuen Felder
    ├── sicherung-v3.test.js ✎ Rundreise mit und ohne die neuen Felder
    └── ziel.test.js         ✎ maschenDanach in den Ereigniseinträgen
```

**Abhängigkeiten unverändert, keine Zyklen.** `plan.js` und `ziel.js` bleiben rein: kein DOM, kein Speicher, keine Ausnahmen.

## 3. Datenmodell: Schema 3 wird erweitert, nicht ersetzt

Beide neuen Felder sind **optional und additiv**. Ihr Fehlen hat eine festgelegte Bedeutung, deshalb braucht es keinen Schemawechsel, keinen neuen Schlüssel und keine Migration:

| Feld | Ort | Typ | Fehlt bedeutet |
|---|---|---|---|
| `startReihe` | `stueck.plan` | Text (wie alle Planfelder) | leer – „automatisch", siehe Abschnitt 4.1 |
| `eingeklappt` | `stueck` | Objekt `{ kartenName: boolean }` | alle Karten offen |

`eingeklappt` ist ein **Objekt mit Kartennamen als Schlüsseln**, keine Liste: So überlebt der Zustand das Umsortieren und Umbenennen von Karten, und ein fehlender Schlüssel bedeutet verlässlich „offen". Erlaubte Schlüssel sind die vier Namen aus `RECHNER_NAMEN` und `'plan'`; `pruefeDaten` verwirft unbekannte Schlüssel still und ersetzt Nicht-Booleans durch `false`.

`startReihe` bleibt **Text**, wie alle Planfelder (Sprint 1, Abschnitt 4.5): Halbfertige Eingaben überleben so das Speichern.

**Rückwärts- und Vorwärtskompatibilität.** Eine Sicherung aus 0.3 wird unverändert eingelesen; die Felder fehlen und bedeuten das Bisherige. Umgekehrt kann eine noch installierte 0.3.0 Daten lesen, die 0.4.0 geschrieben hat: Sie ignoriert die beiden Felder und rechnet wie vorher. Das ist kein Zufall, sondern der Grund für den additiven Entwurf (Risiko R13).

## 4. Zu-/Abnahmeplan

### 4.1 Startreihe (MAS-62)

`erlaubteReihen` bekommt einen dritten Parameter:

```text
erlaubteReihen(reihen, jedeZweite, startReihe)

startReihe == null  →  Standard: jedeZweite ? 3 : 2

ohne jedeZweite:  erlaubt sind startReihe … reihen−1
                  anzahl = max(0, reihen − startReihe)
                  reihe(platz) = startReihe + platz

mit jedeZweite:   erlaubt sind startReihe, startReihe+2, … ≤ reihen−1
                  letzte = reihen − 1
                  anzahl = letzte >= startReihe ? floor((letzte − startReihe) / 2) + 1 : 0
                  reihe(platz) = startReihe + 2 · platz
```

**Der Standard hängt von `jedeZweite` ab, und das ist die Korrektur an MAS-62 AK1.** Dort steht „Vorbelegt ist 2 – das ist genau das heutige Verhalten". Das stimmt nur ohne „jede 2. Reihe/Runde": Mit eingeschalteter Option beginnt das heutige Verhalten bei Reihe **3**, nicht 2. Eine feste Vorbelegung 2 würde die Ereignisse dort auf gerade Reihen legen und damit sowohl das bisherige Verhalten als auch die fachliche Begründung aus E25 brechen – Zu-/Abnahmen gehören beim gewendeten Stricken auf Hinreihen.

Deshalb: **Das Feld ist leer vorbelegt und bedeutet „automatisch".** Die Oberfläche nennt im Platzhalter und im Feldhinweis die Reihe, die sich daraus ergibt („automatisch: Reihe 3"). Das folgt der bestehenden Konvention für `nadel` und `anpassung` (`leerErlaubt` in `eingabe.js`) und löst zwei Dinge auf einmal:

- **MAS-62 AK9 (Regressionsschutz)** gilt ohne Sonderfall, auch mit eingeschalteter Option.
- **MAS-62 AK7 (Übernahme aus 0.3)** braucht keine Migration: Das fehlende Feld ist dasselbe wie das leere Feld.

Setzt die Nutzerin einen eigenen Wert, gilt er unverändert – auch wenn daraus gerade Reihen werden. Das ist gewollt: Sie hat ausdrücklich um diese Kontrolle gebeten, und die Parität folgt ab dann ihrer Wahl, nicht einer festen Regel.

**Neue Prüfregel** in `eingabe.js`:

```text
startReihe: { ganzzahl: true, positiv: true, max: 99999, leerErlaubt: true, leerWert: null }
```

`positiv: true` erlaubt ab Reihe 1 und schließt 0 und negative Werte aus. Die obere Grenze deckt sich mit `ganzPositiv` und dem Reihenzähler.

**Kein neuer Fehlercode.** Ist die Startreihe größer als `reihen − 1`, liefert `erlaubteReihen` die Anzahl 0, und der bestehende Pfad greift: `status: 'fehler'`, `fehler: 'ZU_WENIG_REIHEN'`, `moeglich: 0`. Der Text dafür existiert bereits als `plan.fehler.ZU_WENIG_REIHEN.keine`. Damit ist MAS-62 AK3 erfüllt, ohne neue Zustände einzuführen.

**E24 wird dadurch halb zur Vorbelegung.** Die erste Reihe bleibt nur noch im Standardfall frei; die **letzte** Reihe bleibt in jedem Fall frei, weil `letzte = reihen − 1` unverändert gilt. Der Eintrag in `docs/entscheidungen.md` ist beim Umsetzen nachzuziehen – so steht es auch in der Definition of Done von MAS-60.

### 4.2 Maschenzahl je Ereignis (MAS-58)

Jedes Ereignis bekommt ein drittes Feld:

```text
ereignisse[i] = { reihe, maschen, maschenDanach }
maschenDanach = anfang + vorzeichen · proEreignis · (i + 1)
```

Berechnet wird das in derselben Schleife, die die Liste aufbaut – kein zweiter Durchlauf, keine zusätzliche Liste.

**Die Invariante ist beweisbar, nicht nur geprüft.** Nach der Wahl gilt `anzahlEreignisse · proEreignis = |ende − anfang|`, also ist `maschenDanach` des letzten Ereignisses genau `ende`. Das macht MAS-58 AK3 zu einer Eigenschaft, die ein Test an beliebigen Eingaben nachrechnen kann (Abschnitt 7).

**Bezug ist `anfang`, nicht `anfangGerundet`** – also der Wert **nach** der Anpassung aus US-16. Damit wirkt MAS-58 AK5 ohne Zusatzaufwand: Ändert sich die Anpassung, ändern sich alle Maschenzahlen mit.

### 4.3 `ziel.js` bleibt unverändert

`ereignisseUm` gibt die Ereignisobjekte **durch**, ohne sie umzubauen. `maschenDanach` steht damit in `letzte`, `jetzt`, `naechste` und `uebernaechste` automatisch zur Verfügung, und MAS-58 AK2 ist ohne Änderung an der Zielschicht erfüllt. Das ist eine Folge der Trennung aus Sprint 3 und ausdrücklich erwünscht: `ziel.js` soll nichts über den inneren Aufbau eines Ereignisses wissen müssen.

## 5. Oberfläche

### 5.1 Kartentitel der Rechner (MAS-57)

Geändert werden ausschließlich zwei Texte in `js/texte.js`:

| Schlüssel | alt | Vorschlag neu |
|---|---|---|
| `rechner.breiteZuMaschen.titel` | Breite in Maschen | **Aus Breite ({einheit}) → Maschen** |
| `rechner.laengeZuReihen.titel` | Länge in Reihen | **Aus Länge ({einheit}) → Reihen** |

Die Einheit kommt aus der Einstellung, der Text enthält also `{einheit}` wie die übrigen Beschriftungen – damit bleibt US-24 (Zoll) vorbereitet. Kein Code, keine Struktur, kein Test außer dem Vollständigkeitstest der Texte ist betroffen.

**Die endgültige Formulierung bestätigt die Enduserin** (MAS-57 AK4); der Vorschlag hier ist der des Product Owners. Die Titel der beiden anderen Rechner bleiben unverändert, dort wird tatsächlich eine Maschen- bzw. Reihenzahl eingegeben.

### 5.2 Plan-Karte: Startreihe

Das Feld steht in der Gruppe der Arbeitsweise, direkt **über** dem Schalter „nur jede 2. Reihe/Runde", weil der Schalter den Standard verändert:

```text
Erste Reihe mit Zu-/Abnahme   [     ]
leer = automatisch: Reihe 3

☐ Nur jede 2. Reihe/Runde
   Dann nur jede zweite Reihe ab der Startreihe.
```

Der Hinweis unter dem Feld nennt die Reihe, die sich gerade aus dem Standard ergibt, und aktualisiert sich beim Umschalten. Bei Arbeitsweise „Runden" heißt die Beschriftung „Erste Runde mit Zu-/Abnahme".

Der bestehende Hinweis am Schalter („Dann nur in ungeraden Reihen bzw. Runden, ab Reihe 3.") wird angepasst: Die Parität ist nicht mehr fest, sondern folgt der Startreihe.

### 5.3 Ereigniszeile mit Maschenzahl

Die bestehenden Texte werden um einen Platzhalter erweitert, statt neue Schlüssel einzuführen:

```text
plan.zeileReihe   'Reihe {reihe}: {pro} M {art} → {danach} M'
plan.zeileRunde   'Runde {reihe}: {pro} M {art} → {danach} M'
```

Im Zähler stehen die drei Einträge entsprechend als „Reihe 22: −2 M → 48 M".

**Ein leicht zu übersehender Punkt:** `plankarte.js` baut die Liste nur neu auf, wenn sich ein Schlüssel aus `reihe` und `maschen` geändert hat (heute Zeile 134). `maschenDanach` muss in diesen Schlüssel aufgenommen werden – sonst bleibt die Liste stehen, wenn sich nur die Anfangsmaschen ändern, denn dann bleiben Reihen und Maschen pro Ereignis gleich.

### 5.4 Klappbare Karten (MAS-59)

**Umgesetzt mit `<details>` und `<summary>`**, nicht mit eigenen Knöpfen und `aria-expanded`. Begründung: Tastaturbedienung, Fokus und die Ansage des Auf-/Zugeklappt-Zustands kommen vom Browser und sind auf iOS-Safari seit Langem verlässlich. Eigenbau wäre mehr Code und schlechter zugänglich. Der Kartentitel (`<h2>`) wandert in das `<summary>`; `aria-labelledby` der Karte zeigt weiter auf seine Id.

```text
<section class="karte rechner" aria-labelledby="…">
  <details data-karte="…" open>
    <summary>
      <h2 id="…">Aus Breite (cm) → Maschen</h2>
      <span class="kurzfassung" data-rolle="kurzfassung"></span>
    </summary>
    … bisheriger Karteninhalt …
  </details>
</section>
```

Der neue Helfer in `dom.js`:

```text
klappbar(bereich, { offen, aufToggle })
```

Er setzt den Anfangszustand, meldet Änderungen und kennt den Speicher nicht – die Ansicht entscheidet, was damit geschieht. **Dieser Helfer ist die gemeinsame Grundlage aus E30:** US-25 nutzt ihn später für die Probenkarten der Projektansicht, ohne ihn umzubauen. Was US-25 zusätzlich braucht, ist allein die Regel, *wann* automatisch eingeklappt wird – nicht der Mechanismus selbst.

**Kurzfassung im zugeklappten Zustand** (MAS-59 AK5): Die Ansicht füllt `[data-rolle="kurzfassung"]` mit dem Hauptergebnis der Karte – bei den Rechnern „Deine Maschen: 235", bei der Plan-Karte die bestehende Zusammenfassung („17 × 2 M zunehmen"). Ist die Eingabe leer oder ungültig, bleibt die Kurzfassung leer.

**Fehler dürfen nicht verborgen werden** (MAS-59 AK6): Enthält eine Karte einen sichtbaren Eingabefehler, wird sie aufgeklappt und bleibt es, solange der Fehler besteht. Der gespeicherte Zustand wird dabei **nicht** überschrieben – nur die Anzeige weicht ab, bis der Fehler behoben ist.

**Touch-Ziel:** `summary` erhält eine Mindesthöhe von 44 px. Das Dreieck bleibt sichtbar als Zustandsanzeige neben dem Text, Farbe nie allein.

## 6. Datenschutz

Unverändert gegenüber Sprint 1, Abschnitt 7: kein Backend, keine Konten, keine Cookies, keine Tracker, keine externen Schriften oder Bibliotheken. Die Content Security Policy bleibt wie sie ist. Beide neuen Felder sind reine Rechen- bzw. Darstellungsangaben ohne Personenbezug und verlassen das Gerät nur in der Sicherungsdatei, die die Nutzerin selbst teilt. **Keine Abweichung zu begründen.**

## 7. Tests (Vorgaben für Entwicklung und QA)

**`plan.test.js`**

- `erlaubteReihen` mit `startReihe = null`: identisch zum bisherigen Verhalten, **beide** Werte von `jedeZweite`. Das ist der Regressionskern.
- Startreihe 1 (Ereignis in der ersten Reihe), Startreihe = `reihen − 1` (genau ein Platz), Startreihe = `reihen` und größer → `ZU_WENIG_REIHEN` mit `moeglich: 0`.
- Mit `jedeZweite` und gerader Startreihe liegen alle Ereignisse auf geraden Reihen. Das belegt, dass die Parität der Wahl folgt und nicht mehr fest ist.
- **Eigenschaftstests** über zufällige, gültige Eingaben:
  - `maschenDanach` des letzten Ereignisses `=== ende`
  - die Folge der `maschenDanach` ist streng monoton – steigend bei Zunahmen, fallend bei Abnahmen
  - Abstände unterscheiden sich um höchstens 1, mit `jedeZweite` um höchstens 2
  - alle Ereignisreihen liegen zwischen Startreihe und `reihen − 1`
  - gleiche Eingaben ergeben denselben Plan
- **Referenzfall unverändert:** 20 → 34 cm, 45 cm, Probe 25 M / 37 R je 10 cm, 2 M pro Ereignis, Auswahl 84 M → 50 → 84 M, 167 Reihen, 17 Zunahmen; `maschenDanach` dabei 52, 54, … 84.

**`ziel.test.js`** – `ereignisseUm` gibt `maschenDanach` in allen vier Einträgen durch. Zähler-Referenz aus US-15 bei 50 Anfangsmaschen: Reihe 16 → 49 M, Reihe 22 → 47 M, Reihe 25 → 44 M.

**`modell-v3.test.js`** – Vorbelegung von `startReihe` (leer) und `eingeklappt` (leeres Objekt); `pruefeDaten` verwirft unbekannte Kartennamen, ersetzt Nicht-Booleans und lässt gültige Zustände unberührt.

**`sicherung-v3.test.js`** – Rundreise mit beiden neuen Feldern; das Einlesen einer 0.3-Sicherung **ohne** sie ergibt denselben Plan wie vorher.

**`texte.test.js`** – Vollständigkeit für die neuen Schlüssel.

**`sw-liste.test.js`** – greift unverändert und erzwingt dieselbe Versionsnummer in `package.json`, `sw.js` und `js/app.js`.

**Browser (QA):** Zähleransicht auf 360 × 640 px ohne Scrollen **mit** den zusätzlichen Maschenzahlen; Klappen per Tastatur und mit VoiceOver; Kontrast der Kurzfassung ≥ 4,5:1 in Hell und Dunkel; Touch-Ziel des `summary` ≥ 44 px.

## 8. Risiken und Hinweise an den Product Owner

| # | Risiko / Hinweis | Umgang |
|---|---|---|
| R13 | Schema 3 wird erweitert statt ersetzt. Eine noch installierte 0.3.0 liest Daten, die 0.4.0 geschrieben hat. | Nur additive, optionale Felder mit festgelegter Bedeutung bei Abwesenheit. 0.3.0 ignoriert sie und rechnet unverändert. Dafür kein neuer Schlüssel und keine Migration – das Risiko aus R6 und R10 entsteht gar nicht. |
| R14 | Die Startreihe ändert `erlaubteReihen` und damit die Kernformel der Verteilung. | Leeres Feld bedeutet „automatisch" und ergibt bitgleiches Verhalten; alle Referenzwerte aus Sprint 1 bis 3 werden als Regressionstests mitgeführt; die Eigenschaftstests bleiben unverändert gültig. |
| R15 | Mehr Inhalt in der Zähleransicht bei 360 × 640 px (Fortführung von R9). | Die Maschenzahl steht in derselben Zeile wie das Ereignis, kompakt als „→ 48 M"; QA misst. Reicht der Platz nicht, wandert sie in eine zweite Zeile, bevor etwas entfällt. |
| R16 | Eine zugeklappte Karte könnte einen Eingabefehler verbergen. | Karte mit sichtbarem Fehler wird aufgeklappt, solange der Fehler besteht; der gespeicherte Zustand bleibt unberührt (Abschnitt 5.4). |
| H3 | **MAS-62 AK1 war zu berichtigen.** „Vorbelegt ist 2" stimmt nur ohne „jede 2. Reihe/Runde"; mit der Option beginnt das heutige Verhalten bei Reihe 3. | **Erledigt.** Am 23.10.2026 als **E31** entschieden: leeres Feld bedeutet „automatisch" (Abschnitt 4.1). AK1 in Jira berichtigt, abgestimmt mit der Enduserin. |
| H4 | Mit eigener Startreihe können Zu-/Abnahmen auf geraden Reihen liegen, also auf Rückreihen. Fachlich ist das beim gewendeten Stricken unüblich – die Enduserin hat die Hinreihen-Logik selbst eingebracht. | Bewusst zugelassen, weil sie ausdrücklich um die Kontrolle gebeten hat. Ein Hinweis am Feld wäre denkbar; der Product Owner entscheidet, ob er gewünscht ist. |

Neue Risiken beginnen bei **R17**, neue Hinweise bei **H5**.
