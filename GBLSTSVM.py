import time
import warnings
import numpy as np
from sklearn.metrics import confusion_matrix, f1_score, roc_auc_score

warnings.filterwarnings("ignore")


def solve_gb_planes(A, R_pos, B, R_neg, c1, c2, prox_pos, slack_pos, prox_neg, slack_neg, reg_term=0.0001):
    """
    Solve the two GBLSTSVM hyperplanes with per-ball weight vectors.

    Plane 1 (close to +1 balls): proximity term on +1 balls, slack term on -1 balls
        (G^T Q2 G + (1/c1) H^T P1 H + reg I) z1 = - G^T Q2 (e2 + R^-)
    Plane 2 (close to -1 balls): proximity term on -1 balls, slack term on +1 balls
        (H^T Q1 H + (1/c2) G^T P2 G + reg I) z2 = H^T Q1 (e1 + R^+)
    P = diag(prox_*), Q = diag(slack_*). With P = Q = class weights this is the
    original CIL GBLSTSVM; a fuzzy membership multiplies Q only.

    :return: (w1, b1, w2, b2)
    """
    A = np.asarray(A, dtype=np.float64)
    B = np.asarray(B, dtype=np.float64)
    R_pos = np.asarray(R_pos, dtype=np.float64).reshape(-1)
    R_neg = np.asarray(R_neg, dtype=np.float64).reshape(-1)
    H = np.column_stack((A, np.ones(len(A))))
    G = np.column_stack((B, np.ones(len(B))))
    reg_I = reg_term * np.identity(H.shape[1], dtype=np.float64)

    G_Q2 = G.T * slack_neg
    H_Q1 = H.T * slack_pos
    lhs1 = G_Q2 @ G + (1.0 / c1) * ((H.T * prox_pos) @ H) + reg_I
    z1 = -np.linalg.solve(lhs1, G_Q2 @ (1.0 + R_neg))
    lhs2 = H_Q1 @ H + (1.0 / c2) * ((G.T * prox_neg) @ G) + reg_I
    z2 = np.linalg.solve(lhs2, H_Q1 @ (1.0 + R_pos))
    return z1[:-1].reshape(-1, 1), float(z1[-1]), z2[:-1].reshape(-1, 1), float(z2[-1])


def gb_decision_scores(X, w1, b1, w2, b2):
    """
    Signed score d2(x) - d1(x): positive when x is closer to plane 1 (class +1).
    Prediction is +1 when the score is > 0, matching the nearest-plane rule.
    """
    X = np.asarray(X, dtype=np.float64)
    norm_w1 = float(np.linalg.norm(w1))
    norm_w2 = float(np.linalg.norm(w2))
    if norm_w1 < 1e-12:
        norm_w1 = 1.0
    if norm_w2 < 1e-12:
        norm_w2 = 1.0
    dist1 = np.abs(X @ w1 + b1).flatten() / norm_w1
    dist2 = np.abs(X @ w2 + b2).flatten() / norm_w2
    return dist2 - dist1


