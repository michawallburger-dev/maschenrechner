// Tests der Sicherungsdatei (US-12).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { erzeugeSicherung, leseSicherung, MAX_GROESSE } from '../js/sicherung.js';
import { leereDaten, neuesProjekt, neuesStrickstueck } from '../js/modell.js';
import { ZEIT1 } from './hilfen.js';

function beispiel() {
  let d = neuesProjekt(leereDaten({ farbschema: 'dunkel' }), { name: 'Pulli' }, 'p1', ZEIT1).daten;
  d = neuesStrickstueck(d, 'p1', 'Vorderteil', 's1', ZEIT1).daten;
  d = neuesStrickstueck(d, 'p1', 'Rücken', 's2', ZEIT1).daten;
  return neuesProjekt(d, { name: 'Mütze' }, 'p2', ZEIT1).daten;
}

test('US-12 AK1: Dateiname mit lokalem Datum, Inhalt mit Kennung', () => {
  const jetzt = new Date(2026, 9, 5, 23, 30); // 5. Oktober, lokal
  const { dateiname, inhalt } = erzeugeSicherung(beispiel(), jetzt, '0.2.0');
  assert.equal(dateiname, 'maschenrechner-sicherung-2026-10-05.json');
  const roh = JSON.parse(inhalt);
  assert.equal(roh.app, 'maschenrechner');
  assert.equal(roh.format, 1);
  assert.equal(roh.appVersion, '0.2.0');
  assert.equal(roh.erstellt, jetzt.toISOString());
  assert.deepEqual(roh.daten, beispiel());
});

test('US-12 AK2: Sichern und Einlesen ergibt dieselben Daten (Rundreise)', () => {
  const { inhalt } = erzeugeSicherung(beispiel(), new Date(), '0.2.0');
  const r = leseSicherung(inhalt);
  assert.equal(r.gueltig, true);
  assert.deepEqual(r.daten, beispiel());
  assert.equal(r.zusammenfassung.projekte, 2);
  assert.equal(r.zusammenfassung.strickstuecke, 2);
  assert.match(r.zusammenfassung.erstellt, /^\d{4}-/);
});

test('US-12 AK4: ungültige Dateien werden mit Grund abgelehnt', () => {
  const huelle = (x) => JSON.stringify({ app: 'maschenrechner', format: 1, erstellt: ZEIT1, ...x });
  const faelle = [
    [undefined, 'KEIN_JSON'],
    ['', 'KEIN_JSON'],
    ['kein json', 'KEIN_JSON'],
    ['null', 'FALSCHE_APP'],
    ['[1,2]', 'FALSCHE_APP'],
    [JSON.stringify({ app: 'andere', format: 1 }), 'FALSCHE_APP'],
    [JSON.stringify({ app: 'maschenrechner', format: 2, daten: {} }), 'UNBEKANNTES_FORMAT'],
    [huelle({ daten: null }), 'DATEN_UNGUELTIG'],
    [huelle({ daten: { schemaVersion: 1, projekte: [] } }), 'DATEN_UNGUELTIG'],
    [huelle({ daten: { schemaVersion: 2 } }), 'DATEN_UNGUELTIG'],
    ['x'.repeat(MAX_GROESSE + 1), 'ZU_GROSS'],
  ];
  for (const [text, fehler] of faelle) assert.deepEqual(leseSicherung(text), { gueltig: false, fehler }, String(text).slice(0, 40));
});

test('Einlesen bereinigt fremde Felder und kaputte Einträge', () => {
  const text = JSON.stringify({
    app: 'maschenrechner',
    format: 1,
    erstellt: 'nie',
    daten: { schemaVersion: 2, boese: '<script>', projekte: [{ id: 'a', name: 'X', strickstuecke: [{ id: 'b', zaehler: 5, extra: 1 }] }] },
  });
  const r = leseSicherung(text);
  assert.equal(r.gueltig, true);
  assert.equal(r.daten.boese, undefined);
  assert.equal(r.daten.projekte[0].strickstuecke[0].extra, undefined);
  assert.equal(r.daten.projekte[0].strickstuecke[0].zaehler, 5);
  assert.equal(r.zusammenfassung.erstellt, null);
});

test('Leere Projektliste ist eine gültige Sicherung', () => {
  const r = leseSicherung(erzeugeSicherung(leereDaten(), new Date(), '0.2.0').inhalt);
  assert.equal(r.gueltig, true);
  assert.equal(r.zusammenfassung.projekte, 0);
});
