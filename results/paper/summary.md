# Paper tables (balanced accuracy, %)

## linear, noise 0% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 73.51 | 5.48 | – | – | – |
| GB-keep | 76.67 | 3.86 | 0.00186 | 0.00186 | 17/4 |
| Keep+T7 | 76.83 | 3.81 | 0.00051 | 0.00102 | 19/2 |
| ADPGBG | 75.99 | 4.33 | 0.000241 | 0.000724 | 19/2 |
| LSTSVM | 80.78 | 1.43 | 4.77e-06 | 2.38e-05 | 20/1 |
| FKNN-LSTSVM | 80.26 | 2.10 | 9.54e-06 | 3.81e-05 | 19/2 |

Friedman p = 5.41e-13; Nemenyi CD = 1.65 (k = 6, N = 21).

## linear, noise 10% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 73.30 | 4.93 | – | – | – |
| GB-keep | 75.56 | 4.17 | 0.0793 | 0.092 | 12/8 |
| Keep+T7 | 75.91 | 3.90 | 0.046 | 0.092 | 14/7 |
| ADPGBG | 75.93 | 4.14 | 0.0113 | 0.034 | 15/6 |
| LSTSVM | 78.48 | 1.95 | 9.54e-06 | 3.81e-05 | 20/1 |
| FKNN-LSTSVM | 78.58 | 1.90 | 9.54e-07 | 4.77e-06 | 21/0 |

Friedman p = 3.42e-09; Nemenyi CD = 1.65 (k = 6, N = 21).

## linear, noise 20% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 71.03 | 4.90 | – | – | – |
| GB-keep | 73.27 | 3.71 | 0.0384 | 0.0769 | 15/6 |
| Keep+T7 | 73.87 | 3.57 | 0.0113 | 0.034 | 16/5 |
| ADPGBG | 71.57 | 4.86 | 0.609 | 0.609 | 11/10 |
| LSTSVM | 75.66 | 2.33 | 1.34e-05 | 5.34e-05 | 20/1 |
| FKNN-LSTSVM | 76.86 | 1.62 | 1.91e-06 | 9.54e-06 | 20/1 |

Friedman p = 4.08e-10; Nemenyi CD = 1.65 (k = 6, N = 21).

## linear, noise 30% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 64.03 | 4.90 | – | – | – |
| GB-keep | 66.25 | 4.48 | 0.0195 | 0.0389 | 14/7 |
| Keep+T7 | 68.90 | 2.90 | 0.000161 | 0.000645 | 18/3 |
| ADPGBG | 65.46 | 4.19 | 0.0822 | 0.0822 | 15/6 |
| LSTSVM | 69.13 | 2.90 | 0.000197 | 0.000645 | 16/5 |
| FKNN-LSTSVM | 71.00 | 1.62 | 1.81e-05 | 9.06e-05 | 19/2 |

Friedman p = 9.53e-09; Nemenyi CD = 1.65 (k = 6, N = 21).

## kernel, noise 0% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 77.19 | 4.26 | – | – | – |
| GB-keep | 78.40 | 3.55 | 0.32 | 0.32 | 13/8 |
| Keep+T7 | 79.32 | 2.98 | 0.0304 | 0.0607 | 15/5 |
| LSTSVM | 80.37 | 2.14 | 0.000131 | 0.000392 | 19/2 |
| FKNN-LSTSVM | 80.78 | 2.07 | 9.54e-07 | 3.81e-06 | 21/0 |

Friedman p = 6.32e-06; Nemenyi CD = 1.33 (k = 5, N = 21).

## kernel, noise 20% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 70.62 | 2.90 | – | – | – |
| GB-keep | 68.29 | 4.33 | 0.00554 | 0.0195 | 5/16 |
| Keep+T7 | 70.55 | 2.76 | 0.919 | 1 | 11/10 |
| LSTSVM | 69.95 | 3.33 | 0.517 | 1 | 9/12 |
| FKNN-LSTSVM | 73.29 | 1.67 | 0.00488 | 0.0195 | 15/6 |

Friedman p = 2.59e-06; Nemenyi CD = 1.33 (k = 5, N = 21).

## kernel, noise 30% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 63.01 | 3.10 | – | – | – |
| GB-keep | 61.84 | 3.71 | 0.179 | 0.503 | 7/14 |
| Keep+T7 | 64.13 | 2.76 | 0.168 | 0.503 | 12/9 |
| LSTSVM | 62.40 | 3.71 | 0.393 | 0.503 | 8/13 |
| FKNN-LSTSVM | 65.96 | 1.71 | 0.00286 | 0.0114 | 17/4 |

Friedman p = 0.000126; Nemenyi CD = 1.33 (k = 5, N = 21).
