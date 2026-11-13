"""
Large-scale test on NDC data (as Table 9 of the GBLSTSVM paper): accuracy and training time of every
model on NDC sets of growing size, with fixed hyperparameters (no tuning), one 70/30 split.

Two ways of setting the hyperparameters, both recorded:
  fixed  as in the GBLSTSVM paper's NDC test (below);
  cv     5-fold cross-validation on a random subsample of 10,000 training samples (the same subsample
         for every model, best mean balanced accuracy, run_baselines' grids, clusters per split 2/4/6),
         then one fit on the whole training part with the chosen setting. Only that fit is timed;
         the tuning time is stored separately.

Fixed settings, as in the GBLSTSVM paper's NDC test: every penalty parameter = 1e-5 (c1..c4 of the twin
models, C of SVM and GBSVM), 2 clusters per split, purity 0.985, no class weighting (NDC is balanced).
The proposed model uses k = 10 voting balls and gamma = 1 (the middle of the sensitivity grid).

Training time = wall-clock seconds on one CPU thread for everything the model needs from the raw
training set: ball generation (granular-ball models), the fuzzy weight (proposed model), and the
solve. Prediction is not timed. A model that does not finish within --timeout seconds is recorded
as "timeout"; SVM and TSVM are only attempted up to --max-point-n training samples (their solvers
need the n x n kernel / dual, as in the paper where they ran out of memory from 100k on).

Label noise is a vectorised version of addNoisy.recreat_data (same number of flipped labels per
class) because the original loops over rows in pandas and does not scale to millions.

Data: experiments/ndc.py writes Data/NDC32/NDC32-<size>.npy (32 features, as in the paper).
Output: results/ndc/<dataset>__noise<n>.json, one record per model.
"""
import os

os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import argparse
import json
import multiprocessing as mp
import sys
import time
import warnings
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "experiments"))

from dataset_utils import standardize_train_test, stratified_train_test_split  # noqa: E402
from fuzzy_membership import membership_gapvote  # noqa: E402
from gbsvm import GBSVMProblem  # noqa: E402
from GBLSTSVM import gb_decision_scores, solve_gb_planes  # noqa: E402
from run_fuzzy_cv import ball_set_from_balls, ball_set_from_samples  # noqa: E402
from gen_ball import gen_balls  # noqa: E402

C = 1e-5
CLUSTERS = 2
GAP_PARAM = (10, 1.0)
MODELS = ["SVM", "TSVM", "GBSVM", "LSTSVM", "GBLSTSVM", "LS-GBLSTSVM", "RF-GBLSTSVM"]


def flip_labels(train, frac, seed):
    """Flip int(n * frac * share) labels of each class, chosen at random (recreat_data, vectorised)."""
    rng = np.random.default_rng(seed)
    y = train[:, -1].copy()
    n = len(y)
    total = int(n * frac)
    for lab in (1.0, -1.0):
        idx = np.flatnonzero(train[:, -1] == lab)
        m = int(total * len(idx) / n)
        y[rng.choice(idx, m, replace=False)] = -lab
    out = train.copy()
    out[:, -1] = y
    return out


def balls(train, keep, k):
    b = gen_balls(train, pur=0.985, delbals=1 if keep else 2, k_clusters=k, return_details=True)
    return ball_set_from_balls(b)


def pos_w(bs, imb):
    if not imb:
        return 1.0
    pos = bs["labels"] == 1
    return float(np.sum(bs["counts"][~pos]) / max(np.sum(bs["counts"][pos]), 1e-12))


def planes(bs, c1, c2, reg, imb=False, memb=None):
    pos = bs["labels"] == 1
    neg = ~pos
    m = np.ones(len(pos)) if memb is None else memb
    w1, w2 = np.full(int(pos.sum()), pos_w(bs, imb)), np.ones(int(neg.sum()))
    return solve_gb_planes(bs["centers"][pos], bs["radii"][pos], bs["centers"][neg], bs["radii"][neg],
                           c1, c2, w1, w1 * m[pos], w2, w2 * m[neg], reg_term=reg)


FIXED = {"k": CLUSTERS, "imb": False, "C": C, "c1": C, "c2": C, "c3": C, "p": GAP_PARAM}


