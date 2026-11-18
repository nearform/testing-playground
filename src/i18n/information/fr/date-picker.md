## Naviguer dans le calendrier

- Chaque sélecteur ouvre son calendrier dans une fenêtre ajoutée à la fin du `<body>` de la page, et non à côté de son champ : cherchez-la dans tout le document plutôt que dans le conteneur du champ.
- On ne peut rien saisir dans les sélecteurs de rendez-vous et de voyage : pour atteindre une date d'un autre mois, utilisez les boutons mois précédent et suivant ou les listes des mois et des années, et vérifiez d'abord quel mois est affiché.
- Le sélecteur de voyage reste ouvert après le premier jour et se ferme après le dernier ; choisir un jour avant le premier recommence à partir de celui-ci.
- Dans le calendrier, les flèches déplacent d'un jour et d'une semaine, Page précédente et Page suivante d'un mois, Début et Fin au début et à la fin de la semaine, Entrée choisit le jour qui a le focus et Échap le ferme.

## Quels jours peuvent être choisis

- Les jours qu'on peut choisir dépendent de la date du jour, lue sur l'horloge du navigateur à l'ouverture de la page : un test qui choisit « lundi prochain » ou « le 15 de ce mois » obtient une autre date (ou une date désactivée) un autre jour, sauf si l'horloge est simulée.
- Les jours désactivés restent affichés et peuvent recevoir le focus, mais ils sont marqués `aria-disabled`, barrés, et cliquer dessus ne fait rien.
- Les rendez-vous et les voyages peuvent être réservés jusqu'à la fin de {{lastYear}}.

## Lire la date choisie

- Chaque jour est un bouton dont le texte n'est que le numéro du jour, dont le nom accessible est la date complète dans la langue actuelle (par ex. « vendredi 20 novembre 2026 ») et qui porte un attribut `data-date` au format ISO.
- Sous chaque sélecteur, la valeur choisie est affichée au format ISO (AAAA-MM-JJ), identique dans toutes les langues : vérifiez-la plutôt que le texte affiché.

## Différences entre les langues

- Le champ de la date de naissance suit le format de la langue actuelle (MM/DD/YYYY en anglais, JJ/MM/AAAA en français et en portugais) : 03/04/2000 est le 4 mars en anglais mais le 3 avril en français, et le texte n'est vérifié qu'à l'appui sur Entrée ou quand le champ perd le focus ; les dates futures ou antérieures à {{minYear}} sont refusées.
- La semaine commence le dimanche en anglais et en portugais et le lundi en français, donc une même date se trouve dans une autre colonne.
