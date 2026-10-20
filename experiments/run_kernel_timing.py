"""
Training time and memory of the kernel (RBF) models as the data grows.

Runs on the NDC benchmarks (2.5k to 100k samples, 10 features) with fixed
hyperparameters (c1 = c2 = 1, gamma = 1 / n_features, class weighting on), one
70/30 split per file. Training time counts everything a model needs: ball
generation, memberships, kernel features and the two linear systems.

Models
  K-GBLSTSVM    kernel GBLSTSVM on k-means granular balls, single-point balls deleted
  K-GB-keep     the same with single-point balls kept
  K-keep-T7     K-GB-keep with the neighbour-agreement (T7) membership
  K-LSTSVM      kernel LSTSVM on every sample (one row and column per sample);
                skipped above --full-limit training samples, where its n x n
                matrices no longer fit in memory (the same limit applies to the
                number of balls of the ball models)
  RK-LSTSVM     reduced-kernel LSTSVM: every sample is a row, but the kernel
                columns are a random subset of the training samples as large as
                the K-GB-keep ball set (at most --full-limit), so it has the same
                number of unknowns
  RK-FKNN       RK-LSTSVM with the fuzzy-kNN membership on samples (T7 with every
                sample as its own ball), neighbours from a k-d tree

The systems are accumulated block by block, so no model holds more than one
(columns + 1)^2 matrix per plane plus one block of kernel rows.

Example:
  python experiments/run_kernel_timing.py --datasets NDC-5k NDC-10k
"""
import argparse
import json
import time
from pathlib import Path

import numpy as np

from run_fuzzy_cv import ROOT, balanced_accuracy, ball_set_from_samples, build_ball_sets, member  # noqa: E402
from run_kernel_cv import _spd_solve, plane_distance, rbf  # noqa: E402
from addNoisy import recreat_data  # noqa: E402
from dataset_utils import load_binary_dataset, standardize_train_test, stratified_train_test_split  # noqa: E402

NDC = ["NDC-2.5k", "NDC-5k", "NDC-10k", "NDC-15k", "NDC-20k", "NDC-40k", "NDC-60k", "NDC-80k", "NDC-1m"]
T7_PARAM = (10, 1.0)
BLOCK = 4096


def planes_blockwise(X_rows, bs, membership, basis, gamma, use_imbalance, c1, c2, reg_term=1e-4):
    """Both planes of (G)LSTSVM on kernel features K(X_rows, basis), accumulated over row
    blocks. Same weighting and systems as run_kernel_cv.planes_over_grid."""
    pos = bs["labels"] == 1
    w_pos = np.sum(bs["counts"][~pos]) / max(np.sum(bs["counts"][pos]), 1e-12) if use_imbalance else 1.0
    prox = np.where(pos, w_pos, 1.0)
    slack = prox * membership
    m = len(basis) + 1
    S_neg, P_pos, r1 = np.zeros((m, m)), np.zeros((m, m)), np.zeros(m)
    plain = np.allclose(membership, 1.0)  # slack == prox: plane 2 reuses plane 1's matrices
    S_pos, P_neg, r2 = (None, None, np.zeros(m)) if plain else (np.zeros((m, m)), np.zeros((m, m)), np.zeros(m))
    for start in range(0, len(X_rows), BLOCK):
        sl = slice(start, start + BLOCK)
        E = np.column_stack((rbf(X_rows[sl], basis, gamma), np.ones(len(X_rows[sl]))))
        p, rad, s, q = pos[sl], bs["radii"][sl], slack[sl], prox[sl]
        Ep, En = E[p], E[~p]
        S_neg += (En.T * s[~p]) @ En
        P_pos += (Ep.T * q[p]) @ Ep
        r1 += (En.T * s[~p]) @ (1.0 + rad[~p])
        r2 += (Ep.T * s[p]) @ (1.0 + rad[p])
        if not plain:
            S_pos += (Ep.T * s[p]) @ Ep
            P_neg += (En.T * q[~p]) @ En
    if plain:
        S_pos, P_neg = P_pos, S_neg
    reg_I = reg_term * np.identity(m)
    z1 = -_spd_solve(S_neg + reg_I + P_pos / c1, r1)
    z2 = _spd_solve(S_pos + reg_I + P_neg / c2, r2)
    return (z1[:-1], z1[-1]), (z2[:-1], z2[-1])


def predict(X, basis, gamma, p1, p2):
    out = np.empty(len(X))
    for start in range(0, len(X), BLOCK):
        Fx = rbf(X[start:start + BLOCK], basis, gamma)
        out[start:start + BLOCK] = plane_distance(Fx, p2) - plane_distance(Fx, p1)
    return np.where(out > 0, 1, -1)


