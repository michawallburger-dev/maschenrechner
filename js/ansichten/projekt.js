/**
 * Ansicht „Projekt“ (US-09, US-10, US-32): Strickstücke, Angaben und die
 * Maschenproben des Projekts. Ab Sprint 3 kann ein Projekt mehrere Proben haben;
 * jede ist ein Paar aus Anleitungs- und eigener Probe mit Name und Nadelstärke.
 */

import { formatZahl, formatGanzzahl, LEER_ANZEIGE } from '../format.js';
import {
  finde,
  projektAendern,
  projektLoeschen,
  neuesStrickstueck,
  neueProbe,
  probeAendern,
  probeLoeschen,
  probeVon,
  hinweisGesehen,
  PROBE_FELDER,
} from '../modell.js';
import { planAusTexten } from '../plan.js';
import { vorlage, texteFuellen, el, leeren, bestaetigen, frageNameUndWahl } from '../dom.js';
import { hashFuer } from '../router.js';
import { pruefeUndZeige, probeLesen, anzahlText, planKurzinfo } from './gemeinsam.js';

const TEILE = [
  { schluessel: 'anleitung', legende: 'proben.anleitung' },
  { schluessel: 'eigen', legende: 'proben.eigen' },
];

/** Baut eine Maschenprobe (Anleitung oder eigene) aus der Vorlage und verknüpft Labels und Fehler. */
function baueProbe(ctx, probeId, { schluessel, legende }, werte) {
  const probe = vorlage('tpl-probe');
  probe.dataset.teil = schluessel;
  probe.querySelector('[data-rolle="legende"]').dataset.text = legende;
  for (const input of probe.querySelectorAll('[data-probefeld]')) {
    const feld = input.dataset.probefeld;
    input.id = `probe-${probeId}-${schluessel}-${feld}`;
    const fehler = input.parentElement.querySelector('.fehler');
    fehler.id = `fehler-${input.id}`;
    input.setAttribute('aria-describedby', fehler.id);
    probe.querySelector(`[data-rolle="l-${feld}"]`).htmlFor = input.id;
    input.value = werte[feld];
  }
  return probe;
}

