"""
NDC-style data: a Python re-implementation of the Normally Distributed Clustered generator of
Musicant (1998), which the GBLSTSVM paper uses for its large-scale test. The original C program is
not reachable from our machine, so we follow its published description:

  * random centres of multivariate normal distributions, uniform in [-50, 50]^d;
  * the class of each centre is set by a random separating plane through the mean of the centres;
  * every centre gets a random share of the points and a random covariance (random rotation,
    standard deviations uniform in [0.5, 1.5] * spread);
  * points are drawn from the distributions and take the class of their centre.

The points of a centre near the plane spill over to the other side, so the classes are not linearly
separable. `spread` sets how much; the default gives a linear accuracy in the low 80s, as the NDC sets
in the GBLSTSVM paper (LSTSVM 82.8-83.3%). Same seed, same data; the first n rows of a larger set are
NOT a smaller set (the shares are drawn per call).

Usage: python experiments/ndc.py --n 10000 50000 --d 32 --out Data/NDC32
"""
import argparse
from pathlib import Path

import numpy as np


def make_ndc(n, d=32, n_centres=100, spread=30.0, seed=0):
    rng = np.random.default_rng(seed)
    centres = rng.uniform(-50.0, 50.0, size=(n_centres, d))
    w = rng.normal(size=d)
    side = (centres - centres.mean(0)) @ w
    labels = np.where(side >= np.median(side), 1.0, -1.0)
    share = rng.dirichlet(np.ones(n_centres))
    sizes = rng.multinomial(n, share)
    X = np.empty((n, d))
    y = np.empty(n)
    pos = 0
    for c in range(n_centres):
        m = sizes[c]
        if m == 0:
            continue
        q, _ = np.linalg.qr(rng.normal(size=(d, d)))
        sd = rng.uniform(0.5, 1.5, size=d) * spread
        X[pos:pos + m] = centres[c] + (rng.normal(size=(m, d)) * sd) @ q.T
        y[pos:pos + m] = labels[c]
        pos += m
    perm = rng.permutation(n)
    return np.column_stack([X[perm], y[perm]])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--n", nargs="+", type=int, required=True)
    ap.add_argument("--d", type=int, default=32)
    ap.add_argument("--spread", type=float, default=30.0)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--out", default="Data/NDC32")
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for n in a.n:
        data = make_ndc(n, a.d, spread=a.spread, seed=a.seed)
        name = f"NDC32-{n // 1000}k" if n < 1_000_000 else f"NDC32-{n // 1_000_000}m"
        np.save(out / f"{name}.npy", data.astype(np.float32))
        print("wrote", out / f"{name}.npy", data.shape, "positive share %.3f" % np.mean(data[:, -1] == 1))


if __name__ == "__main__":
    main()
