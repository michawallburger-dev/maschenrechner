// Tests der Übernahme aus 0.2 (Schema 2 → 3, US-32 AK8) – gespeicherte Daten.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vonSchema2, vonSchema1 } from '../js/migration.js';
import { ladeDaten, SCHLUESSEL_V1, SCHLUESSEL_V2, SCHLUESSEL_V3, SCHLUESSEL_DEFEKT } from '../js/speicher.js';
import { neuerSpeicher, idZaehler, v1Zustand, ZEIT1, ZEIT2 } from './hilfen.js';

const opt = () => ({ neueId: idZaehler(), jetzt: ZEIT1, projektName: 'Mein Projekt', stueckName: 'Teil 1' });

/** Daten, wie Version 0.2 sie gespeichert hat. */
function v2Daten() {
  return {
    schemaVersion: 2,
    einstellungen: { sprache: 'de', laengeneinheit: 'cm', farbschema: 'dunkel' },
    hinweise: { projektlisteErklaert: true, wachhaltenNichtMoeglich: false },
    projekte: [
      {
        id: 'p-1', name: 'Pullover', beschreibung: 'für Sohn', garn: 'Merino', nadelstaerkeMm: '3,5',
        erstellt: ZEIT1, geaendert: ZEIT2,
        probeAnleitung: { maschenAnzahl: '34', maschenBezug: '10', reihenAnzahl: '52', reihenBezug: '10' },
        probeEigen: { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' },
        strickstuecke: [
          {
            id: 's-1', name: 'Ärmel links', erstellt: ZEIT1, geaendert: ZEIT2, zaehler: 42,
            rechner: {
              maschenAusAnleitung: { eingabe: '320', anpassung: '-2' },
              reihenAusAnleitung: { eingabe: '55', anpassung: '0' },
              breiteZuMaschen: { eingabe: '', anpassung: '0' },
              laengeZuReihen: { eingabe: '13,5', anpassung: '0' },
            },
          },
          { id: 's-2', name: 'Rücken', erstellt: ZEIT1, geaendert: ZEIT1, zaehler: 0, rechner: {} },
        ],
      },
      { id: 'p-2', name: 'Mütze', erstellt: ZEIT1, geaendert: ZEIT1, probeAnleitung: {}, probeEigen: {}, strickstuecke: [] },
    ],
  };
}

test('US-32 AK8: bisherige Probe wird „Probe 1“ mit der Nadel des Projekts', () => {
  const d = vonSchema2(v2Daten());
  assert.equal(d.schemaVersion, 3);
  const p = d.projekte[0];
  assert.equal(p.nadelstaerkeMm, undefined, 'Nadel liegt nicht mehr am Projekt');
  assert.deepEqual(p.proben, [
    {
      id: 'pr-1',
      name: 'Probe 1',
      nadelstaerkeMm: '3,5',
      anleitung: { maschenAnzahl: '34', maschenBezug: '10', reihenAnzahl: '52', reihenBezug: '10' },
      eigen: { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' },
    },
  ]);
});

test('US-32 AK8: alle Strickstücke werden „Probe 1“ zugeordnet; Rechner, Zähler, Namen bleiben', () => {
  const p = vonSchema2(v2Daten()).projekte[0];
  assert.deepEqual(p.strickstuecke.map((s) => [s.id, s.name, s.probeId, s.zaehler, s.plan, s.zielQuelle]), [
    ['s-1', 'Ärmel links', 'pr-1', 42, null, null],
    ['s-2', 'Rücken', 'pr-1', 0, null, null],
  ]);
  assert.deepEqual(p.strickstuecke[0].rechner, v2Daten().projekte[0].strickstuecke[0].rechner);
  assert.equal(p.geaendert, ZEIT2);
});

test('Übernahme aus 0.2: Einstellungen, Hinweise und weitere Projekte bleiben', () => {
  const d = vonSchema2(v2Daten());
  assert.equal(d.einstellungen.farbschema, 'dunkel');
  assert.equal(d.hinweise.projektlisteErklaert, true);
  assert.equal(d.projekte[1].name, 'Mütze');
  assert.equal(d.projekte[1].proben[0].anleitung.maschenBezug, '10', 'leere Probe bekommt Ausgangswerte');
});

test('vonSchema2: keine Daten aus 0.2 → null', () => {
  for (const roh of [null, 'x', [], { schemaVersion: 3, projekte: [] }, { schemaVersion: 2 }, { schemaVersion: 2, projekte: 'x' }]) {
    assert.equal(vonSchema2(roh), null);
  }
});

test('vonSchema2 verändert die Eingabe nicht', () => {
  const roh = v2Daten();
  const kopie = structuredClone(roh);
  vonSchema2(roh);
  assert.deepEqual(roh, kopie);
});

test('Laden: Daten aus 0.2 werden übernommen und unter v3 gespeichert, alter Schlüssel bleibt', () => {
  const alt = JSON.stringify(v2Daten());
  const s = neuerSpeicher({ [SCHLUESSEL_V2]: alt });
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'v2');
  assert.equal(r.uebernommenesProjekt, null);
  assert.equal(r.daten.projekte.length, 2);
  assert.equal(s.getItem(SCHLUESSEL_V2), alt, 'Daten aus 0.2 dürfen nicht verändert werden');
  assert.deepEqual(JSON.parse(s.getItem(SCHLUESSEL_V3)), r.daten);
  assert.equal(ladeDaten(s, opt()).quelle, 'v3', 'Übernahme nur einmal');
});

test('Laden: 0.2 geht vor 0.1', () => {
  const s = neuerSpeicher({ [SCHLUESSEL_V2]: JSON.stringify(v2Daten()), [SCHLUESSEL_V1]: JSON.stringify(v1Zustand()) });
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'v2');
  assert.equal(r.daten.projekte[0].name, 'Pullover');
});

test('Laden: beschädigte v3-Daten → Rohdaten unter „.defekt“, Rückfall auf 0.2', () => {
  const s = neuerSpeicher({ [SCHLUESSEL_V3]: '{kaputt', [SCHLUESSEL_V2]: JSON.stringify(v2Daten()) });
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'v2');
  assert.equal(r.beschaedigt, true);
  assert.equal(s.getItem(SCHLUESSEL_DEFEKT), '{kaputt');
});

test('Laden: unlesbare Daten aus 0.2 → weiter mit 0.1, Schlüssel bleiben', () => {
  const s = neuerSpeicher({ [SCHLUESSEL_V2]: '{x', [SCHLUESSEL_V1]: JSON.stringify(v1Zustand()) });
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'v1');
  assert.equal(s.getItem(SCHLUESSEL_V2), '{x');
});

test('0.1 → 3 in einem Durchlauf: Nadel aus 0.1 landet an „Probe 1“', () => {
  const r = vonSchema1(v1Zustand(), { projektId: 'p', stueckId: 's', jetzt: ZEIT1, projektName: 'Mein Projekt', stueckName: 'Teil 1' });
  assert.equal(r.daten.schemaVersion, 3);
  assert.equal(r.daten.projekte[0].proben[0].nadelstaerkeMm, '4,5');
  assert.equal(r.daten.projekte[0].strickstuecke[0].probeId, 'pr-1');
});
