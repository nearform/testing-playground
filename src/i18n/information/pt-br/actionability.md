Todos os elementos desta página estão no DOM e parecem clicáveis, mas um clique real neles erra ou atinge outra coisa. É daqui que vêm erros como "element click intercepted", "element is not stable", "element is outside of the viewport" e "element does not receive pointer events". O painel Última ação no topo mostra o que cada clique realmente atingiu.

## Elementos cobertos

- Na seção Sobreposições, o botão Aceitar os termos está sempre coberto por um elemento transparente, então o clique é sempre interceptado: o teste deve relatar isso em vez de passar com um clique forçado ou via JavaScript, o que esconderia um bug que um usuário encontraria.
- O botão Continuar fica coberto por uma sobreposição de carregamento transparente por alguns segundos depois que a página carrega, então um teste precisa esperar que ela desapareça, e não esperar um tempo fixo.
- O cabeçalho fixo fica no topo da janela enquanto você rola a lista de produtos, então uma ferramenta que rola um botão até o topo da janela antes de clicar vai clicar no cabeçalho.

## Elementos que se movem

- Em Elementos em movimento, um botão nunca para de se mover, então uma verificação de estabilidade nunca passa e um clique na posição antiga erra; o outro se move por alguns segundos e depois para, então esperar que ele fique estável funciona, e o painel Última ação informa se você clicou nele enquanto ainda se movia.
- Em Mudança de layout, um banner é inserido acima de Confirmar pedido alguns segundos depois que a página carrega, e o botão Assinar o premium dele fica exatamente onde estava Confirmar pedido, então um clique que calculou a posição cedo demais assina o premium em vez de confirmar.

## Fora de vista ou impossíveis de clicar

- O botão Eu aceito fica dentro de uma caixa com rolagem própria, e não na página, então é a caixa que precisa ser rolada para que o botão fique visível.
- Um botão tem pointer-events: none, então o ponteiro passa direto por ele, e outro não tem largura nem altura, então está no DOM com texto mas não é visível. Cliques nos dois só funcionam via JavaScript, o que um usuário não pode fazer.
