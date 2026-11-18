Chaque bouton affiche son message deux fois : en popup au-dessus de la page et en alerte sous les boutons. Les deux disparaissent d'eux-mêmes au bout de 6 secondes.

## La popup et l'alerte

- La popup est placée dans une région de notifications (nommée _Notifications (F8)_) et a un test id formé de `notification-` et de son type, comme `notification-success`.
- L'alerte sous les boutons a un test id formé de `message-` et de son type, et son type en majuscules comme titre, comme _SUCCESS_.
- La popup peut être fermée plus tôt avec son bouton de fermeture, mais pas l'alerte : elle reste toujours les 6 secondes entières.

## Le minutage

- Les quatre boutons sont désactivés tant que l'alerte est affichée, donc une seule notification à la fois : attendez que l'alerte disparaisse avant de déclencher la suivante.
- Le minuteur de la popup se met en pause quand le pointeur la survole ou qu'elle a le focus : un test qui la survole ou clique dessus la garde ouverte plus de 6 secondes, alors que l'alerte disparaît toujours à l'heure.
- Plutôt que d'attendre 6 secondes, le contrôle de l'horloge de votre framework (comme `page.clock` dans Playwright ou `cy.clock()` dans Cypress) peut faire avancer le temps.
