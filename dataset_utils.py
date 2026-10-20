from pathlib import Path
import numpy as np
from sklearn.model_selection import train_test_split


def load_binary_dataset(file_path, minority_positive=True):
    """Load a numeric binary-classification dataset.

    Supported formats:
      * .csv: comma separated
      * .txt/.data (and other suffixes): arbitrary whitespace separated

    The last column is treated as the class label. Labels are normalized to
    {-1, +1}. By default the less frequent class is mapped to +1 because the
    CIL implementation in GBLSTSVM.py treats +1 as the minority class.
    """
    path = Path(file_path)
    delimiter = "," if path.suffix.lower() == ".csv" else None
    data = np.loadtxt(path, delimiter=delimiter, dtype=np.float64)

    if data.ndim == 1:
        data = data.reshape(1, -1)
    if data.ndim != 2 or data.shape[1] < 2:
        raise ValueError(f"{path.name}: expected at least one feature and one label column")
    if not np.all(np.isfinite(data)):
        raise ValueError(f"{path.name}: contains NaN or infinite values")

    labels = data[:, -1]
    unique, counts = np.unique(labels, return_counts=True)
    if len(unique) != 2:
        raise ValueError(
            f"{path.name}: expected exactly two label values in the last column; "
            f"found {unique.tolist()}"
        )

    # The GBLSTSVM class-imbalance code assumes +1 is the minority class.
    if minority_positive:
        if counts[0] == counts[1]:
            positive_label = 1.0 if 1.0 in unique else unique[-1]
        else:
            positive_label = unique[int(np.argmin(counts))]
    else:
        positive_label = 1.0 if 1.0 in unique else unique[-1]

    negative_label = unique[0] if unique[1] == positive_label else unique[1]
    normalized = data.copy()
    normalized[:, -1] = np.where(labels == positive_label, 1.0, -1.0)

    metadata = {
        "path": str(path),
        "name": path.name,
        "samples": int(data.shape[0]),
        "features": int(data.shape[1] - 1),
        "original_labels": unique.tolist(),
        "original_counts": counts.tolist(),
        "positive_original_label": float(positive_label),
        "negative_original_label": float(negative_label),
        "positive_count": int(np.sum(normalized[:, -1] == 1)),
        "negative_count": int(np.sum(normalized[:, -1] == -1)),
    }
    return normalized, metadata


def stratified_train_test_split(data, test_size=0.30, random_state=0):
    """Create a reproducible stratified split while keeping label as last column."""
    X = data[:, :-1]
    y = data[:, -1]
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )
    train = np.column_stack((X_train, y_train))
    test = np.column_stack((X_test, y_test))
    return train, test


def standardize_train_test(train_data, test_data, eps=1e-12):
    """Z-score features using training-set statistics only; labels are unchanged."""
    train = np.asarray(train_data, dtype=np.float64).copy()
    test = np.asarray(test_data, dtype=np.float64).copy()

    mean = train[:, :-1].mean(axis=0)
    std = train[:, :-1].std(axis=0)
    safe_std = np.where(std < eps, 1.0, std)

    train[:, :-1] = (train[:, :-1] - mean) / safe_std
    test[:, :-1] = (test[:, :-1] - mean) / safe_std
    return train, test


def discover_datasets(data_dir):
    """Recursively discover supported dataset files beneath data_dir."""
    root = Path(data_dir)
    if not root.exists():
        return []
    supported = {".csv", ".txt", ".data"}
    return sorted(
        [
            p for p in root.rglob("*")
            if p.is_file()
            and p.suffix.lower() in supported
            and p.name.lower() != "dataset_manifest.csv"
        ],
        key=lambda p: (p.parent.as_posix().lower(), p.name.lower()),
    )


def select_datasets(all_files, selectors):
    """Resolve CLI selectors by exact filename, stem, or relative-path substring."""
    files = list(all_files)
    if not selectors:
        # Preserve the original project's default: run its breast-cancer dataset only.
        preferred = [p for p in files if p.name.lower() == "breast_cancer.csv"]
        return preferred[:1] if preferred else files[:1]

    if any(s.lower() == "all" for s in selectors):
        return files

    selected = []
    for selector in selectors:
        q = selector.lower().strip()
        matches = [
            p for p in files
            if p.name.lower() == q
            or p.stem.lower() == q
            or q in p.as_posix().lower()
        ]
        for p in matches:
            if p not in selected:
                selected.append(p)
    return selected