def fit(model, train, cfg):
    """Train one model with one setting cfg (keys k, imb, C, c1, c2, c3, p as needed).
    Returns (decision function, extra info). The caller times this call."""
    k, imb = cfg["k"], cfg["imb"]
    if model == "SVM":
        from sklearn.svm import SVC
        clf = SVC(C=cfg["C"], kernel="linear", max_iter=-1, cache_size=2000, class_weight="balanced" if imb else None)
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            clf.fit(train[:, :-1], train[:, -1])
        return (lambda X: clf.decision_function(X) * (1.0 if clf.classes_[1] == 1 else -1.0)), {}
    if model == "TSVM":
        from gbftsvm import twin_planes
        s = ball_set_from_samples(train)
        w1, b1, w2, b2 = twin_planes(s["centers"], s["radii"], s["labels"], np.ones(len(s["labels"])),
                                     cfg["c1"], cfg["c2"], w_pos=pos_w(s, imb))
        return (lambda X: gb_decision_scores(X, w1, b1, w2, b2)), {}
    if model == "LSTSVM":
        s = ball_set_from_samples(train)
        p = planes(s, cfg["c1"], cfg["c2"], 1e-4, imb)
        return (lambda X: gb_decision_scores(X, *p)), {}
    if model == "GBSVM":
        bs = balls(train, False, k)
        cost = np.where(bs["labels"] == 1, pos_w(bs, imb), 1.0)
        sol = GBSVMProblem(bs["centers"], bs["radii"], bs["labels"], cost).solve(cfg["C"])
        if sol is None:
            raise RuntimeError("solver failed")
        return (lambda X: X @ sol[0] + sol[1]), {"balls": len(bs["radii"])}
    if model == "GBLSTSVM":
        bs = balls(train, False, k)
        p = planes(bs, cfg["c1"], cfg["c2"], 1e-4, imb)
        return (lambda X: gb_decision_scores(X, *p)), {"balls": len(bs["radii"])}
    if model == "LS-GBLSTSVM":
        bs = balls(train, False, k)
        p = planes(bs, cfg["c1"], cfg["c1"], cfg["c3"] / cfg["c1"], imb)
        return (lambda X: gb_decision_scores(X, *p)), {"balls": len(bs["radii"])}
    if model == "RF-GBLSTSVM":
        bs = balls(train, True, k)
        t = time.perf_counter()
        m = membership_gapvote(bs["centers"], bs["radii"], bs["labels"], bs["counts"], tuple(cfg["p"]))
        t_m = time.perf_counter() - t
        p = planes(bs, cfg["c1"], cfg["c1"], cfg["c3"] / cfg["c1"], imb, m)
        return (lambda X: gb_decision_scores(X, *p)), {"balls": len(bs["radii"]), "membership_sec": t_m}
    raise ValueError(model)


# run_baselines' method names and config tuples -> cfg dicts
RB_NAME = {"SVM": "SVM", "TSVM": "TSVM", "GBSVM": "GBSVM", "LSTSVM": "LSTSVM", "GBLSTSVM": "GBLSTSVM",
           "LS-GBLSTSVM": "LS-GBLSTSVM", "RF-GBLSTSVM": "LS-keep+gapvote"}


def cfg_from_key(model, key):
    k, imb = int(key[0]) or CLUSTERS, bool(key[1])
    if model in ("SVM", "GBSVM"):
        return {"k": k, "imb": imb, "C": key[2]}
    if model in ("TSVM", "LSTSVM", "GBLSTSVM"):
        return {"k": k, "imb": imb, "c1": key[2], "c2": key[3]}
    cfg = {"k": k, "imb": imb, "c1": key[2], "c3": key[3]}
    if model == "RF-GBLSTSVM":
        cfg["p"] = list(key[4])
    return cfg


def tune(train, models, size, seed, folds=5):
    """5-fold CV on a random subsample of `size` training samples (the same for every model), best
    mean balanced accuracy over run_baselines' grids. Returns {model: (cfg, cv score, seconds)}."""
    import run_baselines as rb
    from sklearn.model_selection import StratifiedKFold
    rng = np.random.default_rng(seed)
    sub = train[rng.choice(len(train), min(size, len(train)), replace=False)]
    y = sub[:, -1]
    out = {}
    for m in models:
        t = time.perf_counter()
        cv = {}
        for tr, va in StratifiedKFold(n_splits=folds, shuffle=True, random_state=seed).split(sub[:, :-1], y):
            res = rb.all_scores(sub[tr], TUNE_K, [sub[va, :-1]], [RB_NAME[m]])[RB_NAME[m]]
            for key, (sc,) in res.items():
                cv.setdefault(key, []).append(rb.ba_acc(sub[va, -1], sc)[0])
        best = max(sorted(cv, key=str), key=lambda c: np.sum(cv[c]) / folds)
        out[m] = (cfg_from_key(m, best), float(np.sum(cv[best]) / folds), time.perf_counter() - t)
    return out


