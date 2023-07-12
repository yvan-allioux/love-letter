INSERT INTO partie (partie_demarree)
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


