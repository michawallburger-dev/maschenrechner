<!-- Original aus dem Claude-Projekt „Stricken und Häckeln“, dort als qa/sprint-3-testbericht.md geführt.
     Am 22.10.2026 aus dem Word-Export ins Repo übernommen; Inhalt unverändert,
     nur das Format ist jetzt Markdown. QA-Bericht zu v0.3.0. -->

# Testbericht Sprint 3 – „Zu- und Abnahmen & Proben je Strickstück“ (v0.3.0)

Rolle: QA · Stand: 17.10.2026 · Prüfgegenstand: Branch sprint-3, Commit 462beac (plus QA-Tests) Grundlage: Product Backlog v2.5 (US-32, US-13, US-14, US-15, US-30, US-16, US-33; E16–E27), Architektur Sprint 3 v3.1

**Ergebnis Nachtest (Commit 1dc3a61): Freigabe** – siehe Abschnitt 7.

**Ergebnis erster Lauf: Zurück an Entwickler** – keine kritischen oder hohen Fehler, aber 1 mittlerer Befund (S3-02), der im Praxistest sofort auffallen würde, und 5 niedrige Befunde. Alle Muss-Akzeptanzkriterien sind erfüllt.

## 1. Vorgehen

- Code-Review aller neuen und geänderten Dateien (31 Dateien), unabhängig vom Entwicklerbericht; auch die vom Entwickler angepassten Tests aus Sprint 1/2 (Absicht bleibt erhalten ✓)
- Automatische Tests: npm test (Node 22, ohne Abhängigkeiten) – **222 Tests, alle grün**, davon 15 neue QA-Tests in tests/qa-sprint3.test.js
- Browsertests mit Chromium (Playwright), 360 × 640 und 390 × 844 px mit Touch, Hell und Dunkel, offline – 81 Prüfungen (80 ✓, 1 ✗ = S3-02)
- Simulationen: Update von 0.1 und 0.2, Sicherung aus 0.2 über die Oberfläche, Zurück-Geste bei offenem Dialog, Tastatur (Escape), Kontrastmessung

**Nicht prüfbar in dieser Umgebung (Praxistest am iPhone, Teil der Definition of Done):** Update der installierten 0.2 auf 0.3 mit echten Daten, Bedienung beim Stricken (versehentliches Antippen des Zählerfelds, US-33 AK5), Darstellung des Hinweises „Jetzt“ (E22), Randreihen-Regel (E24), VoiceOver.

## 2. Automatische Tests

| **Bereich** | **Tests** | **Ergebnis** |
|---|---|---|
| Rechenlogik, Eingabe, Format, Texte, Einheiten, Zähler, Router (Sprint 1–2) | 74 | ✓ |
| Datenmodell, Übernahme, Speicher, Sicherung (an Schema 3 angepasst) | 58 | ✓ |
| QA Sprint 1 und 2 | 27 | ✓ |
| Neu Entwicklung: Plan, Ziel, Modell v3, Übernahme v3, Sicherung v3 | 48 | ✓ |
| Neu QA Sprint 3 (qa-sprint3.test.js) | 15 | ✓ |

**Eigene QA-Tests (unabhängig von der Implementierung formuliert):**

- Rundung der Grundwerte gegen exakte Ganzzahl-Arithmetik (BigInt): 60 000 Fälle, auch mit Bezugsmaßen 7,5 / 12,5 / 4 / 10,16 cm → 0 Abweichungen
- 20 000 zufällige Pläne: Summe = Differenz, Richtung, Randreihen frei (E24), nur ungerade Reihen ab 3 (E25), Abstände ±1/±2, Endmaschen < 1 Schritt neben der berechneten Zahl, Determinismus
- Grenzfall „genau so viele Ereignisse wie erlaubte Reihen“ → jede erlaubte Reihe belegt; eine mehr → Hinweis
- ereignisseUm gegen eine einfache Suche: 3 000 zufällige Listen
- Fuzz pruefeDaten (1 500 beschädigte Datensätze): idempotent, IDs routbar, jede Zuordnung zeigt auf eine vorhandene Probe
- Rundreisen: Sicherung 0.2 → einlesen → sichern → einlesen

