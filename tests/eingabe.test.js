// Tests der Eingabeprüfung: Komma/Punkt, leere Werte, 0, negative Werte, Grenzen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseZahl, pruefeZahl, REGELN } from '../js/eingabe.js';

test('parseZahl: Komma und Punkt als Dezimaltrenner', () => {
  assert.equal(parseZahl('12,5'), 12.5);
  assert.equal(parseZahl('12.5'), 12.5);
  assert.equal(parseZahl(' 3,5 '), 3.5);
  assert.equal(parseZahl(',5'), 0.5);
  assert.equal(parseZahl('10'), 10);
});

test('parseZahl: Vorzeichen und typografisches Minus', () => {
  assert.equal(parseZahl('-2'), -2);
  assert.equal(parseZahl('+1'), 1);
  assert.equal(parseZahl('−3'), -3);
});

test('parseZahl: ungültige Texte → null', () => {
  for (const text of ['', 'abc', '1,2,3', '1.000,5', '1e3', 'Infinity', '12 cm', '--1', '1,', '.', 'NaN']) {
    assert.equal(parseZahl(text), null, `„${text}“ sollte ungültig sein`);
  }
  assert.equal(parseZahl(undefined), null);
});

test('US-01 AK4: leer → LEER (Pflichtfelder)', () => {
  assert.deepEqual(pruefeZahl('', 'probenAnzahl'), { gueltig: false, fehler: 'LEER' });
  assert.deepEqual(pruefeZahl('   ', 'bezugsmass'), { gueltig: false, fehler: 'LEER' });
  assert.deepEqual(pruefeZahl('', 'ganzPositiv'), { gueltig: false, fehler: 'LEER' });
  assert.deepEqual(pruefeZahl('', 'laenge'), { gueltig: false, fehler: 'LEER' });
});

test('US-01 AK4: 0 und negative Werte → NICHT_POSITIV', () => {
  assert.equal(pruefeZahl('0', 'probenAnzahl').fehler, 'NICHT_POSITIV');
  assert.equal(pruefeZahl('-5', 'probenAnzahl').fehler, 'NICHT_POSITIV');
  assert.equal(pruefeZahl('0', 'bezugsmass').fehler, 'NICHT_POSITIV');
  assert.equal(pruefeZahl('0,0', 'laenge').fehler, 'NICHT_POSITIV');
  assert.equal(pruefeZahl('-1', 'ganzPositiv').fehler, 'NICHT_POSITIV');
});

test('US-01 AK4: nicht numerisch → KEINE_ZAHL', () => {
  assert.equal(pruefeZahl('zehn', 'probenAnzahl').fehler, 'KEINE_ZAHL');
  assert.equal(pruefeZahl('10cm', 'laenge').fehler, 'KEINE_ZAHL');
});

test('US-01 AK2: Dezimalzahlen in der Probe erlaubt', () => {
  assert.deepEqual(pruefeZahl('22,5', 'probenAnzahl'), { gueltig: true, wert: 22.5 });
  assert.deepEqual(pruefeZahl('22.5', 'probenAnzahl'), { gueltig: true, wert: 22.5 });
});

test('US-03 AK1: Maschenzahl aus der Anleitung muss ganzzahlig sein', () => {
  assert.equal(pruefeZahl('320,5', 'ganzPositiv').fehler, 'KEINE_GANZZAHL');
  assert.deepEqual(pruefeZahl('320', 'ganzPositiv'), { gueltig: true, wert: 320 });
});

test('Grenzen: genau an der Grenze gültig, darüber ZU_GROSS mit Grenze', () => {
  assert.equal(pruefeZahl('999', 'probenAnzahl').gueltig, true);
  assert.deepEqual(pruefeZahl('999,1', 'probenAnzahl'), { gueltig: false, fehler: 'ZU_GROSS', grenze: 999 });
  assert.equal(pruefeZahl('100', 'bezugsmass').gueltig, true);
  assert.equal(pruefeZahl('100,01', 'bezugsmass').fehler, 'ZU_GROSS');
  assert.equal(pruefeZahl('99999', 'ganzPositiv').gueltig, true);
  assert.equal(pruefeZahl('100000', 'ganzPositiv').fehler, 'ZU_GROSS');
  assert.equal(pruefeZahl('9999', 'laenge').gueltig, true);
  assert.equal(pruefeZahl('123456789', 'laenge').fehler, 'ZU_GROSS');
});

test('US-02 AK5: Nadelstärke darf leer sein, sonst > 0 und ≤ 30', () => {
  assert.deepEqual(pruefeZahl('', 'nadel'), { gueltig: true, wert: null });
  assert.deepEqual(pruefeZahl('3,5', 'nadel'), { gueltig: true, wert: 3.5 });
  assert.equal(pruefeZahl('0', 'nadel').fehler, 'NICHT_POSITIV');
  assert.equal(pruefeZahl('31', 'nadel').fehler, 'ZU_GROSS');
});

test('US-03 AK4: Anpassung – ganze Zahl, negativ erlaubt, leer = 0', () => {
  assert.deepEqual(pruefeZahl('', 'anpassung'), { gueltig: true, wert: 0 });
  assert.deepEqual(pruefeZahl('-2', 'anpassung'), { gueltig: true, wert: -2 });
  assert.deepEqual(pruefeZahl('−2', 'anpassung'), { gueltig: true, wert: -2 });
  assert.deepEqual(pruefeZahl('+1', 'anpassung'), { gueltig: true, wert: 1 });
  assert.deepEqual(pruefeZahl('0', 'anpassung'), { gueltig: true, wert: 0 });
  assert.deepEqual(pruefeZahl('-0', 'anpassung'), { gueltig: true, wert: 0 });
  assert.ok(Object.is(pruefeZahl('-0', 'anpassung').wert, 0), '−0 wird zu 0');
  assert.equal(pruefeZahl('1,5', 'anpassung').fehler, 'KEINE_GANZZAHL');
  assert.deepEqual(pruefeZahl('-10000', 'anpassung'), { gueltig: false, fehler: 'ZU_KLEIN', grenze: -9999 });
  assert.deepEqual(pruefeZahl('10000', 'anpassung'), { gueltig: false, fehler: 'ZU_GROSS', grenze: 9999 });
});

test('Unbekannte Prüfregel ist ein Programmierfehler', () => {
  assert.throws(() => pruefeZahl('1', 'gibtsNicht'), TypeError);
});

test('Regeln sind unveränderlich', () => {
  assert.ok(Object.isFrozen(REGELN));
  assert.ok(Object.isFrozen(REGELN.anpassung));
});
