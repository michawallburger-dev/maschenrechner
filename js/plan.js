/**
 * Zu- und Abnahmeplan (US-13, US-16).
 *
 * Reine Funktionen: kein DOM, kein Speicher, keine Ausnahmen.
 * Alle Längen sind in Zentimetern. Eine Probe wird je Richtung als
 * { anzahl, bezugCm } übergeben (wie in rechner.js).
 *
 * Verbindliche Regeln (Architektur Sprint 3, Abschnitt 4):
 * - Erste und letzte Reihe bleiben frei (E24, vorläufig).
 * - „Nur jede 2. Reihe/Runde“: nur ungerade Reihen bzw. Runden ab 3 (E25).
 * - Ereignis i (0 … E−1) liegt auf dem Platz floor((i+1)·(n+1)/(E+1)) − 1
 *   der n erlaubten Reihen. Nur Ganzzahl-Arithmetik, keine Listen der Länge n,
 *   damit auch sehr lange Teile keinen Speicher kosten.
 */

import { runden, cmZuAnzahl, anzahlZuCm } from './rechner.js';
import { pruefeZahl } from './eingabe.js';
import { zuCm } from './einheiten.js';

/** Höchstzahl der Zu-/Abnahmen in einem Plan (Architektur H1, vom PO bestätigt). */
export const MAX_EREIGNISSE = 9999;

/** Arbeitsweisen eines Plans. */
export const ARBEITSWEISEN = Object.freeze(['reihen', 'runden']);

/** Mögliche Auswahl bei nicht teilbarer Differenz (richtungsneutral). */
export const EREIGNIS_WAHLEN = Object.freeze(['weniger', 'mehr']);

// ---------------------------------------------------------------- Erlaubte Reihen

/**
 * Beschreibt die Reihen, in denen zu- oder abgenommen werden darf.
 * Statt einer Liste wird nur die Anzahl und eine Abbildung Platz → Reihe geliefert.
 * @param {number} reihen       Reihen gesamt (ganze Zahl ≥ 1)
 * @param {boolean} jedeZweite  nur ungerade Reihen/Runden ab 3
 * @returns {{anzahl:number, reihe:(platz:number)=>number}}
 */
export function erlaubteReihen(reihen, jedeZweite) {
  if (!jedeZweite) {
    // Reihen 2 … reihen−1
    return { anzahl: Math.max(0, reihen - 2), reihe: (platz) => platz + 2 };
  }
  // Ungerade Reihen 3, 5, 7 … ≤ reihen−1
  const letzte = reihen - 1;
  const anzahl = letzte >= 3 ? Math.floor((letzte - 3) / 2) + 1 : 0;
  return { anzahl, reihe: (platz) => 3 + 2 * platz };
}

/**
 * Verteilt e Ereignisse möglichst gleichmäßig auf n Plätze.
 * @param {number} e   Anzahl Ereignisse (0 ≤ e ≤ n)
 * @param {number} n   Anzahl Plätze
 * @returns {number[]} Plätze (0-basiert), aufsteigend und ohne Doppelte
 */
export function verteile(e, n) {
  const plaetze = [];
  for (let i = 0; i < e; i++) plaetze.push(Math.floor(((i + 1) * (n + 1)) / (e + 1)) - 1);
  return plaetze;
}

// ---------------------------------------------------------------- Berechnung

/**
 * Berechnet einen Zu-/Abnahmeplan.
 *
 * @param {{
 *   anfangCm:number, endCm:number, laengeCm:number,
 *   proEreignis:number, runden?:boolean, jedeZweite?:boolean,
 *   ereignisWahl?:('weniger'|'mehr'|null),
 *   anpassung?:{anfang?:number, ende?:number, reihen?:number}
 * }} e  bereits geprüfte Zahlen
 * @param {{maschen:{anzahl:number,bezugCm:number}, reihen:{anzahl:number,bezugCm:number}}} probe  eigene Probe
 *
 * @returns {object} Immer mit den Grundwerten (soweit berechenbar) und einem „status“:
 *   - 'plan'           gültiger Plan mit „ereignisse“
 *   - 'keineAenderung' Anfangs- und Endmaschen gleich oder „keine Zu-/Abnahme“ gewählt
 *   - 'auswahl'        Differenz nicht teilbar, „optionen“ zur Wahl
 *   - 'fehler'         „fehler“: ERGEBNIS_ZU_KLEIN (mit „feld“) | ZU_WENIG_REIHEN | ZU_VIELE_EREIGNISSE
 * Bei nicht teilbarer Differenz enthält das Ergebnis immer „optionen“ und „gewaehlt“,
 * auch nach der Wahl (S3-02). Die Option „weniger“ kann 0 Ereignisse haben (S3-01).
 */
