/**
 * Ziel und Zu-/Abnahmen im Reihenzähler (US-15, US-30).
 *
 * Reine Funktionen: kein DOM, kein Speicher, keine Ausnahmen.
 * Der Zählerstand gilt als „Reihe, in der ich gerade bin“ (Architektur R11).
 */

import { umrechnenAusAnleitung, umrechnenAusCm, anzahlZuCm } from './rechner.js';
import { pruefeZahl } from './eingabe.js';
import { zuCm } from './einheiten.js';
import { planAusTexten, probeAusTexten } from './plan.js';

/** Zielquellen in fester Reihenfolge – zugleich die Rückfallreihenfolge (US-30 AK7). */
export const ZIEL_QUELLEN = Object.freeze(['plan', 'laengeZuReihen', 'reihenAusAnleitung']);

/**
 * Gültige Zielquellen aus bereits berechneten Werten.
 * @param {{plan?:{reihen:number,cm:number}|null, laengeZuReihen?:{reihen:number,cm:number}|null, reihenAusAnleitung?:{reihen:number,cm:number}|null}} werte
 * @returns {{quelle:string, reihen:number, cm:number}[]}
 */
export function zielQuellen(werte) {
  const liste = [];
  for (const quelle of ZIEL_QUELLEN) {
    const w = werte?.[quelle];
    if (w && Number.isInteger(w.reihen) && w.reihen >= 1 && Number.isFinite(w.cm)) liste.push({ quelle, reihen: w.reihen, cm: w.cm });
  }
  return liste;
}

/**
 * Wählt das Ziel (E23, E26, US-30 AK7).
 * @param {{quelle:string, reihen:number, cm:number}[]} quellen  aus zielQuellen
 * @param {string|null} wahl  gespeicherte Wahl der Nutzerin
 * @returns {{ziel:{quelle:string, reihen:number, cm:number}|null, auswahlAnzeigen:boolean}}
 */
export function waehleZiel(quellen, wahl) {
  if (quellen.length === 0) return { ziel: null, auswahlAnzeigen: false };
  const ziel = quellen.find((q) => q.quelle === wahl) ?? quellen[0];
  return { ziel, auswahlAnzeigen: quellen.length >= 2 };
}

/**
 * Gestrickte Länge = Reihe × Bezugshöhe ÷ Reihenanzahl der eigenen Probe (US-30 AK3).
 * @param {number} reihe
 * @param {{anzahl:number, bezugCm:number}|null} probeReihen
 * @returns {number|null}
 */
export function gestrickteLaengeCm(reihe, probeReihen) {
  if (!probeReihen) return null;
  return anzahlZuCm(reihe, probeReihen);
}

/**
 * Ist das Ziel erreicht oder überschritten? (US-30 AK6)
 * @param {number} reihe
 * @param {{reihen:number}|null} ziel
 */
export function zielErreicht(reihe, ziel) {
  return Boolean(ziel) && reihe >= ziel.reihen;
}

/**
 * Zu-/Abnahmen rund um die aktuelle Reihe (US-15).
 * @param {{reihe:number, maschen:number}[]} ereignisse  aufsteigend sortiert
 * @param {number} reihe  aktueller Zählerstand
 * @returns {{letzte:object|null, jetzt:object|null, naechste:object|null, uebernaechste:object|null}}
 */
export function ereignisseUm(ereignisse, reihe) {
  let letzte = null;
  let jetzt = null;
  const danach = [];
  for (const e of ereignisse) {
    if (e.reihe < reihe) letzte = e;
    else if (e.reihe === reihe) jetzt = e;
    else if (danach.length < 2) danach.push(e);
    else break;
  }
  return { letzte, jetzt, naechste: danach[0] ?? null, uebernaechste: danach[1] ?? null };
}

/**
 * Alles, was der Zähler eines Strickstücks braucht, aus den gespeicherten Texten.
 * @param {object} stueck  Strickstück (Schema 3)
 * @param {object|null} probe  zugeordnete Probe { anleitung, eigen } (Texte)
 * @param {string} einheit
 * @returns {{plan:object|null, quellen:object[], probeReihen:{anzahl:number,bezugCm:number}|null}}
 */
export function zaehlerDaten(stueck, probe, einheit) {
  const reihenAnleitung = probeAusTexten(probe?.anleitung, 'reihen', einheit);
  const reihenEigen = probeAusTexten(probe?.eigen, 'reihen', einheit);
  const werte = { plan: null, laengeZuReihen: null, reihenAusAnleitung: null };

  // Plan: Reihen gesamt und tatsächliche Länge, sobald sie gültig sind
  const plan = planAusTexten(stueck.plan, probe?.eigen, einheit);
  if (plan && plan.reihen >= 1 && plan.laengeCm !== null) werte.plan = { reihen: plan.reihen, cm: plan.laengeCm };

  // Die beiden Reihen-Rechner (US-04, US-06): „Deine Reihen“ und tatsächliche Höhe/Länge
  if (reihenAnleitung && reihenEigen) {
    const anp = (name) => pruefeZahl(stueck.rechner[name].anpassung, 'anpassung');
    const ausAnleitung = pruefeZahl(stueck.rechner.reihenAusAnleitung.eingabe, 'ganzPositiv');
    const a1 = anp('reihenAusAnleitung');
    if (ausAnleitung.gueltig && a1.gueltig) {
      const r = umrechnenAusAnleitung(ausAnleitung.wert, reihenAnleitung, reihenEigen, a1.wert);
      if (r.gueltig) werte.reihenAusAnleitung = { reihen: r.endgueltig, cm: r.cmTatsaechlich };
    }
    const ausLaenge = pruefeZahl(stueck.rechner.laengeZuReihen.eingabe, 'laenge');
    const a2 = anp('laengeZuReihen');
    if (ausLaenge.gueltig && a2.gueltig) {
      const r = umrechnenAusCm(zuCm(ausLaenge.wert, einheit), reihenAnleitung, reihenEigen, a2.wert);
      if (r.gueltig) werte.laengeZuReihen = { reihen: r.endgueltig, cm: r.cmTatsaechlich };
    }
  }

  return { plan, quellen: zielQuellen(werte), probeReihen: reihenEigen };
}