def run_dataset(path, noise, k, full_limit, c, seed):
    data, meta = load_binary_dataset(path, minority_positive=True)
    train, test = stratified_train_test_split(data, test_size=0.30, random_state=seed)
    train, test = standardize_train_test(train, test)
    if noise > 0:
        np.random.seed(seed)
        train = np.asarray(recreat_data(train, noise), dtype=np.float64)
    X_tr, X_te, y_te = train[:, :-1], test[:, :-1], test[:, -1]
    gamma = 1.0 / X_tr.shape[1]
    rows = {}

    def fit_and_score(name, X_rows, bs, memb, basis, prep_time):
        if len(basis) > full_limit:
            rows[name] = {"skipped": f"{len(basis)} kernel columns: the (columns + 1)^2 matrices need "
                                     f"{2 * (len(basis) + 1) ** 2 * 8 / 2 ** 30:.1f} GB", "columns": int(len(basis))}
            print(f"  {name:12s} skipped ({rows[name]['skipped']})", flush=True)
            return
        t0 = time.time()
        p1, p2 = planes_blockwise(X_rows, bs, memb, basis, gamma, True, c, c)
        fit = time.time() - t0
        t1 = time.time()
        pred = predict(X_te, basis, gamma, p1, p2)
        rows[name] = {"train_time": prep_time + fit, "prep_time": prep_time, "solve_time": fit,
                      "predict_time": time.time() - t1, "rows": int(len(X_rows)), "columns": int(len(basis)),
                      "matrix_mb": 2 * (len(basis) + 1) ** 2 * 8 / 2 ** 20,
                      "bal_acc": balanced_accuracy(y_te, pred), "accuracy": float(np.mean(pred == y_te))}
        print(f"  {name:12s} rows={len(X_rows):6d} cols={len(basis):6d} train={prep_time + fit:7.1f}s "
              f"bal_acc={rows[name]['bal_acc']:.3f}", flush=True)

    t0 = time.time()
    sets = build_ball_sets(train, k)
    gen = time.time() - t0
    for name, set_name, memb_name in (("K-GBLSTSVM", "gb", "none"), ("K-GB-keep", "gb_all", "none"),
                                      ("K-keep-T7", "gb_all", "agreement")):
        bs = sets[set_name]
        t1 = time.time()
        memb = member(memb_name)(bs, T7_PARAM if memb_name == "agreement" else None)
        fit_and_score(name, bs["centers"], bs, memb, bs["centers"], gen + time.time() - t1)
        rows[name]["gen_time"] = gen

    samples = ball_set_from_samples(train)
    ones = np.ones(len(X_tr))
    fit_and_score("K-LSTSVM", X_tr, samples, ones, X_tr, 0.0)
    m = min(len(sets["gb_all"]["radii"]), full_limit)
    basis = X_tr[np.random.default_rng(seed).choice(len(X_tr), size=m, replace=False)]
    fit_and_score("RK-LSTSVM", X_tr, samples, ones, basis, 0.0)
    t0 = time.time()
    memb = member("agreement")(samples, T7_PARAM)
    fit_and_score("RK-FKNN", X_tr, samples, memb, basis, time.time() - t0)
    return {"dataset": path.stem, "samples": meta["samples"], "train": int(len(X_tr)), "features": meta["features"],
            "noise": noise, "k": k, "c": c, "gamma": gamma, "seed": seed, "models": rows}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data-dir", default=str(ROOT / "Data" / "LSTSVM_benchmarks"))
    ap.add_argument("--datasets", nargs="+", default=NDC)
    ap.add_argument("--noise", type=float, default=0.0)
    ap.add_argument("--k", type=int, default=4, help="k-means k for ball splitting")
    ap.add_argument("--c", type=float, default=1.0)
    ap.add_argument("--full-limit", type=int, default=11000, help="most kernel columns (samples or balls) a model may use")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--out", default=str(ROOT / "results" / "kernel_timing"))
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    for name in args.datasets:
        path = Path(args.data_dir) / f"{name}.txt"
        out_file = out / f"{name}__noise{args.noise:g}.json"
        if out_file.exists():
            print(f"{name}: cached", flush=True)
            continue
        print(f"{name}:", flush=True)
        record = run_dataset(path, args.noise, args.k, args.full_limit, args.c, args.seed)
        out_file.write_text(json.dumps(record, indent=1))


if __name__ == "__main__":
    main()
