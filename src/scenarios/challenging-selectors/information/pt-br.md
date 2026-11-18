Esta página foi feita para que os seletores óbvios falhem. O painel Última ação no topo mostra o que o seu último clique realmente fez, para você conferir se acertou o elemento certo.

## IDs e ordem que mudam

- Os IDs e nomes de classe da primeira seção (e os nomes de classe no resto da página) são hashes aleatórios, como os de bibliotecas CSS-in-JS, e mudam toda vez que a página carrega; então encontre o campo pelo rótulo e os botões pela função e pelo nome.
- A tabela da equipe é embaralhada a cada carregamento e cada linha tem os mesmos botões Editar e Excluir, sem nome acessível próprio; escolha a linha pelo conteúdo (o nome ou o e-mail da pessoa) e depois o botão dentro dessa linha, porque a posição da linha ou a n-ésima correspondência vai acertar outra pessoa.

## Texto dividido

- A saudação e a contagem de mensagens não lidas estão divididas em vários elementos, então buscar pelo texto próprio de um elemento não encontra a frase inteira: busque pelo texto do elemento pai ou normalize o texto antes.
- O rótulo do botão de marcar como lidas é dividido do mesmo jeito, mas o nome acessível dele continua sendo a frase completa.

## Rótulos ausentes

- Os dois blocos de endereço têm campos cujos rótulos são texto simples, não ligados aos campos, e os dois blocos são idênticos exceto pelo título; então é preciso localizar um campo em relação ao texto próximo ou pela posição dentro do bloco certo.
- Os dois formulários de newsletter fazem a mesma coisa: o com rótulos tem um título, um rótulo, um botão de verdade e atributos data-testid, enquanto o sem rótulos só tem um texto de exemplo, uma div clicável com cara de botão e nomes de classe aleatórios; compare como cada estratégia de localização lida com os dois.

## Elementos duplicados

- O botão Finalizar compra aparece três vezes na página: uma versão para celular e outra para desktop, das quais só uma é exibida dependendo da largura da tela, e uma terceira dentro do painel Mais opções fechado; então o localizador precisa mirar no botão visível, e não no primeiro do DOM.
