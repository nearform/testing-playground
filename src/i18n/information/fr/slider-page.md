Ces curseurs ne sont pas des éléments `<input type="range">`, on ne peut donc pas y saisir une valeur : chaque poignée est un élément avec `role="slider"` qu'on déplace en la faisant glisser ou au clavier. Les trois vont de 1 à 100 par pas de 1.

## Déplacer une poignée

- La valeur d'une poignée est dans `aria-valuenow`, et ses limites dans `aria-valuemin` et `aria-valuemax`.
- Une fois la poignée active, les flèches la déplacent de 1, Maj avec une flèche ou Page précédente et Page suivante la déplacent de 10, et Début et Fin vont à 1 et à 100.
- Le glisser fonctionne aussi, mais l'endroit où la poignée s'arrête dépend de la largeur du curseur : un déplacement d'un nombre fixe de pixels donne des valeurs différentes selon l'écran. Le clavier est plus fiable.

## Chaque curseur

- Le curseur de base affiche sa valeur à côté de son libellé ; cet affichage n'a pas de test id propre, alors cherchez-le dans `basic-slider-container`.
- Le curseur de plage a deux poignées, à 1 et à 25 au départ, qui peuvent se rejoindre sur la même valeur ; ses valeurs restent toujours dans l'ordre, si bien que la première poignée porte la plus petite.
- Le dernier curseur est lié au champ numérique à côté (`data-testid="input-slider-text"`) : taper un nombre déplace la poignée, et déplacer la poignée change le nombre. Un nombre hors de 1 à 100 est ramené à la limite la plus proche : taper 150 donne donc 100.
