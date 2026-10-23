/**
 * Alle Texte der Oberfläche, je Sprache.
 *
 * Reine Daten plus reine Funktionen. Die Sprache ist unabhängig von der
 * Längeneinheit einstellbar: Kein Text enthält eine Einheit fest, sondern den
 * Platzhalter {einheit}. Das Kürzel selbst steht unter „einheit.<kürzel>“.
 *
 * Eine weitere Sprache wird später als zusätzlicher Eintrag in SPRACHEN
 * ergänzt (z. B. en: { locale: 'en-GB', texte: { … } }).
 */

export const STANDARD_SPRACHE = 'de';

export const SPRACHEN = Object.freeze({
  de: Object.freeze({
    locale: 'de-DE',
    texte: Object.freeze({
      // Allgemein
      'app.titel': 'Maschenrechner',
      'app.untertitel': 'Anleitung auf deine Maschenprobe umrechnen',
      'einheit.cm': 'cm',

      // Maschenproben
      'proben.titel': 'Maschenproben',
      'proben.anleitung': 'Laut Anleitung',
      'proben.eigen': 'Eigene Probe',
      'proben.maschen': 'Maschen',
      'proben.reihen': 'Reihen',
      'proben.bezugBreite': 'auf Breite ({einheit})',
      'proben.bezugHoehe': 'auf Höhe ({einheit})',
      'proben.dichteMaschen': 'Maschen pro {einheit}',
      'proben.dichteReihen': 'Reihen pro {einheit}',
      'proben.nadel': 'Nadelstärke (mm)',
      'proben.nadelHinweis': 'Nur zur Information – fließt nicht in die Berechnung ein.',

      // Rechner 1: Maschen aus der Anleitung (US-03)
      'rechner.maschenAusAnleitung.titel': 'Maschen aus der Anleitung',
      'rechner.maschenAusAnleitung.beschreibung': 'Rechnet eine Maschenzahl aus der Anleitung auf deine Probe um.',
      'rechner.maschenAusAnleitung.eingabe': 'Maschen laut Anleitung',
      'rechner.maschenAusAnleitung.massAnleitung': 'Breite laut Anleitung ({einheit})',
      'rechner.maschenAusAnleitung.eigenGerundet': 'Eigene Maschen, gerundet',
      'rechner.maschenAusAnleitung.endgueltig': 'Deine Maschen',
      'rechner.maschenAusAnleitung.tatsaechlich': 'Tatsächliche Breite ({einheit})',
      'rechner.maschenAusAnleitung.abweichung': 'Abweichung zur Anleitung ({einheit})',

      // Rechner 2: Reihen aus der Anleitung (US-04)
      'rechner.reihenAusAnleitung.titel': 'Reihen aus der Anleitung',
      'rechner.reihenAusAnleitung.beschreibung': 'Rechnet eine Reihenzahl aus der Anleitung auf deine Probe um.',
      'rechner.reihenAusAnleitung.eingabe': 'Reihen laut Anleitung',
      'rechner.reihenAusAnleitung.massAnleitung': 'Höhe laut Anleitung ({einheit})',
      'rechner.reihenAusAnleitung.eigenGerundet': 'Eigene Reihen, gerundet',
      'rechner.reihenAusAnleitung.endgueltig': 'Deine Reihen',
      'rechner.reihenAusAnleitung.tatsaechlich': 'Tatsächliche Höhe ({einheit})',
      'rechner.reihenAusAnleitung.abweichung': 'Abweichung zur Anleitung ({einheit})',

      // Rechner 3: aus einer Breite in cm die Maschen (US-05)
      // Titel nennt die Eingabe, nicht das Ergebnis (MAS-57, P3-01)
      'rechner.breiteZuMaschen.titel': 'Aus Breite ({einheit}) → Maschen',
      'rechner.breiteZuMaschen.beschreibung': 'Wie viele Maschen brauchst du für eine bestimmte Breite?',
      'rechner.breiteZuMaschen.eingabe': 'Gewünschte Breite ({einheit})',
      'rechner.breiteZuMaschen.anleitungGerundet': 'Maschen laut Anleitung, gerundet',
      'rechner.breiteZuMaschen.eigenGerundet': 'Eigene Maschen, gerundet',
      'rechner.breiteZuMaschen.endgueltig': 'Deine Maschen',
      'rechner.breiteZuMaschen.tatsaechlich': 'Tatsächliche Breite ({einheit})',
      'rechner.breiteZuMaschen.abweichung': 'Abweichung zur gewünschten Breite ({einheit})',

      // Rechner 4: aus einer Länge in cm die Reihen (US-06)
      // Titel nennt die Eingabe, nicht das Ergebnis (MAS-57, P3-01)
      'rechner.laengeZuReihen.titel': 'Aus Länge ({einheit}) → Reihen',
      'rechner.laengeZuReihen.beschreibung': 'Wie viele Reihen brauchst du für eine bestimmte Länge?',
      'rechner.laengeZuReihen.eingabe': 'Gewünschte Länge ({einheit})',
      'rechner.laengeZuReihen.anleitungGerundet': 'Reihen laut Anleitung, gerundet',
      'rechner.laengeZuReihen.eigenGerundet': 'Eigene Reihen, gerundet',
      'rechner.laengeZuReihen.endgueltig': 'Deine Reihen',
      'rechner.laengeZuReihen.tatsaechlich': 'Tatsächliche Länge ({einheit})',
      'rechner.laengeZuReihen.abweichung': 'Abweichung zur gewünschten Länge ({einheit})',

      // Anpassung
      'anpassung.label': 'Anpassung',
      'anpassung.hinweis': 'Ganze Zahl, z. B. +1 oder −2',
      'anpassung.minus': 'Anpassung um 1 verringern',
      'anpassung.plus': 'Anpassung um 1 erhöhen',

      // Hinweise
      'hinweis.probenFehlen': 'Bitte zuerst beide Maschenproben vollständig ausfüllen.',
      'hinweis.ergebnisZuKlein': 'Mit dieser Anpassung bleibt weniger als 1 übrig. Bitte die Anpassung ändern.',
      'hinweis.speicherNichtVerfuegbar': 'Eingaben können auf diesem Gerät nicht gespeichert werden.',

      // Fehlermeldungen zu den Codes aus eingabe.js
      'fehler.LEER': 'Bitte einen Wert eingeben.',
      'fehler.KEINE_ZAHL': 'Bitte eine Zahl eingeben, z. B. 12 oder 12,5.',
      'fehler.KEINE_GANZZAHL': 'Bitte eine ganze Zahl eingeben.',
      'fehler.NICHT_POSITIV': 'Der Wert muss größer als 0 sein.',
      'fehler.ZU_GROSS': 'Der Wert darf höchstens {grenze} sein.',
      'fehler.ZU_KLEIN': 'Der Wert muss mindestens {grenze} sein.',

      // Zurücksetzen
      'zuruecksetzen.knopf': 'Alle Eingaben zurücksetzen',
      'zuruecksetzen.titel': 'Alle Eingaben zurücksetzen?',
      'zuruecksetzen.text': 'Beide Maschenproben, die Nadelstärke und alle Rechner werden geleert. Das lässt sich nicht rückgängig machen.',
      'zuruecksetzen.abbrechen': 'Abbrechen',
      'zuruecksetzen.bestaetigen': 'Zurücksetzen',

      // Fußzeile
      'fuss.datenschutz': 'Alle Eingaben bleiben auf diesem Gerät. Es werden keine Daten übertragen.',

      // ---------------------------------------------------------- ab Version 0.2

      // Kopfzeile und Seitentitel
      'kopf.zurueck': 'Zurück',
      'kopf.einstellungen': 'Einstellungen',
      'titel.projektliste': 'Meine Projekte',
      'titel.einstellungen': 'Einstellungen',
      'titel.seite': '{ansicht} – Maschenrechner',

      // Allgemeine Knöpfe in Dialogen
      'dialog.abbrechen': 'Abbrechen',
      'dialog.anlegen': 'Anlegen',
      'dialog.speichern': 'Speichern',
      'dialog.loeschen': 'Löschen',
      'dialog.ok': 'OK',

      // Mengen
      'anzahl.projekt.keins': 'keine Projekte',
      'anzahl.projekt.eins': '1 Projekt',
      'anzahl.projekt.mehr': '{n} Projekte',
      'anzahl.stueck.keins': 'keine Strickstücke',
      'anzahl.stueck.eins': '1 Strickstück',
      'anzahl.stueck.mehr': '{n} Strickstücke',
      'zeit.heute': 'heute',
      'zeit.gestern': 'gestern',
      'liste.geaendert': 'geändert {wann}',

      // Projektliste (US-09)
      'liste.leer.titel': 'Noch keine Projekte',
      'liste.leer.text': 'Lege dein erstes Strickprojekt an, z. B. „Pullover für meinen Sohn“.',
      'liste.neu': 'Neues Projekt',
      'dialog.neuesProjekt.titel': 'Neues Projekt',
      'dialog.neuesProjekt.label': 'Name des Projekts',
      'fehler.NAME_LEER': 'Bitte einen Namen eingeben.',

      // Projekt (US-09, US-10)
      'projekt.angaben': 'Angaben',
      'projekt.name': 'Name',
      'projekt.beschreibung': 'Beschreibung (optional)',
      'projekt.garn': 'Garn (optional)',
      'projekt.nadel': 'Nadelstärke in mm (optional)',
      'projekt.strickstuecke': 'Strickstücke',
      'projekt.keineStuecke': 'Noch keine Strickstücke. Lege z. B. „Vorderteil“ oder „Ärmel links“ an.',
      'projekt.stueckNeu': 'Strickstück hinzufügen',
      'projekt.reihe': 'Reihe {n}',
      'projekt.loeschen': 'Projekt löschen',
      'dialog.projektLoeschen.titel': 'Projekt löschen?',
      'dialog.projektLoeschen.text': '„{name}“ mit {stuecke} wird gelöscht. Das lässt sich nicht rückgängig machen.',
      'dialog.neuesStueck.titel': 'Neues Strickstück',
      'dialog.neuesStueck.label': 'Name des Strickstücks',
      'vorschlag.vorderteil': 'Vorderteil',
      'vorschlag.rueckenteil': 'Rückenteil',
      'vorschlag.aermelLinks': 'Ärmel links',
      'vorschlag.aermelRechts': 'Ärmel rechts',

      // Übernahme aus 0.1 (US-27)
      'migration.projektName': 'Mein Projekt',
      'migration.stueckName': 'Teil 1',
      'hinweis.uebernommen': 'Neu in Version 0.2: Deine bisherigen Eingaben stehen jetzt in diesem Projekt, im Strickstück „Teil 1“. Über „Zurück“ siehst du alle Projekte und kannst weitere anlegen.',
      'hinweis.verstanden': 'Verstanden',
      'hinweis.datenBeschaedigt': 'Deine gespeicherten Daten konnten nicht gelesen werden. Falls du eine Sicherung hast, lies sie über das Zahnrad → „Sicherung einlesen“ wieder ein.',
      'hinweis.datenBeschaedigtAlt': 'Deine gespeicherten Daten konnten nicht gelesen werden. Angezeigt wird ein älterer Stand aus Version {version} – neuere Änderungen, z. B. Zählerstände, Proben und Pläne, fehlen darin. Falls du eine Sicherung hast, lies sie über das Zahnrad → „Sicherung einlesen“ wieder ein.',
      'ersatz.projekt': 'Projekt {nr}',
      'ersatz.strickstueck': 'Teil {nr}',

      // Strickstück (US-10)
      'stueck.zaehlen': 'Reihen zählen',
      // Kurzfassung einer zugeklappten Karte (US-38 AK5)
      'stueck.kurzfassung': '{titel}: {wert}',
      // Hinweis oder Fehler einer zugeklappten Karte (Befunde S4-02, S4-03)
      'stueck.kurzfassungProblem': 'Bitte prüfen: {text}',
      'stueck.zaehlerStand': 'Reihe {n}',
      'stueck.proben': 'Maschenproben des Projekts',
      'stueck.probeZeile': '{name}: {m} M auf {mb} {einheit} · {r} R auf {rb} {einheit}',
      'stueck.probenAendern': 'Proben ändern',
      'stueck.umbenennen': 'Umbenennen',
      'stueck.zuruecksetzen': 'Eingaben zurücksetzen',
      'stueck.loeschen': 'Strickstück löschen',
      'dialog.umbenennen.titel': 'Strickstück umbenennen',
      'dialog.stueckLoeschen.titel': 'Strickstück löschen?',
      'dialog.stueckLoeschen.text': '„{name}“ mit Zählerstand {n} und allen Eingaben wird gelöscht. Das lässt sich nicht rückgängig machen.',
      'dialog.stueckZuruecksetzen.titel': 'Eingaben zurücksetzen?',
      'dialog.stueckZuruecksetzen.text': 'Alle Rechner-Eingaben von „{name}“ werden geleert. Der Reihenzähler bleibt erhalten.',
      'dialog.zuruecksetzen.ok': 'Zurücksetzen',
      'hinweis.probenLink': 'Zu den Maschenproben',
      'fehler.UNVOLLSTAENDIG': 'Bitte die Zahl vervollständigen, z. B. 12,5.',

      // Reihenzähler (US-11)
      'zaehler.eingabeLabel': 'Aktuelle Reihe',
      'zaehler.plus': '+1',
      'zaehler.plusLabel': 'Eine Reihe weiter',
      'zaehler.minus': '−1',
      'zaehler.minusLabel': 'Eine Reihe zurück',
      'zaehler.ansage': 'Reihe {n}',
      'zaehler.null': 'Auf 0 setzen',
      'dialog.zaehlerNull.titel': 'Zähler auf 0 setzen?',
      'dialog.zaehlerNull.text': 'Der Zählerstand von „{name}“ ({n}) wird auf 0 gesetzt.',
      'zaehler.wachAktiv': 'Der Bildschirm bleibt an, solange diese Ansicht offen ist.',
      'zaehler.wachAbgelehnt': 'Der Bildschirm kann gerade nicht wachgehalten werden, z. B. im Stromsparmodus oder auf dem iPhone vor iOS 18.4. Es hilft, in den iPhone-Einstellungen die „Automatische Sperre“ zu verlängern.',
      'zaehler.wachNicht': 'Dieses Gerät kann den Bildschirm nicht wachhalten. Auf dem iPhone geht das in der installierten App ab iOS 18.4. Bis dahin hilft es, in den iPhone-Einstellungen die „Automatische Sperre“ zu verlängern.',

      // Einstellungen (US-26, US-12)
      'einst.farbschema': 'Farbschema',
      'einst.system': 'Wie System',
      'einst.hell': 'Hell',
      'einst.dunkel': 'Dunkel',
      'einst.daten': 'Datensicherung',
      'einst.datenText': 'Deine Daten liegen nur auf diesem Gerät. Sichere sie regelmäßig als Datei, z. B. in „Dateien“ oder per Mail an dich selbst.',
      'einst.datenWarnung': 'Die Datei enthält alle deine Projekte. Teile sie nur mit Personen, denen du vertraust.',
      'einst.sichern': 'Daten sichern',
      'einst.einlesen': 'Sicherung einlesen',
      'einst.status.geteilt': 'Die Sicherung wurde erstellt.',
      'einst.status.heruntergeladen': 'Die Sicherung wurde heruntergeladen.',
      'einst.status.abgebrochen': 'Teilen abgebrochen – es wurde keine Sicherung gespeichert.',
      'einst.status.eingelesen': 'Sicherung eingelesen: {projekte}.',
      'einst.status.speicherFehler': 'Die Sicherung konnte nicht übernommen werden, weil der Speicher dieses Geräts nicht verfügbar ist.',
      'einst.version': 'Version {version}',
      'dialog.import.titel': 'Sicherung einlesen?',
      'dialog.import.text': 'Die Datei vom {datum} enthält {projekte}, {stuecke} und {proben}. Alle Daten auf diesem Gerät werden dadurch ersetzt.',
      'dialog.import.ok': 'Ersetzen',
      'dialog.import.fehlerTitel': 'Datei kann nicht eingelesen werden',
      'import.unbekanntesDatum': 'unbekannten Datum',
      'import.fehler.ZU_GROSS': 'Die Datei ist zu groß für eine Sicherung des Maschenrechners. Es wurde nichts verändert.',
      'import.fehler.KEIN_JSON': 'Diese Datei ist keine Sicherung des Maschenrechners oder ist beschädigt. Es wurde nichts verändert.',
      'import.fehler.FALSCHE_APP': 'Diese Datei stammt nicht vom Maschenrechner. Es wurde nichts verändert.',
      'import.fehler.UNBEKANNTES_FORMAT': 'Diese Sicherung stammt aus einer neueren Version des Maschenrechners. Bitte die App aktualisieren. Es wurde nichts verändert.',
      'import.fehler.DATEN_UNGUELTIG': 'Die Sicherung ist beschädigt. Es wurde nichts verändert.',
      'import.fehler.LESEN': 'Die Datei konnte nicht gelesen werden. Es wurde nichts verändert.',

      // ---------------------------------------------------------- ab Version 0.3

      // Mengen
      'anzahl.probe.keins': 'keine Proben',
      'anzahl.probe.eins': '1 Probe',
      'anzahl.probe.mehr': '{n} Proben',

      // Mehrere Proben pro Projekt (US-32)
      'probe.standardname': 'Probe {n}',
      'probe.name': 'Name der Probe',
      'probe.nadel': 'Nadelstärke in mm (optional)',
      'probe.hinzufuegen': 'Probe hinzufügen',
      'probe.loeschen': 'Probe löschen',
      'probe.kurz': '{name} · Nadel {nadel} mm',
      'probe.kurzOhneNadel': '{name}',
      'probe.verwendetTitel': 'Probe wird noch verwendet',
      'probe.verwendet': '„{name}“ wird noch von {stuecke} verwendet. Ordne diesen Strickstücken zuerst eine andere Probe zu.',
      'probe.letzteTitel': 'Letzte Probe',
      'probe.letzte': 'Jedes Projekt braucht mindestens eine Probe. Die letzte Probe kann nicht gelöscht werden.',
      'dialog.probeLoeschen.titel': 'Probe löschen?',
      'dialog.probeLoeschen.text': '„{name}“ wird gelöscht. Das lässt sich nicht rückgängig machen.',
      'dialog.neuesStueck.probe': 'Welche Probe gilt?',
      'dialog.neuesStueck.probeFehlt': 'Bitte eine Probe auswählen.',
      'dialog.probeWechseln.titel': 'Probe wechseln',
      'dialog.probeWechseln.frage': 'Mit welcher Probe soll „{name}“ gerechnet werden?',
      'projekt.stueckProbe': 'Probe: {name}',
      'stueck.probe': 'Probe',
      'stueck.probeWechseln': 'Probe wechseln',
      'stueck.probeName': 'Probe: {name}',
      'stueck.nadel': 'Nadel {nadel} mm',

      // Zu-/Abnahmeplan (US-13, US-14, US-16)
      'plan.titel': 'Zu- und Abnahmen',
      'plan.leer': 'Für Teile, deren Breite sich ändert, z. B. Ärmel: Die App verteilt die Zu- oder Abnahmen gleichmäßig.',
      'plan.anlegen': 'Plan anlegen',
      'plan.loeschen': 'Plan löschen',
      'plan.anfangBreite': 'Breite am Anfang ({einheit})',
      'plan.endBreite': 'Breite am Ende ({einheit})',
      'plan.laenge': 'Länge ({einheit})',
      'plan.richtungHinweis': 'In Strickrichtung: Anfang ist dort, wo du anschlägst.',
      'plan.proEreignis': 'Maschen pro Zu-/Abnahme',
      'plan.arbeitsweise': 'Arbeitsweise',
      'plan.reihen': 'In Reihen (gewendet)',
      'plan.runden': 'In Runden',
      'plan.jedeZweite': 'Nur jede 2. Reihe/Runde',
      'plan.jedeZweiteHinweis': 'Dann nur jede zweite Reihe bzw. Runde ab der Startreihe.',
      // Erste Reihe mit Zu-/Abnahme; leer bedeutet „automatisch“ (US-39, E31)
      'plan.startReihe': 'Frühestens ab {einheitReihe}',
      'plan.startReiheAuto': 'Vorher wird nicht zu- oder abgenommen. Leer lassen für automatisch: {einheitReihe} {reihe}.',
      'plan.anfang': 'Maschen am Anfang',
      'plan.ende': 'Maschen am Ende',
      'plan.reihenGesamt': 'Reihen gesamt',
      'plan.rundenGesamt': 'Runden gesamt',
      'plan.berechnet': 'berechnet {n}',
      'plan.tatsaechlichBreite': 'Tatsächliche Breite: {wert} {einheit}',
      'plan.tatsaechlichLaenge': 'Tatsächliche Länge: {wert} {einheit}',
      'plan.anpassungAnfang': 'Anpassung Maschen am Anfang',
      'plan.anpassungEnde': 'Anpassung Maschen am Ende',
      'plan.anpassungReihen': 'Anpassung Reihen gesamt',
      'plan.anpassungenZuruecksetzen': 'Anpassungen zurücksetzen',
      'plan.keineAenderung': 'Keine Zu- oder Abnahmen nötig.',
      'plan.auswahlFrage': 'Die Differenz von {differenz} M lässt sich nicht in Schritte zu je {pro} M teilen. Welche Endmaschenzahl soll gelten?',
      'plan.auswahlOption': '{maschen} M · {breite} {einheit} · {anzahl}',
      'plan.auswahlKeine': 'Mit {pro} M pro Zu-/Abnahme gibt es keine passende Endmaschenzahl. Bitte weniger Maschen pro Zu-/Abnahme nehmen.',
      'plan.keineOption': 'keine Zu-/Abnahme',
      'plan.zunahmen.eins': '1 Zunahme',
      'plan.zunahmen.mehr': '{n} Zunahmen',
      'plan.abnahmen.eins': '1 Abnahme',
      'plan.abnahmen.mehr': '{n} Abnahmen',
      'plan.zusammenfassung': '{anzahl} × {pro} M {art}, alle {abstand} {einheitReihen}',
      'plan.zusammenfassungEins': '1 × {pro} M {art} in {einheitReihe} {reihe}',
      'plan.zunehmen': 'zunehmen',
      'plan.abnehmen': 'abnehmen',
      'plan.einheitReihen': 'Reihen',
      'plan.einheitRunden': 'Runden',
      'plan.einheitReihe': 'Reihe',
      'plan.einheitRunde': 'Runde',
      'plan.zeileReihe': 'Reihe {reihe}: {pro} M {art} → {danach} M',
      'plan.zeileRunde': 'Runde {reihe}: {pro} M {art} → {danach} M',
      'plan.kurzinfo': '{anzahl} × {pro} M {art}',
      'plan.kurzinfoAuswahl': 'Plan: Auswahl nötig',
      'plan.listeTitel': 'Plan',
      'plan.fehler.ZU_WENIG_REIHEN': 'Für {anzahl} Zu-/Abnahmen gibt es nur {moeglich} passende Reihen. Nimm mehr Maschen pro Zu-/Abnahme oder prüfe die Länge.',
      'plan.fehler.ZU_WENIG_REIHEN.eins': 'Für {anzahl} Zu-/Abnahmen gibt es nur 1 passende Reihe. Nimm mehr Maschen pro Zu-/Abnahme oder prüfe die Länge.',
      'plan.fehler.ZU_WENIG_REIHEN.keine': 'Für {anzahl} Zu-/Abnahmen gibt es keine passende Reihe. Nimm mehr Maschen pro Zu-/Abnahme oder prüfe die Länge.',
      'plan.schrittMinus': '{wert} um 1 verringern',
      'plan.schrittPlus': '{wert} um 1 erhöhen',
      'plan.fehler.ZU_VIELE_EREIGNISSE': 'Das wären mehr als {grenze} Zu-/Abnahmen. Bitte die Eingaben prüfen.',
      'plan.fehler.ERGEBNIS_ZU_KLEIN': 'Mit dieser Anpassung bleibt weniger als 1 übrig. Bitte die Anpassung ändern.',
      'plan.probeFehlt': 'Bitte zuerst die eigene Probe dieses Strickstücks vollständig ausfüllen.',
      'dialog.planLoeschen.titel': 'Plan löschen?',
      'dialog.planLoeschen.text': 'Der Zu-/Abnahmeplan von „{name}“ wird gelöscht. Der Reihenzähler bleibt erhalten.',

      // Reihenzähler (US-15, US-30, US-33)
      'zaehler.reiheEingeben': 'Reihe eingeben',
      'zaehler.von': 'von {n}',
      'zaehler.laengeVon': '{ist} {einheit} von {ziel} {einheit}',
      'zaehler.laenge': '{ist} {einheit} gestrickt',
      'zaehler.zielAus': 'Ziel aus',
      'zaehler.quelle.plan': 'Zu-/Abnahmeplan',
      // Gleicher Wortlaut wie der Kartentitel, damit die Quelle wiederzufinden ist (Befund S4-05)
      'zaehler.quelle.laengeZuReihen': 'Aus Länge ({einheit}) → Reihen',
      'zaehler.quelle.reihenAusAnleitung': 'Reihen aus der Anleitung',
      'zaehler.zielErreicht': 'Ziel erreicht',
      'zaehler.ereignisse': 'Zu- und Abnahmen',
      'zaehler.letzte': 'Letzte',
      'zaehler.naechste': 'Nächste',
      'zaehler.uebernaechste': 'Übernächste',
      'zaehler.ereignisReihe': 'Reihe {reihe}: {maschen} M → {danach} M',
      'zaehler.ereignisRunde': 'Runde {reihe}: {maschen} M → {danach} M',
      'zaehler.jetzt': 'Jetzt: {pro} M {art}',
      'zaehler.ansageVon': 'Reihe {n} von {ziel}',
      'zaehler.ansageJetzt': 'Jetzt {pro} Maschen {art}',
      'zaehler.ansageZiel': 'Ziel erreicht',
    }),
  }),
});

