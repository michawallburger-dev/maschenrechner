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
  assert.equal(istBekannteEinheit('in'), false, 'Zoll ist in Sprint 1 bewusst nicht enthalten');
  assert.equal(istBekannteEinheit('toString'), false, 'Prototyp-Eigenschaften zählen nicht');
});

test('Unbekannte Einheit ist ein Programmierfehler', () => {
  assert.throws(() => zuCm(1, 'in'), TypeError);
  assert.throws(() => vonCm(1, 'mm'), TypeError);
  assert.throws(() => standardBezug('xx'), TypeError);
});

test('Einheitentabelle ist unveränderlich', () => {
  assert.ok(Object.isFrozen(LAENGENEINHEITEN));
  assert.ok(Object.isFrozen(LAENGENEINHEITEN.cm));
});
