/**
 * Kleine DOM-Helfer: Vorlagen klonen, Texte einsetzen, Dialoge.
 * Werte werden ausschließlich über textContent/value gesetzt – kein innerHTML.
 */

/** Klont das erste Element aus einem <template id="…">. */
export function vorlage(id) {
  const tpl = document.getElementById(id);
  if (!(tpl instanceof HTMLTemplateElement)) throw new Error(`Vorlage fehlt: ${id}`);
  return tpl.content.firstElementChild.cloneNode(true);
}

/** Erzeugt ein Element mit Klassen, Text und Attributen. */
export function el(tag, { klasse, text, attribute = {} } = {}, kinder = []) {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (text !== undefined) e.textContent = text;
  for (const [name, wert] of Object.entries(attribute)) {
    if (wert === false || wert === null || wert === undefined) continue;
    e.setAttribute(name, wert === true ? '' : String(wert));
  }
  for (const kind of kinder) if (kind) e.append(kind);
  return e;
}

/** Entfernt alle Kinder eines Elements. */
export function leeren(e) {
  while (e.firstChild) e.firstChild.remove();
}

/**
 * Setzt Texte für alle Elemente mit data-text, data-text-aria-label und
 * data-text-placeholder unterhalb von (und einschließlich) wurzel.
 * @param {Element|Document} wurzel
 * @param {(schluessel:string)=>string} t
 */
export function texteFuellen(wurzel, t) {
  const alle = (sel) => {
    const liste = [...wurzel.querySelectorAll(sel)];
    if (wurzel instanceof Element && wurzel.matches(sel)) liste.unshift(wurzel);
    return liste;
  };
  for (const e of alle('[data-text]')) e.textContent = t(e.dataset.text);
  for (const e of alle('[data-text-aria-label]')) e.setAttribute('aria-label', t(e.dataset.textAriaLabel));
  for (const e of alle('[data-text-placeholder]')) e.setAttribute('placeholder', t(e.dataset.textPlaceholder));
}

/** Öffnet einen <dialog> modal, mit Rückfall, falls showModal fehlt. */
function oeffne(dialog) {
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

/**
 * Sicherheitsabfrage mit dem gemeinsamen Dialog #dialog-bestaetigen.
 * @returns {Promise<boolean>}
 */
export function bestaetigen({ titel, text, okText, abbrechenText, gefahr = false, nurOk = false }) {
  const dialog = document.getElementById('dialog-bestaetigen');
  const ok = dialog.querySelector('[data-rolle="ok"]');
  const abbrechen = dialog.querySelector('[data-rolle="abbrechen"]');
  dialog.querySelector('[data-rolle="titel"]').textContent = titel;
  dialog.querySelector('[data-rolle="text"]').textContent = text;
  ok.textContent = okText;
  abbrechen.textContent = abbrechenText;
  abbrechen.hidden = nurOk;
  ok.className = `knopf ${gefahr ? 'knopf-gefahr' : 'knopf-primaer'}`;

  return new Promise((aufloesen) => {
    const fertig = (ergebnis) => {
      ok.removeEventListener('click', beiOk);
      abbrechen.removeEventListener('click', beiAbbrechen);
      dialog.removeEventListener('cancel', beiAbbrechen);
      if (dialog.open) dialog.close();
      aufloesen(ergebnis);
    };
    const beiOk = () => fertig(true);
    const beiAbbrechen = (e) => {
      e?.preventDefault?.();
      fertig(false);
    };
    ok.addEventListener('click', beiOk);
    abbrechen.addEventListener('click', beiAbbrechen);
    dialog.addEventListener('cancel', beiAbbrechen);
    oeffne(dialog);
    (nurOk ? ok : abbrechen).focus();
  });
}

/**
 * Fragt einen Namen ab (Dialog #dialog-name), mit optionalen Vorschlägen.
 * @returns {Promise<string|null>} getrimmter Name oder null bei Abbruch
 */
export function frageName({ titel, label, wert = '', vorschlaege = [], okText, abbrechenText, fehlerLeer, maxLaenge = 80 }) {
  const dialog = document.getElementById('dialog-name');
  const eingabe = dialog.querySelector('input');
  const fehler = dialog.querySelector('[data-rolle="fehler"]');
  const vorschlagListe = dialog.querySelector('[data-rolle="vorschlaege"]');
  const ok = dialog.querySelector('[data-rolle="ok"]');
  const abbrechen = dialog.querySelector('[data-rolle="abbrechen"]');

  dialog.querySelector('[data-rolle="titel"]').textContent = titel;
  dialog.querySelector('label').textContent = label;
  ok.textContent = okText;
  abbrechen.textContent = abbrechenText;
  eingabe.value = wert;
  eingabe.maxLength = maxLaenge;
  eingabe.removeAttribute('aria-invalid');
  fehler.hidden = true;
  fehler.textContent = '';
  leeren(vorschlagListe);
  vorschlagListe.hidden = vorschlaege.length === 0;
  for (const v of vorschlaege) {
    const knopf = el('button', { klasse: 'chip', text: v, attribute: { type: 'button' } });
    knopf.addEventListener('click', () => {
      eingabe.value = v;
      eingabe.focus();
    });
    vorschlagListe.append(el('li', {}, [knopf]));
  }

  return new Promise((aufloesen) => {
    const fertig = (ergebnis) => {
      ok.removeEventListener('click', beiOk);
      abbrechen.removeEventListener('click', beiAbbrechen);
      dialog.removeEventListener('cancel', beiAbbrechen);
      eingabe.removeEventListener('keydown', beiTaste);
      if (dialog.open) dialog.close();
      aufloesen(ergebnis);
    };
    const beiOk = () => {
      const name = eingabe.value.trim();
      if (name === '') {
        fehler.textContent = fehlerLeer;
        fehler.hidden = false;
        eingabe.setAttribute('aria-invalid', 'true');
        eingabe.focus();
        return;
      }
      fertig(name);
    };
    const beiAbbrechen = (e) => {
      e?.preventDefault?.();
      fertig(null);
    };
    const beiTaste = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        beiOk();
      }
    };
    ok.addEventListener('click', beiOk);
    abbrechen.addEventListener('click', beiAbbrechen);
    dialog.addEventListener('cancel', beiAbbrechen);
    eingabe.addEventListener('keydown', beiTaste);
    oeffne(dialog);
    eingabe.focus();
  });
}
