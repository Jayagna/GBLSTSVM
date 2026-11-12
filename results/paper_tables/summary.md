# Paper tables

## oracle, accuracy

### noise 0 (35 datasets; Friedman chi2 = 101.41, p = 1.3e-19)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 88.53 | 4.94 | +1.45 | 34-0-1 | 5.86e-07 |
| TSVM | 88.59 | 4.27 | +1.39 | 33-0-2 | 3.56e-06 |
| GBSVM | 84.96 | 5.40 | +5.03 | 33-0-2 | 3.82e-07 |
| LSTSVM | 88.21 | 5.31 | +1.77 | 35-0-0 | 2.47e-07 |
| GBLSTSVM | 88.08 | 4.16 | +1.90 | 32-0-3 | 1.91e-05 |
| LS-GBLSTSVM | 89.50 | 2.46 | +0.48 | 27-0-8 | 0.000378 |
| Proposed | 89.98 | 1.46 | | | |
| Proposed without the regulariser | 89.53 | nan | +0.45 | 20-4-11 | 0.00254 |
| LS-GBLSTSVM, balls kept (no weight) | 89.33 | nan | +0.65 | 31-2-2 | 1.23e-06 |
| GBFTSVM | 87.09 | nan | +2.89 | 32-0-3 | 3.29e-06 |
| GBLSTSVM, balls kept (no weight) | 88.95 | nan | +1.04 | 32-1-2 | 1.15e-06 |
| Plain neighbour count | 89.50 | nan | +0.48 | 23-4-8 | 0.00231 |

### noise 0.05 (35 datasets; Friedman chi2 = 111.05, p = 1.2e-21)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 87.91 | 5.44 | +1.92 | 34-1-0 | 3.65e-07 |
| TSVM | 88.61 | 3.96 | +1.22 | 33-0-2 | 4.17e-06 |
| GBSVM | 85.11 | 5.30 | +4.72 | 32-1-2 | 6.81e-07 |
| LSTSVM | 88.05 | 5.51 | +1.78 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 87.98 | 3.86 | +1.85 | 30-2-3 | 4.2e-06 |
| LS-GBLSTSVM | 89.30 | 2.43 | +0.52 | 25-3-7 | 0.000266 |
| Proposed | 89.83 | 1.50 | | | |
| Proposed without the regulariser | 89.25 | nan | +0.58 | 26-2-7 | 0.000109 |
| LS-GBLSTSVM, balls kept (no weight) | 89.12 | nan | +0.71 | 33-0-2 | 6.94e-07 |
| GBFTSVM | 86.63 | nan | +3.19 | 31-1-3 | 1.62e-06 |
| GBLSTSVM, balls kept (no weight) | 88.45 | nan | +1.38 | 33-0-2 | 3.22e-07 |
| Plain neighbour count | 89.30 | nan | +0.53 | 24-2-9 | 0.00437 |

### noise 0.1 (35 datasets; Friedman chi2 = 119.24, p = 2.4e-23)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 87.08 | 5.56 | +2.45 | 34-0-1 | 2.7e-07 |
| TSVM | 88.23 | 4.20 | +1.30 | 34-0-1 | 2.81e-06 |
| GBSVM | 84.87 | 5.27 | +4.66 | 33-1-1 | 3.99e-07 |
| LSTSVM | 87.56 | 5.47 | +1.98 | 35-0-0 | 2.47e-07 |
| GBLSTSVM | 87.93 | 3.84 | +1.60 | 29-2-4 | 6.51e-05 |
| LS-GBLSTSVM | 89.20 | 2.14 | +0.33 | 23-5-7 | 0.0025 |
| Proposed | 89.53 | 1.51 | | | |
| Proposed without the regulariser | 89.17 | nan | +0.36 | 24-2-9 | 0.0117 |
| LS-GBLSTSVM, balls kept (no weight) | 88.84 | nan | +0.69 | 30-2-3 | 1.47e-06 |
| GBFTSVM | 86.85 | nan | +2.69 | 30-0-5 | 4.51e-06 |
| GBLSTSVM, balls kept (no weight) | 88.27 | nan | +1.27 | 33-1-1 | 4.78e-07 |
| Plain neighbour count | 89.16 | nan | +0.38 | 24-2-9 | 0.0159 |

