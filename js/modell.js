/**
 * Datenmodell (Schema 2): Projekte → Strickstücke.
 *
 * Reine Funktionen: Sie verändern ihre Eingaben nicht, sondern geben neue
 * Objekte zurück. IDs und Zeitstempel werden vom Aufrufer übergeben, damit
 * alles ohne Browser testbar bleibt.
 *
 * Eingaben (Proben, Rechner) bleiben Text – wie in Sprint 1 –, damit auch
 * halbfertige Eingaben erhalten bleiben. Nur der Reihenzähler ist eine Zahl.
 */

import { STANDARD_LAENGENEINHEIT, istBekannteEinheit, standardBezug } from './einheiten.js';
import { STANDARD_SPRACHE, istBekannteSprache, text as uiText } from './texte.js';

export const SCHEMA_VERSION = 2;

export const FARBSCHEMATA = Object.freeze(['system', 'hell', 'dunkel']);

export const RECHNER_NAMEN = Object.freeze([
  'maschenAusAnleitung',
  'reihenAusAnleitung',
  'breiteZuMaschen',
  'laengeZuReihen',
]);

/** Längengrenzen für Texte und Zahlen (in der Oberfläche zusätzlich per maxlength). */
export const GRENZEN = Object.freeze({
  name: 80,
  beschreibung: 500,
  garn: 80,
  feld: 20, // Zahleneingaben (Text)
  id: 64,
  zaehlerMax: 99999,
});

/**
 * Erlaubte Zeichen einer ID. Dasselbe Muster nutzt der Router; IDs mit anderen
 * Zeichen wären in der Oberfläche nicht erreichbar (QA S2-03).
 */
export const ID_MUSTER = /^[A-Za-z0-9_-]{1,64}$/;

const PROBE_FELDER = Object.freeze(['maschenAnzahl', 'maschenBezug', 'reihenAnzahl', 'reihenBezug']);
const NULLZEIT = '1970-01-01T00:00:00.000Z';

// ---------------------------------------------------------------- Hilfen

function istObjekt(wert) {
  return wert !== null && typeof wert === 'object' && !Array.isArray(wert);
}

function text(wert, max, standard = '') {
  return typeof wert === 'string' ? wert.slice(0, max) : standard;
}

function zeit(wert) {
  return typeof wert === 'string' && !Number.isNaN(Date.parse(wert)) ? wert : NULLZEIT;
}

function zaehlerWert(wert) {
  if (typeof wert !== 'number' || !Number.isFinite(wert)) return 0;
  return Math.min(GRENZEN.zaehlerMax, Math.max(0, Math.round(wert)));
}

/** Bereinigt die Einstellungen; Sprache, Einheit und Farbschema sind unabhängig. */
export function bereinigeEinstellungen(einstellungen) {
  const e = istObjekt(einstellungen) ? einstellungen : {};
  return {
    sprache: istBekannteSprache(e.sprache) ? e.sprache : STANDARD_SPRACHE,
    laengeneinheit: istBekannteEinheit(e.laengeneinheit) ? e.laengeneinheit : STANDARD_LAENGENEINHEIT,
    farbschema: FARBSCHEMATA.includes(e.farbschema) ? e.farbschema : 'system',
  };
}

function bereinigeHinweise(hinweise) {
  const h = istObjekt(hinweise) ? hinweise : {};
  return {
    projektlisteErklaert: h.projektlisteErklaert === true,
    wachhaltenNichtMoeglich: h.wachhaltenNichtMoeglich === true,
  };
}

/** Leere Maschenprobe; Bezugsmaß = Standard der Einheit (cm: 10). */
export function leereProbe(laengeneinheit = STANDARD_LAENGENEINHEIT) {
  const bezug = String(standardBezug(laengeneinheit));
  return { maschenAnzahl: '', maschenBezug: bezug, reihenAnzahl: '', reihenBezug: bezug };
}

/** Vier leere Rechner. */
export function leereRechner() {
  const rechner = {};
  for (const name of RECHNER_NAMEN) rechner[name] = { eingabe: '', anpassung: '0' };
  return rechner;
}

