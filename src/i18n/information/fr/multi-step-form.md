Le formulaire est découpé en étapes : informations personnelles, informations sur l'entreprise (comptes professionnels uniquement), adresse, préférences (facultative) et récapitulatif. Chaque étape a sa propre URL, comme `?step=address`, et les réponses sont enregistrées dans `sessionStorage` au fur et à mesure.

## Les étapes et l'URL

- Suivant ajoute une entrée à l'historique : le bouton Précédent du navigateur revient donc d'une étape, comme le bouton Retour du formulaire.
- Une étape ne peut être affichée que lorsque toutes les étapes précédentes sont terminées. Ouvrir `?step=review` sur une page vierge affiche la première étape à la place, et l'URL est corrigée avec `history.replaceState`. Attendez que l'URL ou le titre de l'étape se stabilise plutôt que de vérifier juste après la navigation.
- Pour accéder directement à une étape plus loin, remplissez les étapes précédentes via l'interface, ou renseignez la clé `multi-step-form` de `sessionStorage` avant le chargement de la page, par exemple avec `page.addInitScript()` dans Playwright ou `onBeforeLoad` dans Cypress. Les données doivent être valides et les étapes précédentes listées dans `completed` (ou `skipped`, pour l'étape facultative).

## Validation et contenu conditionnel

- Suivant ne vérifie que les champs de l'étape en cours. Les erreurs apparaissent après un clic sur Suivant, puis se mettent à jour pendant la saisie, et le focus passe au premier champ en erreur.
- Retour ne valide rien : une étape terminée peut donc redevenir invalide. Avancer de nouveau, ou ouvrir l'URL d'une étape suivante, vous y ramène.
- Choisir *Professionnel* ajoute une étape sur l'entreprise : le nombre d'étapes passe de 4 à 5 et chaque étape suivante est décalée d'un rang. Repérez les étapes par leur nom ou par l'attribut `data-step`, pas par leur position.
- L'étape des préférences est facultative : Passer avance sans l'enregistrer comme terminée, et le récapitulatif l'indique comme passée. Le champ du numéro de téléphone n'existe que lorsque *Téléphone* est le moyen de contact choisi.
- Revenir à un compte personnel masque l'étape sur l'entreprise. Ses réponses sont conservées, mais ne sont plus affichées dans le récapitulatif.

## Récapitulatif, focus et réponses enregistrées

- Chaque section du récapitulatif a un lien dont le texte visible est simplement *Modifier*. Leurs noms accessibles indiquent l'étape qu'ils ouvrent, par exemple *Modifier Adresse* : recherchez-les par rôle et par nom. Après une modification, le bouton principal affiche *Enregistrer et revenir au récapitulatif* au lieu de Suivant.
- Quand l'étape change, le focus passe au titre de l'étape. Saisir du texte juste après avoir cliqué sur Suivant ne remplit aucun champ.
- Les réponses survivent à un rechargement, mais pas à un nouvel onglet ni à un nouveau contexte de navigateur, car `sessionStorage` appartient à un seul onglet. Recommencez, ou videz le stockage, pour que les tests ne voient pas les réponses des autres. L'envoi les efface aussi.
- Chaque étape fait un objet de page naturel, avec un composant partagé pour la liste de progression et les boutons Retour, Suivant et Passer, et les étapes se prêtent bien à des scénarios BDD comme *Étant donné que j'ai rempli mes informations personnelles*.
