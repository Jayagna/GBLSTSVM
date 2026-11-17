# Paper tables

## oracle, accuracy

### noise 0 (35 datasets; Friedman chi2 = 100.26, p = 2.2e-19)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 88.53 | 4.94 | +1.41 | 34-0-1 | 6.38e-07 |
| TSVM | 88.59 | 4.27 | +1.35 | 33-0-2 | 3.86e-06 |
| GBSVM | 84.96 | 5.40 | +4.99 | 33-0-2 | 3.51e-07 |
| LSTSVM | 88.21 | 5.31 | +1.73 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 88.08 | 4.13 | +1.86 | 31-0-4 | 2.38e-05 |
| LS-GBLSTSVM | 89.50 | 2.46 | +0.44 | 27-0-8 | 0.000696 |
| Proposed | 89.94 | 1.49 | | | |
| Proposed without the regulariser | 89.53 | nan | +0.41 | 20-3-12 | 0.00581 |
| LS-GBLSTSVM, balls kept (no weight) | 89.33 | nan | +0.61 | 30-2-3 | 1.23e-06 |
| GBFTSVM | 87.09 | nan | +2.85 | 32-0-3 | 3.85e-06 |
| GBLSTSVM, balls kept (no weight) | 88.95 | nan | +1.00 | 32-0-3 | 2.03e-06 |
| Plain neighbour count | 89.50 | nan | +0.44 | 23-3-9 | 0.00364 |

### noise 0.05 (35 datasets; Friedman chi2 = 108.00, p = 5.3e-21)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 87.91 | 5.43 | +1.87 | 34-0-1 | 2.7e-07 |
| TSVM | 88.61 | 3.94 | +1.17 | 32-1-2 | 6.63e-06 |
| GBSVM | 85.11 | 5.30 | +4.68 | 32-1-2 | 6.23e-07 |
| LSTSVM | 88.05 | 5.51 | +1.74 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 87.98 | 3.83 | +1.81 | 29-2-4 | 4.99e-06 |
| LS-GBLSTSVM | 89.30 | 2.37 | +0.48 | 23-3-9 | 0.00114 |
| Proposed | 89.78 | 1.61 | | | |
| Proposed without the regulariser | 89.25 | nan | +0.54 | 23-3-9 | 0.00058 |
| LS-GBLSTSVM, balls kept (no weight) | 89.12 | nan | +0.66 | 33-0-2 | 2.2e-06 |
| GBFTSVM | 86.63 | nan | +3.15 | 31-1-3 | 1.77e-06 |
| GBLSTSVM, balls kept (no weight) | 88.45 | nan | +1.34 | 33-0-2 | 3.51e-07 |
| Plain neighbour count | 89.30 | nan | +0.48 | 22-3-10 | 0.00708 |

### noise 0.1 (35 datasets; Friedman chi2 = 118.31, p = 3.7e-23)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 87.08 | 5.56 | +2.45 | 34-0-1 | 2.7e-07 |
| TSVM | 88.23 | 4.20 | +1.30 | 34-0-1 | 2.39e-06 |
| GBSVM | 84.87 | 5.26 | +4.66 | 33-0-2 | 3.21e-07 |
| LSTSVM | 87.56 | 5.47 | +1.97 | 35-0-0 | 2.47e-07 |
| GBLSTSVM | 87.93 | 3.84 | +1.59 | 29-2-4 | 3.53e-05 |
| LS-GBLSTSVM | 89.20 | 2.13 | +0.33 | 23-4-8 | 0.00289 |
| Proposed | 89.53 | 1.54 | | | |
| Proposed without the regulariser | 89.17 | nan | +0.36 | 23-3-9 | 0.0214 |
| LS-GBLSTSVM, balls kept (no weight) | 88.84 | nan | +0.68 | 30-1-4 | 2.27e-06 |
| GBFTSVM | 86.85 | nan | +2.68 | 30-0-5 | 3.04e-06 |
| GBLSTSVM, balls kept (no weight) | 88.27 | nan | +1.26 | 34-0-1 | 3.22e-07 |
| Plain neighbour count | 89.16 | nan | +0.37 | 24-1-10 | 0.012 |

