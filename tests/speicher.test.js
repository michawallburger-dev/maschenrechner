// Tests der Speicherung mit nachgebautem Speicher (ohne Browser).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  laden,
  speichern,
  zuruecksetzen,
  ausgangszustand,
  bereinigeEinstellungen,
  migrieren,
  SPEICHER_SCHLUESSEL,
  SCHEMA_VERSION,
} from '../js/speicher.js';

/** Einfacher Speicher im Arbeitsspeicher mit der Schnittstelle von localStorage. */
function neuerSpeicher(anfang = {}) {
  const daten = new Map(Object.entries(anfang));
  return {
    getItem: (k) => (daten.has(k) ? daten.get(k) : null),
    setItem: (k, v) => daten.set(k, String(v)),
    removeItem: (k) => daten.delete(k),
    roh: daten,
  };
}

/** Speicher, der bei jedem Zugriff eine Ausnahme wirft (z. B. gesperrt / voll). */
const kaputterSpeicher = {
  getItem() {
    throw new Error('gesperrt');
  },
  setItem() {
    throw new Error('voll');
  },
  removeItem() {
    throw new Error('gesperrt');
  },
};

test('Ausgangszustand: Anzahlen leer, Bezug 10, Anpassung 0, Einstellungen de/cm', () => {
  const z = ausgangszustand();
  assert.equal(z.schemaVersion, SCHEMA_VERSION);
  assert.deepEqual(z.einstellungen, { sprache: 'de', laengeneinheit: 'cm' });
  assert.deepEqual(z.probeAnleitung, { maschenAnzahl: '', maschenBezug: '10', reihenAnzahl: '', reihenBezug: '10' });
  assert.equal(z.probeEigen.nadelstaerkeMm, '');
  for (const r of Object.values(z.rechner)) {
    assert.deepEqual(r, { eingabe: '', anpassung: '0' });
  }
});

test('US-07 AK1: Speichern und Laden ergibt denselben Zustand', () => {
  const s = neuerSpeicher();
  const z = ausgangszustand();
  z.probeAnleitung.maschenAnzahl = '34';
  z.probeEigen.maschenAnzahl = '25';
  z.probeEigen.nadelstaerkeMm = '3,5';
  z.rechner.maschenAusAnleitung = { eingabe: '320', anpassung: '-2' };
  assert.equal(speichern(s, z), true);

  const { zustand, speicherbar } = laden(s);
  assert.equal(speicherbar, true);
  assert.deepEqual(zustand, z);
});

test('US-07: auch halbfertige/fehlerhafte Eingaben bleiben als Text erhalten', () => {
  const s = neuerSpeicher();
  const z = ausgangszustand();
  z.rechner.breiteZuMaschen.eingabe = '12,';
  speichern(s, z);
  assert.equal(laden(s).zustand.rechner.breiteZuMaschen.eingabe, '12,');
});

test('Erster Start (nichts gespeichert) → Ausgangszustand, speicherbar', () => {
  const { zustand, speicherbar } = laden(neuerSpeicher());
  assert.equal(speicherbar, true);
  assert.deepEqual(zustand, ausgangszustand());
});

test('Defektes JSON → Ausgangszustand, kein Absturz', () => {
  const { zustand } = laden(neuerSpeicher({ [SPEICHER_SCHLUESSEL]: '{kaputt' }));
  assert.deepEqual(zustand, ausgangszustand());
});

test('Unbekannte Schema-Version → Ausgangszustand', () => {
  const { zustand } = laden(neuerSpeicher({ [SPEICHER_SCHLUESSEL]: JSON.stringify({ schemaVersion: 99 }) }));
  assert.deepEqual(zustand, ausgangszustand());
  assert.equal(migrieren({ schemaVersion: 99 }), null);
  assert.equal(migrieren(null), null);
});

test('Fehlende Felder werden ergänzt, fremde/falsch typisierte ignoriert', () => {
  const gespeichert = {
    schemaVersion: 1,
    probeAnleitung: { maschenAnzahl: '34', boese: '<script>' },
    probeEigen: { maschenAnzahl: 25 },
    rechner: { maschenAusAnleitung: { eingabe: '320' } },
    fremd: { x: 1 },
  };
  const { zustand } = laden(neuerSpeicher({ [SPEICHER_SCHLUESSEL]: JSON.stringify(gespeichert) }));
  assert.equal(zustand.probeAnleitung.maschenAnzahl, '34');
  assert.equal(zustand.probeAnleitung.maschenBezug, '10');
  assert.equal('boese' in zustand.probeAnleitung, false);
  assert.equal(zustand.probeEigen.maschenAnzahl, '', 'Zahl statt Text wird ignoriert');
  assert.deepEqual(zustand.rechner.maschenAusAnleitung, { eingabe: '320', anpassung: '0' });
  assert.equal('fremd' in zustand, false);
});

test('Einstellungen: Sprache und Einheit getrennt, Unbekanntes fällt auf de/cm zurück', () => {
  assert.deepEqual(bereinigeEinstellungen({ sprache: 'xx', laengeneinheit: 'cm' }), { sprache: 'de', laengeneinheit: 'cm' });
  assert.deepEqual(bereinigeEinstellungen({ sprache: 'de', laengeneinheit: 'meile' }), { sprache: 'de', laengeneinheit: 'cm' });
  assert.deepEqual(bereinigeEinstellungen(null), { sprache: 'de', laengeneinheit: 'cm' });
  assert.deepEqual(bereinigeEinstellungen({ sprache: 'toString' }), { sprache: 'de', laengeneinheit: 'cm' });
});

test('US-07 AK2: ohne Speicher (null) läuft alles weiter, speicherbar = false', () => {
  const { zustand, speicherbar } = laden(null);
  assert.equal(speicherbar, false);
  assert.deepEqual(zustand, ausgangszustand());
  assert.equal(speichern(null, zustand), false);
});

test('Gesperrter/voller Speicher: kein Absturz', () => {
  const { speicherbar } = laden(kaputterSpeicher);
  assert.equal(speicherbar, false);
  assert.equal(speichern(kaputterSpeicher, ausgangszustand()), false);
  assert.doesNotThrow(() => zuruecksetzen(kaputterSpeicher, { sprache: 'de', laengeneinheit: 'cm' }));
});

test('US-07 AK3: Zurücksetzen leert Eingaben, behält Einstellungen und speichert', () => {
  const s = neuerSpeicher();
  const z = ausgangszustand();
  z.probeAnleitung.maschenAnzahl = '34';
  speichern(s, z);

  const neu = zuruecksetzen(s, z.einstellungen);
  assert.deepEqual(neu, ausgangszustand(z.einstellungen));
  assert.deepEqual(laden(s).zustand, ausgangszustand());
});

test('Ausgangszustand liefert jedes Mal ein neues Objekt (keine geteilten Referenzen)', () => {
  const a = ausgangszustand();
  const b = ausgangszustand();
  a.rechner.maschenAusAnleitung.eingabe = '1';
  assert.equal(b.rechner.maschenAusAnleitung.eingabe, '');
  assert.notEqual(a.rechner.maschenAusAnleitung, a.rechner.reihenAusAnleitung);
});
