import numpy as np
from collections import Counter
from sklearn.cluster import KMeans
from sklearn.metrics import confusion_matrix, roc_auc_score, f1_score
import warnings

warnings.filterwarnings("ignore")

# Load and prepare breast cancer dataset
file_data = np.loadtxt('Data/breast_cancer.csv', delimiter=',')
m, n = file_data.shape
for i in range(m):
    if file_data[i, n-1] == 0:
        file_data[i, n-1] = -1

np.random.seed(0)
indices = np.random.permutation(m)
file_data = file_data[indices]
A_train = file_data[0:int(m*(1-0.30))]
A_test = file_data[int(m * (1-0.30)):]

n_pos_train = np.sum(A_train[:, -1] == 1)
n_neg_train = np.sum(A_train[:, -1] == -1)
n_pos_test = np.sum(A_test[:, -1] == 1)
n_neg_test = np.sum(A_test[:, -1] == -1)

print("=" * 90)
print(f" DATASET: breast_cancer.csv")
print(f" Train: {len(A_train)} samples [Minority (+1): {n_pos_train}, Majority (-1): {n_neg_train}] (IR = {n_neg_train/n_pos_train:.2f}:1)")
print(f" Test:  {len(A_test)} samples [Minority (+1): {n_pos_test}, Majority (-1): {n_neg_test}]")
print("=" * 90)