## 3. Testfälle je Akzeptanzkriterium

**US-32 Mehrere Maschenproben pro Projekt**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | „Probe hinzufügen“ | „Probe 2“, Fokus auf dem Namen | wie erwartet | ✓ |
| AK1 | Umbenennen in „Ärmel“; Name leeren und Feld verlassen | Titel folgt; leer → alter Name zurück | wie erwartet | ✓ |
| AK1 | Bezugsmaß 0 in der eigenen Probe | Hinweis am Feld | ✓ | ✓ |
| AK2 | Nadel 3 an Probe „Ärmel“, Strickstück zuordnen | „Nadel 3 mm“ in der Strickstück-Ansicht | ✓ | ✓ |
| AK3 | Projektansicht | „Reihe 0 · Probe: Ärmel“ | ✓ | ✓ |
| AK4 | Neues Strickstück bei 2 Proben | Auswahl ohne Vorauswahl; ohne Wahl Hinweis | ✓ | ✓ |
| AK4 | Neues Projekt (1 Probe) | automatisch zugeordnet | ✓ | ✓ |
| AK5 | „Probe wechseln“ Glatt → Ärmel bei 320 M | Eingabe bleibt, 235 → 188 | ✓ | ✓ |
| AK5 | Dialog mit Escape schließen | nichts geändert | ✓ | ✓ |
| AK6 | Eigene Probe „Ärmel“ auf 30 M | nur Ärmel: 282; Vorderteil bleibt 235 | ✓ | ✓ |
| AK7 | Verwendete Probe löschen | Hinweis nennt „Ärmel links“, nur OK, nichts gelöscht | ✓ | ✓ |
| AK7 | Freie Probe löschen / letzte Probe löschen | Abfrage → gelöscht / Hinweis | ✓ | ✓ |
| AK8 | Update 0.2 (Nadel 3,5) | „Probe 1“ mit 3,5, alle Strickstücke zugeordnet, daten.v2 unverändert | ✓ | ✓ |
| AK8 | Update 0.1 (Nadel 4,5) | „Mein Projekt“, Probe 1 mit 4,5, 320 → 235, kein v2-Schlüssel | ✓ | ✓ |
| AK9 | Sicherung aus 0.2 über „Sicherung einlesen“ | Abfrage „1 Projekt, 2 Strickstücke und 1 Probe“, danach Probe 1 | ✓ | ✓ |

**US-13 Zu-/Abnahmeplan berechnen**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | „Plan anlegen“ | 2 M, Reihen, „jede 2.“ aus; Fokus Anfang | ✓ | ✓ |
| AK1 | Endbreite „abc“, „34,0“, „-5“, „0“, „1.000“ M/Ereignis | Hinweis bzw. Wert; „1.000“ = 1000 > 99 | ✓ | ✓ |
| AK2 | 20 → 34 cm, 45 cm, 25/37 | 50 / 85 / 167 | ✓ | ✓ |
| AK3 | gleiche Breite | „Keine Zu- oder Abnahmen nötig.“, keine Liste | ✓ | ✓ |
| AK3 | Breiten vertauscht, in Runden | „Runde …: 2 M abnehmen“ | ✓ | ✓ |
| AK4 | Differenz 35, 2 M | Auswahl „84 M · 33,60 cm · 17 Zunahmen“ / „86 M · 34,40 cm · 18 Zunahmen“, Frage nennt 35 M und 2 M | ✓ | ✓ |
| AK4 | Nach der Wahl | Wahl bleibt sichtbar und änderbar | **Auswahl verschwindet** | ✗ S3-02 |
| AK4 | 50 → 53 M bei 4 M | zwei nächstgelegene Endzahlen | nur 54 M | ✗ S3-01 |
| AK5 | alle Pläne | Reihe 1 und letzte Reihe frei | ✓ (Eigenschaftstest) | ✓ |
| AK6 | „nur jede 2. Reihe“ | nur ungerade ab 3, Abstände ±2 | 9, 17, 27, 35 … | ✓ |
| AK7 | Länge 1 cm | Hinweis, keine Liste | Hinweis (Grammatik S3-03) | ✓ |
| AK8 | Wahl „mehr“ | „18 × 2 M zunehmen, alle 8–9 Reihen“, Zeilen „Reihe 9: 2 M zunehmen“ | ✓ | ✓ |
| AK9 | Probe wechseln, Eingabe ändern | sofort neu | ✓ | ✓ |

