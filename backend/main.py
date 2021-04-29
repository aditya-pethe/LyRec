from fastapi import FastAPI, HTTPException
import numpy as np
from sklearn.metrics import pairwise
import firebase_admin
from firebase_admin import credentials, firestore
import datetime

t = datetime.datetime.now()
from sentence_transformers import SentenceTransformer
print("Loading BERT...")
sbert_model = SentenceTransformer('bert-base-nli-mean-tokens')
print(f"Finished Loading BERT... {datetime.datetime.now() - t}")
print()

t = datetime.datetime.now()
print("Loading song embeddings...")
song_embeddings = np.load("data/lyrec_embeddings_1.0.pkl.npy", mmap_mode="r")
print(f"Finished loading song embeddings... {datetime.datetime.now() - t}")

app = FastAPI()

cred = credentials.Certificate("secrets.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

@app.get("/areualive")
def ping():
    return { "alive": True }


@app.get("/song/{song_id}")
def get_song(song_id: int):
    response = db.collection(u'songs').document(str(song_id))
    entry = response.get().to_dict()
    if entry is None:
        return None
    return  {
        "id": song_id,
        "name": entry['name'],
        "artist": entry['artist'],
        "lyrics": entry['lyrics']
    }

@app.get("/song")
def search_for_song(query: str = ""):
    res = {
        "results": [],
        "total_size": 0,
        "size": 0,
    }
    if len(query) > 3: 
        # entries = song_db.loc[song_db["Song_lower"].str.contains(query.lower(), na=False) | song_db["Band_lower"].str.contains(query.lower(), na=False)]
        seen_set = set()
        artist_stream = db.collection(u'songs').where(u'artist_lower', u'>=', query.lower()).limit(10).stream()
        song_stream = db.collection(u'songs').where(u'name_lower', u'>=', query.lower()).limit(10).stream()
        for doc in song_stream:
            if doc.id not in seen_set:
                seen_set.add(doc.id)
                res["results"].append(doc.to_dict())
                res["size"] += 1
        for doc in artist_stream:
            if doc.id not in seen_set:
                seen_set.add(doc.id)
                res["results"].append(doc.to_dict())
                res["size"] += 1
    return res

def generate_related_list(res, vector):
    song_scores = np.array(pairwise.cosine_similarity(vector, song_embeddings)[0])
    related_songs = np.argsort(song_scores)[::-1]

    docs = []

    for i, song_id in enumerate(related_songs.tolist()):
        if i >= 25:
            break
        docs.append(db.collection(u'songs').document(str(song_id)))
    
    docs = db.get_all(docs)

    results = []

    for i, doc in enumerate(docs):
        if doc.exists:
            results.append({"song": doc.to_dict(), "score": float(song_scores[i])})
            res["size"] += 1
        
    results = sorted(results, key=lambda song: -1*song["score"])
    res["results"] = results

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

    song_vector = np.array([song_embeddings[song_id]])

    generate_related_list(res, song_vector)

    return res