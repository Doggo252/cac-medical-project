# Reader A (the AI) on OCR text

Prompt version `6e155a9e2971`. Tested on the 640 held-back fake letters, read from their photos, scrubbed of
private details, then sent through `prompts/extract.md`.

**Letter type right: 619/640 (96.7%)**

## By letter type

| | letters | type right |
|---|---|---|
| MC210_RV | 156 | 155/156 (99.4%) |
| MC355 | 163 | 161/163 (98.8%) |
| MC_239A | 159 | 155/159 (97.5%) |
| OTHER | 162 | 148/162 (91.4%) |

## Dates

Scored only on letters of the three types the app handles, where the true date exists.
A date "made up" is one the AI gave where the letter has none.

| date | right | wrong | missed (gave null) | made up |
|---|---|---|---|---|
| notice_date | 325/478 (68.0%) | 17 | 136 | 0 |
| due_date | 286/319 (89.7%) | 5 | 28 | 0 |
| effective_date | 109/159 (68.6%) | 9 | 41 | 0 |

Worker phone right: 377/478 (78.9%)

Case numbers the AI returned (should be 0, they are blanked first): 0

## The two readers together

- They agree: 614/640 (95.9%)
- Agree and both right: 611/640 (95.5%)
- Agree but both wrong (the only case the must-agree rule cannot catch): 3
- Disagree, so the app asks the user: 26/640 (4.1%)

## Letter type mistakes

| true | Reader A said | Reader B said | photo | layout |
|---|---|---|---|---|
| OTHER | MC210_RV | MC210_RV | bottom_cut | mc216 |
| MC355 | OTHER | MC355 | blur_shadow_fold | mc355 |
| OTHER | MC355 | OTHER | blur_shadow_fold | mc355_inner |
| OTHER | MC355 | OTHER | blur_shadow_fold | mc355_inner |
| MC355 | None | MC210_RV | blur_shadow_fold | mc355 |
| MC_239A | OTHER | MC_239A | blur_shadow_fold | 2007 |
| OTHER | MC355 | OTHER | clean | mc355_inner |
| OTHER | MC355 | OTHER | blur_shadow_fold | mc355_inner |
| MC_239A | OTHER | MC_239A | blur_shadow_fold | 2007 |
| OTHER | MC355 | OTHER | clean | mc355_inner |
| OTHER | MC355 | OTHER | clean | mc355_inner |
| MC_239A | OTHER | MC_239A | blur_shadow_fold | 2007 |
| OTHER | MC210_RV | MC210_RV | bottom_cut | mc216 |
| OTHER | MC355 | OTHER | tilt | mc355_inner |
| OTHER | MC355 | OTHER | bottom_cut | mc355_inner |
| MC_239A | OTHER | MC_239A | blur_shadow_fold | calsaws |
| OTHER | MC355 | OTHER | thumb | mc355_inner |
| MC210_RV | OTHER | MC210_RV | blur_shadow_fold | mc210rv |
| OTHER | MC355 | OTHER | tilt | mc355_inner |
| OTHER | MC210_RV | MC210_RV | bottom_cut | mc216 |
| OTHER | MC355 | OTHER | clean | mc355_inner |
