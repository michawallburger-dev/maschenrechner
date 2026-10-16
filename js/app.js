/**
 * Einstiegspunkt der App (ab 0.2): lädt die Daten, wendet das Farbschema an,
 * verbindet den Router mit den Ansichten und speichert Änderungen.
 *
 * Rechnen, Prüfen, Datenmodell, Sicherung und Texte liegen in eigenen,
 * reinen Modulen; die Ansichten bekommen alles über das Objekt „ctx“.
 */

import { text, localeFuer } from './texte.js';
import { ladeDaten, speichereDaten } from './speicher.js';
import { neueId, jetztIso, erzeugeWachhalter, teileDatei, leseDatei, systemIstDunkel, beiSystemFarbwechsel } from './geraet.js';
import { starteRouter, navigiere, hashFuer } from './router.js';
import { texteFuellen, leeren } from './dom.js';
import * as projektliste from './ansichten/projektliste.js';
import * as projekt from './ansichten/projekt.js';
import * as strickstueck from './ansichten/strickstueck.js';
import * as zaehler from './ansichten/zaehler.js';
import * as einstellungen from './ansichten/einstellungen.js';

export const APP_VERSION = '0.2.0';

const SPEICHER_VERZOEGERUNG_MS = 300;
const THEME_FARBE = { hell: '#7a2e4a', dunkel: '#1d1a19' };

const ANSICHTEN = { liste: projektliste, projekt, strickstueck, zaehlen: zaehler, einstellungen };

// ---------------------------------------------------------------- Speicher und Daten

/** localStorage kann selbst beim Zugriff eine Ausnahme werfen (z. B. gesperrt). */
function holeSpeicher() {
  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

const speicher = holeSpeicher();
const geladen = ladeDaten(speicher, {
  neueId,
  jetzt: jetztIso(),
  projektName: text('de', 'migration.projektName'),
  stueckName: text('de', 'migration.stueckName'),
});
let daten = geladen.daten;
let speicherbar = geladen.speicherbar;
let speicherTimer = null;
let ungespeichert = false; // nur speichern, wenn sich wirklich etwas geändert hat

function jetztSpeichern() {
  clearTimeout(speicherTimer);
  speicherTimer = null;
  if (!speicherbar || !ungespeichert) return;
  ungespeichert = false;
  if (!speichereDaten(speicher, daten)) {
    speicherbar = false;
    zeigeSpeicherHinweis();
  }
}

function zeigeSpeicherHinweis() {
  document.querySelector('[data-hinweis="speicher"]').hidden = speicherbar;
}

// ---------------------------------------------------------------- Texte

const sprache = () => daten.einstellungen.sprache;
const einheit = () => daten.einstellungen.laengeneinheit;
const locale = () => localeFuer(sprache());

/** Text in der eingestellten Sprache; {einheit} wird immer mit dem Kürzel gefüllt. */
function t(schluessel, werte = {}) {
  return text(sprache(), schluessel, { einheit: text(sprache(), `einheit.${einheit()}`), ...werte });
}

// ---------------------------------------------------------------- Farbschema (US-26)

function farbschemaAnwenden() {
  const wahl = daten.einstellungen.farbschema;
  const wurzel = document.documentElement;
  if (wahl === 'system') wurzel.removeAttribute('data-farbschema');
  else wurzel.dataset.farbschema = wahl;
  const dunkel = wahl === 'dunkel' || (wahl === 'system' && systemIstDunkel());
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dunkel ? THEME_FARBE.dunkel : THEME_FARBE.hell);
}

// ---------------------------------------------------------------- Kopfzeile und Meldungen

const kopfTitel = document.getElementById('kopf-titel');
const kopfZurueck = document.getElementById('kopf-zurueck');
const kopfZahnrad = document.getElementById('kopf-zahnrad');
const meldungEl = document.querySelector('[data-hinweis="meldung"]');
let offeneMeldung = null;

