Cinco pequenas formas vermelhas, cada uma um círculo ou um quadrado, precisam ser soltas na forma grande correspondente: círculos no círculo e quadrados no quadrado. As formas que aparecem são aleatórias e mudam a cada carregamento.

## Soltando as formas

- Uma forma solta no alvo certo fica verde e soma um ao Total Correto; solta no alvo errado ela fica amarela e pode ser arrastada de novo para corrigir.
- Uma forma verde está concluída e não pode mais ser arrastada, então o Total Correto chega a 5 quando todas as formas estão verdes.
- As formas ficam no lugar e só mudam de cor, então verifique a cor ou o contador em vez de procurar uma forma dentro de um alvo.

## Encontrando as formas

- O test id de cada forma diz o que ela é e o número dela, como `draggable-circle-2` ou `draggable-square-4`, e os alvos são `drop-circle` e `drop-square`. Como a mistura é aleatória, encontre as formas pelo começo do test id em vez de uma lista fixa.
- As formas não têm texto, então a cor delas (vermelha, amarela ou verde) só aparece no estilo `background-color` inline.
- Como a versão fácil, esta usa o arrastar e soltar nativo do HTML5, com o número da forma como `shapeId` no `dataTransfer`.
