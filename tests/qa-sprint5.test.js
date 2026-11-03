/**
 * QA Sprint 5 – unabhängige Prüfung von 0.5.0 („Englisch und Zoll“).
 *
 * Geprüft wird gegen `docs/architektur/sprint-5-architektur.md` v5.2
 * (Abschnitt 9 nennt 25 Pflichtprüfungen) und gegen die Stories MAS-28 (US-24),
 * MAS-74 (US-41) und MAS-27 (US-23).
 *
 * Hier steht nur, was ohne Browser prüfbar ist: Rechenwege, Texte, Struktur der
 * ausgelieferten Dateien. Die im Browser gemessenen Werte (360 × 640 px, leere
 * Rasterzelle der zweispaltigen Auswahlgruppen, Höhe der Zähleransicht) stehen
 * in `docs/qa/sprint-5-testbericht.md`.
 *
 * Offene Befunde sind als `todo` festgehalten, wie seit Sprint 4 üblich.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

import { SPRACHEN, text, localeFuer, STANDARD_SPRACHE } from '../js/texte.js';
import { zuCm, vonCm, standardBezug, umrechneWert, LAENGENEINHEITEN } from '../js/einheiten.js';
import { parseZahl, pruefeZahl } from '../js/eingabe.js';
import { formatZahl, formatBruch, formatLaenge, formatLaengeAbweichung, LEER_ANZEIGE } from '../js/format.js';
import { planAusTexten } from '../js/plan.js';
import { runden } from '../js/rechner.js';
import {
  einheitUmstellen,
  darstellungFuer,
  bereinigeEinstellungen,
  pruefeDaten,
  leereDaten,
  leereProbe,
  GRENZEN,
} from '../js/modell.js';

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const lies = (pfad) => readFileSync(join(WURZEL, pfad), 'utf8');
const DE = 'de-DE';
const EN = 'en-US';

// ================================================================ Testdaten (erfunden)

const PROBE_CM = { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' };
const PLAN_CM = {
  anfangBreite: '20',
  endBreite: '34',
  laenge: '45',
  maschenProEreignis: '2',
  startReihe: '',
  arbeitsweise: 'reihen',
  jedeZweite: false,
  ereignisWahl: null,
  anpassung: { anfang: '0', ende: '0', reihen: '0' },
};

/** Vollständige Daten in Schema 3 mit allem, was eine Länge enthält. */
function daten(einheit = 'cm', probe = PROBE_CM, plan = PLAN_CM) {
  return {
    schemaVersion: 3,
    einstellungen: { sprache: 'de', laengeneinheit: einheit, farbschema: 'system', laengenDarstellung: 'auto' },
    hinweise: { projektlisteErklaert: true, wachhaltenNichtMoeglich: false },
    projekte: [
      {
        id: 'p1',
        name: 'Testprojekt',
        beschreibung: '',
        garn: 'Testgarn',
        erstellt: '2026-01-01T10:00:00.000Z',
        geaendert: '2026-01-02T10:00:00.000Z',
        proben: [
          {
            id: 'pr-1',
            name: 'Probe 1',
            nadelstaerkeMm: '4,5',
            anleitung: { maschenAnzahl: '22', maschenBezug: '10', reihenAnzahl: '30', reihenBezug: '10' },
            eigen: { ...probe },
          },
        ],
        strickstuecke: [
          {
            id: 's1',
            name: 'Vorderteil',
            erstellt: '2026-01-01T10:00:00.000Z',
            geaendert: '2026-01-02T10:00:00.000Z',
            probeId: 'pr-1',
            rechner: {
              maschenAusAnleitung: { eingabe: '84', anpassung: '0' },
              reihenAusAnleitung: { eingabe: '120', anpassung: '-1' },
              breiteZuMaschen: { eingabe: '20', anpassung: '0' },
              laengeZuReihen: { eingabe: '45', anpassung: '2' },
            },
            zaehler: 39,
            zielQuelle: 'plan',
            plan: { ...plan, anpassung: { ...plan.anpassung } },
            eingeklappt: { plan: true },
          },
        ],
      },
    ],
  };
}

/** Alle Blattwerte eines Objekts als Pfad → Wert. */
function blaetter(wert, pfad = '', raus = new Map()) {
  if (wert !== null && typeof wert === 'object') {
    for (const [k, v] of Object.entries(wert)) blaetter(v, pfad ? `${pfad}.${k}` : k, raus);
  } else {
    raus.set(pfad, wert);
  }
  return raus;
}

/** Pfade, deren Wert sich geändert hat (inklusive neuer und weggefallener). */
function geaendertePfade(vorher, nachher) {
  const a = blaetter(vorher);
  const b = blaetter(nachher);
  const alle = new Set([...a.keys(), ...b.keys()]);
  return [...alle].filter((p) => !Object.is(a.get(p), b.get(p))).sort();
}

// ================================================================ 1. Regression: der Referenzfall aus Sprint 3

test('AK/Regression: Referenzfall in cm rechnet unverändert wie 0.4.0', () => {
  const r = planAusTexten(PLAN_CM, PROBE_CM, 'cm');
  assert.equal(r.anfang, 50, '20 cm bei 25 M auf 10 cm');
  assert.equal(r.endGerundet, 85, '34 cm bei 25 M auf 10 cm');
  assert.equal(r.reihen, 167, '45 cm bei 37 R auf 10 cm (166,5 → 167)');
  assert.equal(r.status, 'auswahl', '35 M Differenz sind nicht durch 2 teilbar');
  assert.deepEqual(r.optionen.map((o) => o.endMaschen), [84, 86], 'Auswahl 84/86 M');
});

test('AK/Regression: derselbe Fall in Zoll liefert dieselben Zahlen (US-24 AK5)', () => {
  const inDaten = einheitUmstellen(daten('cm'), 'in');
  const stueck = inDaten.projekte[0].strickstuecke[0];
  const probe = inDaten.projekte[0].proben[0].eigen;

  assert.equal(probe.maschenBezug, '3.937');
  assert.equal(stueck.plan.laenge, '17.717');

  const r = planAusTexten(stueck.plan, probe, 'in');
  assert.equal(r.anfang, 50);
  assert.equal(r.endGerundet, 85);
  assert.equal(r.reihen, 167, 'die Reihenzahl darf sich durch den Wechsel nicht verschieben');
  assert.deepEqual(r.optionen.map((o) => o.endMaschen), [84, 86]);
});