function setzeTitel(titel, seitentitel = titel) {
  kopfTitel.textContent = titel;
  document.title = t('titel.seite', { ansicht: seitentitel });
}

// ---------------------------------------------------------------- Kontext für die Ansichten

const ctx = {
  appVersion: APP_VERSION,
  speicher,
  daten: () => daten,
  /** Übernimmt neue Daten; gespeichert wird verzögert oder sofort. */
  aendern(neu, { sofort = false } = {}) {
    daten = neu;
    ungespeichert = true;
    clearTimeout(speicherTimer);
    if (sofort) jetztSpeichern();
    else speicherTimer = setTimeout(jetztSpeichern, SPEICHER_VERZOEGERUNG_MS);
  },
  /** Ersetzt die Daten nach einem Import (bereits gespeichert). */
  ersetzeDaten(neu) {
    clearTimeout(speicherTimer);
    ungespeichert = false;
    daten = neu;
    ctx.uebernommenesProjekt = null;
  },
  speicherbar: () => speicherbar,
  uebernommenesProjekt: geladen.uebernommenesProjekt,
  t,
  locale,
  einheit,
  jetzt: jetztIso,
  neueId,
  navigiere,
  setzeTitel: (titel) => setzeTitel(titel),
  fokusTitel: () => kopfTitel.focus(),
  farbschemaAnwenden,
  erzeugeWachhalter,
  teileDatei,
  leseDatei,
  meldung(textMeldung) {
    offeneMeldung = textMeldung;
  },
};

// ---------------------------------------------------------------- Router

const wurzel = document.getElementById('ansicht');
let aufraeumen = null;

function zeigeAnsicht(route) {
  if (aufraeumen) aufraeumen();
  aufraeumen = null;
  // Offene Dialoge schließen (z. B. nach der Zurück-Geste)
  for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close();
  leeren(wurzel);

  const ergebnis = ANSICHTEN[route.ansicht].zeige(ctx, route, wurzel);
  if (!ergebnis) {
    // Unbekanntes Projekt/Strickstück (z. B. gelöscht): zur Liste
    navigiere({ ansicht: 'liste' }, { ersetzen: true });
    return;
  }
  aufraeumen = ergebnis.aufraeumen ?? null;
  setzeTitel(ergebnis.titel, ergebnis.seitentitel ?? ergebnis.titel);
  document.body.dataset.ansicht = route.ansicht;

  kopfZurueck.hidden = !ergebnis.zurueck;
  if (ergebnis.zurueck) kopfZurueck.href = hashFuer(ergebnis.zurueck);
  kopfZahnrad.hidden = route.ansicht === 'einstellungen';

  meldungEl.textContent = offeneMeldung ?? '';
  meldungEl.hidden = !offeneMeldung;
  offeneMeldung = null;

  window.scrollTo(0, 0);
  kopfTitel.focus({ preventScroll: true });
}

// ---------------------------------------------------------------- Start

document.documentElement.lang = sprache();
texteFuellen(document.querySelector('.kopf'), t);
texteFuellen(document.querySelector('[data-hinweis="speicher"]'), t);
farbschemaAnwenden();
beiSystemFarbwechsel(farbschemaAnwenden);
zeigeSpeicherHinweis();

// Beim Verlassen/Sperren sofort speichern
window.addEventListener('pagehide', jetztSpeichern);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') jetztSpeichern();
});

// Nach der Übernahme aus 0.1 direkt das neue Projekt zeigen (US-27)
if (geladen.uebernommenesProjekt && (location.hash === '' || location.hash === '#' || location.hash === '#/')) {
  history.replaceState(null, '', hashFuer({ ansicht: 'projekt', projektId: geladen.uebernommenesProjekt }));
}
starteRouter(zeigeAnsicht);

// Offline-Fähigkeit
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(() => {
    // ohne Service Worker funktioniert die App weiterhin, nur nicht offline
  });
}
