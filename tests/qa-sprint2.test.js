// QA Sprint 2: unabhängige Akzeptanztests der Logik (US-09 … US-12, US-26, US-27, Bugs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { umrechnenAusAnleitung, umrechnenAusCm } from '../js/rechner.js';
import { pruefeZahl } from '../js/eingabe.js';
import { leereDaten, neuesProjekt, projektAendern, neuesStrickstueck, strickstueckAendern, finde, pruefeDaten, projekteSortiert } from '../js/modell.js';
import { ladeDaten, speichereDaten, SCHLUESSEL_V1, SCHLUESSEL_V2 } from '../js/speicher.js';
import { erzeugeSicherung, leseSicherung } from '../js/sicherung.js';
import { zaehlerPlus, zaehlerMinus } from '../js/zaehler.js';
import { routeAus, hashFuer } from '../js/router.js';
import { neuerSpeicher, idZaehler, v1Zustand } from './hilfen.js';

const T = (n) => `2026-10-${String(n).padStart(2, '0')}T08:00:00.000Z`;

/** Liest eine Probe aus den Texten des Projekts wie die Oberfläche (cm). */
function probe(p, richtung) {
  const a = pruefeZahl(p[`${richtung}Anzahl`], 'probenAnzahl');
  const b = pruefeZahl(p[`${richtung}Bezug`], 'bezugsmass');
  return a.gueltig && b.gueltig ? { anzahl: a.wert, bezug: b.wert, bezugCm: b.wert } : null;
}

function referenzProjekt() {
  let d = neuesProjekt(leereDaten(), { name: 'Referenz' }, 'p1', T(1)).daten;
  d = projektAendern(d, 'p1', {
    probeAnleitung: { maschenAnzahl: '34', reihenAnzahl: '52' },
    probeEigen: { maschenAnzahl: '25', reihenAnzahl: '37' },
  }, T(1)).daten;
  return neuesStrickstueck(d, 'p1', 'Vorderteil', 's1', T(1)).daten;
}

test('US-10 AK2: Excel-Referenzwerte stimmen mit den Proben des Projekts', () => {
  const { projekt } = finde(referenzProjekt(), 'p1', 's1');
  const pa = (r) => probe(projekt.probeAnleitung, r);
  const pe = (r) => probe(projekt.probeEigen, r);
  const m = umrechnenAusAnleitung(320, pa('maschen'), pe('maschen'), 0);
  assert.equal(m.eigenGerundet, 235);
  assert.equal(Math.round(m.abweichungCm * 100) / 100, -0.12);
  assert.equal(umrechnenAusAnleitung(55, pa('reihen'), pe('reihen'), 0).eigenGerundet, 39);
  const b = umrechnenAusCm(94, pa('maschen'), pe('maschen'), 0);
  assert.deepEqual([b.anleitungGerundet, b.eigenGerundet], [320, 235]);
  const l = umrechnenAusCm(13.5, pa('reihen'), pe('reihen'), 0);
  assert.deepEqual([l.anleitungGerundet, l.eigenGerundet], [70, 50]);
  assert.equal(umrechnenAusCm(10.2, pa('maschen'), pe('maschen'), 0).eigenGerundet, 26, 'x,5-Rundung');
});

test('US-10 AK3: Probenänderung im Projekt wirkt auf alle Strickstücke', () => {
  let d = neuesStrickstueck(referenzProjekt(), 'p1', 'Rücken', 's2', T(2)).daten;
  d = projektAendern(d, 'p1', { probeEigen: { maschenAnzahl: '20' } }, T(3)).daten;
  for (const sid of ['s1', 's2']) {
    const { projekt } = finde(d, 'p1', sid);
    assert.equal(umrechnenAusAnleitung(320, probe(projekt.probeAnleitung, 'maschen'), probe(projekt.probeEigen, 'maschen')).eigenGerundet, 188);
  }
});

test('US-10 AK2: Eingaben je Strickstück getrennt', () => {
  let d = neuesStrickstueck(referenzProjekt(), 'p1', 'Rücken', 's2', T(2)).daten;
  d = strickstueckAendern(d, 'p1', 's1', { rechner: { maschenAusAnleitung: { eingabe: '320', anpassung: '-2' } } }, T(3)).daten;
  assert.equal(finde(d, 'p1', 's2').stueck.rechner.maschenAusAnleitung.eingabe, '');
  assert.equal(finde(d, 'p1', 's1').stueck.rechner.maschenAusAnleitung.anpassung, '-2');
});

