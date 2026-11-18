Escolher uma cor primária mostra um segundo grupo de cores secundárias, e as opções dele dependem da cor primária escolhida.

## Os dois grupos

- Vermelho oferece Roxo e Laranja, Azul oferece Roxo e Verde, e Amarelo oferece Laranja e Verde.
- Branco está desativado e não pode ser escolhido.
- Trocar a cor primária limpa a escolha secundária, mesmo quando o novo grupo oferece a mesma cor.
- O valor de cada botão de opção é o nome da cor em inglês, em minúsculas, como `purple`, em qualquer idioma, então ele pode ser verificado sem depender do rótulo traduzido.
- O test id de cada botão de opção tem o grupo e a posição dele, como `radio-button-group-2-1`, e o segundo grupo muda com a primeira escolha, então o mesmo test id é Roxo depois de Vermelho, mas Laranja depois de Amarelo: verifique também o rótulo.

## Não são botões de opção nativos

- Como as caixas do cenário Checkbox, estes são botões com `role="radio"` e `aria-checked` em vez de `<input type="radio">`, então clique neles em vez de usar o `check()` do Cypress, e leia o estado em `aria-checked`.
- Cada grupo é um `radiogroup`: o Tab entra nele uma vez só, e as setas então passam para o próximo botão e o escolhem, pulando o Branco, que está desativado.