### noise 0.15 (35 datasets; Friedman chi2 = 130.46, p = 1e-25)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.47 | 5.67 | +2.85 | 35-0-0 | 2.48e-07 |
| TSVM | 87.59 | 4.34 | +1.73 | 34-0-1 | 4.94e-07 |
| GBSVM | 84.58 | 5.57 | +4.75 | 35-0-0 | 2.47e-07 |
| LSTSVM | 87.14 | 5.31 | +2.19 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 87.52 | 3.49 | +1.80 | 31-0-4 | 9.76e-06 |
| LS-GBLSTSVM | 88.87 | 2.26 | +0.46 | 27-1-7 | 0.000648 |
| Proposed | 89.33 | 1.36 | | | |
| Proposed without the regulariser | 88.84 | nan | +0.49 | 26-3-6 | 0.000354 |
| LS-GBLSTSVM, balls kept (no weight) | 88.47 | nan | +0.86 | 32-2-1 | 5.9e-07 |
| GBFTSVM | 86.61 | nan | +2.72 | 32-0-3 | 3.04e-06 |
| GBLSTSVM, balls kept (no weight) | 87.93 | nan | +1.39 | 33-0-2 | 8.21e-07 |
| Plain neighbour count | 88.90 | nan | +0.43 | 23-3-9 | 0.0129 |

### noise 0.2 (35 datasets; Friedman chi2 = 124.88, p = 1.5e-24)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.17 | 5.66 | +2.91 | 35-0-0 | 2.48e-07 |
| TSVM | 87.07 | 4.37 | +2.01 | 34-0-1 | 7.55e-07 |
| GBSVM | 83.97 | 5.70 | +5.11 | 34-0-1 | 2.7e-07 |
| LSTSVM | 86.79 | 5.00 | +2.28 | 35-0-0 | 2.47e-07 |
| GBLSTSVM | 87.06 | 3.61 | +2.01 | 31-0-4 | 2.96e-05 |
| LS-GBLSTSVM | 88.66 | 2.21 | +0.42 | 25-1-9 | 0.00143 |
| Proposed | 89.08 | 1.44 | | | |
| Proposed without the regulariser | 88.61 | nan | +0.47 | 23-3-9 | 0.000471 |
| LS-GBLSTSVM, balls kept (no weight) | 88.14 | nan | +0.94 | 33-0-2 | 5.86e-07 |
| GBFTSVM | 86.50 | nan | +2.58 | 30-2-3 | 6.99e-06 |
| GBLSTSVM, balls kept (no weight) | 87.49 | nan | +1.59 | 31-2-2 | 8.54e-07 |
| Plain neighbour count | 88.67 | nan | +0.41 | 24-0-11 | 0.00688 |

## oracle, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 92.49, p = 9.2e-18)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 83.70 | 5.23 | +3.08 | 34-0-1 | 2.95e-07 |
| TSVM | 84.79 | 3.60 | +1.99 | 28-0-7 | 4.22e-05 |
| GBSVM | 75.36 | 5.94 | +11.42 | 33-0-2 | 3.82e-07 |
| LSTSVM | 84.04 | 4.86 | +2.74 | 33-0-2 | 6.94e-07 |
| GBLSTSVM | 83.70 | 3.80 | +3.08 | 26-0-9 | 0.000619 |
| LS-GBLSTSVM | 85.66 | 2.63 | +1.12 | 23-0-12 | 0.027 |
| Proposed | 86.78 | 1.94 | | | |
| Proposed without the regulariser | 86.37 | nan | +0.41 | 21-1-13 | 0.11 |
| LS-GBLSTSVM, balls kept (no weight) | 86.06 | nan | +0.72 | 28-1-6 | 0.000124 |
| GBFTSVM | 81.26 | nan | +5.52 | 30-0-5 | 5.7e-06 |
| GBLSTSVM, balls kept (no weight) | 85.40 | nan | +1.38 | 31-0-4 | 3.94e-05 |
| Plain neighbour count | 86.49 | nan | +0.29 | 23-1-11 | 0.293 |

