# love-letter
 
TODO

1 API REST

inscription utilisateur OK
connection utilisateur OK
creation partie OK
    joueur createur obtien partie OK
rejoindre partie pour un autre joueur OK
lancer une partie OK
autre joueur ne pauve pas rejoindre la partie si elle est lancée OK
a quelle qui de jouer ? (le joueur qui a 2 carte) OK
quiter la partie OK
mort joueur (le joueur na pas de carte)
fin de partie (tout les joueur son mort sauf 1)



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





app.get('/', (req, res) => {
app.get('/cartesJson', (req, res) => {
app.get('/carteJson/:power', (req, res) => {
app.get('/carteJson/:power/description', (req, res) => {
app.get('/carteJson/:power/name', (req, res) => {
app.get('/carteJson/:power/number', (req, res) => {
app.get('/joueur/:id', async (req, res) => {
app.post('/joueur', async (req, res) => {
app.post('/login', async (req, res) => {
app.post('/partie/:id/join', async (req, res) => {
app.post('/partie/:id/leave', async (req, res) => {
app.get('/partie/:id', async (req, res) => {
app.post('/partie', async (req, res) => {
app.post('/partie/:id/start', async (req, res) => {
app.post('/carte/espionne', async (req, res) => {
app.post('/carte/garde/:joueurId/:carteId', async (req, res) => {
app.post('/carte/pretre/:joueurId/:carteId', async (req, res) => {
app.post('/carte/baron/:joueurId/:carteId', async (req, res) => {
app.post('/carte/servante/:carteId', async (req, res) => {
app.post('/carte/prince/:joueurId/:carteId', async (req, res) => {
app.post('/carte/chancelier/:carteId', async (req, res) => {
app.post('/carte/roi/:joueurId/:carteId', async (req, res) => {
app.post('/carte/comtesse/:carteId', async (req, res) => {
app.post('/carte/princesse/:carteId', async (req, res) => {