### noise 0.15 (35 datasets; Friedman chi2 = 129.38, p = 1.7e-25)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.47 | 5.67 | +2.79 | 35-0-0 | 2.48e-07 |
| TSVM | 87.59 | 4.34 | +1.67 | 34-0-1 | 6.94e-07 |
| GBSVM | 84.58 | 5.57 | +4.68 | 35-0-0 | 2.48e-07 |
| LSTSVM | 87.14 | 5.31 | +2.12 | 35-0-0 | 2.47e-07 |
| GBLSTSVM | 87.52 | 3.46 | +1.74 | 30-0-5 | 1.37e-05 |
| LS-GBLSTSVM | 88.87 | 2.24 | +0.40 | 26-2-7 | 0.00232 |
| Proposed | 89.26 | 1.40 | | | |
| Proposed without the regulariser | 88.84 | nan | +0.43 | 26-1-8 | 0.00131 |
| LS-GBLSTSVM, balls kept (no weight) | 88.47 | nan | +0.79 | 33-1-1 | 3.99e-07 |
| GBFTSVM | 86.61 | nan | +2.65 | 32-0-3 | 4.51e-06 |
| GBLSTSVM, balls kept (no weight) | 87.93 | nan | +1.33 | 33-1-1 | 1.37e-06 |
| Plain neighbour count | 88.90 | nan | +0.36 | 22-2-11 | 0.0697 |

### noise 0.2 (35 datasets; Friedman chi2 = 124.88, p = 1.5e-24)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 86.17 | 5.66 | +2.87 | 35-0-0 | 2.48e-07 |
| TSVM | 87.07 | 4.37 | +1.97 | 34-0-1 | 8.93e-07 |
| GBSVM | 83.97 | 5.70 | +5.07 | 34-0-1 | 2.7e-07 |
| LSTSVM | 86.79 | 5.00 | +2.24 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 87.06 | 3.61 | +1.98 | 31-0-4 | 6.43e-05 |
| LS-GBLSTSVM | 88.66 | 2.21 | +0.38 | 25-1-9 | 0.00255 |
| Proposed | 89.04 | 1.44 | | | |
| Proposed without the regulariser | 88.61 | nan | +0.43 | 23-1-11 | 0.00293 |
| LS-GBLSTSVM, balls kept (no weight) | 88.14 | nan | +0.90 | 33-0-2 | 9.71e-07 |
| GBFTSVM | 86.50 | nan | +2.54 | 30-1-4 | 8.44e-06 |
| GBLSTSVM, balls kept (no weight) | 87.49 | nan | +1.55 | 32-1-2 | 6.81e-07 |
| Plain neighbour count | 88.67 | nan | +0.37 | 23-0-12 | 0.0218 |

### noise 0.3 (35 datasets; Friedman chi2 = 122.41, p = 5.1e-24)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 85.39 | 5.43 | +2.71 | 34-1-0 | 3.65e-07 |
| TSVM | 85.33 | 4.70 | +2.76 | 33-1-1 | 5.71e-07 |
| GBSVM | 83.09 | 5.90 | +5.01 | 34-1-0 | 3.65e-07 |
| LSTSVM | 85.27 | 4.69 | +2.83 | 34-1-0 | 3.65e-07 |
| GBLSTSVM | 85.56 | 3.57 | +2.54 | 29-1-5 | 2.32e-05 |
| LS-GBLSTSVM | 87.41 | 2.27 | +0.69 | 28-0-7 | 0.000314 |
| Proposed | 88.10 | 1.44 | | | |
| Proposed without the regulariser | 87.68 | nan | +0.41 | 23-3-9 | 0.00771 |
| LS-GBLSTSVM, balls kept (no weight) | 86.62 | nan | +1.48 | 35-0-0 | 2.48e-07 |
| GBFTSVM | 85.12 | nan | +2.97 | 28-0-7 | 2.38e-05 |
| GBLSTSVM, balls kept (no weight) | 86.08 | nan | +2.02 | 31-1-3 | 6.24e-07 |
| Plain neighbour count | 87.46 | nan | +0.64 | 23-2-10 | 0.00546 |

