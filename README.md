# love-letter
 
TODO

1 API REST

2 client Vue.js

3 Connexion API REST


server
docker build -t loveletter -f Dockerfile.prod .
docker run -p 3000:80 loveletter
docker build -t loveletter -f Dockerfile.prod . && docker run -p 3000:80 loveletter


tests server
docker build -t loveletter-tests -f Dockerfile.test .
docker run -p 3000:80 loveletter-tests

integration test
docker build -t loveletter-integration -f Dockerfile.integration .
docker run -p 3000:80 loveletter-integration

compose
docker-compose -f docker-compose.integration.yml up --build
