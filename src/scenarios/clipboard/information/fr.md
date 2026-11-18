Lire et écrire dans le presse-papiers du système nécessite des autorisations qui ne font pas partie de la page, et chaque navigateur les gère différemment : accordez `clipboard-read` et `clipboard-write` dans votre framework de test (s'il les prend en charge) et vérifiez le résultat en relisant le presse-papiers plutôt qu'en vous fiant au libellé _Copié !_.

## Autorisations et navigateurs

- L'API Clipboard n'existe que dans un contexte sécurisé (HTTPS ou localhost) et doit être appelée lors d'un geste de l'utilisateur pendant que la page a le focus : un clic d'un test qui a déplacé le focus ailleurs peut donc quand même échouer.
- Dans Chromium, accordez `clipboard-read` et `clipboard-write` (dans Playwright avec `context.grantPermissions`), sinon la lecture est refusée avec une erreur d'autorisation. Firefox et WebKit ne prennent pas en charge ces autorisations de la même manière : Firefox affiche sa propre fenêtre _Coller_ pour `readText`, sur laquelle un test ne peut pas cliquer.
- Les navigateurs headless peuvent utiliser leur propre presse-papiers, non partagé avec le système d'exploitation, et des tests lancés en parallèle sur une même machine peuvent écraser le presse-papiers les uns des autres en mode headed.
- Si l'autorisation est refusée ou si l'API est absente, la page affiche une erreur qui l'explique, ce qui rend l'échec facile à repérer sur une capture d'écran.

## Copier

- Chaque bouton _Copier_ écrit sa valeur avec `navigator.clipboard.writeText` et affiche _Copié !_ pendant deux secondes. Vérifiez le contenu du presse-papiers, pas seulement le libellé.
- La clé d'API est masquée à l'écran mais la clé complète est copiée : le texte affiché n'est donc pas celui qui se retrouve dans le presse-papiers.

## Coller

- _Coller depuis le presse-papiers_ lit le presse-papiers avec `navigator.clipboard.readText` et affiche ce qu'il contient.
- Le champ de notes annule l'événement de collage et insère une version nettoyée, en texte brut : saisir le texte, définir la valeur ou simuler un collage donnent donc chacun un résultat différent. Un événement de collage synthétique a besoin d'un `clipboardData` contenant `text/plain`.
- Le champ _Confirmer le mot de passe_ refuse le texte collé : un test qui le remplit en collant échoue et doit saisir le mot de passe. Remplir le champ directement contourne complètement l'événement de collage.

## Copie bloquée

- Le second champ de référence annule les événements `copy` et `cut` : sélectionner son texte et utiliser le raccourci de copie laisse le presse-papiers inchangé. Comparez-le avec le champ voisin.
