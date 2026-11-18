Un formulaire d'inscription qui vérifie chaque champ, pour que vous puissiez contrôler le message d'erreur de chaque type d'erreur. La validation propre au navigateur est désactivée (`novalidate`) : tous les messages viennent de la page.

## Quand les erreurs apparaissent

- Un champ est vérifié quand vous le quittez et à nouveau à l'envoi du formulaire ; une fois vérifié, son message se met à jour pendant la saisie.
- Un envoi avec des erreurs indique leur nombre en haut du formulaire, dans une alerte (`data-testid="form-error-summary"`).
- Un formulaire valide affiche un message de réussite avec votre nom, et Réinitialiser vide tous les champs et messages.

## Les règles

- Le nom complet est obligatoire, fait au moins 2 caractères et ne contient que des lettres, des espaces, des traits d'union et des apostrophes.
- L'e-mail est obligatoire et doit ressembler à `name@example.com`.
- Le téléphone et le site web sont facultatifs mais doivent être valides s'ils sont remplis : un numéro de téléphone a de 10 à 15 chiffres, peut commencer par + et contenir des espaces, et un site web doit commencer par `http://` ou `https://`.
- L'âge est obligatoire et doit être un nombre entier de 18 à 120.
- Le mot de passe doit avoir au moins 8 caractères avec une majuscule, une minuscule et un chiffre, et Confirmer le mot de passe doit lui correspondre.

## Trouver les messages

- Le test id de chaque champ est son nom, comme `email` ou `confirm-password`, et son erreur et son aide ajoutent `-error` et `-hint`, comme `email-error`.
