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

### noise 0.3 (35 datasets; Friedman chi2 = 111.91, p = 8.1e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 85.39 | 5.40 | +2.29 | 33-1-1 | 9.67e-07 |
| TSVM | 85.33 | 4.70 | +2.35 | 33-1-1 | 5.22e-07 |
| GBSVM | 83.09 | 5.81 | +4.59 | 31-1-3 | 8.12e-07 |
| LSTSVM | 85.27 | 4.69 | +2.41 | 34-1-0 | 3.65e-07 |
| GBLSTSVM | 85.56 | 3.50 | +2.12 | 27-0-8 | 7.9e-05 |
| LS-GBLSTSVM | 87.41 | 2.11 | +0.27 | 21-3-11 | 0.112 |
| Proposed | 87.68 | 1.79 | | | |
| GBFTSVM | 85.12 | nan | +2.56 | 30-0-5 | 6.89e-05 |
| GBLSTSVM, balls kept (no weight) | 86.08 | nan | +1.60 | 33-2-0 | 5.39e-07 |
| Plain neighbour count | 87.46 | nan | +0.22 | 16-6-13 | 0.133 |

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

### noise 0.3 (35 datasets; Friedman chi2 = 133.64, p = 2.2e-26)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 76.05 | 4.91 | +6.27 | 34-0-1 | 3.82e-07 |
| TSVM | 76.21 | 4.77 | +6.12 | 34-0-1 | 2.7e-07 |
| GBSVM | 69.19 | 6.20 | +13.14 | 33-0-2 | 3.51e-07 |
| LSTSVM | 76.28 | 5.20 | +6.04 | 35-0-0 | 2.48e-07 |
| GBLSTSVM | 79.85 | 3.30 | +2.48 | 27-0-8 | 0.000456 |
| LS-GBLSTSVM | 82.48 | 1.80 | -0.16 | 18-1-16 | 0.912 |
| Proposed | 82.33 | 1.81 | | | |
| GBFTSVM | 79.61 | nan | +2.72 | 26-0-9 | 0.000295 |
| GBLSTSVM, balls kept (no weight) | 79.31 | nan | +3.02 | 35-0-0 | 2.48e-07 |
| Plain neighbour count | 82.16 | nan | +0.17 | 22-0-13 | 0.35 |

## cv, accuracy

### noise 0 (35 datasets; Friedman chi2 = 49.41, p = 6.2e-09)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 83.22 | 2.66 | -4.69 | 6-0-29 | 6.89e-05 |
| TSVM | 81.92 | 3.20 | -3.39 | 9-0-26 | 0.000314 |
| GBSVM | 68.56 | 5.69 | +9.96 | 29-0-6 | 0.000155 |
| LSTSVM | 81.01 | 3.67 | -2.49 | 11-1-23 | 0.0142 |
| GBLSTSVM | 78.23 | 4.76 | +0.29 | 19-0-16 | 0.481 |
| LS-GBLSTSVM | 81.45 | 3.46 | -2.92 | 10-1-24 | 0.00492 |
| Proposed | 78.52 | 4.57 | | | |
| GBLSTSVM, balls kept (no weight) | 79.72 | nan | -1.20 | 15-0-20 | 0.159 |
| Plain neighbour count | 79.03 | nan | -0.51 | 16-1-18 | 0.293 |

### noise 0.05 (35 datasets; Friedman chi2 = 43.66, p = 8.6e-08)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.76 | 3.54 | -1.35 | 14-1-20 | 0.106 |
| TSVM | 79.11 | 3.71 | -0.70 | 15-0-20 | 0.219 |
| GBSVM | 70.26 | 5.60 | +8.15 | 28-0-7 | 0.000379 |
| LSTSVM | 79.41 | 3.47 | -1.00 | 12-1-22 | 0.0858 |
| GBLSTSVM | 77.77 | 4.91 | +0.64 | 21-0-14 | 0.252 |
| LS-GBLSTSVM | 81.10 | 2.64 | -2.69 | 10-0-25 | 0.00536 |
| Proposed | 78.41 | 4.11 | | | |
| GBLSTSVM, balls kept (no weight) | 76.71 | nan | +1.70 | 26-0-9 | 0.000834 |
| Plain neighbour count | 77.44 | nan | +0.97 | 23-1-11 | 0.11 |

### noise 0.1 (35 datasets; Friedman chi2 = 42.12, p = 1.7e-07)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 77.82 | 3.57 | -1.82 | 13-0-22 | 0.136 |
| TSVM | 77.74 | 3.30 | -1.74 | 12-0-23 | 0.0128 |
| GBSVM | 68.74 | 5.60 | +7.26 | 27-0-8 | 0.0014 |
| LSTSVM | 77.47 | 3.63 | -1.47 | 12-0-23 | 0.0513 |
| GBLSTSVM | 76.40 | 4.79 | -0.40 | 20-0-15 | 0.948 |
| LS-GBLSTSVM | 80.01 | 2.77 | -4.01 | 9-0-26 | 0.00244 |
| Proposed | 76.00 | 4.34 | | | |
| GBLSTSVM, balls kept (no weight) | 76.68 | nan | -0.68 | 14-0-21 | 0.252 |
| Plain neighbour count | 76.38 | nan | -0.38 | 15-2-18 | 0.348 |

