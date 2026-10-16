// Tests der Rechenlogik – Referenzwerte aus Maschenrechner.xlsx und Randfälle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  runden,
  dichteProCm,
  cmZuAnzahl,
  anzahlZuCm,
  umrechnenAusAnleitung,
  umrechnenAusCm,
} from '../js/rechner.js';

// Referenz-Proben aus der Excel
const ANLEITUNG_M = { anzahl: 34, bezugCm: 10 };
const ANLEITUNG_R = { anzahl: 52, bezugCm: 10 };
const EIGEN_M = { anzahl: 25, bezugCm: 10 };
const EIGEN_R = { anzahl: 37, bezugCm: 10 };

/** Vergleich mit Toleranz für Gleitkommazahlen */
function ungefaehr(ist, soll, toleranz = 1e-9) {
  assert.ok(Math.abs(ist - soll) <= toleranz, `erwartet ≈ ${soll}, erhalten ${ist}`);
}

test('runden: kaufmännisch, x,5 wird aufgerundet', () => {
  assert.equal(runden(25.5), 26);
  assert.equal(runden(25.49), 25);
  assert.equal(runden(0.5), 1);
  assert.equal(runden(0), 0);
});

test('runden: Pflicht-Testfall Gleitkommarest (10,2 × 25 / 10 = 25,5 → 26)', () => {
  const roh = (10.2 * 25) / 10;
  assert.notEqual(roh, 25.5, 'Voraussetzung: JavaScript liefert hier einen Gleitkommarest');
  assert.equal(runden(roh), 26);
});

test('dichteProCm: 34/10 → 3,4 und 52/10 → 5,2 (US-01 AK3)', () => {
  ungefaehr(dichteProCm(ANLEITUNG_M), 3.4);
  ungefaehr(dichteProCm(ANLEITUNG_R), 5.2);
});

test('cmZuAnzahl / anzahlZuCm sind zueinander invers', () => {
  ungefaehr(anzahlZuCm(cmZuAnzahl(37.3, EIGEN_M), EIGEN_M), 37.3);
});

test('US-02 AK6: flexible Bezugsmaße – 20 M auf 8 cm, 40 cm → 100 M', () => {
  const r = umrechnenAusCm(40, { anzahl: 20, bezugCm: 8 }, { anzahl: 20, bezugCm: 8 }, 0);
  assert.equal(r.eigenGerundet, 100);
  assert.equal(r.anleitungGerundet, 100);
});

test('US-03: 320 M Anleitung → 94,12 cm → 235 M → 94,00 cm, Abweichung −0,12 cm', () => {
  const r = umrechnenAusAnleitung(320, ANLEITUNG_M, EIGEN_M, 0);
  assert.equal(r.gueltig, true);
  ungefaehr(r.cmLautAnleitung, 94.11764705882354, 1e-9);
  assert.equal(Number(r.cmLautAnleitung.toFixed(2)), 94.12);
  assert.equal(r.eigenGerundet, 235);
  assert.equal(r.endgueltig, 235);
  ungefaehr(r.cmTatsaechlich, 94);
  assert.equal(Number(r.abweichungCm.toFixed(2)), -0.12);
});

test('US-03 AK4: Anpassung +1 und −2 wird auf die eigene Zahl angewendet', () => {
  assert.equal(umrechnenAusAnleitung(320, ANLEITUNG_M, EIGEN_M, 1).endgueltig, 236);
  const r = umrechnenAusAnleitung(320, ANLEITUNG_M, EIGEN_M, -2);
  assert.equal(r.endgueltig, 233);
  ungefaehr(r.cmTatsaechlich, 93.2);
});

test('US-03 AK6: Anpassung führt zu Ergebnis < 1 → ungültig mit Hinweis-Code', () => {
  const r = umrechnenAusAnleitung(320, ANLEITUNG_M, EIGEN_M, -235);
  assert.equal(r.gueltig, false);
  assert.equal(r.fehler, 'ERGEBNIS_ZU_KLEIN');
  assert.equal(r.endgueltig, 0);
  // Zwischenwerte bleiben erhalten
  assert.equal(r.eigenGerundet, 235);
  ungefaehr(r.cmLautAnleitung, 94.11764705882354, 1e-9);
});

