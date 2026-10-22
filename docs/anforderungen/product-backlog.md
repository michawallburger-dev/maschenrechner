<!-- Original aus dem Claude-Projekt „Stricken und Häckeln", dort als
     anforderungen/product-backlog.md geführt. Am 22.10.2026 unverändert ins Repo übernommen. -->

> **Eingefrorener Schnappschuss, Stand 17.10.2026 (Version 2.6).**
> Dieses Dokument wird **nicht fortgeschrieben**. Der verbindliche Backlog ist das
> Jira-Projekt [Masche (MAS)](https://wallburgermicha.atlassian.net/browse/MAS).
> Hier erhalten bleibt es wegen der Teile, die nicht in Jira stehen: Referenzwerte für die
> Akzeptanztests, die Definition of Done je Sprint, die Sprint-Abschlüsse und die
> Abgrenzungen „Nicht in Sprint N". Die Entscheidungstabelle daraus ist nach
> `docs/entscheidungen.md` übernommen und wird dort gepflegt.

# Product Backlog – Maschenrechner (Stand: 17.10.2026, Version 2.6 – Sprint 3 abgeschlossen, v0.3.0 veröffentlicht)

Rolle: Product Owner · Grundlage: `anforderung-enduserin.md`, `excel-formeln.md`, Klärungsrunden 1–3, Sprintplanung 3 · Jira: Projekt MAS „Masche“

**Änderungen in v2.6** (Abschluss Sprint 3, 17.10.2026): Entscheidung E28 (Option „keine Zu-/Abnahme“). Sprint 3 abgeschlossen, Version 0.3.0 veröffentlicht; der Praxistest am iPhone steht noch aus (Jira MAS-56).

**Änderungen in v2.5** (Freigabe Sprint 3, 17.10.2026): Entscheidungen E25 (ungerade Reihen bei „nur jede 2.“), E26 (Plan als dritte Zielquelle) und E27 (US-25 aus Sprint 3 herausgenommen, Diskussionsbedarf). Verschieben einzelner Ereignisreihen bleibt außerhalb von Sprint 3.

**Ergänzt am 17.10.2026:** Vorschläge des Entwicklers aus Sprint 3 als US-35 und US-36 (spätere Ausbaustufen).

**Für die Planung von Sprint 4 erneut aufbringen:** E24 (Randreihen) und E25 (ungerade Reihen/Runden ab 3) – beibehalten oder ändern? Diskussion zu US-25.

**Änderungen in v2.4** (Sprintplanung 3, 17.10.2026): Entscheidungen E23 und E24. US-13, US-14 und US-16 vollständig ausformuliert. US-30 um die Wahl der Zielquelle ergänzt (AK7). Sprint-Ziel, Umfang und Definition of Done für Sprint 3 festgelegt.

**Änderungen in v2.3** (Klärungsrunde 3, 17.10.2026): Entscheidungen E16–E22. Neu: US-32 Mehrere Maschenproben pro Projekt (ersetzt US-19), US-33 Zählerfeld erkennbar, US-34 (später). Erweitert: US-15 (letzte/nächste/übernächste Zu-/Abnahme) und US-30 (Ziel in Reihen und cm, jetzt Muss).

## Getroffene Entscheidungen
| # | Thema | Entscheidung |
|---|---|---|
| E1 | Technik | Nur Stricken. Eine Häkelversion kommt eventuell später. |
| E2 | Maschenprobe | Die Bezugsmaße sind frei wählbar (z. B. 22 M auf 8 cm). Vorbelegt ist 10 × 10 cm. Gerechnet wird immer über die Dichte pro cm, nie über das reine Verhältnis der Maschenzahlen. |
| E3 | Umrechnung | Für eine Breite oder Länge in cm werden **beide** Werte gezeigt: Maschen bzw. Reihen nach Anleitung **und** nach eigener Probe. |
| E4 | Rundung | Kaufmännisch auf ganze Maschen/Reihen (x,5 wird aufgerundet). Dazu kommt ein manuelles Anpassungsfeld wie in der Excel. Gerade Zahlen und Rapporte folgen später. |
| E5 | Einheiten | cm (Ausgabe mit 2 Nachkommastellen), Nadelstärke in mm. Eingaben akzeptieren Komma und Punkt. |
| E6 | Speicherung | Nur lokal auf dem Gerät, keine Synchronisierung. |
| E7 | Zu-/Abnahmen | Maschen pro Ereignis legt die Nutzerin fest (Standard: 2). Sie wählt, ob das Teil gewendet (Reihen) oder in Runden gestrickt wird und ob Zu-/Abnahmen nur in jeder 2. Reihe/Runde erfolgen. Strickrichtung von unten nach oben oder von oben nach unten. |
| E8 | Excel Z. 41–49 | Wird ignoriert (gehört zu einem einzelnen Projekt). |
| E9 | Sprache & Maßeinheit | Sprache (z. B. Englisch) und Längeneinheit (z. B. Zoll) sollen später **unabhängig voneinander** einstellbar sein. Sprint 1 bereitet das technisch vor, liefert aber nur Deutsch und cm. |
| E10 | Einstellungen | Die Einstellungen liegen hinter einem Zahnrad in der Kopfzeile: Farbschema, später auch Sprache und Einheit. |
| E11 | Projekte | Jeder Rechner gehört zu einem Projekt. Einen „Schnellrechner“ ohne Projekt gibt es nicht. Die Maschenproben gehören zum Projekt, die vier Rechner und der Reihenzähler zum einzelnen Strickstück (wie in der Anforderung der Enduserin, Kap. 5). **Ab Sprint 3 ergänzt durch E16–E18.** |
| E12 | Reihenzähler | Es gibt **einen** Zähler pro Strickstück. Beim Zählen bleibt der Bildschirm an. |
| E13 | Tausenderpunkt (MAS-30) | In Feldern für **ganze Zahlen** (Maschen/Reihen laut Anleitung, Anpassung, Reihenzähler) wird ein Punkt vor genau drei Ziffern als Tausendertrenner gelesen: „1.000“ = 1000, „12.500“ = 12500. In Dezimalfeldern (cm, Probe) bleibt der Punkt ein Dezimaltrenner. |
| E14 | Plausibilität (MAS-34) | Wird nicht umgesetzt. Die App zeigt keine Hinweise bei ungewöhnlichen Proben. |
| E15 | Datensicherung | Die Sicherung ist eine Datei, die über das Teilen-Menü des iPhones gespeichert oder verschickt wird (Dateien, Mail, AirDrop) und sich wieder einlesen lässt. |
| E16 | Mehrere Proben | Eine Probe ist immer ein **Paar** aus Anleitungsprobe und eigener Probe. Ein Projekt kann mehrere Paare haben. Mehrere eigene Proben zu einer Anleitung werden zurückgestellt; die Nutzerin bildet das über weitere Paare ab. |
| E17 | Zuordnung | Jedes Strickstück nutzt genau eine Probe seines Projekts. Gibt es nur eine Probe, wird sie neuen Strickstücken automatisch zugeordnet; gibt es mehrere, fragt die App beim Anlegen. |
| E18 | Nadelstärke | Die Nadelstärke gehört ab Sprint 3 zur **Probe** (die eigene Probe wurde mit dieser Nadel gestrickt). Das Strickstück zeigt die Nadel seiner Probe an. Ersetzt US-09 AK2 (Nadel am Projekt). |
| E19 | Sprint 3 | Darf größer werden; US-32 und US-33 kommen hinzu, US-30 wird Muss. |
| E20 | Probe löschen | Eine Probe, die noch einem Strickstück zugeordnet ist, kann nicht gelöscht werden; die App gibt einen Hinweis. Eine einstellbare Alternative ist als US-34 im Backlog. |
| E21 | Ziel im Zähler | Zielreihen = „Deine Reihen“ (endgültige Reihenzahl) aus dem Rechner des Strickstücks, Ziellänge = „Tatsächliche Höhe (cm)“. Die gestrickte Länge wird mit der eigenen Reihenprobe des Strickstücks berechnet. |
| E22 | Zu-/Abnahme im Zähler | Angezeigt werden letzte, nächste und übernächste Zu-/Abnahmereihe aus dem berechneten Plan, je mit Maschenzahl des Ereignisses (z. B. −2). In der Ereignisreihe selbst erscheint ein Hinweis mit Text und Farbe; die Darstellung kann sich nach dem Praxistest ändern. Die Zählerfeld-Variante a) (sichtbarer Rahmen + Stift) wird erprobt. |
| E23 | Zielquelle | Ist nur einer der Rechner „Reihen aus Anleitung“ (US-04) und „Länge in Reihen“ (US-06) gültig ausgefüllt, liefert er das Ziel. Sind beide gültig, wählt die Nutzerin im Zähler einmal, welcher gilt. |
| E24 | Randreihen | Die erste und die letzte Reihe eines Plans bleiben ohne Zu-/Abnahme. **Vorläufig** – wird mit der Enduserin geklärt und kann im Sprint noch geändert werden. In der Planung von Sprint 4 erneut prüfen. |
| E25 | Nur jede 2. Reihe/Runde | Bei gewendetem Stricken nur in **ungeraden** Reihen (Hinreihen), bei Runden in jeder zweiten Runde **beginnend mit Runde 3** (also ebenfalls ungerade Nummern). In der Planung von Sprint 4 erneut prüfen. |
| E26 | Plan als Zielquelle | Ein Strickstück mit Plan bietet den Plan (Reihen gesamt, Länge) als **dritte** wählbare Zielquelle im Zähler an, zusätzlich zu den beiden Rechnern aus E23. |
| E28 | Auswahl Endmaschen (S3-01) | Ist die Differenz kleiner als die Maschen pro Zu-/Abnahme, bietet die App zusätzlich „keine Zu-/Abnahme“ an (Endmaschen = Anfangsmaschen). Die getroffene Auswahl bleibt sichtbar und änderbar (S3-02). |
| E27 | Sprint-3-Umfang | US-25 (Proben einklappen) wird aus Sprint 3 herausgenommen, es gibt Diskussionsbedarf. Einzelne Ereignisreihen verschieben bleibt außerhalb von Sprint 3. |