**US-14 Plan beim Strickstück speichern**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | Anlegen, Plan löschen | Karte; Löschen mit Abfrage | ✓ | ✓ |
| AK2 | Neu laden | Eingaben und Wahl erhalten | ✓ | ✓ |
| AK3 | Projektansicht | „18 × 2 M zunehmen“ | ✓ | ✓ |
| AK4 | Zähler | Ereignisse aus dem Plan | ✓ | ✓ |
| AK5 | Sicherung 0.3 / 0.2 | Plan enthalten / 0.2 ohne Plan lesbar | ✓ | ✓ |

**US-16 Plan manuell anpassen (Soll)**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | Reihen −1 | 166, Info „berechnet 167 · tatsächliche Länge“ | ✓ | ✓ |
| AK2 | Ende +1 bei 85 | teilbar → 18 Zunahmen ohne Auswahl | ✓ | ✓ |
| AK3 | jede Anpassung | Plan und Zähler sofort neu | ✓ | ✓ |
| AK4 | „Anpassungen zurücksetzen“ | 167 | ✓ | ✓ |

**US-15 Zähler zeigt letzte, nächste, übernächste Zu-/Abnahme**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | Zähler auf 2. Ereignisreihe (22) | „Reihe 11: +2 M“, „Reihe 33: +2 M“, „Reihe 44: +2 M“ | ✓ | ✓ |
| AK2/AK3 | +1, −1, Direkteingabe | sofort aktualisiert | ✓ | ✓ |
| AK4 | ohne Plan / vor dem ersten Ereignis | Bereich entfällt / „–“ | ✓ | ✓ |
| AK5 | Ereignisreihe | „Jetzt: 2 M zunehmen“ mit Symbol; Kontrast 9,73:1 hell, 10,66:1 dunkel; Ansage „Reihe 22 von 120. Jetzt 2 Maschen zunehmen.“ | ✓ | ✓ |

**US-30 Ziel in Reihen und cm**

| **AK** | **Eingabe / Aktion** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1/AK2 | Rechner 13,5 cm | „von 50“ | ✓ | ✓ |
| AK3 | Zähler 37 | „10,00 cm von 13,51 cm“ | ✓ | ✓ |
| AK5 | ohne Rechnerergebnis | kein Ziel, „0,00 cm gestrickt“ | ✓ | ✓ |
| AK6 | Zähler 50, dann +1 | „Ziel erreicht“ (Text), 51 möglich | ✓ | ✓ |
| AK7 | Plan + Länge gültig | Auswahl sichtbar, Wahl gespeichert | ✓ (Standard: Plan, siehe H1) | ✓ |
| AK7 | gewählte Quelle ungültig | automatisch Plan, keine Auswahl | ✓ | ✓ |

**US-33 Zählerfeld erkennbar (Soll)**

| **AK** | **Prüfung** | **Erwartet** | **Tatsächlich** |  |
|---|---|---|---|---|
| AK1 | Rahmen | dauerhaft, ≥ 3:1 | 2 px, 8,07:1 hell / 8,34:1 dunkel | ✓ |
| AK2 | Antippen von Zahl oder Stift | Zahlentastatur | Fokus im Feld, inputmode=numeric | ✓ |
| AK3 | Zugänglicher Name | „Reihe eingeben“, Stift stumm | ✓ | ✓ |
| AK4 | „1.000“, −1 bei 0 | 1000, bleibt 0 | ✓ | ✓ |
| AK5 | versehentliches Antippen | – | nur im Praxistest | iPhone |

