<!-- Original aus dem Claude-Projekt „Stricken und Häckeln", dort als
     anforderungen/anforderung-enduserin.md geführt. Am 22.10.2026 aus dem Chat-Export
     übernommen. Inhalt unverändert – alle 310 Inhaltszeilen sind geprüft enthalten.
     Der Export hatte die Tabellen in Einzelzeilen zerlegt; sie sind wieder aufgebaut.
     Nicht übernommen wurde der Gesprächsrahmen um das Dokument (eine Frage davor, ein
     Exkurs über Entwicklungswerkzeuge danach). -->

> **Ausgangsdokument, Version 1.0.** Die fachliche Grundlage des Projekts, entstanden aus einer
> Sprachnachricht der Enduserin und ihrer Excel-Datei. Wird **nicht fortgeschrieben**: Was daraus
> geworden ist, steht als User Stories in Jira, als Entscheidungen in `docs/entscheidungen.md` und
> als Technik in `docs/architektur/`. Hier erhalten als Nachweis, wo die Anforderungen herkommen.

# Produktanforderung: Strick-App mit Maschenrechner und Projektverwaltung

Anforderungsbeschreibung für den Product Owner · Version 1.0

## 1. Produktvision

Die geplante App soll Strickerinnen und Stricker dabei unterstützen, Strickprojekte zu planen, bestehende Strickanleitungen auf das eigene Garn und die eigene Maschenprobe umzurechnen und den Fortschritt während des Strickens festzuhalten.

Das zentrale Ziel ist, die bisher notwendigen manuellen Berechnungen zu automatisieren und in einer einfach zu bedienenden Anwendung zusammenzuführen.

Die App soll insbesondere drei Probleme lösen:

- Unterschiedliche Maschenproben: Strickanleitungen basieren häufig auf anderem Garn oder anderen Nadelstärken als den tatsächlich verwendeten. Die App soll die Angaben zuverlässig umrechnen.
- Formgebung von Strickstücken: Bei Ärmeln und anderen Strickstücken verändert sich die Breite. Die App soll berechnen, wann und wie viele Maschen zu- oder abgenommen werden müssen.
- Verwaltung mehrerer Projekte: Ein Strickprojekt besteht häufig aus mehreren Einzelteilen. Die App soll deren Maße, Berechnungen und aktuellen Bearbeitungsstand zentral speichern.
- Die bereitgestellte Excel-Datei „Maschenrechner.xlsx“ dient als fachliche Grundlage für bereits erprobte Berechnungen.

## 2. Zielgruppe und Nutzungskontext

Die primäre Zielgruppe sind Menschen, die regelmäßig stricken und sowohl eigene Projekte planen als auch mit vorhandenen Strickanleitungen arbeiten.

Die Anwendung soll während der Vorbereitung und während des Strickens verwendet werden können.

Typisches Anwendungsszenario:

Eine Nutzerin möchte einen Pullover für ihr Kind stricken. Sie hat eine Anleitung aus einem Strickbuch, verwendet aber anderes Garn. Deshalb weichen ihre Maschenprobe und die benötigten Maschen- und Reihenzahlen von der Anleitung ab.

Sie legt ein Projekt „Pullover für meinen Sohn“ an, hinterlegt ihre Maschenprobe und die Nadelstärke und erstellt die einzelnen Strickstücke. Anschließend berechnet die App die benötigten Maschen und Reihen, erstellt einen Abnahmeplan für die Ärmel und ermöglicht es ihr, den aktuellen Fortschritt zu speichern.

## 3. Funktionale Anforderungen

### FA-01: Maschenprobe erfassen und verwalten

Priorität: Muss

Die App muss die Eingabe einer individuellen Maschenprobe ermöglichen. Eine Maschenprobe beschreibt, wie viele Maschen und Reihen auf eine bestimmte Breite bzw. Höhe entfallen.

Eingabefelder:

| Feld | Beispiel |
|---|---|
| Anzahl Maschen | 25 |
| Breite der Maschenprobe | 10 cm |
| Anzahl Reihen | 37 |
| Höhe der Maschenprobe | 10 cm |
| Nadelstärke | 3,5 mm |

Die Maschenprobe soll einem Projekt zugeordnet und bei Bedarf geändert werden können.

Die App muss aus diesen Angaben automatisch die Maschen- und Reihendichte je Zentimeter berechnen.

Akzeptanzkriterien:

