# @lyrec/backend
This is a FastAPI python backend hosted on AWS Lambda.

## Running Locally

Install all the required dependencies then:
```bash
uvicorn main:app
```


## Deploying to AWS Lambda
Mostly followed [this tutorial](https://medium.com/analytics-vidhya/python-fastapi-and-aws-lambda-container-3e524c586f01)

Step 1: Build the docker container
```
$ docker build -t lyrec .
```

Step 2: Tag the image in the format AWS Container Registry wants
```
$ docker tag lyrec:latest <account_id>.dkr.ecr.us-west-2.amazonaws.com/lyrec:latest
```

Step 3: Make sure you are logged into docker
```
$ aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <account_id>.dkr.ecr.us-west-2.amazonaws.com
```

Step 4: Push the image to AWS Container Registry
```
$ docker push <account_id>.dkr.ecr.us-west-2.amazonaws.com/lyrec:latest
```

Step 5: Update/Create your Lambda in the AWS console and point it to the latest image

Step 6: If you haven't already change the `BACKEND_URL` in the frontend to point to your lambda