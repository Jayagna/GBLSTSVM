#!/bin/bash
# Every run behind the paper's linear tables: 35 datasets, 0/5/10/15/20/30% label noise, 10 splits.
# Finished (dataset, noise) files are skipped, so the script can be restarted.
cd "$(dirname "$0")"
OLD=(sonar cleve heart-stat "bupa or liver-disorders" iono wdbc pima ger haberman transfusion vehicle2 wpbc new-thyroid1 ecoli2 yeast3 yeast-2_vs_4 yeast-0-5-6-7-9_vs_4 ecoli4 glass4 abalone9-18 yeast1vs7)
NEW=(monk2 monk3 ecoli-0-1_vs_5 ecoli-0-1-4-6_vs_5 ecoli-0-1-4-7_vs_2-3-5-6 ecoli3 fertility glass2 glass5 led7digit-0-2-4-5-6-7-8-9_vs_1 "vehicle 1" yeast-0-2-5-6_vs_3-7-8-9 yeast-0-2-5-7-9_vs_3-6-8 brwisconsin)
ALL=("${OLD[@]}" "${NEW[@]}")
NOISE="0 0.05 0.1 0.15 0.2 0.3"
CV_METHODS="LSTSVM GBLSTSVM GB-keep T7-agree Keep+gapvote"
# 1. published-style protocol (best test score over the grid)
python3 run_test_tuning.py --datasets "${ALL[@]}" --noise $NOISE --repeats 10 --out ../results/test_tuning
# 2. SVM, TSVM, GBSVM, LS-GBLSTSVM under both protocols
python3 run_baselines.py --datasets "${ALL[@]}" --noise $NOISE --repeats 10 --out ../results/baselines
# 3. fair cross-validation for the LSTSVM family
python3 run_fuzzy_cv.py --datasets "${ALL[@]}" --noise $NOISE --repeats 10 --methods $CV_METHODS --out ../results/paper_cv
