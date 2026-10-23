/**
 * Ansicht „Strickstück“ (US-10, US-32, US-14): die vier Rechner aus Sprint 1
 * mit der zugeordneten Probe, „Probe wechseln“, die Karte „Zu- und Abnahmen“
 * und der Weg zum Reihenzähler.
 *
 * Die Rechenwege sind unverändert aus Sprint 1 übernommen (Architektur R7).
 */

import { umrechnenAusAnleitung, umrechnenAusCm } from '../rechner.js';
import { pruefeZahl, REGELN } from '../eingabe.js';
import { formatZahl, formatGanzzahl, formatAbweichung, LEER_ANZEIGE } from '../format.js';
import { zuCm, vonCm } from '../einheiten.js';
import { finde, probeVon, strickstueckAendern, strickstueckLoeschen, leereRechner, RECHNER_NAMEN } from '../modell.js';
import { vorlage, texteFuellen, klappbar, bestaetigen, frageName, waehle } from '../dom.js';
import { bauePlankarte } from './plankarte.js';
import { hashFuer } from '../router.js';
import { pruefeUndZeige, probeLesen } from './gemeinsam.js';

/** Welche Richtung (Maschen/Reihen) und Art jede Karte hat. */
const KARTEN = {
  maschenAusAnleitung: { richtung: 'maschen', art: 'anleitung', regel: 'ganzPositiv', inputmode: 'numeric' },
  reihenAusAnleitung: { richtung: 'reihen', art: 'anleitung', regel: 'ganzPositiv', inputmode: 'numeric' },
  breiteZuMaschen: { richtung: 'maschen', art: 'laenge', regel: 'laenge', inputmode: 'decimal' },
  laengeZuReihen: { richtung: 'reihen', art: 'laenge', regel: 'laenge', inputmode: 'decimal' },
};

const ERGEBNIS_FELDER = ['massAnleitung', 'anleitungGerundet', 'eigenGerundet', 'endgueltig', 'tatsaechlich', 'abweichung'];

/** Kurzfassung einer Probe: „Laut Anleitung: 34 M auf 10 cm · 52 R auf 10 cm“. */
function probeZeile(ctx, nameSchluessel, probe) {
  const wert = (s) => (s.trim() === '' ? LEER_ANZEIGE : s.trim());
  return ctx.t('stueck.probeZeile', {
    name: ctx.t(nameSchluessel),
    m: wert(probe.maschenAnzahl),
    mb: wert(probe.maschenBezug),
    r: wert(probe.reihenAnzahl),
    rb: wert(probe.reihenBezug),
  });
}

/** Baut eine Rechner-Karte aus der Vorlage. */
function baueKarte(ctx, name, werte) {
  const { art, regel, inputmode } = KARTEN[name];
  const karte = vorlage('tpl-rechner');
  karte.dataset.karte = name;
  const id = (teil) => `${teil}-${name}`;

  // Elemente verknüpfen (IDs, Labels, Beschreibungen)
  const eingabe = karte.querySelector('[data-rolle="eingabe"]');
  const eingabeFehler = karte.querySelector('[data-rolle="eingabe-fehler"]');
  const anpassung = karte.querySelector('[data-rolle="anpassung"]');
  const anpassungFehler = karte.querySelector('[data-rolle="anpassung-fehler"]');
  const anpassungHinweis = karte.querySelector('[data-rolle="anpassung-hinweis"]');
  const titel = karte.querySelector('[data-rolle="titel"]');

  titel.id = id('titel');
  karte.setAttribute('aria-labelledby', titel.id);
  eingabe.id = id('eingabe');
  eingabe.inputMode = inputmode;
  eingabe.dataset.regel = regel;
  eingabe.dataset.feld = 'eingabe';
  eingabeFehler.id = id('fehler-eingabe');
  eingabe.setAttribute('aria-describedby', eingabeFehler.id);
  karte.querySelector('[data-rolle="eingabe-label"]').htmlFor = eingabe.id;

  anpassung.id = id('anpassung');
  anpassung.dataset.regel = 'anpassung';
  anpassung.dataset.feld = 'anpassung';
  anpassungFehler.id = id('fehler-anpassung');
  anpassungHinweis.id = id('hinweis-anpassung');
  anpassung.setAttribute('aria-describedby', `${anpassungHinweis.id} ${anpassungFehler.id}`);
  karte.querySelector('[data-rolle="anpassung-label"]').htmlFor = anpassung.id;

  // Texte je Karte (mit {einheit})
  titel.dataset.text = `rechner.${name}.titel`;
  karte.querySelector('[data-rolle="beschreibung"]').dataset.text = `rechner.${name}.beschreibung`;
  karte.querySelector('[data-rolle="eingabe-label"]').dataset.text = `rechner.${name}.eingabe`;
  for (const feld of ['massAnleitung', 'anleitungGerundet', 'eigenGerundet', 'endgueltig', 'tatsaechlich', 'abweichung']) {
    const e = karte.querySelector(`[data-rolle="t-${feld}"]`);
    if (e) e.dataset.text = `rechner.${name}.${feld}`;
  }
  // Nur die zur Art passende Zeile behalten
  for (const zeile of karte.querySelectorAll('[data-nur]')) if (zeile.dataset.nur !== art) zeile.remove();

  texteFuellen(karte, ctx.t);
  eingabe.value = werte.eingabe;
  anpassung.value = werte.anpassung;
  return karte;
}