test('US-09 AK1: Arbeit an einem Strickstück schiebt das Projekt nach oben', () => {
  let d = referenzProjekt();
  d = neuesProjekt(d, { name: 'Mütze' }, 'p2', T(5)).daten;
  assert.equal(projekteSortiert(d)[0].name, 'Mütze');
  d = strickstueckAendern(d, 'p1', 's1', { zaehler: 1 }, T(6)).daten;
  assert.equal(projekteSortiert(d)[0].name, 'Referenz');
});

test('US-11 AK3: Randwerte des Zählers', () => {
  assert.equal(zaehlerMinus(0), 0);
  assert.equal(zaehlerMinus(1), 0);
  assert.equal(zaehlerPlus(99998), 99999);
  assert.equal(zaehlerPlus(99999), 99999);
  assert.deepEqual(pruefeZahl('1.000', 'zaehler'), { gueltig: true, wert: 1000 });
  assert.equal(pruefeZahl('0,0', 'zaehler').gueltig, true, '0,0 ist ganzzahlig 0');
  assert.equal(pruefeZahl('1e3', 'zaehler').gueltig, false, 'Exponent wird nicht angenommen');
});

test('US-11 AK4: Zählerstand übersteht Speichern und Laden', () => {
  const s = neuerSpeicher();
  speichereDaten(s, strickstueckAendern(referenzProjekt(), 'p1', 's1', { zaehler: 4711 }, T(2)).daten);
  const { daten } = ladeDaten(s, { neueId: idZaehler(), jetzt: T(3), projektName: 'x', stueckName: 'y' });
  assert.equal(finde(daten, 'p1', 's1').stueck.zaehler, 4711);
});

test('US-12 AK1–AK3: Rundreise mit allen Inhalten, Datum lokal', () => {
  const d = strickstueckAendern(referenzProjekt(), 'p1', 's1', { zaehler: 42, name: 'Ärmel „links“ <b>' }, T(2)).daten;
  const { inhalt, dateiname } = erzeugeSicherung(d, new Date(2026, 0, 1, 0, 5), '0.2.0');
  assert.equal(dateiname, 'maschenrechner-sicherung-2026-01-01.json');
  const r = leseSicherung(inhalt);
  assert.deepEqual(r.daten, d);
  assert.equal(finde(r.daten, 'p1', 's1').stueck.name, 'Ärmel „links“ <b>', 'Sonderzeichen bleiben Text');
});

test('US-12 AK4: abgeschnittene Datei wird abgelehnt', () => {
  const { inhalt } = erzeugeSicherung(referenzProjekt(), new Date(), '0.2.0');
  assert.equal(leseSicherung(inhalt.slice(0, inhalt.length / 2)).fehler, 'KEIN_JSON');
  assert.equal(leseSicherung('﻿' + inhalt).gueltig, false, 'BOM ist kein gültiges JSON – bewusst abgelehnt');
});

test('US-27 AK1: Referenzdaten aus 0.1 werden 1:1 übernommen, alter Schlüssel unverändert', () => {
  const alt = JSON.stringify(v1Zustand());
  const s = neuerSpeicher({ [SCHLUESSEL_V1]: alt });
  const r = ladeDaten(s, { neueId: idZaehler(), jetzt: T(1), projektName: 'Mein Projekt', stueckName: 'Teil 1' });
  assert.equal(r.quelle, 'v1');
  assert.equal(s.getItem(SCHLUESSEL_V1), alt);
  const p = r.daten.projekte[0];
  assert.equal(p.strickstuecke[0].rechner.breiteZuMaschen.anpassung, '-1');
  assert.ok(s.getItem(SCHLUESSEL_V2));
});

test('Router: jede ID aus der App ist erreichbar', () => {
  const d = neuesProjekt(leereDaten(), { name: 'x' }, 'p-1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', T(1)).daten;
  const id = d.projekte[0].id;
  assert.equal(routeAus(hashFuer({ ansicht: 'projekt', projektId: id })).projektId, id);
});

test('QA S2-03: IDs aus einer Sicherung, die nicht ins Routenmuster passen, werden ersetzt', () => {
  const r = pruefeDaten({ schemaVersion: 2, projekte: [{ id: 'mein projekt', name: 'A', strickstuecke: [{ id: 'teil/1', name: 'B' }] }] });
  const p = r.daten.projekte[0];
  assert.equal(routeAus(hashFuer({ ansicht: 'projekt', projektId: p.id })).ansicht, 'projekt');
  assert.equal(routeAus(hashFuer({ ansicht: 'strickstueck', projektId: p.id, stueckId: p.strickstuecke[0].id })).ansicht, 'strickstueck');
});
