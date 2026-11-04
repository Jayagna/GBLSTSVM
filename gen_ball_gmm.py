"""
Granular balls split with a Gaussian mixture (soft clustering) instead of k-means.

Same recursive scheme as gen_ball.py: start with one ball holding all training points and
split every ball whose purity is below `pur` into `k_clusters` parts until all are pure enough.
The difference is the split: a GaussianMixture is fitted to the ball's points and each point
goes to the component with the highest posterior. The posterior (responsibility) of that
component is kept for every point, which gives a soft membership of each point in its ball:
  resp_last  responsibility at the split that created the point's final ball
  resp_path  product of the responsibilities along the whole chain of splits
             (the probability of reaching that ball in a soft split tree)
When the mixture cannot split a ball (too few distinct points, one empty component), the ball
falls back to a k-means split with responsibility 1, as gen_ball.py falls back to halving.
"""
import warnings

import numpy as np
from sklearn.cluster import KMeans
from sklearn.mixture import GaussianMixture

from gen_ball import GranularBall

warnings.filterwarnings("ignore")


class GMMBall(GranularBall):
    def __init__(self, data, resp_last=None, resp_path=None):
        super().__init__(data)
        n = len(data)
        self.resp_last = np.ones(n) if resp_last is None else resp_last
        self.resp_path = np.ones(n) if resp_path is None else resp_path

    def split_balls(self, k_clusters=2, cov="diag"):
        if self.num < 2:
            return [self]
        X = self.data_no_label
        k = min(k_clusters, len(np.unique(X, axis=0)), self.num)
        if k >= 2:
            try:
                gm = GaussianMixture(n_components=k, covariance_type=cov, reg_covar=1e-4,
                                     random_state=42, n_init=1, max_iter=100).fit(X)
                post = gm.predict_proba(X)
                lab = post.argmax(1)
                balls = []
                for c in range(k):
                    m = lab == c
                    if m.any():
                        balls.append(GMMBall(self.data[m], post[m, c], self.resp_path[m] * post[m, c]))
                if len(balls) > 1:
                    return balls
                lab = KMeans(n_clusters=k, random_state=42, n_init=1).fit(X).labels_
                balls = [GMMBall(self.data[lab == c], np.ones((lab == c).sum()), self.resp_path[lab == c])
                         for c in range(k) if (lab == c).any()]
                if len(balls) > 1:
                    return balls
            except Exception:
                pass
        mid = max(1, self.num // 2)
        return [GMMBall(self.data[:mid], np.ones(mid), self.resp_path[:mid]),
                GMMBall(self.data[mid:], np.ones(self.num - mid), self.resp_path[mid:])]


def gen_balls_gmm(data, pur=0.985, delbals=1, k_clusters=2, cov="diag"):
    """data: features + label (last column). Returns ball dicts like gen_balls(..., return_details=True),
    each with the per-point 'resp_last' and 'resp_path' aligned with 'indices'."""
    n = len(data)
    data = np.hstack((data, np.arange(n).reshape(n, 1)))
    balls = [GMMBall(data)]
    i = 0
    while i < len(balls):
        b = balls[i]
        if b.purity < pur and b.num > 1:
            parts = b.split_balls(k_clusters=k_clusters, cov=cov)
            if len(parts) > 1:
                balls[i] = parts[0]
                balls.extend(parts[1:])
                continue
        i += 1
    out = []
    for b in balls:
        if b.num < delbals:
            continue
        out.append({
            "center": b.center.tolist(), "r": float(b.r), "label": 1 if b.label == 1 else -1,
            "num": int(b.num), "purity": float(b.purity), "pos_count": int(b.pos_count), "neg_count": int(b.neg_count),
            "indices": b.data[:, -1].astype(int).tolist(),
            "resp_last": b.resp_last.tolist(), "resp_path": b.resp_path.tolist(),
        })
    return out
