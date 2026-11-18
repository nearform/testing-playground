Chaque bouton ouvre l'une des boîtes de dialogue JavaScript intégrées au navigateur : une alerte, une confirmation ou une saisie. Elles sont dessinées par le navigateur et non par la page : elles ne sont pas dans le DOM et les sélecteurs ne les trouvent pas.

## Gérer une boîte de dialogue

- Mettez en place un gestionnaire avant de cliquer sur le bouton qui ouvre la boîte de dialogue, vérifiez son message, puis acceptez-la ou fermez-la ; tant qu'elle est ouverte, la page est inutilisable.
- Playwright ferme les boîtes de dialogue de lui-même, sauf si vous gérez son événement `dialog`. Cypress accepte de lui-même les alertes et les confirmations, permet de les vérifier avec les événements `window:alert` et `window:confirm`, et demande de remplacer `window.prompt` par un stub pour répondre à une saisie. Selenium passe à la boîte de dialogue avec `switchTo().alert()`.

## Chaque boîte de dialogue

- L'alerte n'a qu'un bouton OK.
- La confirmation demande _Voulez-vous continuer ?_, et OK et Annuler donnent des résultats différents.
- La saisie demande votre nom avec _Testeur_ déjà rempli. L'accepter, taper votre propre réponse d'abord, l'envoyer vide et annuler donnent chacun un résultat différent.

## Le résultat

- Une fois la boîte de dialogue fermée, le panneau Résultat (`data-testid="result"`) indique ce que vous avez fait, comme _Vous avez cliqué sur Annuler_ ou _Vous avez saisi : Testeur_.
