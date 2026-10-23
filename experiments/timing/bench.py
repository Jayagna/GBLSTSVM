"""Time ball building, T7 and one plane solve for GBLSTSVM, keep, keep+T7 and LSTSVM (linear)."""
import sys, time, json
sys.path.insert(0, "/home/user/GBLSTSVM"); sys.path.insert(0, "/home/user/GBLSTSVM/experiments")
import numpy as np
from pathlib import Path
from dataset_utils import discover_datasets, load_binary_dataset, stratified_train_test_split, standardize_train_test
from addNoisy import recreat_data
import run_fuzzy_cv as R

files = {f.stem: f for f in discover_datasets(Path("/home/user/GBLSTSVM/Data"))}
names = sys.argv[1:] or ["pima", "ger", "yeast3", "abalone9-18", "NDC-10k", "NDC-50k"]

def tmed(fn, reps):
    ts = []
    for _ in range(reps):
        t0 = time.perf_counter(); fn(); ts.append(time.perf_counter() - t0)
    return float(np.median(ts))

out = []
for name in names:
    data, meta = load_binary_dataset(files[name], minority_positive=True)
    for noise in (0.0, 0.2):
        train, test = stratified_train_test_split(data, test_size=0.30, random_state=0)
        train, test = standardize_train_test(train, test)
        if noise:
            np.random.seed(0); train = np.asarray(recreat_data(train, noise), dtype=np.float64)
        t0 = time.perf_counter(); sets = R.build_ball_sets(train, 4); t_build = time.perf_counter() - t0
        gb, gba = sets["gb"], sets["gb_all"]
        smp = R.ball_set_from_samples(train)
        reps = 20 if len(train) < 20000 else 5
        ones = lambda bs: np.ones(len(bs["radii"]))
        row = {"dataset": name, "noise": noise, "n_train": len(train), "d": train.shape[1] - 1,
               "balls_gb": len(gb["radii"]), "balls_keep": len(gba["radii"]), "t_build_balls": t_build}
        agree = R.member("agreement")
        row["t_T7_balls"] = tmed(lambda: agree(gba, (10, 1.0)), 3)
        row["t_T7_points"] = tmed(lambda: agree(smp, (10, 1.0)), 1 if len(train) > 20000 else 3)
        for key, bs in (("gb", gb), ("keep", gba), ("points", smp)):
            m = ones(bs)
            row[f"t_solve_{key}"] = tmed(lambda: R.fit_planes(bs, m, 1.0, 1.0, True), reps)
        out.append(row)
        print(json.dumps({k: (round(v, 4) if isinstance(v, float) else v) for k, v in row.items()}), flush=True)
Path(__file__).with_name("bench.json").write_text(json.dumps(out, indent=1))
