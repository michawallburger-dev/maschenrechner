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
| E24 | Randreihen | Die erste und die letzte Reihe eines Plans bleiben ohne Zu-/Abnahme. **Am 22.10.2026 bestätigt** und damit nicht mehr vorläufig: Der Praxistest von 0.3.0 hat die Regel nicht beanstandet. |
| E25 | Nur jede 2. Reihe/Runde | Bei gewendetem Stricken nur in **ungeraden** Reihen (Hinreihen), bei Runden in jeder zweiten Runde **beginnend mit Runde 3** (also ebenfalls ungerade Nummern). **Weiterhin vorläufig** – wird mit der Enduserin geklärt, siehe MAS-61. |
| E26 | Plan als Zielquelle | Ein Strickstück mit Plan bietet den Plan (Reihen gesamt, Länge) als **dritte** wählbare Zielquelle im Zähler an, zusätzlich zu den beiden Rechnern aus E23. |
| E27 | Sprint-3-Umfang | US-25 (Proben einklappen) wird aus Sprint 3 herausgenommen, es gibt Diskussionsbedarf. Einzelne Ereignisreihen verschieben bleibt außerhalb von Sprint 3. |
| E28 | Auswahl Endmaschen (S3-01) | Ist die Differenz kleiner als die Maschen pro Zu-/Abnahme, bietet die App zusätzlich „keine Zu-/Abnahme" an (Endmaschen = Anfangsmaschen). Die getroffene Auswahl bleibt sichtbar und änderbar (S3-02). |
| E29 | Sprint-4-Umfang | Sprint 4 „Überblick beim Stricken" (Epic MAS-60, Version 0.4.0) umfasst MAS-57 (Kartentitel berichtigen), US-37 (Maschenzahl je Ereignis), US-38 (Kacheln zusammenklappen) und US-25 (Proben einklappen). US-25 kommt mit hinein, weil sie denselben Mechanismus braucht wie US-38. |
| E30 | Klapp-Mechanismus | US-25 und US-38 bekommen **einen gemeinsamen** Mechanismus, bleiben aber zwei Stories mit eigenen Akzeptanzkriterien: in der Projektansicht klappt automatisch ein, in der Strickstück-Ansicht nur auf Wunsch. |

## Durch den Praxistest geklärt (21.10.2026, MAS-56 bestanden)

- **E24 ist bestätigt** und nicht mehr vorläufig.
- **Zählerfeld-Variante a** (Teil von E22) **bleibt.** Der sichtbare Rahmen mit Stift stört beim
  Zählen nicht; US-33 AK5 ist erfüllt, eine Folgestory für Variante b entfällt.
- **Standard-Zielquelle „Plan"** (QA-Hinweis H1 aus dem Sprint-3-Testbericht) wurde nicht
  beanstandet und bleibt.
- **US-25 und US-38** sind mit E30 geklärt: gemeinsamer Mechanismus, zwei Stories, beide in
  Sprint 4.

## Noch offen

- **E25** bleibt vorläufig und wird mit der Enduserin geklärt. Eigener Vorgang: **MAS-61**. Das
  blockiert Sprint 4 nicht, weil keiner seiner vier Vorgänge die Verteilungsformel berührt.

## Regeln für neue Entscheidungen

- Jede Entscheidung bekommt die nächste freie Nummer (nächste: **E31**) und wird hier eingetragen,
  sobald sie fällt – nicht erst am Sprintende.
- Vorläufige Entscheidungen werden ausdrücklich als vorläufig markiert und in die Liste der
  offenen Punkte aufgenommen.
- Jira-Vorgänge verweisen auf die Nummern, nicht umgekehrt. Diese Datei ist die Quelle für
  Entscheidungen, Jira die Quelle für Stories.
