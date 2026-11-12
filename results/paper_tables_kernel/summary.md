# Paper tables

## oracle, accuracy

### noise 0 (35 datasets; Friedman chi2 = 118.09, p = 4.1e-23)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 90.77 | 4.63 | +1.09 | 32-0-3 | 2.75e-05 |
| TSVM | 90.74 | 4.17 | +1.13 | 31-0-4 | 4.86e-05 |
| GBSVM | 78.97 | 6.90 | +12.89 | 35-0-0 | 2.48e-07 |
| LSTSVM | 90.76 | 3.87 | +1.10 | 30-1-4 | 7.55e-05 |
| GBLSTSVM | 90.31 | 3.84 | +1.55 | 31-2-2 | 1.91e-06 |
| LS-GBLSTSVM | 90.88 | 3.01 | +0.99 | 28-3-4 | 2.19e-05 |
| Proposed | 91.87 | 1.57 | | | |

### noise 0.1 (30 datasets; Friedman chi2 = 110.33, p = 1.7e-21)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 89.40 | 3.85 | +1.19 | 26-1-3 | 1.08e-05 |
| TSVM | 88.41 | 4.58 | +2.18 | 26-0-4 | 1.23e-05 |
| GBSVM | 79.66 | 6.80 | +10.92 | 30-0-0 | 1.73e-06 |
| LSTSVM | 88.28 | 5.03 | +2.31 | 30-0-0 | 1.73e-06 |
| GBLSTSVM | 89.24 | 3.58 | +1.35 | 25-2-3 | 0.00013 |
| LS-GBLSTSVM | 89.98 | 2.47 | +0.61 | 16-10-4 | 0.0169 |
| Proposed | 90.59 | 1.68 | | | |

## oracle, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 127.40, p = 4.5e-25)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.18 | 4.09 | +2.78 | 33-0-2 | 1.05e-05 |
| TSVM | 82.88 | 5.00 | +6.08 | 33-0-2 | 1.88e-06 |
| GBSVM | 56.80 | 6.80 | +32.16 | 35-0-0 | 2.48e-07 |
| LSTSVM | 86.55 | 3.54 | +2.41 | 30-1-4 | 6.12e-06 |
| GBLSTSVM | 84.97 | 4.23 | +3.99 | 34-0-1 | 3.51e-07 |
| LS-GBLSTSVM | 86.21 | 2.94 | +2.75 | 30-1-4 | 4.8e-06 |
| Proposed | 88.96 | 1.40 | | | |

### noise 0.1 (30 datasets; Friedman chi2 = 106.49, p = 1.1e-20)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 84.20 | 3.83 | +3.54 | 27-0-3 | 3.18e-06 |
| TSVM | 82.85 | 4.53 | +4.89 | 29-0-1 | 2.6e-06 |
| GBSVM | 66.49 | 6.62 | +21.25 | 30-0-0 | 1.73e-06 |
| LSTSVM | 82.17 | 5.03 | +5.57 | 30-0-0 | 1.73e-06 |
| GBLSTSVM | 83.52 | 3.88 | +4.22 | 26-0-4 | 8.46e-06 |
| LS-GBLSTSVM | 85.20 | 2.65 | +2.54 | 24-1-5 | 0.000135 |
| Proposed | 87.74 | 1.45 | | | |

## cv, accuracy

### noise 0 (35 datasets; Friedman chi2 = 93.63, p = 5.3e-18)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.31 | 2.79 | -1.19 | 11-1-23 | 0.108 |
| TSVM | 88.29 | 1.81 | -3.17 | 6-0-29 | 0.000516 |
| GBSVM | 61.53 | 6.01 | +23.59 | 30-0-5 | 6.16e-06 |
| LSTSVM | 84.01 | 3.84 | +1.11 | 17-0-18 | 0.6 |
| GBLSTSVM | 80.54 | 5.30 | +4.57 | 27-2-6 | 5.59e-05 |
| LS-GBLSTSVM | 82.43 | 4.59 | +2.68 | 24-1-10 | 0.000883 |
| Proposed | 85.11 | 3.66 | | | |

### noise 0.1 (30 datasets; Friedman chi2 = 59.50, p = 5.7e-11)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 80.97 | 2.67 | -2.23 | 9-1-20 | 0.0267 |
| TSVM | 82.42 | 2.57 | -3.68 | 8-0-22 | 0.0111 |
| GBSVM | 60.44 | 6.23 | +18.30 | 27-0-3 | 7.51e-05 |
| LSTSVM | 77.01 | 4.40 | +1.73 | 18-0-12 | 0.106 |
| GBLSTSVM | 77.13 | 4.40 | +1.62 | 19-0-11 | 0.0978 |
| LS-GBLSTSVM | 76.78 | 4.07 | +1.96 | 18-1-11 | 0.0727 |
| Proposed | 78.75 | 3.67 | | | |

## cv, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 103.53, p = 4.6e-20)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 82.63 | 2.33 | -0.77 | 14-0-21 | 0.0553 |
| TSVM | 78.37 | 4.30 | +3.49 | 26-0-9 | 0.00303 |
| GBSVM | 53.20 | 6.80 | +28.66 | 35-0-0 | 2.48e-07 |
| LSTSVM | 81.26 | 3.00 | +0.60 | 20-0-15 | 0.385 |
| GBLSTSVM | 77.58 | 4.80 | +4.27 | 27-2-6 | 8.15e-05 |
| LS-GBLSTSVM | 78.80 | 3.97 | +3.06 | 24-0-11 | 0.00133 |
| Proposed | 81.86 | 2.80 | | | |

### noise 0.1 (30 datasets; Friedman chi2 = 81.00, p = 2.2e-15)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 78.98 | 2.13 | -1.43 | 7-0-23 | 0.0368 |
| TSVM | 76.04 | 3.40 | +1.51 | 18-0-12 | 0.111 |
| GBSVM | 59.05 | 6.63 | +18.50 | 29-0-1 | 2.35e-06 |
| LSTSVM | 73.64 | 4.67 | +3.92 | 21-0-9 | 0.0021 |
| GBLSTSVM | 72.90 | 4.55 | +4.65 | 25-0-5 | 0.000148 |
| LS-GBLSTSVM | 74.90 | 3.55 | +2.65 | 18-0-12 | 0.0161 |
| Proposed | 77.55 | 3.07 | | | |
