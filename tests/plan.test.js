// Tests für den Zu-/Abnahmeplan (US-13, US-16) – Architektur Sprint 3, Abschnitt 4.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { berechnePlan, verteile, erlaubteReihen, planAusTexten, planEingabenAusTexten, standardStartReihe, MAX_EREIGNISSE } from '../js/plan.js';

const PROBE = { maschen: { anzahl: 25, bezugCm: 10 }, reihen: { anzahl: 37, bezugCm: 10 } };
const REF = { anfangCm: 20, endCm: 34, laengeCm: 45, proEreignis: 2 };
const reihenVon = (r) => r.ereignisse.map((e) => e.reihe);

// ---------------------------------------------------------------- Referenzfall (Backlog „Referenzwerte für Sprint 3“)

test('Referenz: Grundwerte 50 → 85 M, 167 Reihen; Differenz 35 nicht teilbar → Auswahl', () => {
  const r = berechnePlan(REF, PROBE);
  assert.equal(r.anfang, 50);
  assert.equal(r.ende, 85);
  assert.equal(r.reihen, 167);
  assert.equal(r.status, 'auswahl');
  assert.equal(r.richtung, 'zu');
  assert.deepEqual(
    r.optionen.map((o) => [o.wahl, o.endMaschen, Number(o.endCm.toFixed(2)), o.ereignisse]),
    [['weniger', 84, 33.6, 17], ['mehr', 86, 34.4, 18]],
  );
  assert.equal(r.ereignisse, undefined, 'ohne Auswahl kein Plan');
});

test('Referenz: Wahl „weniger“ → 84 M, 17 Zunahmen, alle 9–10 Reihen', () => {
  const r = berechnePlan({ ...REF, ereignisWahl: 'weniger' }, PROBE);
  assert.equal(r.status, 'plan');
  assert.equal(r.ende, 84);
  assert.equal(r.gewaehlt, 'weniger');
  assert.deepEqual(reihenVon(r), [10, 19, 28, 37, 47, 56, 65, 74, 84, 93, 102, 111, 120, 130, 139, 148, 157]);
  assert.ok(r.ereignisse.every((e) => e.maschen === 2));
  assert.equal(r.abstandMin, 9);
  assert.equal(r.abstandMax, 10);
});

test('Referenz: Wahl „mehr“ → 86 M, 18 Zunahmen, alle 8–9 Reihen', () => {
  const r = berechnePlan({ ...REF, ereignisWahl: 'mehr' }, PROBE);
  assert.equal(r.ende, 86);
  assert.deepEqual(reihenVon(r), [9, 18, 27, 35, 44, 53, 62, 70, 79, 88, 97, 105, 114, 123, 132, 140, 149, 158]);
  assert.equal(r.abstandMin, 8);
  assert.equal(r.abstandMax, 9);
});

test('Referenz: „nur jede 2. Reihe“ mit 17 Zunahmen → nur ungerade Reihen', () => {
  const r = berechnePlan({ ...REF, ereignisWahl: 'weniger', jedeZweite: true }, PROBE);
  assert.deepEqual(reihenVon(r), [9, 19, 27, 37, 47, 55, 65, 73, 83, 93, 101, 111, 119, 129, 139, 147, 157]);
  assert.equal(r.abstandMin, 8);
  assert.equal(r.abstandMax, 10);
});

// ---------------------------------------------------------------- Richtung, Teilbarkeit, Anpassungen

test('Abnahme: Breiten vertauscht → Richtung „ab“, negative Maschenzahl', () => {
  const r = berechnePlan({ anfangCm: 34, endCm: 20, laengeCm: 45, proEreignis: 2, ereignisWahl: 'weniger' }, PROBE);
  assert.equal(r.richtung, 'ab');
  assert.equal(r.ende, 51); // 85 − 17·2
  assert.equal(r.ereignisse.length, 17);
  assert.ok(r.ereignisse.every((e) => e.maschen === -2));
});

test('Differenz 0 → keine Änderung, kein Plan', () => {
  const r = berechnePlan({ anfangCm: 20, endCm: 20, laengeCm: 45, proEreignis: 2 }, PROBE);
  assert.equal(r.status, 'keineAenderung');
  assert.equal(r.ereignisse, undefined);
});

