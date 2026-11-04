# Boundary-aware membership probe

21 datasets, 5 splits, k in [2, 4, 6]. ROC-AUC of low membership for flipped points (0.5 = chance); '_minority' = within points labelled +1.

| measure | 10% noise | 20% noise | 30% noise |
|---|---|---|---|
| auc_ball_T7 | 0.885 | 0.868 | 0.821 |
| auc_ball_T7_minority | 0.804 | 0.771 | 0.715 |
| auc_ball_2nd | 0.882 | 0.864 | 0.816 |
| auc_ball_2nd_minority | 0.795 | 0.761 | 0.705 |
| auc_ball_bal | 0.783 | 0.734 | 0.672 |
| auc_ball_bal_minority | 0.804 | 0.771 | 0.716 |
| auc_ball_bal2nd | 0.759 | 0.713 | 0.656 |
| auc_ball_bal2nd_minority | 0.793 | 0.759 | 0.704 |
| auc_point_T7 | 0.892 | 0.869 | 0.821 |
| auc_point_T7_minority | 0.810 | 0.773 | 0.716 |
| auc_point_2nd | 0.889 | 0.866 | 0.818 |
| auc_point_2nd_minority | 0.802 | 0.761 | 0.706 |
| auc_point_bal | 0.797 | 0.738 | 0.673 |
| auc_point_bal_minority | 0.810 | 0.773 | 0.716 |
| auc_point_bal2nd | 0.768 | 0.717 | 0.660 |
| auc_point_bal2nd_minority | 0.799 | 0.760 | 0.705 |
