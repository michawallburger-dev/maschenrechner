# Änderungsprotokoll

## 0.3.0 – (Sprint 3 „Zu- und Abnahmen & Proben je Strickstück“, noch nicht veröffentlicht)

### Neu
- Mehrere Maschenproben pro Projekt, je mit Name und Nadelstärke; jedes Strickstück nutzt genau eine Probe, „Probe wechseln“ in der Strickstück-Ansicht (US-32)
- Zu-/Abnahmeplan je Strickstück: gleichmäßige Verteilung, Reihen oder Runden, „nur jede 2. Reihe/Runde“, Auswahl bei nicht teilbarer Differenz (US-13, US-14)
- Anpassung von Anfangsmaschen, Endmaschen und Reihen im Plan (US-16)
- Reihenzähler zeigt letzte, nächste und übernächste Zu-/Abnahme und in der Ereignisreihe den Hinweis „Jetzt: 2 M zunehmen“ (US-15)
- Reihenzähler zeigt das Ziel („39 von 80“) und die gestrickte Länge in cm; die Zielquelle ist wählbar, wenn es mehrere gibt (US-30)
- Die Reihenzahl im Zähler hat einen sichtbaren Rahmen und ein Stift-Symbol (US-33)

### Geändert
- Die Nadelstärke gehört jetzt zur Probe, nicht mehr zum Projekt
- Daten und Sicherungen aus 0.2 werden automatisch übernommen: Die bisherige Probe wird „Probe 1“; die Daten aus 0.2 bleiben unter dem alten Schlüssel unverändert

## 0.2.0 – (Sprint 2 „Projekte & Reihenzähler“, noch nicht veröffentlicht)

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