test('Teilbare Differenz braucht keine Auswahl; eine gespeicherte Wahl wird ignoriert', () => {
  // 50 → 86 M = 36 = 18 × 2
  const r = berechnePlan({ anfangCm: 20, endCm: 34.4, laengeCm: 45, proEreignis: 2, ereignisWahl: 'weniger' }, PROBE);
  assert.equal(r.status, 'plan');
  assert.equal(r.ereignisse.length, 18);
  assert.equal(r.gewaehlt, null);
});

test('1 M pro Ereignis: jede Differenz ist teilbar', () => {
  const r = berechnePlan({ ...REF, proEreignis: 1 }, PROBE);
  assert.equal(r.status, 'plan');
  assert.equal(r.ereignisse.length, 35);
});

test('US-16: Anpassung der Endmaschen macht die Differenz teilbar (ersetzt die Auswahl)', () => {
  const r = berechnePlan({ ...REF, anpassung: { ende: 1 } }, PROBE);
  assert.equal(r.status, 'plan');
  assert.equal(r.ende, 86);
  assert.equal(r.ereignisse.length, 18);
});

test('US-16: Anpassungen von Anfang und Reihen; tatsächliche cm', () => {
  const r = berechnePlan({ ...REF, anpassung: { anfang: -2, reihen: 3 }, ereignisWahl: 'weniger' }, PROBE);
  assert.equal(r.anfang, 48);
  assert.equal(r.reihen, 170);
  assert.equal(r.anfangCm.toFixed(2), '19.20');
  assert.equal(r.laengeCm.toFixed(2), '45.95');
  // Differenz 37 → 18 (weniger) → Ende 84
  assert.equal(r.ende, 84);
  assert.equal(r.anfangGerundet, 50);
  assert.equal(r.reihenGerundet, 167);
});

test('US-16: Anpassung mit Ergebnis < 1 → Fehler mit Feld', () => {
  assert.deepEqual(
    ['anfang', 'ende', 'reihen'].map((feld) => berechnePlan({ ...REF, anpassung: { [feld]: -500 } }, PROBE)).map((r) => [r.status, r.fehler, r.feld]),
    [['fehler', 'ERGEBNIS_ZU_KLEIN', 'anfang'], ['fehler', 'ERGEBNIS_ZU_KLEIN', 'ende'], ['fehler', 'ERGEBNIS_ZU_KLEIN', 'reihen']],
  );
});

test('Abnahme: Option mit Endmaschen < 1 entfällt, „keine Abnahme“ bleibt (S3-01)', () => {
  // 3 M → 1 M: Differenz −2 bei 3 M pro Ereignis → „weniger“ = 0 Ereignisse (3 M), „mehr“ wäre 0 M
  const p = { maschen: { anzahl: 10, bezugCm: 10 }, reihen: { anzahl: 10, bezugCm: 10 } };
  const r = berechnePlan({ anfangCm: 3, endCm: 1, laengeCm: 10, proEreignis: 3 }, p);
  assert.equal(r.status, 'auswahl');
  assert.deepEqual(r.optionen.map((o) => [o.wahl, o.endMaschen, o.ereignisse]), [['weniger', 3, 0]]);
});

test('S3-01: Differenz kleiner als Maschen pro Ereignis → Optionen „keine Zunahme“ und 1 Zunahme', () => {
  // 50 → 53 M bei 4 M pro Ereignis
  const r = berechnePlan({ anfangCm: 20, endCm: 21, laengeCm: 45, proEreignis: 4 }, PROBE);
  assert.deepEqual(r.optionen.map((o) => [o.wahl, o.endMaschen, o.ereignisse]), [['weniger', 50, 0], ['mehr', 54, 1]]);
  const keine = berechnePlan({ anfangCm: 20, endCm: 21, laengeCm: 45, proEreignis: 4, ereignisWahl: 'weniger' }, PROBE);
  assert.equal(keine.status, 'keineAenderung');
  assert.equal(keine.ende, 50);
  assert.equal(keine.gewaehlt, 'weniger');
  assert.equal(keine.ereignisse, undefined, 'kein Plan');
});

test('S3-02: nach der Wahl bleiben die Optionen im Ergebnis; bei teilbarer Differenz keine', () => {
  const r = berechnePlan({ ...REF, ereignisWahl: 'mehr' }, PROBE);
  assert.equal(r.status, 'plan');
  assert.equal(r.gewaehlt, 'mehr');
  assert.deepEqual(r.optionen.map((o) => o.endMaschen), [84, 86]);
  assert.equal(berechnePlan({ ...REF, proEreignis: 1 }, PROBE).optionen, null);
});

