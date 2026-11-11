# New membership probe (shrunk, gapvote, relative)

21 datasets, 5 splits, k in [2, 4, 6]. ROC-AUC of low membership for flipped points (0.5 = chance); '_minority' = within points labelled +1. Last columns: datasets (of 21) where the measure beats T7.

| measure | 10% noise | 20% noise | 30% noise | wins 10% noise | wins 20% noise | wins 30% noise |
|---|---|---|---|---|---|---|
| auc_T7 | 0.885 | 0.868 | 0.821 | 0 | 0 | 0 |
| auc_T7_minority | 0.804 | 0.771 | 0.715 | 4 | 2 | 2 |
| auc_boundary | 0.882 | 0.864 | 0.816 | 1 | 1 | 3 |
| auc_boundary_minority | 0.795 | 0.760 | 0.705 | 3 | 1 | 1 |
| auc_shrunk | 0.890 | 0.867 | 0.809 | 10 | 6 | 5 |
| auc_shrunk_minority | 0.812 | 0.773 | 0.713 | 5 | 2 | 2 |
| auc_gapvote | 0.886 | 0.877 | 0.854 | 15 | 18 | 19 |
| auc_gapvote_minority | 0.811 | 0.791 | 0.747 | 3 | 5 | 5 |
| auc_relative | 0.884 | 0.875 | 0.841 | 12 | 14 | 18 |
| auc_relative_minority | 0.807 | 0.787 | 0.743 | 3 | 3 | 6 |
