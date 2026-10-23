/**
 * Karte „Zu- und Abnahmen“ in der Strickstück-Ansicht (US-13, US-14, US-16).
 *
 * Die Rechnung selbst steckt in plan.js (rein). Diese Datei baut nur die
 * Oberfläche, speichert Eingaben sofort im Strickstück und zeigt das Ergebnis.
 */

import { pruefeZahl, REGELN } from '../eingabe.js';
import { formatZahl, formatGanzzahl, LEER_ANZEIGE } from '../format.js';
import { vonCm } from '../einheiten.js';
import { finde, probeVon, strickstueckAendern } from '../modell.js';
import { planAusTexten, probeAusTexten, standardStartReihe } from '../plan.js';
import { vorlage, texteFuellen, el, leeren, bestaetigen } from '../dom.js';
import { hashFuer } from '../router.js';
import { pruefeUndZeige, planArt } from './gemeinsam.js';

/** Wartezeit, bis die Zusammenfassung für Screenreader angesagt wird (QA S3-04). */
const ANSAGE_VERZOEGERUNG_MS = 1000;

/** Ab dieser Länge wird die Liste verzögert aufgebaut (Architektur H1). */
const LISTE_VERZOEGERT_AB = 500;
const LISTE_VERZOEGERUNG_MS = 300;

const WERTE = [
  { schluessel: 'anfang', titel: 'plan.anfang', anpassung: 'plan.anpassungAnfang' },
  { schluessel: 'ende', titel: 'plan.ende', anpassung: 'plan.anpassungEnde' },
  { schluessel: 'reihen', titel: 'plan.reihenGesamt', anpassung: 'plan.anpassungReihen' },
];

/**
 * Baut die Karte und hängt sie in den Behälter.
 * @param {object} ctx
 * @param {{projektId:string, stueckId:string, behaelter:HTMLElement}} optionen
 * @returns {{aktualisieren:()=>void, aufraeumen:()=>void}}
 */
