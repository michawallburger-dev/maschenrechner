// Tests des Datenmodells Schema 3: Proben, Zuordnung, Plan, Zielquelle (US-32, US-14, US-16, US-30).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  leereDaten,
  leererPlan,
  neuesProjekt,
  neueProbe,
  probeAendern,
  probeLoeschen,
  neuesStrickstueck,
  strickstueckAendern,
  finde,
  probeVon,
  stueckeMitProbe,
  pruefeDaten,
  anzahlProben,
} from '../js/modell.js';
import { umrechnenAusAnleitung } from '../js/rechner.js';
import { probeAusTexten } from '../js/plan.js';
import { ZEIT1, ZEIT2, ZEIT3 } from './hilfen.js';

/** Projekt mit den Referenzproben „Glatt“ 34/52 – 25/37 und „Ärmel“ 34/52 – 20/30. */
function referenz() {
  let d = neuesProjekt(leereDaten(), { name: 'Pullover', nadelstaerkeMm: '3,5' }, 'p1', ZEIT1).daten;
  d = probeAendern(d, 'p1', 'pr-1', { name: 'Glatt', anleitung: { maschenAnzahl: '34', reihenAnzahl: '52' }, eigen: { maschenAnzahl: '25', reihenAnzahl: '37' } }, ZEIT1).daten;
  d = neuesStrickstueck(d, 'p1', 'Vorderteil', 's1', ZEIT1).daten;
  const r = neueProbe(d, 'p1', 'pr-2', ZEIT2);
  d = probeAendern(r.daten, 'p1', 'pr-2', { name: 'Ärmel', nadelstaerkeMm: '3', anleitung: { maschenAnzahl: '34', reihenAnzahl: '52' }, eigen: { maschenAnzahl: '20', reihenAnzahl: '30' } }, ZEIT2).daten;
  return d;
}

function eigeneMaschen(d, stueckId) {
  const { projekt, stueck } = finde(d, 'p1', stueckId);
  const probe = probeVon(projekt, stueck);
  return umrechnenAusAnleitung(320, probeAusTexten(probe.anleitung, 'maschen', 'cm'), probeAusTexten(probe.eigen, 'maschen', 'cm')).eigenGerundet;
}

// ---------------------------------------------------------------- Proben anlegen und ändern (AK1, AK2)

test('Neues Projekt: eine „Probe 1“, Nadel aus den Angaben gehört zur Probe (E18)', () => {
  const p = neuesProjekt(leereDaten(), { name: 'X', nadelstaerkeMm: '4' }, 'p1', ZEIT1).daten.projekte[0];
  assert.equal(p.proben.length, 1);
  assert.equal(p.proben[0].nadelstaerkeMm, '4');
  assert.equal(p.nadelstaerkeMm, undefined);
});

test('AK1: Probe hinzufügen bekommt die nächste freie Nummer', () => {
  let d = neuesProjekt(leereDaten(), { name: 'X' }, 'p1', ZEIT1).daten;
  const r = neueProbe(d, 'p1', 'pr-2', ZEIT2);
  assert.equal(r.gueltig, true);
  assert.equal(r.probeId, 'pr-2');
  d = r.daten;
  assert.deepEqual(d.projekte[0].proben.map((p) => p.name), ['Probe 1', 'Probe 2']);
  assert.equal(d.projekte[0].geaendert, ZEIT2);
  d = probeAendern(d, 'p1', 'pr-2', { name: 'Probe 3' }, ZEIT2).daten;
  d = neueProbe(d, 'p1', 'pr-3', ZEIT2).daten;
  assert.deepEqual(d.projekte[0].proben.map((p) => p.name), ['Probe 1', 'Probe 3', 'Probe 4'], 'keine doppelten Standardnamen');
  assert.equal(neueProbe(d, 'gibts-nicht', 'x', ZEIT2).fehler, 'NICHT_GEFUNDEN');
});

