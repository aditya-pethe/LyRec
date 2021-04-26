FROM python:3.9

RUN pip install fastapi uvicorn numpy sentence_transformers sklearn pandas

COPY main.py /app/main.py
COPY data/lyrec_embeddings_1.0.pkl.npy /app/data/lyrec_embeddings_1.0.pkl.npy
COPY data/lyrec_df_1.0.pkl /app/data/lyrec_df_1.0.pkl

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "$PORT"]