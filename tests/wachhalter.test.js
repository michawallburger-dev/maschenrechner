// Tests des Wachhalters (US-11 AK5, QA S2-02) mit nachgebautem navigator.wakeLock und document.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { erzeugeWachhalter } from '../js/geraet.js';

let aktiv; // Anzahl nicht freigegebener Sperren
let verzoegerung;
let ablehnen;
let horcher;

function sperre() {
  aktiv++;
  let frei = false;
  return {
    release() {
      if (!frei) {
        frei = true;
        aktiv--;
      }
      return Promise.resolve();
    },
    addEventListener() {},
  };
}

beforeEach(() => {
  aktiv = 0;
  verzoegerung = 0;
  ablehnen = false;
  horcher = new Set();
  globalThis.document = {
    visibilityState: 'visible',
    addEventListener: (_, f) => horcher.add(f),
    removeEventListener: (_, f) => horcher.delete(f),
  };
  Object.defineProperty(globalThis.navigator, 'wakeLock', {
    configurable: true,
    value: {
      request: () =>
        new Promise((ok, fehler) =>
          setTimeout(() => (ablehnen ? fehler(new Error('NotAllowedError')) : ok(sperre())), verzoegerung),
        ),
    },
  });
});

const warte = (ms) => new Promise((r) => setTimeout(r, ms));

test('Starten und Beenden gibt die Sperre frei', async () => {
  const w = erzeugeWachhalter();
  assert.equal(await w.starten(), 'aktiv');
  assert.equal(aktiv, 1);
  w.beenden();
  assert.equal(aktiv, 0);
  assert.equal(horcher.size, 0, 'kein Ereignis-Horcher bleibt zurück');
});

test('S2-02: Beenden vor der Antwort – späte Sperre wird sofort freigegeben', async () => {
  verzoegerung = 30;
  const w = erzeugeWachhalter();
  const ergebnis = w.starten();
  w.beenden();
  assert.equal(await ergebnis, 'beendet');
  await warte(5);
  assert.equal(aktiv, 0);
});

test('Doppelte Anforderung erzeugt nur eine Sperre', async () => {
  verzoegerung = 10;
  const w = erzeugeWachhalter();
  const a = w.starten();
  const b = w.starten();
  assert.deepEqual(await Promise.all([a, b]), ['aktiv', 'aktiv']);
  assert.equal(aktiv, 1);
  w.beenden();
  assert.equal(aktiv, 0);
});

test('Abgelehnt (z. B. Stromsparmodus) → „abgelehnt“', async () => {
  ablehnen = true;
  assert.equal(await erzeugeWachhalter().starten(), 'abgelehnt');
});

test('Ohne Wake Lock → „nicht-verfuegbar“', async () => {
  delete globalThis.navigator.wakeLock;
  assert.equal(await erzeugeWachhalter().starten(), 'nicht-verfuegbar');
});