// ---------------------------------------------------------------- Zu wenig Platz, zu viele Ereignisse

test('ZU_WENIG_REIHEN: 3 Reihen, 2 Ereignisse (nur Reihe 2 frei)', () => {
  const p = { maschen: { anzahl: 10, bezugCm: 10 }, reihen: { anzahl: 10, bezugCm: 10 } };
  const r = berechnePlan({ anfangCm: 2, endCm: 6, laengeCm: 3, proEreignis: 2 }, p);
  assert.equal(r.fehler, 'ZU_WENIG_REIHEN');
  assert.equal(r.moeglich, 1);
});

test('ZU_WENIG_REIHEN: „jede 2.“ mit 4 Reihen erlaubt nur Reihe 3', () => {
  const p = { maschen: { anzahl: 10, bezugCm: 10 }, reihen: { anzahl: 10, bezugCm: 10 } };
  const ok = berechnePlan({ anfangCm: 2, endCm: 4, laengeCm: 4, proEreignis: 2, jedeZweite: true }, p);
  assert.deepEqual(reihenVon(ok), [3]);
  const zuViel = berechnePlan({ anfangCm: 2, endCm: 6, laengeCm: 4, proEreignis: 2, jedeZweite: true }, p);
  assert.equal(zuViel.fehler, 'ZU_WENIG_REIHEN');
  assert.equal(zuViel.moeglich, 1);
});

test('ZU_VIELE_EREIGNISSE: 9999 erlaubt, 10 000 nicht', () => {
  // 2 M/cm: 0,5 cm = 1 M; 5000 cm = 10 000 M → 9999 Zunahmen zu je 1 M
  const p = { maschen: { anzahl: 20, bezugCm: 10 }, reihen: { anzahl: 100, bezugCm: 10 } };
  const grenze = berechnePlan({ anfangCm: 0.5, endCm: 5000, laengeCm: 9999, proEreignis: 1 }, p);
  assert.equal(grenze.status, 'plan');
  assert.equal(grenze.ereignisse.length, MAX_EREIGNISSE);
  const zuViel = berechnePlan({ anfangCm: 0.5, endCm: 5000.5, laengeCm: 9999, proEreignis: 1 }, p); // 10 000 Zunahmen
  assert.equal(zuViel.fehler, 'ZU_VIELE_EREIGNISSE');
});

test('Sehr lange Teile: Millionen Reihen ohne große Listen', () => {
  const p = { maschen: { anzahl: 10, bezugCm: 10 }, reihen: { anzahl: 999, bezugCm: 0.01 } };
  const r = berechnePlan({ anfangCm: 10, endCm: 20, laengeCm: 9999, proEreignis: 2 }, p);
  assert.equal(r.status, 'plan');
  assert.ok(r.reihen > 900_000_000);
  assert.equal(r.ereignisse.length, 5);
  assert.ok(r.ereignisse.every((e) => e.reihe > 1 && e.reihe < r.reihen));
});

// ---------------------------------------------------------------- Eigenschaftstests (Definition of Done)

test('Eigenschaften: Anzahl, keine Doppelten, Randreihen frei, „jede 2.“ ungerade ≥ 3, Abstände ±1/±2', () => {
  let faelle = 0;
  for (let reihen = 1; reihen <= 250; reihen++) {
    for (const jedeZweite of [false, true]) {
      const erlaubt = erlaubteReihen(reihen, jedeZweite);
      for (let e = 1; e <= erlaubt.anzahl; e++) {
        const liste = verteile(e, erlaubt.anzahl).map(erlaubt.reihe);
        faelle++;
        assert.equal(liste.length, e);
        assert.equal(new Set(liste).size, e, `doppelt bei R=${reihen} E=${e}`);
        for (let i = 0; i < liste.length; i++) {
          assert.ok(liste[i] >= 2 && liste[i] <= reihen - 1, `Randreihe bei R=${reihen} E=${e}`);
          if (i > 0) assert.ok(liste[i] > liste[i - 1], 'aufsteigend');
          if (jedeZweite) assert.ok(liste[i] % 2 === 1 && liste[i] >= 3, `gerade Reihe bei R=${reihen} E=${e}`);
        }
        if (liste.length > 1) {
          const abstaende = liste.slice(1).map((x, i) => x - liste[i]);
          assert.ok(Math.max(...abstaende) - Math.min(...abstaende) <= (jedeZweite ? 2 : 1), `Abstände bei R=${reihen} E=${e}`);
        }
      }
    }
  }
  assert.ok(faelle > 30000);
});

