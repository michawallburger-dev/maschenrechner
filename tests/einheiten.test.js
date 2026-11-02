// Tests der Längeneinheiten (Vorbereitung: Einheit unabhängig von der Sprache).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  zuCm,
  vonCm,
  standardBezug,
  istBekannteEinheit,
  LAENGENEINHEITEN,
  STANDARD_LAENGENEINHEIT,
  umrechneWert,
} from '../js/einheiten.js';

test('cm ist Standard und wird 1:1 umgerechnet', () => {
  assert.equal(STANDARD_LAENGENEINHEIT, 'cm');
  assert.equal(zuCm(94.12, 'cm'), 94.12);
  assert.equal(vonCm(94.12, 'cm'), 94.12);
});

test('Standard-Bezugsmaß in cm ist 10', () => {
  assert.equal(standardBezug('cm'), 10);
});

test('istBekannteEinheit', () => {
  assert.equal(istBekannteEinheit('cm'), true);
  assert.equal(istBekannteEinheit('in'), true, 'Zoll seit Sprint 5 (US-24)');
  assert.equal(istBekannteEinheit('toString'), false, 'Prototyp-Eigenschaften zählen nicht');
});

test('Unbekannte Einheit ist ein Programmierfehler', () => {
  assert.throws(() => zuCm(1, 'ft'), TypeError);
  assert.throws(() => vonCm(1, 'mm'), TypeError);
  assert.throws(() => standardBezug('xx'), TypeError);
});

test('Einheitentabelle ist unveränderlich', () => {
  assert.ok(Object.isFrozen(LAENGENEINHEITEN));
  assert.ok(Object.isFrozen(LAENGENEINHEITEN.cm));
  assert.ok(Object.isFrozen(LAENGENEINHEITEN.in));
});

// ---------------------------------------------------------------- Sprint 5: Zoll (US-24)

test('US-24 AK3: Zoll rechnet mit 2,54 und hat das Bezugsmass 4', () => {
  assert.equal(zuCm(4, 'in'), 10.16);
  assert.equal(vonCm(2.54, 'in'), 1);
  assert.equal(standardBezug('in'), 4, 'US-Standard: Maschenprobe auf 4 Zoll (E33)');
  assert.equal(standardBezug('cm'), 10, 'cm bleibt bei 10');
});

test('Eigenschaft: vonCm(zuCm(x)) ergibt wieder x, fuer beide Einheiten', () => {
  for (const einheit of ['cm', 'in']) {
    for (const x of [0, 0.5, 1, 4, 10, 22.5, 45, 100, 999.75]) {
      // Gleitkomma: kleine Toleranz, vgl. Risiko R2
      assert.ok(Math.abs(vonCm(zuCm(x, einheit), einheit) - x) < 1e-12, einheit + ' ' + x);
    }
  }
});

test('umrechneWert: leere und ungueltige Eingaben bleiben unveraendert', () => {
  for (const roh of ['', '   ', 'abc', '12,', '-', '+']) {
    assert.equal(umrechneWert(roh, 'cm', 'in'), roh, 'unveraendert: ' + JSON.stringify(roh));
  }
});

test('umrechneWert: rechnet um, ohne Komma, gleiche Einheit bleibt unberuehrt', () => {
  assert.equal(umrechneWert('10', 'cm', 'in'), '3.937', 'Zoll mit drei Stellen (H5)');
  assert.equal(umrechneWert('4', 'in', 'cm'), '10.16');
  assert.equal(umrechneWert('10,16', 'cm', 'in'), '4', 'Komma in der Eingabe wird gelesen');
  assert.equal(umrechneWert('10', 'cm', 'cm'), '10', 'gleiche Einheit: Text bleibt');
  // Gespeicherte Werte duerfen nicht von der Sprache abhaengen (Architektur 4.2, Regel 3)
  for (const roh of ['10', '22,5', '0,5', '100']) {
    assert.ok(!umrechneWert(roh, 'cm', 'in').includes(','), 'kein Komma: ' + roh);
  }
});

test('umrechneWert: Nachkommanullen fallen weg, Ganzzahlen bleiben ganz', () => {
  assert.equal(umrechneWert('10.16', 'cm', 'in'), '4', 'nicht 4.00');
  assert.equal(umrechneWert('254', 'cm', 'in'), '100', 'nicht 1 - Nullen nur hinter dem Punkt');
});

test('Hin und zurueck ist exakt - dafuer sind die drei Stellen da (H5)', () => {
  for (const roh of ['10', '20', '45', '34', '22.5']) {
    const hin = umrechneWert(roh, 'cm', 'in');
    assert.equal(umrechneWert(hin, 'in', 'cm'), roh, 'hin und zurueck: ' + roh);
  }
});

test('Drei Stellen halten den Referenzfall aus Sprint 3 bei 167 Reihen (H5)', () => {
  // Probe 37 R auf 10 cm, Laenge 45 cm ergibt 166,5 -> 167. Mit nur zwei
  // Nachkommastellen fuer Zoll waeren es nach dem Wechsel 166.
  const bezug = Number(umrechneWert('10', 'cm', 'in'));
  const laenge = Number(umrechneWert('45', 'cm', 'in'));
  const reihen = Math.round(zuCm(laenge, 'in') * (37 / zuCm(bezug, 'in')));
  assert.equal(reihen, 167);
});
