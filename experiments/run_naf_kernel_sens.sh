#!/bin/bash
# NAF-GBLSTSVM: Gaussian kernel (35 datasets, noise 0/10/20%, 5 splits, same grid as results/kernel)
# and sensitivity to k and gamma (21 datasets as for RF, 5 splits, noise 0 and 20%). Restartable.
cd "$(dirname "$0")"
while pgrep -f "run_naf_queue.sh" > /dev/null; do sleep 120; done
OLD=(sonar cleve heart-stat "bupa or liver-disorders" iono wdbc pima ger haberman transfusion vehicle2 wpbc new-thyroid1 ecoli2 yeast3 yeast-2_vs_4 yeast-0-5-6-7-9_vs_4 ecoli4 glass4 abalone9-18 yeast1vs7)
NEW=(monk2 monk3 ecoli-0-1_vs_5 ecoli-0-1-4-6_vs_5 ecoli-0-1-4-7_vs_2-3-5-6 ecoli3 fertility glass2 glass5 led7digit-0-2-4-5-6-7-8-9_vs_1 "vehicle 1" yeast-0-2-5-6_vs_3-7-8-9 yeast-0-2-5-7-9_vs_3-6-8 brwisconsin)
ALL=("${OLD[@]}" "${NEW[@]}")
python3 run_sensitivity.py --model naf --datasets "${OLD[@]}" --noise 0 0.2 --repeats 5 --out ../results/sensitivity_naf
python3 run_baselines.py --kernel --datasets "${ALL[@]}" --noise 0 0.1 0.2 --repeats 5 --k-values 2 4 6 --methods T7-agree --out ../results/kernel_naf
