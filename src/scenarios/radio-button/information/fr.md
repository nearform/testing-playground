Choisir une couleur primaire affiche un second groupe de couleurs secondaires, dont le choix dépend de la couleur primaire choisie.

## Les deux groupes

- Rouge propose Violet et Orange, Bleu propose Violet et Vert, et Jaune propose Orange et Vert.
- Blanc est désactivé et ne peut pas être choisi.
- Changer de couleur primaire efface le choix secondaire, même quand le nouveau groupe propose la même couleur.
- Le test id de chaque bouton radio indique son groupe et sa position, comme `radio-button-group-2-1`, et le second groupe change avec le premier choix : le même test id désigne Violet après Rouge mais Orange après Jaune. Vérifiez aussi le libellé.

## Pas des boutons radio natifs

- Comme les cases du scénario Checkbox, ce sont des boutons avec `role="radio"` et `aria-checked` plutôt que des `<input type="radio">` : cliquez dessus plutôt que d'utiliser `check()` de Cypress, et lisez leur état dans `aria-checked`.
- Chaque groupe est un `radiogroup` : Tab y entre une seule fois, puis les flèches passent au bouton suivant et le choisissent, en sautant Blanc, qui est désactivé.