- Die Nutzerin kann Maschenzahl, Reihenzahl, Breite und Höhe eingeben.
- Die App berechnet Maschen und Reihen pro Zentimeter.
- Die App unterstützt Maschenproben mit anderen Bezugsmaßen als 10 × 10 cm.
- Die Nadelstärke kann gespeichert werden.
- Ungültige Werte, insbesondere null oder negative Maße, werden abgefangen.
- Änderungen an der Maschenprobe führen zur Neuberechnung abhängiger Ergebnisse.

### FA-02: Maße in Maschen und Reihen umrechnen

Priorität: Muss

Die App muss für eine gewünschte Breite die erforderliche Maschenzahl und für eine gewünschte Länge die erforderliche Reihenzahl berechnen.

**Beispiel: Interaktiver Maschenrechner**

| Feld | Wert |
|---|---|
| Maschen pro 10 cm | 25 |
| Reihen pro 10 cm | 37 |
| Gewünschte Breite (cm) | 40 |
| Gewünschte Länge (cm) | 30 |
| Benötigte Maschen | 100 |
| Benötigte Reihen | 111 |

Vereinfachtes Rechenbeispiel mit einer Maschenprobe von 10 × 10 cm und Rundung auf ganze Zahlen.

Akzeptanzkriterien:

- Die Umrechnung funktioniert in beide Richtungen: Zentimeter zu Maschen/Reihen und Maschen/Reihen zu Zentimetern.
- Ergebnisse werden auf ganze Maschen bzw. Reihen gerundet.
- Eine manuelle Anpassung des berechneten Ergebnisses ist möglich.
- Nach einer manuellen Anpassung wird das tatsächlich entstehende Maß angezeigt.

### FA-03: Bestehende Strickanleitungen umrechnen

Priorität: Muss

Die App muss ermöglichen, die Maschen- und Reihenangaben einer vorhandenen Strickanleitung auf die eigene Maschenprobe umzurechnen.

Dazu können zwei Maschenproben hinterlegt werden:

- Original-Maschenprobe: Die in der Anleitung angegebene Maschen- und Reihendichte.
- Eigene Maschenprobe: Die tatsächlich mit dem verwendeten Garn und der Nadelstärke ermittelte Dichte.
- Die App berechnet zunächst das Maß, das sich aus der Originalanleitung ergibt, und anschließend die dazu passende Maschen- oder Reihenzahl für die eigene Maschenprobe.

Beispiel aus der Excel-Datei:

| Probe | Maschen | Reihen |
|---|---|---|
| Originalanleitung | 34 Maschen / 10 cm | 52 Reihen / 10 cm |
| Eigene Maschenprobe | 25 Maschen / 10 cm | 37 Reihen / 10 cm |

**Umrechnung von 320 Maschen aus der Anleitung**

| Wert | Bedeutung |
|---|---|
| 320 | Originalmaschen |
| 94,12 cm | Originalbreite |
| 235 | Eigene Maschen |

Akzeptanzkriterien:

- Die Nutzerin kann Original- und eigene Maschenprobe getrennt hinterlegen.
- Eine beliebige Maschen- oder Reihenzahl der Originalanleitung kann umgerechnet werden.
- Die App zeigt das zugrunde liegende Maß in Zentimetern.
- Die App zeigt die neu berechnete Maschen- bzw. Reihenzahl.
- Eine manuelle Korrektur ist möglich.
- Die App zeigt die Maßabweichung nach der Rundung bzw. manuellen Korrektur.

### FA-04: Zu- und Abnahmen berechnen

Priorität: Muss

Die App muss für Strickstücke, deren Breite sich über die Länge verändert, einen konkreten Zu- oder Abnahmeplan berechnen können.

Dies ist insbesondere für Ärmel relevant, aber auch für andere konisch verlaufende Strickstücke.

Eingabefelder:

| Feld | Beispiel |
|---|---|
| Breite unten | 20 cm |
| Breite oben | 34 cm |
| Länge | 45 cm |
| Maschenprobe | 25 Maschen / 10 cm |
| Reihenprobe | 37 Reihen / 10 cm |
| Zu-/Abnahmen pro Ereignis | 2 Maschen |

Die App muss erkennen, ob Maschen zu- oder abgenommen werden müssen, und die entsprechenden Schritte möglichst gleichmäßig auf die verfügbare Reihenzahl verteilen.

Beispiel für eine Ärmelzunahme

Schematische Darstellung der Ärmelverbreiterung, nicht maßstabsgetreu.

Akzeptanzkriterien:

- Die App berechnet die Anfangs- und Endmaschenzahl.
- Sie berechnet die Gesamtzahl der erforderlichen Zu- oder Abnahmen.
- Sie erzeugt einen reihenbezogenen Plan mit konkreten Anweisungen, beispielsweise „In Reihe 12 zwei Maschen zunehmen“.
- Die Zu- oder Abnahmen werden möglichst gleichmäßig verteilt.
- Eine bevorzugte Anzahl an Maschen je Zu- oder Abnahmeereignis kann festgelegt werden.
- Falls die gewünschte Maschenverteilung mathematisch nicht exakt möglich ist, zeigt die App eine geeignete Alternative oder einen Hinweis.
- Die berechneten Werte lassen sich manuell anpassen.

### FA-05: Strickprojekte verwalten

Priorität: Muss

Die App muss das Anlegen, Bearbeiten und Speichern mehrerer unabhängiger Strickprojekte ermöglichen.

Jedes Projekt soll mindestens folgende Informationen enthalten:

| Feld | Beschreibung |
|---|---|
| Projektname | z. B. „Pullover für meinen Sohn“ |
| Beschreibung | Optionaler Freitext |
| Garn | Name bzw. Bezeichnung des verwendeten Garns |
| Nadelstärke | Verwendete Nadelstärke in mm |
| Maschenprobe | Individuelle Maschen- und Reihendichte |
| Strickstücke | Ein oder mehrere zugehörige Einzelteile |
| Fortschritt | Aktueller Bearbeitungsstand |

Akzeptanzkriterien:

- Mehrere Projekte können parallel angelegt und gespeichert werden.
- Jedes Projekt besitzt seine eigenen Daten und Berechnungen.
- Die Nutzerin kann zwischen Projekten wechseln, ohne Eingaben zu verlieren.
- Projekte können nachträglich bearbeitet werden.
- Ein Projekt kann aus einem oder mehreren Strickstücken bestehen.

### FA-06: Einzelne Strickstücke innerhalb eines Projekts verwalten

Priorität: Muss

Ein Projekt kann mehrere Strickstücke enthalten. Jedes Strickstück muss individuell geplant und berechnet werden können.

Beispielsweise kann ein klassischer Pullover aus vier Strickstücken bestehen: Vorderteil, Rückenteil, linker Ärmel und rechter Ärmel.

Bei einem Raglanpullover kann die Aufteilung anders aussehen: ein zusammenhängendes Rumpf-/Schulterteil und zwei separate Ärmel.

Akzeptanzkriterien:

- Die Anzahl der Strickstücke ist frei festlegbar.
- Jedes Strickstück besitzt eine individuelle Bezeichnung.
- Für jedes Strickstück können eigene Maße hinterlegt werden.
- Maschen- und Reihenzahlen werden individuell berechnet.
- Zu- und Abnahmepläne können einem bestimmten Strickstück zugeordnet werden.
- Die Strickstücke bleiben ihrem übergeordneten Projekt zugeordnet.

### FA-07: Reihenzähler und Fortschritt speichern

Priorität: Muss

Die App muss einen Reihenzähler bereitstellen, mit dem die Nutzerin den aktuellen Stand eines Strickstücks festhalten kann.

Akzeptanzkriterien:

- Für jedes Strickstück existiert ein eigener Reihenzähler.
- Der Zähler kann um eine Reihe erhöht oder verringert werden.
- Die aktuelle Reihenzahl kann direkt eingegeben werden.
- Der Stand wird dauerhaft gespeichert.
- Beim erneuten Öffnen eines Projekts wird der zuletzt gespeicherte Stand angezeigt.
- Falls ein Zu- oder Abnahmeplan existiert, wird angezeigt, wann die nächste Zu- oder Abnahme vorgesehen ist.

### FA-08: Garnbedarf und Lauflänge berechnen

Priorität: Kann / spätere Ausbaustufe

Die App soll optional eine Abschätzung des Garnbedarfs ermöglichen.

Dafür kann die Nutzerin einen empirisch ermittelten Garnverbrauch eingeben, beispielsweise die verbrauchte Fadenlänge für eine bestimmte Anzahl Maschen oder ein bekanntes Probestück.

Zusätzlich sollen die Lauflänge und das Gewicht eines Garnknäuels hinterlegt werden können.

Akzeptanzkriterien:

- Die Nutzerin kann einen Garnverbrauch als Referenzwert eingeben.
- Die App schätzt daraus den Verbrauch eines Strickstücks bzw. Projekts in Metern.
- Die Anzahl benötigter Knäuel wird aus der Lauflänge pro Knäuel berechnet.
- Die Berechnung wird als Schätzung gekennzeichnet, da Strickmuster, Garn, Nadelstärke und Stricktechnik den tatsächlichen Verbrauch beeinflussen.
- Optional kann ein Sicherheitszuschlag berücksichtigt werden.