## Referenzwerte für Akzeptanztests (aus der Excel)
- Anleitungs-Probe: 34 M / 10 cm, 52 R / 10 cm
- Eigene Probe: 25 M / 10 cm, 37 R / 10 cm

---

## Sprint 1 – „Excel ersetzen“ (abgeschlossen · veröffentlicht als v0.1.0)

**Sprint-Ziel:** Die Nutzerin kann alle Umrechnungen ihrer Excel-Tabelle am Handy durchführen, auch ohne Internet. Ihre Eingaben bleiben erhalten.

### US-01 Maschenprobe der Anleitung erfassen · Priorität: Muss · Jira MAS-5
Als Strickerin möchte ich die Maschenprobe aus meiner Anleitung eingeben, damit die App die Angaben der Anleitung in Zentimeter übersetzen kann.
- AK1: Eingabe von Maschenanzahl und Bezugsbreite (cm) sowie Reihenanzahl und Bezugshöhe (cm). Breite und Höhe sind mit 10 vorbelegt.
- AK2: Dezimalzahlen sind erlaubt (z. B. 22,5 M), sowohl mit Komma als auch mit Punkt.
- AK3: Die App zeigt die Dichte als Maschen/cm und Reihen/cm (34/10 → 3,40 M/cm; 52/10 → 5,20 R/cm).
- AK4: Werte ≤ 0, leere oder nicht numerische Werte werden abgefangen. Es erscheint ein verständlicher Hinweis am Feld, und abhängige Ergebnisse zeigen „–“ statt eines falschen Werts.

### US-02 Eigene Maschenprobe erfassen · Priorität: Muss · Jira MAS-6
Als Strickerin möchte ich meine eigene Maschenprobe und Nadelstärke eingeben, damit alle Berechnungen zu meinem Garn passen.
- AK1–AK4 wie bei US-01, für die eigene Probe.
- AK5: Die Nadelstärke in mm kann eingegeben werden (z. B. 3,5). Sie fließt nicht in Berechnungen ein.
- AK6: Flexible Bezugsmaße werden korrekt berücksichtigt: Bei 20 M auf 8 cm ergeben 40 cm genau 100 M.
- AK7: Ändert sich eine der beiden Proben, werden alle Ergebnisse sofort neu berechnet, ohne „Berechnen“-Knopf.