/** Ausgangsdaten mit leerer Projektliste. */
export function leereDaten(einstellungen) {
  return {
    schemaVersion: SCHEMA_VERSION,
    einstellungen: bereinigeEinstellungen(einstellungen),
    hinweise: bereinigeHinweise(null),
    projekte: [],
  };
}

// ---------------------------------------------------------------- Suchen

/**
 * Findet ein Projekt bzw. ein Strickstück.
 * @returns {{projekt:object, stueck?:object}|null}
 */
export function finde(daten, projektId, stueckId) {
  const projekt = daten.projekte.find((p) => p.id === projektId);
  if (!projekt) return null;
  if (stueckId === undefined) return { projekt };
  const stueck = projekt.strickstuecke.find((s) => s.id === stueckId);
  return stueck ? { projekt, stueck } : null;
}

/** Projekte nach letzter Änderung, neueste zuerst (US-09, AK1). */
export function projekteSortiert(daten) {
  return [...daten.projekte].sort((a, b) => Date.parse(b.geaendert) - Date.parse(a.geaendert));
}

// ---------------------------------------------------------------- Projekte

function pruefeName(name) {
  const n = typeof name === 'string' ? name.trim() : '';
  if (n === '') return { gueltig: false, fehler: 'NAME_LEER' };
  return { gueltig: true, name: n.slice(0, GRENZEN.name) };
}

/**
 * Legt ein Projekt an (US-09, AK2). Nur der Name ist Pflicht.
 * @returns {{gueltig:true, daten:object, projektId:string}|{gueltig:false, fehler:string}}
 */
export function neuesProjekt(daten, felder, id, jetzt) {
  const n = pruefeName(felder?.name);
  if (!n.gueltig) return n;
  const einheit = daten.einstellungen.laengeneinheit;
  const projekt = {
    id,
    name: n.name,
    beschreibung: text(felder.beschreibung, GRENZEN.beschreibung),
    garn: text(felder.garn, GRENZEN.garn),
    nadelstaerkeMm: text(felder.nadelstaerkeMm, GRENZEN.feld),
    erstellt: jetzt,
    geaendert: jetzt,
    probeAnleitung: leereProbe(einheit),
    probeEigen: leereProbe(einheit),
    strickstuecke: [],
  };
  return { gueltig: true, daten: { ...daten, projekte: [...daten.projekte, projekt] }, projektId: id };
}

/**
 * Ändert Angaben oder Proben eines Projekts (US-09, AK4).
 * felder: { name?, beschreibung?, garn?, nadelstaerkeMm?, probeAnleitung?: {...}, probeEigen?: {...} }
 */
export function projektAendern(daten, projektId, felder, jetzt) {
  const alt = daten.projekte.find((p) => p.id === projektId);
  if (!alt) return { gueltig: false, fehler: 'NICHT_GEFUNDEN' };
  const neu = { ...alt, geaendert: jetzt };

  if (felder.name !== undefined) {
    const n = pruefeName(felder.name);
    if (!n.gueltig) return n;
    neu.name = n.name;
  }
  if (felder.beschreibung !== undefined) neu.beschreibung = text(felder.beschreibung, GRENZEN.beschreibung);
  if (felder.garn !== undefined) neu.garn = text(felder.garn, GRENZEN.garn);
  if (felder.nadelstaerkeMm !== undefined) neu.nadelstaerkeMm = text(felder.nadelstaerkeMm, GRENZEN.feld);
  for (const probe of ['probeAnleitung', 'probeEigen']) {
    if (!istObjekt(felder[probe])) continue;
    neu[probe] = { ...alt[probe] };
    for (const feld of PROBE_FELDER) {
      if (typeof felder[probe][feld] === 'string') neu[probe][feld] = felder[probe][feld].slice(0, GRENZEN.feld);
    }
  }
  return { gueltig: true, daten: { ...daten, projekte: daten.projekte.map((p) => (p.id === projektId ? neu : p)) } };
}

/** Löscht ein Projekt mit allen Strickstücken (US-09, AK5). */
export function projektLoeschen(daten, projektId) {
  return { ...daten, projekte: daten.projekte.filter((p) => p.id !== projektId) };
}

