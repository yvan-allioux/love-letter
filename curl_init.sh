#!/bin/bash

# Initialisation des joueurs
curl -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "damien", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/joueur

curl -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "tomas", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/joueur

# Connexion des joueurs
curl -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "damien", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/login

curl -X POST -H "Content-Type: application/json" \
  -d '{ "pseudo": "tomas", "mot_de_passe": "password123" }' \
  http://127.0.0.1:3000/login

# Création d'une partie
curl -X POST http://127.0.0.1:3000/partie

# Les joueurs rejoignent la partie
# Remplacer {partieId} par l'ID de la partie que vous avez créée
curl -X POST http://127.0.0.1:3000/partie/{partieId}/join

# Démarrage de la partie
curl -X POST http://127.0.0.1:3000/partie/{partieId}/start

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

