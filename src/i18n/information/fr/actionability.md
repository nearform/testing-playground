Chaque élément de cette page est dans le DOM et semble cliquable, mais un vrai clic dessus le rate ou touche autre chose. C’est de là que viennent les erreurs comme « element click intercepted », « element is not stable », « element is outside of the viewport » et « element does not receive pointer events ». Le panneau Dernière action en haut indique ce que chaque clic a réellement touché.

## Éléments recouverts

- Dans la section Superpositions, le bouton Accepter les conditions est recouvert en permanence par un élément transparent, donc le clic est toujours intercepté : le test doit le signaler au lieu de réussir avec un clic forcé ou en JavaScript, qui cacherait un bug qu’un utilisateur rencontrerait.
- Le bouton Continuer est recouvert par une superposition de chargement transparente pendant quelques secondes après le chargement de la page, donc un test doit attendre qu’elle disparaisse, et non attendre une durée fixe.
- L’en-tête collant reste en haut de la fenêtre pendant que vous faites défiler la liste des produits, donc un outil qui fait défiler un bouton jusqu’en haut de la fenêtre avant de cliquer cliquera sur l’en-tête.

## Éléments qui bougent

- Dans Éléments en mouvement, un bouton ne s’arrête jamais, donc une vérification de stabilité n’aboutit jamais et un clic à son ancienne position le rate ; l’autre bouge pendant quelques secondes puis s’immobilise, donc attendre qu’il soit stable fonctionne, et le panneau Dernière action indique si vous l’avez cliqué pendant qu’il bougeait.
- Dans Décalage de mise en page, une bannière est insérée au-dessus de Confirmer la commande quelques secondes après le chargement, et son bouton Passer à premium arrive exactement là où se trouvait Confirmer la commande, donc un clic dont la position a été calculée trop tôt passe à premium au lieu de confirmer.

## Hors de vue ou impossibles à cliquer

- Le bouton J’accepte se trouve dans une boîte défilante et non dans la page, donc c’est la boîte qu’il faut faire défiler pour que le bouton soit visible.
- Un bouton a pointer-events: none, donc le pointeur le traverse, et un autre n’a ni largeur ni hauteur, donc il est dans le DOM avec du texte mais n’est pas visible. Les clics sur ces deux boutons ne fonctionnent qu’en JavaScript, ce qu’un utilisateur ne peut pas faire.
