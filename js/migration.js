/**
 * Übernahme der Daten aus Version 0.1 (Schema 1) in Schema 2 (US-27).
 *
 * Reine Funktionen. Das Lesen und Schreiben des Speichers erledigt speicher.js.
 * Der alte Datenstand wird dabei nie verändert.
 */

import { leereDaten, leereProbe, leereRechner, RECHNER_NAMEN, GRENZEN, pruefeDaten } from './modell.js';

/** Speicherschlüssel von Version 0.1. */
export const SCHLUESSEL_V1 = 'maschenrechner.zustand';

const PROBE_FELDER = ['maschenAnzahl', 'maschenBezug', 'reihenAnzahl', 'reihenBezug'];

function istObjekt(wert) {
  return wert !== null && typeof wert === 'object' && !Array.isArray(wert);
}

function text(wert, standard) {
  return typeof wert === 'string' ? wert.slice(0, GRENZEN.feld) : standard;
}

/**
 * Liest einen Zustand aus 0.1 und füllt fehlende Felder mit den Ausgangswerten.
 * @returns {object|null} null, wenn es kein Zustand aus 0.1 ist
 */
export function bereinigeV1(roh) {
  if (!istObjekt(roh) || roh.schemaVersion !== 1) return null;
  const basisProbe = leereProbe('cm');
  const probe = (quelle) => {
    const p = {};
    for (const feld of PROBE_FELDER) p[feld] = text(istObjekt(quelle) ? quelle[feld] : undefined, basisProbe[feld]);
    return p;
  };
  const basisRechner = leereRechner();
  const rechner = {};
  for (const name of RECHNER_NAMEN) {
    const r = istObjekt(roh.rechner) && istObjekt(roh.rechner[name]) ? roh.rechner[name] : {};
    rechner[name] = { eingabe: text(r.eingabe, basisRechner[name].eingabe), anpassung: text(r.anpassung, basisRechner[name].anpassung) };
  }
  return {
    einstellungen: istObjekt(roh.einstellungen) ? roh.einstellungen : {},
    probeAnleitung: probe(roh.probeAnleitung),
    probeEigen: probe(roh.probeEigen),
    nadelstaerkeMm: text(istObjekt(roh.probeEigen) ? roh.probeEigen.nadelstaerkeMm : undefined, ''),
    rechner,
  };
}

/**
 * Hat der Zustand aus 0.1 überhaupt Eingaben? (Sonst wird kein Projekt angelegt – US-27, AK3.)
 * @param {object} v1 bereinigter Zustand aus bereinigeV1
 */
export function hatInhalt(v1) {
  if (!v1) return false;
  const basisProbe = leereProbe('cm');
  for (const probe of [v1.probeAnleitung, v1.probeEigen]) {
    for (const feld of PROBE_FELDER) if (probe[feld].trim() !== basisProbe[feld]) return true;
  }
  if (v1.nadelstaerkeMm.trim() !== '') return true;
  for (const name of RECHNER_NAMEN) {
    const r = v1.rechner[name];
    if (r.eingabe.trim() !== '') return true;
    if (!['', '0'].includes(r.anpassung.trim())) return true;
  }
  return false;
}

/**
 * Wandelt einen Zustand aus 0.1 in Schema 2 um: ein Projekt mit einem Strickstück.
 * @param {unknown} roh            gelesener (geparster) Zustand aus 0.1
 * @param {{projektId:string, stueckId:string, jetzt:string, projektName:string, stueckName:string}} optionen
 * @returns {{daten:object, projektId:string}|null} null, wenn nichts zu übernehmen ist
 */
export function vonSchema1(roh, { projektId, stueckId, jetzt, projektName, stueckName }) {
  const v1 = bereinigeV1(roh);
  if (!hatInhalt(v1)) return null;

  const basis = leereDaten(v1.einstellungen);
  const entwurf = {
    ...basis,
    projekte: [
      {
        id: projektId,
        name: projektName,
        beschreibung: '',
        garn: '',
        nadelstaerkeMm: v1.nadelstaerkeMm,
        erstellt: jetzt,
        geaendert: jetzt,
        probeAnleitung: v1.probeAnleitung,
        probeEigen: v1.probeEigen,
        strickstuecke: [
          { id: stueckId, name: stueckName, erstellt: jetzt, geaendert: jetzt, rechner: v1.rechner, zaehler: 0 },
        ],
      },
    ],
  };
  // Zur Sicherheit durch dieselbe Prüfung wie beim Laden
  const geprueft = pruefeDaten(entwurf);
  return geprueft.gueltig ? { daten: geprueft.daten, projektId } : null;
}
