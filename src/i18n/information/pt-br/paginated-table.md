A tabela tem 143 faturas, exibidas de 10, 25 ou 50 em 50. O resumo, as datas e os valores são escritos e formatados de forma diferente em cada idioma.

## Carregamento

- Cada mudança (uma nova página, tamanho de página, busca ou filtro) carrega por um tempo aleatório de {{min}} a {{max}} ms, e durante o carregamento as linhas antigas continuam na tela: a tabela fica marcada com `aria-busy="true"`, uma camada com um indicador de carregamento a cobre e a paginação, o tamanho de página e as caixas de seleção ficam desativados.
- Verificar as linhas logo após um clique pode ler a página antiga, então espere o carregamento terminar ou o resumo da contagem de linhas mudar.

## Busca, filtros e páginas

- A busca só é feita depois de uma pausa de {{debounce}} ms na digitação, e então carrega de novo; ela procura no número da fatura ou no cliente, ignorando maiúsculas e acentos ("cafe" encontra "Café Étoile").
- Uma nova busca, filtro ou tamanho de página volta para a página 1, e as duas pontas do período são incluídas.
- A paginação mostra a primeira e a última página e as vizinhas da página atual, com … no lugar das outras, então a página que você quer pode ainda não ter um botão; a página atual é marcada com `aria-current="page"`.
- Quando nada corresponde, a tabela mostra uma mensagem com um botão para limpar os filtros, e a paginação é removida.

## Seleção de linhas

- As linhas selecionadas continuam selecionadas quando você muda de página ou de filtro, mesmo que não apareçam mais, e a contagem de selecionadas as inclui.
- A caixa do cabeçalho só seleciona as linhas da página atual, e fica parcialmente marcada quando só algumas estão.
- Marcar faturas como pagas as altera na hora, então com um filtro de status elas podem sumir da página.
