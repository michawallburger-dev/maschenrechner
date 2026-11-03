/**
 * Ausgabeformatierung von Zahlen.
 *
 * Reine Funktionen. Das Gebietsschema (locale, z. B. 'de-DE') wird als
 * Parameter übergeben und kommt aus texte.js. Einheiten werden hier bewusst
 * NICHT angehängt – das erledigt app.js mit dem Kürzel der eingestellten
 * Längeneinheit. So wirken Sprache und Einheit unabhängig voneinander.
 *
 * Längen gehen über `formatLaenge` bzw. `formatLaengeAbweichung`: Sie nehmen
 * Zentimeter, rechnen in die Anzeigeeinheit um und wählen dezimale oder
 * Bruchdarstellung (Architektur Sprint 5, Abschnitt 5.2). Dichten und
 * Stückzahlen bleiben bei `formatZahl` und `formatGanzzahl`.
 */

import { vonCm } from './einheiten.js';

/** Anzeige für fehlende oder ungültige Werte. */
export const LEER_ANZEIGE = '–';

/** Typografisches Minuszeichen (U+2212) für die Abweichung. */
const MINUS = '−';

/** Bruchzeichen für Achtel, gekürzt (E32). */
const BRUCHZEICHEN = Object.freeze(['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞']);

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

/**
 * Zahl als Bruch, auf Achtel gerundet und gekürzt: „4½“, „½“, „4“, „0“.
 *
 * Ein ganzzahliger Wert zeigt keinen Bruchteil, ein Wert unter eins nur den
 * Bruch – „½“, nicht „0½“ (US-41 AK4 und AK5). Die Rundung ist reine Anzeige;
 * der gespeicherte Wert bleibt unberührt.
 *
 * @param {number} wert
 * @param {string} locale
 * @returns {string}
 */
export function formatBruch(wert, locale) {
  if (!istZahl(wert)) return LEER_ANZEIGE;
  if (wert < 0) return MINUS + formatBruch(-wert, locale);
  const achtel = Math.round(wert * 8);
  const ganz = Math.floor(achtel / 8);
  const rest = achtel % 8;
  if (rest === 0) return formatGanzzahl(ganz, locale);
  return ganz === 0 ? BRUCHZEICHEN[rest] : formatGanzzahl(ganz, locale) + BRUCHZEICHEN[rest];
}

/**
 * Länge: Zentimeter → Anzeigeeinheit → Text, dezimal oder als Bruch.
 * Die Einheit wird nicht angehängt (siehe Dateikopf).
 * @param {number} wertCm
 * @param {string} einheit
 * @param {string} locale
 * @param {'dezimal'|'bruch'} darstellung
 * @returns {string}
 */
export function formatLaenge(wertCm, einheit, locale, darstellung) {
  if (!istZahl(wertCm)) return LEER_ANZEIGE;
  const wert = vonCm(wertCm, einheit);
  return darstellung === 'bruch' ? formatBruch(wert, locale) : formatZahl(wert, locale);
}

/**
 * Dasselbe mit Vorzeichen, für die Abweichung vom Wunschmaß.
 *
 * Bei Bruchdarstellung wird zuerst auf Achtel gerundet und dann über das
 * Vorzeichen entschieden: Was auf 0 rundet, ergibt „±0“. Eine Abweichung von
 * 1 mm erscheint bei Zoll deshalb als „±0“ – sie liegt unter einem halben
 * Achtel Zoll (Hinweis H7).
 *
 * @param {number} wertCm
 * @param {string} einheit
 * @param {string} locale
 * @param {'dezimal'|'bruch'} darstellung
 * @returns {string}
 */
export function formatLaengeAbweichung(wertCm, einheit, locale, darstellung) {
  if (!istZahl(wertCm)) return LEER_ANZEIGE;
  const wert = vonCm(wertCm, einheit);
  if (darstellung !== 'bruch') return formatAbweichung(wert, locale);
  const achtel = Math.round(wert * 8);
  if (achtel === 0) return '±' + formatBruch(0, locale);
  return (achtel > 0 ? '+' : MINUS) + formatBruch(Math.abs(wert), locale);
}
