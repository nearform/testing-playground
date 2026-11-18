A barra verde embaixo da tabela nomeia um dos quatro processos e mostra o valor de CPU dele, como _Chrome CPU: 23.4%_. A tarefa é encontrar a linha desse processo na tabela e verificar se a célula de CPU mostra o mesmo valor.

## O que muda a cada carregamento

- A ordem das linhas e todos os valores delas são aleatórios, e a barra verde escolhe um processo diferente a cada vez, então um teste não pode depender da posição de uma linha nem de um número fixo.
- Os test ids das linhas, como `dynamic-table-row-0`, seguem a ordem na tela, então dizem onde a linha está, não qual processo ela tem.
- Os nomes dos processos são traduzidos, então também mudam com o idioma.

## Encontrando o valor

- Leia o nome do processo na barra verde, encontre a linha cuja célula Nome corresponde a ele e depois leia a célula da coluna CPU dessa linha.
- As colunas estão sempre na mesma ordem, mas encontrar a coluna CPU pelo cabeçalho fica mais perto de como uma tabela real, que muda, precisaria ser lida.
- Os valores são texto com as unidades (`%`, `MB`, `Mbps` e `MB/s`), então compare-os como texto, ou tire a unidade antes de compará-los como números.
