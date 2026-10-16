/**
 * Hülle um Fähigkeiten des Browsers/Geräts:
 * IDs, Bildschirm wachhalten (Wake Lock), Teilen/Herunterladen, Datei lesen,
 * Farbschema des Systems.
 *
 * Nur dieses Modul greift auf navigator/crypto/matchMedia zu.
 */

/** Erzeugt eine eindeutige ID, z. B. „p-1b9d6bcd-…“. */
export function neueId(praefix) {
  try {
    if (globalThis.crypto?.randomUUID) return `${praefix}-${globalThis.crypto.randomUUID()}`;
  } catch {
    // weiter mit Ersatz
  }
  const zufall = Math.random().toString(36).slice(2, 10);
  return `${praefix}-${Date.now().toString(36)}-${zufall}`;
}

/** Aktueller Zeitpunkt als ISO-Text. */
export function jetztIso() {
  return new Date().toISOString();
}

// ---------------------------------------------------------------- Bildschirm wachhalten (US-11, AK5)

/**
 * Hält den Bildschirm an, solange gewünscht. iOS gibt die Sperre beim Wechsel
 * in den Hintergrund frei; sie wird beim Zurückkehren neu angefordert.
 * Kein Ersatz-Trick (Video/Animation) – bewusst, wegen Akku und Datenschutz.
 */
export function erzeugeWachhalter() {
  let sperre = null;
  let anfrage = null; // laufende Anforderung, damit nicht doppelt angefordert wird
  let gewuenscht = false;

  async function anfordern() {
    if (!('wakeLock' in navigator) || typeof navigator.wakeLock?.request !== 'function') return 'nicht-verfuegbar';
    if (sperre) return 'aktiv';
    if (anfrage) return anfrage;
    anfrage = (async () => {
      try {
        const neu = await navigator.wakeLock.request('screen');
        // Inzwischen beendet (Ansicht schnell verlassen)? Dann sofort freigeben (QA S2-02)
        if (!gewuenscht) {
          neu.release?.().catch?.(() => {});
          return 'beendet';
        }
        sperre = neu;
        sperre.addEventListener?.('release', () => {
          if (sperre === neu) sperre = null;
        });
        return 'aktiv';
      } catch {
        return 'abgelehnt';
      } finally {
        anfrage = null;
      }
    })();
    return anfrage;
  }

  function beiSichtbarkeit() {
    if (gewuenscht && document.visibilityState === 'visible' && !sperre) anfordern();
  }

  return {
    /** @returns {Promise<'aktiv'|'nicht-verfuegbar'|'abgelehnt'|'beendet'>} */
    async starten() {
      gewuenscht = true;
      document.addEventListener('visibilitychange', beiSichtbarkeit);
      return anfordern();
    },
    beenden() {
      gewuenscht = false;
      document.removeEventListener('visibilitychange', beiSichtbarkeit);
      if (sperre) {
        const alt = sperre;
        sperre = null;
        alt.release?.().catch?.(() => {});
      }
    },
  };
}

// ---------------------------------------------------------------- Teilen / Herunterladen (US-12)

/**
 * Bietet eine Datei zum Teilen an (iPhone: Teilen-Menü mit Dateien, Mail, AirDrop).
 * Wo das nicht geht, wird sie heruntergeladen.
 * @returns {Promise<'geteilt'|'abgebrochen'|'heruntergeladen'>}
 */
export async function teileDatei(dateiname, inhalt, typ = 'application/json') {
  const blob = new Blob([inhalt], { type: typ });
  try {
    const datei = new File([blob], dateiname, { type: typ });
    if (navigator.canShare?.({ files: [datei] }) && typeof navigator.share === 'function') {
      await navigator.share({ files: [datei], title: dateiname });
      return 'geteilt';
    }
  } catch (fehler) {
    // Abbruch durch die Nutzerin ist kein Fehler
    if (fehler?.name === 'AbortError') return 'abgebrochen';
    // Andere Fehler (z. B. NotAllowedError): Ersatzweg Herunterladen
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = dateiname;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'heruntergeladen';
}

/** Liest eine vom Nutzer gewählte Datei als Text. */
export function leseDatei(datei) {
  return datei.text();
}

// ---------------------------------------------------------------- Farbschema des Systems (US-26)

const DUNKEL_ABFRAGE = '(prefers-color-scheme: dark)';

/** Ist das System gerade im Dunkelmodus? */
export function systemIstDunkel() {
  return typeof matchMedia === 'function' && matchMedia(DUNKEL_ABFRAGE).matches;
}

/** Ruft rueckruf auf, wenn das System zwischen Hell und Dunkel wechselt. */
export function beiSystemFarbwechsel(rueckruf) {
  if (typeof matchMedia !== 'function') return;
  const abfrage = matchMedia(DUNKEL_ABFRAGE);
  if (typeof abfrage.addEventListener === 'function') abfrage.addEventListener('change', rueckruf);
}
