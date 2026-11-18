Choisissez n'importe quel fichier, cliquez sur Télécharger et attendez le message de réussite. Rien n'est envoyé nulle part : l'envoi est simulé et prend entre 1 et 10 secondes au hasard, quelle que soit la taille du fichier.

## Choisir un fichier

- Le vrai `<input type="file">` (`data-testid="select-file"`) est masqué, et le bouton Sélectionner un fichier est son libellé, qui ouvre le sélecteur de fichiers du système. Définissez plutôt le fichier sur le champ, avec `setInputFiles()` dans Playwright ou `selectFile()` dans Cypress (avec `{ force: true }`, car le champ est masqué).
- Tous les types et toutes les tailles de fichier sont acceptés, un à la fois, et le nom du fichier choisi s'affiche en dessous.
- Le bouton Télécharger n'apparaît qu'une fois un fichier choisi.

## Attendre l'envoi

- Pendant l'envoi, le bouton Télécharger est désactivé et une barre de progression sans valeur (indéterminée) s'affiche.
- Un envoi peut prendre jusqu'à 10 secondes, plus que les délais d'assertion par défaut de Cypress (4 secondes) et de Playwright (5 secondes) : donnez au message de réussite un délai plus long plutôt que d'ajouter une attente fixe.
- Choisir un autre fichier efface le message précédent.
