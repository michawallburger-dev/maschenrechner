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
