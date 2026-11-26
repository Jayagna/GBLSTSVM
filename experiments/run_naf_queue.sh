#!/bin/bash
# Everything the NAF-GBLSTSVM paper needs, in order; each step is restartable.
cd "$(dirname "$0")"
./run_noise_types.sh
./run_fknn_cv.sh
