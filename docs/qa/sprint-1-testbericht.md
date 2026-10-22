<!-- Original aus dem Claude-Projekt „Stricken und Häckeln“, dort als qa/sprint-1-testbericht.md geführt.
     Am 22.10.2026 aus dem Word-Export ins Repo übernommen; Inhalt unverändert,
     nur das Format ist jetzt Markdown. QA-Bericht zu v0.1.0. -->

# Testbericht – Maschenrechner, Sprint 1

Rolle: QA · Stand 16.10.2026 · Prüfgegenstand: maschenrechner-sprint1 (US-01 bis US-08, Jira MAS-5 bis MAS-12) gegen Backlog v1.2 und Architektur v1.2

**Ergebnis: FREIGABE.** Es gibt keine blockierenden Fehler. Alle Akzeptanzkriterien sind erfüllt, und alle Referenzwerte aus der Excel werden exakt reproduziert. Ein Befund mittlerer Schwere (F-01) ist eine Lücke in der Spezifikation und kein Programmierfehler. Er wird zur gemeinsamen Entscheidung an Product Owner und Architekt gemeldet.

## 1. Vorgehen

- **Code-Review** aller Module: reine Funktionen, Abhängigkeitsrichtung, kein innerHTML/eval, keine Inline-Styles, keine Aufrufe fremder Adressen
- **Automatisierte Tests:** 79 Tests, alle bestanden, Laufzeit etwa 1,6 s, ohne externe Abhängigkeiten (node --test)

  - 63 Tests aus der Entwicklung

  - 16 eigene QA-Tests in tests/qa-akzeptanz.test.js, darunter Eigenschaftstests, die rund 990 000 Kombinationen mit exakter Ganzzahl-Arithmetik (BigInt) vergleichen

- **Browser-Tests:** headless Chromium in Handy-Ansicht (360 × 740 und 320 × 640), Dunkelmodus, offline, gesperrter Speicher, Tastaturbedienung, Kontrastmessung
- **Nicht geprüft:** echte Geräte (iPhone/Android) und echte Screenreader (VoiceOver/TalkBack). Empfehlung: ein kurzer Praxistest durch die Enduserin vor dem Rollout.

## 2. Testfälle je Akzeptanzkriterium

Proben, wenn nicht anders angegeben: Anleitung 34 M / 52 R, eigene Probe 25 M / 37 R, jeweils auf 10 cm.

