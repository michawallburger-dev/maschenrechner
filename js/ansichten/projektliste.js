/**
 * Ansicht „Meine Projekte“ (US-09): Liste nach letzter Änderung, Leerzustand,
 * neues Projekt anlegen.
 */

import { projekteSortiert, neuesProjekt } from '../modell.js';
import { vorlage, texteFuellen, el, frageName } from '../dom.js';
import { hashFuer } from '../router.js';
import { anzahlText, wannText } from './gemeinsam.js';

export function zeige(ctx, route, wurzel) {
  const ansicht = vorlage('tpl-projektliste');
  texteFuellen(ansicht, ctx.t);
  wurzel.append(ansicht);

  const projekte = projekteSortiert(ctx.daten());
  ansicht.querySelector('[data-rolle="leer"]').hidden = projekte.length > 0;
  const liste = ansicht.querySelector('[data-rolle="liste"]');
  liste.hidden = projekte.length === 0;

  for (const projekt of projekte) {
    const info = `${anzahlText(ctx.t, 'stueck', projekt.strickstuecke.length)} · ${ctx.t('liste.geaendert', {
      wann: wannText(ctx.t, ctx.locale(), projekt.geaendert),
    })}`;
    const link = el('a', { klasse: 'listen-eintrag', attribute: { href: hashFuer({ ansicht: 'projekt', projektId: projekt.id }) } }, [
      el('span', { klasse: 'eintrag-name', text: projekt.name }),
      el('span', { klasse: 'eintrag-info', text: info }),
    ]);
    liste.append(el('li', {}, [link]));
  }

  ansicht.querySelector('[data-rolle="neu"]').addEventListener('click', async () => {
    const name = await frageName({
      titel: ctx.t('dialog.neuesProjekt.titel'),
      label: ctx.t('dialog.neuesProjekt.label'),
      okText: ctx.t('dialog.anlegen'),
      abbrechenText: ctx.t('dialog.abbrechen'),
      fehlerLeer: ctx.t('fehler.NAME_LEER'),
    });
    if (name === null) return;
    const ergebnis = neuesProjekt(ctx.daten(), { name }, ctx.neueId('p'), ctx.jetzt());
    if (!ergebnis.gueltig) return;
    ctx.aendern(ergebnis.daten, { sofort: true });
    ctx.navigiere({ ansicht: 'projekt', projektId: ergebnis.projektId });
  });

  return { titel: ctx.t('titel.projektliste'), zurueck: null };
}