test('AK/Regression: der Weg zurück nach cm ist exakt (H5)', () => {
  const hin = einheitUmstellen(daten('cm'), 'in');
  const zurueck = einheitUmstellen(hin, 'cm');
  assert.deepEqual(zurueck.projekte[0].proben[0].eigen, PROBE_CM);
  assert.deepEqual(zurueck.projekte[0].strickstuecke[0].plan, daten('cm').projekte[0].strickstuecke[0].plan);
  assert.equal(zurueck.projekte[0].strickstuecke[0].rechner.laengeZuReihen.eingabe, '45');
});

test('plan.js und ziel.js kennen weder format.js noch die Darstellung (US-41 AK6, R7)', () => {
  for (const datei of ['js/plan.js', 'js/ziel.js', 'js/rechner.js', 'js/zaehler.js']) {
    const quelle = lies(datei);
    assert.ok(!/from '\.\/format\.js'/.test(quelle), `${datei} darf format.js nicht einbinden`);
    assert.ok(!/darstellung|formatBruch/i.test(quelle), `${datei} darf die Darstellung nicht kennen`);
  }
});

// ================================================================ 2. Nachstellung von Hinweis H5 (Nachkommastellen)

/** Umrechnung wie `umrechneWert`, aber mit frei wählbarer Stellenzahl. */
function umMitStellen(text, stellen) {
  const wert = parseZahl(text);
  if (wert === null) return text;
  const fest = (wert / 2.54).toFixed(stellen);
  return fest.includes('.') ? fest.replace(/0+$/, '').replace(/\.$/, '') : fest;
}

function reihenNachWechsel(bezugCm, anzahl, laengeCm, stellen) {
  const bezugIn = Number(umMitStellen(String(bezugCm), stellen));
  const laengeIn = Number(umMitStellen(String(laengeCm), stellen));
  return runden((zuCm(laengeIn, 'in') * anzahl) / zuCm(bezugIn, 'in'));
}

test('H5 stimmt: mit zwei Stellen ergibt der Referenzfall 166, mit drei 167', () => {
  assert.equal(runden((45 * 37) / 10), 167, 'Ausgangswert in cm');
  assert.equal(reihenNachWechsel(10, 37, 45, 2), 166, 'zwei Stellen verschieben die Reihenzahl');
  assert.equal(reihenNachWechsel(10, 37, 45, 3), 167, 'drei Stellen halten sie');
  assert.equal(LAENGENEINHEITEN.in.stellen, 3, 'der Code setzt die drei Stellen auch wirklich');
  assert.equal(LAENGENEINHEITEN.cm.stellen, 2);
});

test('H5 im Praxisbereich: drei Stellen verschieben keine Reihenzahl, zwei schon', () => {
  let mitZwei = 0;
  let mitDrei = 0;
  let kippfaelle = 0;
  for (let anzahl = 15; anzahl <= 60; anzahl++) {
    for (let zehntel = 50; zehntel <= 1200; zehntel += 5) {
      const laengeCm = zehntel / 10;
      const genau = (laengeCm * anzahl) / 10;
      const soll = runden(genau);
      // Fälle, die in cm genau auf x,5 liegen, entscheidet jede Störung neu –
      // das ist eine Eigenschaft des Rundens, keine der Einheit.
      const aufDerKante = Math.abs(genau - Math.floor(genau) - 0.5) < 1e-9;
      if (reihenNachWechsel(10, anzahl, laengeCm, 2) !== soll) mitZwei++;
      if (reihenNachWechsel(10, anzahl, laengeCm, 3) !== soll) (aufDerKante ? kippfaelle++ : mitDrei++);
    }
  }
  assert.equal(mitDrei, 0, 'mit drei Stellen verschiebt sich außerhalb der Kippfälle nichts');
  assert.ok(mitZwei > 1000, `mit zwei Stellen verschieben sich viele Fälle (gemessen: ${mitZwei})`);
  assert.ok(kippfaelle > 0, `Kippfälle bleiben auch mit drei Stellen (gemessen: ${kippfaelle})`);
});

test('H5: der Rückweg ist mit drei Stellen für alle Zehntel exakt, mit zwei nicht', () => {
  let ungenau2 = 0;
  for (let zehntel = 1; zehntel <= 2000; zehntel++) {
    const cm = String(zehntel / 10);
    assert.equal(umrechneWert(umrechneWert(cm, 'cm', 'in'), 'in', 'cm'), cm, `Rückweg ${cm}`);
    if (Number((Number(umMitStellen(cm, 2)) * 2.54).toFixed(2)) !== Number(cm)) ungenau2++;
  }
  assert.ok(ungenau2 > 1000, `mit zwei Stellen wäre der Rückweg oft ungenau (gemessen: ${ungenau2})`);
});

// ================================================================ 3. Umstellen der Einheit (Architektur 4.2)

test('US-24 AK4: genau die Felder aus Abschnitt 4.2 ändern sich – kein Feld mehr, keins weniger', () => {
  const vorher = daten('cm');
  const nachher = einheitUmstellen(vorher, 'in');
  assert.deepEqual(geaendertePfade(vorher, nachher), [
    'einstellungen.laengeneinheit',
    'projekte.0.proben.0.anleitung.maschenBezug',
    'projekte.0.proben.0.anleitung.reihenBezug',
    'projekte.0.proben.0.eigen.maschenBezug',
    'projekte.0.proben.0.eigen.reihenBezug',
    'projekte.0.strickstuecke.0.plan.anfangBreite',
    'projekte.0.strickstuecke.0.plan.endBreite',
    'projekte.0.strickstuecke.0.plan.laenge',
    'projekte.0.strickstuecke.0.rechner.breiteZuMaschen.eingabe',
    'projekte.0.strickstuecke.0.rechner.laengeZuReihen.eingabe',
  ]);
});