## 4. Fachliche Berechnungsregeln

Die folgenden Berechnungen bilden die Grundlage der App. Sie orientieren sich an den Formeln aus der bereitgestellten Excel-Datei.

| Berechnung | Fachliche Formel |
|---|---|
| Maschen pro cm | Maschenprobe: Maschen ÷ Breite |
| Reihen pro cm | Maschenprobe: Reihen ÷ Höhe |
| Benötigte Maschen | Zielbreite × Maschen pro cm |
| Benötigte Reihen | Ziellänge × Reihen pro cm |
| Breite in cm | Maschenzahl ÷ Maschen pro cm |
| Länge in cm | Reihenzahl ÷ Reihen pro cm |
| Umrechnung aus Anleitung | Originalmaschen ÷ Originalmaschendichte × eigene Maschendichte |
| Differenz bei Formgebung | Endmaschenzahl − Anfangsmaschenzahl |
| Anzahl Zu-/Abnahmeereignisse | Betrag der Maschendifferenz ÷ Maschen pro Ereignis |

Für alle Berechnungen gelten folgende Regeln:

- Maschen und Reihen sind ganzzahlig.
- Zentimeterangaben dürfen Dezimalstellen enthalten.
- Standardmäßig wird mathematisch auf ganze Maschen bzw. Reihen gerundet.
- Die Rundungsstrategie muss bei Bedarf anpassbar sein, etwa auf gerade Maschenzahlen oder Musterrapporte.
- Bei Zu- und Abnahmen muss die App mögliche Restwerte sinnvoll verteilen.
- Ergebnisse müssen nach manuellen Korrekturen konsistent bleiben.
- Abgleich mit der vorhandenen Excel-Datei

In der Excel-Datei sind bereits mehrere der gewünschten Funktionen abgebildet:

| Excel-Bereich | Vorhandene Funktion | Entsprechende Anforderung |
|---|---|---|
| Zeilen 1–7 | Originale und eigene Maschenprobe | FA-01, FA-03 |
| Zeilen 9–11 | Maschenanschlag umrechnen | FA-03 |
| Zeilen 13–15 | Reihenanzahl umrechnen | FA-03 |
| Zeilen 17–19 | Zentimeter in Reihen umrechnen | FA-02 |
| Zeilen 21–23 | Maschenzahl auf eigene Probe umrechnen | FA-03 |
| Zeilen 25–27 | Breite in benötigte Maschen umrechnen | FA-02 |

Die Excel-Datei enthält außerdem manuelle Anpassungsfelder, deren Prinzip in der App erhalten bleiben sollte.

Wichtige fachliche Feststellung: Die Excel-Datei bildet bereits wesentliche Umrechnungsfunktionen ab, jedoch noch keine vollständige Projektverwaltung, Reihenzählung oder automatische Verteilung von Zu- und Abnahmen. Diese Funktionen sind neu zu konzipieren.

## 5. Datenmodell

Für die Produktentwicklung wird folgende fachliche Struktur vorgeschlagen:

```text
Projekt   Name · Garn · Nadelstärke · Maschenprobe
  │       (1 Projekt enthält mehrere Strickstücke)
  ├── Vorderteil    Maße · Berechnung · Fortschritt
  ├── Rückenteil    Maße · Berechnung · Fortschritt
  └── Ärmel         Maße · Berechnung · Fortschritt

Jedes Strickstück besitzt eigene Daten:
  Maschen & Reihen · Zu-/Abnahmeplan · Reihenzähler
```

Die Maschenprobe wird zunächst auf Projektebene gespeichert. Optional sollte es später möglich sein, für einzelne Strickstücke eine abweichende Maschenprobe zu verwenden, etwa wenn innerhalb eines Projekts verschiedene Muster oder Nadelstärken eingesetzt werden.

## 6. Nichtfunktionale Anforderungen

ID

Anforderung

NFA-01

Die App muss auf Smartphones gut bedienbar sein.

NFA-02

Die Eingabe von Zahlen und das Bedienen des Reihenzählers müssen mit wenigen Interaktionen möglich sein.

NFA-03

Berechnungen sollen unmittelbar nach einer Änderung aktualisiert werden.

NFA-04

Projektdaten und Fortschritt müssen nach dem Schließen und erneuten Öffnen erhalten bleiben.

NFA-05

Maße werden in Zentimetern, Nadelstärken in Millimetern und Garnlauflängen in Metern dargestellt.

