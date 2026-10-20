# Noise diagnostics

21 datasets, 5 splits, k in [2, 4, 6]. Averaged over splits and k within each dataset, then over datasets.

| measure | 10% noise | 20% noise | 30% noise |
|---|---|---|---|
| deleted_flipped | 0.878 | 0.854 | 0.820 |
| deleted_clean | 0.413 | 0.520 | 0.602 |
| deleted_clean_minority | 0.613 | 0.653 | 0.690 |
| deleted_clean_majority | 0.371 | 0.492 | 0.585 |
| auc_singleton | 0.733 | 0.667 | 0.609 |
| auc_point_knn | 0.892 | 0.869 | 0.822 |
| auc_T1 | 0.703 | 0.646 | 0.603 |
| auc_T2 | 0.289 | 0.264 | 0.251 |
| auc_T4 | 0.485 | 0.491 | 0.494 |
| auc_T5 | 0.264 | 0.330 | 0.389 |
| auc_T7 | 0.885 | 0.868 | 0.821 |
