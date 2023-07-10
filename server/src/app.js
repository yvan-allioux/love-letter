const express = require('express');
const app = express();
const port = 80;

//mariaDB
const mysql = require('mysql2/promise');
// Config
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
const pool = mysql.createPool(config);

// Import du fichier JSON
const cards = require('./data/cartes.json');


// Route principale
app.get('/', (req, res) => {
  res.send('Bienvenue sur ma page d\'accueil !');
});

// Renvoie toutes les cartes de la base de données
app.get('/deck', async (req, res) => {
  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck');
    res.json(rows);
  } catch(err) {
    console.error(`Error while getting the data from DB: ${err.stack}`);
    res.status(500).send('Error while getting the data');
  }
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

// Renvoie les détails d'un joueur spécifique basé sur l'ID
app.get('/joueur/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [rows, fields] = await pool.query('SELECT * FROM joueur WHERE id = ?', [id]);
    
    if(rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Joueur non trouvé');
    }
  } catch(err) {
    console.error(`Error while getting the player from DB: ${err.stack}`);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});


// Renvoie les détails d'une partie spécifique basé sur l'ID
app.get('/partie/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const [rows, fields] = await pool.query('SELECT * FROM partie WHERE id = ?', [id]);
    
    if(rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Partie non trouvé');
    }
  } catch(err) {
    console.error(`Error while getting the player from DB: ${err.stack}`);
    res.status(500).send('Erreur lors de la récupération des données');
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
