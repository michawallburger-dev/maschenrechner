# Architektur Maschenrechner – Übersicht

Diese Datei ist der Wegweiser. Die verbindliche Architektur steht in den Sprint-Dokumenten unter
[docs/architektur/](architektur/); jedes baut auf dem vorherigen auf („Alles dort Festgelegte gilt
weiter, sofern hier nichts anderes steht"). **Der Code verweist auf deren Abschnittsnummern**, zum
Beispiel „Architektur Sprint 3, Abschnitt 4" in `js/plan.js` — deshalb werden die Dokumente nicht
umgeschrieben, sondern je Sprint fortgeschrieben.

| Dokument | Version | Stand |
|---|---|---|
| [sprint-1-architektur.md](architektur/sprint-1-architektur.md) | 1.2 | Grundlage: Technologiewahl, Rechenlogik, Eingabeprüfung, Datenschutzkonzept, Offline |
| [sprint-2-architektur.md](architektur/sprint-2-architektur.md) | 2.0 | Schema 2, Projekte und Strickstücke, Zähler, Sicherung, Hash-Routing |
| [sprint-3-architektur.md](architektur/sprint-3-architektur.md) | 3.1 | Schema 3, Proben je Strickstück, Zu-/Abnahmeplan, Ziel im Zähler — **ausgeliefert als 0.3.0** |
| [sprint-4-architektur.md](architektur/sprint-4-architektur.md) | 4.3 | Startreihe der Zu-/Abnahmen, Maschenzahl je Ereignis, klappbare Karten — **ausgeliefert als 0.4.0** |
| [sprint-5-architektur.md](architektur/sprint-5-architektur.md) | 5.3 | Englische Oberfläche, Längeneinheit Zoll, Zahlendarstellung dezimal oder Bruch — **ausgeliefert als 0.5.0** |
| [sprint-6-architektur.md](architektur/sprint-6-architektur.md) | 6.0 | Tausendertrenner entfällt, Brucheingabe, Rundung auf Muster, erste Zu-/Abnahme genau in einer Reihe — **entworfen, noch nicht gebaut** |

Der nächste Sprint bekommt `architektur/sprint-7-architektur.md`.

Was unten unter „Was auf jeden Fall gilt“ steht, beschreibt den **ausgelieferten** Stand 0.5.0.
Sprint 6 ändert davon zwei Dinge, sobald er gebaut ist: Die kaufmännische Rundung auf eine ganze
Zahl ist nur noch die Vorbelegung — je Strickstück lässt sich auf eine gerade Zahl oder ein
Vielfaches von n mit Versatz m runden (E37). Und in Längenfeldern sind neben Dezimalzahlen auch
Brüche gültige Eingaben („4 1/2“, „4½“), während der Tausendertrenner aus E13 entfällt (E38).
Schema 3 bekommt dafür zwei weitere optionale Felder, ohne Schemawechsel.

## Was auf jeden Fall gilt

Die Festlegungen, die über alle Sprints tragen — Einzelheiten jeweils im genannten Dokument:

- **Schlanke PWA**, HTML/CSS/Vanilla-JavaScript mit ES-Modulen, **kein Build-Schritt**, keine
  Abhängigkeiten, keine externen Ressourcen. Hosting auf GitHub Pages. (Sprint 1, Abschnitt 1)
- **Fachlogik strikt von der Oberfläche getrennt**, als reine Funktionen: kein DOM, kein
  Speicherzugriff, keine Ausnahmen, Eingaben werden nicht verändert; IDs und Zeitstempel übergibt
  der Aufrufer. Deshalb sind 393 Tests ohne Testframework und ohne Browser möglich.
  (Sprint 1, Abschnitt 3.1)
- **Kaufmännische Rundung** als verbindliche Regel, gegen Gleitkommafehler abgesichert.
  (Sprint 1, Abschnitt 3.2) Mit Sprint 6 kommt eine **einstellbare Musterrundung** darüber: gerade
  Zahl oder Vielfaches von n mit Versatz m, je Strickstück, Vorbelegung „keine". Ohne Regel rechnet
  sie bitgleich wie bisher. (Sprint 6, Abschnitte 5.1 und 5.2)
- **Datenschutz nach DSGVO:** kein Backend, keine Konten, keine Cookies, keine Tracker, keine
  externen Schriften oder Bibliotheken, keine Analytics. Eine Content Security Policy erzwingt das
  technisch. Abweichungen sind ausdrücklich zu begründen; derzeit gibt es keine.
  (Sprint 1, Abschnitt 7)
- **Offline:** Der Service Worker legt alle App-Dateien bei der Installation vorab ab. Bei jeder
  Version `CACHE_NAME` in `sw.js` erhöhen und neue Dateien in `APP_DATEIEN` eintragen;
  `tests/sw-liste.test.js` erzwingt beides und prüft, dass die Versionsnummern in `package.json`,
  `sw.js` und `js/app.js` übereinstimmen. (Sprint 1, Abschnitt 6)
- **Datenerhalt beim Schemawechsel:** Ältere Daten werden in einen **neuen** Schlüssel übernommen,
  die alten bleiben unverändert; Beschädigtes wird repariert oder aufbewahrt, nie still verworfen;
  vor jedem Import eine Sicherheitskopie. (Sprint 2, Abschnitt 3; Sprint 3, Abschnitte 6.1–6.4)
- **Barrierefreiheit nach WCAG 2.1 AA** und mobile Bedienbarkeit: Touch-Ziele mindestens
  44 × 44 px, Zähler ohne Scrollen auf 360 × 640 px, Screenreader-Ansagen sparsam.
  (Sprint 1, Abschnitte 5.3 und 5.4)

Gespeichert wird in `localStorage` unter `maschenrechner.daten.v3`; die Stände aus 0.2
(`maschenrechner.daten.v2`) und 0.1 (`maschenrechner.zustand`) bleiben unverändert liegen, dazu
`…v3.defekt` und `…v3.vorImport`.

## Risikoregister

**R-Nummern sind Risiken, keine Regeln** — der Code verweist darauf, weil er die jeweilige
Gegenmaßnahme umsetzt. H-Nummern sind Hinweise an den Product Owner. R1 wird in allen drei Sprints
mitgeführt.

| # | Risiko / Hinweis | Umgang | Quelle |
|---|---|---|---|
| R1 | Safari löscht die Daten nach 7 Tagen ohne Nutzung, wenn die App nicht installiert ist. | Empfehlung in der README, die App zu installieren und regelmäßig zu sichern (US-12). | Sprint 1–3 |
| R2 | Gleitkommafehler beim Runden | Verbindliche Regel aus Sprint 1, Abschnitt 3.2, plus Pflicht-Testfall. | Sprint 1 |
| R3 | Datenschutzhinweis bei öffentlicher Nutzung | Als Vorschlag im Backlog. | Sprint 1 |
| R4 | Beim Einheitenwechsel (US-24) müssen gespeicherte Längen umgerechnet werden. | **Eingelöst im Entwurf von Sprint 5, Abschnitt 4.2:** vollständige Liste der betroffenen Felder, reine Funktion `einheitUmstellen`, eigene Tests. | Sprint 1, gelöst Sprint 5 |
| R5 | Wake Lock funktioniert in Home-Bildschirm-Apps erst ab iOS 18.4 (WebKit-Bug 254545). | Einmaliger Hinweis (US-11 AK5). | Sprint 2 |
| R6 | Das Datenmodell wächst, damit steigt das Risiko, beim Laden Daten zu verlieren. | Neuer Schlüssel statt Überschreiben, alter bleibt, Sicherheitskopie vor jedem Import; `pruefeDaten` verwirft nie still ganze Projekte, ein ungültiges Strickstück wird repariert statt gelöscht. | Sprint 2 |
| R7 | `app.js` aus Sprint 1 wird in Ansichten zerlegt (Umbau). | Rechenwege nicht verändern; die Browser-Tests der QA aus Sprint 1 laufen erneut. | Sprint 2 |
| R8 | Teilen wird abgebrochen oder ist im Browser nicht verfügbar. | `AbortError` wird still behandelt, ersatzweise wird heruntergeladen. | Sprint 2 |
| R9 | Platz in der Zähleransicht bei 360 × 640 px | Kompakte Zeilen (18 px), Auswahlfeld nur bei mindestens 2 Zielquellen; QA misst nach. | Sprint 3 |
| R10 | Schemawechsel v2 → v3 | Neuer Schlüssel, alte bleiben, Reparatur statt Verwerfen, Tests für gespeicherte Daten und Sicherungen. | Sprint 3 |
| R11 | Bedeutung des Zählerstands: Die App behandelt ihn als „Reihe, in der ich bin" (US-11). Der Hinweis „Jetzt" erscheint also, wenn der Zähler auf der Ereignisreihe steht. | Vom Product Owner bestätigt (17.10.2026), zusätzlich im Praxistest zu prüfen. | Sprint 3 |
| R12 | Der Plan rechnet bei Änderung von Probe oder Eingaben sofort neu (US-13 AK9) — auch während des Strickens verschieben sich dann die Ereignisreihen. | So gewollt; im Praxistest beobachten. | Sprint 3 |
| H1 | Technische Grenze `ZU_VIELE_EREIGNISSE` | Vom Product Owner bestätigt, Grenze 9999. Die Plan-Liste wird ab 500 Einträgen mit 300 ms Verzögerung und ohne Live-Region aufgebaut. | Sprint 3 |
| H2 | Der Referenzfall im Zähler (−1/−2/−3) kann aus einem US-13-Plan nicht entstehen (gleiche Maschenzahl je Ereignis). | Wird über die reine Funktion `ereignisseUm` getestet; kein Fehler in der Anforderung. | Sprint 3 |

Aus dem Entwurf von Sprint 4 (noch nicht gebaut):

| # | Risiko / Hinweis | Umgang | Quelle |
|---|---|---|---|
| R13 | Schema 3 wird erweitert statt ersetzt. Eine noch installierte 0.3.0 liest Daten, die 0.4.0 geschrieben hat. | Additive, optionale Felder, kein neuer Schlüssel, keine Migration. **Berichtigt nach Befund S4-06:** 0.3.0 liest fehlerfrei, verliert die neuen Felder aber beim nächsten Speichern. Bewusst hingenommen (MAS-68). | Sprint 4, Abschnitt 3 |
| R14 | Die einstellbare Startreihe ändert `erlaubteReihen` und damit die Kernformel der Verteilung. | Leeres Feld bedeutet „automatisch" und ergibt bitgleiches Verhalten; alle Referenzwerte aus Sprint 1 bis 3 als Regressionstests. | Sprint 4, Abschnitt 4.1 |
| R15 | Mehr Inhalt in der Zähleransicht bei 360 × 640 px – Fortführung von R9. | Maschenzahl in derselben Zeile, kompakt als „→ 48 M"; QA misst. | Sprint 4, Abschnitt 5.3 |
| R16 | Eine zugeklappte Karte könnte einen Eingabefehler oder Hinweis verbergen. | Die Kurzfassung zeigt Fehler und Statusmeldungen an, solange sie bestehen; die Karte darf zugeklappt bleiben. Erste Fassung (erzwungenes Aufklappen) war Befund S4-02/S4-03. | Sprint 4, Abschnitt 5.4 |
| H3 | MAS-62 AK1 („vorbelegt ist 2") stimmt nur ohne „jede 2. Reihe/Runde". | **Mit E31 entschieden am 23.10.2026:** Feld leer vorbelegt, leer bedeutet „automatisch". AK1 in Jira berichtigt. | Sprint 4, Abschnitt 4.1 |
| H4 | Mit eigener Startreihe können Zu-/Abnahmen auf Rückreihen liegen, was beim gewendeten Stricken unüblich ist. | Bewusst zugelassen, weil die Enduserin um diese Kontrolle gebeten hat. | Sprint 4, Abschnitt 8 |

Aus dem Entwurf von Sprint 5 (noch nicht gebaut):

| # | Risiko / Hinweis | Umgang | Quelle |
|---|---|---|---|
| R17 | Englische Texte sind länger und könnten die Mobilansicht sprengen – Fortführung von R9 und R15. | Keine neuen Zeilen, nur Texte; die Übersetzung hält sich kurz, wo der deutsche Text kurz ist. QA misst bei 360 × 640 px in beiden Sprachen. | Sprint 5, Abschnitt 6.1 |
| R18 | *(Entschärft am 02.11.2026.)* 0.4.0 kennt den Einheitenwert `in` nicht und würde in Zoll gespeicherte Zahlen als Zentimeter lesen. | **Kann praktisch nicht eintreten:** Es gibt keine Daten in Zoll, keine Synchronisation (E6), und der Service Worker löscht alte Caches beim Aktivieren. Bliebe allein eine von Hand übertragene Sicherungsdatei in ein Gerät, das seit der Veröffentlichung nicht online war. Keine Maßnahme im Code. | Sprint 5, Abschnitt 3.2 |
| R19 | Die sieben Längen-Anzeigestellen werden auf zwei gemeinsame Funktionen zusammengeführt – ein Umbau an Code, der heute richtig rechnet. | `formatLaenge` mit dezimaler Darstellung muss bitgleich dasselbe liefern wie bisher; eigener Regressionstest. Kein Rechenweg wird angefasst (R7). | Sprint 5, Abschnitt 5.2 |
| R20 | Der Einheitenwechsel schreibt **alle** Projektdaten um – der erste Schalter in den Einstellungen, der das tut. Ein Fehler darin trifft jedes Projekt gleichzeitig. | Reine Funktion ohne Seiteneffekt, vollständige Feldliste, vier eigene Tests. Ungültige und leere Eingaben bleiben unverändert. | Sprint 5, Abschnitt 4.2 |
| H5 | **Rundung beim Umrechnen.** *(Entschieden am 02.11.2026 in der Entwicklung.)* Mit zwei Nachkommastellen für Zoll runden Bezugsmaß und Länge beide; die Fehler summieren sich, und der Referenzfall aus Sprint 3 ergibt nach einem Wechsel **166 statt 167 Reihen**. | **Zoll bekommt drei Nachkommastellen**, cm behält zwei. Damit bleibt der Referenzfall bei 167 und der Weg zurück nach cm ist exakt. Preis: Im Eingabefeld steht 3.937 statt 3.94. | Sprint 5, Abschnitt 4.3 |
| H6 | **Dezimaltrenner in umgerechneten Feldern.** Gespeicherte Werte werden mit Punkt geschrieben, damit sie nicht von der Sprache abhängen – bei deutscher Oberfläche steht dann 3.94 im Feld. | Beides ist gültige Eingabe (E13). Ein Komma je Sprache würde gespeicherte Daten von der Spracheinstellung abhängig machen und ist abgelehnt. | Sprint 5, Abschnitt 4.2 |
| H7 | **Abweichung in Brüchen verliert Genauigkeit.** 1 mm erscheint bei Zoll als Null, weil es unter einem halben Achtel Zoll liegt. | Fachlich vertretbar; wer es genau braucht, stellt die Darstellung auf dezimal. | Sprint 5, Abschnitt 5.2 |

Aus dem Entwurf von Sprint 6 (noch nicht gebaut):

| # | Risiko / Hinweis | Umgang | Quelle |
|---|---|---|---|
| R21 | **`inputmode="text"` in sieben Längenfeldern.** Ohne die Umstellung ist die Brucheingabe auf dem iPhone unbenutzbar (keine Taste für Leerzeichen oder Schrägstrich); mit ihr verlieren dieselben Felder den Ziffernblock für die dezimale Eingabe. | Festlegung mit der verworfenen Alternative (Knopfreihe mit Bruchzeichen) und ihrem Preis. QA prüft es auf dem Handy, der **Praxistest entscheidet**, ob es bleibt. | Sprint 6, Abschnitt 4.5 |
| R22 | Eine als **Bruch** gespeicherte Länge ist für 0.5.0 keine Zahl – Fortführung von R13/R18. | Der Ausfall ist **sichtbar**, nicht still: Die ältere Fassung zeigt keinen Wert und rechnet nicht, statt falsch zu rechnen. Derselbe einzige Weg wie bei R18 (von Hand übertragene Sicherungsdatei). Keine Maßnahme im Code. | Sprint 6, Abschnitt 3.3 |
| R23 | **Zwei Pfade zum Plan:** `plankarte.js` und `ziel.js` rechnen denselben Plan getrennt. Wird die Rundungsregel nur im einen durchgereicht, zeigt der Zähler ein anderes Ziel als die Karte. | Beide Aufrufe von `planAusTexten` bekommen die Regel; die Vorgabe `KEINE_RUNDUNG` am neuen Parameter ist nur Schutz gegen stille Bedeutungswechsel, keine Erlaubnis, `ziel.js` auszulassen. Eigener Test. | Sprint 6, Abschnitt 6.2 |
| R24 | Die **Verteilungsformel** wird zum zweiten Mal angefasst (nach R14) – diesmal zusammen mit der Rundung, die die Maschenzahlen ändert. | `verteile` bleibt unverändert; geändert wird nur der Bereich, über den verteilt wird. „Frühestens ab" ist buchstäblich der alte Code. Nachgerechnete Referenzlisten als Pflicht-Testfälle, Breitentest aus Sprint 3 erneut. | Sprint 6, Abschnitt 6.2 |
| H8 | **Sechzehntel werden angenommen, aber als Achtel angezeigt.** Wer „3/16" eingibt, liest „¼"; im Feld bleibt „3/16" stehen. | Dieselbe bewusste Unschärfe wie H7 – gerechnet wird mit dem genauen Wert, nur die Anzeige rundet (E32). Zur Kenntnis. | Sprint 6, Abschnitt 4.4 |
| H9 | **Mit Rapport liegen die Endmaschen-Angebote weiter auseinander.** Bei Rapport 4 und 5 Maschen je Zu-/Abnahme sind es 70 oder 90 Maschen, weil dazwischen keine Zahl beide Bedingungen erfüllt. | Unvermeidlich. E28 wird damit **sichtbarer** als geplant: häufiger und mit größeren Sprüngen. Mögliche Folgestory: die passende Maschenzahl je Zu-/Abnahme vorschlagen. | Sprint 6, Abschnitt 6.1 |
| H10 | **Der erste Abstand kann aus der Spanne fallen**, z. B. „alle 6–59 Reihen" bei „erste genau in Reihe 60". | Der Product Owner hat vorgeschlagen, es so zu lassen (MAS-63, offener Punkt 1); der Entwurf folgt dem. Alternative, falls es im Praxistest stört: Spanne nur über die Ereignisse nach dem ersten. | Sprint 6, Abschnitt 6.3 |
| H11 | **Die Brucheingabe ist nirgends angekündigt.** Dass „4 1/2" geht, erfährt die Nutzerin nur aus dem Versuch oder der Fehlermeldung. | Bewusst kein dauerhafter Hinweis unter sieben Feldern (R9). Die Meldung `KEIN_BRUCH` nennt die Form. Der Praxistest zeigt, ob das genügt. | Sprint 6, Abschnitt 4.4 |

Neue Risiken beginnen bei **R25**, neue Hinweise bei **H12**.

## Verteilung der Zu- und Abnahmen

Die Kernformel, weil sie fachlich am leichtesten falsch wird — vollständig in
[Sprint 3, Abschnitt 4](architektur/sprint-3-architektur.md):

- **Die letzte Reihe bleibt frei** – das ist fest (E24, bestätigt am 22.10.2026). Am Anfang ist die
  freie Reihe seit 0.4.0 nur noch eine **Vorbelegung**: Das Feld ist leer, und leer bedeutet
  automatisch – Reihe 2, mit der Option „nur jede 2.“ Reihe 3 (E31,
  [Sprint 4, Abschnitt 4.1](architektur/sprint-4-architektur.md)).
- Mit der Option liegen die Ereignisse in jeder zweiten Reihe **ab der Startreihe**. Die feste Regel
  aus E25 (ungerade Reihen ab 3) ist mit E31 **entfallen** und ergibt sich nur noch als Folge der
  Vorbelegung.
- Ereignis *i* (0 … E−1) liegt auf dem Platz `floor((i+1)·(n+1)/(E+1)) − 1` der *n* erlaubten
  Reihen. Nur Ganzzahl-Arithmetik, keine Liste der Länge *n* — damit kosten auch sehr lange Teile
  keinen Speicher.
- Der Entwurf von Sprint 6 stellt daneben die zweite Bedeutung „**erste genau in** Reihe s“
  (MAS-63): Das erste Ereignis liegt in s, die übrigen E−1 werden mit **derselben** Formel über die
  erlaubten Reihen **nach** s verteilt. `verteile` selbst bleibt unverändert; nur der Bereich
  ändert sich ([Sprint 6, Abschnitt 6.2](architektur/sprint-6-architektur.md)).
- Ebenfalls aus Sprint 6: Bei aktiver Rundungsregel folgt die **Auswahl der Endmaschenzahl** (E28)
  der Schrittweite `kgV(n, maschenProEreignis)` statt `maschenProEreignis`, damit beide Angebote im
  Muster bleiben. Ohne Regel ist das dieselbe Rechnung wie bisher
  ([Sprint 6, Abschnitt 6.1](architektur/sprint-6-architektur.md)).

## Offene Befunde

- **MAS-46** (S2-09): Doppelte 64-stellige IDs in einer Sicherung ergeben eine zu lange Ersatz-ID.
- **MAS-69 bis MAS-72** (S4-07 bis S4-10, QA-Nachtest Sprint 4): vier niedrige bzw. kosmetische
  Befunde, bewusst nicht in 0.4.0 behoben. Der gewichtigste ist **MAS-69**: Eine zugeklappte
  Plan-Karte verbirgt den eigenen Hinweis auf die fehlende Maschenprobe, weil `problemText()` nur
  `.fehler` und die Statusmeldung kennt. Damit ist der Zweck von US-38 AK6 noch nicht ganz
  erfüllt. Nicht in Sprint 5 (E36).
- **MAS-76 und MAS-78** (QA Sprint 5): niedrig, nicht in Sprint 6 (E39). **MAS-77** (S5-06,
  Tausendertrenner) ist dagegen Teil von Sprint 6 und mit E38 entschieden.
