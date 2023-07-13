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


// Route principale
app.get('/', (req, res) => {
  res.send('Bienvenue sur ma page d\'accueil !');
});

// ------------- JSON ----------------

// Import du fichier JSON
const cards = require('./data/cartes.json');

// Renvoie toutes les cartes
app.get('/JSONcartes', (req, res) => {
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

// ------------- Joueur ----------------


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


// ------------- Partie ----------------

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


// ------------- Effet de cartes ----------------

/**
 * post: /carte/espionne
 * desc: Espionne, puisance 0, ne fait rien
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/espionne', async (req, res) => {
  //on vérifie que le joueur est connecté
  //on vérifie que la partie est lancée
  //on vérifie que le joueur possède la carte
  
  // effets de la carte espionne

  //on defausse la carte jouée
});

/**
 * post: /carte/garde/:joueurId/:carteId
 * desc: Garde, puisance 1, cible un joueur et une carte, si le joueur possède la carte, il est éliminé
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/garde/:joueurId/:carteId', async (req, res) => {
  const { joueurId, carteId } = req.params;

  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND id = ? AND puissance = 1', [req.session.joueurId, carteId]);

    if (rows.length > 0) {
      const [targetPlayer, targetPlayerFields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND puissance = ?', [joueurId, req.body.puissance]);

      if (targetPlayer.length > 0) {
        await pool.query('DELETE FROM deck WHERE id = ?', [targetPlayer[0].id]);

        res.json({ message: "La carte cible a été trouvée et le joueur a été éliminé" });
      } else {
        res.json({ message: "La carte cible n'a pas été trouvée" });
      }

      await pool.query('UPDATE deck SET carte_est_jouee = true WHERE id = ?', [carteId]);
    } else {
      res.status(401).send('Non autorisé: vous devez posséder la carte que vous souhaitez jouer');
    }
  } catch (err) {
    console.error(`Error while playing guard card: ${err.stack}`);
    res.status(500).send('Erreur lors de la joue de la carte garde');
  }
});

/**
 * post: /carte/pretre/:joueurId/
 * desc: Prêtre, puisance 2, cible un joueur et regarde sa carte
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/pretre/:joueurId/:carteId', async (req, res) => {
  const { joueurId, carteId } = req.params;

  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND id = ? AND puissance = 2', [req.session.joueurId, carteId]);

    if (rows.length > 0) {
      const [targetPlayer, targetPlayerFields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ?', [joueurId]);

      if (targetPlayer.length > 0) {
        res.json({ message: "La carte du joueur cible est: " + targetPlayer[0].puissance });
      } else {
        res.status(404).send('Le joueur cible n\'a pas de cartes');
      }

      await pool.query('UPDATE deck SET carte_est_jouee = true WHERE id = ?', [carteId]);
    } else {
      res.status(401).send('Non autorisé: vous devez posséder la carte que vous souhaitez jouer');
    }
  } catch (err) {
    console.error(`Error while playing priest card: ${err.stack}`);
    res.status(500).send('Erreur lors de la joue de la carte prêtre');
  }
});

/**
 * post: /carte/baron/:joueurId/
 * desc: Baron, puisance 3, cible un joueur et compare sa carte avec celle du joueur, le joueur avec la carte la plus faible est éliminé
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/baron/:joueurId/:carteId', async (req, res) => {
  const { joueurId, carteId } = req.params;

  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND id = ? AND puissance = 3', [req.session.joueurId, carteId]);

    if (rows.length > 0) {
      const [playerCard, playerFields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ?', [req.session.joueurId]);
      const [targetCard, targetFields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ?', [joueurId]);

      if (playerCard.length > 0 && targetCard.length > 0) {
        if (playerCard[0].puissance > targetCard[0].puissance) {
          await pool.query('DELETE FROM deck WHERE id = ?', [targetCard[0].id]);
          res.json({ message: "Le joueur cible a été éliminé" });
        } else if (playerCard[0].puissance < targetCard[0].puissance) {
          await pool.query('DELETE FROM deck WHERE id = ?', [playerCard[0].id]);
          res.json({ message: "Vous avez été éliminé" });
        } else {
          res.json({ message: "Il y a égalité, aucun joueur n'a été éliminé" });
        }
      } else {
        res.status(404).send('Une des cartes n\'a pas été trouvée');
      }

      await pool.query('UPDATE deck SET carte_est_jouee = true WHERE id = ?', [carteId]);
    } else {
      res.status(401).send('Non autorisé: vous devez posséder la carte que vous souhaitez jouer');
    }
  } catch (err) {
    console.error(`Error while playing baron card: ${err.stack}`);
    res.status(500).send('Erreur lors de la joue de la carte baron');
  }
});

/**
 * post: /carte/servante
 * desc: Servante, puisance 4, protège le joueur de toutes les cartes jusqu'à son prochain tour
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/servante/:carteId', async (req, res) => {
  const { carteId } = req.params;

  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND id = ? AND puissance = 4', [req.session.joueurId, carteId]);

    if (rows.length > 0) {
      // La carte Servante ne fait rien de spécial, le joueur est simplement protégé jusqu'à son prochain tour
      // Vous devrez mettre en œuvre cette protection dans chaque route de carte
      await pool.query('UPDATE deck SET carte_est_jouee = true WHERE id = ?', [carteId]);
      res.json({ message: "Vous êtes protégé jusqu'à votre prochain tour" });
    } else {
      res.status(401).send('Non autorisé: vous devez posséder la carte que vous souhaitez jouer');
    }
  } catch (err) {
    console.error(`Error while playing handmaid card: ${err.stack}`);
    res.status(500).send('Erreur lors de la joue de la carte servante');
  }
});

/**
 * post: /carte/prince/:joueurId/
 * desc: Prince, puisance 5, cible un joueur et le force à défausser sa carte et en piocher une nouvelle (on peut ce cibler soi-même)
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/prince/:joueurId/:carteId', async (req, res) => {
  const { joueurId, carteId } = req.params;

  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND id = ? AND puissance = 5', [req.session.joueurId, carteId]);

    if (rows.length > 0) {
      const [targetCard, targetFields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ?', [joueurId]);

      if (targetCard.length > 0) {
        await pool.query('DELETE FROM deck WHERE id = ?', [targetCard[0].id]);

        // Draw a new card
        const [newCard, newCardFields] = await pool.query('SELECT * FROM deck WHERE joueur_id IS NULL ORDER BY RAND() LIMIT 1');

        if (newCard.length > 0) {
          await pool.query('UPDATE deck SET joueur_id = ? WHERE id = ?', [joueurId, newCard[0].id]);
          res.json({ message: "Le joueur cible a défaussé sa carte et en a pioché une nouvelle" });
        } else {
          res.json({ message: "Le joueur cible a défaussé sa carte, mais il n'y a plus de cartes à piocher" });
        }
      } else {
        res.status(404).send('La carte du joueur cible n\'a pas été trouvée');
      }

      await pool.query('UPDATE deck SET carte_est_jouee = true WHERE id = ?', [carteId]);
    } else {
      res.status(401).send('Non autorisé: vous devez posséder la carte que vous souhaitez jouer');
    }
  } catch (err) {
    console.error(`Error while playing prince card: ${err.stack}`);
    res.status(500).send('Erreur lors de la joue de la carte prince');
  }
});

/**
 * post: /carte/chancelier
 * desc: Chancelier, puisance 6, le joueur pioche une carte et place 2 cartes de sa main sous le deck
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/chancelier/:carteId', async (req, res) => {
  const { carteId } = req.params;

  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND id = ? AND puissance = 6', [req.session.joueurId, carteId]);

    if (rows.length > 0) {
      // Draw 2 new cards
      const [newCards, newCardFields] = await pool.query('SELECT * FROM deck WHERE joueur_id IS NULL ORDER BY RAND() LIMIT 2');

      if (newCards.length > 0) {
        // Update player's cards
        for (let newCard of newCards) {
          await pool.query('UPDATE deck SET joueur_id = ? WHERE id = ?', [req.session.joueurId, newCard.id]);
        }

        // Remove the two old cards from the player's hand (The one used to play and the other one)
        await pool.query('DELETE FROM deck WHERE joueur_id = ? ORDER BY id ASC LIMIT 2', [req.session.joueurId]);

        res.json({ message: "Vous avez pioché deux nouvelles cartes et défaussé les deux précédentes" });
      } else {
        res.json({ message: "Il n'y a pas assez de cartes dans le deck pour en piocher deux nouvelles" });
      }
    } else {
      res.status(401).send('Non autorisé: vous devez posséder la carte que vous souhaitez jouer');
    }
  } catch (err) {
    console.error(`Error while playing chancellor card: ${err.stack}`);
    res.status(500).send('Erreur lors de la joue de la carte chancelier');
  }
});

/**
 * post: /carte/roi/:joueurId/
 * desc: Roi, puisance 7, le joueur échange sa carte avec celle d'un autre joueur
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/roi/:joueurId/:carteId', async (req, res) => {
  const { joueurId, carteId } = req.params;

  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND id = ? AND puissance = 7', [req.session.joueurId, carteId]);

    if (rows.length > 0) {
      const [playerCard, playerFields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ?', [req.session.joueurId]);
      const [targetCard, targetFields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ?', [joueurId]);

      if (playerCard.length > 0 && targetCard.length > 0) {
        await pool.query('UPDATE deck SET joueur_id = ? WHERE id = ?', [req.session.joueurId, targetCard[0].id]);
        await pool.query('UPDATE deck SET joueur_id = ? WHERE id = ?', [joueurId, playerCard[0].id]);

        res.json({ message: "Les cartes ont été échangées" });
      } else {
        res.status(404).send('Une des cartes n\'a pas été trouvée');
      }

      await pool.query('UPDATE deck SET carte_est_jouee = true WHERE id = ?', [carteId]);
    } else {
      res.status(401).send('Non autorisé: vous devez posséder la carte que vous souhaitez jouer');
    }
  } catch (err) {
    console.error(`Error while playing king card: ${err.stack}`);
    res.status(500).send('Erreur lors de la joue de la carte roi');
  }
});

/**
 * post: /carte/comtesse
 * desc: Comtesse, puisance 8, si le joueur possède le roi ou le prince, il doit jouer la comtesse (pas d'effet)
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/comtesse/:carteId', async (req, res) => {
  const { carteId } = req.params;

  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND id = ? AND puissance = 8', [req.session.joueurId, carteId]);

    if (rows.length > 0) {
      // The countess card does nothing special, it just has to be played if the player also has the king or prince card
      await pool.query('UPDATE deck SET carte_est_jouee = true WHERE id = ?', [carteId]);
      res.json({ message: "La carte comtesse a été jouée" });
    } else {
      res.status(401).send('Non autorisé: vous devez posséder la carte que vous souhaitez jouer');
    }
  } catch (err) {
    console.error(`Error while playing countess card: ${err.stack}`);
    res.status(500).send('Erreur lors de la joue de la carte comtesse');
  }
});

/**
 * post: /carte/princesse
 * desc: Princesse, puisance 9, si le joueur joue cette carte, il est éliminé
 * param: 
 * auth: joueur connecté, partie lancée, joueur possède la carte
 */
app.post('/carte/princesse/:carteId', async (req, res) => {
  const { carteId } = req.params;

  if (!req.session.joueurId) {
    return res.status(401).send('Non autorisé: vous devez vous connecter pour accéder à ces informations');
  }

  try {
    const [rows, fields] = await pool.query('SELECT * FROM deck WHERE joueur_id = ? AND id = ? AND puissance = 9', [req.session.joueurId, carteId]);

    if (rows.length > 0) {
      // The player who played the princess card is eliminated
      await pool.query('DELETE FROM deck WHERE id = ?', [carteId]);

      res.json({ message: "Vous avez été éliminé" });
    } else {
      res.status(401).send('Non autorisé: vous devez posséder la carte que vous souhaitez jouer');
    }
  } catch (err) {
    console.error(`Error while playing princess card: ${err.stack}`);
    res.status(500).send('Erreur lors de la joue de la carte princesse');
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