### US-03 Maschenzahl aus der Anleitung umrechnen · Priorität: Muss · Jira MAS-7 (Excel Z. 9–11, 21–23)
Als Strickerin möchte ich eine Maschenzahl aus der Anleitung eingeben, damit ich weiß, wie breit das Teil wird und wie viele Maschen ich mit meiner Probe brauche.
- AK1: Eingabe einer ganzen Maschenzahl laut Anleitung.
- AK2: Ausgabe der Breite laut Anleitung in cm: 320 M → 94,12 cm.
- AK3: Ausgabe der eigenen Maschenzahl, kaufmännisch gerundet: 320 M → 235 M.
- AK4: Ein Anpassungsfeld nimmt ganze Zahlen auf, auch negative (z. B. +1, −2). Daraus ergibt sich die endgültige Maschenzahl.
- AK5: Die tatsächliche Breite mit eigener Probe und die Abweichung zur Anleitung werden angezeigt: 235 M → 94,00 cm, Abweichung −0,12 cm.
- AK6: Ergibt die Anpassung eine endgültige Zahl < 1, erscheint ein Hinweis und kein Ergebnis.

### US-04 Reihenzahl aus der Anleitung umrechnen · Priorität: Muss · Jira MAS-8 (Excel Z. 13–15)
Als Strickerin möchte ich eine Reihenzahl aus der Anleitung eingeben, damit ich weiß, wie viele Reihen ich für dieselbe Höhe stricken muss.
- AK1–AK6 analog zu US-03, mit Reihen.
- Referenz: 55 R → 10,58 cm → 39 R → tatsächlich 10,54 cm, Abweichung −0,04 cm.

### US-05 Breite in Maschen umrechnen · Priorität: Muss · Jira MAS-9 (Excel Z. 25–27)
Als Strickerin möchte ich eine Breite in cm eingeben, damit ich sehe, wie viele Maschen das laut Anleitung und mit meiner Probe sind.
- AK1: Eingabe einer Breite in cm mit Dezimalstellen.
- AK2: Ausgabe von **zwei** Werten: Maschen laut Anleitung und Maschen mit eigener Probe, jeweils gerundet. Referenz: 94 cm → 320 M (Anleitung) / 235 M (eigene).
- AK3: Anpassungsfeld für den eigenen Wert, mit Anzeige der tatsächlichen Breite und der Abweichung (wie US-03, AK4–AK6).
- AK4: Rundungsprüfung: Bei eigener Probe 25 M/10 cm ergeben 10,2 cm (= 25,5) → 26 M.

### US-06 Länge in Reihen umrechnen · Priorität: Muss · Jira MAS-10 (Excel Z. 17–19)
Als Strickerin möchte ich eine Länge in cm eingeben, damit ich sehe, wie viele Reihen das laut Anleitung und mit meiner Probe sind.
- AK1–AK4 analog zu US-05, mit Reihen.
- Referenz: 13,5 cm → 70 R (Anleitung) / 50 R (eigene) → tatsächlich 13,51 cm.

### US-07 Eingaben bleiben erhalten · Priorität: Muss · Jira MAS-11
Als Strickerin möchte ich, dass meine Maschenproben und letzten Eingaben gespeichert bleiben, damit ich sie nach dem Schließen der App nicht neu eingeben muss.
- AK1: Nach dem Neuladen oder erneuten Öffnen sind beide Maschenproben, die Nadelstärke und die letzten Eingaben samt Anpassungen wieder da.
- AK2: Die Daten werden ausschließlich lokal auf dem Gerät gespeichert. Es werden keine Daten übertragen.
- AK3: Ein Knopf „Alle Eingaben zurücksetzen“ mit Sicherheitsabfrage stellt die Ausgangswerte wieder her.

### US-08 Am Handy und offline nutzen · Priorität: Muss · Jira MAS-12
Als Strickerin möchte ich die App auf meinem Handy neben dem Strickzeug nutzen, auch ohne Internet, damit ich sie überall griffbereit habe.
- AK1: Die App ist ab 360 px Breite ohne horizontales Scrollen bedienbar. Touch-Ziele sind mindestens 44 × 44 px groß.
- AK2: Zahlenfelder öffnen am Handy die Zahlentastatur.
- AK3: Die App lässt sich zum Startbildschirm hinzufügen und funktioniert nach dem ersten Aufruf vollständig offline.
- AK4: Jedes Ergebnis hat eine eindeutige Beschriftung mit Einheit, z. B. „Eigene Maschen“ oder „Breite laut Anleitung (cm)“.

### Definition of Done – Sprint 1
- Alle AK von US-01 bis US-08 sind erfüllt, und alle Referenzwerte aus der Excel werden exakt reproduziert.
- Die Rechenlogik ist durch automatisierte Tests abgesichert, einschließlich der Randfälle 0, negative Werte, Komma, sehr große Zahlen und x,5-Rundung.
- Datenschutz: kein Backend, keine externen Ressourcen, keine Tracker, keine Cookies.
- QA hat die Freigabe erteilt.

### Nicht in Sprint 1
Projekte, Strickstücke, Reihenzähler, Zu-/Abnahmeplan, erweiterte Rundung, Garnbedarf, Export, Häkeln, Sprachumschaltung, Zoll.

---

## Sprint 2 – „Projekte & Reihenzähler“ (abgeschlossen · veröffentlicht als v0.2.0, 16.10.2026) · Epic MAS-2 · Ziel: Version 0.2.0

**Sprint-Ziel:** Die Nutzerin legt Projekte mit mehreren Strickstücken an, rechnet je Strickstück mit den Maschenproben des Projekts und zählt beim Stricken die Reihen. Ihre Daten kann sie als Datei sichern. Was sie in Version 0.1 eingegeben hat, bleibt erhalten.

**Aufbau der App ab 0.2:** Projektliste → Projekt (Angaben, Maschenproben, Strickstücke) → Strickstück (vier Rechner und Reihenzähler). Das Zahnrad für die Einstellungen ist von überall erreichbar.