### noise 0.05 (35 datasets; Friedman chi2 = 112.65, p = 5.7e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 82.62 | 5.44 | +3.39 | 34-0-1 | 4.54e-07 |
| TSVM | 84.04 | 3.84 | +1.97 | 30-0-5 | 1.42e-05 |
| GBSVM | 76.64 | 5.70 | +9.38 | 33-0-2 | 6.94e-07 |
| LSTSVM | 83.03 | 5.49 | +2.99 | 34-0-1 | 4.54e-07 |
| GBLSTSVM | 83.89 | 3.37 | +2.13 | 22-0-13 | 0.0423 |
| LS-GBLSTSVM | 85.58 | 1.94 | +0.43 | 14-1-20 | 0.952 |
| Proposed | 86.02 | 2.21 | | | |
| Proposed without the regulariser | 85.75 | nan | +0.27 | 19-1-15 | 0.688 |
| LS-GBLSTSVM, balls kept (no weight) | 85.29 | nan | +0.73 | 29-0-6 | 0.000994 |
| GBFTSVM | 82.18 | nan | +3.83 | 24-0-11 | 0.00176 |
| GBLSTSVM, balls kept (no weight) | 84.42 | nan | +1.60 | 28-0-7 | 0.000176 |
| Plain neighbour count | 85.88 | nan | +0.13 | 16-0-19 | 0.819 |

### noise 0.1 (35 datasets; Friedman chi2 = 114.01, p = 2.9e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 81.47 | 5.47 | +4.00 | 34-0-1 | 2.95e-07 |
| TSVM | 83.16 | 3.91 | +2.31 | 29-0-6 | 2.56e-05 |
| GBSVM | 76.29 | 5.66 | +9.18 | 33-1-1 | 4.37e-07 |
| LSTSVM | 82.09 | 5.41 | +3.38 | 33-0-2 | 8.21e-07 |
| GBLSTSVM | 83.63 | 3.56 | +1.84 | 25-0-10 | 0.00231 |
| LS-GBLSTSVM | 85.42 | 1.87 | +0.05 | 16-1-18 | 0.844 |
| Proposed | 85.47 | 2.11 | | | |
| Proposed without the regulariser | 85.42 | nan | +0.05 | 19-0-16 | 0.896 |
| LS-GBLSTSVM, balls kept (no weight) | 84.62 | nan | +0.85 | 25-0-10 | 0.00231 |
| GBFTSVM | 82.94 | nan | +2.53 | 23-0-12 | 0.00759 |
| GBLSTSVM, balls kept (no weight) | 83.63 | nan | +1.83 | 28-0-7 | 9.05e-05 |
| Plain neighbour count | 85.46 | nan | +0.01 | 16-0-19 | 0.987 |

### noise 0.15 (35 datasets; Friedman chi2 = 128.81, p = 2.3e-25)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 80.30 | 5.46 | +4.60 | 34-0-1 | 3.82e-07 |
| TSVM | 81.62 | 4.23 | +3.28 | 34-0-1 | 5.86e-07 |
| GBSVM | 75.43 | 5.83 | +9.46 | 35-0-0 | 2.48e-07 |
| LSTSVM | 80.62 | 5.37 | +4.28 | 34-0-1 | 4.94e-07 |
| GBLSTSVM | 83.07 | 3.47 | +1.83 | 26-1-8 | 0.00152 |
| LS-GBLSTSVM | 84.89 | 1.79 | +0.01 | 16-1-18 | 0.925 |
| Proposed | 84.90 | 1.86 | | | |
| Proposed without the regulariser | 84.73 | nan | +0.17 | 21-0-14 | 0.623 |
| LS-GBLSTSVM, balls kept (no weight) | 83.73 | nan | +1.17 | 27-0-8 | 0.00026 |
| GBFTSVM | 82.38 | nan | +2.52 | 24-0-11 | 0.0051 |
| GBLSTSVM, balls kept (no weight) | 82.57 | nan | +2.33 | 30-0-5 | 1.42e-05 |
| Plain neighbour count | 84.78 | nan | +0.12 | 19-0-16 | 0.844 |

### noise 0.2 (35 datasets; Friedman chi2 = 126.58, p = 6.7e-25)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.46 | 5.40 | +4.88 | 34-0-1 | 3.82e-07 |
| TSVM | 80.77 | 4.44 | +3.57 | 34-0-1 | 5.86e-07 |
| GBSVM | 73.81 | 5.93 | +10.53 | 34-0-1 | 2.7e-07 |
| LSTSVM | 80.02 | 5.17 | +4.32 | 34-0-1 | 2.7e-07 |
| GBLSTSVM | 82.41 | 3.34 | +1.93 | 25-0-10 | 0.00272 |
| LS-GBLSTSVM | 84.26 | 1.77 | +0.08 | 16-0-19 | 0.922 |
| Proposed | 84.34 | 1.94 | | | |
| Proposed without the regulariser | 84.09 | nan | +0.25 | 17-0-18 | 0.612 |
| LS-GBLSTSVM, balls kept (no weight) | 83.17 | nan | +1.17 | 26-0-9 | 0.000127 |
| GBFTSVM | 81.93 | nan | +2.41 | 24-0-11 | 0.0046 |
| GBLSTSVM, balls kept (no weight) | 82.05 | nan | +2.29 | 28-0-7 | 1.05e-05 |
| Plain neighbour count | 84.22 | nan | +0.12 | 18-0-17 | 0.819 |

