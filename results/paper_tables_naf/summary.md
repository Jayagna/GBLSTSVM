# Paper tables

## oracle, accuracy

### noise 0 (35 datasets; Friedman chi2 = 81.86, p = 1.5e-15)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 88.53 | 4.81 | +0.97 | 29-1-5 | 0.000245 |
| TSVM | 88.59 | 4.16 | +0.91 | 29-0-6 | 0.000176 |
| GBSVM | 84.96 | 5.40 | +4.55 | 33-0-2 | 9.71e-07 |
| LSTSVM | 88.21 | 5.23 | +1.29 | 32-0-3 | 1.59e-06 |
| GBLSTSVM | 88.08 | 4.07 | +1.42 | 27-4-4 | 2.52e-05 |
| LS-GBLSTSVM | 89.50 | 2.24 | -0.00 | 19-1-15 | 0.289 |
| Proposed | 89.50 | 2.09 | | | |
| GBLSTSVM, balls kept (no weight) | 88.95 | nan | +0.56 | 31-0-4 | 2.8e-06 |
| FKNN-LSTSVM | 88.87 | nan | +0.63 | 30-1-4 | 0.000108 |
| GBFTSVM | 87.09 | nan | +2.41 | 31-1-3 | 5.21e-06 |
| Proposed without the regulariser | 89.53 | nan | -0.03 | 14-3-18 | 0.374 |
| Proposed | 89.94 | nan | -0.44 | 9-3-23 | 0.00364 |

### noise 0.05 (35 datasets; Friedman chi2 = 94.40, p = 3.7e-18)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 87.91 | 5.31 | +1.39 | 30-0-5 | 2.56e-05 |
| TSVM | 88.61 | 3.90 | +0.69 | 31-0-4 | 0.000228 |
| GBSVM | 85.11 | 5.27 | +4.19 | 31-1-3 | 2.92e-06 |
| LSTSVM | 88.05 | 5.44 | +1.25 | 32-1-2 | 5.2e-06 |
| GBLSTSVM | 87.98 | 3.83 | +1.33 | 30-0-5 | 1.14e-05 |
| LS-GBLSTSVM | 89.30 | 2.30 | -0.00 | 21-2-12 | 0.14 |
| Proposed | 89.30 | 1.94 | | | |
| GBLSTSVM, balls kept (no weight) | 88.45 | nan | +0.86 | 34-0-1 | 2.7e-07 |
| FKNN-LSTSVM | 88.70 | nan | +0.60 | 29-1-5 | 0.0002 |
| GBFTSVM | 86.63 | nan | +2.67 | 31-0-4 | 3.86e-06 |
| Proposed without the regulariser | 89.25 | nan | +0.05 | 20-7-8 | 0.119 |
| Proposed | 89.78 | nan | -0.48 | 10-3-22 | 0.00708 |

### noise 0.1 (35 datasets; Friedman chi2 = 109.07, p = 3.2e-21)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 87.08 | 5.53 | +2.08 | 33-0-2 | 1.35e-06 |
| TSVM | 88.23 | 4.16 | +0.92 | 32-1-2 | 1.07e-05 |
| GBSVM | 84.87 | 5.17 | +4.29 | 30-0-5 | 1.25e-06 |
| LSTSVM | 87.56 | 5.44 | +1.60 | 34-0-1 | 3.82e-07 |
| GBLSTSVM | 87.93 | 3.87 | +1.22 | 30-2-3 | 2.2e-05 |
| LS-GBLSTSVM | 89.20 | 1.99 | -0.05 | 18-4-13 | 0.451 |
| Proposed | 89.16 | 1.84 | | | |
| GBLSTSVM, balls kept (no weight) | 88.27 | nan | +0.89 | 35-0-0 | 2.48e-07 |
| FKNN-LSTSVM | 88.54 | nan | +0.61 | 29-0-6 | 2.96e-05 |
| GBFTSVM | 86.85 | nan | +2.31 | 30-1-4 | 4.42e-06 |
| Proposed without the regulariser | 89.17 | nan | -0.01 | 16-4-15 | 0.814 |
| Proposed | 89.53 | nan | -0.37 | 10-1-24 | 0.012 |

