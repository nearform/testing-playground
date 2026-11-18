Tout sur cette page dépend de l'heure actuelle ou du temps qui passe, et les attentes sont volontairement longues : l'offre dure cinq minutes, et l'avertissement de session n'apparaît qu'après dix minutes sans aucune activité.

## Contrôler l'horloge

- Les attendre en temps réel rend un test lent et instable, alors prenez plutôt le contrôle de l'horloge, avec `page.clock` dans Playwright, `cy.clock()` et `cy.tick()` dans Cypress, ou `vi.useFakeTimers()` dans Vitest.
- Installez la fausse horloge avant le chargement de la page, car les minuteurs démarrés avant restent sur l'horloge réelle.
- La page relit l'horloge chaque seconde et calcule chaque état à partir de l'heure actuelle, donc avancer l'horloge d'un coup (par exemple avec `page.clock.fastForward()`, qui ne déclenche un minuteur échu qu'une seule fois) arrive directement au bon état.

## Ce qui dépend de l'horloge

- Le message d'accueil et la bannière des horaires d'ouverture dépendent de l'heure et du jour de la semaine, donc un test qui ne fixe pas l'heure réussit ou échoue selon le moment où il s'exécute : fixez une heure, comme un samedi ou un jour de semaine à 08:00, avant de charger la page. Ils utilisent aussi le fuseau horaire du navigateur.
- Les horodatages relatifs passent de « à l'instant » à « il y a 1 minute », puis aux heures et aux jours, et leur heure exacte est dans l'attribut `datetime`.

## Expiration de la session

- La déconnexion pour inactivité compte tout mouvement de souris, clic, touche ou défilement comme une activité, donc un test qui bouge la souris pendant l'attente la remet à zéro.
- L'avertissement couvre toute la page : tant qu'il est affiché, tout autre clic sur la page est intercepté jusqu'à ce qu'il soit fermé ; une fois l'avertissement affiché, seul Rester connecté conserve la session, et une fois déconnecté, seul Se reconnecter en démarre une nouvelle.

## Recherche et enregistrement

- La recherche ne s'exécute qu'une demi-seconde après la fin de la saisie, donc un test doit attendre les résultats, ou avancer l'horloge, plutôt que de les vérifier juste après la saisie ; le compteur de recherches indique combien de recherches ont réellement été lancées.
- Enregistrer est limité : après un enregistrement, les clics suivants sont ignorés pendant deux secondes, donc deux clics rapprochés n'enregistrent qu'une fois.
