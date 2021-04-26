from fastapi import FastAPI, HTTPException
import numpy as np
from sklearn.metrics import pairwise
import pandas as pd
from sentence_transformers import SentenceTransformer
sbert_model = SentenceTransformer('bert-base-nli-mean-tokens')

song_embeddings = np.load("data/lyrec_embeddings_1.0.pkl.npy")

app = FastAPI()
song_db = pd.read_pickle("data/lyrec_df_1.0.pkl") 
song_db["Song_lower"] = song_db["Song"].str.lower()
song_db["Band_lower"] = song_db["Band"].str.lower()

@app.get("/ping")
def ping():
    return { "alive": True }


@app.get("/song/{song_id}")
def get_song(song_id: int):
    if song_id > len(song_db.index) or song_id < 0:
        raise HTTPException(status_code=404, detail="Song not found")
    entry = song_db.loc[song_id]
    return  {
        "id": song_id,
        "name": entry['Song'],
        "artist": entry['Band'],
        "lyrics": entry['Lyrics']
    }

@app.get("/song")
def search_for_song(query: str = ""):
    res = {
        "results": [],
        "total_size": 0,
        "size": 0,
    }
    if len(query) > 3: 
        entries = song_db.loc[song_db["Song_lower"].str.contains(query.lower(), na=False) | song_db["Band_lower"].str.contains(query.lower(), na=False)]
        for index, _ in entries.iterrows():
            if res["size"] >= 100:
                break
            res["results"].append(get_song(index))
            res["size"] += 1
        res["total_size"] = len(entries.index)
    return res

def generate_related_list(res, vector):
    song_scores = np.array(pairwise.cosine_similarity(vector, song_embeddings)[0])
    related_songs = np.argsort(song_scores)[::-1]

    for i in related_songs.tolist():
        if res["size"] >= 100:
            break
        res["results"].append({"song": get_song(i), "score": float(song_scores[i])})
        res["size"] += 1

    res["total_size"] = len(related_songs)

@app.get("/related")
def get_related_songs(query: str):
    res = {
        "results": [],
        "total_size": 0,
        "size": 0,
    }
    if len(query) > 3: 
        query_vector = np.array([sbert_model.encode(query)])

        generate_related_list(res, query_vector)

    return res

@app.get("/song/{song_id}/related")
def get_related_songs(song_id: int):
    res = {
        "results": [],
        "total_size": 0,
        "size": 0,
    }
    if song_id > len(song_db.index) or song_id < 0:
        raise HTTPException(status_code=404, detail="Song not found")

    song_vector = np.array([song_embeddings[song_id]])

    generate_related_list(res, song_vector)

    return res