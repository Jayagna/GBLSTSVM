"""Copies the numbers behind the "Backup: the paper's protocol" slides from results/ into this folder.
Run from the repo root after summarize_test_tuning.py, new_membership_probe.py and summarize_new_cv.py:
  python reports/post_midsem/data/make_backup_csv.py
"""
import shutil
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
RES = HERE.parents[2] / "results"

for src, dst in [("summary.csv", "test_tuning_best.csv"), ("fixed_param.csv", "test_tuning_fixed.csv"), ("split0.csv", "test_tuning_split0.csv")]:
    shutil.copy(RES / "test_tuning" / src, HERE / dst)
shutil.copy(RES / "fuzzy_cv_new" / "summary_vs_baselines.csv", HERE / "new_cv.csv")

df = pd.read_csv(RES / "new_membership_probe" / "probe.csv")
cols = [c for c in df.columns if c.startswith("auc_")]
per = df.groupby(["noise", "dataset"])[cols].mean()
rows = []
for c in cols:
    row = {"measure": c}
    for n in (0.1, 0.2, 0.3):
        row[f"auc{int(n * 100)}"] = per.loc[n, c].mean()
    for n in (0.1, 0.2, 0.3):
        row[f"wins{int(n * 100)}"] = int((per.loc[n, c] > per.loc[n, "auc_T7"]).sum())
    rows.append(row)
pd.DataFrame(rows).to_csv(HERE / "new_probe.csv", index=False)
print("wrote", sorted(p.name for p in HERE.glob("*.csv")))