### noise 0.15 (35 datasets; Friedman chi2 = 120.98, p = 1e-23)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.47 | 5.61 | +2.43 | 33-0-2 | 1.05e-06 |
| TSVM | 87.59 | 4.31 | +1.31 | 33-0-2 | 3.82e-07 |
| GBSVM | 84.58 | 5.51 | +4.32 | 33-0-2 | 6.94e-07 |
| LSTSVM | 87.14 | 5.31 | +1.76 | 35-0-0 | 2.47e-07 |
| GBLSTSVM | 87.52 | 3.49 | +1.37 | 31-0-4 | 1.53e-05 |
| LS-GBLSTSVM | 88.87 | 2.14 | +0.03 | 22-3-10 | 0.172 |
| Proposed | 88.90 | 1.61 | | | |
| GBLSTSVM, balls kept (no weight) | 87.93 | nan | +0.97 | 34-0-1 | 4.54e-07 |
| FKNN-LSTSVM | 88.27 | nan | +0.63 | 31-0-4 | 1.42e-05 |
| GBFTSVM | 86.61 | nan | +2.29 | 33-0-2 | 5.7e-06 |
| Proposed without the regulariser | 88.84 | nan | +0.06 | 14-7-14 | 0.776 |
| Proposed | 89.26 | nan | -0.36 | 11-2-22 | 0.0697 |

### noise 0.2 (35 datasets; Friedman chi2 = 117.95, p = 4.4e-23)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.17 | 5.63 | +2.49 | 34-0-1 | 8.21e-07 |
| TSVM | 87.07 | 4.37 | +1.60 | 34-0-1 | 4.16e-07 |
| GBSVM | 83.97 | 5.67 | +4.70 | 32-2-1 | 9.35e-07 |
| LSTSVM | 86.79 | 5.00 | +1.87 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 87.06 | 3.54 | +1.60 | 27-3-5 | 0.000147 |
| LS-GBLSTSVM | 88.66 | 2.06 | +0.01 | 19-2-14 | 0.649 |
| Proposed | 88.67 | 1.73 | | | |
| GBLSTSVM, balls kept (no weight) | 87.49 | nan | +1.18 | 32-1-2 | 4.77e-07 |
| FKNN-LSTSVM | 87.94 | nan | +0.72 | 32-0-3 | 1.78e-05 |
| GBFTSVM | 86.50 | nan | +2.16 | 28-0-7 | 2.85e-05 |
| Proposed without the regulariser | 88.61 | nan | +0.06 | 18-4-13 | 0.666 |
| Proposed | 89.04 | nan | -0.37 | 12-0-23 | 0.0218 |

### noise 0.3 (35 datasets; Friedman chi2 = 111.61, p = 9.4e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 85.39 | 5.37 | +2.07 | 32-1-2 | 4.8e-06 |
| TSVM | 85.33 | 4.70 | +2.13 | 33-1-1 | 3.99e-07 |
| GBSVM | 83.09 | 5.81 | +4.37 | 31-1-3 | 2.69e-06 |
| LSTSVM | 85.27 | 4.69 | +2.19 | 34-1-0 | 3.65e-07 |
| GBLSTSVM | 85.56 | 3.56 | +1.90 | 28-2-5 | 6.76e-05 |
| LS-GBLSTSVM | 87.41 | 2.06 | +0.05 | 20-1-14 | 0.632 |
| Proposed | 87.46 | 1.81 | | | |
| GBLSTSVM, balls kept (no weight) | 86.08 | nan | +1.38 | 32-2-1 | 6.48e-07 |
| FKNN-LSTSVM | 86.64 | nan | +0.82 | 30-1-4 | 8.12e-05 |
| GBFTSVM | 85.12 | nan | +2.34 | 27-0-8 | 0.000104 |
| Proposed without the regulariser | 87.68 | nan | -0.22 | 13-6-16 | 0.133 |
| Proposed | 88.10 | nan | -0.64 | 10-2-23 | 0.00546 |

