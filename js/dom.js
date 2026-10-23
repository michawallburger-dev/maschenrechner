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
/**
 * Macht einen Bereich auf- und zuklappbar (US-38, US-25; Architektur Sprint 4, Abschnitt 5.4).
 *
 * Umgesetzt mit <details>/<summary>: Tastaturbedienung, Fokus und die Ansage des
 * Zustands kommen damit vom Browser. Der Helfer kennt den Speicher nicht – er
 * setzt den Anfangszustand und meldet jede Änderung an den Aufrufer.
 *
 * @param {HTMLDetailsElement} klappe
 * @param {{offen:boolean, aufToggle?:(offen:boolean)=>void}} optionen
 * @returns {{setzeOffen:(offen:boolean)=>void, istOffen:()=>boolean}}
 */
export function klappbar(klappe, { offen, aufToggle }) {
  // „gemeldet“ ist der Stand, den der Aufrufer kennt. Ein Setzen von .open löst
  // ebenfalls ein toggle-Ereignis aus; ohne diesen Abgleich würde jedes
  // programmatische Auf- und Zuklappen als Wunsch der Nutzerin gemeldet und
  // immer wieder gespeichert.
  let gemeldet = offen !== false;
  klappe.open = gemeldet;
  if (aufToggle) {
    klappe.addEventListener('toggle', () => {
      if (klappe.open === gemeldet) return;
      gemeldet = klappe.open;
      aufToggle(klappe.open);
    });
  }
  return {
    // Erzwungenes Aufklappen (z. B. bei einem Eingabefehler) überschreibt den
    // gespeicherten Zustand nicht, weil es nicht gemeldet wird.
    setzeOffen: (wert) => { gemeldet = wert; klappe.open = wert; },
    istOffen: () => klappe.open,
  };
}

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
  if (dialog.open) return;
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

/**
 * Laufende Abfragen je Dialog. Jede Abfrage muss beendet werden, bevor eine
 * neue denselben Dialog benutzt – sonst bleiben ihre Klick-Handler hängen und
 * eine alte Aktion (z. B. „Projekt löschen“) würde später mit ausgeführt (QA S2-01).
 * @type {Map<HTMLDialogElement, () => void>}
 */
const laufend = new Map();

/** Beendet eine eventuell laufende Abfrage dieses Dialogs als „abgebrochen“. */
function beendeLaufende(dialog) {
  const abbrechen = laufend.get(dialog);
  if (abbrechen) abbrechen();
}

/**
 * Bricht alle offenen Abfragen ab und schließt die Dialoge,
 * z. B. beim Wechsel der Ansicht (Zurück-Geste).
 */
export function schliesseDialoge() {
  for (const abbrechen of [...laufend.values()]) abbrechen();
  for (const dialog of document.querySelectorAll('dialog[open]')) dialog.close();
}

/**
 * Sicherheitsabfrage mit dem gemeinsamen Dialog #dialog-bestaetigen.
 * @returns {Promise<boolean>}
 */
export function bestaetigen({ titel, text, okText, abbrechenText, gefahr = false, nurOk = false }) {
  const dialog = document.getElementById('dialog-bestaetigen');
  beendeLaufende(dialog);
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
      laufend.delete(dialog);
      ok.removeEventListener('click', beiOk);
      abbrechen.removeEventListener('click', beiAbbrechen);
      dialog.removeEventListener('cancel', beiAbbrechen);
      dialog.removeEventListener('close', beiSchliessen);
      if (dialog.open) dialog.close();
      aufloesen(ergebnis);
    };
    const beiOk = () => fertig(true);
    const beiAbbrechen = (e) => {
      e?.preventDefault?.();
      fertig(false);
    };
    // Von außen geschlossen (ohne Antwort) → gilt als abgebrochen
    const beiSchliessen = () => {
      if (!dialog.open) fertig(false);
    };
    laufend.set(dialog, () => fertig(false));
    ok.addEventListener('click', beiOk);
    abbrechen.addEventListener('click', beiAbbrechen);
    dialog.addEventListener('cancel', beiAbbrechen);
    dialog.addEventListener('close', beiSchliessen);
    oeffne(dialog);
    (nurOk ? ok : abbrechen).focus();
  });
}

/**
 * Füllt eine Radiogruppe (fieldset mit legend) mit Optionen.
 * @param {HTMLFieldSetElement} gruppe
 * @param {string} name  name-Attribut der Radios
 * @param {{wert:string, text:string}[]} optionen
 * @param {string|null} vorauswahl
 */
function fuelleOptionen(gruppe, name, optionen, vorauswahl) {
  const liste = gruppe.querySelector('[data-rolle="optionen"]');
  leeren(liste);
  for (const o of optionen) {
    const radio = el('input', { attribute: { type: 'radio', name, value: o.wert } });
    radio.checked = o.wert === vorauswahl;
    liste.append(el('label', { klasse: 'option' }, [radio, el('span', { text: o.text })]));
  }
}

function gewaehlt(gruppe) {
  return gruppe.querySelector('input[type="radio"]:checked')?.value ?? null;
}

/**
 * Fragt einen Namen ab (Dialog #dialog-name), mit optionalen Vorschlägen.
 * @returns {Promise<string|null>} getrimmter Name oder null bei Abbruch
 */
export async function frageName(optionen) {
  const ergebnis = await frageNameUndWahl(optionen);
  return ergebnis === null ? null : ergebnis.name;
}

