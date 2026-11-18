## Trouver une fenêtre modale

- Contrairement aux boîtes de dialogue natives du navigateur (voir JS Alerts), ces modales sont des éléments du DOM ordinaires, mais chacune est rendue dans son propre élément à la *fin de `<body>`*, en dehors du balisage du scénario : cherchez-la depuis le document plutôt qu'à l'intérieur de la section qui l'a ouverte.
- Tant qu'une modale est ouverte, un fond plein écran recouvre la page et tout ce qui se trouve derrière est marqué `inert` et `aria-hidden="true"` : les clics sur la page sont interceptés par le fond et les éléments en arrière-plan sortent de l'arbre d'accessibilité, si bien que les requêtes par rôle ne les trouvent plus.

## Chaque fenêtre modale

- La modale simple se ferme avec son bouton de fermeture, la touche Échap ou un clic sur le fond, et indique lequel a été utilisé.
- La modale de confirmation protège une suppression : le bouton Annuler, le choix sûr, reçoit le focus, et Échap ou le fond annulent aussi.
- La modale avec formulaire garde le focus piégé à l'intérieur tant qu'elle est ouverte (Tab fait le tour) et rend le focus au bouton qui l'a ouverte à sa fermeture.
- Les modales empilées affichent une deuxième boîte de dialogue au-dessus de la première : Échap et le fond ne ferment que celle du dessus.

## La fenêtre de bienvenue

- Une modale de bienvenue s'ouvre *d'elle-même* lors de votre première visite et ne peut être fermée qu'avec son bouton ; ce choix est mémorisé dans `localStorage` sous `modal-dialogs-entry-dismissed`, les tests doivent donc soit la fermer, soit définir cette clé avant le chargement de la page.
