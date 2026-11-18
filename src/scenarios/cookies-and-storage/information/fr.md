Presque tous les sites réels affichent une bannière de consentement aux cookies lors de la première visite, et elle couvre la page tant qu'on n'y a pas répondu : c'est donc la première chose qui gêne un test de bout en bout. Ici, la bannière n'apparaît qu'une seconde après le chargement de la page, comme les bannières ajoutées par un script tiers, donc vérifier qu'elle est absente juste après le chargement réussit trop tôt.

## Où l'état est conservé

- Le choix est mémorisé dans le cookie `tp_cookie_consent` (`accepted`, `rejected` ou `custom`), et les choix d'analyse et de marketing sont conservés dans `localStorage` sous `tp:cookie_preferences`, si bien que les deux survivent à un rechargement.
- Le chemin du cookie est `/testing-playground` : pour le définir depuis un test, indiquez ce chemin en plus du domaine ; un cookie sur `/` n'est utilisé que s'il n'y en a aucun sur le chemin du playground.
- La note de session est conservée dans `sessionStorage` sous `tp:session_note`, qui appartient à un seul onglet : elle survit à un rechargement mais disparaît dans un nouvel onglet ou un nouveau contexte de navigateur.

## Garder les tests indépendants

- Les tests qui partagent un contexte de navigateur se transmettent cet état, donc commencez chaque test avec un contexte propre, ou utilisez Tout effacer.
- Cliquer sur la bannière dans chaque test est lent et fragile ; préparez plutôt l'état avant le chargement de la page, avec `context.addCookies`, `page.addInitScript` ou un `storageState` enregistré dans Playwright, ou avec `cy.setCookie` et `onBeforeLoad` dans Cypress, comme le montre le bas de la page.

## Inspecter et vider le stockage

- L'aperçu en direct ne relit le stockage que lorsque cette page le modifie : après avoir modifié le stockage depuis un test, appuyez sur Actualiser ou rechargez la page.
- Tout effacer ne supprime que ce que ce scénario enregistre ; les réglages de langue et de thème du site sont conservés.