| **ID** | **Story/AK** | **Eingabe** | **Erwartet** | **Tatsächlich** | **✔** |
|---|---|---|---|---|---|
| T01 | US-01 AK1 | Erster Start | Bezugsmaße 10, Anzahlen leer | 10 / leer | ✔ |
| T02 | US-01 AK2 | „22,5“ und „22.5“ M | gültig, 2,25 M/cm | 2,25 | ✔ |
| T03 | US-01 AK3 | 34/10, 52/10 | 3,40 M/cm, 5,20 R/cm | 3,40 / 5,20 | ✔ |
| T04 | US-01 AK4 | Bezugsmaß „0“ | Hinweis, Ergebnisse „–“ | „Der Wert muss größer als 0 sein.“, aria-invalid, „–“ | ✔ |
| T05 | US-01 AK4 | Bezugsmaß „abc“ | Hinweis | „Bitte eine Zahl eingeben, z. B. 12 oder 12,5.“ | ✔ |
| T06 | US-01 AK4 | Bezugsmaß geleert, Feld verlassen | Hinweis „leer“ | „Bitte einen Wert eingeben.“, Dichte „–“ | ✔ |
| T07 | US-01 AK4 | Erster Start ohne Eingaben | keine Fehlerflut | 0 sichtbare Fehler | ✔ |
| T08 | US-01 AK4 | „-5“ M | NICHT_POSITIV | NICHT_POSITIV | ✔ |
| T09 | US-02 AK5 | Nadel „3,5“ / leer / „0“ / „31“ | gültig / gültig / Fehler / Fehler | wie erwartet, kein Einfluss auf Rechnung | ✔ |
| T10 | US-02 AK6 | 20 M auf 8 cm, 40 cm | 100 M | 100 | ✔ |
| T11 | US-02 AK7 | Probe ändern | sofortige Neuberechnung | ja, ohne Knopf | ✔ |
| T12 | US-02 | Nur Maschenprobe vollständig | Maschen-Rechner rechnen, Reihen-Rechner mit Hinweis | 235 / „–“ + „Bitte zuerst beide Maschenproben vollständig ausfüllen.“ | ✔ |
| T13 | US-03 AK1 | „320,5“ M | ganze Zahl verlangt | „Bitte eine ganze Zahl eingeben.“ | ✔ |
| T14 | US-03 AK2/3/5 | 320 M | 94,12 cm · 235 M · 94,00 cm · −0,12 | identisch | ✔ |
| T15 | US-03 AK4 | Anpassung −2 (zweimal „−“ getippt) | 233 M · 93,20 cm · −0,92 | identisch | ✔ |
| T16 | US-03 AK4 | Anpassung „−2“ (typografisches Minus) | −2 | −2 | ✔ |
| T17 | US-03 AK4 | Anpassung „1,5“ | Fehler, kein Endergebnis, Zwischenwert bleibt | „Bitte eine ganze Zahl eingeben.“, „–“, 235 | ✔ |
| T18 | US-03 AK4 | Anpassung „−10000“ / „+“ bei 9999 | Fehler / bleibt bei 9999 | „mindestens −9999“ / 9999 | ✔ |
| T19 | US-03 AK4 | „+“ bei ungültigem Inhalt „abc“ | zählt als 0 → 1 | 1 | ✔ |
| T20 | US-03 AK6 | Anpassung −235 bzw. −234 | kein Ergebnis + Hinweis bzw. 1 | wie erwartet | ✔ |
| T21 | US-04 | 55 R | 10,58 cm · 39 R · 10,54 cm · −0,04 | identisch | ✔ |
| T22 | US-05 AK2 | 94 cm | 320 / 235 · 94,00 · ±0,00 | identisch | ✔ |
| T23 | US-05 AK4 | „10,2“ und „10.2“ cm | 26 M (nicht 25) | 26 | ✔ |
| T24 | US-06 | 13,5 cm | 70 / 50 · 13,51 · +0,01 | identisch | ✔ |
| T25 | US-07 AK1 | Eingaben, Neuladen | alles wieder da (inkl. Nadel, Anpassung) | 3,5 / −2 / 233 | ✔ |
| T26 | US-07 AK2 | Netzwerk/Speicher beobachtet | nur lokal | 1 Schlüssel maschenrechner.zustand, 0 Cookies, 0 fremde Anfragen | ✔ |
| T27 | US-07 AK3 | Zurücksetzen → Bestätigen | Ausgangswerte | leer / 10 / leer / „–“ | ✔ |
| T28 | US-07 AK3 | Zurücksetzen → Escape | nichts gelöscht | Daten bleiben | ✔ |
| T29 | US-07 | localStorage gesperrt | App läuft, Hinweis sichtbar | Hinweis sichtbar, Rechnung funktioniert | ✔ |
| T30 | US-07 | defektes JSON, fremde Felder, Zahl statt Text | Ausgangszustand bzw. bereinigt | wie erwartet | ✔ |
| T31 | US-08 AK1 | 360 px und 320 px Breite | kein seitliches Scrollen | scrollWidth = Viewportbreite | ✔ |
| T32 | US-08 AK1 | Touch-Ziele | ≥ 44 × 44 px | alle ≥ 48 px | ✔ |
| T33 | US-08 AK2 | Feldtypen | Zahlentastatur, kein type=number | inputmode decimal/numeric, 0 × type=number | ✔ |
| T34 | US-08 AK3 | Service Worker, dann offline neu laden | App vollständig | Titel, CSS, gespeicherte Werte da | ✔ |
| T35 | US-08 AK3 | Manifest | installierbar | name, start_url ./, standalone, 4 Icons | ✔ |
| T36 | US-08 AK4 | Beschriftungen | Bezeichnung + Einheit | z. B. „Breite laut Anleitung (cm)“ | ✔ |

## 3. Randfälle Rechenlogik (automatisiert)

| **Thema** | **Prüfung** | **Ergebnis** |
|---|---|---|
| 0 / negativ | alle Feldarten | abgefangen (NICHT_POSITIV, Anpassung ZU_KLEIN) |
| Kommazahlen | Komma, Punkt, „,5“, typografisches Minus | korrekt |
| Ungültige Schreibweisen | „1e3“, „Infinity“, „1,2,3“, „12 cm“, „--1“ | KEINE_ZAHL |
| Sehr große Zahlen | alle Grenzen gleichzeitig (99 999 M, Proben 999/0,01 und 0,01/100, Anpassung 9 999) | endlich, kein Absturz |
| Rundung x,5 | 10,2 cm × 25/10 = 25,5 → 26 | korrekt |
| Rundung systematisch | 108 000 Breiten (0,1–300 cm) × Proben 5–40/10 cm sowie 576 600 Umrechnungen aus der Anleitung, verglichen mit BigInt | 0 Abweichungen |
| Rundung mit Dezimal-Bezugsmaßen | 7,5 / 12,5 / 10,16 cm, 307 200 Fälle | 0 Abweichungen |
| Ungleichmäßige Verteilung | – | entfällt in Sprint 1 (Zu-/Abnahmen erst in Sprint 3) |

## 4. Datenschutz, Offline, Mobil, Barrierefreiheit

