/**
 * Längeneinheiten.
 *
 * Reine Funktionen. Die Rechenlogik arbeitet immer in Zentimetern; hier wird
 * zwischen der Anzeigeeinheit und cm umgerechnet. Die Längeneinheit ist
 * unabhängig von der Sprache einstellbar.
 *
 * Gespeicherte Längen liegen in der eingestellten Einheit, nicht in cm. Beim
 * Umstellen werden sie umgerechnet (Architektur Sprint 5, Abschnitt 4.2) –
 * dafür ist `umrechneWert` da. Welche Felder das betrifft, weiß `modell.js`.
 */

import { parseZahl } from './eingabe.js';

export const STANDARD_LAENGENEINHEIT = 'cm';

/**
 * `stellen` ist die Zahl der Nachkommastellen, auf die ein **gespeicherter**
 * Wert beim Umrechnen gerundet wird.
 *
 * Zoll bekommt **drei** Stellen, nicht zwei (Hinweis H5, entschieden in der
 * Entwicklung nach einer Messung): Mit zwei Stellen runden Bezugsmaß und Länge
 * beide, die Fehler summieren sich, und der Referenzfall aus Sprint 3 ergibt
 * nach einem Wechsel nach Zoll **166 statt 167 Reihen**. Mit drei Stellen
 * bleibt er bei 167, und der Weg zurück nach cm ist exakt.
 * Der Preis: Im Eingabefeld steht „3.937“ statt „3.94“.
 */
export const LAENGENEINHEITEN = Object.freeze({
  cm: Object.freeze({ faktorZuCm: 1, standardBezug: 10, stellen: 2 }),
  in: Object.freeze({ faktorZuCm: 2.54, standardBezug: 4, stellen: 3 }),
});

function einheitDaten(einheit) {
  const daten = LAENGENEINHEITEN[einheit];
  if (!daten) {
    // Unbekannte Einheit ist ein Programmierfehler, kein Eingabefehler
    throw new TypeError(`Unbekannte Längeneinheit: ${einheit}`);
  }
  return daten;
}

/**
 * Ist die Einheit bekannt?
 * @param {string} einheit
 * @returns {boolean}
 */
export function istBekannteEinheit(einheit) {
  return Object.prototype.hasOwnProperty.call(LAENGENEINHEITEN, einheit);
}

/**
 * Wert in der Anzeigeeinheit → Zentimeter.
 * @param {number} wert
 * @param {string} einheit
 * @returns {number}
 */
export function zuCm(wert, einheit) {
  return wert * einheitDaten(einheit).faktorZuCm;
}

/**
 * Zentimeter → Wert in der Anzeigeeinheit.
 * @param {number} wertCm
 * @param {string} einheit
 * @returns {number}
 */
export function vonCm(wertCm, einheit) {
  return wertCm / einheitDaten(einheit).faktorZuCm;
}

/**
 * Übliches Bezugsmaß einer Maschenprobe in dieser Einheit (cm: 10, Zoll: 4).
 * @param {string} einheit
 * @returns {number}
 */
export function standardBezug(einheit) {
  return einheitDaten(einheit).standardBezug;
}

/**
 * Rechnet den Text eines Eingabefeldes von einer Einheit in die andere um.
 *
 * Leere und ungültige Texte bleiben **unverändert** – eine halb getippte
 * Eingabe wird nicht stillschweigend zu einer Zahl gemacht. Das Ergebnis wird
 * mit Punkt als Dezimaltrenner geschrieben, nie mit Komma und nie
 * locale-abhängig: Gespeicherte Werte dürfen nicht von der Sprache abhängen,
 * und der Punkt ist in Dezimalfeldern ein gültiger Dezimaltrenner (E13).
 *
 * @param {string} text Inhalt des Eingabefeldes
 * @param {string} vonEinheit
 * @param {string} nachEinheit
 * @returns {string}
 */
export function umrechneWert(text, vonEinheit, nachEinheit) {
  if (vonEinheit === nachEinheit) return text;
  const wert = parseZahl(text);
  if (wert === null) return text;
  const umgerechnet = vonCm(zuCm(wert, vonEinheit), nachEinheit);
  const fest = umgerechnet.toFixed(einheitDaten(nachEinheit).stellen);
  // Nachkommanullen weg, aber nur hinter dem Punkt: aus "4.00" wird "4",
  // aus "100.00" wird "100" und nicht "1".
  return fest.includes('.') ? fest.replace(/0+$/, '').replace(/\.$/, '') : fest;
}
