/**
 * Ansicht „Reihenzähler“ (US-11, US-15, US-30, US-33): große +1-Fläche,
 * −1 mit Abstand, Direkteingabe mit sichtbarem Feld, Bildschirm wachhalten,
 * Ziel in Reihen und cm sowie letzte, nächste und übernächste Zu-/Abnahme.
 *
 * Der Zählerstand gilt als „Reihe, in der ich gerade bin“ (Architektur R11).
 */

import { formatGanzzahl, formatZahl } from '../format.js';
import { vonCm } from '../einheiten.js';
import { finde, probeVon, strickstueckAendern, hinweisGesehen } from '../modell.js';
import { zaehlerPlus, zaehlerMinus, zaehlerAusText } from '../zaehler.js';
import { zaehlerDaten, waehleZiel, ereignisseUm, gestrickteLaengeCm, zielErreicht } from '../ziel.js';
import { vorlage, texteFuellen, bestaetigen, el, leeren } from '../dom.js';
import { grenzeAnzeigen, planArt } from './gemeinsam.js';

/** Hinweis „gerade nicht möglich“ in dieser Sitzung schon gezeigt? */
let abgelehntGezeigt = false;

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
  const ereignisBereich = ansicht.querySelector('[data-rolle="ereignisse"]');
  const jetztEl = ansicht.querySelector('[data-rolle="jetzt"]');
  const vonEl = ansicht.querySelector('[data-rolle="von"]');
  const laengeEl = ansicht.querySelector('[data-rolle="laenge"]');
  const erreichtEl = ansicht.querySelector('[data-rolle="ziel-erreicht"]');
  const quelleBereich = ansicht.querySelector('[data-rolle="quelle"]');
  const quelleWahl = ansicht.querySelector('#zaehler-quelle');
  ansicht.querySelector('[data-rolle="projektname"]').textContent = gefunden.projekt.name;

  let ansageTimer = null;
  const aktuell = () => finde(ctx.daten(), projektId, stueckId);
  const stand = () => aktuell()?.stueck.zaehler ?? 0;

  /** Alles, was sich aus Rechnern, Plan und Probe ergibt (rein berechnet in ziel.js). */
  function lage() {
    const g = aktuell();
    if (!g) return null;
    const daten = zaehlerDaten(g.stueck, probeVon(g.projekt, g.stueck), ctx.einheit());
    const { ziel, auswahlAnzeigen } = waehleZiel(daten.quellen, g.stueck.zielQuelle);
    const ereignisse = daten.plan?.status === 'plan' ? daten.plan.ereignisse : null;
    return { ...daten, ziel, auswahlAnzeigen, ereignisse, runden: daten.plan?.runden === true };
  }

  function ereignisText(l, e) {
    if (!e) return '–';
    const maschen = `${e.maschen > 0 ? '+' : '−'}${Math.abs(e.maschen)}`;
    return ctx.t(l.runden ? 'zaehler.ereignisRunde' : 'zaehler.ereignisReihe', { reihe: formatGanzzahl(e.reihe, ctx.locale()), maschen });
  }

  /** Zielquellen-Auswahl nur bei mindestens zwei gültigen Quellen (US-30 AK7). */
  function zeigeQuellen(l) {
    quelleBereich.hidden = !l.auswahlAnzeigen;
    if (!l.auswahlAnzeigen) return;
    const schluessel = l.quellen.map((q) => q.quelle).join(',');
    if (quelleWahl.dataset.schluessel !== schluessel) {
      quelleWahl.dataset.schluessel = schluessel;
      leeren(quelleWahl);
      for (const q of l.quellen) quelleWahl.append(el('option', { text: ctx.t(`zaehler.quelle.${q.quelle}`), attribute: { value: q.quelle } }));
    }
    quelleWahl.value = l.ziel.quelle;
  }

  /** Aktualisiert alles außer dem Eingabefeld selbst. */
  function zeigeUmfeld(n, l) {
    const loc = ctx.locale();
    const einheit = ctx.einheit();

    // Zu-/Abnahmen (US-15)
    ereignisBereich.hidden = !l.ereignisse;
    let jetzt = null;
    if (l.ereignisse) {
      const um = ereignisseUm(l.ereignisse, n);
      for (const art of ['letzte', 'naechste', 'uebernaechste']) {
        ereignisBereich.querySelector(`[data-ereignis="${art}"]`).textContent = ereignisText(l, um[art]);
      }
      jetzt = um.jetzt;
    }
    jetztEl.hidden = !jetzt;
    if (jetzt) {
      jetztEl.querySelector('[data-rolle="jetzt-text"]').textContent = ctx.t('zaehler.jetzt', {
        pro: Math.abs(jetzt.maschen),
        art: planArt(ctx.t, jetzt.maschen < 0 ? 'ab' : 'zu'),
      });
    }

    // Ziel „X von Y“ und Länge in cm (US-30)
    vonEl.hidden = !l.ziel;
    vonEl.textContent = l.ziel ? ctx.t('zaehler.von', { n: formatGanzzahl(l.ziel.reihen, loc) }) : '';
    const laenge = gestrickteLaengeCm(n, l.probeReihen);
    laengeEl.hidden = laenge === null;
    if (laenge !== null) {
      const ist = formatZahl(vonCm(laenge, einheit), loc);
      laengeEl.textContent = l.ziel
        ? ctx.t('zaehler.laengeVon', { ist, ziel: formatZahl(vonCm(l.ziel.cm, einheit), loc) })
        : ctx.t('zaehler.laenge', { ist });
    }
    erreichtEl.hidden = !zielErreicht(n, l.ziel);
    zeigeQuellen(l);
    return { jetzt };
  }

  /** Ein Satz für Screenreader: Reihe, ggf. Ziel, Hinweis „Jetzt“, Ziel erreicht (US-15 AK5, US-30 AK6). */
  function ansageText(n, l, jetzt) {
    const loc = ctx.locale();
    const teile = [
      l.ziel
        ? ctx.t('zaehler.ansageVon', { n: formatGanzzahl(n, loc), ziel: formatGanzzahl(l.ziel.reihen, loc) })
        : ctx.t('zaehler.ansage', { n: formatGanzzahl(n, loc) }),
    ];
    if (jetzt) teile.push(ctx.t('zaehler.ansageJetzt', { pro: Math.abs(jetzt.maschen), art: planArt(ctx.t, jetzt.maschen < 0 ? 'ab' : 'zu') }));
    if (zielErreicht(n, l.ziel)) teile.push(ctx.t('zaehler.ansageZiel'));
    return `${teile.join('. ')}.`;
  }

  function sagAn(text) {
    // Erst leeren, dann neu setzen – so wird auch ein gleicher Text erneut angesagt (QA S2-08)
    ansage.textContent = '';
    clearTimeout(ansageTimer);
    ansageTimer = setTimeout(() => {
      ansage.textContent = text;
    }, 50);
  }

  function zeigeStand({ ansagen = false, feldAuch = true } = {}) {
    const n = stand();
    const l = lage();
    if (!l) return;
    if (feldAuch) {
      wert.value = formatGanzzahl(n, ctx.locale());
      wert.removeAttribute('aria-invalid');
      fehler.hidden = true;
      fehler.textContent = '';
    }
    const { jetzt } = zeigeUmfeld(n, l);
    if (ansagen) sagAn(ansageText(n, l, jetzt));
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

  // Zielquelle wählen und merken (US-30 AK7)
  quelleWahl.addEventListener('change', () => {
    const ergebnis = strickstueckAendern(ctx.daten(), projektId, stueckId, { zielQuelle: quelleWahl.value }, ctx.jetzt());
    if (ergebnis.gueltig) ctx.aendern(ergebnis.daten, { sofort: true });
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
      zeigeStand({ feldAuch: false });
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

  // ---------------------------------------------------------------- Bildschirm wachhalten (US-11 AK5)
  const wachhalter = ctx.erzeugeWachhalter();
  wachhalter.starten().then((ergebnis) => {
    if (!ansicht.isConnected) return;
    if (ergebnis === 'nicht-verfuegbar') {
      // Gerät kann es grundsätzlich nicht: einmaliger Hinweis, danach nicht mehr
      if (ctx.daten().hinweise.wachhaltenNichtMoeglich) return;
      wachHinweis.textContent = ctx.t('zaehler.wachNicht');
      wachHinweis.hidden = false;
      ctx.aendern(hinweisGesehen(ctx.daten(), 'wachhaltenNichtMoeglich'), { sofort: true });
    } else if (ergebnis === 'abgelehnt') {
      // Vielleicht nur vorübergehend (z. B. Stromsparmodus): nicht dauerhaft merken,
      // aber höchstens einmal je App-Start zeigen (QA S2-05)
      if (abgelehntGezeigt) return;
      abgelehntGezeigt = true;
      wachHinweis.textContent = ctx.t('zaehler.wachAbgelehnt');
      wachHinweis.hidden = false;
    } else {
      wachHinweis.hidden = true;
    }
  });

  zeigeStand();

  return {
    titel: gefunden.stueck.name,
    seitentitel: `${gefunden.stueck.name} – ${gefunden.projekt.name}`,
    zurueck: { ansicht: 'strickstueck', projektId, stueckId },
    aufraeumen: () => {
      clearTimeout(ansageTimer);
      wachhalter.beenden();
    },
  };
}
