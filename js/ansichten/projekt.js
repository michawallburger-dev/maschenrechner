/**
 * Ansicht „Projekt“ (US-09, US-10): Strickstücke, Angaben und die beiden
 * Maschenproben des Projekts.
 */

import { formatZahl, formatGanzzahl, LEER_ANZEIGE } from '../format.js';
import {
  finde,
  projektAendern,
  projektLoeschen,
  neuesStrickstueck,
  hinweisGesehen,
} from '../modell.js';
import { vorlage, texteFuellen, el, leeren, bestaetigen, frageName } from '../dom.js';
import { hashFuer } from '../router.js';
import { pruefeUndZeige, probeLesen, anzahlText } from './gemeinsam.js';

const PROBEN = [
  { schluessel: 'probeAnleitung', legende: 'proben.anleitung', kurz: 'anleitung' },
  { schluessel: 'probeEigen', legende: 'proben.eigen', kurz: 'eigen' },
];

/** Baut eine Maschenprobe aus der Vorlage und verknüpft Labels und Fehler. */
function baueProbe(ctx, { schluessel, legende, kurz }, werte) {
  const probe = vorlage('tpl-probe');
  probe.dataset.probe = schluessel;
  const leg = probe.querySelector('[data-rolle="legende"]');
  leg.dataset.text = legende;
  for (const input of probe.querySelectorAll('[data-probefeld]')) {
    const feld = input.dataset.probefeld;
    input.id = `probe-${kurz}-${feld}`;
    const fehler = input.parentElement.querySelector('.fehler');
    fehler.id = `fehler-${input.id}`;
    input.setAttribute('aria-describedby', fehler.id);
    probe.querySelector(`[data-rolle="l-${feld}"]`).htmlFor = input.id;
    input.value = werte[feld];
  }
  texteFuellen(probe, ctx.t);
  return probe;
}

