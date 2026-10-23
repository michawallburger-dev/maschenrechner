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
| [sprint-4-architektur.md](architektur/sprint-4-architektur.md) | 4.0 | Startreihe der Zu-/Abnahmen, Maschenzahl je Ereignis, klappbare Karten — **entworfen, noch nicht gebaut** |

Der nächste Sprint bekommt `architektur/sprint-5-architektur.md`.

Was unten unter „Was auf jeden Fall gilt" steht, beschreibt den **ausgelieferten** Stand 0.3.0.
Sprint 4 ändert davon zwei Dinge, sobald er gebaut ist: Die Startreihe des Plans wird einstellbar
(dann ist „erste Reihe bleibt frei" nur noch eine Vorbelegung), und Schema 3 bekommt zwei
optionale Felder, ohne Schemawechsel.

## Was auf jeden Fall gilt

Die Festlegungen, die über alle Sprints tragen — Einzelheiten jeweils im genannten Dokument:

- **Schlanke PWA**, HTML/CSS/Vanilla-JavaScript mit ES-Modulen, **kein Build-Schritt**, keine
  Abhängigkeiten, keine externen Ressourcen. Hosting auf GitHub Pages. (Sprint 1, Abschnitt 1)
- **Fachlogik strikt von der Oberfläche getrennt**, als reine Funktionen: kein DOM, kein
  Speicherzugriff, keine Ausnahmen, Eingaben werden nicht verändert; IDs und Zeitstempel übergibt
  der Aufrufer. Deshalb sind 224 Tests ohne Testframework und ohne Browser möglich.
  (Sprint 1, Abschnitt 3.1)
- **Kaufmännische Rundung** als verbindliche Regel, gegen Gleitkommafehler abgesichert.
  (Sprint 1, Abschnitt 3.2)
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
| R4 | Beim Einheitenwechsel (US-24) müssen gespeicherte Längen umgerechnet werden. | Wird mit US-24 umgesetzt. | Sprint 1 |
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
| R13 | Schema 3 wird erweitert statt ersetzt. Eine noch installierte 0.3.0 liest Daten, die 0.4.0 geschrieben hat. | Nur additive, optionale Felder mit festgelegter Bedeutung bei Abwesenheit; kein neuer Schlüssel, keine Migration. | Sprint 4, Abschnitt 3 |
| R14 | Die einstellbare Startreihe ändert `erlaubteReihen` und damit die Kernformel der Verteilung. | Leeres Feld bedeutet „automatisch" und ergibt bitgleiches Verhalten; alle Referenzwerte aus Sprint 1 bis 3 als Regressionstests. | Sprint 4, Abschnitt 4.1 |
| R15 | Mehr Inhalt in der Zähleransicht bei 360 × 640 px – Fortführung von R9. | Maschenzahl in derselben Zeile, kompakt als „→ 48 M"; QA misst. | Sprint 4, Abschnitt 5.3 |
| R16 | Eine zugeklappte Karte könnte einen Eingabefehler verbergen. | Karte mit Fehler klappt auf, solange der Fehler besteht; der gespeicherte Zustand bleibt unberührt. | Sprint 4, Abschnitt 5.4 |
| H3 | MAS-62 AK1 („vorbelegt ist 2") stimmt nur ohne „jede 2. Reihe/Runde". | Entscheidung des Product Owners nötig; ohne sie ist AK9 nicht erfüllbar. | Sprint 4, Abschnitt 4.1 |
| H4 | Mit eigener Startreihe können Zu-/Abnahmen auf Rückreihen liegen, was beim gewendeten Stricken unüblich ist. | Bewusst zugelassen, weil die Enduserin um diese Kontrolle gebeten hat. | Sprint 4, Abschnitt 8 |

Neue Risiken beginnen bei **R17**, neue Hinweise bei **H5**.

## Verteilung der Zu- und Abnahmen

Die Kernformel, weil sie fachlich am leichtesten falsch wird — vollständig in
[Sprint 3, Abschnitt 4](architektur/sprint-3-architektur.md):

- Erste und letzte Reihe bleiben frei (E24, **vorläufig**).
- „Nur jede 2. Reihe/Runde": nur ungerade Reihen bzw. Runden ab 3 (E25).
- Ereignis *i* (0 … E−1) liegt auf dem Platz `floor((i+1)·(n+1)/(E+1)) − 1` der *n* erlaubten
  Reihen. Nur Ganzzahl-Arithmetik, keine Liste der Länge *n* — damit kosten auch sehr lange Teile
  keinen Speicher.

## Offene Befunde

- **MAS-46** (S2-09): Doppelte 64-stellige IDs in einer Sicherung ergeben eine zu lange Ersatz-ID.
  Einziger offener Fehler.
