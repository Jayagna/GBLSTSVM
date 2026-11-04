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
