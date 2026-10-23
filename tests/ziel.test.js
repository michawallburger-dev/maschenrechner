// Tests für Ziel und Zu-/Abnahmen im Zähler (US-15, US-30) – Architektur Sprint 3, Abschnitt 5.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { zielQuellen, waehleZiel, gestrickteLaengeCm, zielErreicht, ereignisseUm, zaehlerDaten } from '../js/ziel.js';

// ---------------------------------------------------------------- Ereignisse um die aktuelle Reihe

const REF = [{ reihe: 16, maschen: -1 }, { reihe: 22, maschen: -2 }, { reihe: 25, maschen: -3 }];

test('Referenz: Reihe 20 → letzte 16, nächste 22, übernächste 25', () => {
  const r = ereignisseUm(REF, 20);
  assert.deepEqual([r.letzte?.reihe, r.jetzt, r.naechste?.reihe, r.uebernaechste?.reihe], [16, null, 22, 25]);
});

test('Referenz: Reihe 22 → jetzt −2 M, letzte 16, nächste 25, übernächste –', () => {
  const r = ereignisseUm(REF, 22);
  assert.deepEqual(r.jetzt, { reihe: 22, maschen: -2 });
  assert.equal(r.letzte.reihe, 16);
  assert.equal(r.naechste.reihe, 25);
  assert.equal(r.uebernaechste, null);
});

test('Ereignisse: Reihe 0, nach dem letzten Ereignis, leere Liste', () => {
  assert.deepEqual(ereignisseUm(REF, 0), { letzte: null, jetzt: null, naechste: REF[0], uebernaechste: REF[1] });
  assert.deepEqual(ereignisseUm(REF, 30), { letzte: REF[2], jetzt: null, naechste: null, uebernaechste: null });
  assert.deepEqual(ereignisseUm([], 5), { letzte: null, jetzt: null, naechste: null, uebernaechste: null });
});

// ---------------------------------------------------------------- Zielquellen

const P = { reihen: 167, cm: 45.14 };
const L = { reihen: 50, cm: 13.51 };
const A = { reihen: 39, cm: 10.54 };

test('Zielquellen: feste Reihenfolge Plan, Länge, Anleitung; ungültige fallen weg', () => {
  assert.deepEqual(zielQuellen({ plan: P, laengeZuReihen: L, reihenAusAnleitung: A }).map((q) => q.quelle), ['plan', 'laengeZuReihen', 'reihenAusAnleitung']);
  assert.deepEqual(zielQuellen({ reihenAusAnleitung: A, plan: { reihen: 0, cm: 0 } }).map((q) => q.quelle), ['reihenAusAnleitung']);
  assert.deepEqual(zielQuellen({}), []);
});

test('waehleZiel: 0, 1, 2, 3 Quellen; gespeicherte und ungültige Wahl', () => {
  assert.deepEqual(waehleZiel([], 'plan'), { ziel: null, auswahlAnzeigen: false });
  const eine = zielQuellen({ reihenAusAnleitung: A });
  assert.deepEqual(waehleZiel(eine, null), { ziel: eine[0], auswahlAnzeigen: false });
  const zwei = zielQuellen({ laengeZuReihen: L, reihenAusAnleitung: A });
  assert.equal(waehleZiel(zwei, null).ziel.quelle, 'laengeZuReihen');
  assert.equal(waehleZiel(zwei, 'reihenAusAnleitung').ziel.quelle, 'reihenAusAnleitung');
  assert.equal(waehleZiel(zwei, 'plan').ziel.quelle, 'laengeZuReihen', 'gewählte Quelle ungültig → erste gültige');
  assert.equal(waehleZiel(zwei, null).auswahlAnzeigen, true);
  const drei = zielQuellen({ plan: P, laengeZuReihen: L, reihenAusAnleitung: A });
  assert.equal(waehleZiel(drei, 'unbekannt').ziel.quelle, 'plan');
});

test('Referenz: Zähler 37 bei 37 R / 10 cm → 10,00 cm von 13,51 cm', () => {
  assert.equal(gestrickteLaengeCm(37, { anzahl: 37, bezugCm: 10 }).toFixed(2), '10.00');
  assert.equal(gestrickteLaengeCm(5, null), null);
});

test('zielErreicht', () => {
  assert.equal(zielErreicht(49, L), false);
  assert.equal(zielErreicht(50, L), true);
  assert.equal(zielErreicht(60, L), true);
  assert.equal(zielErreicht(60, null), false);
});

// ---------------------------------------------------------------- Aus einem gespeicherten Strickstück

