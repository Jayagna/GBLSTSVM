# Paper tables

## oracle, accuracy

### noise 0 (35 datasets; Friedman chi2 = 87.92, p = 8.2e-17)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 88.53 | 4.87 | +1.00 | 31-1-3 | 0.000133 |
| TSVM | 88.59 | 4.21 | +0.94 | 31-0-4 | 0.000111 |
| GBSVM | 84.96 | 5.40 | +4.58 | 33-0-2 | 6.38e-07 |
| LSTSVM | 88.21 | 5.26 | +1.32 | 33-0-2 | 1.25e-06 |
| GBLSTSVM | 88.08 | 4.07 | +1.45 | 29-0-6 | 6e-05 |
| LS-GBLSTSVM | 89.50 | 2.31 | +0.03 | 22-0-13 | 0.143 |
| Proposed | 89.53 | 1.87 | | | |
| GBFTSVM | 87.09 | nan | +2.44 | 31-1-3 | 8.44e-06 |
| GBLSTSVM, balls kept (no weight) | 88.95 | nan | +0.59 | 30-2-3 | 2.73e-06 |
| Plain neighbour count | 89.50 | nan | +0.03 | 18-3-14 | 0.374 |

### noise 0.05 (35 datasets; Friedman chi2 = 95.38, p = 2.3e-18)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 87.91 | 5.36 | +1.34 | 31-1-3 | 4.9e-05 |
| TSVM | 88.61 | 3.90 | +0.64 | 31-0-4 | 0.000657 |
| GBSVM | 85.11 | 5.23 | +4.14 | 30-0-5 | 4.88e-06 |
| LSTSVM | 88.05 | 5.46 | +1.20 | 33-0-2 | 2.56e-05 |
| GBLSTSVM | 87.98 | 3.83 | +1.27 | 29-2-4 | 3.02e-05 |
| LS-GBLSTSVM | 89.30 | 2.33 | -0.06 | 22-2-11 | 0.183 |
| Proposed | 89.25 | 1.90 | | | |
| GBFTSVM | 86.63 | nan | +2.61 | 29-1-5 | 1.07e-05 |
| GBLSTSVM, balls kept (no weight) | 88.45 | nan | +0.80 | 33-1-1 | 4.37e-07 |
| Plain neighbour count | 89.30 | nan | -0.05 | 8-7-20 | 0.119 |

### noise 0.1 (35 datasets; Friedman chi2 = 105.36, p = 1.9e-20)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 87.08 | 5.50 | +2.09 | 32-0-3 | 2.03e-06 |
| TSVM | 88.23 | 4.14 | +0.94 | 32-0-3 | 2.38e-05 |
| GBSVM | 84.87 | 5.17 | +4.30 | 30-0-5 | 1.59e-06 |
| LSTSVM | 87.56 | 5.44 | +1.62 | 34-0-1 | 7.55e-07 |
| GBLSTSVM | 87.93 | 3.81 | +1.24 | 29-0-6 | 0.000286 |
| LS-GBLSTSVM | 89.20 | 1.99 | -0.03 | 19-2-14 | 0.218 |
| Proposed | 89.17 | 1.94 | | | |
| GBFTSVM | 86.85 | nan | +2.33 | 29-0-6 | 3.18e-05 |
| GBLSTSVM, balls kept (no weight) | 88.27 | nan | +0.90 | 33-1-1 | 3.99e-07 |
| Plain neighbour count | 89.16 | nan | +0.01 | 15-4-16 | 0.814 |

### noise 0.15 (35 datasets; Friedman chi2 = 118.48, p = 3.4e-23)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.47 | 5.60 | +2.36 | 32-1-2 | 1.49e-06 |
| TSVM | 87.59 | 4.30 | +1.24 | 32-1-2 | 3.75e-06 |
| GBSVM | 84.58 | 5.51 | +4.26 | 32-2-1 | 1.02e-06 |
| LSTSVM | 87.14 | 5.30 | +1.70 | 34-1-0 | 3.65e-07 |
| GBLSTSVM | 87.52 | 3.47 | +1.31 | 30-1-4 | 3.64e-05 |
| LS-GBLSTSVM | 88.87 | 2.16 | -0.03 | 24-0-11 | 0.138 |
| Proposed | 88.84 | 1.66 | | | |
| GBFTSVM | 86.61 | nan | +2.23 | 29-0-6 | 4.22e-05 |
| GBLSTSVM, balls kept (no weight) | 87.93 | nan | +0.90 | 34-0-1 | 1.47e-06 |
| Plain neighbour count | 88.90 | nan | -0.06 | 14-7-14 | 0.776 |

