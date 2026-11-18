Ajouter un élément ajoute un bouton Supprimer un élément numéroté, et cliquer sur l'un d'eux le retire. Les boutons sont enregistrés dans `sessionStorage` sous `tp:elements`, et le numéro du prochain bouton sous `tp:nextIndex` : ils sont toujours là après un rechargement.

## La numérotation

- Chaque nouveau bouton prend le numéro suivant et les numéros ne sont pas réutilisés : retirer le bouton 2 sur trois laisse le 1 et le 3, et le suivant ajouté est le 4.
- Une fois tous les boutons retirés, la numérotation repart de 1.
- Le test id de chaque bouton contient son numéro, comme `remove-element-3`.

## L'état de départ

- Ajouter `?initialElements=5` à l'URL (`#/add-remove?initialElements=5`) ouvre la page avec les boutons 1 à 5, ce qui évite de les ajouter un par un.
- Le paramètre n'est utilisé que si la page se charge sans bouton enregistré : un rechargement qui a déjà des boutons dans `sessionStorage` l'ignore.
- Effacer le stockage retire tous les boutons en supprimant uniquement ces deux clés : ce que d'autres scénarios ont enregistré dans `sessionStorage` est conservé. Chaque onglet a son propre `sessionStorage` : un nouvel onglet ou contexte de navigateur part toujours de zéro.