### US-09 Projekte verwalten · Muss · Jira MAS-13
Als Strickerin möchte ich mehrere Strickprojekte anlegen und bearbeiten, damit jedes Projekt seine eigenen Angaben und Berechnungen behält.
- AK1: Die Startseite zeigt alle Projekte, das zuletzt bearbeitete steht oben. Gibt es keine Projekte, erscheint ein Hinweis mit dem Knopf „Neues Projekt“.
- AK2: Beim Anlegen ist nur der Name Pflicht. Beschreibung, Garn und Nadelstärke (mm) sind optional. *(Ab Sprint 3: Nadelstärke wandert zur Probe, siehe E18 / US-32.)*
- AK3: Jedes Projekt hat **eigene** Maschenproben (Anleitung und eigene Probe) mit allen Regeln aus US-01 und US-02.
- AK4: Name und alle Angaben lassen sich nachträglich ändern. Änderungen werden sofort gespeichert.
- AK5: Ein Projekt lässt sich löschen. Vorher erscheint eine Sicherheitsabfrage, die den Projektnamen und die Zahl der enthaltenen Strickstücke nennt.
- AK6: Beim Wechsel zwischen Projekten geht keine Eingabe verloren.

### US-10 Strickstücke verwalten · Muss · Jira MAS-14
Als Strickerin möchte ich ein Projekt in Strickstücke wie Vorderteil, Rückenteil oder Ärmel aufteilen, damit ich jedes Teil einzeln berechnen und stricken kann.
- AK1: Ein Projekt enthält beliebig viele Strickstücke. Jedes hat einen frei wählbaren Namen, Vorschläge sind Vorderteil, Rückenteil, Ärmel links und Ärmel rechts.
- AK2: Jedes Strickstück hat die **vier Rechner aus Sprint 1** mit eigenen Eingaben und Anpassungen. Gerechnet wird mit den Maschenproben seines Projekts.
- AK3: Ändert sich eine Probe im Projekt, rechnen alle Strickstücke des Projekts neu.
- AK4: Ein Strickstück lässt sich umbenennen und löschen. Vor dem Löschen erscheint eine Sicherheitsabfrage.
- AK5: Die Projektansicht zeigt bei jedem Strickstück den aktuellen Stand des Reihenzählers, z. B. „Ärmel links – Reihe 42“.

### US-11 Reihenzähler · Muss · Jira MAS-15
Als Strickerin möchte ich für jedes Strickstück einen Reihenzähler haben, damit ich beim Stricken jederzeit weiß, in welcher Reihe ich bin.
- AK1: Jedes Strickstück hat genau einen Zähler, der bei 0 beginnt.
- AK2: Der Knopf **+1** ist sehr groß (mindestens 96 × 96 px) und mit dem Daumen gut zu treffen. **−1** ist kleiner und mit Abstand angeordnet, damit man ihn nicht versehentlich trifft.
- AK3: Der Zähler lässt sich nicht unter 0 setzen. Er lässt sich auch direkt eingeben, als ganze Zahl von 0 bis 99 999, „1.000“ wird nach E13 gelesen.
- AK4: Jeder Schritt wird sofort gespeichert. Nach dem Schließen und erneuten Öffnen erscheint der letzte Stand.
- AK5: Solange die Zähleransicht offen ist, schaltet der Bildschirm nicht ab. Kann das Gerät das nicht, erscheint einmalig ein Hinweis.
- AK6: „Zähler auf 0 setzen“ gibt es nur mit Sicherheitsabfrage.
- AK7: Screenreader sagen nach jedem Schritt die neue Reihenzahl an.

### US-12 Datensicherung exportieren und importieren · Muss · Jira MAS-16
Als Strickerin möchte ich alle meine Projekte als Datei sichern und wieder einlesen, damit nichts verloren geht, wenn Browserdaten gelöscht werden oder ich das Handy wechsle.
- AK1: „Daten sichern“ in den Einstellungen erzeugt die Datei `maschenrechner-sicherung-JJJJ-MM-TT.json` mit allen Projekten, Strickstücken, Zählerständen und Einstellungen.
- AK2: Auf dem iPhone öffnet sich dafür das **Teilen-Menü** (In Dateien sichern, Mail, AirDrop). Wo das nicht geht, wird die Datei heruntergeladen.
- AK3: „Sicherung einlesen“ öffnet die Dateiauswahl. Vor dem Einlesen zeigt die App, was die Datei enthält (Anzahl Projekte und Strickstücke, Datum). Nach Bestätigung **ersetzt** sie alle vorhandenen Daten.
- AK4: Ist die Datei ungültig oder beschädigt, erscheint ein verständlicher Hinweis. Dabei wird **nichts** verändert.
- AK5: Die Sicherung verlässt das Gerät nur, wenn die Nutzerin sie selbst teilt. Die App sendet nichts.

### US-26 Einstellungen mit Farbschema · Soll · Jira MAS-35
Als Strickerin möchte ich über ein Zahnrad die Einstellungen öffnen und dort Hell, Dunkel oder „Wie System“ wählen, damit ich die Darstellung nach Bedarf anpassen kann.
- AK1: Das Zahnrad in der Kopfzeile ist von jeder Ansicht aus erreichbar und mindestens 48 px groß.
- AK2: Das Farbschema bietet drei Optionen: Hell, Dunkel und Wie System (Standard). Die Wahl wirkt sofort und bleibt lokal gespeichert, unabhängig von Sprache und Einheit.
- AK3: Bei „Wie System“ folgt die App dem Handy, auch wenn es während der Nutzung umschaltet.
- AK4: Der Kontrast liegt in beiden Schemata bei mindestens 4,5:1, und `theme-color` passt zum gewählten Schema.
- AK5: Die Datensicherung (US-12) liegt ebenfalls in den Einstellungen.

### US-27 Daten aus Version 0.1 übernehmen · Muss · Jira MAS-36
Als Strickerin, die Version 0.1 schon nutzt, möchte ich meine bisherigen Eingaben nach dem Update behalten, damit ich nichts neu eingeben muss.
- AK1: Beim ersten Start von 0.2 werden vorhandene Daten aus 0.1 automatisch zu einem Projekt „Mein Projekt“ mit einem Strickstück „Teil 1“. Maschenproben, Nadelstärke, alle Rechnereingaben und Anpassungen bleiben erhalten.
- AK2: Danach startet die App in diesem Projekt, und ein einmaliger Hinweis erklärt die neue Projektliste.
- AK3: Gibt es keine Daten aus 0.1, startet die App mit leerer Projektliste.
- AK4: Schlägt die Übernahme fehl, bleiben die alten Daten unverändert gespeichert.

