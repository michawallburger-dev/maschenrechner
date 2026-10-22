# Architektur Maschenrechner

Lebendes Dokument. Es beschreibt den Stand nach Version 0.3.0 und wird bei jedem Sprint
fortgeschrieben.

## Herkunft und Verlässlichkeit

Das ursprüngliche Architekturdokument lag im Claude-Projekt „Stricken und Häckeln" und ist
**nicht mehr auffindbar**. Der Code verweist an 13 Stellen darauf – auf numerierte Regeln
(R6, R7, R9, R10, R11), einen Hinweis (H1) und Abschnittsnummern („Architektur Sprint 3,
Abschnitt 4"). Diese Datei ist am 22.10.2026 aus dem Code, der README und diesen Verweisen
rekonstruiert. Sie beschreibt damit **das, was tatsächlich gebaut ist** – nicht zwingend den
ursprünglichen Wortlaut der Entwurfsentscheidung.

Die rekonstruierten Regeln stehen unten im Abschnitt „Verbindliche Regeln". Wo der Code auf
eine Regel verweist, bleibt die Nummer erhalten, damit die Kommentare im Code weiter stimmen.

## Technologiewahl

Schlanke PWA aus HTML, CSS und Vanilla-JavaScript mit ES-Modulen. **Kein Build-Schritt**, keine
Abhängigkeiten, keine externen Ressourcen. Begründung: Die App muss auf GitHub Pages
auslieferbar, offline nutzbar und ohne Werkzeugkette wartbar sein; die Nutzung findet am Handy
neben dem Strickzeug statt.

- **Tests** laufen mit `node --test`, ebenfalls ohne Abhängigkeiten (geprüft mit Node.js 22).
- **Kein Framework.** Die Oberfläche entsteht aus `<template>`-Elementen in `index.html`.

## Aufteilung: Fachlogik getrennt von Oberfläche

Die zentrale Regel des Projekts. Fachlogik ist in **reinen Funktionen** umgesetzt: kein DOM, kein
Speicherzugriff, keine Ausnahmen, Eingaben werden nicht verändert. IDs und Zeitstempel übergibt
der Aufrufer. Das macht die Logik ohne Browser testbar – daher 224 Tests ohne Testframework.

| Schicht | Dateien | Eigenschaft |
|---|---|---|
| Fachlogik (rein) | `rechner.js`, `eingabe.js`, `format.js`, `einheiten.js`, `modell.js`, `migration.js`, `sicherung.js`, `zaehler.js`, `plan.js`, `ziel.js`, `texte.js` | kein DOM, kein Speicher |
| Technikrand | `speicher.js` (Speicher als Parameter), `geraet.js` (Browser-Fähigkeiten), `router.js` | gekapselt, dadurch mit Attrappen testbar |
| Oberfläche | `dom.js`, `ansichten/*.js`, `app.js` | kennt die Fachlogik, nicht umgekehrt |

`app.js` startet die App und stellt den Ansichten einen Kontext bereit. Die Navigation läuft über
Hash-Routen (`#/p/<id>/s/<id>`), damit Pages ohne Serverkonfiguration auskommt.

## Datenmodell und Speicherung

Schema 3: **Projekt → Proben und Strickstücke**. Ein Projekt hat eine Liste von Proben (je ein
Paar aus Anleitungs- und eigener Probe, mit Name und Nadelstärke, E16/E20). Jedes Strickstück
verweist über `probeId` auf genau eine Probe seines Projekts (E17) und hat höchstens einen
Zu-/Abnahmeplan.

Eingaben in Proben, Rechnern und Plan bleiben **Text**, damit halbfertige Eingaben erhalten
bleiben. Nur der Reihenzähler ist eine Zahl.

Gespeichert wird in `localStorage`:

| Schlüssel | Inhalt |
|---|---|
| `maschenrechner.daten.v3` | aktueller Stand (Schema 3) |
| `maschenrechner.daten.v2` | Stand aus 0.2, bleibt unverändert |
| `maschenrechner.zustand` | Stand aus 0.1, bleibt unverändert |
| `maschenrechner.daten.v3.defekt` | beschädigte Daten, vor dem Neustart aufbewahrt |
| `maschenrechner.daten.v3.vorImport` | Kopie vor jedem Import |

## Datenschutzkonzept

Daten bleiben ausschließlich auf dem Gerät. Kein Backend, keine Konten, keine Cookies, keine
Tracker, keine externen Schriften oder Bibliotheken, keine Analytics. Eine Content Security
Policy in `index.html` erzwingt das technisch (`default-src 'self'`, `connect-src 'self'`,
`base-uri 'none'`, `form-action 'none'`, `object-src 'none'`).

Der Service Worker fragt **keine fremden Adressen** an. Die Sicherungsdatei verlässt das Gerät
nur, wenn die Nutzerin sie selbst über das Teilen-Menü weitergibt (E15).

**Abweichungen von diesem Grundsatz gibt es derzeit keine.** Jede künftige Abweichung ist hier
mit Begründung einzutragen, bevor sie umgesetzt wird.

## Offlinefähigkeit

Der Service Worker legt alle App-Dateien bei der Installation vorab im Cache ab und beantwortet
Anfragen an die eigene Adresse zuerst daraus. Zwei Pflichten bei jeder Änderung:

1. `CACHE_NAME` in `sw.js` erhöhen – sonst zeigen installierte Apps weiter die alte Version.
2. Neue Dateien in `APP_DATEIEN` in `sw.js` eintragen.

`tests/sw-liste.test.js` erzwingt beides und prüft zusätzlich, dass die Versionsnummern in
`package.json`, `sw.js` und `js/app.js` übereinstimmen. Dieser Test ist die wichtigste
Absicherung des Deployments.

## Barrierefreiheit und mobile Bedienbarkeit

Mobil zuerst. Der Reihenzähler muss mit einer Hand und nassen bzw. beschäftigten Händen
bedienbar sein: große `+1`-Fläche, `−1` mit Abstand davon, Direkteingabe der Reihenzahl.
Farbschema wählbar (Wie System / Hell / Dunkel, E10). Ansagen für Screenreader sind bewusst
sparsam gehalten – zu viele `aria-live`-Bereiche waren Befund MAS-32.

## Verbindliche Regeln

Numerierung aus dem verlorenen Originaldokument, Inhalt aus der Implementierung rekonstruiert.

| Regel | Inhalt | Belegt in |
|---|---|---|
| R6 | Ältere Daten werden in einen **neuen** Schlüssel übernommen; die alten Schlüssel bleiben unverändert. | `js/speicher.js` |
| R7 | Die Rechenwege aus Sprint 1 bleiben unverändert; spätere Sprints bauen darauf auf, statt sie zu ersetzen. | `js/ansichten/strickstueck.js` |
| R9 | Der Zähler passt ohne Scrollen auf 360 × 640 px. | `css/style.css` |
| R10 | Beschädigte Daten werden unter `.defekt` aufbewahrt, nicht gelöscht; vor jedem Import wird unter `.vorImport` kopiert. | `js/speicher.js`, `js/modell.js` |
| R11 | Der Zählerstand bedeutet „die Reihe, in der ich gerade bin". | `js/zaehler.js`, `js/ziel.js`, `js/ansichten/zaehler.js` |
| H1 | Lange Pläne dürfen nicht bremsen: höchstens 9999 Ereignisse (`MAX_EREIGNISSE`), Listen ab 500 Einträgen verzögert aufgebaut (300 ms). | `js/plan.js`, `js/ansichten/plankarte.js` |

> **Lücke:** R1 bis R5 und R8 werden im Code nicht referenziert. Ihr Inhalt ist nicht
> rekonstruierbar. Die Nummern bleiben frei; neue Regeln beginnen bei **R12**.

## Verteilung der Zu- und Abnahmen

Die Kernformel des Plans, weil sie fachlich am leichtesten falsch wird (Architektur Sprint 3,
Abschnitt 4):

- Erste und letzte Reihe bleiben frei (E24, **vorläufig**).
- „Nur jede 2. Reihe/Runde": nur ungerade Reihen bzw. Runden ab 3 (E25).
- Ereignis *i* (0 … E−1) liegt auf dem Platz `floor((i+1)·(n+1)/(E+1)) − 1` der *n* erlaubten
  Reihen. Nur Ganzzahl-Arithmetik, keine Liste der Länge *n* – damit kosten auch sehr lange
  Teile keinen Speicher.

Zielquellen im Zähler, in dieser Reihenfolge: `plan`, `laengeZuReihen`, `reihenAusAnleitung`
(E23, E26).

## Offene Befunde

- **MAS-46** (S2-09): Doppelte 64-stellige IDs in einer Sicherung ergeben eine zu lange
  Ersatz-ID. Einziger offener Fehler.