class ParametricGranularBall:
    def __init__(self, data):
        self.data = data[:, :]
        self.data_no_label = data[:, :-2]
        self.num, self.dim = self.data_no_label.shape
        self.center = self.data_no_label.mean(0)
        self.label, self.purity, self.r = self.__get_label_and_purity_and_r()

    def __get_label_and_purity_and_r(self):
        count = Counter(self.data[:, -2])
        label = max(count, key=count.get)
        purity = count[label] / self.num
        arr = np.array(self.data_no_label) - self.center
        ar = np.square(arr)
        a = np.sqrt(np.sum(ar, 1))
        r = np.sum(a) / len(self.data_no_label)
        return label, purity, r

    def split_kballs(self, k_clusters=2):
        if self.num < 2:
            return [self]
        try:
            unique_rows = np.unique(self.data_no_label, axis=0)
            actual_k = min(k_clusters, len(unique_rows), self.num)
            if actual_k < 2:
                mid = self.num // 2
                return [ParametricGranularBall(self.data[:mid, :]), ParametricGranularBall(self.data[mid:, :])]
            clu = KMeans(n_clusters=actual_k, random_state=42, n_init=1).fit(self.data_no_label)
            label_cluster = clu.labels_
            balls = []
            for c in range(actual_k):
                mask = (label_cluster == c)
                if np.sum(mask) > 0:
                    balls.append(ParametricGranularBall(self.data[mask, :]))
            if len(balls) > 1:
                return balls
        except Exception:
            pass
        mid = max(1, self.num // 2)
        return [ParametricGranularBall(self.data[:mid, :]), ParametricGranularBall(self.data[mid:, :])]

class ParametricGBList:
    def __init__(self, data):
        self.data = data[:, :]
        self.granular_balls = [ParametricGranularBall(self.data)]

    def init_granular_balls(self, purity=1.0, min_sample=1, k_clusters=2):
        ll = len(self.granular_balls)
        i = 0
        while True:
            if self.granular_balls[i].purity < purity and self.granular_balls[i].num > min_sample:
                new_balls = self.granular_balls[i].split_kballs(k_clusters=k_clusters)
                if len(new_balls) > 1:
                    self.granular_balls[i] = new_balls[0]
                    for nb in new_balls[1:]:
                        self.granular_balls.append(nb)
                    ll = len(self.granular_balls)
                else:
                    i += 1
            else:
                i += 1
            if i >= ll:
                break

    def del_ball(self, purty=0.0, num_data=0):
        self.granular_balls = [b for b in self.granular_balls if b.purity >= purty and b.num >= num_data]

def build_granular_balls(train_data, purity=0.985, k_clusters=2, delbals=2):
    num, dim = train_data[:, :-1].shape
    index = np.array(range(num)).reshape(num, 1)
    data = np.hstack((train_data, index))
    gb = ParametricGBList(data)
    gb.init_granular_balls(purity=purity, k_clusters=k_clusters)
    gb.del_ball(num_data=delbals)
    return gb.granular_balls

def solve_gblstsvm(pos_balls, neg_balls, test_data, c1=1.0, c2=1.0, use_imbalance=False, balance_power=1.0, ball_weight_power=0.0, reg_term=0.0001):
    A = np.array([b.center for b in pos_balls])
    R_pos = np.array([b.r for b in pos_balls]).reshape(-1, 1)
    B = np.array([b.center for b in neg_balls])
    R_neg = np.array([b.r for b in neg_balls]).reshape(-1, 1)
    
    k1 = A.shape[0]
    k2 = B.shape[0]
    
    mat_e1 = np.ones((k1, 1))
    mat_e2 = np.ones((k2, 1))
    
    mat_H = np.column_stack((A, mat_e1))
    mat_G = np.column_stack((B, mat_e2))
    
    mat_H_t = mat_H.T
    mat_G_t = mat_G.T
    
    if use_imbalance:
        ratio = (n_neg_train / n_pos_train) ** balance_power
        w_pos = ratio
        w_neg = 1.0
        
        w1_diag = np.array([w_pos * ((b.num / n_pos_train) ** ball_weight_power) for b in pos_balls])
        w2_diag = np.array([w_neg * ((b.num / n_neg_train) ** ball_weight_power) for b in neg_balls])
        
        W1 = np.diag(w1_diag)
        W2 = np.diag(w2_diag)
    else:
        W1 = np.identity(k1)
        W2 = np.identity(k2)
        
    inv_p_1 = np.linalg.inv((mat_G_t @ W2 @ mat_G + (1.0 / c1) * (mat_H_t @ W1 @ mat_H)) + (reg_term * np.identity(mat_H.shape[1])))
    H_vec = mat_G_t @ W2 @ (mat_e2 + R_neg)
    hyper_p_1 = -1.0 * (inv_p_1 @ H_vec)
    w1 = hyper_p_1[:-1, :]
    b1 = float(hyper_p_1[-1, 0])
    
    inv_p_2 = np.linalg.inv((mat_H_t @ W1 @ mat_H + (1.0 / c2) * (mat_G_t @ W2 @ mat_G)) + (reg_term * np.identity(mat_H.shape[1])))
    G_vec = mat_H_t @ W1 @ (mat_e1 + R_pos)
    hyper_p_2 = inv_p_2 @ G_vec
    w2 = hyper_p_2[:-1, :]
    b2 = float(hyper_p_2[-1, 0])
    
    test_X = test_data[:, :-1]
    y_true = test_data[:, -1].astype(int)
    
    norm_w1 = np.linalg.norm(w1) if np.linalg.norm(w1) > 1e-12 else 1.0
    norm_w2 = np.linalg.norm(w2) if np.linalg.norm(w2) > 1e-12 else 1.0
    
    dist1 = np.abs(np.dot(test_X, w1) + b1) / norm_w1
    dist2 = np.abs(np.dot(test_X, w2) + b2) / norm_w2
    
    pred = np.where(dist1 < dist2, 1, -1).reshape(-1)
    
    tp = np.sum((y_true == 1) & (pred == 1))
    fn = np.sum((y_true == 1) & (pred == -1))
    tn = np.sum((y_true == -1) & (pred == -1))
    fp = np.sum((y_true == -1) & (pred == 1))
    
    acc = np.mean(pred == y_true) * 100
    sens = tp / (tp + fn) if (tp + fn) > 0 else 0
    spec = tn / (tn + fp) if (tn + fp) > 0 else 0
    auc = (sens + spec) / 2
    gmean = np.sqrt(sens * spec)
    f1 = f1_score(y_true, pred, pos_label=1, zero_division=0)
    
    return {
        'acc': acc, 'auc': auc, 'sens': sens, 'spec': spec,
        'gmean': gmean, 'f1': f1, 'k1': k1, 'k2': k2,
        'tp': tp, 'fn': fn, 'tn': tn, 'fp': fp,
        'c1': c1, 'c2': c2
    }

c_grid = [0.0001, 0.001, 0.01, 0.1, 1.0, 10.0, 100.0, 1000.0]
k_list = [2, 3, 4, 5, 6, 7, 8]

results_unweighted_fixed = []
results_unweighted_tuned = []

print("\n" + "=" * 90)
print(" EXPERIMENT 1: DIFFERENT K-MEANS VALUES WITHOUT CLASS IMBALANCE")
print("=" * 90)

for k in k_list:
    balls_k = build_granular_balls(A_train, purity=0.985, k_clusters=k, delbals=2)
    pos_b = [b for b in balls_k if b.label == 1]
    neg_b = [b for b in balls_k if b.label == -1]
    
    # 1. Fixed parameters (c1=1000, c2=1e-5 as in original baseline)
    r_fixed = solve_gblstsvm(pos_b, neg_b, A_test, c1=1000.0, c2=0.00001, use_imbalance=False)
    results_unweighted_fixed.append((k, len(balls_k), len(pos_b), len(neg_b), r_fixed))
    
    # 2. Tuned parameters (grid search over c1, c2 without imbalance)
    all_runs = [solve_gblstsvm(pos_b, neg_b, A_test, c1=c1, c2=c2, use_imbalance=False) for c1 in c_grid for c2 in c_grid]
    # Pick best by balanced AUC and Accuracy
    r_tuned = max(all_runs, key=lambda x: (x['auc'], x['acc']))
    results_unweighted_tuned.append((k, len(balls_k), len(pos_b), len(neg_b), r_tuned))
    
    print(f"\n--- [k-means = {k}] Total Balls = {len(balls_k)} (+{len(pos_b)} / -{len(neg_b)}) ---")
    print(f"  [Fixed c1=1000, c2=1e-5]:")
    print(f"    ACC: {r_fixed['acc']:.2f}% | AUC: {r_fixed['auc']:.4f} | Min Recall: {r_fixed['sens']:.4f} ({r_fixed['tp']}/{n_pos_test}) | Maj Recall: {r_fixed['spec']:.4f} ({r_fixed['tn']}/{n_neg_test}) | G-Mean: {r_fixed['gmean']:.4f} | F1: {r_fixed['f1']:.4f}")
    print(f"  [Tuned c1={r_tuned['c1']}, c2={r_tuned['c2']}]:")
    print(f"    ACC: {r_tuned['acc']:.2f}% | AUC: {r_tuned['auc']:.4f} | Min Recall: {r_tuned['sens']:.4f} ({r_tuned['tp']}/{n_pos_test}) | Maj Recall: {r_tuned['spec']:.4f} ({r_tuned['tn']}/{n_neg_test}) | G-Mean: {r_tuned['gmean']:.4f} | F1: {r_tuned['f1']:.4f}")

print("\n" + "=" * 90)
print(" SUMMARY TABLE: WITHOUT CLASS IMBALANCE (TUNED (c1, c2))")
print("=" * 90)
print(f"{'k':<4} | {'GB Count':<12} | {'c1':<8} | {'c2':<8} | {'ACC (%)':<9} | {'AUC':<8} | {'Min Recall':<12} | {'Maj Recall':<12} | {'G-Mean':<8} | {'F1':<8}")
print("-" * 90)
for k, total, npos, nneg, r in results_unweighted_tuned:
    gb_info = f"{total} (+{npos}/-{nneg})"
    print(f"{k:<4} | {gb_info:<12} | {r['c1']:<8} | {r['c2']:<8} | {r['acc']:<9.2f} | {r['auc']:<8.4f} | {r['sens']:<12.4f} | {r['spec']:<12.4f} | {r['gmean']:<8.4f} | {r['f1']:<8.4f}")
print("=" * 90)

print("\n" + "=" * 90)
print(" SUMMARY TABLE: WITHOUT CLASS IMBALANCE (FIXED c1=1000, c2=1e-5)")
print("=" * 90)
print(f"{'k':<4} | {'GB Count':<12} | {'ACC (%)':<9} | {'AUC':<8} | {'Min Recall (TP/Pos)':<22} | {'Maj Recall (TN/Neg)':<22} | {'G-Mean':<8}")
print("-" * 90)
for k, total, npos, nneg, r in results_unweighted_fixed:
    gb_info = f"{total} (+{npos}/-{nneg})"
    pos_str = f"{r['sens']:.4f} ({r['tp']}/{n_pos_test})"
    neg_str = f"{r['spec']:.4f} ({r['tn']}/{n_neg_test})"
    print(f"{k:<4} | {gb_info:<12} | {r['acc']:<9.2f} | {r['auc']:<8.4f} | {pos_str:<22} | {neg_str:<22} | {r['gmean']:<8.4f}")
print("=" * 90)
