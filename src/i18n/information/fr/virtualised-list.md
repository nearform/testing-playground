Chaque liste compte 10 000 lignes et la grille 260 000 cellules, mais seules les quelques-unes proches de la zone visible sont dans le DOM. Le compteur au-dessus de chaque liste indique combien de lignes sont affichées en ce moment et lesquelles, pour les voir changer pendant le défilement.

## Les lignes hors écran n'existent pas

- Chercher la ligne {{fixedTarget}} tout de suite ne trouve rien : elle n'est pas masquée, elle n'est tout simplement pas encore dans le DOM. `scrollIntoView()` n'aide pas non plus, car il n'y a aucun élément sur lequel l'appeler. Faites défiler la liste elle-même (pas la page) jusqu'à ce que la ligne soit affichée, puis cherchez-la.
- Compter les lignes avec `getAllByRole('listitem')`, `locator.count()` ou `should('have.length')` donne le nombre de lignes affichées, pas le total. Les vrais totaux se trouvent dans `aria-setsize` sur chaque ligne, et dans `aria-rowcount` et `aria-colcount` sur la grille.
- Chercher du texte dans la page, avec `getByText` ou la recherche du navigateur, ne voit que les lignes affichées.
- Être dans le DOM ne veut pas dire être à l'écran : quelques lignes de plus sont affichées au-dessus et en dessous de la zone visible pour éviter les trous lors d'un défilement rapide. Playwright fait défiler une ligne affichée jusqu'à elle avant de cliquer ; ailleurs, vérifiez d'abord qu'elle est visible.

## Les éléments sont réutilisés

- Pendant le défilement, l'élément qui affichait une ligne est réutilisé pour une autre : l'élément qui affichait la ligne 3 peut afficher la ligne 18 après un défilement. Un élément conservé, comme un `WebElement` Selenium ou un alias Cypress, peut ensuite désigner une autre ligne sans devenir obsolète, alors cherchez à nouveau la ligne après chaque défilement.
- Cherchez les lignes par quelque chose qui leur appartient, comme leur texte, leur `data-row-id` ou le nom de leur bouton (*Sélectionner la ligne {{fixedTarget}}*), pas par leur position : `nth()` ou `eq()` choisit la n-ième ligne affichée, pas la n-ième ligne de la liste.
- Le bouton `Sélectionner` de chaque ligne a le même texte visible, donc un sélecteur basé sur ce seul texte correspond à toutes les lignes affichées.

## Faire défiler jusqu'à une ligne

- Dans la liste à hauteur fixe, chaque ligne mesure {{rowHeight}} px, donc la ligne N commence à `(N - 1) × {{rowHeight}}` pixels. Donnez cette valeur au `scrollTop` de la liste et la ligne est affichée.
- Dans la liste à hauteur variable, les lignes n'ont pas toutes la même hauteur, donc la position d'une ligne ne se déduit pas de son ID. Faites défiler pas à pas, par exemple de la hauteur de la liste, et vérifiez après chaque pas si la ligne est affichée. Les ID des lignes affichées indiquent s'il faut continuer ou revenir en arrière.
- Les lignes sont affichées en réponse à l'événement de défilement, alors attendez que la ligne apparaisse plutôt que de vérifier juste après avoir défilé. Modifier `scrollTop`, `mouse.wheel()` dans Playwright et `scrollTo()` sur la liste dans Cypress déclenchent tous cet événement.
- La grille défile dans les deux sens : ses colonnes sont aussi virtualisées, donc la colonne Q n'est pas dans le DOM tant que vous n'avez pas défilé vers la droite. Sa ligne d'en-tête et ses numéros de ligne restent en place au-dessus des cellules, donc une cellule juste en dessous est dans le DOM mais recouverte.
