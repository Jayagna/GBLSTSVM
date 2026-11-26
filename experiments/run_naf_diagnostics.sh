#!/bin/bash
# Deletion and detection diagnostics for the NAF-GBLSTSVM paper: 35 datasets, three noise models.
cd "$(dirname "$0")"
OLD=(sonar cleve heart-stat "bupa or liver-disorders" iono wdbc pima ger haberman transfusion vehicle2 wpbc new-thyroid1 ecoli2 yeast3 yeast-2_vs_4 yeast-0-5-6-7-9_vs_4 ecoli4 glass4 abalone9-18 yeast1vs7)
NEW=(monk2 monk3 ecoli-0-1_vs_5 ecoli-0-1-4-6_vs_5 ecoli-0-1-4-7_vs_2-3-5-6 ecoli3 fertility glass2 glass5 led7digit-0-2-4-5-6-7-8-9_vs_1 "vehicle 1" yeast-0-2-5-6_vs_3-7-8-9 yeast-0-2-5-7-9_vs_3-6-8 brwisconsin)
ALL=("${OLD[@]}" "${NEW[@]}")
JOBS=${JOBS:-2}
GB_NOISE_TYPE=uniform python3 noise_diagnostics.py --datasets "${ALL[@]}" --noise 0 0.1 0.2 0.3 --repeats 5 --k-values 4 --jobs $JOBS --out ../results/naf_diagnostics/uniform
for KIND in boundary asymmetric; do
  GB_NOISE_TYPE=$KIND python3 noise_diagnostics.py --datasets "${ALL[@]}" --noise 0.1 0.2 0.3 --repeats 5 --k-values 4 --jobs $JOBS --out ../results/naf_diagnostics/$KIND
done