test('US-03 AK6: Grenzfall – Ergebnis genau 1 ist gültig', () => {
  const r = umrechnenAusAnleitung(320, ANLEITUNG_M, EIGEN_M, -234);
  assert.equal(r.gueltig, true);
  assert.equal(r.endgueltig, 1);
});

test('US-04: 55 R Anleitung → 10,58 cm → 39 R → 10,54 cm, Abweichung −0,04 cm', () => {
  const r = umrechnenAusAnleitung(55, ANLEITUNG_R, EIGEN_R, 0);
  assert.equal(Number(r.cmLautAnleitung.toFixed(2)), 10.58);
  assert.equal(r.eigenGerundet, 39);
  assert.equal(Number(r.cmTatsaechlich.toFixed(2)), 10.54);
  assert.equal(Number(r.abweichungCm.toFixed(2)), -0.04);
});

test('US-05: 94 cm → 320 M (Anleitung) / 235 M (eigene), Abweichung 0', () => {
  const r = umrechnenAusCm(94, ANLEITUNG_M, EIGEN_M, 0);
  assert.equal(r.anleitungGerundet, 320);
  assert.equal(r.eigenGerundet, 235);
  ungefaehr(r.cmTatsaechlich, 94);
  ungefaehr(r.abweichungCm, 0);
});

test('US-05 AK4: Rundungsprüfung 10,2 cm bei 25 M/10 cm → 26 M', () => {
  const r = umrechnenAusCm(10.2, ANLEITUNG_M, EIGEN_M, 0);
  assert.equal(r.eigenGerundet, 26);
});

test('US-06: 13,5 cm → 70 R (Anleitung) / 50 R (eigene) → 13,51 cm', () => {
  const r = umrechnenAusCm(13.5, ANLEITUNG_R, EIGEN_R, 0);
  assert.equal(r.anleitungGerundet, 70);
  assert.equal(r.eigenGerundet, 50);
  assert.equal(Number(r.cmTatsaechlich.toFixed(2)), 13.51);
  assert.equal(Number(r.abweichungCm.toFixed(2)), 0.01);
});

test('Randfall: sehr kleine Eingabe ergibt 0 → ungültig (ERGEBNIS_ZU_KLEIN)', () => {
  // 0,1 cm bei 25 M/10 cm = 0,25 M → 0
  const r = umrechnenAusCm(0.1, ANLEITUNG_M, EIGEN_M, 0);
  assert.equal(r.eigenGerundet, 0);
  assert.equal(r.gueltig, false);
  // … aber mit Anpassung +1 gültig
  assert.equal(umrechnenAusCm(0.1, ANLEITUNG_M, EIGEN_M, 1).endgueltig, 1);
});

test('Randfall: sehr große Werte an den Eingabegrenzen bleiben endlich und plausibel', () => {
  const r = umrechnenAusAnleitung(99999, { anzahl: 0.1, bezugCm: 100 }, { anzahl: 999, bezugCm: 0.1 }, 9999);
  assert.equal(r.gueltig, true);
  assert.ok(Number.isFinite(r.cmLautAnleitung));
  assert.ok(Number.isFinite(r.endgueltig));
  assert.ok(Number.isSafeInteger(r.endgueltig));
});

test('Randfall: Dezimalwerte in der Probe (22,5 M auf 10 cm)', () => {
  const r = umrechnenAusCm(40, { anzahl: 22.5, bezugCm: 10 }, { anzahl: 22.5, bezugCm: 10 }, 0);
  assert.equal(r.eigenGerundet, 90);
});

test('Reine Funktionen: Eingabeobjekte werden nicht verändert', () => {
  const pa = { ...ANLEITUNG_M };
  const pe = { ...EIGEN_M };
  umrechnenAusAnleitung(320, pa, pe, 3);
  umrechnenAusCm(94, pa, pe, 3);
  assert.deepEqual(pa, ANLEITUNG_M);
  assert.deepEqual(pe, EIGEN_M);
});