## oracle, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 92.58, p = 8.8e-18)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 83.70 | 5.23 | +3.02 | 34-0-1 | 2.95e-07 |
| TSVM | 84.79 | 3.57 | +1.93 | 27-0-8 | 0.000119 |
| GBSVM | 75.36 | 5.94 | +11.36 | 33-0-2 | 3.82e-07 |
| LSTSVM | 84.04 | 4.86 | +2.68 | 33-0-2 | 7.55e-07 |
| GBLSTSVM | 83.70 | 3.83 | +3.02 | 27-0-8 | 0.00133 |
| LS-GBLSTSVM | 85.66 | 2.63 | +1.06 | 23-0-12 | 0.036 |
| Proposed | 86.72 | 1.94 | | | |
| Proposed without the regulariser | 86.37 | nan | +0.35 | 20-0-15 | 0.179 |
| LS-GBLSTSVM, balls kept (no weight) | 86.06 | nan | +0.66 | 28-2-5 | 0.000241 |
| GBFTSVM | 81.26 | nan | +5.46 | 29-0-6 | 1.14e-05 |
| GBLSTSVM, balls kept (no weight) | 85.40 | nan | +1.32 | 31-0-4 | 5.22e-05 |
| Plain neighbour count | 86.49 | nan | +0.23 | 22-0-13 | 0.334 |

### noise 0.05 (35 datasets; Friedman chi2 = 112.65, p = 5.7e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 82.62 | 5.44 | +3.36 | 34-0-1 | 4.54e-07 |
| TSVM | 84.04 | 3.84 | +1.94 | 30-0-5 | 1.42e-05 |
| GBSVM | 76.64 | 5.70 | +9.35 | 33-0-2 | 6.94e-07 |
| LSTSVM | 83.03 | 5.49 | +2.96 | 34-0-1 | 3.82e-07 |
| GBLSTSVM | 83.89 | 3.37 | +2.10 | 22-0-13 | 0.0406 |
| LS-GBLSTSVM | 85.58 | 1.94 | +0.40 | 14-1-20 | 0.791 |
| Proposed | 85.99 | 2.21 | | | |
| Proposed without the regulariser | 85.75 | nan | +0.24 | 18-0-17 | 0.902 |
| LS-GBLSTSVM, balls kept (no weight) | 85.29 | nan | +0.70 | 27-1-7 | 0.00161 |
| GBFTSVM | 82.18 | nan | +3.80 | 24-0-11 | 0.00118 |
| GBLSTSVM, balls kept (no weight) | 84.42 | nan | +1.57 | 29-0-6 | 0.000135 |
| Plain neighbour count | 85.88 | nan | +0.11 | 15-0-20 | 0.793 |

### noise 0.1 (35 datasets; Friedman chi2 = 113.19, p = 4.4e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 81.47 | 5.47 | +4.01 | 34-0-1 | 2.95e-07 |
| TSVM | 83.16 | 3.94 | +2.32 | 30-0-5 | 1.78e-05 |
| GBSVM | 76.29 | 5.63 | +9.19 | 32-1-2 | 4.78e-07 |
| LSTSVM | 82.09 | 5.41 | +3.39 | 33-0-2 | 1.06e-06 |
| GBLSTSVM | 83.63 | 3.56 | +1.85 | 25-0-10 | 0.00258 |
| LS-GBLSTSVM | 85.42 | 1.90 | +0.06 | 17-1-17 | 0.925 |
| Proposed | 85.48 | 2.09 | | | |
| Proposed without the regulariser | 85.42 | nan | +0.06 | 21-0-14 | 0.806 |
| LS-GBLSTSVM, balls kept (no weight) | 84.62 | nan | +0.86 | 26-0-9 | 0.00196 |
| GBFTSVM | 82.94 | nan | +2.54 | 22-0-13 | 0.00797 |
| GBLSTSVM, balls kept (no weight) | 83.63 | nan | +1.85 | 29-0-6 | 6.43e-05 |
| Plain neighbour count | 85.46 | nan | +0.02 | 16-0-19 | 0.909 |

