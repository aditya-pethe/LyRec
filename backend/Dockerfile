FROM python:3.9

RUN pip install fastapi uvicorn numpy sentence_transformers sklearn pandas

COPY main.py /app/main.py
COPY data/lyrec_embeddings_1.0.pkl.npy /app/data/lyrec_embeddings_1.0.pkl.npy
COPY data/lyrec_df_1.0.pkl /app/data/lyrec_df_1.0.pkl

COPY load_bert.py /app/load_bert.py

WORKDIR /app

RUN python3 load_bert.py

RUN pip install gunicorn

CMD gunicorn -b :$PORT main:app --capture-output