// ---------------------------------------------------------------- Strickstücke

/** Legt ein Strickstück mit leeren Rechnern und Zähler 0 an (US-10, US-11 AK1). */
export function neuesStrickstueck(daten, projektId, name, id, jetzt) {
  const n = pruefeName(name);
  if (!n.gueltig) return n;
  const projekt = daten.projekte.find((p) => p.id === projektId);
  if (!projekt) return { gueltig: false, fehler: 'NICHT_GEFUNDEN' };
  const stueck = { id, name: n.name, erstellt: jetzt, geaendert: jetzt, rechner: leereRechner(), zaehler: 0 };
  const neuProjekt = { ...projekt, geaendert: jetzt, strickstuecke: [...projekt.strickstuecke, stueck] };
  return {
    gueltig: true,
    daten: { ...daten, projekte: daten.projekte.map((p) => (p.id === projektId ? neuProjekt : p)) },
    stueckId: id,
  };
}

/**
 * Ändert ein Strickstück: Name, Rechnerfelder oder Zähler.
 * felder: { name?, rechner?: { [rechnerName]: { eingabe?, anpassung? } }, zaehler?: number }
 * Aktualisiert auch „geaendert“ am Projekt (für die Sortierung der Projektliste).
 */
export function strickstueckAendern(daten, projektId, stueckId, felder, jetzt) {
  const gefunden = finde(daten, projektId, stueckId);
  if (!gefunden) return { gueltig: false, fehler: 'NICHT_GEFUNDEN' };
  const alt = gefunden.stueck;
  const neu = { ...alt, geaendert: jetzt };

  if (felder.name !== undefined) {
    const n = pruefeName(felder.name);
    if (!n.gueltig) return n;
    neu.name = n.name;
  }
  if (istObjekt(felder.rechner)) {
    neu.rechner = { ...alt.rechner };
    for (const name of RECHNER_NAMEN) {
      const f = felder.rechner[name];
      if (!istObjekt(f)) continue;
      neu.rechner[name] = { ...alt.rechner[name] };
      if (typeof f.eingabe === 'string') neu.rechner[name].eingabe = f.eingabe.slice(0, GRENZEN.feld);
      if (typeof f.anpassung === 'string') neu.rechner[name].anpassung = f.anpassung.slice(0, GRENZEN.feld);
    }
  }
  if (felder.zaehler !== undefined) neu.zaehler = zaehlerWert(felder.zaehler);

  const neuProjekt = {
    ...gefunden.projekt,
    geaendert: jetzt,
    strickstuecke: gefunden.projekt.strickstuecke.map((s) => (s.id === stueckId ? neu : s)),
  };
  return { gueltig: true, daten: { ...daten, projekte: daten.projekte.map((p) => (p.id === projektId ? neuProjekt : p)) } };
}

/** Löscht ein Strickstück (US-10, AK4). */
export function strickstueckLoeschen(daten, projektId, stueckId, jetzt) {
  return {
    ...daten,
    projekte: daten.projekte.map((p) =>
      p.id === projektId
        ? { ...p, geaendert: jetzt ?? p.geaendert, strickstuecke: p.strickstuecke.filter((s) => s.id !== stueckId) }
        : p,
    ),
  };
}

// ---------------------------------------------------------------- Einstellungen und Hinweise

/** Ändert eine Einstellung (z. B. Farbschema). Unbekannte Werte werden ignoriert. */
export function einstellungAendern(daten, felder) {
  return { ...daten, einstellungen: bereinigeEinstellungen({ ...daten.einstellungen, ...felder }) };
}

/** Merkt sich, dass ein einmaliger Hinweis gezeigt wurde. */
export function hinweisGesehen(daten, name) {
  return { ...daten, hinweise: { ...daten.hinweise, [name]: true } };
}

// ---------------------------------------------------------------- Prüfen (Laden und Import)

