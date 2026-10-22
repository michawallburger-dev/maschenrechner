<!-- Original aus dem Claude-Projekt „Stricken und Häckeln“, dort als qa/sprint-2-testbericht.md geführt.
     Am 22.10.2026 aus dem Word-Export ins Repo übernommen; Inhalt unverändert,
     nur das Format ist jetzt Markdown. QA-Bericht zu v0.2.0. -->

# Testbericht Sprint 2 – „Projekte & Reihenzähler“ (v0.2.0)

Rolle: QA · Stand: 16.10.2026 · Prüfgegenstand: Branch sprint-2, Commit 48174dc Grundlage: Product Backlog v2.1 (US-09 bis US-12, US-26, US-27, MAS-30 bis MAS-33), Architektur Sprint 2 v2.0

**Ergebnis erster Lauf: Zurück an Entwickler** – 1 kritischer Fehler (Datenverlust), 3 mittlere Fehler. **Ergebnis Nachtest (Commit 8f81319): Freigabe** – siehe Abschnitt 7.

## 1. Vorgehen

- Code-Review aller neuen und geänderten Dateien, unabhängig vom Entwicklerbericht
- Automatische Tests: npm test (Node 22, ohne Abhängigkeiten) – 141 Tests, davon 11 neue QA-Tests in tests/qa-sprint2.test.js
- Browsertests mit Chromium (Playwright), mobil 360 × 740 und 390 × 844 px, mit Touch; eigene QA-Skripte zusätzlich zu den Entwicklertests
- Simulationen: Zurück-Geste bei offenem Dialog, langsames Wake Lock, gesperrter Speicher, beschädigte Daten, manipulierte Sicherungsdateien, Offline, Systemwechsel hell/dunkel

**Nicht prüfbar in dieser Umgebung (Praxistest am iPhone nötig):** Teilen-Menü (Dateien, Mail, AirDrop), Dateiauswahl für .json in „Dateien“, Wake Lock in der installierten App (ab iOS 18.4), Update von der installierten 0.1 auf 0.2 inklusive Datenübernahme, VoiceOver.

## 2. Automatische Tests

| **Bereich** | **Tests** | **Ergebnis** |
|---|---|---|
| Rechenlogik, Eingabe (inkl. MAS-30/31), Format, Texte, Einheiten | 54 | ✓ alle grün |
| QA-Akzeptanz Sprint 1 (MAS-30, MAS-31 angepasst) | 16 | ✓ |
| Datenmodell, Migration, Speicher, Sicherung, Zähler, Router, SW-Liste (Entwickler) | 60 | ✓ |
| QA Sprint 2 (qa-sprint2.test.js) | 11 | 10 ✓, 1 als TODO markiert (S2-03) |

Der TODO-Test beschreibt Fehler S2-03. Er lässt npm test nicht scheitern und wird grün, sobald der Fehler behoben ist.

## 3. Testfälle je Akzeptanzkriterium

**US-09 Projekte verwalten**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | Leere App öffnen | Hinweis „Noch keine Projekte“ + Knopf | wie erwartet | ✓ |
| AK1 | Projekte A (01.10.), B (02.10.), dann A ändern | Reihenfolge B, A → A, B | A, B | ✓ |
| AK1 | Zähler in Strickstück von A erhöhen | A rückt nach oben | ✓ | ✓ |
| AK2 | Name leer / nur Leerzeichen | „Bitte einen Namen eingeben.“, nichts angelegt | wie erwartet | ✓ |
| AK2 | Name mit 200 Zeichen | auf 80 gekürzt (Feld: maxlength 80) | 80 | ✓ |
| AK3 | Probe 0, „abc“, leer, 22,5, 22.5 | Fehler bzw. Wert, Dichte „–“ bzw. Zahl | wie Sprint 1 | ✓ |
| AK4 | Garn, Nadel, Beschreibung ändern, neu laden | Werte bleiben | ✓ | ✓ |
| AK4 | Name leeren und Feld verlassen | Fehler, danach alter Name zurück, nicht leer gespeichert | wie erwartet | ✓ |
| AK4 | Nadel „abc“ | Fehlermeldung am Feld | ✓ | ✓ |
| AK5 | Projekt mit 1 Strickstück löschen | Abfrage „„Mein Projekt“ mit 1 Strickstück wird gelöscht …“ | wie erwartet | ✓ |
| AK5 | Abfrage offen, Zurück-Geste, später anderen Dialog bestätigen | nur die neue Aktion wird ausgeführt | **das Projekt wird gelöscht** | ✗ S2-01 |
| AK6 | Schnell zwischen Projekten wechseln, neu laden | keine Eingabe verloren | ✓ | ✓ |

