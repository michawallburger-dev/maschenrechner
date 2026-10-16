// Tests der Zählerlogik (US-11).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zaehlerPlus, zaehlerMinus, zaehlerAusText, ZAEHLER_MAX } from '../js/zaehler.js';

test('US-11 AK2: +1 und −1', () => {
  assert.equal(zaehlerPlus(0), 1);
  assert.equal(zaehlerPlus(41), 42);
  assert.equal(zaehlerMinus(42), 41);
});

test('US-11 AK3: nie unter 0, nie über 99 999', () => {
  assert.equal(ZAEHLER_MAX, 99999);
  assert.equal(zaehlerMinus(0), 0);
  assert.equal(zaehlerPlus(99999), 99999);
});

test('Viele Klicks hintereinander', () => {
  let n = 0;
  for (let i = 0; i < 250; i++) n = zaehlerPlus(n);
  assert.equal(n, 250);
  for (let i = 0; i < 300; i++) n = zaehlerMinus(n);
  assert.equal(n, 0);
});

test('Direkteingabe: gültige Werte', () => {
  for (const [text, wert] of [['0', 0], ['42', 42], [' 7 ', 7], ['1.000', 1000], ['99.999', 99999], ['+3', 3]]) {
    assert.deepEqual(zaehlerAusText(text), { gueltig: true, wert }, text);
  }
});

test('Direkteingabe: ungültige Werte', () => {
  const fehler = (text) => zaehlerAusText(text).fehler;
  assert.equal(fehler(''), 'LEER');
  assert.equal(fehler('-1'), 'ZU_KLEIN');
  assert.equal(fehler('100000'), 'ZU_GROSS');
  assert.equal(fehler('12,5'), 'KEINE_GANZZAHL');
  assert.equal(fehler('abc'), 'KEINE_ZAHL');
  assert.equal(fehler('12,'), 'UNVOLLSTAENDIG');
});