## oracle, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 85.04, p = 3.2e-16)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 83.70 | 5.09 | +2.80 | 29-0-6 | 2.06e-05 |
| TSVM | 84.79 | 3.60 | +1.71 | 28-0-7 | 0.000155 |
| GBSVM | 75.36 | 5.94 | +11.13 | 33-0-2 | 4.54e-07 |
| LSTSVM | 84.04 | 4.80 | +2.46 | 31-0-4 | 2.81e-06 |
| GBLSTSVM | 83.70 | 3.89 | +2.79 | 29-0-6 | 6e-05 |
| LS-GBLSTSVM | 85.66 | 2.54 | +0.83 | 20-0-15 | 0.28 |
| Proposed | 86.49 | 2.14 | | | |
| GBLSTSVM, balls kept (no weight) | 85.40 | nan | +1.09 | 31-0-4 | 2.81e-06 |
| FKNN-LSTSVM | 85.05 | nan | +1.44 | 30-0-5 | 4.86e-05 |
| GBFTSVM | 81.26 | nan | +5.23 | 31-0-4 | 3.29e-06 |
| Proposed without the regulariser | 86.37 | nan | +0.12 | 20-0-15 | 0.159 |
| Proposed | 86.72 | nan | -0.23 | 13-0-22 | 0.334 |

### noise 0.05 (35 datasets; Friedman chi2 = 105.67, p = 1.6e-20)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 82.62 | 5.36 | +3.26 | 31-0-4 | 6.66e-06 |
| TSVM | 84.04 | 3.87 | +1.84 | 31-0-4 | 2.06e-05 |
| GBSVM | 76.64 | 5.67 | +9.24 | 32-0-3 | 1.25e-06 |
| LSTSVM | 83.03 | 5.43 | +2.85 | 32-0-3 | 1.73e-06 |
| GBLSTSVM | 83.89 | 3.43 | +2.00 | 24-0-11 | 0.0032 |
| LS-GBLSTSVM | 85.58 | 2.04 | +0.30 | 18-0-17 | 0.481 |
| Proposed | 85.88 | 2.20 | | | |
| GBLSTSVM, balls kept (no weight) | 84.42 | nan | +1.47 | 34-0-1 | 1.88e-06 |
| FKNN-LSTSVM | 84.47 | nan | +1.41 | 30-0-5 | 9.05e-05 |
| GBFTSVM | 82.18 | nan | +3.70 | 26-0-9 | 0.000135 |
| Proposed without the regulariser | 85.75 | nan | +0.14 | 20-0-15 | 0.12 |
| Proposed | 85.99 | nan | -0.11 | 20-0-15 | 0.793 |

### noise 0.1 (35 datasets; Friedman chi2 = 115.32, p = 1.6e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 81.47 | 5.44 | +3.99 | 33-0-2 | 1.15e-06 |
| TSVM | 83.16 | 3.97 | +2.30 | 31-0-4 | 4.17e-06 |
| GBSVM | 76.29 | 5.61 | +9.17 | 32-0-3 | 6.38e-07 |
| LSTSVM | 82.09 | 5.44 | +3.37 | 34-0-1 | 5.38e-07 |
| GBLSTSVM | 83.63 | 3.64 | +1.83 | 28-0-7 | 0.000334 |
| LS-GBLSTSVM | 85.42 | 1.86 | +0.04 | 16-0-19 | 0.647 |
| Proposed | 85.46 | 2.03 | | | |
| GBLSTSVM, balls kept (no weight) | 83.63 | nan | +1.83 | 34-0-1 | 2.7e-07 |
| FKNN-LSTSVM | 83.92 | nan | +1.55 | 31-0-4 | 9.76e-06 |
| GBFTSVM | 82.94 | nan | +2.52 | 26-0-9 | 0.000314 |
| Proposed without the regulariser | 85.42 | nan | +0.04 | 19-1-15 | 0.567 |
| Proposed | 85.48 | nan | -0.02 | 19-0-16 | 0.909 |

