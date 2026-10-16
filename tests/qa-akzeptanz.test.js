// QA Sprint 1 – unabhängige Akzeptanz- und Eigenschaftstests.
// Prüft die Rechenkette so, wie die Oberfläche sie nutzt (Text → Prüfung → Rechnung → Anzeige),
// und vergleicht die Gleitkomma-Rechnung mit exakter Ganzzahl-Arithmetik (BigInt).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pruefeZahl } from '../js/eingabe.js';
import { umrechnenAusAnleitung, umrechnenAusCm, runden, cmZuAnzahl } from '../js/rechner.js';
import { formatZahl, formatGanzzahl, formatAbweichung } from '../js/format.js';
import { zuCm, vonCm } from '../js/einheiten.js';

const DE = 'de-DE';

/** Simuliert die Kette der App: Texte prüfen, in cm umrechnen, Probe bauen. */
function probe(anzahlText, bezugText) {
  const a = pruefeZahl(anzahlText, 'probenAnzahl');
  const b = pruefeZahl(bezugText, 'bezugsmass');
  assert.ok(a.gueltig && b.gueltig, `Probe ${anzahlText}/${bezugText} sollte gültig sein`);
  return { anzahl: a.wert, bezugCm: zuCm(b.wert, 'cm') };
}

function anzeigeAusAnleitung(nText, pA, pE, anpText = '0') {
  const n = pruefeZahl(nText, 'ganzPositiv');
  const anp = pruefeZahl(anpText, 'anpassung');
  const r = umrechnenAusAnleitung(n.wert, pA, pE, anp.wert);
  return {
    mass: formatZahl(vonCm(r.cmLautAnleitung, 'cm'), DE),
    eigen: formatGanzzahl(r.eigenGerundet, DE),
    end: r.gueltig ? formatGanzzahl(r.endgueltig, DE) : '–',
    ist: r.gueltig ? formatZahl(vonCm(r.cmTatsaechlich, 'cm'), DE) : '–',
    abw: r.gueltig ? formatAbweichung(vonCm(r.abweichungCm, 'cm'), DE) : '–',
  };
}

function anzeigeAusCm(cmText, pA, pE, anpText = '0') {
  const cm = pruefeZahl(cmText, 'laenge');
  const anp = pruefeZahl(anpText, 'anpassung');
  const r = umrechnenAusCm(zuCm(cm.wert, 'cm'), pA, pE, anp.wert);
  return {
    anleitung: formatGanzzahl(r.anleitungGerundet, DE),
    eigen: formatGanzzahl(r.eigenGerundet, DE),
    end: r.gueltig ? formatGanzzahl(r.endgueltig, DE) : '–',
    ist: r.gueltig ? formatZahl(vonCm(r.cmTatsaechlich, 'cm'), DE) : '–',
    abw: r.gueltig ? formatAbweichung(vonCm(r.abweichungCm, 'cm'), DE) : '–',
  };
}

const AM = probe('34', '10');
const AR = probe('52', '10');
const EM = probe('25', '10');
const ER = probe('37', '10');

// ---------------------------------------------------------------- Akzeptanzfälle (Anzeige)

test('QA US-03: 320 M → 94,12 cm / 235 / 235 / 94,00 / −0,12', () => {
  assert.deepEqual(anzeigeAusAnleitung('320', AM, EM), {
    mass: '94,12', eigen: '235', end: '235', ist: '94,00', abw: '−0,12',
  });
});

test('QA US-03 AK4: Anpassung „−2“ (typografisches Minus) → 233 / 93,20 / −0,92', () => {
  const a = anzeigeAusAnleitung('320', AM, EM, '−2');
  assert.equal(a.end, '233');
  assert.equal(a.ist, '93,20');
  assert.equal(a.abw, '−0,92');
});

test('QA US-03 AK6: Anpassung −235 → kein Ergebnis', () => {
  const a = anzeigeAusAnleitung('320', AM, EM, '-235');
  assert.equal(a.end, '–');
  assert.equal(a.eigen, '235', 'Zwischenwert bleibt sichtbar');
});

