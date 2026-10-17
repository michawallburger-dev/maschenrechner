// QA Sprint 3: unabhängige Akzeptanztests der Logik (US-32, US-13 … US-16, US-30, Datenübernahme).
// Prüft gegen eigene, unabhängig formulierte Erwartungen – nicht gegen die Implementierung selbst.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { berechnePlan, planAusTexten } from '../js/plan.js';
import { zaehlerDaten, waehleZiel, ereignisseUm } from '../js/ziel.js';
import { pruefeDaten, leereDaten, neuesProjekt, neueProbe, probeAendern, neuesStrickstueck, strickstueckAendern, ID_MUSTER } from '../js/modell.js';
import { vonSchema2 } from '../js/migration.js';
import { erzeugeSicherung, leseSicherung } from '../js/sicherung.js';
import { routeAus, hashFuer } from '../js/router.js';

// ---------------------------------------------------------------- Hilfen

/** Kaufmännisch gerundetes (x,5 → auf) exaktes Ergebnis von cm × anzahl ÷ bezug, alle Werte mit max. 2 Nachkommastellen. */
function exaktGerundet(cm, anzahl, bezug) {
  const z = (x) => BigInt(Math.round(x * 100));
  const zaehler = z(cm) * z(anzahl);
  const nenner = 100n * z(bezug);
  return Number((2n * zaehler + nenner) / (2n * nenner));
}

