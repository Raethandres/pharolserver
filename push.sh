docker build -t pharol-web:latest .
docker tag pharol-web:latest 876200339127.dkr.ecr.us-east-1.amazonaws.com/pharolweb:latest
docker push 876200339127.dkr.ecr.us-east-1.amazonaws.com/pharolweb:latest
