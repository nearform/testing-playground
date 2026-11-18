Le tableau contient 143 factures, affichées par 10, 25 ou 50. Le résumé, les dates et les montants sont rédigés et formatés différemment selon la langue.

## Chargement

- Chaque changement (une nouvelle page, taille de page, recherche ou filtre) se charge pendant une durée aléatoire de {{min}} à {{max}} ms, et pendant le chargement les anciennes lignes restent affichées : le tableau est marqué `aria-busy="true"`, un voile avec un indicateur de chargement le recouvre et la pagination, la taille de page et les cases à cocher sont désactivées.
- Vérifier les lignes juste après un clic peut lire l'ancienne page : attendez la fin du chargement ou que le résumé du nombre de lignes change.

## Recherche, filtres et pages

- La recherche ne se lance qu'après une pause de {{debounce}} ms dans la saisie, puis se charge à son tour ; elle porte sur le numéro de facture ou le client, sans tenir compte de la casse ni des accents (« cafe » trouve « Café Étoile »).
- Une nouvelle recherche, un nouveau filtre ou une nouvelle taille de page ramène à la page 1, et les deux bornes de la période sont incluses.
- La pagination affiche la première et la dernière page ainsi que celles qui entourent la page courante, avec … pour les autres : la page voulue n'a donc pas forcément encore de bouton ; la page courante est marquée `aria-current="page"`.
- Quand rien ne correspond, le tableau affiche un message avec un bouton pour effacer les filtres, et la pagination disparaît.

## Sélection des lignes

- Les lignes sélectionnées le restent quand vous changez de page ou de filtre, même si elles ne sont plus affichées, et le nombre de lignes sélectionnées les inclut.
- La case de l'en-tête ne sélectionne que les lignes de la page courante, et est partiellement cochée quand seules certaines le sont.
- Marquer des factures comme payées les modifie immédiatement : avec un filtre de statut, elles peuvent donc disparaître de la page.