### noise 0.15 (35 datasets; Friedman chi2 = 126.61, p = 6.6e-25)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 80.30 | 5.43 | +4.52 | 33-0-2 | 4.54e-07 |
| TSVM | 81.62 | 4.23 | +3.21 | 34-0-1 | 6.38e-07 |
| GBSVM | 75.43 | 5.83 | +9.39 | 35-0-0 | 2.48e-07 |
| LSTSVM | 80.62 | 5.37 | +4.20 | 34-0-1 | 4.54e-07 |
| GBLSTSVM | 83.07 | 3.44 | +1.75 | 25-1-9 | 0.00192 |
| LS-GBLSTSVM | 84.89 | 1.79 | -0.07 | 16-1-18 | 0.765 |
| Proposed | 84.82 | 1.91 | | | |
| Proposed without the regulariser | 84.73 | nan | +0.10 | 20-0-15 | 0.857 |
| LS-GBLSTSVM, balls kept (no weight) | 83.73 | nan | +1.09 | 27-0-8 | 0.000314 |
| GBFTSVM | 82.38 | nan | +2.44 | 24-0-11 | 0.00536 |
| GBLSTSVM, balls kept (no weight) | 82.57 | nan | +2.26 | 30-0-5 | 2.38e-05 |
| Plain neighbour count | 84.78 | nan | +0.05 | 19-0-16 | 0.948 |

### noise 0.2 (35 datasets; Friedman chi2 = 126.50, p = 7e-25)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.46 | 5.40 | +4.87 | 34-0-1 | 3.82e-07 |
| TSVM | 80.77 | 4.44 | +3.56 | 34-0-1 | 6.38e-07 |
| GBSVM | 73.81 | 5.93 | +10.51 | 34-0-1 | 2.7e-07 |
| LSTSVM | 80.02 | 5.17 | +4.30 | 34-0-1 | 2.7e-07 |
| GBLSTSVM | 82.41 | 3.34 | +1.92 | 25-0-10 | 0.00258 |
| LS-GBLSTSVM | 84.26 | 1.81 | +0.06 | 17-1-17 | 0.993 |
| Proposed | 84.32 | 1.90 | | | |
| Proposed without the regulariser | 84.09 | nan | +0.23 | 16-1-18 | 0.602 |
| LS-GBLSTSVM, balls kept (no weight) | 83.17 | nan | +1.15 | 25-0-10 | 0.000228 |
| GBFTSVM | 81.93 | nan | +2.40 | 24-0-11 | 0.00484 |
| GBLSTSVM, balls kept (no weight) | 82.05 | nan | +2.28 | 28-0-7 | 1.53e-05 |
| Plain neighbour count | 84.22 | nan | +0.10 | 17-0-18 | 0.87 |

### noise 0.3 (35 datasets; Friedman chi2 = 139.07, p = 1.6e-27)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 76.05 | 4.94 | +6.61 | 35-0-0 | 2.48e-07 |
| TSVM | 76.21 | 4.77 | +6.46 | 34-0-1 | 2.95e-07 |
| GBSVM | 69.19 | 6.26 | +13.47 | 35-0-0 | 2.48e-07 |
| LSTSVM | 76.28 | 5.20 | +6.38 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 79.85 | 3.30 | +2.82 | 27-0-8 | 0.000697 |
| LS-GBLSTSVM | 82.48 | 1.90 | +0.18 | 22-0-13 | 0.185 |
| Proposed | 82.67 | 1.63 | | | |
| Proposed without the regulariser | 82.33 | nan | +0.34 | 21-0-14 | 0.149 |
| LS-GBLSTSVM, balls kept (no weight) | 80.58 | nan | +2.09 | 30-0-5 | 3.56e-06 |
| GBFTSVM | 79.61 | nan | +3.06 | 26-0-9 | 0.000834 |
| GBLSTSVM, balls kept (no weight) | 79.31 | nan | +3.36 | 33-0-2 | 7.55e-07 |
| Plain neighbour count | 82.16 | nan | +0.50 | 20-0-15 | 0.196 |

