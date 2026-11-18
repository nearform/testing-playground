Tout ce qui se trouve sur cette page n'apparaît que lorsque le pointeur de la souris est posé sur quelque chose : les tests doivent donc d'abord survoler. Votre dernière action est affichée en dessous.

## Chaque section

- Les détails de chaque carte de profil ne sont pas du tout dans le DOM tant que la carte n'est pas survolée, et il n'existe volontairement aucun autre moyen de les afficher.
- Les boutons de chaque fichier sont toujours dans le DOM, mais restent invisibles tant que leur ligne n'est pas survolée : un test qui clique dessus directement sera informé qu'ils ne sont pas visibles ; au clavier, on peut aussi les afficher en atteignant la ligne avec Tab.
- Le menu ouvre ses sous-menus un instant après le survol d'un élément et se ferme un instant après que le pointeur l'a quitté : parcourez-le comme le ferait une personne ; cliquer sur un élément ouvre son sous-menu immédiatement.
