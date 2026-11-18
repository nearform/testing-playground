Commencez à taper dans l'un des champs pour voir des suggestions.

## Au clavier

- Utilisez les flèches haut et bas pour les parcourir (elles reviennent au début), Entrée pour choisir celle qui est mise en évidence, ou cliquez sur une suggestion ; Échap ferme la liste et un second Échap vide le champ.
- Quitter le champ avec Tab ferme la liste sans rien choisir, et modifier le texte après un choix annule ce choix.

## Correspondances et balisage

- Le champ suit le modèle ARIA combobox : aria-expanded indique si la liste est ouverte et aria-activedescendant désigne l'option mise en évidence, qui a aria-selected="true".
- Les suggestions correspondent à n'importe quelle partie d'un nom, sans tenir compte de la casse ni des accents ; les noms qui commencent par le texte saisi sont listés en premier et la partie correspondante est en gras.

## Pays et ville

- Le champ des pays filtre immédiatement une liste fixe.
- Le champ des villes interroge plutôt un faux serveur lent : il attend au moins {{min}} caractères et une pause de {{debounce}} ms dans la saisie, affiche un message de chargement pendant l'attente, renvoie au plus {{max}} villes et répond plus lentement aux recherches courtes qu'aux longues, si bien qu'une ancienne réponse peut arriver après une nouvelle ; seule la réponse correspondant au texte actuel est affichée.
