# Produktentscheidungen E1 bis E28

Fachliche Festlegungen der Auftraggeberseite. Sie begründen, **warum** die App etwas so tut, und
sind damit die Grundlage für jede Weiterentwicklung. Jira sagt, *was* gebaut wird; diese Datei
sagt, *warum*.

**Quelle:** Entscheidungstabelle aus `anforderungen/product-backlog.md` Version 2.6 (17.10.2026)
des Claude-Projekts „Stricken und Häckeln", am 22.10.2026 unverändert übernommen. Der vollständige
Backlog liegt als eingefrorener Schnappschuss unter
[docs/anforderungen/product-backlog.md](anforderungen/product-backlog.md). **Ab hier wird diese
Datei gepflegt**, nicht der Schnappschuss.

## Entscheidungen

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
| E11 | Projekte | Jeder Rechner gehört zu einem Projekt. Einen „Schnellrechner" ohne Projekt gibt es nicht. Die Maschenproben gehören zum Projekt, die vier Rechner und der Reihenzähler zum einzelnen Strickstück. **Ab Sprint 3 ergänzt durch E16–E18.** |
| E12 | Reihenzähler | Es gibt **einen** Zähler pro Strickstück. Beim Zählen bleibt der Bildschirm an. |
| E13 | Tausenderpunkt (MAS-30) | In Feldern für **ganze Zahlen** (Maschen/Reihen laut Anleitung, Anpassung, Reihenzähler) wird ein Punkt vor genau drei Ziffern als Tausendertrenner gelesen: „1.000" = 1000, „12.500" = 12500. In Dezimalfeldern (cm, Probe) bleibt der Punkt ein Dezimaltrenner. |
| E14 | Plausibilität (MAS-34) | Wird nicht umgesetzt. Die App zeigt keine Hinweise bei ungewöhnlichen Proben. |
| E15 | Datensicherung | Die Sicherung ist eine Datei, die über das Teilen-Menü des iPhones gespeichert oder verschickt wird (Dateien, Mail, AirDrop) und sich wieder einlesen lässt. |
| E16 | Mehrere Proben | Eine Probe ist immer ein **Paar** aus Anleitungsprobe und eigener Probe. Ein Projekt kann mehrere Paare haben. Mehrere eigene Proben zu einer Anleitung werden zurückgestellt; die Nutzerin bildet das über weitere Paare ab. |
| E17 | Zuordnung | Jedes Strickstück nutzt genau eine Probe seines Projekts. Gibt es nur eine Probe, wird sie neuen Strickstücken automatisch zugeordnet; gibt es mehrere, fragt die App beim Anlegen. |
| E18 | Nadelstärke | Die Nadelstärke gehört ab Sprint 3 zur **Probe** (die eigene Probe wurde mit dieser Nadel gestrickt). Das Strickstück zeigt die Nadel seiner Probe an. Ersetzt US-09 AK2 (Nadel am Projekt). |
| E19 | Sprint 3 | Darf größer werden; US-32 und US-33 kommen hinzu, US-30 wird Muss. |
| E20 | Probe löschen | Eine Probe, die noch einem Strickstück zugeordnet ist, kann nicht gelöscht werden; die App gibt einen Hinweis. Eine einstellbare Alternative ist als US-34 im Backlog. |
| E21 | Ziel im Zähler | Zielreihen = „Deine Reihen" (endgültige Reihenzahl) aus dem Rechner des Strickstücks, Ziellänge = „Tatsächliche Höhe (cm)". Die gestrickte Länge wird mit der eigenen Reihenprobe des Strickstücks berechnet. |
| E22 | Zu-/Abnahme im Zähler | Angezeigt werden letzte, nächste und übernächste Zu-/Abnahmereihe aus dem berechneten Plan, je mit Maschenzahl des Ereignisses (z. B. −2). In der Ereignisreihe selbst erscheint ein Hinweis mit Text und Farbe; die Darstellung kann sich nach dem Praxistest ändern. Die Zählerfeld-Variante a) (sichtbarer Rahmen + Stift) wird erprobt. |
| E23 | Zielquelle | Ist nur einer der Rechner „Reihen aus Anleitung" (US-04) und „Länge in Reihen" (US-06) gültig ausgefüllt, liefert er das Ziel. Sind beide gültig, wählt die Nutzerin im Zähler einmal, welcher gilt. |
| E24 | Randreihen | Die erste und die letzte Reihe eines Plans bleiben ohne Zu-/Abnahme. **Vorläufig** – wird mit der Enduserin geklärt und kann im Sprint noch geändert werden. In der Planung von Sprint 4 erneut prüfen. |
| E25 | Nur jede 2. Reihe/Runde | Bei gewendetem Stricken nur in **ungeraden** Reihen (Hinreihen), bei Runden in jeder zweiten Runde **beginnend mit Runde 3** (also ebenfalls ungerade Nummern). In der Planung von Sprint 4 erneut prüfen. |
| E26 | Plan als Zielquelle | Ein Strickstück mit Plan bietet den Plan (Reihen gesamt, Länge) als **dritte** wählbare Zielquelle im Zähler an, zusätzlich zu den beiden Rechnern aus E23. |
| E27 | Sprint-3-Umfang | US-25 (Proben einklappen) wird aus Sprint 3 herausgenommen, es gibt Diskussionsbedarf. Einzelne Ereignisreihen verschieben bleibt außerhalb von Sprint 3. |
| E28 | Auswahl Endmaschen (S3-01) | Ist die Differenz kleiner als die Maschen pro Zu-/Abnahme, bietet die App zusätzlich „keine Zu-/Abnahme" an (Endmaschen = Anfangsmaschen). Die getroffene Auswahl bleibt sichtbar und änderbar (S3-02). |

## Offene Punkte für die Planung von Sprint 4

Aus dem Backlog v2.6 und dem Praxistest MAS-56:

- **E24 bestätigen oder ändern:** Reicht je eine Randreihe ohne Zu-/Abnahme? Ausdrücklich als
  vorläufig markiert. Praxistest MAS-56 Prüfpunkt 3.
- **E25 bestätigen oder ändern:** ungerade Reihen bzw. ab Runde 3 bei „nur jede 2.".
- **Zählerfeld-Variante a bestätigen oder zurücknehmen** (Teil von E22): Stört der Rahmen beim
  Zählen? MAS-56 Prüfpunkt 4; bei Ablehnung Folgestory „Variante b" (US-33 AK5).
- **US-25 (MAS-29)** Proben einklappen: nach E27 zurückgestellt, Diskussionsbedarf.
- **Standard-Zielquelle „Plan"** (QA-Hinweis H1 aus dem Sprint-3-Testbericht): MAS-56 Prüfpunkt 5.

## Regeln für neue Entscheidungen

- Jede Entscheidung bekommt die nächste freie Nummer (nächste: **E29**) und wird hier eingetragen,
  sobald sie fällt – nicht erst am Sprintende.
- Vorläufige Entscheidungen werden ausdrücklich als vorläufig markiert und in die Liste der
  offenen Punkte aufgenommen.
- Jira-Vorgänge verweisen auf die Nummern, nicht umgekehrt. Diese Datei ist die Quelle für
  Entscheidungen, Jira die Quelle für Stories.
