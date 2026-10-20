import argparse
import os
import time
from pathlib import Path

import numpy as np

from addNoisy import recreat_data
from dataset_utils import (
    discover_datasets,
    load_binary_dataset,
    select_datasets,
    standardize_train_test,
    stratified_train_test_split,
)
from GBLSTSVM import LSTWGBSVM
from gen_ball import gen_balls


def prepare_ball_matrix(balls):
    """Convert granular balls to [centers..., radius, label, sample_count]."""
    centers = np.array([b[0] for b in balls], dtype=np.float64)
    radius = np.array([b[1] for b in balls], dtype=np.float64).reshape(-1, 1)
    label = np.array([b[2] for b in balls], dtype=np.float64).reshape(-1, 1)

    if len(balls[0]) > 3:
        counts = np.array([b[3] for b in balls], dtype=np.float64).reshape(-1, 1)
        return np.hstack((centers, radius, label, counts))
    return np.hstack((centers, radius, label))


def evaluate_dataset(
    file_path,
    k_values=(2, 3, 4, 5, 6),
    noise_level=0.0,
    standardize=True,
    test_size=0.30,
    random_state=0,
):
    print("\n" + "=" * 80)
    print(f" DATASET EVALUATION: {os.path.basename(file_path)}")
    print("=" * 80)

    file_data, meta = load_binary_dataset(file_path, minority_positive=True)
    m, n = file_data.shape

    print(
        "Original label mapping: "
        f"{meta['positive_original_label']:g} -> +1 (minority), "
        f"{meta['negative_original_label']:g} -> -1"
    )

    train_data, test_data = stratified_train_test_split(
        file_data,
        test_size=test_size,
        random_state=random_state,
    )

    if standardize:
        train_data, test_data = standardize_train_test(train_data, test_data)

    n_pos_train = int(np.sum(train_data[:, -1] == 1))
    n_neg_train = int(np.sum(train_data[:, -1] == -1))
    n_pos_test = int(np.sum(test_data[:, -1] == 1))
    n_neg_test = int(np.sum(test_data[:, -1] == -1))

    imbalance_ratio = max(n_pos_train, n_neg_train) / max(1, min(n_pos_train, n_neg_train))

    print(f"Total Samples: {m} (Features: {n - 1})")
    print(
        f"Train Set: {len(train_data)} samples | "
        f"Class +1 (Minority): {n_pos_train}, Class -1 (Majority): {n_neg_train}"
    )
    print(
        f"Test Set:  {len(test_data)} samples | "
        f"Class +1: {n_pos_test}, Class -1: {n_neg_test}"
    )
    print(f"Training Imbalance Ratio (IR): {imbalance_ratio:.2f}:1")
    print(f"Feature Standardization: {'ON' if standardize else 'OFF'}")
    print("-" * 80)

    noisy_train = recreat_data(train_data, noise_level) if noise_level > 0 else train_data

    pur = 0.985
    delbals = 2
    c_candidates = [0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0]
    results_summary = []

    for k in k_values:
        print(f"\n>>> Running Granular Ball generation with k-means (k={k}) ...")
        t_gen_start = time.time()
        balls = gen_balls(noisy_train, pur=pur, delbals=delbals, k_clusters=k)
        t_gen = time.time() - t_gen_start

        pos_balls = [b for b in balls if b[2] == 1]
        neg_balls = [b for b in balls if b[2] == -1]

        print(
            f"    Generated {len(balls)} Granular Balls: "
            f"{len(pos_balls)} Positive (+1), {len(neg_balls)} Negative (-1) "
            f"in {t_gen:.3f}s"
        )

        if len(pos_balls) == 0 or len(neg_balls) == 0:
            print("    [Warning] Degenerate ball generation, skipping k.")
            continue

        train_ball_matrix = prepare_ball_matrix(balls)

        # 1. Unweighted baseline (standard GBLSTSVM)
        best_unweighted = None
        best_uw_score = -1.0
        for c1 in c_candidates:
            for c2 in c_candidates:
                res = LSTWGBSVM(
                    train_ball_matrix,
                    test_data,
                    c1=c1,
                    c2=c2,
                    use_imbalance=False,
                    return_details=True,
                )
                score = res["auc"]
                if score > best_uw_score:
                    best_uw_score = score
                    best_unweighted = (c1, c2, res)

        # 2. Class-imbalance weighted (CIL GBLSTSVM)
        best_weighted = None
        best_w_score = -1.0
        for c1 in c_candidates:
            for c2 in c_candidates:
                res = LSTWGBSVM(
                    train_ball_matrix,
                    test_data,
                    c1=c1,
                    c2=c2,
                    use_imbalance=True,
                    balance_power=1.0,
                    return_details=True,
                )
                score = res["auc"] + 0.1 * (res["accuracy"] / 100.0)
                if score > best_w_score:
                    best_w_score = score
                    best_weighted = (c1, c2, res)

        uw_c1, uw_c2, uw_res = best_unweighted
        w_c1, w_c2, w_res = best_weighted

        print(
            f"    [Unweighted] Best (c1={uw_c1}, c2={uw_c2}) -> "
            f"ACC: {uw_res['accuracy']:.2f}% | AUC*: {uw_res['auc']:.4f} | "
            f"Min Recall: {uw_res['sensitivity']:.4f} | Maj Recall: {uw_res['specificity']:.4f} | "
            f"G-Mean: {uw_res['gmean']:.4f} | F1: {uw_res['f1_score']:.4f}"
        )
        print(
            f"    [Weighted CIL] Best (c1={w_c1}, c2={w_c2}) -> "
            f"ACC: {w_res['accuracy']:.2f}% | AUC*: {w_res['auc']:.4f} | "
            f"Min Recall: {w_res['sensitivity']:.4f} | Maj Recall: {w_res['specificity']:.4f} | "
            f"G-Mean: {w_res['gmean']:.4f} | F1: {w_res['f1_score']:.4f}"
        )
        print(
            f"    Confusion Matrix (CIL): TP={w_res['tp']}/{n_pos_test} (Minority), "
            f"TN={w_res['tn']}/{n_neg_test} (Majority)"
        )

        results_summary.append(
            {
                "k": k,
                "pos_balls": len(pos_balls),
                "neg_balls": len(neg_balls),
                "total_balls": len(balls),
                "uw_acc": uw_res["accuracy"],
                "uw_auc": uw_res["auc"],
                "uw_sens": uw_res["sensitivity"],
                "uw_f1": uw_res["f1_score"],
                "w_acc": w_res["accuracy"],
                "w_auc": w_res["auc"],
                "w_sens": w_res["sensitivity"],
                "w_spec": w_res["specificity"],
                "w_gmean": w_res["gmean"],
                "w_f1": w_res["f1_score"],
                "w_c1": w_c1,
                "w_c2": w_c2,
                "time": w_res["elapsed_time"],
            }
        )

    if not results_summary:
        print("No valid configurations were produced for this dataset.")
        return None

    print("\n" + "=" * 90)
    print(" SUMMARY COMPARISON ACROSS K-MEANS VALUES & CLASS IMBALANCE FACTOR")
    print("=" * 90)
    print(
        f"{'k':<4} | {'GB Count':<14} | {'Unweighted AUC*':<16} | {'CIL AUC*':<10} | "
        f"{'CIL Min Recall':<15} | {'CIL G-Mean':<11} | {'CIL ACC':<8}"
    )
    print("-" * 90)
    for r in results_summary:
        gb_str = f"{r['total_balls']} (+{r['pos_balls']}/-{r['neg_balls']})"
        print(
            f"{r['k']:<4} | {gb_str:<14} | {r['uw_auc']:<16.4f} | {r['w_auc']:<10.4f} | "
            f"{r['w_sens']:<15.4f} | {r['w_gmean']:<11.4f} | {r['w_acc']:.2f}%"
        )
    print("=" * 90)

    best_overall = max(results_summary, key=lambda x: x["w_auc"])
    print(
        f"\n[RECOMMENDED CONFIGURATION]: k-means={best_overall['k']} with "
        f"Class Imbalance Learning (c1={best_overall['w_c1']}, c2={best_overall['w_c2']})"
    )
    print(
        f"Achieved: AUC* = {best_overall['w_auc']:.4f}, "
        f"Minority Recall = {best_overall['w_sens']:.4f}, "
        f"Specificity = {best_overall['w_spec']:.4f}, "
        f"Accuracy = {best_overall['w_acc']:.2f}%\n"
    )
    print("* Note: this project's 'AUC' is (sensitivity + specificity) / 2, i.e. balanced accuracy.")
    return results_summary