### noise 0.15 (35 datasets; Friedman chi2 = 27.61, p = 0.00011)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 75.98 | 3.67 | -1.85 | 15-0-20 | 0.169 |
| TSVM | 74.99 | 3.93 | -0.86 | 17-0-18 | 0.566 |
| GBSVM | 64.15 | 5.29 | +9.98 | 25-0-10 | 0.000485 |
| LSTSVM | 75.82 | 3.44 | -1.70 | 12-0-23 | 0.0513 |
| GBLSTSVM | 74.32 | 4.64 | -0.19 | 21-0-14 | 0.404 |
| LS-GBLSTSVM | 77.47 | 2.91 | -3.34 | 11-0-24 | 0.0051 |
| Proposed | 74.13 | 4.11 | | | |
| GBLSTSVM, balls kept (no weight) | 74.48 | nan | -0.35 | 20-0-15 | 0.731 |
| Plain neighbour count | 75.61 | nan | -1.49 | 15-0-20 | 0.225 |

### noise 0.2 (35 datasets; Friedman chi2 = 43.87, p = 7.8e-08)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 74.42 | 3.19 | -0.74 | 15-0-20 | 0.471 |
| TSVM | 73.14 | 3.70 | +0.55 | 17-1-17 | 0.898 |
| GBSVM | 61.26 | 5.74 | +12.43 | 27-0-8 | 4.69e-05 |
| LSTSVM | 73.46 | 3.43 | +0.23 | 15-0-20 | 0.544 |
| GBLSTSVM | 70.49 | 4.94 | +3.20 | 23-0-12 | 0.0119 |
| LS-GBLSTSVM | 75.13 | 3.09 | -1.44 | 10-1-24 | 0.041 |
| Proposed | 73.69 | 3.91 | | | |
| GBLSTSVM, balls kept (no weight) | 71.74 | nan | +1.94 | 23-0-12 | 0.039 |
| Plain neighbour count | 72.63 | nan | +1.06 | 21-0-14 | 0.159 |

### noise 0.3 (35 datasets; Friedman chi2 = 63.21, p = 1e-11)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 72.20 | 2.20 | -5.74 | 7-0-28 | 0.00133 |
| TSVM | 65.52 | 3.87 | +0.95 | 14-0-21 | 0.819 |
| GBSVM | 52.50 | 5.89 | +13.96 | 28-0-7 | 0.00016 |
| LSTSVM | 66.05 | 4.17 | +0.42 | 18-1-16 | 0.952 |
| GBLSTSVM | 64.06 | 4.80 | +2.40 | 25-0-10 | 0.0666 |
| LS-GBLSTSVM | 70.03 | 3.03 | -3.57 | 11-0-24 | 0.0192 |
| Proposed | 66.46 | 4.04 | | | |
| GBLSTSVM, balls kept (no weight) | 64.97 | nan | +1.50 | 22-0-13 | 0.196 |
| Plain neighbour count | 67.48 | nan | -1.02 | 20-0-15 | 0.768 |

## cv, balanced_accuracy

### noise 0 (35 datasets; Friedman chi2 = 113.58, p = 3.6e-22)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 81.01 | 2.23 | -4.10 | 3-0-32 | 9.05e-06 |
| TSVM | 80.32 | 2.47 | -3.42 | 6-0-29 | 8.38e-06 |
| GBSVM | 66.99 | 6.29 | +9.91 | 31-0-4 | 2.39e-06 |
| LSTSVM | 80.45 | 2.64 | -3.55 | 4-0-31 | 2.59e-06 |
| GBLSTSVM | 74.17 | 5.49 | +2.73 | 28-0-7 | 7.9e-05 |
| LS-GBLSTSVM | 76.93 | 4.49 | -0.03 | 19-0-16 | 0.658 |
| Proposed | 76.90 | 4.40 | | | |
| GBLSTSVM, balls kept (no weight) | 76.88 | nan | +0.02 | 16-0-19 | 0.756 |
| Plain neighbour count | 76.62 | nan | +0.28 | 18-0-17 | 0.857 |