test('US-24: Stückzahlen, Nadelstärke, Reihennummern, Anpassungen und Zähler bleiben', () => {
  const n = einheitUmstellen(daten('cm'), 'in');
  const stueck = n.projekte[0].strickstuecke[0];
  const probe = n.projekte[0].proben[0];
  assert.equal(probe.nadelstaerkeMm, '4,5', 'Nadelstärke bleibt mm und unverändert (E35)');
  assert.equal(probe.eigen.maschenAnzahl, '25');
  assert.equal(probe.eigen.reihenAnzahl, '37');
  assert.equal(stueck.rechner.maschenAusAnleitung.eingabe, '84');
  assert.equal(stueck.rechner.reihenAusAnleitung.eingabe, '120');
  assert.equal(stueck.rechner.reihenAusAnleitung.anpassung, '-1');
  assert.equal(stueck.rechner.laengeZuReihen.anpassung, '2');
  assert.equal(stueck.plan.maschenProEreignis, '2');
  assert.equal(stueck.plan.startReihe, '');
  assert.deepEqual(stueck.plan.anpassung, { anfang: '0', ende: '0', reihen: '0' });
  assert.equal(stueck.zaehler, 39);
  assert.equal(stueck.zielQuelle, 'plan');
  assert.deepEqual(stueck.eingeklappt, { plan: true });
  assert.equal(n.projekte[0].geaendert, '2026-01-02T10:00:00.000Z', 'kein Umsortieren der Projektliste');
});

test('US-24: einheitUmstellen ist seiteneffektfrei (R20)', () => {
  const vorher = daten('cm');
  const abzug = JSON.parse(JSON.stringify(vorher));
  einheitUmstellen(vorher, 'in');
  assert.deepEqual(vorher, abzug);
});

test('US-24: unbekannte oder gleiche Einheit lässt die Daten unberührt', () => {
  const d = daten('cm');
  assert.equal(einheitUmstellen(d, 'cm'), d);
  assert.equal(einheitUmstellen(d, 'yard'), d);
  assert.equal(einheitUmstellen(d, ''), d);
  assert.equal(einheitUmstellen(d, null), d);
});

test('US-24: leere, halb getippte und ungültige Eingaben bleiben unverändert stehen', () => {
  const kaputt = daten('cm');
  const stueck = kaputt.projekte[0].strickstuecke[0];
  stueck.rechner.breiteZuMaschen.eingabe = '12,';
  stueck.rechner.laengeZuReihen.eingabe = '';
  stueck.plan.anfangBreite = 'abc';
  stueck.plan.endBreite = '-';
  const n = einheitUmstellen(kaputt, 'in').projekte[0].strickstuecke[0];
  assert.equal(n.rechner.breiteZuMaschen.eingabe, '12,');
  assert.equal(n.rechner.laengeZuReihen.eingabe, '');
  assert.equal(n.plan.anfangBreite, 'abc');
  assert.equal(n.plan.endBreite, '-');
});

test('US-24 AK3: eine noch leere Probe bekommt das Standardmaß der neuen Einheit', () => {
  const d = daten('cm');
  d.projekte[0].proben[0].eigen = leereProbe('cm');
  const n = einheitUmstellen(d, 'in').projekte[0].proben[0].eigen;
  assert.equal(n.maschenBezug, '4');
  assert.equal(n.reihenBezug, '4');
  assert.equal(String(standardBezug('in')), '4');
});

test('US-24: Strickstück ohne Plan, Projekt ohne Strickstück, leere Projektliste', () => {
  const ohnePlan = daten('cm');
  ohnePlan.projekte[0].strickstuecke[0].plan = null;
  assert.equal(einheitUmstellen(ohnePlan, 'in').projekte[0].strickstuecke[0].plan, null);

  const ohneStueck = daten('cm');
  ohneStueck.projekte[0].strickstuecke = [];
  assert.deepEqual(einheitUmstellen(ohneStueck, 'in').projekte[0].strickstuecke, []);

  assert.deepEqual(einheitUmstellen(leereDaten(), 'in').projekte, []);
});

test('US-24: mehrere Projekte, Proben und Strickstücke werden vollständig erfasst', () => {
  const d = daten('cm');
  d.projekte.push(JSON.parse(JSON.stringify({ ...d.projekte[0], id: 'p2' })));
  d.projekte[1].proben.push({ ...JSON.parse(JSON.stringify(d.projekte[1].proben[0])), id: 'pr-2' });
  const n = einheitUmstellen(d, 'in');
  for (const projekt of n.projekte) {
    for (const probe of projekt.proben) {
      assert.equal(probe.eigen.maschenBezug, '3.937');
      assert.equal(probe.anleitung.reihenBezug, '3.937');
    }
    for (const stueck of projekt.strickstuecke) assert.equal(stueck.plan.laenge, '17.717');
  }
});

test('US-24: reparierte (beschädigte) Daten lassen sich umstellen, ohne zu werfen', () => {
  const kaputt = {
    schemaVersion: 3,
    einstellungen: { laengeneinheit: 'cm' },
    projekte: [
      { id: 'p1', proben: [{ id: 'pr-1' }], strickstuecke: [{ id: 's1', plan: 'kaputt', rechner: 42 }] },
      { id: 'p2' },
      'gar kein Objekt',
    ],
  };
  const geprueft = pruefeDaten(kaputt);
  assert.equal(geprueft.gueltig, true);
  const n = einheitUmstellen(geprueft.daten, 'in');
  assert.equal(n.einstellungen.laengeneinheit, 'in');
  assert.equal(n.projekte[0].proben[0].eigen.maschenBezug, '4', 'leere Probe → Standardmaß');
});

// ================================================================ 4. umrechneWert: Randfälle