/** Kleiner, reproduzierbarer Zufallsgenerator (keine Abhängigkeiten). */
function zufall(saat) {
  let s = saat >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

// ---------------------------------------------------------------- US-13 AK2: Rundung der Grundwerte

test('US-13 AK2: Anfangs-, Endmaschen und Reihen exakt kaufmännisch gerundet (60 000 Fälle)', () => {
  const r = zufall(42);
  let faelle = 0;
  for (let i = 0; i < 60000; i++) {
    const anfang = Math.round(r() * 8000) / 100 + 0.5; // 0,50 … 80,50 cm
    const ende = Math.round(r() * 8000) / 100 + 0.5;
    const laenge = Math.round(r() * 9000) / 100 + 1;
    const m = Math.round(r() * 350) / 10 + 5; // 5,0 … 40,0 M
    const rr = Math.round(r() * 500) / 10 + 5;
    const bezug = [10, 7.5, 12.5, 4, 10.16][i % 5];
    const p = { maschen: { anzahl: m, bezugCm: bezug }, reihen: { anzahl: rr, bezugCm: bezug } };
    const e = berechnePlan({ anfangCm: anfang, endCm: ende, laengeCm: laenge, proEreignis: 1 }, p);
    assert.equal(e.anfangGerundet, exaktGerundet(anfang, m, bezug), `Anfang ${anfang} cm bei ${m}/${bezug}`);
    assert.equal(e.endGerundet, exaktGerundet(ende, m, bezug));
    assert.equal(e.reihenGerundet, exaktGerundet(laenge, rr, bezug));
    faelle++;
  }
  assert.equal(faelle, 60000);
});

test('US-13 AK2: x,5-Grenzfall 10,2 cm bei 25 M/10 cm → 26 M (wie Sprint 1)', () => {
  const e = berechnePlan({ anfangCm: 10.2, endCm: 10.2, laengeCm: 10, proEreignis: 2 }, { maschen: { anzahl: 25, bezugCm: 10 }, reihen: { anzahl: 37, bezugCm: 10 } });
  assert.equal(e.anfang, 26);
  assert.equal(e.status, 'keineAenderung');
});

// ---------------------------------------------------------------- US-13 AK3–AK7: Plan als Ganzes (zufällige Eingaben)

test('US-13: zufällige Pläne erfüllen alle AK (Summe, Richtung, Randreihen, Abstände, E25, Determinismus)', () => {
  const r = zufall(7);
  let plaene = 0;
  for (let i = 0; i < 20000; i++) {
    const p = { maschen: { anzahl: 10 + Math.floor(r() * 30), bezugCm: 10 }, reihen: { anzahl: 10 + Math.floor(r() * 40), bezugCm: 10 } };
    const e = {
      anfangCm: 5 + Math.floor(r() * 400) / 10,
      endCm: 5 + Math.floor(r() * 400) / 10,
      laengeCm: 1 + Math.floor(r() * 600) / 10,
      proEreignis: 1 + Math.floor(r() * 4),
      jedeZweite: r() < 0.5,
      runden: r() < 0.5,
      ereignisWahl: r() < 0.5 ? 'weniger' : 'mehr',
    };
    const plan = berechnePlan(e, p);
    assert.deepEqual(berechnePlan(e, p), plan, 'gleiche Eingaben → gleicher Plan');
    if (plan.status === 'keineAenderung') {
      assert.equal(plan.anfang, plan.ende);
      continue;
    }
    if (plan.status === 'fehler') {
      assert.equal(plan.fehler, 'ZU_WENIG_REIHEN');
      continue;
    }
    if (plan.status !== 'plan') continue;
    plaene++;
    const liste = plan.ereignisse;
    assert.equal(liste.reduce((s, x) => s + x.maschen, 0), plan.ende - plan.anfang, 'Summe = Differenz');
    assert.ok((plan.ende - plan.anfang) % e.proEreignis === 0);
    assert.ok(liste.every((x) => Math.abs(x.maschen) === e.proEreignis));
    assert.ok(liste.every((x) => Math.sign(x.maschen) === Math.sign(plan.ende - plan.anfang)), 'Richtung');
    assert.ok(liste.every((x) => x.reihe >= 2 && x.reihe <= plan.reihen - 1), 'erste und letzte Reihe frei (E24)');
    if (e.jedeZweite) assert.ok(liste.every((x) => x.reihe % 2 === 1 && x.reihe >= 3), 'ungerade ab 3 (E25)');
    if (liste.length > 1) {
      const g = liste.slice(1).map((x, k) => x.reihe - liste[k].reihe);
      assert.ok(Math.max(...g) - Math.min(...g) <= (e.jedeZweite ? 2 : 1), 'Abstände');
      assert.ok(Math.min(...g) >= (e.jedeZweite ? 2 : 1));
    }
    // Ausgewählte Endmaschenzahl liegt höchstens einen Schritt neben der berechneten (AK4)
    assert.ok(Math.abs(plan.ende - plan.endGerundet) < e.proEreignis);
  }
  assert.ok(plaene > 5000, `zu wenige gültige Pläne geprüft (${plaene})`);
});

test('US-13 AK4: beide Optionen liegen auf verschiedenen Seiten der berechneten Endmaschenzahl', () => {
  const p = { maschen: { anzahl: 25, bezugCm: 10 }, reihen: { anzahl: 37, bezugCm: 10 } };
  for (let pro = 2; pro <= 5; pro++) {
    for (let endeCm = 21; endeCm < 40; endeCm += 0.4) {
      const r = berechnePlan({ anfangCm: 20, endCm: endeCm, laengeCm: 45, proEreignis: pro }, p);
      if (r.status !== 'auswahl') continue;
      // Befund S3-01: Ist die Differenz kleiner als die Maschen pro Ereignis, fehlt die Option „weniger“
      // (sie hätte 0 Ereignisse). Diese Fälle prüft der Test unten gesondert.
      if (r.optionen.length < 2) continue;
      const [weniger, mehr] = r.optionen;
      assert.ok(weniger.endMaschen < r.ende && mehr.endMaschen > r.ende, `bei ${endeCm} cm, ${pro} M`);
      assert.equal(mehr.ereignisse - weniger.ereignisse, 1);
    }
  }
});

test('US-13 AK7: Grenzfall genau so viele Ereignisse wie erlaubte Reihen → jede erlaubte Reihe belegt', () => {
  const p = { maschen: { anzahl: 10, bezugCm: 10 }, reihen: { anzahl: 10, bezugCm: 10 } };
  // 12 Reihen → 10 erlaubte (2 … 11); 10 Zunahmen zu 1 M
  const r = berechnePlan({ anfangCm: 10, endCm: 20, laengeCm: 12, proEreignis: 1 }, p);
  assert.deepEqual(r.ereignisse.map((e) => e.reihe), [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  const zuViel = berechnePlan({ anfangCm: 10, endCm: 21, laengeCm: 12, proEreignis: 1 }, p);
  assert.deepEqual([zuViel.fehler, zuViel.moeglich], ['ZU_WENIG_REIHEN', 10]);
});

test('US-13 AK1: Eingaberegeln – Komma, Punkt, Tausenderpunkt nur in ganzen Zahlen (E13)', () => {
  const eigen = { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' };
  const plan = (felder) => planAusTexten({ anfangBreite: '20', endBreite: '34', laenge: '45', maschenProEreignis: '2', arbeitsweise: 'reihen', jedeZweite: false, ereignisWahl: 'weniger', anpassung: { anfang: '0', ende: '0', reihen: '0' }, ...felder }, eigen, 'cm');
  assert.equal(plan({ laenge: '45,0' }).reihen, 167);
  assert.equal(plan({ laenge: '45.0' }).reihen, 167);
  assert.equal(plan({ laenge: '1.000' }).reihen, 4, '„1.000“ in cm-Feld ist 1,0 cm');
  assert.equal(plan({ maschenProEreignis: '1.000' }), null, '„1.000“ M pro Ereignis = 1000 > 99');
  assert.equal(plan({ anfangBreite: '-5' }), null);
  assert.equal(plan({ anfangBreite: '0' }), null);
  assert.equal(plan({ anpassung: { anfang: '−2' } }).anfang, 48, 'typografisches Minus');
});

// ---------------------------------------------------------------- US-15: Ereignisse rund um die Reihe

test('US-15: ereignisseUm stimmt mit einer einfachen Suche überein (zufällige Listen)', () => {
  const r = zufall(99);
  for (let i = 0; i < 3000; i++) {
    const reihen = [...new Set(Array.from({ length: Math.floor(r() * 12) }, () => 1 + Math.floor(r() * 60)))].sort((a, b) => a - b);
    const liste = reihen.map((reihe) => ({ reihe, maschen: -2 }));
    const n = Math.floor(r() * 70);
    const u = ereignisseUm(liste, n);
    const vor = liste.filter((e) => e.reihe < n);
    const nach = liste.filter((e) => e.reihe > n);
    assert.deepEqual(u.letzte, vor.at(-1) ?? null);
    assert.deepEqual(u.jetzt, liste.find((e) => e.reihe === n) ?? null);
    assert.deepEqual(u.naechste, nach[0] ?? null);
    assert.deepEqual(u.uebernaechste, nach[1] ?? null);
  }
});

// ---------------------------------------------------------------- US-30: Ziel

const PROBE = {
  anleitung: { maschenAnzahl: '34', maschenBezug: '10', reihenAnzahl: '52', reihenBezug: '10' },
  eigen: { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' },
};
const RECHNER = (laenge, anleitung) => ({
  maschenAusAnleitung: { eingabe: '', anpassung: '0' },
  reihenAusAnleitung: { eingabe: anleitung, anpassung: '0' },
  breiteZuMaschen: { eingabe: '', anpassung: '0' },
  laengeZuReihen: { eingabe: laenge, anpassung: '0' },
});

test('US-30 AK2/AK7: Ziel = „Deine Reihen“ der Quelle; nur eine gültig → diese', () => {
  for (const [laenge, anleitung, erwartet] of [['13,5', '', ['laengeZuReihen', 50]], ['', '55', ['reihenAusAnleitung', 39]], ['', '', null]]) {
    const d = zaehlerDaten({ rechner: RECHNER(laenge, anleitung), plan: null }, PROBE, 'cm');
    const { ziel, auswahlAnzeigen } = waehleZiel(d.quellen, null);
    assert.deepEqual(ziel ? [ziel.quelle, ziel.reihen] : null, erwartet);
    assert.equal(auswahlAnzeigen, false);
  }
});

test('US-30 AK7: gewählte Quelle wird ungültig → automatisch eine andere gültige', () => {
  const beide = zaehlerDaten({ rechner: RECHNER('13,5', '55'), plan: null }, PROBE, 'cm');
  assert.equal(waehleZiel(beide.quellen, 'reihenAusAnleitung').ziel.reihen, 39);
  const nurLaenge = zaehlerDaten({ rechner: RECHNER('13,5', 'abc'), plan: null }, PROBE, 'cm');
  assert.equal(waehleZiel(nurLaenge.quellen, 'reihenAusAnleitung').ziel.quelle, 'laengeZuReihen');
});

test('US-30 AK3: gestrickte Länge rechnet mit der eigenen Probe des Strickstücks (nicht mit der Anleitung)', () => {
  const d = zaehlerDaten({ rechner: RECHNER('', ''), plan: null }, PROBE, 'cm');
  assert.deepEqual(d.probeReihen, { anzahl: 37, bezugCm: 10 });
});

// ---------------------------------------------------------------- US-32: Proben und Daten

test('US-32: Proben-IDs aus der App sind nie doppelt und bleiben über Sicherung und Prüfung stabil', () => {
  let d = neuesProjekt(leereDaten(), { name: 'P' }, 'p1', '2026-10-17T10:00:00.000Z').daten;
  for (let i = 2; i <= 6; i++) d = neueProbe(d, 'p1', `pr-${i}`, '2026-10-17T10:00:00.000Z').daten;
  d = probeAendern(d, 'p1', 'pr-4', { name: 'Ärmel' }, '2026-10-17T10:00:00.000Z').daten;
  d = neuesStrickstueck(d, 'p1', 'A', 's1', '2026-10-17T10:00:00.000Z', 'pr-4').daten;
  const ids = d.projekte[0].proben.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  const r = leseSicherung(erzeugeSicherung(d, new Date(), '0.3.0').inhalt);
  assert.deepEqual(r.daten, d);
});

test('Fuzz: pruefeDaten ist idempotent, IDs sind erreichbar, jede Zuordnung zeigt auf eine Probe', () => {
  const r = zufall(2026);
  const wahl = (liste) => liste[Math.floor(r() * liste.length)];
  const werte = [null, undefined, 1, -3, 'x', '', 'pr-1', 'mein projekt', ' ', [], {}, true, 'p-ok', 'ä', 'x'.repeat(70), '20'];
  for (let i = 0; i < 1500; i++) {
    const roh = {
      schemaVersion: 3,
      einstellungen: wahl([null, { farbschema: 'dunkel' }, 'x']),
      projekte: Array.from({ length: Math.floor(r() * 4) }, () => ({
        id: wahl(werte),
        name: wahl(werte),
        proben: wahl([undefined, [], Array.from({ length: Math.floor(r() * 3) }, () => ({ id: wahl(werte), name: wahl(werte), eigen: wahl([{}, null, { maschenAnzahl: wahl(werte) }]) }))]),
        strickstuecke: Array.from({ length: Math.floor(r() * 4) }, () => ({
          id: wahl(werte), name: wahl(werte), probeId: wahl(werte), zaehler: wahl([5, -1, 1e9, 'x', null]),
          plan: wahl([null, 'x', {}, { laenge: wahl(werte), arbeitsweise: wahl(werte), anpassung: wahl([null, { ende: wahl(werte) }]) }]),
          zielQuelle: wahl(['plan', 'x', null, 'laengeZuReihen']),
        })),
      })),
    };
    const a = pruefeDaten(roh);
    assert.equal(a.gueltig, true);
    assert.deepEqual(pruefeDaten(structuredClone(a.daten)).daten, a.daten, 'idempotent');
    for (const p of a.daten.projekte) {
      assert.match(p.id, ID_MUSTER);
      assert.ok(p.proben.length >= 1);
      assert.equal(new Set(p.proben.map((x) => x.id)).size, p.proben.length);
      for (const s of p.strickstuecke) {
        assert.match(s.id, ID_MUSTER);
        assert.ok(p.proben.some((x) => x.id === s.probeId), 'Zuordnung zeigt auf eine Probe');
        assert.equal(routeAus(hashFuer({ ansicht: 'zaehlen', projektId: p.id, stueckId: s.id })).ansicht, 'zaehlen');
      }
    }
  }
});

test('US-32 AK9: Sicherung aus 0.2 → einlesen → neu sichern → einlesen ergibt dieselben Daten', () => {
  const v2 = {
    schemaVersion: 2,
    projekte: [{ id: 'p1', name: 'Alt', nadelstaerkeMm: '4', probeAnleitung: { maschenAnzahl: '34' }, probeEigen: { maschenAnzahl: '25' }, strickstuecke: [{ id: 's1', name: 'Teil', zaehler: 7 }] }],
  };
  const erst = leseSicherung(JSON.stringify({ app: 'maschenrechner', format: 1, daten: v2 }));
  const zweit = leseSicherung(erzeugeSicherung(erst.daten, new Date(), '0.3.0').inhalt);
  assert.deepEqual(zweit.daten, erst.daten);
  assert.deepEqual(vonSchema2(v2), erst.daten);
});

test('US-14 AK2/AK4: Plan bleibt nach Speichern erhalten und liefert dem Zähler Ereignisse', () => {
  let d = neuesProjekt(leereDaten(), { name: 'P' }, 'p1', '2026-10-17T10:00:00.000Z').daten;
  d = probeAendern(d, 'p1', 'pr-1', { eigen: { maschenAnzahl: '25', reihenAnzahl: '37' } }, '2026-10-17T10:00:00.000Z').daten;
  d = neuesStrickstueck(d, 'p1', 'Ärmel', 's1', '2026-10-17T10:00:00.000Z').daten;
  d = strickstueckAendern(d, 'p1', 's1', { plan: { anfangBreite: '20', endBreite: '34', laenge: '45', ereignisWahl: 'weniger' } }, '2026-10-17T10:00:00.000Z').daten;
  const geladen = pruefeDaten(JSON.parse(JSON.stringify(d))).daten;
  const projekt = geladen.projekte[0];
  const z = zaehlerDaten(projekt.strickstuecke[0], projekt.proben[0], 'cm');
  assert.equal(z.plan.ereignisse.length, 17);
  assert.equal(z.quellen[0].quelle, 'plan');
  assert.equal(z.quellen[0].reihen, 167);
});

test('Befund S3-01: Differenz kleiner als Maschen pro Ereignis → nur eine Option („mehr“)', () => {
  const p = { maschen: { anzahl: 25, bezugCm: 10 }, reihen: { anzahl: 37, bezugCm: 10 } };
  // 50 → 53 M bei 4 M pro Ereignis: angeboten wird nur 54 M (1 Zunahme), nicht „keine Zunahme“
  const r = berechnePlan({ anfangCm: 20, endCm: 21, laengeCm: 45, proEreignis: 4 }, p);
  assert.equal(r.status, 'auswahl');
  assert.deepEqual(r.optionen.map((o) => [o.wahl, o.endMaschen]), [['mehr', 54]]);
});