const PROBE = {
  anleitung: { maschenAnzahl: '34', maschenBezug: '10', reihenAnzahl: '52', reihenBezug: '10' },
  eigen: { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' },
};
function stueck({ laenge = '', anleitung = '', plan = null } = {}) {
  return {
    rechner: {
      maschenAusAnleitung: { eingabe: '', anpassung: '0' },
      reihenAusAnleitung: { eingabe: anleitung, anpassung: '0' },
      breiteZuMaschen: { eingabe: '', anpassung: '0' },
      laengeZuReihen: { eingabe: laenge, anpassung: '0' },
    },
    plan,
  };
}

test('zaehlerDaten Referenz: „Länge in Reihen“ 13,5 cm → 50 R / 13,51 cm', () => {
  const d = zaehlerDaten(stueck({ laenge: '13,5' }), PROBE, 'cm');
  assert.equal(d.quellen.length, 1);
  assert.equal(d.quellen[0].quelle, 'laengeZuReihen');
  assert.equal(d.quellen[0].reihen, 50);
  assert.equal(d.quellen[0].cm.toFixed(2), '13.51');
  assert.equal(d.plan, null);
});

test('zaehlerDaten: alle drei Quellen, Plan auch während einer offenen Auswahl', () => {
  const plan = {
    anfangBreite: '20', endBreite: '34', laenge: '45', maschenProEreignis: '2',
    arbeitsweise: 'reihen', jedeZweite: false, ereignisWahl: null, anpassung: { anfang: '0', ende: '0', reihen: '0' },
  };
  const d = zaehlerDaten(stueck({ laenge: '13,5', anleitung: '55', plan }), PROBE, 'cm');
  assert.deepEqual(d.quellen.map((q) => [q.quelle, q.reihen]), [['plan', 167], ['laengeZuReihen', 50], ['reihenAusAnleitung', 39]]);
  assert.equal(d.plan.status, 'auswahl');
});

test('zaehlerDaten: Anpassung zählt mit; ungültige Reihenprobe → keine Quellen, keine Länge', () => {
  const s = stueck({ anleitung: '55' });
  s.rechner.reihenAusAnleitung.anpassung = '+1';
  assert.equal(zaehlerDaten(s, PROBE, 'cm').quellen[0].reihen, 40);
  const ohne = zaehlerDaten(s, { ...PROBE, eigen: { ...PROBE.eigen, reihenAnzahl: '' } }, 'cm');
  assert.deepEqual(ohne.quellen, []);
  assert.equal(ohne.probeReihen, null);
});

test('zaehlerDaten: Anpassung mit Ergebnis < 1 → Quelle ungültig', () => {
  const s = stueck({ laenge: '13,5' });
  s.rechner.laengeZuReihen.anpassung = '-50';
  assert.deepEqual(zaehlerDaten(s, PROBE, 'cm').quellen, []);
});

// ---------------------------------------------------------------- Maschenzahl je Ereignis (US-37 AK2)

test('US-37 AK2: ereignisseUm gibt maschenDanach in allen vier Einträgen durch', () => {
  // Zähler-Referenz aus US-15 bei 50 Anfangsmaschen: 49, 47, 44 Maschen
  const mitDanach = [
    { reihe: 16, maschen: -1, maschenDanach: 49 },
    { reihe: 22, maschen: -2, maschenDanach: 47 },
    { reihe: 25, maschen: -3, maschenDanach: 44 },
  ];
  const bei20 = ereignisseUm(mitDanach, 20);
  assert.equal(bei20.letzte.maschenDanach, 49);
  assert.equal(bei20.naechste.maschenDanach, 47);
  assert.equal(bei20.uebernaechste.maschenDanach, 44);

  const bei22 = ereignisseUm(mitDanach, 22);
  assert.equal(bei22.jetzt.maschenDanach, 47, 'auch im Eintrag „jetzt“');

  // ziel.js baut die Ereignisse nicht um, sondern gibt dieselben Objekte zurück
  assert.equal(bei20.letzte, mitDanach[0]);
});

test('US-37: der Plan eines Strickstücks liefert maschenDanach bis in den Zähler', () => {
  const plan = {
    anfangBreite: '20', endBreite: '34', laenge: '45', maschenProEreignis: '2',
    arbeitsweise: 'reihen', jedeZweite: false, ereignisWahl: 'weniger',
    anpassung: { anfang: '0', ende: '0', reihen: '0' },
  };
  const d = zaehlerDaten(stueck({ plan }), PROBE, 'cm');
  assert.equal(d.plan.status, 'plan');
  const erstes = d.plan.ereignisse[0];
  const um = ereignisseUm(d.plan.ereignisse, erstes.reihe);
  assert.equal(um.jetzt.maschenDanach, d.plan.anfang + erstes.maschen);
  assert.equal(d.plan.ereignisse.at(-1).maschenDanach, d.plan.ende);
});
