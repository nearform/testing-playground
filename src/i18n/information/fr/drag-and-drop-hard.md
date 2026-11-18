Cinq petites formes rouges, chacune un cercle ou un carré, doivent être déposées sur la grande forme correspondante : les cercles sur le cercle et les carrés sur le carré. Les formes obtenues sont aléatoires et changent à chaque chargement.

## Déposer les formes

- Une forme déposée sur la bonne cible devient verte et ajoute un à Total correct ; déposée sur la mauvaise, elle devient jaune et peut être glissée à nouveau pour corriger.
- Une forme verte est terminée et ne peut plus être glissée : Total correct atteint donc 5 quand toutes les formes sont vertes.
- Les formes restent à leur place et ne changent que de couleur : vérifiez la couleur ou le compteur plutôt que de chercher une forme dans une cible.

## Trouver les formes

- Le test id de chaque forme indique ce qu'elle est et son numéro, comme `draggable-circle-2` ou `draggable-square-4`, et les cibles sont `drop-circle` et `drop-square`. Comme le mélange est aléatoire, trouvez les formes par le début de leur test id plutôt que par une liste fixe.
- Les formes n'ont pas de texte : leur couleur (rouge, jaune ou verte) n'apparaît que dans leur style `background-color` en ligne.
- Comme la version facile, celle-ci utilise le glisser-déposer HTML5 natif, avec le numéro de la forme en `shapeId` dans le `dataTransfer`.
