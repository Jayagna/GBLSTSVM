# LSTSVM benchmark datasets

This folder contains the 85 numeric binary-classification `.txt` datasets copied from the supplied `LSTSVM.zip` project (`LSTSVM/newd/`).

- Features occupy all columns except the last.
- The final column is the class label.
- Files are whitespace-delimited.
- The source files use a mixture of `-1/+1` and `0/1` labels.
- `dataset_utils.py` automatically maps the less frequent class to `+1` and the other class to `-1`, because the class-imbalance logic in `GBLSTSVM.py` assumes `+1` is the minority class.
- `dataset_manifest.csv` lists sample counts, feature counts, and original class distributions.

Large NDC files are included too. Running the complete hyperparameter grid over every dataset can be computationally expensive, so the main program requires `--dataset all` before it runs everything.
