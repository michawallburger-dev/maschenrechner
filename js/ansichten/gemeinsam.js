/**
 * Gemeinsame Helfer der Ansichten: Feldprüfung anzeigen, Proben lesen,
 * Mengenangaben und Datumsangaben in Worten.
 */

import { pruefeZahl } from '../eingabe.js';
import { zuCm } from '../einheiten.js';

/** Grenze für Fehlermeldungen, mit typografischem Minus. */
export function grenzeAnzeigen(grenze) {
  if (typeof grenze !== 'number') return '';
  return grenze < 0 ? `−${Math.abs(grenze)}` : String(grenze);
}

/**
 * Prüft ein Eingabefeld nach seiner Regel und zeigt ggf. die Meldung an.
 * - „leer“ erscheint erst, wenn das Feld berührt wurde,
 * - „unvollständig“ (z. B. „12,“) erst, wenn das Feld verlassen wurde (MAS-31).
 * @param {HTMLInputElement} input
 * @param {HTMLElement|null} fehlerEl
 * @param {string} regel
 * @param {{t:Function, beruehrt:boolean}} optionen
 */
export function pruefeUndZeige(input, fehlerEl, regel, { t, beruehrt }) {
  const ergebnis = pruefeZahl(input.value, regel);
  let anzeigen = false;
  if (!ergebnis.gueltig) {
    if (ergebnis.fehler === 'LEER') anzeigen = beruehrt;
    else if (ergebnis.fehler === 'UNVOLLSTAENDIG') anzeigen = beruehrt && document.activeElement !== input;
    else anzeigen = true;
  }
  if (anzeigen) {
    input.setAttribute('aria-invalid', 'true');
    if (fehlerEl) {
      fehlerEl.textContent = t(`fehler.${ergebnis.fehler}`, { grenze: grenzeAnzeigen(ergebnis.grenze) });
      fehlerEl.hidden = false;
    }
  } else {
    input.removeAttribute('aria-invalid');
    if (fehlerEl) {
      fehlerEl.textContent = '';
      fehlerEl.hidden = true;
    }
  }
  return ergebnis;
}

/**
 * Liest eine Probe (Texte aus dem Projekt) für eine Richtung.
 * @param {object} probe     z. B. projekt.probeEigen
 * @param {'maschen'|'reihen'} richtung
 * @param {string} einheit
 * @returns {{anzahl:number, bezug:number, bezugCm:number}|null}
 */
export function probeLesen(probe, richtung, einheit) {
  const anzahl = pruefeZahl(probe[`${richtung}Anzahl`], 'probenAnzahl');
  const bezug = pruefeZahl(probe[`${richtung}Bezug`], 'bezugsmass');
  if (!anzahl.gueltig || !bezug.gueltig) return null;
  return { anzahl: anzahl.wert, bezug: bezug.wert, bezugCm: zuCm(bezug.wert, einheit) };
}

/** „1 Strickstück“, „3 Strickstücke“, „keine Strickstücke“. */
export function anzahlText(t, art, n) {
  if (n === 0) return t(`anzahl.${art}.keins`);
  if (n === 1) return t(`anzahl.${art}.eins`);
  return t(`anzahl.${art}.mehr`, { n });
}

/** „heute“, „gestern“ oder ein Datum. */
export function wannText(t, locale, iso, jetzt = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const tag = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const differenz = Math.round((tag(jetzt) - tag(d)) / 86400000);
  if (differenz === 0) return t('zeit.heute');
  if (differenz === 1) return t('zeit.gestern');
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(d);
}