test('Eigenschaften: Summe der Maschen = Differenz; gleiche Eingaben → gleicher Plan', () => {
  for (let ende = 21; ende <= 60; ende += 0.7) {
    for (const pro of [1, 2, 3, 4]) {
      for (const wahl of ['weniger', 'mehr']) {
        const e = { anfangCm: 20, endCm: ende, laengeCm: 45, proEreignis: pro, ereignisWahl: wahl };
        const r = berechnePlan(e, PROBE);
        if (r.status !== 'plan') continue;
        assert.equal(r.ereignisse.reduce((s, x) => s + x.maschen, 0), r.ende - r.anfang);
        assert.deepEqual(berechnePlan(e, PROBE), r);
      }
    }
  }
});

test('erlaubteReihen: Randfälle', () => {
  assert.equal(erlaubteReihen(1, false).anzahl, 0);
  assert.equal(erlaubteReihen(2, false).anzahl, 0);
  assert.equal(erlaubteReihen(3, false).anzahl, 1);
  assert.equal(erlaubteReihen(3, true).anzahl, 0);
  assert.equal(erlaubteReihen(4, true).anzahl, 1);
  assert.equal(erlaubteReihen(5, true).anzahl, 1);
  assert.equal(erlaubteReihen(6, true).anzahl, 2);
});

// ---------------------------------------------------------------- Aus gespeicherten Texten