## cv, accuracy

### noise 0 (35 datasets; Friedman chi2 = 44.52, p = 5.8e-08)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 83.22 | 2.73 | -1.82 | 8-1-26 | 0.00376 |
| TSVM | 81.92 | 3.34 | -0.52 | 14-0-21 | 0.235 |
| GBSVM | 68.56 | 5.69 | +12.84 | 29-0-6 | 3.41e-05 |
| LSTSVM | 81.01 | 3.80 | +0.39 | 16-0-19 | 0.974 |
| GBLSTSVM | 78.23 | 4.93 | +3.17 | 25-0-10 | 0.0055 |
| LS-GBLSTSVM | 81.45 | 3.64 | -0.05 | 17-0-18 | 1 |
| Proposed | 81.40 | 3.87 | | | |
| Proposed without the regulariser | 78.52 | nan | +2.87 | 27-0-8 | 0.00219 |
| LS-GBLSTSVM, balls kept (no weight) | 80.96 | nan | +0.43 | 19-2-14 | 0.235 |
| GBLSTSVM, balls kept (no weight) | 79.72 | nan | +1.68 | 24-0-11 | 0.0346 |
| Plain neighbour count | 79.03 | nan | +2.37 | 22-1-12 | 0.0152 |

### noise 0.05 (35 datasets; Friedman chi2 = 53.36, p = 9.9e-10)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.76 | 3.79 | +1.26 | 22-2-11 | 0.0358 |
| TSVM | 79.11 | 4.06 | +1.91 | 27-0-8 | 0.000429 |
| GBSVM | 70.26 | 5.63 | +10.76 | 29-0-6 | 1.05e-05 |
| LSTSVM | 79.41 | 3.80 | +1.62 | 24-0-11 | 0.00655 |
| GBLSTSVM | 77.77 | 5.17 | +3.25 | 29-2-4 | 0.000477 |
| LS-GBLSTSVM | 81.10 | 2.87 | -0.07 | 18-0-17 | 0.376 |
| Proposed | 81.02 | 2.69 | | | |
| Proposed without the regulariser | 78.41 | nan | +2.61 | 28-0-7 | 0.00026 |
| LS-GBLSTSVM, balls kept (no weight) | 79.76 | nan | +1.27 | 21-0-14 | 0.0161 |
| GBLSTSVM, balls kept (no weight) | 76.71 | nan | +4.31 | 31-0-4 | 1.47e-06 |
| Plain neighbour count | 77.44 | nan | +3.58 | 29-1-5 | 2.5e-05 |

### noise 0.1 (35 datasets; Friedman chi2 = 48.59, p = 9e-09)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 77.82 | 3.76 | +1.79 | 19-1-15 | 0.106 |
| TSVM | 77.74 | 3.70 | +1.87 | 26-0-9 | 0.000582 |
| GBSVM | 68.74 | 5.69 | +10.86 | 30-0-5 | 5.7e-06 |
| LSTSVM | 77.47 | 4.03 | +2.13 | 26-0-9 | 0.00157 |
| GBLSTSVM | 76.40 | 4.99 | +3.20 | 27-0-8 | 0.0051 |
| LS-GBLSTSVM | 80.01 | 3.23 | -0.41 | 25-0-10 | 0.0855 |
| Proposed | 79.60 | 2.61 | | | |
| Proposed without the regulariser | 76.00 | nan | +3.60 | 34-0-1 | 1.73e-06 |
| LS-GBLSTSVM, balls kept (no weight) | 77.55 | nan | +2.05 | 22-1-12 | 0.0101 |
| GBLSTSVM, balls kept (no weight) | 76.68 | nan | +2.92 | 30-0-5 | 0.000145 |
| Plain neighbour count | 76.38 | nan | +3.22 | 29-0-6 | 0.000176 |

