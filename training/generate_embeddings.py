from sentence_transformers import SentenceTransformer
import pandas as pd
import numpy as np
import os


def generate_bert_embeddings(df, device=None, filepath=None):
    sbert_model = SentenceTransformer('bert-base-nli-mean-tokens')

    document_embeddings = sbert_model.encode(df['Lyrics'], show_progress_bar=True, device=device)
    if filepath is not None:
        with open(filepath, 'wb') as f:
            np.save(f, document_embeddings)


if __name__ == "__main__":
    pickle_filename = f"data/lyrec_df_1.0.pkl"
    if os.path.isfile(pickle_filename):
        print("Found pickle file for current config, using that")
        df = pd.read_pickle(pickle_filename)
        generate_bert_embeddings(df, device="cuda", filepath="data/lyrec_embeddings_1.0.pkl")
    else:
        print("No pickle file found, exiting")
    