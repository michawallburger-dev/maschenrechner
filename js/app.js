/**
 * Einstiegspunkt der App: verbindet Oberfläche, Zustand und reine Module.
 *
 * Nur dieses Modul greift auf das DOM zu. Rechnen, Prüfen, Formatieren,
 * Texte und Einheiten liegen in eigenen, testbaren Modulen.
 */

import { umrechnenAusAnleitung, umrechnenAusCm } from './rechner.js';
import { pruefeZahl, REGELN } from './eingabe.js';
import { formatZahl, formatGanzzahl, formatAbweichung, LEER_ANZEIGE } from './format.js';
import { text, localeFuer } from './texte.js';
import { zuCm, vonCm } from './einheiten.js';
import { laden, speichern, zuruecksetzen } from './speicher.js';

/** Die vier Rechner-Karten: welche Richtung (Maschen/Reihen) und welche Art. */
const KARTEN = {
  maschenAusAnleitung: { richtung: 'maschen', art: 'anleitung' },
  reihenAusAnleitung: { richtung: 'reihen', art: 'anleitung' },
  breiteZuMaschen: { richtung: 'maschen', art: 'laenge' },
  laengeZuReihen: { richtung: 'reihen', art: 'laenge' },
};

const SPEICHER_VERZOEGERUNG_MS = 300;

// ---------------------------------------------------------------------------
// Zustand
// ---------------------------------------------------------------------------

/** localStorage kann selbst beim Zugriff eine Ausnahme werfen (z. B. gesperrt). */
function holeSpeicher() {
  try {
    const s = window.localStorage;
    return s ?? null;
  } catch {
    return null;
  }
}

const speicher = holeSpeicher();
let { zustand, speicherbar } = laden(speicher);

/** IDs der Felder, die die Nutzerin schon berührt hat (für den Hinweis „leer“). */
const beruehrt = new Set();

let speicherTimer = null;

function sprache() {
  return zustand.einstellungen.sprache;
}

function einheit() {
  return zustand.einstellungen.laengeneinheit;
}

function locale() {
  return localeFuer(sprache());
}

/** Text in der eingestellten Sprache; {einheit} wird immer mit dem Kürzel gefüllt. */
function t(schluessel, werte = {}) {
  const einheitKuerzel = text(sprache(), `einheit.${einheit()}`);
  return text(sprache(), schluessel, { einheit: einheitKuerzel, ...werte });
}

/** Liest einen Wert über einen Pfad wie "probeEigen.maschenAnzahl". */
function liesPfad(objekt, pfad) {
  return pfad.split('.').reduce((o, teil) => (o == null ? undefined : o[teil]), objekt);
}

/** Schreibt einen Wert über einen Pfad wie "probeEigen.maschenAnzahl". */
function schreibePfad(objekt, pfad, wert) {
  const teile = pfad.split('.');
  const letzter = teile.pop();
  const ziel = teile.reduce((o, teil) => o[teil], objekt);
  ziel[letzter] = wert;
}

// ---------------------------------------------------------------------------
// Speichern
// ---------------------------------------------------------------------------

function jetztSpeichern() {
  clearTimeout(speicherTimer);
  speicherTimer = null;
  if (!speicherbar) return;
  if (!speichern(speicher, zustand)) {
    speicherbar = false;
    zeigeSpeicherHinweis();
  }
}

function speichernVerzoegert() {
  clearTimeout(speicherTimer);
  speicherTimer = setTimeout(jetztSpeichern, SPEICHER_VERZOEGERUNG_MS);
}

function zeigeSpeicherHinweis() {
  const hinweis = document.querySelector('[data-hinweis="speicher"]');
  if (hinweis) hinweis.hidden = speicherbar;
}

// ---------------------------------------------------------------------------
// Texte und Felder
// ---------------------------------------------------------------------------

/** Füllt alle statischen Texte aus texte.js ein (Sprache + Einheit). */
function texteAnwenden() {
  document.documentElement.lang = sprache();
  document.title = t('app.titel');
  for (const el of document.querySelectorAll('[data-text]')) {
    el.textContent = t(el.dataset.text);
  }
  for (const el of document.querySelectorAll('[data-text-aria-label]')) {
    el.setAttribute('aria-label', t(el.dataset.textAriaLabel));
  }
}

/** Überträgt die gespeicherten Texte in die Eingabefelder. */
function felderBefuellen() {
  for (const input of document.querySelectorAll('input[data-feld]')) {
    const wert = liesPfad(zustand, input.dataset.feld);
    input.value = typeof wert === 'string' ? wert : '';
  }
}

