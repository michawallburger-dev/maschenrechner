/**
 * Ausgabeformatierung von Zahlen.
 *
 * Reine Funktionen. Das Gebietsschema (locale, z. B. 'de-DE') wird als
 * Parameter übergeben und kommt aus texte.js. Einheiten werden hier bewusst
 * NICHT angehängt – das erledigt app.js mit dem Kürzel der eingestellten
 * Längeneinheit. So wirken Sprache und Einheit unabhängig voneinander.
 */

/** Anzeige für fehlende oder ungültige Werte. */
export const LEER_ANZEIGE = '–';

/** Typografisches Minuszeichen (U+2212) für die Abweichung. */
const MINUS = '−';

function istZahl(wert) {
  return typeof wert === 'number' && Number.isFinite(wert);
}

/**
 * Dezimalzahl mit fester Anzahl Nachkommastellen, ohne Tausendertrenner.
 * @param {number} wert
 * @param {string} locale
 * @param {number} [stellen=2]
 * @returns {string}
 */
export function formatZahl(wert, locale, stellen = 2) {
  if (!istZahl(wert)) return LEER_ANZEIGE;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: stellen,
    maximumFractionDigits: stellen,
    useGrouping: false,
  }).format(wert);
}

/**
 * Ganze Zahl ohne Tausendertrenner (z. B. Maschenanzahl).
 * @param {number} wert
 * @param {string} locale
 * @returns {string}
 */
export function formatGanzzahl(wert, locale) {
  if (!istZahl(wert)) return LEER_ANZEIGE;
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    useGrouping: false,
  }).format(wert);
}

/**
 * Abweichung immer mit Vorzeichen: „+0,04“, „−0,12“, „±0,00“.
 * Es wird zuerst auf die angezeigten Stellen gerundet, damit z. B.
 * −0,0001 als „±0,00“ erscheint und nicht als „−0,00“.
 * @param {number} wert
 * @param {string} locale
 * @param {number} [stellen=2]
 * @returns {string}
 */
export function formatAbweichung(wert, locale, stellen = 2) {
  if (!istZahl(wert)) return LEER_ANZEIGE;
  const gerundet = Number(wert.toFixed(stellen));
  if (gerundet === 0) return '±' + formatZahl(0, locale, stellen);
  const vorzeichen = gerundet > 0 ? '+' : MINUS;
  return vorzeichen + formatZahl(Math.abs(gerundet), locale, stellen);
}