## cv, accuracy

### noise 0 (35 datasets; Friedman chi2 = 45.07, p = 4.5e-08)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 83.22 | 2.74 | -1.58 | 9-0-26 | 0.00437 |
| TSVM | 81.92 | 3.40 | -0.28 | 16-0-19 | 0.512 |
| GBSVM | 68.56 | 5.69 | +13.07 | 29-0-6 | 2.38e-05 |
| LSTSVM | 81.01 | 3.84 | +0.62 | 17-1-17 | 0.499 |
| GBLSTSVM | 78.23 | 4.99 | +3.41 | 27-0-8 | 0.00448 |
| LS-GBLSTSVM | 81.45 | 3.76 | +0.19 | 21-0-14 | 0.502 |
| Proposed | 81.64 | 3.59 | | | |
| Proposed without the regulariser | 78.52 | nan | +3.11 | 26-1-8 | 0.000939 |
| LS-GBLSTSVM, balls kept (no weight) | 80.96 | nan | +0.67 | 23-2-10 | 0.0754 |
| GBLSTSVM, balls kept (no weight) | 79.72 | nan | +1.92 | 25-0-10 | 0.0248 |
| Plain neighbour count | 79.03 | nan | +2.60 | 24-0-11 | 0.00303 |

### noise 0.05 (35 datasets; Friedman chi2 = 51.68, p = 2.2e-09)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.76 | 3.76 | +1.20 | 21-2-12 | 0.0697 |
| TSVM | 79.11 | 4.04 | +1.86 | 26-1-8 | 0.000472 |
| GBSVM | 70.26 | 5.60 | +10.71 | 28-0-7 | 1.65e-05 |
| LSTSVM | 79.41 | 3.79 | +1.56 | 23-1-11 | 0.00547 |
| GBLSTSVM | 77.77 | 5.19 | +3.20 | 30-1-4 | 0.000734 |
| LS-GBLSTSVM | 81.10 | 2.87 | -0.13 | 18-0-17 | 0.566 |
| Proposed | 80.96 | 2.76 | | | |
| Proposed without the regulariser | 78.41 | nan | +2.55 | 29-0-6 | 0.00026 |
| LS-GBLSTSVM, balls kept (no weight) | 79.76 | nan | +1.21 | 19-1-15 | 0.028 |
| GBLSTSVM, balls kept (no weight) | 76.71 | nan | +4.25 | 30-0-5 | 2.03e-06 |
| Plain neighbour count | 77.44 | nan | +3.52 | 29-0-6 | 6.43e-05 |

### noise 0.1 (35 datasets; Friedman chi2 = 52.21, p = 1.7e-09)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 77.82 | 3.80 | +1.84 | 21-0-14 | 0.0825 |
| TSVM | 77.74 | 3.70 | +1.92 | 26-0-9 | 0.000165 |
| GBSVM | 68.74 | 5.71 | +10.92 | 31-0-4 | 4.17e-06 |
| LSTSVM | 77.47 | 4.04 | +2.19 | 26-1-8 | 0.000781 |
| GBLSTSVM | 76.40 | 5.00 | +3.26 | 27-1-7 | 0.00547 |
| LS-GBLSTSVM | 80.01 | 3.29 | -0.36 | 27-0-8 | 0.0228 |
| Proposed | 79.66 | 2.46 | | | |
| Proposed without the regulariser | 76.00 | nan | +3.66 | 33-0-2 | 1.47e-06 |
| LS-GBLSTSVM, balls kept (no weight) | 77.55 | nan | +2.10 | 24-0-11 | 0.00797 |
| GBLSTSVM, balls kept (no weight) | 76.68 | nan | +2.97 | 31-0-4 | 0.000104 |
| Plain neighbour count | 76.38 | nan | +3.27 | 30-1-4 | 0.000175 |

