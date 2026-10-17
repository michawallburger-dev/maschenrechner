/**
 * Datenmodell (Schema 3): Projekte → Maschenproben und Strickstücke.
 *
 * Ab Sprint 3 hat ein Projekt eine Liste von Proben (je ein Paar aus
 * Anleitungs- und eigener Probe, mit Name und Nadelstärke). Jedes Strickstück
 * verweist über „probeId“ auf genau eine Probe seines Projekts und kann
 * höchstens einen Zu-/Abnahmeplan haben (US-32, US-14).
 *
 * Reine Funktionen: Sie verändern ihre Eingaben nicht, sondern geben neue
 * Objekte zurück. IDs und Zeitstempel werden vom Aufrufer übergeben, damit
 * alles ohne Browser testbar bleibt.
 *
 * Eingaben (Proben, Rechner, Plan) bleiben Text – wie in Sprint 1 –, damit auch
 * halbfertige Eingaben erhalten bleiben. Nur der Reihenzähler ist eine Zahl.
 */

import { STANDARD_LAENGENEINHEIT, istBekannteEinheit, standardBezug } from './einheiten.js';
import { STANDARD_SPRACHE, istBekannteSprache, text as uiText } from './texte.js';
import { ARBEITSWEISEN, EREIGNIS_WAHLEN } from './plan.js';
import { ZIEL_QUELLEN } from './ziel.js';

export const SCHEMA_VERSION = 3;

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
  probeName: 40,
  feld: 20, // Zahleneingaben (Text)
  id: 64,
  zaehlerMax: 99999,
});

/**
 * Erlaubte Zeichen einer ID. Dasselbe Muster nutzt der Router; IDs mit anderen
 * Zeichen wären in der Oberfläche nicht erreichbar (QA S2-03).
 */
export const ID_MUSTER = /^[A-Za-z0-9_-]{1,64}$/;

export const PROBE_FELDER = Object.freeze(['maschenAnzahl', 'maschenBezug', 'reihenAnzahl', 'reihenBezug']);
const PLAN_TEXTFELDER = Object.freeze(['anfangBreite', 'endBreite', 'laenge', 'maschenProEreignis']);
const ANPASSUNGEN = Object.freeze(['anfang', 'ende', 'reihen']);
const NULLZEIT = '1970-01-01T00:00:00.000Z';

/** ID der ersten Probe eines Projekts. Proben-IDs müssen nur im Projekt eindeutig sein. */
export const ERSTE_PROBE_ID = 'pr-1';

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

/** Leere Maschenprobe (Maschen und Reihen); Bezugsmaß = Standard der Einheit (cm: 10). */
export function leereProbe(laengeneinheit = STANDARD_LAENGENEINHEIT) {
  const bezug = String(standardBezug(laengeneinheit));
  return { maschenAnzahl: '', maschenBezug: bezug, reihenAnzahl: '', reihenBezug: bezug };
}

/** Leere Probe (Paar aus Anleitung und eigener Probe) mit Name und Nadel (US-32 AK1). */
export function leeresProbenPaar(id, name, laengeneinheit = STANDARD_LAENGENEINHEIT, nadelstaerkeMm = '') {
  return { id, name, nadelstaerkeMm, anleitung: leereProbe(laengeneinheit), eigen: leereProbe(laengeneinheit) };
}

/** Vier leere Rechner. */
export function leereRechner() {
  const rechner = {};
  for (const name of RECHNER_NAMEN) rechner[name] = { eingabe: '', anpassung: '0' };
  return rechner;
}

