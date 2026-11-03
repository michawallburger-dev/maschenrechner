/**
 * Ansicht „Einstellungen“ (US-26 Farbschema, US-12 Datensicherung).
 */

import { einstellungAendern, anzahlStrickstuecke, einheitUmstellen } from '../modell.js';
import { erzeugeSicherung, leseSicherung, MAX_GROESSE } from '../sicherung.js';
import { speichereDaten, sichereVorImport } from '../speicher.js';
import { vorlage, texteFuellen, bestaetigen } from '../dom.js';
import { anzahlText } from './gemeinsam.js';

export function zeige(ctx, route, wurzel) {
  const ansicht = vorlage('tpl-einstellungen');
  texteFuellen(ansicht, ctx.t);
  wurzel.append(ansicht);

  const status = ansicht.querySelector('[data-rolle="status"]');
  const zeigeStatus = (text) => {
    status.textContent = text;
    status.hidden = !text;
  };

  ansicht.querySelector('[data-rolle="version"]').textContent = ctx.t('einst.version', { version: ctx.appVersion });

  /** Eine Auswahlgruppe vorbelegen und auf Änderungen hören. */
  const gruppe = (name, wert, beiWahl) => {
    for (const radio of ansicht.querySelectorAll(`input[name="${name}"]`)) {
      radio.checked = radio.value === wert;
      radio.addEventListener('change', () => {
        if (radio.checked) beiWahl(radio.value);
      });
    }
  };

  const einstellungen = ctx.daten().einstellungen;

  // ---------------------------------------------------------------- Sprache (US-23)
  // Der Sprachwechsel baut die Ansicht neu auf, weil texteFuellen nur beim
  // Aufbau wirkt. Einheit und Darstellung brauchen das nicht: Diese Ansicht
  // zeigt selbst keine Längen (Architektur Sprint 5, Abschnitt 6.2).
  gruppe('sprache', einstellungen.sprache, (wert) => {
    ctx.aendern(einstellungAendern(ctx.daten(), { sprache: wert }), { sofort: true });
    ctx.spracheAnwenden();
  });

  // ---------------------------------------------------------------- Längeneinheit (US-24)
  const einheitStatus = ansicht.querySelector('[data-rolle="einheit-status"]');
  gruppe('einheit', einstellungen.laengeneinheit, (wert) => {
    // Ein Schritt: Einheit setzen und alle gespeicherten Längen umrechnen (E34).
    ctx.aendern(einheitUmstellen(ctx.daten(), wert), { sofort: true });
    // Dass umgerechnet wurde, darf nicht unbemerkt bleiben (US-24 AK6).
    einheitStatus.textContent = ctx.t('einst.umgerechnet');
    einheitStatus.hidden = false;
  });

  // ---------------------------------------------------------------- Darstellung (US-41)
  gruppe('darstellung', einstellungen.laengenDarstellung, (wert) => {
    ctx.aendern(einstellungAendern(ctx.daten(), { laengenDarstellung: wert }), { sofort: true });
  });

  // ---------------------------------------------------------------- Farbschema (US-26)
  gruppe('farbschema', einstellungen.farbschema, (wert) => {
    ctx.aendern(einstellungAendern(ctx.daten(), { farbschema: wert }), { sofort: true });
    ctx.farbschemaAnwenden();
  });

  // ---------------------------------------------------------------- Sichern (US-12, AK1)
  ansicht.querySelector('[data-rolle="sichern"]').addEventListener('click', async () => {
    zeigeStatus('');
    const { dateiname, inhalt } = erzeugeSicherung(ctx.daten(), new Date(), ctx.appVersion);
    const ergebnis = await ctx.teileDatei(dateiname, inhalt);
    zeigeStatus(ctx.t(`einst.status.${ergebnis}`));
  });

  // ---------------------------------------------------------------- Einlesen (US-12, AK2–AK4)
  const datei = ansicht.querySelector('[data-rolle="datei"]');
  datei.addEventListener('change', async () => {
    zeigeStatus('');
    const gewaehlt = datei.files?.[0];
    datei.value = ''; // dieselbe Datei kann erneut gewählt werden
    if (!gewaehlt) return;

    const fehlerZeigen = (code) =>
      bestaetigen({
        titel: ctx.t('dialog.import.fehlerTitel'),
        text: ctx.t(`import.fehler.${code}`),
        okText: ctx.t('dialog.ok'),
        abbrechenText: ctx.t('dialog.abbrechen'),
        nurOk: true,
      });

    // Zu große Dateien gar nicht erst einlesen (QA S2-07)
    if (typeof gewaehlt.size === 'number' && gewaehlt.size > MAX_GROESSE) {
      await fehlerZeigen('ZU_GROSS');
      return;
    }

    let text;
    try {
      text = await ctx.leseDatei(gewaehlt);
    } catch {
      await fehlerZeigen('LESEN');
      return;
    }
    const ergebnis = leseSicherung(text);
    if (!ergebnis.gueltig) {
      await fehlerZeigen(ergebnis.fehler);
      return;
    }

    const { zusammenfassung } = ergebnis;
    const datum = zusammenfassung.erstellt
      ? new Intl.DateTimeFormat(ctx.locale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(zusammenfassung.erstellt))
      : ctx.t('import.unbekanntesDatum');
    const ok = await bestaetigen({
      titel: ctx.t('dialog.import.titel'),
      text: ctx.t('dialog.import.text', {
        datum,
        projekte: anzahlText(ctx.t, 'projekt', zusammenfassung.projekte),
        stuecke: anzahlText(ctx.t, 'stueck', zusammenfassung.strickstuecke),
        proben: anzahlText(ctx.t, 'probe', zusammenfassung.proben),
      }),
      okText: ctx.t('dialog.import.ok'),
      abbrechenText: ctx.t('dialog.abbrechen'),
      gefahr: true,
    });
    if (!ok) return;

    // Vorher die aktuellen Daten aufbewahren; ohne Speicher kein Import (sonst Datenverlust beim Neuladen)
    if (!ctx.speicherbar() || !sichereVorImport(ctx.speicher) || !speichereDaten(ctx.speicher, ergebnis.daten)) {
      zeigeStatus(ctx.t('einst.status.speicherFehler'));
      return;
    }
    ctx.ersetzeDaten(ergebnis.daten);
    ctx.farbschemaAnwenden();
    ctx.meldung(
      ctx.t('einst.status.eingelesen', {
        projekte: `${anzahlText(ctx.t, 'projekt', ergebnis.daten.projekte.length)}, ${anzahlText(ctx.t, 'stueck', anzahlStrickstuecke(ergebnis.daten))}`,
      }),
    );
    ctx.navigiere({ ansicht: 'liste' }, { ersetzen: true });
  });

  return { titel: ctx.t('titel.einstellungen'), zurueck: { ansicht: 'liste' } };
}