/** Baut die Karte einer Probe mit Name, Nadel und beiden Teilproben. */
function bauePaar(ctx, paar) {
  const karte = vorlage('tpl-probenpaar');
  karte.dataset.probeId = paar.id;
  const titel = karte.querySelector('[data-rolle="titel"]');
  titel.id = `titel-probe-${paar.id}`;
  karte.setAttribute('aria-labelledby', titel.id);
  titel.textContent = paar.name;
  for (const input of karte.querySelectorAll('[data-paarfeld]')) {
    const feld = input.dataset.paarfeld;
    input.id = `probe-${paar.id}-${feld}`;
    const fehler = karte.querySelector(`[data-rolle="f-${feld}"]`);
    fehler.id = `fehler-${input.id}`;
    input.setAttribute('aria-describedby', fehler.id);
    karte.querySelector(`[data-rolle="l-${feld}"]`).htmlFor = input.id;
    input.value = paar[feld];
  }
  const raster = karte.querySelector('[data-rolle="proben"]');
  for (const teil of TEILE) raster.append(baueProbe(ctx, paar.id, teil, paar[teil.schluessel]));
  karte.querySelector('[data-rolle="probe-loeschen"]').dataset.probeId = paar.id;
  texteFuellen(karte, ctx.t);
  // Name nach dem Füllen der Texte setzen (der Titel hat keinen Textschlüssel)
  titel.textContent = paar.name;
  return karte;
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

  // ---------------------------------------------------------------- Proben (US-32)
  const probenListe = ansicht.querySelector('[data-rolle="proben"]');

  function baueProben() {
    const projekt = aktuell();
    if (!projekt) return;
    leeren(probenListe);
    for (const paar of projekt.proben) probenListe.append(bauePaar(ctx, paar));
    zeigeProben();
  }

  function zeigeProben() {
    const projekt = aktuell();
    if (!projekt) return;
    for (const karte of probenListe.querySelectorAll('.probenpaar')) {
      const paar = projekt.proben.find((p) => p.id === karte.dataset.probeId);
      if (!paar) continue;
      const nadel = karte.querySelector('[data-paarfeld="nadelstaerkeMm"]');
      pruefeUndZeige(nadel, document.getElementById(`fehler-${nadel.id}`), 'nadel', { t: ctx.t, beruehrt: beruehrt.has(nadel) });
      for (const fieldset of karte.querySelectorAll('[data-teil]')) {
        for (const input of fieldset.querySelectorAll('[data-probefeld]')) {
          pruefeUndZeige(input, document.getElementById(`fehler-${input.id}`), input.dataset.regel, {
            t: ctx.t,
            beruehrt: beruehrt.has(input),
          });
        }
        const werte = paar[fieldset.dataset.teil];
        for (const richtung of ['maschen', 'reihen']) {
          const probe = probeLesen(werte, richtung, ctx.einheit());
          const ausgabe = fieldset.querySelector(`[data-rolle="dichte${richtung === 'maschen' ? 'Maschen' : 'Reihen'}"]`);
          ausgabe.textContent = probe ? formatZahl(probe.anzahl / probe.bezug, ctx.locale()) : LEER_ANZEIGE;
        }
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
      const probe = probeVon(projekt, stueck);
      // Zusatzinfo: Zählerstand, Probe und Kurzinfo zum Plan (US-10 AK5, US-32 AK3, US-14 AK3)
      const teile = [ctx.t('projekt.reihe', { n: formatGanzzahl(stueck.zaehler, ctx.locale()) })];
      if (probe) teile.push(ctx.t('projekt.stueckProbe', { name: probe.name }));
      const kurz = planKurzinfo(ctx, planAusTexten(stueck.plan, probe?.eigen, ctx.einheit()), stueck.plan);
      if (kurz) teile.push(kurz);
      const link = el('a', { klasse: 'listen-eintrag', attribute: { href: hashFuer({ ansicht: 'strickstueck', projektId, stueckId: stueck.id }) } }, [
        el('span', { klasse: 'eintrag-name', text: stueck.name }),
        el('span', { klasse: 'eintrag-info', text: teile.join(' · ') }),
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
      return;
    }

    const karte = input.closest('.probenpaar');
    if (!karte) return;
    const probeId = karte.dataset.probeId;

    if (input.dataset.paarfeld === 'name') {
      const fehler = document.getElementById(`fehler-${input.id}`);
      const leer = input.value.trim() === '';
      fehler.hidden = !leer;
      fehler.textContent = leer ? ctx.t('fehler.NAME_LEER') : '';
      if (leer) {
        input.setAttribute('aria-invalid', 'true');
        return;
      }
      input.removeAttribute('aria-invalid');
      const ergebnis = probeAendern(ctx.daten(), projektId, probeId, { name: input.value }, ctx.jetzt());
      if (ergebnis.gueltig) {
        ctx.aendern(ergebnis.daten);
        karte.querySelector('[data-rolle="titel"]').textContent = input.value.trim();
        zeigeStuecke();
      }
      return;
    }
    if (input.dataset.paarfeld === 'nadelstaerkeMm') {
      beruehrt.add(input);
      const ergebnis = probeAendern(ctx.daten(), projektId, probeId, { nadelstaerkeMm: input.value }, ctx.jetzt());
      if (ergebnis.gueltig) ctx.aendern(ergebnis.daten);
      zeigeProben();
      return;
    }
    if (input.dataset.probefeld && PROBE_FELDER.includes(input.dataset.probefeld)) {
      beruehrt.add(input);
      const teil = input.closest('[data-teil]').dataset.teil;
      const ergebnis = probeAendern(ctx.daten(), projektId, probeId, { [teil]: { [input.dataset.probefeld]: input.value } }, ctx.jetzt());
      if (ergebnis.gueltig) ctx.aendern(ergebnis.daten);
      zeigeProben();
      zeigeStuecke();
    }
  });

  ansicht.addEventListener('focusout', (ereignis) => {
    const input = ereignis.target;
    if (input.dataset?.probefeld || input.dataset?.paarfeld === 'nadelstaerkeMm') {
      beruehrt.add(input);
      setTimeout(zeigeProben, 0);
    } else if (input.dataset?.paarfeld === 'name' && input.value.trim() === '') {
      // Beim Verlassen mit leerem Namen den gespeicherten Namen wiederherstellen
      const paar = aktuell()?.proben.find((p) => p.id === input.closest('.probenpaar').dataset.probeId);
      input.value = paar?.name ?? '';
      const fehler = document.getElementById(`fehler-${input.id}`);
      fehler.hidden = true;
      fehler.textContent = '';
      input.removeAttribute('aria-invalid');
    } else if (input.dataset?.projektfeld === 'name' && input.value.trim() === '') {
      input.value = aktuell()?.name ?? '';
      const fehler = ansicht.querySelector('#fehler-projekt-name');
      fehler.hidden = true;
      fehler.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  });

  ansicht.querySelector('[data-rolle="probe-neu"]').addEventListener('click', () => {
    const ergebnis = neueProbe(ctx.daten(), projektId, ctx.neueId('pr'), ctx.jetzt());
    if (!ergebnis.gueltig) return;
    ctx.aendern(ergebnis.daten, { sofort: true });
    baueProben();
    // Fokus auf den Namen der neuen Probe, damit sie gleich benannt werden kann
    document.getElementById(`probe-${ergebnis.probeId}-name`)?.focus();
  });

  probenListe.addEventListener('click', async (ereignis) => {
    const knopf = ereignis.target.closest('[data-rolle="probe-loeschen"]');
    if (!knopf) return;
    const projekt = aktuell();
    const paar = projekt?.proben.find((p) => p.id === knopf.dataset.probeId);
    if (!paar) return;

    // Erst prüfen, ob gelöscht werden darf (E20) – dann ggf. nur einen Hinweis zeigen
    const probe = probeLoeschen(ctx.daten(), projektId, paar.id, ctx.jetzt());
    if (!probe.gueltig) {
      const verwendet = probe.fehler === 'PROBE_VERWENDET';
      await bestaetigen({
        titel: ctx.t(verwendet ? 'probe.verwendetTitel' : 'probe.letzteTitel'),
        text: verwendet ? ctx.t('probe.verwendet', { name: paar.name, stuecke: probe.stuecke.map((n) => `„${n}“`).join(', ') }) : ctx.t('probe.letzte'),
        okText: ctx.t('dialog.ok'),
        abbrechenText: ctx.t('dialog.abbrechen'),
        nurOk: true,
      });
      return;
    }
    const ok = await bestaetigen({
      titel: ctx.t('dialog.probeLoeschen.titel'),
      text: ctx.t('dialog.probeLoeschen.text', { name: paar.name }),
      okText: ctx.t('dialog.loeschen'),
      abbrechenText: ctx.t('dialog.abbrechen'),
      gefahr: true,
    });
    if (!ok) return;
    const nochmal = probeLoeschen(ctx.daten(), projektId, paar.id, ctx.jetzt());
    if (!nochmal.gueltig) return;
    ctx.aendern(nochmal.daten, { sofort: true });
    baueProben();
    ansicht.querySelector('[data-rolle="probe-neu"]').focus();
  });

  ansicht.querySelector('[data-rolle="stueck-neu"]').addEventListener('click', async () => {
    const projekt = aktuell();
    if (!projekt) return;
    // Bei mehreren Proben fragt die App beim Anlegen, welche gelten soll (E17, US-32 AK4)
    const mehrere = projekt.proben.length > 1;
    const antwort = await frageNameUndWahl({
      titel: ctx.t('dialog.neuesStueck.titel'),
      label: ctx.t('dialog.neuesStueck.label'),
      vorschlaege: ['vorschlag.vorderteil', 'vorschlag.rueckenteil', 'vorschlag.aermelLinks', 'vorschlag.aermelRechts'].map((s) => ctx.t(s)),
      okText: ctx.t('dialog.anlegen'),
      abbrechenText: ctx.t('dialog.abbrechen'),
      fehlerLeer: ctx.t('fehler.NAME_LEER'),
      auswahl: mehrere
        ? {
            legende: ctx.t('dialog.neuesStueck.probe'),
            optionen: projekt.proben.map((p) => ({ wert: p.id, text: p.name })),
            fehlerText: ctx.t('dialog.neuesStueck.probeFehlt'),
          }
        : null,
    });
    if (antwort === null) return;
    const ergebnis = neuesStrickstueck(ctx.daten(), projektId, antwort.name, ctx.neueId('s'), ctx.jetzt(), antwort.wahl ?? undefined);
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
  baueProben();

  return { titel: gefunden.projekt.name, zurueck: { ansicht: 'liste' } };
}