### noise 0.2 (35 datasets; Friedman chi2 = 115.14, p = 1.7e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.17 | 5.60 | +2.44 | 33-0-2 | 4.34e-07 |
| TSVM | 87.07 | 4.37 | +1.54 | 34-0-1 | 1.15e-06 |
| GBSVM | 83.97 | 5.66 | +4.64 | 32-1-2 | 6.23e-07 |
| LSTSVM | 86.79 | 5.00 | +1.82 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 87.06 | 3.53 | +1.55 | 28-0-7 | 0.000236 |
| LS-GBLSTSVM | 88.66 | 2.07 | -0.05 | 20-1-14 | 0.51 |
| Proposed | 88.61 | 1.77 | | | |
| GBFTSVM | 86.50 | nan | +2.11 | 31-0-4 | 3.94e-05 |
| GBLSTSVM, balls kept (no weight) | 87.49 | nan | +1.12 | 31-1-3 | 6.24e-07 |
| Plain neighbour count | 88.67 | nan | -0.06 | 13-4-18 | 0.666 |

### noise 0.3 (16 datasets; Friedman chi2 = 48.70, p = 8.6e-09)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 83.74 | 4.78 | +2.08 | 15-0-1 | 0.00112 |
| TSVM | 82.70 | 4.88 | +3.12 | 16-0-0 | 3.05e-05 |
| GBSVM | 79.36 | 5.72 | +6.46 | 14-0-2 | 0.000153 |
| LSTSVM | 82.47 | 5.00 | +3.35 | 16-0-0 | 3.05e-05 |
| GBLSTSVM | 82.62 | 3.81 | +3.20 | 13-0-3 | 0.00418 |
| LS-GBLSTSVM | 85.47 | 2.09 | +0.35 | 10-1-5 | 0.394 |
| Proposed | 85.82 | 1.72 | | | |
| GBFTSVM | 82.63 | nan | +3.19 | 13-0-3 | 0.00763 |
| GBLSTSVM, balls kept (no weight) | 83.38 | nan | +2.44 | 16-0-0 | 3.05e-05 |
| Plain neighbour count | 85.39 | nan | +0.43 | 8-1-7 | 0.173 |

## oracle, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 85.18, p = 3e-16)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 83.70 | 5.14 | +2.67 | 31-0-4 | 1.22e-05 |
| TSVM | 84.79 | 3.60 | +1.58 | 28-0-7 | 0.000548 |
| GBSVM | 75.36 | 5.94 | +11.01 | 33-0-2 | 4.54e-07 |
| LSTSVM | 84.04 | 4.74 | +2.33 | 29-0-6 | 4.17e-06 |
| GBLSTSVM | 83.70 | 3.89 | +2.67 | 29-0-6 | 0.000104 |
| LS-GBLSTSVM | 85.66 | 2.51 | +0.71 | 19-0-16 | 0.245 |
| Proposed | 86.37 | 2.17 | | | |
| GBFTSVM | 81.26 | nan | +5.11 | 30-0-5 | 3.86e-06 |
| GBLSTSVM, balls kept (no weight) | 85.40 | nan | +0.97 | 31-0-4 | 9.76e-06 |
| Plain neighbour count | 86.49 | nan | -0.12 | 15-0-20 | 0.159 |

### noise 0.05 (35 datasets; Friedman chi2 = 105.32, p = 1.9e-20)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 82.62 | 5.39 | +3.12 | 32-0-3 | 7.76e-06 |
| TSVM | 84.04 | 3.84 | +1.70 | 30-0-5 | 0.000111 |
| GBSVM | 76.64 | 5.64 | +9.11 | 31-0-4 | 1.47e-06 |
| LSTSVM | 83.03 | 5.46 | +2.72 | 33-0-2 | 2.59e-06 |
| GBLSTSVM | 83.89 | 3.39 | +1.86 | 22-1-12 | 0.0135 |
| LS-GBLSTSVM | 85.58 | 2.13 | +0.16 | 21-0-14 | 0.612 |
| Proposed | 85.75 | 2.16 | | | |
| GBFTSVM | 82.18 | nan | +3.56 | 25-0-10 | 0.000937 |
| GBLSTSVM, balls kept (no weight) | 84.42 | nan | +1.33 | 33-0-2 | 3.29e-06 |
| Plain neighbour count | 85.88 | nan | -0.14 | 15-0-20 | 0.12 |