export function zeige(ctx, route, wurzel) {
  const gefunden = finde(ctx.daten(), route.projektId, route.stueckId);
  if (!gefunden) return null;
  const { projektId, stueckId } = route;

  const ansicht = vorlage('tpl-strickstueck');
  texteFuellen(ansicht, ctx.t);
  wurzel.append(ansicht);

  const raster = ansicht.querySelector('[data-rolle="rechner"]');
  for (const name of RECHNER_NAMEN) raster.append(baueKarte(ctx, name, gefunden.stueck.rechner[name]));

  // Karten auf Wunsch zuklappen; der Zustand liegt am Strickstück (US-38, AK1–AK3)
  for (const karte of raster.querySelectorAll('[data-karte]')) {
    const name = karte.dataset.karte;
    klappbar(karte.querySelector('[data-rolle="klappe"]'), {
      offen: gefunden.stueck.eingeklappt?.[name] !== true,
      aufToggle: (offen) => speichereKlapp(name, !offen),
    });
  }

  const projektHash = hashFuer({ ansicht: 'projekt', projektId });
  ansicht.querySelector('[data-rolle="zaehlen"]').href = hashFuer({ ansicht: 'zaehlen', projektId, stueckId });
  ansicht.querySelector('[data-rolle="proben-link"]').href = `${projektHash}`;
  for (const link of ansicht.querySelectorAll('[data-rolle="status-link"]')) link.href = projektHash;

  const beruehrt = new Set();

  function aktuell() {
    return finde(ctx.daten(), projektId, stueckId);
  }

  function zeigeKopfdaten() {
    const g = aktuell();
    if (!g) return;
    const probe = probeVon(g.projekt, g.stueck);
    ansicht.querySelector('[data-rolle="stand"]').textContent = ctx.t('stueck.zaehlerStand', { n: formatGanzzahl(g.stueck.zaehler, ctx.locale()) });
    // Kurzfassung der zugeordneten Probe mit Nadel (US-32 AK2, AK3)
    ansicht.querySelector('[data-rolle="probe-titel"]').textContent = ctx.t('stueck.probeName', { name: probe?.name ?? LEER_ANZEIGE });
    const nadel = ansicht.querySelector('[data-rolle="probe-nadel"]');
    const nadelText = probe?.nadelstaerkeMm.trim() ?? '';
    nadel.hidden = nadelText === '';
    nadel.textContent = nadelText === '' ? '' : ctx.t('stueck.nadel', { nadel: nadelText });
    ansicht.querySelector('[data-rolle="probe-anleitung"]').textContent = probe ? probeZeile(ctx, 'proben.anleitung', probe.anleitung) : LEER_ANZEIGE;
    ansicht.querySelector('[data-rolle="probe-eigen"]').textContent = probe ? probeZeile(ctx, 'proben.eigen', probe.eigen) : LEER_ANZEIGE;
    ansicht.querySelector('[data-rolle="probe-wechseln"]').hidden = g.projekt.proben.length < 2;
  }

  function setze(karte, feld, anzeige) {
    const e = karte.querySelector(`[data-ergebnis="${feld}"]`);
    if (e) e.textContent = anzeige;
  }

  function status(karte, schluessel, mitLink = false) {
    const box = karte.querySelector('[data-rolle="status"]');
    box.hidden = !schluessel;
    karte.querySelector('[data-rolle="status-text"]').textContent = schluessel ? ctx.t(schluessel) : '';
    karte.querySelector('[data-rolle="status-link"]').hidden = !mitLink;
  }

  /** Text eines sichtbaren Fehlers oder Hinweises der Karte, sonst null. */
  function problemText(karte) {
    for (const e of karte.querySelectorAll('.fehler')) if (!e.hidden && e.textContent) return e.textContent;
    const box = karte.querySelector('[data-rolle="status"]');
    if (box && !box.hidden) {
      const t = karte.querySelector('[data-rolle="status-text"]');
      if (t && t.textContent) return t.textContent;
    }
    return null;
  }

  /**
   * Berechnet eine Karte und setzt danach ihre Kurzfassung.
   *
   * Ein Fehler oder Hinweis geht in die Kurzfassung und ist damit auch bei
   * zugeklappter Karte sichtbar (Befunde S4-02, S4-03). Die Karte wird dafür
   * nicht mehr erzwungen aufgeklappt – das Zuklappen bleibt der Nutzerin.
   */
  function berechneKarte(karte, proben) {
    const kurz = karte.querySelector('[data-rolle="kurzfassung"]');
    const ergebnis = berechneKarteInhalt(karte, proben);
    const problem = problemText(karte);
    if (problem) {
      kurz.textContent = ctx.t('stueck.kurzfassungProblem', { text: problem });
      kurz.dataset.problem = '';
      return;
    }
    delete kurz.dataset.problem;
    kurz.textContent = ergebnis ?? '';
  }

  /** Berechnet eine Karte – Logik wie in Sprint 1. Gibt die Kurzfassung zurück. */
  function berechneKarteInhalt(karte, proben) {
    const name = karte.dataset.karte;
    const { richtung, art } = KARTEN[name];
    const eingabeInput = karte.querySelector('[data-rolle="eingabe"]');
    const anpassungInput = karte.querySelector('[data-rolle="anpassung"]');
    const eingabe = pruefeUndZeige(eingabeInput, karte.querySelector('[data-rolle="eingabe-fehler"]'), eingabeInput.dataset.regel, {
      t: ctx.t,
      beruehrt: beruehrt.has(eingabeInput),
    });
    const anpassung = pruefeUndZeige(anpassungInput, karte.querySelector('[data-rolle="anpassung-fehler"]'), 'anpassung', {
      t: ctx.t,
      beruehrt: beruehrt.has(anpassungInput),
    });

    for (const feld of ERGEBNIS_FELDER) setze(karte, feld, LEER_ANZEIGE);
    status(karte, null);
    if (!eingabe.gueltig) return;

    const probeAnleitung = proben.anleitung[richtung];
    const probeEigen = proben.eigen[richtung];
    if (!probeAnleitung || !probeEigen) {
      status(karte, 'hinweis.probenFehlen', true);
      return;
    }

    const loc = ctx.locale();
    const e = ctx.einheit();
    const anpassungWert = anpassung.gueltig ? anpassung.wert : 0;
    let r;
    if (art === 'anleitung') {
      r = umrechnenAusAnleitung(eingabe.wert, probeAnleitung, probeEigen, anpassungWert);
      setze(karte, 'massAnleitung', formatZahl(vonCm(r.cmLautAnleitung, e), loc));
    } else {
      r = umrechnenAusCm(zuCm(eingabe.wert, e), probeAnleitung, probeEigen, anpassungWert);
      setze(karte, 'anleitungGerundet', formatGanzzahl(r.anleitungGerundet, loc));
    }
    setze(karte, 'eigenGerundet', formatGanzzahl(r.eigenGerundet, loc));

    if (!anpassung.gueltig) return;
    if (!r.gueltig) {
      status(karte, 'hinweis.ergebnisZuKlein');
      return;
    }
    setze(karte, 'endgueltig', formatGanzzahl(r.endgueltig, loc));
    setze(karte, 'tatsaechlich', formatZahl(vonCm(r.cmTatsaechlich, e), loc));
    setze(karte, 'abweichung', formatAbweichung(vonCm(r.abweichungCm, e), loc));
    // Hauptergebnis in Kurzform, sichtbar wenn die Karte zugeklappt ist (US-38 AK5)
    return ctx.t('stueck.kurzfassung', {
      titel: ctx.t(`rechner.${name}.endgueltig`),
      wert: formatGanzzahl(r.endgueltig, loc),
    });
  }

  function aktualisieren() {
    const g = aktuell();
    if (!g) return;
    const e = ctx.einheit();
    const probe = probeVon(g.projekt, g.stueck);
    const proben = { anleitung: {}, eigen: {} };
    for (const richtung of ['maschen', 'reihen']) {
      proben.anleitung[richtung] = probe ? probeLesen(probe.anleitung, richtung, e) : null;
      proben.eigen[richtung] = probe ? probeLesen(probe.eigen, richtung, e) : null;
    }
    for (const karte of raster.querySelectorAll('[data-karte]')) berechneKarte(karte, proben);
    zeigeKopfdaten();
  }

  function speichereKlapp(name, zu) {
    const ergebnis = strickstueckAendern(ctx.daten(), projektId, stueckId, { eingeklappt: { [name]: zu } }, ctx.jetzt());
    if (ergebnis.gueltig) ctx.aendern(ergebnis.daten);
  }

  function speichereFeld(input) {
    const karte = input.closest('[data-karte]');
    const ergebnis = strickstueckAendern(
      ctx.daten(),
      projektId,
      stueckId,
      { rechner: { [karte.dataset.karte]: { [input.dataset.feld]: input.value } } },
      ctx.jetzt(),
    );
    if (ergebnis.gueltig) ctx.aendern(ergebnis.daten);
  }

  // ---------------------------------------------------------------- Ereignisse
  ansicht.addEventListener('input', (ereignis) => {
    const input = ereignis.target;
    if (!(input instanceof HTMLInputElement) || !input.dataset.feld) return;
    beruehrt.add(input);
    speichereFeld(input);
    aktualisieren();
  });

  ansicht.addEventListener('focusout', (ereignis) => {
    const input = ereignis.target;
    if (!(input instanceof HTMLInputElement) || !input.dataset.feld) return;
    beruehrt.add(input);
    // Nach dem Verlassen ist das Feld nicht mehr fokussiert → „unvollständig“ wird gezeigt
    setTimeout(aktualisieren, 0);
  });

  ansicht.addEventListener('click', async (ereignis) => {
    const knopf = ereignis.target.closest('button');
    // Knöpfe der Plan-Karte behandelt plankarte.js selbst
    if (!knopf || knopf.closest('.plan')) return;

    if (knopf.dataset.schritt) {
      const input = knopf.closest('.stepper').querySelector('input');
      const regel = REGELN.anpassung;
      const aktuellWert = pruefeZahl(input.value, 'anpassung');
      const basis = aktuellWert.gueltig ? aktuellWert.wert : 0;
      input.value = String(Math.min(regel.max, Math.max(regel.min, basis + Number(knopf.dataset.schritt))));
      beruehrt.add(input);
      speichereFeld(input);
      aktualisieren();
      return;
    }

    const g = aktuell();
    if (!g) return;
    switch (knopf.dataset.rolle) {
      case 'probe-wechseln': {
        // US-32 AK5: Rechner, Anpassungen, Plan und Zähler bleiben, alles rechnet neu
        const wahl = await waehle({
          titel: ctx.t('dialog.probeWechseln.titel'),
          frage: ctx.t('dialog.probeWechseln.frage', { name: g.stueck.name }),
          legende: ctx.t('stueck.probe'),
          optionen: g.projekt.proben.map((p) => ({ wert: p.id, text: p.nadelstaerkeMm.trim() ? ctx.t('probe.kurz', { name: p.name, nadel: p.nadelstaerkeMm.trim() }) : p.name })),
          vorauswahl: g.stueck.probeId,
          okText: ctx.t('dialog.speichern'),
          abbrechenText: ctx.t('dialog.abbrechen'),
        });
        if (wahl === null || wahl === g.stueck.probeId) return;
        const ergebnis = strickstueckAendern(ctx.daten(), projektId, stueckId, { probeId: wahl }, ctx.jetzt());
        if (!ergebnis.gueltig) return;
        ctx.aendern(ergebnis.daten, { sofort: true });
        aktualisieren();
        plankarte.aktualisieren();
        return;
      }
      case 'umbenennen': {
        const name = await frageName({
          titel: ctx.t('dialog.umbenennen.titel'),
          label: ctx.t('dialog.neuesStueck.label'),
          wert: g.stueck.name,
          okText: ctx.t('dialog.speichern'),
          abbrechenText: ctx.t('dialog.abbrechen'),
          fehlerLeer: ctx.t('fehler.NAME_LEER'),
        });
        if (name === null) return;
        const ergebnis = strickstueckAendern(ctx.daten(), projektId, stueckId, { name }, ctx.jetzt());
        if (ergebnis.gueltig) {
          ctx.aendern(ergebnis.daten, { sofort: true });
          ctx.setzeTitel(name);
        }
        return;
      }
      case 'zuruecksetzen': {
        const ok = await bestaetigen({
          titel: ctx.t('dialog.stueckZuruecksetzen.titel'),
          text: ctx.t('dialog.stueckZuruecksetzen.text', { name: g.stueck.name }),
          okText: ctx.t('dialog.zuruecksetzen.ok'),
          abbrechenText: ctx.t('dialog.abbrechen'),
          gefahr: true,
        });
        if (!ok) return;
        const ergebnis = strickstueckAendern(ctx.daten(), projektId, stueckId, { rechner: leereRechner() }, ctx.jetzt());
        if (!ergebnis.gueltig) return;
        ctx.aendern(ergebnis.daten, { sofort: true });
        beruehrt.clear();
        for (const karte of raster.querySelectorAll('[data-karte]')) {
          const werte = leereRechner()[karte.dataset.karte];
          karte.querySelector('[data-rolle="eingabe"]').value = werte.eingabe;
          karte.querySelector('[data-rolle="anpassung"]').value = werte.anpassung;
        }
        aktualisieren();
        return;
      }
      case 'loeschen': {
        const ok = await bestaetigen({
          titel: ctx.t('dialog.stueckLoeschen.titel'),
          text: ctx.t('dialog.stueckLoeschen.text', { name: g.stueck.name, n: formatGanzzahl(g.stueck.zaehler, ctx.locale()) }),
          okText: ctx.t('dialog.loeschen'),
          abbrechenText: ctx.t('dialog.abbrechen'),
          gefahr: true,
        });
        if (!ok) return;
        ctx.aendern(strickstueckLoeschen(ctx.daten(), projektId, stueckId, ctx.jetzt()), { sofort: true });
        ctx.navigiere({ ansicht: 'projekt', projektId }, { ersetzen: true });
        return;
      }
      default:
    }
  });

  const plankarte = bauePlankarte(ctx, { projektId, stueckId, behaelter: ansicht.querySelector('[data-rolle="plan"]') });
  aktualisieren();

  return {
    titel: gefunden.stueck.name,
    seitentitel: `${gefunden.stueck.name} – ${gefunden.projekt.name}`,
    zurueck: { ansicht: 'projekt', projektId },
    aufraeumen: () => plankarte.aufraeumen(),
  };
}
