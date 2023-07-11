require('dotenv').config({ path: './config.env' });

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


async function getJoueur(id) {
    const [rows, fields] = await pool.query('SELECT * FROM joueur WHERE id = ?', [id]);
    return rows[0];
  }
  
  async function createJoueur(pseudo, hashedPassword) {
    const result = await pool.query('INSERT INTO joueur (pseudo, mot_de_passe) VALUES (?, ?)', [pseudo, hashedPassword]);
    return result.insertId;
  }
  
  // Ajoutez ici toutes les autres fonctions pour effectuer d'autres requêtes
  
  module.exports = {
    getJoueur,
    createJoueur,
    // Exportez ici toutes les autres fonctions
  };




