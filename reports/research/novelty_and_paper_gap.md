# Is our work novel, and why does the GBLSTSVM paper beat LSTSVM when we don't?

Written 4 Nov 2026 after reading the GBLSTSVM paper (Tanveer, Sharma, Quadir, Sajid; arXiv 2410.17338v2, Pattern Recognition 2026) and running one new experiment.

## 1. Why the paper shows GBLSTSVM > LSTSVM and we show the opposite

### What the paper says it did
- One random 70/30 split per dataset, 34 UCI/KEEL datasets, accuracy as the metric.
- "Grid search and five-fold cross-validation", with c1, c2 in {10^-5, ..., 10^5} and the ball settings `num` and `pur` also tuned.
- Label noise at 5, 10, 15 and 20%.
- The per-dataset numbers are in a supplementary file that we don't have.

### What their released code does
The code is at github.com/mtanveer1/GBLSTSVM, in `main.py` and `GBLSTSVM.py`.
- It runs one split with fixed settings: c1 = 1000, c2 = 0.00001, num = 2 and pur = 0.985.
- It has no grid search and no cross-validation.
- It has no LSTSVM baseline.
- The README says the code "is not exactly the same as used in our paper".

So we can't see how they tuned either model.

The `main.py` we started from is a modified copy with class weighting and a c1/c2/k loop. That copy picks the settings with the best test score. That is not the authors' release.

### What we can test: tune both models on the test set
- **Setup.** Both models use the same 21 datasets, the same 10 splits and the same noise as round 7.
- **LSTSVM grid.** c1, c2 and class weighting.
- **GBLSTSVM grid.** The same, plus k.
- **Code.** `experiments/run_lstsvm_test_tuning.py`.
- **Results.** `results/lstsvm_test_tuning/summary.csv`. The GBLSTSVM numbers come from `results/gbftsvm_cv`.

**Accuracy (%), mean over 21 datasets × 10 splits**

| Noise | LSTSVM, fair CV | GBLSTSVM, fair CV | LSTSVM, tuned on test | GBLSTSVM, tuned on test | Paper LSTSVM | Paper GBLSTSVM |
|---|---|---|---|---|---|---|
| 0% | **81.8** | 78.6 | **88.1** | 87.4 | 86.67 | **88.26** |
| 10% | **79.2** | 75.6 | 87.1 | 87.1 | 84.82 | **87.47** |
| 20% | **75.0** | 70.9 | 86.0 | **86.2** | 83.79 | **86.09** |
| 30% | **67.1** | 64.0 | 84.0 | **84.3** | — | — |

**Balanced accuracy (%)**

| Noise | LSTSVM, fair CV | GBLSTSVM, fair CV | LSTSVM, tuned on test | GBLSTSVM, tuned on test | GB wins (tuned on test) |
|---|---|---|---|---|---|
| 0% | **80.8** | 73.5 | **84.4** | 82.9 | 12/21, p = 0.84 |
| 10% | **78.5** | 73.3 | 82.4 | **82.9** | 16/21, p = 0.08 |
| 20% | **75.7** | 71.0 | 80.5 | **81.9** | 15/21, p = 0.046 |
| 30% | **69.1** | 64.0 | 76.2 | **78.8** | 18/21, p = 0.004 |

How to read these tables:
- **With fair CV, LSTSVM wins at every noise level** on both metrics. The settings are chosen on the training part and the model is scored once on the test part.
- **Tuned on the test set, the paper's picture comes back.**
  - The two models tie with no noise.
  - GBLSTSVM pulls ahead as noise grows.
  - Our test-tuned GBLSTSVM accuracies (87.4, 87.1, 86.2) sit close to the paper's (88.3, 87.5, 86.1). Our fair-CV numbers (78.6, 75.6, 70.9) are far below them.
- **Why GBLSTSVM gains more from test tuning:**
  - It has an extra knob (k, or `num` and `pur` in the paper).
  - Every k builds a different set of balls, so it offers more, and more different, models to pick the luckiest from.
  - Noise makes those models more different again, so the bonus grows with noise.
- **Uneven tuning makes this much worse.** If only the proposed model were tuned on the test set and LSTSVM tuned fairly, GBLSTSVM would "win" by 5.6, 8.0, 11.3 and 17.2 accuracy points at 0–30% noise.

