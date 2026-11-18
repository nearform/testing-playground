Chaque problème d'accessibilité de cette page est volontaire. Activer **Afficher la version corrigée** (ou ouvrir `#/accessibility-violations?version=fixed`) les corrige tous, donc le même scan peut être lancé sur les deux versions. Chaque problème est listé plus bas, sous Problèmes attendus.

## Lancer le scan

- Les problèmes se trouvent tous dans la section Inscription à la newsletter, dont l'ID est `accessibility-violations-area`.
- Limitez le scan à cette section, pour que rien du reste du terrain de jeu ne s'y mêle : `.include('#accessibility-violations-area')` dans `@axe-core/playwright` ou `cy.checkA11y('#accessibility-violations-area')` dans `cypress-axe`.
- Chaque ligne de Problèmes attendus a un attribut `data-rule` avec l'ID de sa règle (ou `data-issue` pour les problèmes au clavier), et le tableau se vide dans la version corrigée.

## Ce qui rend l'automatisation délicate

- `duplicate-id-aria` est signalée dans `incomplete` et non dans `violations`, car axe-core considère que cette règle demande une vérification, donc un test qui ne regarde que `violations` ne la voit jamais.
- `heading-order` est une bonne pratique et non une règle WCAG, donc un scan limité avec `withTags(['wcag2a', 'wcag2aa'])` ne la voit pas.
- `color-contrast` et `scrollable-region-focusable` dépendent de la mise en page, donc elles ne sont trouvées que dans un vrai navigateur et jamais dans jsdom.
- Une même règle peut échouer sur plusieurs éléments et les nouvelles versions d'axe-core ajoutent des règles, donc vérifiez les ID de règles attendus plutôt que le nombre de violations.

## Ce qu'aucun scanner ne trouve

- La zone Message garde la touche Tab pour elle, comme certains éditeurs de code qui indentent, donc une fois qu'elle a le focus, ni Tab ni Maj+Tab n'en sortent : c'est un piège au clavier.
- Le bouton S'inscrire est un `div` avec un gestionnaire de clic, donc il ne peut pas être atteint avec Tab et ne fonctionne qu'à la souris.
- Un scan sans erreur ne prouve pas qu'une page est accessible : il montre seulement que les problèmes qu'un scanner sait trouver ont disparu.
