docker build -t array-web:latest .
docker tag array-web:latest 876200339127.dkr.ecr.us-east-1.amazonaws.com/arrayweb:latest
docker push 876200339127.dkr.ecr.us-east-1.amazonaws.com/arrayweb:latest