test('umrechneWert: Randfälle bleiben unverändert oder sind nachvollziehbar', () => {
  for (const roh of ['', '   ', 'abc', '12,', '12.', '-', '+', '1,2,3', '1e3', '½']) {
    assert.equal(umrechneWert(roh, 'cm', 'in'), roh, `unverändert: ${JSON.stringify(roh)}`);
  }
  assert.equal(umrechneWert('0', 'cm', 'in'), '0');
  assert.equal(umrechneWert('10,16', 'cm', 'in'), '4', 'Komma wird gelesen');
  assert.equal(umrechneWert('10.16', 'cm', 'in'), '4');
  assert.equal(umrechneWert('254', 'cm', 'in'), '100', 'Nullen fallen nur hinter dem Punkt weg');
  assert.equal(umrechneWert('-5', 'cm', 'in'), '-1.969', 'negative Texte werden mitgerechnet, bleiben aber ungültig');
  assert.ok(!umrechneWert('22,5', 'cm', 'in').includes(','), 'nie ein Komma im Ergebnis (H6)');
  assert.equal(umrechneWert('99999', 'cm', 'in'), '39369.685');
  assert.ok(umrechneWert('99999', 'cm', 'in').length <= GRENZEN.feld, 'passt in die Feldgrenze von 20 Zeichen');
});

test('E13: „1.000“ wird beim Umrechnen genauso gelesen wie beim Prüfen des Feldes', () => {
  // Längenfelder sind Dezimalfelder: dort ist der Punkt Dezimaltrenner.
  for (const [roh, regel] of [['1.000', 'laenge'], ['1.000', 'bezugsmass'], ['12.500', 'laenge']]) {
    const geprueft = pruefeZahl(roh, regel);
    assert.equal(geprueft.gueltig, true);
    assert.equal(parseZahl(roh), geprueft.wert, `${roh} (${regel}) muss gleich gelesen werden`);
  }
  assert.equal(umrechneWert('1.000', 'cm', 'in'), '0.394', '1,0 cm, nicht 1000 cm');
});

test('Eigenschaft: vonCm(zuCm(x)) für beide Einheiten, auch bei 0 und sehr großen Werten', () => {
  for (const einheit of ['cm', 'in']) {
    for (const x of [0, 0.001, 1, 4, 10, 45, 9999, 99999, 1e6]) {
      assert.ok(Math.abs(vonCm(zuCm(x, einheit), einheit) - x) < 1e-9 * Math.max(1, x), `${einheit} ${x}`);
    }
  }
});

test('S5-05: umgerechnete Werte können die Feldgrenzen sprengen', { todo: 'Befund S5-05 – offen, Randfall' }, () => {
  // 40 Zoll Bezugsmaß sind 101,6 cm – über der Grenze von 100 für „bezugsmass“.
  const umgerechnet = umrechneWert('40', 'in', 'cm');
  assert.equal(umgerechnet, '101.6');
  assert.equal(pruefeZahl(umgerechnet, 'bezugsmass').gueltig, true, 'nach dem Wechsel sollte der Wert gültig bleiben');
});

// ================================================================ 5. Darstellung (US-41)

test('US-41 AK4/AK5: formatBruch rundet auf Achtel, kürzt und zeigt „½“ statt „0½“', () => {
  const faelle = [
    [0, '0'], [0.06, '0'], [0.07, '⅛'], [0.125, '⅛'], [0.25, '¼'], [0.375, '⅜'],
    [0.5, '½'], [0.625, '⅝'], [0.75, '¾'], [0.875, '⅞'], [0.94, '1'], [1, '1'],
    [4, '4'], [4.5, '4½'], [4.3, '4¼'], [4.9375, '5'], [12.0625, '12⅛'],
  ];
  for (const [wert, erwartet] of faelle) assert.equal(formatBruch(wert, DE), erwartet, `formatBruch(${wert})`);
  assert.equal(formatBruch(Number.NaN, DE), LEER_ANZEIGE);
  assert.equal(formatBruch(Number.POSITIVE_INFINITY, DE), LEER_ANZEIGE);
  assert.equal(formatBruch(null, DE), LEER_ANZEIGE);
  assert.equal(formatBruch(undefined, DE), LEER_ANZEIGE);
  assert.equal(formatBruch('4,5', DE), LEER_ANZEIGE, 'Text ist keine Zahl');
  assert.equal(formatBruch(12345.5, DE), '12345½', 'kein Tausendertrenner');
});

test('US-41: die Bruchanzeige weicht höchstens ein Sechzehntel ab und ist monoton', () => {
  const ZEICHEN = ['', '⅛', '¼', '⅜', '½', '⅝', '¾', '⅞'];
  const zurueck = (s) => {
    const i = ZEICHEN.findIndex((z) => z !== '' && s.endsWith(z));
    const ganz = i > 0 ? s.slice(0, -1) : s;
    return (ganz === '' ? 0 : Number(ganz)) + (i > 0 ? i / 8 : 0);
  };
  let vorher = -1;
  for (let n = 0; n <= 5000; n++) {
    const x = n / 500;
    const gezeigt = zurueck(formatBruch(x, EN));
    assert.ok(Math.abs(gezeigt - x) <= 1 / 16 + 1e-9, `zu ungenau bei ${x}`);
    assert.ok(gezeigt >= vorher, `nicht monoton bei ${x}`);
    vorher = gezeigt;
  }
});

test('US-41 AK6: die Rundung ist reine Anzeige – der gespeicherte Wert bleibt', () => {
  const d = daten('cm');
  d.projekte[0].strickstuecke[0].plan.laenge = '45,3';
  // Anzeige rundet auf Achtel …
  assert.equal(formatLaenge(45.3, 'cm', DE, 'bruch'), '45¼');
  // … die Rechnung nicht.
  const r = planAusTexten(d.projekte[0].strickstuecke[0].plan, PROBE_CM, 'cm');
  assert.equal(r.reihen, runden((45.3 * 37) / 10));
  assert.equal(r.reihen, 168, 'mit 45¼ wären es 167');
});

