"""
Label-noise models for the training part.

uniform     addNoisy.recreat_data: a share `rate` of all training samples is flipped, spread over the
            classes in proportion to their size (the noise used in GBLSTSVM and most GB papers).
boundary    same number of flips per class as `uniform`, but a sample is picked with probability
            proportional to exp(-d / s), where d is its distance to the nearest training sample of the
            other class and s is half the median of d in its class. Samples near the class boundary are
            therefore flipped far more often than samples deep inside their class (annotators tend to
            confuse borderline cases).
asymmetric  class-dependent noise: a share `rate` of the majority-class samples is relabelled as the
            minority class; the minority class is left untouched (rho_maj = rate, rho_min = 0).

The kind is taken from the argument or, when it is None, from the environment variable GB_NOISE_TYPE
(default "uniform"), so the existing runners need only one changed line.
"""
import os

import numpy as np

from addNoisy import recreat_data

BOUNDARY_SCALE = 0.5  # temperature as a share of the median nearest-enemy distance
KINDS = ("uniform", "boundary", "asymmetric")


def _nearest_enemy_distance(X, y):
    d = np.empty(len(y))
    for c in np.unique(y):
        own, other = y == c, y != c
        if not other.any():
            d[own] = np.inf
            continue
        A, B = X[own], X[other]
        # squared distances in blocks to keep memory small
        best = np.full(len(A), np.inf)
        b2 = np.einsum("ij,ij->i", B, B)
        for s in range(0, len(A), 2048):
            a = A[s:s + 2048]
            dd = np.einsum("ij,ij->i", a, a)[:, None] + b2[None, :] - 2.0 * a @ B.T
            best[s:s + 2048] = dd.min(1)
        d[own] = np.sqrt(np.maximum(best, 0.0))
    return d


def flipped_mask(train, rate, kind, seed):
    """Boolean mask of the training rows whose label `make_noisy` flips (boundary/asymmetric only)."""
    X, y = train[:, :-1], train[:, -1]
    rng = np.random.RandomState(seed)
    mask = np.zeros(len(y), dtype=bool)
    classes, counts = np.unique(y, return_counts=True)
    if kind == "boundary":
        total = int(len(y) * rate)
        d = _nearest_enemy_distance(X, y)
        for c, n_c in zip(classes, counts):
            idx = np.flatnonzero(y == c)
            n_flip = min(int(total * n_c / len(y)), len(idx))
            if n_flip == 0:
                continue
            dc = d[idx]
            s = np.median(dc[np.isfinite(dc)]) if np.isfinite(dc).any() else 1.0
            p = np.exp(-dc / max(BOUNDARY_SCALE * s, 1e-12))
            p = p / p.sum()
            mask[rng.choice(idx, size=n_flip, replace=False, p=p)] = True
    elif kind == "asymmetric":
        maj = classes[np.argmax(counts)]
        idx = np.flatnonzero(y == maj)
        n_flip = int(len(idx) * rate)
        mask[rng.choice(idx, size=n_flip, replace=False)] = True
    else:
        raise ValueError(kind)
    return mask


def make_noisy(train, rate, seed, kind=None):
    """Return a copy of `train` (features + label in the last column) with label noise of the given kind."""
    kind = kind or os.environ.get("GB_NOISE_TYPE", "uniform")
    if kind not in KINDS:
        raise ValueError(f"unknown noise type {kind!r}")
    if rate <= 0:
        return train
    if kind == "uniform":
        np.random.seed(seed)
        return np.asarray(recreat_data(train, rate), dtype=np.float64)
    out = np.array(train, dtype=np.float64, copy=True)
    y = out[:, -1]
    classes = np.unique(y)
    mask = flipped_mask(out, rate, kind, seed)
    other = {classes[0]: classes[-1], classes[-1]: classes[0]}
    out[mask, -1] = [other[v] for v in y[mask]]
    return out
