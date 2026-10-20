"""
GBTWSVM and GBFTSVM: twin SVMs on granular balls, solved through their duals.

Python implementation of
    Zhao, L., Ding, W., Miao, D., Lang, G. (2024). Granular-balls based fuzzy twin
    support vector machine for classification. arXiv:2408.00699.
following its equations (29)-(45):

  * Plane 1 (close to the +1 balls) solves
        max_a  a^T (e + rB) - 1/2 a^T F (E^T E + eps I)^-1 F^T a,   0 <= a <= C1 sB
    with E = [cA e], F = [cB e]; then [w1 b1] = -(E^T E + eps I)^-1 F^T a.
  * Plane 2 (close to the -1 balls) solves
        max_g  g^T (e + rA) - 1/2 g^T R (S^T S + eps I)^-1 R^T g,   0 <= g <= C2 sA
    with R = [cA e], S = [cB e]; then [w2 b2] = (S^T S + eps I)^-1 R^T g.
  * A point goes to the class of the nearer plane, |w_t x + b_t| / ||w_t||.

GBTWSVM is the same model with every ball score s = 1. In GBFTSVM the score of a
ball is its Pythagorean fuzzy closeness (pythagorean_scores).

Solver: the paper uses L-BFGS-B on each box QP. On our ball sets L-BFGS-B sometimes
stops far from the optimum (on ger it returned planes 100% off an interior-point
reference), so each QP is solved instead as the equivalent linear SVM dual: with
K = L L^T and x_i = (L^-1 q_i) / (1 + r_i), the dual above is liblinear's L1-loss SVM
dual (no bias, per-sample cost C s_i (1 + r_i)), solved by dual coordinate descent
(sklearn LinearSVC). Its planes match an interior-point solve to about 1e-6.
"""
import warnings

import numpy as np
from scipy.linalg import solve_triangular
from sklearn.svm import LinearSVC


def pythagorean_scores(centers, labels, purity, eps=1e-4):
    """GBFTSVM ball scores, eqs. (25)-(32).

    mu    = 1 - ||c_i - C|| / (R + eps), with C the mean centre of the ball's class and
            R the largest centre distance in that class
    nu^2  = (1 - mu^2) (1 - purity)
    theta = sqrt((1 - nu^2) / (2 - mu^2 - nu^2))
    score = mu for pure balls (purity 1), theta for the others.
    """
    centers = np.asarray(centers, dtype=np.float64)
    labels = np.asarray(labels)
    purity = np.asarray(purity, dtype=np.float64)
    scores = np.ones(len(labels))
    for cls in np.unique(labels):
        m = labels == cls
        dist = np.linalg.norm(centers[m] - centers[m].mean(axis=0), axis=1)
        mu = 1.0 - dist / (dist.max() + eps)
        nu2 = (1.0 - mu ** 2) * (1.0 - purity[m])
        theta = np.sqrt((1.0 - nu2) / (2.0 - mu ** 2 - nu2))
        scores[m] = np.where(purity[m] >= 1.0 - 1e-12, mu, theta)
    return scores


class PlaneDual:
    """Dual of one twin plane: min_a 1/2 a^T Q K^-1 Q^T a - a^T (1 + r), 0 <= a <= upper,
    with K = P^T P + eps I, P = [own-class centres, 1] and Q = [other-class centres, 1].
    K is factorised once, so solving for several upper bounds is cheap."""

    def __init__(self, own_centers, other_centers, other_radii, reg=1e-4):
        P = np.column_stack((own_centers, np.ones(len(own_centers))))
        Q = np.column_stack((other_centers, np.ones(len(other_centers))))
        self.L = np.linalg.cholesky(P.T @ P + reg * np.identity(P.shape[1]))
        self.Gt = solve_triangular(self.L, Q.T, lower=True)  # Q K^-1 Q^T = Gt^T Gt
        self.q = 1.0 + np.asarray(other_radii, dtype=np.float64).reshape(-1)

    def solve(self, upper, tol=1e-6):
        """z = K^-1 Q^T a for the optimal multipliers a, i.e. the plane's [w b] up to sign."""
        upper = np.asarray(upper, dtype=np.float64)
        if len(upper) == 1:  # one constraint: a = clip(q / h, 0, upper)
            h = float(self.Gt[:, 0] @ self.Gt[:, 0])
            w_t = self.Gt[:, 0] * min(max(self.q[0] / h, 0.0), upper[0])
        else:
            # liblinear needs two classes; the sign flips cancel in y_i x_i
            y = np.where(np.arange(len(upper)) % 2 == 0, 1, -1)
            X = (self.Gt / self.q).T * y[:, None]
            svc = LinearSVC(loss="hinge", dual=True, fit_intercept=False, C=1.0, tol=tol, max_iter=1_000_000,
                            random_state=0)
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")  # convergence warnings; the tolerance is checked in check_gbftsvm.py
                svc.fit(X, y, sample_weight=upper * self.q)
            w_t = svc.coef_.ravel()
        return solve_triangular(self.L.T, w_t, lower=False)


def twin_planes_over_grid(centers, radii, labels, scores, c_grid, w_pos=1.0, reg=1e-4):
    """Both GBTWSVM/GBFTSVM planes for every C in c_grid (C1 = C3, C2 = C4 as in the paper).

    w_pos weights the +1 class (class-imbalance option): it divides C1, since it scales
    the proximity term of plane 1, and multiplies C2, since it scales the +1 slacks of plane 2.
    Returns ([(w1, b1) per C], [(w2, b2) per C])."""
    pos = labels == 1
    neg = ~pos
    plane1 = PlaneDual(centers[pos], centers[neg], radii[neg], reg)
    plane2 = PlaneDual(centers[neg], centers[pos], radii[pos], reg)
    first, second = [], []
    for c in c_grid:
        z1 = plane1.solve((c / w_pos) * scores[neg])
        z2 = plane2.solve((c * w_pos) * scores[pos])
        first.append((-z1[:-1].reshape(-1, 1), float(-z1[-1])))
        second.append((z2[:-1].reshape(-1, 1), float(z2[-1])))
    return first, second


def twin_planes(centers, radii, labels, scores, c1, c2, w_pos=1.0, reg=1e-4):
    """(w1, b1, w2, b2) for one pair (C1, C2)."""
    pos = labels == 1
    neg = ~pos
    z1 = PlaneDual(centers[pos], centers[neg], radii[neg], reg).solve((c1 / w_pos) * scores[neg])
    z2 = PlaneDual(centers[neg], centers[pos], radii[pos], reg).solve((c2 * w_pos) * scores[pos])
    return -z1[:-1].reshape(-1, 1), float(-z1[-1]), z2[:-1].reshape(-1, 1), float(z2[-1])
