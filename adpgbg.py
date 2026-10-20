"""
Adaptive granular-ball generation by shortest heterogeneous distance (ADPGBG).

Python port of Algorithm 1 in
    Liao, W., Zhang, Q., Xie, Q., Gao, M., & Jin, P. (2025). A new adaptive and
    effective granular ball generation method for classification.
    International Journal of Machine Learning and Cybernetics, 16, 3501-3520.
following the MATLAB version in the GBLSTSVM_MATLAB research suite (adpgbg_gen_balls.m).

Each ball grows around a randomly drawn sample up to its nearest sample of the
other class, so every ball is pure. A sample that has no same-class neighbour
inside its second-nearest heterogeneous distance is treated as an outlier and
gets no ball. Unlike the k-means generator, no k and no purity threshold are
needed.
"""
import numpy as np


def _ball(data, members, label, hd1):
    pts = data[members, :-1]
    center = pts.mean(axis=0)
    r = float(np.mean(np.linalg.norm(pts - center, axis=1)))
    if r < 1e-6:
        # A single point (or identical points): half the gap to the other class
        r = 0.5 * hd1
    return {"center": center, "r": r, "label": float(label), "num": int(len(members)),
            "purity": 1.0, "indices": members.tolist()}


def adpgbg_gen_balls(data, seed=0):
    """data: (N, d+1) array with labels in the last column.
    Returns a list of ball dicts (center, r, label, num, purity, indices) in the
    format of gen_balls(..., return_details=True); outliers belong to no ball."""
    data = np.asarray(data, dtype=np.float64)
    X, y = data[:, :-1], data[:, -1]
    n = len(data)
    rng = np.random.default_rng(seed)
    remaining = np.ones(n, dtype=bool)
    balls = []
    for _ in range(2 * n):
        if not remaining.any():
            break
        centres = [rng.choice(np.flatnonzero(remaining & (y == c))) for c in np.unique(y[remaining])]
        for ci in centres:
            if not remaining[ci]:
                continue  # consumed by an earlier ball in this round
            label = y[ci]
            same = y == label
            dist = np.linalg.norm(X - X[ci], axis=1)
            if same.all():
                members = np.flatnonzero(remaining & same)
                balls.append(_ball(data, members, label, 1e-4))
                remaining[members] = False
                continue
            hd = np.unique(dist[~same])
            hd1 = hd[0]
            hd2 = hd[1] if len(hd) > 1 else 1.5 * hd1
            t_mask = remaining & same & (dist < hd1)
            if not t_mask.any():
                t_mask = remaining & same & (dist < 1e-12)
            if t_mask.sum() == 1:
                if np.sum(same & (dist < hd2)) == 1:
                    remaining[t_mask] = False  # outlier: discarded without a ball
                    continue
                s_mask = remaining & same & (dist < hd2)
                if not s_mask.any():
                    s_mask = t_mask
                t_mask = s_mask
            members = np.flatnonzero(t_mask)
            balls.append(_ball(data, members, label, hd1))
            remaining[members] = False
    return balls