### noise 0.15 (35 datasets; Friedman chi2 = 42.18, p = 1.7e-07)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 75.98 | 3.90 | +3.03 | 22-2-11 | 0.00261 |
| TSVM | 74.99 | 4.19 | +4.02 | 26-0-9 | 0.000165 |
| GBSVM | 64.15 | 5.46 | +14.86 | 31-0-4 | 1.25e-06 |
| LSTSVM | 75.82 | 3.79 | +3.18 | 23-2-10 | 0.00391 |
| GBLSTSVM | 74.32 | 4.86 | +4.69 | 28-1-6 | 0.0002 |
| LS-GBLSTSVM | 77.47 | 3.29 | +1.54 | 24-0-11 | 0.0248 |
| Proposed | 79.01 | 2.53 | | | |
| Proposed without the regulariser | 74.13 | nan | +4.88 | 31-0-4 | 8.21e-07 |
| LS-GBLSTSVM, balls kept (no weight) | 76.11 | nan | +2.90 | 25-1-9 | 0.00069 |
| GBLSTSVM, balls kept (no weight) | 74.48 | nan | +4.53 | 28-0-7 | 1.78e-05 |
| Plain neighbour count | 75.61 | nan | +3.39 | 29-0-6 | 1.78e-05 |

### noise 0.2 (35 datasets; Friedman chi2 = 67.50, p = 1.3e-12)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 74.42 | 3.47 | +3.41 | 25-0-10 | 0.00797 |
| TSVM | 73.14 | 4.09 | +4.69 | 31-0-4 | 2.75e-05 |
| GBSVM | 61.26 | 5.86 | +16.58 | 31-0-4 | 8.21e-07 |
| LSTSVM | 73.46 | 3.83 | +4.38 | 29-0-6 | 0.000244 |
| GBLSTSVM | 70.49 | 5.14 | +7.35 | 30-0-5 | 2.75e-05 |
| LS-GBLSTSVM | 75.13 | 3.54 | +2.70 | 26-1-8 | 0.00301 |
| Proposed | 77.83 | 2.07 | | | |
| Proposed without the regulariser | 73.69 | nan | +4.15 | 31-0-4 | 9.76e-06 |
| LS-GBLSTSVM, balls kept (no weight) | 73.81 | nan | +4.02 | 27-0-8 | 0.000403 |
| GBLSTSVM, balls kept (no weight) | 71.74 | nan | +6.09 | 30-0-5 | 1.65e-05 |
| Plain neighbour count | 72.63 | nan | +5.20 | 31-0-4 | 1.53e-05 |

### noise 0.3 (35 datasets; Friedman chi2 = 79.71, p = 4.1e-15)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 72.20 | 2.54 | +1.72 | 19-0-16 | 0.334 |
| TSVM | 65.52 | 4.33 | +8.41 | 30-0-5 | 2.81e-06 |
| GBSVM | 52.50 | 5.94 | +21.42 | 30-0-5 | 3.04e-06 |
| LSTSVM | 66.05 | 4.56 | +7.88 | 32-0-3 | 1.06e-06 |
| GBLSTSVM | 64.06 | 4.91 | +9.86 | 29-0-6 | 4.51e-06 |
| LS-GBLSTSVM | 70.03 | 3.51 | +3.89 | 28-0-7 | 0.00207 |
| Proposed | 73.92 | 2.20 | | | |
| Proposed without the regulariser | 66.46 | nan | +7.46 | 31-0-4 | 1.88e-06 |
| LS-GBLSTSVM, balls kept (no weight) | 68.96 | nan | +4.97 | 28-0-7 | 2.75e-05 |
| GBLSTSVM, balls kept (no weight) | 64.97 | nan | +8.96 | 31-0-4 | 8.93e-07 |
| Plain neighbour count | 67.48 | nan | +6.44 | 31-0-4 | 5.28e-06 |