export function berechnePlan(e, probe) {
  const anpassung = { anfang: 0, ende: 0, reihen: 0, ...(e.anpassung ?? {}) };

  // 1. Grundwerte (US-13 AK2)
  const anfangGerundet = runden(cmZuAnzahl(e.anfangCm, probe.maschen));
  const endGerundet = runden(cmZuAnzahl(e.endCm, probe.maschen));
  const reihenGerundet = runden(cmZuAnzahl(e.laengeCm, probe.reihen));

  // 2. Anpassungen (US-16)
  const anfang = anfangGerundet + anpassung.anfang;
  const endeBerechnet = endGerundet + anpassung.ende;
  const reihen = reihenGerundet + anpassung.reihen;

  const basis = {
    anfangGerundet,
    endGerundet,
    reihenGerundet,
    anfang,
    ende: endeBerechnet,
    reihen,
    anfangCm: anfang >= 1 ? anzahlZuCm(anfang, probe.maschen) : null,
    endCm: endeBerechnet >= 1 ? anzahlZuCm(endeBerechnet, probe.maschen) : null,
    laengeCm: reihen >= 1 ? anzahlZuCm(reihen, probe.reihen) : null,
    proEreignis: e.proEreignis,
    runden: e.runden === true,
  };

  for (const [feld, wert] of [['anfang', anfang], ['ende', endeBerechnet], ['reihen', reihen]]) {
    if (wert < 1) return { ...basis, status: 'fehler', fehler: 'ERGEBNIS_ZU_KLEIN', feld };
  }

  // 3. Richtung (AK3)
  const differenz = endeBerechnet - anfang;
  if (differenz === 0) return { ...basis, status: 'keineAenderung' };
  const richtung = differenz > 0 ? 'zu' : 'ab';
  const vorzeichen = differenz > 0 ? 1 : -1;
  const betrag = Math.abs(differenz);

  // 4. Teilbarkeit (AK4, US-16 AK2)
  let ereignisse = betrag / e.proEreignis;
  let ende = endeBerechnet;
  let gewaehlt = null;
  let optionen = null;
  if (betrag % e.proEreignis !== 0) {
    optionen = [];
    for (const wahl of EREIGNIS_WAHLEN) {
      const anzahl = wahl === 'weniger' ? Math.floor(ereignisse) : Math.ceil(ereignisse);
      const endMaschen = anfang + vorzeichen * anzahl * e.proEreignis;
      // „weniger“ darf 0 Zu-/Abnahmen haben – das ist die Option „keine Zu-/Abnahme“ (S3-01)
      if (endMaschen < 1) continue;
      optionen.push({ wahl, endMaschen, endCm: anzahlZuCm(endMaschen, probe.maschen), ereignisse: anzahl });
    }
    const option = optionen.find((o) => o.wahl === e.ereignisWahl);
    if (!option) return { ...basis, status: 'auswahl', richtung, optionen };
    ereignisse = option.ereignisse;
    ende = option.endMaschen;
    gewaehlt = option.wahl;
  }

  // Die Optionen bleiben auch nach der Wahl im Ergebnis, damit die Wahl sichtbar und änderbar bleibt (S3-02)
  const mitWahl = { ...basis, ende, endCm: anzahlZuCm(ende, probe.maschen), richtung, anzahlEreignisse: ereignisse, gewaehlt, optionen };

  // Gewählt wurde „keine Zu-/Abnahme“ (S3-01)
  if (ereignisse === 0) return { ...mitWahl, status: 'keineAenderung' };

  // 7. Technische Grenze (vor dem Verteilen geprüft)
  if (ereignisse > MAX_EREIGNISSE) return { ...mitWahl, status: 'fehler', fehler: 'ZU_VIELE_EREIGNISSE', grenze: MAX_EREIGNISSE };

  // 5./6. Erlaubte Reihen und genug Platz (AK5, AK7)
  const erlaubt = erlaubteReihen(reihen, e.jedeZweite === true);
  if (ereignisse > erlaubt.anzahl) {
    return { ...mitWahl, status: 'fehler', fehler: 'ZU_WENIG_REIHEN', moeglich: erlaubt.anzahl };
  }

  // 8. Verteilung (AK6)
  const liste = verteile(ereignisse, erlaubt.anzahl).map((platz) => ({
    reihe: erlaubt.reihe(platz),
    maschen: vorzeichen * e.proEreignis,
  }));
  let abstandMin = null;
  let abstandMax = null;
  for (let i = 1; i < liste.length; i++) {
    const abstand = liste[i].reihe - liste[i - 1].reihe;
    abstandMin = abstandMin === null ? abstand : Math.min(abstandMin, abstand);
    abstandMax = abstandMax === null ? abstand : Math.max(abstandMax, abstand);
  }

  return { ...mitWahl, status: 'plan', ereignisse: liste, abstandMin, abstandMax };
}

