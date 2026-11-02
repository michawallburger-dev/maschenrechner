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
  // Ausgenommen sind die Kuerzel selbst und die Beschriftungen der Einheitenauswahl.
  const erlaubt = (k) => k.startsWith('einheit.') || k === 'einst.cm' || k === 'einst.zoll';
  for (const [sprache, eintrag] of Object.entries(SPRACHEN)) {
    const mitCm = Object.entries(eintrag.texte).filter(([k, v]) => !erlaubt(k) && /cm/.test(v));
    assert.deepEqual(mitCm, [], `${sprache}: Einheit fest im Text`);
  }
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

// ---------------------------------------------------------------- Sprint 5: Englisch (US-23)

test('US-23 AK3: de und en haben genau dieselben Schluessel', () => {
  const de = Object.keys(SPRACHEN.de.texte);
  const en = Object.keys(SPRACHEN.en.texte);
  assert.deepEqual(de.filter((k) => !en.includes(k)), [], 'fehlt auf Englisch');
  assert.deepEqual(en.filter((k) => !de.includes(k)), [], 'auf Englisch zuviel');
});

test('US-23: dieselben Platzhalter in beiden Sprachen', () => {
  const muster = (s) => [...new Set(s.match(/\{[a-zA-Z]+\}/g) ?? [])].sort();
  for (const [schluessel, deutsch] of Object.entries(SPRACHEN.de.texte)) {
    assert.deepEqual(muster(SPRACHEN.en.texte[schluessel]), muster(deutsch), schluessel);
  }
});

test('US-23: en-US als Locale, Rueckfall auf Deutsch bleibt', () => {
  assert.equal(localeFuer('en'), 'en-US');
  assert.equal(istBekannteSprache('en'), true);
  assert.equal(text('en', 'gibt.es.nicht'), 'gibt.es.nicht');
  assert.equal(localeFuer('xx'), SPRACHEN[STANDARD_SPRACHE].locale);
});

test('US-23: die Zielquelle im Zaehler heisst wie der Kartentitel, in jeder Sprache', () => {
  for (const sprache of Object.keys(SPRACHEN)) {
    assert.equal(
      SPRACHEN[sprache].texte['zaehler.quelle.laengeZuReihen'],
      SPRACHEN[sprache].texte['rechner.laengeZuReihen.titel'],
      sprache + ': Befund S4-05 gilt auch hier',
    );
  }
});

test('US-23: englische Texte sind uebersetzt, nicht kopiert', () => {
  const gleich = Object.keys(SPRACHEN.de.texte).filter(
    (k) => SPRACHEN.de.texte[k] === SPRACHEN.en.texte[k] && SPRACHEN.de.texte[k].length > 12,
  );
  // Gleich bleiben darf nur, was keine Sprache hat: Vorlagen aus Platzhaltern
  // app.titel ist ein Eigenname, titel.seite und stueck.kurzfassung bestehen nur aus
  // Platzhaltern, und „Version“ heisst auf Englisch genauso.
  assert.deepEqual(gleich, ['app.titel', 'titel.seite', 'stueck.kurzfassung', 'einst.version']);
});
