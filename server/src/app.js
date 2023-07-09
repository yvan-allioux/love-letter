const express = require('express');
const app = express();
const port = 80;

// Import du fichier JSON
const cards = require('./data/cartes.json');

// Route principale
app.get('/', (req, res) => {
  res.send('Bienvenue sur ma page d\'accueil !');
});

// Renvoie toutes les cartes
app.get('/cartes', (req, res) => {
  res.json(cards);
});

// Renvoie une carte spécifique basée sur la puissance
app.get('/carte/:power', (req, res) => {
  const card = cards.cards.find(c => c.power === Number(req.params.power));
  if (card) {
    res.json(card);
  } else {
    res.status(404).send('Carte non trouvée');
  }
});

// Renvoie la description d'une carte spécifique basée sur la puissance
app.get('/carte/:power/description', (req, res) => {
  const card = cards.cards.find(c => c.power === Number(req.params.power));
  if (card) {
    res.json(card.description);
  } else {
    res.status(404).send('Carte non trouvée');
  }
});

// Renvoie le nom d'une carte spécifique basée sur la puissance
app.get('/carte/:power/name', (req, res) => {
  const card = cards.cards.find(c => c.power === Number(req.params.power));
  if (card) {
    res.json(card.name);
  } else {
    res.status(404).send('Carte non trouvée');
  }
});

// Renvoie le nombre de cartes d'une carte spécifique basée sur la puissance
app.get('/carte/:power/number', (req, res) => {
  const card = cards.cards.find(c => c.power === Number(req.params.power));
  if (card) {
    res.json(card.number);
  } else {
    res.status(404).send('Carte non trouvée');
  }
});


// Gestion de l'erreur 404 pour les routes non trouvées
app.use((req, res) => {
  res.status(404).send('Page non trouvée');
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
