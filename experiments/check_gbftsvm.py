"""
Check gbftsvm.py on small random problems:
  * each twin plane from PlaneDual.solve must match a reference solve of the same dual
    (accelerated projected gradient, run until its duality gap is below 1e-10), and
    the primal objective at the returned plane must equal the reference optimum;
  * the Pythagorean scores must equal centre distance on pure balls and exceed it on impure ones.

  python experiments/check_gbftsvm.py
"""
import sys
from pathlib import Path

import numpy as np
from scipy.linalg import solve_triangular

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gbftsvm import PlaneDual, pythagorean_scores  # noqa: E402


def primal(pd_, other, z, upper):
    """1/2 z^T K z + sum_i upper_i max(0, 1 + r_i - [other_i 1] z), the primal value at plane z."""
    Q = np.column_stack((other, np.ones(len(other))))
    w = pd_.L.T @ z
    return 0.5 * w @ w + upper @ np.maximum(0.0, pd_.q - Q @ z)


def reference(pd_, other, upper):
    """FISTA on the dual, stopped by the duality gap; returns (z, optimal value)."""
    H = pd_.Gt.T @ pd_.Gt
    step = 1.0 / np.linalg.eigvalsh(H).max()
    a = y = np.zeros_like(upper)
    t = 1.0
    for _ in range(2_000_000):
        a_new = np.clip(y - step * (H @ y - pd_.q), 0.0, upper)
        t_new = 0.5 * (1.0 + np.sqrt(1.0 + 4.0 * t * t))
        y, a, t = a_new + (t - 1.0) / t_new * (a_new - a), a_new, t_new
        w = pd_.Gt @ a
        dual = pd_.q @ a - 0.5 * w @ w
        z = solve_triangular(pd_.L.T, w, lower=False)
        if primal(pd_, other, z, upper) - dual < 1e-10 * max(1.0, abs(dual)):
            return z, dual
    raise RuntimeError("reference did not converge")


def main():
    rng = np.random.default_rng(1)
    d = 3
    cA, cB = rng.normal(1, 1, (12, d)), rng.normal(-1, 1, (15, d))
    rA, rB = rng.uniform(0, 0.5, 12), rng.uniform(0, 0.5, 15)
    sA, sB = rng.uniform(0.1, 1, 12), rng.uniform(0.1, 1, 15)
    for C in (0.1, 0.7, 5.0, 32.0):
        for plane, (own, other, r_other, s_other) in enumerate([(cA, cB, rB, sB), (cB, cA, rA, sA)], 1):
            pd_ = PlaneDual(own, other, r_other)
            z = pd_.solve(C * s_other)  # plane 1: [w1 b1] = -z; plane 2: [w2 b2] = z
            z_ref, opt = reference(pd_, other, C * s_other)
            err = np.linalg.norm(z - z_ref) / np.linalg.norm(z_ref)
            excess = (primal(pd_, other, z, C * s_other) - opt) / max(1.0, abs(opt))
            print(f"C = {C:5}: plane {plane}: relative error in [w b] {err:.1e}, objective excess {excess:.1e}")
            assert err < 1e-4 and excess < 1e-4
    labels = np.r_[np.ones(12), -np.ones(15)]
    purity = np.r_[np.ones(10), [0.99, 0.9], np.ones(15)]
    s = pythagorean_scores(np.vstack([cA, cB]), labels, purity)
    pure = pythagorean_scores(np.vstack([cA, cB]), labels, np.ones(27))
    assert np.allclose(s[purity == 1], pure[purity == 1]) and np.all(s[purity < 1] > pure[purity < 1])
    print("scores: pure balls = centre distance; impure balls score higher:", np.round(s[10:12], 3), ">", np.round(pure[10:12], 3))
    print("all checks passed")


if __name__ == "__main__":
    main()
