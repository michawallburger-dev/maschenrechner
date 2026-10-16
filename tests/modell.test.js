// Tests des Datenmodells Schema 2 (US-09, US-10, US-11, US-26).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION,
  RECHNER_NAMEN,
  leereDaten,
  leereRechner,
  bereinigeEinstellungen,
  finde,
  projekteSortiert,
  neuesProjekt,
  projektAendern,
  projektLoeschen,
  neuesStrickstueck,
  strickstueckAendern,
  strickstueckLoeschen,
  einstellungAendern,
  hinweisGesehen,
  pruefeDaten,
  anzahlStrickstuecke,
  ID_MUSTER,
} from '../js/modell.js';
import { ZEIT1, ZEIT2, ZEIT3 } from './hilfen.js';

function mitProjekt(name = 'Pullover') {
  const r = neuesProjekt(leereDaten(), { name }, 'p1', ZEIT1);
  assert.equal(r.gueltig, true);
  return r.daten;
}

function mitStueck() {
  const r = neuesStrickstueck(mitProjekt(), 'p1', 'Vorderteil', 's1', ZEIT2);
  assert.equal(r.gueltig, true);
  return r.daten;
}

test('leereDaten: Schema 2, leere Liste, Standard-Einstellungen', () => {
  const d = leereDaten();
  assert.equal(d.schemaVersion, SCHEMA_VERSION);
  assert.deepEqual(d.projekte, []);
  assert.deepEqual(d.einstellungen, { sprache: 'de', laengeneinheit: 'cm', farbschema: 'system' });
  assert.deepEqual(d.hinweise, { projektlisteErklaert: false, wachhaltenNichtMoeglich: false });
});

test('bereinigeEinstellungen: unbekannte Werte → Standard, Felder unabhängig', () => {
  assert.deepEqual(bereinigeEinstellungen({ sprache: 'xx', laengeneinheit: 'yard', farbschema: 'lila' }), {
    sprache: 'de',
    laengeneinheit: 'cm',
    farbschema: 'system',
  });
  assert.equal(bereinigeEinstellungen({ farbschema: 'dunkel' }).farbschema, 'dunkel');
  assert.equal(bereinigeEinstellungen(null).farbschema, 'system');
});

test('US-09 AK2: Projekt anlegen – nur der Name ist Pflicht, getrimmt', () => {
  const d = mitProjekt('  Pullover für Sohn  ');
  const p = d.projekte[0];
  assert.equal(p.name, 'Pullover für Sohn');
  assert.equal(p.beschreibung, '');
  assert.equal(p.probeAnleitung.maschenBezug, '10');
  assert.equal(p.probeEigen.reihenBezug, '10');
  assert.deepEqual(p.strickstuecke, []);
  assert.equal(p.erstellt, ZEIT1);
});

test('US-09 AK2: leerer Name wird abgelehnt', () => {
  for (const name of ['', '   ', undefined, 42]) {
    assert.deepEqual(neuesProjekt(leereDaten(), { name }, 'p1', ZEIT1), { gueltig: false, fehler: 'NAME_LEER' });
  }
});

test('Name wird auf 80 Zeichen gekürzt', () => {
  const d = mitProjekt('x'.repeat(200));
  assert.equal(d.projekte[0].name.length, 80);
});

test('Reine Funktionen: Eingabedaten bleiben unverändert', () => {
  const vorher = mitProjekt();
  const kopie = structuredClone(vorher);
  projektAendern(vorher, 'p1', { name: 'Neu', probeEigen: { maschenAnzahl: '22' } }, ZEIT2);
  neuesStrickstueck(vorher, 'p1', 'Teil', 's9', ZEIT2);
  projektLoeschen(vorher, 'p1');
  assert.deepEqual(vorher, kopie);
});

test('US-09 AK4: Angaben und Proben ändern', () => {
  const r = projektAendern(mitProjekt(), 'p1', { garn: 'Merino', probeEigen: { maschenAnzahl: '22', fremd: 'x' } }, ZEIT2);
  assert.equal(r.gueltig, true);
  const p = r.daten.projekte[0];
  assert.equal(p.garn, 'Merino');
  assert.equal(p.probeEigen.maschenAnzahl, '22');
  assert.equal(p.probeEigen.maschenBezug, '10');
  assert.equal(p.probeEigen.fremd, undefined);
  assert.equal(p.geaendert, ZEIT2);
});

test('projektAendern: leerer Name abgelehnt, unbekanntes Projekt gemeldet', () => {
  assert.equal(projektAendern(mitProjekt(), 'p1', { name: ' ' }, ZEIT2).fehler, 'NAME_LEER');
  assert.equal(projektAendern(mitProjekt(), 'gibtsnicht', { garn: 'x' }, ZEIT2).fehler, 'NICHT_GEFUNDEN');
});