NFA-06

Berechnungsergebnisse müssen nachvollziehbar und eindeutig beschriftet sein.

NFA-07

Die Oberfläche soll auch während des Strickens einfach bedienbar sein, insbesondere der Reihenzähler.

## 7. Priorisierung und MVP

Für eine erste nutzbare Version (Minimum Viable Product) empfehle ich, die Anforderungen in zwei Ausbaustufen aufzuteilen.

Phase 1 – MVP

Erste Version

Alle wesentlichen Funktionen, um ein Strickprojekt anzulegen, zu berechnen und während des Strickens zu begleiten.

- Maschenprobe erfassen
- Maße in Maschen und Reihen umrechnen
- Strickanleitungen auf eigene Maschenprobe umrechnen
- Zu- und Abnahmepläne berechnen
- Mehrere Projekte speichern
- Mehrere Strickstücke pro Projekt verwalten
- Reihenzähler mit gespeichertem Fortschritt
- Phase 2 – Erweiterungen

Funktionen, die den Nutzen erhöhen, aber für die erste produktive Version nicht zwingend erforderlich sind.

- Garnverbrauch und benötigte Knäuel schätzen
- Wiederverwendbare Maschenproben und Garnprofile
- Erweiterte Rundungsregeln und Musterrapporte
- Übersichtliche grafische Darstellung von Formgebung und Fortschritt
- Export oder Teilen von Berechnungen und Strickplänen

## 8. Offene fachliche Entscheidungen für den Product Owner

Vor der technischen Umsetzung sollten folgende Punkte abgestimmt werden:

- Zu- und Abnahmepläne: Sollen die Zu- und Abnahmen grundsätzlich symmetrisch an beiden Seiten erfolgen oder muss die Nutzerin frei festlegen können, wo sie stattfinden?
- Rundung: Soll die App nur auf ganze Maschen runden oder auch bevorzugt gerade Maschenzahlen, Musterrapporte und definierte Vielfache berücksichtigen?
- Strickrichtung: Soll ein Strickstück von unten nach oben und von oben nach unten geplant werden können?
- Reihenzähler: Reicht die aktuelle Reihenzahl oder sollen auch wiederkehrende Musterabschnitte und mehrere Zähler unterstützt werden?
- Maschenproben: Wird pro Projekt genau eine Maschenprobe benötigt oder müssen unterschiedliche Maschenproben innerhalb desselben Projekts möglich sein?
- Speicherung: Sollen Projekte ausschließlich auf einem Gerät oder geräteübergreifend verfügbar sein?
- Plattform: Ist zunächst eine mobile Web-App ausreichend oder werden native iOS- und Android-Apps benötigt?

## 9. Definition of Done für das MVP

Die erste Version gilt aus fachlicher Sicht als fertig, wenn eine Nutzerin ohne Excel-Tabelle:

- ein Strickprojekt mit mehreren Einzelteilen anlegen kann,
- ihre Maschenprobe erfassen kann,
- Maschen und Reihen aus einer bestehenden Anleitung auf ihre eigene Maschenprobe umrechnen kann,
- gewünschte Maße in benötigte Maschen und Reihen umrechnen kann,
- einen konkreten Zu- oder Abnahmeplan für einen Ärmel erstellen kann,
- den Fortschritt jedes Strickstücks getrennt speichern kann,
- ein bereits begonnenes Projekt jederzeit wieder öffnen und fortsetzen kann.

## 10. Empfehlung für die Übergabe an den Product Owner

Dieses Dokument eignet sich als fachliche Ausgangsbasis für ein Product Backlog. Der Product Owner sollte daraus konkrete User Stories mit überprüfbaren Akzeptanzkriterien ableiten und gemeinsam mit der Entwicklung die Umsetzung priorisieren.

Die wichtigsten nächsten Schritte sind die fachliche Klärung der Zu- und Abnahmelogik, die Festlegung der Rundungsregeln und die Entscheidung über die technische Plattform.

Meine Empfehlung: Die Berechnungslogik aus der Excel-Datei sollte möglichst unverändert als Ausgangspunkt dienen und durch automatisierte Tests abgesichert werden. Besonders viel Aufmerksamkeit verdient die Zu- und Abnahmeberechnung, weil hier nicht nur mathematisch richtige Ergebnisse, sondern auch praktisch gut strickbare Anweisungen entstehen müssen.

Damit hat der Product Owner eine Grundlage, um den Funktionsumfang zu bewerten, offene Fragen zu klären und die Entwicklung der ersten Version zu planen.
