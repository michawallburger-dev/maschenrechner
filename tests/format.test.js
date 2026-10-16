// Tests der Ausgabeformatierung (deutsches Zahlenformat, Vorzeichen der Abweichung).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatZahl, formatGanzzahl, formatAbweichung, LEER_ANZEIGE } from '../js/format.js';

const DE = 'de-DE';

test('formatZahl: 2 Nachkommastellen mit Komma', () => {
  assert.equal(formatZahl(94.11764705882354, DE), '94,12');
  assert.equal(formatZahl(94, DE), '94,00');
  assert.equal(formatZahl(3.4, DE), '3,40');
  assert.equal(formatZahl(10.5769, DE), '10,58');
});

test('formatZahl: keine Tausendertrenner', () => {
  assert.equal(formatZahl(12345.678, DE), '12345,68');
});

test('formatGanzzahl: ohne Tausendertrenner', () => {
  assert.equal(formatGanzzahl(235, DE), '235');
  assert.equal(formatGanzzahl(99999, DE), '99999');
});

test('formatAbweichung: Vorzeichen +, − (typografisch) und ±', () => {
  assert.equal(formatAbweichung(-0.11764705882354, DE), '−0,12');
  assert.equal(formatAbweichung(0.0135, DE), '+0,01');
  assert.equal(formatAbweichung(0, DE), '±0,00');
});

test('formatAbweichung: winzige Werte werden zu ±0,00 (kein „−0,00“)', () => {
  assert.equal(formatAbweichung(-0.0001, DE), '±0,00');
  assert.equal(formatAbweichung(1e-12, DE), '±0,00');
});

test('Ungültige Werte → „–“', () => {
  for (const wert of [undefined, null, NaN, Infinity, '12']) {
    assert.equal(formatZahl(wert, DE), LEER_ANZEIGE);
    assert.equal(formatGanzzahl(wert, DE), LEER_ANZEIGE);
    assert.equal(formatAbweichung(wert, DE), LEER_ANZEIGE);
  }
});

test('Gebietsschema ist Parameter (Vorbereitung Mehrsprachigkeit)', () => {
  assert.equal(formatZahl(94.12, 'en-GB'), '94.12');
  assert.equal(formatAbweichung(-0.12, 'en-GB'), '−0.12');
});
