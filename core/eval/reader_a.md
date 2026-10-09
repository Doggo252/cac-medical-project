# Reader A (the AI) on OCR text

Prompt version `c4c868c0f998`. Tested on the 640 held-back fake letters, read from their photos, scrubbed of
private details, then sent through `prompts/extract.md`.

**Letter type right: 519/640 (81.1%)**

## By letter type

| | letters | type right |
|---|---|---|
| MC210_RV | 156 | 156/156 (100.0%) |
| MC355 | 163 | 156/163 (95.7%) |
| MC_239A | 159 | 158/159 (99.4%) |
| OTHER | 162 | 49/162 (30.2%) |

## Dates

Scored only on letters of the three types the app handles, where the true date exists.
A date "made up" is one the AI gave where the letter has none.

| date | right | wrong | missed (gave null) | made up |
|---|---|---|---|---|
| notice_date | 323/478 (67.6%) | 14 | 141 | 0 |
| due_date | 288/319 (90.3%) | 5 | 26 | 0 |
| effective_date | 107/159 (67.3%) | 3 | 49 | 0 |

Worker phone right: 372/478 (77.8%)

Case numbers the AI returned (should be 0, they are blanked first): 0

## The two readers together

- They agree: 518/640 (80.9%)
- Agree and both right: 513/640 (80.2%)
- Agree but both wrong (the only case the must-agree rule cannot catch): 5
- Disagree, so the app asks the user: 122/640 (19.1%)

## Letter type mistakes

| true | Reader A said | Reader B said | photo | layout |
|---|---|---|---|---|
| OTHER | MC_239A | OTHER | clean | approval |
| MC355 | MC210_RV | MC355 | tilt | mc355 |
| OTHER | MC210_RV | OTHER | clean | mc210rv_inner |
| OTHER | MC_239A | OTHER | clean | approval |
| OTHER | MC355 | OTHER | blur_shadow_fold | mc355_inner |
| OTHER | MC_239A | OTHER | clean | approval |
| OTHER | MC_239A | OTHER | bottom_cut | approval |
| OTHER | MC_239A | OTHER | tilt | approval |
| MC355 | OTHER | MC355 | clean | mc355 |
| OTHER | None | OTHER | tilt | na_back_9 |
| OTHER | MC_239A | OTHER | bottom_cut | approval |
| OTHER | MC_239A | OTHER | blur_shadow_fold | approval |
| OTHER | MC_239A | OTHER | tilt | approval |
| OTHER | MC355 | OTHER | bottom_cut | mc355_inner |
| OTHER | MC210_RV | MC210_RV | bottom_cut | mc216 |
| OTHER | MC_239A | OTHER | tilt | approval |
| OTHER | MC210_RV | OTHER | thumb | mc210rv_inner |
| OTHER | MC210_RV | OTHER | clean | mc210rv_inner |
| OTHER | MC355 | OTHER | blur_shadow_fold | mc355_inner |
| OTHER | MC355 | OTHER | thumb | mc355_inner |
| OTHER | MC210_RV | OTHER | tilt | mc210rv_inner |
| OTHER | MC210_RV | OTHER | thumb | mc217 |
| OTHER | MC_239A | OTHER | blur_shadow_fold | approval |
| OTHER | None | OTHER | thumb | mc217 |
| OTHER | MC_239A | OTHER | tilt | approval |
