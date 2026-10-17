/**
 * Laden und Speichern der Daten (Schema 3) inklusive Übernahme aus 0.2 und 0.1.
 *
 * Der Speicher wird als Parameter übergeben (in der App window.localStorage,
 * im Test ein nachgebautes Objekt). Alle Zugriffe sind abgesichert.
 *
 * Schutz vor Datenverlust (Architektur Sprint 2 R6, Sprint 3 R10):
 * - Ältere Daten werden in einen NEUEN Schlüssel übernommen; die alten Schlüssel
 *   (0.1: „maschenrechner.zustand“, 0.2: „maschenrechner.daten.v2“) bleiben unverändert.
 * - Sind gespeicherte Daten beschädigt, werden sie vor dem Neustart unter „.defekt“ aufbewahrt.
 * - Vor jedem Import werden die aktuellen Daten unter „.vorImport“ kopiert.
 */

import { leereDaten, pruefeDaten } from './modell.js';
import { SCHLUESSEL_V1, vonSchema1, vonSchema2 } from './migration.js';

export { SCHLUESSEL_V1 };
export const SCHLUESSEL_V2 = 'maschenrechner.daten.v2';
export const SCHLUESSEL_V3 = 'maschenrechner.daten.v3';
export const SCHLUESSEL_DEFEKT = 'maschenrechner.daten.v3.defekt';
export const SCHLUESSEL_VOR_IMPORT = 'maschenrechner.daten.v3.vorImport';

function lies(speicher, schluessel) {
  try {
    return { ok: true, wert: speicher.getItem(schluessel) };
  } catch {
    return { ok: false, wert: null };
  }
}

function schreib(speicher, schluessel, wert) {
  try {
    speicher.setItem(schluessel, wert);
    return true;
  } catch {
    return false;
  }
}

function parse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * Lädt die Daten.
 * Reihenfolge: Schema 3 → Übernahme aus 0.2 → Übernahme aus 0.1 → leere Daten.
 * @param {Storage|null} speicher
 * @param {{neueId:(praefix:string)=>string, jetzt:string, projektName:string, stueckName:string}} optionen
 * @returns {{daten:object, speicherbar:boolean, quelle:'v3'|'v2'|'v1'|'neu', uebernommenesProjekt:string|null, beschaedigt:boolean}}
 *   beschaedigt = gespeicherte Daten (Schema 3) waren unlesbar und liegen jetzt unter „.defekt“ (QA S2-04)
 */
export function ladeDaten(speicher, { neueId, jetzt, projektName, stueckName }) {
  const leer = { daten: leereDaten(), speicherbar: false, quelle: 'neu', uebernommenesProjekt: null, beschaedigt: false };
  if (!speicher) return leer;

  // 1. Schema 3
  const v3 = lies(speicher, SCHLUESSEL_V3);
  if (!v3.ok) return leer;
  let beschaedigt = false;
  if (v3.wert !== null) {
    const geprueft = pruefeDaten(parse(v3.wert));
    if (geprueft.gueltig) return { daten: geprueft.daten, speicherbar: true, quelle: 'v3', uebernommenesProjekt: null, beschaedigt };
    // Beschädigt: Rohdaten aufbewahren, bevor irgendetwas überschrieben wird
    schreib(speicher, SCHLUESSEL_DEFEKT, v3.wert);
    beschaedigt = true;
  }

  // 2. Übernahme aus 0.2 (alter Schlüssel wird nur gelesen)
  const v2 = lies(speicher, SCHLUESSEL_V2);
  if (v2.ok && v2.wert !== null) {
    const daten = vonSchema2(parse(v2.wert));
    if (daten) {
      speichereDaten(speicher, daten);
      return { daten, speicherbar: true, quelle: 'v2', uebernommenesProjekt: null, beschaedigt };
    }
  }

  // 3. Übernahme aus 0.1 (alter Schlüssel wird nur gelesen)
  const v1 = lies(speicher, SCHLUESSEL_V1);
  if (v1.ok && v1.wert !== null) {
    const ergebnis = vonSchema1(parse(v1.wert), {
      projektId: neueId('p'),
      stueckId: neueId('s'),
      jetzt,
      projektName,
      stueckName,
    });
    if (ergebnis) {
      speichereDaten(speicher, ergebnis.daten);
      return { daten: ergebnis.daten, speicherbar: true, quelle: 'v1', uebernommenesProjekt: ergebnis.projektId, beschaedigt };
    }
  }

  // 4. Neu
  return { daten: leereDaten(), speicherbar: true, quelle: 'neu', uebernommenesProjekt: null, beschaedigt };
}

/**
 * Speichert die Daten unter dem Schlüssel für Schema 3.
 * @returns {boolean} true bei Erfolg
 */
export function speichereDaten(speicher, daten) {
  if (!speicher) return false;
  return schreib(speicher, SCHLUESSEL_V3, JSON.stringify(daten));
}

/**
 * Kopiert die aktuell gespeicherten Daten vor einem Import nach „.vorImport“.
 * @returns {boolean} true, wenn gesichert wurde oder nichts zu sichern war
 */
export function sichereVorImport(speicher) {
  if (!speicher) return false;
  const aktuell = lies(speicher, SCHLUESSEL_V3);
  if (!aktuell.ok) return false;
  if (aktuell.wert === null) return true;
  return schreib(speicher, SCHLUESSEL_VOR_IMPORT, aktuell.wert);
}