/**
 * Prüft ein Feld und zeigt ggf. die Fehlermeldung an.
 * Der Hinweis „leer“ erscheint erst, wenn das Feld berührt wurde.
 * @returns {{gueltig:boolean, wert?:number|null, fehler?:string}}
 */
function pruefeFeld(input) {
  const ergebnis = pruefeZahl(input.value, input.dataset.regel);
  const fehlerEl = document.getElementById(`fehler-${input.id}`);
  const anzeigen = !ergebnis.gueltig && (ergebnis.fehler !== 'LEER' || beruehrt.has(input.id));

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

function grenzeAnzeigen(grenze) {
  if (typeof grenze !== 'number') return '';
  return grenze < 0 ? `−${Math.abs(grenze)}` : String(grenze);
}

// ---------------------------------------------------------------------------
// Berechnung und Anzeige
// ---------------------------------------------------------------------------

function setzeErgebnis(schluessel, anzeige) {
  const el = document.querySelector(`[data-ergebnis="${schluessel}"]`);
  if (el) el.textContent = anzeige;
}

function setzeStatus(karte, schluessel) {
  const el = document.querySelector(`[data-status="${karte}"]`);
  if (!el) return;
  if (schluessel) {
    el.textContent = t(schluessel);
    el.hidden = false;
  } else {
    el.textContent = '';
    el.hidden = true;
  }
}

/**
 * Liest eine Probe (Anleitung oder eigene) für eine Richtung.
 * @returns {{anzahl:number, bezugCm:number}|null} null, wenn ungültig
 */
function probeAusErgebnissen(ergebnisse, probeName, richtung) {
  const anzahl = ergebnisse.get(`${probeName}.${richtung}Anzahl`);
  const bezug = ergebnisse.get(`${probeName}.${richtung}Bezug`);
  if (!anzahl?.gueltig || !bezug?.gueltig) return null;
  return { anzahl: anzahl.wert, bezug: bezug.wert, bezugCm: zuCm(bezug.wert, einheit()) };
}

/** Dichte in der Anzeigeeinheit (z. B. Maschen pro cm) anzeigen. */
function zeigeDichte(probeName, richtung, probe) {
  const schluessel = `${probeName}.dichte${richtung === 'maschen' ? 'Maschen' : 'Reihen'}`;
  setzeErgebnis(schluessel, probe ? formatZahl(probe.anzahl / probe.bezug, locale()) : LEER_ANZEIGE);
}

function leereKarte(name) {
  for (const feld of ['massAnleitung', 'anleitungGerundet', 'eigenGerundet', 'endgueltig', 'tatsaechlich', 'abweichung']) {
    setzeErgebnis(`${name}.${feld}`, LEER_ANZEIGE);
  }
}

/** Berechnet eine Rechner-Karte und zeigt die Ergebnisse an. */
function berechneKarte(name, ergebnisse, proben) {
  const { richtung, art } = KARTEN[name];
  const eingabe = ergebnisse.get(`rechner.${name}.eingabe`);
  const anpassung = ergebnisse.get(`rechner.${name}.anpassung`);
  const probeAnleitung = proben.anleitung[richtung];
  const probeEigen = proben.eigen[richtung];

  leereKarte(name);
  setzeStatus(name, null);

  if (!eingabe?.gueltig) return;
  if (!probeAnleitung || !probeEigen) {
    setzeStatus(name, 'hinweis.probenFehlen');
    return;
  }

  const anpassungWert = anpassung?.gueltig ? anpassung.wert : 0;
  const loc = locale();
  const e = einheit();
  let r;

  if (art === 'anleitung') {
    r = umrechnenAusAnleitung(eingabe.wert, probeAnleitung, probeEigen, anpassungWert);
    setzeErgebnis(`${name}.massAnleitung`, formatZahl(vonCm(r.cmLautAnleitung, e), loc));
  } else {
    r = umrechnenAusCm(zuCm(eingabe.wert, e), probeAnleitung, probeEigen, anpassungWert);
    setzeErgebnis(`${name}.anleitungGerundet`, formatGanzzahl(r.anleitungGerundet, loc));
  }
  setzeErgebnis(`${name}.eigenGerundet`, formatGanzzahl(r.eigenGerundet, loc));

  // Bei ungültiger Anpassung kein Endergebnis zeigen (Fehler steht am Feld)
  if (!anpassung?.gueltig) return;

  if (!r.gueltig) {
    setzeStatus(name, 'hinweis.ergebnisZuKlein');
    return;
  }
  setzeErgebnis(`${name}.endgueltig`, formatGanzzahl(r.endgueltig, loc));
  setzeErgebnis(`${name}.tatsaechlich`, formatZahl(vonCm(r.cmTatsaechlich, e), loc));
  setzeErgebnis(`${name}.abweichung`, formatAbweichung(vonCm(r.abweichungCm, e), loc));
}

/** Prüft alle Felder und berechnet alles neu (US-02, AK7: sofort, ohne Knopf). */
function aktualisieren() {
  const ergebnisse = new Map();
  for (const input of document.querySelectorAll('input[data-feld][data-regel]')) {
    ergebnisse.set(input.dataset.feld, pruefeFeld(input));
  }

  const proben = { anleitung: {}, eigen: {} };
  for (const richtung of ['maschen', 'reihen']) {
    proben.anleitung[richtung] = probeAusErgebnissen(ergebnisse, 'probeAnleitung', richtung);
    proben.eigen[richtung] = probeAusErgebnissen(ergebnisse, 'probeEigen', richtung);
    zeigeDichte('probeAnleitung', richtung, proben.anleitung[richtung]);
    zeigeDichte('probeEigen', richtung, proben.eigen[richtung]);
  }

  for (const name of Object.keys(KARTEN)) {
    berechneKarte(name, ergebnisse, proben);
  }
}

// ---------------------------------------------------------------------------
// Ereignisse
// ---------------------------------------------------------------------------

function beiEingabe(ereignis) {
  const input = ereignis.target;
  if (!(input instanceof HTMLInputElement) || !input.dataset.feld) return;
  schreibePfad(zustand, input.dataset.feld, input.value);
  beruehrt.add(input.id);
  aktualisieren();
  speichernVerzoegert();
}

function beiFokusVerlust(ereignis) {
  const input = ereignis.target;
  if (!(input instanceof HTMLInputElement) || !input.dataset.feld) return;
  if (!beruehrt.has(input.id)) {
    beruehrt.add(input.id);
    aktualisieren();
  }
}

/** −/+-Knöpfe der Anpassung. Ungültiger Inhalt zählt als 0. */
function beiKlick(ereignis) {
  const knopf = ereignis.target.closest('[data-schritt]');
  if (!knopf) return;
  const input = document.getElementById(knopf.dataset.ziel);
  if (!input) return;

  const regel = REGELN.anpassung;
  const aktuell = pruefeZahl(input.value, 'anpassung');
  const basis = aktuell.gueltig ? aktuell.wert : 0;
  const neu = Math.min(regel.max, Math.max(regel.min, basis + Number(knopf.dataset.schritt)));

  input.value = String(neu);
  schreibePfad(zustand, input.dataset.feld, input.value);
  beruehrt.add(input.id);
  aktualisieren();
  speichernVerzoegert();
}

function zuruecksetzenEinrichten() {
  const dialog = document.getElementById('dialog-zuruecksetzen');
  const oeffnen = document.getElementById('knopf-zuruecksetzen');
  const abbrechen = document.getElementById('dialog-abbrechen');
  const bestaetigen = document.getElementById('dialog-bestaetigen');
  if (!dialog || !oeffnen) return;

  oeffnen.addEventListener('click', () => {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    }
  });
  abbrechen?.addEventListener('click', () => dialog.close());
  bestaetigen?.addEventListener('click', () => {
    clearTimeout(speicherTimer);
    zustand = zuruecksetzen(speicherbar ? speicher : null, zustand.einstellungen);
    beruehrt.clear();
    felderBefuellen();
    aktualisieren();
    dialog.close();
  });
}

function serviceWorkerRegistrieren() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;
  navigator.serviceWorker.register('./sw.js').catch(() => {
    // Ohne Service Worker funktioniert die App weiterhin, nur nicht offline.
  });
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

function starten() {
  texteAnwenden();
  felderBefuellen();
  zeigeSpeicherHinweis();
  aktualisieren();

  document.addEventListener('input', beiEingabe);
  document.addEventListener('focusout', beiFokusVerlust);
  document.addEventListener('click', beiKlick);
  zuruecksetzenEinrichten();

  // Beim Verlassen sofort speichern, damit nichts verloren geht
  window.addEventListener('pagehide', jetztSpeichern);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') jetztSpeichern();
  });

  serviceWorkerRegistrieren();
}

starten();
