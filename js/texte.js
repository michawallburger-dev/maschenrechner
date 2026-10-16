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

      // Rechner 3: Breite in Maschen (US-05)
      'rechner.breiteZuMaschen.titel': 'Breite in Maschen',
      'rechner.breiteZuMaschen.beschreibung': 'Wie viele Maschen brauchst du für eine bestimmte Breite?',
      'rechner.breiteZuMaschen.eingabe': 'Gewünschte Breite ({einheit})',
      'rechner.breiteZuMaschen.anleitungGerundet': 'Maschen laut Anleitung, gerundet',
      'rechner.breiteZuMaschen.eigenGerundet': 'Eigene Maschen, gerundet',
      'rechner.breiteZuMaschen.endgueltig': 'Deine Maschen',
      'rechner.breiteZuMaschen.tatsaechlich': 'Tatsächliche Breite ({einheit})',
      'rechner.breiteZuMaschen.abweichung': 'Abweichung zur gewünschten Breite ({einheit})',

      // Rechner 4: Länge in Reihen (US-06)
      'rechner.laengeZuReihen.titel': 'Länge in Reihen',
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
      'ersatz.projekt': 'Projekt {nr}',
      'ersatz.strickstueck': 'Teil {nr}',

      // Strickstück (US-10)
      'stueck.zaehlen': 'Reihen zählen',
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
      'dialog.import.text': 'Die Datei vom {datum} enthält {projekte} und {stuecke}. Alle Daten auf diesem Gerät werden dadurch ersetzt.',
      'dialog.import.ok': 'Ersetzen',
      'dialog.import.fehlerTitel': 'Datei kann nicht eingelesen werden',
      'import.unbekanntesDatum': 'unbekannten Datum',
      'import.fehler.ZU_GROSS': 'Die Datei ist zu groß für eine Sicherung des Maschenrechners. Es wurde nichts verändert.',
      'import.fehler.KEIN_JSON': 'Diese Datei ist keine Sicherung des Maschenrechners oder ist beschädigt. Es wurde nichts verändert.',
      'import.fehler.FALSCHE_APP': 'Diese Datei stammt nicht vom Maschenrechner. Es wurde nichts verändert.',
      'import.fehler.UNBEKANNTES_FORMAT': 'Diese Sicherung stammt aus einer neueren Version des Maschenrechners. Bitte die App aktualisieren. Es wurde nichts verändert.',
      'import.fehler.DATEN_UNGUELTIG': 'Die Sicherung ist beschädigt. Es wurde nichts verändert.',
      'import.fehler.LESEN': 'Die Datei konnte nicht gelesen werden. Es wurde nichts verändert.',
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
