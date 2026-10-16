/**
 * Laden, Speichern und Zurücksetzen des Zustands.
 *
 * Der Speicher wird als Parameter übergeben (in der App window.localStorage,
 * im Test ein nachgebautes Objekt). Alle Zugriffe sind abgesichert – die App
 * stürzt nie ab, auch wenn der Speicher fehlt, voll ist oder Unsinn enthält.
 *
 * Gespeichert werden die eingegebenen TEXTE (nicht die geprüften Zahlen),
 * damit auch halbfertige Eingaben nach dem Neuladen erhalten bleiben.
 *
 * Hinweis: Dieses Modul nutzt die reinen Module einheiten.js und texte.js
 * für Standardwerte. Die Abhängigkeitsrichtung bleibt einseitig.
 */

import { STANDARD_LAENGENEINHEIT, istBekannteEinheit, standardBezug } from './einheiten.js';
import { STANDARD_SPRACHE, istBekannteSprache } from './texte.js';

export const SPEICHER_SCHLUESSEL = 'maschenrechner.zustand';
export const SCHEMA_VERSION = 1;

/**
 * Bereinigt die Einstellungen. Sprache und Längeneinheit sind zwei getrennte
 * Felder; unbekannte Werte fallen auf die Standardwerte zurück.
 * @param {unknown} einstellungen
 * @returns {{sprache:string, laengeneinheit:string}}
 */
export function bereinigeEinstellungen(einstellungen) {
  const e = einstellungen && typeof einstellungen === 'object' ? einstellungen : {};
  return {
    sprache: istBekannteSprache(e.sprache) ? e.sprache : STANDARD_SPRACHE,
    laengeneinheit: istBekannteEinheit(e.laengeneinheit) ? e.laengeneinheit : STANDARD_LAENGENEINHEIT,
  };
}

/**
 * Ausgangszustand: Anzahlen leer, Bezugsmaße = Standard der Einheit (cm: 10),
 * Anpassungen "0", Nadelstärke leer. Die Einstellungen werden übernommen.
 * @param {unknown} [einstellungen]
 */
export function ausgangszustand(einstellungen) {
  const e = bereinigeEinstellungen(einstellungen);
  const bezug = String(standardBezug(e.laengeneinheit));
  const rechner = () => ({ eingabe: '', anpassung: '0' });
  return {
    schemaVersion: SCHEMA_VERSION,
    einstellungen: e,
    probeAnleitung: { maschenAnzahl: '', maschenBezug: bezug, reihenAnzahl: '', reihenBezug: bezug },
    probeEigen: { maschenAnzahl: '', maschenBezug: bezug, reihenAnzahl: '', reihenBezug: bezug, nadelstaerkeMm: '' },
    rechner: {
      maschenAusAnleitung: rechner(),
      reihenAusAnleitung: rechner(),
      breiteZuMaschen: rechner(),
      laengeZuReihen: rechner(),
    },
  };
}

/**
 * Übernimmt aus `quelle` nur Felder, die es in `basis` gibt und die Text sind.
 * Unbekannte oder falsch typisierte Felder werden ignoriert.
 */
function zusammenfuehren(basis, quelle) {
  const ergebnis = {};
  for (const [schluessel, basisWert] of Object.entries(basis)) {
    const quellWert = quelle && typeof quelle === 'object' ? quelle[schluessel] : undefined;
    if (basisWert && typeof basisWert === 'object') {
      ergebnis[schluessel] = zusammenfuehren(basisWert, quellWert);
    } else if (typeof basisWert === 'string' && typeof quellWert === 'string') {
      ergebnis[schluessel] = quellWert;
    } else {
      ergebnis[schluessel] = basisWert;
    }
  }
  return ergebnis;
}

/**
 * Bringt gespeicherte Daten älterer Schema-Versionen auf den aktuellen Stand.
 * Derzeit gibt es nur Version 1. Unbekannte Versionen → null (Ausgangszustand).
 * @param {any} daten
 * @returns {any|null}
 */
export function migrieren(daten) {
  if (!daten || typeof daten !== 'object') return null;
  if (daten.schemaVersion === SCHEMA_VERSION) return daten;
  return null;
}

/**
 * Lädt den Zustand.
 * @param {Storage|null} speicher
 * @returns {{zustand: ReturnType<typeof ausgangszustand>, speicherbar: boolean}}
 */
export function laden(speicher) {
  if (!speicher) return { zustand: ausgangszustand(), speicherbar: false };

  let roh;
  try {
    roh = speicher.getItem(SPEICHER_SCHLUESSEL);
  } catch {
    return { zustand: ausgangszustand(), speicherbar: false };
  }
  if (roh === null || roh === undefined) return { zustand: ausgangszustand(), speicherbar: true };

  let daten;
  try {
    daten = migrieren(JSON.parse(roh));
  } catch {
    daten = null;
  }
  if (!daten) return { zustand: ausgangszustand(), speicherbar: true };

  const basis = ausgangszustand(daten.einstellungen);
  const zustand = zusammenfuehren(basis, daten);
  // Einstellungen immer bereinigt übernehmen, Schema-Version immer aktuell
  zustand.einstellungen = basis.einstellungen;
  zustand.schemaVersion = SCHEMA_VERSION;
  return { zustand, speicherbar: true };
}

/**
 * Speichert den Zustand.
 * @param {Storage|null} speicher
 * @param {object} zustand
 * @returns {boolean} true bei Erfolg
 */
export function speichern(speicher, zustand) {
  if (!speicher) return false;
  try {
    speicher.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(zustand));
    return true;
  } catch {
    return false;
  }
}

/**
 * Setzt alle Eingaben zurück. Die Einstellungen (Sprache, Einheit) bleiben.
 * @param {Storage|null} speicher
 * @param {unknown} einstellungen
 * @returns {ReturnType<typeof ausgangszustand>}
 */
export function zuruecksetzen(speicher, einstellungen) {
  const zustand = ausgangszustand(einstellungen);
  speichern(speicher, zustand);
  return zustand;
}
