import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm

song_db = pd.read_pickle("data/lyrec_df_1.0.pkl") 

cred = credentials.Certificate("secrets.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

batch = db.batch()

# executor = ThreadPoolExecutor(16)

start_idx=26000
stop_point = len(song_db)

pbar = tqdm(total=min(stop_point, len(song_db))-1)

pbar.update(start_idx)
tasks = []

# def put_dynamo(entry_json):
#     table.put_item(Item=entry_json)
#     pbar.update(1)

for index in range(start_idx, min(stop_point, len(song_db))):
    entry = song_db.loc[index]
    entry_json = {
        u"id": index,
        u"name": entry['Song'],
        u"artist": entry['Band'],
        u"artist_lower": str(entry['Band']).lower(),
        u"name_lower": str(entry['Song']).lower(),
        u"lyrics": entry['Lyrics']
    }
    # t = executor.submit(put_dynamo, (entry_json))
    # tasks.append(t)
    batch.set(db.collection(u'songs').document(str(index)), entry_json)
    if index % 450 == 0 and index > 0:
        batch.commit()
        batch = db.batch()
    pbar.update(1)
    
batch.commit()
print("Finished filling firestore...")