// Tests der Texte: Platzhalter, Rückfall auf Deutsch, Vollständigkeit für index.html.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { text, localeFuer, istBekannteSprache, SPRACHEN, STANDARD_SPRACHE } from '../js/texte.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('text: Platzhalter {einheit} und {grenze} werden ersetzt', () => {
  assert.equal(text('de', 'rechner.maschenAusAnleitung.massAnleitung', { einheit: 'cm' }), 'Breite laut Anleitung (cm)');
  assert.equal(text('de', 'fehler.ZU_GROSS', { grenze: 999 }), 'Der Wert darf höchstens 999 sein.');
});

test('text: fehlender Platzhalterwert bleibt sichtbar stehen', () => {
  assert.equal(text('de', 'proben.dichteMaschen'), 'Maschen pro {einheit}');
});

test('text: unbekannte Sprache fällt auf Deutsch zurück', () => {
  assert.equal(text('xx', 'app.titel'), 'Maschenrechner');
  assert.equal(localeFuer('xx'), 'de-DE');
  assert.equal(istBekannteSprache('xx'), false);
});

test('text: unbekannter Schlüssel liefert den Schlüssel selbst', () => {
  assert.equal(text('de', 'gibt.es.nicht'), 'gibt.es.nicht');
});

test('localeFuer: Deutsch → de-DE', () => {
  assert.equal(localeFuer('de'), 'de-DE');
  assert.equal(STANDARD_SPRACHE, 'de');
});

test('Jeder data-text-Schlüssel in index.html hat einen deutschen Text', () => {
  const schluessel = [...html.matchAll(/data-text(?:-aria-label)?="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(schluessel.length > 40, 'index.html sollte viele Textschlüssel enthalten');
  const fehlend = schluessel.filter((s) => !(s in SPRACHEN.de.texte));
  assert.deepEqual(fehlend, []);
});

test('Fehlertexte existieren für alle Fehlercodes aus eingabe.js', () => {
  for (const code of ['LEER', 'KEINE_ZAHL', 'KEINE_GANZZAHL', 'NICHT_POSITIV', 'ZU_GROSS', 'ZU_KLEIN']) {
    assert.ok(`fehler.${code}` in SPRACHEN.de.texte, `fehler.${code} fehlt`);
  }
});

test('Unabhängigkeit von der Einheit: Kein Text enthält „cm“ fest (außer dem Kürzel selbst)', () => {
  const mitCm = Object.entries(SPRACHEN.de.texte).filter(([k, v]) => k !== 'einheit.cm' && /\bcm\b/.test(v));
  assert.deepEqual(mitCm, []);
});

test('Für jeden Rechner gibt es alle Beschriftungen', () => {
  const felder = {
    maschenAusAnleitung: ['titel', 'eingabe', 'massAnleitung', 'eigenGerundet', 'endgueltig', 'tatsaechlich', 'abweichung'],
    reihenAusAnleitung: ['titel', 'eingabe', 'massAnleitung', 'eigenGerundet', 'endgueltig', 'tatsaechlich', 'abweichung'],
    breiteZuMaschen: ['titel', 'eingabe', 'anleitungGerundet', 'eigenGerundet', 'endgueltig', 'tatsaechlich', 'abweichung'],
    laengeZuReihen: ['titel', 'eingabe', 'anleitungGerundet', 'eigenGerundet', 'endgueltig', 'tatsaechlich', 'abweichung'],
  };
  for (const [karte, liste] of Object.entries(felder)) {
    for (const f of liste) {
      assert.ok(`rechner.${karte}.${f}` in SPRACHEN.de.texte, `rechner.${karte}.${f} fehlt`);
    }
  }
});
