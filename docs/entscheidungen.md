# Produktentscheidungen E1 bis E36

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
| E24 | Randreihen | **Die letzte Reihe eines Plans bleibt ohne Zu-/Abnahme** – das ist fest und gilt unverändert. Am Anfang ist die freie Reihe seit US-39 (MAS-62, umgesetzt in 0.4.0) nur noch die **Vorbelegung**: Standard ist „frühestens ab Reihe 2", mit „nur jede 2." ab Reihe 3. Die Nutzerin kann das bis Reihe 1 herunterziehen oder beliebig nach hinten verschieben (E31). Am 22.10.2026 bestätigt, nachdem der Praxistest von 0.3.0 die Regel nicht beanstandet hatte. |
| E25 | Nur jede 2. Reihe/Runde | Bei gewendetem Stricken nur in **ungeraden** Reihen (Hinreihen), bei Runden in jeder zweiten Runde **beginnend mit Runde 3**. **Die Enduserin hat das am 22.10.2026 abgelehnt** (MAS-61): Sie möchte die Startreihe selbst festlegen, statt einer festen Regel zu folgen. Die Umsetzung ist als US-39 (MAS-62) aufgenommen; ob und wann sie kommt, entscheidet der Auftraggeber. Bis dahin gilt die Regel unverändert. |
| E26 | Plan als Zielquelle | Ein Strickstück mit Plan bietet den Plan (Reihen gesamt, Länge) als **dritte** wählbare Zielquelle im Zähler an, zusätzlich zu den beiden Rechnern aus E23. |
| E27 | Sprint-3-Umfang | US-25 (Proben einklappen) wird aus Sprint 3 herausgenommen, es gibt Diskussionsbedarf. Einzelne Ereignisreihen verschieben bleibt außerhalb von Sprint 3. |
| E28 | Auswahl Endmaschen (S3-01) | Ist die Differenz kleiner als die Maschen pro Zu-/Abnahme, bietet die App zusätzlich „keine Zu-/Abnahme" an (Endmaschen = Anfangsmaschen). Die getroffene Auswahl bleibt sichtbar und änderbar (S3-02). |
| E29 | Sprint-4-Umfang | Sprint 4 „Überblick beim Stricken" (Epic MAS-60, Version 0.4.0) umfasst MAS-57 (Kartentitel berichtigen), US-37 (Maschenzahl je Ereignis), **US-39 (Startreihe selbst festlegen)** und US-38 (Kacheln zusammenklappen). **Noch am 22.10.2026 getauscht:** US-39 kam hinzu, US-25 ging dafür zurück in den Backlog. Begründung: US-39 ist ein fachlicher Wunsch der Enduserin, US-25 nur Bequemlichkeit – und so wird `js/plan.js` nur einmal angefasst statt zweimal. |
| E31 | Startreihe: Vorbelegung | Das Feld für die Startreihe der Zu-/Abnahmen ist **leer** vorbelegt, und leer bedeutet **„automatisch"**: Reihe 2 ohne „nur jede 2. Reihe/Runde", Reihe 3 mit der Option – genau das bisherige Verhalten. Setzt die Nutzerin einen eigenen Wert, gilt er unverändert, und die Parität folgt ihrer Wahl. Berichtigt AK1 von US-39 (MAS-62); Hintergrund ist der Architekturbefund H3. Abgestimmt mit der Enduserin. |
| E30 | Klapp-Mechanismus | US-25 und US-38 nutzen **einen gemeinsamen** Mechanismus und bleiben zwei Stories mit eigenen Akzeptanzkriterien: in der Projektansicht klappt automatisch ein, in der Strickstück-Ansicht nur auf Wunsch. Nach dem Tausch in E29 baut **US-38 den Mechanismus so, dass US-25 ihn später ohne Umbau nutzen kann**; US-25 liegt bis dahin im Backlog. |
| E32 | Darstellung der Längen | Längen können **dezimal oder als Bruch** angezeigt werden – eine dritte Einstellung, **unabhängig** von Sprache und Längeneinheit (E9). Umgesetzt als US-41 (MAS-74). Vorbelegt ist cm dezimal, Zoll als Bruch. Brüche werden auf **Achtel** gerundet und gekürzt dargestellt (½, ¼, ⅜ …). **Schränkt E5 ein:** Die zwei Nachkommastellen gelten künftig nur noch für **Dichten** (Maschen bzw. Reihen pro Einheit), nicht für Längen. Entschieden am 02.11.2026. |
| E33 | Bezugsmaß bei Zoll | Die Maschenprobe bezieht sich bei Zoll auf **4 Zoll** statt auf 10 cm – der US-Standard. Entspricht dem `standardBezug`, den `js/einheiten.js` seit Sprint 1 dafür vorsieht. Bestätigt am 02.11.2026; der Entwurf von US-24 (MAS-28) sah es schon so vor. |
| E34 | Umschalten der Einheit (**vorläufig**) | Beim Wechsel der Längeneinheit werden vorhandene Werte **umgerechnet**, nicht umgedeutet: Aus „10 cm“ wird „3,94 in“ bzw. „3⅞ in“. Der physische Wert bleibt also gleich, auch wenn krumme Zahlen entstehen. Ausdrücklich verworfen: die Zahlen stehen lassen und nur neu deuten – das verfälscht vorhandene Projekte still und widerspricht dem Grundsatz aus R6/R10. Eine Rückfrage beim Umschalten wurde nicht gewählt, weil ihre Option „Zahlen behalten“ genau diesen Fehler anbietet. **Deckt sich mit dem Entwurf von US-24 (MAS-28) aus Sprint 1**, der dasselbe schon vorsah – die Entscheidung bestätigt also eine alte Festlegung. **Noch nicht bestätigt.** |
| E35 | Nadelstärke (**vorläufig**) | Die Nadelstärke bleibt **immer in mm**, unabhängig von Sprache und Längeneinheit; E5 gilt in diesem Punkt unverändert. Begründung: Auch amerikanische Anleitungen nennen heute meist Millimeter mit, und die Tabelle der US-Größen ist nicht linear und nicht überall eindeutig. Die US-Größe zusätzlich anzuzeigen ist eine eigene Backlog-Story. **Noch nicht bestätigt.** |
| E36 | Sprint-5-Umfang | Sprint 5 „Englisch und Zoll“ (Version 0.5.0) umfasst **US-23** (Oberfläche auf Englisch, MAS-27), **US-24** (Längeneinheit Zoll, MAS-28) und **US-41** (wählbare Darstellung aus E32, MAS-74), Epic **MAS-73**. Die **Bruch­eingabe ist ausdrücklich nicht enthalten** und geht als **US-42 (MAS-75)** in Sprint 6: Sie berührt `UNVOLLSTAENDIG_MUSTER` in `js/eingabe.js` – den Code, aus dem die Befunde MAS-30 und MAS-31 stammen –, während der Nutzen fast vollständig im Lesen liegt. Entschieden am 02.11.2026. |