test('QA US-04: 55 R → 10,58 cm / 39 / 10,54 / −0,04', () => {
  const a = anzeigeAusAnleitung('55', AR, ER);
  assert.deepEqual([a.mass, a.end, a.ist, a.abw], ['10,58', '39', '10,54', '−0,04']);
});

test('QA US-05: 94 cm → 320 / 235 / 94,00 / ±0,00', () => {
  const a = anzeigeAusCm('94', AM, EM);
  assert.deepEqual([a.anleitung, a.eigen, a.ist, a.abw], ['320', '235', '94,00', '±0,00']);
});

test('QA US-05 AK4: „10,2“ und „10.2“ cm → 26 M', () => {
  assert.equal(anzeigeAusCm('10,2', AM, EM).eigen, '26');
  assert.equal(anzeigeAusCm('10.2', AM, EM).eigen, '26');
});

test('QA US-06: 13,5 cm → 70 / 50 / 13,51 / +0,01', () => {
  const a = anzeigeAusCm('13,5', AR, ER);
  assert.deepEqual([a.anleitung, a.eigen, a.ist, a.abw], ['70', '50', '13,51', '+0,01']);
});

test('QA US-02 AK6: Probe „20“ auf „8“ cm, 40 cm → 100 M', () => {
  const p = probe('20', '8');
  assert.equal(anzeigeAusCm('40', p, p).eigen, '100');
});

test('QA US-01 AK2: Probe „22,5“ auf „10“ → Dichte 2,25', () => {
  const p = probe('22,5', '10');
  assert.equal(formatZahl(p.anzahl / p.bezugCm, DE), '2,25');
});

// ---------------------------------------------------------------- Eigenschaftstests (exakt vs. Gleitkomma)

/** Exakte kaufmännische Rundung von zaehler/nenner (beide positive BigInt). */
function exaktRunden(zaehler, nenner) {
  return Number((2n * zaehler + nenner) / (2n * nenner));
}

test('QA Eigenschaft: Breite mit 1 Nachkommastelle × ganzzahlige Probe auf 10 cm rundet exakt richtig', () => {
  let geprueft = 0;
  for (let anzahl = 5; anzahl <= 40; anzahl++) {
    const p = { anzahl, bezugCm: 10 };
    for (let zehntel = 1; zehntel <= 3000; zehntel++) {
      const cm = Number(pruefeZahl(`${Math.floor(zehntel / 10)},${zehntel % 10}`, 'laenge').wert);
      const ist = runden(cmZuAnzahl(cm, p));
      // exakt: (zehntel/10) * anzahl / 10 = zehntel*anzahl/100
      const soll = exaktRunden(BigInt(zehntel * anzahl), 100n);
      if (ist !== soll) assert.fail(`cm=${cm}, Probe ${anzahl}/10: erhalten ${ist}, exakt ${soll}`);
      geprueft++;
    }
  }
  assert.ok(geprueft > 100000);
});

test('QA Eigenschaft: Umrechnung aus Anleitung (ganzzahlige Proben auf 10 cm) rundet exakt richtig', () => {
  for (let anzA = 10; anzA <= 40; anzA++) {
    for (let anzE = 10; anzE <= 40; anzE++) {
      const pA = { anzahl: anzA, bezugCm: 10 };
      const pE = { anzahl: anzE, bezugCm: 10 };
      for (let n = 1; n <= 600; n++) {
        const ist = umrechnenAusAnleitung(n, pA, pE, 0).eigenGerundet;
        const soll = exaktRunden(BigInt(n * anzE), BigInt(anzA)); // n * anzE / anzA
        if (ist !== soll) assert.fail(`n=${n}, ${anzA}→${anzE}: erhalten ${ist}, exakt ${soll}`);
      }
    }
  }
});

