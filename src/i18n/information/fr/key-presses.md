Tout sur cette page est piloté par le clavier : les tests doivent donc envoyer des appuis sur les touches plutôt que cliquer ou saisir du texte. Il n'y a volontairement aucune alternative à la souris.

## Chaque contrôle

- Le lecteur de touches affiche la dernière touche appuyée dans sa zone de texte, avec sa clé (key), son code et les touches de modification maintenues, ainsi que les dernières touches appuyées.
- Le compteur ne change que lorsqu'il a le focus : les flèches haut et bas (ou droite et gauche) le modifient de 1, maintenir Maj le modifie de 10, Début et Fin vont aux valeurs minimale et maximale et Échap le remet à sa valeur de départ.
- Le contrôle de maintien ne confirme que si Espace est maintenue enfoncée pendant une seconde entière ; relâcher plus tôt ne compte pas, et maintenir une touche répète son événement keydown, donc chaque répétition doit être ignorée.
