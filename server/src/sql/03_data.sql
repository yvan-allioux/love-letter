/*INSERT INTO partie (partie_demarree)
VALUES (FALSE);

INSERT INTO joueur (partie_id, pseudo, mot_de_passe, victoires, defaites)
VALUES (1, 'joueur1', 'password1', 5, 3);

INSERT INTO joueur (partie_id, pseudo, mot_de_passe, victoires, defaites)
VALUES (1, 'joueur2', 'password2', 7, 2);




-- Ajouter des cartes pour le joueur 1
INSERT INTO deck (puissance, carte_est_jouee, partie_id, joueur_id)
VALUES (3, FALSE, 1, 1), 
       (6, FALSE, 1, 1), 
       (2, FALSE, 1, 1), 
       (8, FALSE, 1, 1), 
       (7, FALSE, 1, 1); 

-- Ajouter des cartes pour le joueur 2
INSERT INTO deck (puissance, carte_est_jouee, partie_id, joueur_id)
VALUES (4, FALSE, 1, 2), 
       (1, FALSE, 1, 2), 
       (9, FALSE, 1, 2), 
       (5, FALSE, 1, 2), 
       (8, FALSE, 1, 2);
*/

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `deck`;
CREATE TABLE `deck` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `puissance` int(11) DEFAULT NULL CHECK (`puissance` >= 0 and `puissance` <= 9),
  `carte_est_jouee` tinyint(1) DEFAULT 0,
  `partie_id` int(11) DEFAULT NULL,
  `joueur_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `partie_id` (`partie_id`),
  KEY `joueur_id` (`joueur_id`),
  CONSTRAINT `deck_ibfk_1` FOREIGN KEY (`partie_id`) REFERENCES `partie` (`id`),
  CONSTRAINT `deck_ibfk_2` FOREIGN KEY (`joueur_id`) REFERENCES `joueur` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `deck` (`id`, `puissance`, `carte_est_jouee`, `partie_id`, `joueur_id`) VALUES
(1,	4,	0,	1,	1),
(2,	5,	0,	1,	2),
(3,	4,	0,	1,	3),
(4,	1,	0,	1,	2),
(5,	7,	0,	1,	NULL),
(6,	2,	0,	1,	NULL),
(7,	3,	0,	1,	NULL),
(8,	9,	0,	1,	NULL),
(9,	1,	0,	1,	NULL),
(10,	6,	0,	1,	NULL),
(11,	0,	0,	1,	NULL),
(12,	3,	0,	1,	NULL),
(13,	8,	0,	1,	NULL),
(14,	5,	0,	1,	NULL),
(15,	0,	0,	1,	NULL),
(16,	1,	0,	1,	NULL),
(17,	1,	0,	1,	NULL),
(18,	1,	0,	1,	NULL),
(19,	1,	0,	1,	NULL),
(20,	6,	0,	1,	NULL),
(21,	2,	0,	1,	NULL),
(22,	9,	0,	2,	NULL),
(23,	1,	0,	2,	NULL),
(24,	0,	0,	2,	NULL),
(25,	8,	0,	2,	NULL),
(26,	4,	0,	2,	NULL),
(27,	2,	0,	2,	NULL),
(28,	1,	0,	2,	NULL),
(29,	1,	0,	2,	NULL),
(30,	6,	0,	2,	NULL),
(31,	5,	0,	2,	NULL),
(32,	4,	0,	2,	NULL),
(33,	3,	0,	2,	NULL),
(34,	7,	0,	2,	NULL),
(35,	1,	0,	2,	NULL),
(36,	0,	0,	2,	NULL),
(37,	3,	0,	2,	NULL),
(38,	2,	0,	2,	NULL),
(39,	6,	0,	2,	NULL),
(40,	1,	0,	2,	NULL),
(41,	1,	0,	2,	NULL),
(42,	5,	0,	2,	NULL);

DROP TABLE IF EXISTS `joueur`;
CREATE TABLE `joueur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partie_id` int(11) DEFAULT NULL,
  `pseudo` varchar(255) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `victoires` int(11) DEFAULT 0,
  `defaites` int(11) DEFAULT 0,
  `date_inscription` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `pseudo` (`pseudo`),
  KEY `partie_id` (`partie_id`),
  CONSTRAINT `joueur_ibfk_1` FOREIGN KEY (`partie_id`) REFERENCES `partie` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `joueur` (`id`, `partie_id`, `pseudo`, `mot_de_passe`, `victoires`, `defaites`, `date_inscription`) VALUES
(4,	2,	'damien',	'$2b$10$6AtTNZDxlkscegop6Cxo.eihYcefte81agKdK6m01wHdcufTguWTS',	0,	0,	'2023-07-13 22:32:40'),
(5,	2,	'tomas',	'$2b$10$0dAA.C/OGy/PDUGuFkfxo.9.DB/1/iWTYQzO3su/bS5rZJ5krp4qS',	0,	0,	'2023-07-13 22:32:44'),
(6,	2,	'camille',	'$2b$10$5AK2xxe9ElXCUlqZ7Rnxa.T.lacxl2ITZzv.NhoMjmHU5KAMTkPLO',	0,	0,	'2023-07-13 22:32:49');

DROP TABLE IF EXISTS `partie`;
CREATE TABLE `partie` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `partie_demarree` tinyint(1) DEFAULT 0,
  `date_creation` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `partie` (`id`, `partie_demarree`, `date_creation`) VALUES
(2,	0,	'2023-07-13 22:33:22');