### Other things that differ
- **One split vs ten.** A single 70/30 split moves dataset-level numbers by several points.
- **Datasets.**
  - The paper names haberman, sonar, heart, vehicle, ecoli2, yeast3 and two other yeast sets in its text.
  - The rest of its 34 datasets are only listed in the supplement.
- **Noise injection.** The paper does not say whether noise touches only the training labels; we flip training labels only.
- **Tuning metric.** Our CV picks settings by balanced accuracy, which lowers plain accuracy a little on imbalanced sets. This applies to both models equally, so it can't flip the order.

**Bottom line.** The paper's ordering is what you get when the settings are chosen with the test data. It reverses when they are chosen honestly. We can't prove that is what the authors did; their released code doesn't show their tuning. What we can say is that their numbers match test-set selection and do not match fair CV.

## 2. Is our work novel?

### Not novel: the method
- **Neighbour-label weighting of balls (our T7)** is already in SDAP-GBRVFL (arXiv 2609.29670, 2026). On single points it goes back to fuzzy kNN (Keller 1985) and IFTSVM (Rezvani 2019).
- **Centre-distance and purity memberships (our T1/T3)** are in GBFSVM, GBFTSVM and RGBIFTSVM.
- **FKNN-LSTSVM beats keep+T7 in our own runs.** So "a new fuzzy membership for GBLSTSVM" cannot be the headline.

### Novel, as far as our reading list and two quick searches show
1. **Deleting single-point balls is a hidden noise filter.** At 10–30% noise it removes 82–88% of the flipped labels, but also 41–60% of the clean points, mostly boundary points.
2. **Under fair CV, plain LSTSVM beats GBLSTSVM** by 3–5 points (accuracy) and 5–7 points (balanced accuracy) at every noise level.
3. **The published advantage comes back only when both models are tuned on the test set**, and it grows with noise (section 1).
4. **Published fuzzy GB scores add nothing under fair CV.** GBFTSVM's Pythagorean scores do not beat GBTWSVM, and GBFTSVM's paper also tunes on the test set.
5. **Keep + T7 is a simple fix** that recovers 2.6–4.9 points over GBLSTSVM and ties LSTSVM at 30% noise.

That is a publishable evaluation paper: "granular balls in LSTSVM, tested fairly". It is not a new-method paper.

### What it would take to add method novelty
In this sub-field, most papers take a known idea (pinball loss, Universum, fuzzy or intuitionistic weights) and put it on balls. Our obstacle is not a shortage of ideas. Under fair testing, no ball-based method we have tried beats plain LSTSVM, or fuzzy-kNN LSTSVM on samples.

A method paper therefore needs a membership that passes this go/no-go test:
- **Detection.** It flags flipped labels better than T7, measured as detection AUC with the true flips known. This test is cheap.
- **Accuracy.** It beats both LSTSVM and FKNN-LSTSVM under fair CV at two or more noise levels.

The one idea worth testing next is **cross-fitted residual membership**:
- **How it works.** Fit the twin planes without a ball, see which side that ball falls on and by how much, and weight the ball by that. Repeat a couple of times.
- **Why it might help.** It uses the classifier's own view of each ball, where every geometric membership we tried (distance, entropy, density, purity) failed to spot flipped labels.
- **Prior art to check.**
  - On points this is close to classification filters (Brodley & Friedl 1999) and confident learning (Northcutt et al. 2021).
  - On balls, inside a closed-form LSTSVM, we have not seen it, but it needs a proper search.
- **If it fails,** it becomes one more row in the evaluation paper's "memberships that don't help" table, so the test is not wasted.