test('R19: formatLaenge dezimal ist bitgleich zur alten Formatierung', () => {
  for (let n = 0; n <= 2000; n++) {
    const cm = n / 7;
    for (const einheit of ['cm', 'in']) {
      for (const loc of [DE, EN]) {
        assert.equal(formatLaenge(cm, einheit, loc, 'dezimal'), formatZahl(vonCm(cm, einheit), loc), `${cm} ${einheit} ${loc}`);
      }
    }
  }
  for (const leer of [null, undefined, Number.NaN, 'x']) assert.equal(formatLaenge(leer, 'cm', DE, 'dezimal'), LEER_ANZEIGE);
});

test('US-41: formatLaengeAbweichung – Vorzeichen, „±0“, und dezimal unverändert', () => {
  assert.equal(formatLaengeAbweichung(1.27, 'in', DE, 'bruch'), '+½');
  assert.equal(formatLaengeAbweichung(-1.27, 'in', DE, 'bruch'), '−½');
  assert.equal(formatLaengeAbweichung(0.1, 'in', DE, 'bruch'), '±0', '1 mm liegt unter einem halben Achtel Zoll (H7)');
  assert.equal(formatLaengeAbweichung(-0.1, 'in', DE, 'bruch'), '±0');
  assert.equal(formatLaengeAbweichung(0, 'cm', DE, 'bruch'), '±0');
  assert.equal(formatLaengeAbweichung(0.3, 'cm', DE, 'bruch'), '+¼', '0,3 rundet auf zwei Achtel');
  assert.equal(formatLaengeAbweichung(-0.3, 'cm', DE, 'bruch'), '−¼');
  assert.equal(formatLaengeAbweichung(0.5, 'cm', DE, 'bruch'), '+½');
  assert.equal(formatLaengeAbweichung(0.1, 'cm', DE, 'dezimal'), '+0,10');
  assert.equal(formatLaengeAbweichung(-0.001, 'cm', DE, 'dezimal'), '±0,00');
  assert.equal(formatLaengeAbweichung(Number.NaN, 'cm', DE, 'bruch'), LEER_ANZEIGE);
  // Niemals „+0“ oder „−0“
  for (let n = -40; n <= 40; n++) {
    const anzeige = formatLaengeAbweichung(n / 1000, 'in', DE, 'bruch');
    assert.ok(!['+0', '−0', '-0'].includes(anzeige), `${n / 1000} → ${anzeige}`);
  }
});

// S5-02 ist anders geloest als im Bericht vorgeschlagen: Die Funktion ist
// entfernt und die Zusage in Architektur 5.1 zurueckgenommen (v5.3). Grund:
// aria-label an einem rollenlosen <span> wird von Screenreadern nicht
// zuverlaessig vorgelesen - die vorgeschlagene Abhilfe haette also nicht
// gewirkt. Ob die Bruchzeichen selbst genuegen, klaert der Praxistest.
test('S5-02 behoben: kein toter Export, keine offene Zusage', () => {
  const format = lies('js/format.js');
  assert.ok(!/bruchVorlesbar/.test(format), 'die unbenutzte Funktion ist entfernt');
  const ansichten = readdirSync(join(WURZEL, 'js/ansichten')).map((n) => lies(`js/ansichten/${n}`)).join('\n');
  assert.ok(!/bruchVorlesbar/.test(ansichten));
  const architektur = lies('docs/architektur/sprint-5-architektur.md');
  assert.ok(!/für `aria-label` benutzt/.test(architektur), 'die Zusage ist zurueckgenommen');
});

test('US-41 AK3: darstellungFuer – auto folgt der Einheit, eigene Wahl bleibt', () => {
  assert.equal(darstellungFuer({ laengeneinheit: 'cm', laengenDarstellung: 'auto' }), 'dezimal');
  assert.equal(darstellungFuer({ laengeneinheit: 'in', laengenDarstellung: 'auto' }), 'bruch');
  assert.equal(darstellungFuer({ laengeneinheit: 'in' }), 'bruch', 'fehlendes Feld = auto');
  assert.equal(darstellungFuer({ laengeneinheit: 'in', laengenDarstellung: 'dezimal' }), 'dezimal');
  assert.equal(darstellungFuer({ laengeneinheit: 'cm', laengenDarstellung: 'bruch' }), 'bruch');
  assert.equal(darstellungFuer({}), 'dezimal');
  assert.equal(darstellungFuer(null), 'dezimal', 'kein Absturz ohne Einstellungen');
  assert.equal(darstellungFuer({ laengeneinheit: 'in', laengenDarstellung: 'roemisch' }), 'bruch', 'Unfug → auto');

  // Die eigene Wahl überlebt den Einheitenwechsel
  const d = { ...leereDaten(), einstellungen: bereinigeEinstellungen({ laengenDarstellung: 'dezimal' }) };
  assert.equal(einheitUmstellen(d, 'in').einstellungen.laengenDarstellung, 'dezimal');
});

test('Alle sechs Kombinationen aus Einheit und Darstellung liefern sinnvolle Anzeigen', () => {
  const erwartet = {
    'cm|dezimal': '45,00',
    'cm|bruch': '45',
    'in|dezimal': '17,72',
    'in|bruch': '17¾',
  };
  for (const einheit of ['cm', 'in']) {
    for (const d of ['dezimal', 'bruch']) {
      assert.equal(formatLaenge(45, einheit, DE, `${d}`), erwartet[`${einheit}|${d}`]);
    }
  }
  // „auto“ wird nie an die Formatierung durchgereicht, sondern vorher aufgelöst
  for (const einheit of ['cm', 'in']) {
    const aufgeloest = darstellungFuer({ laengeneinheit: einheit, laengenDarstellung: 'auto' });
    assert.ok(['dezimal', 'bruch'].includes(aufgeloest));
  }
});

// ================================================================ 6. Sprache (US-23)

test('US-23 AK3: de und en haben dieselben 285 Schlüssel', () => {
  const de = Object.keys(SPRACHEN.de.texte);
  const en = Object.keys(SPRACHEN.en.texte);
  assert.deepEqual(de.filter((k) => !en.includes(k)), [], 'fehlt auf Englisch');
  assert.deepEqual(en.filter((k) => !de.includes(k)), [], 'auf Englisch überzählig');
  assert.equal(de.length, 285);
});

