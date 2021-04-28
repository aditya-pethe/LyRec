FROM public.ecr.aws/lambda/python:3.8

RUN pip install fastapi uvicorn numpy sentence_transformers sklearn pandas

COPY main.py /app/main.py
COPY data/lyrec_embeddings_1.0.pkl.npy /app/data/lyrec_embeddings_1.0.pkl.npy
COPY data/lyrec_df_1.0.pkl /app/data/lyrec_df_1.0.pkl

COPY load_bert.py /app/load_bert.py

COPY lambda_entrypoint.py /app/lambda_entrypoint.py

WORKDIR /app

RUN python3 load_bert.py

RUN pip install gunicorn

RUN yum -y groupinstall "Development Tools"

RUN pip install mangum

# incoming! even more jank
# moving the sentance transformer models to an accessible place (since the lambda doesn't run as root yet during build we do)
RUN mkdir /cache && mv /root/.cache /cache 
ENV SENTENCE_TRANSFORMERS_HOME=/cache/.cache/torch/sentence_transformers

# i'm an idiot, this is a result from not correctly reading documentation
RUN rm -rf /var/task && ln -s /app /var/task

WORKDIR /var/task

# CMD gunicorn -b :$PORT main:app --capture-output
CMD ["lambda_entrypoint.handler"]