## 4. Querschnittsprüfungen

- **Datenschutz ✓:** keine Anfragen an fremde Adressen, kein innerHTML, keine Inline-Stile, CSP unverändert, Daten nur in localStorage; neue Daten sind Strickmaße und Namen.
- **Offline ✓:** Cache maschenrechner-v0.3.0, alle neuen Module darin (Test sw-liste); offline lädt der Zähler mit Plan.
- **Mobil ✓:** 360 px ohne waagrechtes Scrollen in Projekt, Strickstück (mit/ohne Plan) und Zähler; keine Bedienelemente unter 44 px; Zähler mit allen Elementen passt in 640 px Höhe, +1 dann genau 96 px; bei 390 × 844 px 358 × 463 px.
- **Barrierefreiheit ✓ mit Einschränkungen:** keine doppelten IDs, keine sichtbaren Textschlüssel, Dialoge mit Titel und Beschreibung, Auswahl als echte Radiogruppen, Escape schließt; siehe S3-04, S3-05.
- **Robustheit ✓:** Zurück-Geste bei offenem Dialog führt keine alte Aktion aus (S2-01-Regression), keine JavaScript-Fehler in allen Läufen.

## 5. Gefundene Fehler

| **#** | **Schwere** | **Befund** | **Nachstellen** | **Vorschlag** | **Jira** |
|---|---|---|---|---|---|
| **S3-02** | **Mittel** | Nach der Wahl „84 M / 86 M“ wird die Auswahl ausgeblendet. Die Wahl ist nicht mehr sichtbar und nur noch über „Anpassung Maschen am Ende“ änderbar. | Plan 20 → 34 cm, 45 cm → „86 M“ wählen | Auswahl sichtbar lassen, solange die Differenz nicht teilbar ist; gewählte Option markiert | MAS-52 |
| S3-01 | Niedrig | Ist die Differenz kleiner als die Maschen pro Ereignis, gibt es nur eine Option („mehr“); AK4 nennt zwei. | 50 → 53 M bei 4 M | PO entscheidet: Option „keine Zu-/Abnahme“ ergänzen oder einzige Option direkt übernehmen | MAS-53 |
| S3-03 | Niedrig | „… gibt es nur 1 passende Reihen.“ | Länge 1 cm | Einzahl/Mehrzahl | MAS-54 |
| S3-04 | Niedrig | Plan-Zusammenfassung ist Live-Region und ändert sich bei jedem Tastendruck → viele Ansagen beim Tippen | Code-Review | Ansage verzögern oder erst beim Verlassen | MAS-54 |
| S3-05 | Niedrig | Drei Stepper im Plan mit gleichem Namen „Anpassung um 1 verringern/erhöhen“ | Code-Review | Name mit Bezug („Maschen am Ende um 1 verringern“) | MAS-54 |
| S3-06 | Niedrig | Bei beschädigten 0.3-Daten wird still der alte Stand aus 0.2 angezeigt; die Warnung sagt nicht, dass es ein älterer Stand ist (nichts geht verloren, .v3.defekt bleibt). | daten.v3 = {x, daten.v2 vorhanden | Warntext ergänzen oder nicht auf 0.2 zurückfallen | MAS-55 |

**Hinweise (keine Fehler):**

- H1: US-30 AK7 – bei mehreren gültigen Quellen gilt zunächst der Plan, ohne dass die Nutzerin aktiv wählt; die Auswahl ist sichtbar und wird gemerkt. Bitte im Praxistest bestätigen.
- H2: US-32 AK5 – „Probe wechseln“ erscheint erst ab zwei Proben; „Proben ändern“ bleibt als Link zur Projektansicht.
- H3: Die vom Entwickler geänderten Tests aus Sprint 1/2 prüfen weiterhin dieselben Akzeptanzkriterien, nur mit Proben aus projekt.proben.

## 6. Ergebnis

**Zurück an Entwickler.** Sollte behoben werden: **S3-02**, dazu die kleinen Korrekturen **S3-03, S3-04, S3-05**. S3-01 braucht vorher eine Entscheidung des Product Owners; S3-06 kann mitbehoben oder ins Backlog übernommen werden.

Nach der Korrektur: Nachtest (Regression + S3-02 bis S3-05), danach Vorschau-Veröffentlichung und Praxistest am iPhone:

- Update der installierten 0.2: Proben, Nadel, Zählerstände erhalten
- Plan für einen Ärmel anlegen, Auswahl 84/86 treffen und wieder ändern
- Zählen bis in eine Zu-/Abnahmereihe: Hinweis „Jetzt“ (E22) und Randreihen-Regel (E24)
- Zählerfeld: stört versehentliches Antippen? (US-33 AK5)
- Offline (Flugmodus) öffnen

## 7. Nachtest nach den Korrekturen (Commit 1dc3a61)

**Code-Review:** Änderungen in plan.js, plankarte.js, app.js, texte.js, index.html und Tests geprüft. Die Option „keine Zu-/Abnahme“ entsteht nur als „weniger“ mit 0 Ereignissen und führt zum Status „keine Änderung“ (kein Plan, keine Ereignisse im Zähler, Zielquelle „Plan“ bleibt über die Reihen gültig). Keine neuen Abhängigkeiten, kein innerHTML.

**Automatische Tests:** 224 von 224 grün. Der QA-Test zu S3-01 prüft jetzt das vom Product Owner entschiedene Verhalten (Option „keine Zu-/Abnahme“).

**Regression:** QA-Browserlauf 81 von 81 ✓ (C11 an die neue Einzahl angepasst, C13b jetzt grün); Zähler bei 360 × 640 weiterhin ohne Scrollen, keine fremden Anfragen, keine JavaScript-Fehler.

| **#** | **Nachtest** | **Ergebnis** | **Jira** |
|---|---|---|---|
| S3-01 | 50 → 53 M bei 4 M | „50 M · 20,00 cm · keine Zu-/Abnahme“ und „54 M · 21,60 cm · 1 Zunahme“; Wahl „keine“ → „Keine Zu- oder Abnahmen nötig.“, keine Liste | MAS-53 ✓ |
| S3-02 | Wahl 84 M, dann 86 M | Auswahl bleibt sichtbar, gewählte Option markiert, Wechsel → 18 Zunahmen | MAS-52 ✓ |
| S3-03 | 3 bzw. 2 Reihen gesamt | „nur 1 passende Reihe“ / „keine passende Reihe“ | MAS-54 ✓ |
| S3-04 | Länge schnell zweimal ändern | keine Ansage während des Tippens, nach 1 s genau eine; nichts beim Öffnen | MAS-54 ✓ |
| S3-05 | Namen der Stepper | sechs eindeutige Namen, z. B. „Maschen am Ende um 1 verringern“ | MAS-54 ✓ |
| S3-06 | daten.v3 beschädigt, daten.v2 vorhanden / nicht vorhanden | Warnung nennt „älterer Stand aus Version 0.2“ / bisherige Warnung | MAS-55 ✓ |

**Neue Befunde im Nachtest:** keine.

**Ergebnis: Freigabe** für Version 0.3.0.

**Hinweis an den Product Owner:** Die Entscheidung zu S3-01 („keine Zu-/Abnahme“ als Option) sollte als Entscheidung im Backlog stehen.

**Vor der Veröffentlichung am iPhone (Praxistest, Teil der Definition of Done):**

- Update der installierten 0.2: Proben, Nadel, Zählerstände erhalten
- Plan für einen Ärmel anlegen, Auswahl 84/86 treffen und wieder ändern
- Zählen bis in eine Zu-/Abnahmereihe: Hinweis „Jetzt“ (E22) und Randreihen-Regel (E24)
- Zählerfeld: stört versehentliches Antippen? (US-33 AK5)
- Ziel aus mehreren Quellen: passt der Standard „Plan“? (H1)
- Offline (Flugmodus) öffnen
