<!-- Original aus dem Claude-Projekt „Stricken und Häckeln", dort als
     anforderungen/excel-formeln.md geführt. Am 22.10.2026 unverändert übernommen. -->

> **Fachliche Referenz.** Die Formeln der Ausgangs-Excel `Maschenrechner.xlsx` der Enduserin.
> Die Datei selbst liegt **nicht** im Repo: Sie trägt in ihren Dokumenteigenschaften den Namen
> der Enduserin, und das Repo ist öffentlich. Die hier festgehaltenen Formeln und Referenzwerte
> sind alles, was fachlich gebraucht wird.

# Maschenrechner.xlsx – Formeln (fachliche Referenz)

Tabelle1. Gilt als erprobte Ausgangsbasis der Enduserin.

## Maschenproben
| | Anzahl | cm |
|---|---|---|
| Anleitung Maschen (B2/C2) | 34 | 10 |
| Anleitung Reihen (B3/C3) | 52 | 10 |
| Eigene Maschen (B6/C6) | 25 | 10 |
| Eigene Reihen (B7/C7) | 37 | 10 |

## Blöcke
- **Maschenanschlag (Z. 9–11):** B11 = C2/B2*B10 (cm aus Anleitung) · C10 = ROUND(B6/C6*B11) + D10 (Anpassung) · C11 = C6/B6*C10 (tatsächliche cm)
- **Reihen (Z. 13–15):** B14 = 55 · B15 = C3/B3*B14 · C14 = ROUND(B7/C7*B15) + D14 · C15 = C7/B7*C14
- **Reihen aus cm (Z. 17–19):** B18 = 13,5 cm · B19 = ROUND(B3/C3*B18) (Anleitung) · C19 = ROUND(B7/C7*B18) + D19 · C18 = C7/B7*C19
- **Maschen umrechnen (Z. 21–23):** B22 = 320 · C22 = ROUND(B6/B2*B22) + D22 · B23 = C2/B2*B22 · C23 = C6/B6*C22
- **Maschen aus cm (Z. 25–27):** B27 = 94 cm · B26 = ROUND(B2/C2*B27)
- Z. 41–49: lose Zahlen ohne Beschriftung (78, 110, 86 / 47, 55, 49 / 35)

## Auffälligkeiten (PO, Sprint 1)
1. C22 rechnet mit dem Verhältnis B6/B2 und ignoriert die Bezugsbreite – nur korrekt, solange beide Proben auf gleicher Breite (10 cm) beruhen.
2. B26 nutzt die **Anleitungs**-Maschenprobe, nicht die eigene (94 cm → 320 statt 235 M).
3. Bedeutung der Zahlen in Z. 41–49 unklar.
