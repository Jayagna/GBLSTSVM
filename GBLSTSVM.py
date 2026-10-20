import time
import warnings
import numpy as np
from sklearn.metrics import confusion_matrix, f1_score, roc_auc_score

warnings.filterwarnings("ignore")


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
    return_details=False
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
    :param return_details: If True, returns a dict with all metrics (acc, auc, sens, spec, gmean, f1, cm, time, preds).
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

    R_pos = R1.reshape(-1, 1)
    R_neg = R2.reshape(-1, 1)

    mat_e1 = np.ones((k1, 1), dtype=np.float64)
    mat_e2 = np.ones((k2, 1), dtype=np.float64)

    # Augmented matrices H = [A, e1], G = [B, e2]
    mat_H = np.column_stack((A, mat_e1))
    mat_G = np.column_stack((B, mat_e2))
    mat_H_t = mat_H.T
    mat_G_t = mat_G.T

    # Total sample estimates from granular balls or custom class_weight
    total_pos_samples = np.sum(num1)
    total_neg_samples = np.sum(num2)
    total_samples = total_pos_samples + total_neg_samples

    # Compute Class Imbalance Weight Matrices W1 (for class +1) and W2 (for class -1)
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

        W1 = np.diag(w1_diag)
        W2 = np.diag(w2_diag)
    else:
        W1 = np.identity(k1, dtype=np.float64)
        W2 = np.identity(k2, dtype=np.float64)

    # -------------------------------------------------------------
    # Hyperplane 1 (close to class +1, far from class -1):
    # (G^T W2 G + (1/c1) * H^T W1 H + reg * I) [w1; b1] = - G^T W2 (e2 + R^-)
    # -------------------------------------------------------------
    reg_I = reg_term * np.identity(mat_H.shape[1], dtype=np.float64)
    mat_G_W2_G = mat_G_t @ W2 @ mat_G
    mat_H_W1_H = mat_H_t @ W1 @ mat_H

    inv_p_1 = np.linalg.inv(mat_G_W2_G + (1.0 / c1) * mat_H_W1_H + reg_I)
    e2_R_neg = mat_e2 + R_neg
    H_rhs = mat_G_t @ W2 @ e2_R_neg
    hyper_p_1 = -1.0 * (inv_p_1 @ H_rhs)

    w1 = np.asarray(hyper_p_1[:-1, :], dtype=np.float64).reshape(-1, 1)
    b1 = float(hyper_p_1[-1, 0])

    # -------------------------------------------------------------
    # Hyperplane 2 (close to class -1, far from class +1):
    # (H^T W1 H + (1/c2) * G^T W2 G + reg * I) [w2; b2] = H^T W1 (e1 + R^+)
    # -------------------------------------------------------------
    inv_p_2 = np.linalg.inv(mat_H_W1_H + (1.0 / c2) * mat_G_W2_G + reg_I)
    e1_R_pos = mat_e1 + R_pos
    G_rhs = mat_H_t @ W1 @ e1_R_pos
    hyper_p_2 = inv_p_2 @ G_rhs

    w2 = np.asarray(hyper_p_2[:-1, :], dtype=np.float64).reshape(-1, 1)
    b2 = float(hyper_p_2[-1, 0])

    # -------------------------------------------------------------
    # Prediction on Test Set
    # -------------------------------------------------------------
    test_X = np.asarray(TestX[:, :-1], dtype=np.float64)
    y_true = np.asarray(TestX[:, -1], dtype=np.int32).flatten()
    y_true[y_true == 0] = -1

    norm_w1 = float(np.linalg.norm(w1))
    norm_w2 = float(np.linalg.norm(w2))
    if norm_w1 < 1e-12:
        norm_w1 = 1.0
    if norm_w2 < 1e-12:
        norm_w2 = 1.0

    # Perpendicular distance to hyperplanes:
    # d1(x) = |w1^T x + b1| / ||w1||
    # d2(x) = |w2^T x + b2| / ||w2||
    dist1 = np.abs(np.dot(test_X, w1).flatten() + b1) / norm_w1
    dist2 = np.abs(np.dot(test_X, w2).flatten() + b2) / norm_w2

    # Point belongs to class whose hyperplane it is closer to
    pred_y = np.where(dist1 < dist2, 1, -1)

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

    elapsed_time = time.time() - st

    if return_details:
        return {
            'accuracy': acc,
            'auc': auc,
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
            'elapsed_time': elapsed_time
        }

    return acc, elapsed_time


