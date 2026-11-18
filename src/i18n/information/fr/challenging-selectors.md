Cette page est conçue pour que les sélecteurs évidents échouent. Le panneau Dernière action en haut indique ce que votre dernier clic a réellement fait, pour vérifier que vous avez touché l’élément voulu.

## ID et ordre qui changent

- Les ID et noms de classe de la première section (et les noms de classe ailleurs) sont des hachages aléatoires, comme ceux des bibliothèques CSS-in-JS, et changent à chaque chargement de la page : trouvez donc le champ par son libellé et les boutons par leur rôle et leur nom.
- Le tableau de l’équipe est mélangé à chaque chargement et chaque ligne a les mêmes boutons Modifier et Supprimer, sans nom accessible propre : choisissez la ligne par son contenu (le nom ou l’e-mail de la personne), puis le bouton dans cette ligne ; une position de ligne ou la n-ième correspondance tombera sur quelqu’un d’autre.

## Texte découpé

- Le message d’accueil et le nombre de messages non lus sont découpés en plusieurs éléments, donc une recherche sur le texte propre d’un élément ne trouvera pas la phrase entière : cherchez sur le texte du parent ou normalisez d’abord le texte.
- Le libellé du bouton de lecture est découpé de la même façon, mais son nom accessible reste la phrase complète.

## Étiquettes manquantes

- Les deux blocs d’adresse ont des champs dont les libellés sont du texte simple non lié aux champs, et les deux blocs sont identiques à part leur titre : il faut donc repérer un champ par rapport au texte voisin ou par sa position dans le bon bloc.
- Les deux formulaires de newsletter font la même chose : celui avec libellés a un titre, un libellé, un vrai bouton et des attributs data-testid, tandis que celui sans libellés n’a qu’un texte indicatif, une div cliquable qui ressemble à un bouton et des noms de classe aléatoires ; comparez comment chaque stratégie de localisation s’en sort.

## Éléments en double

- Le bouton Commander est présent trois fois dans la page : une version mobile et une version bureau, dont une seule est affichée selon la largeur de l’écran, et une troisième dans le panneau Plus d’options fermé ; un localisateur doit donc viser celui qui est visible et non le premier du DOM.
