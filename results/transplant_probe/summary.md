# Transplanted membership probe

21 datasets, 5 splits, k in [2, 4, 6], single-point balls kept. ROC-AUC of low membership for flipped points (0.5 = chance); '_minority' = within points labelled +1. In brackets: datasets where the measure beats T7 overall.

| measure | 10% noise | 20% noise | 30% noise |
|---|---|---|---|
| auc_T7 | 0.885 (0) | 0.868 (0) | 0.821 (0) |
| auc_T7_minority | 0.804 | 0.771 | 0.715 |
| auc_T1 | 0.703 (0) | 0.646 (0) | 0.603 (0) |
| auc_T1_minority | 0.561 | 0.487 | 0.438 |
| auc_IF | 0.757 (0) | 0.694 (0) | 0.640 (0) |
| auc_IF_minority | 0.621 | 0.538 | 0.474 |
| auc_FR | 0.654 (0) | 0.596 (0) | 0.557 (0) |
| auc_FR_minority | 0.706 | 0.680 | 0.662 |