test('AK1: Probe umbenennen (leer abgelehnt, max. 40 Zeichen), Nadel und Werte ändern', () => {
  const d = referenz();
  assert.equal(probeAendern(d, 'p1', 'pr-2', { name: '  ' }, ZEIT3).fehler, 'NAME_LEER');
  assert.equal(probeAendern(d, 'p1', 'pr-2', { name: 'x'.repeat(60) }, ZEIT3).daten.projekte[0].proben[1].name.length, 40);
  assert.equal(probeAendern(d, 'p1', 'nix', { name: 'a' }, ZEIT3).fehler, 'NICHT_GEFUNDEN');
  const p = finde(d, 'p1').projekt.proben[1];
  assert.deepEqual([p.name, p.nadelstaerkeMm, p.eigen.maschenAnzahl, p.eigen.maschenBezug], ['Ärmel', '3', '20', '10']);
});

// ---------------------------------------------------------------- Zuordnung (AK3–AK6)

test('AK4: bei einer Probe automatisch zuordnen, bei mehreren ist die Wahl Pflicht', () => {
  const d = referenz();
  assert.equal(finde(d, 'p1', 's1').stueck.probeId, 'pr-1');
  assert.equal(neuesStrickstueck(d, 'p1', 'Ärmel links', 's2', ZEIT3).fehler, 'PROBE_FEHLT');
  assert.equal(neuesStrickstueck(d, 'p1', 'Ärmel links', 's2', ZEIT3, 'gibts-nicht').fehler, 'PROBE_FEHLT');
  const r = neuesStrickstueck(d, 'p1', 'Ärmel links', 's2', ZEIT3, 'pr-2');
  assert.equal(r.gueltig, true);
  const s = finde(r.daten, 'p1', 's2').stueck;
  assert.deepEqual([s.probeId, s.plan, s.zielQuelle, s.zaehler], ['pr-2', null, null, 0]);
});

test('Referenz: Strickstück mit Probe „Ärmel“ → 320 M → 188 M, mit „Glatt“ → 235 M', () => {
  const d = neuesStrickstueck(referenz(), 'p1', 'Ärmel', 's2', ZEIT3, 'pr-2').daten;
  assert.equal(eigeneMaschen(d, 's1'), 235);
  assert.equal(eigeneMaschen(d, 's2'), 188);
});

test('AK5: Probe wechseln – Rechner, Plan und Zähler bleiben; Ergebnis rechnet neu', () => {
  let d = referenz();
  d = strickstueckAendern(d, 'p1', 's1', { zaehler: 12, rechner: { maschenAusAnleitung: { eingabe: '320', anpassung: '1' } }, plan: { laenge: '45' } }, ZEIT2).daten;
  const vorher = finde(d, 'p1', 's1').stueck;
  const r = strickstueckAendern(d, 'p1', 's1', { probeId: 'pr-2' }, ZEIT3);
  assert.equal(r.gueltig, true);
  const nachher = finde(r.daten, 'p1', 's1').stueck;
  assert.equal(nachher.probeId, 'pr-2');
  assert.deepEqual([nachher.zaehler, nachher.rechner, nachher.plan], [vorher.zaehler, vorher.rechner, vorher.plan]);
  assert.equal(eigeneMaschen(r.daten, 's1'), 188);
  assert.equal(strickstueckAendern(d, 'p1', 's1', { probeId: 'nix' }, ZEIT3).fehler, 'PROBE_FEHLT');
});

test('AK6: Änderung einer Probe wirkt nur auf die zugeordneten Strickstücke', () => {
  let d = neuesStrickstueck(referenz(), 'p1', 'Ärmel', 's2', ZEIT3, 'pr-2').daten;
  d = probeAendern(d, 'p1', 'pr-2', { eigen: { maschenAnzahl: '30' } }, ZEIT3).daten;
  assert.equal(eigeneMaschen(d, 's1'), 235, 'Vorderteil unverändert');
  assert.equal(eigeneMaschen(d, 's2'), 282);
  assert.deepEqual(stueckeMitProbe(finde(d, 'p1').projekt, 'pr-2').map((s) => s.name), ['Ärmel']);
});

// ---------------------------------------------------------------- Löschen (AK7, E20)

test('AK7: verwendete Probe nicht löschbar – betroffene Strickstücke werden genannt', () => {
  const d = neuesStrickstueck(referenz(), 'p1', 'Ärmel links', 's2', ZEIT3, 'pr-2').daten;
  const r = probeLoeschen(d, 'p1', 'pr-2', ZEIT3);
  assert.deepEqual(r, { gueltig: false, fehler: 'PROBE_VERWENDET', stuecke: ['Ärmel links'] });
});