/** Vorbelegung eines neuen Plans (Architektur Sprint 3, Abschnitt 3). */
export function leererPlan() {
  return {
    anfangBreite: '',
    endBreite: '',
    laenge: '',
    maschenProEreignis: '2',
    arbeitsweise: 'reihen',
    jedeZweite: false,
    ereignisWahl: null,
    anpassung: { anfang: '0', ende: '0', reihen: '0' },
  };
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

function probeName(daten, n) {
  return uiText(daten.einstellungen?.sprache ?? STANDARD_SPRACHE, 'probe.standardname', { n });
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

/** Die Probe, die einem Strickstück zugeordnet ist (oder null). */
export function probeVon(projekt, stueck) {
  return projekt.proben.find((p) => p.id === stueck.probeId) ?? null;
}

/** Strickstücke, die eine Probe nutzen. */
export function stueckeMitProbe(projekt, probeId) {
  return projekt.strickstuecke.filter((s) => s.probeId === probeId);
}

/** Projekte nach letzter Änderung, neueste zuerst (US-09, AK1). */
export function projekteSortiert(daten) {
  return [...daten.projekte].sort((a, b) => Date.parse(b.geaendert) - Date.parse(a.geaendert));
}

/** Ersetzt ein Projekt (Hilfe für alle Änderungen). */
function mitProjekt(daten, projekt) {
  return { ...daten, projekte: daten.projekte.map((p) => (p.id === projekt.id ? projekt : p)) };
}

// ---------------------------------------------------------------- Projekte

function pruefeName(name, max = GRENZEN.name) {
  const n = typeof name === 'string' ? name.trim() : '';
  if (n === '') return { gueltig: false, fehler: 'NAME_LEER' };
  return { gueltig: true, name: n.slice(0, max) };
}

/**
 * Legt ein Projekt mit einer leeren „Probe 1“ an (US-09, AK2; US-32).
 * Nur der Name ist Pflicht. Eine angegebene Nadelstärke gehört zur ersten Probe (E18).
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
    erstellt: jetzt,
    geaendert: jetzt,
    proben: [leeresProbenPaar(ERSTE_PROBE_ID, probeName(daten, 1), einheit, text(felder.nadelstaerkeMm, GRENZEN.feld))],
    strickstuecke: [],
  };
  return { gueltig: true, daten: { ...daten, projekte: [...daten.projekte, projekt] }, projektId: id };
}

/**
 * Ändert die Angaben eines Projekts (US-09, AK4).
 * felder: { name?, beschreibung?, garn? } – Proben werden über probeAendern geändert.
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
  return { gueltig: true, daten: mitProjekt(daten, neu) };
}

/** Löscht ein Projekt mit allen Strickstücken (US-09, AK5). */
export function projektLoeschen(daten, projektId) {
  return { ...daten, projekte: daten.projekte.filter((p) => p.id !== projektId) };
}

// ---------------------------------------------------------------- Proben (US-32)

/**
 * Legt eine leere Probe „Probe n“ an (n = nächste freie Nummer).
 * @returns {{gueltig:true, daten:object, probeId:string}|{gueltig:false, fehler:string}}
 */
export function neueProbe(daten, projektId, id, jetzt) {
  const projekt = daten.projekte.find((p) => p.id === projektId);
  if (!projekt) return { gueltig: false, fehler: 'NICHT_GEFUNDEN' };
  const vergeben = new Set(projekt.proben.map((p) => p.name));
  let n = projekt.proben.length + 1;
  while (vergeben.has(probeName(daten, n))) n++;
  const probe = leeresProbenPaar(id, probeName(daten, n), daten.einstellungen.laengeneinheit);
  return {
    gueltig: true,
    daten: mitProjekt(daten, { ...projekt, geaendert: jetzt, proben: [...projekt.proben, probe] }),
    probeId: id,
  };
}

/**
 * Ändert eine Probe: Name, Nadelstärke, Anleitungs- oder eigene Probe.
 * felder: { name?, nadelstaerkeMm?, anleitung?: {...}, eigen?: {...} }
 */
export function probeAendern(daten, projektId, probeId, felder, jetzt) {
  const projekt = daten.projekte.find((p) => p.id === projektId);
  const alt = projekt?.proben.find((p) => p.id === probeId);
  if (!alt) return { gueltig: false, fehler: 'NICHT_GEFUNDEN' };
  const neu = { ...alt };
  if (felder.name !== undefined) {
    const n = pruefeName(felder.name, GRENZEN.probeName);
    if (!n.gueltig) return n;
    neu.name = n.name;
  }
  if (felder.nadelstaerkeMm !== undefined) neu.nadelstaerkeMm = text(felder.nadelstaerkeMm, GRENZEN.feld);
  for (const teil of ['anleitung', 'eigen']) {
    if (!istObjekt(felder[teil])) continue;
    neu[teil] = { ...alt[teil] };
    for (const feld of PROBE_FELDER) {
      if (typeof felder[teil][feld] === 'string') neu[teil][feld] = felder[teil][feld].slice(0, GRENZEN.feld);
    }
  }
  const neuProjekt = { ...projekt, geaendert: jetzt, proben: projekt.proben.map((p) => (p.id === probeId ? neu : p)) };
  return { gueltig: true, daten: mitProjekt(daten, neuProjekt) };
}

/**
 * Löscht eine Probe – nur, wenn kein Strickstück sie nutzt und sie nicht die letzte ist (E20).
 * @returns {{gueltig:true, daten:object}|{gueltig:false, fehler:'NICHT_GEFUNDEN'|'LETZTE_PROBE'|'PROBE_VERWENDET', stuecke?:string[]}}
 */
export function probeLoeschen(daten, projektId, probeId, jetzt) {
  const projekt = daten.projekte.find((p) => p.id === projektId);
  if (!projekt || !projekt.proben.some((p) => p.id === probeId)) return { gueltig: false, fehler: 'NICHT_GEFUNDEN' };
  const nutzer = stueckeMitProbe(projekt, probeId);
  if (nutzer.length > 0) return { gueltig: false, fehler: 'PROBE_VERWENDET', stuecke: nutzer.map((s) => s.name) };
  if (projekt.proben.length <= 1) return { gueltig: false, fehler: 'LETZTE_PROBE' };
  const neuProjekt = { ...projekt, geaendert: jetzt ?? projekt.geaendert, proben: projekt.proben.filter((p) => p.id !== probeId) };
  return { gueltig: true, daten: mitProjekt(daten, neuProjekt) };
}

// ---------------------------------------------------------------- Strickstücke

/**
 * Legt ein Strickstück mit leeren Rechnern, Zähler 0 und ohne Plan an (US-10, US-11 AK1).
 * Ohne probeId wird die einzige Probe des Projekts zugeordnet (E17);
 * gibt es mehrere, muss probeId angegeben werden.
 * @returns {{gueltig:true, daten:object, stueckId:string}|{gueltig:false, fehler:'NAME_LEER'|'NICHT_GEFUNDEN'|'PROBE_FEHLT'}}
 */
export function neuesStrickstueck(daten, projektId, name, id, jetzt, probeId) {
  const n = pruefeName(name);
  if (!n.gueltig) return n;
  const projekt = daten.projekte.find((p) => p.id === projektId);
  if (!projekt) return { gueltig: false, fehler: 'NICHT_GEFUNDEN' };
  let zuordnung = probeId;
  if (zuordnung === undefined || zuordnung === null) {
    if (projekt.proben.length !== 1) return { gueltig: false, fehler: 'PROBE_FEHLT' };
    zuordnung = projekt.proben[0].id;
  }
  if (!projekt.proben.some((p) => p.id === zuordnung)) return { gueltig: false, fehler: 'PROBE_FEHLT' };

  const stueck = {
    id,
    name: n.name,
    erstellt: jetzt,
    geaendert: jetzt,
    probeId: zuordnung,
    rechner: leereRechner(),
    zaehler: 0,
    zielQuelle: null,
    plan: null,
  };
  const neuProjekt = { ...projekt, geaendert: jetzt, strickstuecke: [...projekt.strickstuecke, stueck] };
  return { gueltig: true, daten: mitProjekt(daten, neuProjekt), stueckId: id };
}

/** Übernimmt Planfelder in einen (ggf. neuen) Plan. */
function planMitFeldern(alt, felder) {
  const basis = alt ?? leererPlan();
  const plan = { ...basis, anpassung: { ...basis.anpassung } };
  for (const feld of PLAN_TEXTFELDER) if (typeof felder[feld] === 'string') plan[feld] = felder[feld].slice(0, GRENZEN.feld);
  if (ARBEITSWEISEN.includes(felder.arbeitsweise)) plan.arbeitsweise = felder.arbeitsweise;
  if (typeof felder.jedeZweite === 'boolean') plan.jedeZweite = felder.jedeZweite;
  if (felder.ereignisWahl === null || EREIGNIS_WAHLEN.includes(felder.ereignisWahl)) plan.ereignisWahl = felder.ereignisWahl;
  if (istObjekt(felder.anpassung)) {
    for (const k of ANPASSUNGEN) if (typeof felder.anpassung[k] === 'string') plan.anpassung[k] = felder.anpassung[k].slice(0, GRENZEN.feld);
  }
  return plan;
}

/**
 * Ändert ein Strickstück.
 * felder: { name?, rechner?: { [rechnerName]: { eingabe?, anpassung? } }, zaehler?: number,
 *           probeId?, zielQuelle?: string|null, plan?: object|null }
 * plan: null löscht den Plan, ein Objekt legt ihn an bzw. übernimmt die angegebenen Felder.
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
  if (felder.probeId !== undefined) {
    // Probe wechseln (US-32 AK5): Rechner, Plan und Zähler bleiben erhalten
    if (!gefunden.projekt.proben.some((p) => p.id === felder.probeId)) return { gueltig: false, fehler: 'PROBE_FEHLT' };
    neu.probeId = felder.probeId;
  }
  if (felder.zielQuelle !== undefined) {
    neu.zielQuelle = ZIEL_QUELLEN.includes(felder.zielQuelle) ? felder.zielQuelle : null;
  }
  if (felder.plan === null) neu.plan = null;
  else if (istObjekt(felder.plan)) neu.plan = planMitFeldern(alt.plan, felder.plan);

  const neuProjekt = {
    ...gefunden.projekt,
    geaendert: jetzt,
    strickstuecke: gefunden.projekt.strickstuecke.map((s) => (s.id === stueckId ? neu : s)),
  };
  return { gueltig: true, daten: mitProjekt(daten, neuProjekt) };
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

/** Ungültige Planfelder → Vorbelegung (der Plan bleibt erhalten); kein Objekt → kein Plan. */
function pruefePlan(roh) {
  if (!istObjekt(roh)) return null;
  const basis = leererPlan();
  const anp = istObjekt(roh.anpassung) ? roh.anpassung : {};
  const plan = {};
  for (const feld of PLAN_TEXTFELDER) plan[feld] = text(roh[feld], GRENZEN.feld, basis[feld]);
  plan.arbeitsweise = ARBEITSWEISEN.includes(roh.arbeitsweise) ? roh.arbeitsweise : basis.arbeitsweise;
  plan.jedeZweite = roh.jedeZweite === true;
  plan.ereignisWahl = EREIGNIS_WAHLEN.includes(roh.ereignisWahl) ? roh.ereignisWahl : null;
  plan.anpassung = {};
  for (const k of ANPASSUNGEN) plan.anpassung[k] = text(anp[k], GRENZEN.feld, basis.anpassung[k]);
  return plan;
}

function pruefeNameText(wert, ersatz, max = GRENZEN.name) {
  const n = typeof wert === 'string' ? wert.trim().slice(0, max) : '';
  return n === '' ? ersatz : n;
}

/**
 * Prüft unbekannte Daten (aus dem Speicher oder einer Sicherungsdatei) gegen Schema 3.
 * Fremde Felder werden verworfen, falsche Typen durch Ausgangswerte ersetzt.
 * Beschädigtes wird repariert, nicht gelöscht (Architektur Sprint 3, 6.3):
 * - Projekt ohne Proben → leere „Probe 1“,
 * - probeId ohne passende Probe → erste Probe,
 * - ungültige Planfelder → Vorbelegung, unbekannte Zielquelle → null.
 * @returns {{gueltig:true, daten:object}|{gueltig:false, fehler:'KEIN_OBJEKT'|'SCHEMA'|'KEINE_PROJEKTLISTE'}}
 */
export function pruefeDaten(roh) {
  if (!istObjekt(roh)) return { gueltig: false, fehler: 'KEIN_OBJEKT' };
  if (roh.schemaVersion !== SCHEMA_VERSION) return { gueltig: false, fehler: 'SCHEMA' };
  if (!Array.isArray(roh.projekte)) return { gueltig: false, fehler: 'KEINE_PROJEKTLISTE' };

  const einstellungen = bereinigeEinstellungen(roh.einstellungen);
  const einheit = einstellungen.laengeneinheit;
  const ersatzName = (schluessel, nr) => uiText(einstellungen.sprache, schluessel, { nr, n: nr });
  const projektIds = new Set();

  const projekte = roh.projekte.filter(istObjekt).map((p, i) => {
    const probenIds = new Set();
    let proben = (Array.isArray(p.proben) ? p.proben : []).filter(istObjekt).map((pr, k) => ({
      id: eindeutig(pr.id, probenIds, `pr-reparatur-${k + 1}`),
      name: pruefeNameText(pr.name, ersatzName('probe.standardname', k + 1), GRENZEN.probeName),
      nadelstaerkeMm: text(pr.nadelstaerkeMm, GRENZEN.feld),
      anleitung: pruefeProbe(pr.anleitung, einheit),
      eigen: pruefeProbe(pr.eigen, einheit),
    }));
    if (proben.length === 0) proben = [leeresProbenPaar(ERSTE_PROBE_ID, ersatzName('probe.standardname', 1), einheit)];

    const stueckIds = new Set();
    const strickstuecke = (Array.isArray(p.strickstuecke) ? p.strickstuecke : []).filter(istObjekt).map((s, j) => ({
      id: eindeutig(s.id, stueckIds, `s-reparatur-${j + 1}`),
      name: pruefeNameText(s.name, ersatzName('ersatz.strickstueck', j + 1)),
      erstellt: zeit(s.erstellt),
      geaendert: zeit(s.geaendert),
      probeId: proben.some((pr) => pr.id === s.probeId) ? s.probeId : proben[0].id,
      rechner: pruefeRechner(s.rechner),
      zaehler: zaehlerWert(s.zaehler),
      zielQuelle: ZIEL_QUELLEN.includes(s.zielQuelle) ? s.zielQuelle : null,
      plan: pruefePlan(s.plan),
    }));
    return {
      id: eindeutig(p.id, projektIds, `p-reparatur-${i + 1}`),
      name: pruefeNameText(p.name, ersatzName('ersatz.projekt', i + 1)),
      beschreibung: text(p.beschreibung, GRENZEN.beschreibung),
      garn: text(p.garn, GRENZEN.garn),
      erstellt: zeit(p.erstellt),
      geaendert: zeit(p.geaendert),
      proben,
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

/** Anzahl der Proben über alle Projekte. */
export function anzahlProben(daten) {
  return daten.projekte.reduce((summe, p) => summe + p.proben.length, 0);
}
