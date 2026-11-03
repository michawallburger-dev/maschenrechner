// Tests der Einheitenumstellung (US-24, E34) und der Darstellungswahl (US-41, E32).
// Vorgaben: Architektur Sprint 5, Abschnitte 3.1 und 4.2.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  leereDaten,
  neuesProjekt,
  neuesStrickstueck,
  probeAendern,
  strickstueckAendern,
  einheitUmstellen,
  darstellungFuer,
  einstellungAendern,
  finde,
} from '../js/modell.js';
import { ZEIT1, ZEIT2 } from './hilfen.js';

/**
 * Daten mit allem, was Längen enthält: eine ausgefüllte Probe, zwei
 * Rechnereingaben und ein Plan. Dazu Stückzahlen, die unberührt bleiben müssen.
 */
function volleDaten() {
  let daten = neuesProjekt(leereDaten(), { name: 'Pullover' }, 'p1', ZEIT1).daten;
  daten = neuesStrickstueck(daten, 'p1', 'Vorderteil', 's1', ZEIT2).daten;

  daten = probeAendern(daten, 'p1', 'pr-1', {
    nadelstaerkeMm: '4',
    eigen: { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' },
    anleitung: { maschenAnzahl: '22', maschenBezug: '10', reihenAnzahl: '30', reihenBezug: '10' },
  }, ZEIT2).daten;

  daten = strickstueckAendern(daten, 'p1', 's1', {
    rechner: {
      maschenAusAnleitung: { eingabe: '84', anpassung: '0' },
      reihenAusAnleitung: { eingabe: '120', anpassung: '0' },
      breiteZuMaschen: { eingabe: '20', anpassung: '0' },
      laengeZuReihen: { eingabe: '45', anpassung: '0' },
    },
    zaehler: 17,
    plan: {
      anfangBreite: '20',
      endBreite: '34',
      laenge: '45',
      maschenProEreignis: '2',
      startReihe: '4',
      arbeitsweise: 'reihen',
      jedeZweite: false,
      ereignisWahl: null,
      anpassung: { anfang: '1', ende: '-2', reihen: '0' },
    },
  }, ZEIT2).daten;

  return daten;
}

const probeVon = (daten) => finde(daten, 'p1').projekt.proben[0];
const stueckVon = (daten) => finde(daten, 'p1', 's1').stueck;

test('US-24 AK4/AK5: genau die Längen werden umgerechnet', () => {
  const neu = einheitUmstellen(volleDaten(), 'in');

  assert.equal(neu.einstellungen.laengeneinheit, 'in');

  const probe = probeVon(neu);
  assert.equal(probe.eigen.maschenBezug, '3.937', '10 cm sind 3,937 Zoll (drei Stellen, H5)');
  assert.equal(probe.eigen.reihenBezug, '3.937');
  assert.equal(probe.anleitung.maschenBezug, '3.937');

  const stueck = stueckVon(neu);
  assert.equal(stueck.rechner.breiteZuMaschen.eingabe, '7.874', '20 cm');
  assert.equal(stueck.rechner.laengeZuReihen.eingabe, '17.717', '45 cm');
  assert.equal(stueck.plan.anfangBreite, '7.874');
  assert.equal(stueck.plan.endBreite, '13.386', '34 cm');
  assert.equal(stueck.plan.laenge, '17.717');
});

test('US-24: Stückzahlen, Nadelstärke und Reihennummern bleiben unberührt', () => {
  const neu = einheitUmstellen(volleDaten(), 'in');

  const probe = probeVon(neu);
  assert.equal(probe.eigen.maschenAnzahl, '25');
  assert.equal(probe.eigen.reihenAnzahl, '37');
  assert.equal(probe.nadelstaerkeMm, '4', 'Nadelstärke bleibt in mm (E35)');

  const stueck = stueckVon(neu);
  assert.equal(stueck.rechner.maschenAusAnleitung.eingabe, '84');
  assert.equal(stueck.rechner.reihenAusAnleitung.eingabe, '120');
  assert.equal(stueck.zaehler, 17);
  assert.equal(stueck.plan.maschenProEreignis, '2');
  assert.equal(stueck.plan.startReihe, '4');
  assert.deepEqual(stueck.plan.anpassung, { anfang: '1', ende: '-2', reihen: '0' });
});

test('US-24 AK3: eine leere Probe bekommt das Standardmaß, keinen umgerechneten Wert', () => {
  // Frisches Projekt: Probe ist leer, Bezug steht auf 10 (cm)
  const daten = neuesProjekt(leereDaten(), { name: 'Neu' }, 'p1', ZEIT1).daten;
  assert.equal(daten.projekte[0].proben[0].eigen.maschenBezug, '10');

  const neu = einheitUmstellen(daten, 'in');
  const probe = neu.projekte[0].proben[0];
  assert.equal(probe.eigen.maschenBezug, '4', 'nicht 3.94 – eine leere Probe zeigt das übliche Maß');
  assert.equal(probe.eigen.reihenBezug, '4');
  assert.equal(probe.anleitung.maschenBezug, '4');
});

test('US-24: einheitUmstellen ist seiteneffektfrei und lässt Unbekanntes liegen', () => {
  const vorher = volleDaten();
  const kopie = structuredClone(vorher);
  einheitUmstellen(vorher, 'in');
  assert.deepEqual(vorher, kopie, 'die übergebenen Daten bleiben unverändert');

  assert.equal(einheitUmstellen(vorher, 'cm'), vorher, 'gleiche Einheit: dasselbe Objekt');
  assert.equal(einheitUmstellen(vorher, 'yard'), vorher, 'unbekannte Einheit: nichts passiert');
});

test('US-24: ungültige und halb getippte Eingaben bleiben beim Umstellen stehen', () => {
  let daten = volleDaten();
  daten = strickstueckAendern(daten, 'p1', 's1', {
    rechner: { ...stueckVon(daten).rechner, breiteZuMaschen: { eingabe: '12,', anpassung: '0' } },
  }, ZEIT2).daten;

  const neu = einheitUmstellen(daten, 'in');
  assert.equal(stueckVon(neu).rechner.breiteZuMaschen.eingabe, '12,');
});

test('US-24: mehrere Projekte, Proben und Strickstücke werden alle erfasst', () => {
  let daten = volleDaten();
  daten = neuesProjekt(daten, { name: 'Zweites' }, 'p2', ZEIT1).daten;
  daten = neuesStrickstueck(daten, 'p2', 'Ärmel', 's2', ZEIT2).daten;
  daten = probeAendern(daten, 'p2', 'pr-1', {
    eigen: { maschenAnzahl: '20', maschenBezug: '10', reihenAnzahl: '28', reihenBezug: '10' },
  }, ZEIT2).daten;

  const neu = einheitUmstellen(daten, 'in');
  assert.equal(neu.projekte.length, 2);
  assert.equal(neu.projekte[1].proben[0].eigen.maschenBezug, '3.937');
  // Das zweite Strickstück hat keinen Plan – das darf nicht stören
  assert.equal(neu.projekte[1].strickstuecke[0].plan, null);
});

test('US-24: geaendert bleibt stehen, damit die Projektliste nicht umsortiert', () => {
  const vorher = volleDaten();
  const neu = einheitUmstellen(vorher, 'in');
  assert.equal(neu.projekte[0].geaendert, vorher.projekte[0].geaendert);
});

// ---------------------------------------------------------------- Darstellung (US-41)

test('US-41 AK3: auto folgt der Einheit, eine eigene Wahl überlebt den Wechsel', () => {
  assert.equal(darstellungFuer({ laengeneinheit: 'cm', laengenDarstellung: 'auto' }), 'dezimal');
  assert.equal(darstellungFuer({ laengeneinheit: 'in', laengenDarstellung: 'auto' }), 'bruch');
  // Fehlendes Feld bedeutet auto (Sicherungen aus 0.4.0)
  assert.equal(darstellungFuer({ laengeneinheit: 'in' }), 'bruch');
  assert.equal(darstellungFuer({}), 'dezimal');

  // Eigene Wahl schlägt die Einheit
  assert.equal(darstellungFuer({ laengeneinheit: 'in', laengenDarstellung: 'dezimal' }), 'dezimal');
  assert.equal(darstellungFuer({ laengeneinheit: 'cm', laengenDarstellung: 'bruch' }), 'bruch');

  // und sie bleibt, wenn später die Einheit wechselt
  let daten = einstellungAendern(leereDaten(), { laengenDarstellung: 'dezimal' });
  daten = einheitUmstellen(daten, 'in');
  assert.equal(daten.einstellungen.laengenDarstellung, 'dezimal');
  assert.equal(darstellungFuer(daten.einstellungen), 'dezimal', 'Zoll, aber dezimal gewählt');
});

test('US-41 AK11: unbekannte Darstellung fällt auf auto zurück', () => {
  const daten = einstellungAendern(leereDaten(), { laengenDarstellung: 'roemisch' });
  assert.equal(daten.einstellungen.laengenDarstellung, 'auto');
});
