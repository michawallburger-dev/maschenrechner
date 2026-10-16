/**
 * Hash-Navigation. Funktioniert auf GitHub Pages ohne Serverkonfiguration und offline;
 * die Zurück-Geste des iPhones geht damit wie gewohnt.
 *
 *   #/                              Projektliste
 *   #/p/<projektId>                 Projekt
 *   #/p/<projektId>/s/<stueckId>    Strickstück
 *   #/p/<projektId>/s/<stueckId>/zaehlen   Reihenzähler
 *   #/einstellungen                 Einstellungen
 */

import { ID_MUSTER } from './modell.js';

// Gleiches Muster wie im Datenmodell, ohne die Anker ^ und $
const ID = `(${ID_MUSTER.source.slice(1, -1)})`;
const MUSTER = [
  { ansicht: 'einstellungen', regex: /^#\/einstellungen$/ },
  { ansicht: 'zaehlen', regex: new RegExp(`^#/p/${ID}/s/${ID}/zaehlen$`) },
  { ansicht: 'strickstueck', regex: new RegExp(`^#/p/${ID}/s/${ID}$`) },
  { ansicht: 'projekt', regex: new RegExp(`^#/p/${ID}$`) },
];

/**
 * Wandelt einen Hash in eine Route um (rein, testbar).
 * Unbekannte Adressen führen zur Projektliste.
 * @returns {{ansicht:'liste'|'projekt'|'strickstueck'|'zaehlen'|'einstellungen', projektId?:string, stueckId?:string}}
 */
export function routeAus(hash) {
  const h = typeof hash === 'string' ? hash : '';
  for (const { ansicht, regex } of MUSTER) {
    const treffer = h.match(regex);
    if (treffer) {
      const route = { ansicht };
      if (treffer[1]) route.projektId = treffer[1];
      if (treffer[2]) route.stueckId = treffer[2];
      return route;
    }
  }
  return { ansicht: 'liste' };
}

/** Baut den Hash zu einer Route (rein, testbar). */
export function hashFuer(route) {
  switch (route.ansicht) {
    case 'projekt':
      return `#/p/${route.projektId}`;
    case 'strickstueck':
      return `#/p/${route.projektId}/s/${route.stueckId}`;
    case 'zaehlen':
      return `#/p/${route.projektId}/s/${route.stueckId}/zaehlen`;
    case 'einstellungen':
      return '#/einstellungen';
    default:
      return '#/';
  }
}

/** Navigiert zu einer Route; ersetzen=true überschreibt den Verlaufseintrag. */
export function navigiere(route, { ersetzen = false } = {}) {
  const ziel = hashFuer(route);
  if (ersetzen) {
    history.replaceState(null, '', ziel);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (location.hash === ziel) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = ziel;
  }
}

/** Startet den Router; rueckruf(route) wird bei jedem Wechsel aufgerufen. */
export function starteRouter(rueckruf) {
  const beiWechsel = () => rueckruf(routeAus(location.hash));
  window.addEventListener('hashchange', beiWechsel);
  beiWechsel();
}
