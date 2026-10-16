# Änderungsprotokoll

## 0.1.0 – 16.10.2026 (Sprint 1 „Excel ersetzen“)
Erste nutzbare Version.

### Neu
- Maschenproben der Anleitung und die eigene Probe mit frei wählbaren Bezugsmaßen erfassen (US-01, US-02)
- Maschen- und Reihenzahlen aus der Anleitung auf die eigene Probe umrechnen, mit Anpassung (US-03, US-04)
- Breite und Länge in Maschen und Reihen umrechnen, laut Anleitung und mit eigener Probe (US-05, US-06)
- Eingaben bleiben lokal gespeichert, mit Knopf „Alle Eingaben zurücksetzen“ (US-07)
- Als App installierbar und offline nutzbar (US-08)
- Sprache und Längeneinheit technisch vorbereitet (bisher nur Deutsch und cm)

### Bekannte Einschränkungen (siehe Jira)
- MAS-30: „1.000“ in Maschen-/Reihenfeldern wird als 1 gelesen
- MAS-31: Fehlermeldung blitzt beim Tippen einer Kommazahl kurz auf
- MAS-32: Viele Screenreader-Ansagen bei Änderungen an einer Probe
- MAS-33: Nach einem Update können bis zu 10 Minuten lang alte Dateien geladen werden
- MAS-34: Unrealistische Maschenproben werden ohne Hinweis akzeptiert
