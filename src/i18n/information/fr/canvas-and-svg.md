Rien de ce qui est dessiné dans un canvas n'est dans le DOM : les barres, la cible et votre dessin ne sont que des pixels, il n'y a donc aucun élément ni texte qu'un localisateur puisse trouver. Un test doit agir à des coordonnées précises et vérifier les résultats affichés sous chaque canvas. Chaque canvas est affiché à la taille à laquelle il est dessiné, donc une position en pixels CSS depuis son coin supérieur gauche est la même position en pixels du canvas : utilisez `click({ position: { x, y } })` dans Playwright ou `.click(x, y)` dans Cypress.

## Bloc de dessin

- Un trait demande d'appuyer sur le bouton, de déplacer le pointeur puis de relâcher le bouton, donc un simple clic ne dessine rien et n'est pas compté.
- Pilotez-le avec `page.mouse.move`, `page.mouse.down` et `page.mouse.up`, qui utilisent les coordonnées de la page (ajoutez donc la position du rectangle englobant du canvas), ou déclenchez des événements de pointeur sur le canvas.
- Le nombre de traits et de points est affiché sous le bloc et dans ses attributs `data-strokes` et `data-points`.

## Graphique à barres

- Le canvas mesure 480 × 260 pixels, la barre *i* (en comptant à partir de 0) fait 50 pixels de large et est centrée en x = 75 + 70 × *i*, et l'axe est en y = 230, donc un clic en y = 225 touche toujours une barre.
- Un clic entre ou au-dessus des barres indique qu'aucune barre n'a été cliquée.

## Cible

- La cible a un rayon de 15 pixels et apparaît en (60, 60), (340, 240), (200, 150), (320, 50) puis (80, 250), dans cet ordre.
- Son centre actuel se trouve dans les attributs `data-target-x` et `data-target-y` du canvas, un raccourci qu'un vrai jeu ne vous donnerait pas.

## Carte des quartiers

- La carte est en SVG, ses régions sont donc des éléments, mais elles n'ont ni rôle ni nom accessible et le `svg` est une seule image pour les technologies d'assistance, donc les localisateurs par rôle n'y trouvent rien.
- Trouvez une région avec `[data-region="harbour"]`. XPath a besoin de `//*[local-name()='polygon']`, car les éléments SVG sont dans leur propre espace de noms.
- Le Port entoure la Vieille Ville, donc le milieu de son rectangle englobant, là où les outils cliquent et survolent par défaut, se trouve dans la Vieille Ville : cliquez-le avec un décalage, par exemple près de son bord inférieur.
- Les noms sur la carte ignorent la souris et transmettent les clics à la région en dessous, donc un outil qui vérifie quel élément est sous le pointeur avant de cliquer, comme Playwright, attend qu'un nom reçoive le clic et finit par expirer.
- L'info-bulle n'apparaît que lorsque la souris est sur une région et la suit, elle demande donc un survol plutôt qu'un clic.

## Tests de capture d'écran

- Tout est dessiné à une taille fixe avec des couleurs fixes, quel que soit le thème, sans animation ni hasard, donc les mêmes actions donnent toujours la même image.
- Faites la capture du seul canvas ou de la carte plutôt que de toute la page, et attendez-vous à de petites différences entre navigateurs, systèmes d'exploitation et polices (anticrénelage et texte) : gardez une référence par navigateur et par plateforme, ou autorisez un petit seuil.
- Les pixels peuvent aussi être lus directement avec `canvas.toDataURL()` ou `getContext('2d').getImageData()`.