test('AK7: letzte Probe nicht löschbar; freie Probe löschbar', () => {
  const d = referenz();
  const r = probeLoeschen(d, 'p1', 'pr-2', ZEIT3);
  assert.equal(r.gueltig, true);
  assert.deepEqual(r.daten.projekte[0].proben.map((p) => p.id), ['pr-1']);
  const ohneStueck = neuesProjekt(leereDaten(), { name: 'X' }, 'p1', ZEIT1).daten;
  assert.equal(probeLoeschen(ohneStueck, 'p1', 'pr-1', ZEIT3).fehler, 'LETZTE_PROBE');
  assert.equal(probeLoeschen(d, 'p1', 'nix', ZEIT3).fehler, 'NICHT_GEFUNDEN');
});

// ---------------------------------------------------------------- Plan (US-14, US-16) und Zielquelle (US-30)

test('US-14: Plan anlegen (Vorbelegung), Felder ändern, löschen', () => {
  let d = referenz();
  d = strickstueckAendern(d, 'p1', 's1', { plan: {} }, ZEIT2).daten;
  assert.deepEqual(finde(d, 'p1', 's1').stueck.plan, leererPlan());
  d = strickstueckAendern(d, 'p1', 's1', {
    plan: { anfangBreite: '20', arbeitsweise: 'runden', jedeZweite: true, ereignisWahl: 'mehr', anpassung: { ende: '1' } },
  }, ZEIT3).daten;
  const plan = finde(d, 'p1', 's1').stueck.plan;
  assert.deepEqual(
    [plan.anfangBreite, plan.arbeitsweise, plan.jedeZweite, plan.ereignisWahl, plan.anpassung],
    ['20', 'runden', true, 'mehr', { anfang: '0', ende: '1', reihen: '0' }],
  );
  // Unbekannte Werte werden ignoriert, null setzt die Auswahl zurück
  d = strickstueckAendern(d, 'p1', 's1', { plan: { arbeitsweise: 'quer', ereignisWahl: null, jedeZweite: 'ja' } }, ZEIT3).daten;
  const p2 = finde(d, 'p1', 's1').stueck.plan;
  assert.deepEqual([p2.arbeitsweise, p2.ereignisWahl, p2.jedeZweite], ['runden', null, true]);
  d = strickstueckAendern(d, 'p1', 's1', { plan: null }, ZEIT3).daten;
  assert.equal(finde(d, 'p1', 's1').stueck.plan, null);
});

test('US-30 AK7: Zielquelle speichern, unbekannt → null', () => {
  let d = strickstueckAendern(referenz(), 'p1', 's1', { zielQuelle: 'plan' }, ZEIT2).daten;
  assert.equal(finde(d, 'p1', 's1').stueck.zielQuelle, 'plan');
  d = strickstueckAendern(d, 'p1', 's1', { zielQuelle: 'irgendwas' }, ZEIT2).daten;
  assert.equal(finde(d, 'p1', 's1').stueck.zielQuelle, null);
});

// ---------------------------------------------------------------- Prüfen und Reparieren (Architektur 6.3)

test('pruefeDaten: gültige Schema-3-Daten bleiben gleich', () => {
  let d = neuesStrickstueck(referenz(), 'p1', 'Ärmel', 's2', ZEIT3, 'pr-2').daten;
  d = strickstueckAendern(d, 'p1', 's2', { plan: { laenge: '45' }, zielQuelle: 'plan' }, ZEIT3).daten;
  assert.deepEqual(pruefeDaten(structuredClone(d)).daten, d);
});