test('US-23: gleiche Platzhalter, keine leeren Texte, keine offenen Klammern', () => {
  const muster = (s) => [...new Set(s.match(/\{[^}]*\}/g) ?? [])].sort();
  for (const [schluessel, deutsch] of Object.entries(SPRACHEN.de.texte)) {
    const englisch = SPRACHEN.en.texte[schluessel];
    assert.deepEqual(muster(englisch), muster(deutsch), `andere Platzhalter: ${schluessel}`);
    assert.ok(englisch.trim().length > 0, `leerer Text: ${schluessel}`);
    assert.ok(!/\{\s*\}/.test(englisch), `leerer Platzhalter: ${schluessel}`);
  }
});

test('US-23: kein Einheitenkürzel steckt fest im Text (außer in den Kürzeln selbst)', () => {
  const erlaubt = (k) => k.startsWith('einheit.') || k === 'einst.cm' || k === 'einst.zoll';
  for (const [sprache, eintrag] of Object.entries(SPRACHEN)) {
    for (const [k, v] of Object.entries(eintrag.texte)) {
      if (erlaubt(k)) continue;
      assert.ok(!/\bcm\b/.test(v), `${sprache}/${k}: „cm“ fest im Text`);
      assert.ok(!/\bZentimeter\b|\bcentimeters?\b|\binches\b|\bZoll\b/i.test(v), `${sprache}/${k}: Einheit ausgeschrieben`);
    }
  }
  // „mm“ darf stehen bleiben: die Nadelstärke ist immer in mm (E35)
  assert.match(SPRACHEN.en.texte['proben.nadel'], /mm/);
});

test('US-23: keine deutschen Reste in den englischen Texten', () => {
  const verdaechtig = /[äöüÄÖÜß]|\bund\b|\bder\b|\bdie\b|\bdas\b|\bnicht\b|\bReihe\b|\bMaschen\b|\bbitte\b/i;
  for (const [k, v] of Object.entries(SPRACHEN.en.texte)) {
    if (k === 'app.titel') continue; // Eigenname
    // Platzhalternamen sind Code, kein Text: {einheitReihe} ist kein deutscher Rest.
    const ohnePlatzhalter = v.replace(/\{[^}]*\}/g, '');
    assert.ok(!verdaechtig.test(ohnePlatzhalter), `deutscher Rest in ${k}: ${v}`);
  }
});

test('US-23: en-US, Rückfall auf Deutsch, unbekannte Sprache', () => {
  assert.equal(localeFuer('en'), 'en-US');
  assert.equal(localeFuer('de'), 'de-DE');
  assert.equal(localeFuer('fr'), SPRACHEN[STANDARD_SPRACHE].locale);
  assert.equal(text('en', 'proben.titel'), 'Gauge');
  assert.equal(text('fr', 'proben.titel'), 'Maschenproben', 'unbekannte Sprache → Deutsch');
  assert.equal(text('en', 'gibt.es.nicht'), 'gibt.es.nicht');
  assert.equal(text('en', 'plan.zeileReihe', { reihe: 12, art: 'increase', pro: 2, danach: 52 }), 'Row 12: increase 2 sts → 52 sts');
});

test('S4-05 gilt in beiden Sprachen: die Zielquelle heißt wie die Karte', () => {
  for (const sprache of ['de', 'en']) {
    for (const quelle of ['laengeZuReihen', 'reihenAusAnleitung']) {
      assert.equal(
        SPRACHEN[sprache].texte[`zaehler.quelle.${quelle}`],
        SPRACHEN[sprache].texte[`rechner.${quelle}.titel`],
        `${sprache}/${quelle}`,
      );
    }
  }
});

test('US-23/R17: kein englischer Text ist unverhältnismäßig viel länger als der deutsche', () => {
  const zuLang = Object.entries(SPRACHEN.de.texte)
    .map(([k, de]) => [k, SPRACHEN.en.texte[k].length - de.length])
    .filter(([, mehr]) => mehr > 25);
  assert.deepEqual(zuLang, [], 'diese Texte könnten die Mobilansicht sprengen');
});

test('US-23: die Sprachnamen bleiben unübersetzt (Architektur 7)', () => {
  const html = lies('index.html');
  assert.match(html, /<input type="radio" name="sprache" value="de"><span>Deutsch<\/span>/);
  assert.match(html, /<input type="radio" name="sprache" value="en"><span>English<\/span>/);
  assert.ok(!/data-text="einst\.(deutsch|englisch)"/.test(html), 'Sprachnamen dürfen nicht übersetzt werden');
});

// ================================================================ 7. Datenerhalt (R6, R10, R13)

test('Schema 3 bleibt: kein neuer Speicherschlüssel, keine Migration', () => {
  const speicher = lies('js/speicher.js');
  assert.match(speicher, /SCHLUESSEL_V3 = 'maschenrechner\.daten\.v3'/);
  assert.ok(!/daten\.v4/.test(speicher), 'kein vierter Schlüssel');
  assert.match(lies('js/modell.js'), /SCHEMA_VERSION = 3/);
});

test('Eine Sicherung aus 0.4.0 (ohne laengenDarstellung) wird unverändert gelesen', () => {
  const alt = daten('cm');
  delete alt.einstellungen.laengenDarstellung;
  const g = pruefeDaten(alt);
  assert.equal(g.gueltig, true);
  assert.equal(g.daten.einstellungen.laengenDarstellung, 'auto');
  assert.equal(g.daten.einstellungen.sprache, 'de');
  assert.equal(g.daten.projekte[0].strickstuecke[0].zaehler, 39);
  assert.deepEqual(g.daten.projekte[0].strickstuecke[0].eingeklappt, { plan: true });
});