### noise 0.15 (35 datasets; Friedman chi2 = 122.25, p = 5.5e-24)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 80.30 | 5.43 | +4.48 | 33-0-2 | 1.35e-06 |
| TSVM | 81.62 | 4.20 | +3.16 | 33-0-2 | 3.82e-07 |
| GBSVM | 75.43 | 5.74 | +9.34 | 32-0-3 | 4.94e-07 |
| LSTSVM | 80.62 | 5.37 | +4.16 | 34-0-1 | 2.7e-07 |
| GBLSTSVM | 83.07 | 3.51 | +1.71 | 28-0-7 | 0.000119 |
| LS-GBLSTSVM | 84.89 | 1.83 | -0.11 | 18-0-17 | 0.876 |
| Proposed | 84.78 | 1.91 | | | |
| GBLSTSVM, balls kept (no weight) | 82.57 | nan | +2.21 | 34-0-1 | 2.7e-07 |
| FKNN-LSTSVM | 83.15 | nan | +1.62 | 32-0-3 | 1.22e-05 |
| GBFTSVM | 82.38 | nan | +2.40 | 28-1-6 | 0.000175 |
| Proposed without the regulariser | 84.73 | nan | +0.05 | 18-2-15 | 0.611 |
| Proposed | 84.82 | nan | -0.05 | 16-0-19 | 0.948 |

### noise 0.2 (35 datasets; Friedman chi2 = 125.79, p = 9.9e-25)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.46 | 5.40 | +4.76 | 34-0-1 | 4.17e-07 |
| TSVM | 80.77 | 4.44 | +3.45 | 34-0-1 | 3.22e-07 |
| GBSVM | 73.81 | 5.87 | +10.41 | 32-0-3 | 4.54e-07 |
| LSTSVM | 80.02 | 5.20 | +4.20 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 82.41 | 3.40 | +1.81 | 27-0-8 | 0.000429 |
| LS-GBLSTSVM | 84.26 | 1.79 | -0.04 | 16-1-18 | 0.752 |
| Proposed | 84.22 | 1.90 | | | |
| GBLSTSVM, balls kept (no weight) | 82.05 | nan | +2.17 | 34-0-1 | 2.95e-07 |
| FKNN-LSTSVM | 82.29 | nan | +1.93 | 31-0-4 | 2.39e-06 |
| GBFTSVM | 81.93 | nan | +2.29 | 28-0-7 | 0.000403 |
| Proposed without the regulariser | 84.09 | nan | +0.13 | 17-0-18 | 0.781 |
| Proposed | 84.32 | nan | -0.10 | 18-0-17 | 0.87 |

### noise 0.3 (35 datasets; Friedman chi2 = 133.62, p = 2.2e-26)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 76.05 | 4.89 | +6.11 | 33-0-2 | 7.55e-07 |
| TSVM | 76.21 | 4.77 | +5.96 | 34-0-1 | 2.7e-07 |
| GBSVM | 69.19 | 6.20 | +12.97 | 33-0-2 | 4.17e-07 |
| LSTSVM | 76.28 | 5.20 | +5.88 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 79.85 | 3.36 | +2.31 | 29-0-6 | 0.000356 |
| LS-GBLSTSVM | 82.48 | 1.79 | -0.32 | 18-0-17 | 0.658 |
| Proposed | 82.16 | 1.80 | | | |
| GBLSTSVM, balls kept (no weight) | 79.31 | nan | +2.86 | 35-0-0 | 2.48e-07 |
| FKNN-LSTSVM | 79.52 | nan | +2.64 | 32-0-3 | 3.56e-06 |
| GBFTSVM | 79.61 | nan | +2.56 | 28-0-7 | 0.000228 |
| Proposed without the regulariser | 82.33 | nan | -0.17 | 13-0-22 | 0.35 |
| Proposed | 82.67 | nan | -0.50 | 15-0-20 | 0.196 |

## cv, accuracy

### noise 0 (35 datasets; Friedman chi2 = 48.98, p = 7.5e-09)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 83.22 | 2.63 | -4.18 | 5-0-30 | 2.56e-05 |
| TSVM | 81.92 | 3.27 | -2.88 | 11-1-23 | 0.00301 |
| GBSVM | 68.56 | 5.63 | +10.47 | 27-0-8 | 0.000201 |
| LSTSVM | 81.01 | 3.66 | -1.98 | 11-0-24 | 0.0175 |
| GBLSTSVM | 78.23 | 4.81 | +0.80 | 21-0-14 | 0.31 |
| LS-GBLSTSVM | 81.45 | 3.41 | -2.42 | 9-0-26 | 0.00355 |
| Proposed | 79.03 | 4.59 | | | |
| GBLSTSVM, balls kept (no weight) | 79.72 | nan | -0.69 | 18-0-17 | 0.422 |
| Proposed without the regulariser | 78.52 | nan | +0.51 | 18-1-16 | 0.293 |
| Proposed | 81.64 | nan | -2.60 | 11-0-24 | 0.00303 |

