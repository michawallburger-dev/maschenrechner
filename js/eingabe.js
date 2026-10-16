/**
 * Eingabeprüfung und Zahlenerkennung.
 *
 * Reine Funktionen ohne DOM- oder Speicherzugriff. Liefert ausschließlich
 * Fehlercodes – die zugehörigen Meldungstexte stehen in texte.js.
 *
 * Komma und Punkt werden als Dezimaltrenner akzeptiert, unabhängig von der
 * eingestellten Sprache.
 */

/** Prüfregeln je Feldart (Grenzen gelten in der jeweiligen Anzeigeeinheit). */
export const REGELN = Object.freeze({
  // Anzahl Maschen/Reihen der Maschenprobe, z. B. 22,5
  probenAnzahl: Object.freeze({ ganzzahl: false, positiv: true, max: 999 }),
  // Bezugsbreite/-höhe der Maschenprobe, z. B. 10
  bezugsmass: Object.freeze({ ganzzahl: false, positiv: true, max: 100 }),
  // Nadelstärke in mm, darf leer bleiben
  nadel: Object.freeze({ ganzzahl: false, positiv: true, max: 30, leerErlaubt: true, leerWert: null }),
  // Maschen-/Reihenzahl aus der Anleitung
  ganzPositiv: Object.freeze({ ganzzahl: true, positiv: true, max: 99999 }),
  // gewünschte Breite/Länge
  laenge: Object.freeze({ ganzzahl: false, positiv: true, max: 9999 }),
  // Anpassung: ganze Zahl, auch negativ, leer bedeutet 0
  anpassung: Object.freeze({ ganzzahl: true, positiv: false, min: -9999, max: 9999, leerErlaubt: true, leerWert: 0 }),
});

// Erlaubt: optionales Vorzeichen, Ziffern, höchstens ein Dezimaltrenner (Komma oder Punkt).
// Beispiele: "12", "12,5", "12.5", ",5", "-3", "+2"
const ZAHL_MUSTER = /^[+-]?(?:\d+(?:[.,]\d+)?|[.,]\d+)$/;

/**
 * Wandelt einen eingegebenen Text in eine Zahl um.
 * @param {string} text
 * @returns {number|null} die Zahl oder null, wenn der Text keine gültige Zahl ist
 */
export function parseZahl(text) {
  if (typeof text !== 'string') return null;
  // Typografisches Minus (U+2212) wie normales Minus behandeln
  const bereinigt = text.trim().replace(/−/g, '-');
  if (!ZAHL_MUSTER.test(bereinigt)) return null;
  const wert = Number(bereinigt.replace(',', '.'));
  return Number.isFinite(wert) ? wert : null;
}

/**
 * Prüft einen eingegebenen Text nach einer Regel aus REGELN.
 * @param {string} text
 * @param {keyof typeof REGELN} regelName
 * @returns {{gueltig:true, wert:number|null} | {gueltig:false, fehler:string, grenze?:number}}
 */
export function pruefeZahl(text, regelName) {
  const regel = REGELN[regelName];
  if (!regel) {
    throw new TypeError(`Unbekannte Prüfregel: ${regelName}`);
  }

  const roh = typeof text === 'string' ? text.trim() : '';
  if (roh === '') {
    return regel.leerErlaubt ? { gueltig: true, wert: regel.leerWert } : { gueltig: false, fehler: 'LEER' };
  }

  const wert = parseZahl(roh);
  if (wert === null) return { gueltig: false, fehler: 'KEINE_ZAHL' };
  if (regel.ganzzahl && !Number.isInteger(wert)) return { gueltig: false, fehler: 'KEINE_GANZZAHL' };
  if (regel.positiv && wert <= 0) return { gueltig: false, fehler: 'NICHT_POSITIV' };
  if (regel.min !== undefined && wert < regel.min) return { gueltig: false, fehler: 'ZU_KLEIN', grenze: regel.min };
  if (wert > regel.max) return { gueltig: false, fehler: 'ZU_GROSS', grenze: regel.max };

  // -0 vermeiden (z. B. Eingabe "-0" bei der Anpassung)
  return { gueltig: true, wert: wert === 0 ? 0 : wert };
}
