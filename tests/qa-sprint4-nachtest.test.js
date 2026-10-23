/**
 * QA-Nachtest Sprint 4 (Commit cf49a64) – unabhängige Gegenprobe zu den Befunden
 * S4-01 bis S4-06 aus `docs/qa/sprint-4-testbericht.md`.
 *
 * Die Tests prüfen nur, was sich ohne Browser prüfen lässt: Texte, Rechenwege und
 * die Struktur der ausgelieferten Dateien. Die gemessenen Werte der Oberfläche
 * (Dreieck, Kurzfassung, Breite des Auswahlfelds, Höhe der Zähleransicht) stehen
 * im Abschnitt „Nachtest“ des Testberichts.
 *
 * Offene Befunde sind als `todo` festgehalten, wie in Sprint 4 eingeführt:
 * S4-07, S4-08 und S4-09 beschreiben, was die Kurzfassung noch nicht abdeckt.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

import { text, SPRACHEN } from '../js/texte.js';
import { planAusTexten, standardStartReihe, erlaubteReihen } from '../js/plan.js';
import { leereDaten, neuesProjekt, neuesStrickstueck, strickstueckAendern, leererPlan } from '../js/modell.js';

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const lies = (pfad) => readFileSync(join(WURZEL, pfad), 'utf8');

const CSS = lies('css/style.css');
const HTML = lies('index.html');
const DOM_JS = lies('js/dom.js');
const PLANKARTE = lies('js/ansichten/plankarte.js');
const STRICKSTUECK = lies('js/ansichten/strickstueck.js');

const PROBE = { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '37', reihenBezug: '10' };
const REFERENZ = {
  anfangBreite: '20',
  endBreite: '34',
  laenge: '45',
  maschenProEreignis: '2',
  startReihe: '',
  arbeitsweise: 'reihen',
  jedeZweite: false,
  ereignisWahl: 'weniger',
  anpassung: { anfang: '0', ende: '0', reihen: '0' },
};

// ============================================================ S4-01: Dreieck

test('S4-01: der Kartenkopf zeichnet ein eigenes Dreieck in --text-leise', () => {
  const regel = CSS.match(/\.kartenkopf::before \{[\s\S]*?\}/);
  assert.ok(regel, '.kartenkopf::before fehlt im Stylesheet');
  assert.match(regel[0], /border-left:\s*7px solid var\(--text-leise\)/);
  // Ein Rahmen-Dreieck hat keinen Textinhalt und wird deshalb nicht vorgelesen
  assert.match(regel[0], /content:\s*''/);
});

test('S4-01: das Dreieck dreht sich nur im offenen Zustand', () => {
  const regel = CSS.match(/details\[open\] > \.kartenkopf::before \{[\s\S]*?\}/);
  assert.ok(regel, 'Drehung bei details[open] fehlt');
  assert.match(regel[0], /transform:\s*rotate\(90deg\)/);
});

test('S4-01: der Marker des Browsers ist abgeschaltet, das Touch-Ziel bleibt 44 px', () => {
  const kopf = CSS.match(/\n\.kartenkopf \{[\s\S]*?\n\}/);
  assert.ok(kopf, '.kartenkopf fehlt');
  assert.match(kopf[0], /list-style:\s*none/);
  assert.match(kopf[0], /min-height:\s*44px/);
  assert.match(CSS, /\.kartenkopf::-webkit-details-marker \{[\s\S]*?display:\s*none/);
});

test('S4-01: Titel und Kurzfassung stehen in .kartenkopf-text, damit das Dreieck daneben bleibt', () => {
  const koepfe = HTML.match(/<summary class="kartenkopf">[\s\S]*?<\/summary>/g) ?? [];
  assert.equal(koepfe.length, 2, 'erwartet: Rechner-Vorlage und Plan-Vorlage');
  for (const kopf of koepfe) {
    assert.match(kopf, /<div class="kartenkopf-text">/);
    assert.match(kopf, /data-rolle="kurzfassung"/);
  }
  assert.match(CSS, /\.kartenkopf-text \{[\s\S]*?flex-wrap:\s*wrap/);
});

// ================================================ S4-02 / S4-03: Kurzfassung

test('S4-02/S4-03: kein erzwungenes Aufklappen mehr, in keiner Ansicht', () => {
  for (const quelle of [PLANKARTE, STRICKSTUECK, DOM_JS]) {
    assert.ok(!/setzeOffen/.test(quelle), 'setzeOffen ist noch im Code');
    assert.ok(!/istOffen/.test(quelle), 'istOffen ist noch im Code');
  }
});

test('S4-02/S4-03: klappbar() gibt nichts mehr zurück und verspricht nichts mehr', () => {
  const fn = DOM_JS.match(/export function klappbar\([\s\S]*?\n\}/);
  assert.ok(fn, 'klappbar fehlt');
  assert.ok(!/return \{/.test(fn[0]), 'klappbar gibt noch ein Objekt zurück');
  const kopf = DOM_JS.match(/\/\*\*[\s\S]*?export function klappbar/);
  assert.ok(!/@returns/.test(kopf[0]), 'der Kommentar verspricht noch einen Rückgabewert');
});

test('S4-02: beide Ansichten lesen Feldfehler UND Statusmeldungen in die Kurzfassung', () => {
  for (const quelle of [PLANKARTE, STRICKSTUECK]) {
    const fn = quelle.match(/function problemText\([\s\S]*?\n  \}/);
    assert.ok(fn, 'problemText fehlt');
    assert.match(fn[0], /\.fehler/);
    assert.match(fn[0], /status/);
    assert.match(fn[0], /hidden/, 'nur sichtbare Meldungen dürfen zählen');
  }
});

test('S4-02: der Vorspann trägt die Aussage im Wort, nicht in der Farbe', () => {
  assert.equal(text('de', 'stueck.kurzfassungProblem', { text: 'XYZ' }), 'Bitte prüfen: XYZ');
  for (const [name, sprache] of Object.entries(SPRACHEN)) {
    assert.ok(sprache.texte['stueck.kurzfassungProblem'], `Sprache ${name} ohne stueck.kurzfassungProblem`);
    assert.match(sprache.texte['stueck.kurzfassungProblem'], /\{text\}/);
  }
  // Gestaltung hängt an data-problem, nicht am Text selbst
  assert.match(CSS, /\.kurzfassung\[data-problem\] \{[\s\S]*?color:\s*var\(--warnung-text\)/);
});

// ====================================================== S4-04 und S4-05: Texte

test('S4-04: der Hinweis am Schalter „nur jede 2.“ nennt die Startreihe statt „ab der ersten“', () => {
  const hinweis = text('de', 'plan.jedeZweiteHinweis', {});
  assert.ok(!/ab der ersten/i.test(hinweis), `irreführend: ${hinweis}`);
  assert.match(hinweis, /Startreihe/);
  // Der Standard ist 3, nicht 1 – genau das sagte der alte Text falsch zu
  assert.equal(standardStartReihe(true), 3);
});

test('S4-10: der Vorgabetext in index.html wurde nicht mitgezogen', { todo: 'Befund S4-10 – offen, nur kosmetisch' }, () => {
  // Im Browser steht der neue Text (nachgemessen: „… ab der Startreihe.“), weil
  // texteFuellen den Vorgabetext ersetzt. In der Datei steht aber weiter der
  // beanstandete Wortlaut – irreführend für den, der die Vorlage liest.
  const stelle = HTML.match(/data-text="plan\.jedeZweiteHinweis">([^<]*)</);
  assert.ok(stelle, 'Vorgabetext fehlt');
  assert.ok(!/ab der ersten/i.test(stelle[1]), `index.html enthält noch: ${stelle[1]}`);
});

test('S4-05: die Zielquelle im Zähler heißt wie die Karte – in jeder Einheit', () => {
  for (const einheit of ['cm', 'in']) {
    assert.equal(
      text('de', 'zaehler.quelle.laengeZuReihen', { einheit }),
      text('de', 'rechner.laengeZuReihen.titel', { einheit }),
    );
  }
  // Der Rohtext muss den Platzhalter tragen, sonst füllt ctx.t ihn nicht
  assert.match(SPRACHEN.de.texte['zaehler.quelle.laengeZuReihen'], /\{einheit\}/);
  assert.ok(!/Länge in Reihen/.test(text('de', 'zaehler.quelle.laengeZuReihen', { einheit: 'cm' })));
});

test('S4-05: die übrigen Zielquellen bleiben unverändert', () => {
  assert.equal(text('de', 'zaehler.quelle.plan', {}), 'Zu-/Abnahmeplan');
  assert.equal(
    text('de', 'zaehler.quelle.reihenAusAnleitung', { einheit: 'cm' }),
    text('de', 'rechner.reihenAusAnleitung.titel', { einheit: 'cm' }),
  );
});

// ================================================ S4-06: Rückrichtung 0.3.0

test('S4-06: R13 und das Änderungsprotokoll nennen den Verlust der beiden Felder', () => {
  const register = lies('docs/architektur.md');
  const sprint4 = lies('docs/architektur/sprint-4-architektur.md');
  const changelog = lies('CHANGELOG.md');
  for (const [name, inhalt] of [['architektur.md', register], ['sprint-4-architektur.md', sprint4]]) {
    const zeile = inhalt.split('\n').find((z) => z.startsWith('| R13'));
    assert.ok(zeile, `R13 fehlt in ${name}`);
    assert.match(zeile, /verliert/i, `R13 in ${name} nennt den Verlust nicht`);
    assert.ok(!/ignoriert sie und rechnet unverändert\. \|/.test(zeile), `R13 in ${name} behauptet noch das Alte`);
  }
  assert.match(changelog, /S4-06[\s\S]*?verliert beim nächsten Speichern/);
});

// ============================= Regressionsschutz: Referenzfall aus Sprint 3

test('US-39 AK9: der Referenzfall stimmt mit leerer Startreihe – ohne „jede 2.“', () => {
  const r = planAusTexten({ ...REFERENZ, jedeZweite: false }, PROBE, 'cm');
  assert.equal(r.status, 'plan');
  assert.equal(r.anfang, 50);
  assert.equal(r.ende, 84);
  assert.equal(r.reihen, 167);
  assert.equal(r.ereignisse.length, 17);
  assert.equal(r.abstandMin, 9);
  assert.equal(r.abstandMax, 10);
  assert.equal(r.ereignisse.at(-1).maschenDanach, 84);
  assert.ok(r.ereignisse.at(-1).reihe <= r.reihen - 1, 'die letzte Reihe bleibt frei (E24)');
});

test('US-39 AK9: derselbe Referenzfall mit „jede 2.“ – gleiche Zahlen, ungerade Reihen', () => {
  const r = planAusTexten({ ...REFERENZ, jedeZweite: true }, PROBE, 'cm');
  assert.equal(r.status, 'plan');
  assert.equal(r.anfang, 50);
  assert.equal(r.ende, 84);
  assert.equal(r.reihen, 167);
  assert.equal(r.ereignisse.length, 17);
  assert.equal(r.ereignisse.at(-1).maschenDanach, 84);
  for (const e of r.ereignisse) assert.equal(e.reihe % 2, 1, `Reihe ${e.reihe} ist gerade`);
});

test('US-39 AK7: ein Plan ohne das Feld startReihe rechnet wie einer mit leerem Feld', () => {
  const ohneFeld = { ...REFERENZ };
  delete ohneFeld.startReihe;
  for (const jedeZweite of [false, true]) {
    assert.deepEqual(
      planAusTexten({ ...ohneFeld, jedeZweite }, PROBE, 'cm'),
      planAusTexten({ ...REFERENZ, jedeZweite }, PROBE, 'cm'),
    );
  }
});

test('US-39: die Vorbelegung bleibt leer, „automatisch“ bleibt 2 bzw. 3 (E31)', () => {
  assert.equal(leererPlan().startReihe, '');
  assert.equal(standardStartReihe(false), 2);
  assert.equal(standardStartReihe(true), 3);
  for (const jedeZweite of [false, true]) {
    const ohne = erlaubteReihen(167, jedeZweite);
    const mitNull = erlaubteReihen(167, jedeZweite, null);
    assert.equal(ohne.anzahl, mitNull.anzahl);
    assert.equal(ohne.start, mitNull.start);
    assert.equal(ohne.start, standardStartReihe(jedeZweite));
    for (let platz = 0; platz < ohne.anzahl; platz++) assert.equal(ohne.reihe(platz), mitNull.reihe(platz));
  }
});

test('Datenerhalt: Startreihe und Klapp-Zustand überstehen das Speichern im Modell', () => {
  const jetzt = '2026-10-23T10:00:00.000Z';
  let d = leereDaten({ laengeneinheit: 'cm' });
  d = neuesProjekt(d, { name: 'Testprojekt' }, 'p-1', jetzt).daten;
  d = neuesStrickstueck(d, 'p-1', 'Teil A', 's-1', jetzt).daten;
  d = strickstueckAendern(d, 'p-1', 's-1', { plan: { startReihe: '40' }, eingeklappt: { plan: true } }, jetzt).daten;
  const s = d.projekte[0].strickstuecke[0];
  assert.equal(s.plan.startReihe, '40');
  assert.deepEqual(s.eingeklappt, { plan: true });
});

// ============================================== Datenschutz und Auslieferung

test('Datenschutz: keine fremde Adresse in den ausgelieferten Dateien', () => {
  const dateien = ['index.html', 'css/style.css', 'sw.js', 'manifest.webmanifest', 'js/app.js', 'js/dom.js', 'js/texte.js', 'js/ansichten/plankarte.js', 'js/ansichten/strickstueck.js', 'js/ansichten/zaehler.js'];
  const erlaubt = [/http:\/\/www\.w3\.org\/2000\/svg/, /https:\/\/michawallburger-dev\.github\.io/];
  for (const datei of dateien) {
    const inhalt = lies(datei);
    for (const treffer of inhalt.match(/https?:\/\/[^\s'"`)]+/g) ?? []) {
      assert.ok(erlaubt.some((r) => r.test(treffer)), `fremde Adresse in ${datei}: ${treffer}`);
    }
    assert.ok(!/@import/.test(inhalt), `@import in ${datei}`);
  }
});

test('Datenschutz: die Content Security Policy bleibt eng', () => {
  const csp = HTML.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/);
  assert.ok(csp, 'keine CSP in index.html');
  for (const teil of ["default-src 'self'", "script-src 'self'", "base-uri 'none'", "object-src 'none'"]) {
    assert.ok(csp[1].includes(teil), `CSP ohne ${teil}`);
  }
  for (const verboten of ['unsafe-inline', 'unsafe-eval', '*']) {
    assert.ok(!csp[1].includes(verboten), `CSP enthält ${verboten}`);
  }
});

test('Offline: die Nachbesserung hat keine neue Datei eingeführt, die im Cache fehlt', () => {
  const sw = lies('sw.js');
  assert.match(sw, /CACHE_NAME = 'maschenrechner-v0\.4\.0'/);
  for (const datei of ['./css/style.css', './js/dom.js', './js/texte.js', './js/ansichten/plankarte.js', './js/ansichten/strickstueck.js']) {
    assert.ok(sw.includes(`'${datei}'`), `fehlt in APP_DATEIEN: ${datei}`);
  }
});

// ================================================== Neue Befunde des Nachtests

test('S4-07: ein fehlender Maschenproben-Hinweis der Plan-Karte gehört in die Kurzfassung', { todo: 'Befund S4-07 – offen' }, () => {
  // Ist die eigene Probe unvollständig, zeigt die Plan-Karte den Hinweis
  // „Bitte zuerst die eigene Probe … ausfüllen“ in [data-rolle="probe-fehlt"].
  // problemText() kennt nur .fehler und [data-rolle="status"]; zugeklappt
  // bleibt die Karte deshalb stumm (im Browser nachgemessen: Kopf 44 px,
  // Kurzfassung leer, Hinweis checkVisibility() === false).
  const fn = PLANKARTE.match(/function problemText\([\s\S]*?\n  \}/)[0];
  assert.match(fn, /probe-fehlt/);
});

test('S4-08: eine offene Auswahl („Differenz nicht teilbar“) gehört in die Kurzfassung', { todo: 'Befund S4-08 – offen' }, () => {
  // Status „auswahl“ mit Optionen setzt die Zusammenfassung auf „–“ und den
  // Status auf null. Zugeklappt sieht die Nutzerin nur den Titel, obwohl eine
  // Entscheidung aussteht.
  const r = planAusTexten({ ...REFERENZ, endBreite: '33', ereignisWahl: null }, PROBE, 'cm');
  assert.equal(r.status, 'auswahl');
  const fn = PLANKARTE.match(/function problemText\([\s\S]*?\n  \}/)[0];
  assert.match(fn, /auswahl/);
});

test('S4-09: nach dem Löschen des Plans bleibt die alte Kurzfassung stehen', { todo: 'Befund S4-09 – offen' }, () => {
  // berechneUndZeige() verlässt den Zweig „kein Plan“ vor zeigeKurzfassung();
  // die zugeklappte Karte nennt weiter „17 × 2 M zunehmen …“, obwohl es keinen
  // Plan mehr gibt. Bestand schon vor der Nachbesserung.
  const zweig = PLANKARTE.match(/if \(!plan\) \{[\s\S]*?\n    \}/)[0];
  assert.match(zweig, /zeigeKurzfassung/);
});
