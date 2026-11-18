La page écoute les événements `online` et `offline` du navigateur et lit `navigator.onLine` : un test doit donc couper la connexion depuis le navigateur lui-même (dans Playwright avec `context.setOffline`, dans Cypress ou WebdriverIO via les conditions réseau du Chrome DevTools Protocol) plutôt qu'en arrêtant un serveur.

## Passer hors ligne

- Bloquer les requêtes par interception ne modifie pas `navigator.onLine` et ne déclenche pas l'événement `offline` : la bannière reste verte et la file d'attente n'attend pas. Seule une coupure au niveau du navigateur change les deux.
- `navigator.onLine` à `true` signifie seulement que le navigateur a une connexion réseau, pas que le site est joignable. Une requête peut donc échouer alors que la bannière indique « en ligne », et la page la signale comme une erreur réseau plutôt que comme hors ligne.
- Couper le réseau à la main dans les DevTools ou dans un test revient au même, mais les navigateurs autres que Chromium ne le permettent pas forcément : vérifiez ce que votre framework propose pour Firefox et WebKit.

## La file d'attente des messages

- Chaque message rejoint la file d'attente et part aussitôt si le navigateur est en ligne : en ligne, un message ne reste donc qu'un instant dans la file. Attendez qu'il apparaisse dans *Messages envoyés* plutôt que de vérifier la file juste après l'envoi.
- Hors ligne, les messages attendent dans la file, dans l'ordre, et sont envoyés lorsque l'événement `online` se déclenche. Les messages qui ont dû attendre sont signalés comme tels dans *Messages envoyés*.
- L'envoi utilise une vraie requête vers un fichier livré avec le site (le site est statique et ne peut pas recevoir le message lui-même) : c'est elle qui échoue quand le réseau est coupé. Interceptez `status.json` pour faire échouer l'envoi avec une erreur serveur.

## Requêtes échouées

- « Vérifier l'état du service » demande le même fichier. En cas d'échec, l'erreur indique si le navigateur était hors ligne, si la requête n'a reçu aucune réponse ou si le serveur a répondu par une erreur, et « Réessayer » relance la requête. Le numéro de la tentative est affiché pour qu'un test distingue une nouvelle tentative de la première.
- La réponse n'est jamais prise dans le cache du navigateur : une requête faite hors ligne échoue donc toujours.

## Événements de connexion

- Chaque événement `online` et `offline` est consigné avec son heure, après une entrée pour l'état dans lequel la page s'est chargée. Les heures sont au format 24 heures `HH:MM:SS` dans le fuseau horaire du navigateur, avec l'horodatage complet dans l'attribut `datetime`.
- C'est le navigateur qui décide quand déclencher ces événements : n'attendez pas une entrée pour chaque bascule de votre test, car passer à l'état où se trouve déjà le navigateur ne déclenche rien.
