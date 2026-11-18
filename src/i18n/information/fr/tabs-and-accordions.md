Les onglets et les accordéons masquent du contenu sans le supprimer, ou le suppriment sans prévenir : un test doit donc savoir s'il vérifie qu'un élément _existe_ ou qu'il est _visible_, et le moyen le plus fiable de savoir ce qui est ouvert est l'état ARIA (`aria-selected`, `aria-expanded`) plutôt que le style.

## Visible ou présent

- Les onglets produit gardent tous les panneaux dans le DOM et masquent les autres avec l'attribut `hidden` : le texte d'un panneau masqué reste trouvable, vérifiez donc la visibilité (`toBeVisible`) et pas seulement la présence.
- Les onglets du rapport n'affichent que le panneau sélectionné : les autres n'existent pas du tout, et ce qui a été saisi dans un panneau est perdu quand on change d'onglet puis qu'on revient. Dans les onglets produit, les notes saisies sont conservées.
- Les sections repliées des accordéons restent dans le DOM, masquées, comme pour les onglets produit.

## État ARIA et rôles

- Repérez les onglets et les panneaux par leur rôle (`tab`, `tabpanel`) et leur nom, et vérifiez l'onglet sélectionné avec `aria-selected="true"`. Chaque panneau est étiqueté par son onglet via `aria-labelledby`.
- Les en-têtes d'accordéon sont des boutons placés dans des titres, avec `aria-expanded` et `aria-controls` qui pointe vers une `region` étiquetée par son en-tête.
- L'onglet _Archives_ est désactivé avec `aria-disabled` plutôt qu'avec l'attribut natif `disabled` : il peut toujours recevoir un clic et le focus, mais ne fait rien. Certains outils considèrent `aria-disabled` comme désactivé et refusent de cliquer, d'autres cliquent sans problème.

## Clavier

- Seul l'onglet sélectionné est dans l'ordre de tabulation (`tabindex` itinérant). La touche <kbd>Tab</kbd> passe de la liste d'onglets au panneau, et non à l'onglet suivant.
- <kbd>ArrowLeft</kbd> et <kbd>ArrowRight</kbd> passent d'un onglet à l'autre en bouclant, <kbd>Home</kbd> et <kbd>End</kbd> vont au premier et au dernier, et l'onglet désactivé est ignoré. Déplacer le focus sélectionne aussi l'onglet.

## Délais et URL

- L'onglet _Avis_ met environ 1,5 seconde à se charger la première fois qu'il est sélectionné, et affiche d'ici là un message de chargement avec `aria-busy`. Attendez les avis eux-mêmes plutôt qu'un délai fixe.
- Les onglets sélectionnés sont conservés dans l'URL (`?product=reviews&report=monthly`), ce qui permet à un test d'ouvrir directement un onglet. Un onglet inconnu ou désactivé revient au premier.
- Les éléments natifs `<details>` n'ont pas d'`aria-expanded` : vérifiez plutôt l'attribut `open`. Leur contenu est masqué par le navigateur, pas par la page.