### noise 0.05 (35 datasets; Friedman chi2 = 44.23, p = 6.7e-08)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.76 | 3.53 | -2.32 | 14-0-21 | 0.0553 |
| TSVM | 79.11 | 3.63 | -1.67 | 12-0-23 | 0.0475 |
| GBSVM | 70.26 | 5.54 | +7.18 | 26-0-9 | 0.00258 |
| LSTSVM | 79.41 | 3.40 | -1.96 | 10-0-25 | 0.0101 |
| GBLSTSVM | 77.77 | 4.80 | -0.33 | 17-0-18 | 0.974 |
| LS-GBLSTSVM | 81.10 | 2.61 | -3.65 | 9-0-26 | 0.0014 |
| Proposed | 77.44 | 4.49 | | | |
| GBLSTSVM, balls kept (no weight) | 76.71 | nan | +0.73 | 21-1-13 | 0.0858 |
| Proposed without the regulariser | 78.41 | nan | -0.97 | 11-1-23 | 0.11 |
| Proposed | 80.96 | nan | -3.52 | 6-0-29 | 6.43e-05 |

### noise 0.1 (35 datasets; Friedman chi2 = 40.45, p = 3.7e-07)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 77.82 | 3.63 | -1.44 | 15-0-20 | 0.342 |
| TSVM | 77.74 | 3.36 | -1.35 | 14-0-21 | 0.0716 |
| GBSVM | 68.74 | 5.57 | +7.64 | 26-0-9 | 0.00219 |
| LSTSVM | 77.47 | 3.60 | -1.09 | 11-0-24 | 0.132 |
| GBLSTSVM | 76.40 | 4.83 | -0.02 | 21-1-13 | 0.688 |
| LS-GBLSTSVM | 80.01 | 2.79 | -3.63 | 9-1-25 | 0.0017 |
| Proposed | 76.38 | 4.23 | | | |
| GBLSTSVM, balls kept (no weight) | 76.68 | nan | -0.30 | 16-0-19 | 0.909 |
| Proposed without the regulariser | 76.00 | nan | +0.38 | 18-2-15 | 0.348 |
| Proposed | 79.66 | nan | -3.27 | 4-1-30 | 0.000175 |

### noise 0.15 (35 datasets; Friedman chi2 = 28.52, p = 7.5e-05)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 75.98 | 3.73 | -0.36 | 17-0-18 | 0.743 |
| TSVM | 74.99 | 3.99 | +0.62 | 18-2-15 | 0.823 |
| GBSVM | 64.15 | 5.34 | +11.47 | 27-0-8 | 5.59e-05 |
| LSTSVM | 75.82 | 3.44 | -0.21 | 12-0-23 | 0.101 |
| GBLSTSVM | 74.32 | 4.66 | +1.30 | 21-1-13 | 0.18 |
| LS-GBLSTSVM | 77.47 | 2.91 | -1.86 | 11-0-24 | 0.0223 |
| Proposed | 75.61 | 3.93 | | | |
| GBLSTSVM, balls kept (no weight) | 74.48 | nan | +1.13 | 21-1-13 | 0.122 |
| Proposed without the regulariser | 74.13 | nan | +1.49 | 20-0-15 | 0.225 |
| Proposed | 79.01 | nan | -3.39 | 6-0-29 | 1.78e-05 |

