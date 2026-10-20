# GBLSTSVM - Enhancing robustness and efficiency of least square twin SVM via granular computing

Please cite the following paper if you are using this code.
Reference: Tanveer, M., Sharma, R. K., Quadir, A., & Sajid, M. (2025). Enhancing robustness and efficiency of least square twin SVM via granular computing. Pattern Recognition, 112021. https://doi.org/10.1016/j.patcog.2025.112021

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
The experiments are executed on a computing system possessing Python 3.11 software, an Intel(R) Xeon(R) CPU E5-2697 v4 processor operating at 2.30 GHz with 128-GB Random Access Memory (RAM), and a Windows-10 operating platform.

We have put a demo of the “LS-GBTSVM” model with the “breast_cancer” dataset

The following are the best hyperparameters set with respect to the “breast_cancer” dataset

Regularization Parameter c_1=1000  ,  c_2= 0.00001 

Description of files:
main.py: This is the main file to run selected algorithms on datasets. In the path variable specificy the path to the folder containing the codes and datasets on which you wish to run the algorithm.
addNoisy.py: Add Noise label
gen_ball.py: Generation of granular balls
GBLSTSVM.py: Solving the optimization problem

The codes are not optimized for efficiency. The codes have been cleaned for better readability and documented and are not exactly the same as used in our paper. For the detailed experimental setup, please follow the paper. We have re-run and checked the codes only in a few datasets, so if you find any bugs/issues, please write to Rahul Kumar Sharma (rsharma459@gatech.edu).



           

## Added benchmark datasets from LSTSVM.zip

The `Data/LSTSVM_benchmarks/` folder now contains all 85 numeric binary-classification datasets from the supplied MATLAB LSTSVM project. The original `.txt` files are preserved.

`dataset_utils.py` adds compatible loading for both the original comma-separated CSV data and the whitespace-separated LSTSVM text datasets. It also:

- validates that the last column contains exactly two class labels;
- maps the less frequent class to `+1` and the other class to `-1`, matching the CIL assumptions in `GBLSTSVM.py`;
- makes a reproducible stratified 70/30 train/test split;
- standardizes features using training-set mean/std only (disable with `--no-standardize`).

### Examples

List all bundled datasets:

```bash
python main.py --list
```

Run the original demo only (default):

```bash
python main.py
```

Run one imported dataset:

```bash
python main.py --dataset pima
```

Run several imported datasets:

```bash
python main.py --dataset pima --dataset sonar --dataset wdbc
```

Use only a selected granular-ball split value while testing a dataset:

```bash
python main.py --dataset pima --k-values 2
```

Run every bundled dataset explicitly:

```bash
python main.py --dataset all
```

**Warning:** the NDC datasets and the full `c1/c2` grid can make `--dataset all` very expensive. Test individual datasets or a small set first.

The file `Data/LSTSVM_benchmarks/dataset_manifest.csv` contains the number of samples, number of features, and original class counts for each imported dataset.

## Fuzzy membership experiments

`fuzzy_membership.py` adds ball-level fuzzy membership functions (T1 centre-distance, T2 neighbour entropy, T4 ball overlap, T5 density, T7 neighbour label agreement). `LSTWGBSVM(..., membership=s)` multiplies each ball's slack weight by its membership `s_i`; `membership_on="both"` also applies it to the proximity term. `LSTWGBSVM` now also returns the true `roc_auc` of the plane-distance score (the old `auc` key is balanced accuracy).

`experiments/run_fuzzy_cv.py` compares the memberships without test-set tuning: repeated stratified 70/30 splits, optional label noise on the training part, and `k`, `c1`, `c2`, class weighting and the membership parameter chosen by stratified 5-fold CV on the training part. It also runs LSTSVM on raw samples (every sample a ball of radius 0) as a reference. `adpgbg.py` is a Python port of the ADPGBG ball generator (Liao et al., 2025), available to the runner as the `adp` ball set (methods `GB-adp`, `T4-adp`, `T7-adp`).

```bash
python experiments/run_fuzzy_cv.py --noise 0 0.1 0.2 --repeats 5 --out results/fuzzy_cv_v1
python experiments/summarize_fuzzy.py results/fuzzy_cv_v1
```

Note: `main.py` still selects `c1`, `c2` and `k` on the test set, as in the original demo; use the experiment runner for reportable numbers.
