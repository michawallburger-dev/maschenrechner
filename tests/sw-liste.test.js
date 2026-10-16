// Prüft, dass der Service Worker alle App-Dateien kennt (Offline, US-08)
// und dass Version in sw.js, package.json und app.js übereinstimmt.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const sw = readFileSync(join(WURZEL, 'sw.js'), 'utf8');
const liste = [...sw.match(/const APP_DATEIEN = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);

function dateien(ordner) {
  return readdirSync(join(WURZEL, ordner)).flatMap((name) => {
    const pfad = join(ordner, name);
    return statSync(join(WURZEL, pfad)).isDirectory() ? dateien(pfad) : [pfad];
  });
}

test('Jede JS-, CSS- und Icon-Datei steht in APP_DATEIEN', () => {
  const noetig = [...dateien('js'), ...dateien('css'), ...dateien('icons'), 'index.html', 'manifest.webmanifest'].map(
    (p) => `./${relative('.', p).split('\\').join('/')}`,
  );
  for (const datei of noetig) assert.ok(liste.includes(datei), `fehlt in sw.js: ${datei}`);
});

test('Jeder Eintrag in APP_DATEIEN existiert', () => {
  for (const eintrag of liste) {
    if (eintrag === './') continue;
    assert.ok(existsSync(join(WURZEL, eintrag)), `gibt es nicht: ${eintrag}`);
  }
});

test('Versionsnummern stimmen überein', () => {
  const paket = JSON.parse(readFileSync(join(WURZEL, 'package.json'), 'utf8')).version;
  const cache = sw.match(/CACHE_NAME = 'maschenrechner-v([^']+)'/)[1];
  const app = readFileSync(join(WURZEL, 'js/app.js'), 'utf8').match(/APP_VERSION = '([^']+)'/)[1];
  assert.equal(cache, paket);
  assert.equal(app, paket);
});