### noise 0.2 (35 datasets; Friedman chi2 = 44.06, p = 7.2e-08)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 74.42 | 3.10 | -1.79 | 12-0-23 | 0.199 |
| TSVM | 73.14 | 3.63 | -0.51 | 15-0-20 | 0.132 |
| GBSVM | 61.26 | 5.71 | +11.37 | 26-0-9 | 0.000201 |
| LSTSVM | 73.46 | 3.47 | -0.83 | 16-1-18 | 0.326 |
| GBLSTSVM | 70.49 | 4.91 | +2.14 | 22-0-13 | 0.027 |
| LS-GBLSTSVM | 75.13 | 3.07 | -2.50 | 10-0-25 | 0.0134 |
| Proposed | 72.63 | 4.10 | | | |
| GBLSTSVM, balls kept (no weight) | 71.74 | nan | +0.89 | 21-0-14 | 0.258 |
| Proposed without the regulariser | 73.69 | nan | -1.06 | 14-0-21 | 0.159 |
| Proposed | 77.83 | nan | -5.20 | 4-0-31 | 1.53e-05 |

### noise 0.3 (35 datasets; Friedman chi2 = 60.88, p = 3e-11)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 72.20 | 2.26 | -4.72 | 9-0-26 | 0.0014 |
| TSVM | 65.52 | 3.99 | +1.97 | 18-0-17 | 0.225 |
| GBSVM | 52.50 | 5.89 | +14.98 | 28-0-7 | 9.05e-05 |
| LSTSVM | 66.05 | 4.24 | +1.43 | 21-0-14 | 0.0997 |
| GBLSTSVM | 64.06 | 4.77 | +3.42 | 24-0-11 | 0.00723 |
| LS-GBLSTSVM | 70.03 | 3.10 | -2.55 | 13-1-21 | 0.144 |
| Proposed | 67.48 | 3.76 | | | |
| GBLSTSVM, balls kept (no weight) | 64.97 | nan | +2.51 | 23-1-11 | 0.0179 |
| Proposed without the regulariser | 66.46 | nan | +1.02 | 15-0-20 | 0.768 |
| Proposed | 73.92 | nan | -6.44 | 4-0-31 | 5.28e-06 |

## cv, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 112.67, p = 5.6e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 81.01 | 2.29 | -4.38 | 5-0-30 | 1.78e-05 |
| TSVM | 80.32 | 2.47 | -3.70 | 6-0-29 | 2.06e-05 |
| GBSVM | 66.99 | 6.29 | +9.63 | 31-0-4 | 5.28e-06 |
| LSTSVM | 80.45 | 2.64 | -3.83 | 4-0-31 | 3.56e-06 |
| GBLSTSVM | 74.17 | 5.54 | +2.45 | 30-0-5 | 0.000155 |
| LS-GBLSTSVM | 76.93 | 4.43 | -0.31 | 17-0-18 | 0.974 |
| Proposed | 76.62 | 4.34 | | | |
| GBLSTSVM, balls kept (no weight) | 76.88 | nan | -0.26 | 14-0-21 | 0.481 |
| Proposed without the regulariser | 76.90 | nan | -0.28 | 17-0-18 | 0.857 |
| Proposed | 78.23 | nan | -1.60 | 14-0-21 | 0.126 |

### noise 0.05 (35 datasets; Friedman chi2 = 72.73, p = 1.1e-13)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.79 | 2.53 | -3.09 | 9-0-26 | 0.000516 |
| TSVM | 78.68 | 3.37 | -1.98 | 9-0-26 | 0.00074 |
| GBSVM | 69.85 | 5.89 | +6.85 | 26-0-9 | 0.000937 |
| LSTSVM | 79.20 | 2.81 | -2.50 | 8-0-27 | 0.000145 |
| GBLSTSVM | 75.11 | 5.31 | +1.59 | 24-0-11 | 0.0346 |
| LS-GBLSTSVM | 77.83 | 3.57 | -1.14 | 11-0-24 | 0.036 |
| Proposed | 76.70 | 4.51 | | | |
| GBLSTSVM, balls kept (no weight) | 75.89 | nan | +0.81 | 21-0-14 | 0.287 |
| Proposed without the regulariser | 76.88 | nan | -0.19 | 19-0-16 | 0.806 |
| Proposed | 78.19 | nan | -1.49 | 14-0-21 | 0.0406 |

