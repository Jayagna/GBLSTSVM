"""Full CV tuning time for one split: ball building (shared) and per-method plane fitting."""
import sys, time, json
sys.path.insert(0, "/home/user/GBLSTSVM"); sys.path.insert(0, "/home/user/GBLSTSVM/experiments")
import numpy as np
from pathlib import Path
from sklearn.model_selection import StratifiedKFold
from dataset_utils import discover_datasets, load_binary_dataset, stratified_train_test_split, standardize_train_test
from addNoisy import recreat_data
import run_fuzzy_cv as R

files = {f.stem: f for f in discover_datasets(Path("/home/user/GBLSTSVM/Data"))}
for name, noise in [("pima", 0.0), ("pima", 0.2), ("ger", 0.2), ("NDC-10k", 0.0), ("NDC-10k", 0.2)]:
    data, _ = load_binary_dataset(files[name], minority_positive=True)
    train, test = stratified_train_test_split(data, test_size=0.30, random_state=0)
    train, test = standardize_train_test(train, test)
    if noise:
        np.random.seed(0); train = np.asarray(recreat_data(train, noise), dtype=np.float64)
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
    t_build, t_fit, n_fit = 0.0, {}, {}
    for tr, va in skf.split(train[:, :-1], train[:, -1]):
        Xv, yv = train[va, :-1], train[va, -1]
        for k in [2, 3, 4, 5, 6]:
            t0 = time.perf_counter(); sets = R.build_ball_sets(train[tr], k); t_build += time.perf_counter() - t0
            for m in ["GBLSTSVM", "GB-keep", "T7-agree"]:
                R.ACTIVE_METHODS = [R.METHOD_INDEX[m]]
                sc = {}
                t0 = time.perf_counter(); R.score_ball_sets(sets, Xv, yv, k, sc); t_fit[m] = t_fit.get(m, 0) + time.perf_counter() - t0
                n_fit[m] = n_fit.get(m, 0) + sum(len(v) for v in sc[m].values())
        smp = R.build_kfree_sets(train[tr])  # includes ADPGBG; time only the LSTSVM fits
        R.ACTIVE_METHODS = [R.METHOD_INDEX["LSTSVM"]]
        sc = {}
        t0 = time.perf_counter(); R.score_ball_sets(smp, Xv, yv, 0, sc); t_fit["LSTSVM"] = t_fit.get("LSTSVM", 0) + time.perf_counter() - t0
        n_fit["LSTSVM"] = n_fit.get("LSTSVM", 0) + sum(len(v) for v in sc["LSTSVM"].values())
    print(json.dumps({"dataset": name, "noise": noise, "ball_building_s": round(t_build, 2),
                      "fit_s": {m: round(v, 2) for m, v in t_fit.items()}, "n_plane_solves": n_fit}), flush=True)
