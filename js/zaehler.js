/**
 * Logik des Reihenzählers (US-11). Reine Funktionen.
 */

import { pruefeZahl, REGELN } from './eingabe.js';

export const ZAEHLER_MAX = REGELN.zaehler.max;

/** +1, höchstens 99 999. */
export function zaehlerPlus(n) {
  return Math.min(ZAEHLER_MAX, n + 1);
}

/** −1, nie unter 0 (US-11, AK3). */
export function zaehlerMinus(n) {
  return Math.max(0, n - 1);
}

/**
 * Direkteingabe des Zählerstands, z. B. „42“ oder „1.000“ (E13).
 * @returns {{gueltig:true, wert:number}|{gueltig:false, fehler:string, grenze?:number}}
 */
export function zaehlerAusText(text) {
  return pruefeZahl(text, 'zaehler');
}
