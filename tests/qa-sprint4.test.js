/**
 * Unabhängige Akzeptanztests der QA für Sprint 4 (Epic MAS-60, Version 0.4.0).
 *
 * Geprüft wird gegen die Akzeptanzkriterien in Jira (MAS-57, MAS-58, MAS-62,
 * MAS-59) und gegen `docs/architektur/sprint-4-architektur.md` v4.2 – nicht
 * gegen die Tests des Entwicklers. Überschneidungen sind gewollt: Dieselbe
 * Aussage von zwei Seiten geprüft ist mehr wert als eine.
 *
 * Reine Fachlogik, kein DOM. Was nur im Browser prüfbar ist (Dreieck am
 * <summary>, zugeklappte Karte mit Statusmeldung, Platz auf 360 × 640 px),
 * steht in `docs/qa/sprint-4-testbericht.md`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { berechnePlan, erlaubteReihen, standardStartReihe, planAusTexten, planEingabenAusTexten, MAX_EREIGNISSE } from '../js/plan.js';
import { pruefeZahl, REGELN } from '../js/eingabe.js';
import { ereignisseUm } from '../js/ziel.js';
import {
  leereDaten, leererPlan, neuesProjekt, neuesStrickstueck, strickstueckAendern,
  pruefeDaten, finde, KLAPPBARE_KARTEN, RECHNER_NAMEN, GRENZEN,
} from '../js/modell.js';
import { erzeugeSicherung, leseSicherung } from '../js/sicherung.js';
import { text } from '../js/texte.js';
import { ZEIT1, ZEIT2 } from './hilfen.js';

const WURZEL = fileURLToPath(new URL('..', import.meta.url));

// ---------------------------------------------------------------- Testdaten

/** Eigene Probe des Referenzfalls: 25 M / 37 R je 10 cm. */
const PROBE = { maschen: { anzahl: 25, bezugCm: 10 }, reihen: { anzahl: 37, bezugCm: 10 } };
const PROBE_TEXTE = { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' };

/** Referenzfall aus Sprint 3: 20 → 34 cm auf 45 cm, 2 M je Ereignis, Auswahl „weniger“ (84 M). */
const REFERENZ = { anfangCm: 20, endCm: 34, laengeCm: 45, proEreignis: 2, ereignisWahl: 'weniger' };

/** Ein Strickstück mit Plan, zum Prüfen von Speichern und Sichern. */
function stueckMitPlan(planFelder = {}) {
  let d = neuesProjekt(leereDaten(), { name: 'Pullover' }, 'p1', ZEIT1).daten;
  d = neuesStrickstueck(d, 'p1', 'Vorderteil', 's1', ZEIT1, 'pr-1').daten;
  return strickstueckAendern(d, 'p1', 's1', {
    plan: { anfangBreite: '20', endBreite: '34', laenge: '45', maschenProEreignis: '2', ereignisWahl: 'weniger', ...planFelder },
  }, ZEIT2).daten;
}

/** Deterministischer Zufall (xorshift32) – gleiche Eingaben, gleiche Testfälle. */
function wuerfel(saat) {
  let z = saat >>> 0 || 1;
  return (min, max) => {
    z ^= z << 13; z >>>= 0;
    z ^= z >> 17;
    z ^= z << 5; z >>>= 0;
    return min + (z % (max - min + 1));
  };
}

// ================================================================ MAS-57: Kartentitel

test('MAS-57 AK1: die Titel der beiden cm-Rechner nennen die Eingabe, nicht das Ergebnis', () => {
  const breite = text('de', 'rechner.breiteZuMaschen.titel', { einheit: 'cm' });
  const laenge = text('de', 'rechner.laengeZuReihen.titel', { einheit: 'cm' });
  assert.equal(breite, 'Aus Breite (cm) → Maschen');
  assert.equal(laenge, 'Aus Länge (cm) → Reihen');
  // Die irreführenden alten Titel dürfen nicht zurückkommen (P3-01)
  assert.notEqual(breite, 'Breite in Maschen');
  assert.notEqual(laenge, 'Länge in Reihen');
});

test('MAS-57 AK3: die Titel stehen in texte.js und tragen die Einheit als Platzhalter (US-23, US-24)', () => {
  const quelle = readFileSync(join(WURZEL, 'js/texte.js'), 'utf8');
  for (const schluessel of ['rechner.breiteZuMaschen.titel', 'rechner.laengeZuReihen.titel']) {
    const zeile = quelle.split('\n').find((z) => z.includes(`'${schluessel}'`));
    assert.ok(zeile.includes('{einheit}'), `${schluessel} ohne {einheit}`);
  }
  // Mit einer anderen Einheit muss der Titel mitwandern (US-24 Zoll ist vorbereitet)
  assert.ok(text('de', 'rechner.breiteZuMaschen.titel', { einheit: 'in' }).includes('(in)'));
});

test('MAS-57 AK2: die Titel bleiben kurz (Indiz für eine Zeile auf 360 px)', () => {
  // Gemessen wurde im Browser (siehe Testbericht); hier nur eine grobe Schranke,
  // damit eine spätere Verlängerung auffällt.
  for (const name of ['breiteZuMaschen', 'laengeZuReihen']) {
    const titel = text('de', `rechner.${name}.titel`, { einheit: 'cm' });
    assert.ok(titel.length <= 26, `${name}: ${titel.length} Zeichen`);
  }
});

test('MAS-57: die unveränderten Titel der beiden anderen Rechner nennen weiter die Anleitung', () => {
  assert.equal(text('de', 'rechner.maschenAusAnleitung.titel', {}), 'Maschen aus der Anleitung');
  assert.equal(text('de', 'rechner.reihenAusAnleitung.titel', {}), 'Reihen aus der Anleitung');
});

test('BEFUND S4-05: die Zielquelle im Zähler trägt noch den alten Kartennamen', { todo: 'Befund S4-05' }, () => {
  // Der Zähler nennt seine Quelle „Länge in Reihen“ – so heißt seit MAS-57
  // keine Karte mehr. Die Beschriftung soll zum Kartentitel passen.
  assert.equal(text('de', 'zaehler.quelle.laengeZuReihen', {}), text('de', 'rechner.laengeZuReihen.titel', { einheit: 'cm' }));
});

test('BEFUND S4-04: der Hinweis am Schalter „nur jede 2.“ verspricht „ab der ersten“', { todo: 'Befund S4-04' }, () => {
  // Mit leerer Startreihe beginnt der erlaubte Bereich bei Reihe 3, nicht bei
  // der ersten Reihe. Dieselbe Art von Irreführung, die P3-01 beschreibt.
  assert.ok(!/ab der ersten/.test(text('de', 'plan.jedeZweiteHinweis', {})));
});

// ================================================================ MAS-58: Maschenzahl je Ereignis

test('MAS-58 AK1/AK3 Referenzfall: 50 Anfangsmaschen, 17 Zunahmen, 52 … 84 M', () => {
  const r = berechnePlan(REFERENZ, PROBE);
  assert.equal(r.status, 'plan');
  assert.equal(r.anfang, 50);
  assert.equal(r.ende, 84);
  assert.equal(r.reihen, 167);
  assert.equal(r.ereignisse.length, 17);
  assert.deepEqual(r.ereignisse.map((e) => e.maschenDanach), [52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84]);
  assert.equal(r.ereignisse.at(-1).maschenDanach, r.ende);
});

test('MAS-58 AK3: auch bei der Option „mehr“ endet die Folge genau auf der gewählten Endmaschenzahl', () => {
  for (const wahl of ['weniger', 'mehr']) {
    const r = berechnePlan({ anfangCm: 20, endCm: 25, laengeCm: 45, proEreignis: 3, ereignisWahl: wahl }, PROBE);
    assert.equal(r.status, 'plan', wahl);
    assert.equal(r.ereignisse.at(-1).maschenDanach, r.ende, wahl);
    assert.equal(r.ereignisse[0].maschenDanach, r.anfang + r.ereignisse[0].maschen, wahl);
  }
});

test('MAS-58 AK4: Abnahme, Runden und „nur jede 2.“ liefern dieselbe Zusage', () => {
  const faelle = [
    { ...REFERENZ, anfangCm: 34, endCm: 20 },                       // Abnahme
    { ...REFERENZ, runden: true },                                  // Runden
    { ...REFERENZ, jedeZweite: true },                              // jede 2. Reihe
    { ...REFERENZ, anfangCm: 34, endCm: 20, runden: true, jedeZweite: true },
  ];
  for (const fall of faelle) {
    const r = berechnePlan(fall, PROBE);
    assert.equal(r.status, 'plan', JSON.stringify(fall));
    assert.equal(r.ereignisse.at(-1).maschenDanach, r.ende);
    const schritt = r.richtung === 'ab' ? -r.proEreignis : r.proEreignis;
    for (let i = 0; i < r.ereignisse.length; i++) {
      assert.equal(r.ereignisse[i].maschenDanach, r.anfang + schritt * (i + 1));
    }
  }
});

test('MAS-58 AK5: jede der drei Anpassungen verschiebt die Maschenzahlen sofort', () => {
  const ohne = berechnePlan(REFERENZ, PROBE);
  const mitAnfang = berechnePlan({ ...REFERENZ, anpassung: { anfang: -4 } }, PROBE);
  assert.equal(mitAnfang.anfang, ohne.anfang - 4);
  assert.equal(mitAnfang.ereignisse[0].maschenDanach, ohne.ereignisse[0].maschenDanach - 4);
  assert.equal(mitAnfang.ereignisse.at(-1).maschenDanach, mitAnfang.ende);

  const mitEnde = berechnePlan({ ...REFERENZ, anpassung: { ende: 2 } }, PROBE);
  assert.equal(mitEnde.ereignisse.at(-1).maschenDanach, mitEnde.ende);

  const mitReihen = berechnePlan({ ...REFERENZ, anpassung: { reihen: -50 } }, PROBE);
  assert.equal(mitReihen.reihen, ohne.reihen - 50);
  assert.equal(mitReihen.ereignisse.at(-1).maschenDanach, mitReihen.ende);
});

test('MAS-58 AK2: der Zähler bekommt maschenDanach in allen vier Einträgen (Referenz US-15)', () => {
  const ereignisse = [
    { reihe: 16, maschen: -1, maschenDanach: 49 },
    { reihe: 22, maschen: -2, maschenDanach: 47 },
    { reihe: 25, maschen: -3, maschenDanach: 44 },
  ];
  const um = ereignisseUm(ereignisse, 22);
  assert.equal(um.letzte.maschenDanach, 49);
  assert.equal(um.jetzt.maschenDanach, 47);
  assert.equal(um.naechste.maschenDanach, 44);
  assert.equal(um.uebernaechste, null);
  // ereignisseUm darf die Objekte nicht umbauen (Architektur Sprint 4, 4.3)
  assert.equal(um.jetzt, ereignisse[1]);
});

test('MAS-58: die Ereigniszeilen in Plan und Zähler nennen die Maschenzahl', () => {
  for (const schluessel of ['plan.zeileReihe', 'plan.zeileRunde', 'zaehler.ereignisReihe', 'zaehler.ereignisRunde']) {
    const roh = text('de', schluessel, {});
    assert.ok(/\{danach\}/.test(roh), `${schluessel} ohne {danach}: ${roh}`);
  }
  assert.equal(text('de', 'plan.zeileReihe', { reihe: 12, pro: 2, art: 'zunehmen', danach: 52 }), 'Reihe 12: 2 M zunehmen → 52 M');
  assert.equal(text('de', 'zaehler.ereignisReihe', { reihe: 22, maschen: '−2', danach: 48 }), 'Reihe 22: −2 M → 48 M');
});

// ================================================================ MAS-62: Startreihe, Eingaberegel

test('MAS-62 AK2: die Prüfregel „startReihe“ entspricht der Architektur, Abschnitt 4.1', () => {
  assert.deepEqual({ ...REGELN.startReihe }, { ganzzahl: true, positiv: true, max: 99999, leerErlaubt: true, leerWert: null });
});

test('MAS-62 AK1/AK2 Randfälle der Eingabe', () => {
  const faelle = [
    ['', { gueltig: true, wert: null }, 'leer bedeutet automatisch (E31)'],
    ['   ', { gueltig: true, wert: null }, 'nur Leerzeichen zählt als leer'],
    ['1', { gueltig: true, wert: 1 }, 'Reihe 1 ist erlaubt'],
    ['  7  ', { gueltig: true, wert: 7 }, 'Leerzeichen werden abgeschnitten'],
    ['1.000', { gueltig: true, wert: 1000 }, 'Tausendertrennung nach E13'],
    ['99999', { gueltig: true, wert: 99999 }, 'obere Grenze'],
    ['0', { gueltig: false, fehler: 'NICHT_POSITIV' }, 'null ist keine Reihe'],
    ['-3', { gueltig: false, fehler: 'NICHT_POSITIV' }, 'negativ'],
    ['−3', { gueltig: false, fehler: 'NICHT_POSITIV' }, 'typografisches Minus'],
    ['2,5', { gueltig: false, fehler: 'KEINE_GANZZAHL' }, 'Komma'],
    ['2.5', { gueltig: false, fehler: 'KEINE_GANZZAHL' }, 'Punkt als Dezimaltrenner'],
    ['abc', { gueltig: false, fehler: 'KEINE_ZAHL' }, 'Text'],
    ['12.500.000', { gueltig: false, fehler: 'ZU_GROSS', grenze: 99999 }, 'sehr große Zahl'],
    ['100000', { gueltig: false, fehler: 'ZU_GROSS', grenze: 99999 }, 'eins über der Grenze'],
  ];
  for (const [eingabe, erwartet, warum] of faelle) {
    assert.deepEqual(pruefeZahl(eingabe, 'startReihe'), erwartet, `${JSON.stringify(eingabe)} – ${warum}`);
  }
});

test('MAS-62 AK2: eine ungültige Startreihe liefert keinen Plan', () => {
  const plan = { anfangBreite: '20', endBreite: '34', laenge: '45', maschenProEreignis: '2', ereignisWahl: 'weniger', anpassung: {} };
  for (const wert of ['0', '-1', '2,5', 'abc', '100000']) {
    assert.equal(planAusTexten({ ...plan, startReihe: wert }, PROBE_TEXTE, 'cm'), null, wert);
  }
  assert.notEqual(planAusTexten({ ...plan, startReihe: '12' }, PROBE_TEXTE, 'cm'), null);
});

// ================================================================ MAS-62: Rechenregel

test('MAS-62 AK1/AK9: ohne Startreihe rechnet erlaubteReihen wie in Sprint 3', () => {
  assert.equal(standardStartReihe(false), 2);
  assert.equal(standardStartReihe(true), 3);
  for (let reihen = 1; reihen <= 300; reihen++) {
    for (const jedeZweite of [false, true]) {
      // Sprint-3-Regel noch einmal unabhängig ausgeschrieben
      const erwartet = [];
      for (let r = jedeZweite ? 3 : 2; r <= reihen - 1; r += jedeZweite ? 2 : 1) erwartet.push(r);
      const e = erlaubteReihen(reihen, jedeZweite);
      assert.equal(e.anzahl, erwartet.length, `${reihen}/${jedeZweite}`);
      for (let p = 0; p < e.anzahl; p++) assert.equal(e.reihe(p), erwartet[p]);
      // null ist dasselbe wie „nicht angegeben“
      assert.equal(erlaubteReihen(reihen, jedeZweite, null).anzahl, e.anzahl);
    }
  }
});

test('MAS-62 AK4: eine eigene Startreihe verschiebt den erlaubten Bereich, die Parität folgt ihr', () => {
  for (let start = 1; start <= 12; start++) {
    for (const jedeZweite of [false, true]) {
      const e = erlaubteReihen(100, jedeZweite, start);
      const erwartet = [];
      for (let r = start; r <= 99; r += jedeZweite ? 2 : 1) erwartet.push(r);
      assert.equal(e.anzahl, erwartet.length, `${start}/${jedeZweite}`);
      for (let p = 0; p < e.anzahl; p++) assert.equal(e.reihe(p), erwartet[p]);
      assert.equal(e.start, start);
    }
  }
  // Gerade Startreihe mit „jede 2.“ ergibt ausschließlich gerade Reihen (H4, bewusst zugelassen)
  const plan = berechnePlan({ ...REFERENZ, jedeZweite: true, startReihe: 4 }, PROBE);
  assert.equal(plan.status, 'plan');
  assert.ok(plan.ereignisse.every((e) => e.reihe % 2 === 0));
  assert.ok(plan.ereignisse.every((e) => e.reihe >= 4));
});

test('MAS-62 AK5: die letzte Reihe bleibt in jedem Fall frei', () => {
  for (const startReihe of [null, 1, 2, 5, 40]) {
    for (const jedeZweite of [false, true]) {
      const r = berechnePlan({ ...REFERENZ, jedeZweite, startReihe }, PROBE);
      if (r.status !== 'plan') continue;
      assert.ok(r.ereignisse.at(-1).reihe <= r.reihen - 1, `${startReihe}/${jedeZweite}`);
      assert.ok(r.ereignisse[0].reihe >= (startReihe ?? standardStartReihe(jedeZweite)));
    }
  }
});

test('MAS-62: Startreihe 1 erlaubt die erste Reihe (E24 ist dort nur noch Vorbelegung)', () => {
  const e = erlaubteReihen(10, false, 1);
  assert.equal(e.anzahl, 9);
  assert.equal(e.reihe(0), 1);
  const r = berechnePlan({ anfangCm: 20, endCm: 22, laengeCm: 2, proEreignis: 1, startReihe: 1 }, PROBE);
  assert.equal(r.status, 'plan');
  assert.equal(r.ereignisse[0].reihe, 1);
});

test('MAS-62 AK3: zu große Startreihe → ZU_WENIG_REIHEN mit moeglich 0, kein neuer Fehlercode', () => {
  for (const jedeZweite of [false, true]) {
    for (const startReihe of [167, 168, 500, 99999]) {
      const r = berechnePlan({ ...REFERENZ, jedeZweite, startReihe }, PROBE);
      assert.equal(r.status, 'fehler', `${startReihe}/${jedeZweite}`);
      assert.equal(r.fehler, 'ZU_WENIG_REIHEN');
      assert.equal(r.moeglich, 0);
      assert.equal(r.ereignisse, undefined, 'kein Plan bei ZU_WENIG_REIHEN');
    }
  }
  // Genau ein Platz: die Meldung in der Einzahl greift (S3-03)
  const knapp = berechnePlan({ ...REFERENZ, startReihe: 166 }, PROBE);
  assert.equal(knapp.moeglich, 1);
  assert.ok(text('de', 'plan.fehler.ZU_WENIG_REIHEN.keine', { anzahl: 17 }).includes('keine passende Reihe'));
});

test('MAS-62 AK3: erlaubteReihen liefert nie eine negative Anzahl', () => {
  for (const reihen of [0, 1, 2, 3]) {
    for (const start of [1, 2, 3, 99999]) {
      for (const jedeZweite of [false, true]) {
        assert.ok(erlaubteReihen(reihen, jedeZweite, start).anzahl >= 0, `${reihen}/${start}/${jedeZweite}`);
      }
    }
  }
});

test('MAS-62 AK8: die Startreihe wirkt bis in den Zähler durch', () => {
  const plan = { anfangBreite: '20', endBreite: '34', laenge: '45', maschenProEreignis: '2', ereignisWahl: 'weniger', anpassung: {} };
  const ohne = planAusTexten(plan, PROBE_TEXTE, 'cm');
  const mit = planAusTexten({ ...plan, startReihe: '40' }, PROBE_TEXTE, 'cm');
  assert.notDeepEqual(ohne.ereignisse.map((e) => e.reihe), mit.ereignisse.map((e) => e.reihe));
  // gleiche Maschenzahlen, nur andere Reihen – die Zählereinträge folgen
  assert.deepEqual(ohne.ereignisse.map((e) => e.maschenDanach), mit.ereignisse.map((e) => e.maschenDanach));
  assert.ok(ereignisseUm(mit.ereignisse, 41).naechste.reihe >= 40);
});

test('MAS-62: sehr große Reihenzahlen bleiben beherrschbar (Architektur H1)', () => {
  const r = berechnePlan({ anfangCm: 1, endCm: 9999, laengeCm: 9999, proEreignis: 1, startReihe: 2 }, PROBE);
  assert.equal(r.status, 'fehler');
  assert.equal(r.fehler, 'ZU_VIELE_EREIGNISSE');
  assert.equal(r.grenze, MAX_EREIGNISSE);
  // Knapp unterhalb der Grenze entsteht ein gültiger Plan, und die Maschenzahlen stimmen bis zum Ende
  const gross = berechnePlan({ anfangCm: 1, endCm: 3990, laengeCm: 9999, proEreignis: 1, startReihe: 2 }, PROBE);
  assert.equal(gross.status, 'plan');
  assert.ok(gross.ereignisse.length <= MAX_EREIGNISSE);
  assert.equal(gross.ereignisse.at(-1).maschenDanach, gross.ende);
});

// ================================================================ Eigenschaftstests (MAS-58 AK7, MAS-62 AK6)

test('Eigenschaften über 400 zufällige, gültige Pläne', () => {
  const zufall = wuerfel(20261023);
  let geprueft = 0;
  for (let n = 0; n < 400; n++) {
    const jedeZweite = zufall(0, 1) === 1;
    const startWahl = zufall(0, 3);
    const startReihe = startWahl === 0 ? null : zufall(1, 12);
    const eingaben = {
      anfangCm: zufall(5, 60),
      endCm: zufall(5, 60),
      laengeCm: zufall(10, 120),
      proEreignis: zufall(1, 4),
      jedeZweite,
      startReihe,
      runden: zufall(0, 1) === 1,
      ereignisWahl: zufall(0, 1) === 1 ? 'weniger' : 'mehr',
    };
    const r = berechnePlan(eingaben, PROBE);
    if (r.status !== 'plan') continue;
    geprueft++;
    const hinweis = JSON.stringify(eingaben);

    // 1. Die letzte Maschenzahl ist genau die Endmaschenzahl (MAS-58 AK3)
    assert.equal(r.ereignisse.at(-1).maschenDanach, r.ende, hinweis);

    // 2. Streng monoton – steigend bei Zunahmen, fallend bei Abnahmen
    for (let i = 1; i < r.ereignisse.length; i++) {
      const d = r.ereignisse[i].maschenDanach - r.ereignisse[i - 1].maschenDanach;
      assert.ok(r.richtung === 'zu' ? d > 0 : d < 0, hinweis);
    }

    // 3. Keine Maschenzahl fällt unter 1
    assert.ok(r.ereignisse.every((e) => e.maschenDanach >= 1), hinweis);

    // 4. Alle Reihen liegen zwischen Startreihe und reihen − 1, aufsteigend, ohne Doppelte (MAS-62 AK5)
    const start = startReihe ?? standardStartReihe(jedeZweite);
    const reihen = r.ereignisse.map((e) => e.reihe);
    assert.ok(reihen.every((x) => x >= start && x <= r.reihen - 1), hinweis);
    assert.deepEqual(reihen, [...new Set(reihen)].sort((a, b) => a - b), hinweis);

    // 5. Abstände unterscheiden sich um höchstens 1, mit „jede 2.“ um höchstens 2 (MAS-62 AK6)
    if (r.ereignisse.length > 1) {
      assert.ok(r.abstandMax - r.abstandMin <= (jedeZweite ? 2 : 1), `${hinweis} → ${r.abstandMin}..${r.abstandMax}`);
    }

    // 6. Mit „jede 2.“ folgt die Parität der Startreihe (E31 statt der festen Regel aus E25)
    if (jedeZweite) assert.ok(reihen.every((x) => x % 2 === start % 2), hinweis);

    // 7. Gleiche Eingaben ergeben denselben Plan (MAS-62 AK6)
    assert.deepEqual(berechnePlan(eingaben, PROBE).ereignisse, r.ereignisse, hinweis);
  }
  assert.ok(geprueft >= 150, `nur ${geprueft} gültige Pläne erzeugt`);
});

// ================================================================ MAS-62 AK7 und AK9: Übernahme aus 0.3

test('MAS-62 AK7: ein Plan aus 0.3 ohne das Feld rechnet wie ein leeres Feld', () => {
  const plan03 = { anfangBreite: '20', endBreite: '34', laenge: '45', maschenProEreignis: '2', ereignisWahl: 'weniger', anpassung: {} };
  for (const jedeZweite of [false, true]) {
    const ohneFeld = planAusTexten({ ...plan03, jedeZweite }, PROBE_TEXTE, 'cm');
    const leeresFeld = planAusTexten({ ...plan03, jedeZweite, startReihe: '' }, PROBE_TEXTE, 'cm');
    assert.deepEqual(ohneFeld, leeresFeld, `jedeZweite=${jedeZweite}`);
    assert.equal(ohneFeld.startReihe, null);
  }
  assert.equal(planEingabenAusTexten({ ...plan03 }, 'cm').startReihe, null);
  assert.equal(planEingabenAusTexten({ ...plan03, startReihe: '1.000' }, 'cm').startReihe, 1000);
});

test('MAS-62 AK9 Regressionsschutz: der Referenzfall bleibt für beide Werte von „jede 2.“ unverändert', () => {
  // Ohne „jede 2.“: 167 Reihen, 17 Zunahmen, 50 → 84 M
  const a = berechnePlan(REFERENZ, PROBE);
  assert.deepEqual(
    { anfang: a.anfang, ende: a.ende, reihen: a.reihen, anzahl: a.ereignisse.length, abstandMin: a.abstandMin, abstandMax: a.abstandMax },
    { anfang: 50, ende: 84, reihen: 167, anzahl: 17, abstandMin: 9, abstandMax: 10 },
  );
  // Mit „jede 2.“ liegen alle Ereignisse auf ungeraden Reihen ab 3 (bisheriges Verhalten)
  const b = berechnePlan({ ...REFERENZ, jedeZweite: true }, PROBE);
  assert.equal(b.status, 'plan');
  assert.ok(b.ereignisse.every((e) => e.reihe % 2 === 1 && e.reihe >= 3));
  // Und beides ist identisch mit der ausdrücklich gesetzten Standard-Startreihe
  assert.deepEqual(berechnePlan({ ...REFERENZ, startReihe: 2 }, PROBE).ereignisse, a.ereignisse);
  assert.deepEqual(berechnePlan({ ...REFERENZ, jedeZweite: true, startReihe: 3 }, PROBE).ereignisse, b.ereignisse);
});

// ================================================================ MAS-59: Klapp-Zustand

test('MAS-59: klappbar sind genau die vier Rechner und die Plan-Karte', () => {
  assert.deepEqual([...KLAPPBARE_KARTEN].sort(), [...RECHNER_NAMEN, 'plan'].sort());
});

test('MAS-59 AK2: ein neues Strickstück hat alle Karten offen, Zuklappen wird gespeichert', () => {
  let d = stueckMitPlan();
  assert.deepEqual(finde(d, 'p1', 's1').stueck.eingeklappt, {});
  d = strickstueckAendern(d, 'p1', 's1', { eingeklappt: { plan: true, breiteZuMaschen: true } }, ZEIT2).daten;
  assert.deepEqual(finde(d, 'p1', 's1').stueck.eingeklappt, { plan: true, breiteZuMaschen: true });
  // Aufklappen entfernt den Eintrag – ein fehlender Schlüssel heißt verlässlich „offen“
  d = strickstueckAendern(d, 'p1', 's1', { eingeklappt: { plan: false } }, ZEIT2).daten;
  assert.deepEqual(finde(d, 'p1', 's1').stueck.eingeklappt, { breiteZuMaschen: true });
});

test('MAS-59: andere Änderungen lassen den Klapp-Zustand unberührt', () => {
  let d = strickstueckAendern(stueckMitPlan(), 'p1', 's1', { eingeklappt: { plan: true } }, ZEIT2).daten;
  d = strickstueckAendern(d, 'p1', 's1', { zaehler: 42, name: 'Rücken', plan: { startReihe: '7' } }, ZEIT2).daten;
  const s = finde(d, 'p1', 's1').stueck;
  assert.deepEqual(s.eingeklappt, { plan: true });
  assert.equal(s.zaehler, 42);
  assert.equal(s.plan.startReihe, '7');
});

test('MAS-59 AK3: beschädigte Klapp-Zustände werden repariert, nicht zum Absturz gebracht', () => {
  const faelle = [
    [undefined, {}, 'fehlt (Sicherung aus 0.3)'],
    [null, {}, 'null'],
    [[], {}, 'Liste statt Objekt'],
    [['plan'], {}, 'Liste mit Kartennamen'],
    ['plan', {}, 'Text'],
    [42, {}, 'Zahl'],
    [{ plan: 'ja' }, {}, 'Nicht-Boolean'],
    [{ plan: 1 }, {}, 'Zahl statt true'],
    [{ plan: false }, {}, 'false heißt offen'],
    [{ unbekannteKarte: true, plan: true }, { plan: true }, 'unbekannter Schlüssel wird verworfen'],
    [JSON.parse('{"__proto__":{"plan":true}}'), {}, 'untergeschobenes __proto__ aus einer Datei wirkt nicht'],
    [{ maschenAusAnleitung: true, reihenAusAnleitung: true, breiteZuMaschen: true, laengeZuReihen: true, plan: true },
      { maschenAusAnleitung: true, reihenAusAnleitung: true, breiteZuMaschen: true, laengeZuReihen: true, plan: true }, 'alle zu'],
  ];
  for (const [roh, erwartet, warum] of faelle) {
    const d = stueckMitPlan();
    const kopie = JSON.parse(JSON.stringify(d));
    if (roh === undefined) delete kopie.projekte[0].strickstuecke[0].eingeklappt;
    else kopie.projekte[0].strickstuecke[0].eingeklappt = roh;
    const r = pruefeDaten(kopie);
    assert.equal(r.gueltig, true, warum);
    assert.deepEqual(r.daten.projekte[0].strickstuecke[0].eingeklappt, erwartet, warum);
    // Der Rest des Strickstücks darf darunter nicht leiden (R10)
    assert.equal(r.daten.projekte[0].strickstuecke[0].plan.anfangBreite, '20', warum);
  }
});

test('MAS-59 AK3 / MAS-62 AK7: Sicherungen überstehen die Rundreise und kommen ohne die neuen Felder aus', () => {
  const d = strickstueckAendern(stueckMitPlan({ startReihe: '6' }), 'p1', 's1', { eingeklappt: { plan: true, laengeZuReihen: true } }, ZEIT2).daten;
  const { inhalt } = erzeugeSicherung(d, new Date(2026, 9, 23), '0.4.0');
  const zurueck = leseSicherung(inhalt);
  assert.equal(zurueck.gueltig, true);
  assert.deepEqual(zurueck.daten, d);

  // Dieselbe Sicherung, wie 0.3 sie geschrieben hätte: beide Felder fehlen
  const roh = JSON.parse(inhalt);
  delete roh.daten.projekte[0].strickstuecke[0].eingeklappt;
  delete roh.daten.projekte[0].strickstuecke[0].plan.startReihe;
  roh.appVersion = '0.3.0';
  const alt = leseSicherung(JSON.stringify(roh));
  assert.equal(alt.gueltig, true);
  const stueck = alt.daten.projekte[0].strickstuecke[0];
  assert.deepEqual(stueck.eingeklappt, {}, 'alle Karten offen');
  assert.equal(stueck.plan.startReihe, '', 'leer bedeutet automatisch');

  // Und sie rechnet unverändert weiter (R6, R10)
  const vorher = planAusTexten({ anfangBreite: '20', endBreite: '34', laenge: '45', maschenProEreignis: '2', ereignisWahl: 'weniger', anpassung: {} }, PROBE_TEXTE, 'cm');
  const nachher = planAusTexten(stueck.plan, PROBE_TEXTE, 'cm');
  assert.deepEqual(nachher.ereignisse, vorher.ereignisse);
});

// ================================================================ Datenerhalt an den Grenzen

test('Datenerhalt: IDs an der Längengrenze (64 Zeichen) behalten Plan und Klapp-Zustand', () => {
  const langeId = 'a'.repeat(GRENZEN.id);
  let d = neuesProjekt(leereDaten(), { name: 'P' }, langeId, ZEIT1).daten;
  d = neuesStrickstueck(d, langeId, 'Teil', langeId, ZEIT1, 'pr-1').daten;
  d = strickstueckAendern(d, langeId, langeId, { plan: { startReihe: '9' }, eingeklappt: { plan: true } }, ZEIT2).daten;
  const r = pruefeDaten(JSON.parse(JSON.stringify(d)));
  assert.equal(r.gueltig, true);
  const s = r.daten.projekte[0].strickstuecke[0];
  assert.equal(s.id, langeId);
  assert.equal(s.plan.startReihe, '9');
  assert.deepEqual(s.eingeklappt, { plan: true });
});

test('Datenerhalt: doppelte Strickstück-IDs bekommen Ersatznamen, ohne Daten zu verlieren', () => {
  const d = JSON.parse(JSON.stringify(stueckMitPlan({ startReihe: '5' })));
  const stueck = d.projekte[0].strickstuecke[0];
  d.projekte[0].strickstuecke.push(JSON.parse(JSON.stringify({ ...stueck, eingeklappt: { plan: true } })));
  const r = pruefeDaten(d);
  assert.equal(r.gueltig, true);
  const beide = r.daten.projekte[0].strickstuecke;
  assert.equal(beide.length, 2);
  assert.notEqual(beide[0].id, beide[1].id);
  assert.equal(beide[0].plan.startReihe, '5');
  assert.equal(beide[1].plan.startReihe, '5');
  assert.deepEqual(beide[1].eingeklappt, { plan: true });
});

test('Datenerhalt: eine beschädigte Startreihe wird aufbewahrt, nicht still verworfen (R10)', () => {
  const d = JSON.parse(JSON.stringify(stueckMitPlan()));
  d.projekte[0].strickstuecke[0].plan.startReihe = 'kaputt';
  const r = pruefeDaten(d);
  assert.equal(r.gueltig, true);
  // Der Text bleibt erhalten; die Oberfläche meldet ihn am Feld, statt ihn zu löschen
  assert.equal(r.daten.projekte[0].strickstuecke[0].plan.startReihe, 'kaputt');
  assert.equal(planAusTexten(r.daten.projekte[0].strickstuecke[0].plan, PROBE_TEXTE, 'cm'), null);
});

test('Datenerhalt: falsche Typen in der Startreihe fallen auf die Vorbelegung zurück', () => {
  for (const wert of [7, null, {}, []]) {
    const d = JSON.parse(JSON.stringify(stueckMitPlan()));
    d.projekte[0].strickstuecke[0].plan.startReihe = wert;
    const r = pruefeDaten(d);
    assert.equal(r.daten.projekte[0].strickstuecke[0].plan.startReihe, leererPlan().startReihe, JSON.stringify(wert));
  }
});

test('Datenerhalt: eine überlange Startreihe wird gekürzt, nicht verworfen', () => {
  const d = strickstueckAendern(stueckMitPlan(), 'p1', 's1', { plan: { startReihe: '1'.repeat(40) } }, ZEIT2).daten;
  assert.equal(finde(d, 'p1', 's1').stueck.plan.startReihe.length, GRENZEN.feld);
});

test('Datenerhalt: ein leeres Projekt und ein Strickstück ohne Plan vertragen die neuen Felder', () => {
  const d = neuesProjekt(leereDaten(), { name: 'Leer' }, 'p9', ZEIT1).daten;
  const r = pruefeDaten(JSON.parse(JSON.stringify(d)));
  assert.equal(r.gueltig, true);
  assert.deepEqual(r.daten.projekte[0].strickstuecke, []);
  const mitStueck = neuesStrickstueck(d, 'p9', 'Ohne Plan', 's9', ZEIT1, 'pr-1').daten;
  const r2 = pruefeDaten(JSON.parse(JSON.stringify(mitStueck)));
  assert.equal(r2.daten.projekte[0].strickstuecke[0].plan, null);
  assert.deepEqual(r2.daten.projekte[0].strickstuecke[0].eingeklappt, {});
});

// ================================================================ Datenschutz (Architektur Sprint 1, Abschnitt 7)

/** Alle ausgelieferten Quelldateien. */
function quelldateien(ordner = '.') {
  const aus = [];
  for (const name of readdirSync(join(WURZEL, ordner))) {
    if (['.git', 'node_modules', 'docs', 'tests', '.github'].includes(name)) continue;
    const pfad = ordner === '.' ? name : `${ordner}/${name}`;
    if (statSync(join(WURZEL, pfad)).isDirectory()) aus.push(...quelldateien(pfad));
    else if (/\.(html|css|js|webmanifest|svg)$/.test(name)) aus.push(pfad);
  }
  return aus;
}

test('Datenschutz: keine externen Adressen in ausgelieferten Dateien', () => {
  const erlaubt = [
    'http://www.w3.org/2000/svg',                     // SVG-Namensraum, kein Abruf
    'https://michawallburger-dev.github.io/maschenrechner/', // eigene Adresse in einem Kommentar
  ];
  for (const datei of quelldateien()) {
    const inhalt = readFileSync(join(WURZEL, datei), 'utf8');
    for (const treffer of inhalt.match(/https?:\/\/[^\s"'`)<>]+/g) ?? []) {
      assert.ok(erlaubt.some((e) => treffer.startsWith(e)), `${datei}: ${treffer}`);
    }
    assert.ok(!/@import/.test(inhalt), `${datei}: @import`);
    assert.ok(!/document\.cookie/.test(inhalt), `${datei}: Cookie`);
  }
});

test('Datenschutz: kein fetch auf fremde Adressen, kein XMLHttpRequest, kein sendBeacon', () => {
  for (const datei of quelldateien()) {
    const inhalt = readFileSync(join(WURZEL, datei), 'utf8');
    assert.ok(!/XMLHttpRequest|sendBeacon|navigator\.connection|new\s+WebSocket|EventSource/.test(inhalt), datei);
    // fetch gibt es nur im Service Worker, und nur für die eigene Herkunft
    if (datei !== 'sw.js') assert.ok(!/\bfetch\s*\(/.test(inhalt), `${datei}: fetch außerhalb von sw.js`);
  }
  const sw = readFileSync(join(WURZEL, 'sw.js'), 'utf8');
  assert.ok(sw.includes('url.origin !== self.location.origin'), 'sw.js prüft die Herkunft nicht');
});

test('Datenschutz: die Content Security Policy bleibt eng', () => {
  const html = readFileSync(join(WURZEL, 'index.html'), 'utf8');
  const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  for (const regel of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "connect-src 'self'", "base-uri 'none'", "form-action 'none'", "object-src 'none'"]) {
    assert.ok(csp.includes(regel), `CSP ohne ${regel}`);
  }
  assert.ok(!/unsafe-inline|unsafe-eval|\*/.test(csp), `CSP zu weit: ${csp}`);
  // Keine fremden Skripte oder Stile eingebunden
  for (const treffer of html.match(/(?:src|href)="([^"]+)"/g) ?? []) {
    assert.ok(/="\.\//.test(treffer) || /="#/.test(treffer), `externe Einbindung: ${treffer}`);
  }
});

// ================================================================ Offlinefähigkeit

test('Offline: Version 0.4.0 steht gleichlautend in package.json, sw.js und app.js', () => {
  const paket = JSON.parse(readFileSync(join(WURZEL, 'package.json'), 'utf8')).version;
  const sw = readFileSync(join(WURZEL, 'sw.js'), 'utf8');
  const app = readFileSync(join(WURZEL, 'js/app.js'), 'utf8');
  assert.equal(paket, '0.4.0');
  assert.ok(sw.includes("CACHE_NAME = 'maschenrechner-v0.4.0'"), 'CACHE_NAME nicht erhöht');
  assert.ok(app.includes("APP_VERSION = '0.4.0'"));
});

test('Offline: Sprint 4 hat keine neue Datei eingeführt, die in APP_DATEIEN fehlen könnte', () => {
  const sw = readFileSync(join(WURZEL, 'sw.js'), 'utf8');
  const liste = [...sw.match(/const APP_DATEIEN = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  for (const datei of quelldateien()) {
    if (datei === 'sw.js') continue;
    assert.ok(liste.includes(`./${datei}`), `fehlt in APP_DATEIEN: ${datei}`);
  }
  // Jedes Modul, das index.html oder ein anderes Modul lädt, ist abgedeckt
  assert.equal(liste.filter((e) => e.endsWith('.js')).length, quelldateien().filter((d) => d.endsWith('.js') && d !== 'sw.js').length);
});
