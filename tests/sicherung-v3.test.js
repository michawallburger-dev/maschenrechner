// Tests der Sicherung mit Schema 3 (US-32 AK9, US-14 AK5): Rundreise und Sicherungen aus 0.2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { erzeugeSicherung, leseSicherung } from '../js/sicherung.js';
import { leereDaten, neuesProjekt, neueProbe, neuesStrickstueck, strickstueckAendern, finde } from '../js/modell.js';
import { ZEIT1, ZEIT2 } from './hilfen.js';

function daten() {
  let d = neuesProjekt(leereDaten(), { name: 'Pullover' }, 'p1', ZEIT1).daten;
  d = neueProbe(d, 'p1', 'pr-2', ZEIT1).daten;
  d = neuesStrickstueck(d, 'p1', 'Ärmel', 's1', ZEIT1, 'pr-2').daten;
  d = strickstueckAendern(d, 'p1', 's1', { plan: { anfangBreite: '20', endBreite: '34', laenge: '45', ereignisWahl: 'weniger' }, zielQuelle: 'plan' }, ZEIT2).daten;
  return d;
}

test('Rundreise: Proben, Zuordnung, Plan und Zielquelle bleiben erhalten', () => {
  const d = daten();
  const { inhalt } = erzeugeSicherung(d, new Date(2026, 9, 17), '0.3.0');
  assert.equal(JSON.parse(inhalt).daten.schemaVersion, 3);
  const r = leseSicherung(inhalt);
  assert.equal(r.gueltig, true);
  assert.deepEqual(r.daten, d);
  assert.deepEqual(r.zusammenfassung, { projekte: 1, strickstuecke: 1, proben: 2, erstellt: new Date(2026, 9, 17).toISOString() });
  assert.equal(finde(r.daten, 'p1', 's1').stueck.plan.ereignisWahl, 'weniger');
});

test('Sicherung aus 0.2 (Schema 2) wird eingelesen und übernommen', () => {
  const v2 = {
    app: 'maschenrechner', format: 1, appVersion: '0.2.0', erstellt: ZEIT1,
    daten: {
      schemaVersion: 2,
      projekte: [{
        id: 'p1', name: 'Alt', nadelstaerkeMm: '4',
        probeAnleitung: { maschenAnzahl: '34' }, probeEigen: { maschenAnzahl: '25' },
        strickstuecke: [{ id: 's1', name: 'Teil', zaehler: 7 }],
      }],
    },
  };
  const r = leseSicherung(JSON.stringify(v2));
  assert.equal(r.gueltig, true);
  assert.equal(r.daten.schemaVersion, 3);
  const p = r.daten.projekte[0];
  assert.deepEqual([p.proben[0].name, p.proben[0].nadelstaerkeMm, p.proben[0].eigen.maschenAnzahl], ['Probe 1', '4', '25']);
  assert.deepEqual([p.strickstuecke[0].probeId, p.strickstuecke[0].zaehler, p.strickstuecke[0].plan], ['pr-1', 7, null]);
  assert.deepEqual(r.zusammenfassung, { projekte: 1, strickstuecke: 1, proben: 1, erstellt: ZEIT1 });
});

test('Sicherung mit unbekanntem Schema oder kaputten Daten wird abgelehnt', () => {
  const huelle = (daten) => JSON.stringify({ app: 'maschenrechner', format: 1, daten });
  for (const d of [{ schemaVersion: 4, projekte: [] }, { schemaVersion: 2 }, { schemaVersion: 3, projekte: 'x' }, null]) {
    assert.equal(leseSicherung(huelle(d)).fehler, 'DATEN_UNGUELTIG');
  }
});

// ---------------------------------------------------------------- Neue Felder aus 0.4 (US-39 AK7, US-38 AK3)

test('Rundreise 0.4: Startreihe und Klapp-Zustand bleiben erhalten', () => {
  let d = daten();
  d = strickstueckAendern(d, 'p1', 's1', { plan: { startReihe: '7' }, eingeklappt: { plan: true, breiteZuMaschen: true } }, ZEIT2).daten;
  const { inhalt } = erzeugeSicherung(d, new Date(2026, 9, 23), '0.4.0');
  const r = leseSicherung(inhalt);
  assert.equal(r.gueltig, true);
  assert.deepEqual(r.daten, d);
  const stueck = finde(r.daten, 'p1', 's1').stueck;
  assert.equal(stueck.plan.startReihe, '7');
  assert.deepEqual(stueck.eingeklappt, { plan: true, breiteZuMaschen: true });
});

test('Sicherung aus 0.3 ohne die neuen Felder: Startreihe leer, alle Karten offen', () => {
  // Eine echte 0.3-Sicherung kennt startReihe und eingeklappt nicht
  const d = daten();
  const { inhalt } = erzeugeSicherung(d, new Date(2026, 9, 17), '0.3.0');
  const roh = JSON.parse(inhalt);
  for (const s of roh.daten.projekte[0].strickstuecke) {
    delete s.eingeklappt;
    delete s.plan.startReihe;
  }
  const r = leseSicherung(JSON.stringify(roh));
  assert.equal(r.gueltig, true);
  const stueck = finde(r.daten, 'p1', 's1').stueck;
  assert.equal(stueck.plan.startReihe, '', 'fehlendes Feld wird zum leeren Text – also „automatisch“');
  assert.deepEqual(stueck.eingeklappt, {});
  // Der Plan rechnet damit genauso wie vorher
  assert.deepEqual(r.daten, d);
});
