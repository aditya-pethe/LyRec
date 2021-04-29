FROM public.ecr.aws/lambda/python:3.8

COPY requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

COPY load_bert.py ./load_bert.py

RUN python3 load_bert.py

# incoming! even more jank
# moving the sentance transformer models to an accessible place (since the lambda doesn't run as root yet during build we do)
RUN mkdir /cache && mv /root/.cache /cache 
ENV SENTENCE_TRANSFORMERS_HOME=/cache/.cache/torch/sentence_transformers

# oops!
RUN pip install firebase_admin

COPY secrets.json ./secrets.json
COPY data/lyrec_embeddings_1.0.pkl.npy ./data/lyrec_embeddings_1.0.pkl.npy
COPY lambda_entrypoint.py ./lambda_entrypoint.py
COPY main.py ./main.py

# CMD gunicorn -b :$PORT main:app --capture-output
CMD ["lambda_entrypoint.handler"]