/**
 * Ist die Sprache vorhanden?
 * @param {string} sprache
 * @returns {boolean}
 */
export function istBekannteSprache(sprache) {
  return Object.prototype.hasOwnProperty.call(SPRACHEN, sprache);
}

/**
 * Gebietsschema für die Zahlenformatierung (z. B. 'de-DE').
 * @param {string} sprache
 * @returns {string}
 */
export function localeFuer(sprache) {
  return (istBekannteSprache(sprache) ? SPRACHEN[sprache] : SPRACHEN[STANDARD_SPRACHE]).locale;
}

/**
 * Liefert den Text zu einem Schlüssel und ersetzt Platzhalter wie {einheit}.
 * Fehlt der Text in der Sprache, wird der deutsche verwendet; fehlt er ganz,
 * wird der Schlüssel selbst zurückgegeben (fällt so im Test auf).
 * @param {string} sprache
 * @param {string} schluessel
 * @param {Record<string, string|number>} [werte]
 * @returns {string}
 */
export function text(sprache, schluessel, werte = {}) {
  const eigene = istBekannteSprache(sprache) ? SPRACHEN[sprache].texte : null;
  const vorlage = (eigene && eigene[schluessel]) ?? SPRACHEN[STANDARD_SPRACHE].texte[schluessel] ?? schluessel;
  return vorlage.replace(/\{(\w+)\}/g, (ganz, name) =>
    Object.prototype.hasOwnProperty.call(werte, name) ? String(werte[name]) : ganz,
  );
}