## Durch den Praxistest geklärt (21.10.2026, MAS-56 bestanden)

- **E24 ist bestätigt** und nicht mehr vorläufig.
- **Zählerfeld-Variante a** (Teil von E22) **bleibt.** Der sichtbare Rahmen mit Stift stört beim
  Zählen nicht; US-33 AK5 ist erfüllt, eine Folgestory für Variante b entfällt.
- **Standard-Zielquelle „Plan"** (QA-Hinweis H1 aus dem Sprint-3-Testbericht) wurde nicht
  beanstandet und bleibt.
- **US-25 und US-38** sind mit E30 geklärt: gemeinsamer Mechanismus, zwei Stories, beide in
  Sprint 4.

## Noch offen

- **E34 und E35 sind vorläufig** und gehören auf die Tagesordnung: das Verhalten beim Umschalten
  der Längeneinheit und die Nadelstärke. Beide sind so eingetragen, dass Sprint 5 damit arbeiten
  kann – eine andere Entscheidung ändert aber die Akzeptanzkriterien von US-24 (MAS-28).
- **US-25 (MAS-29)** liegt weiter im Backlog. Mit E30 ist geklärt, dass sie den Mechanismus aus
  US-38 ohne Umbau nutzen kann; offen ist nur, wann sie kommt.
- *(Erledigt mit 0.4.0)* **E25 und die Startreihe.** US-39 ist umgesetzt; E24 und E31 geben den
  neuen Stand wieder. Die frühere Frage, ob US-39 in Sprint 4 kommt, ist damit beantwortet.

## Regeln für neue Entscheidungen

- Jede Entscheidung bekommt die nächste freie Nummer (nächste: **E37**) und wird hier eingetragen,
  sobald sie fällt – nicht erst am Sprintende.
- Vorläufige Entscheidungen werden ausdrücklich als vorläufig markiert und in die Liste der
  offenen Punkte aufgenommen.
- Jira-Vorgänge verweisen auf die Nummern, nicht umgekehrt. Diese Datei ist die Quelle für
  Entscheidungen, Jira die Quelle für Stories.