### noise 0.05 (35 datasets; Friedman chi2 = 73.01, p = 9.8e-14)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 79.79 | 2.50 | -2.91 | 8-0-27 | 0.000657 |
| TSVM | 78.68 | 3.40 | -1.79 | 10-0-25 | 0.00484 |
| GBSVM | 69.85 | 5.91 | +7.03 | 27-0-8 | 0.000356 |
| LSTSVM | 79.20 | 2.79 | -2.31 | 7-0-28 | 0.000165 |
| GBLSTSVM | 75.11 | 5.31 | +1.78 | 24-0-11 | 0.0153 |
| LS-GBLSTSVM | 77.83 | 3.69 | -0.95 | 15-0-20 | 0.14 |
| Proposed | 76.88 | 4.40 | | | |
| GBLSTSVM, balls kept (no weight) | 75.89 | nan | +0.99 | 20-0-15 | 0.0885 |
| Plain neighbour count | 76.70 | nan | +0.19 | 16-0-19 | 0.806 |

### noise 0.1 (35 datasets; Friedman chi2 = 67.46, p = 1.4e-12)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 78.75 | 2.77 | -2.95 | 12-0-23 | 0.00207 |
| TSVM | 77.87 | 3.03 | -2.07 | 10-0-25 | 0.000582 |
| GBSVM | 69.24 | 5.87 | +6.56 | 29-0-6 | 0.000188 |
| LSTSVM | 77.93 | 2.81 | -2.13 | 6-0-29 | 4.53e-05 |
| GBLSTSVM | 74.15 | 5.26 | +1.65 | 24-0-11 | 0.036 |
| LS-GBLSTSVM | 76.48 | 4.03 | -0.68 | 16-0-19 | 0.589 |
| Proposed | 75.80 | 4.23 | | | |
| GBLSTSVM, balls kept (no weight) | 75.27 | nan | +0.53 | 16-0-19 | 0.948 |
| Plain neighbour count | 75.43 | nan | +0.37 | 20-0-15 | 0.647 |

### noise 0.15 (35 datasets; Friedman chi2 = 67.98, p = 1.1e-12)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 76.85 | 2.54 | -2.87 | 9-0-26 | 0.000188 |
| TSVM | 75.46 | 3.51 | -1.48 | 10-0-25 | 0.00688 |
| GBSVM | 67.44 | 5.74 | +6.54 | 26-0-9 | 0.000165 |
| LSTSVM | 76.37 | 2.60 | -2.39 | 6-0-29 | 3.18e-05 |
| GBLSTSVM | 72.33 | 5.27 | +1.64 | 26-1-8 | 0.00639 |
| LS-GBLSTSVM | 74.59 | 4.03 | -0.61 | 17-0-18 | 0.87 |
| Proposed | 73.98 | 4.30 | | | |
| GBLSTSVM, balls kept (no weight) | 73.35 | nan | +0.63 | 18-0-17 | 0.334 |
| Plain neighbour count | 74.22 | nan | -0.24 | 13-0-22 | 0.287 |

### noise 0.2 (35 datasets; Friedman chi2 = 79.96, p = 3.6e-15)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 75.21 | 2.51 | -2.18 | 12-0-23 | 0.00355 |
| TSVM | 74.53 | 2.89 | -1.50 | 11-0-24 | 0.000994 |
| GBSVM | 65.56 | 5.99 | +7.48 | 28-1-6 | 3.26e-05 |
| LSTSVM | 74.32 | 3.00 | -1.29 | 9-0-26 | 0.00272 |
| GBLSTSVM | 69.99 | 5.49 | +3.05 | 27-0-8 | 0.000403 |
| LS-GBLSTSVM | 72.85 | 4.23 | +0.18 | 21-0-14 | 0.743 |
| Proposed | 73.03 | 3.90 | | | |
| GBLSTSVM, balls kept (no weight) | 71.82 | nan | +1.21 | 20-0-15 | 0.0642 |
| Plain neighbour count | 72.77 | nan | +0.27 | 22-0-13 | 0.28 |

### noise 0.3 (35 datasets; Friedman chi2 = 50.15, p = 4.4e-09)

| Model | Mean | Avg rank | Proposed − model | W-T-L | Wilcoxon p |
|---|---|---|---|---|---|
| SVM | 69.72 | 2.91 | -1.53 | 12-0-23 | 0.0319 |
| TSVM | 68.56 | 3.17 | -0.37 | 14-0-21 | 0.258 |
| GBSVM | 59.65 | 5.71 | +8.54 | 28-0-7 | 9.69e-05 |
| LSTSVM | 68.69 | 3.31 | -0.50 | 13-0-22 | 0.132 |
| GBLSTSVM | 63.68 | 5.16 | +4.51 | 27-1-7 | 2.15e-05 |
| LS-GBLSTSVM | 67.96 | 4.00 | +0.23 | 20-0-15 | 0.589 |
| Proposed | 68.19 | 3.73 | | | |
| GBLSTSVM, balls kept (no weight) | 65.70 | nan | +2.50 | 27-0-8 | 8.46e-05 |
| Plain neighbour count | 68.43 | nan | -0.24 | 15-0-20 | 0.502 |