### Bugs in Sprint 2
| Jira | Behebung | Priorität |
|---|---|---|
| MAS-30 | „1.000“ in Ganzzahlfeldern als Tausend lesen (E13). Der QA-Test für F-01 wird angepasst. | Medium |
| MAS-31 | Keine Fehlermeldung während der Eingabe von „12,“ | Low |
| MAS-32 | Weniger Live-Bereiche für Screenreader: nur das Hauptergebnis und der Zählerstand werden angesagt | Low |
| MAS-33 | Service Worker lädt beim Update mit `cache: 'reload'`, damit keine veralteten Dateien gemischt werden | Low |
| MAS-34 | Wird nicht umgesetzt (E14), Ticket wird geschlossen | – |

### Definition of Done – Sprint 2
- Alle AK von US-09 bis US-12, US-26 und US-27 sind erfüllt, und die Bugs MAS-30 bis MAS-33 sind behoben.
- Die Rechenwerte aus Sprint 1 stimmen weiterhin, auch innerhalb von Projekten. Alle bisherigen Tests sind grün.
- Es gibt automatische Tests für Datenmodell, Datenübernahme aus 0.1, Export und Import (gültig und ungültig) sowie die Zählerlogik.
- Datenschutz: weiterhin kein Backend, nichts verlässt das Gerät außer der Datei, die die Nutzerin selbst teilt.
- QA-Freigabe liegt vor, der Praxistest am iPhone ist bestanden, Version 0.2.0 ist veröffentlicht.

### Abschluss Sprint 2
- QA: erster Lauf „Zurück an Entwickler“ (S2-01 kritisch, S2-02 bis S2-04 mittel), Nachtest „Freigabe“ – siehe `qa/sprint-2-testbericht.md`
- Behoben im Sprint: MAS-30 bis MAS-33 sowie MAS-41 bis MAS-45 (S2-01 bis S2-08)
- Praxistest am iPhone bestanden; Jira-Sprint „MAS Sprint 2“ geschlossen, Epics MAS-1 und MAS-2 erledigt
- Offen im Backlog: MAS-46 (S2-09, niedrig)

## Bugs aus der QA von Sprint 1 · Epic MAS-1
| Jira | Befund | Priorität |
|---|---|---|
| MAS-30 | F-01 „1.000“ wird still als 1 gelesen – entschieden: als Tausend lesen (E13) | Medium |
| MAS-31 | F-02 Fehlermeldung blitzt beim Tippen einer Kommazahl auf | Low |
| MAS-32 | F-03 Zu viele aria-live-Bereiche | Low |
| MAS-33 | F-04 Service Worker kann veraltete Dateien aus dem HTTP-Cache übernehmen | Low |
| MAS-34 | F-05 Unrealistische Maschenproben ohne Hinweis – wird nicht umgesetzt (E14) | – |

---

## Sprint 3 – „Zu- und Abnahmen & Proben je Strickstück“ (abgeschlossen · veröffentlicht als v0.3.0, 17.10.2026) · Epic MAS-3 · Ziel: Version 0.3.0

**Sprint-Ziel:** Die Nutzerin legt pro Projekt mehrere Maschenproben an und ordnet sie den Strickstücken zu. Für ein Strickstück, dessen Breite sich ändert (z. B. Ärmel), berechnet die App einen gleichmäßigen Zu-/Abnahmeplan. Beim Zählen sieht sie ihr Ziel in Reihen und cm sowie die letzte, nächste und übernächste Zu-/Abnahme.

### Umfang und Reihenfolge
| # | Story | Jira | Priorität |
|---|---|---|---|
| 1 | US-32 Mehrere Maschenproben pro Projekt | MAS-47 | Muss |
| 2 | US-13 Zu-/Abnahmeplan berechnen | MAS-17 | Muss |
| 3 | US-14 Plan beim Strickstück speichern | MAS-18 | Muss |
| 4 | US-15 Zähler zeigt letzte, nächste, übernächste Zu-/Abnahme | MAS-19 | Muss |
| 5 | US-30 Zähler mit Ziel in Reihen und cm | MAS-39 | Muss |
| 6 | US-16 Plan manuell anpassen | MAS-20 | Soll |
| 7 | US-33 Zählerfeld als Eingabefeld erkennbar | MAS-48 | Soll |

US-32 zuerst, weil Plan und Zielanzeige die Probe des Strickstücks brauchen.

**Datenmodell:** US-32 und US-14 verändern das Schema (Proben als Liste am Projekt, Zuordnung und Plan am Strickstück, Nadel an der Probe). Daten aus 0.2 und Sicherungen aus 0.2 werden automatisch übernommen (wie US-27).

**Referenzwerte für Sprint 3**
- Proben: „Glatt“ 34/52 – 25/37, „Ärmel“ 34/52 – 20/30 (je 10 cm); 320 M mit „Ärmel“ → 188 M
- Plan: 20 → 34 cm, Länge 45 cm, eigene Probe 25 M / 37 R → 50 M → 85 M, 167 Reihen; Differenz 35 ist mit 2 M pro Ereignis nicht teilbar → Auswahl 84 M (33,60 cm, 17 Zunahmen) oder 86 M (34,40 cm, 18 Zunahmen)
- Zähler: Ereignisse in Reihe 16 (−1), 22 (−2), 25 (−3); Zähler 20 → letzte 16, nächste 22, übernächste 25; Zähler 22 → „Jetzt: 2 M abnehmen“
- Ziel: eigene Probe 37 R / 10 cm, Rechner 13,5 cm → 50 R / 13,51 cm; Zähler 37 → „37 von 50“, „10,00 cm von 13,51 cm“

