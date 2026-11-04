"""results/gmm_probe/probe.csv -> data/gmm_probe.csv (per-noise mean over datasets, wins vs T7)."""
import sys
import pandas as pd
src, dst = sys.argv[1], sys.argv[2]
df = pd.read_csv(src)
cols = [c for c in df.columns if c.startswith("auc_") and not c.endswith("_minority")]
per = df.groupby(["noise", "dataset"])[cols + ["n_balls_kmeans", "n_balls_gmm"]].mean()
mean = per.groupby("noise").mean().add_suffix("_mean")
wins = per[cols].sub(per["auc_T7"], axis=0).gt(0).groupby("noise").sum().add_suffix("_wins")
out = pd.concat([mean, wins], axis=1).reset_index()
out["noise"] = (out["noise"] * 100).round().astype(int).astype(str) + "%"
out.to_csv(dst, index=False, float_format="%.4f")
print(out.T)
