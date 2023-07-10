CREATE DATABASE loveletter;

USE loveletter;

CREATE TABLE partie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    col1 INT CHECK(col1 >= 0 AND col1 <= 6),
    col2 INT CHECK(col2 >= 0 AND col2 <= 6),
    col3 INT CHECK(col3 >= 0 AND col3 <= 6),
    col4 INT CHECK(col4 >= 0 AND col4 <= 6),
    col5 INT CHECK(col5 >= 0 AND col5 <= 6),
    col6 INT CHECK(col6 >= 0 AND col6 <= 6),
    col7 INT CHECK(col7 >= 0 AND col7 <= 6),
    col8 INT CHECK(col8 >= 0 AND col8 <= 6),
    col9 INT CHECK(col9 >= 0 AND col9 <= 6),
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE joueur (
    id INT AUTO_INCREMENT PRIMARY KEY,
    partie_id INT,
    col1 INT CHECK(col1 >= 0 AND col1 <= 6),
    col2 INT CHECK(col2 >= 0 AND col2 <= 6),
    col3 INT CHECK(col3 >= 0 AND col3 <= 6),
    col4 INT CHECK(col4 >= 0 AND col4 <= 6),
    col5 INT CHECK(col5 >= 0 AND col5 <= 6),
    col6 INT CHECK(col6 >= 0 AND col6 <= 6),
    col7 INT CHECK(col7 >= 0 AND col7 <= 6),
    col8 INT CHECK(col8 >= 0 AND col8 <= 6),
    col9 INT CHECK(col9 >= 0 AND col9 <= 6),
    pseudo VARCHAR(255),
    mot_de_passe VARCHAR(255),
    victoires INT DEFAULT 0,
    defaites INT DEFAULT 0,
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partie_id) REFERENCES partie(id)
);
