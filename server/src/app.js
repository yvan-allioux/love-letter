const express = require('express');
const app = express();
app.use(express.json());
const port = 80;

require('dotenv').config({ path: './config.env' });

const bcrypt = require('bcrypt');
const saltRounds = 10;

//mariaDB
const mysql = require('mysql2/promise');
// Config bdd
const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
const pool = mysql.createPool(config);

// session
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set secure to true if you are using https
}));


// Import du fichier JSON
const cards = require('./data/cartes.json');


// Route principale
app.get('/', (req, res) => {
  res.send('Bienvenue sur ma page d\'accueil !');
});

// ------------- JSON ----------------

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


// ------------- MariaDB ----------------


/**
 * get: /joueur/{id}:
 * desc: Renvoie les détails d'un joueur spécifique basé sur l'ID
 * param: id
 * auth: utilisateur connecté, utilisateur spécifique
 */
app.get('/joueur/:id', async (req, res) => {
  const id = req.params.id;

  // Vérification de la connexion de l'utilisateur
  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM joueur WHERE id = ?', [id]);

    // Vérifie que l'utilisateur demandé est le même que l'utilisateur connecté
    if(rows.length > 0 && rows[0].id === req.session.joueurId) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Joueur non trouvé');
    }
  } catch(err) {
    console.error(`Error while getting the player from DB: ${err.stack}`);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});


/**
 * get: /partie/{id}:
 * desc: Renvoie les détails d'une partie spécifique basé sur l'ID (mais pas les cartes)
 * param: id
 * auth: utilisateur connecté
 */
app.get('/partie/:id', async (req, res) => {
  const id = req.params.id;

  // Vérification de la connexion de l'utilisateur
  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT id, date_creation, partie_demarree FROM partie WHERE id = ?', [id]);
    
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

/**
 * get: /joueur:
 * desc: Création d'un nouveau joueur
 * param: pseudo, mot_de_passe
 * auth: aucun
 */
app.post('/joueur', async (req, res) => {
  const { pseudo, mot_de_passe } = req.body;
  console.log('req.body: ', req.body);

  try {
    // Vérifier si le pseudo existe déjà
    const [rows, fields] = await pool.query('SELECT * FROM joueur WHERE pseudo = ?', [pseudo]);
    if(rows.length > 0) {
      return res.status(400).send('Pseudo déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

    const [result] = await pool.query('INSERT INTO joueur (pseudo, mot_de_passe) VALUES (?, ?)', [pseudo, hashedPassword]);
    
    res.status(201).json({ message: "Joueur créé avec succès", joueurId: result.insertId });
  } catch(err) {
    console.error(`Error while creating the player in DB: ${err.stack}`);
    res.status(500).send('Erreur lors de la création du joueur');
  }
});

/**
 * get: /partie:
 * desc: Création d'une nouvelle partie
 * param: aucun
 * auth: utilisateur connecté
 */
app.post('/partie', async (req, res) => {

  // Vérification de la connexion de l'utilisateur
  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [result] = await pool.query(`
      INSERT INTO partie 
        (col0, col1, col2, col3, col4, col5, col6, col7, col8, col9) 
      VALUES 
        (DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT)
    `);

    // modification du joueur pour ajouter la partie
    await pool.query('UPDATE joueur SET partie_id = ? WHERE id = ?', [result.insertId, req.session.joueurId]);
    
    
    res.status(201).json({ message: "Partie créée avec succès " , partieId: result.insertId });
  } catch(err) {
    console.error(`Error while creating the game in DB: ${err.stack}`);
    res.status(500).send('Erreur lors de la création de la partie');
  }
});

/**
 * get: /login:
 * desc: Connexion d'un utilisateur
 * param: pseudo, mot_de_passe
 * auth: aucun
 */
app.post('/login', async (req, res) => {
  const { pseudo, mot_de_passe } = req.body;

  try {
    const [rows, fields] = await pool.query('SELECT * FROM joueur WHERE pseudo = ?', [pseudo]);

    if (rows.length > 0) {
      const joueur = rows[0];

      const match = await bcrypt.compare(mot_de_passe, joueur.mot_de_passe);

      if (match) {
        // Création d'une session pour l'utilisateur
        req.session.joueurId = joueur.id;
        res.json({ message: "Connexion réussie" });
      } else {
        // Mauvais mot de passe
        res.status(401).json({ message: "Mot de passe incorrect" });
      }
    } else {
      // Utilisateur non trouvé
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch(err) {
    console.error(`Error while logging in the player: ${err.stack}`);
    res.status(500).send('Erreur lors de la connexion');
  }
});

/**
 * post: /partie/:id/join:
 * desc: Un joueur rejoint une partie existante
 * param: id de la partie
 * auth: utilisateur connecté
 */
app.post('/partie/:id/join', async (req, res) => {
  const id = req.params.id_partie;

  // Vérification de la connexion de l'utilisateur
  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    //on recupere la partie concernée
    const [rows, fields] = await pool.query('SELECT id, partie_demarree FROM partie WHERE id = ?', [id]);
    console.log('rows.length: ', rows.length);
    console.log('[rows, fields]: ', [rows, fields]);
    console.log('rows[0].partie_demarree: ', rows[0].partie_demarree);
    //TODO

    // Vérifie si la partie existe et si elle n'a pas encore démarré
    if(rows.length > 0 && !rows[0].partie_demarree) {
      
      // modification du joueur pour ajouter la partie
      await pool.query('UPDATE joueur SET partie_id = ? WHERE id = ?', [id, req.session.joueurId]);

      res.json({ message: "Vous avez rejoint la partie avec succès" });
    } else {
      res.status(404).send('Impossible de rejoindre la partie. Soit la partie n\'existe pas, soit elle a déjà démarré.');
    }
  } catch(err) {
    console.error(`Error while joining the game: ${err.stack}`);
    res.status(500).send('Erreur lors de la tentative de rejoindre la partie');
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