Sources from the searches: [GBFTSVM, arXiv 2408.00699](https://arxiv.org/abs/2408.00699), [GBG++, arXiv 2305.18450](https://arxiv.org/pdf/2305.18450), [GB K-class TSVC, arXiv 2412.05438](https://arxiv.org/pdf/2412.05438), [GBSVM, arXiv 2210.03120](https://arxiv.org/pdf/2210.03120), [GB CNN with label noise, arXiv 2207.08810](https://arxiv.org/pdf/2207.08810). None of them re-tests GB classifiers under fair CV.

## 3. Update, 4 Nov: the residual membership fails gate 1

`experiments/residual_membership_probe.py` was run on 21 datasets, 5 splits and k = 2, 4, 6. Results are in `results/residual_probe/summary.md`.

The score is the detection AUC of "low weight" for flipped labels; 0.5 is chance. The last column counts the datasets where the measure beats T7.

| Measure | 10% | 20% | 30% | Beats T7 on |
|---|---|---|---|---|
| T7 (neighbour agreement on balls) | 0.88 | 0.87 | 0.82 | — |
| Residual on balls, best C (0.1) | 0.66 | 0.65 | 0.60 | 2–3 of 21 |
| T7 × residual | 0.88 | 0.83 | 0.74 | 6–9 of 21 |
| Residual on points (classification filter) | 0.82 | 0.76 | 0.70 | 4–8 of 21 |
| Fuzzy kNN on points | 0.89 | 0.87 | 0.82 | 9–17 of 21 |

- **On the imbalanced sets the residual is worse than chance.** These are ecoli2, ecoli4, the yeast sets and glass4. A linear plane leaves clean minority points on the wrong side, so the residual flags them as noise.
- **Gate 1 failed.** The fair-CV run is skipped, and the idea goes into the paper as a negative result.
- **Neighbour-based weights remain the best noise detectors**, and they are already published.
- **Next step:** draft the evaluation paper.

## 4. Update, 4 Nov: boundary-aware neighbour agreement also fails gate 1

**The idea.** m = 1 − (1 − a)·b, where a is a ball's neighbour agreement (T7, k = 10) and b is the mean agreement of its neighbours. The aim was to keep the weight of clean boundary points while cutting intruders.

**The run.** `experiments/boundary_membership_probe.py` was run on 21 datasets, 5 splits and k = 2, 4, 6. Results are in `results/boundary_probe/summary.md`.

| Detection AUC | 10% | 20% | 30% |
|---|---|---|---|
| T7 on balls | 0.885 | 0.868 | 0.821 |
| Boundary-aware on balls | 0.882 | 0.864 | 0.816 |
| T7, minority label only | 0.804 | 0.771 | 0.715 |
| Boundary-aware, minority label only | 0.795 | 0.761 | 0.705 |

**What the run shows:**
- **Overall.** The boundary-aware version is below T7 on 19–20 of the 21 datasets (Wilcoxon p ≤ 0.002 at every noise level).
- **Class-balanced votes.** These are worse still: 0.78, 0.73 and 0.67 overall.
- **Same on raw samples.** It loses to fuzzy kNN there too.

**Why it fails.** With random label noise, most flipped points sit deep inside the other class, where T7 already catches them. Flipped points near the boundary get protected along with the clean ones.

**Prior art checked.** Neither paper uses this formula:
- GBABS (arXiv 2506.02366) uses a hard, first-order rule on ball centres to select samples.
- NCE (arXiv 2208.03207) compares each label with the neighbours' predictions in deep networks.

**Proposed framing for the professor.** Keep + T7 is a new fuzzy GBLSTSVM model, at the same level of novelty as GBFTSVM, with the deletion analysis as its motivation. The two failed memberships are evidence that the search was done.

**Gate 2 run anyway (user asked, 4 Nov).** Keep + boundary-aware (single-point balls kept, k ∈ {5, 10}, γ ∈ {1, 3}) was put through the fair 5-fold CV on 21 datasets × 10 splits. Results are in `results/fuzzy_cv_boundary/summary_vs_baselines.csv`.

| Balanced accuracy (%) | 0% | 10% | 20% | 30% |
|---|---|---|---|---|
| Keep + boundary-aware | 77.4 | 76.0 | 73.8 | 67.8 |
| Keep + T7 | 76.8 | 75.9 | 73.9 | 68.9 |
| p vs keep + T7 (Wilcoxon) | 0.26 | 0.63 | 0.86 | 0.19 |
| GBLSTSVM | 73.5 | 73.3 | 71.0 | 64.0 |
| LSTSVM | 80.8 | 78.5 | 75.7 | 69.1 |
| Fuzzy-kNN LSTSVM | 80.3 | 78.6 | 76.9 | 71.0 |

- It ties keep + T7 at every noise level and beats GBLSTSVM by 2.7–3.9 points (p ≤ 0.016).
- It trails LSTSVM at 0–20% (p ≤ 0.002) and fuzzy-kNN LSTSVM everywhere (p ≤ 0.002).
- It uses the same balls as keep + T7, so there is no time saving.
- It can be named as the model's membership only as an equal to T7, not an improvement. A fuller prior-art search is needed first (for example neighbour-of-neighbour rules in noise filtering and instance selection).

## 5. Update, 4 Nov: borrowed memberships (new only for GBLSTSVM) also fail gate 1

`experiments/transplant_membership_probe.py` was run with single-point balls kept. Results are in `results/transplant_probe/summary.md`.

| Detection AUC | 10% | 20% | 30% | Beats T7 on |
|---|---|---|---|---|
| T7 | 0.885 | 0.868 | 0.821 | — |
| Intuitionistic score (Ha 2013; Rezvani IFTSVM 2019): μ = T1, ν = (1 − μ)(1 − T7) | 0.757 | 0.694 | 0.640 | 0 of 21 |
| Fuzzy-rough lower approximation (nearest other-class ball) | 0.654 | 0.596 | 0.557 | 0 of 21 |

**Already tried earlier:**
- Lin–Wang centre distance (T1)
- EFSVM kNN entropy (T2)
- fuzzy kNN (T7)
- GBFTSVM's Pythagorean score

**Not worth running:**
- FSVM-CIL reduces to T1 plus class weighting, or to the residual idea.
- ACFSVM's SVDD affinity is geometric, so it should be flat on pure balls.

**The pattern:** only weights that compare a ball's label with its neighbours' labels detect noise, and none beats T7. The deck `post_midsem.pptx` now has 21 slides; slides 14–20 cover this, the case against a new fuzzy formula, and the case for the evaluation paper.

## 6. Update, 4 Nov: soft (GMM) ball splitting fails gate 1

**The idea (user).** Split balls with a Gaussian mixture instead of k-means, so each point gets a soft membership (its posterior in the component that formed its ball), and use that as the fuzzy weight. Code: `gen_ball_gmm.py`, `experiments/gmm_membership_probe.py`; results in `results/gmm_probe/summary.md` (21 datasets, 5 splits, k = 2, 4, 6, single-point balls kept).

| Detection AUC | 10% | 20% | 30% |
|---|---|---|---|
| T7 on k-means balls | 0.885 | 0.868 | 0.821 |
| Soft GMM membership (ball mean, last split) | 0.329 | 0.391 | 0.435 |
| Soft GMM membership (product along split chain) | 0.466 | 0.475 | 0.486 |
| T7 on GMM balls | 0.884 | 0.866 | 0.821 |
| One GMM per class, cross-fitted p(y given x) | 0.840 | 0.783 | 0.721 |

- **The soft membership is worse than chance.** Flipped points are split off into tiny balls of their own, where their posterior is 1.
- **GMM balls with T7** match T7 on k-means balls (ahead on 9–13 of 21 datasets): the balls change, the signal doesn't.
- **A label-aware mixture (one per class)** detects noise, being a smoothed neighbour vote, but trails T7 at every level.
- **Prior art.** G-GBC (J. Yang, Q. Liu, X. Cao, F. Li, X. Yang, Knowledge-Based Systems 341, 115754, 2026, DOI 10.1016/j.knosys.2026.115754; PDF uploaded by the user) fits one GMM (K components, hard assignment) to each CNN batch's features, with no recursive splitting. It gives low-purity clusters a fixed weight 0.1 and scores each sample by purity × squared Mahalanobis distance to every ball centre (Eqs. 14-17), then adds the mean score to the features. Posteriors are not used as weights. So GMM granular balls are taken; recursive GMM splitting with posterior weights in an SVM is not, but it fails gate 1 anyway.
- No fair-CV run: the weight fails gate 1.

## Backup: every model tuned on the test set (11 Nov)

Asked by Jayagna as a fallback pitch: score the fuzzy models the way the published granular-ball numbers come out (one 70/30 split, best test score over the whole grid, no CV). `experiments/run_test_tuning.py`, 13 models, 21 datasets, 0/10/20/30% noise, 10 splits; summary in `results/test_tuning/summary.md`.

- Keep + T7 beats GBLSTSVM by +1.8/+1.6/+2.1/+2.5 accuracy points (wins 17/19/16/18 of 21, Wilcoxon p ≤ 0.003); keep + boundary-aware +1.8/+1.6/+1.8/+2.1. Both are also above test-tuned LSTSVM and level with fuzzy-kNN LSTSVM.
- T1/T2 add 0.1–0.3; GBFTSVM is 1.0/0.7 below GBLSTSVM at 0/10% noise and level after.
- Caveat 1: all numbers are optimistic (test labels pick the settings).
- Caveat 2: keep + T7 searches 1,960 settings against GBLSTSVM's 490. With one T7 setting (equal grid) the gain is +1.2/+0.9/+1.1/+1.4 and significant only at 30% noise. Keeping single-point balls with no fuzzy weight gives +1.3/+0.7/+0.7/+0.8.
- Split 0 alone gives the same picture (keep + T7 +1.7/+2.1/+2.3/+2.5).

Three more ball memberships (`fuzzy_membership.py`: `shrunk`, `gapvote`, `relative`), all on kept balls:
- Detection (gate 1, `results/new_membership_probe`): radius-aware vote AUC .886/.877/.854 vs T7 .885/.868/.821, ahead on 15/18/19 of 21 datasets, the first membership to beat T7; friend/enemy distance .884/.875/.841; size-shrunk vote level with T7.
- Fair CV (gate 2, `results/fuzzy_cv_new/summary_vs_baselines.csv`): all three tie keep + T7 in balanced accuracy (within about 1 point; only friend/enemy at 0% noise has p < 0.05, uncorrected), beat GBLSTSVM by 2.5–4.7 points and trail fuzzy-kNN LSTSVM. Literature not yet searched for these three.

## Novelty check of the radius-aware vote (12 Nov)

**Definition (`fuzzy_membership.py`, `membership_gapvote`).** For ball i, the neighbours are the k balls with the smallest surface gap g_ij = max(0, ‖c_i − c_j‖ − r_i − r_j). Neighbour j votes with weight n_j · exp(−(g_ij / s_i)²), where n_j is its point count and s_i is the gap to the k-th neighbour. The membership is (own-class share of the weighted vote)^γ. T7 differs in two places: neighbours by centre distance, and votes weighted by n_j only.

**Verdict: partly novel.** Every ingredient is published; the combination, used as a ball's fuzzy weight, was not found.

| Ingredient | Closest prior art | Difference |
|---|---|---|
| Neighbour-label vote on balls | SDAP-GBRVFL (arXiv 2609.29670), Eq. 6: LSI_i = (1/k) Σ I(y_j ≠ y_i) over the k nearest balls | Plain fraction: no distance weight, no size weight, radius absent; neighbour distance not defined; used as non-membership in an RVFL |
| Surface gap between two balls | GBCT clustering (arXiv 2410.13917), Eq. 9: ‖c_i − c_j‖ − (r_i + r_j), used as a merge similarity | Unsupervised; no labels, no vote. RD-GBG (arXiv 2506.02366) has a one-sided conflict radius min(Δ(c_i, c) − r_i) for ball construction only |
| Point-to-surface distance | GBKNN (arXiv 2608.12903) Eq. 16, DTW-GBC (arXiv 2608.11704) Eq. 7, original GB-kNN (Xia 2019): ‖x − c‖ − r | Classifies test points; no per-ball training weight |
| Distance-weighted vote, bandwidth from the k-th neighbour | Dudani 1976; Hechenbichler and Schliep 2004 (kernel on distance scaled by the (k+1)-th neighbour); Keller fuzzy kNN 1985 (inverse-distance weights) | On points, not balls; no radius |
| Weighted vote among balls | QGB-WkNN (arXiv 2609.05952), Eqs. 3–5: weight = purity × normalised 1/(1 + ‖x − c_i‖) | Centre distance, test-time classification only |
| Fuzzy weight on balls in an SVM | GBFSVM, GBFTSVM, RGBIFTSVM | Distance to class centre (and purity); no neighbours |

**What can be claimed.** "A radius-aware neighbour-vote membership for granular-ball (LS)TSVM": new on granular balls as a combination, GBFTSVM-level novelty. Not a new fuzzy concept. Must cite SDAP-GBRVFL, GBCT, and weighted/fuzzy kNN.

**What the results allow.** Detection AUC beats T7 (.886/.877/.854 vs .885/.868/.821). Fair-CV balanced accuracy ties keep + T7 (76.5/76.0/74.2/68.8, differences −0.3/+0.1/+0.3/−0.1, n.s.), beats GBLSTSVM by 2.7–4.7 points (p ≤ .01), trails LSTSVM at 0–20% and fuzzy-kNN LSTSVM everywhere.

**Limits of the search.** Web and arXiv search on 12 Nov 2026; GBKNN, QGB-WkNN, GBCT and RD-GBG were read partly (the tail of each page was only summarised); SDAP-GBRVFL was read in full. Paywalled journals without preprints and Chinese-language venues were not covered.
