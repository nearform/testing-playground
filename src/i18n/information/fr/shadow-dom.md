Quatre exemples cachés dans des shadow roots. Les sélecteurs ordinaires s'arrêtent à la limite d'une shadow root : chacun teste donc la façon dont votre outil y pénètre.

## Chaque exemple

- La shadow root ouverte contient un petit formulaire. Les locators de Playwright entrent d'eux-mêmes dans les shadow roots ouvertes, Cypress le fait avec `.shadow()` ou l'option `includeShadowDom`, et Selenium par la shadow root de l'hôte.
- L'exemple imbriqué a une shadow root dans une autre : il faut donc deux étapes, dans l'hôte extérieur puis dans l'intérieur.
- Le bouton inséré par slot s'affiche dans une shadow root mais appartient au light DOM : les sélecteurs ordinaires le trouvent depuis la page.
- La shadow root fermée est inaccessible par `host.shadowRoot`, qui vaut `null`, et les locators de Playwright ne la traversent pas non plus. Atteignez son bouton autrement, par exemple avec Tab au clavier ou en cliquant à l'endroit où il s'affiche à l'écran.

## Vérifier le résultat

- Chaque exemple affiche son résultat là où vous pouvez le vérifier : le message d'accueil, le compteur et le compteur du bouton inséré par slot sont à côté, et celui de la root fermée est à l'extérieur, dans le light DOM (`data-testid="closed-shadow-status"`).
