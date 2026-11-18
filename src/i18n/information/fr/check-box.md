Trois groupes de cases à cocher, chacun avec son piège. Aucune n'est un `<input type="checkbox">` natif : ce sont des boutons avec `role="checkbox"`, alors lisez leur état dans `aria-checked` (ou avec une requête par rôle) plutôt que dans une propriété `checked`, et cliquez dessus plutôt que d'utiliser `check()` de Cypress, qui ne fonctionne qu'avec des champs.

## Dans un formulaire

- La première case est cochée au départ et la deuxième est désactivée : cliquer dessus ne change rien.
- La case obligatoire affiche son message d'erreur et est marquée `aria-invalid="true"` tant qu'elle n'est pas cochée ; la cocher retire le message du DOM.

## Sous forme d'icônes

- Le cœur et le marque-page n'ont pas de texte visible : leurs noms, Favori et Marque-page, viennent de `aria-label`.
- Seule l'icône pleine montre leur état, alors vérifiez `aria-checked` plutôt que l'image.

## Parent et enfants

- Cocher le parent coche les deux enfants, et le décocher les décoche.
- Avec un seul enfant coché, le parent n'est ni coché ni décoché : il a `aria-checked="mixed"` et `data-state="indeterminate"`, et cliquer dessus coche alors les deux enfants.
- Les deux enfants s'appellent Fils et partagent `data-testid="child"` : distinguez-les par leur position.
