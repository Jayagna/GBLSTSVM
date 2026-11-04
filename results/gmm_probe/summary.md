# GMM (soft) ball splitting probe

21 datasets, 5 splits, k in [2, 4, 6], single-point balls kept. ROC-AUC of low membership for flipped points (0.5 = chance); '_minority' = within points labelled +1. In brackets: datasets where the measure beats T7 (k-means balls).

| measure | 10% noise | 20% noise | 30% noise |
|---|---|---|---|
| auc_T7 | 0.885 (0) | 0.868 (0) | 0.821 (0) |
| auc_T7_minority | 0.804 | 0.771 | 0.715 |
| auc_cpost_ball | 0.842 (3) | 0.786 (2) | 0.726 (2) |
| auc_cpost_ball_minority | 0.770 | 0.712 | 0.665 |
| auc_T7_gmm | 0.884 (11) | 0.866 (9) | 0.821 (13) |
| auc_T7_gmm_minority | 0.796 | 0.768 | 0.715 |
| auc_ball_last | 0.329 (0) | 0.391 (0) | 0.435 (0) |
| auc_ball_last_minority | 0.411 | 0.442 | 0.466 |
| auc_ball_path | 0.466 (0) | 0.475 (0) | 0.486 (0) |
| auc_ball_path_minority | 0.544 | 0.547 | 0.554 |
| auc_point_last | 0.356 (0) | 0.410 (0) | 0.447 (0) |
| auc_point_last_minority | 0.431 | 0.456 | 0.473 |
| auc_point_path | 0.510 (0) | 0.503 (0) | 0.504 (0) |
| auc_point_path_minority | 0.575 | 0.569 | 0.569 |
| auc_cpost | 0.840 (3) | 0.783 (2) | 0.721 (2) |
| auc_cpost_minority | 0.768 | 0.710 | 0.663 |
| n_balls_kmeans | 215 | 257 | 281 |
| n_balls_gmm | 214 | 256 | 280 |
