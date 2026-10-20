# GBFTSVM baseline: extra analyses

21 datasets, 10 splits. Scores are means over splits, then over datasets.

## 1. Share of impure balls (%)

GBFTSVM scores a pure ball by its centre distance alone; only impure balls get the Pythagorean closeness. This is the share of balls in the chosen model that are impure.

| method (ball set) | 0% noise | 10% noise | 20% noise | 30% noise |
|---|---|---|---|---|
| GBTWSVM | 0.87 | 0.01 | 0.00 | 0.00 |
| GBFTSVM | 0.79 | 0.01 | 0.00 | 0.00 |
| GBFTSVM-keep | 0.27 | 0.00 | 0.00 | 0.00 |
| GBFTSVM-adp | 0.00 | 0.00 | 0.00 | 0.00 |

## 2. Tuning on the test set vs cross-validation

CV: configuration chosen by 5-fold CV on the training part (our protocol). Test-tuned: the best test score over the whole grid, which is what choosing the configuration on the test set reports. BA = balanced accuracy, acc = accuracy (%).

| method, noise | CV BA | test-tuned BA | BA gain | CV acc | test-tuned acc | acc gain |
|---|---|---|---|---|---|---|
| GBLSTSVM, 0% | 73.51 | 82.91 | 9.40 | 78.57 | 87.40 | 8.83 |
| GBLSTSVM, 10% | 73.30 | 82.94 | 9.64 | 75.55 | 87.13 | 11.57 |
| GBLSTSVM, 20% | 71.03 | 81.93 | 10.90 | 70.85 | 86.21 | 15.36 |
| GBLSTSVM, 30% | 64.03 | 78.81 | 14.77 | 63.97 | 84.25 | 20.28 |
| GBTWSVM, 0% | 71.60 | 80.15 | 8.55 | 77.67 | 86.26 | 8.59 |
| GBTWSVM, 10% | 72.35 | 82.19 | 9.84 | 74.68 | 85.97 | 11.29 |
| GBTWSVM, 20% | 69.53 | 81.59 | 12.06 | 70.53 | 85.98 | 15.45 |
| GBTWSVM, 30% | 63.43 | 78.39 | 14.96 | 63.38 | 83.76 | 20.38 |
| GBFTSVM, 0% | 71.71 | 80.82 | 9.11 | 77.22 | 86.42 | 9.20 |
| GBFTSVM, 10% | 72.21 | 82.32 | 10.12 | 74.74 | 86.43 | 11.69 |
| GBFTSVM, 20% | 68.30 | 81.59 | 13.28 | 70.01 | 86.14 | 16.13 |
| GBFTSVM, 30% | 64.16 | 78.65 | 14.49 | 64.16 | 84.21 | 20.05 |
| GBFTSVM-keep, 0% | 76.24 | 84.90 | 8.66 | 76.94 | 88.11 | 11.17 |
| GBFTSVM-keep, 10% | 75.45 | 84.81 | 9.35 | 75.93 | 88.18 | 12.25 |
| GBFTSVM-keep, 20% | 72.32 | 83.37 | 11.05 | 71.82 | 87.50 | 15.67 |
| GBFTSVM-keep, 30% | 65.98 | 80.86 | 14.88 | 64.21 | 85.98 | 21.77 |
| GBFTSVM-adp, 0% | 74.44 | 78.61 | 4.17 | 78.75 | 83.87 | 5.12 |
| GBFTSVM-adp, 10% | 75.54 | 80.92 | 5.37 | 76.59 | 85.02 | 8.43 |
| GBFTSVM-adp, 20% | 71.86 | 79.48 | 7.62 | 71.56 | 84.57 | 13.01 |
| GBFTSVM-adp, 30% | 65.01 | 75.88 | 10.87 | 65.02 | 82.56 | 17.54 |

## 3. Accuracy reported in the GBFTSVM paper vs ours (%)

Paper: ten-fold CV with the best grid result reported (Tables IV and V). Ours: mean over 10 stratified 70/30 splits, the paper's grid of C, k-means balls as in GBLSTSVM. 'CV' is the accuracy of the configuration CV chose for balanced accuracy; 'test-tuned' is the best test accuracy over the grid. The paper's label-noise procedure is not described, so the 10% rows compare loosely.

| dataset, noise | paper GBTWSVM | paper GBFTSVM | GBTWSVM CV | GBTWSVM test-tuned | GBFTSVM CV | GBFTSVM test-tuned |
|---|---|---|---|---|---|---|
| sonar, 0% | 93.0 | 97.0 | 72.7 | 75.7 | 72.2 | 77.9 |
| sonar, 10% | 90.0 | 90.0 | 68.3 | 73.5 | 69.2 | 77.8 |
| heart-stat, 0% | 91.0 | 95.0 | 74.8 | 84.8 | 73.0 | 85.6 |
| heart-stat, 10% | 91.0 | 93.0 | 71.0 | 84.1 | 73.7 | 84.8 |
| iono, 0% | 93.0 | 97.0 | 79.6 | 82.8 | 81.0 | 83.5 |
| iono, 10% | 93.0 | 96.0 | 78.2 | 82.6 | 78.1 | 83.5 |
| wdbc, 0% | 96.0 | 99.0 | 83.7 | 88.8 | 82.0 | 89.1 |
| wdbc, 10% | 97.0 | 98.0 | 81.9 | 91.9 | 84.5 | 91.2 |
| pima, 0% | 83.0 | 84.0 | 74.1 | 78.6 | 74.7 | 78.5 |
| pima, 10% | 83.0 | 84.0 | 73.9 | 78.6 | 73.2 | 78.4 |
| ger, 0% | 81.0 | 83.0 | 58.3 | 74.5 | 61.0 | 73.9 |
| ger, 10% | 80.0 | 82.0 | 55.6 | 73.4 | 56.9 | 72.8 |
| mean, 0% | 89.5 | 92.5 | 73.9 | 80.9 | 74.0 | 81.4 |
| mean, 10% | 89.0 | 90.5 | 71.5 | 80.7 | 72.6 | 81.4 |
