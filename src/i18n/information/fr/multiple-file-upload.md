La première section est un champ de fichier natif qui accepte plusieurs fichiers à la fois. La seconde est une zone de dépôt, comme la plupart des composants d'envoi : le vrai champ est caché, les fichiers sont vérifiés à leur ajout et chacun est envoyé avec sa propre barre de progression.

## Le champ derrière la zone de dépôt

- Le `<input type="file">` de la zone de dépôt est masqué visuellement et hors de l'ordre de tabulation : les utilisateurs ne voient que la zone et son bouton _Parcourir les fichiers_. `setInputFiles()` de Playwright fonctionne sur les champs cachés, ciblez donc directement `#drop-zone-input`. `selectFile()` de Cypress vérifie que l'élément est utilisable, ce qu'un champ caché peut ne pas être : passez `{ force: true }`.
- Cliquer sur _Parcourir les fichiers_ ouvre la boîte de dialogue de fichiers du système, qu'aucun outil de test ne peut piloter. Avec Playwright, attendez l'événement `filechooser` et appelez `setFiles()` dessus ; ailleurs, ne cliquez pas et définissez directement les fichiers du champ.
- Pour tester le dépôt lui-même, simulez-le sur la zone. Avec Cypress, utilisez `selectFile(file, { action: 'drag-drop' })` sur la zone. Avec Playwright, créez un `DataTransfer` dans la page avec `page.evaluateHandle()` et passez-le à `dispatchEvent('drop', { dataTransfer })`. Selenium n'a pas de méthode intégrée : exécutez un script qui déclenche les événements.
- Le champ est vidé après chaque sélection, pour qu'un même fichier puisse être choisi de nouveau après l'avoir retiré. Vérifier les `files` du champ ne vous apprend donc rien : vérifiez plutôt la liste des fichiers.

## Choisir plusieurs fichiers

- Le premier champ a l'attribut `multiple`. Passez un tableau à `setInputFiles()` ou `selectFile()`. Avec Selenium, envoyez à `sendKeys()` les chemins absolus séparés par des retours à la ligne.
- Choisir de nouveau remplace la sélection au lieu de s'y ajouter, comme pour les champs natifs, alors que la zone de dépôt ajoute à sa liste à chaque fois.
- Les fichiers n'ont pas besoin d'exister sur le disque : Playwright accepte `{ name, mimeType, buffer }` et Cypress `{ contents, fileName, mimeType }`.

## Validation

- Seules les images PNG, JPEG, GIF et WebP de {{max}} au plus sont acceptées. L'attribut `accept` du champ ne filtre que la boîte de dialogue : les fichiers définis par un test ou déposés passent outre, la page vérifie donc chaque fichier elle-même et liste ceux qu'elle a refusés.
- Le type vient du type MIME du fichier, pas de son nom : un fichier nommé `photo.png` de type `text/plain` est refusé. Définissez vous-même le type MIME en créant des fichiers dans un test, sinon il est deviné à partir de l'extension.
- Un fichier ayant le même nom et la même taille qu'un fichier déjà dans la liste est refusé comme doublon. Quand une sélection mêle bons et mauvais fichiers, les bons sont ajoutés et seuls les autres apparaissent dans l'erreur.
- Tester la taille maximale demande un fichier de plus de {{max}} : créez-en un en mémoire, par exemple avec `Buffer.alloc(1024 * 1024 + 1)`.

## Progression, aperçus et suppression

- Chaque image commence à être envoyée dès son ajout, et les gros fichiers prennent plus de temps, jusqu'à environ 3 secondes. Attendez `data-status="uploaded"`, le texte _Envoyé_ ou que l'`aria-valuenow` de la barre de progression atteigne 100, plutôt qu'une durée fixe.
- _Valider_ est désactivé tant qu'une image est en cours d'envoi.
- Chaque fichier a son propre bouton de suppression, nommé d'après lui (_Retirer photo.png_), et la suppression fonctionne aussi pendant l'envoi. Trouvez la ligne d'un fichier par son nom et agissez à l'intérieur plutôt que par sa position, car retirer un fichier fait remonter les suivants.
- Les aperçus utilisent des URL `blob:` créées dans la page, leur `src` change donc à chaque exécution. Vérifiez le texte alternatif de l'aperçu, ou qu'il s'est chargé (`naturalWidth` supérieur à 0), plutôt que son `src`.