def LSTWGBSVM(
    Data,
    TestX,
    c1=1.0,
    c2=1.0,
    use_imbalance=True,
    class_weight=None,
    balance_power=1.0,
    ball_weight_power=0.0,
    reg_term=0.0001,
    return_details=False,
    membership=None,
    membership_on="slack"
):
    """
    Granular Ball Least Square Twin Support Vector Machine (GBLSTSVM)
    with Class Imbalance Learning (CIL).

    :param Data: Granular ball training matrix.
                 Columns can be:
                 - [centers (dim d), radius (1), label (1)]
                 - or [centers (dim d), radius (1), label (1), sample_count (1)]
    :param TestX: Test data matrix [features (dim d), true_labels (1)].
    :param c1: Penalty parameter for positive hyperplane (f1).
    :param c2: Penalty parameter for negative hyperplane (f2).
    :param use_imbalance: Whether to apply class imbalance weighting.
    :param class_weight: Optional dict {1: w_pos, -1: w_neg} or 'balanced'.
    :param balance_power: Exponent for class imbalance ratio (default 1.0).
    :param ball_weight_power: Exponent for sample count weighting per granular ball (default 0.0).
    :param reg_term: Regularization term for matrix inversion stability.
    :param membership: Optional fuzzy membership per ball (same row order as Data), values in (0, 1].
                       See fuzzy_membership.py.
    :param membership_on: "slack" (default) applies the membership to the slack term only;
                          "both" also applies it to the proximity term.
    :param return_details: If True, returns a dict with all metrics (acc, auc, roc_auc, sens, spec, gmean, f1, cm, time, preds).
                           Note: 'auc' is balanced accuracy (sens + spec) / 2, kept for backwards
                           compatibility; 'roc_auc' is the ROC-AUC of the plane-distance score.
                           If False, returns (accuracy, elapsed_time) for backwards compatibility.
    :return: (accuracy, elapsed_time) or metric dictionary.
    """
    st = time.time()

    Data = np.asarray(Data)
    TestX = np.asarray(TestX)

    # Separate positive (+1) and negative (-1) granular balls
    # Label is in column -1 if 3 items, or column -2 if 4th item is sample_count
    # Detect structure of Data:
    num_cols = Data.shape[1]
    
    # Check if last column or second to last column is label
    # Standard format: [center_1 ... center_d, radius, label]
    # Extended format: [center_1 ... center_d, radius, label, sample_count]
    if np.all(np.isin(Data[:, -1], [-1, 1, 0])):
        label_col = -1
        has_sample_counts = False
    elif np.all(np.isin(Data[:, -2], [-1, 1, 0])):
        label_col = -2
        has_sample_counts = True
    else:
        label_col = -1
        has_sample_counts = False

    labels = Data[:, label_col].copy()
    labels[labels == 0] = -1

    pos_mask = (labels == 1)
    neg_mask = (labels == -1)

    C1_data = Data[pos_mask]
    C2_data = Data[neg_mask]

    k1 = C1_data.shape[0]
    k2 = C2_data.shape[0]

    if k1 == 0 or k2 == 0:
        raise ValueError(f"Insufficient granular balls: positive={k1}, negative={k2}")

    # Extract centers and radii
    if has_sample_counts:
        A = np.asarray(C1_data[:, :label_col - 1], dtype=np.float64)
        R1 = np.asarray(C1_data[:, label_col - 1], dtype=np.float64)
        num1 = np.asarray(C1_data[:, -1], dtype=np.float64)

        B = np.asarray(C2_data[:, :label_col - 1], dtype=np.float64)
        R2 = np.asarray(C2_data[:, label_col - 1], dtype=np.float64)
        num2 = np.asarray(C2_data[:, -1], dtype=np.float64)
    else:
        A = np.asarray(C1_data[:, :-2], dtype=np.float64)
        R1 = np.asarray(C1_data[:, -2], dtype=np.float64)
        num1 = np.ones(k1, dtype=np.float64)

        B = np.asarray(C2_data[:, :-2], dtype=np.float64)
        R2 = np.asarray(C2_data[:, -2], dtype=np.float64)
        num2 = np.ones(k2, dtype=np.float64)

    # Total sample estimates from granular balls or custom class_weight
    total_pos_samples = np.sum(num1)
    total_neg_samples = np.sum(num2)

    # Class imbalance weights for class +1 (w1_diag) and class -1 (w2_diag)
    if use_imbalance:
        if isinstance(class_weight, dict):
            w_pos = float(class_weight.get(1, 1.0))
            w_neg = float(class_weight.get(-1, class_weight.get(0, 1.0)))
        else:
            # Class-specific inverse frequency ratio
            # Minority class gets weight > 1, majority class weight = 1
            if total_pos_samples > 0 and total_neg_samples > 0:
                ratio = (total_neg_samples / total_pos_samples) ** balance_power
                w_pos = ratio
                w_neg = 1.0
            else:
                w_pos = 1.0
                w_neg = 1.0

        # Granular ball weighting: combines class imbalance weight with individual ball sample volume
        if ball_weight_power > 0 and total_pos_samples > 0 and total_neg_samples > 0:
            w1_diag = w_pos * ((num1 / total_pos_samples) ** ball_weight_power)
            w2_diag = w_neg * ((num2 / total_neg_samples) ** ball_weight_power)
            # Normalize scale
            w1_diag = w1_diag / (np.mean(w1_diag) + 1e-12) * w_pos
            w2_diag = w2_diag / (np.mean(w2_diag) + 1e-12) * w_neg
        else:
            w1_diag = np.full(k1, w_pos, dtype=np.float64)
            w2_diag = np.full(k2, w_neg, dtype=np.float64)
    else:
        w1_diag = np.ones(k1, dtype=np.float64)
        w2_diag = np.ones(k2, dtype=np.float64)

    # Fuzzy membership of each ball (1 = fully trusted)
    if membership is not None:
        membership = np.asarray(membership, dtype=np.float64).reshape(-1)
        s_pos = membership[pos_mask]
        s_neg = membership[neg_mask]
    else:
        s_pos = np.ones(k1, dtype=np.float64)
        s_neg = np.ones(k2, dtype=np.float64)

    slack_pos = w1_diag * s_pos
    slack_neg = w2_diag * s_neg
    if membership_on == "both":
        prox_pos, prox_neg = slack_pos, slack_neg
    else:
        prox_pos, prox_neg = w1_diag, w2_diag

    w1, b1, w2, b2 = solve_gb_planes(
        A, R1, B, R2, c1, c2,
        prox_pos=prox_pos, slack_pos=slack_pos,
        prox_neg=prox_neg, slack_neg=slack_neg,
        reg_term=reg_term,
    )

    # -------------------------------------------------------------
    # Prediction on Test Set: point belongs to the class whose plane is closer
    # -------------------------------------------------------------
    test_X = np.asarray(TestX[:, :-1], dtype=np.float64)
    y_true = np.asarray(TestX[:, -1], dtype=np.int32).flatten()
    y_true[y_true == 0] = -1

    scores = gb_decision_scores(test_X, w1, b1, w2, b2)
    pred_y = np.where(scores > 0, 1, -1)

    # -------------------------------------------------------------
    # Performance Metrics
    # -------------------------------------------------------------
    tp = int(np.sum((y_true == 1) & (pred_y == 1)))
    fn = int(np.sum((y_true == 1) & (pred_y == -1)))
    tn = int(np.sum((y_true == -1) & (pred_y == -1)))
    fp = int(np.sum((y_true == -1) & (pred_y == 1)))

    acc = float(np.mean(pred_y == y_true) * 100.0)
    sens = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0  # Minority / Positive recall
    spec = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0  # Majority / Negative recall
    auc = float((sens + spec) / 2.0)
    gmean = float(np.sqrt(sens * spec))
    f1 = float(f1_score(y_true, pred_y, pos_label=1, zero_division=0))
    roc_auc = float(roc_auc_score(y_true, scores)) if len(np.unique(y_true)) == 2 else float("nan")

    elapsed_time = time.time() - st

    if return_details:
        return {
            'accuracy': acc,
            'auc': auc,
            'balanced_accuracy': auc,
            'roc_auc': roc_auc,
            'sensitivity': sens,
            'specificity': spec,
            'gmean': gmean,
            'f1_score': f1,
            'confusion_matrix': np.array([[tn, fp], [fn, tp]]),
            'tp': tp,
            'fn': fn,
            'tn': tn,
            'fp': fp,
            'w1': w1,
            'b1': b1,
            'w2': w2,
            'b2': b2,
            'predictions': pred_y,
            'scores': scores,
            'elapsed_time': elapsed_time
        }

    return acc, elapsed_time