test('US-09 AK5: Projekt löschen entfernt es mit allen Strickstücken', () => {
  const d = projektLoeschen(mitStueck(), 'p1');
  assert.equal(d.projekte.length, 0);
  assert.equal(anzahlStrickstuecke(d), 0);
});

test('US-09 AK1: Sortierung nach letzter Änderung, neueste zuerst', () => {
  let d = leereDaten();
  d = neuesProjekt(d, { name: 'A' }, 'a', ZEIT1).daten;
  d = neuesProjekt(d, { name: 'B' }, 'b', ZEIT2).daten;
  assert.deepEqual(projekteSortiert(d).map((p) => p.name), ['B', 'A']);
  d = projektAendern(d, 'a', { garn: 'x' }, ZEIT3).daten;
  assert.deepEqual(projekteSortiert(d).map((p) => p.name), ['A', 'B']);
});

test('US-10 AK1: Strickstück anlegen mit leeren Rechnern und Zähler 0', () => {
  const d = mitStueck();
  const { stueck, projekt } = finde(d, 'p1', 's1');
  assert.equal(stueck.name, 'Vorderteil');
  assert.equal(stueck.zaehler, 0);
  assert.deepEqual(stueck.rechner, leereRechner());
  assert.deepEqual(Object.keys(stueck.rechner), [...RECHNER_NAMEN]);
  assert.equal(projekt.geaendert, ZEIT2);
});

test('neuesStrickstueck: leerer Name / unbekanntes Projekt', () => {
  assert.equal(neuesStrickstueck(mitProjekt(), 'p1', '', 's1', ZEIT2).fehler, 'NAME_LEER');
  assert.equal(neuesStrickstueck(mitProjekt(), 'nix', 'A', 's1', ZEIT2).fehler, 'NICHT_GEFUNDEN');
});

test('US-10: Rechnerfeld ändern, andere Felder bleiben', () => {
  const r = strickstueckAendern(mitStueck(), 'p1', 's1', { rechner: { breiteZuMaschen: { eingabe: '50' } } }, ZEIT3);
  const { stueck, projekt } = finde(r.daten, 'p1', 's1');
  assert.equal(stueck.rechner.breiteZuMaschen.eingabe, '50');
  assert.equal(stueck.rechner.breiteZuMaschen.anpassung, '0');
  assert.equal(stueck.rechner.maschenAusAnleitung.eingabe, '');
  assert.equal(stueck.geaendert, ZEIT3);
  assert.equal(projekt.geaendert, ZEIT3, 'Projekt rückt in der Liste nach oben');
});

test('US-10: unbekannter Rechnername wird ignoriert', () => {
  const r = strickstueckAendern(mitStueck(), 'p1', 's1', { rechner: { boese: { eingabe: '1' } } }, ZEIT3);
  assert.equal(finde(r.daten, 'p1', 's1').stueck.rechner.boese, undefined);
});

test('US-11: Zähler wird auf 0 … 99 999 begrenzt und gerundet', () => {
  const zaehler = (wert) => finde(strickstueckAendern(mitStueck(), 'p1', 's1', { zaehler: wert }, ZEIT3).daten, 'p1', 's1').stueck.zaehler;
  assert.equal(zaehler(42), 42);
  assert.equal(zaehler(-5), 0);
  assert.equal(zaehler(1e9), 99999);
  assert.equal(zaehler(2.6), 3);
  assert.equal(zaehler(Number.NaN), 0);
  assert.equal(zaehler('7'), 0);
});

test('Strickstück umbenennen: leer abgelehnt', () => {
  assert.equal(strickstueckAendern(mitStueck(), 'p1', 's1', { name: '' }, ZEIT3).fehler, 'NAME_LEER');
  assert.equal(finde(strickstueckAendern(mitStueck(), 'p1', 's1', { name: 'Rücken' }, ZEIT3).daten, 'p1', 's1').stueck.name, 'Rücken');
  assert.equal(strickstueckAendern(mitStueck(), 'p1', 'nix', { name: 'A' }, ZEIT3).fehler, 'NICHT_GEFUNDEN');
});

test('US-10 AK4: Strickstück löschen', () => {
  const d = strickstueckLoeschen(mitStueck(), 'p1', 's1', ZEIT3);
  assert.equal(finde(d, 'p1', 's1'), null);
  assert.equal(finde(d, 'p1').projekt.geaendert, ZEIT3);
});

test('finde: unbekannte IDs → null', () => {
  assert.equal(finde(mitStueck(), 'x'), null);
  assert.equal(finde(mitStueck(), 'p1', 'x'), null);
  assert.ok(finde(mitStueck(), 'p1'));
});