const TEXTE = {
  anfangBreite: '20', endBreite: '34', laenge: '45', maschenProEreignis: '2',
  arbeitsweise: 'runden', jedeZweite: false, ereignisWahl: 'weniger',
  anpassung: { anfang: '0', ende: '0', reihen: '0' },
};
const EIGEN = { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' };

test('planAusTexten: rechnet wie berechnePlan, Komma und Tausenderpunkt', () => {
  const r = planAusTexten({ ...TEXTE, laenge: '45,0' }, EIGEN, 'cm');
  assert.equal(r.status, 'plan');
  assert.equal(r.runden, true);
  assert.equal(r.ereignisse.length, 17);
});

test('planAusTexten: ungültige Eingaben oder Probe → null', () => {
  assert.equal(planAusTexten(null, EIGEN, 'cm'), null);
  assert.equal(planAusTexten({ ...TEXTE, laenge: '' }, EIGEN, 'cm'), null);
  assert.equal(planAusTexten({ ...TEXTE, maschenProEreignis: '0' }, EIGEN, 'cm'), null);
  assert.equal(planAusTexten({ ...TEXTE, maschenProEreignis: '1,5' }, EIGEN, 'cm'), null);
  assert.equal(planAusTexten({ ...TEXTE, anpassung: { anfang: 'x' } }, EIGEN, 'cm'), null);
  assert.equal(planAusTexten(TEXTE, { ...EIGEN, reihenAnzahl: '' }, 'cm'), null);
});

test('planEingabenAusTexten: leere Anpassung = 0', () => {
  const e = planEingabenAusTexten({ ...TEXTE, anpassung: {} }, 'cm');
  assert.deepEqual(e.anpassung, { anfang: 0, ende: 0, reihen: 0 });
});

// ---------------------------------------------------------------- Maschenzahl je Ereignis (US-37, Architektur Sprint 4, Abschnitt 4.2)

test('US-37 Referenz: 50 Anfangsmaschen, 17 Zunahmen → 52, 54 … 84', () => {
  const r = berechnePlan({ ...REF, ereignisWahl: 'weniger' }, PROBE);
  const danach = r.ereignisse.map((e) => e.maschenDanach);
  assert.equal(danach[0], 52);
  assert.equal(danach[1], 54);
  assert.equal(danach.at(-1), 84, 'nach dem letzten Ereignis genau die Endmaschenzahl');
  assert.deepEqual(danach, Array.from({ length: 17 }, (_, i) => 50 + 2 * (i + 1)));
});

test('US-37 Abnahme: Maschenzahl fällt und endet genau bei der Endmaschenzahl', () => {
  const r = berechnePlan({ anfangCm: 34, endCm: 20, laengeCm: 45, proEreignis: 2, ereignisWahl: 'weniger' }, PROBE);
  assert.equal(r.status, 'plan');
  assert.equal(r.richtung, 'ab');
  const danach = r.ereignisse.map((e) => e.maschenDanach);
  assert.equal(danach[0], r.anfang - 2);
  assert.equal(danach.at(-1), r.ende);
  for (let i = 1; i < danach.length; i++) assert.ok(danach[i] < danach[i - 1], 'streng fallend');
});

test('US-37 AK5: die Anpassung der Anfangsmaschen verschiebt alle Maschenzahlen', () => {
  const ohne = berechnePlan({ ...REF, ereignisWahl: 'weniger' }, PROBE);
  const mit = berechnePlan({ ...REF, ereignisWahl: 'weniger', anpassung: { anfang: 4 } }, PROBE);
  assert.equal(mit.anfang, ohne.anfang + 4);
  assert.equal(mit.ereignisse[0].maschenDanach, ohne.ereignisse[0].maschenDanach + 4);
  assert.equal(mit.ereignisse.at(-1).maschenDanach, mit.ende, 'Invariante gilt auch mit Anpassung');
});

test('US-37 Eigenschaften: letzte Maschenzahl = Endmaschenzahl, Folge streng monoton', () => {
  let faelle = 0;
  for (let ende = 5; ende <= 60; ende += 0.7) {
    for (const pro of [1, 2, 3, 5]) {
      for (const jedeZweite of [false, true]) {
        for (const wahl of ['weniger', 'mehr']) {
          const r = berechnePlan(
            { anfangCm: 20, endCm: ende, laengeCm: 45, proEreignis: pro, jedeZweite, ereignisWahl: wahl },
            PROBE,
          );
          if (r.status !== 'plan') continue;
          faelle++;
          const danach = r.ereignisse.map((e) => e.maschenDanach);
          assert.equal(danach.at(-1), r.ende, `Ende bei ende=${ende} pro=${pro}`);
          const auf = r.richtung === 'zu';
          for (let i = 0; i < danach.length; i++) {
            const vorher = i === 0 ? r.anfang : danach[i - 1];
            assert.equal(danach[i] - vorher, r.ereignisse[i].maschen, 'Schrittweite = Maschen des Ereignisses');
            assert.ok(auf ? danach[i] > vorher : danach[i] < vorher, 'streng monoton');
          }
          assert.ok(danach.every((m) => m >= 1), 'nie unter 1 Masche');
        }
      }
    }
  }
  assert.ok(faelle > 200, `zu wenige Fälle: ${faelle}`);
});

// ---------------------------------------------------------------- Startreihe (US-39, E31; Architektur Sprint 4, Abschnitt 4.1)

test('US-39 E31: leere Startreihe ergibt den Standard 2 bzw. 3', () => {
  assert.equal(standardStartReihe(false), 2);
  assert.equal(standardStartReihe(true), 3);
  assert.equal(erlaubteReihen(100, false, null).start, 2);
  assert.equal(erlaubteReihen(100, true, null).start, 3);
});

test('US-39 AK9 Regressionsschutz: ohne Startreihe rechnet erlaubteReihen wie in Sprint 3', () => {
  // Die Formeln aus Sprint 3, hier absichtlich noch einmal ausgeschrieben
  const altAnzahl = (reihen, jedeZweite) => {
    if (!jedeZweite) return Math.max(0, reihen - 2);
    const letzte = reihen - 1;
    return letzte >= 3 ? Math.floor((letzte - 3) / 2) + 1 : 0;
  };
  const altReihe = (jedeZweite) => (platz) => (jedeZweite ? 3 + 2 * platz : platz + 2);
  for (let reihen = 1; reihen <= 400; reihen++) {
    for (const jedeZweite of [false, true]) {
      const neu = erlaubteReihen(reihen, jedeZweite, null);
      assert.equal(neu.anzahl, altAnzahl(reihen, jedeZweite), `Anzahl bei R=${reihen} jz=${jedeZweite}`);
      for (let platz = 0; platz < neu.anzahl; platz++) {
        assert.equal(neu.reihe(platz), altReihe(jedeZweite)(platz), `Reihe bei R=${reihen} platz=${platz}`);
      }
    }
  }
});

test('US-39: eigene Startreihe verschiebt die erlaubten Reihen', () => {
  const a = erlaubteReihen(20, false, 5);
  assert.equal(a.anzahl, 15, 'Reihen 5 … 19');
  assert.equal(a.reihe(0), 5);
  assert.equal(a.reihe(14), 19);

  const b = erlaubteReihen(20, true, 4);
  assert.deepEqual(Array.from({ length: b.anzahl }, (_, i) => b.reihe(i)), [4, 6, 8, 10, 12, 14, 16, 18]);
});

test('US-39: Startreihe 1 erlaubt die erste Reihe, Startreihe ab „reihen“ keine', () => {
  assert.equal(erlaubteReihen(10, false, 1).reihe(0), 1);
  assert.equal(erlaubteReihen(10, false, 9).anzahl, 1, 'nur die vorletzte Reihe');
  assert.equal(erlaubteReihen(10, false, 10).anzahl, 0, 'die letzte Reihe bleibt frei');
  assert.equal(erlaubteReihen(10, false, 99).anzahl, 0);
  assert.equal(erlaubteReihen(10, true, 10).anzahl, 0);
});

test('US-39 AK4: mit „jede 2.“ und gerader Startreihe liegen alle Ereignisse auf geraden Reihen', () => {
  const r = berechnePlan({ ...REF, ereignisWahl: 'weniger', jedeZweite: true, startReihe: 4 }, PROBE);
  assert.equal(r.status, 'plan');
  assert.ok(r.ereignisse.every((e) => e.reihe % 2 === 0), 'Parität folgt der Wahl, nicht einer festen Regel');
  // Die Startreihe ist die früheste erlaubte Reihe, nicht die des ersten Ereignisses:
  // verteilt wird gleichmäßig über alle erlaubten Reihen.
  assert.ok(r.ereignisse.every((e) => e.reihe >= 4), 'kein Ereignis vor der Startreihe');
  assert.ok(r.ereignisse.at(-1).reihe <= r.reihen - 1, 'letzte Reihe bleibt frei');
});

test('US-39 AK3: zu große Startreihe → ZU_WENIG_REIHEN mit moeglich 0', () => {
  const r = berechnePlan({ ...REF, ereignisWahl: 'weniger', startReihe: 200 }, PROBE);
  assert.equal(r.status, 'fehler');
  assert.equal(r.fehler, 'ZU_WENIG_REIHEN');
  assert.equal(r.moeglich, 0);
});

test('US-39 AK9: der Referenzfall bleibt mit leerer Startreihe unverändert', () => {
  const ohneFeld = berechnePlan({ ...REF, ereignisWahl: 'weniger' }, PROBE);
  const mitLeer = berechnePlan({ ...REF, ereignisWahl: 'weniger', startReihe: null }, PROBE);
  assert.deepEqual(mitLeer, ohneFeld);
  assert.deepEqual(reihenVon(mitLeer), [10, 19, 28, 37, 47, 56, 65, 74, 84, 93, 102, 111, 120, 130, 139, 148, 157]);
  assert.equal(mitLeer.startReihe, null);
  assert.equal(mitLeer.startReiheWirksam, 2, 'die wirksame Reihe steht im Ergebnis');
});

test('US-39 AK7: planEingabenAusTexten liest die Startreihe; leer bedeutet automatisch', () => {
  const basis = { ...TEXTE, startReihe: '' };
  assert.equal(planEingabenAusTexten(basis, 'cm').startReihe, null, 'leer = automatisch');
  assert.equal(planEingabenAusTexten({ ...basis, startReihe: '7' }, 'cm').startReihe, 7);
  assert.equal(planEingabenAusTexten({ ...basis, startReihe: '1.000' }, 'cm').startReihe, 1000, 'Tausenderpunkt nach E13');
  assert.equal(planEingabenAusTexten({ ...basis, startReihe: '0' }, 'cm'), null, '0 ist ungültig');
  assert.equal(planEingabenAusTexten({ ...basis, startReihe: '2,5' }, 'cm'), null, 'keine Ganzzahl');
  // Ein Plan aus 0.3 kennt das Feld gar nicht – das muss sich wie leer verhalten
  const ohne = { ...TEXTE };
  delete ohne.startReihe;
  assert.equal(planEingabenAusTexten(ohne, 'cm').startReihe, null, 'fehlendes Feld = leeres Feld');
});
