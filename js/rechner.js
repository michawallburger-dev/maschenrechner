/**
 * Rechenlogik des Maschenrechners.
 *
 * Alle Funktionen sind rein: Sie haben keinen Zustand, greifen weder auf das DOM
 * noch auf den Speicher zu und werfen keine Ausnahmen.
 *
 * Alle Längen sind in Zentimetern. Die Umrechnung aus einer anderen
 * Anzeigeeinheit erfolgt vorher (siehe einheiten.js).
 *
 * Eine Maschenprobe wird je Richtung als { anzahl, bezugCm } übergeben,
 * z. B. { anzahl: 34, bezugCm: 10 } für „34 Maschen auf 10 cm“.
 */

/**
 * Rundet kaufmännisch auf eine ganze Zahl (x,5 wird aufgerundet).
 * Gleitkomma-Reste werden vorher auf 9 Nachkommastellen bereinigt,
 * damit z. B. 25,499999999999996 (eigentlich 25,5) korrekt zu 26 wird.
 * Nur für nicht-negative Werte vorgesehen.
 * @param {number} wert
 * @returns {number}
 */
export function runden(wert) {
  return Math.round(Number(wert.toFixed(9)));
}

/**
 * Dichte einer Probe: Maschen bzw. Reihen pro Zentimeter.
 * @param {{anzahl:number, bezugCm:number}} probe
 * @returns {number}
 */
export function dichteProCm(probe) {
  return probe.anzahl / probe.bezugCm;
}

/**
 * Wie viele Maschen/Reihen ergeben die angegebenen Zentimeter? (ungerundet)
 * @param {number} cm
 * @param {{anzahl:number, bezugCm:number}} probe
 * @returns {number}
 */
export function cmZuAnzahl(cm, probe) {
  return (cm * probe.anzahl) / probe.bezugCm;
}

/**
 * Wie viele Zentimeter ergeben n Maschen/Reihen?
 * @param {number} n
 * @param {{anzahl:number, bezugCm:number}} probe
 * @returns {number}
 */
export function anzahlZuCm(n, probe) {
  return (n * probe.bezugCm) / probe.anzahl;
}

/**
 * Gemeinsamer letzter Schritt: Anpassung anwenden, tatsächliches Maß
 * und Abweichung zum Zielmaß bestimmen.
 * @param {number} eigenGerundet
 * @param {number} anpassung   ganze Zahl, darf negativ sein
 * @param {{anzahl:number, bezugCm:number}} probeEigen
 * @param {number} zielCm      Maß, mit dem verglichen wird
 */
function abschliessen(eigenGerundet, anpassung, probeEigen, zielCm) {
  const endgueltig = eigenGerundet + anpassung;
  if (endgueltig < 1) {
    return { gueltig: false, fehler: 'ERGEBNIS_ZU_KLEIN', eigenGerundet, endgueltig };
  }
  const cmTatsaechlich = anzahlZuCm(endgueltig, probeEigen);
  return {
    gueltig: true,
    eigenGerundet,
    endgueltig,
    cmTatsaechlich,
    abweichungCm: cmTatsaechlich - zielCm,
  };
}

/**
 * US-03 / US-04: Eine Maschen- oder Reihenzahl aus der Anleitung
 * auf die eigene Probe umrechnen.
 * @param {number} n               ganze Zahl ≥ 1 laut Anleitung
 * @param {{anzahl:number, bezugCm:number}} probeAnleitung
 * @param {{anzahl:number, bezugCm:number}} probeEigen
 * @param {number} [anpassung=0]   ganze Zahl, darf negativ sein
 */
export function umrechnenAusAnleitung(n, probeAnleitung, probeEigen, anpassung = 0) {
  const cmLautAnleitung = anzahlZuCm(n, probeAnleitung);
  const eigenGerundet = runden(cmZuAnzahl(cmLautAnleitung, probeEigen));
  return {
    cmLautAnleitung,
    ...abschliessen(eigenGerundet, anpassung, probeEigen, cmLautAnleitung),
  };
}

/**
 * US-05 / US-06: Eine gewünschte Breite oder Länge in Maschen bzw. Reihen
 * umrechnen – laut Anleitung und mit eigener Probe.
 * @param {number} cm              gewünschtes Maß in cm (> 0)
 * @param {{anzahl:number, bezugCm:number}} probeAnleitung
 * @param {{anzahl:number, bezugCm:number}} probeEigen
 * @param {number} [anpassung=0]   ganze Zahl, darf negativ sein
 */
export function umrechnenAusCm(cm, probeAnleitung, probeEigen, anpassung = 0) {
  const anleitungGerundet = runden(cmZuAnzahl(cm, probeAnleitung));
  const eigenGerundet = runden(cmZuAnzahl(cm, probeEigen));
  return {
    anleitungGerundet,
    ...abschliessen(eigenGerundet, anpassung, probeEigen, cm),
  };
}