### noise 0.1 (35 datasets; Friedman chi2 = 73.05, p = 9.7e-14)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 78.75 | 2.60 | -3.31 | 6-0-29 | 0.000127 |
| TSVM | 77.87 | 2.94 | -2.44 | 7-0-28 | 5.59e-05 |
| GBSVM | 69.24 | 5.79 | +6.19 | 26-0-9 | 0.00118 |
| LSTSVM | 77.93 | 2.76 | -2.50 | 4-0-31 | 1.53e-05 |
| GBLSTSVM | 74.15 | 5.11 | +1.28 | 19-0-16 | 0.145 |
| LS-GBLSTSVM | 76.48 | 3.97 | -1.05 | 14-0-21 | 0.201 |
| Proposed | 75.43 | 4.83 | | | |
| GBLSTSVM, balls kept (no weight) | 75.27 | nan | +0.16 | 18-0-17 | 0.831 |
| Proposed without the regulariser | 75.80 | nan | -0.37 | 15-0-20 | 0.647 |
| Proposed | 77.54 | nan | -2.11 | 12-0-23 | 0.00797 |

### noise 0.15 (35 datasets; Friedman chi2 = 62.72, p = 1.3e-11)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 76.85 | 2.57 | -2.63 | 10-0-25 | 0.000657 |
| TSVM | 75.46 | 3.60 | -1.24 | 13-0-22 | 0.0248 |
| GBSVM | 67.44 | 5.71 | +6.78 | 25-0-10 | 0.000201 |
| LSTSVM | 76.37 | 2.66 | -2.15 | 8-0-27 | 0.000127 |
| GBLSTSVM | 72.33 | 5.17 | +1.89 | 23-0-12 | 0.0259 |
| LS-GBLSTSVM | 74.59 | 4.09 | -0.37 | 19-0-16 | 0.831 |
| Proposed | 74.22 | 4.20 | | | |
| GBLSTSVM, balls kept (no weight) | 73.35 | nan | +0.87 | 23-0-12 | 0.0742 |
| Proposed without the regulariser | 73.98 | nan | +0.24 | 22-0-13 | 0.287 |
| Proposed | 75.50 | nan | -1.28 | 13-0-22 | 0.0475 |

### noise 0.2 (35 datasets; Friedman chi2 = 83.80, p = 5.8e-16)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 75.21 | 2.43 | -2.45 | 9-0-26 | 0.000334 |
| TSVM | 74.53 | 2.77 | -1.77 | 7-0-28 | 0.000127 |
| GBSVM | 65.56 | 5.97 | +7.21 | 28-0-7 | 4.22e-05 |
| LSTSVM | 74.32 | 2.99 | -1.55 | 8-1-26 | 0.000608 |
| GBLSTSVM | 69.99 | 5.49 | +2.78 | 27-0-8 | 0.000657 |
| LS-GBLSTSVM | 72.85 | 4.11 | -0.08 | 17-0-18 | 0.781 |
| Proposed | 72.77 | 4.24 | | | |
| GBLSTSVM, balls kept (no weight) | 71.82 | nan | +0.94 | 21-0-14 | 0.112 |
| Proposed without the regulariser | 73.03 | nan | -0.27 | 13-0-22 | 0.28 |
| Proposed | 75.15 | nan | -2.38 | 9-0-26 | 0.000188 |

### noise 0.3 (35 datasets; Friedman chi2 = 50.88, p = 3.1e-09)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 69.72 | 2.97 | -1.29 | 14-0-21 | 0.201 |
| TSVM | 68.56 | 3.17 | -0.13 | 14-0-21 | 0.201 |
| GBSVM | 59.65 | 5.71 | +8.78 | 28-0-7 | 6.89e-05 |
| LSTSVM | 68.69 | 3.43 | -0.26 | 17-0-18 | 0.461 |
| GBLSTSVM | 63.68 | 5.23 | +4.74 | 30-0-5 | 2.96e-05 |
| LS-GBLSTSVM | 67.96 | 4.00 | +0.46 | 20-0-15 | 0.578 |
| Proposed | 68.43 | 3.49 | | | |
| GBLSTSVM, balls kept (no weight) | 65.70 | nan | +2.73 | 27-0-8 | 0.000295 |
| Proposed without the regulariser | 68.19 | nan | +0.24 | 20-0-15 | 0.502 |
| Proposed | 70.25 | nan | -1.82 | 11-0-24 | 0.00272 |
