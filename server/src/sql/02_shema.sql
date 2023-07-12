CREATE TABLE partie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partie_demarree BOOLEAN DEFAULT FALSE,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE joueur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partie_id INT,
    pseudo VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    victoires INT DEFAULT 0,
    defaites INT DEFAULT 0,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partie_id) REFERENCES partie(id)
);

CREATE TABLE deck (
    id INT AUTO_INCREMENT PRIMARY KEY,
    puissance INT CHECK(puissance >= 0 AND puissance <= 9),
    carte_est_jouee BOOLEAN DEFAULT FALSE,
    partie_id INT,
    joueur_id INT,
    FOREIGN KEY (partie_id) REFERENCES partie(id),
    FOREIGN KEY (joueur_id) REFERENCES joueur(id)
);