## cv, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 103.94, p = 3.8e-20)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 81.01 | 2.29 | -2.78 | 5-0-30 | 6e-05 |
| TSVM | 80.32 | 2.64 | -2.10 | 12-0-23 | 0.00394 |
| GBSVM | 66.99 | 6.26 | +11.23 | 30-0-5 | 3.29e-06 |
| LSTSVM | 80.45 | 2.77 | -2.22 | 8-1-26 | 0.00113 |
| GBLSTSVM | 74.17 | 5.49 | +4.05 | 28-0-7 | 1.53e-05 |
| LS-GBLSTSVM | 76.93 | 4.51 | +1.30 | 20-0-15 | 0.164 |
| Proposed | 78.23 | 4.04 | | | |
| Proposed without the regulariser | 76.90 | nan | +1.33 | 24-0-11 | 0.0494 |
| LS-GBLSTSVM, balls kept (no weight) | 78.61 | nan | -0.39 | 11-0-24 | 0.0742 |
| GBLSTSVM, balls kept (no weight) | 76.88 | nan | +1.34 | 22-0-13 | 0.116 |
| Plain neighbour count | 76.62 | nan | +1.60 | 21-0-14 | 0.126 |

### noise 0.05 (35 datasets; Friedman chi2 = 69.98, p = 4.1e-13)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.79 | 2.61 | -1.60 | 12-0-23 | 0.00623 |
| TSVM | 78.68 | 3.60 | -0.49 | 17-0-18 | 0.518 |
| GBSVM | 69.85 | 6.00 | +8.34 | 30-0-5 | 2.38e-05 |
| LSTSVM | 79.20 | 3.00 | -1.01 | 14-1-20 | 0.0293 |
| GBLSTSVM | 75.11 | 5.43 | +3.08 | 28-0-7 | 0.000582 |
| LS-GBLSTSVM | 77.83 | 3.71 | +0.36 | 16-0-19 | 0.987 |
| Proposed | 78.19 | 3.64 | | | |
| Proposed without the regulariser | 76.88 | nan | +1.30 | 21-0-14 | 0.0553 |
| LS-GBLSTSVM, balls kept (no weight) | 78.06 | nan | +0.13 | 16-0-19 | 0.909 |
| GBLSTSVM, balls kept (no weight) | 75.89 | nan | +2.30 | 25-1-9 | 0.00301 |
| Plain neighbour count | 76.70 | nan | +1.49 | 21-0-14 | 0.0406 |

### noise 0.1 (35 datasets; Friedman chi2 = 67.45, p = 1.4e-12)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 78.75 | 2.77 | -1.21 | 12-0-23 | 0.0218 |
| TSVM | 77.87 | 3.14 | -0.33 | 14-0-21 | 0.368 |
| GBSVM | 69.24 | 5.90 | +8.30 | 30-0-5 | 1.32e-05 |
| LSTSVM | 77.93 | 3.07 | -0.39 | 15-0-20 | 0.12 |
| GBLSTSVM | 74.15 | 5.40 | +3.39 | 29-0-6 | 6e-05 |
| LS-GBLSTSVM | 76.48 | 4.23 | +1.06 | 23-0-12 | 0.0306 |
| Proposed | 77.54 | 3.49 | | | |
| Proposed without the regulariser | 75.80 | nan | +1.74 | 23-1-11 | 0.00518 |
| LS-GBLSTSVM, balls kept (no weight) | 77.00 | nan | +0.54 | 17-0-18 | 0.987 |
| GBLSTSVM, balls kept (no weight) | 75.27 | nan | +2.27 | 23-0-12 | 0.02 |
| Plain neighbour count | 75.43 | nan | +2.11 | 23-0-12 | 0.00797 |

