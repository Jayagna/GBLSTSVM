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
    boundary    : T7 discounted only when the neighbours agree with each other (intruders)
    shrunk      : T7 shrunk towards 1 by the ball's own size (big balls vouch for themselves)
    gapvote     : T7 with a soft vote over surface-to-surface gaps (uses the radii)
    relative    : gap to the nearest other-class balls relative to the nearest same-class balls
"""
import numpy as np

EPS = 1e-12
DENSE_LIMIT = 1000  # above this many balls, neighbours come from a k-d tree (same result, faster)
TIE_BREAK = True  # gapvote: break tied gaps (overlapping balls, gap 0) by centre distance; False = arbitrary order as in the first runs
GAP_DENSE_LIMIT = 5000  # gapvote: above this many balls, exact gap neighbours from a k-d tree (no m x m matrix)


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


def _tree_neighbours(centers, k_nn):
    """Indices of the k_nn nearest other rows, by a k-d tree (no n x n matrix)."""
    from scipy.spatial import cKDTree
    _, idx = cKDTree(centers).query(centers, k=k_nn + 1)
    rows = np.arange(len(centers))[:, None]
    not_self = idx != rows
    # drop the row itself; with duplicate points it may not come first
    keep = not_self & (np.cumsum(not_self, axis=1) <= k_nn)
    return idx[keep].reshape(len(centers), k_nn)


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
    k_nn = min(int(k_nn), n - 1)
    if n > DENSE_LIMIT:
        nn = _tree_neighbours(centers, k_nn)
    else:
        dist = _pairwise_distances(centers)
        np.fill_diagonal(dist, np.inf)
        nn = np.argpartition(dist, k_nn - 1, axis=1)[:, :k_nn]
    w = counts[nn]
    agree = np.sum(w * (labels[nn] == labels[:, None]), axis=1) / (np.sum(w, axis=1) + EPS)
    return np.clip(agree ** float(gamma), floor, 1.0)


def membership_boundary(centers, radii, labels, counts, param=(10, 1.0), floor=1e-3):
    """Boundary-aware agreement: m_i = (1 - (1 - a_i) * b_i) ** gamma, where a_i is T7's
    agreement and b_i the count-weighted mean agreement of ball i's k nearest balls. A ball
    with few same-label neighbours keeps a high weight when those neighbours are mixed too
    (a clean boundary ball) and gets a low weight when they agree with each other (an
    intruder inside the other class). param = (k, gamma)."""
    centers, radii, labels, counts = _as_arrays(centers, radii, labels, counts)
    k_nn, gamma = param
    n = len(radii)
    if n < 2:
        return np.ones(n, dtype=np.float64)
    k_nn = min(int(k_nn), n - 1)
    if n > DENSE_LIMIT:
        nn = _tree_neighbours(centers, k_nn)
    else:
        dist = _pairwise_distances(centers)
        np.fill_diagonal(dist, np.inf)
        nn = np.argpartition(dist, k_nn - 1, axis=1)[:, :k_nn]
    w = counts[nn]
    agree = np.sum(w * (labels[nn] == labels[:, None]), axis=1) / (np.sum(w, axis=1) + EPS)
    nb_agree = np.sum(w * agree[nn], axis=1) / (np.sum(w, axis=1) + EPS)
    return np.clip((1.0 - (1.0 - agree) * nb_agree) ** float(gamma), floor, 1.0)


def _gaps(centers, radii):
    """Surface-to-surface distance between balls, max(0, ||c_i - c_j|| - r_i - r_j); inf on the diagonal."""
    gap = np.maximum(0.0, _pairwise_distances(centers) - radii[:, None] - radii[None, :])
    np.fill_diagonal(gap, np.inf)
    return gap


def _gap_neighbours(centers, radii, k_nn, chunk=512):
    """The k_nn balls with the smallest surface gap to each ball, and those gaps, without the m x m
    matrix: rows are processed in blocks against all balls (one matrix product per block). Ties
    (e.g. overlapping balls, gap 0) are broken by centre distance, then index, as in the dense path.
    A k-d tree does not help here: the gap subtracts the neighbour's radius, so with a few large balls
    the search radius covers almost every ball."""
    n = len(radii)
    sq = np.sum(centers ** 2, axis=1)
    nn = np.empty((n, k_nn), dtype=int)
    gaps = np.empty((n, k_nn))
    for s in range(0, n, chunk):
        rows = np.arange(s, min(n, s + chunk))
        dist = np.sqrt(np.maximum(sq[rows, None] + sq[None, :] - 2.0 * centers[rows] @ centers.T, 0.0))
        gap = np.maximum(0.0, dist - radii[rows, None] - radii[None, :])
        gap[np.arange(len(rows)), rows] = np.inf
        part = np.argpartition(gap, k_nn - 1, axis=1)[:, :k_nn]
        kth = np.max(np.take_along_axis(gap, part, axis=1), axis=1)
        ties = np.sum(gap <= kth[:, None], axis=1) > k_nn
        for i in range(len(rows)):
            if ties[i]:
                cand = np.flatnonzero(gap[i] <= kth[i])
            else:
                cand = part[i]
            order = np.lexsort((cand, dist[i, cand], gap[i, cand]))[:k_nn]
            nn[rows[i]] = cand[order]
            gaps[rows[i]] = gap[i, cand[order]]
    return nn, gaps

def membership_shrunk(centers, radii, labels, counts, param=(10, 1.0), floor=1e-3):
    """Evidence-shrunk agreement: m_i = ((n_i - 1) + lam * a_i) / ((n_i - 1) + lam), a_i = T7's
    agreement, param = (k, lam). A single-point ball has no evidence of its own and takes the
    neighbours' verdict (m = a); a pure ball of many points vouches for itself and stays near 1
    even on the class boundary. lam is the number of pseudo-points the neighbour vote is worth."""
    centers, radii, labels, counts = _as_arrays(centers, radii, labels, counts)
    k_nn, lam = param
    agree = membership_agreement(centers, radii, labels, counts, (k_nn, 1.0), floor=0.0)
    own = np.maximum(counts - 1.0, 0.0)
    return np.clip((own + lam * agree) / (own + lam), floor, 1.0)


def membership_gapvote(centers, radii, labels, counts, param=(10, 1.0), floor=1e-3):
    """Radius-aware soft agreement: neighbours are the k balls with the smallest surface gap
    g_ij = max(0, ||c_i - c_j|| - r_i - r_j); neighbour j votes with weight
    n_j * exp(-(g_ij / s_i)^2), s_i = gap to the k-th neighbour. m_i = (own-class share) ** gamma,
    param = (k, gamma). Touching or overlapping balls count fully, distant ones fade out."""
    centers, radii, labels, counts = _as_arrays(centers, radii, labels, counts)
    k_nn, gamma = param
    n = len(radii)
    if n < 2:
        return np.ones(n, dtype=np.float64)
    k_nn = min(int(k_nn), n - 1)
    if n > GAP_DENSE_LIMIT:
        nn, g = _gap_neighbours(centers, radii, k_nn)
    elif TIE_BREAK:
        dist = _pairwise_distances(centers)
        gap = np.maximum(0.0, dist - radii[:, None] - radii[None, :])
        np.fill_diagonal(gap, np.inf)
        nn = np.lexsort((dist, gap), axis=1)[:, :k_nn]
        g = np.take_along_axis(gap, nn, axis=1)
    else:
        gap = _gaps(centers, radii)
        nn = np.argsort(gap, axis=1)[:, :k_nn]
        g = np.take_along_axis(gap, nn, axis=1)
    w = counts[nn] * np.exp(-(g / (g[:, -1:] + EPS)) ** 2)
    agree = np.sum(w * (labels[nn] == labels[:, None]), axis=1) / (np.sum(w, axis=1) + EPS)
    return np.clip(agree ** float(gamma), floor, 1.0)


def membership_relative(centers, radii, labels, counts, param=(5, 1.0), floor=1e-3):
    """Friend/enemy relative gap: F_i, E_i = mean surface gap to the k nearest balls of the same
    / the other class; m_i = (E_i / (E_i + F_i)) ** gamma, param = (k, gamma). A ball far from
    its own class and close to the other one gets a low weight; no label vote is involved."""
    centers, radii, labels, counts = _as_arrays(centers, radii, labels, counts)
    k_nn, gamma = param
    n = len(radii)
    if n < 2:
        return np.ones(n, dtype=np.float64)
    gap = _gaps(centers, radii)
    same = labels[:, None] == labels[None, :]

    def mean_nearest(mask):
        g = np.sort(np.where(mask, gap, np.inf), axis=1)[:, :int(k_nn)]
        ok = np.isfinite(g)
        return np.where(ok.any(axis=1), np.sum(np.where(ok, g, 0.0), axis=1) / np.maximum(ok.sum(axis=1), 1), np.nan)

    friend, enemy = mean_nearest(same), mean_nearest(~same)
    m = enemy / (enemy + friend + EPS)
    m = np.where(np.isnan(friend), 0.5, np.where(np.isnan(enemy), 1.0, m))  # lone ball of a class / one class only
    m = np.where((enemy + friend) < EPS, 0.5, m)
    return np.clip(m ** float(gamma), floor, 1.0)


MEMBERSHIPS = {
    "none": membership_none,
    "centre": membership_centre,
    "entropy": membership_entropy,
    "overlap": membership_overlap,
    "density": membership_density,
    "agreement": membership_agreement,
    "boundary": membership_boundary,
    "shrunk": membership_shrunk,
    "gapvote": membership_gapvote,
    "relative": membership_relative,
}


def compute_membership(name, centers, radii, labels, counts, param=None):
    if name not in MEMBERSHIPS:
        raise ValueError(f"Unknown membership '{name}'. Choose from {sorted(MEMBERSHIPS)}")
    fn = MEMBERSHIPS[name]
    if param is None:
        return fn(centers, radii, labels, counts)
    return fn(centers, radii, labels, counts, param=param)