### US-32 Mehrere Maschenproben pro Projekt · Muss · Jira MAS-47 (ersetzt US-19 / MAS-23)
Als Strickerin möchte ich in einem Projekt mehrere Maschenproben anlegen und sie einzelnen Strickstücken zuordnen, damit ich z. B. Ärmel mit einer anderen Probe berechnen kann als Vorder- und Rückenteil.
- AK1: Eine Probe ist immer ein Paar aus Anleitungsprobe und eigener Probe, mit Name und Nadelstärke (mm). In der Projektansicht lassen sich Proben hinzufügen, umbenennen und ändern. Alle Regeln aus US-01/US-02 gelten je Probe (E16).
- AK2: Die Nadelstärke gehört zur Probe, nicht mehr zum Projekt. Die Strickstück-Ansicht zeigt sie an (E18).
- AK3: Jedes Strickstück ist genau einer Probe zugeordnet. Die Projektansicht zeigt bei jedem Strickstück den Namen seiner Probe.
- AK4: Neues Strickstück: Gibt es nur eine Probe, wird sie automatisch zugeordnet. Gibt es mehrere, fragt die App beim Anlegen, welche gelten soll (E17).
- AK5: In der Strickstück-Ansicht wird „Proben ändern“ zu „Probe wechseln“. Nach dem Wechsel bleiben Rechnereingaben, Anpassungen und Zählerstand erhalten; die Ergebnisse werden sofort neu berechnet.
- AK6: Ändert sich eine Probe, rechnen nur die Strickstücke neu, denen sie zugeordnet ist.
- AK7: Eine Probe, die noch einem Strickstück zugeordnet ist, kann nicht gelöscht werden; die App nennt die betroffenen Strickstücke. Die letzte Probe eines Projekts kann nicht gelöscht werden (E20).
- AK8: Übernahme aus 0.2: Die bisherige Probe jedes Projekts wird zu „Probe 1“ mit der bisherigen Nadelstärke des Projekts; alle Strickstücke werden ihr zugeordnet. Schlägt die Übernahme fehl, bleiben die alten Daten unverändert.
- AK9: Die Datensicherung enthält alle Proben und Zuordnungen. Sicherungen aus 0.2 lassen sich weiterhin einlesen und werden dabei wie in AK8 übernommen.

### US-13 Zu-/Abnahmeplan berechnen · Muss · Jira MAS-17
Als Strickerin möchte ich für ein Strickstück, dessen Breite sich ändert, einen Plan bekommen, in welcher Reihe ich wie viele Maschen zu- oder abnehme, damit die Form gleichmäßig wird und ich nicht selbst rechnen muss.
- AK1: Eingaben: Anfangsbreite und Endbreite in Strickrichtung (cm), Länge (cm), Maschen pro Ereignis (ganze Zahl ≥ 1, Standard 2), Arbeitsweise „in Reihen (gewendet)“ oder „in Runden“ (Standard: Reihen) und die Option „nur jede 2. Reihe/Runde“ (Standard: aus). Es gelten die Eingaberegeln aus Sprint 1 (Komma und Punkt, Hinweis am Feld, „–“ bei ungültigen Werten). Die Strickrichtung ergibt sich aus der Reihenfolge von Anfangs- und Endbreite (E7).
- AK2: Gerechnet wird mit der eigenen Probe des Strickstücks (US-32): Anfangsmaschen und Endmaschen = Breite × Maschen/cm, Reihen gesamt = Länge × Reihen/cm, jeweils kaufmännisch gerundet. Alle drei Werte werden angezeigt.
- AK3: Die App erkennt die Richtung: Endmaschen > Anfangsmaschen → Zunahmen, kleiner → Abnahmen. Sind beide gleich, erscheint „Keine Zu- oder Abnahmen nötig“ und kein Plan.
- AK4: Anzahl Ereignisse = Betrag der Differenz ÷ Maschen pro Ereignis. Ist die Differenz nicht teilbar, bietet die App die beiden nächstgelegenen passenden Endmaschenzahlen mit der jeweiligen Endbreite (cm) und Zahl der Ereignisse zur Auswahl an. Erst nach der Auswahl entsteht ein Plan.
- AK5: Die erste und die letzte Reihe bleiben ohne Zu-/Abnahme (E24, vorläufig).
- AK6: Die Ereignisse werden möglichst gleichmäßig auf die verfügbaren Reihen verteilt: Die Abstände zwischen aufeinanderfolgenden Ereignissen unterscheiden sich um höchstens 1 Reihe, bei „nur jede 2. Reihe/Runde“ um höchstens 2, und dann liegen alle Ereignisse in ungeraden Reihen bzw. Runden ab 3 (E25). Die Verteilung ist für dieselben Eingaben immer gleich (Regel wird im Architekturdokument festgelegt und getestet).
- AK7: Reichen die verfügbaren Reihen nicht für alle Ereignisse, erscheint ein Hinweis mit dem Vorschlag, mehr Maschen pro Ereignis zu nehmen oder die Länge zu prüfen. Es entsteht kein Plan.
- AK8: Der Plan erscheint als Liste mit einer Zeile je Ereignis, z. B. „Reihe 12: 2 M zunehmen“ (bei Runden „Runde 12“), und einer Zusammenfassung, z. B. „17 × 2 M zunehmen, alle 9–10 Reihen“.
- AK9: Ändern sich Eingaben oder die Probe des Strickstücks, wird der Plan sofort neu berechnet.
- Referenz siehe „Referenzwerte für Sprint 3“.

### US-14 Plan beim Strickstück speichern · Muss · Jira MAS-18
Als Strickerin möchte ich den Zu-/Abnahmeplan beim Strickstück speichern, damit ich ihn beim Stricken wiederfinde und der Reihenzähler ihn nutzen kann.
- AK1: Jedes Strickstück hat höchstens einen Plan. Er liegt in der Strickstück-Ansicht als eigene Karte „Zu- und Abnahmen“, die sich anlegen, bearbeiten und löschen lässt. Vor dem Löschen erscheint eine Sicherheitsabfrage.
- AK2: Alle Eingaben des Plans werden sofort gespeichert und sind nach dem Schließen und erneuten Öffnen wieder da.
- AK3: Die Projektansicht zeigt bei Strickstücken mit Plan eine Kurzinfo, z. B. „17 × 2 M zunehmen“.
- AK4: Der Reihenzähler (US-15) nutzt den Plan seines Strickstücks.
- AK5: Der Plan ist Teil der Datensicherung. Sicherungen aus 0.2 (ohne Plan) lassen sich weiterhin einlesen.