// ---------------------------------------------------------------- Aus gespeicherten Texten

/**
 * Liest eine Probe (Texte) für eine Richtung. Ungültig → null.
 * @param {object} probeTexte  z. B. { maschenAnzahl:'25', maschenBezug:'10', … }
 * @param {'maschen'|'reihen'} richtung
 * @param {string} einheit     Anzeigeeinheit der Bezugsmaße
 * @returns {{anzahl:number, bezugCm:number}|null}
 */
export function probeAusTexten(probeTexte, richtung, einheit) {
  if (!probeTexte) return null;
  const anzahl = pruefeZahl(probeTexte[`${richtung}Anzahl`], 'probenAnzahl');
  const bezug = pruefeZahl(probeTexte[`${richtung}Bezug`], 'bezugsmass');
  if (!anzahl.gueltig || !bezug.gueltig) return null;
  return { anzahl: anzahl.wert, bezugCm: zuCm(bezug.wert, einheit) };
}

/**
 * Liest die Eingaben eines gespeicherten Plans. Ungültige Felder → null.
 * @param {object} planTexte  plan aus dem Strickstück (Schema 3)
 * @param {string} einheit
 * @returns {object|null} Eingaben für berechnePlan
 */
export function planEingabenAusTexten(planTexte, einheit) {
  if (!planTexte) return null;
  const zahl = (wert, regel) => pruefeZahl(wert, regel);
  const anfang = zahl(planTexte.anfangBreite, 'laenge');
  const ende = zahl(planTexte.endBreite, 'laenge');
  const laenge = zahl(planTexte.laenge, 'laenge');
  const pro = zahl(planTexte.maschenProEreignis, 'proEreignis');
  const a = planTexte.anpassung ?? {};
  const anp = ['anfang', 'ende', 'reihen'].map((k) => zahl(a[k], 'anpassung'));
  if (![anfang, ende, laenge, pro, ...anp].every((r) => r.gueltig)) return null;
  return {
    anfangCm: zuCm(anfang.wert, einheit),
    endCm: zuCm(ende.wert, einheit),
    laengeCm: zuCm(laenge.wert, einheit),
    proEreignis: pro.wert,
    runden: planTexte.arbeitsweise === 'runden',
    jedeZweite: planTexte.jedeZweite === true,
    ereignisWahl: planTexte.ereignisWahl ?? null,
    anpassung: { anfang: anp[0].wert, ende: anp[1].wert, reihen: anp[2].wert },
  };
}

/**
 * Berechnet den Plan eines Strickstücks direkt aus den gespeicherten Texten.
 * @param {object|null} planTexte
 * @param {object|null} probeEigenTexte  eigene Probe des Strickstücks
 * @param {string} einheit
 * @returns {object|null} Ergebnis von berechnePlan oder null (kein Plan, Eingaben oder Probe ungültig)
 */
export function planAusTexten(planTexte, probeEigenTexte, einheit) {
  const eingaben = planEingabenAusTexten(planTexte, einheit);
  const maschen = probeAusTexten(probeEigenTexte, 'maschen', einheit);
  const reihen = probeAusTexten(probeEigenTexte, 'reihen', einheit);
  if (!eingaben || !maschen || !reihen) return null;
  return berechnePlan(eingaben, { maschen, reihen });
}
