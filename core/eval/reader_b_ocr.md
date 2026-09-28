# Reader B on OCR text

Tested on the 640 held-back fake letters, read from their photos by Tesseract.

**Overall accuracy: 98.1%**

## By letter type

| | letters | accuracy |
|---|---|---|
| MC210_RV | 156 | 100.0% |
| MC355 | 163 | 99.4% |
| MC_239A | 159 | 100.0% |
| OTHER | 162 | 93.2% |

## By photo type

| | letters | accuracy |
|---|---|---|
| blur_shadow_fold | 128 | 96.9% |
| bottom_cut | 116 | 97.4% |
| clean | 134 | 97.0% |
| thumb | 137 | 99.3% |
| tilt | 125 | 100.0% |

## By writing

| | letters | accuracy |
|---|---|---|
| handwritten | 90 | 100.0% |
| printed | 550 | 97.8% |

## By layout

| | letters | accuracy |
|---|---|---|
| 2007 | 111 | 100.0% |
| approval | 50 | 98.0% |
| calsaws | 48 | 100.0% |
| hearing_form | 5 | 100.0% |
| mc210rv | 156 | 100.0% |
| mc210rv_inner | 29 | 100.0% |
| mc216 | 12 | 41.7% |
| mc217 | 7 | 57.1% |
| mc355 | 163 | 99.4% |
| mc355_inner | 28 | 100.0% |
| mc380 | 10 | 100.0% |
| mc382 | 3 | 100.0% |
| na_back_9 | 18 | 100.0% |

## Confusion matrix

Rows are the true type, columns are what Reader B guessed.

| true \ guessed | MC210_RV | MC355 | MC_239A | OTHER |
|---|---|---|---|---|
| MC210_RV | 156 | 0 | 0 | 0 |
| MC355 | 1 | 162 | 0 | 0 |
| MC_239A | 0 | 0 | 159 | 0 |
| OTHER | 10 | 0 | 1 | 151 |

## Real letters (data/real/)

| file | page | Reader B says |
|---|---|---|
| real_mc355_2022-12.pdf | 1 | MC355 |
| real_mc355_2022-12.pdf | 2 | OTHER |
| real_mc355_2022-12.pdf | 3 | OTHER |
| real_mc355_2022-12.pdf | 4 | OTHER |
| real_noa_approval_2022-12.pdf | 1 | OTHER |
| real_noa_approval_2022-12.pdf | 2 | OTHER |
| real_noa_approval_2022-12.pdf | 3 | OTHER |
| real_noa_approval_2022-12.pdf | 4 | OTHER |
| real_noa_approval_2022-12.pdf | 5 | OTHER |
