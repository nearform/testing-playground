Certaines images et certains liens de cette page fonctionnent et d'autres non, pour vérifier que chaque image se charge et que chaque lien mène quelque part. Chaque image et chaque lien a un attribut `data-expected` valant `ok` ou `broken`, pour qu'un test puisse comparer ce qu'il trouve avec ce qu'il devrait trouver.

## Images cassées

- Une image cassée reste dans la page : elle garde son `src`, affiche son texte alternatif et est visible, donc vérifier que l'`<img>` existe ou est visible réussit. Vérifiez plutôt qu'elle a fini de charger et qu'elle a une taille : `img.complete && img.naturalWidth === 0` signifie qu'elle a échoué.
- L'image à l'URL invalide ne fait jamais de requête, donc elle n'apparaît pas comme une 404 dans le journal réseau. Seule l'image elle-même indique qu'elle a échoué.
- Écouter les réponses en échec ne capture que les requêtes faites après l'ajout de l'écouteur, donc ajoutez-le avant de charger la page.

## Chargement différé

- La dernière image a `loading="lazy"` et se trouve sous la ligne de flottaison, donc le navigateur ne la demande pas avant qu'elle soit proche de la zone visible.
- D'ici là, `complete` est faux et `naturalWidth` vaut 0, donc une vérification lancée tout de suite la signale comme cassée (ou, avec Vérifier les images, comme pas encore chargée). Faites-la défiler jusqu'à la zone visible et attendez son chargement avant de la vérifier.

## Vérifier les liens

- Cliquer sur chaque lien est lent et quitte la page, donc demandez plutôt chaque URL avec une requête d'API (`page.request.get()` dans Playwright, `cy.request()` dans Cypress) et vérifiez que le statut est inférieur à 400. Lisez la propriété `href` résolue plutôt que l'attribut, qui peut être relatif.
- Un fichier statique manquant, comme l'ancienne page de la galerie, renvoie une vraie 404.
- Ce playground utilise un routage par hash, donc un lien vers une page de l'application comme `#/cookies-and-storage` ne demande que la page d'accueil : le serveur renvoie 200 même pour une page qui n'existe pas. Ouvrez plutôt ces liens et vérifiez que la page affiche son contenu.
- Les sites externes peuvent bloquer les requêtes automatisées, les limiter ou être indisponibles, ce qui rend la vérification des liens externes instable. Beaucoup de suites les vérifient selon un planning plutôt qu'à chaque exécution.

## Liens d'ancre

- Comme le # de l'URL sert déjà au routage, les liens vers les sections de cette page sont gérés par script : un clic fait défiler jusqu'à la section sans changer l'URL.
- Pour vérifier une ancre, cherchez un élément dont l'`id` correspond à la partie après le #. Le lien vers la section des avis n'a pas de section correspondante, donc cliquer dessus ne fait rien.