**US-10 Strickstücke verwalten**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | „Strickstück hinzufügen“, Vorschlag „Ärmel links“ | Strickstück mit diesem Namen | ✓ | ✓ |
| AK1 | Leerer Name im Dialog | Fehlermeldung, Dialog bleibt offen | ✓ | ✓ |
| AK2 | Referenz 34/52 – 25/37: 320 M, 55 R, 94 cm, 13,5 cm | 235 M / −0,12 cm; 39 R; 320/235 M; 70/50 R | exakt | ✓ |
| AK2 | 10,2 cm (eigene 25 M/10 cm) | 26 M | 26 | ✓ |
| AK2 | 320 M, Anpassung −2 | 233 M | 233 | ✓ |
| AK2 | Anpassung −235 bei 235 M | Hinweis „weniger als 1“, kein Ergebnis | ✓ | ✓ |
| AK2 | Eingaben in s1, s2 leer | s2 bleibt leer | ✓ | ✓ |
| AK2 | Proben unvollständig | Hinweis „Proben fehlen“ + Link zum Projekt | ✓ | ✓ |
| AK3 | Eigene Probe auf 20 M ändern | s1 und s2: 320 M → 188 M | 188 | ✓ |
| AK4 | Umbenennen, leer umbenennen | neuer Name / Fehlermeldung | ✓ | ✓ |
| AK4 | Löschen mit Abfrage | gelöscht, zurück zum Projekt | ✓ | ✓ |
| AK5 | Zähler auf 1 | Projektansicht „Reihe 1“ | ✓ | ✓ |
| – | „Eingaben zurücksetzen“ | Rechner leer, Zähler bleibt | ✓ | ✓ |

**US-11 Reihenzähler**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | Neues Strickstück | Zähler 0 | 0 | ✓ |
| AK2 | +1-Fläche (390 × 844 px) | ≥ 96 × 96 px | 358 × 321 px; bei 360 px ebenfalls deutlich größer (Screenshot) | ✓ |
| AK2 | −1 und Abstand | kleiner, mit Abstand | 72 × 60 px, 164 px Abstand | ✓ |
| AK3 | −1 bei 0 (mehrfach) | bleibt 0 | 0 | ✓ |
| AK3 | Direkt 99999 / 100000 / −1 / 12,5 / abc / leer | 99999 / Fehler „höchstens 99999“ / „mindestens 0“ / „ganze Zahl“ / „eine Zahl“ / „einen Wert“; gespeicherter Stand bleibt | wie erwartet | ✓ |
| AK3 | „1.000“, „1.234“ | 1000, 1234 | ✓ | ✓ |
| AK3 | 99999, dann +1 | 99999 | 99999 | ✓ |
| AK3 | „abc“ eingegeben, dann +1 | Stand + 1, Fehler weg | 6, Fehler weg | ✓ |
| AK4 | +1, sofort neu laden | Stand erhalten | ✓ (sofort gespeichert) | ✓ |
| AK5 | Kein Wake Lock | einmaliger Hinweis, beim zweiten Mal nicht | ✓ | ✓ |
| AK5 | Zähler öffnen und nach < 0,3 s verlassen (Wake Lock antwortet langsam) | Sperre wieder freigegeben | **Sperre bleibt aktiv** | ✗ S2-02 |
| AK6 | Auf 0 – Abbrechen / OK | bleibt / 0 | ✓ | ✓ |
| AK7 | +1, −1 | Live-Ansage „Reihe n“ | ✓ (siehe Hinweis S2-08) | ✓ |

