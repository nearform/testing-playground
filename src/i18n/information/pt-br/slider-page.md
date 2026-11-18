Estes deslizadores não são elementos `<input type="range">`, então não dá para preencher um valor: cada alça é um elemento com `role="slider"` que se move arrastando ou pelo teclado. Os três vão de 1 a 100, de 1 em 1.

## Movendo uma alça

- O valor de uma alça está em `aria-valuenow`, e seus limites em `aria-valuemin` e `aria-valuemax`.
- Com a alça em foco, as setas a movem de 1 em 1, Shift com uma seta ou Page Up e Page Down a movem de 10 em 10, e Home e End vão para 1 e 100.
- Arrastar também funciona, mas onde a alça para depende da largura do deslizador, então arrastar um número fixo de pixels dá valores diferentes em telas diferentes: o teclado é mais confiável.

## Cada deslizador

- O deslizador básico mostra seu valor ao lado do rótulo; esse valor não tem test id próprio, então procure-o dentro de `basic-slider-container`.
- O deslizador de faixa tem duas alças, em 1 e 25 no início, que podem se encontrar no mesmo valor; seus valores ficam sempre em ordem, então a primeira alça guarda o menor.
- O último deslizador está ligado ao campo numérico ao lado (`data-testid="input-slider-text"`): digitar um número move a alça, e mover a alça muda o número. Um número fora de 1 a 100 é ajustado ao limite mais próximo, então digitar 150 define 100.