test('Beschädigte Einstellungen werden ersetzt, Projektdaten nie still verworfen (R6/R10)', () => {
  const kaputt = daten('in');
  kaputt.einstellungen = { sprache: 'kl', laengeneinheit: 'ellen', farbschema: 'neon', laengenDarstellung: 42 };
  const g = pruefeDaten(kaputt);
  assert.deepEqual(g.daten.einstellungen, { sprache: 'de', laengeneinheit: 'cm', farbschema: 'system', laengenDarstellung: 'auto' });
  assert.equal(g.daten.projekte.length, 1, 'die Projekte bleiben erhalten');
  assert.equal(g.daten.projekte[0].strickstuecke[0].plan.laenge, '45');
});

test('Zoll in der Sicherung übersteht das Prüfen; fehlende Bezugsmaße bekommen 4', () => {
  const inDaten = einheitUmstellen(daten('cm'), 'in');
  delete inDaten.projekte[0].proben[0].eigen.maschenBezug;
  const g = pruefeDaten(inDaten);
  assert.equal(g.daten.einstellungen.laengeneinheit, 'in');
  assert.equal(g.daten.projekte[0].proben[0].eigen.maschenBezug, '4', 'Vorbelegung in der gespeicherten Einheit');
  assert.equal(g.daten.projekte[0].proben[0].eigen.reihenBezug, '3.937');
});

test('IDs an der Längengrenze (64 Zeichen) und doppelte IDs überstehen Prüfen und Umstellen', () => {
  const lang = 'a'.repeat(64);
  const d = daten('cm');
  d.projekte[0].id = lang;
  d.projekte.push(JSON.parse(JSON.stringify({ ...d.projekte[0], id: lang })));
  const g = pruefeDaten(d);
  assert.equal(g.daten.projekte[0].id, lang);
  assert.equal(g.daten.projekte[1].id, `${lang}-2`, 'doppelte ID wird eindeutig gemacht (bekannt: MAS-46)');
  const n = einheitUmstellen(g.daten, 'in');
  assert.equal(n.projekte[0].id, lang);
  assert.equal(n.projekte[1].proben[0].eigen.maschenBezug, '3.937');
});

// ================================================================ 8. Datenschutz