**US-12 Datensicherung**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | „Daten sichern“ | maschenrechner-sicherung-JJJJ-MM-TT.json, lokales Datum, alle Daten | ✓ (auch 01.01. 00:05 lokal) | ✓ |
| AK2 | Browser ohne Datei-Teilen | Download + Statusmeldung | ✓ | ✓ |
| AK2 | iPhone Teilen-Menü | – | nicht prüfbar | iPhone |
| AK3 | Sicherung einlesen | Abfrage mit Datum, Projekten, Strickstücken; ersetzt alles; vorher Kopie .vorImport | ✓ | ✓ |
| AK3 | Rundreise mit Sonderzeichen („“ <b>) | unverändert, als Text angezeigt | ✓ | ✓ |
| AK4 | Fremde App, kein JSON, abgeschnitten, Format 2, Schema 1, > 2 MB | passende Meldung, nichts verändert | ✓ | ✓ |
| AK4 | Sicherung mit IDs wie „mein projekt“ | Projekt nutzbar | **Projekt lässt sich nicht öffnen** | ✗ S2-03 |
| AK5 | Netzwerkanfragen beim Sichern/Einlesen | keine | keine | ✓ |

**US-26 Farbschema**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | Zahnrad in allen Ansichten | sichtbar, ≥ 48 px (in Einstellungen ausgeblendet) | 48 × 48 px | ✓ |
| AK2 | Dunkel wählen, neu laden | bleibt dunkel | ✓ | ✓ |
| AK2 | System dunkel, Wahl „Hell“ | hell | ✓ | ✓ |
| AK3 | „Wie System“, System wechselt | folgt sofort, theme-color passt | ✓ | ✓ |
| AK4 | Kontraste hell / dunkel | ≥ 4,5:1 | kleinster Wert 6,62 (hell) / 7,22 (dunkel) | ✓ |
| AK5 | Datensicherung in Einstellungen | vorhanden | ✓ | ✓ |

**US-27 Übernahme aus 0.1**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | Referenzzustand 0.1 | „Mein Projekt“ / „Teil 1“, Proben, Nadel 3,5, Rechner und Anpassungen gleich | ✓ | ✓ |
| AK2 | Erster Start | Start im Projekt, Hinweis, „Verstanden“ blendet aus | ✓ | ✓ |
| AK3 | Leerer 0.1-Zustand | leere Projektliste | ✓ | ✓ |
| AK4 | Unlesbarer 0.1-Zustand | alte Daten unverändert | ✓ | ✓ |
| – | Zweiter Start | keine zweite Übernahme | ✓ | ✓ |
| – | Gespeicherte 0.2-Daten beschädigt | Hinweis für die Nutzerin | **leere Liste ohne Hinweis** | ✗ S2-04 |

**Bugs aus Sprint 1**

| **Jira** | **Prüfung** | **Ergebnis** |  |
|---|---|---|---|
| MAS-30 | „1.000“ in Maschen laut Anleitung / Zähler → 1000; in cm-Feld → 1 | wie E13 | ✓ |
| MAS-31 | „12,“ tippen → keine Meldung; Feld verlassen → „Bitte die Zahl vervollständigen“ | ✓ | ✓ |
| MAS-32 | Live-Bereiche: Strickstück nur die 4 Hauptergebnisse (+2 Statusmeldungen, meist ausgeblendet); Projekt 0 sichtbare | ✓ | ✓ |
| MAS-33 | cache: 'reload' beim Installieren, Cache maschenrechner-v0.2.0, alte Caches gelöscht | ✓ | ✓ |

## 4. Querschnittsprüfungen

**Datenschutz** ✓

- Keine Anfragen an fremde Adressen (alle Ansichten, Sichern, Einlesen, offline/online)
- CSP unverändert streng; kein innerHTML, kein Inline-Code; Werte nur über textContent/value
- Keine Cookies, keine Tracker; Daten nur in localStorage; Sicherung verlässt das Gerät nur durch die Nutzerin; Warnhinweis vorhanden

**Offline** ✓ – nach erstem Aufruf kontrolliert der Service Worker die Seite; offline öffnen Liste, Projekt und Zähler. Der Test sw-liste stellt sicher, dass keine Datei im Cache fehlt.

**Mobil** ✓ – 360 und 390 px: kein waagrechtes Scrollen in allen fünf Ansichten, keine Bedienelemente unter 44 × 44 px. Lange Namen: siehe S2-06.

**Barrierefreiheit** ✓ mit Einschränkungen

- Überschrift erhält nach jedem Ansichtswechsel den Fokus, Seitentitel passt
- Alle Felder beschriftet, Fehler über aria-describedby, aria-invalid
- Farbschema als echte Radiogruppe mit sichtbarem Fokus
- Zähler-Knöpfe mit sprechenden Namen („Eine Reihe weiter“)
- Dialoge mit Titel und Beschreibung
- VoiceOver nur am iPhone prüfbar

