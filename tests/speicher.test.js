// Tests von Laden/Speichern (seit Sprint 3: Schema 3) mit nachgebautem Speicher (US-27, R6).
// Die Übernahme aus 0.2 (Schema 2) steht in migration-v3.test.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ladeDaten,
  speichereDaten,
  sichereVorImport,
  SCHLUESSEL_V1,
  SCHLUESSEL_V2,
  SCHLUESSEL_V3,
  SCHLUESSEL_DEFEKT,
  SCHLUESSEL_VOR_IMPORT,
} from '../js/speicher.js';
import { leereDaten, neuesProjekt } from '../js/modell.js';
import { neuerSpeicher, gesperrterSpeicher, vollerSpeicher, idZaehler, v1Zustand, ZEIT1 } from './hilfen.js';

const opt = () => ({ neueId: idZaehler(), jetzt: ZEIT1, projektName: 'Mein Projekt', stueckName: 'Teil 1' });

function beispiel() {
  return neuesProjekt(leereDaten(), { name: 'Socken' }, 'p1', ZEIT1).daten;
}

test('Schlüssel sind festgelegt und verschieden', () => {
  assert.equal(SCHLUESSEL_V1, 'maschenrechner.zustand');
  assert.equal(SCHLUESSEL_V2, 'maschenrechner.daten.v2');
  assert.equal(SCHLUESSEL_V3, 'maschenrechner.daten.v3');
  assert.equal(new Set([SCHLUESSEL_V1, SCHLUESSEL_V2, SCHLUESSEL_V3, SCHLUESSEL_DEFEKT, SCHLUESSEL_VOR_IMPORT]).size, 5);
});

test('Erster Start ohne Daten: leer, speicherbar, nichts geschrieben', () => {
  const s = neuerSpeicher();
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'neu');
  assert.equal(r.speicherbar, true);
  assert.equal(r.beschaedigt, false);
  assert.equal(r.uebernommenesProjekt, null);
  assert.deepEqual(r.daten, leereDaten());
  assert.equal(s.roh.size, 0);
});

test('Speichern und wieder Laden ergibt dieselben Daten', () => {
  const s = neuerSpeicher();
  assert.equal(speichereDaten(s, beispiel()), true);
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'v3');
  assert.deepEqual(r.daten, beispiel());
});

test('US-27 AK1/AK2: Übernahme aus 0.1 – alter Schlüssel bleibt unverändert', () => {
  const alt = JSON.stringify(v1Zustand());
  const s = neuerSpeicher({ [SCHLUESSEL_V1]: alt });
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'v1');
  assert.equal(r.uebernommenesProjekt, 'p-test-1');
  assert.equal(r.daten.projekte[0].strickstuecke[0].id, 's-test-2');
  assert.equal(s.getItem(SCHLUESSEL_V1), alt, 'Daten aus 0.1 dürfen nicht verändert werden');
  assert.deepEqual(JSON.parse(s.getItem(SCHLUESSEL_V3)), r.daten, 'Ergebnis wird sofort gespeichert');
});

test('US-27: Übernahme passiert nur einmal (danach gilt das aktuelle Schema)', () => {
  const s = neuerSpeicher({ [SCHLUESSEL_V1]: JSON.stringify(v1Zustand()) });
  ladeDaten(s, opt());
  const zweiter = ladeDaten(s, opt());
  assert.equal(zweiter.quelle, 'v3');
  assert.equal(zweiter.uebernommenesProjekt, null);
  assert.equal(zweiter.daten.projekte.length, 1, 'kein zweites „Mein Projekt“');
});

test('US-27 AK3: leerer Zustand aus 0.1 → leere Projektliste', () => {
  const leer = { ...v1Zustand(), rechner: {} };
  for (const p of ['probeAnleitung', 'probeEigen']) leer[p] = {};
  const s = neuerSpeicher({ [SCHLUESSEL_V1]: JSON.stringify(leer) });
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'neu');
  assert.equal(r.daten.projekte.length, 0);
});

test('Unlesbarer Zustand aus 0.1 → leer, alter Schlüssel bleibt', () => {
  const s = neuerSpeicher({ [SCHLUESSEL_V1]: '{kaputt' });
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'neu');
  assert.equal(s.getItem(SCHLUESSEL_V1), '{kaputt');
});

test('R6: beschädigte Schema-3-Daten werden unter „.defekt“ aufbewahrt', () => {
  for (const kaputt of ['{nicht json', '"text"', JSON.stringify({ schemaVersion: 3, projekte: 'x' })]) {
    const s = neuerSpeicher({ [SCHLUESSEL_V3]: kaputt });
    const r = ladeDaten(s, opt());
    assert.equal(r.quelle, 'neu');
    assert.equal(r.beschaedigt, true, 'S2-04: App kann darauf hinweisen');
    assert.equal(s.getItem(SCHLUESSEL_DEFEKT), kaputt);
    assert.equal(s.getItem(SCHLUESSEL_V3), kaputt, 'erst beim nächsten Speichern überschrieben');
  }
});

test('R6: beschädigte Schema-3-Daten, aber 0.1 vorhanden → Übernahme aus 0.1', () => {
  const s = neuerSpeicher({ [SCHLUESSEL_V3]: '{x', [SCHLUESSEL_V1]: JSON.stringify(v1Zustand()) });
  const r = ladeDaten(s, opt());
  assert.equal(r.quelle, 'v1');
  assert.equal(r.beschaedigt, true);
  assert.equal(s.getItem(SCHLUESSEL_DEFEKT), '{x');
});

test('Kein Speicher / gesperrter Speicher: App läuft, aber nicht speicherbar', () => {
  for (const s of [null, gesperrterSpeicher]) {
    const r = ladeDaten(s, opt());
    assert.equal(r.speicherbar, false);
    assert.deepEqual(r.daten, leereDaten());
    assert.equal(speichereDaten(s, beispiel()), false);
    assert.equal(sichereVorImport(s), false);
  }
});

test('Voller Speicher: Speichern meldet false, wirft nicht', () => {
  assert.equal(speichereDaten(vollerSpeicher(), beispiel()), false);
});

test('US-12 AK3: sichereVorImport kopiert den aktuellen Stand', () => {
  const s = neuerSpeicher();
  assert.equal(sichereVorImport(s), true, 'nichts zu sichern ist kein Fehler');
  assert.equal(s.getItem(SCHLUESSEL_VOR_IMPORT), null);
  speichereDaten(s, beispiel());
  assert.equal(sichereVorImport(s), true);
  assert.equal(s.getItem(SCHLUESSEL_VOR_IMPORT), s.getItem(SCHLUESSEL_V3));
  assert.equal(sichereVorImport(vollerSpeicher({ [SCHLUESSEL_V3]: '{}' })), false);
});
