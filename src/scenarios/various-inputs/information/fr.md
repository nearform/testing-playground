Chaque ligne a un champ natif à gauche et, à droite, une sortie en lecture seule qui montre exactement ce que contient le champ : vous pouvez saisir dans l'un et vérifier l'autre.

## Les champs

- Il y a des champs texte, mot de passe, nombre, date et texte sur plusieurs lignes, chacun avec un test id nommé d'après son type : `text-input`, `password-input`, `number-input`, `date-input` et `textarea-input`.
- Les sorties sont de simples zones de texte en lecture seule : le mot de passe s'y affiche en clair.
- Quand ce qui est saisi dans le champ nombre n'est pas un nombre valide, sa valeur est vide, et sa sortie l'est aussi.

## Les dates

- L'apparence du champ date et la façon d'y saisir dépendent du navigateur et de sa langue, mais sa valeur, que la sortie affiche, est toujours au format `yyyy-mm-dd`.
- La plupart des frameworks peuvent la définir directement avec une valeur de cette forme, comme `2025-01-31`, plutôt que de saisir le jour, le mois et l'année séparément.

## Effacer

- Chaque champ sur une ligne affiche son propre bouton d'effacement dès qu'il a une valeur ; le champ sur plusieurs lignes n'en a pas.
- Le bouton Tout effacer, en haut, vide tous les champs d'un coup.
