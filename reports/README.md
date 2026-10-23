# Reports

Generators for the documents built from the results in `results/`. They were run from the project's shared folder, so paths inside point there (`/mnt/project-files/...`) and to this repo at `/home/user/GBLSTSVM`.

- `midsem/`: midsem presentation (`GBLSTSVM_Midsem_Presentation.pptx`, 35 slides with speaker notes). `python3 midsem_data.py` collects every number into `midsem_data.json`; `node build_midsem_deck.js [out.pptx]` builds the deck with pptxgenjs.
- `prior/`: deck of the work done before the fuzzy study (`GBLSTSVM_Work_Before_Fuzzy_Study.pptx`, 27 slides with speaker notes): baseline reproduction, k-means vs ADPGBG, the CW/R/CR/BMRU/overlap/CBCM/IPA/Topo weights, granulation sessions and M0–M3. `python3 figs_prior.py <extracted GBLSTSVM-Ex-main>` draws the ball diagrams with that code; `node build_prior_deck.js [out.pptx]` builds the deck.
- `progress/`: running progress deck of every experiment, including dead ends (`node build_progress_deck.js`).
- `guide/`: plain-language guide. `python3 figs.py` draws the figures; Chromium prints `guide.html` to PDF.