| **Bereich** | **Ergebnis** |
|---|---|
| Datenschutz | ✔ Keine Anfragen an fremde Adressen, keine Cookies, keine Tracker oder Analytics, keine externen Schriften. Die CSP ist aktiv, es gab 0 Konsolen-Meldungen (also keine CSP-Verstöße). Gespeichert sind nur Probe- und Rechnereingaben, keine personenbezogenen Daten. |
| Offline | ✔ Nach dem ersten Aufruf funktioniert die App ohne Netz. Siehe aber F-04 (Auslieferung neuer Versionen). |
| Mobil | ✔ Kein seitliches Scrollen bei 320 und 360 px, Touch-Ziele ≥ 48 px, Eingabeschrift 20 px (kein Auto-Zoom), Zoomen erlaubt |
| Barrierefreiheit | ✔ lang="de", jedes Feld hat ein Label, alle aria-describedby-Ziele sind vorhanden, keine doppelten IDs, Überschriftenfolge h1 → h2, sinnvolle Tab-Reihenfolge, sichtbarer Fokus, Fehler mit Text und aria-invalid. Der niedrigste gemessene Kontrast liegt hell bei **5,91:1** und dunkel bei **6,69:1** (Anforderung ≥ 4,5:1). Siehe F-03. |

## 5. Befunde

| **ID** | **Schwere** | **Befund** | **Auswirkung** | **Empfehlung** | **Zuständig** |
|---|---|---|---|---|---|
| **F-01** | **Mittel** | „1.000“ in einem Maschen- oder Reihenfeld wird als **1** gelesen, ohne Hinweis. Im Deutschen ist der Punkt aber oft ein Tausendertrenner. | Bei sehr großen Zahlen (z. B. Decke mit 1.000 M) entsteht still ein falsches Ergebnis (0,29 cm statt 294 cm). Bei „1.200“ erscheint dagegen korrekt ein Fehler. | In ganzzahligen Feldern das Muster „1–3 Ziffern, Punkt, genau 3 Ziffern“ ablehnen und auf „1000“ verweisen, oder es als Tausender lesen. | **Spezifikation** (E5 / Architektur 4.1): PO + Architekt entscheiden |
| F-02 | Niedrig | Beim Tippen von „12,5“ erscheint nach „12,“ kurz eine Fehlermeldung, die nach der nächsten Ziffer verschwindet. | Fehlermeldung blitzt kurz auf und irritiert. | Ein nachgestelltes Komma als „noch in Eingabe“ werten oder Format-Fehler erst beim Verlassen des Feldes zeigen. | Entwicklung |
| F-03 | Niedrig | Acht aria-live-Bereiche (je Karte zwei): Ändert sich eine Probe, kündigen Screenreader viele Werte gleichzeitig an. | Bei VoiceOver/TalkBack viele Ansagen hintereinander. Nicht mit echtem Screenreader verifiziert. | aria-live nur auf dem Hauptergebnis je Karte, Zwischenwerte ohne Live-Region. | Entwicklung |
| F-04 | Niedrig | Der Service Worker lädt beim Installieren über cache.addAll und kann dabei Dateien aus dem HTTP-Cache übernehmen (GitHub Pages: 10 min). | Nach einem Update können bis zu 10 min lang alte und neue Dateien gemischt sein. | Dateien mit new Request(url, { cache: 'reload' }) vorab laden. | Entwicklung |
| F-05 | Info | Unrealistische Proben sind erlaubt, z. B. 0,01 M auf 100 cm. | Absurde, aber endliche Ergebnisse, kein Absturz | Gegebenenfalls Plausibilitätsgrenzen oder Hinweise festlegen. | Backlog (PO) |
| F-06 | Info | Das Warnsymbol „⚠“ vor Fehlern kommt aus CSS und wird von manchen Screenreadern mitgelesen. | Kleinigkeit | Akzeptabel, alternativ als Grafik ohne Ansage. | – |

Es gibt keine Befunde der Schwere „Hoch“ oder „Kritisch“.

## 6. Entscheidung

**Freigabe für Sprint 1.**

- F-02 bis F-04 sind nicht blockierend. Sie können in einem kurzen Nachbesserungsschritt oder zu Beginn von Sprint 2 behoben werden.
- F-01 braucht eine fachliche Entscheidung, weil der Punkt als Dezimaltrenner bewusst so spezifiziert ist (E5).

## 7. Übertrag nach Jira (16.10.2026)

Alle Befunde sind als Bugs im Backlog unter dem Epic MAS-1 erfasst und noch keinem Sprint zugeordnet:

| **Befund** | **Jira** | **Priorität** |
|---|---|---|
| F-01 Tausenderpunkt „1.000“ | MAS-30 | Medium (wartet auf die Entscheidung zu a/b/c) |
| F-02 Fehler blitzt beim Tippen auf | MAS-31 | Low |
| F-03 zu viele aria-live-Bereiche | MAS-32 | Low |
| F-04 Service Worker und HTTP-Cache | MAS-33 | Low |
| F-05 unrealistische Proben | MAS-34 | Lowest |
| F-06 Warnsymbol | – | als „akzeptiert“ eingestuft, kein Ticket |