test('pruefeDaten repariert: keine Proben, fehlende Zuordnung, kaputter Plan, Zielquelle, IDs', () => {
  const r = pruefeDaten({
    schemaVersion: 3,
    projekte: [
      { id: 'p1', name: 'Ohne Proben', strickstuecke: [{ id: 's1', name: 'A', probeId: 'pr-9' }] },
      {
        id: 'p2', name: 'Mit Proben',
        proben: [{ id: 'pr a', name: '', nadelstaerkeMm: 3 }, { id: 'pr-b', name: 'B', eigen: { maschenAnzahl: '20' } }, 'kaputt'],
        strickstuecke: [
          { id: 's1', name: 'A', probeId: 'pr-b', plan: { laenge: 45, arbeitsweise: 'x', jedeZweite: 'ja', ereignisWahl: 'viel', anpassung: 'x' }, zielQuelle: 'gibts' },
          { id: 's2', name: 'B', plan: 'kein Objekt' },
        ],
      },
    ],
  });
  assert.equal(r.gueltig, true);
  const [p1, p2] = r.daten.projekte;
  assert.deepEqual(p1.proben.map((p) => [p.id, p.name]), [['pr-1', 'Probe 1']], 'Projekt ohne Proben bekommt „Probe 1“');
  assert.equal(p1.strickstuecke[0].probeId, 'pr-1', 'unbekannte Zuordnung → erste Probe');
  assert.deepEqual(p2.proben.map((p) => [p.id, p.name, p.nadelstaerkeMm]), [['pr-reparatur-1', 'Probe 1', ''], ['pr-b', 'B', '']]);
  const [s1, s2] = p2.strickstuecke;
  assert.equal(s1.probeId, 'pr-b');
  assert.deepEqual(s1.plan, { ...leererPlan() }, 'falsche Typen → Vorbelegung, Plan bleibt');
  assert.equal(s1.zielQuelle, null);
  assert.equal(s2.plan, null);
  assert.equal(s2.probeId, 'pr-reparatur-1', 'fehlende Zuordnung → erste Probe');
});

test('anzahlProben zählt über alle Projekte', () => {
  let d = referenz();
  d = neuesProjekt(d, { name: 'Mütze' }, 'p2', ZEIT3).daten;
  assert.equal(anzahlProben(d), 3);
});

// ---------------------------------------------------------------- Klapp-Zustand der Karten (US-38, Architektur Sprint 4, Abschnitt 3)

test('US-38: ein neues Strickstück hat alle Karten offen', () => {
  const d = referenz();
  assert.deepEqual(finde(d, 'p1', 's1').stueck.eingeklappt, {}, 'leeres Objekt = alles offen');
});

test('US-38 AK2: zuklappen speichert, aufklappen entfernt den Eintrag', () => {
  let d = referenz();
  d = strickstueckAendern(d, 'p1', 's1', { eingeklappt: { breiteZuMaschen: true, plan: true } }, ZEIT2).daten;
  assert.deepEqual(finde(d, 'p1', 's1').stueck.eingeklappt, { breiteZuMaschen: true, plan: true });

  d = strickstueckAendern(d, 'p1', 's1', { eingeklappt: { plan: false } }, ZEIT3).daten;
  assert.deepEqual(finde(d, 'p1', 's1').stueck.eingeklappt, { breiteZuMaschen: true }, 'offen wird nicht gespeichert');
});

test('US-38: unbekannte Kartennamen und falsche Typen werden nicht übernommen', () => {
  let d = referenz();
  d = strickstueckAendern(d, 'p1', 's1', { eingeklappt: { gibtsNicht: true, plan: 'ja' } }, ZEIT2).daten;
  assert.deepEqual(finde(d, 'p1', 's1').stueck.eingeklappt, {});
});

test('US-38: andere Felder lassen den Klapp-Zustand unberührt', () => {
  let d = referenz();
  d = strickstueckAendern(d, 'p1', 's1', { eingeklappt: { plan: true } }, ZEIT2).daten;
  d = strickstueckAendern(d, 'p1', 's1', { zaehler: 7 }, ZEIT3).daten;
  assert.deepEqual(finde(d, 'p1', 's1').stueck.eingeklappt, { plan: true });
});

test('US-38 AK3: pruefeDaten reinigt den Klapp-Zustand und verträgt sein Fehlen', () => {
  const roh = {
    schemaVersion: 3,
    projekte: [{
      id: 'p1', name: 'P', proben: [], strickstuecke: [
        { id: 's1', name: 'A', eingeklappt: { plan: true, laengeZuReihen: 1, unbekannt: true } },
        { id: 's2', name: 'B' },
        { id: 's3', name: 'C', eingeklappt: 'kaputt' },
      ],
    }],
  };
  const stuecke = pruefeDaten(roh).daten.projekte[0].strickstuecke;
  assert.deepEqual(stuecke[0].eingeklappt, { plan: true }, 'nur bekannte Karten mit echtem true');
  assert.deepEqual(stuecke[1].eingeklappt, {}, 'fehlendes Feld = alles offen (Daten aus 0.3)');
  assert.deepEqual(stuecke[2].eingeklappt, {}, 'kein Objekt = alles offen');
});
