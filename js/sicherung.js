/**
 * Sicherungsdatei erzeugen und prüfen (US-12).
 *
 * Reine Funktionen. Das Teilen bzw. Herunterladen und das Lesen der Datei
 * übernimmt geraet.js.
 */

import { pruefeDaten, anzahlStrickstuecke, anzahlProben } from './modell.js';
import { vonSchema2 } from './migration.js';

export const SICHERUNG_APP = 'maschenrechner';
export const SICHERUNG_FORMAT = 1;
export const MAX_GROESSE = 2 * 1024 * 1024; // 2 MB

function zweistellig(n) {
  return String(n).padStart(2, '0');
}

/**
 * Erzeugt Dateiname und Inhalt der Sicherung.
 * @param {object} daten   Daten in Schema 3
 * @param {Date} jetzt
 * @param {string} appVersion
 * @returns {{dateiname:string, inhalt:string}}
 */
export function erzeugeSicherung(daten, jetzt, appVersion) {
  // Lokales Datum für den Dateinamen, damit er zum Kalender der Nutzerin passt
  const datum = `${jetzt.getFullYear()}-${zweistellig(jetzt.getMonth() + 1)}-${zweistellig(jetzt.getDate())}`;
  const inhalt = JSON.stringify(
    { app: SICHERUNG_APP, format: SICHERUNG_FORMAT, appVersion, erstellt: jetzt.toISOString(), daten },
    null,
    2,
  );
  return { dateiname: `maschenrechner-sicherung-${datum}.json`, inhalt };
}

/**
 * Prüft den Text einer Sicherungsdatei.
 * @param {string} text
 * @returns {{gueltig:true, daten:object, zusammenfassung:{projekte:number, strickstuecke:number, proben:number, erstellt:string|null}}
 *          |{gueltig:false, fehler:'ZU_GROSS'|'KEIN_JSON'|'FALSCHE_APP'|'UNBEKANNTES_FORMAT'|'DATEN_UNGUELTIG'}}
 */
export function leseSicherung(text) {
  if (typeof text !== 'string') return { gueltig: false, fehler: 'KEIN_JSON' };
  if (text.length > MAX_GROESSE) return { gueltig: false, fehler: 'ZU_GROSS' };

  let roh;
  try {
    roh = JSON.parse(text);
  } catch {
    return { gueltig: false, fehler: 'KEIN_JSON' };
  }
  if (roh === null || typeof roh !== 'object' || roh.app !== SICHERUNG_APP) return { gueltig: false, fehler: 'FALSCHE_APP' };
  if (roh.format !== SICHERUNG_FORMAT) return { gueltig: false, fehler: 'UNBEKANNTES_FORMAT' };

  // Sicherungen aus 0.2 (Schema 2) werden wie gespeicherte Daten übernommen (US-32 AK9, US-14 AK5)
  let daten = null;
  if (roh.daten?.schemaVersion === 2) {
    daten = vonSchema2(roh.daten);
  } else {
    const geprueft = pruefeDaten(roh.daten);
    if (geprueft.gueltig) daten = geprueft.daten;
  }
  if (!daten) return { gueltig: false, fehler: 'DATEN_UNGUELTIG' };

  const erstellt = typeof roh.erstellt === 'string' && !Number.isNaN(Date.parse(roh.erstellt)) ? roh.erstellt : null;
  return {
    gueltig: true,
    daten,
    zusammenfassung: {
      projekte: daten.projekte.length,
      strickstuecke: anzahlStrickstuecke(daten),
      proben: anzahlProben(daten),
      erstellt,
    },
  };
}
