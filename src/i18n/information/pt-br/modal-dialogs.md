## Encontrando um modal

- Ao contrário dos diálogos nativos do navegador (veja JS Alerts), estes modais são elementos comuns do DOM, mas cada um é renderizado em seu próprio elemento no *final do `<body>`*, fora da marcação do cenário: procure-o a partir do documento, e não dentro da seção que o abriu.
- Enquanto um modal está aberto, um fundo em tela cheia cobre a página e tudo atrás dele é marcado com `inert` e `aria-hidden="true"`: os cliques na página são interceptados pelo fundo e os elementos ao fundo saem da árvore de acessibilidade, então consultas por papel (role) não os encontram mais.

## Cada modal

- O modal básico fecha com o botão de fechar, a tecla Escape ou um clique no fundo, e informa qual foi usado.
- O modal de confirmação protege uma exclusão: o botão Cancelar, a opção segura, recebe o foco, e Escape ou o fundo também cancelam.
- O modal com formulário mantém o foco preso dentro dele enquanto está aberto (o Tab dá a volta) e devolve o foco ao botão que o abriu quando fecha.
- Os modais empilhados mostram um segundo diálogo sobre o primeiro: Escape e o fundo fecham apenas o de cima.

## O modal de boas-vindas

- Um modal de boas-vindas abre *sozinho* na sua primeira visita e só pode ser fechado pelo seu botão; essa escolha é lembrada no `localStorage` na chave `modal-dialogs-entry-dismissed`, então os testes precisam fechá-lo ou definir essa chave antes de a página carregar.
