A lista começa com 10 itens e carrega mais 10 cada vez que você chega ao fim. Ela nunca acaba, então espere os novos itens aparecerem em vez do fim da lista.

## Carregando mais

- Mais itens carregam quando um marcador invisível abaixo do último item (`data-testid="scroll-sentinel"`) entra na tela, então role até o fim da página ou role até esse marcador.
- Uma mensagem de carregamento aparece por 0,8 segundo antes de cada lote de 10 ser adicionado, e o contador acima da lista (`data-testid="item-count"`), como _Exibindo 20 itens_, aumenta.
- Em uma janela muito alta, o marcador continua na tela depois que um lote carrega, então os lotes continuam carregando até ele sair da tela.

## Verificando os itens

- Os itens são numerados em ordem e cada um mostra seu lote, então o item 11 é o primeiro do lote 2; os test ids deles são `item-` e o número, como `item-11`.
- Cada item é um `article` com `aria-posinset` igual ao número dele, e a lista não informa o tamanho (`aria-setsize="-1"`), já que não tem fim.
