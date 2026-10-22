# Produktentscheidungen E1 bis E28

Fachliche Festlegungen der Auftraggeberseite. Sie begründen, **warum** die App etwas so tut,
und sind damit die Grundlage für jede Weiterentwicklung. Jira sagt, *was* gebaut wird; diese
Datei sagt, *warum*.

## Herkunft und Verlässlichkeit

Die Entscheidungen entstanden im Claude-Projekt „Stricken und Häckeln" und wurden dort in
`anforderungen/product-backlog.md` geführt (letzter bekannter Stand: Version 2.5). **Diese Datei
ist nicht im Repo und war beim Teilen der Chatverläufe ausgeblendet** („Dateien beim Teilen
ausgeblendet"). Die Tabelle unten ist daher am 22.10.2026 aus drei erreichbaren Quellen
rekonstruiert:

| Quelle | Kürzel |
|---|---|
| Jira-Epic MAS-1 „Sprint 1 – Excel ersetzen", Abschnitt „Getroffene Entscheidungen" | **J:MAS-1** |
| Jira-Epic MAS-3 „Sprint 3 – Zu- und Abnahmeplan", Abschnitt „Entscheidung E7" | **J:MAS-3** |
| Geteilter Chatverlauf Sprint 1+2 (`claude.ai/share/55d43ccd…`) | **C1** |
| Geteilter Chatverlauf Sprint 3 (`claude.ai/share/a7d72671…`) | **C2** |
| Aus Story-Beschreibungen erschlossen, Wortlaut nicht belegt | **erschlossen** |

Die Spalte „Quelle" ist kein Schmuck: Wo „erschlossen" steht, ist der Wortlaut **meine
Rekonstruktion**, nicht die ursprüngliche Festlegung. Diese Zeilen gehören beim nächsten
Durchgang mit der Auftraggeberseite bestätigt.

> **Lücke: E9 ist nicht mehr auffindbar.** Weder in Jira noch in den beiden geteilten
> Chatverläufen kommt E9 vor. Falls das Original-Backlog noch erreichbar ist, bitte nachtragen.

## Sprint 1 – Excel ersetzen (Version 0.1.0)

| # | Entscheidung | Quelle |
|---|---|---|
| E1 | Nur Stricken; eine Häkelversion kommt eventuell später. | J:MAS-1 |
| E2 | Frei wählbare Bezugsmaße der Maschenprobe (Standard 10 × 10 cm). Gerechnet wird immer über die Dichte pro cm. | J:MAS-1 |
| E3 | Für eine Breite oder Länge werden beide Werte gezeigt: nach Anleitung und nach eigener Probe. | J:MAS-1 |
| E4 | Kaufmännische Rundung auf ganze Maschen/Reihen plus manuelles Anpassungsfeld. | J:MAS-1 |
| E5 | cm mit 2 Nachkommastellen, Nadelstärke in mm, Komma und Punkt als Eingabe. | J:MAS-1 |
| E6 | Nur lokale Speicherung, keine Synchronisierung. | J:MAS-1 |
| E7 | Zu-/Abnahmen: Maschen pro Ereignis legt die Nutzerin fest (Standard 2). Arbeitsweise wählbar in Reihen (gewendet) oder in Runden. Option „nur jede 2. Reihe/Runde". Strickrichtung von unten nach oben und von oben nach unten. | J:MAS-3 |
| E8 | Excel-Zeilen 41–49 werden ignoriert. | J:MAS-1 |
| **E9** | **Nicht mehr auffindbar.** | — |

## Sprint 2 – Projekte & Reihenzähler (Version 0.2.0)

| # | Entscheidung | Quelle |
|---|---|---|
| E10 | Die Einstellungen liegen hinter einem Zahnrad in der Kopfzeile. Dort finden später auch Sprache und Einheit Platz. | C1 |
| E11 | Jeder Rechner gehört zu einem Projekt. Die Maschenproben gehören zum Projekt, die Rechner und der Reihenzähler zum einzelnen Strickstück. | C1 |
| E12 | Es gibt einen Zähler pro Strickstück, und beim Zählen bleibt der Bildschirm an. | C1 |
| E13 | „1.000" heißt in Maschen- und Reihenfeldern tausend. In cm-Feldern bleibt der Punkt ein Dezimaltrenner. | C1 |
| E14 | Ungewöhnliche Maschenproben lösen keinen Hinweis aus. MAS-34 ist geschlossen. | C1 |
| E15 | Die Datensicherung läuft über das Teilen-Menü (Dateien, Mail, AirDrop). | C1 |

## Sprint 3 – Zu-/Abnahmeplan & Proben je Strickstück (Version 0.3.0)

| # | Entscheidung | Quelle |
|---|---|---|
| E16 | Eine Probe ist immer ein Paar aus Anleitungsprobe und eigener Probe. Ein Projekt kann mehrere Paare haben. Mehrere eigene Proben zu einer Anleitung werden zurückgestellt und lassen sich über weitere Paare abbilden. | C2 |
| E17 | Hat ein Projekt nur eine Probe, wird sie neuen Strickstücken automatisch zugeordnet. Gibt es mehrere, fragt die App beim Anlegen, welche gelten soll. | C2 |
| E18 | Zählerfeld: Variante a) wird erprobt – sichtbarer Rahmen und Stift-Symbol. Der Praxistest am iPhone entscheidet, ob sie bleibt. | C2 |
| E19 | Sprint 3 darf größer werden. US-32 und US-33 kommen dazu. | C2 |
| E20 | Die Nadelstärke gehört zur Probe, nicht mehr zum Projekt. | erschlossen (MAS-47, CHANGELOG 0.3.0) |
| E21 | Der Reihenzähler zeigt das Ziel („39 von 80") und die gestrickte Länge in cm. | erschlossen (MAS-39) |
| E22 | Der Zähler zeigt letzte, nächste und übernächste Zu-/Abnahme; in der Ereignisreihe erscheint der Hinweis „Jetzt: 2 M zunehmen". | erschlossen (MAS-19, MAS-56) |
| E23 | Zielquelle: Ist das Ziel aus mehreren Quellen bestimmbar, ist die Quelle wählbar. | C2 (Kurzform), Ausgestaltung in MAS-39 AK2 |
| E24 | Je eine Randreihe am Anfang und am Ende bleibt ohne Zu- oder Abnahme. **Vorläufig** – kommt in Sprint 4 erneut auf den Tisch. | C2 |
| E25 | Bei „nur jede 2. Reihe" wird nur in ungeraden Reihen bzw. ab Runde 3 zu- oder abgenommen. **Kommt in Sprint 4 erneut auf den Tisch.** | C2 |
| E26 | Der Plan ist im Zähler als dritte Zielquelle wählbar. | C2 |
| E27 | US-25 (Proben automatisch einklappen) ist aus Sprint 3 herausgenommen. | C2 |
| E28 | Ist die Differenz kleiner als die Maschen pro Zu-/Abnahme, gibt es zusätzlich die Option „keine Zu-/Abnahme". Die getroffene Auswahl bleibt sichtbar und lässt sich ändern. | C2 |

## Offene Punkte, die eine Entscheidung brauchen

Diese Punkte sind in Sprint 3 bewusst offen geblieben und gehören auf die Tagesordnung des
nächsten Product-Owner-Durchgangs:

- **E24 bestätigen oder ändern:** Reicht je eine Randreihe ohne Zu-/Abnahme? Der Praxistest
  MAS-56 Punkt 3 prüft das.
- **E25 bestätigen oder ändern:** ungerade Reihen bzw. ab Runde 3 bei „nur jede 2. Reihe".
- **E18 bestätigen oder zurücknehmen:** Stört der Rahmen um das Zählerfeld beim Zählen?
  MAS-56 Punkt 4; bei Ablehnung Folgestory „Variante b".
- **US-25 (MAS-29):** laut E27 zurückgestellt, Diskussionsbedarf vermerkt.
- **E9 nachtragen**, falls das Original-Backlog noch erreichbar ist.

## Regeln für neue Entscheidungen

- Jede Entscheidung bekommt die nächste freie Nummer (nächste: **E29**) und wird hier
  eingetragen, sobald sie gefallen ist – nicht erst am Sprintende.
- Vorläufige Entscheidungen werden ausdrücklich als vorläufig markiert und in die Liste der
  offenen Punkte aufgenommen.
- Stories in Jira verweisen auf die Nummern, nicht umgekehrt. Diese Datei ist die Quelle für
  Entscheidungen, Jira die Quelle für Stories.