### US-15 Reihenzähler zeigt letzte, nächste und übernächste Zu-/Abnahme · Muss · Jira MAS-19
Als Strickerin möchte ich im Reihenzähler sehen, in welcher Reihe die letzte, die nächste und die übernächste Zu- oder Abnahme liegt, damit ich beim Stricken keine verpasse.
- AK1: Unter Projekt- und Strickstückname stehen drei Einträge: **letzte**, **nächste** und **übernächste** Reihe mit Zu-/Abnahme, je mit Reihennummer und Maschenzahl des Ereignisses (z. B. „Reihe 22: −2 M“, Zunahmen mit +).
- AK2: Die Einträge kommen ausschließlich aus dem berechneten Plan des Strickstücks (US-13/US-14), einschließlich manueller Anpassungen aus US-16.
- AK3: Die Anzeige aktualisiert sich bei +1, −1 und direkter Eingabe sofort.
- AK4: Gibt es keine letzte bzw. keine weitere Zu-/Abnahme, steht dort „–“. Hat das Strickstück keinen Plan, entfällt der Bereich.
- AK5: Ist die aktuelle Reihe selbst eine Zu-/Abnahmereihe, erscheint ein deutlicher Hinweis mit Text **und** Farbe, z. B. „Jetzt: 2 M abnehmen“ (Kontrast ≥ 4,5:1 in Hell und Dunkel). Screenreader sagen den Hinweis zusammen mit der Reihenzahl an.
- AK6: Die Darstellung aus AK5 kann sich nach dem Praxistest der Enduserin ändern (E22).

### US-30 Reihenzähler mit Ziel „Reihe X von Y“ und Länge in cm · Muss · Jira MAS-39
Als Strickerin möchte ich im Zähler sehen, wie viele Reihen und Zentimeter ich gestrickt habe und wie viele es werden sollen, damit ich weiß, wie weit ich bin.
- AK1: Neben dem Eingabefeld der Reihenzahl steht das Ziel, z. B. „39 von 80“.
- AK2: Das Ziel ergibt sich aus dem Rechner des Strickstücks: Zielreihen = „Deine Reihen“ (endgültige Reihenzahl inkl. Anpassung), Ziellänge = „Tatsächliche Höhe (cm)“ (E21).
- AK3: Unter dem Zähler steht die gestrickte Länge und die Ziellänge, z. B. „40,00 cm von 60,00 cm“. Gestrickte Länge = aktuelle Reihe × Bezugshöhe ÷ Reihenanzahl der **eigenen** Probe des Strickstücks.
- AK4: Ändern sich Rechnereingaben oder die Probe, aktualisieren sich Ziel und Längen sofort.
- AK5: Gibt es kein gültiges Rechnerergebnis, wird kein Ziel angezeigt; die gestrickte Länge erscheint trotzdem, sofern die Probe vollständig ist.
- AK6: Beim Erreichen des Ziels erscheint ein Hinweis (Text, nicht nur Farbe) mit Ansage für Screenreader. Weiterzählen über das Ziel ist möglich.
- AK7: Zielquelle (E23, E26): Mögliche Quellen sind „Reihen aus Anleitung“, „Länge in Reihen“ und – wenn vorhanden – der Zu-/Abnahmeplan (Reihen gesamt und tatsächliche Länge). Ist nur eine Quelle gültig, liefert sie das Ziel. Sind mehrere gültig, wählt die Nutzerin im Zähler einmal die Quelle. Die Wahl wird gespeichert und lässt sich ändern. Wird die gewählte Quelle ungültig, gilt die erste gültige in der Reihenfolge Plan, „Länge in Reihen“, „Reihen aus Anleitung“.

### US-16 Plan manuell anpassen · Soll · Jira MAS-20
Als Strickerin möchte ich den berechneten Plan anpassen können, damit ich ihn an meine Anleitung oder mein Gefühl beim Stricken angleichen kann.
- AK1: Für Anfangsmaschen, Endmaschen und Reihen gesamt gibt es je ein Anpassungsfeld (ganze Zahl, auch negativ, mit −/+), wie bei den Rechnern aus Sprint 1. Angezeigt werden die endgültige Zahl und die tatsächliche Breite bzw. Länge in cm.
- AK2: Die Anpassung der Endmaschen ersetzt die Auswahl aus US-13 AK4; ist die Differenz danach nicht teilbar, gilt wieder US-13 AK4.
- AK3: Nach jeder Anpassung wird der Plan sofort neu verteilt; der Zähler (US-15) nutzt den angepassten Plan.
- AK4: Anpassungen werden gespeichert und sind Teil der Datensicherung. „Anpassungen zurücksetzen“ stellt den berechneten Plan wieder her.

### US-33 Reihenzahl im Zähler als Eingabefeld erkennbar · Soll · Jira MAS-48
Als Strickerin möchte ich auf den ersten Blick sehen, dass ich die Reihenzahl im Zähler direkt eingeben kann, damit ich einen Stand schnell korrigieren kann.
- AK1: Die Reihenzahl hat dauerhaft einen sichtbaren Rahmen (Kontrast mindestens 3:1 zum Hintergrund, in Hell und Dunkel) und ein Stift-Symbol.
- AK2: Antippen der Zahl oder des Symbols öffnet die Zahlentastatur.
- AK3: Das Feld hat einen zugänglichen Namen, z. B. „Reihe eingeben“; das Symbol wird von Screenreadern nicht zusätzlich vorgelesen.
- AK4: Die Regeln aus US-11 AK3 gelten unverändert.
- AK5: Im Praxistest bewertet die Enduserin, ob versehentliches Antippen beim Zählen stört. Wenn ja, wird Variante b (eigener Knopf „Reihe eingeben“) als Folgestory angelegt.

### US-25 Maschenproben automatisch einklappen · Soll · Jira MAS-29 · **nicht in Sprint 3** (E27, Diskussionsbedarf)
Als Strickerin möchte ich, dass vollständig ausgefüllte Maschenproben in der Projektansicht eingeklappt erscheinen, damit die Ansicht bei mehreren Proben übersichtlich bleibt.
- AK1: Eine vollständig gültige Probe erscheint beim Öffnen der Projektansicht eingeklappt mit Kurzfassung (Name, Nadel, „34 M / 52 R – 25 M / 37 R je 10 cm“).
- AK2: Unvollständige oder ungültige Proben bleiben aufgeklappt.
- AK3: Auf- und Zuklappen ist per Tippen und Tastatur möglich; der Zustand ist für Screenreader erkennbar.