test('US-26: Farbschema ändern, unbekannter Wert → system', () => {
  assert.equal(einstellungAendern(leereDaten(), { farbschema: 'hell' }).einstellungen.farbschema, 'hell');
  assert.equal(einstellungAendern(leereDaten(), { farbschema: 'pink' }).einstellungen.farbschema, 'system');
  assert.equal(einstellungAendern(leereDaten(), { farbschema: 'dunkel' }).einstellungen.sprache, 'de');
});

test('hinweisGesehen merkt den Hinweis', () => {
  assert.equal(hinweisGesehen(leereDaten(), 'wachhaltenNichtMoeglich').hinweise.wachhaltenNichtMoeglich, true);
});

test('pruefeDaten: grundsätzlich ungültige Daten', () => {
  assert.equal(pruefeDaten(null).fehler, 'KEIN_OBJEKT');
  assert.equal(pruefeDaten([]).fehler, 'KEIN_OBJEKT');
  assert.equal(pruefeDaten({ schemaVersion: 1, projekte: [] }).fehler, 'SCHEMA');
  assert.equal(pruefeDaten({ schemaVersion: 3, projekte: [] }).fehler, 'SCHEMA');
  assert.equal(pruefeDaten({ schemaVersion: 2, projekte: {} }).fehler, 'KEINE_PROJEKTLISTE');
});

test('pruefeDaten: gültige Daten bleiben gleich', () => {
  const d = mitStueck();
  assert.deepEqual(pruefeDaten(structuredClone(d)).daten, d);
});

test('pruefeDaten: repariert beschädigte Einträge statt sie zu löschen', () => {
  const r = pruefeDaten({
    schemaVersion: 2,
    einstellungen: { farbschema: 'dunkel', extra: 1 },
    hinweise: { projektlisteErklaert: 'ja' },
    fremd: 'weg',
    projekte: [
      { id: 'a', name: '', strickstuecke: [{ id: 'x', zaehler: -3 }, { id: 'x', name: 'B', zaehler: 123456 }, 'kaputt'] },
      { id: 'a', name: '  Zweites  ', probeEigen: { maschenAnzahl: 22 }, erstellt: 'kein Datum' },
      null,
      { name: 'Ohne ID' },
    ],
  });
  assert.equal(r.gueltig, true);
  const d = r.daten;
  assert.equal(d.fremd, undefined);
  assert.equal(d.einstellungen.farbschema, 'dunkel');
  assert.equal(d.einstellungen.extra, undefined);
  assert.equal(d.hinweise.projektlisteErklaert, false);
  assert.equal(d.projekte.length, 3);
  const [p1, p2, p3] = d.projekte;
  assert.equal(p1.name, 'Projekt 1');
  assert.deepEqual(p1.strickstuecke.map((s) => s.id), ['x', 'x-2']);
  assert.equal(p1.strickstuecke[0].name, 'Teil 1');
  assert.equal(p1.strickstuecke[0].zaehler, 0);
  assert.equal(p1.strickstuecke[1].zaehler, 99999);
  assert.deepEqual(p1.strickstuecke[0].rechner, leereRechner());
  assert.equal(p2.id, 'a-2', 'doppelte ID wird eindeutig gemacht');
  assert.equal(p2.name, 'Zweites');
  assert.equal(p2.probeEigen.maschenAnzahl, '', 'Zahl statt Text → Ausgangswert');
  assert.equal(p2.erstellt, '1970-01-01T00:00:00.000Z');
  assert.equal(p3.id, 'p-reparatur-3');
  assert.equal(p3.name, 'Ohne ID');
});

test('anzahlStrickstuecke zählt über alle Projekte', () => {
  let d = mitStueck();
  d = neuesStrickstueck(d, 'p1', 'Rücken', 's2', ZEIT3).daten;
  d = neuesProjekt(d, { name: 'Mütze' }, 'p2', ZEIT3).daten;
  assert.equal(anzahlStrickstuecke(d), 2);
});

test('S2-03: ungültige IDs werden durch Ersatz-IDs ersetzt, gültige bleiben', () => {
  const r = pruefeDaten({
    schemaVersion: 2,
    projekte: [
      { id: 'mein projekt', name: 'A', strickstuecke: [{ id: 'teil/1', name: 'B' }, { id: 'ok_1', name: 'C' }] },
      { id: 'p-ok', name: 'D' },
      { id: 'ä', name: 'E' },
      { id: 'x'.repeat(65), name: 'F' },
    ],
  });
  const ids = r.daten.projekte.map((p) => p.id);
  assert.deepEqual(ids, ['p-reparatur-1', 'p-ok', 'p-reparatur-3', 'p-reparatur-4']);
  assert.deepEqual(r.daten.projekte[0].strickstuecke.map((s) => s.id), ['s-reparatur-1', 'ok_1']);
  for (const id of ids) assert.match(id, ID_MUSTER);
});
