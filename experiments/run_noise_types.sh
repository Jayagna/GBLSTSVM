#!/bin/bash
# NAF-GBLSTSVM paper: the same 35 datasets under two further label-noise models (noise_models.py):
# boundary-targeted and class-dependent (asymmetric) noise, 10/20/30%, 5 splits, both tuning protocols.
# Restartable: finished (dataset, noise) files are skipped.
cd "$(dirname "$0")"
OLD=(sonar cleve heart-stat "bupa or liver-disorders" iono wdbc pima ger haberman transfusion vehicle2 wpbc new-thyroid1 ecoli2 yeast3 yeast-2_vs_4 yeast-0-5-6-7-9_vs_4 ecoli4 glass4 abalone9-18 yeast1vs7)
NEW=(monk2 monk3 ecoli-0-1_vs_5 ecoli-0-1-4-6_vs_5 ecoli-0-1-4-7_vs_2-3-5-6 ecoli3 fertility glass2 glass5 led7digit-0-2-4-5-6-7-8-9_vs_1 "vehicle 1" yeast-0-2-5-6_vs_3-7-8-9 yeast-0-2-5-7-9_vs_3-6-8 brwisconsin)
ALL=("${OLD[@]}" "${NEW[@]}")
NOISE="${NOISE:-0.1 0.2 0.3}"
KINDS="${KINDS:-boundary asymmetric}"
for KIND in $KINDS; do
  export GB_NOISE_TYPE=$KIND
  OUT=../results/noise_$KIND
  python3 run_fuzzy_cv.py --datasets "${ALL[@]}" --noise $NOISE --repeats 5 --methods LSTSVM GBLSTSVM GB-keep T7-agree FKNN-LSTSVM --out $OUT/paper_cv
  python3 run_test_tuning.py --datasets "${ALL[@]}" --noise $NOISE --repeats 5 --methods LSTSVM FKNN-LSTSVM GBLSTSVM GB-keep T7-agree --out $OUT/test_tuning
  python3 run_baselines.py --datasets "${ALL[@]}" --noise $NOISE --repeats 5 --out $OUT/baselines
done
