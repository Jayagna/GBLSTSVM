"""
Ball-level fuzzy membership functions for GBLSTSVM.

Every function takes the granular balls of one training set and returns a
membership s_i in (0, 1] for each ball, in the same order as the inputs:

    centers : (k, d) ball centres
    radii   : (k,)   ball radii (mean distance of members to the centre)
    labels  : (k,)   ball labels in {-1, +1}; +1 is the minority class
    counts  : (k,)   number of training samples in each ball

The membership multiplies the slack (error) weight of the ball in
LSTWGBSVM, so a low value lets the hyperplane ignore that ball.

Candidates (topic ids follow the progress deck):
    T1 centre   : distance of the ball centre to its class centre
    T2 entropy  : class entropy among the nearest neighbouring balls
    T4 overlap  : how deeply the ball overlaps balls of the other class
    T5 density  : samples per unit radius, relative to the class
    T7 agreement: share of the ball's own class among its nearest balls
"""
import numpy as np

EPS = 1e-12


def _as_arrays(centers, radii, labels, counts):
    centers = np.asarray(centers, dtype=np.float64)
    radii = np.asarray(radii, dtype=np.float64).reshape(-1)
    labels = np.asarray(labels, dtype=np.float64).reshape(-1)
    counts = np.asarray(counts, dtype=np.float64).reshape(-1)
    return centers, radii, labels, counts


def _pairwise_distances(centers):
    sq = np.sum(centers ** 2, axis=1)
    d2 = sq[:, None] + sq[None, :] - 2.0 * centers @ centers.T
    return np.sqrt(np.maximum(d2, 0.0))


def membership_none(centers, radii, labels, counts, param=None):
    return np.ones(len(radii), dtype=np.float64)


def membership_centre(centers, radii, labels, counts, param=None, delta=1e-6):
    """T1: s_i = 1 - d_i / (max_j d_j + delta), d_i = distance to the
    count-weighted centre of the ball's own class (Lin & Wang FSVM at ball level)."""
    centers, radii, labels, counts = _as_arrays(centers, radii, labels, counts)
    s = np.ones(len(radii), dtype=np.float64)
    for y in (-1.0, 1.0):
        mask = labels == y
        if not np.any(mask):
            continue
        class_centre = np.average(centers[mask], axis=0, weights=counts[mask])
        d = np.linalg.norm(centers[mask] - class_centre, axis=1)
        s[mask] = 1.0 - d / (d.max() + delta)
    return np.clip(s, 1e-3, 1.0)


def membership_entropy(centers, radii, labels, counts, param=5, floor=0.1):
    """T2: entropy of class shares among the `param` nearest balls (weighted by
    sample counts). Low entropy (a homogeneous neighbourhood) gives high
    membership. Minority (+1) balls keep membership 1, as in EFSVM."""
    centers, radii, labels, counts = _as_arrays(centers, radii, labels, counts)
    k_nn = int(param)
    n = len(radii)
    s = np.ones(n, dtype=np.float64)
    if n < 2:
        return s
    dist = _pairwise_distances(centers)
    np.fill_diagonal(dist, np.inf)
    k_nn = min(k_nn, n - 1)
    nn = np.argsort(dist, axis=1)[:, :k_nn]
    for i in range(n):
        if labels[i] == 1.0:
            continue
        w = counts[nn[i]]
        p_pos = np.sum(w[labels[nn[i]] == 1.0]) / (np.sum(w) + EPS)
        p = np.array([p_pos, 1.0 - p_pos])
        p = p[p > 0]
        h = -np.sum(p * np.log(p)) / np.log(2.0)
        s[i] = max(floor, 1.0 - h)
    return s


def membership_overlap(centers, radii, labels, counts, param=1.0, eps=1e-6):
    """T4: s_i = exp(-lambda * sum_j o_ij / (r_i + eps)), where
    o_ij = max(0, r_i + r_j - ||c_i - c_j||) over balls j of the other class.
    Uses the ball radii, so it has no counterpart for point-based fuzzy SVMs."""
    centers, radii, labels, counts = _as_arrays(centers, radii, labels, counts)
    lam = float(param)
    dist = _pairwise_distances(centers)
    overlap = np.maximum(0.0, radii[:, None] + radii[None, :] - dist)
    other = labels[:, None] != labels[None, :]
    depth = np.sum(overlap * other, axis=1) / (radii + eps)
    return np.exp(-lam * depth)


def membership_density(centers, radii, labels, counts, param=0.5, eps=1e-6):
    """T5: rho_i = n_i / (r_i + eps), normalised by the largest rho of the
    class; s_i = (rho_i / max rho)^gamma. Dense, tight balls are trusted."""
    centers, radii, labels, counts = _as_arrays(centers, radii, labels, counts)
    gamma = float(param)
    rho = counts / (radii + eps)
    s = np.ones(len(radii), dtype=np.float64)
    for y in (-1.0, 1.0):
        mask = labels == y
        if np.any(mask):
            s[mask] = (rho[mask] / (rho[mask].max() + EPS)) ** gamma
    return np.clip(s, 1e-3, 1.0)


def membership_agreement(centers, radii, labels, counts, param=(10, 1.0), floor=1e-3):
    """T7: a_i = count-weighted share of ball i's own class among its k nearest
    balls; s_i = a_i ** gamma with param = (k, gamma). A ball surrounded by the
    other class (a likely mislabelled point) gets a low membership. With every
    sample as its own ball this is the classic kNN fuzzy membership."""
    centers, radii, labels, counts = _as_arrays(centers, radii, labels, counts)
    k_nn, gamma = param
    n = len(radii)
    if n < 2:
        return np.ones(n, dtype=np.float64)
    dist = _pairwise_distances(centers)
    np.fill_diagonal(dist, np.inf)
    k_nn = min(int(k_nn), n - 1)
    nn = np.argpartition(dist, k_nn - 1, axis=1)[:, :k_nn]
    w = counts[nn]
    agree = np.sum(w * (labels[nn] == labels[:, None]), axis=1) / (np.sum(w, axis=1) + EPS)
    return np.clip(agree ** float(gamma), floor, 1.0)


MEMBERSHIPS = {
    "none": membership_none,
    "centre": membership_centre,
    "entropy": membership_entropy,
    "overlap": membership_overlap,
    "density": membership_density,
    "agreement": membership_agreement,
}


def compute_membership(name, centers, radii, labels, counts, param=None):
    if name not in MEMBERSHIPS:
        raise ValueError(f"Unknown membership '{name}'. Choose from {sorted(MEMBERSHIPS)}")
    fn = MEMBERSHIPS[name]
    if param is None:
        return fn(centers, radii, labels, counts)
    return fn(centers, radii, labels, counts, param=param)
