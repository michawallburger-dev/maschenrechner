// Gemeinsame Test-Hilfen (ohne externe Abhängigkeiten).

/** Speicher im Arbeitsspeicher mit der Schnittstelle von localStorage. */
export function neuerSpeicher(anfang = {}) {
  const daten = new Map(Object.entries(anfang));
  return {
    getItem: (k) => (daten.has(k) ? daten.get(k) : null),
    setItem: (k, v) => daten.set(k, String(v)),
    removeItem: (k) => daten.delete(k),
    roh: daten,
  };
}

/** Speicher, der bei jedem Zugriff eine Ausnahme wirft (gesperrt). */
export const gesperrterSpeicher = {
  getItem() {
    throw new Error('gesperrt');
  },
  setItem() {
    throw new Error('gesperrt');
  },
  removeItem() {
    throw new Error('gesperrt');
  },
};

/** Speicher, der lesen kann, aber beim Schreiben „voll“ ist. */
export function vollerSpeicher(anfang = {}) {
  const s = neuerSpeicher(anfang);
  s.setItem = () => {
    throw new Error('QuotaExceededError');
  };
  return s;
}

/** Fortlaufende Test-IDs. */
export function idZaehler() {
  let n = 0;
  return (praefix) => `${praefix}-test-${++n}`;
}

export const ZEIT1 = '2026-10-01T10:00:00.000Z';
export const ZEIT2 = '2026-10-02T10:00:00.000Z';
export const ZEIT3 = '2026-10-03T10:00:00.000Z';

/** Zustand aus Version 0.1 mit Eingaben (wie im Speicher der Enduserin). */
export function v1Zustand() {
  return {
    schemaVersion: 1,
    einstellungen: { sprache: 'de', laengeneinheit: 'cm' },
    probeAnleitung: { maschenAnzahl: '34', maschenBezug: '10', reihenAnzahl: '52', reihenBezug: '10' },
    probeEigen: { maschenAnzahl: '25', maschenBezug: '10', reihenAnzahl: '35', reihenBezug: '10', nadelstaerkeMm: '4,5' },
    rechner: {
      maschenAusAnleitung: { eingabe: '102', anpassung: '0' },
      reihenAusAnleitung: { eingabe: '', anpassung: '0' },
      breiteZuMaschen: { eingabe: '50', anpassung: '-1' },
      laengeZuReihen: { eingabe: '', anpassung: '0' },
    },
  };
}
