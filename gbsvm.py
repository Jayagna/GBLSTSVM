"""
GBSVM: the granular-ball support vector machine of Xia et al. (arXiv 2210.03120; IEEE TNNLS 2024).

Soft-margin primal on balls (centre c_i, radius r_i, label y_i):

    min_{w, b, xi}  1/2 ||w||^2 + sum_i C_i xi_i
    s.t.            y_i (w . c_i + b) - r_i ||w|| >= 1 - xi_i,   xi_i >= 0.

Every constraint is a second-order cone, so the problem is convex. The GBSVM paper and the
GBLSTSVM paper solve it with particle swarm optimisation, which does not guarantee the optimum;
here it is solved exactly with an interior-point conic solver (Clarabel through cvxpy), so the
baseline is not handicapped by its solver. With every r_i = 0 this is the ordinary linear SVM.
"""
import warnings

import cvxpy as cp
import numpy as np


class GBSVMProblem:
    """One ball set, compiled once; solve(C) re-solves for a new penalty."""

    def __init__(self, centers, radii, labels, cost=None):
        n, d = centers.shape
        self.w, self.b = cp.Variable(d), cp.Variable()
        xi = cp.Variable(n, nonneg=True)
        self.C = cp.Parameter(nonneg=True)
        cost = np.ones(n) if cost is None else np.asarray(cost, dtype=np.float64)
        margin = cp.multiply(labels, centers @ self.w + self.b) - 1 + xi
        cons = [margin >= 0]
        big = radii > 1e-12
        if np.any(big):
            cons.append(cp.norm(self.w, 2) <= cp.multiply(1.0 / radii[big], margin[big]))
        self.problem = cp.Problem(cp.Minimize(0.5 * cp.sum_squares(self.w) + self.C * (cost @ xi)), cons)

    def solve(self, C):
        self.C.value = float(C)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            try:
                self.problem.solve(solver=cp.CLARABEL)
            except cp.SolverError:
                return None
        if self.w.value is None:
            return None
        return np.asarray(self.w.value, dtype=np.float64), float(self.b.value)