/**
 * Fragt einen Namen und – wenn angegeben – eine Auswahl ab (z. B. die Probe eines
 * neuen Strickstücks, US-32 AK4). Die Auswahl hat keine Vorauswahl und ist Pflicht.
 * @param {object} optionen  wie frageName, zusätzlich
 *   auswahl?: { legende:string, optionen:{wert:string,text:string}[], fehlerText:string }
 * @returns {Promise<{name:string, wahl:string|null}|null>}
 */
export function frageNameUndWahl({ titel, label, wert = '', vorschlaege = [], okText, abbrechenText, fehlerLeer, maxLaenge = 80, auswahl = null }) {
  const dialog = document.getElementById('dialog-name');
  beendeLaufende(dialog);
  const eingabe = dialog.querySelector('input[type="text"]');
  const fehler = dialog.querySelector('[data-rolle="fehler"]');
  const vorschlagListe = dialog.querySelector('[data-rolle="vorschlaege"]');
  const ok = dialog.querySelector('[data-rolle="ok"]');
  const abbrechen = dialog.querySelector('[data-rolle="abbrechen"]');
  const gruppe = dialog.querySelector('[data-rolle="auswahl"]');
  const gruppeFehler = dialog.querySelector('[data-rolle="auswahl-fehler"]');

  gruppe.hidden = !auswahl;
  gruppeFehler.hidden = true;
  gruppeFehler.textContent = '';
  if (auswahl) {
    gruppe.querySelector('legend').textContent = auswahl.legende;
    fuelleOptionen(gruppe, 'dialog-name-auswahl', auswahl.optionen, null);
  }

  dialog.querySelector('[data-rolle="titel"]').textContent = titel;
  dialog.querySelector('label[for="dialog-name-eingabe"]').textContent = label;
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
      laufend.delete(dialog);
      ok.removeEventListener('click', beiOk);
      abbrechen.removeEventListener('click', beiAbbrechen);
      dialog.removeEventListener('cancel', beiAbbrechen);
      dialog.removeEventListener('close', beiSchliessen);
      eingabe.removeEventListener('keydown', beiTaste);
      if (dialog.open) dialog.close();
      aufloesen(ergebnis);
    };
    const beiSchliessen = () => {
      if (!dialog.open) fertig(null);
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
      const wahl = auswahl ? gewaehlt(gruppe) : null;
      if (auswahl && wahl === null) {
        gruppeFehler.textContent = auswahl.fehlerText;
        gruppeFehler.hidden = false;
        gruppe.querySelector('input[type="radio"]')?.focus();
        return;
      }
      fertig({ name, wahl });
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
    laufend.set(dialog, () => fertig(null));
    ok.addEventListener('click', beiOk);
    abbrechen.addEventListener('click', beiAbbrechen);
    dialog.addEventListener('cancel', beiAbbrechen);
    dialog.addEventListener('close', beiSchliessen);
    eingabe.addEventListener('keydown', beiTaste);
    oeffne(dialog);
    eingabe.focus();
  });
}

/**
 * Auswahl aus mehreren Möglichkeiten (Dialog #dialog-auswahl), z. B. „Probe wechseln“.
 * @param {{titel:string, frage:string, legende:string, optionen:{wert:string,text:string}[], vorauswahl?:string|null, okText:string, abbrechenText:string}} optionen
 * @returns {Promise<string|null>} gewählter Wert oder null bei Abbruch
 */
export function waehle({ titel, frage, legende, optionen, vorauswahl = null, okText, abbrechenText }) {
  const dialog = document.getElementById('dialog-auswahl');
  beendeLaufende(dialog);
  const ok = dialog.querySelector('[data-rolle="ok"]');
  const abbrechen = dialog.querySelector('[data-rolle="abbrechen"]');
  const gruppe = dialog.querySelector('[data-rolle="auswahl"]');
  dialog.querySelector('[data-rolle="titel"]').textContent = titel;
  dialog.querySelector('[data-rolle="text"]').textContent = frage;
  gruppe.querySelector('legend').textContent = legende;
  fuelleOptionen(gruppe, 'dialog-auswahl-wert', optionen, vorauswahl);
  ok.textContent = okText;
  abbrechen.textContent = abbrechenText;

  return new Promise((aufloesen) => {
    const fertig = (ergebnis) => {
      laufend.delete(dialog);
      ok.removeEventListener('click', beiOk);
      abbrechen.removeEventListener('click', beiAbbrechen);
      dialog.removeEventListener('cancel', beiAbbrechen);
      dialog.removeEventListener('close', beiSchliessen);
      if (dialog.open) dialog.close();
      aufloesen(ergebnis);
    };
    const beiOk = () => fertig(gewaehlt(gruppe));
    const beiAbbrechen = (e) => {
      e?.preventDefault?.();
      fertig(null);
    };
    const beiSchliessen = () => {
      if (!dialog.open) fertig(null);
    };
    laufend.set(dialog, () => fertig(null));
    ok.addEventListener('click', beiOk);
    abbrechen.addEventListener('click', beiAbbrechen);
    dialog.addEventListener('cancel', beiAbbrechen);
    dialog.addEventListener('close', beiSchliessen);
    oeffne(dialog);
    (gruppe.querySelector('input:checked') ?? gruppe.querySelector('input'))?.focus();
  });
}
