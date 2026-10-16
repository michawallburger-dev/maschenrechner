/**
 * Längeneinheiten.
 *
 * Reine Funktionen. Die Rechenlogik arbeitet immer in Zentimetern; hier wird
 * zwischen der Anzeigeeinheit und cm umgerechnet. Die Längeneinheit ist
 * unabhängig von der Sprache einstellbar.
 *
 * Sprint 1 liefert nur „cm“. Eine weitere Einheit (z. B. Zoll) wird später
 * durch einen zusätzlichen Eintrag ergänzt, etwa
 *   in: { faktorZuCm: 2.54, standardBezug: 4 }
 * plus ein Anzeigekürzel in texte.js („einheit.in“).
 */

export const STANDARD_LAENGENEINHEIT = 'cm';

export const LAENGENEINHEITEN = Object.freeze({
  cm: Object.freeze({ faktorZuCm: 1, standardBezug: 10 }),
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
 * Übliches Bezugsmaß einer Maschenprobe in dieser Einheit (cm: 10).
 * @param {string} einheit
 * @returns {number}
 */
export function standardBezug(einheit) {
  return einheitDaten(einheit).standardBezug;
}
