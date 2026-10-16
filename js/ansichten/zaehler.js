/**
 * Ansicht „Reihenzähler“ (US-11): große +1-Fläche, −1 mit Abstand,
 * Direkteingabe, Bildschirm wachhalten.
 */

import { formatGanzzahl } from '../format.js';
import { finde, strickstueckAendern, hinweisGesehen } from '../modell.js';
import { zaehlerPlus, zaehlerMinus, zaehlerAusText } from '../zaehler.js';
import { vorlage, texteFuellen, bestaetigen } from '../dom.js';
import { grenzeAnzeigen } from './gemeinsam.js';

export function zeige(ctx, route, wurzel) {
  const gefunden = finde(ctx.daten(), route.projektId, route.stueckId);
  if (!gefunden) return null;
  const { projektId, stueckId } = route;

  const ansicht = vorlage('tpl-zaehler');
  texteFuellen(ansicht, ctx.t);
  wurzel.append(ansicht);

  const wert = ansicht.querySelector('#zaehler-wert');
  const fehler = ansicht.querySelector('#zaehler-fehler');
  const ansage = ansicht.querySelector('[data-rolle="ansage"]');
  const wachHinweis = ansicht.querySelector('[data-rolle="wach-hinweis"]');
  ansicht.querySelector('[data-rolle="projektname"]').textContent = gefunden.projekt.name;

  const stand = () => finde(ctx.daten(), projektId, stueckId)?.stueck.zaehler ?? 0;

  function zeigeStand({ ansagen = false } = {}) {
    wert.value = formatGanzzahl(stand(), ctx.locale());
    wert.removeAttribute('aria-invalid');
    fehler.hidden = true;
    fehler.textContent = '';
    if (ansagen) ansage.textContent = ctx.t('zaehler.ansage', { n: formatGanzzahl(stand(), ctx.locale()) });
  }

  /** Speichert sofort (US-11, AK4: kein Verlust beim Sperren des iPhones). */
  function setze(n) {
    const ergebnis = strickstueckAendern(ctx.daten(), projektId, stueckId, { zaehler: n }, ctx.jetzt());
    if (ergebnis.gueltig) ctx.aendern(ergebnis.daten, { sofort: true });
  }

  ansicht.querySelector('[data-rolle="plus"]').addEventListener('click', () => {
    setze(zaehlerPlus(stand()));
    zeigeStand({ ansagen: true });
  });

  ansicht.querySelector('[data-rolle="minus"]').addEventListener('click', () => {
    setze(zaehlerMinus(stand()));
    zeigeStand({ ansagen: true });
  });

  ansicht.querySelector('[data-rolle="null"]').addEventListener('click', async () => {
    if (stand() === 0) return;
    const ok = await bestaetigen({
      titel: ctx.t('dialog.zaehlerNull.titel'),
      text: ctx.t('dialog.zaehlerNull.text', { name: gefunden.stueck.name, n: formatGanzzahl(stand(), ctx.locale()) }),
      okText: ctx.t('dialog.zuruecksetzen.ok'),
      abbrechenText: ctx.t('dialog.abbrechen'),
      gefahr: true,
    });
    if (!ok) return;
    setze(0);
    zeigeStand({ ansagen: true });
  });

  // Direkteingabe: gültige Werte sofort übernehmen, Fehler erst beim Verlassen
  wert.addEventListener('input', () => {
    const ergebnis = zaehlerAusText(wert.value);
    if (ergebnis.gueltig) {
      setze(ergebnis.wert);
      wert.removeAttribute('aria-invalid');
      fehler.hidden = true;
      fehler.textContent = '';
    }
  });
  wert.addEventListener('change', () => {
    const ergebnis = zaehlerAusText(wert.value);
    if (ergebnis.gueltig) {
      zeigeStand({ ansagen: true });
    } else {
      wert.setAttribute('aria-invalid', 'true');
      fehler.textContent = ctx.t(`fehler.${ergebnis.fehler}`, { grenze: grenzeAnzeigen(ergebnis.grenze) });
      fehler.hidden = false;
    }
  });
  wert.addEventListener('focus', () => wert.select());

  // ---------------------------------------------------------------- Bildschirm wachhalten (AK5)
  const wachhalter = ctx.erzeugeWachhalter();
  wachhalter.starten().then((ergebnis) => {
    if (!ansicht.isConnected) return;
    if (ergebnis === 'aktiv') {
      wachHinweis.hidden = true;
    } else if (!ctx.daten().hinweise.wachhaltenNichtMoeglich) {
      // Einmaliger Hinweis, danach nicht mehr
      wachHinweis.textContent = ctx.t('zaehler.wachNicht');
      wachHinweis.hidden = false;
      ctx.aendern(hinweisGesehen(ctx.daten(), 'wachhaltenNichtMoeglich'), { sofort: true });
    }
  });

  zeigeStand();

  return {
    titel: gefunden.stueck.name,
    seitentitel: `${gefunden.stueck.name} – ${gefunden.projekt.name}`,
    zurueck: { ansicht: 'strickstueck', projektId, stueckId },
    aufraeumen: () => wachhalter.beenden(),
  };
}