### noise 0.1 (35 datasets; Friedman chi2 = 109.82, p = 2.2e-21)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 81.47 | 5.41 | +3.95 | 32-0-3 | 1.25e-06 |
| TSVM | 83.16 | 3.97 | +2.26 | 31-0-4 | 1.22e-05 |
| GBSVM | 76.29 | 5.59 | +9.13 | 31-0-4 | 8.21e-07 |
| LSTSVM | 82.09 | 5.41 | +3.32 | 33-0-2 | 6.94e-07 |
| GBLSTSVM | 83.63 | 3.59 | +1.79 | 26-0-9 | 0.00231 |
| LS-GBLSTSVM | 85.42 | 1.83 | -0.00 | 15-0-20 | 0.404 |
| Proposed | 85.42 | 2.20 | | | |
| GBFTSVM | 82.94 | nan | +2.48 | 24-0-11 | 0.0032 |
| GBLSTSVM, balls kept (no weight) | 83.63 | nan | +1.78 | 33-0-2 | 1.06e-06 |
| Plain neighbour count | 85.46 | nan | -0.04 | 15-1-19 | 0.567 |

### noise 0.15 (35 datasets; Friedman chi2 = 121.08, p = 9.7e-24)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 80.30 | 5.40 | +4.43 | 32-0-3 | 1.06e-06 |
| TSVM | 81.62 | 4.20 | +3.11 | 33-0-2 | 7.55e-07 |
| GBSVM | 75.43 | 5.77 | +9.29 | 33-0-2 | 4.17e-07 |
| LSTSVM | 80.62 | 5.37 | +4.11 | 34-0-1 | 2.7e-07 |
| GBLSTSVM | 83.07 | 3.46 | +1.66 | 26-0-9 | 0.000188 |
| LS-GBLSTSVM | 84.89 | 1.83 | -0.16 | 18-0-17 | 0.432 |
| Proposed | 84.73 | 1.97 | | | |
| GBFTSVM | 82.38 | nan | +2.35 | 26-0-9 | 0.00157 |
| GBLSTSVM, balls kept (no weight) | 82.57 | nan | +2.16 | 34-0-1 | 3.51e-07 |
| Plain neighbour count | 84.78 | nan | -0.05 | 15-2-18 | 0.611 |

### noise 0.2 (35 datasets; Friedman chi2 = 125.45, p = 1.2e-24)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.46 | 5.37 | +4.64 | 33-0-2 | 4.17e-07 |
| TSVM | 80.77 | 4.44 | +3.33 | 34-0-1 | 4.94e-07 |
| GBSVM | 73.81 | 5.91 | +10.28 | 33-1-1 | 4.78e-07 |
| LSTSVM | 80.02 | 5.20 | +4.07 | 35-0-0 | 2.47e-07 |
| GBLSTSVM | 82.41 | 3.33 | +1.69 | 24-1-10 | 0.00285 |
| LS-GBLSTSVM | 84.26 | 1.74 | -0.17 | 15-0-20 | 0.432 |
| Proposed | 84.09 | 2.00 | | | |
| GBFTSVM | 81.93 | nan | +2.17 | 26-0-9 | 0.00186 |
| GBLSTSVM, balls kept (no weight) | 82.05 | nan | +2.05 | 34-0-1 | 2.95e-07 |
| Plain neighbour count | 84.22 | nan | -0.13 | 18-0-17 | 0.781 |

### noise 0.3 (16 datasets; Friedman chi2 = 62.99, p = 1.1e-11)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 77.45 | 4.12 | +4.45 | 15-0-1 | 0.000153 |
| TSVM | 76.44 | 4.62 | +5.47 | 16-0-0 | 3.05e-05 |
| GBSVM | 67.74 | 6.31 | +14.17 | 15-0-1 | 6.1e-05 |
| LSTSVM | 75.79 | 5.62 | +6.12 | 16-0-0 | 3.05e-05 |
| GBLSTSVM | 78.10 | 3.75 | +3.81 | 14-0-2 | 0.00168 |
| LS-GBLSTSVM | 81.62 | 1.97 | +0.29 | 10-1-5 | 0.496 |
| Proposed | 81.91 | 1.59 | | | |
| GBFTSVM | 78.30 | nan | +3.60 | 13-0-3 | 0.00269 |
| GBLSTSVM, balls kept (no weight) | 78.58 | nan | +3.32 | 16-0-0 | 3.05e-05 |
| Plain neighbour count | 81.38 | nan | +0.52 | 12-0-4 | 0.0577 |

## cv, accuracy

## cv, balanced_accuracy
