from sentence_transformers import SentenceTransformer
import numpy as np


def generate_bert_embeddings(df, filepath=None):
    sbert_model = SentenceTransformer('bert-base-nli-mean-tokens')

    document_embeddings = sbert_model.encode(df['Lyrics'], show_progress_bar=True, device="cpu")
    if filepath is not None:
        with open(filepath, 'wb') as f:
            np.save(f, document_embeddings)