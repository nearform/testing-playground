La barre verte sous le tableau nomme l'un des quatre processus et donne sa valeur d'UC, comme *Chrome UC: 23.4%*. Le but est de trouver la ligne de ce processus dans le tableau et de vérifier que sa cellule UC affiche la même valeur.

## Ce qui change à chaque chargement

- L'ordre des lignes et toutes leurs valeurs sont aléatoires, et la barre verte choisit un processus différent à chaque fois : un test ne peut se fier ni à la position d'une ligne ni à un nombre fixe.
- Les test ids des lignes, comme `dynamic-table-row-0`, suivent l'ordre à l'écran : ils indiquent où se trouve une ligne, pas quel processus elle contient.
- Les noms des processus sont traduits : ils changent donc aussi avec la langue.

## Trouver la valeur

- Lisez le nom du processus dans la barre verte, trouvez la ligne dont la cellule Nom correspond, puis lisez la cellule de la colonne UC de cette ligne.
- Les colonnes sont toujours dans le même ordre, mais trouver la colonne UC par son en-tête se rapproche davantage de la façon de lire un vrai tableau qui change.
- Les valeurs sont du texte avec leurs unités (`%`, `MB`, `Mbps` et `MB/s`) : comparez-les comme du texte, ou retirez l'unité avant de les comparer comme des nombres.
