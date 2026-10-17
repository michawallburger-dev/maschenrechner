// Tests der Übernahme aus 0.1 (US-27) – seit Sprint 3 direkt in Schema 3.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bereinigeV1, hatInhalt, vonSchema1 } from '../js/migration.js';
import { leereRechner } from '../js/modell.js';
import { v1Zustand, ZEIT1 } from './hilfen.js';

const OPT = { projektId: 'p-neu', stueckId: 's-neu', jetzt: ZEIT1, projektName: 'Mein Projekt', stueckName: 'Teil 1' };

test('US-27 AK1: Proben, Nadelstärke und Rechner werden vollständig übernommen', () => {
  const ergebnis = vonSchema1(v1Zustand(), OPT);
  assert.equal(ergebnis.projektId, 'p-neu');
  const { daten } = ergebnis;
  assert.equal(daten.schemaVersion, 3);
  assert.equal(daten.projekte.length, 1);
  const p = daten.projekte[0];
  assert.equal(p.name, 'Mein Projekt');
  assert.equal(p.proben.length, 1);
  assert.equal(p.proben[0].name, 'Probe 1');
  assert.equal(p.proben[0].nadelstaerkeMm, '4,5');
  assert.deepEqual(p.proben[0].anleitung, { maschenAnzahl: '34', maschenBezug: '10', reihenAnzahl: '52', reihenBezug: '10' });
  assert.deepEqual(p.proben[0].eigen, { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '35', reihenBezug: '10' });
  assert.equal(p.strickstuecke.length, 1);
  const s = p.strickstuecke[0];
  assert.equal(s.id, 's-neu');
  assert.equal(s.name, 'Teil 1');
  assert.equal(s.zaehler, 0);
  assert.equal(s.probeId, p.proben[0].id);
  assert.equal(s.plan, null);
  assert.deepEqual(s.rechner, v1Zustand().rechner);
});

test('US-27: Einstellungen werden übernommen, Farbschema = system', () => {
  assert.deepEqual(vonSchema1(v1Zustand(), OPT).daten.einstellungen, { sprache: 'de', laengeneinheit: 'cm', farbschema: 'system' });
});

test('US-27 AK3: leerer Zustand aus 0.1 → kein Projekt', () => {
  const leer = {
    schemaVersion: 1,
    einstellungen: {},
    probeAnleitung: { maschenAnzahl: '', maschenBezug: '10', reihenAnzahl: '', reihenBezug: '10' },
    probeEigen: { maschenAnzahl: '  ', maschenBezug: '10', reihenAnzahl: '', reihenBezug: '10', nadelstaerkeMm: '' },
    rechner: { maschenAusAnleitung: { eingabe: '', anpassung: '0' } },
  };
  assert.equal(hatInhalt(bereinigeV1(leer)), false);
  assert.equal(vonSchema1(leer, OPT), null);
});

test('US-27: schon eine Anpassung oder ein geändertes Bezugsmaß zählt als Inhalt', () => {
  const a = v1Zustand();
  for (const p of ['probeAnleitung', 'probeEigen']) a[p] = { maschenAnzahl: '', maschenBezug: '10', reihenAnzahl: '', reihenBezug: '10' };
  a.rechner = { ...leereRechner(), laengeZuReihen: { eingabe: '', anpassung: '2' } };
  assert.notEqual(vonSchema1(a, OPT), null);
  const b = v1Zustand();
  for (const p of ['probeAnleitung', 'probeEigen']) b[p] = { maschenAnzahl: '', maschenBezug: '12', reihenAnzahl: '', reihenBezug: '10' };
  b.rechner = leereRechner();
  assert.notEqual(vonSchema1(b, OPT), null);
});

test('bereinigeV1: kein Zustand aus 0.1 → null', () => {
  for (const roh of [null, undefined, 'x', [], { schemaVersion: 2 }, {}]) assert.equal(bereinigeV1(roh), null);
  assert.equal(vonSchema1({ schemaVersion: 2, projekte: [] }, OPT), null);
});

test('bereinigeV1: falsche Typen → Ausgangswerte, fehlende Teile ergänzt', () => {
  const v = bereinigeV1({ schemaVersion: 1, probeEigen: { maschenAnzahl: 25, nadelstaerkeMm: 4 }, rechner: { breiteZuMaschen: { eingabe: '30' } } });
  assert.equal(v.probeEigen.maschenAnzahl, '');
  assert.equal(v.nadelstaerkeMm, '');
  assert.equal(v.rechner.breiteZuMaschen.eingabe, '30');
  assert.equal(v.rechner.breiteZuMaschen.anpassung, '0');
  assert.equal(v.rechner.laengeZuReihen.eingabe, '');
});

test('Eingabe des Originals bleibt unverändert', () => {
  const roh = v1Zustand();
  const kopie = structuredClone(roh);
  vonSchema1(roh, OPT);
  assert.deepEqual(roh, kopie);
});
