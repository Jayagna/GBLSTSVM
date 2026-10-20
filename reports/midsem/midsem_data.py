"""Collect every number the midsem deck shows into midsem_data.json (run from anywhere)."""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import wilcoxon

REPO = Path("/home/user/GBLSTSVM")
sys.path.insert(0, str(REPO / "experiments"))
from gbftsvm_report import PAPER, load as load_gbft  # noqa: E402
from paper_tables import holm, load_runs  # noqa: E402

OUT = Path(__file__).with_name("midsem_data.json")


def means_and_tests(dirs, keys, ref):
    df = load_runs(dirs)
    df = df[df["method"].isin(keys)]
    res = {}
    for nz in sorted(df["noise"].unique()):
        m = (df[df["noise"] == nz].groupby(["dataset", "method"])["balanced_accuracy"].mean().unstack()[keys] * 100).dropna()
        others = [k for k in keys if k != ref]
        raw = [wilcoxon(m[k], m[ref]).pvalue for k in others]
        adj = holm(np.array(raw))
        res[f"{nz:g}"] = {"n_datasets": len(m), "mean": {k: round(float(m[k].mean()), 2) for k in keys},
                          "diff_vs_ref": {k: round(float(m[k].mean() - m[ref].mean()), 2) for k in others},
                          "holm_p": {k: float(p) for k, p in zip(others, adj)},
                          "wins": {k: int((m[k] > m[ref] + 1e-9).sum()) for k in others}}
    return res


data = {}
data["linear"] = means_and_tests(["fuzzy_cv_v4", "fuzzy_cv_v5", "fuzzy_cv_v6", "gbftsvm_cv"],
                                 ["GBLSTSVM", "GB-keep", "T7-agree", "GB-adp", "GBFTSVM", "LSTSVM", "FKNN-LSTSVM"], "GBLSTSVM")
data["twin"] = means_and_tests(["fuzzy_cv_v4", "fuzzy_cv_v6", "gbftsvm_cv"],
                               ["GBFTSVM", "GBLSTSVM", "GBTWSVM", "GBFTSVM-keep", "GBFTSVM-adp", "T7-agree"], "GBFTSVM")
data["kernel"] = means_and_tests(["kernel_cv_v1", "kernel_cv_v2"],
                                 ["K-GBLSTSVM", "K-GB-keep", "K-keep-T7", "K-LSTSVM", "K-FKNN-LSTSVM"], "K-GBLSTSVM")

diag = pd.read_csv(REPO / "results/noise_diagnostics/diagnostics.csv")
cols = [c for c in diag.columns if c.startswith(("deleted_", "auc_"))]
summ = diag.groupby(["noise", "dataset"])[cols].mean().groupby("noise").mean()
data["diagnostics"] = {f"{nz:g}": {c: round(float(v), 3) for c, v in row.items()} for nz, row in summ.iterrows()}

g = load_gbft(REPO / "results/gbftsvm_cv")
avg = g.groupby(["method", "noise", "dataset"]).mean(numeric_only=True).groupby(["method", "noise"]).mean()
data["test_tuning"] = {m: {f"{nz:g}": {"cv_ba": round(float(avg.loc[(m, nz), "balanced_accuracy"]), 2),
                                       "test_tuned_ba": round(float(avg.loc[(m, nz), "oracle_balanced_accuracy"]), 2),
                                       "impure_pct": round(100 * float(avg.loc[(m, nz), "share_impure_balls"]), 2)}
                           for nz in sorted(g["noise"].unique())} for m in g["method"].unique()}
per_ds = g.groupby(["method", "noise", "dataset"]).mean(numeric_only=True)
data["paper_vs_ours"] = {ds: {"paper_GBFTSVM": 100 * PAPER[ds][0.0][1], "paper_GBTWSVM": 100 * PAPER[ds][0.0][0],
                              "ours_cv_acc": round(float(per_ds.loc[("GBFTSVM", 0.0, ds), "accuracy"]), 1),
                              "ours_test_tuned_acc": round(float(per_ds.loc[("GBFTSVM", 0.0, ds), "oracle_accuracy"]), 1)}
                         for ds in PAPER}

timing = {}
for f in sorted((REPO / "results/kernel_timing").glob("*.json")):
    r = json.loads(f.read_text())
    timing.setdefault(f"{r['noise']:g}", []).append(
        {"train": r["train"], **{m: {"time": v["train_time"], "ba": 100 * v["bal_acc"]} for m, v in r["models"].items()
                                 if "train_time" in v}})
for v in timing.values():
    v.sort(key=lambda row: row["train"])
data["timing"] = timing

r1 = load_runs(["fuzzy_cv_v1"])
data["round1"] = {f"{nz:g}": {m: round(float(v), 2) for m, v in
                              (r1[r1["noise"] == nz].groupby(["dataset", "method"])["balanced_accuracy"].mean().unstack() * 100).mean().items()}
                  for nz in sorted(r1["noise"].unique())}
r2 = load_runs(["fuzzy_cv_v2"])
data["round2"] = {f"{nz:g}": {m: round(float(v), 2) for m, v in
                              (r2[r2["noise"] == nz].groupby(["dataset", "method"])["balanced_accuracy"].mean().unstack() * 100).mean().items()}
                  for nz in sorted(r2["noise"].unique())}

sys.path.insert(0, str(REPO))
from dataset_utils import discover_datasets, load_binary_dataset  # noqa: E402
from run_fuzzy_cv import DEFAULT_DATASETS  # noqa: E402
files = {f.stem: f for f in discover_datasets(REPO / "Data")}
rows = []
for name in DEFAULT_DATASETS:
    info = load_binary_dataset(files[name])[1]
    rows.append({"name": name, "n": info["samples"], "d": info["features"],
                 "ir": round(info["negative_count"] / info["positive_count"], 1)})
data["datasets"] = rows

OUT.write_text(json.dumps(data, indent=1))
print(json.dumps({k: data[k] for k in ("linear", "twin")}, indent=1)[:3000])