TUNE_K = [2, 4, 6]


def worker(model, train, test, cfg, q):
    try:
        t = time.perf_counter()
        f, info = fit(model, train, cfg)
        sec = time.perf_counter() - t
        s = f(test[:, :-1])
        pred = np.where(s > 0, 1, -1)
        y = test[:, -1]
        bacc = 0.5 * (np.mean(pred[y == 1] == 1) + np.mean(pred[y == -1] == -1))
        q.put({"status": "ok", "train_sec": sec, "accuracy": 100 * float(np.mean(pred == y)),
               "balanced_accuracy": 100 * float(bacc), **info})
    except MemoryError:
        q.put({"status": "out of memory"})
    except Exception as e:  # noqa: BLE001
        q.put({"status": f"error: {type(e).__name__}: {e}"})


def run_model(model, train, test, cfg, timeout):
    ctx = mp.get_context("fork")
    q = ctx.Queue()
    p = ctx.Process(target=worker, args=(model, train, test, cfg, q))
    p.start()
    try:
        res = q.get(timeout=timeout)
    except Exception:  # noqa: BLE001
        res = {"status": "timeout", "timeout_sec": timeout}
    p.join(5)
    if p.is_alive():
        p.kill()
    if p.exitcode not in (0, None) and res.get("status") == "timeout":
        res = {"status": f"killed (exit {p.exitcode})"}
    return res


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--datasets", nargs="+", required=True, help="names under Data/NDC32 without .npy")
    ap.add_argument("--noise", nargs="+", type=float, default=[0.0, 0.2])
    ap.add_argument("--models", nargs="+", default=MODELS)
    ap.add_argument("--timeout", type=float, default=3600)
    ap.add_argument("--max-point-n", type=int, default=70000)
    ap.add_argument("--protocols", nargs="+", default=["fixed", "cv"], choices=["fixed", "cv"])
    ap.add_argument("--tune-size", type=int, default=10000)
    ap.add_argument("--out", default=str(ROOT / "results" / "ndc"))
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    for name in a.datasets:
        data = np.load(ROOT / "Data" / "NDC32" / f"{name}.npy").astype(np.float64)
        train0, test = standardize_train_test(*stratified_train_test_split(data, test_size=0.30, random_state=0))
        for nz in a.noise:
            f = out / f"{name}__noise{nz:g}.json"
            rec = json.loads(f.read_text()) if f.exists() else {"dataset": name, "noise": nz, "n": len(data),
                                                                "n_train": len(train0)}
            train = flip_labels(train0, nz, 0) if nz > 0 else train0
            for proto in a.protocols:
                runs = rec.setdefault(proto, {})
                todo = [m for m in a.models if m not in runs or runs[m].get("status") == "timeout"]
                if not todo:
                    continue
                if proto == "fixed":
                    cfgs = {m: (FIXED, None, 0.0) for m in todo}
                else:
                    tunable = [m for m in todo if not (m in ("SVM", "TSVM") and len(train) > a.max_point_n)]
                    cfgs = tune(train, tunable, a.tune_size, 0)
                for m in todo:
                    if m in ("SVM", "TSVM") and len(train) > a.max_point_n:
                        runs[m] = {"status": "not run (n x n solver)"}
                    else:
                        cfg, cv, tsec = cfgs[m]
                        runs[m] = run_model(m, train, test, cfg, a.timeout)
                        runs[m].update({"config": cfg, "cv_balanced_accuracy": cv, "tuning_sec": tsec})
                    r = runs[m]
                    print(f"{name} noise {nz:g} {proto} {m}: " + (f"acc {r['accuracy']:.2f} time {r['train_sec']:.1f}s" if r["status"] == "ok" else r["status"]), flush=True)
                    f.write_text(json.dumps(rec, indent=1, default=float))

if __name__ == "__main__":
    main()
