// Tests der Ausgabeformatierung (deutsches Zahlenformat, Vorzeichen der Abweichung).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatZahl,
  formatGanzzahl,
  formatAbweichung,
  formatBruch,
  formatLaenge,
  formatLaengeAbweichung,
  LEER_ANZEIGE,
} from '../js/format.js';
import { vonCm } from '../js/einheiten.js';

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

// ---------------------------------------------------------------- Sprint 5: Bruchdarstellung (US-41)

test('US-41 AK4/AK5: formatBruch rundet auf Achtel und kuerzt', () => {
  assert.equal(formatBruch(4.5, DE), '4½');
  assert.equal(formatBruch(4.25, DE), '4¼');
  assert.equal(formatBruch(4.375, DE), '4⅜');
  assert.equal(formatBruch(4.75, DE), '4¾');
  assert.equal(formatBruch(4.875, DE), '4⅞');
  assert.equal(formatBruch(4, DE), '4', 'ganze Zahl ohne Bruchteil');
  assert.equal(formatBruch(0.5, DE), '½', 'unter eins nur der Bruch');
  assert.equal(formatBruch(0.125, DE), '⅛');
  assert.equal(formatBruch(0, DE), '0');
  assert.equal(formatBruch(0.06, DE), '0', 'rundet auf Achtel ab');
  assert.equal(formatBruch(Number.NaN, DE), LEER_ANZEIGE);
  assert.equal(formatBruch('4', DE), LEER_ANZEIGE, 'kein Text');
});

test('Eigenschaft: der Bruch weicht hoechstens 1/16 ab und ist monoton', () => {
  const ZEICHEN = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];
  const zurueck = (s) => {
    const i = ZEICHEN.findIndex((z) => z !== '' && s.endsWith(z));
    const ganz = i > 0 ? s.slice(0, -1) : s;
    return (ganz === '' ? 0 : Number(ganz)) + (i > 0 ? i / 8 : 0);
  };
  let vorher = -1;
  for (let n = 0; n <= 800; n++) {
    const x = n / 100;
    const gezeigt = zurueck(formatBruch(x, 'en-US'));
    assert.ok(Math.abs(gezeigt - x) <= 1 / 16 + 1e-9, 'Abweichung bei ' + x);
    assert.ok(gezeigt >= vorher, 'nicht monoton bei ' + x);
    vorher = gezeigt;
  }
});

test('formatLaenge dezimal ist bitgleich zur alten Formatierung (Risiko R19)', () => {
  for (const cm of [0, 1, 10, 22.5, 45.333, 94.11764705882354, 167]) {
    for (const einheit of ['cm', 'in']) {
      assert.equal(formatLaenge(cm, einheit, DE, 'dezimal'), formatZahl(vonCm(cm, einheit), DE), cm + ' ' + einheit);
    }
  }
  assert.equal(formatLaenge(null, 'cm', DE, 'dezimal'), LEER_ANZEIGE);
});

test('formatLaenge: Zoll als Bruch, cm dezimal', () => {
  assert.equal(formatLaenge(10.16, 'in', DE, 'bruch'), '4');
  assert.equal(formatLaenge(11.43, 'in', DE, 'bruch'), '4½');
  assert.equal(formatLaenge(10, 'cm', DE, 'dezimal'), '10,00');
  assert.equal(formatLaenge(10, 'cm', DE, 'bruch'), '10', '10 cm sind als Bruch glatt');
});

test('formatLaengeAbweichung: Vorzeichen, und was auf 0 rundet, wird plusminus 0', () => {
  assert.equal(formatLaengeAbweichung(1.27, 'in', DE, 'bruch'), '+½');
  assert.equal(formatLaengeAbweichung(-1.27, 'in', DE, 'bruch'), '−½');
  // 1 mm liegt unter einem halben Achtel Zoll (Hinweis H7)
  assert.equal(formatLaengeAbweichung(0.1, 'in', DE, 'bruch'), '±0');
  assert.equal(formatLaengeAbweichung(-0.1, 'in', DE, 'bruch'), '±0');
  // dezimal bleibt so genau wie bisher
  assert.equal(formatLaengeAbweichung(0.1, 'cm', DE, 'dezimal'), '+0,10');
  assert.equal(formatLaengeAbweichung(0, 'cm', DE, 'dezimal'), '±0,00');
});