test('Datenschutz: keine externen Adressen, keine Schriftarten, keine Tracker', () => {
  const dateien = ['index.html', 'css/style.css', 'manifest.webmanifest', 'sw.js', ...dateiliste('js')];
  for (const datei of dateien) {
    const inhalt = lies(datei);
    const treffer = inhalt.match(/https?:\/\/[^\s"'`)]+/g) ?? [];
    const fremde = treffer.filter((u) => !/^https?:\/\/(localhost|michawallburger-dev\.github\.io)/.test(u));
    assert.deepEqual(fremde, [], `externe Adresse in ${datei}`);
    assert.ok(!/@import/.test(inhalt), `@import in ${datei}`);
    assert.ok(!/document\.cookie/.test(inhalt), `Cookie in ${datei}`);
    assert.ok(!/navigator\.language/.test(inhalt), `navigator.language in ${datei} (Architektur 8)`);
    if (datei !== 'sw.js') assert.ok(!/\bfetch\s*\(/.test(inhalt), `fetch in ${datei}`);
  }
});

test('Datenschutz: die Content Security Policy bleibt eng', () => {
  const html = lies('index.html');
  const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  for (const regel of ["default-src 'self'", "script-src 'self'", "style-src 'self'", "connect-src 'self'", "base-uri 'none'", "form-action 'none'", "object-src 'none'"]) {
    assert.ok(csp.includes(regel), `fehlt in der CSP: ${regel}`);
  }
  assert.ok(!/unsafe-inline|unsafe-eval|\*/.test(csp), 'CSP darf nicht gelockert sein');
  assert.ok(!/<script(?![^>]*src=)/.test(html.replace(/<script type="module" src="[^"]+"><\/script>/, '')), 'kein Inline-Skript');
});

test('Datenschutz: die englischen Texte liegen in der App, nicht im Netz', () => {
  assert.ok(lies('js/texte.js').includes("locale: 'en-US'"));
  assert.ok(!/import\(|XMLHttpRequest|EventSource|WebSocket/.test(lies('js/texte.js')));
});

// ================================================================ 9. Offlinefähigkeit

function dateiliste(ordner) {
  return readdirSync(join(WURZEL, ordner)).flatMap((name) => {
    const pfad = join(ordner, name);
    return statSync(join(WURZEL, pfad)).isDirectory() ? dateiliste(pfad) : [pfad];
  });
}

test('Offline: Version 0.5.0 steht gleichlautend in package.json, sw.js und app.js', () => {
  const paket = JSON.parse(lies('package.json')).version;
  assert.equal(paket, '0.5.0', 'Sprint 5 liefert 0.5.0');
  assert.ok(lies('sw.js').includes(`CACHE_NAME = 'maschenrechner-v${paket}'`), 'CACHE_NAME nicht erhöht');
  assert.ok(lies('js/app.js').includes(`APP_VERSION = '${paket}'`));
});

test('Offline: CACHE_NAME ist gegenüber 0.4.0 erhöht', () => {
  const cache = lies('sw.js').match(/CACHE_NAME = 'maschenrechner-v([\d.]+)'/)[1];
  const teile = cache.split('.').map(Number);
  const alt = [0, 4, 0];
  assert.ok(teile[0] > alt[0] || teile[1] > alt[1] || teile[2] > alt[2], `${cache} ist nicht größer als 0.4.0`);
});

test('Offline: jede ausgelieferte Datei steht in APP_DATEIEN', () => {
  const sw = lies('sw.js');
  const liste = [...sw.match(/const APP_DATEIEN = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const noetig = [...dateiliste('js'), ...dateiliste('css'), ...dateiliste('icons'), 'index.html', 'manifest.webmanifest'].map(
    (p) => `./${relative('.', p).split('\\').join('/')}`,
  );
  for (const datei of noetig) assert.ok(liste.includes(datei), `fehlt in APP_DATEIEN: ${datei}`);
  assert.ok(liste.includes('./'), 'der Einstieg selbst fehlt');
});

test('Offline: Sprint 5 hat keine neue Datei eingeführt', () => {
  assert.deepEqual(dateiliste('js').map((p) => p.split('\\').join('/')).sort(), [
    'js/ansichten/einstellungen.js',
    'js/ansichten/gemeinsam.js',
    'js/ansichten/plankarte.js',
    'js/ansichten/projekt.js',
    'js/ansichten/projektliste.js',
    'js/ansichten/strickstueck.js',
    'js/ansichten/zaehler.js',
    'js/app.js',
    'js/dom.js',
    'js/eingabe.js',
    'js/einheiten.js',
    'js/format.js',
    'js/geraet.js',
    'js/migration.js',
    'js/modell.js',
    'js/plan.js',
    'js/rechner.js',
    'js/router.js',
    'js/sicherung.js',
    'js/speicher.js',
    'js/texte.js',
    'js/zaehler.js',
    'js/ziel.js',
  ]);
});

// ================================================================ 10. Oberfläche (statisch prüfbar)

test('Die drei neuen Auswahlgruppen stehen in der Vorlage, in der festgelegten Reihenfolge', () => {
  const html = lies('index.html');
  const vorlage = html.match(/<template id="tpl-einstellungen">([\s\S]*?)<\/template>/)[1];
  const reihenfolge = [...vorlage.matchAll(/name="(sprache|einheit|darstellung|farbschema)"/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(reihenfolge)], ['sprache', 'einheit', 'darstellung', 'farbschema']);
  for (const wert of ['de', 'en', 'cm', 'in', 'auto', 'dezimal', 'bruch']) {
    assert.ok(vorlage.includes(`value="${wert}"`), `Option fehlt: ${wert}`);
  }
  assert.match(vorlage, /data-rolle="einheit-status"[^>]*role="status"/, 'US-24 AK6 braucht eine Rückmeldung');
});

test('S5-01 behoben: die zweispaltigen Auswahlgruppen tragen segment-zwei', () => {
  const html = lies('index.html');
  const vorlage = html.match(/<template id="tpl-einstellungen">([\s\S]*?)<\/template>/)[1];
  for (const rolle of ['sprache', 'einheit']) {
    const zeile = vorlage.match(new RegExp(`<fieldset class="([^"]*)" data-rolle="${rolle}"`))[1];
    assert.match(zeile, /segment-zwei/, `${rolle}: zwei Optionen im Dreierraster lassen eine Zelle leer`);
  }
});

test('S5-03 behoben: die Probenzeile gibt die Bezugsmaße über formatLaenge aus', () => {
  const quelle = lies('js/ansichten/strickstueck.js');
  const zeile = quelle.match(/function probeZeile[\s\S]*?\n}/)[0];
  assert.match(zeile, /formatLaenge/, 'auch diese Länge gehört über die gemeinsame Funktion');
});

test('S5-04 behoben: ein selbst eingetragenes Bezugsmaß bleibt erhalten', () => {
  const d = daten('cm');
  d.projekte[0].proben[0].eigen = { maschenAnzahl: '', maschenBezug: '15', reihenAnzahl: '', reihenBezug: '15' };
  const n = einheitUmstellen(d, 'in').projekte[0].proben[0].eigen;
  assert.equal(n.maschenBezug, '5.906', 'ein eingetragenes Maß darf nicht durch das Standardmaß ersetzt werden');
});

test('S5-06: in englischer Schreibweise wird „1,000“ als 1 gelesen', { todo: 'Befund S5-06 – offen' }, () => {
  assert.equal(pruefeZahl('1,000', 'ganzPositiv').wert, 1000, 'englische Tausendertrennung (E13 kennt nur den Punkt)');
});

test('Die Ansichten entscheiden nicht selbst über die Darstellung (Architektur 3.1)', () => {
  for (const name of readdirSync(join(WURZEL, 'js/ansichten'))) {
    const quelle = lies(`js/ansichten/${name}`);
    assert.ok(!/laengeneinheit\s*===\s*'in'/.test(quelle), `${name} schließt selbst von der Einheit auf die Darstellung`);
    assert.ok(!/\bvonCm\b/.test(quelle), `${name} rechnet selbst um statt über formatLaenge`);
  }
});

test('Der Sprachwechsel baut die Ansicht neu auf und setzt die Sprachkennung (US-23 AK1)', () => {
  const app = lies('js/app.js');
  assert.match(app, /spracheAnwenden\(\)\s*\{[\s\S]*document\.documentElement\.lang = sprache\(\)[\s\S]*zeigeAnsicht\(/);
  const einst = lies('js/ansichten/einstellungen.js');
  assert.match(einst, /gruppe\('sprache'[\s\S]*ctx\.spracheAnwenden\(\)/);
  // Einheit und Darstellung bauen bewusst nicht neu auf (Architektur v5.2, 6.2)
  const einheitBlock = einst.match(/gruppe\('einheit'[\s\S]*?\}\);/)[0];
  assert.ok(!/spracheAnwenden|zeigeAnsicht/.test(einheitBlock));
  assert.match(einheitBlock, /einheitUmstellen\(ctx\.daten\(\), wert\), \{ sofort: true \}/, 'ein Schritt, sofort gespeichert');
});

test('S5-07: nach dem Sprachwechsel kehrt der Fokus nicht ins Bedienelement zurück', { todo: 'Befund S5-07 – offen' }, () => {
  // `zeigeAnsicht` setzt den Fokus auf den Seitentitel und scrollt nach oben.
  // Beim Sprachwechsel verlässt der Fokus damit die Auswahlgruppe, während die
  // Nutzerin sie bedient – genau der Grund, aus dem v5.2 den Neuaufbau bei
  // Einheit und Darstellung ausgeschlossen hat (Architektur 6.2).
  const quelle = lies('js/app.js') + lies('js/ansichten/einstellungen.js');
  assert.match(quelle, /focus\(\)[\s\S]{0,400}sprache|sprache[\s\S]{0,400}radio\.focus\(\)/, 'kein Zurücksetzen des Fokus nach dem Neuaufbau');
});
