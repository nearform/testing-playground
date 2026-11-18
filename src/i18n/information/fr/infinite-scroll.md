La liste commence avec 10 éléments et en charge 10 de plus chaque fois que vous atteignez le bas. Elle ne s'épuise jamais : attendez l'apparition des nouveaux éléments plutôt que la fin de la liste.

## Charger la suite

- D'autres éléments se chargent quand un repère invisible sous le dernier élément (`data-testid="scroll-sentinel"`) devient visible : faites défiler jusqu'en bas de la page ou amenez ce repère à l'écran.
- Un message de chargement s'affiche 0,8 seconde avant l'ajout de chaque lot de 10, et le compteur au-dessus de la liste (`data-testid="item-count"`), comme *20 éléments affichés*, augmente.
- Dans une fenêtre très haute, le repère reste visible après le chargement d'un lot : les lots continuent de se charger jusqu'à ce qu'il sorte de l'écran.

## Vérifier les éléments

- Les éléments sont numérotés dans l'ordre et chacun indique son lot : l'élément 11 est donc le premier du lot 2. Leurs test ids sont `item-` suivi du numéro, comme `item-11`.
- Chaque élément est un `article` avec `aria-posinset` égal à son numéro, et la liste n'indique pas sa longueur (`aria-setsize="-1"`), puisqu'elle n'a pas de fin.
