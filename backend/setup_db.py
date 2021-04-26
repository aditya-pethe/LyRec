import numpy as np
import pandas as pd

song_db = pd.read_pickle("data/lyrec_df_1.0.pkl") 
song_db["Song_lower"] = song_db["Song"].str.lower()
song_db["Band_lower"] = song_db["Band"].str.lower()

song_db.to_pickle("data/lyrec_df_1.0.pkl")