export function bauePlankarte(ctx, { projektId, stueckId, behaelter }) {
  const karte = vorlage('tpl-plankarte');
  const werteBereich = karte.querySelector('[data-rolle="werte"]');
  for (const w of WERTE) {
    const zeile = vorlage('tpl-planwert');
    zeile.dataset.wert = w.schluessel;
    const input = zeile.querySelector('[data-rolle="anpassung"]');
    const fehler = zeile.querySelector('[data-rolle="fehler"]');
    input.id = `plan-anpassung-${w.schluessel}`;
    input.dataset.anpassung = w.schluessel;
    fehler.id = `fehler-${input.id}`;
    input.setAttribute('aria-describedby', fehler.id);
    const label = zeile.querySelector('[data-rolle="anpassung-label"]');
    label.htmlFor = input.id;
    label.dataset.text = w.anpassung;
    zeile.querySelector('[data-rolle="titel"]').dataset.text = w.titel;
    // Stepper mit eindeutigem Namen, z. B. „Maschen am Ende um 1 verringern“ (QA S3-05)
    for (const [knopf, schluessel] of [[zeile.querySelector('[data-schritt="-1"]'), 'plan.schrittMinus'], [zeile.querySelector('[data-schritt="1"]'), 'plan.schrittPlus']]) {
      delete knopf.dataset.textAriaLabel;
      knopf.setAttribute('aria-label', ctx.t(schluessel, { wert: ctx.t(w.titel) }));
    }
    werteBereich.append(zeile);
  }
  texteFuellen(karte, ctx.t);
  behaelter.append(karte);

  const ohnePlan = karte.querySelector('[data-rolle="ohne-plan"]');
  const mitPlan = karte.querySelector('[data-rolle="mit-plan"]');
  const probeFehlt = karte.querySelector('[data-rolle="probe-fehlt"]');
  const auswahl = karte.querySelector('[data-rolle="auswahl"]');
  const status = karte.querySelector('[data-rolle="status"]');
  const zusammenfassung = karte.querySelector('[data-rolle="zusammenfassung"]');
  const planAnsage = karte.querySelector('[data-rolle="plan-ansage"]');
  const liste = karte.querySelector('[data-rolle="liste"]');
  const startLabel = karte.querySelector('[data-rolle="startReihe-label"]');
  const startHinweis = karte.querySelector('[data-rolle="startReihe-hinweis"]');
  probeFehlt.querySelector('[data-rolle="probe-link"]').href = hashFuer({ ansicht: 'projekt', projektId });

  const beruehrt = new Set();
  let listenTimer = null;
  let letzteListe = '';
  let ansageTimer = null;
  let letzteAnsage = '';

  /** Text, den Screenreader zum Ergebnis hören sollen. */
  function ansageText() {
    return [zusammenfassung.textContent, status.hidden ? '' : status.textContent].filter((x) => x && x !== LEER_ANZEIGE).join(' ');
  }

  /** Sagt die Zusammenfassung erst an, wenn sich eine Sekunde lang nichts geändert hat (QA S3-04). */
  function sagZusammenfassungAn() {
    clearTimeout(ansageTimer);
    ansageTimer = setTimeout(() => {
      if (!karte.isConnected || mitPlan.hidden) return;
      const text = ansageText();
      if (text === letzteAnsage) return;
      letzteAnsage = text;
      planAnsage.textContent = text;
    }, ANSAGE_VERZOEGERUNG_MS);
  }

  const aktuell = () => finde(ctx.daten(), projektId, stueckId);

  function speichere(felder, { sofort = false } = {}) {
    const ergebnis = strickstueckAendern(ctx.daten(), projektId, stueckId, { plan: felder }, ctx.jetzt());
    if (ergebnis.gueltig) ctx.aendern(ergebnis.daten, { sofort });
  }

  /** Eingabefelder aus dem gespeicherten Plan füllen (beim Aufbau und nach dem Zurücksetzen). */
  function fuelleFelder(plan) {
    for (const input of karte.querySelectorAll('[data-planfeld]')) {
      if (input.type === 'checkbox') input.checked = plan[input.dataset.planfeld] === true;
      else input.value = plan[input.dataset.planfeld];
    }
    for (const radio of karte.querySelectorAll('input[name="plan-arbeitsweise"]')) radio.checked = radio.value === plan.arbeitsweise;
    for (const input of karte.querySelectorAll('[data-anpassung]')) input.value = plan.anpassung[input.dataset.anpassung];
  }

  function setzeWert(schluessel, endgueltig, info) {
    const zeile = werteBereich.querySelector(`[data-wert="${schluessel}"]`);
    zeile.querySelector('[data-rolle="endgueltig"]').textContent = endgueltig;
    zeile.querySelector('[data-rolle="info"]').textContent = info;
  }

  function zeigeStatus(text) {
    status.hidden = !text;
    status.textContent = text ?? '';
  }

  function zeileText(plan, e) {
    return ctx.t(plan.runden ? 'plan.zeileRunde' : 'plan.zeileReihe', {
      reihe: formatGanzzahl(e.reihe, ctx.locale()),
      pro: Math.abs(e.maschen),
      art: planArt(ctx.t, e.maschen < 0 ? 'ab' : 'zu'),
      danach: formatGanzzahl(e.maschenDanach, ctx.locale()),
    });
  }

  /** Baut die Liste nur neu, wenn sie sich geändert hat; lange Listen verzögert. */
  function zeigeListe(r) {
    const ereignisse = r?.status === 'plan' ? r.ereignisse : [];
    const schluessel = ereignisse.length === 0 ? '' : `${r.runden}|${ereignisse.map((e) => `${e.reihe}:${e.maschen}:${e.maschenDanach}`).join(',')}`;
    if (schluessel === letzteListe) return;
    clearTimeout(listenTimer);
    const aufbauen = () => {
      letzteListe = schluessel;
      const fragment = document.createDocumentFragment();
      for (const e of ereignisse) fragment.append(el('li', { text: zeileText(r, e) }));
      leeren(liste);
      liste.append(fragment);
    };
    if (ereignisse.length > LISTE_VERZOEGERT_AB) listenTimer = setTimeout(aufbauen, LISTE_VERZOEGERUNG_MS);
    else aufbauen();
  }

  function zeigeAuswahl(r) {
    // Sichtbar, solange die Differenz nicht teilbar ist – auch nach der Wahl (QA S3-02)
    if (!r?.optionen || r.optionen.length === 0) {
      auswahl.hidden = true;
      return;
    }
    const loc = ctx.locale();
    const einheit = ctx.einheit();
    auswahl.hidden = false;
    auswahl.querySelector('[data-rolle="auswahl-frage"]').textContent = ctx.t('plan.auswahlFrage', {
      differenz: Math.abs(r.ende - r.anfang),
      pro: r.proEreignis,
    });
    const optionen = auswahl.querySelector('[data-rolle="optionen"]');
    // Nur neu aufbauen, wenn sich die Optionen geändert haben (Fokus bleibt sonst erhalten)
    const schluessel = r.optionen.map((o) => `${o.wahl}:${o.endMaschen}`).join(',');
    if (optionen.dataset.schluessel === schluessel) return;
    optionen.dataset.schluessel = schluessel;
    leeren(optionen);
    for (const o of r.optionen) {
      const anzahl = o.ereignisse === 0
        ? ctx.t('plan.keineOption')
        : ctx.t(`plan.${r.richtung === 'ab' ? 'abnahmen' : 'zunahmen'}.${o.ereignisse === 1 ? 'eins' : 'mehr'}`, { n: o.ereignisse });
      const radio = el('input', { attribute: { type: 'radio', name: 'plan-ereigniswahl', value: o.wahl } });
      optionen.append(
        el('label', { klasse: 'option' }, [
          radio,
          el('span', { text: ctx.t('plan.auswahlOption', { maschen: o.endMaschen, breite: formatZahl(vonCm(o.endCm, einheit), loc), anzahl }) }),
        ]),
      );
    }
  }

  /** Nach jeder Änderung: neu berechnen und das Ergebnis verzögert ansagen. */
  function aktualisieren() {
    berechneUndZeige();
    sagZusammenfassungAn();
  }

  function berechneUndZeige() {
    const g = aktuell();
    if (!g) return;
    const plan = g.stueck.plan;
    ohnePlan.hidden = Boolean(plan);
    mitPlan.hidden = !plan;
    if (!plan) {
      zeigeListe(null);
      return;
    }

    const loc = ctx.locale();
    const einheit = ctx.einheit();
    const t = ctx.t;

    // Feldprüfung mit Meldungen am Feld (Regeln aus Sprint 1)
    for (const input of karte.querySelectorAll('input[type="text"][data-planfeld]')) {
      pruefeUndZeige(input, document.getElementById(`fehler-${input.id}`), input.dataset.regel, { t, beruehrt: beruehrt.has(input) });
    }
    for (const input of karte.querySelectorAll('[data-anpassung]')) {
      pruefeUndZeige(input, document.getElementById(`fehler-${input.id}`), 'anpassung', { t, beruehrt: beruehrt.has(input) });
    }

    const probe = probeVon(g.projekt, g.stueck);
    const probeOk = Boolean(probeAusTexten(probe?.eigen, 'maschen', einheit) && probeAusTexten(probe?.eigen, 'reihen', einheit));
    probeFehlt.hidden = probeOk;

    const r = planAusTexten(plan, probe?.eigen, einheit);
    const reihenTitel = werteBereich.querySelector('[data-wert="reihen"] [data-rolle="titel"]');
    reihenTitel.textContent = t(plan.arbeitsweise === 'runden' ? 'plan.rundenGesamt' : 'plan.reihenGesamt');

    // Startreihe: Beschriftung und Hinweis folgen der Arbeitsweise und „nur jede 2.“ (US-39, E31)
    const einheitReihe = t(plan.arbeitsweise === 'runden' ? 'plan.einheitRunde' : 'plan.einheitReihe');
    startLabel.textContent = t('plan.startReihe', { einheitReihe });
    startHinweis.textContent = t('plan.startReiheAuto', {
      einheitReihe,
      reihe: formatGanzzahl(standardStartReihe(plan.jedeZweite === true), loc),
    });

    if (!r) {
      for (const w of WERTE) setzeWert(w.schluessel, LEER_ANZEIGE, '');
      zusammenfassung.textContent = LEER_ANZEIGE;
      zeigeStatus(null);
      zeigeAuswahl(null);
      zeigeListe(null);
      return;
    }

    const cm = (wert) => (wert === null ? LEER_ANZEIGE : formatZahl(vonCm(wert, einheit), loc));
    const info = (gerundet, schluessel, wert) => `${t('plan.berechnet', { n: formatGanzzahl(gerundet, loc) })} · ${t(schluessel, { wert: cm(wert) })}`;
    const ganz = (n) => (n >= 1 ? formatGanzzahl(n, loc) : LEER_ANZEIGE);
    setzeWert('anfang', ganz(r.anfang), info(r.anfangGerundet, 'plan.tatsaechlichBreite', r.anfangCm));
    setzeWert('ende', ganz(r.ende), info(r.endGerundet, 'plan.tatsaechlichBreite', r.endCm));
    setzeWert('reihen', ganz(r.reihen), info(r.reihenGerundet, 'plan.tatsaechlichLaenge', r.laengeCm));

    zeigeAuswahl(r);
    zeigeListe(r);
    for (const radio of auswahl.querySelectorAll('input[name="plan-ereigniswahl"]')) radio.checked = radio.value === plan.ereignisWahl;

    switch (r.status) {
      case 'keineAenderung':
        zusammenfassung.textContent = t('plan.keineAenderung');
        zeigeStatus(null);
        break;
      case 'auswahl':
        zusammenfassung.textContent = LEER_ANZEIGE;
        zeigeStatus(r.optionen.length === 0 ? t('plan.auswahlKeine', { pro: r.proEreignis }) : null);
        break;
      case 'fehler': {
        zusammenfassung.textContent = LEER_ANZEIGE;
        // Einzahl/Mehrzahl bei „passende Reihe(n)“ (QA S3-03)
        let schluessel = `plan.fehler.${r.fehler}`;
        if (r.fehler === 'ZU_WENIG_REIHEN' && r.moeglich <= 1) schluessel += r.moeglich === 1 ? '.eins' : '.keine';
        zeigeStatus(t(schluessel, { anzahl: r.anzahlEreignisse, moeglich: r.moeglich, grenze: r.grenze }));
        break;
      }
      default: {
        zeigeStatus(null);
        const art = planArt(t, r.richtung);
        const einheitReihen = t(r.runden ? 'plan.einheitRunden' : 'plan.einheitReihen');
        if (r.ereignisse.length === 1) {
          zusammenfassung.textContent = t('plan.zusammenfassungEins', {
            pro: r.proEreignis,
            art,
            einheitReihe: t(r.runden ? 'plan.einheitRunde' : 'plan.einheitReihe'),
            reihe: formatGanzzahl(r.ereignisse[0].reihe, loc),
          });
        } else {
          const abstand = r.abstandMin === r.abstandMax ? String(r.abstandMin) : `${r.abstandMin}–${r.abstandMax}`;
          zusammenfassung.textContent = t('plan.zusammenfassung', { anzahl: r.ereignisse.length, pro: r.proEreignis, art, abstand, einheitReihen });
        }
      }
    }
  }

  // ---------------------------------------------------------------- Ereignisse

  karte.querySelector('[data-rolle="anlegen"]').addEventListener('click', () => {
    speichere({}, { sofort: true });
    fuelleFelder(aktuell().stueck.plan);
    aktualisieren();
    karte.querySelector('#plan-anfangBreite').focus();
  });

  karte.addEventListener('input', (ereignis) => {
    const input = ereignis.target;
    if (input.dataset.planfeld && input.type === 'text') {
      beruehrt.add(input);
      speichere({ [input.dataset.planfeld]: input.value });
    } else if (input.dataset.anpassung) {
      beruehrt.add(input);
      speichere({ anpassung: { [input.dataset.anpassung]: input.value } });
    } else {
      return;
    }
    aktualisieren();
  });

  karte.addEventListener('change', (ereignis) => {
    const input = ereignis.target;
    if (input.name === 'plan-arbeitsweise') speichere({ arbeitsweise: input.value }, { sofort: true });
    else if (input.dataset.planfeld === 'jedeZweite') speichere({ jedeZweite: input.checked }, { sofort: true });
    else if (input.name === 'plan-ereigniswahl') speichere({ ereignisWahl: input.value }, { sofort: true });
    else return;
    aktualisieren();
  });

  karte.addEventListener('focusout', (ereignis) => {
    const input = ereignis.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'text') return;
    beruehrt.add(input);
    setTimeout(aktualisieren, 0);
  });

  karte.addEventListener('click', async (ereignis) => {
    const knopf = ereignis.target.closest('button');
    if (!knopf) return;
    if (knopf.dataset.schritt) {
      const input = knopf.closest('.stepper').querySelector('input');
      const regel = REGELN.anpassung;
      const wert = pruefeZahl(input.value, 'anpassung');
      const basis = wert.gueltig ? wert.wert : 0;
      input.value = String(Math.min(regel.max, Math.max(regel.min, basis + Number(knopf.dataset.schritt))));
      beruehrt.add(input);
      speichere({ anpassung: { [input.dataset.anpassung]: input.value } });
      aktualisieren();
      return;
    }
    if (knopf.dataset.rolle === 'anpassungen-zuruecksetzen') {
      speichere({ anpassung: { anfang: '0', ende: '0', reihen: '0' } }, { sofort: true });
      for (const input of karte.querySelectorAll('[data-anpassung]')) input.value = '0';
      aktualisieren();
      return;
    }
    if (knopf.dataset.rolle === 'plan-loeschen') {
      const g = aktuell();
      if (!g) return;
      const ok = await bestaetigen({
        titel: ctx.t('dialog.planLoeschen.titel'),
        text: ctx.t('dialog.planLoeschen.text', { name: g.stueck.name }),
        okText: ctx.t('dialog.loeschen'),
        abbrechenText: ctx.t('dialog.abbrechen'),
        gefahr: true,
      });
      if (!ok) return;
      const ergebnis = strickstueckAendern(ctx.daten(), projektId, stueckId, { plan: null }, ctx.jetzt());
      if (ergebnis.gueltig) ctx.aendern(ergebnis.daten, { sofort: true });
      beruehrt.clear();
      aktualisieren();
      karte.querySelector('[data-rolle="anlegen"]').focus();
    }
  });

  const plan = aktuell()?.stueck.plan;
  if (plan) fuelleFelder(plan);
  // Beim Öffnen nichts ansagen – nur nach Änderungen
  berechneUndZeige();
  letzteAnsage = ansageText();

  return {
    aktualisieren,
    aufraeumen: () => {
      clearTimeout(listenTimer);
      clearTimeout(ansageTimer);
    },
  };
}
