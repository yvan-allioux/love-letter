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
    if (rows.length > 0 && rows[0].id === req.session.joueurId) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Joueur non trouvé OU non autorisé');
    }
  } catch (err) {
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

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('Partie non trouvé');
    }
  } catch (err) {
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

  try {
    // Vérifier si le pseudo existe déjà
    const [rows, fields] = await pool.query('SELECT * FROM joueur WHERE pseudo = ?', [pseudo]);
    if (rows.length > 0) {
      return res.status(400).send('Pseudo déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);
    const [result] = await pool.query('INSERT INTO joueur (pseudo, mot_de_passe) VALUES (?, ?)', [pseudo, hashedPassword]);

    res.status(201).json({ message: "Joueur créé avec succès", joueurId: result.insertId });
  } catch (err) {
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
    // création de la partie
    const [result] = await pool.query(`
    INSERT INTO partie () VALUES ()
    `);

    let deckRandom = [
      { puissance: 0 },
      { puissance: 0 },
      { puissance: 1 },
      { puissance: 1 },
      { puissance: 1 },
      { puissance: 1 },
      { puissance: 1 },
      { puissance: 1 },
      { puissance: 2 },
      { puissance: 2 },
      { puissance: 3 },
      { puissance: 3 },
      { puissance: 4 },
      { puissance: 4 },
      { puissance: 5 },
      { puissance: 5 },
      { puissance: 6 },
      { puissance: 6 },
      { puissance: 7 },
      { puissance: 8 },
      { puissance: 9 }
    ];

    // shuffle the deck
    for (let i = deckRandom.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deckRandom[i], deckRandom[j]] = [deckRandom[j], deckRandom[i]];
    }

    // insert cards into the database
    for (let card of deckRandom) {
      await pool.query(`INSERT INTO deck (puissance, partie_id) VALUES (?, ?)`, [card.puissance, result.insertId]);
    }


    // modification du joueur pour ajouter la partie
    await pool.query('UPDATE joueur SET partie_id = ? WHERE id = ?', [result.insertId, req.session.joueurId]);


    res.status(201).json({ message: "Partie créée avec succès ", partieId: result.insertId });
  } catch (err) {
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
  } catch (err) {
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
  const id = req.params.id;

  // Vérification de la connexion de l'utilisateur
  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    //on recupere la partie concernée
    const [rows, fields] = await pool.query('SELECT id, partie_demarree FROM partie WHERE id = ?', [id]);

    // Vérifie si la partie existe et si elle n'a pas encore démarré
    if (rows.length > 0 && !rows[0].partie_demarree) {

      // modification du joueur pour ajouter la partie
      await pool.query('UPDATE joueur SET partie_id = ? WHERE id = ?', [id, req.session.joueurId]);

      res.json({ message: "Vous avez rejoint la partie avec succès" });
    } else {
      res.status(404).send('Impossible de rejoindre la partie. Soit la partie n\'existe pas, soit elle a déjà démarré.');
    }
  } catch (err) {
    console.error(`Error while joining the game: ${err.stack}`);
    res.status(500).send('Erreur lors de la tentative de rejoindre la partie');
  }
});

/**
 * post: /partie/:id/start:
 * desc: Lance une partie existante
 * param: id de la partie
 * auth: utilisateur connecté
 */
app.post('/partie/:id/start', async (req, res) => {
  const id = req.params.id;

  // Vérification de la connexion de l'utilisateur
  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    // Vérifie si la partie existe et n'a pas déjà été lancée
    const [rows, fields] = await pool.query('SELECT partie_demarree FROM partie WHERE id = ?', [id]);
    if(rows.length === 0) {
      return res.status(404).send('Partie non trouvée');
    } else if(rows[0].partie_demarree) {
      return res.status(400).send('La partie a déjà été lancée');
    }

    // Vérifie que l'utilisateur actuellement connecté fait partie de la partie
    const [joueurRows, fields2] = await pool.query('SELECT * FROM joueur WHERE partie_id = ?', [id]);
    if ((id === req.session.joueurId)) {//test si req.session.joueurId est dans cette partie
      return res.status(401).send('Non autorisé: vous devez faire partie de la partie pour la lancer OU il n\'y a pas assez de joueurs');
    } else if (joueurRows.length === 2) { // vérifie qu'il y a exactement 2 joueurs dans la partie
      // supprime toutes les cartes de puissance 0 et 6
      await pool.query(`DELETE FROM deck WHERE partie_id = ? AND (puissance = ? OR puissance = ?)`, [id, 0, 6]);

      // supprime une carte de puissance 1
      const [cartes] = await pool.query(`SELECT * FROM deck WHERE partie_id = ? AND puissance = ? LIMIT 1`, [id, 1]);
      if (cartes.length > 0) {
        await pool.query(`DELETE FROM deck WHERE id = ?`, [cartes[0].id]);
      }
    }

    // distribution des cartes aux joueurs
    for (let j = 0; j < joueurRows.length; j++) {
      // tirage de 1 cartes
      const [cartes] = await pool.query('SELECT * FROM deck WHERE partie_id = ? AND joueur_id IS NULL ORDER BY id ASC LIMIT 1', [id]);
      // affectation des 1 cartes au joueur
      for (let i = 0; i < 1; i++) {
        await pool.query('UPDATE deck SET joueur_id = ? WHERE id = ?', [joueurRows[j].id, cartes[i].id]);
      }
    }

    //on donne une carte supplémentaire a un joueur aléatoire
    const [cartes] = await pool.query('SELECT * FROM deck WHERE partie_id = ? AND joueur_id IS NULL ORDER BY id ASC LIMIT 1', [id]);
    await pool.query('UPDATE deck SET joueur_id = ? WHERE id = ?', [joueurRows[Math.floor(Math.random() * joueurRows.length)].id, cartes[0].id]);



    // Mettre à jour la partie
    await pool.query('UPDATE partie SET partie_demarree = ? WHERE id = ?', [true, id]);

    res.json({ message: "La partie a démarré avec succès" });
  } catch (err) {
    console.error(`Error while starting the game: ${err.stack}`);
    res.status(500).send('Erreur lors du lancement de la partie');
  }
});

/**
 * post: /partie/:id/leave:
 * desc: Un joueur quitte une partie existante
 * param: id de la partie
 * auth: utilisateur connecté
 */
app.post('/partie/:id/leave', async (req, res) => {
  const id = req.params.id;

  // Vérification de la connexion de l'utilisateur
  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    // Vérifie si la partie existe et si le joueur fait partie de la partie
    const [rows, fields] = await pool.query('SELECT * FROM joueur WHERE id = ? AND partie_id = ?', [req.session.joueurId, id]);
    
    if (rows.length > 0) {
      // Le joueur quitte la partie
      await pool.query('UPDATE joueur SET partie_id = NULL WHERE id = ?', [req.session.joueurId]);

      res.json({ message: "Vous avez quitté la partie avec succès" });
    } else {
      res.status(404).send('Impossible de quitter la partie. Soit la partie n\'existe pas, soit vous n\'en faites pas partie.');
    }
  } catch (err) {
    console.error(`Error while leaving the game: ${err.stack}`);
    res.status(500).send('Erreur lors de la tentative de quitter la partie');
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
