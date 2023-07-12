# love-letter
 
TODO

1 API REST

inscription utilisateur OK
connection utilisateur OK
creation partie OK
    joueur createur obtien partie OK
rejoindre partie pour un autre joueur OK
lancer une partie
autre joueur ne pauve pas rejoindre la partie
a quelle qui de jouer ?
quiter la partie
mort joueur
fin de partie 



2 client Vue.js

3 Connexion API REST



### server
sudo docker build -t loveletter -f Dockerfile.prod .
docker run -p 3000:80 loveletter
docker build -t loveletter -f Dockerfile.prod . && docker run -p 3000:80 loveletter


### tests server
docker build -t loveletter-tests -f Dockerfile.test .
docker run -p 3000:80 loveletter-tests

### integration test
docker build -t loveletter-integration -f Dockerfile.integration .
docker run -p 3000:80 loveletter-integration

### compose
docker-compose -f docker-compose.prod.yml up --build
docker-compose -f docker-compose.integration.yml up --build
# supression des conteneur et des volumes
sudo docker-compose -f docker-compose.integration.yml down -v

### bdd
docker build -t love-letter_mariadb -f ./Dockerfile.bdd .
docker run -d --restart=always -p 3306:3306 -v ./src/data/mariadb:/var/lib/mysql love-letter_mariadb

### server/src/config.env
SESSION_SECRET=

DB_HOST=mariadb
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=loveletter