### noise 0.15 (35 datasets; Friedman chi2 = 63.72, p = 7.9e-12)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 76.85 | 2.66 | -1.35 | 13-0-22 | 0.0319 |
| TSVM | 75.46 | 3.71 | +0.04 | 17-0-18 | 0.793 |
| GBSVM | 67.44 | 5.80 | +8.06 | 28-0-7 | 1.05e-05 |
| LSTSVM | 76.37 | 2.74 | -0.87 | 11-0-24 | 0.0406 |
| GBLSTSVM | 72.33 | 5.29 | +3.16 | 27-0-8 | 0.000884 |
| LS-GBLSTSVM | 74.59 | 4.14 | +0.91 | 21-0-14 | 0.238 |
| Proposed | 75.50 | 3.66 | | | |
| Proposed without the regulariser | 73.98 | nan | +1.52 | 23-1-11 | 0.0293 |
| LS-GBLSTSVM, balls kept (no weight) | 75.51 | nan | -0.01 | 14-0-21 | 0.909 |
| GBLSTSVM, balls kept (no weight) | 73.35 | nan | +2.15 | 25-0-10 | 0.00355 |
| Plain neighbour count | 74.22 | nan | +1.28 | 22-0-13 | 0.0475 |

### noise 0.2 (35 datasets; Friedman chi2 = 83.63, p = 6.3e-16)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 75.21 | 2.60 | -0.06 | 15-0-20 | 0.647 |
| TSVM | 74.53 | 3.17 | +0.62 | 21-0-14 | 0.302 |
| GBSVM | 65.56 | 6.09 | +9.60 | 32-0-3 | 4.54e-07 |
| LSTSVM | 74.32 | 3.37 | +0.83 | 22-0-13 | 0.12 |
| GBLSTSVM | 69.99 | 5.51 | +5.16 | 28-0-7 | 6.66e-06 |
| LS-GBLSTSVM | 72.85 | 4.40 | +2.30 | 27-0-8 | 0.00125 |
| Proposed | 75.15 | 2.86 | | | |
| Proposed without the regulariser | 73.03 | nan | +2.12 | 27-0-8 | 6e-05 |
| LS-GBLSTSVM, balls kept (no weight) | 74.14 | nan | +1.01 | 22-0-13 | 0.0855 |
| GBLSTSVM, balls kept (no weight) | 71.82 | nan | +3.33 | 24-0-11 | 0.000334 |
| Plain neighbour count | 72.77 | nan | +2.38 | 26-0-9 | 0.000188 |

### noise 0.3 (35 datasets; Friedman chi2 = 54.70, p = 5.3e-10)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 69.72 | 3.09 | +0.53 | 18-0-17 | 0.512 |
| TSVM | 68.56 | 3.43 | +1.69 | 23-0-12 | 0.027 |
| GBSVM | 59.65 | 5.74 | +10.60 | 29-0-6 | 7.76e-06 |
| LSTSVM | 68.69 | 3.57 | +1.56 | 22-0-13 | 0.014 |
| GBLSTSVM | 63.68 | 5.20 | +6.56 | 29-0-6 | 1.05e-05 |
| LS-GBLSTSVM | 67.96 | 4.17 | +2.28 | 26-0-9 | 0.00836 |
| Proposed | 70.25 | 2.80 | | | |
| Proposed without the regulariser | 68.19 | nan | +2.06 | 25-0-10 | 0.00148 |
| LS-GBLSTSVM, balls kept (no weight) | 69.64 | nan | +0.61 | 21-1-13 | 0.197 |
| GBLSTSVM, balls kept (no weight) | 65.70 | nan | +4.55 | 29-0-6 | 2.38e-05 |
| Plain neighbour count | 68.43 | nan | +1.82 | 24-0-11 | 0.00272 |
