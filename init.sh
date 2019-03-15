services="webserver"
docker-compose rm --force --stop $services
docker-compose up --build --no-recreate $services
