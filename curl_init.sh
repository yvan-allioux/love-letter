#!/bin/bash

# Initialisation des joueurs
curl -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "damien", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/joueur

curl -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "tomas", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/joueur

curl -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "camille", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/joueur

# Connexion des joueurs
curl -c damien_cookies.txt -s -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "damien", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/login

# Création d'une partie en tant que damien
curl -b damien_cookies.txt -s -X POST http://127.0.0.1:3000/partie

curl -c tomas_cookies.txt -s -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "tomas", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/login

# Le joueurs rejoignent la partie
curl -b tomas_cookies.txt -s -X POST http://127.0.0.1:3000/partie/1/join

curl -c camille_cookies.txt -s -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "camille", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/login

# Le joueurs rejoignent la partie
curl -b camille_cookies.txt -s -X POST http://127.0.0.1:3000/partie/1/join


# Démarrage de la partie en tant que camille
curl -b camille_cookies.txt -s -X POST http://127.0.0.1:3000/partie/1/start


# Actions de jeu - remplacer {joueurId}, {carteId} et {partieId} par les valeurs réelles
curl -X POST http://127.0.0.1:3000/carte/garde/{joueurId}/{carteId}
curl -X POST http://127.0.0.1:3000/carte/pretre/{joueurId}/{carteId}
curl -X POST http://127.0.0.1:3000/carte/baron/{joueurId}/{carteId}
curl -X POST http://127.0.0.1:3000/carte/servante/{carteId}
curl -X POST http://127.0.0.1:3000/carte/prince/{joueurId}/{carteId}
curl -X POST http://127.0.0.1:3000/carte/chancelier/{carteId}
curl -X POST http://127.0.0.1:3000/carte/roi/{joueurId}/{carteId}
curl -X POST http://127.0.0.1:3000/carte/comtesse/{carteId}
curl -X POST http://127.0.0.1:3000/carte/princesse/{carteId}
