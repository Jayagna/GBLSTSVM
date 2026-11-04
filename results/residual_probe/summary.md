# Residual membership probe

21 datasets, 5 splits, k in [2, 4, 6]. ROC-AUC of low membership for flipped points (0.5 = chance), averaged over splits and k per dataset, then over datasets. In brackets: datasets where the measure beats T7.

| measure | 10% noise | 20% noise | 30% noise |
|---|---|---|---|
| auc_point_knn | 0.892 (17) | 0.869 (11) | 0.822 (9) |
| auc_res_point_1 | 0.815 (8) | 0.760 (4) | 0.703 (4) |
| auc_T7 | 0.885 (0) | 0.868 (0) | 0.821 (0) |
| auc_res_0.1 | 0.660 (3) | 0.649 (2) | 0.602 (2) |
| auc_res_1 | 0.565 (2) | 0.556 (1) | 0.537 (2) |
| auc_T7xres_1 | 0.877 (9) | 0.827 (9) | 0.740 (6) |
| auc_res_10 | 0.504 (0) | 0.506 (0) | 0.504 (0) |
