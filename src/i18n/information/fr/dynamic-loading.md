Chaque section modifie la page après un délai aléatoire compris entre {{min}} et {{max}} secondes, tiré à nouveau à chaque fois : une pause fixe est donc parfois trop courte et toujours plus lente que nécessaire. Attendez plutôt la condition dont vous avez réellement besoin.

## Chaque section

- La première section n'ajoute son élément au DOM qu'une fois son indicateur de chargement terminé : il est donc introuvable avant.
- La deuxième a son élément dans le DOM dès le départ, mais masqué avec `display: none` : il est _présent_ bien avant d'être _visible_.
- La troisième a un champ désactivé jusqu'à la fin de l'étape asynchrone, et cliquer dessus tant qu'il est désactivé ne fait rien.
- La quatrième supprime sa case à cocher puis en ajoute une toute nouvelle : une référence à l'ancien élément devient obsolète et doit être recherchée à nouveau.
- La dernière affiche « Chargement... » puis « Chargement en cours... » avant son texte final : attendre seulement que « Chargement... » disparaisse ne suffit pas, attendez le texte attendu.
