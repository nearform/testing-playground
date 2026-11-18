Le bouton Télécharger le Fichier enregistre un petit fichier texte appelé `file.txt` qui contient `Sample content`. Le fichier est créé dans le navigateur et non récupéré sur un serveur : un test doit donc intercepter le téléchargement lui-même.

## Comment fonctionne le téléchargement

- Le bouton crée une URL `blob:` pour le fichier, clique sur un lien temporaire avec un attribut `download`, puis retire le lien et révoque l'URL aussitôt : il n'y a donc aucun lien à lire sur la page ni aucune adresse à redemander.
- Rien ne change sur la page après un téléchargement : seul le fichier est à vérifier.

## Vérifier le fichier

- Dans Playwright, attendez l'événement `download` pendant le clic, puis vérifiez son `suggestedFilename()` et le contenu du fichier enregistré.
- Dans Cypress, le fichier est enregistré dans le `downloadsFolder` (`cypress/downloads` par défaut) : lisez-le à cet endroit avec `cy.readFile()`.
- Dans Selenium et WebdriverIO, définissez le dossier de téléchargement du navigateur dans ses options et attendez que le fichier y apparaisse, car son écriture peut prendre un moment.
