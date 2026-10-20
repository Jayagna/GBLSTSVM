import csv
import time
import pandas as pd
import numpy as np
import json
import csv
# import sklearn.cluster.k_means_ as KMeans
from sklearn.cluster import KMeans
import warnings
from collections import Counter
# from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler

import pandas as pd

warnings.filterwarnings("ignore")  # ignore warning


class GranularBall:
    """Class representing an adaptive granular ball."""
    def __init__(self, data):
        """
        :param data: Labeled dataset, the "-2" column is the class label, 
                     the last column is the index of each line,
                     and each of the preceding columns corresponds to a feature.
        """
        self.data = data[:, :]
        self.data_no_label = data[:, :-2]
        self.num, self.dim = self.data_no_label.shape
        self.center = self.data_no_label.mean(0)
        self.label, self.purity, self.r, self.pos_count, self.neg_count = self.__get_label_and_purity_and_r()

    def __get_label_and_purity_and_r(self):
        """
        :return: the label, purity, radius, and class counts of the granular ball.
        """
        count = Counter(self.data[:, -2])
        label = max(count, key=count.get)
        purity = count[label] / self.num
        arr = np.array(self.data_no_label) - self.center
        ar = np.square(arr)
        a = np.sqrt(np.sum(ar, 1))
        r = np.sum(a) / len(self.data_no_label)
        pos_count = count.get(1, 0)
        neg_count = count.get(-1, count.get(0, 0))
        return label, purity, r, pos_count, neg_count

    def split_balls(self, k_clusters=2):
        """
        Split the granular ball into k sub-balls using k-means clustering.
        :param k_clusters: Number of clusters (k) for k-means.
        :return: List of resulting GranularBall objects.
        """
        if self.num < 2:
            return [self]

        try:
            unique_rows = np.unique(self.data_no_label, axis=0)
            actual_k = min(k_clusters, len(unique_rows), self.num)
            if actual_k < 2:
                mid = self.num // 2
                return [GranularBall(self.data[:mid, :]), GranularBall(self.data[mid:, :])]

            clu = KMeans(n_clusters=actual_k, random_state=42, n_init=1).fit(self.data_no_label)
            label_cluster = clu.labels_
            balls = []
            for c in range(actual_k):
                mask = (label_cluster == c)
                if np.sum(mask) > 0:
                    balls.append(GranularBall(self.data[mask, :]))
            if len(balls) > 1:
                return balls
        except Exception:
            pass

        # Fallback if clustering fails or produces 1 partition
        mid = max(1, self.num // 2)
        return [GranularBall(self.data[:mid, :]), GranularBall(self.data[mid:, :])]

    def split_2balls(self):
        """Backwards-compatible method for binary 2-means split."""
        return self.split_balls(k_clusters=2)


class GBList:
    """Class representing the collection of granular balls."""
    def __init__(self, data=None):
        self.data = data[:, :]
        self.granular_balls = [GranularBall(self.data)]  # gbs is initialized with all data

    def init_granular_balls(self, purity=1.0, min_sample=1, k_clusters=2):
        """
        Split the balls until purity or sample size threshold is met.
        :param purity: If purity >= this value, stop splitting.
        :param min_sample: If number of samples <= this value, stop splitting.
        :param k_clusters: Value of k for k-means clustering at each split.
        """
        ll = len(self.granular_balls)
        i = 0
        while True:
            if self.granular_balls[i].purity < purity and self.granular_balls[i].num > min_sample:
                split_balls = self.granular_balls[i].split_balls(k_clusters=k_clusters)
                if len(split_balls) > 1:
                    self.granular_balls[i] = split_balls[0]
                    for nb in split_balls[1:]:
                        self.granular_balls.append(nb)
                    ll = len(self.granular_balls)
                else:
                    i += 1
            else:
                i += 1
            if i >= ll:
                break
        self.data = self.get_data()

    def get_data_size(self):
        return list(map(lambda x: len(x.data), self.granular_balls))

    def get_purity(self):
        return list(map(lambda x: x.purity, self.granular_balls))

    def get_center(self):
        """
        :return: the center of each ball.
        """
        return np.array(list(map(lambda x: x.center, self.granular_balls)))

    def get_r(self):
        """
        :return: radius r of each ball.
        """
        return np.array(list(map(lambda x: x.r, self.granular_balls)))

    def get_data(self):
        """
        :return: Data from all existing granular balls in the GBlist.
        """
        list_data = [ball.data for ball in self.granular_balls]
        return np.vstack(list_data)

    def del_ball(self, purty=0.0, num_data=0):
        T_ball = []
        for ball in self.granular_balls:
            if ball.purity >= purty and ball.num >= num_data:
                T_ball.append(ball)
        self.granular_balls = T_ball.copy()
        self.data = self.get_data()

    def re_division(self, i):
        """
        Data division with the center of the ball.
        :return: a list of new granular balls after divisions.
        """
        k = len(self.granular_balls)
        attributes = list(range(self.data.shape[1] - 2))
        attributes.remove(i)
        clu = KMeans(n_clusters=k, init=self.get_center()[:, attributes], max_iter=1, random_state=42, n_init=1).fit(self.data[:, attributes])
        label_cluster = clu.labels_
        granular_balls_division = []
        for c in set(label_cluster):
            granular_balls_division.append(GranularBall(self.data[label_cluster == c, :]))
        return granular_balls_division


def generate_ball_data(data, pur=0.985, delbals=2, k_clusters=2, return_details=False):
    """
    Generates granular ball data from input matrix with configurable k-means.
    """
    num, dim = data[:, :-1].shape
    index = np.array(range(num)).reshape(num, 1)  # column of index
    data = np.hstack((data, index))  # Add the index column to the last column of the data

    gb = GBList(data)
    gb.init_granular_balls(purity=pur, k_clusters=k_clusters)
    gb.del_ball(num_data=delbals)

    balldata = []
    for ball in gb.granular_balls:
        lbl = 1 if ball.label == 1 else -1
        if return_details:
            # Extended structure containing ball statistics for class imbalance weighting
            balldata.append({
                'center': ball.center.tolist(),
                'r': float(ball.r),
                'label': lbl,
                'num': int(ball.num),
                'purity': float(ball.purity),
                'pos_count': int(ball.pos_count),
                'neg_count': int(ball.neg_count),
                'indices': ball.data[:, -1].astype(int).tolist()
            })
        else:
            balldata.append([ball.center.tolist(), float(ball.r), lbl, int(ball.num)])
    return balldata


def gen_balls(data, pur=0.985, delbals=2, k_clusters=2, return_details=False):
    """
    Main interface for generating granular balls.
    :param data: Input training data (features + label)
    :param pur: Purity threshold
    :param delbals: Minimum number of samples required to keep ball
    :param k_clusters: Value of k in k-means clustering
    :param return_details: Whether to return full ball details dict
    :return: List of granular balls [center, radius, label, sample_count] or detailed dicts
    """
    return generate_ball_data(data, pur=pur, delbals=delbals, k_clusters=k_clusters, return_details=return_details)