### noise 0.15 (35 datasets; Friedman chi2 = 40.07, p = 4.4e-07)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 75.98 | 3.84 | +2.80 | 21-0-14 | 0.00797 |
| TSVM | 74.99 | 4.19 | +3.78 | 26-0-9 | 0.000176 |
| GBSVM | 64.15 | 5.46 | +14.63 | 31-0-4 | 1.59e-06 |
| LSTSVM | 75.82 | 3.76 | +2.95 | 22-2-11 | 0.00517 |
| GBLSTSVM | 74.32 | 4.84 | +4.46 | 28-0-7 | 0.000277 |
| LS-GBLSTSVM | 77.47 | 3.29 | +1.30 | 24-0-11 | 0.0406 |
| Proposed | 78.77 | 2.63 | | | |
| Proposed without the regulariser | 74.13 | nan | +4.65 | 31-0-4 | 8.93e-07 |
| LS-GBLSTSVM, balls kept (no weight) | 76.11 | nan | +2.67 | 24-1-10 | 0.00106 |
| GBLSTSVM, balls kept (no weight) | 74.48 | nan | +4.29 | 28-0-7 | 2.75e-05 |
| Plain neighbour count | 75.61 | nan | +3.16 | 29-0-6 | 3.41e-05 |

### noise 0.2 (35 datasets; Friedman chi2 = 68.59, p = 8e-13)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 74.42 | 3.47 | +3.50 | 25-0-10 | 0.00836 |
| TSVM | 73.14 | 4.06 | +4.78 | 30-0-5 | 2.96e-05 |
| GBSVM | 61.26 | 5.89 | +16.67 | 32-0-3 | 7.55e-07 |
| LSTSVM | 73.46 | 3.83 | +4.47 | 29-0-6 | 0.000403 |
| GBLSTSVM | 70.49 | 5.14 | +7.44 | 30-0-5 | 2.38e-05 |
| LS-GBLSTSVM | 75.13 | 3.56 | +2.79 | 27-0-8 | 0.00303 |
| Proposed | 77.92 | 2.06 | | | |
| Proposed without the regulariser | 73.69 | nan | +4.24 | 31-0-4 | 3.86e-06 |
| LS-GBLSTSVM, balls kept (no weight) | 73.81 | nan | +4.11 | 27-0-8 | 0.000516 |
| GBLSTSVM, balls kept (no weight) | 71.74 | nan | +6.18 | 28-1-6 | 9.5e-06 |
| Plain neighbour count | 72.63 | nan | +5.29 | 32-0-3 | 4.88e-06 |

## cv, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 105.17, p = 2.1e-20)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 81.01 | 2.31 | -2.97 | 6-0-29 | 7.38e-05 |
| TSVM | 80.32 | 2.64 | -2.29 | 12-0-23 | 0.00303 |
| GBSVM | 66.99 | 6.31 | +11.04 | 32-0-3 | 2.21e-06 |
| LSTSVM | 80.45 | 2.77 | -2.41 | 8-1-26 | 0.000781 |
| GBLSTSVM | 74.17 | 5.49 | +3.86 | 28-0-7 | 1.91e-05 |
| LS-GBLSTSVM | 76.93 | 4.51 | +1.10 | 20-0-15 | 0.238 |
| Proposed | 78.03 | 3.96 | | | |
| Proposed without the regulariser | 76.90 | nan | +1.13 | 21-0-14 | 0.105 |
| LS-GBLSTSVM, balls kept (no weight) | 78.61 | nan | -0.58 | 13-0-22 | 0.0596 |
| GBLSTSVM, balls kept (no weight) | 76.88 | nan | +1.15 | 20-0-15 | 0.19 |
| Plain neighbour count | 76.62 | nan | +1.41 | 22-0-13 | 0.105 |

