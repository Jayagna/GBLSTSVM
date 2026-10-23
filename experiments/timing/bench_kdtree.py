"""T7 tuning time per split with the dense neighbour path vs the k-d tree, and whether memberships match."""
import sys, time, json
sys.path.insert(0, "/home/user/GBLSTSVM"); sys.path.insert(0, "/home/user/GBLSTSVM/experiments")
import numpy as np
from pathlib import Path
from sklearn.model_selection import StratifiedKFold
from dataset_utils import discover_datasets, load_binary_dataset, stratified_train_test_split, standardize_train_test
from addNoisy import recreat_data
import fuzzy_membership as FM
import run_fuzzy_cv as R

files = {f.stem: f for f in discover_datasets(Path("/home/user/GBLSTSVM/Data"))}
for name, noise in [("NDC-10k", 0.2), ("NDC-10k", 0.0), ("pima", 0.2)]:
    data, _ = load_binary_dataset(files[name], minority_positive=True)
    train, test = stratified_train_test_split(data, test_size=0.30, random_state=0)
    train, test = standardize_train_test(train, test)
    if noise:
        np.random.seed(0); train = np.asarray(recreat_data(train, noise), dtype=np.float64)
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
    t = {"dense": 0.0, "tree": 0.0}; maxdiff = 0.0
    R.ACTIVE_METHODS = [R.METHOD_INDEX["T7-agree"]]
    for tr, va in skf.split(train[:, :-1], train[:, -1]):
        Xv, yv = train[va, :-1], train[va, -1]
        for k in [2, 3, 4, 5, 6]:
            sets = R.build_ball_sets(train[tr], k)
            for mode, lim in (("dense", 5000), ("tree", 0)):
                FM.DENSE_LIMIT = lim
                t0 = time.perf_counter(); R.score_ball_sets(sets, Xv, yv, k, {}); t[mode] += time.perf_counter() - t0
            bs = sets["gb_all"]
            FM.DENSE_LIMIT = 5000; a = R.member("agreement")(bs, (10, 1.0))
            FM.DENSE_LIMIT = 0; b = R.member("agreement")(bs, (10, 1.0))
            maxdiff = max(maxdiff, float(np.max(np.abs(a - b))))
    FM.DENSE_LIMIT = 5000
    print(json.dumps({"dataset": name, "noise": noise, "T7_tuning_s": {m: round(v, 1) for m, v in t.items()},
                      "max_membership_diff": maxdiff}), flush=True)