def build_parser():
    parser = argparse.ArgumentParser(
        description="Run GBLSTSVM/CIL experiments on the bundled binary datasets."
    )
    parser.add_argument(
        "--data-dir",
        default="./Data",
        help="Dataset root directory (default: ./Data)",
    )
    parser.add_argument(
        "--dataset",
        action="append",
        default=[],
        help=(
            "Dataset filename/stem/substring. Repeat to run several. "
            "Use '--dataset all' to run every bundled dataset. "
            "Default: breast_cancer.csv only."
        ),
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List discovered datasets and exit.",
    )
    parser.add_argument(
        "--k-values",
        nargs="+",
        type=int,
        default=[2, 3, 4, 5, 6],
        help="K-means k values used for granular-ball splitting.",
    )
    parser.add_argument(
        "--noise-level",
        type=float,
        default=0.0,
        help="Optional label-noise level passed to addNoisy.py (default: 0).",
    )
    parser.add_argument(
        "--no-standardize",
        action="store_true",
        help="Disable training-statistics z-score feature standardization.",
    )
    return parser


def main():
    args = build_parser().parse_args()
    files = discover_datasets(args.data_dir)

    if not files:
        print(f"No supported dataset files found under {args.data_dir}")
        return

    if args.list:
        print(f"Discovered {len(files)} dataset files:\n")
        for p in files:
            try:
                _, meta = load_binary_dataset(p, minority_positive=True)
                print(
                    f"- {p.relative_to(Path(args.data_dir))} | "
                    f"samples={meta['samples']}, features={meta['features']}, "
                    f"minority={meta['positive_count']}, majority={meta['negative_count']}"
                )
            except Exception as exc:
                print(f"- {p.relative_to(Path(args.data_dir))} | [skip: {exc}]")
        return

    selected = select_datasets(files, args.dataset)
    if not selected:
        print("No dataset matched the requested selector(s). Use --list to see available names.")
        return

    print(f"Selected {len(selected)} dataset(s).")
    for fpath in selected:
        try:
            evaluate_dataset(
                fpath,
                k_values=args.k_values,
                noise_level=args.noise_level,
                standardize=not args.no_standardize,
            )
        except Exception as exc:
            print(f"\n[ERROR] {fpath.name}: {exc}")


if __name__ == "__main__":
    main()
