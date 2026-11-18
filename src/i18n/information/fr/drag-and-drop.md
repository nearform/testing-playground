Faites glisser la boîte rouge *Faites glisser moi!* sur la zone de dépôt grise autant de fois que vous voulez : chaque dépôt ajoute une boîte jaune numérotée à la zone et un au compteur Total des dépôts.

## Comment fonctionne le glisser

- La page utilise le glisser-déposer HTML5 natif du navigateur (`draggable` avec les événements `dragstart`, `dragover` et `drop` qui partagent un `dataTransfer`) plutôt que de suivre la souris.
- `dragTo()` de Playwright le pilote directement. Cypress n'a pas de commande de glisser, et les actions de souris de Selenium ne lancent pas un glisser natif dans tous les navigateurs : avec ces outils, vous devrez peut-être déclencher vous-même `dragstart`, `dragover` et `drop` avec un `DataTransfer` partagé, ou utiliser un plugin.
- Un dépôt ne compte que si le glisser a commencé sur la boîte rouge, qui place `smallBox` en `text/plain` dans le `dataTransfer`.

## Vérifier le résultat

- Total des dépôts (`data-testid="total-drops"`) compte chaque dépôt, et les boîtes déposées sont nommées Boîte 1, Boîte 2 et ainsi de suite.
- La boîte rouge ne bouge jamais : vérifiez le compteur et les nouvelles boîtes plutôt que la position de la boîte rouge.
