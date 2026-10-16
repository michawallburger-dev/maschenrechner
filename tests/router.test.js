// Tests der Hash-Navigation (reine Funktionen).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { routeAus, hashFuer } from '../js/router.js';

test('Bekannte Adressen', () => {
  assert.deepEqual(routeAus(''), { ansicht: 'liste' });
  assert.deepEqual(routeAus('#/'), { ansicht: 'liste' });
  assert.deepEqual(routeAus('#/einstellungen'), { ansicht: 'einstellungen' });
  assert.deepEqual(routeAus('#/p/p-1'), { ansicht: 'projekt', projektId: 'p-1' });
  assert.deepEqual(routeAus('#/p/p-1/s/s_2'), { ansicht: 'strickstueck', projektId: 'p-1', stueckId: 's_2' });
  assert.deepEqual(routeAus('#/p/p-1/s/s_2/zaehlen'), { ansicht: 'zaehlen', projektId: 'p-1', stueckId: 's_2' });
});

test('Unbekannte oder böswillige Adressen → Projektliste', () => {
  for (const h of ['#/p/', '#/p/a b', '#/p/<img>', '#/p/x/s/', '#/einstellungen/x', `#/p/${'a'.repeat(65)}`, '#/p/x/zaehlen', undefined, null, 42]) {
    assert.deepEqual(routeAus(h), { ansicht: 'liste' }, String(h));
  }
});

test('hashFuer und routeAus passen zusammen', () => {
  const routen = [
    { ansicht: 'liste' },
    { ansicht: 'einstellungen' },
    { ansicht: 'projekt', projektId: 'p-9f1c' },
    { ansicht: 'strickstueck', projektId: 'p-9f1c', stueckId: 's-1' },
    { ansicht: 'zaehlen', projektId: 'p-9f1c', stueckId: 's-1' },
  ];
  for (const r of routen) assert.deepEqual(routeAus(hashFuer(r)), r);
});

test('IDs aus crypto.randomUUID passen ins Muster', () => {
  const id = 'p-1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed';
  assert.equal(routeAus(`#/p/${id}`).projektId, id);
});
