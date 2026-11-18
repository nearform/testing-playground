Tout ce qui se trouve dans une iframe appartient à un document distinct, donc les sélecteurs exécutés sur la page ne le trouvent pas : les tests doivent d'abord basculer dans le cadre, puis en ressortir pour vérifier quoi que ce soit sur la page.

## Chaque exemple

- Le formulaire envoie son message à la page, en dehors du cadre.
- Le compteur se trouve dans un cadre lui-même placé dans un autre cadre, il faut donc deux bascules pour l'atteindre.
- L'éditeur de texte enrichi fonctionne comme de nombreux éditeurs WYSIWYG classiques : le texte modifié est le corps d'un cadre, tandis que la barre d'outils, le nombre de mots et le HTML sont sur la page autour, ce qui oblige un test à passer de l'un à l'autre.