### noise 0.05 (35 datasets; Friedman chi2 = 68.56, p = 8.1e-13)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.79 | 2.67 | -1.65 | 14-0-21 | 0.00921 |
| TSVM | 78.68 | 3.57 | -0.54 | 16-0-19 | 0.432 |
| GBSVM | 69.85 | 6.00 | +8.29 | 30-0-5 | 2.21e-05 |
| LSTSVM | 79.20 | 2.99 | -1.06 | 14-0-21 | 0.036 |
| GBLSTSVM | 75.11 | 5.40 | +3.03 | 27-0-8 | 0.000548 |
| LS-GBLSTSVM | 77.83 | 3.74 | +0.31 | 17-0-18 | 0.896 |
| Proposed | 78.14 | 3.63 | | | |
| Proposed without the regulariser | 76.88 | nan | +1.26 | 22-0-13 | 0.0596 |
| LS-GBLSTSVM, balls kept (no weight) | 78.06 | nan | +0.08 | 16-0-19 | 0.935 |
| GBLSTSVM, balls kept (no weight) | 75.89 | nan | +2.25 | 24-0-11 | 0.00415 |
| Plain neighbour count | 76.70 | nan | +1.44 | 21-0-14 | 0.0619 |

### noise 0.1 (35 datasets; Friedman chi2 = 66.48, p = 2.1e-12)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 78.75 | 2.80 | -1.25 | 13-0-22 | 0.0332 |
| TSVM | 77.87 | 3.11 | -0.38 | 13-0-22 | 0.326 |
| GBSVM | 69.24 | 5.87 | +8.26 | 29-0-6 | 1.65e-05 |
| LSTSVM | 77.93 | 3.04 | -0.43 | 14-0-21 | 0.11 |
| GBLSTSVM | 74.15 | 5.40 | +3.35 | 29-0-6 | 7.38e-05 |
| LS-GBLSTSVM | 76.48 | 4.23 | +1.02 | 23-0-12 | 0.0574 |
| Proposed | 77.50 | 3.54 | | | |
| Proposed without the regulariser | 75.80 | nan | +1.70 | 24-1-10 | 0.00466 |
| LS-GBLSTSVM, balls kept (no weight) | 77.00 | nan | +0.50 | 16-0-19 | 0.857 |
| GBLSTSVM, balls kept (no weight) | 75.27 | nan | +2.23 | 21-0-14 | 0.027 |
| Plain neighbour count | 75.43 | nan | +2.07 | 24-0-11 | 0.00688 |

### noise 0.15 (35 datasets; Friedman chi2 = 65.00, p = 4.3e-12)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 76.85 | 2.60 | -1.48 | 11-0-24 | 0.0153 |
| TSVM | 75.46 | 3.71 | -0.09 | 17-0-18 | 0.961 |
| GBSVM | 67.44 | 5.83 | +7.93 | 29-0-6 | 1.32e-05 |
| LSTSVM | 76.37 | 2.71 | -1.00 | 10-0-25 | 0.0375 |
| GBLSTSVM | 72.33 | 5.26 | +3.04 | 26-0-9 | 0.00112 |
| LS-GBLSTSVM | 74.59 | 4.09 | +0.78 | 19-0-16 | 0.326 |
| Proposed | 75.37 | 3.80 | | | |
| Proposed without the regulariser | 73.98 | nan | +1.39 | 20-0-15 | 0.0642 |
| LS-GBLSTSVM, balls kept (no weight) | 75.51 | nan | -0.13 | 14-0-21 | 0.768 |
| GBLSTSVM, balls kept (no weight) | 73.35 | nan | +2.02 | 25-0-10 | 0.00415 |
| Plain neighbour count | 74.22 | nan | +1.15 | 21-0-14 | 0.105 |

### noise 0.2 (35 datasets; Friedman chi2 = 84.71, p = 3.8e-16)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 75.21 | 2.66 | +0.04 | 17-0-18 | 0.909 |
| TSVM | 74.53 | 3.11 | +0.72 | 19-0-16 | 0.291 |
| GBSVM | 65.56 | 6.11 | +9.70 | 33-0-2 | 3.82e-07 |
| LSTSVM | 74.32 | 3.39 | +0.94 | 22-1-12 | 0.122 |
| GBLSTSVM | 69.99 | 5.51 | +5.27 | 28-0-7 | 8.38e-06 |
| LS-GBLSTSVM | 72.85 | 4.40 | +2.41 | 27-0-8 | 0.00112 |
| Proposed | 75.26 | 2.81 | | | |
| Proposed without the regulariser | 73.03 | nan | +2.22 | 28-0-7 | 3.18e-05 |
| LS-GBLSTSVM, balls kept (no weight) | 74.14 | nan | +1.12 | 21-0-14 | 0.112 |
| GBLSTSVM, balls kept (no weight) | 71.82 | nan | +3.43 | 23-1-11 | 0.00028 |
| Plain neighbour count | 72.77 | nan | +2.49 | 25-0-10 | 0.000277 |
