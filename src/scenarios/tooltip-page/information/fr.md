Chaque infobulle n'apparaît que tant que le pointeur est sur son élément ou que l'élément a le focus clavier : un test doit d'abord survoler (ou donner le focus). Elle apparaît 100 ms après le début du survol et est retirée du DOM quand le pointeur s'en va ou qu'on appuie sur Échap.

## Chaque infobulle

- Le bouton de suppression est désactivé, et les boutons désactivés ne déclenchent pas d'événements de pointeur : son infobulle est donc déclenchée par l'élément qui l'entoure (`data-testid="delete-button"`). Survolez celui-ci plutôt que le bouton lui-même.
- L'infobulle Plus d'informations contient un lien. Elle reste ouverte pendant que le pointeur passe du bouton à elle : allez directement sur le lien avant de cliquer dessus.
- Le texte long est tronqué avec des points de suspension, et son infobulle l'affiche en entier. Le texte complet reste dans le DOM : une recherche par texte réussit même s'il n'est pas entièrement visible.

## Trouver une infobulle

- Une infobulle ouverte a `role="tooltip"` : trouvez-la par ce rôle et vérifiez son texte, plutôt que de vous fier à sa position ou à son style.
- Chaque infobulle s'affiche à côté de son élément, dans la page plutôt qu'à la fin de `<body>`.
