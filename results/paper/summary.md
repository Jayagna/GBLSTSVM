# Paper tables (balanced accuracy, %)

## linear, noise 0% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 73.51 | 5.76 | – | – | – |
| GB-keep | 76.67 | 3.95 | 0.00186 | 0.00372 | 17/4 |
| Keep+T7 | 76.83 | 3.95 | 0.00051 | 0.00153 | 19/2 |
| ADPGBG | 75.99 | 4.38 | 0.000241 | 0.000965 | 19/2 |
| GBFTSVM | 71.71 | 6.29 | 0.0195 | 0.0195 | 6/15 |
| LSTSVM | 80.78 | 1.48 | 4.77e-06 | 2.86e-05 | 20/1 |
| FKNN-LSTSVM | 80.26 | 2.19 | 9.54e-06 | 4.77e-05 | 19/2 |

Friedman p = 1.71e-15; Nemenyi CD = 1.97 (k = 7, N = 21).

## linear, noise 10% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 73.30 | 5.26 | – | – | – |
| GB-keep | 75.56 | 4.36 | 0.0793 | 0.159 | 12/8 |
| Keep+T7 | 75.91 | 4.00 | 0.046 | 0.138 | 14/7 |
| ADPGBG | 75.93 | 4.48 | 0.0113 | 0.0454 | 15/6 |
| GBFTSVM | 72.21 | 5.95 | 0.32 | 0.32 | 7/14 |
| LSTSVM | 78.48 | 2.00 | 9.54e-06 | 4.77e-05 | 20/1 |
| FKNN-LSTSVM | 78.58 | 1.95 | 9.54e-07 | 5.72e-06 | 21/0 |

Friedman p = 1.19e-11; Nemenyi CD = 1.97 (k = 7, N = 21).

## linear, noise 20% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 71.03 | 5.19 | – | – | – |
| GB-keep | 73.27 | 3.81 | 0.0384 | 0.0769 | 15/6 |
| Keep+T7 | 73.87 | 3.71 | 0.0113 | 0.034 | 16/5 |
| ADPGBG | 71.57 | 5.10 | 0.609 | 0.609 | 11/10 |
| GBFTSVM | 68.30 | 6.19 | 0.00328 | 0.0131 | 6/15 |
| LSTSVM | 75.66 | 2.38 | 1.34e-05 | 6.68e-05 | 20/1 |
| FKNN-LSTSVM | 76.86 | 1.62 | 1.91e-06 | 1.14e-05 | 20/1 |

Friedman p = 2.31e-13; Nemenyi CD = 1.97 (k = 7, N = 21).

## linear, noise 30% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBLSTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 64.03 | 5.33 | – | – | – |
| GB-keep | 66.25 | 4.62 | 0.0195 | 0.0584 | 14/7 |
| Keep+T7 | 68.90 | 3.10 | 0.000161 | 0.000806 | 18/3 |
| ADPGBG | 65.46 | 4.52 | 0.0822 | 0.164 | 15/6 |
| GBFTSVM | 64.16 | 5.62 | 0.973 | 0.973 | 9/12 |
| LSTSVM | 69.13 | 3.10 | 0.000197 | 0.000806 | 16/5 |
| FKNN-LSTSVM | 71.00 | 1.71 | 1.81e-05 | 0.000109 | 19/2 |

Friedman p = 8.75e-10; Nemenyi CD = 1.97 (k = 7, N = 21).

## twin, noise 0% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBFTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 73.51 | 4.00 | 0.0195 | 0.0584 | 15/6 |
| GBTWSVM | 71.60 | 4.90 | 0.609 | 0.609 | 6/15 |
| GBFTSVM | 71.71 | 4.38 | – | – | – |
| GBFTSVM-keep | 76.24 | 2.50 | 0.00428 | 0.0171 | 17/4 |
| GBFTSVM-adp | 74.44 | 3.24 | 0.0216 | 0.0584 | 15/6 |
| Keep+T7 | 76.83 | 1.98 | 0.001 | 0.00501 | 18/3 |

Friedman p = 3.15e-07; Nemenyi CD = 1.65 (k = 6, N = 21).

## twin, noise 10% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBFTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 73.30 | 3.76 | 0.32 | 0.641 | 14/7 |
| GBTWSVM | 72.35 | 4.38 | 0.946 | 0.946 | 11/10 |
| GBFTSVM | 72.21 | 4.38 | – | – | – |
| GBFTSVM-keep | 75.45 | 2.95 | 0.0384 | 0.115 | 13/8 |
| GBFTSVM-adp | 75.54 | 3.10 | 0.0175 | 0.0702 | 14/7 |
| Keep+T7 | 75.91 | 2.43 | 0.000607 | 0.00304 | 19/2 |

Friedman p = 0.00162; Nemenyi CD = 1.65 (k = 6, N = 21).

## twin, noise 20% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBFTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 71.03 | 3.67 | 0.00328 | 0.00984 | 15/6 |
| GBTWSVM | 69.53 | 4.24 | 0.0701 | 0.0701 | 14/7 |
| GBFTSVM | 68.30 | 4.81 | – | – | – |
| GBFTSVM-keep | 72.32 | 3.10 | 0.000607 | 0.00243 | 17/4 |
| GBFTSVM-adp | 71.86 | 3.19 | 0.0071 | 0.0142 | 16/5 |
| Keep+T7 | 73.87 | 2.00 | 0.000241 | 0.00121 | 18/3 |

Friedman p = 2.56e-05; Nemenyi CD = 1.65 (k = 6, N = 21).

## twin, noise 30% (21 datasets, 10 splits each)

| method | mean | avg rank | Wilcoxon p vs GBFTSVM | Holm p | wins/losses |
|---|---|---|---|---|---|
| GBLSTSVM | 64.03 | 3.81 | 0.973 | 0.973 | 12/9 |
| GBTWSVM | 63.43 | 4.57 | 0.029 | 0.116 | 5/16 |
| GBFTSVM | 64.16 | 3.86 | – | – | – |
| GBFTSVM-keep | 65.98 | 3.05 | 0.128 | 0.384 | 13/8 |
| GBFTSVM-adp | 65.01 | 3.76 | 0.432 | 0.864 | 13/8 |
| Keep+T7 | 68.90 | 1.95 | 0.000852 | 0.00426 | 17/4 |

Friedman p = 0.000195; Nemenyi CD = 1.65 (k = 6, N = 21).

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
