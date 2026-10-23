# Änderungsprotokoll

## 0.4.0 – unveröffentlicht (Sprint 4 „Überblick beim Stricken")

Das Datum wird beim Veröffentlichen eingetragen. QA und Praxistest stehen noch aus.
Alle Punkte kommen aus dem Praxistest von 0.3.0 am 21.10.2026 mit der Enduserin.

### Neu
- Der Zu-/Abnahmeplan und der Reihenzähler nennen bei jedem Ereignis die Maschenzahl, mit der danach weitergestrickt wird, z. B. „Reihe 12: 2 M zunehmen → 52 M" (US-37)
- Die Reihe, ab der zu- oder abgenommen werden darf, lässt sich selbst festlegen („Frühestens ab Reihe"). Leer bedeutet automatisch: Reihe 2, mit „nur jede 2." Reihe 3 (US-39, Entscheidung E31)
- Die Karten eines Strickstücks lassen sich einzeln zuklappen. Zugeklappt zeigt die Karte ihr Hauptergebnis in Kurzform, und der Zustand bleibt gespeichert (US-38)

### Behoben
- P3-01: Die Karten „Breite in Maschen" und „Länge in Reihen" heißen jetzt „Aus Breite (cm) → Maschen" und „Aus Länge (cm) → Reihen". Dort werden Zentimeter eingegeben; die alten Titel haben zur Eingabe von Maschen verleitet.

### Geändert
- Mit „nur jede 2. Reihe/Runde" folgt die Parität der Zu-/Abnahmen jetzt der gewählten Startreihe und ist nicht mehr fest auf ungerade Reihen gelegt (E31 ersetzt die feste Regel aus E25)
- Entscheidung E24: Die letzte Reihe bleibt weiter ohne Zu-/Abnahme. Am Anfang ist die freie Reihe nur noch die Vorbelegung.

### Technisch
- Schema 3 bleibt. Die zwei neuen Felder sind optional; ihr Fehlen bedeutet das bisherige Verhalten. Kein neuer Speicherschlüssel, keine Migration – und eine noch installierte 0.3.0 kann Daten von 0.4.0 lesen und unverändert rechnen.
- 287 automatische Tests (vorher 224), darunter ein Regressionstest, der die Reihenformeln aus Sprint 3 noch einmal ausschreibt und über 400 Reihenzahlen gegen die neue Funktion vergleicht.

### Behoben nach der QA von Sprint 4
- S4-01: Die klappbaren Karten zeigen wieder ein Dreieck. `display: flex` auf dem `<summary>` hatte den Marker des Browsers entfernt – ohne ihn war nicht erkennbar, dass der Kartentitel antippbar ist.
- S4-02: Eine zugeklappte Karte verbarg Statusmeldungen wie „keine passende Reihe". Fehler und Hinweise stehen jetzt in der Kurzfassung und sind auch zugeklappt sichtbar.
- S4-03: Eine Karte mit Fehler ließ sich wieder zuklappen und blieb zu. Durch die Kurzfassung ist das jetzt unschädlich; das Zuklappen bleibt erlaubt.
- S4-04: Der Hinweis am Schalter „nur jede 2." sagte „ab der ersten", gemeint war die Startreihe.
- S4-05: Die Zielquelle im Zähler hieß weiter „Länge in Reihen" – so heißt seit dieser Version keine Karte mehr. Sie trägt jetzt denselben Namen wie die Karte.

### Bewusst nicht umgesetzt
- S4-06 (MAS-68): Eine noch installierte 0.3.0 liest Daten von 0.4.0 fehlerfrei, verliert beim nächsten Speichern aber Startreihe und Klapp-Zustand. Hingenommen und in Risiko R13 dokumentiert, weil der Fall nur bei einem zweiten Gerät ohne Update eintritt.

## 0.3.0 – 17.10.2026 (Sprint 3 „Zu- und Abnahmen & Proben je Strickstück“)

### Neu
- Mehrere Maschenproben pro Projekt, je mit Name und Nadelstärke; jedes Strickstück nutzt genau eine Probe, „Probe wechseln“ in der Strickstück-Ansicht (US-32)
- Zu-/Abnahmeplan je Strickstück: gleichmäßige Verteilung, Reihen oder Runden, „nur jede 2. Reihe/Runde“, Auswahl bei nicht teilbarer Differenz (US-13, US-14)
- Anpassung von Anfangsmaschen, Endmaschen und Reihen im Plan (US-16)
- Reihenzähler zeigt letzte, nächste und übernächste Zu-/Abnahme und in der Ereignisreihe den Hinweis „Jetzt: 2 M zunehmen“ (US-15)
- Reihenzähler zeigt das Ziel („39 von 80“) und die gestrickte Länge in cm; die Zielquelle ist wählbar, wenn es mehrere gibt (US-30)
- Die Reihenzahl im Zähler hat einen sichtbaren Rahmen und ein Stift-Symbol (US-33)

### Behoben nach der QA von Sprint 3
- S3-01: Ist die Differenz kleiner als die Maschen pro Zu-/Abnahme, gibt es zusätzlich die Option „keine Zu-/Abnahme“
- S3-02: Die Auswahl der Endmaschenzahl bleibt nach der Wahl sichtbar und lässt sich ändern
- S3-03: „nur 1 passende Reihe“ bzw. „keine passende Reihe“ statt „1 passende Reihen“
- S3-04: Die Plan-Zusammenfassung wird erst nach einer Sekunde ohne Änderung angesagt, nicht bei jedem Tastendruck
- S3-05: Die Stepper im Plan haben eindeutige Namen, z. B. „Maschen am Ende um 1 verringern“
- S3-06: Sind die gespeicherten Daten beschädigt und wird ein älterer Stand angezeigt, sagt die Warnung das ausdrücklich

### Geändert
- Die Nadelstärke gehört jetzt zur Probe, nicht mehr zum Projekt
- Daten und Sicherungen aus 0.2 werden automatisch übernommen: Die bisherige Probe wird „Probe 1“; die Daten aus 0.2 bleiben unter dem alten Schlüssel unverändert

## 0.2.0 – 16.10.2026 (Sprint 2 „Projekte & Reihenzähler“)

### Neu
- Projekte mit Name, Beschreibung, Garn, Nadelstärke und den beiden Maschenproben; Liste „Meine Projekte“, neueste zuerst (US-09)
- Strickstücke je Projekt (z. B. Vorderteil, Ärmel links), jedes mit eigenen vier Rechnern (US-10)
- Reihenzähler je Strickstück: große +.-Fläche, −1 mit Abstand, Direkteingabe, „Auf 0 setzen“ mit Rückfrage; Bildschirm bleibt an, wo das Gerät es erlaubt (US-11)
- Datensicherung als Datei über das Teilen-Menü (Dateien, Mail, AirDrop) und Einlesen mit Rückfrage (US-12)
- Farbschema wählbar: Wie System, Hell, Dunkel – über das Zahnrad oben rechts (US-26)
- Eingaben aus 0.1 werden automatisch in das Projekt „Mein Projekt“ übernommen; die alten Daten bleiben unverändert erhalten (US-27)

### Behoben
- MAS-30: „1.000“ wird in Maschen-, Reihen- und Zählerfeldern als tausend gelesen
- MAS-31: Beim Tippen einer Kommazahl („12,“) erscheint keine Fehlermeldung mehr; erst beim Verlassen des Feldes
- MAS-32: Änderungen an den Proben lösen keine Screenreader-Ansagen in den Rechnern mehr aus (Proben und Rechner liegen jetzt in getrennten Ansichten)
- MAS-33: Neue Versionen werden beim Update am HTTP-Cache vorbei geladen

### Behoben nach der QA von Sprint 2
- S2-01: Eine unbeantwortete Sicherheitsabfrage konnte nach der Zurück-Geste beim nächsten Dialog mit ausgeführt werden (z. B. Projekt gelöscht)
- S2-02: Der Bildschirm blieb an, wenn der Zähler sehr schnell wieder verlassen wurde
- S2-03: Projekte mit ungewöhnlichen IDs aus einer Sicherung ließen sich nicht öffnen
- S2-04: Hinweis, wenn die gespeicherten Daten nicht gelesen werden können
- S2-05: „Bildschirm kann nicht wachgehalten werden“ wird nicht mehr dauerhaft gemerkt, wenn es nur vorübergehend nicht geht
- S2-06: Lange Namen belegen in der Kopfzeile höchstens zwei Zeilen
- S2-07: Zu große Dateien werden vor dem Einlesen abgelehnt
- S2-08: Der Zählerstand wird auch bei gleichem Wert erneut angesagt

### Geändert
- „Alle Eingaben zurücksetzen“ ist jetzt „Eingaben zurücksetzen“ je Strickstück; der Reihenzähler bleibt dabei erhalten. Proben gehören zum Projekt.

### Bewusst nicht umgesetzt
- MAS-34 (Hinweis bei unrealistischen Maschenproben) – Entscheidung E14

## 0.1.0 – 16.10.2026 (Sprint 1 „Excel ersetzen“)
Erste nutzbare Version.

### Neu
- Maschenproben der Anleitung und die eigene Probe mit frei wählbaren Bezugsmaßen erfassen (US-01, US-02)
- Maschen- und Reihenzahlen aus der Anleitung auf die eigene Probe umrechnen, mit Anpassung (US-03, US-04)
- Breite und Länge in Maschen und Reihen umrechnen, laut Anleitung und mit eigener Probe (US-05, US-06)
- Eingaben bleiben lokal gespeichert, mit Knopf „Alle Eingaben zurücksetzen“ (US-07)
- Als App installierbar und offline nutzbar (US-08)
- Sprache und Längeneinheit technisch vorbereitet (bisher nur Deutsch und cm)

### Bekannte Einschränkungen (siehe Jira)
- MAS-30: „1.000“ in Maschen-/Reihenfeldern wird als 1 gelesen
- MAS-31: Fehlermeldung blitzt beim Tippen einer Kommazahl kurz auf
- MAS-32: Viele Screenreader-Ansagen bei Änderungen an einer Probe
- MAS-33: Nach einem Update können bis zu 10 Minuten lang alte Dateien geladen werden
- MAS-34: Unrealistische Maschenproben werden ohne Hinweis akzeptiert