### Definition of Done – Sprint 3
- Alle AK der Muss-Stories (US-32, US-13, US-14, US-15, US-30) sind erfüllt; Soll-Stories sind erfüllt oder ausdrücklich ins Backlog zurückgelegt.
- Alle Referenzwerte aus Sprint 1 bis 3 werden exakt reproduziert; alle bisherigen Tests sind grün.
- Automatische Tests für die Verteilung der Zu-/Abnahmen, inkl. Eigenschaftstests: Summe der Ereignisse = Differenz, Abstände unterscheiden sich höchstens um 1 (bzw. 2), Randreihen frei, gleiche Eingaben → gleicher Plan; Randfälle: Differenz 0, nicht teilbare Differenz, mehr Ereignisse als Reihen, 1 M pro Ereignis, sehr lange Teile.
- Automatische Tests für die Datenübernahme aus 0.2 (gespeicherte Daten und Sicherungsdateien) und für Zielquelle und Zieldarstellung im Zähler.
- Datenschutz unverändert: kein Backend, nichts verlässt das Gerät außer der Datei, die die Nutzerin selbst teilt.
- QA-Freigabe liegt vor. Praxistest am iPhone mit der Enduserin: Update von 0.2 mit Datenübernahme, Plan für einen Ärmel, Hinweis in der Zu-/Abnahmereihe, Zählerfeld Variante a, Randreihen-Regel (E24).
- Version 0.3.0 ist veröffentlicht.

### Abschluss Sprint 3
- Umgesetzt: alle Muss-Stories (US-32, US-13, US-14, US-15, US-30) und die Soll-Stories US-16 und US-33; US-25 war vorher herausgenommen (E27).
- QA: erster Lauf „Zurück an Entwickler“ (S3-02 mittel, S3-01 und S3-03 bis S3-06 niedrig), Nachtest „Freigabe“ – siehe `qa/sprint-3-testbericht.md`. 224 automatische Tests grün.
- Behoben im Sprint: MAS-52 bis MAS-55 (S3-01 bis S3-06); S3-01 nach Entscheidung E28.
- Branch `sprint-3` nach `main` gemergt, Version 0.3.0 am 17.10.2026 veröffentlicht.
- **Abweichung von der Definition of Done:** Der Praxistest am iPhone mit der Enduserin wurde auf Wunsch verschoben und steht noch aus (Jira MAS-56). Epic MAS-3 bleibt bis dahin offen.
- Offene Prüfpunkte für den Praxistest: Update von 0.2 mit Datenübernahme, Auswahl 84/86 M treffen und ändern, Hinweis „Jetzt“ (E22) und Randreihen (E24) in einer Zu-/Abnahmereihe, versehentliches Antippen des Zählerfelds (US-33 AK5), Standard-Zielquelle „Plan“ (QA-Hinweis H1), Offline-Start.

### Nicht in Sprint 3
US-25 Proben einklappen (E27), mehrere eigene Proben zu einer Anleitungsprobe (E16), einstellbares Löschverhalten (US-34), Verschieben einzelner Ereignisreihen, erweiterte Rundung und Rapporte, Garnbedarf, Grafik der Formgebung, Häkeln, Englisch, Zoll, Sortieren von Strickstücken, Vibration.

---

## Spätere Ausbaustufen (Kann) · Epic MAS-4
- US-17 Erweiterte Rundung: gerade Maschenzahl, Vielfaches von n (+ m) für Musterrapporte
- US-18 Garnbedarf und Knäuelanzahl schätzen, mit Sicherheitszuschlag und dem Hinweis „Schätzung“
- ~~US-19 Abweichende Maschenprobe pro Strickstück~~ – ersetzt durch US-32 (MAS-47)
- US-20 Wiederverwendbare Maschenproben und Garnprofile
- US-21 Grafische Darstellung von Formgebung und Fortschritt
- US-22 Häkelversion
- US-23 Oberfläche auf Englisch – Sprache einstellbar, **unabhängig** von der Maßeinheit (z. B. Englisch mit cm) · Jira MAS-27
- US-24 Längeneinheit Zoll – Einheit einstellbar, **unabhängig** von der Sprache (z. B. Deutsch mit Zoll); Maschenprobe dann typischerweise auf 4 Zoll · Jira MAS-28
- US-28 Übernahme-Hinweis bleibt bis „Verstanden“ (Jira MAS-37): Der Erklärhinweis nach dem Update von 0.1 erscheint bei jedem Start, bis er bestätigt wurde (in 0.2.0 nur beim ersten Start).
- US-29 Strickstücke innerhalb eines Projekts sortieren (Jira MAS-38): Verschieben nach oben/unten per Knopf (≥ 44 px, barrierefrei), Reihenfolge wird gespeichert und gesichert.
- US-31 Kurzes Vibrieren beim Zählen (Jira MAS-40, niedrigste Priorität): +1 und −1 mit unterschiedlichem Muster, abschaltbar. Funktioniert nur auf Android – Safari auf dem iPhone unterstützt keine Vibration.
- US-34 Verhalten beim Löschen verknüpfter Proben einstellbar (Jira MAS-49): Einstellung „Löschen verhindern“ (Standard) oder „Andere Probe zuordnen“ – dann fragt die App beim Löschen, welche Probe die betroffenen Strickstücke bekommen.
- US-35 „Proben ändern“ springt direkt zur Probe des Strickstücks (Jira MAS-50): Die Projektansicht öffnet an der zugeordneten Probe, Fokus auf ihrem Namen; die Zurück-Geste führt zum Strickstück.
- US-36 Plan-Liste: nur die nächsten Zu-/Abnahmen zeigen (Jira MAS-51): Umschalter „Alle“ / „Ab aktueller Reihe“ in der Karte „Zu- und Abnahmen“, Wahl je Strickstück gespeichert.
- Zurückgestellt (E16): mehrere eigene Proben zu einer Anleitungsprobe.

- Bug S2-09 (Jira MAS-46, niedrig): Doppelte 64-stellige IDs in einer manipulierten Sicherung ergeben eine zu lange Ersatz-ID.

*US-28 bis US-31 sind Vorschläge des Entwicklers aus Sprint 2, US-35 und US-36 aus Sprint 3 (Jira-Label `vorschlag-entwickler`). US-34 ist ein Vorschlag der Enduserin (Label `vorschlag-enduserin`).*