test('QA Eigenschaft: Umrechnung mit Dezimal-Bezugsmaßen (z. B. 7,5 cm) rundet exakt richtig', () => {
  for (const [bezA, bezE] of [[7.5, 10], [10, 12.5], [8, 7.5], [4, 10.16]]) {
    const fA = Math.round(bezA * 100);
    const fE = Math.round(bezE * 100);
    for (let anzA = 15; anzA <= 30; anzA++) {
      for (let anzE = 15; anzE <= 30; anzE++) {
        for (let n = 1; n <= 300; n++) {
          const ist = umrechnenAusAnleitung(n, { anzahl: anzA, bezugCm: bezA }, { anzahl: anzE, bezugCm: bezE }, 0).eigenGerundet;
          // n * bezA/anzA * anzE/bezE = n*fA*anzE / (anzA*fE)
          const soll = exaktRunden(BigInt(n * fA * anzE), BigInt(anzA * fE));
          if (ist !== soll) assert.fail(`n=${n}, ${anzA}/${bezA} → ${anzE}/${bezE}: erhalten ${ist}, exakt ${soll}`);
        }
      }
    }
  }
});

// ---------------------------------------------------------------- Randfälle der Eingabe

test('QA Randfälle: 0, negativ, leer, Text, Exponent, sehr groß', () => {
  const faelle = [
    ['0', 'ganzPositiv', 'NICHT_POSITIV'],
    ['-320', 'ganzPositiv', 'NICHT_POSITIV'],
    ['', 'ganzPositiv', 'LEER'],
    ['dreihundert', 'ganzPositiv', 'KEINE_ZAHL'],
    ['3e2', 'ganzPositiv', 'KEINE_ZAHL'],
    ['999999999999', 'ganzPositiv', 'ZU_GROSS'],
    ['0', 'laenge', 'NICHT_POSITIV'],
    ['-1,5', 'laenge', 'NICHT_POSITIV'],
    ['1.000', 'laenge', null], // Punkt ist Dezimaltrenner → 1,0 cm (bewusst so festgelegt)
    ['0', 'bezugsmass', 'NICHT_POSITIV'],
    ['0', 'probenAnzahl', 'NICHT_POSITIV'],
  ];
  for (const [text, regel, fehler] of faelle) {
    const r = pruefeZahl(text, regel);
    if (fehler === null) assert.equal(r.gueltig, true, `${text}/${regel}`);
    else assert.equal(r.fehler, fehler, `${text}/${regel}`);
  }
});

test('QA Randfall: Extremwerte an allen Grenzen gleichzeitig ergeben endliche Ergebnisse', () => {
  const pA = { anzahl: 999, bezugCm: 0.01 };
  const pE = { anzahl: 0.01, bezugCm: 100 };
  const r = umrechnenAusAnleitung(99999, pA, pE, 9999);
  assert.ok(Number.isFinite(r.cmLautAnleitung));
  assert.ok(Number.isFinite(r.cmTatsaechlich));
  assert.equal(r.gueltig, true);
});

test('QA Randfall: Zwischenstand beim Tippen „12,“ wird abgelehnt (siehe Befund F-02 im Testbericht)', () => {
  // Dokumentiert das aktuelle Verhalten: Während der Eingabe von „12,5“ erscheint kurz ein Fehler.
  assert.equal(pruefeZahl('12,', 'laenge').fehler, 'KEINE_ZAHL');
});

test('QA Befund F-01: „1.000“ als Maschenzahl wird still als 1 gelesen (Tausenderpunkt)', () => {
  // Dokumentiert das aktuelle Verhalten – im Deutschen bedeutet „1.000“ jedoch tausend.
  assert.deepEqual(pruefeZahl('1.000', 'ganzPositiv'), { gueltig: true, wert: 1 });
  // „1.200“ fällt dagegen auf (1,2 ist keine ganze Zahl)
  assert.equal(pruefeZahl('1.200', 'ganzPositiv').fehler, 'KEINE_GANZZAHL');
});
