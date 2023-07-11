DROP DATABASE IF EXISTS loveletter;
CREATE DATABASE loveletter;

GRANT ALL ON loveletter.* TO 'my_loveletter_user'@'%' IDENTIFIED BY 'mypass';

USE loveletter;

CREATE TABLE partie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    col0 INT DEFAULT 2 CHECK(col0 >= 0 AND col0 <= 6),
    col1 INT DEFAULT 6 CHECK(col1 >= 0 AND col1 <= 6),
    col2 INT DEFAULT 3 CHECK(col2 >= 0 AND col2 <= 6),
    col3 INT DEFAULT 2 CHECK(col3 >= 0 AND col3 <= 6),
    col4 INT DEFAULT 2 CHECK(col4 >= 0 AND col4 <= 6),
    col5 INT DEFAULT 2 CHECK(col5 >= 0 AND col5 <= 6),
    col6 INT DEFAULT 2 CHECK(col6 >= 0 AND col6 <= 6),
    col7 INT DEFAULT 1 CHECK(col7 >= 0 AND col7 <= 6),
    col8 INT DEFAULT 1 CHECK(col8 >= 0 AND col8 <= 6),
    col9 INT DEFAULT 1 CHECK(col9 >= 0 AND col9 <= 6),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE joueur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partie_id INT,
    col0 INT DEFAULT 0 CHECK(col0 >= 0 AND col0 <= 6),
    col1 INT DEFAULT 0 CHECK(col1 >= 0 AND col1 <= 6),
    col2 INT DEFAULT 0 CHECK(col2 >= 0 AND col2 <= 6),
    col3 INT DEFAULT 0 CHECK(col3 >= 0 AND col3 <= 6),
    col4 INT DEFAULT 0 CHECK(col4 >= 0 AND col4 <= 6),
    col5 INT DEFAULT 0 CHECK(col5 >= 0 AND col5 <= 6),
    col6 INT DEFAULT 0 CHECK(col6 >= 0 AND col6 <= 6),
    col7 INT DEFAULT 0 CHECK(col7 >= 0 AND col7 <= 6),
    col8 INT DEFAULT 0 CHECK(col8 >= 0 AND col8 <= 6),
    col9 INT DEFAULT 0 CHECK(col9 >= 0 AND col9 <= 6),
    pseudo VARCHAR(255) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    victoires INT DEFAULT 0,
    defaites INT DEFAULT 0,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partie_id) REFERENCES partie(id)
);


INSERT INTO partie (col0, col1, col2, col3, col4, col5, col6, col7, col8, col9)
VALUES (1, 1, 2, 3, 4, 5, 1, 2, 3, 1);

INSERT INTO joueur (partie_id, col0, col1, col2, col3, col4, col5, col6, col7, col8, col9, pseudo, mot_de_passe, victoires, defaites)
VALUES (1, 1, 1, 2, 3, 4, 5, 1, 2, 3, 4, 'joueur1', 'password1', 5, 3);

INSERT INTO joueur (partie_id, col0, col1, col2, col3, col4, col5, col6, col7, col8, col9, pseudo, mot_de_passe, victoires, defaites)
VALUES (1, 1, 1, 2, 3, 4, 5, 1, 2, 3, 4, 'joueur2', 'password2', 7, 2);