export function zeige(ctx, route, wurzel) {
  const gefunden = finde(ctx.daten(), route.projektId);
  if (!gefunden) return null;
  const { projektId } = route;

  const ansicht = vorlage('tpl-projekt');
  texteFuellen(ansicht, ctx.t);
  wurzel.append(ansicht);

  const beruehrt = new Set();
  const aktuell = () => finde(ctx.daten(), projektId)?.projekt;

  // ---------------------------------------------------------------- Übernahme-Hinweis (US-27)
  const hinweis = ansicht.querySelector('[data-rolle="uebernommen"]');
  hinweis.hidden = !(ctx.uebernommenesProjekt === projektId && !ctx.daten().hinweise.projektlisteErklaert);
  ansicht.querySelector('[data-rolle="verstanden"]').addEventListener('click', () => {
    ctx.aendern(hinweisGesehen(ctx.daten(), 'projektlisteErklaert'), { sofort: true });
    hinweis.hidden = true;
    ctx.fokusTitel();
  });

  // ---------------------------------------------------------------- Angaben
  for (const input of ansicht.querySelectorAll('[data-projektfeld]')) {
    input.value = gefunden.projekt[input.dataset.projektfeld];
  }

  // ---------------------------------------------------------------- Proben
  const probenRaster = ansicht.querySelector('[data-rolle="proben"]');
  for (const p of PROBEN) probenRaster.append(baueProbe(ctx, p, gefunden.projekt[p.schluessel]));

  function zeigeProben() {
    const projekt = aktuell();
    if (!projekt) return;
    for (const fieldset of probenRaster.querySelectorAll('[data-probe]')) {
      for (const input of fieldset.querySelectorAll('[data-probefeld]')) {
        pruefeUndZeige(input, document.getElementById(`fehler-${input.id}`), input.dataset.regel, {
          t: ctx.t,
          beruehrt: beruehrt.has(input),
        });
      }
      const werte = projekt[fieldset.dataset.probe];
      for (const richtung of ['maschen', 'reihen']) {
        const probe = probeLesen(werte, richtung, ctx.einheit());
        const ausgabe = fieldset.querySelector(`[data-rolle="dichte${richtung === 'maschen' ? 'Maschen' : 'Reihen'}"]`);
        ausgabe.textContent = probe ? formatZahl(probe.anzahl / probe.bezug, ctx.locale()) : LEER_ANZEIGE;
      }
    }
  }

  // ---------------------------------------------------------------- Strickstücke
  const liste = ansicht.querySelector('[data-rolle="stuecke"]');
  const keine = ansicht.querySelector('[data-rolle="keine-stuecke"]');

  function zeigeStuecke() {
    const projekt = aktuell();
    if (!projekt) return;
    leeren(liste);
    keine.hidden = projekt.strickstuecke.length > 0;
    for (const stueck of projekt.strickstuecke) {
      const link = el('a', { klasse: 'listen-eintrag', attribute: { href: hashFuer({ ansicht: 'strickstueck', projektId, stueckId: stueck.id }) } }, [
        el('span', { klasse: 'eintrag-name', text: stueck.name }),
        el('span', { klasse: 'eintrag-info', text: ctx.t('projekt.reihe', { n: formatGanzzahl(stueck.zaehler, ctx.locale()) }) }),
      ]);
      liste.append(el('li', {}, [link]));
    }
  }

  // ---------------------------------------------------------------- Ereignisse
  ansicht.addEventListener('input', (ereignis) => {
    const input = ereignis.target;
    if (input.dataset.projektfeld) {
      const feld = input.dataset.projektfeld;
      if (feld === 'name') {
        const fehler = ansicht.querySelector('#fehler-projekt-name');
        const leer = input.value.trim() === '';
        fehler.hidden = !leer;
        fehler.textContent = leer ? ctx.t('fehler.NAME_LEER') : '';
        if (leer) {
          input.setAttribute('aria-invalid', 'true');
          return; // leerer Name wird nicht gespeichert
        }
        input.removeAttribute('aria-invalid');
      }
      const ergebnis = projektAendern(ctx.daten(), projektId, { [feld]: input.value }, ctx.jetzt());
      if (ergebnis.gueltig) ctx.aendern(ergebnis.daten);
      if (feld === 'name') ctx.setzeTitel(input.value.trim());
      if (feld === 'nadelstaerkeMm') {
        beruehrt.add(input);
        pruefeUndZeige(input, ansicht.querySelector('#fehler-projekt-nadel'), 'nadel', { t: ctx.t, beruehrt: true });
      }
      return;
    }
    if (input.dataset.probefeld) {
      beruehrt.add(input);
      const probe = input.closest('[data-probe]').dataset.probe;
      const ergebnis = projektAendern(ctx.daten(), projektId, { [probe]: { [input.dataset.probefeld]: input.value } }, ctx.jetzt());
      if (ergebnis.gueltig) ctx.aendern(ergebnis.daten);
      zeigeProben();
    }
  });

  ansicht.addEventListener('focusout', (ereignis) => {
    const input = ereignis.target;
    if (input.dataset?.probefeld) {
      beruehrt.add(input);
      setTimeout(zeigeProben, 0);
    } else if (input.dataset?.projektfeld === 'nadelstaerkeMm') {
      setTimeout(() => pruefeUndZeige(input, ansicht.querySelector('#fehler-projekt-nadel'), 'nadel', { t: ctx.t, beruehrt: true }), 0);
    } else if (input.dataset?.projektfeld === 'name' && input.value.trim() === '') {
      // Beim Verlassen mit leerem Namen den gespeicherten Namen wiederherstellen
      input.value = aktuell()?.name ?? '';
      const fehler = ansicht.querySelector('#fehler-projekt-name');
      fehler.hidden = true;
      fehler.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  });

  ansicht.querySelector('[data-rolle="stueck-neu"]').addEventListener('click', async () => {
    const name = await frageName({
      titel: ctx.t('dialog.neuesStueck.titel'),
      label: ctx.t('dialog.neuesStueck.label'),
      vorschlaege: ['vorschlag.vorderteil', 'vorschlag.rueckenteil', 'vorschlag.aermelLinks', 'vorschlag.aermelRechts'].map((s) => ctx.t(s)),
      okText: ctx.t('dialog.anlegen'),
      abbrechenText: ctx.t('dialog.abbrechen'),
      fehlerLeer: ctx.t('fehler.NAME_LEER'),
    });
    if (name === null) return;
    const ergebnis = neuesStrickstueck(ctx.daten(), projektId, name, ctx.neueId('s'), ctx.jetzt());
    if (!ergebnis.gueltig) return;
    ctx.aendern(ergebnis.daten, { sofort: true });
    ctx.navigiere({ ansicht: 'strickstueck', projektId, stueckId: ergebnis.stueckId });
  });

  ansicht.querySelector('[data-rolle="loeschen"]').addEventListener('click', async () => {
    const projekt = aktuell();
    if (!projekt) return;
    const ok = await bestaetigen({
      titel: ctx.t('dialog.projektLoeschen.titel'),
      text: ctx.t('dialog.projektLoeschen.text', {
        name: projekt.name,
        stuecke: anzahlText(ctx.t, 'stueck', projekt.strickstuecke.length),
      }),
      okText: ctx.t('dialog.loeschen'),
      abbrechenText: ctx.t('dialog.abbrechen'),
      gefahr: true,
    });
    if (!ok) return;
    ctx.aendern(projektLoeschen(ctx.daten(), projektId), { sofort: true });
    ctx.navigiere({ ansicht: 'liste' }, { ersetzen: true });
  });

  zeigeStuecke();
  zeigeProben();

  return { titel: gefunden.projekt.name, zurueck: { ansicht: 'liste' } };
}