function eindeutig(id, vergeben, ersatz) {
  const basis = typeof id === 'string' && ID_MUSTER.test(id) ? id : ersatz;
  let kandidat = basis;
  let n = 2;
  while (vergeben.has(kandidat)) kandidat = `${basis}-${n++}`;
  vergeben.add(kandidat);
  return kandidat;
}

function pruefeProbe(roh, einheit) {
  const basis = leereProbe(einheit);
  const probe = {};
  for (const feld of PROBE_FELDER) probe[feld] = text(istObjekt(roh) ? roh[feld] : undefined, GRENZEN.feld, basis[feld]);
  return probe;
}

function pruefeRechner(roh) {
  const basis = leereRechner();
  const rechner = {};
  for (const name of RECHNER_NAMEN) {
    const r = istObjekt(roh) && istObjekt(roh[name]) ? roh[name] : {};
    rechner[name] = {
      eingabe: text(r.eingabe, GRENZEN.feld, basis[name].eingabe),
      anpassung: text(r.anpassung, GRENZEN.feld, basis[name].anpassung),
    };
  }
  return rechner;
}

function pruefeNameText(wert, ersatz) {
  const n = typeof wert === 'string' ? wert.trim().slice(0, GRENZEN.name) : '';
  return n === '' ? ersatz : n;
}

/**
 * Prüft unbekannte Daten (aus dem Speicher oder einer Sicherungsdatei) gegen Schema 2.
 * Fremde Felder werden verworfen, falsche Typen durch Ausgangswerte ersetzt.
 * Einzelne beschädigte Projekte/Strickstücke werden repariert, nicht gelöscht.
 * @returns {{gueltig:true, daten:object}|{gueltig:false, fehler:'KEIN_OBJEKT'|'SCHEMA'|'KEINE_PROJEKTLISTE'}}
 */
export function pruefeDaten(roh) {
  if (!istObjekt(roh)) return { gueltig: false, fehler: 'KEIN_OBJEKT' };
  if (roh.schemaVersion !== SCHEMA_VERSION) return { gueltig: false, fehler: 'SCHEMA' };
  if (!Array.isArray(roh.projekte)) return { gueltig: false, fehler: 'KEINE_PROJEKTLISTE' };

  const einstellungen = bereinigeEinstellungen(roh.einstellungen);
  const einheit = einstellungen.laengeneinheit;
  const projektIds = new Set();

  const projekte = roh.projekte.filter(istObjekt).map((p, i) => {
    const stueckIds = new Set();
    const strickstuecke = (Array.isArray(p.strickstuecke) ? p.strickstuecke : []).filter(istObjekt).map((s, j) => ({
      id: eindeutig(s.id, stueckIds, `s-reparatur-${j + 1}`),
      name: pruefeNameText(s.name, uiText(einstellungen.sprache, 'ersatz.strickstueck', { nr: j + 1 })),
      erstellt: zeit(s.erstellt),
      geaendert: zeit(s.geaendert),
      rechner: pruefeRechner(s.rechner),
      zaehler: zaehlerWert(s.zaehler),
    }));
    return {
      id: eindeutig(p.id, projektIds, `p-reparatur-${i + 1}`),
      name: pruefeNameText(p.name, uiText(einstellungen.sprache, 'ersatz.projekt', { nr: i + 1 })),
      beschreibung: text(p.beschreibung, GRENZEN.beschreibung),
      garn: text(p.garn, GRENZEN.garn),
      nadelstaerkeMm: text(p.nadelstaerkeMm, GRENZEN.feld),
      erstellt: zeit(p.erstellt),
      geaendert: zeit(p.geaendert),
      probeAnleitung: pruefeProbe(p.probeAnleitung, einheit),
      probeEigen: pruefeProbe(p.probeEigen, einheit),
      strickstuecke,
    };
  });

  return {
    gueltig: true,
    daten: { schemaVersion: SCHEMA_VERSION, einstellungen, hinweise: bereinigeHinweise(roh.hinweise), projekte },
  };
}

/** Anzahl der Strickstücke über alle Projekte. */
export function anzahlStrickstuecke(daten) {
  return daten.projekte.reduce((summe, p) => summe + p.strickstuecke.length, 0);
}