**Robustheit** ✓ – gesperrter Speicher: Hinweis, App bleibt bedienbar; voller Speicher: Hinweis statt Absturz; keine JavaScript-Fehler in allen Läufen.

## 5. Gefundene Fehler

| **#** | **Schwere** | **Befund** | **Nachstellen** | **Vorschlag** |
|---|---|---|---|---|
| **S2-01** | **Kritisch** | Eine nicht beantwortete Sicherheitsabfrage „lebt weiter“. Wird bei offener Abfrage die Ansicht gewechselt (Zurück-Geste, Hash-Wechsel), schließt zeigeAnsicht den Dialog, das Versprechen von bestaetigen() wird aber nie aufgelöst und seine Klick-Handler bleiben am OK-Knopf. Beim nächsten Dialog führt OK **beide** Aktionen aus. | Projekt → „Projekt löschen“ → Zurück-Geste → Strickstück → „Eingaben zurücksetzen“ → OK ⇒ **das ganze Projekt ist gelöscht**. Betrifft auch frageName(). | In dom.js auf das close-Ereignis des Dialogs hören und dann mit false bzw. null auflösen (Handler entfernen). Zusätzlich Test im Browser. |
| **S2-02** | Mittel | Wake-Lock-Wettlauf: beenden() vor Antwort von navigator.wakeLock.request() → die später gelieferte Sperre wird gespeichert und nie freigegeben. Der Bildschirm bleibt dann auch in anderen Ansichten an (Akku). | Zähler öffnen und sofort „Zurück“ (Wake Lock antwortet in 0,3 s): aktive Sperren 1, nach erneutem Öffnen 2. | In anfordern() nach dem await prüfen, ob noch gewuenscht; sonst sofort release(). Vor neuer Anforderung prüfen, ob schon eine Sperre aktiv ist. |
| **S2-03** | Mittel | pruefeDaten übernimmt beliebige IDs (bis 64 Zeichen), der Router akzeptiert nur [A-Za-z0-9_-]. Projekte bzw. Strickstücke mit anderen Zeichen aus einer (bearbeiteten oder künftigen) Sicherung sind nicht erreichbar. | Sicherung mit "id":"mein projekt" einlesen, Projekt antippen ⇒ zurück zur Liste. | In pruefeDaten IDs gegen dasselbe Muster prüfen und sonst durch eine Ersatz-ID ersetzen; Muster zentral teilen. QA-Test S2-03 aktivieren. |
| **S2-04** | Mittel | Sind die gespeicherten Daten beschädigt, startet die App mit leerer Liste **ohne Hinweis**. Die Rohdaten liegen zwar unter .defekt, aber die Nutzerin erfährt nichts davon und weiß nicht, dass sie jetzt ihre Sicherung einlesen sollte. | maschenrechner.daten.v2 = {kaputt ⇒ „Meine Projekte“, leer, kein Hinweis. | ladeDaten liefert quelle:'defekt'; die App zeigt einmalig: „Deine gespeicherten Daten konnten nicht gelesen werden. Falls du eine Sicherung hast, lies sie über die Einstellungen ein.“ |
| S2-05 | Niedrig | Lehnt das Gerät das Wachhalten nur vorübergehend ab (z. B. Stromsparmodus → abgelehnt), zeigt die App „Dieses Gerät kann den Bildschirm nicht wachhalten“ und merkt sich das dauerhaft. | Code-Review ansichten/zaehler.js | Merker nur bei nicht-verfuegbar setzen oder getrennte Meldung. |
| S2-06 | Niedrig | Lange Namen machen die feste Kopfzeile bis zu 4-zeilig; im Zähler bleibt weniger Platz. | 360 px, Strickstück „Ärmel links mit Bündchen und langer Bezeichnung“ | Titel auf 2 Zeilen begrenzen (line-clamp), voller Name bleibt im Inhalt. |
| S2-07 | Niedrig | Die 2-MB-Grenze wird erst geprüft, nachdem die ganze Datei gelesen wurde. | Code-Review ansichten/einstellungen.js | Vorher datei.size prüfen. |
| S2-08 | Hinweis | Gleicher Ansagetext wird von Screenreadern nicht wiederholt (z. B. −1 bei 0 mehrmals). | Code-Review | Optional: Ansage kurz leeren und neu setzen. |

## 6. Ergebnis

**Zurück an Entwickler.** Muss behoben werden: **S2-01** (Datenverlust). Sollte behoben werden: **S2-02, S2-03, S2-04**. S2-05 bis S2-08 können mitbehoben oder ins Backlog übernommen werden.

Nach der Korrektur: erneuter QA-Lauf (Regressionstests + Nachtest S2-01 bis S2-04), danach Veröffentlichung als Vorschau und Praxistest am iPhone (Teilen-Menü, Dateiauswahl, Wake Lock, Update von 0.1).

## 7. Nachtest nach den Korrekturen (Commit 8f81319)

**Automatische Tests:** 147 von 147 grün, keine offenen TODOs. Neu: tests/wachhalter.test.js (5 Tests), Prüfung der IDs, Kennzeichen beschaedigt; der QA-Test S2-03 ist jetzt aktiv.

**Regression:** Entwickler-Browsertest 69/69 ✓, QA-Prüfungen aus dem ersten Lauf erneut ausgeführt; 360 px ohne waagrechtes Scrollen, keine Ziele unter 44 px; Kontraste ≥ 6,62:1; keine fremden Anfragen, keine JavaScript-Fehler.

| **#** | **Nachtest** | **Ergebnis** | **Jira** |
|---|---|---|---|
| S2-01 | Ursprünglicher Ablauf (Projekt-Löschen offen → Zurück → „Eingaben zurücksetzen“ OK) | Projekt bleibt, nur Eingaben zurückgesetzt | MAS-41 ✓ |
| S2-01 | Namensdialog offen → Zurück → „Neues Projekt“ | nur das neue Projekt, kein zusätzliches Strickstück | ✓ |
| S2-01 | Löschen-Abfrage offen → Zurück → andere Abfrage „Abbrechen“ | nichts gelöscht | ✓ |
| S2-01 | Abfrage mit Escape schließen → nächste Abfrage OK | nur die zweite Aktion (Zähler auf 0) | ✓ |
| S2-01 | Zwei Dialoge direkt nacheinander (Abbrechen, dann Anlegen) | genau ein Strickstück | ✓ |
| S2-02 | Langsames Wake Lock, Zähler sofort verlassen | 0 offene Sperren; im Zähler genau 1; danach 0 | MAS-42 ✓ |
| S2-03 | Sicherung mit "id":"mein projekt" einlesen und öffnen | Projekt öffnet sich (Ersatz-ID) | MAS-43 ✓ |
| S2-04 | Beschädigte Daten | Warnung (gelb) mit Weg zur Sicherung; verschwindet nach Navigation; nach erstem Speichern nicht mehr; Erfolgsmeldung nach Import wieder grün | MAS-44 ✓ |
| S2-05 | „abgelehnt“: neuer Start zeigt Hinweis, innerhalb des Starts nur einmal; Text nennt Stromsparmodus und iOS vor 18.4 | ✓ | MAS-45 ✓ |
| S2-06 | Langer Projektname bei 360 px | Kopfzeile 70 px hoch (2 Zeilen, „…“), Seitentitel enthält den vollen Namen | ✓ |
| S2-07 | 3-MB-Datei einlesen | sofort „Die Datei ist zu groß …“, nichts verändert | ✓ |
| S2-08 | −1 bei Reihe 0 | „Reihe 0“ wird erneut gesetzt | ✓ |

**Neuer Befund im Nachtest**

| **#** | **Schwere** | **Befund** | **Jira** |
|---|---|---|---|
| S2-09 | Niedrig | Zwei Projekte mit derselben 64-stelligen ID in einer (manipulierten) Sicherung: Ersatz-ID wird 66 Zeichen lang und ist nicht erreichbar. Mit Sicherungen der App selbst nicht möglich. | MAS-46 (Backlog) |

**Ergebnis: Freigabe** für Version 0.2.0. S2-09 blockiert nicht und liegt im Backlog.

**Vor der Veröffentlichung noch am iPhone zu prüfen (Praxistest, Teil der Definition of Done):**

- Update von der installierten 0.1: Daten erscheinen in „Mein Projekt“ → „Teil 1“
- „Daten sichern“ → Teilen-Menü → „In Dateien sichern“; danach „Sicherung einlesen“ aus „Dateien“
- Zähler: Bildschirm bleibt an (iOS ab 18.4) bzw. Hinweis erscheint
- Farbschema Hell/Dunkel/Wie System
- Offline (Flugmodus) öffnen
