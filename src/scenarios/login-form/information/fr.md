Connectez-vous avec le nom d'utilisateur **admin** et le mot de passe **Passw0rd!**. Toute autre combinaison affiche une erreur.

## Se connecter

- Les deux valeurs doivent correspondre exactement : elles sont sensibles à la casse et les espaces comptent.
- Appuyer sur Entrée dans le champ du mot de passe connecte aussi, comme le bouton Se connecter.
- Un échec affiche _Les informations que vous avez fournies ne sont pas valides_ et garde ce qui a été saisi ; une réussite remplace le formulaire par un message et un bouton Se déconnecter.

## Rester connecté

- La connexion enregistre `tp:username` et `tp:isLoggedIn` dans `localStorage` : la page est donc toujours connectée après un rechargement ou dans un nouvel onglet.
- Si vos tests partagent une session de navigateur (comme dans Selenium, ou dans Cypress avec l'isolation des tests désactivée), cet état passe d'un test au suivant : déconnectez-vous ou videz `localStorage` d'abord. Pour commencer un test déjà connecté, définissez `tp:username` et `tp:isLoggedIn` (à `true`) avant le chargement de la page.
- Se déconnecter supprime les deux clés et vide le formulaire.
